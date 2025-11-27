import { NextResponse } from 'next/server'
import YahooFinance from 'yahoo-finance2'

const yahooFinance = new YahooFinance()

export interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  previousClose: number
}

// Major market indices symbols
const INDICES = [
  { symbol: '^GSPC', name: 'S&P 500' },
  { symbol: '^DJI', name: 'Dow Jones' },
  { symbol: '^IXIC', name: 'NASDAQ' },
  { symbol: '^RUT', name: 'Russell 2000' },
  { symbol: '^VIX', name: 'VIX' },
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
    return NextResponse.json(
      { error: 'Failed to fetch market data' },
      { status: 500 }
    )
  }
}
