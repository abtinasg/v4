/**
 * Watchlist Items API Routes
 * 
 * POST /api/watchlists/[id]/items - Add stock to watchlist
 * DELETE /api/watchlists/[id]/items - Remove stock from watchlist
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { watchlistQueries, userQueries } from '@/lib/db/queries'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface RouteParams {
  params: Promise<{ id: string }>
}

// POST - Add stock to watchlist
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth()
    const { id } = await params
    
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

    const watchlist = await watchlistQueries.getById(id)

    if (!watchlist) {
      return NextResponse.json(
        { error: 'Watchlist not found' },
        { status: 404 }
      )
    }

    if (watchlist.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { symbol, notes } = body

    if (!symbol || typeof symbol !== 'string') {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      )
    }

    const upperSymbol = symbol.toUpperCase().trim()

    // Check if symbol already exists in watchlist
    const exists = await watchlistQueries.hasSymbol(id, upperSymbol)
    
    if (exists) {
      return NextResponse.json(
        { error: 'Symbol already in watchlist' },
        { status: 409 }
      )
    }

    const item = await watchlistQueries.addItem({
      watchlistId: id,
      symbol: upperSymbol,
      notes: notes || null,
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('Error adding stock to watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to add stock' },
      { status: 500 }
    )
  }
}

// DELETE - Remove stock from watchlist
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth()
    const { id } = await params
    
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

    const watchlist = await watchlistQueries.getById(id)

    if (!watchlist) {
      return NextResponse.json(
        { error: 'Watchlist not found' },
        { status: 404 }
      )
    }

    if (watchlist.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      )
    }

    await watchlistQueries.removeItem(itemId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing stock from watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to remove stock' },
      { status: 500 }
    )
  }
}
