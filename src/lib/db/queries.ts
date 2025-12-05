import { eq, and, desc, asc, gte, lte, sql, count, gt } from 'drizzle-orm'
import { db } from './index'
import { 
  users, 
  watchlists, 
  watchlistItems, 
  stockAlerts, 
  userPreferences, 
  chatHistory, 
  portfolioHoldings,
  riskProfiles,
  detailedRiskAssessments,
  aiReports,
  type NewUser,
  type NewWatchlist,
  type NewWatchlistItem,
  type NewStockAlert,
  type NewUserPreferences,
  type NewChatHistory,
  type NewPortfolioHolding,
  type NewRiskProfile,
  type NewDetailedRiskAssessment,
  type NewAiReport,
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

  // Get or create default watchlist for user with popular stocks
  getOrCreateDefault: async (userId: string) => {
    // Check if user already has watchlists
    const existingWatchlists = await watchlistQueries.getByUserId(userId)
    
    if (existingWatchlists && existingWatchlists.length > 0) {
      return existingWatchlists[0]
    }

    // Create default watchlist with popular stocks
    const watchlist = await watchlistQueries.create({
      userId,
      name: 'My Watchlist',
      isDefault: true,
    })

    // Add popular stocks
    const defaultSymbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']
    for (const symbol of defaultSymbols) {
      await watchlistQueries.addItem({
        watchlistId: watchlist.id,
        symbol,
        notes: null,
      })
    }

    // Fetch and return the complete watchlist with items
    const completeWatchlist = await watchlistQueries.getById(watchlist.id)
    return completeWatchlist
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

// ==================== RISK PROFILE QUERIES ====================

export const riskProfileQueries = {
  // Get risk profile by user ID
  getByUserId: async (userId: string) => {
    const result = await db.query.riskProfiles.findFirst({
      where: eq(riskProfiles.userId, userId),
    })
    return result
  },

  // Create risk profile
  create: async (data: NewRiskProfile) => {
    const [profile] = await db.insert(riskProfiles).values(data).returning()
    return profile
  },

  // Update risk profile
  update: async (userId: string, data: Partial<NewRiskProfile>) => {
    const [updated] = await db
      .update(riskProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(riskProfiles.userId, userId))
      .returning()
    return updated
  },

  // Upsert risk profile (create or update)
  upsert: async (userId: string, data: Omit<NewRiskProfile, 'userId'>) => {
    const existing = await db.query.riskProfiles.findFirst({
      where: eq(riskProfiles.userId, userId),
    })

    if (existing) {
      const [updated] = await db
        .update(riskProfiles)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(riskProfiles.userId, userId))
        .returning()
      return updated
    } else {
      const [created] = await db
        .insert(riskProfiles)
        .values({ ...data, userId })
        .returning()
      return created
    }
  },

  // Check if user has completed onboarding
  hasCompletedOnboarding: async (userId: string) => {
    const result = await db.query.riskProfiles.findFirst({
      where: and(
        eq(riskProfiles.userId, userId),
        eq(riskProfiles.onboardingCompleted, true)
      ),
    })
    return !!result
  },

  // Delete risk profile
  delete: async (userId: string) => {
    await db.delete(riskProfiles).where(eq(riskProfiles.userId, userId))
  },
}

// ==================== DETAILED RISK ASSESSMENT QUERIES ====================

export const detailedRiskAssessmentQueries = {
  // Get detailed risk assessment by user ID
  getByUserId: async (userId: string) => {
    const result = await db.query.detailedRiskAssessments.findFirst({
      where: eq(detailedRiskAssessments.userId, userId),
    })
    return result
  },

  // Check if user has completed detailed risk assessment
  hasCompleted: async (userId: string) => {
    const result = await db.query.detailedRiskAssessments.findFirst({
      where: eq(detailedRiskAssessments.userId, userId),
      columns: { id: true },
    })
    return !!result
  },

  // Create detailed risk assessment
  create: async (data: NewDetailedRiskAssessment) => {
    const [assessment] = await db
      .insert(detailedRiskAssessments)
      .values(data)
      .returning()
    return assessment
  },

  // Update detailed risk assessment
  update: async (userId: string, data: Partial<Omit<NewDetailedRiskAssessment, 'userId'>>) => {
    const [updated] = await db
      .update(detailedRiskAssessments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(detailedRiskAssessments.userId, userId))
      .returning()
    return updated
  },

  // Upsert detailed risk assessment (create or update)
  upsert: async (userId: string, data: Omit<NewDetailedRiskAssessment, 'userId'>) => {
    const existing = await db.query.detailedRiskAssessments.findFirst({
      where: eq(detailedRiskAssessments.userId, userId),
    })

    if (existing) {
      const [updated] = await db
        .update(detailedRiskAssessments)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(detailedRiskAssessments.userId, userId))
        .returning()
      return updated
    } else {
      const [created] = await db
        .insert(detailedRiskAssessments)
        .values({ ...data, userId })
        .returning()
      return created
    }
  },

  // Delete detailed risk assessment
  delete: async (userId: string) => {
    await db.delete(detailedRiskAssessments).where(eq(detailedRiskAssessments.userId, userId))
  },
}

