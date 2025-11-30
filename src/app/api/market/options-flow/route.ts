import { NextResponse } from 'next/server'

// Options Flow API - Using Yahoo Finance
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbol = searchParams.get('symbol') || 'SPY'
  
  try {
    // Get options chain from Yahoo Finance
    const response = await fetch(
      `https://query1.finance.yahoo.com/v7/finance/options/${symbol}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    )

    if (!response.ok) {
      throw new Error('Failed to fetch options data')
    }

    const data = await response.json()
    const result = data?.optionChain?.result?.[0]
    const quote = result?.quote
    const options = result?.options?.[0]
    
    if (!options) {
      return NextResponse.json({ 
        success: false, 
        flows: [],
        error: 'No options data available'
      })
    }

    const calls = options.calls || []
    const puts = options.puts || []
    const expirationDate = new Date(options.expirationDate * 1000).toISOString().split('T')[0]
    
    // Get high volume options (unusual activity)
    const allOptions = [
      ...calls.map((c: any) => ({ ...c, type: 'call' })),
      ...puts.map((p: any) => ({ ...p, type: 'put' })),
    ]
    
    // Sort by volume and get top options
    allOptions.sort((a: any, b: any) => (b.volume || 0) - (a.volume || 0))
    
    const flows = allOptions.slice(0, 20).map((opt: any) => {
      const premium = (opt.lastPrice || 0) * (opt.volume || 0) * 100
      const isUnusual = (opt.volume || 0) > (opt.openInterest || 1) * 0.5
      
      return {
        symbol,
        name: quote?.shortName || symbol,
        type: opt.type as 'call' | 'put',
        strike: opt.strike || 0,
        expiry: expirationDate,
        premium: premium,
        volume: opt.volume || 0,
        openInterest: opt.openInterest || 0,
        sentiment: opt.type === 'call' ? 'bullish' : 'bearish',
        unusual: isUnusual,
        time: new Date().toLocaleTimeString('en-US', { hour12: false }),
        bid: opt.bid || 0,
        ask: opt.ask || 0,
        impliedVolatility: (opt.impliedVolatility || 0) * 100,
      }
    })

    return NextResponse.json({ 
      success: true, 
      flows,
      quote: {
        symbol,
        price: quote?.regularMarketPrice,
        change: quote?.regularMarketChange,
        changePercent: quote?.regularMarketChangePercent,
      },
      source: 'yahoo',
      updatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Options Flow API error:', error)
    return NextResponse.json({ 
      success: false, 
      flows: [],
      error: 'Failed to fetch options data'
    })
  }
}
