import { NextRequest, NextResponse } from 'next/server'
import * as FMP from '@/lib/data/fmp'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const symbol = request.nextUrl.searchParams.get('symbol') || 'AAPL'
  
  const results: Record<string, unknown> = {
    symbol,
    timestamp: new Date().toISOString(),
    fmpApiKey: process.env.FMP_API_KEY ? 'set' : 'not set',
  }

  // Test FMP directly
  try {
    console.log(`[Debug] Testing FMP for ${symbol}...`)
    const fmpQuote = await FMP.getQuote(symbol)
    results.fmp = fmpQuote ? {
      price: fmpQuote.price,
      change: fmpQuote.change,
      volume: fmpQuote.volume,
      source: 'FMP'
    } : 'null response'
  } catch (error) {
    results.fmp = `Error: ${error instanceof Error ? error.message : 'Unknown'}`
  }

  // Test raw FMP fetch
  try {
    const url = `https://financialmodelingprep.com/stable/quote?symbol=${symbol}&apikey=${process.env.FMP_API_KEY}`
    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json()
    results.fmpRaw = data?.[0] ? {
      price: data[0].price,
      change: data[0].change,
      status: res.status
    } : data
  } catch (error) {
    results.fmpRaw = `Error: ${error instanceof Error ? error.message : 'Unknown'}`
  }

  return NextResponse.json(results)
}
