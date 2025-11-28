import { NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const yahooFinance = new YahooFinance()

const COMMODITIES = [
  { symbol: 'GC=F', name: 'Gold', short: 'GC' },
  { symbol: 'SI=F', name: 'Silver', short: 'SI' },
  { symbol: 'CL=F', name: 'Crude Oil', short: 'CL' },
  { symbol: 'NG=F', name: 'Natural Gas', short: 'NG' },
  { symbol: 'HG=F', name: 'Copper', short: 'HG' },
  { symbol: 'PL=F', name: 'Platinum', short: 'PL' },
  { symbol: 'ZW=F', name: 'Wheat', short: 'ZW' },
  { symbol: 'ZC=F', name: 'Corn', short: 'ZC' },
]

export async function GET() {
  try {
    const commodities = await Promise.all(
      COMMODITIES.map(async (commodity) => {
        try {
          const quote = await yahooFinance.quote(commodity.symbol) as any
          return {
            symbol: commodity.short,
            name: commodity.name,
            price: quote?.regularMarketPrice || 0,
            change: quote?.regularMarketChange || 0,
            changePercent: quote?.regularMarketChangePercent || 0,
          }
        } catch {
          return {
            symbol: commodity.short,
            name: commodity.name,
            price: 0,
            change: 0,
            changePercent: 0,
          }
        }
      })
    )

    const validCommodities = commodities.filter(c => c.price > 0)

    return NextResponse.json({
      commodities: validCommodities,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching commodities data:', error)
    return NextResponse.json({
      commodities: [],
      error: 'Failed to fetch commodities data',
    }, { status: 500 })
  }
}
