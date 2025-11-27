import { NextResponse } from 'next/server'

const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3'

function getApiKey(): string {
  const apiKey = process.env.FMP_API_KEY
  if (!apiKey) {
    throw new Error('FMP_API_KEY environment variable is not set')
  }
  return apiKey
}

interface SectorPerformance {
  sector: string
  changesPercentage: string
}

export async function GET() {
  try {
    const apiKey = getApiKey()
    const url = `${FMP_BASE_URL}/sector-performance?apikey=${apiKey}`
    
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status}`)
    }

    const data: SectorPerformance[] = await response.json()

    // Map to a cleaner format
    const sectors = data.map((item) => ({
      name: item.sector,
      change: parseFloat(item.changesPercentage.replace('%', '')),
    }))

    return NextResponse.json({
      success: true,
      sectors,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching sector performance:', error)
    
    // Return mock data on error
    return NextResponse.json({
      success: true,
      sectors: [
        { name: 'Technology', change: 1.82 },
        { name: 'Healthcare', change: 0.45 },
        { name: 'Financial Services', change: 0.89 },
        { name: 'Consumer Cyclical', change: 1.23 },
        { name: 'Industrials', change: 0.67 },
        { name: 'Energy', change: -1.45 },
        { name: 'Basic Materials', change: -0.32 },
        { name: 'Utilities', change: -0.78 },
        { name: 'Real Estate', change: -0.56 },
        { name: 'Communication Services', change: 2.15 },
      ],
      lastUpdated: new Date().toISOString(),
      mock: true,
    })
  }
}

export const revalidate = 300 // 5 minutes
