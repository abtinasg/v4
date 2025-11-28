import { NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const yahooFinance = new YahooFinance()

const FOREX_PAIRS = [
  { symbol: 'EURUSD=X', name: 'EUR/USD' },
  { symbol: 'GBPUSD=X', name: 'GBP/USD' },
  { symbol: 'USDJPY=X', name: 'USD/JPY' },
  { symbol: 'USDCHF=X', name: 'USD/CHF' },
  { symbol: 'AUDUSD=X', name: 'AUD/USD' },
  { symbol: 'USDCAD=X', name: 'USD/CAD' },
  { symbol: 'NZDUSD=X', name: 'NZD/USD' },
  { symbol: 'EURGBP=X', name: 'EUR/GBP' },
]

export async function GET() {
  try {
    const currencies = await Promise.all(
      FOREX_PAIRS.map(async (pair) => {
        try {
          const quote = await yahooFinance.quote(pair.symbol) as any
          return {
            pair: pair.name,
            price: quote?.regularMarketPrice || 0,
            change: quote?.regularMarketChange || 0,
            changePercent: quote?.regularMarketChangePercent || 0,
          }
        } catch {
          return {
            pair: pair.name,
            price: 0,
            change: 0,
            changePercent: 0,
          }
        }
      })
    )

    const validCurrencies = currencies.filter(c => c.price > 0)

    return NextResponse.json({
      currencies: validCurrencies,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching forex data:', error)
    return NextResponse.json({
      currencies: [],
      error: 'Failed to fetch forex data',
    }, { status: 500 })
  }
}
