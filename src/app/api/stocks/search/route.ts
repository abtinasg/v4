import { NextRequest, NextResponse } from 'next/server'
import { searchStocks } from '@/lib/api/yahoo-finance'

// Force Node.js runtime and dynamic rendering
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q')
    
    if (!query || query.length < 1) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Search query is required (use ?q=AAPL)',
          timestamp: Date.now()
        },
        { status: 400 }
      )
    }

    const limitParam = searchParams.get('limit')
    const limitValue = limitParam ? parseInt(limitParam, 10) : undefined
    const limit = limitValue && !Number.isNaN(limitValue) ? limitValue : undefined

    const result = await searchStocks(query, { limit })
    
    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Search failed',
          timestamp: Date.now()
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: result.data,
      query,
      count: result.data?.length || 0,
      limit: limit ?? undefined,
      cached: result.cached,
      timestamp: Date.now(),
    })
  } catch (error) {
    console.error('Search API error:', error)
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
