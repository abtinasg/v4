/**
 * Watchlist Quotes API Routes
 * 
 * GET /api/watchlists/[id]/quotes - Get real-time quotes for watchlist stocks
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { watchlistQueries, userQueries } from '@/lib/db/queries'

interface RouteParams {
  params: Promise<{ id: string }>
}

// Mock quote data generator - replace with real API integration
function generateMockQuote(symbol: string) {
  const basePrice = Math.random() * 500 + 50
  const change = (Math.random() - 0.5) * 20
  const changePercent = (change / basePrice) * 100
  
  return {
    symbol,
    name: `${symbol} Inc.`,
    price: parseFloat(basePrice.toFixed(2)),
    previousClose: parseFloat((basePrice - change).toFixed(2)),
    change: parseFloat(change.toFixed(2)),
    changePercent: parseFloat(changePercent.toFixed(2)),
    volume: Math.floor(Math.random() * 50000000) + 1000000,
    high: parseFloat((basePrice * 1.02).toFixed(2)),
    low: parseFloat((basePrice * 0.98).toFixed(2)),
    open: parseFloat((basePrice - change / 2).toFixed(2)),
    marketCap: Math.floor(Math.random() * 500000000000) + 1000000000,
    pe: parseFloat((Math.random() * 50 + 5).toFixed(2)),
    // Generate sparkline data (24 points for 24h)
    sparklineData: Array.from({ length: 24 }, () => 
      basePrice + (Math.random() - 0.5) * 10
    ),
    lastUpdated: new Date().toISOString(),
  }
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

    // Generate quotes for each symbol
    // TODO: Replace with real API call to Yahoo Finance, Alpha Vantage, etc.
    const quotes = symbols.map((symbol) => generateMockQuote(symbol))

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
