import { NextRequest, NextResponse } from 'next/server'
import { 
  validateCredentials, 
  createAdminSession, 
  clearAdminCookie,
  getAdminSession,
  COOKIE_NAME
} from '@/lib/admin/auth'

// POST - Login
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

    if (!validateCredentials(username, password)) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    const token = await createAdminSession(username)
    
    // Create response and set cookie on it
    const response = NextResponse.json({
      success: true,
      message: 'Logged in successfully'
    })
    
    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24, // 24 hours
      path: '/'
    })

    return response
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

// GET - Check session status
export async function GET() {
  try {
    const session = await getAdminSession()
    
    if (!session) {
      return NextResponse.json(
        { authenticated: false },
        { status: 401 }
      )
    }

    return NextResponse.json({
      authenticated: true,
      username: session.username,
      loggedInAt: session.loggedInAt
    })
  } catch (error) {
    console.error('Admin session check error:', error)
    return NextResponse.json(
      { authenticated: false },
      { status: 500 }
    )
  }
}

// DELETE - Logout
export async function DELETE() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })
    
    response.cookies.delete(COOKIE_NAME)
    
    return response
  } catch (error) {
    console.error('Admin logout error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}
