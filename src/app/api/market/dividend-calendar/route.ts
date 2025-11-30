import { NextResponse } from 'next/server'

// Dividend Calendar API - Using Alpha Vantage + Polygon + FMP (all free)
export async function GET() {
  try {
    // Calculate date range
    const today = new Date()
    const oneMonthAgo = new Date(today)
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1)
    const threeMonthsAhead = new Date(today)
    threeMonthsAhead.setMonth(threeMonthsAhead.getMonth() + 3)
    
    const fromDate = oneMonthAgo.toISOString().split('T')[0]
    const toDate = threeMonthsAhead.toISOString().split('T')[0]

    // Try FMP Dividend Calendar first (250 calls/day free)
    const fmpKey = process.env.FMP_API_KEY
    if (fmpKey) {
      const fmpDividends = await fetchDividendCalendarFromFMP(fromDate, toDate, fmpKey)
      if (fmpDividends.length > 0) {
        return NextResponse.json({ 
          success: true, 
          dividends: fmpDividends,
          source: 'fmp',
          updatedAt: new Date().toISOString()
        })
      }
    }

    // Try Polygon (5 calls/min free)
    const polygonKey = process.env.POLYGON_API_KEY
    if (polygonKey) {
      const polygonDividends = await fetchFromPolygon(polygonKey)
      if (polygonDividends.length > 0) {
        return NextResponse.json({ 
          success: true, 
          dividends: polygonDividends,
          source: 'polygon',
          updatedAt: new Date().toISOString()
        })
      }
    }

    // Try Alpha Vantage for individual stocks (25 calls/day free)
    const alphaKey = process.env.ALPHA_VANTAGE_API_KEY
    if (alphaKey) {
      const alphaDividends = await fetchFromAlphaVantage(alphaKey)
      if (alphaDividends.length > 0) {
        return NextResponse.json({ 
          success: true, 
          dividends: alphaDividends,
          source: 'alphavantage',
          updatedAt: new Date().toISOString()
        })
      }
    }

    // Try Yahoo Finance as last resort
    const yahooDividends = await fetchFromYahoo()
    if (yahooDividends.length > 0) {
      return NextResponse.json({ 
        success: true, 
        dividends: yahooDividends,
        source: 'yahoo',
        updatedAt: new Date().toISOString()
      })
    }

    // Fallback message
    return NextResponse.json({ 
      success: true, 
      dividends: getSampleDividends(),
      source: 'sample',
      message: 'Add FMP_API_KEY or ALPHA_VANTAGE_API_KEY to .env for real data',
      updatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Dividend Calendar API error:', error)
    return NextResponse.json({ 
      success: false, 
      dividends: [],
      error: 'Failed to fetch dividend data'
    })
  }
}

// FMP Dividend Calendar (FREE - 250 calls/day)
async function fetchDividendCalendarFromFMP(from: string, to: string, apiKey: string): Promise<any[]> {
  try {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/stock_dividend_calendar?from=${from}&to=${to}&apikey=${apiKey}`,
      { next: { revalidate: 3600 } }
    )
    
    if (!response.ok) return []
    
    const dividends = await response.json()
    if (!Array.isArray(dividends)) return []
    
    // Group by symbol and take unique, sort by date
    const uniqueDividends = new Map()
    dividends.forEach((div: any) => {
      if (!uniqueDividends.has(div.symbol)) {
        uniqueDividends.set(div.symbol, div)
      }
    })
    
    return Array.from(uniqueDividends.values())
      .slice(0, 30)
      .map((div: any) => ({
        symbol: div.symbol,
        name: div.label || div.symbol,
        exDate: div.date || 'TBD',
        payDate: div.paymentDate || 'TBD',
        amount: div.dividend || div.adjDividend || 0,
        yield: (div.yield || 0) * 100,
        frequency: 'Quarterly',
        change: 0,
      }))
  } catch (error) {
    console.error('FMP Dividend error:', error)
    return []
  }
}

// Polygon Dividends (FREE - 5 calls/min)
async function fetchFromPolygon(apiKey: string): Promise<any[]> {
  try {
    // Get dividends for major stocks
    const symbols = ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO', 'XOM', 'VZ', 'T']
    const allDividends: any[] = []
    
    // Only fetch 5 to stay within rate limit
    for (const symbol of symbols.slice(0, 5)) {
      try {
        const response = await fetch(
          `https://api.polygon.io/v3/reference/dividends?ticker=${symbol}&limit=1&apiKey=${apiKey}`,
          { next: { revalidate: 3600 } }
        )
        
        if (!response.ok) continue
        
        const data = await response.json()
        const divs = data?.results || []
        
        if (divs.length > 0) {
          const div = divs[0]
          allDividends.push({
            symbol,
            name: symbol,
            exDate: div.ex_dividend_date || 'TBD',
            payDate: div.pay_date || 'TBD',
            amount: div.cash_amount || 0,
            yield: 0, // Would need price to calculate
            frequency: getFrequency(div.frequency),
            change: 0,
          })
        }
      } catch {
        continue
      }
    }
    
    return allDividends
  } catch (error) {
    console.error('Polygon Dividend error:', error)
    return []
  }
}

