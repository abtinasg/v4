/**
 * Portfolio Holding API Route
 * 
 * GET - Get single holding details
 * PUT - Update holding (quantity, avgBuyPrice)
 * DELETE - Remove holding from portfolio
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import YahooFinance from 'yahoo-finance2'
import { db } from '@/lib/db'
import { portfolioHoldings } from '@/lib/db/schema'
import { userQueries, portfolioHoldingsQueries } from '@/lib/db/queries'
import { eq, and } from 'drizzle-orm'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const yahooFinance = new YahooFinance()

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
    }
  } catch (error) {
    console.error(`Error fetching price for ${symbol}:`, error)
    return null
  }
}

// GET - Get single holding with real-time price
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const user = await userQueries.getByClerkId(clerkId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get holding from database
    const holding = await db.query.portfolioHoldings.findFirst({
      where: and(
        eq(portfolioHoldings.id, id),
        eq(portfolioHoldings.userId, user.id)
      ),
    })

    if (!holding) {
      return NextResponse.json(
        { error: 'Holding not found' },
        { status: 404 }
      )
    }

    // Fetch real-time price
    const priceData = await fetchRealTimePrice(holding.symbol)
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

    return NextResponse.json({
      holding: {
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
        lastUpdated: holding.lastUpdated,
      },
    })
  } catch (error) {
    console.error('Portfolio GET [id] error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch holding' },
      { status: 500 }
    )
  }
}

// PUT - Update holding
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const user = await userQueries.getByClerkId(clerkId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify holding belongs to user
    const existingHolding = await db.query.portfolioHoldings.findFirst({
      where: and(
        eq(portfolioHoldings.id, id),
        eq(portfolioHoldings.userId, user.id)
      ),
    })

    if (!existingHolding) {
      return NextResponse.json(
        { error: 'Holding not found' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { quantity, avgBuyPrice } = body

    // Validate inputs
    const updates: Record<string, string> = {}

    if (quantity !== undefined) {
      const parsedQuantity = parseFloat(quantity)
      if (isNaN(parsedQuantity) || parsedQuantity <= 0) {
        return NextResponse.json(
          { error: 'Invalid quantity' },
          { status: 400 }
        )
      }
      updates.quantity = parsedQuantity.toFixed(4)
    }

    if (avgBuyPrice !== undefined) {
      const parsedPrice = parseFloat(avgBuyPrice)
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return NextResponse.json(
          { error: 'Invalid average buy price' },
          { status: 400 }
        )
      }
      updates.avgBuyPrice = parsedPrice.toFixed(2)
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update' },
        { status: 400 }
      )
    }

    // Fetch current price to update current value
    const priceData = await fetchRealTimePrice(existingHolding.symbol)
    const newQuantity = updates.quantity ? parseFloat(updates.quantity) : parseFloat(existingHolding.quantity)
    const currentPrice = priceData?.price || parseFloat(existingHolding.avgBuyPrice)
    updates.currentValue = (newQuantity * currentPrice).toFixed(2)

    // Update holding
    const [updated] = await db
      .update(portfolioHoldings)
      .set({
        ...updates,
        lastUpdated: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(portfolioHoldings.id, id))
      .returning()

    return NextResponse.json({
      success: true,
      holding: updated,
      message: 'Holding updated successfully',
    })
  } catch (error) {
    console.error('Portfolio PUT [id] error:', error)
    return NextResponse.json(
      { error: 'Failed to update holding' },
      { status: 500 }
    )
  }
}

// DELETE - Remove holding
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id } = await params

    const user = await userQueries.getByClerkId(clerkId)
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Verify holding belongs to user
    const existingHolding = await db.query.portfolioHoldings.findFirst({
      where: and(
        eq(portfolioHoldings.id, id),
        eq(portfolioHoldings.userId, user.id)
      ),
    })

    if (!existingHolding) {
      return NextResponse.json(
        { error: 'Holding not found' },
        { status: 404 }
      )
    }

    // Delete holding
    await portfolioHoldingsQueries.delete(id)

    return NextResponse.json({
      success: true,
      message: 'Holding removed successfully',
    })
  } catch (error) {
    console.error('Portfolio DELETE [id] error:', error)
    return NextResponse.json(
      { error: 'Failed to delete holding' },
      { status: 500 }
    )
  }
}
