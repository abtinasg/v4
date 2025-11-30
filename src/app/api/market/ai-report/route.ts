/**
 * AI Market Report API - Simplified Edition
 * 
 * Returns a simple AI-generated market overview
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { 
  checkCredits, 
  deductCredits, 
  checkRateLimit,
  checkAndResetMonthlyCredits,
  createInsufficientCreditsResponse,
  createAuthRequiredResponse,
  createRateLimitResponse,
} from '@/lib/credits'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'  // Explicitly use Node.js runtime
export const maxDuration = 30

// Simple static responses for now (can be made dynamic later)
const generateSimpleReport = () => {
  const marketMoods = ['bullish', 'bearish', 'neutral', 'mixed'] as const
  const randomMood = marketMoods[Math.floor(Math.random() * marketMoods.length)]
  
  const summaries: Record<typeof marketMoods[number], string> = {
    bullish: "Markets are showing positive momentum with strong buyer interest. Major indices are trending upward with healthy volume. Risk appetite remains elevated as investors rotate into growth sectors.",
    bearish: "Markets are experiencing downward pressure as sellers dominate. Defensive sectors are outperforming while growth stocks face headwinds. Caution is advised as volatility increases.",
    neutral: "Markets are trading in a tight range with mixed signals. Neither bulls nor bears have clear control. Investors are waiting for clearer direction before making significant moves.",
    mixed: "Markets are showing divergent trends across sectors. While some areas demonstrate strength, others face challenges. Selective positioning is recommended in this environment."
  }

  const highlights: Record<typeof marketMoods[number], string[]> = {
    bullish: [
      "Strong technical momentum across major indices",
      "Positive earnings surprises driving sentiment",
      "Improving economic indicators support growth"
    ],
    bearish: [
      "Increased volatility and risk-off sentiment",
      "Profit-taking after recent rallies",
      "Concerns about economic headwinds"
    ],
    neutral: [
      "Consolidation phase after recent moves",
      "Awaiting key economic data releases",
      "Balanced risk-reward setup"
    ],
    mixed: [
      "Sector rotation creating opportunities",
      "Stock-specific performance varies widely",
      "Mixed signals from technical indicators"
    ]
  }

  return {
    success: true,
    report: {
      marketMood: randomMood,
      summary: summaries[randomMood],
      keyHighlights: highlights[randomMood]
    },
    generatedAt: new Date().toISOString()
  }
}

export async function GET(request: Request) {
  try {
    // === Authentication Check ===
    const { userId } = await auth()
    
    if (!userId) {
      return createAuthRequiredResponse()
    }
    
    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    })
    
    if (!user) {
      return createAuthRequiredResponse()
    }

    // === Check and Reset Monthly Credits ===
    await checkAndResetMonthlyCredits(user.id)
    
    // === Rate Limit Check ===
    const { pathname } = new URL(request.url)
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
    
    const rateLimitResult = await checkRateLimit(
      { userId: user.id, ipAddress },
      pathname
    )
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(
        rateLimitResult.retryAfter || 60,
        rateLimitResult.limit,
        rateLimitResult.resetAt
      )
    }
    
    // === Credit Check for news_fetch (5 credits) ===
    const creditCheck = await checkCredits(user.id, 'news_fetch')
    if (!creditCheck.success) {
      return createInsufficientCreditsResponse(
        creditCheck.currentBalance,
        creditCheck.requiredCredits,
        'news_fetch'
      )
    }

    const report = generateSimpleReport()
    
    // === Deduct Credits after successful report generation ===
    await deductCredits(user.id, 'news_fetch', {
      apiEndpoint: pathname,
      ipAddress,
    })
    
    const response = NextResponse.json(report, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
    
    // Add credit headers
    response.headers.set('X-Credit-Balance', String(creditCheck.remainingBalance))
    response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining))
    
    return response
  } catch (error) {
    console.error('AI Report error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate market report' 
      },
      { status: 500 }
    )
  }
}
