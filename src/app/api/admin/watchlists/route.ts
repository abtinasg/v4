import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { watchlists, watchlistItems } from '@/lib/db/schema'
import { eq, desc, count, asc } from 'drizzle-orm'
import { getAdminSession } from '@/lib/admin/auth'

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    // Get total count
    const totalResult = await db.select({ count: count() }).from(watchlists)
    const total = totalResult[0]?.count || 0

    // Get watchlists with item counts
    const watchlistsData = await db.query.watchlists.findMany({
      orderBy: sortOrder === 'asc' ? [asc(watchlists.createdAt)] : [desc(watchlists.createdAt)],
      limit,
      offset,
      with: {
        user: {
          columns: {
            id: true,
            email: true,
          }
        },
        items: true,
      },
    })

    const watchlistsWithCounts = watchlistsData.map(w => ({
      ...w,
      itemCount: w.items.length,
    }))

    return NextResponse.json({
      watchlists: watchlistsWithCounts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Admin watchlists error:', error)
    return NextResponse.json({ error: 'Failed to fetch watchlists' }, { status: 500 })
  }
}
