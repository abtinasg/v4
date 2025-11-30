/**
 * withCredits - Higher Order Function for API Routes
 * This wrapper easily adds credit checking to any API
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import {
  checkCredits,
  deductCredits,
  checkRateLimit,
  checkAndResetMonthlyCredits,
  type CreditAction,
} from '@/lib/credits'

export interface CreditContext {
  userId: string
  internalUserId: string
  creditBalance: number
  deductCreditsAfter: () => Promise<void>
}

type HandlerWithCredits = (
  request: NextRequest,
  context: CreditContext
) => Promise<NextResponse>

/**
 * Wrapper for API routes that require credits
 * 
 * @example
 * export const GET = withCredits('stock_search', async (request, { userId, creditBalance }) => {
 *   // your logic here
 *   return NextResponse.json({ data: ... })
 * })
 */
export function withCredits(
  action: CreditAction,
  handler: HandlerWithCredits
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const pathname = request.nextUrl.pathname
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') ||
                     'unknown'
    
    try {
      // === Authentication ===
      const { userId: clerkUserId } = await auth()
      
      if (!clerkUserId) {
        return NextResponse.json(
          { error: 'Authentication required' },
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
      
      // === Check and reset monthly credits ===
      await checkAndResetMonthlyCredits(user.id)
      
      // === Rate Limiting ===
      const rateLimitResult = await checkRateLimit(
        { userId: user.id, ipAddress },
        pathname
      )
      
      if (!rateLimitResult.allowed) {
        const response = NextResponse.json(
          { 
            error: 'Rate limit exceeded. Please slow down.',
            retryAfter: rateLimitResult.retryAfter,
          },
          { status: 429 }
        )
        
        response.headers.set('X-RateLimit-Limit', String(rateLimitResult.limit))
        response.headers.set('X-RateLimit-Remaining', '0')
        response.headers.set('X-RateLimit-Reset', rateLimitResult.resetAt.toISOString())
        response.headers.set('Retry-After', String(rateLimitResult.retryAfter || 60))
        
        return response
      }
      
      // === Credit Check ===
      const creditCheck = await checkCredits(user.id, action)
      
      if (!creditCheck.success) {
        const response = NextResponse.json(
          { 
            error: 'Insufficient credits',
            currentBalance: creditCheck.currentBalance,
            requiredCredits: creditCheck.requiredCredits,
          },
          { status: 402 }
        )
        
        response.headers.set('X-Credit-Balance', String(creditCheck.currentBalance))
        response.headers.set('X-Credit-Required', String(creditCheck.requiredCredits))
        
        return response
      }
      
      // Flag to prevent multiple deductions
      let creditsDeducted = false
      
      // Context for handler
      const context: CreditContext = {
        userId: clerkUserId,
        internalUserId: user.id,
        creditBalance: creditCheck.currentBalance,
        deductCreditsAfter: async () => {
          if (!creditsDeducted) {
            creditsDeducted = true
            await deductCredits(user.id, action, {
              apiEndpoint: pathname,
              ipAddress,
            })
          }
        },
      }
      
      // Execute main handler
      const response = await handler(request, context)
      
      // Deduct credits only on success
      if (response.status >= 200 && response.status < 300) {
        await context.deductCreditsAfter()
      }
      
      // Add headers
      response.headers.set('X-RateLimit-Limit', String(rateLimitResult.limit))
      response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining))
      response.headers.set('X-Credit-Balance', String(creditCheck.remainingBalance))
      
      return response
      
    } catch (error) {
      console.error('Error in withCredits wrapper:', error)
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      )
    }
  }
}

/**
 * Simpler wrapper for rate limiting only (no credits)
 */
export function withRateLimit(handler: (request: NextRequest) => Promise<NextResponse>) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const pathname = request.nextUrl.pathname
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') ||
                     'unknown'
    
    const { userId: clerkUserId } = await auth()
    
    let internalUserId: string | undefined
    if (clerkUserId) {
      const user = await db.query.users.findFirst({
        where: eq(users.clerkId, clerkUserId),
      })
      internalUserId = user?.id
    }
    
    // === Rate Limiting ===
    const rateLimitResult = await checkRateLimit(
      { userId: internalUserId, ipAddress },
      pathname
    )
    
    if (!rateLimitResult.allowed) {
      const response = NextResponse.json(
        { 
          error: 'Rate limit exceeded',
          retryAfter: rateLimitResult.retryAfter,
        },
        { status: 429 }
      )
      
      response.headers.set('X-RateLimit-Limit', String(rateLimitResult.limit))
      response.headers.set('X-RateLimit-Remaining', '0')
      response.headers.set('Retry-After', String(rateLimitResult.retryAfter || 60))
      
      return response
    }
    
    const response = await handler(request)
    
    response.headers.set('X-RateLimit-Limit', String(rateLimitResult.limit))
    response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining))
    
    return response
  }
}
