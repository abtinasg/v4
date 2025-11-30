/**
 * Credits API - Get Balance and Stats
 * GET /api/credits
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { 
  getUserCredits, 
  getCreditStats,
  CREDIT_COSTS,
  RATE_LIMITS,
} from '@/lib/credits'

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Find internal user
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
    })
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }
    
    // Get credit information
    let credits = await getUserCredits(user.id)
    
    // If user has no credits, initialize them
    if (!credits) {
      const { initializeUserCredits } = await import('@/lib/credits')
      credits = await initializeUserCredits(user.id)
    }
    
    const stats = await getCreditStats(user.id)
    
    // User limits based on plan
    const tier = user.subscriptionTier as keyof typeof RATE_LIMITS
    const rateLimits = RATE_LIMITS[tier] || RATE_LIMITS.free
    
    return NextResponse.json({
      success: true,
      data: {
        balance: parseFloat(credits?.balance || '0'),
        lifetimeCredits: parseFloat(credits?.lifetimeCredits || '0'),
        freeCreditsUsed: parseFloat(credits?.freeCreditsUsed || '0'),
        lastReset: credits?.lastFreeCreditsReset,
        stats: {
          todayUsage: stats.todayUsage,
          monthUsage: stats.monthUsage,
        },
        tier: user.subscriptionTier,
        limits: rateLimits,
        creditCosts: CREDIT_COSTS,
      },
    })
  } catch (error) {
    console.error('Error fetching credits:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
