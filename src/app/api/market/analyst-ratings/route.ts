import { NextResponse } from 'next/server'

// Analyst Ratings API - Using Yahoo Finance
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const symbols = searchParams.get('symbols')?.split(',') || ['AAPL', 'MSFT', 'GOOGL', 'NVDA', 'TSLA', 'META', 'AMZN', 'AMD']
  
  try {
    const ratingsPromises = symbols.slice(0, 15).map(async (symbol) => {
      try {
        const response = await fetch(
          `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=recommendationTrend,upgradeDowngradeHistory,financialData`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          }
        )

        if (!response.ok) return null

        const data = await response.json()
        const result = data?.quoteSummary?.result?.[0]
        const history = result?.upgradeDowngradeHistory?.history || []
        const financialData = result?.financialData
        
        // Get company name
        const quoteResponse = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
          }
        )
        const quoteData = await quoteResponse.json()
        const companyName = quoteData?.chart?.result?.[0]?.meta?.shortName || symbol
        const currentPrice = quoteData?.chart?.result?.[0]?.meta?.regularMarketPrice

        // Get recent rating changes
        const recentRatings = history.slice(0, 3).map((rating: any) => ({
          symbol,
          name: companyName,
          firm: rating.firm || 'Unknown Firm',
          analyst: '',
          action: getAction(rating.action),
          fromRating: rating.fromGrade || '-',
          toRating: rating.toGrade || '-',
          fromTarget: null,
          toTarget: financialData?.targetMeanPrice?.raw || null,
          date: formatEpochDate(rating.epochGradeDate),
        }))

        return recentRatings
      } catch (err) {
        return null
      }
    })

    const results = await Promise.all(ratingsPromises)
    const allRatings = results.flat().filter(Boolean)
    
    // Sort by date (most recent first)
    allRatings.sort((a: any, b: any) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    })

    return NextResponse.json({ 
      success: true, 
      ratings: allRatings.slice(0, 25),
      source: 'yahoo',
      updatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('Analyst Ratings API error:', error)
    return NextResponse.json({ 
      success: false, 
      ratings: [],
      error: 'Failed to fetch analyst data'
    })
  }
}

function getAction(action: string): 'upgrade' | 'downgrade' | 'initiated' | 'reiterated' {
  const lower = (action || '').toLowerCase()
  if (lower.includes('up')) return 'upgrade'
  if (lower.includes('down')) return 'downgrade'
  if (lower.includes('init')) return 'initiated'
  return 'reiterated'
}

function formatEpochDate(epoch: number): string {
  if (!epoch) return 'N/A'
  const date = new Date(epoch * 1000)
  return date.toISOString().split('T')[0]
}