// Alpha Vantage Dividends (FREE - 25 calls/day)
async function fetchFromAlphaVantage(apiKey: string): Promise<any[]> {
  try {
    // Only fetch a few stocks to conserve API calls
    const symbols = ['AAPL', 'MSFT', 'JNJ', 'KO', 'PG']
    const allDividends: any[] = []
    
    for (const symbol of symbols.slice(0, 3)) {
      try {
        const response = await fetch(
          `https://www.alphavantage.co/query?function=DIVIDENDS&symbol=${symbol}&apikey=${apiKey}`,
          { next: { revalidate: 3600 } }
        )
        
        if (!response.ok) continue
        
        const data = await response.json()
        const divs = data?.data || []
        
        if (divs.length > 0) {
          const div = divs[0] // Most recent dividend
          allDividends.push({
            symbol,
            name: symbol,
            exDate: div.ex_dividend_date || 'TBD',
            payDate: div.payment_date || 'TBD',
            amount: parseFloat(div.amount) || 0,
            yield: 0,
            frequency: 'Quarterly',
            change: 0,
          })
        }
      } catch {
        continue
      }
    }
    
    return allDividends
  } catch (error) {
    console.error('Alpha Vantage Dividend error:', error)
    return []
  }
}

// Yahoo Finance Dividends (no API key needed)
async function fetchFromYahoo(): Promise<any[]> {
  try {
    const symbols = ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO', 'VZ', 'T', 'XOM', 'CVX', 'PFE', 'ABBV', 'MO', 'IBM', 'O']
    const allDividends: any[] = []
    
    for (const symbol of symbols) {
      try {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryDetail,calendarEvents,price`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            next: { revalidate: 3600 },
          }
        )
        
        if (!response.ok) continue
        
        const data = await response.json()
        const result = data?.quoteSummary?.result?.[0]
        const summary = result?.summaryDetail
        const calendar = result?.calendarEvents
        const price = result?.price
        
        const dividendRate = summary?.dividendRate?.raw || 0
        if (dividendRate === 0) continue
        
        allDividends.push({
          symbol,
          name: price?.shortName || symbol,
          exDate: calendar?.exDividendDate?.fmt || 'TBD',
          payDate: calendar?.dividendDate?.fmt || 'TBD',
          amount: (dividendRate / 4).toFixed(2),
          yield: ((summary?.dividendYield?.raw || 0) * 100).toFixed(2),
          frequency: 'Quarterly',
          change: 0,
        })
      } catch {
        continue
      }
    }
    
    return allDividends.sort((a, b) => {
      if (a.exDate === 'TBD') return 1
      if (b.exDate === 'TBD') return -1
      return new Date(a.exDate).getTime() - new Date(b.exDate).getTime()
    })
  } catch (error) {
    console.error('Yahoo Dividend error:', error)
    return []
  }
}

function getFrequency(freq: number): string {
  switch (freq) {
    case 1: return 'Annually'
    case 2: return 'Semi-Annual'
    case 4: return 'Quarterly'
    case 12: return 'Monthly'
    default: return 'Quarterly'
  }
}

function getSampleDividends() {
  const today = new Date()
  const formatDate = (daysFromNow: number) => {
    const date = new Date(today)
    date.setDate(date.getDate() + daysFromNow)
    return date.toISOString().split('T')[0]
  }

  return [
    { symbol: 'AAPL', name: 'Apple Inc', exDate: formatDate(5), payDate: formatDate(12), amount: 0.25, yield: 0.48, frequency: 'Quarterly', change: 4.2 },
    { symbol: 'MSFT', name: 'Microsoft Corp', exDate: formatDate(8), payDate: formatDate(22), amount: 0.83, yield: 0.71, frequency: 'Quarterly', change: 10.7 },
  ]
}
