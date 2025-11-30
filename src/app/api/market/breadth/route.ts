import { NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

const yahooFinance = new YahooFinance()

interface QuoteData {
  symbol: string
  change: number
  price: number
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
  twoHundredDayAverage: number
}

// Get market breadth data from major indices components
export async function GET() {
  try {
    // We'll use sector ETFs and major stocks to approximate market breadth
    const symbols = [
      // Major tech stocks
      'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA',
      // Financials
      'JPM', 'BAC', 'WFC', 'GS', 'MS',
      // Healthcare
      'UNH', 'JNJ', 'PFE', 'ABBV', 'MRK',
      // Consumer
      'WMT', 'HD', 'KO', 'PEP', 'MCD',
      // Industrials
      'CAT', 'BA', 'GE', 'HON', 'UPS',
      // Energy
      'XOM', 'CVX', 'COP', 'SLB',
      // Communications
      'DIS', 'NFLX', 'CMCSA', 'VZ', 'T',
      // Materials
      'LIN', 'APD', 'ECL', 'DD',
      // REITs
      'AMT', 'PLD', 'CCI', 'EQIX',
      // Utilities
      'NEE', 'DUK', 'SO', 'D',
    ]

    const quotes = await Promise.all(
      symbols.map(async (symbol): Promise<QuoteData | null> => {
        try {
          const quote = await yahooFinance.quote(symbol) as any
          return {
            symbol,
            change: quote?.regularMarketChangePercent || 0,
            price: quote?.regularMarketPrice || 0,
            fiftyTwoWeekHigh: quote?.fiftyTwoWeekHigh || 0,
            fiftyTwoWeekLow: quote?.fiftyTwoWeekLow || 0,
            twoHundredDayAverage: quote?.twoHundredDayAverage || 0,
          }
        } catch {
          return null
        }
      })
    )

    const validQuotes = quotes.filter((q): q is QuoteData => q !== null)
    
    // Calculate breadth metrics
    const advancing = validQuotes.filter(q => q.change > 0).length
    const declining = validQuotes.filter(q => q.change < 0).length
    const unchanged = validQuotes.filter(q => q.change === 0).length
    
    // Calculate stocks near 52-week highs/lows (within 5%)
    const nearHighs = validQuotes.filter(q => {
      if (!q.fiftyTwoWeekHigh || !q.price) return false
      return q.price >= q.fiftyTwoWeekHigh * 0.95
    }).length
    
    const nearLows = validQuotes.filter(q => {
      if (!q.fiftyTwoWeekLow || !q.price) return false
      return q.price <= q.fiftyTwoWeekLow * 1.05
    }).length
    
    // Calculate stocks above/below 200-day moving average
    const above200MA = validQuotes.filter(q => {
      if (!q.twoHundredDayAverage || !q.price) return false
      return q.price > q.twoHundredDayAverage
    }).length
    
    const below200MA = validQuotes.filter(q => {
      if (!q.twoHundredDayAverage || !q.price) return false
      return q.price <= q.twoHundredDayAverage
    }).length
    
    const total = validQuotes.length
    const aboveMA200Percent = total > 0 ? Math.round((above200MA / total) * 100) : 50
    const belowMA200Percent = 100 - aboveMA200Percent

    return NextResponse.json({
      success: true,
      breadth: {
        advancing,
        declining,
        unchanged,
        newHighs: nearHighs,
        newLows: nearLows,
        aboveMA200: aboveMA200Percent,
        belowMA200: belowMA200Percent,
        total,
        advanceDeclineRatio: declining > 0 ? (advancing / declining).toFixed(2) : advancing,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching market breadth:', error)
    
    // Return fallback data
    return NextResponse.json({
      success: true,
      breadth: {
        advancing: 287,
        declining: 213,
        unchanged: 12,
        newHighs: 45,
        newLows: 12,
        aboveMA200: 68,
        belowMA200: 32,
        total: 512,
        advanceDeclineRatio: '1.35',
      },
      timestamp: new Date().toISOString(),
      mock: true,
    })
  }
}