// ==================== AI REPORTS QUERIES ====================

export const aiReportQueries = {
  // Get active report for a user/symbol/type (not expired)
  getActive: async (userId: string, symbol: string, reportType: 'pro' | 'retail' | 'personalized') => {
    const result = await db.query.aiReports.findFirst({
      where: and(
        eq(aiReports.userId, userId),
        eq(aiReports.symbol, symbol.toUpperCase()),
        eq(aiReports.reportType, reportType),
        gt(aiReports.expiresAt, new Date()),
      ),
      orderBy: desc(aiReports.createdAt),
    })
    return result
  },

  // Get pending or generating report
  getPending: async (userId: string, symbol: string, reportType: 'pro' | 'retail' | 'personalized') => {
    const result = await db.query.aiReports.findFirst({
      where: and(
        eq(aiReports.userId, userId),
        eq(aiReports.symbol, symbol.toUpperCase()),
        eq(aiReports.reportType, reportType),
        sql`${aiReports.status} IN ('pending', 'generating')`,
      ),
      orderBy: desc(aiReports.createdAt),
    })
    return result
  },

  // Create new report
  create: async (data: NewAiReport) => {
    const [report] = await db.insert(aiReports).values({
      ...data,
      symbol: data.symbol.toUpperCase(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    }).returning()
    return report
  },

  // Update report status and content
  update: async (id: string, data: Partial<Pick<NewAiReport, 'status' | 'content' | 'error' | 'metadata'>>) => {
    const [updated] = await db
      .update(aiReports)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiReports.id, id))
      .returning()
    return updated
  },

  // Append content to report (for streaming)
  appendContent: async (id: string, newContent: string) => {
    const report = await db.query.aiReports.findFirst({
      where: eq(aiReports.id, id),
    })
    const updatedContent = (report?.content || '') + newContent
    const [updated] = await db
      .update(aiReports)
      .set({ content: updatedContent, updatedAt: new Date() })
      .where(eq(aiReports.id, id))
      .returning()
    return updated
  },

  // Get recent reports for a user
  getRecent: async (userId: string, limit: number = 10) => {
    const results = await db.query.aiReports.findMany({
      where: eq(aiReports.userId, userId),
      orderBy: desc(aiReports.createdAt),
      limit,
    })
    return results
  },

  // Delete expired reports (cleanup job)
  deleteExpired: async () => {
    const deleted = await db
      .delete(aiReports)
      .where(lte(aiReports.expiresAt, new Date()))
      .returning()
    return deleted.length
  },

  // Get by ID
  getById: async (id: string) => {
    const result = await db.query.aiReports.findFirst({
      where: eq(aiReports.id, id),
    })
    return result
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
  riskProfile: riskProfileQueries,
  detailedRiskAssessment: detailedRiskAssessmentQueries,
  aiReport: aiReportQueries,
}
