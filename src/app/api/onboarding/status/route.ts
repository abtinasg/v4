import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { userQueries, riskProfileQueries } from '@/lib/db/queries'

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json({ 
        needsOnboarding: false,
        error: 'Unauthorized' 
      }, { status: 401 })
    }

    // Get user from our database
    const user = await userQueries.getByClerkId(clerkId)
    
    if (!user) {
      // New user - needs onboarding
      return NextResponse.json({
        needsOnboarding: true,
        reason: 'new_user',
      })
    }

    // Check if user has completed onboarding
    const hasOnboarding = await riskProfileQueries.hasCompletedOnboarding(user.id)

    return NextResponse.json({
      needsOnboarding: !hasOnboarding,
      reason: hasOnboarding ? null : 'no_risk_profile',
    })
  } catch (error) {
    console.error('Error checking onboarding status:', error)
    return NextResponse.json(
      { needsOnboarding: false, error: 'Failed to check status' },
      { status: 500 }
    )
  }
}
