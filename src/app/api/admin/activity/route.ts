import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, chatHistory, stockAlerts, watchlists, watchlistItems } from '@/lib/db/schema'
import { desc, sql, eq, and, gte, lte } from 'drizzle-orm'
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
    const limit = parseInt(searchParams.get('limit') || '50')
    const type = searchParams.get('type') || 'all' // all, chats, alerts, watchlists
    const userId = searchParams.get('userId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const offset = (page - 1) * limit

    // Build activity feed from different sources
    const activities: any[] = []

    if (type === 'all' || type === 'chats') {
      let chatQuery = db.select({
        id: chatHistory.id,
        userId: chatHistory.userId,
        message: chatHistory.message,
        response: chatHistory.response,
        createdAt: chatHistory.createdAt,
        userEmail: users.email,
      })
      .from(chatHistory)
      .leftJoin(users, eq(chatHistory.userId, users.id))
      .orderBy(desc(chatHistory.createdAt))
      .limit(limit)

      const chatResults = await chatQuery
      
      chatResults.forEach(chat => {
        activities.push({
          id: `chat-${chat.id}`,
          type: 'chat',
          userId: chat.userId,
          userEmail: chat.userEmail,
          action: 'Sent message to AI',
          details: chat.message?.slice(0, 100) + (chat.message && chat.message.length > 100 ? '...' : ''),
          timestamp: chat.createdAt,
        })
      })
    }

    if (type === 'all' || type === 'alerts') {
      const alertResults = await db.select({
        id: stockAlerts.id,
        userId: stockAlerts.userId,
        symbol: stockAlerts.symbol,
        condition: stockAlerts.condition,
        targetPrice: stockAlerts.targetPrice,
        isActive: stockAlerts.isActive,
        createdAt: stockAlerts.createdAt,
        userEmail: users.email,
      })
      .from(stockAlerts)
      .leftJoin(users, eq(stockAlerts.userId, users.id))
      .orderBy(desc(stockAlerts.createdAt))
      .limit(limit)

      alertResults.forEach(alert => {
        activities.push({
          id: `alert-${alert.id}`,
          type: 'alert',
          userId: alert.userId,
          userEmail: alert.userEmail,
          action: 'Created price alert',
          symbol: alert.symbol,
          details: `${alert.condition} $${alert.targetPrice}`,
          timestamp: alert.createdAt,
        })
      })
    }

    if (type === 'all' || type === 'watchlists') {
      const watchlistResults = await db.select({
        id: watchlistItems.id,
        watchlistId: watchlistItems.watchlistId,
        symbol: watchlistItems.symbol,
        addedAt: watchlistItems.addedAt,
        watchlistName: watchlists.name,
        userId: watchlists.userId,
        userEmail: users.email,
      })
      .from(watchlistItems)
      .leftJoin(watchlists, eq(watchlistItems.watchlistId, watchlists.id))
      .leftJoin(users, eq(watchlists.userId, users.id))
      .orderBy(desc(watchlistItems.addedAt))
      .limit(limit)

      watchlistResults.forEach(item => {
        activities.push({
          id: `watchlist-${item.id}`,
          type: 'watchlist',
          userId: item.userId,
          userEmail: item.userEmail,
          action: 'Added to watchlist',
          symbol: item.symbol,
          details: item.watchlistName,
          timestamp: item.addedAt,
        })
      })
    }

    // Sort all activities by timestamp
    activities.sort((a, b) => {
      const dateA = new Date(a.timestamp || 0).getTime()
      const dateB = new Date(b.timestamp || 0).getTime()
      return dateB - dateA
    })

    // Filter by userId if provided
    const filteredActivities = userId 
      ? activities.filter(a => a.userId === userId)
      : activities

    // Filter by date range if provided
    let dateFilteredActivities = filteredActivities
    if (startDate) {
      const start = new Date(startDate)
      dateFilteredActivities = dateFilteredActivities.filter(a => 
        new Date(a.timestamp || 0) >= start
      )
    }
    if (endDate) {
      const end = new Date(endDate)
      end.setHours(23, 59, 59, 999)
      dateFilteredActivities = dateFilteredActivities.filter(a => 
        new Date(a.timestamp || 0) <= end
      )
    }

    // Paginate
    const paginatedActivities = dateFilteredActivities.slice(offset, offset + limit)

    // Get activity counts by type
    const counts = {
      all: filteredActivities.length,
      chats: filteredActivities.filter(a => a.type === 'chat').length,
      alerts: filteredActivities.filter(a => a.type === 'alert').length,
      watchlists: filteredActivities.filter(a => a.type === 'watchlist').length,
    }

    return NextResponse.json({
      activities: paginatedActivities,
      counts,
      pagination: {
        page,
        limit,
        total: dateFilteredActivities.length,
        totalPages: Math.ceil(dateFilteredActivities.length / limit)
      }
    })
  } catch (error) {
    console.error('Admin activity error:', error)
    return NextResponse.json({ error: 'Failed to fetch activity' }, { status: 500 })
  }
}
