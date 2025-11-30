import { NextResponse } from 'next/server'

// IPO Calendar API - Using Yahoo Finance
export async function GET() {
  try {
    // Yahoo Finance IPO Calendar endpoint
    const response = await fetch(
      'https://query1.finance.yahoo.com/v1/finance/ipoCalendar?lang=en-US&region=US',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    )

    if (!response.ok) {
      // Fallback to screener-based approach
      const screenerResponse = await fetch(
        'https://query2.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=true&lang=en-US&region=US&scrIds=most_actives&count=25',
        {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        }
      )
      
      if (!screenerResponse.ok) {
        throw new Error('Failed to fetch IPO data')
      }
    }

    const data = await response.json()
    
    // Transform Yahoo Finance IPO data
    const ipos = (data?.ipoCalendar?.rows || []).map((ipo: any) => ({
      symbol: ipo.ticker || ipo.symbol || 'N/A',
      name: ipo.companyName || ipo.name || 'Unknown',
      exchange: ipo.exchange || 'NYSE',
      priceRange: ipo.priceRange || `$${ipo.priceLow || '?'}-${ipo.priceHigh || '?'}`,
      shares: formatShares(ipo.sharesOffered || ipo.shares),
      expectedDate: ipo.date || ipo.expectedDate || 'TBD',
      status: getIPOStatus(ipo),
      industry: ipo.industry || ipo.sector || 'Technology',
    }))

    return NextResponse.json({ 
      success: true, 
      ipos,
      source: 'yahoo',
      updatedAt: new Date().toISOString()
    })

  } catch (error) {
    console.error('IPO Calendar API error:', error)
    
    // Return empty array on error (frontend will show "no data")
    return NextResponse.json({ 
      success: false, 
      ipos: [],
      error: 'Failed to fetch IPO data',
      source: 'error'
    })
  }
}

function formatShares(shares: number | string | undefined): string {
  if (!shares) return 'N/A'
  const num = typeof shares === 'string' ? parseFloat(shares) : shares
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(0)}K`
  return num.toString()
}

function getIPOStatus(ipo: any): 'upcoming' | 'priced' | 'withdrawn' {
  if (ipo.status === 'priced' || ipo.dealStatus === 'priced') return 'priced'
  if (ipo.status === 'withdrawn' || ipo.dealStatus === 'withdrawn') return 'withdrawn'
  return 'upcoming'
}
