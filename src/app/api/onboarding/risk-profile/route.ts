import { NextRequest, NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users, riskProfiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { riskProfileQueries, userQueries } from '@/lib/db/queries'

export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { riskTolerance, investmentHorizon, investmentExperience, riskScore, answers } = body

    // Validate required fields
    if (!riskTolerance || !investmentHorizon || !investmentExperience || riskScore === undefined || !answers) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get or create user in our database
    let user = await userQueries.getByClerkId(clerkId)
    
    if (!user) {
      // Get user info from Clerk
      const clerkUser = await currentUser()
      if (!clerkUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }

      // Create user in our database
      const newUser = await userQueries.create({
        clerkId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
      })
      user = { ...newUser, preferences: null }
    }

    // Create or update risk profile
    const riskProfile = await riskProfileQueries.upsert(user!.id, {
      riskTolerance,
      investmentHorizon,
      investmentExperience,
      riskScore: riskScore.toString(),
      answers,
      onboardingCompleted: true,
    })

    // Create response with cookie
    const response = NextResponse.json({
      success: true,
      riskProfile: {
        id: riskProfile.id,
        riskTolerance: riskProfile.riskTolerance,
        investmentHorizon: riskProfile.investmentHorizon,
        investmentExperience: riskProfile.investmentExperience,
        riskScore: riskProfile.riskScore,
        onboardingCompleted: riskProfile.onboardingCompleted,
      },
    })

    // Set cookie to mark onboarding as complete
    response.cookies.set('onboarding_completed', clerkId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })

    return response
  } catch (error) {
    console.error('Error saving risk profile:', error)
    return NextResponse.json(
      { error: 'Failed to save risk profile' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user from our database
    const user = await userQueries.getByClerkId(clerkId)
    
    if (!user) {
      return NextResponse.json({
        hasProfile: false,
        riskProfile: null,
      })
    }

    // Get risk profile
    const riskProfile = await riskProfileQueries.getByUserId(user.id)

    if (!riskProfile) {
      return NextResponse.json({
        hasProfile: false,
        riskProfile: null,
      })
    }

    return NextResponse.json({
      hasProfile: true,
      riskProfile: {
        id: riskProfile.id,
        riskTolerance: riskProfile.riskTolerance,
        investmentHorizon: riskProfile.investmentHorizon,
        investmentExperience: riskProfile.investmentExperience,
        riskScore: riskProfile.riskScore,
        preferredSectors: riskProfile.preferredSectors,
        avoidSectors: riskProfile.avoidSectors,
        onboardingCompleted: riskProfile.onboardingCompleted,
        createdAt: riskProfile.createdAt,
        updatedAt: riskProfile.updatedAt,
      },
    })
  } catch (error) {
    console.error('Error fetching risk profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch risk profile' },
      { status: 500 }
    )
  }
}
