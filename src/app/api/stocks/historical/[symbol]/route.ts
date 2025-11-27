import { NextRequest, NextResponse } from 'next/server'
import { getHistoricalData } from '@/lib/api/yahoo-finance'

// Force Node.js runtime for yahoo-finance2 compatibility
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const symbol = params.symbol?.toUpperCase()
    
    if (!symbol) {
      return NextResponse.json(
        { success: false, error: 'Symbol is required' },
        { status: 400 }
      )
    }

    const searchParams = request.nextUrl.searchParams
    const interval = (searchParams.get('interval') || '1d') as '1d' | '1wk' | '1mo' | '1h' | '5m' | '15m' | '30m'
    const range = (searchParams.get('range') || '1mo') as '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | 'max'

    const result = await getHistoricalData(symbol, { interval, range })
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to fetch historical data',
          timestamp: Date.now()
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      cached: result.cached,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Historical API error:', error)
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
