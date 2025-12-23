/**
 * Abtin Authentication - Verify Session Endpoint
 * GET /api/abtin/auth/verify
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken, getUserById } from '@/lib/auth/abtin-enhanced-auth'

export async function GET(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('abtin_session')?.value
    
    if (!sessionToken) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    const session = await verifySessionToken(sessionToken)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Invalid or expired session' },
        { status: 401 }
      )
    }
    
    // Get user details
    const user = await getUserById(session.userId)
    
    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'User not found or inactive' },
        { status: 401 }
      )
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        fullName: user.fullName,
      },
      session: {
        expiresAt: session.expiresAt,
      },
    })
  } catch (error) {
    console.error('Verify error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
