/**
 * Enhanced Authentication for Abtin Personal Dashboard
 * Implements secure session management, rate limiting, and database-backed authentication
 */

import { db } from '@/lib/db'
import { abtinUsers, abtinAuthLogs, type AbtinUser } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.ABTIN_JWT_SECRET || 'default-secret-change-in-production'
)
const SESSION_DURATION = 24 * 60 * 60 * 1000 // 24 hours

export interface AuthSession {
  userId: string
  username: string
  expiresAt: number
}

export interface AuthResult {
  success: boolean
  user?: AbtinUser
  session?: string
  error?: string
}

/**
 * Hash password using Web Crypto API
 */
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Verify password against hash
 */
async function verifyPassword(password: string, hash: string): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  return passwordHash === hash
}

/**
 * Create JWT session token
 */
async function createSessionToken(userId: string, username: string): Promise<string> {
  const expiresAt = Date.now() + SESSION_DURATION
  
  const token = await new SignJWT({ userId, username, expiresAt })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('24h')
    .setIssuedAt()
    .sign(JWT_SECRET)
  
  return token
}

/**
 * Verify and decode JWT session token
 */
export async function verifySessionToken(token: string): Promise<AuthSession | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    
    if (!payload.userId || !payload.username || !payload.expiresAt) {
      return null
    }
    
    // Check if token is expired
    if (Date.now() > (payload.expiresAt as number)) {
      return null
    }
    
    return {
      userId: payload.userId as string,
      username: payload.username as string,
      expiresAt: payload.expiresAt as number,
    }
  } catch {
    return null
  }
}

/**
 * Log authentication attempt
 */
async function logAuthAttempt(
  username: string,
  ipAddress: string,
  userAgent: string | null,
  success: boolean,
  failureReason?: string
) {
  try {
    await db.insert(abtinAuthLogs).values({
      username,
      ipAddress,
      userAgent,
      success,
      failureReason,
    })
  } catch (error) {
    console.error('Failed to log auth attempt:', error)
  }
}

/**
 * Check rate limiting for authentication attempts
 * Returns true if rate limit is exceeded
 */
async function checkRateLimit(ipAddress: string, username: string): Promise<boolean> {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  
  try {
    const recentAttempts = await db
      .select()
      .from(abtinAuthLogs)
      .where(eq(abtinAuthLogs.ipAddress, ipAddress))
      .limit(10)
    
    // Count failed attempts in last 5 minutes
    const recentFailures = recentAttempts.filter(
      log => !log.success && new Date(log.createdAt) > fiveMinutesAgo
    )
    
    // Block if more than 5 failed attempts in 5 minutes
    return recentFailures.length >= 5
  } catch {
    // If we can't check rate limit, allow the attempt
    return false
  }
}

/**
 * Authenticate user with username and password
 */
export async function authenticateUser(
  username: string,
  password: string,
  ipAddress: string,
  userAgent: string | null
): Promise<AuthResult> {
  // Check rate limiting
  const rateLimited = await checkRateLimit(ipAddress, username)
  if (rateLimited) {
    await logAuthAttempt(username, ipAddress, userAgent, false, 'Rate limit exceeded')
    return {
      success: false,
      error: 'Too many failed attempts. Please try again later.',
    }
  }
  
  try {
    // Find user by username
    const users = await db
      .select()
      .from(abtinUsers)
      .where(eq(abtinUsers.username, username))
      .limit(1)
    
    if (users.length === 0) {
      await logAuthAttempt(username, ipAddress, userAgent, false, 'User not found')
      return {
        success: false,
        error: 'Invalid username or password',
      }
    }
    
    const user = users[0]
    
    // Check if user is active
    if (!user.isActive) {
      await logAuthAttempt(username, ipAddress, userAgent, false, 'User inactive')
      return {
        success: false,
        error: 'Account is disabled',
      }
    }
    
    // Verify password
    const passwordValid = await verifyPassword(password, user.passwordHash)
    if (!passwordValid) {
      await logAuthAttempt(username, ipAddress, userAgent, false, 'Invalid password')
      return {
        success: false,
        error: 'Invalid username or password',
      }
    }
    
    // Update last login
    await db
      .update(abtinUsers)
      .set({ lastLoginAt: new Date() })
      .where(eq(abtinUsers.id, user.id))
    
    // Log successful authentication
    await logAuthAttempt(username, ipAddress, userAgent, true)
    
    // Create session token
    const sessionToken = await createSessionToken(user.id, user.username)
    
    return {
      success: true,
      user,
      session: sessionToken,
    }
  } catch (error) {
    console.error('Authentication error:', error)
    return {
      success: false,
      error: 'Authentication failed. Please try again.',
    }
  }
}

/**
 * Create a new Abtin user (admin function)
 */
export async function createAbtinUser(
  username: string,
  password: string,
  email?: string,
  fullName?: string
): Promise<{ success: boolean; userId?: string; error?: string }> {
  try {
    // Check if username already exists
    const existing = await db
      .select()
      .from(abtinUsers)
      .where(eq(abtinUsers.username, username))
      .limit(1)
    
    if (existing.length > 0) {
      return {
        success: false,
        error: 'Username already exists',
      }
    }
    
    // Hash password
    const passwordHash = await hashPassword(password)
    
    // Create user
    const result = await db
      .insert(abtinUsers)
      .values({
        username,
        passwordHash,
        email,
        fullName,
        isActive: true,
      })
      .returning({ id: abtinUsers.id })
    
    return {
      success: true,
      userId: result[0].id,
    }
  } catch (error) {
    console.error('Failed to create user:', error)
    return {
      success: false,
      error: 'Failed to create user',
    }
  }
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<AbtinUser | null> {
  try {
    const users = await db
      .select()
      .from(abtinUsers)
      .where(eq(abtinUsers.id, userId))
      .limit(1)
    
    return users.length > 0 ? users[0] : null
  } catch {
    return null
  }
}

/**
 * Parse authorization header and extract token
 */
export function parseAuthHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.slice(7)
}
