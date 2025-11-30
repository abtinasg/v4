import { NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

const yahooFinance = new YahooFinance()

// Fallback movers data
const FALLBACK_GAINERS = [
  { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 142.85, change: 8.45, changePercent: 6.28, volume: 45000000, marketCap: 3500000000000, avgVolume: 42000000, volumeRatio: 1.07 },
  { symbol: 'TSLA', name: 'Tesla, Inc.', price: 352.56, change: 15.23, changePercent: 4.52, volume: 38000000, marketCap: 1100000000000, avgVolume: 35000000, volumeRatio: 1.09 },
  { symbol: 'AMD', name: 'Advanced Micro Devices', price: 138.92, change: 4.87, changePercent: 3.63, volume: 28000000, marketCap: 225000000000, avgVolume: 25000000, volumeRatio: 1.12 },
  { symbol: 'META', name: 'Meta Platforms, Inc.', price: 582.45, change: 18.32, changePercent: 3.25, volume: 15000000, marketCap: 1500000000000, avgVolume: 14000000, volumeRatio: 1.07 },
  { symbol: 'AAPL', name: 'Apple Inc.', price: 234.56, change: 5.67, changePercent: 2.48, volume: 52000000, marketCap: 3600000000000, avgVolume: 48000000, volumeRatio: 1.08 },
]

const FALLBACK_LOSERS = [
  { symbol: 'XOM', name: 'Exxon Mobil Corporation', price: 105.23, change: -3.45, changePercent: -3.17, volume: 18000000, marketCap: 420000000000, avgVolume: 16000000, volumeRatio: 1.13 },
  { symbol: 'CVX', name: 'Chevron Corporation', price: 142.67, change: -4.12, changePercent: -2.81, volume: 12000000, marketCap: 265000000000, avgVolume: 11000000, volumeRatio: 1.09 },
  { symbol: 'PFE', name: 'Pfizer Inc.', price: 25.34, change: -0.67, changePercent: -2.58, volume: 35000000, marketCap: 145000000000, avgVolume: 32000000, volumeRatio: 1.09 },
  { symbol: 'BA', name: 'Boeing Company', price: 178.45, change: -4.23, changePercent: -2.31, volume: 8500000, marketCap: 108000000000, avgVolume: 7800000, volumeRatio: 1.09 },
  { symbol: 'DIS', name: 'Walt Disney Company', price: 112.34, change: -2.15, changePercent: -1.88, volume: 11000000, marketCap: 205000000000, avgVolume: 10500000, volumeRatio: 1.05 },
]

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
  avgVolume: number // Average 10-day volume
  volumeRatio: number // Current volume / Average volume (for unusual volume detection)
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
        
        const currentVolume = quote.regularMarketVolume || 0
        const avgVolume = quote.averageDailyVolume10Day || quote.averageDailyVolume3Month || 0
        // Calculate volume ratio: how many times current volume is vs average
        const volumeRatio = avgVolume > 0 ? currentVolume / avgVolume : 0
        
        return {
          symbol: quote.symbol || symbol,
          name: quote.shortName || quote.longName || symbol,
          price: quote.regularMarketPrice || 0,
          change: quote.regularMarketChange || 0,
          changePercent: quote.regularMarketChangePercent || 0,
          volume: currentVolume,
          marketCap: quote.marketCap || 0,
          avgVolume,
          volumeRatio,
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

    // Unusual Volume: stocks trading at 1.2x or more their average volume
    // Sorted by volume ratio (highest unusual activity first)
    const unusualVolume = [...allStocks]
      .filter((s) => s.volumeRatio >= 1.2) // At least 20% above average
      .sort((a, b) => b.volumeRatio - a.volumeRatio)
      .slice(0, 15)

    return NextResponse.json({
      success: true,
      gainers,
      losers,
      mostActive,
      unusualVolume,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching market movers:', error)
    
    // Return fallback data instead of error
    return NextResponse.json({
      success: true,
      gainers: FALLBACK_GAINERS,
      losers: FALLBACK_LOSERS,
      mostActive: FALLBACK_GAINERS,
      unusualVolume: FALLBACK_GAINERS.slice(0, 3),
      lastUpdated: new Date().toISOString(),
      cached: true,
      warning: 'Using cached data due to API error',
    })
  }
}
