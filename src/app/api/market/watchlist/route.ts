import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import YahooFinance from 'yahoo-finance2'
import { db } from '@/lib/db'
import { watchlists, watchlistItems } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

const yahooFinance = new YahooFinance()

// Default watchlist symbols for non-authenticated users
const DEFAULT_SYMBOLS = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']

interface WatchlistStock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  sparklineData: number[]
}

async function fetchStockData(symbol: string): Promise<WatchlistStock | null> {
  try {
    const [quote, chart] = await Promise.all([
      yahooFinance.quote(symbol),
      yahooFinance.chart(symbol, {
        period1: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        period2: new Date(),
        interval: '1h',
      }).catch(() => null),
    ])

    // Extract sparkline data from chart
    const sparklineData = chart?.quotes
      ?.filter(q => q.close !== null)
      ?.map(q => q.close as number)
      ?.slice(-20) || []

    // If no chart data, generate mock sparkline
    const basePrice = quote.regularMarketPrice || 100
    const finalSparkline = sparklineData.length > 5 
      ? sparklineData 
      : Array.from({ length: 20 }, (_, i) => basePrice * (0.98 + Math.random() * 0.04))

    return {
      symbol: quote.symbol || symbol,
      name: quote.shortName || quote.longName || symbol,
      price: quote.regularMarketPrice || 0,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      sparklineData: finalSparkline,
    }
  } catch (error) {
    console.error(`Error fetching ${symbol}:`, error)
    return null
  }
}

export async function GET() {
  try {
    let symbols = DEFAULT_SYMBOLS

    // Try to get user's watchlist from database
    try {
      const { userId } = await auth()
      if (userId) {
        // Get user's default watchlist
        const userWatchlist = await db.query.watchlists.findFirst({
          where: eq(watchlists.userId, userId),
          with: {
            items: true,
          },
          orderBy: (watchlists, { desc }) => [desc(watchlists.createdAt)],
        })

        if (userWatchlist && userWatchlist.items.length > 0) {
          symbols = userWatchlist.items.slice(0, 5).map(item => item.symbol)
        }
      }
    } catch (authError) {
      // Auth failed, use default symbols
      console.log('Using default watchlist - auth not available')
    }

    // Fetch data for all symbols in parallel
    const results = await Promise.all(symbols.map(fetchStockData))
    const stocks = results.filter((s): s is WatchlistStock => s !== null)

    return NextResponse.json({
      success: true,
      stocks,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching watchlist:', error)
    
    // Return mock data on error
    return NextResponse.json({
      success: true,
      stocks: [
        { symbol: 'AAPL', name: 'Apple Inc', price: 232.45, change: 1.23, changePercent: 0.53, sparklineData: [228, 229, 230, 229, 231, 232, 232.45] },
        { symbol: 'MSFT', name: 'Microsoft Corp', price: 428.67, change: 5.89, changePercent: 1.39, sparklineData: [420, 422, 425, 423, 426, 428, 428.67] },
        { symbol: 'GOOGL', name: 'Alphabet Inc', price: 178.23, change: 2.45, changePercent: 1.39, sparklineData: [175, 176, 175, 177, 178, 178, 178.23] },
        { symbol: 'AMZN', name: 'Amazon.com Inc', price: 212.78, change: 3.45, changePercent: 1.65, sparklineData: [208, 209, 210, 211, 212, 213, 212.78] },
        { symbol: 'TSLA', name: 'Tesla Inc', price: 352.89, change: -8.45, changePercent: -2.34, sparklineData: [360, 358, 355, 354, 353, 352, 352.89] },
      ],
      lastUpdated: new Date().toISOString(),
      mock: true,
    })
  }
}

export const revalidate = 60 // 1 minute
