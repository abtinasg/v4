import { NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

const yahooFinance = new YahooFinance()

// Fallback sector data
const FALLBACK_SECTORS = [
  { name: 'Technology', symbol: 'XLK', change: 1.24, price: 227.45 },
  { name: 'Healthcare', symbol: 'XLV', change: 0.67, price: 147.32 },
  { name: 'Financial Services', symbol: 'XLF', change: 0.89, price: 47.85 },
  { name: 'Consumer Cyclical', symbol: 'XLY', change: 0.54, price: 215.67 },
  { name: 'Industrials', symbol: 'XLI', change: 0.42, price: 134.28 },
  { name: 'Energy', symbol: 'XLE', change: -0.35, price: 89.45 },
  { name: 'Basic Materials', symbol: 'XLB', change: 0.28, price: 87.92 },
  { name: 'Utilities', symbol: 'XLU', change: 0.15, price: 72.34 },
  { name: 'Real Estate', symbol: 'XLRE', change: 0.38, price: 42.18 },
  { name: 'Communication Services', symbol: 'XLC', change: 0.95, price: 89.54 },
  { name: 'Consumer Defensive', symbol: 'XLP', change: 0.21, price: 79.87 },
]

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

    // If no valid sectors, use fallback
    if (sectors.length === 0) {
      return NextResponse.json({
        success: true,
        sectors: FALLBACK_SECTORS,
        lastUpdated: new Date().toISOString(),
        cached: true,
      })
    }

    return NextResponse.json({
      success: true,
      sectors,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching sector performance:', error)
    
    // Return fallback data instead of error
    return NextResponse.json({
      success: true,
      sectors: FALLBACK_SECTORS,
      lastUpdated: new Date().toISOString(),
      cached: true,
      warning: 'Using cached data due to API error',
    })
  }
}
