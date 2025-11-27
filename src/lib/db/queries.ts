import { eq, and, desc, asc, gte, lte, sql, count } from 'drizzle-orm'
import { db } from './index'
import { 
  users, 
  watchlists, 
  watchlistItems, 
  stockAlerts, 
  userPreferences, 
  chatHistory, 
  portfolioHoldings,
  type NewUser,
  type NewWatchlist,
  type NewWatchlistItem,
  type NewStockAlert,
  type NewUserPreferences,
  type NewChatHistory,
  type NewPortfolioHolding,
} from './schema'

// ==================== USER QUERIES ====================

export const userQueries = {
  // Get user by Clerk ID
  getByClerkId: async (clerkId: string) => {
    const result = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
      with: {
        preferences: true,
      },
    })
    return result
  },

  // Get user by ID
  getById: async (id: string) => {
    const result = await db.query.users.findFirst({
      where: eq(users.id, id),
    })
    return result
  },

  // Create new user
  create: async (data: NewUser) => {
    const [user] = await db.insert(users).values(data).returning()
    return user
  },

  // Update user
  update: async (id: string, data: Partial<NewUser>) => {
    const [updated] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning()
    return updated
  },

  // Delete user
  delete: async (id: string) => {
    await db.delete(users).where(eq(users.id, id))
  },

  // Get user with all related data
  getWithRelations: async (userId: string) => {
    const result = await db.query.users.findFirst({
      where: eq(users.id, userId),
      with: {
        watchlists: {
          with: {
            items: true,
          },
        },
        stockAlerts: true,
        preferences: true,
        portfolioHoldings: true,
      },
    })
    return result
  },
}

// ==================== WATCHLIST QUERIES ====================

export const watchlistQueries = {
  // Get all watchlists for a user
  getByUserId: async (userId: string) => {
    const result = await db.query.watchlists.findMany({
      where: eq(watchlists.userId, userId),
      orderBy: [desc(watchlists.createdAt)],
      with: {
        items: true,
      },
    })
    return result
  },

  // Get single watchlist with items
  getById: async (id: string) => {
    const result = await db.query.watchlists.findFirst({
      where: eq(watchlists.id, id),
      with: {
        items: {
          orderBy: [desc(watchlistItems.addedAt)],
        },
      },
    })
    return result
  },

  // Create watchlist
  create: async (data: NewWatchlist) => {
    const [watchlist] = await db.insert(watchlists).values(data).returning()
    return watchlist
  },

  // Update watchlist
  update: async (id: string, data: Partial<NewWatchlist>) => {
    const [updated] = await db
      .update(watchlists)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(watchlists.id, id))
      .returning()
    return updated
  },

  // Delete watchlist
  delete: async (id: string) => {
    await db.delete(watchlists).where(eq(watchlists.id, id))
  },

  // Add item to watchlist
  addItem: async (data: NewWatchlistItem) => {
    const [item] = await db.insert(watchlistItems).values(data).returning()
    return item
  },

  // Remove item from watchlist
  removeItem: async (id: string) => {
    await db.delete(watchlistItems).where(eq(watchlistItems.id, id))
  },

  // Check if symbol exists in watchlist
  hasSymbol: async (watchlistId: string, symbol: string) => {
    const result = await db.query.watchlistItems.findFirst({
      where: and(
        eq(watchlistItems.watchlistId, watchlistId),
        eq(watchlistItems.symbol, symbol)
      ),
    })
    return !!result
  },

  // Update item notes
  updateItemNotes: async (id: string, notes: string) => {
    const [updated] = await db
      .update(watchlistItems)
      .set({ notes })
      .where(eq(watchlistItems.id, id))
      .returning()
    return updated
  },
}

// ==================== STOCK ALERT QUERIES ====================

