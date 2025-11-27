import { NextRequest, NextResponse } from 'next/server'
import { getStockQuote, getKeyStatistics, getStockProfile } from '@/lib/api/yahoo-finance'

// Force Node.js runtime for yahoo-finance2 compatibility
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol?.toUpperCase()
    
    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Symbol is required' },
        { status: 400 }
      )
    }

    // Check for additional data request
    const searchParams = request.nextUrl.searchParams
    const includeStats = searchParams.get('stats') === 'true'
    const includeProfile = searchParams.get('profile') === 'true'

    // Get the stock quote
    const quoteResult = await getStockQuote(symbol)
    
    if (!quoteResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: quoteResult.error || 'Failed to fetch quote',
          timestamp: Date.now()
        },
        { status: 404 }
      )
    }

    // Optionally include additional data
    let stats = null
    let profile = null

    if (includeStats) {
      const statsResult = await getKeyStatistics(symbol)
      if (statsResult.success) {
        stats = statsResult.data
      }
    }

    if (includeProfile) {
      const profileResult = await getStockProfile(symbol)
      if (profileResult.success) {
        profile = profileResult.data
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        quote: quoteResult.data,
        ...(stats && { statistics: stats }),
        ...(profile && { profile }),
      },
      cached: quoteResult.cached,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Quote API error:', error)
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
