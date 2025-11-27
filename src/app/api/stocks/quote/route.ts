import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Mock stock data - replace with real API calls
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const symbol = searchParams.get('symbol')

  if (!symbol) {
    return NextResponse.json(
      { error: 'Symbol parameter is required' },
      { status: 400 }
    )
  }

  // Mock data - integrate with Alpha Vantage, Polygon.io, etc.
  const stockData = {
    symbol: symbol.toUpperCase(),
    name: 'Company Name',
    price: 150.25,
    change: 2.45,
    changePercent: 1.66,
    volume: 1234567,
    marketCap: 50000000000,
    high: 152.50,
    low: 148.75,
    open: 149.00,
    previousClose: 147.80,
  }

  return NextResponse.json(stockData)
}
