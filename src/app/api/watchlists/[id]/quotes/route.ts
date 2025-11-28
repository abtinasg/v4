/**
 * Watchlist Quotes API Routes
 * 
 * GET /api/watchlists/[id]/quotes - Get real-time quotes for watchlist stocks
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { watchlistQueries, userQueries } from '@/lib/db/queries'
import yahooFinance from 'yahoo-finance2'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

interface YahooQuote {
  symbol: string
  shortName?: string
  longName?: string
  regularMarketPrice?: number
  regularMarketPreviousClose?: number
  regularMarketChange?: number
  regularMarketChangePercent?: number
  regularMarketVolume?: number
  regularMarketDayHigh?: number
  regularMarketDayLow?: number
  regularMarketOpen?: number
  marketCap?: number
  trailingPE?: number
}

// GET - Get real-time quotes for watchlist stocks
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth()
    const { id } = await params
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await userQueries.getByClerkId(clerkId)
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const watchlist = await watchlistQueries.getById(id)

    if (!watchlist) {
      return NextResponse.json(
        { error: 'Watchlist not found' },
        { status: 404 }
      )
    }

    if (watchlist.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get symbols from watchlist
    const symbols = watchlist.items.map((item) => item.symbol)

    if (symbols.length === 0) {
      return NextResponse.json({ quotes: [] })
    }

    // Fetch real quotes from Yahoo Finance
    const quotes = await Promise.all(
      symbols.map(async (symbol) => {
        try {
          const quote = await yahooFinance.quote(symbol) as YahooQuote
          
          // Get sparkline data (historical prices for last 24h/7d)
          let sparklineData: number[] = []
          try {
            const history = await yahooFinance.chart(symbol, {
              period1: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
              period2: new Date(),
              interval: '1d',
            })
            if (history?.quotes) {
              sparklineData = history.quotes
                .filter((q: any) => q.close != null)
                .map((q: any) => q.close as number)
                .slice(-24)
            }
          } catch (e) {
            // Sparkline is optional, continue without it
            console.log(`Sparkline fetch failed for ${symbol}:`, e)
          }
          
          return {
            symbol: quote.symbol,
            name: quote.longName || quote.shortName || symbol,
            price: quote.regularMarketPrice || 0,
            previousClose: quote.regularMarketPreviousClose || 0,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
            volume: quote.regularMarketVolume || 0,
            high: quote.regularMarketDayHigh || 0,
            low: quote.regularMarketDayLow || 0,
            open: quote.regularMarketOpen || 0,
            marketCap: quote.marketCap || 0,
            pe: quote.trailingPE || 0,
            sparklineData,
            lastUpdated: new Date().toISOString(),
          }
        } catch (error) {
          console.error(`Failed to fetch quote for ${symbol}:`, error)
          // Return minimal data for failed symbols
          return {
            symbol,
            name: symbol,
            price: 0,
            previousClose: 0,
            change: 0,
            changePercent: 0,
            volume: 0,
            high: 0,
            low: 0,
            open: 0,
            marketCap: 0,
            pe: 0,
            sparklineData: [],
            lastUpdated: new Date().toISOString(),
            error: 'Failed to fetch quote',
          }
        }
      })
    )

    return NextResponse.json({ 
      quotes,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching quotes:', error)
    return NextResponse.json(
      { error: 'Failed to fetch quotes' },
      { status: 500 }
    )
  }
}
