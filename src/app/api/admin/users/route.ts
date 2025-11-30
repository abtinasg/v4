import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, watchlists, stockAlerts, chatHistory, userCredits } from '@/lib/db/schema'
import { eq, desc, asc, like, count, sql } from 'drizzle-orm'
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
    const search = searchParams.get('search') || ''
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    // Build query with credits
    let query = db.select({
      id: users.id,
      clerkId: users.clerkId,
      email: users.email,
      creditBalance: sql<number>`COALESCE(${userCredits.balance}, 0)`,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
    })
    .from(users)
    .leftJoin(userCredits, eq(users.id, userCredits.userId))

    // Apply search filter
    if (search) {
      query = query.where(like(users.email, `%${search}%`)) as typeof query
    }

    // Apply sorting
    const orderBy = sortOrder === 'asc' ? asc(users.createdAt) : desc(users.createdAt)
    
    query = query.orderBy(orderBy).limit(limit).offset(offset) as typeof query

    // Get total count
    const totalResult = await db.select({ count: count() }).from(users)
    const total = totalResult[0]?.count || 0

    // Execute query
    const usersList = await query

    // Get related data counts for each user
    const usersWithCounts = await Promise.all(
      usersList.map(async (user) => {
        const [watchlistCount, alertCount, chatCount] = await Promise.all([
          db.select({ count: count() }).from(watchlists).where(eq(watchlists.userId, user.id)),
          db.select({ count: count() }).from(stockAlerts).where(eq(stockAlerts.userId, user.id)),
          db.select({ count: count() }).from(chatHistory).where(eq(chatHistory.userId, user.id)),
        ])

        return {
          ...user,
          creditBalance: Number(user.creditBalance || 0),
          _count: {
            watchlists: watchlistCount[0]?.count || 0,
            alerts: alertCount[0]?.count || 0,
            chats: chatCount[0]?.count || 0,
            holdings: 0,
          }
        }
      })
    )

    return NextResponse.json({
      users: usersWithCounts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Admin users list error:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
