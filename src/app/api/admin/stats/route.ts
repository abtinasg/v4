import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { 
  users, 
  watchlists, 
  watchlistItems, 
  stockAlerts, 
  chatHistory
} from '@/lib/db/schema'
import { count, sql, desc, gte } from 'drizzle-orm'
import { getAdminSession } from '@/lib/admin/auth'

export async function GET() {
  try {
    // Check admin authentication
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current date info
    const now = new Date()
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()))
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    // Parallel queries for stats
    const [
      totalUsersResult,
      totalWatchlistsResult,
      totalWatchlistItemsResult,
      totalAlertsResult,
      activeAlertsResult,
      totalChatsResult,
      usersThisMonthResult,
      usersThisWeekResult,
      usersTodayResult,
      recentUsersResult,
      subscriptionStatsResult,
      chatsThisWeekResult,
    ] = await Promise.all([
      // Total counts
      db.select({ count: count() }).from(users),
      db.select({ count: count() }).from(watchlists),
      db.select({ count: count() }).from(watchlistItems),
      db.select({ count: count() }).from(stockAlerts),
      db.select({ count: count() }).from(stockAlerts).where(sql`${stockAlerts.isActive} = true`),
      db.select({ count: count() }).from(chatHistory),
      
      // Time-based user counts
      db.select({ count: count() }).from(users).where(gte(users.createdAt, startOfMonth)),
      db.select({ count: count() }).from(users).where(gte(users.createdAt, startOfWeek)),
      db.select({ count: count() }).from(users).where(gte(users.createdAt, startOfToday)),
      
      // Recent users
      db.select({
        id: users.id,
        email: users.email,
        subscriptionTier: users.subscriptionTier,
        createdAt: users.createdAt
      })
        .from(users)
        .orderBy(desc(users.createdAt))
        .limit(10),
      
      // Subscription tier distribution
      db.select({
        tier: users.subscriptionTier,
        count: count()
      })
        .from(users)
        .groupBy(users.subscriptionTier),
      
      // Chats this week
      db.select({ count: count() }).from(chatHistory).where(gte(chatHistory.createdAt, startOfWeek)),
    ])

    // Calculate growth rates (mock for now, can be enhanced)
    const totalUsers = totalUsersResult[0]?.count || 0
    const usersThisMonth = usersThisMonthResult[0]?.count || 0
    const previousMonthUsers = totalUsers - usersThisMonth
    const growthRate = previousMonthUsers > 0 
      ? ((usersThisMonth / previousMonthUsers) * 100).toFixed(1) 
      : 100

    return NextResponse.json({
      overview: {
        totalUsers: totalUsersResult[0]?.count || 0,
        totalWatchlists: totalWatchlistsResult[0]?.count || 0,
        totalWatchlistItems: totalWatchlistItemsResult[0]?.count || 0,
        totalAlerts: totalAlertsResult[0]?.count || 0,
        activeAlerts: activeAlertsResult[0]?.count || 0,
        totalChats: totalChatsResult[0]?.count || 0,
      },
      growth: {
        usersThisMonth: usersThisMonthResult[0]?.count || 0,
        usersThisWeek: usersThisWeekResult[0]?.count || 0,
        usersToday: usersTodayResult[0]?.count || 0,
        chatsThisWeek: chatsThisWeekResult[0]?.count || 0,
        growthRate: `${growthRate}%`,
      },
      subscriptionDistribution: subscriptionStatsResult.reduce((acc, item) => {
        acc[item.tier] = item.count
        return acc
      }, {} as Record<string, number>),
      recentUsers: recentUsersResult,
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    )
  }
}
