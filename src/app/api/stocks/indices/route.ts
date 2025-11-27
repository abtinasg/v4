import { NextResponse } from 'next/server'
import { getMarketIndices } from '@/lib/api/yahoo-finance'

export async function GET() {
  try {
    const result = await getMarketIndices()
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to fetch market indices',
          timestamp: Date.now()
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      cached: result.cached,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Indices API error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        timestamp: Date.now()
      },
      { status: 500 }
    )
  }
}
