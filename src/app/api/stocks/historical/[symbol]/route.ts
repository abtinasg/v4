import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { 
  checkCredits, 
  deductCredits, 
  checkAndResetMonthlyCredits,
} from '@/lib/credits'
import { getHistoricalData } from '@/lib/api/yahoo-finance'

// Force Node.js runtime for yahoo-finance2 compatibility
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    // === Credit System Check ===
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    await checkAndResetMonthlyCredits(user.id)

    const creditCheck = await checkCredits(user.id, 'technical_analysis')
    if (!creditCheck.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'insufficient_credits',
          message: 'You do not have enough credits for this action. Please purchase more credits.',
          details: {
            currentBalance: creditCheck.currentBalance,
            requiredCredits: creditCheck.requiredCredits,
            shortfall: creditCheck.requiredCredits - creditCheck.currentBalance,
            action: 'technical_analysis',
          },
          links: {
            pricing: '/pricing',
            credits: '/dashboard/settings/credits',
          },
        },
        { 
          status: 402,
          headers: {
            'X-Credit-Balance': String(creditCheck.currentBalance),
            'X-Credit-Required': String(creditCheck.requiredCredits),
          }
        }
      )
    }
    // === End Credit Check ===

    const { symbol: rawSymbol } = await params
    const symbol = rawSymbol?.toUpperCase()
    
    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Symbol is required' },
        { status: 400 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const interval = (searchParams.get('interval') || '1d') as '1d' | '1wk' | '1mo' | '1h' | '5m' | '15m' | '30m'
    const range = (searchParams.get('range') || '1mo') as '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | 'max'

    const result = await getHistoricalData(symbol, { interval, range })
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to fetch historical data',
          timestamp: Date.now()
        },
        { status: 404 }
      )
    }

    // Deduct credits after successful fetch
    await deductCredits(user.id, 'technical_analysis', {
      symbol,
      endpoint: '/api/stocks/historical/[symbol]',
    })

    return NextResponse.json({
      success: true,
      data: result.data,
      cached: result.cached,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Historical API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        timestamp: Date.now()
      },
      { status: 500 }
    )
  }
}
