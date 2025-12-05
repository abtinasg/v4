/**
 * Get User Subscription API
 * GET /api/subscriptions/current
 * 
 * Returns the user's current subscription status
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getActiveSubscription, SUBSCRIPTION_PLANS, checkTrialEligibility } from '@/lib/subscriptions'

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
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
    
    // Get active subscription
    const subscription = await getActiveSubscription(user.id)
    
    // Check trial eligibility
    const isEligibleForTrial = await checkTrialEligibility(user.id)
    
    if (!subscription) {
      return NextResponse.json({
        success: true,
        data: {
          hasSubscription: false,
          subscription: null,
          plan: SUBSCRIPTION_PLANS.free,
          isEligibleForTrial,
        }
      })
    }
    
    const plan = SUBSCRIPTION_PLANS[subscription.planId]
    const daysRemaining = Math.ceil(
      (new Date(subscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    )
    
    return NextResponse.json({
      success: true,
      data: {
        hasSubscription: true,
        subscription: {
          ...subscription,
          daysRemaining,
          isTrial: subscription.status === 'trial',
          trialDaysRemaining: subscription.status === 'trial' && subscription.trialEndsAt
            ? Math.ceil((new Date(subscription.trialEndsAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : 0,
        },
        plan,
        isEligibleForTrial: false,
      }
    })
    
  } catch (error) {
    console.error('Get subscription error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get subscription' },
      { status: 500 }
    )
  }
}