export const stockAlertQueries = {
  // Get all alerts for a user
  getByUserId: async (userId: string, activeOnly = false) => {
    const result = await db.query.stockAlerts.findMany({
      where: activeOnly 
        ? and(eq(stockAlerts.userId, userId), eq(stockAlerts.isActive, true))
        : eq(stockAlerts.userId, userId),
      orderBy: [desc(stockAlerts.createdAt)],
    })
    return result
  },

  // Get alerts by symbol
  getBySymbol: async (symbol: string) => {
    const result = await db.query.stockAlerts.findMany({
      where: and(
        eq(stockAlerts.symbol, symbol),
        eq(stockAlerts.isActive, true)
      ),
    })
    return result
  },

  // Create alert
  create: async (data: NewStockAlert) => {
    const [alert] = await db.insert(stockAlerts).values(data).returning()
    return alert
  },

  // Update alert
  update: async (id: string, data: Partial<NewStockAlert>) => {
    const [updated] = await db
      .update(stockAlerts)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(stockAlerts.id, id))
      .returning()
    return updated
  },

  // Trigger alert
  trigger: async (id: string) => {
    const [updated] = await db
      .update(stockAlerts)
      .set({ 
        isActive: false, 
        triggeredAt: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(stockAlerts.id, id))
      .returning()
    return updated
  },

  // Delete alert
  delete: async (id: string) => {
    await db.delete(stockAlerts).where(eq(stockAlerts.id, id))
  },

  // Get active alerts count by user
  getActiveCount: async (userId: string) => {
    const result = await db
      .select({ count: count() })
      .from(stockAlerts)
      .where(and(
        eq(stockAlerts.userId, userId),
        eq(stockAlerts.isActive, true)
      ))
    return result[0]?.count || 0
  },
}

// ==================== USER PREFERENCES QUERIES ====================

export const userPreferencesQueries = {
  // Get preferences by user ID
  getByUserId: async (userId: string) => {
    const result = await db.query.userPreferences.findFirst({
      where: eq(userPreferences.userId, userId),
    })
    return result
  },

  // Create or update preferences
  upsert: async (userId: string, data: Partial<NewUserPreferences>) => {
    const existing = await userPreferencesQueries.getByUserId(userId)
    
    if (existing) {
      const [updated] = await db
        .update(userPreferences)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userPreferences.userId, userId))
        .returning()
      return updated
    } else {
      const [created] = await db
        .insert(userPreferences)
        .values({ userId, ...data } as NewUserPreferences)
        .returning()
      return created
    }
  },

  // Update favorite metrics
  updateFavoriteMetrics: async (userId: string, metrics: string[]) => {
    const [updated] = await db
      .update(userPreferences)
      .set({ 
        favoriteMetrics: metrics,
        updatedAt: new Date() 
      })
      .where(eq(userPreferences.userId, userId))
      .returning()
    return updated
  },
}

// ==================== CHAT HISTORY QUERIES ====================

export const chatHistoryQueries = {
  // Get recent chat history
  getRecent: async (userId: string, limit = 50) => {
    const result = await db.query.chatHistory.findMany({
      where: eq(chatHistory.userId, userId),
      orderBy: [desc(chatHistory.createdAt)],
      limit,
    })
    return result
  },

  // Get chat history by date range
  getByDateRange: async (userId: string, startDate: Date, endDate: Date) => {
    const result = await db.query.chatHistory.findMany({
      where: and(
        eq(chatHistory.userId, userId),
        gte(chatHistory.createdAt, startDate),
        lte(chatHistory.createdAt, endDate)
      ),
      orderBy: [desc(chatHistory.createdAt)],
    })
    return result
  },

  // Create chat entry
  create: async (data: NewChatHistory) => {
    const [chat] = await db.insert(chatHistory).values(data).returning()
    return chat
  },

  // Delete chat history
  delete: async (id: string) => {
    await db.delete(chatHistory).where(eq(chatHistory.id, id))
  },

  // Delete all chat history for user
  deleteAllByUser: async (userId: string) => {
    await db.delete(chatHistory).where(eq(chatHistory.userId, userId))
  },

  // Get chat count by user
  getCount: async (userId: string) => {
    const result = await db
      .select({ count: count() })
      .from(chatHistory)
      .where(eq(chatHistory.userId, userId))
    return result[0]?.count || 0
  },

  // Search chat history
  search: async (userId: string, query: string, limit = 20) => {
    const result = await db.query.chatHistory.findMany({
      where: and(
        eq(chatHistory.userId, userId),
        sql`${chatHistory.message} ILIKE ${`%${query}%`}`
      ),
      orderBy: [desc(chatHistory.createdAt)],
      limit,
    })
    return result
  },
}

// ==================== PORTFOLIO HOLDINGS QUERIES ====================

