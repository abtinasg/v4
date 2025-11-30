import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { 
  users, 
  watchlists, 
  watchlistItems, 
  stockAlerts, 
  chatHistory
} from '@/lib/db/schema'
import { count, sql, desc, gte, eq, and } from 'drizzle-orm'
import { getAdminSession } from '@/lib/admin/auth'

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const days = parseInt(searchParams.get('days') || '30')

    // Calculate date ranges
    const now = new Date()
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    
    // Get daily user registrations for the period
    const dailyUsers = await db
      .select({
        date: sql<string>`DATE(${users.createdAt})`.as('date'),
        count: count()
      })
      .from(users)
      .where(gte(users.createdAt, startDate))
      .groupBy(sql`DATE(${users.createdAt})`)
      .orderBy(sql`DATE(${users.createdAt})`)

    // Get daily chat activity
    const dailyChats = await db
      .select({
        date: sql<string>`DATE(${chatHistory.createdAt})`.as('date'),
        count: count()
      })
      .from(chatHistory)
      .where(gte(chatHistory.createdAt, startDate))
      .groupBy(sql`DATE(${chatHistory.createdAt})`)
      .orderBy(sql`DATE(${chatHistory.createdAt})`)

    // Get daily alerts created
    const dailyAlerts = await db
      .select({
        date: sql<string>`DATE(${stockAlerts.createdAt})`.as('date'),
        count: count()
      })
      .from(stockAlerts)
      .where(gte(stockAlerts.createdAt, startDate))
      .groupBy(sql`DATE(${stockAlerts.createdAt})`)
      .orderBy(sql`DATE(${stockAlerts.createdAt})`)

    // Get daily watchlist items added
    const dailyWatchlistItems = await db
      .select({
        date: sql<string>`DATE(${watchlistItems.addedAt})`.as('date'),
        count: count()
      })
      .from(watchlistItems)
      .where(gte(watchlistItems.addedAt, startDate))
      .groupBy(sql`DATE(${watchlistItems.addedAt})`)
      .orderBy(sql`DATE(${watchlistItems.addedAt})`)

    // Get top stocks in watchlists
    const topWatchlistStocks = await db
      .select({
        symbol: watchlistItems.symbol,
        count: count()
      })
      .from(watchlistItems)
      .groupBy(watchlistItems.symbol)
      .orderBy(desc(count()))
      .limit(10)

    // Get top stocks in alerts
    const topAlertStocks = await db
      .select({
        symbol: stockAlerts.symbol,
        count: count()
      })
      .from(stockAlerts)
      .groupBy(stockAlerts.symbol)
      .orderBy(desc(count()))
      .limit(10)

    // Get user engagement metrics (users with activity)
    const [
      usersWithWatchlists,
      usersWithAlerts,
      usersWithChats
    ] = await Promise.all([
      db.selectDistinct({ userId: watchlists.userId }).from(watchlists),
      db.selectDistinct({ userId: stockAlerts.userId }).from(stockAlerts),
      db.selectDistinct({ userId: chatHistory.userId }).from(chatHistory),
    ])

    const totalUsers = (await db.select({ count: count() }).from(users))[0]?.count || 0

    // Build daily trends array for the chart
    const dailyTrendsMap = new Map<string, { users: number; chats: number; alerts: number; watchlistItems: number }>()
    
    // Initialize all days in range
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = date.toISOString().split('T')[0]
      dailyTrendsMap.set(dateStr, { users: 0, chats: 0, alerts: 0, watchlistItems: 0 })
    }
    
    // Fill in actual data
    dailyUsers.forEach(d => {
      const dateStr = String(d.date).split('T')[0]
      const existing = dailyTrendsMap.get(dateStr)
      if (existing) existing.users = d.count
    })
    
    dailyChats.forEach(d => {
      const dateStr = String(d.date).split('T')[0]
      const existing = dailyTrendsMap.get(dateStr)
      if (existing) existing.chats = d.count
    })
    
    dailyAlerts.forEach(d => {
      const dateStr = String(d.date).split('T')[0]
      const existing = dailyTrendsMap.get(dateStr)
      if (existing) existing.alerts = d.count
    })
    
    dailyWatchlistItems.forEach(d => {
      const dateStr = String(d.date).split('T')[0]
      const existing = dailyTrendsMap.get(dateStr)
      if (existing) existing.watchlistItems = d.count
    })
    
    // Convert to sorted array
    const dailyTrends = Array.from(dailyTrendsMap.entries())
      .map(([date, data]) => ({ date, ...data }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Recent activity feed - combine and format
    const recentChats = await db
      .select({
        id: chatHistory.id,
        userId: chatHistory.userId,
        message: chatHistory.message,
        createdAt: chatHistory.createdAt,
      })
      .from(chatHistory)
      .leftJoin(users, eq(chatHistory.userId, users.id))
      .orderBy(desc(chatHistory.createdAt))
      .limit(10)

    const recentAlerts = await db
      .select({
        id: stockAlerts.id,
        userId: stockAlerts.userId,
        symbol: stockAlerts.symbol,
        createdAt: stockAlerts.createdAt,
      })
      .from(stockAlerts)
      .leftJoin(users, eq(stockAlerts.userId, users.id))
      .orderBy(desc(stockAlerts.createdAt))
      .limit(10)

    // Combine recent activity
    const recentActivity = [
      ...recentChats.map(c => ({
        type: 'chat' as const,
        userId: c.userId,
        userEmail: null,
        message: c.message?.slice(0, 100),
        time: c.createdAt?.toISOString() || new Date().toISOString(),
      })),
      ...recentAlerts.map(a => ({
        type: 'alert' as const,
        userId: a.userId,
        userEmail: null,
        symbol: a.symbol,
        time: a.createdAt?.toISOString() || new Date().toISOString(),
      }))
    ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 20)

    return NextResponse.json({
      timeRange: { days, startDate: startDate.toISOString(), endDate: now.toISOString() },
      
      // Daily trends as array for chart
      dailyTrends,
      
      // Top stocks analysis
      topStocks: {
        watchlists: topWatchlistStocks,
        alerts: topAlertStocks,
      },
      
      // User engagement
      engagement: {
        totalUsers,
        usersWithWatchlists: usersWithWatchlists.length,
        usersWithAlerts: usersWithAlerts.length,
        usersWithChats: usersWithChats.length,
      },
      
      // Recent activity
      recentActivity,
    })
  } catch (error) {
    console.error('Admin analytics error:', error)
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 })
  }
}
