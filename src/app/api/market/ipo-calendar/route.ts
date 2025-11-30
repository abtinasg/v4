import { NextResponse } from 'next/server'

// IPO Calendar API - Using Finnhub + Alpha Vantage (both free)
export async function GET() {
  try {
    // Calculate date range (from today to 6 months ahead)
    const today = new Date()
    const sixMonthsAgo = new Date(today)
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 1)
    const sixMonthsAhead = new Date(today)
    sixMonthsAhead.setMonth(sixMonthsAhead.getMonth() + 6)
    
    const fromDate = sixMonthsAgo.toISOString().split('T')[0]
    const toDate = sixMonthsAhead.toISOString().split('T')[0]

    // Try Finnhub first (60 calls/min free)
    const finnhubKey = process.env.FINNHUB_API_KEY
    if (finnhubKey) {
      const finnhubIPOs = await fetchFromFinnhub(fromDate, toDate, finnhubKey)
      if (finnhubIPOs.length > 0) {
        return NextResponse.json({ 
          success: true, 
          ipos: finnhubIPOs,
          source: 'finnhub',
          updatedAt: new Date().toISOString()
        })
      }
    }

    // Try Alpha Vantage (25 calls/day free)
    const alphaKey = process.env.ALPHA_VANTAGE_API_KEY
    if (alphaKey) {
      const alphaIPOs = await fetchFromAlphaVantage(alphaKey)
      if (alphaIPOs.length > 0) {
        return NextResponse.json({ 
          success: true, 
          ipos: alphaIPOs,
          source: 'alphavantage',
          updatedAt: new Date().toISOString()
        })
      }
    }

    // Try FMP (250 calls/day free)
    const fmpKey = process.env.FMP_API_KEY
    if (fmpKey) {
      const fmpIPOs = await fetchFromFMP(fromDate, toDate, fmpKey)
      if (fmpIPOs.length > 0) {
        return NextResponse.json({ 
          success: true, 
          ipos: fmpIPOs,
          source: 'fmp',
          updatedAt: new Date().toISOString()
        })
      }
    }

    // Fallback to sample data only if no API keys configured
    return NextResponse.json({ 
      success: true, 
      ipos: getSampleIPOs(),
      source: 'sample',
      message: 'Add FINNHUB_API_KEY or ALPHA_VANTAGE_API_KEY to .env for real data',
      updatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('IPO Calendar API error:', error)
    return NextResponse.json({ 
      success: false, 
      ipos: [],
      error: 'Failed to fetch IPO data'
    })
  }
}

// Finnhub IPO Calendar (FREE - 60 calls/min)
async function fetchFromFinnhub(from: string, to: string, apiKey: string): Promise<any[]> {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/calendar/ipo?from=${from}&to=${to}&token=${apiKey}`,
      { next: { revalidate: 3600 } }
    )
    
    if (!response.ok) return []
    
    const data = await response.json()
    const ipos = data?.ipoCalendar || []
    
    return ipos.map((ipo: any) => ({
      symbol: ipo.symbol || 'TBD',
      name: ipo.name || 'Unknown',
      exchange: ipo.exchange || 'NYSE',
      priceRange: ipo.price || 'TBD',
      shares: formatShares(ipo.numberOfShares),
      expectedDate: ipo.date || 'TBD',
      status: mapFinnhubStatus(ipo.status),
      industry: 'N/A',
    })).filter((ipo: any) => ipo.symbol !== 'TBD' && ipo.name !== 'Unknown')
  } catch (error) {
    console.error('Finnhub IPO error:', error)
    return []
  }
}

// Alpha Vantage IPO Calendar (FREE - 25 calls/day)
async function fetchFromAlphaVantage(apiKey: string): Promise<any[]> {
  try {
    const response = await fetch(
      `https://www.alphavantage.co/query?function=IPO_CALENDAR&apikey=${apiKey}`,
      { next: { revalidate: 3600 } }
    )
    
    if (!response.ok) return []
    
    const csvText = await response.text()
    
    // Parse CSV
    const lines = csvText.trim().split('\n')
    if (lines.length <= 1) return []
    
    const headers = lines[0].split(',')
    const ipos = lines.slice(1).map(line => {
      const values = line.split(',')
      const obj: any = {}
      headers.forEach((h, i) => obj[h.trim()] = values[i]?.trim())
      return obj
    })
    
    return ipos.map((ipo: any) => ({
      symbol: ipo.symbol || 'TBD',
      name: ipo.name || 'Unknown',
      exchange: ipo.exchange || 'NYSE',
      priceRange: ipo.priceRangeLow && ipo.priceRangeHigh 
        ? `$${ipo.priceRangeLow}-${ipo.priceRangeHigh}`
        : 'TBD',
      shares: 'N/A',
      expectedDate: ipo.ipoDate || 'TBD',
      status: 'upcoming',
      industry: 'N/A',
    })).filter((ipo: any) => ipo.symbol !== 'TBD')
  } catch (error) {
    console.error('Alpha Vantage IPO error:', error)
    return []
  }
}

// FMP IPO Calendar (FREE - 250 calls/day)
async function fetchFromFMP(from: string, to: string, apiKey: string): Promise<any[]> {
  try {
    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/ipo_calendar?from=${from}&to=${to}&apikey=${apiKey}`,
      { next: { revalidate: 3600 } }
    )
    
    if (!response.ok) return []
    
    const ipos = await response.json()
    if (!Array.isArray(ipos)) return []
    
    return ipos.map((ipo: any) => ({
      symbol: ipo.symbol || 'TBD',
      name: ipo.company || 'Unknown',
      exchange: ipo.exchange || 'NYSE',
      priceRange: ipo.priceRange || 'TBD',
      shares: formatShares(ipo.shares),
      expectedDate: ipo.date || 'TBD',
      status: 'upcoming',
      industry: 'N/A',
    })).filter((ipo: any) => ipo.symbol !== 'TBD')
  } catch (error) {
    console.error('FMP IPO error:', error)
    return []
  }
}

function mapFinnhubStatus(status: string): 'upcoming' | 'priced' | 'withdrawn' {
  switch (status?.toLowerCase()) {
    case 'priced': return 'priced'
    case 'withdrawn': return 'withdrawn'
    case 'filed':
    case 'expected':
    default: return 'upcoming'
  }
}

function formatShares(shares: number | string | undefined): string {
  if (!shares) return 'N/A'
  const num = typeof shares === 'string' ? parseFloat(shares) : shares
  if (isNaN(num)) return 'N/A'
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return num.toString()
}

function getSampleIPOs() {
  const today = new Date()
  const formatDate = (daysFromNow: number) => {
    const date = new Date(today)
    date.setDate(date.getDate() + daysFromNow)
    return date.toISOString().split('T')[0]
  }

  return [
    { symbol: 'STRP', name: 'Stripe Inc', exchange: 'NYSE', priceRange: '$70-75', shares: '55M', expectedDate: formatDate(14), status: 'upcoming', industry: 'Fintech' },
    { symbol: 'DBRX', name: 'Databricks Inc', exchange: 'NASDAQ', priceRange: '$95-105', shares: '40M', expectedDate: formatDate(21), status: 'upcoming', industry: 'AI/Data' },
  ]
}
