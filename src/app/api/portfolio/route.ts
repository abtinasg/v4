/**
 * Portfolio API Route
 * 
 * GET - Get user's portfolio holdings with real-time prices
 * POST - Add a new holding to portfolio
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import YahooFinance from 'yahoo-finance2'
import { db } from '@/lib/db'
import { portfolioHoldings } from '@/lib/db/schema'
import { userQueries, portfolioHoldingsQueries } from '@/lib/db/queries'
import { eq } from 'drizzle-orm'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const yahooFinance = new YahooFinance()

// Types
interface HoldingWithPrice {
  id: string
  symbol: string
  quantity: number
  avgBuyPrice: number
  currentPrice: number
  previousClose: number
  change: number
  changePercent: number
  totalValue: number
  totalCost: number
  gainLoss: number
  gainLossPercent: number
  dayGainLoss: number
  dayGainLossPercent: number
  marketCap?: number
  pe?: number
  name?: string
  lastUpdated: Date
}

interface PortfolioSummary {
  totalValue: number
  totalCost: number
  totalGainLoss: number
  totalGainLossPercent: number
  dayGainLoss: number
  dayGainLossPercent: number
  holdingsCount: number
}

// Fetch real-time price for a symbol
async function fetchRealTimePrice(symbol: string) {
  try {
    const quote = await yahooFinance.quote(symbol)
    return {
      symbol: quote.symbol || symbol,
      name: quote.shortName || quote.longName || symbol,
      price: quote.regularMarketPrice || 0,
      previousClose: quote.regularMarketPreviousClose || quote.regularMarketPrice || 0,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      marketCap: quote.marketCap,
      pe: quote.trailingPE,
    }
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error)
    return null
  }
}

// GET - Get portfolio with real-time prices
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user from database
    const user = await userQueries.getByClerkId(clerkId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get holdings from database
    const holdings = await portfolioHoldingsQueries.getByUserId(user.id)

    if (holdings.length === 0) {
      return NextResponse.json({
        holdings: [],
        summary: {
          totalValue: 0,
          totalCost: 0,
          totalGainLoss: 0,
          totalGainLossPercent: 0,
          dayGainLoss: 0,
          dayGainLossPercent: 0,
          holdingsCount: 0,
        },
      })
    }

    // Fetch real-time prices for all holdings
    const pricePromises = holdings.map(h => fetchRealTimePrice(h.symbol))
    const prices = await Promise.all(pricePromises)

    // Calculate holdings with prices
    const holdingsWithPrices: HoldingWithPrice[] = holdings.map((holding, index) => {
      const priceData = prices[index]
      const quantity = parseFloat(holding.quantity)
      const avgBuyPrice = parseFloat(holding.avgBuyPrice)
      const currentPrice = priceData?.price || avgBuyPrice
      const previousClose = priceData?.previousClose || currentPrice

      const totalValue = quantity * currentPrice
      const totalCost = quantity * avgBuyPrice
      const gainLoss = totalValue - totalCost
      const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0

      const dayGainLoss = quantity * (currentPrice - previousClose)
      const dayGainLossPercent = previousClose > 0 ? ((currentPrice - previousClose) / previousClose) * 100 : 0

      return {
        id: holding.id,
        symbol: holding.symbol,
        name: priceData?.name || holding.symbol,
        quantity,
        avgBuyPrice,
        currentPrice,
        previousClose,
        change: priceData?.change || 0,
        changePercent: priceData?.changePercent || 0,
        totalValue,
        totalCost,
        gainLoss,
        gainLossPercent,
        dayGainLoss,
        dayGainLossPercent,
        marketCap: priceData?.marketCap,
        pe: priceData?.pe,
        lastUpdated: holding.lastUpdated,
      }
    })

    // Calculate portfolio summary
    const totalValue = holdingsWithPrices.reduce((sum, h) => sum + h.totalValue, 0)
    const totalCost = holdingsWithPrices.reduce((sum, h) => sum + h.totalCost, 0)
    const totalGainLoss = totalValue - totalCost
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0
    const dayGainLoss = holdingsWithPrices.reduce((sum, h) => sum + h.dayGainLoss, 0)
    const previousTotalValue = holdingsWithPrices.reduce((sum, h) => sum + (h.quantity * h.previousClose), 0)
    const dayGainLossPercent = previousTotalValue > 0 ? (dayGainLoss / previousTotalValue) * 100 : 0

    const summary: PortfolioSummary = {
      totalValue,
      totalCost,
      totalGainLoss,
      totalGainLossPercent,
      dayGainLoss,
      dayGainLossPercent,
      holdingsCount: holdings.length,
    }

    // Update current values in database (fire and forget)
    Promise.all(
      holdingsWithPrices.map(h => 
        portfolioHoldingsQueries.updateCurrentValue(h.id, h.totalValue.toFixed(2))
      )
    ).catch(console.error)

    return NextResponse.json({
      holdings: holdingsWithPrices,
      summary,
    })
  } catch (error) {
    console.error('Portfolio GET error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch portfolio' },
      { status: 500 }
    )
  }
}

// POST - Add new holding
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await userQueries.getByClerkId(clerkId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { symbol, quantity, avgBuyPrice } = body

    // Validate input
    if (!symbol || !quantity || !avgBuyPrice) {
      return NextResponse.json(
        { error: 'Missing required fields: symbol, quantity, avgBuyPrice' },
        { status: 400 }
      )
    }

    const parsedQuantity = parseFloat(quantity)
    const parsedPrice = parseFloat(avgBuyPrice)

    if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
      return NextResponse.json(
        { error: 'Invalid quantity' },
        { status: 400 }
      )
    }

    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      return NextResponse.json(
        { error: 'Invalid average buy price' },
        { status: 400 }
      )
    }

    // Verify symbol exists via Yahoo Finance
    const priceData = await fetchRealTimePrice(symbol.toUpperCase())
    if (!priceData || priceData.price === 0) {
      return NextResponse.json(
        { error: 'Invalid stock symbol' },
        { status: 400 }
      )
    }

    // Check if holding already exists
    const existingHolding = await portfolioHoldingsQueries.getByUserAndSymbol(
      user.id,
      symbol.toUpperCase()
    )

    if (existingHolding) {
      // Update existing holding - calculate new average price
      const existingQty = parseFloat(existingHolding.quantity)
      const existingAvgPrice = parseFloat(existingHolding.avgBuyPrice)
      
      const newTotalQty = existingQty + parsedQuantity
      const newAvgPrice = ((existingQty * existingAvgPrice) + (parsedQuantity * parsedPrice)) / newTotalQty

      const holding = await portfolioHoldingsQueries.upsert(
        user.id,
        symbol.toUpperCase(),
        {
          quantity: newTotalQty.toFixed(4),
          avgBuyPrice: newAvgPrice.toFixed(2),
          currentValue: (newTotalQty * priceData.price).toFixed(2),
        }
      )

      return NextResponse.json({
        success: true,
        holding,
        message: 'Holding updated - added to existing position',
      })
    }

    // Create new holding
    const holding = await portfolioHoldingsQueries.upsert(
      user.id,
      symbol.toUpperCase(),
      {
        quantity: parsedQuantity.toFixed(4),
        avgBuyPrice: parsedPrice.toFixed(2),
        currentValue: (parsedQuantity * priceData.price).toFixed(2),
      }
    )

    return NextResponse.json({
      success: true,
      holding,
      message: 'Holding added successfully',
    })
  } catch (error) {
    console.error('Portfolio POST error:', error)
    return NextResponse.json(
      { error: 'Failed to add holding' },
      { status: 500 }
    )
  }
}