export const portfolioHoldingsQueries = {
  // Get all holdings for a user
  getByUserId: async (userId: string) => {
    const result = await db.query.portfolioHoldings.findMany({
      where: eq(portfolioHoldings.userId, userId),
      orderBy: [desc(portfolioHoldings.lastUpdated)],
    })
    return result
  },

  // Get holding by user and symbol
  getByUserAndSymbol: async (userId: string, symbol: string) => {
    const result = await db.query.portfolioHoldings.findFirst({
      where: and(
        eq(portfolioHoldings.userId, userId),
        eq(portfolioHoldings.symbol, symbol)
      ),
    })
    return result
  },

  // Create or update holding
  upsert: async (userId: string, symbol: string, data: Partial<NewPortfolioHolding>) => {
    const existing = await portfolioHoldingsQueries.getByUserAndSymbol(userId, symbol)
    
    if (existing) {
      const [updated] = await db
        .update(portfolioHoldings)
        .set({ 
          ...data, 
          lastUpdated: new Date(),
          updatedAt: new Date() 
        })
        .where(and(
          eq(portfolioHoldings.userId, userId),
          eq(portfolioHoldings.symbol, symbol)
        ))
        .returning()
      return updated
    } else {
      const [created] = await db
        .insert(portfolioHoldings)
        .values({ userId, symbol, ...data } as NewPortfolioHolding)
        .returning()
      return created
    }
  },

  // Delete holding
  delete: async (id: string) => {
    await db.delete(portfolioHoldings).where(eq(portfolioHoldings.id, id))
  },

  // Get total portfolio value
  getTotalValue: async (userId: string) => {
    const result = await db
      .select({ 
        total: sql<number>`SUM(CAST(${portfolioHoldings.currentValue} AS DECIMAL))` 
      })
      .from(portfolioHoldings)
      .where(eq(portfolioHoldings.userId, userId))
    return result[0]?.total || 0
  },

  // Get holdings count
  getCount: async (userId: string) => {
    const result = await db
      .select({ count: count() })
      .from(portfolioHoldings)
      .where(eq(portfolioHoldings.userId, userId))
    return result[0]?.count || 0
  },

  // Update current value
  updateCurrentValue: async (id: string, currentValue: string) => {
    const [updated] = await db
      .update(portfolioHoldings)
      .set({ 
        currentValue,
        lastUpdated: new Date(),
        updatedAt: new Date() 
      })
      .where(eq(portfolioHoldings.id, id))
      .returning()
    return updated
  },
}

// ==================== ANALYTICS QUERIES ====================

export const analyticsQueries = {
  // Get user activity summary
  getUserSummary: async (userId: string) => {
    const [watchlistCount, alertCount, chatCount, holdingCount, totalValue] = await Promise.all([
      db.select({ count: count() }).from(watchlists).where(eq(watchlists.userId, userId)),
      stockAlertQueries.getActiveCount(userId),
      chatHistoryQueries.getCount(userId),
      portfolioHoldingsQueries.getCount(userId),
      portfolioHoldingsQueries.getTotalValue(userId),
    ])

    return {
      watchlistCount: watchlistCount[0]?.count || 0,
      activeAlertCount: alertCount,
      chatHistoryCount: chatCount,
      portfolioHoldingCount: holdingCount,
      totalPortfolioValue: totalValue,
    }
  },

  // Get most watched symbols
  getMostWatchedSymbols: async (limit = 10) => {
    const result = await db
      .select({
        symbol: watchlistItems.symbol,
        count: count(),
      })
      .from(watchlistItems)
      .groupBy(watchlistItems.symbol)
      .orderBy(desc(count()))
      .limit(limit)
    return result
  },

  // Get recent user activity
  getRecentActivity: async (userId: string) => {
    const [recentChats, recentAlerts, recentWatchlistItems] = await Promise.all([
      chatHistoryQueries.getRecent(userId, 5),
      stockAlertQueries.getByUserId(userId),
      db.query.watchlistItems.findMany({
        where: sql`${watchlistItems.watchlistId} IN (
          SELECT id FROM ${watchlists} WHERE ${watchlists.userId} = ${userId}
        )`,
        orderBy: [desc(watchlistItems.addedAt)],
        limit: 5,
      }),
    ])

    return {
      recentChats,
      recentAlerts: recentAlerts.slice(0, 5),
      recentWatchlistItems,
    }
  },
}

// Export all query helpers
export const queries = {
  user: userQueries,
  watchlist: watchlistQueries,
  stockAlert: stockAlertQueries,
  userPreferences: userPreferencesQueries,
  chatHistory: chatHistoryQueries,
  portfolioHoldings: portfolioHoldingsQueries,
  analytics: analyticsQueries,
}
