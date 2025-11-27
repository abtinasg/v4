/**
 * Watchlist [id] API Routes
 * 
 * GET /api/watchlists/[id] - Get single watchlist
 * PUT /api/watchlists/[id] - Update watchlist
 * DELETE /api/watchlists/[id] - Delete watchlist
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { watchlistQueries, userQueries } from '@/lib/db/queries'

interface RouteParams {
  params: Promise<{ id: string }>
}

// GET - Get single watchlist with items
export async function GET(request: NextRequest, { params }: RouteParams) {
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

    // Verify ownership
    if (watchlist.userId !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    return NextResponse.json({ watchlist })
  } catch (error) {
    console.error('Error fetching watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to fetch watchlist' },
      { status: 500 }
    )
  }
}

// PUT - Update watchlist
export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    const { name, isDefault } = body

    const updates: { name?: string; isDefault?: boolean } = {}
    
    if (name !== undefined) {
      if (typeof name !== 'string' || name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Invalid watchlist name' },
          { status: 400 }
        )
      }
      updates.name = name.trim()
    }

    if (isDefault !== undefined) {
      updates.isDefault = Boolean(isDefault)
    }

    const updated = await watchlistQueries.update(id, updates)

    return NextResponse.json({ watchlist: updated })
  } catch (error) {
    console.error('Error updating watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to update watchlist' },
      { status: 500 }
    )
  }
}

// DELETE - Delete watchlist
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

    await watchlistQueries.delete(id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting watchlist:', error)
    return NextResponse.json(
      { error: 'Failed to delete watchlist' },
      { status: 500 }
    )
  }
}
