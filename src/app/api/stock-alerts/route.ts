/**
 * Stock Alerts API
 * 
 * GET: Get user's alerts
 * POST: Create new alert
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { stockAlerts, users } from '@/lib/db/schema'
import { eq, and, desc } from 'drizzle-orm'

// Get user's alerts
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    // Get query params
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'
    const symbol = searchParams.get('symbol')
    
    // Build where clause
    let whereClause = eq(stockAlerts.userId, user.id)
    
    if (activeOnly) {
      whereClause = and(whereClause, eq(stockAlerts.isActive, true))!
    }
    
    if (symbol) {
      whereClause = and(whereClause, eq(stockAlerts.symbol, symbol.toUpperCase()))!
    }
    
    // Fetch alerts
    const alerts = await db.query.stockAlerts.findMany({
      where: whereClause,
      orderBy: [desc(stockAlerts.createdAt)],
    })
    
    return NextResponse.json({ alerts })
    
  } catch (error) {
    console.error('Get alerts error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}

// Create new alert
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth()
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    // Get user
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    })
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }
    
    const body = await request.json()
    const { symbol, condition, targetPrice } = body
    
    // Validate input
    if (!symbol || typeof symbol !== 'string') {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      )
    }
    
    if (!condition || !['above', 'below', 'crosses_above', 'crosses_below'].includes(condition)) {
      return NextResponse.json(
        { error: 'Valid condition is required (above, below, crosses_above, crosses_below)' },
        { status: 400 }
      )
    }
    
    if (!targetPrice || isNaN(parseFloat(targetPrice))) {
      return NextResponse.json(
        { error: 'Valid target price is required' },
        { status: 400 }
      )
    }
    
    // Check alert limit (max 20 active alerts per user)
    const activeCount = await db.query.stockAlerts.findMany({
      where: and(
        eq(stockAlerts.userId, user.id),
        eq(stockAlerts.isActive, true)
      ),
    })
    
    if (activeCount.length >= 20) {
      return NextResponse.json(
        { error: 'Maximum 20 active alerts allowed. Please delete some alerts first.' },
        { status: 400 }
      )
    }
    
    // Create alert
    const [alert] = await db
      .insert(stockAlerts)
      .values({
        userId: user.id,
        symbol: symbol.toUpperCase(),
        condition,
        targetPrice: targetPrice.toString(),
        isActive: true,
      })
      .returning()
    
    return NextResponse.json({ 
      success: true,
      alert,
      message: `Alert created for ${symbol.toUpperCase()} when price goes ${condition} $${parseFloat(targetPrice).toFixed(2)}`
    })
    
  } catch (error) {
    console.error('Create alert error:', error)
    return NextResponse.json(
      { error: 'Failed to create alert' },
      { status: 500 }
    )
  }
}
