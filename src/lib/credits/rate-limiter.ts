/**
 * Rate Limiter
 * Request rate limiting system - credit-based, same limits for all users
 */

import { db } from '@/lib/db'
import { rateLimitTracking, users } from '@/lib/db/schema'
import { eq, and, gte, lte, sql } from 'drizzle-orm'
import { 
  RATE_LIMITS, 
  RATE_LIMIT_WINDOWS, 
  RATE_LIMIT_EXEMPT_ENDPOINTS,
} from './config'

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  limit: number
  resetAt: Date
  retryAfter?: number // seconds until allowed
}

export interface RateLimitInfo {
  minute: RateLimitResult
  hour: RateLimitResult
  day: RateLimitResult
}

/**
 * Check rate limit for a user
 * Credit-based system: same limits for all users
 */
export async function checkRateLimit(
  identifier: { userId?: string; ipAddress?: string },
  endpoint: string
): Promise<RateLimitResult> {
  // Check if endpoint is exempt from rate limiting
  if (RATE_LIMIT_EXEMPT_ENDPOINTS.some(e => endpoint.startsWith(e))) {
    return {
      allowed: true,
      remaining: -1,
      limit: -1,
      resetAt: new Date(),
    }
  }
  
  // Same limits for all users in credit-based system
  const limits = RATE_LIMITS
  const now = new Date()
  
  // Check per-minute limit (strictest)
  const minuteResult = await checkWindow(
    identifier,
    endpoint,
    'minute',
    limits.requestsPerMinute
  )
  
  if (!minuteResult.allowed) {
    return minuteResult
  }
  
  // Check per-hour limit
  const hourResult = await checkWindow(
    identifier,
    endpoint,
    'hour',
    limits.requestsPerHour
  )
  
  if (!hourResult.allowed) {
    return hourResult
  }
  
  // Check per-day limit
  const dayResult = await checkWindow(
    identifier,
    endpoint,
    'day',
    limits.requestsPerDay
  )
  
  if (!dayResult.allowed) {
    return dayResult
  }
  
  // Record the new request
  await recordRequest(identifier, endpoint)
  
  return {
    allowed: true,
    remaining: Math.min(
      minuteResult.remaining - 1,
      hourResult.remaining - 1,
      dayResult.remaining - 1
    ),
    limit: limits.requestsPerMinute,
    resetAt: minuteResult.resetAt,
  }
}

/**
 * Check limit within a time window
 */
async function checkWindow(
  identifier: { userId?: string; ipAddress?: string },
  endpoint: string,
  windowType: 'minute' | 'hour' | 'day',
  limit: number
): Promise<RateLimitResult> {
  const { userId, ipAddress } = identifier
  const now = new Date()
  const windowMs = RATE_LIMIT_WINDOWS[windowType]
  const windowStart = new Date(now.getTime() - windowMs)
  const resetAt = new Date(now.getTime() + windowMs)
  
  // Count requests in this window
  const conditions = [
    gte(rateLimitTracking.windowStart, windowStart),
    lte(rateLimitTracking.windowStart, now),
  ]
  
  if (userId) {
    conditions.push(eq(rateLimitTracking.userId, userId))
  } else if (ipAddress) {
    conditions.push(eq(rateLimitTracking.ipAddress, ipAddress))
  }
  
  const result = await db.select({
    count: sql<number>`COALESCE(SUM(${rateLimitTracking.requestCount}::numeric), 0)`,
  })
    .from(rateLimitTracking)
    .where(and(...conditions))
  
  const currentCount = Number(result[0]?.count || 0)
  const remaining = limit - currentCount
  
  if (remaining <= 0) {
    // Calculate time until reset
    const oldestRequest = await db.select({
      windowStart: rateLimitTracking.windowStart,
    })
      .from(rateLimitTracking)
      .where(and(...conditions))
      .orderBy(rateLimitTracking.windowStart)
      .limit(1)
    
    const retryAfter = oldestRequest[0]
      ? Math.ceil((new Date(oldestRequest[0].windowStart).getTime() + windowMs - now.getTime()) / 1000)
      : 60
    
    return {
      allowed: false,
      remaining: 0,
      limit,
      resetAt,
      retryAfter: Math.max(retryAfter, 1),
    }
  }
  
  return {
    allowed: true,
    remaining,
    limit,
    resetAt,
  }
}

/**
 * Record a new request
 */
async function recordRequest(
  identifier: { userId?: string; ipAddress?: string },
  endpoint: string
): Promise<void> {
  const { userId, ipAddress } = identifier
  const now = new Date()
  const windowEnd = new Date(now.getTime() + RATE_LIMIT_WINDOWS.minute)
  
  await db.insert(rateLimitTracking).values({
    userId: userId || null,
    ipAddress: ipAddress || null,
    endpoint,
    requestCount: '1',
    windowStart: now,
    windowEnd,
  })
}

/**
 * Get complete rate limit information
 * Credit-based system: same limits for all users
 */
export async function getRateLimitInfo(
  identifier: { userId?: string; ipAddress?: string },
  endpoint: string
): Promise<RateLimitInfo> {
  // Same limits for all users
  const limits = RATE_LIMITS
  
  const [minute, hour, day] = await Promise.all([
    checkWindow(identifier, endpoint, 'minute', limits.requestsPerMinute),
    checkWindow(identifier, endpoint, 'hour', limits.requestsPerHour),
    checkWindow(identifier, endpoint, 'day', limits.requestsPerDay),
  ])
  
  return { minute, hour, day }
}

/**
 * Cleanup old rate limit records
 * This function should be run periodically (e.g., with a cron job)
 */
export async function cleanupRateLimitRecords(): Promise<number> {
  const cutoff = new Date(Date.now() - RATE_LIMIT_WINDOWS.day)
  
  const result = await db.delete(rateLimitTracking)
    .where(lte(rateLimitTracking.windowEnd, cutoff))
  
  return 0 // Drizzle doesn't return the count of deleted rows
}

/**
 * Reset rate limit for a user (admin action)
 */
export async function resetRateLimit(
  identifier: { userId?: string; ipAddress?: string }
): Promise<void> {
  const { userId, ipAddress } = identifier
  
  if (userId) {
    await db.delete(rateLimitTracking)
      .where(eq(rateLimitTracking.userId, userId))
  } else if (ipAddress) {
    await db.delete(rateLimitTracking)
      .where(eq(rateLimitTracking.ipAddress, ipAddress))
  }
}
