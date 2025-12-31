/**
 * Abtin Authentication - Login Endpoint
 * POST /api/abtin/auth/login
 */

import { NextRequest, NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/auth/abtin-enhanced-auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, password } = body
    
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      )
    }
    
    // Get client IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') || 
                     'unknown'
    const userAgent = request.headers.get('user-agent')
    
    // Authenticate user
    const result = await authenticateUser(username, password, ipAddress, userAgent)
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      )
    }
    
    // Create response with session token in HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: {
        id: result.user!.id,
        username: result.user!.username,
        email: result.user!.email,
        fullName: result.user!.fullName,
      },
    })
    
    // Set HTTP-only cookie with session token
    response.cookies.set('abtin_session', result.session!, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/abtin',
    })
    
    return response
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
