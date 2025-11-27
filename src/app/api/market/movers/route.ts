import { NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

const yahooFinance = new YahooFinance()

// Expanded list of popular stocks to track for movers
const ALL_SYMBOLS = [
  // Big Tech
  'AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'META', 'NVDA', 'TSLA',
  // Semiconductors
  'AMD', 'INTC', 'AVGO', 'QCOM', 'MU', 'AMAT', 'LRCX', 'KLAC',
  // Finance
  'JPM', 'BAC', 'WFC', 'GS', 'MS', 'C', 'BLK', 'SCHW',
  // Healthcare
  'UNH', 'JNJ', 'PFE', 'ABBV', 'MRK', 'LLY', 'TMO', 'ABT',
  // Consumer
  'WMT', 'HD', 'COST', 'NKE', 'SBUX', 'MCD', 'KO', 'PEP',
  // Energy
  'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'OXY',
  // EV & Auto
  'RIVN', 'LCID', 'F', 'GM', 'TM',
  // Streaming & Media
  'NFLX', 'DIS', 'CMCSA', 'WBD', 'PARA',
  // Payments & Fintech
  'V', 'MA', 'PYPL', 'SQ', 'COIN',
  // Airlines & Travel
  'UAL', 'DAL', 'AAL', 'LUV', 'BA',
  // Retail
  'TGT', 'LOW', 'BABA', 'JD', 'PDD',
  // Crypto-related
  'MSTR', 'MARA', 'RIOT', 'HOOD',
  // Meme stocks
  'GME', 'AMC',
  // Other popular
  'PLTR', 'SNOW', 'CRM', 'ORCL', 'IBM', 'CSCO', 'ADBE', 'NOW'
]

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
}

async function fetchStockData(symbols: string[]): Promise<StockData[]> {
  const results = await Promise.all(
    symbols.map(async (symbol) => {
      try {
        const quote = await yahooFinance.quote(symbol)
        // Check if quote exists and has required data
        if (!quote || typeof quote.regularMarketPrice !== 'number') {
          console.error(`Invalid quote data for ${symbol}`)
          return null
        }
        return {
          symbol: quote.symbol || symbol,
          name: quote.shortName || quote.longName || symbol,
          price: quote.regularMarketPrice || 0,
          change: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0,
          volume: quote.regularMarketVolume || 0,
          marketCap: quote.marketCap || 0,
        }
      } catch (error) {
        console.error(`Error fetching ${symbol}:`, error)
        return null
      }
    })
  )

  return results.filter((r): r is StockData => r !== null)
}

export async function GET() {
  try {
    // Fetch all stocks
    const allStocks = await fetchStockData(ALL_SYMBOLS)

    // Sort gainers by positive change percent (highest first) - top 15
    const gainers = [...allStocks]
      .filter((s) => s.changePercent > 0)
      .sort((a, b) => b.changePercent - a.changePercent)
      .slice(0, 15)

    // Sort losers by negative change percent (lowest first) - top 15
    const losers = [...allStocks]
      .filter((s) => s.changePercent < 0)
      .sort((a, b) => a.changePercent - b.changePercent)
      .slice(0, 15)

    // Sort active by volume (highest first) - top 15
    const mostActive = [...allStocks]
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 15)

    return NextResponse.json({
      success: true,
      gainers,
      losers,
      mostActive,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching market movers:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch market movers',
        gainers: [],
        losers: [],
        mostActive: [],
        lastUpdated: new Date().toISOString(),
      },
      { status: 500 }
    )
  }
}
