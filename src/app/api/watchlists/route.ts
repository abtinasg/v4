/**
 * Watchlist API Routes
 * 
 * GET /api/watchlists - Get user's watchlists
 * POST /api/watchlists - Create new watchlist
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { watchlistQueries, userQueries } from '@/lib/db/queries'

// GET - Get user's watchlists
export async function GET() {
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

    // Get all watchlists with items
    const watchlists = await watchlistQueries.getByUserId(user.id)

    return NextResponse.json({ watchlists })
  } catch (error) {
    console.error('Error fetching watchlists:', error)
    return NextResponse.json(
      { error: 'Failed to fetch watchlists' },
      { status: 500 }
    )
  }
}

// POST - Create new watchlist
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
    const { name, isDefault = false } = body

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Watchlist name is required' },
        { status: 400 }
      )
    }

    if (name.length > 100) {
      return NextResponse.json(
        { error: 'Watchlist name must be 100 characters or less' },
        { status: 400 }
      )
    }

    // Create the watchlist
    const watchlist = await watchlistQueries.create({
      userId: user.id,
      name: name.trim(),
      isDefault,
    })

    return NextResponse.json({ watchlist }, { status: 201 })
  } catch (error) {
    console.error('Error creating watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to create watchlist' },
      { status: 500 }
    )
  }
}
