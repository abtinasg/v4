import { NextResponse } from 'next/server'

// Dividend Calendar API - Using Yahoo Finance
export async function GET() {
  try {
    // Get dividend stocks from Yahoo Finance
    // Using screener for high dividend yield stocks
    const symbols = ['AAPL', 'MSFT', 'JNJ', 'PG', 'KO', 'VZ', 'T', 'XOM', 'CVX', 'PFE', 'ABBV', 'MO', 'IBM', 'MMM', 'CAT']
    
    const dividendPromises = symbols.map(async (symbol) => {
      try {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d&includePrePost=false`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          }
        )
        
        if (!response.ok) return null
        
        const data = await response.json()
        const quote = data?.chart?.result?.[0]?.meta
        
        // Get dividend info from quote summary
        const summaryResponse = await fetch(
          `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryDetail,calendarEvents`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          }
        )
        
        if (!summaryResponse.ok) return null
        
        const summaryData = await summaryResponse.json()
        const summary = summaryData?.quoteSummary?.result?.[0]
        const calendarEvents = summary?.calendarEvents
        const summaryDetail = summary?.summaryDetail
        
        const dividendRate = summaryDetail?.dividendRate?.raw || 0
        const dividendYield = summaryDetail?.dividendYield?.raw || 0
        const exDividendDate = calendarEvents?.exDividendDate?.fmt || null
        const dividendDate = calendarEvents?.dividendDate?.fmt || null
        
        if (!dividendRate || dividendRate === 0) return null
        
        return {
          symbol,
          name: quote?.shortName || quote?.longName || symbol,
          exDate: exDividendDate || 'TBD',
          payDate: dividendDate || 'TBD',
          amount: dividendRate / 4, // Quarterly dividend
          yield: (dividendYield * 100),
          frequency: 'Quarterly',
          change: 0, // Would need historical data to calculate
        }
      } catch (err) {
        return null
      }
    })
    
    const results = await Promise.all(dividendPromises)
    const dividends = results.filter(Boolean)
    
    // Sort by ex-date
    dividends.sort((a: any, b: any) => {
      if (a.exDate === 'TBD') return 1
      if (b.exDate === 'TBD') return -1
      return new Date(a.exDate).getTime() - new Date(b.exDate).getTime()
    })

    return NextResponse.json({ 
      success: true, 
      dividends,
      source: 'yahoo',
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
