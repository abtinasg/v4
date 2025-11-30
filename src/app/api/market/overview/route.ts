import { NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

const yahooFinance = new YahooFinance()

export interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  previousClose: number
}

// Fallback data when Yahoo Finance fails
const FALLBACK_INDICES: MarketIndex[] = [
  { symbol: '^GSPC', name: 'S&P 500', price: 6032.38, change: 33.64, changePercent: 0.56, previousClose: 5998.74 },
  { symbol: '^DJI', name: 'Dow Jones', price: 44910.65, change: 188.59, changePercent: 0.42, previousClose: 44722.06 },
  { symbol: '^IXIC', name: 'NASDAQ', price: 19218.17, change: 157.69, changePercent: 0.83, previousClose: 19060.48 },
  { symbol: '^RUT', name: 'Russell 2000', price: 2434.72, change: 21.45, changePercent: 0.89, previousClose: 2413.27 },
  { symbol: '^VIX', name: 'VIX', price: 13.51, change: -0.59, changePercent: -4.18, previousClose: 14.10 },
  { symbol: 'TLT', name: 'TLT', price: 87.92, change: 0.34, changePercent: 0.39, previousClose: 87.58 },
  { symbol: 'HYG', name: 'HYG', price: 79.85, change: 0.12, changePercent: 0.15, previousClose: 79.73 },
]

// Major market indices symbols
const INDICES = [
  { symbol: '^GSPC', name: 'S&P 500' },
  { symbol: '^DJI', name: 'Dow Jones' },
  { symbol: '^IXIC', name: 'NASDAQ' },
  { symbol: '^RUT', name: 'Russell 2000' },
  { symbol: '^VIX', name: 'VIX' },
  { symbol: 'TLT', name: 'TLT' },
  { symbol: 'HYG', name: 'HYG' },
]

export async function GET() {
  try {
    const indicesData = await Promise.all(
      INDICES.map(async (index) => {
        try {
          const quote = await yahooFinance.quote(index.symbol)
          return {
            symbol: index.symbol,
            name: index.name,
            price: quote.regularMarketPrice || 0,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
            previousClose: quote.regularMarketPreviousClose || 0,
          }
        } catch (error) {
          console.error(`Error fetching ${index.symbol}:`, error)
          return null
        }
      })
    )

    // Filter out any failed requests
    const validIndices = indicesData.filter((i): i is MarketIndex => i !== null)

    // Get market status
    const now = new Date()
    const nyTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }))
    const hours = nyTime.getHours()
    const minutes = nyTime.getMinutes()
    const day = nyTime.getDay()
    
    // Market is open Mon-Fri, 9:30 AM - 4:00 PM ET
    const isWeekday = day >= 1 && day <= 5
    const currentMinutes = hours * 60 + minutes
    const marketOpenMinutes = 9 * 60 + 30 // 9:30 AM
    const marketCloseMinutes = 16 * 60 // 4:00 PM
    
    const isMarketOpen = isWeekday && 
      currentMinutes >= marketOpenMinutes && 
      currentMinutes < marketCloseMinutes

    let marketStatus = 'closed'
    let nextChange = ''
    
    if (isMarketOpen) {
      marketStatus = 'open'
      const minutesUntilClose = marketCloseMinutes - currentMinutes
      const hoursLeft = Math.floor(minutesUntilClose / 60)
      const minsLeft = minutesUntilClose % 60
      nextChange = `Closes in ${hoursLeft}h ${minsLeft}m`
    } else {
      // Calculate time until next open
      let daysUntilOpen = 0
      if (day === 0) daysUntilOpen = 1 // Sunday
      else if (day === 6) daysUntilOpen = 2 // Saturday
      else if (currentMinutes >= marketCloseMinutes) daysUntilOpen = 1
      
      if (daysUntilOpen === 0 && currentMinutes < marketOpenMinutes) {
        const minutesUntilOpen = marketOpenMinutes - currentMinutes
        const hoursLeft = Math.floor(minutesUntilOpen / 60)
        const minsLeft = minutesUntilOpen % 60
        nextChange = `Opens in ${hoursLeft}h ${minsLeft}m`
      } else {
        nextChange = `Opens in ${daysUntilOpen} day${daysUntilOpen > 1 ? 's' : ''}`
      }
    }

    return NextResponse.json({
      indices: validIndices,
      marketStatus: {
        status: marketStatus,
        nextChange,
        timestamp: now.toISOString(),
      },
    })
  } catch (error) {
    console.error('Error fetching market overview:', error)
    
    // Return fallback data instead of error
    const now = new Date()
    return NextResponse.json({
      indices: FALLBACK_INDICES,
      marketStatus: {
        status: 'unknown',
        nextChange: 'Data unavailable',
        timestamp: now.toISOString(),
      },
      cached: true,
      warning: 'Using cached data due to API error',
    })
  }
}
