/**
 * Create Subscription API
 * POST /api/subscriptions/create
 * 
 * Creates a new subscription or starts a free trial
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users, userSubscriptions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { 
  checkTrialEligibility, 
  startFreeTrial, 
  getActiveSubscription,
  SUBSCRIPTION_PLANS,
  type PlanId 
} from '@/lib/subscriptions'

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { planId, startTrial } = body as { planId: PlanId; startTrial?: boolean }
    
    if (!planId || !SUBSCRIPTION_PLANS[planId]) {
      return NextResponse.json(
        { success: false, error: 'Invalid plan ID' },
        { status: 400 }
      )
    }
    
    // Find internal user
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
    })
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Check for existing active subscription
    const existingSub = await getActiveSubscription(user.id)
    if (existingSub) {
      return NextResponse.json(
        { success: false, error: 'User already has an active subscription' },
        { status: 400 }
      )
    }
    
    // Handle free trial
    if (startTrial) {
      const plan = SUBSCRIPTION_PLANS[planId]
      
      if (plan.trialDays === 0) {
        return NextResponse.json(
          { success: false, error: 'This plan does not support free trial' },
          { status: 400 }
        )
      }
      
      const isEligible = await checkTrialEligibility(user.id)
      if (!isEligible) {
        return NextResponse.json(
          { success: false, error: 'User is not eligible for a free trial' },
          { status: 400 }
        )
      }
      
      const subscription = await startFreeTrial(user.id, planId)
      
      return NextResponse.json({
        success: true,
        data: {
          subscription,
          message: `Started ${plan.trialDays}-day free trial for ${plan.name} plan`,
        }
      })
    }
    
    // For non-trial subscriptions, redirect to payment
    return NextResponse.json({
      success: true,
      data: {
        requiresPayment: true,
        planId,
        price: SUBSCRIPTION_PLANS[planId].price,
        message: 'Please complete payment to activate subscription'
      }
    })
    
  } catch (error) {
    console.error('Create subscription error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create subscription' },
      { status: 500 }
    )
  }
}
