import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'
const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET || 'your-super-secret-admin-key-change-in-production')
const COOKIE_NAME = 'admin_session'

export interface AdminSession {
  username: string
  loggedInAt: number
}

// Validate admin credentials
export function validateCredentials(username: string, password: string): boolean {
  return username === ADMIN_USERNAME && password === ADMIN_PASSWORD
}

// Create JWT token for admin session
export async function createAdminSession(username: string): Promise<string> {
  const token = await new SignJWT({ 
    username,
    loggedInAt: Date.now() 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET)

  return token
}

// Verify admin session from JWT
export async function verifyAdminSession(token: string): Promise<AdminSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return {
      username: payload.username as string,
      loggedInAt: payload.loggedInAt as number
    }
  } catch {
    return null
  }
}

// Get admin session from cookies
export async function getAdminSession(): Promise<AdminSession | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(COOKIE_NAME)?.value

  if (!token) return null
  
  return verifyAdminSession(token)
}

// Check if admin is authenticated
export async function isAdminAuthenticated(): Promise<boolean> {
  const session = await getAdminSession()
  return session !== null
}

// Set admin session cookie
export async function setAdminCookie(token: string): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24, // 24 hours
    path: '/'
  })
}

// Clear admin session cookie
export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export { COOKIE_NAME }
