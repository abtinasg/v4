/**
 * Credit Middleware
 * Middleware for credit and rate limit checking
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { checkCredits, deductCredits, checkAndResetMonthlyCredits } from './service'
import { checkRateLimit, getRateLimitInfo } from './rate-limiter'
import { CREDIT_REQUIRED_ENDPOINTS, type CreditAction } from './config'

export interface CreditMiddlewareResult {
  success: boolean
  error?: string
  statusCode?: number
  headers?: Record<string, string>
  userId?: string
  internalUserId?: string
  creditBalance?: number
}

/**
 * Main middleware for credit and rate limit checking
 */
export async function creditMiddleware(
  request: NextRequest
): Promise<CreditMiddlewareResult> {
  const pathname = request.nextUrl.pathname
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                   request.headers.get('x-real-ip') ||
                   'unknown'
  
  // Get user info from Clerk
  const { userId: clerkUserId } = await auth()
  
  let internalUserId: string | undefined
  
  // If user is logged in, find internal userId
  if (clerkUserId) {
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
    })
    internalUserId = user?.id
    
    // Check and reset monthly credits
    if (internalUserId) {
      await checkAndResetMonthlyCredits(internalUserId)
    }
  }
  
  // === Rate Limit Check ===
  const rateLimitResult = await checkRateLimit(
    { userId: internalUserId, ipAddress },
    pathname
  )
  
  if (!rateLimitResult.allowed) {
    return {
      success: false,
      error: 'Rate limit exceeded. Please slow down.',
      statusCode: 429,
      headers: {
        'X-RateLimit-Limit': String(rateLimitResult.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
        'Retry-After': String(rateLimitResult.retryAfter || 60),
      },
    }
  }
  
  // === Credit Check ===
  // Find the action for this endpoint
  let creditAction: CreditAction | undefined
  
  for (const [endpoint, action] of Object.entries(CREDIT_REQUIRED_ENDPOINTS)) {
    if (pathname.startsWith(endpoint)) {
      creditAction = action
      break
    }
  }
  
  // If endpoint doesn't require credits
  if (!creditAction) {
    return {
      success: true,
      userId: clerkUserId || undefined,
      internalUserId,
      headers: {
        'X-RateLimit-Limit': String(rateLimitResult.limit),
        'X-RateLimit-Remaining': String(rateLimitResult.remaining),
        'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
      },
    }
  }
  
  // If user is not logged in and endpoint requires credits
  if (!internalUserId) {
    return {
      success: false,
      error: 'Authentication required for this action',
      statusCode: 401,
    }
  }
  
  // Check if user has sufficient credits
  const creditCheck = await checkCredits(internalUserId, creditAction)
  
  if (!creditCheck.success) {
    return {
      success: false,
      error: creditCheck.message || 'Insufficient credits',
      statusCode: 402, // Payment Required
      creditBalance: creditCheck.currentBalance,
      headers: {
        'X-Credit-Balance': String(creditCheck.currentBalance),
        'X-Credit-Required': String(creditCheck.requiredCredits),
      },
    }
  }
  
  return {
    success: true,
    userId: clerkUserId || undefined,
    internalUserId,
    creditBalance: creditCheck.currentBalance,
    headers: {
      'X-RateLimit-Limit': String(rateLimitResult.limit),
      'X-RateLimit-Remaining': String(rateLimitResult.remaining),
      'X-RateLimit-Reset': rateLimitResult.resetAt.toISOString(),
      'X-Credit-Balance': String(creditCheck.currentBalance),
    },
  }
}

/**
 * Deduct credits after successful operation
 */
export async function deductCreditsAfterSuccess(
  userId: string,
  action: CreditAction,
  metadata?: {
    symbol?: string
    apiEndpoint?: string
    ipAddress?: string
  }
) {
  return deductCredits(userId, action, metadata)
}

/**
 * Helper to add headers to response
 */
export function addCreditHeaders(
  response: NextResponse,
  result: CreditMiddlewareResult
): NextResponse {
  if (result.headers) {
    for (const [key, value] of Object.entries(result.headers)) {
      response.headers.set(key, value)
    }
  }
  return response
}

/**
 * Create error response
 */
export function createCreditErrorResponse(
  result: CreditMiddlewareResult
): NextResponse {
  const response = NextResponse.json(
    {
      error: result.error,
      creditBalance: result.creditBalance,
    },
    { status: result.statusCode || 400 }
  )
  
  return addCreditHeaders(response, result)
}

/**
 * Standard insufficient credits error response
 * Use this in all API routes for consistent error format
 */
export function createInsufficientCreditsResponse(
  currentBalance: number,
  requiredCredits: number,
  action?: string
): NextResponse {
  const response = NextResponse.json(
    {
      success: false,
      error: 'insufficient_credits',
      message: 'You do not have enough credits for this action. Please purchase more credits.',
      details: {
        currentBalance,
        requiredCredits,
        shortfall: requiredCredits - currentBalance,
        action,
      },
      links: {
        pricing: '/pricing',
        credits: '/dashboard/settings/credits',
      },
    },
    { status: 402 } // Payment Required
  )
  
  response.headers.set('X-Credit-Balance', String(currentBalance))
  response.headers.set('X-Credit-Required', String(requiredCredits))
  response.headers.set('X-Credit-Shortfall', String(requiredCredits - currentBalance))
  
  return response
}

/**
 * Standard authentication required error response
 */
export function createAuthRequiredResponse(): NextResponse {
  return NextResponse.json(
    {
      success: false,
      error: 'authentication_required',
      message: 'You must be logged in to access this feature.',
      links: {
        signIn: '/sign-in',
        signUp: '/sign-up',
      },
    },
    { status: 401 }
  )
}

/**
 * Standard rate limit error response
 */
export function createRateLimitResponse(
  retryAfter: number,
  limit: number,
  resetAt: Date
): NextResponse {
  const response = NextResponse.json(
    {
      success: false,
      error: 'rate_limit_exceeded',
      message: 'You have exceeded the rate limit. Please slow down.',
      details: {
        retryAfter,
        limit,
        resetAt: resetAt.toISOString(),
      },
    },
    { status: 429 }
  )
  
  response.headers.set('X-RateLimit-Limit', String(limit))
  response.headers.set('X-RateLimit-Remaining', '0')
  response.headers.set('X-RateLimit-Reset', resetAt.toISOString())
  response.headers.set('Retry-After', String(retryAfter))
  
  return response
}
