import { NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const yahooFinance = new YahooFinance()

const CRYPTO = [
  { symbol: 'BTC-USD', name: 'Bitcoin', short: 'BTC' },
  { symbol: 'ETH-USD', name: 'Ethereum', short: 'ETH' },
  { symbol: 'SOL-USD', name: 'Solana', short: 'SOL' },
  { symbol: 'BNB-USD', name: 'BNB', short: 'BNB' },
  { symbol: 'XRP-USD', name: 'XRP', short: 'XRP' },
  { symbol: 'ADA-USD', name: 'Cardano', short: 'ADA' },
  { symbol: 'DOGE-USD', name: 'Dogecoin', short: 'DOGE' },
  { symbol: 'DOT-USD', name: 'Polkadot', short: 'DOT' },
]

export async function GET() {
  try {
    const crypto = await Promise.all(
      CRYPTO.map(async (coin) => {
        try {
          const quote = await yahooFinance.quote(coin.symbol) as any
          return {
            symbol: coin.short,
            name: coin.name,
            price: quote?.regularMarketPrice || 0,
            change: quote?.regularMarketChange || 0,
            changePercent: quote?.regularMarketChangePercent || 0,
          }
        } catch {
          return {
            symbol: coin.short,
            name: coin.name,
            price: 0,
            change: 0,
            changePercent: 0,
          }
        }
      })
    )

    const validCrypto = crypto.filter(c => c.price > 0)

    return NextResponse.json({
      crypto: validCrypto,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching crypto data:', error)
    return NextResponse.json({
      crypto: [],
      error: 'Failed to fetch crypto data',
    }, { status: 500 })
  }
}
