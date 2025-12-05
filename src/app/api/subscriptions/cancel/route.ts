/**
 * Cancel Subscription API
 * POST /api/subscriptions/cancel
 * 
 * Cancels the user's active subscription
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { cancelSubscription, getActiveSubscription } from '@/lib/subscriptions'

export async function POST(request: NextRequest) {
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
    
    // Check for existing subscription
    const existingSub = await getActiveSubscription(user.id)
    if (!existingSub) {
      return NextResponse.json(
        { success: false, error: 'No active subscription found' },
        { status: 400 }
      )
    }
    
    // Cancel the subscription
    const cancelled = await cancelSubscription(user.id)
    
    return NextResponse.json({
      success: true,
      data: {
        subscription: cancelled,
        message: 'Subscription cancelled successfully. You will retain access until the end of your current billing period.',
      }
    })
    
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}
