import { NextResponse } from 'next/server'

// Stock Chart Data API - Using Polygon (free tier) or Alpha Vantage
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'AAPL'
  const timeframe = searchParams.get('timeframe') || '1D'
  
  try {
    // Calculate date range based on timeframe
    const now = new Date()
    let fromDate: Date
    let multiplier = 1
    let timespan = 'minute'
    
    switch (timeframe) {
      case '1D':
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        multiplier = 5
        timespan = 'minute'
        break
      case '1W':
        fromDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        multiplier = 30
        timespan = 'minute'
        break
      case '1M':
        fromDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        multiplier = 1
        timespan = 'day'
        break
      case '3M':
        fromDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
        multiplier = 1
        timespan = 'day'
        break
      case '1Y':
        fromDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
        multiplier = 1
        timespan = 'day'
        break
      case '5Y':
        fromDate = new Date(now.getTime() - 5 * 365 * 24 * 60 * 60 * 1000)
        multiplier = 1
        timespan = 'week'
        break
      default:
        fromDate = new Date(now.getTime() - 24 * 60 * 60 * 1000)
        multiplier = 5
        timespan = 'minute'
    }
    
    const fromStr = fromDate.toISOString().split('T')[0]
    const toStr = now.toISOString().split('T')[0]
    
    // Try Polygon first (free tier: 5 API calls/minute)
    const polygonKey = process.env.POLYGON_API_KEY
    
    if (polygonKey) {
      const polygonUrl = `https://api.polygon.io/v2/aggs/ticker/${symbol}/range/${multiplier}/${timespan}/${fromStr}/${toStr}?adjusted=true&sort=asc&apiKey=${polygonKey}`
      
      const response = await fetch(polygonUrl, {
        next: { revalidate: 60 }, // Cache for 1 minute
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.results && data.results.length > 0) {
          const chartData = data.results.map((bar: any) => ({
            date: new Date(bar.t).toISOString(),
            open: bar.o,
            high: bar.h,
            low: bar.l,
            close: bar.c,
            volume: bar.v,
          }))
          
          return NextResponse.json({
            success: true,
            symbol,
            timeframe,
            data: chartData,
            source: 'polygon',
            updatedAt: new Date().toISOString()
          })
        }
      }
    }
    
    // Fallback to Alpha Vantage
    const alphaKey = process.env.ALPHA_VANTAGE_API_KEY
    
    if (alphaKey) {
      let alphaFunction = 'TIME_SERIES_INTRADAY'
      let alphaInterval = '5min'
      
      if (timeframe === '1M' || timeframe === '3M') {
        alphaFunction = 'TIME_SERIES_DAILY'
      } else if (timeframe === '1Y' || timeframe === '5Y') {
        alphaFunction = 'TIME_SERIES_WEEKLY'
      }
      
      const alphaUrl = alphaFunction === 'TIME_SERIES_INTRADAY'
        ? `https://www.alphavantage.co/query?function=${alphaFunction}&symbol=${symbol}&interval=${alphaInterval}&apikey=${alphaKey}`
        : `https://www.alphavantage.co/query?function=${alphaFunction}&symbol=${symbol}&apikey=${alphaKey}`
      
      const response = await fetch(alphaUrl, {
        next: { revalidate: 60 },
      })
      
      if (response.ok) {
        const data = await response.json()
        const timeSeries = data['Time Series (5min)'] || data['Time Series (Daily)'] || data['Weekly Time Series'] || {}
        
        const chartData = Object.entries(timeSeries)
          .slice(0, 100)
          .map(([date, values]: [string, any]) => ({
            date: new Date(date).toISOString(),
            open: parseFloat(values['1. open']),
            high: parseFloat(values['2. high']),
            low: parseFloat(values['3. low']),
            close: parseFloat(values['4. close']),
            volume: parseInt(values['5. volume']),
          }))
          .reverse()
        
        return NextResponse.json({
          success: true,
          symbol,
          timeframe,
          data: chartData,
          source: 'alphavantage',
          updatedAt: new Date().toISOString()
        })
      }
    }
    
    // Final fallback to Yahoo Finance
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${timespan === 'minute' ? '5m' : '1d'}&range=${timeframe.toLowerCase()}`
    
    const yahooResponse = await fetch(yahooUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    })
    
    if (yahooResponse.ok) {
      const yahooData = await yahooResponse.json()
      const result = yahooData?.chart?.result?.[0]
      const timestamps = result?.timestamp || []
      const quotes = result?.indicators?.quote?.[0] || {}
      
      const chartData = timestamps.map((ts: number, i: number) => ({
        date: new Date(ts * 1000).toISOString(),
        open: quotes.open?.[i] || 0,
        high: quotes.high?.[i] || 0,
        low: quotes.low?.[i] || 0,
        close: quotes.close?.[i] || 0,
        volume: quotes.volume?.[i] || 0,
      })).filter((d: any) => d.close > 0)
      
      return NextResponse.json({
        success: true,
        symbol,
        timeframe,
        data: chartData,
        source: 'yahoo',
        updatedAt: new Date().toISOString()
      })
    }
    
    throw new Error('All data sources failed')

  } catch (error) {
    console.error('Chart Data API error:', error)
    return NextResponse.json({ 
      success: false, 
      data: [],
      error: 'Failed to fetch chart data'
    })
  }
}
