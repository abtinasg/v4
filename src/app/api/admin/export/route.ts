import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, watchlists, stockAlerts, chatHistory, watchlistItems } from '@/lib/db/schema'
import { count, desc, sql } from 'drizzle-orm'
import { getAdminSession } from '@/lib/admin/auth'

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'users' // users, chats, alerts, watchlists
    const format = searchParams.get('format') || 'json'

    let data: any[] = []
    let filename = ''

    switch (type) {
      case 'users':
        const usersData = await db.select({
          id: users.id,
          email: users.email,
          subscriptionTier: users.subscriptionTier,
          createdAt: users.createdAt,
        }).from(users).orderBy(desc(users.createdAt))
        data = usersData
        filename = 'users'
        break

      case 'chats':
        const chatsData = await db.select({
          id: chatHistory.id,
          userId: chatHistory.userId,
          message: chatHistory.message,
          createdAt: chatHistory.createdAt,
        }).from(chatHistory).orderBy(desc(chatHistory.createdAt)).limit(1000)
        data = chatsData
        filename = 'chat_history'
        break

      case 'alerts':
        const alertsData = await db.select({
          id: stockAlerts.id,
          userId: stockAlerts.userId,
          symbol: stockAlerts.symbol,
          condition: stockAlerts.condition,
          targetPrice: stockAlerts.targetPrice,
          isActive: stockAlerts.isActive,
          createdAt: stockAlerts.createdAt,
        }).from(stockAlerts).orderBy(desc(stockAlerts.createdAt))
        data = alertsData
        filename = 'alerts'
        break

      case 'watchlists':
        const watchlistsData = await db.select({
          id: watchlists.id,
          userId: watchlists.userId,
          name: watchlists.name,
          createdAt: watchlists.createdAt,
        }).from(watchlists).orderBy(desc(watchlists.createdAt))
        data = watchlistsData
        filename = 'watchlists'
        break

      case 'watchlist_items':
        const itemsData = await db.select({
          id: watchlistItems.id,
          watchlistId: watchlistItems.watchlistId,
          symbol: watchlistItems.symbol,
          addedAt: watchlistItems.addedAt,
        }).from(watchlistItems).orderBy(desc(watchlistItems.addedAt))
        data = itemsData
        filename = 'watchlist_items'
        break

      default:
        return NextResponse.json({ error: 'Invalid export type' }, { status: 400 })
    }

    if (format === 'csv') {
      // Convert to CSV
      if (data.length === 0) {
        return new NextResponse('No data to export', { status: 200 })
      }
      
      const headers = Object.keys(data[0])
      const csvRows = [
        headers.join(','),
        ...data.map(row => 
          headers.map(header => {
            const value = row[header]
            // Escape quotes and wrap in quotes if contains comma
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`
            }
            return value ?? ''
          }).join(',')
        )
      ]
      
      const csv = csvRows.join('\n')
      
      return new NextResponse(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="${filename}_${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    // Return JSON
    return NextResponse.json({
      type,
      count: data.length,
      exportedAt: new Date().toISOString(),
      data
    })
  } catch (error) {
    console.error('Admin export error:', error)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}
