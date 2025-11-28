import { NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const yahooFinance = new YahooFinance()

// Sector ETFs with their names
const SECTOR_ETFS = [
  { symbol: 'XLK', name: 'Technology' },
  { symbol: 'XLV', name: 'Healthcare' },
  { symbol: 'XLF', name: 'Financial Services' },
  { symbol: 'XLY', name: 'Consumer Cyclical' },
  { symbol: 'XLI', name: 'Industrials' },
  { symbol: 'XLE', name: 'Energy' },
  { symbol: 'XLB', name: 'Basic Materials' },
  { symbol: 'XLU', name: 'Utilities' },
  { symbol: 'XLRE', name: 'Real Estate' },
  { symbol: 'XLC', name: 'Communication Services' },
  { symbol: 'XLP', name: 'Consumer Defensive' },
]

export async function GET() {
  try {
    // Fetch all sector ETF quotes in parallel
    const quotes = await Promise.all(
      SECTOR_ETFS.map(async (sector) => {
        try {
          const quote = await yahooFinance.quote(sector.symbol) as any
          return { 
            name: sector.name,
            symbol: sector.symbol,
            change: quote?.regularMarketChangePercent || 0,
            price: quote?.regularMarketPrice || 0,
          }
        } catch (err) {
          console.error(`Error fetching ${sector.symbol}:`, err)
          return { 
            name: sector.name,
            symbol: sector.symbol,
            change: 0,
            price: 0,
          }
        }
      })
    )

    // Filter out failed quotes and sort by change
    const sectors = quotes
      .filter(s => s.price > 0)
      .sort((a, b) => b.change - a.change)

    return NextResponse.json({
      success: true,
      sectors,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching sector performance:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch sector data',
      sectors: [],
      lastUpdated: new Date().toISOString(),
    }, { status: 500 })
  }
}
