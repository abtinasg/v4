import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getStockQuote } from '@/lib/api/yahoo-finance'
import { withCredits } from '@/lib/credits'

// Force Node.js runtime for yahoo-finance2 compatibility
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

// Get stock quotes - supports single symbol or multiple (comma-separated)
export const GET = withCredits('real_time_quote', async (request, { deductCreditsAfter }) => {
  const searchParams = request.nextUrl.searchParams
  const symbolParam = searchParams.get('symbol') || searchParams.get('symbols')

  if (!symbolParam) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    )
  }

  // Support multiple symbols (comma-separated)
  const symbols = symbolParam.split(',').map(s => s.trim().toUpperCase()).filter(Boolean)

  if (symbols.length === 0) {
    return NextResponse.json(
      { error: 'At least one valid symbol is required' },
      { status: 400 }
    )
  }

  // Single symbol - return single quote
  if (symbols.length === 1) {
    const result = await getStockQuote(symbols[0])
    
    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to fetch quote' },
        { status: 500 }
      )
    }

    // Deduct credits after successful quote
    await deductCreditsAfter()

    // Map to watchlist-compatible format
    const quote = result.data!
    return NextResponse.json({
      symbol: quote.symbol,
      name: quote.longName || quote.shortName || quote.symbol,
      price: quote.price,
      change: quote.change,
      changePercent: quote.changePercent,
      volume: quote.volume,
      marketCap: quote.marketCap,
      high: quote.dayHigh,
      low: quote.dayLow,
      open: quote.open,
      previousClose: quote.previousClose,
      pe: quote.peRatio,
    })
  }

  // Multiple symbols - return array of quotes
  const results = await Promise.allSettled(
    symbols.map(symbol => getStockQuote(symbol))
  )

  const quotes = results
    .map((result, index) => {
      if (result.status === 'fulfilled' && result.value.success && result.value.data) {
        const quote = result.value.data
        return {
          symbol: quote.symbol,
          name: quote.longName || quote.shortName || quote.symbol,
          price: quote.price,
          change: quote.change,
          changePercent: quote.changePercent,
          volume: quote.volume,
          marketCap: quote.marketCap,
          high: quote.dayHigh,
          low: quote.dayLow,
          open: quote.open,
          previousClose: quote.previousClose,
          pe: quote.peRatio,
          // Generate sparkline placeholder (24 points)
          sparklineData: Array.from({ length: 24 }, () => 
            quote.price + (Math.random() - 0.5) * quote.price * 0.02
          ),
          lastUpdated: new Date().toISOString(),
        }
      }
      // Return null for failed quotes
      return null
    })
    .filter(Boolean)

  // Deduct credits after successful quotes
  await deductCreditsAfter()

  return NextResponse.json({
    quotes,
    timestamp: new Date().toISOString(),
  })
})
