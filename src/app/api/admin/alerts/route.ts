import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { stockAlerts, users } from '@/lib/db/schema'
import { eq, desc, count, asc, and, sql } from 'drizzle-orm'
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
    const status = searchParams.get('status') || 'all'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    // Get total count
    let countQuery = db.select({ count: count() }).from(stockAlerts)
    if (status === 'active') {
      countQuery = countQuery.where(eq(stockAlerts.isActive, true)) as typeof countQuery
    } else if (status === 'inactive') {
      countQuery = countQuery.where(eq(stockAlerts.isActive, false)) as typeof countQuery
    }
    const totalResult = await countQuery
    const total = totalResult[0]?.count || 0

    // Get alerts with user info
    let alertsQuery = db.select({
      id: stockAlerts.id,
      symbol: stockAlerts.symbol,
      condition: stockAlerts.condition,
      targetPrice: stockAlerts.targetPrice,
      isActive: stockAlerts.isActive,
      triggeredAt: stockAlerts.triggeredAt,
      createdAt: stockAlerts.createdAt,
      userId: stockAlerts.userId,
    })
      .from(stockAlerts)
      .orderBy(sortOrder === 'asc' ? asc(stockAlerts.createdAt) : desc(stockAlerts.createdAt))
      .limit(limit)
      .offset(offset)

    if (status === 'active') {
      alertsQuery = alertsQuery.where(eq(stockAlerts.isActive, true)) as typeof alertsQuery
    } else if (status === 'inactive') {
      alertsQuery = alertsQuery.where(eq(stockAlerts.isActive, false)) as typeof alertsQuery
    }

    const alertsList = await alertsQuery

    // Get user emails for alerts
    const userIds = [...new Set(alertsList.map(a => a.userId))]
    const usersData = userIds.length > 0 
      ? await db.select({ id: users.id, email: users.email })
          .from(users)
          .where(sql`${users.id} IN ${userIds}`)
      : []
    
    const userMap = new Map(usersData.map(u => [u.id, u.email]))

    const alertsWithUsers = alertsList.map(alert => ({
      ...alert,
      userEmail: userMap.get(alert.userId) || 'Unknown'
    }))

    // Get stats
    const [activeCount, triggeredCount] = await Promise.all([
      db.select({ count: count() }).from(stockAlerts).where(eq(stockAlerts.isActive, true)),
      db.select({ count: count() }).from(stockAlerts).where(sql`${stockAlerts.triggeredAt} IS NOT NULL`),
    ])

    return NextResponse.json({
      alerts: alertsWithUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        total: total,
        active: activeCount[0]?.count || 0,
        triggered: triggeredCount[0]?.count || 0,
      }
    })
  } catch (error) {
    console.error('Admin alerts error:', error)
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 })
  }
}
