import { pgTable, text, varchar, timestamp, real, boolean, index, jsonb, serial, decimal, pgEnum } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Enums for type safety
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'premium', 'professional', 'enterprise'])
export const alertConditionEnum = pgEnum('alert_condition', ['above', 'below', 'crosses_above', 'crosses_below', 'percent_change'])
export const themeEnum = pgEnum('theme', ['light', 'dark', 'system'])
export const chartTypeEnum = pgEnum('chart_type', ['line', 'candlestick', 'bar', 'area'])
export const riskToleranceEnum = pgEnum('risk_tolerance', ['conservative', 'moderate', 'aggressive'])
export const investmentHorizonEnum = pgEnum('investment_horizon', ['short_term', 'medium_term', 'long_term'])
export const investmentExperienceEnum = pgEnum('investment_experience', ['beginner', 'intermediate', 'advanced'])

// ==================== USERS TABLE ====================
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  subscriptionTier: subscriptionTierEnum('subscription_tier').notNull().default('free'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  clerkIdIdx: index('users_clerk_id_idx').on(table.clerkId),
  emailIdx: index('users_email_idx').on(table.email),
  subscriptionIdx: index('users_subscription_tier_idx').on(table.subscriptionTier),
}))

// ==================== WATCHLISTS TABLE ====================
export const watchlists = pgTable('watchlists', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('watchlists_user_id_idx').on(table.userId),
  userIdNameIdx: index('watchlists_user_id_name_idx').on(table.userId, table.name),
}))

// ==================== WATCHLIST ITEMS TABLE ====================
export const watchlistItems = pgTable('watchlist_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  watchlistId: text('watchlist_id').notNull().references(() => watchlists.id, { onDelete: 'cascade' }),
  symbol: varchar('symbol', { length: 10 }).notNull(),
  notes: text('notes'),
  addedAt: timestamp('added_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  watchlistIdIdx: index('watchlist_items_watchlist_id_idx').on(table.watchlistId),
  symbolIdx: index('watchlist_items_symbol_idx').on(table.symbol),
  watchlistSymbolIdx: index('watchlist_items_watchlist_symbol_idx').on(table.watchlistId, table.symbol),
}))

// ==================== STOCK ALERTS TABLE ====================
export const stockAlerts = pgTable('stock_alerts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  symbol: varchar('symbol', { length: 10 }).notNull(),
  condition: alertConditionEnum('condition').notNull(),
  targetPrice: decimal('target_price', { precision: 15, scale: 2 }).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  triggeredAt: timestamp('triggered_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('stock_alerts_user_id_idx').on(table.userId),
  symbolIdx: index('stock_alerts_symbol_idx').on(table.symbol),
  isActiveIdx: index('stock_alerts_is_active_idx').on(table.isActive),
  userSymbolIdx: index('stock_alerts_user_symbol_idx').on(table.userId, table.symbol),
}))

// ==================== USER PREFERENCES TABLE ====================
export const userPreferences = pgTable('user_preferences', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  theme: themeEnum('theme').default('dark').notNull(),
  defaultChartType: chartTypeEnum('default_chart_type').default('line').notNull(),
  favoriteMetrics: jsonb('favorite_metrics').$type<string[]>().default([]),
  settings: jsonb('settings').$type<{
    notifications?: boolean
    emailAlerts?: boolean
    autoRefresh?: boolean
    refreshInterval?: number
    displayCurrency?: string
    timezone?: string
  }>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_preferences_user_id_idx').on(table.userId),
}))

// ==================== CHAT HISTORY TABLE ====================
export const chatHistory = pgTable('chat_history', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  message: text('message').notNull(),
  response: text('response').notNull(),
  context: jsonb('context').$type<{
    symbols?: string[]
    metrics?: string[]
    timeframe?: string
    sentiment?: 'positive' | 'negative' | 'neutral'
    sources?: string[]
  }>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('chat_history_user_id_idx').on(table.userId),
  createdAtIdx: index('chat_history_created_at_idx').on(table.createdAt),
  userIdCreatedAtIdx: index('chat_history_user_id_created_at_idx').on(table.userId, table.createdAt),
}))

// ==================== PORTFOLIO HOLDINGS TABLE ====================
export const portfolioHoldings = pgTable('portfolio_holdings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  symbol: varchar('symbol', { length: 10 }).notNull(),
  quantity: decimal('quantity', { precision: 15, scale: 4 }).notNull(),
  avgBuyPrice: decimal('avg_buy_price', { precision: 15, scale: 2 }).notNull(),
  currentValue: decimal('current_value', { precision: 15, scale: 2 }),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('portfolio_holdings_user_id_idx').on(table.userId),
  symbolIdx: index('portfolio_holdings_symbol_idx').on(table.symbol),
  userSymbolIdx: index('portfolio_holdings_user_symbol_idx').on(table.userId, table.symbol),
  lastUpdatedIdx: index('portfolio_holdings_last_updated_idx').on(table.lastUpdated),
}))

// ==================== RISK PROFILE TABLE ====================
export const riskProfiles = pgTable('risk_profiles', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  
  // Risk Assessment Results
  riskTolerance: riskToleranceEnum('risk_tolerance').notNull(),
  investmentHorizon: investmentHorizonEnum('investment_horizon').notNull(),
  investmentExperience: investmentExperienceEnum('investment_experience').notNull(),
  riskScore: decimal('risk_score', { precision: 5, scale: 2 }).notNull(), // 0-100 score
  
  // Questionnaire Answers (stored as JSON for flexibility)
  answers: jsonb('answers').$type<{
    q1_investment_goal: string
    q2_time_horizon: string
    q3_risk_reaction: string
    q4_loss_tolerance: string
    q5_investment_experience: string
    q6_income_stability: string
    q7_emergency_fund: string
    q8_investment_knowledge: string
  }>().notNull(),
  
  // Investment Preferences
  preferredSectors: jsonb('preferred_sectors').$type<string[]>().default([]),
  avoidSectors: jsonb('avoid_sectors').$type<string[]>().default([]),
  investmentAmount: decimal('investment_amount', { precision: 15, scale: 2 }),
  
  // Onboarding Status
  onboardingCompleted: boolean('onboarding_completed').default(true).notNull(),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('risk_profiles_user_id_idx').on(table.userId),
  riskToleranceIdx: index('risk_profiles_risk_tolerance_idx').on(table.riskTolerance),
}))

// ==================== RELATIONS ====================
export const usersRelations = relations(users, ({ many, one }) => ({
  watchlists: many(watchlists),
  stockAlerts: many(stockAlerts),
  preferences: one(userPreferences),
  chatHistory: many(chatHistory),
  portfolioHoldings: many(portfolioHoldings),
  riskProfile: one(riskProfiles),
}))

export const watchlistsRelations = relations(watchlists, ({ one, many }) => ({
  user: one(users, {
    fields: [watchlists.userId],
    references: [users.id],
  }),
  items: many(watchlistItems),
}))

export const watchlistItemsRelations = relations(watchlistItems, ({ one }) => ({
  watchlist: one(watchlists, {
    fields: [watchlistItems.watchlistId],
    references: [watchlists.id],
  }),
}))

export const stockAlertsRelations = relations(stockAlerts, ({ one }) => ({
  user: one(users, {
    fields: [stockAlerts.userId],
    references: [users.id],
  }),
}))

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}))

export const chatHistoryRelations = relations(chatHistory, ({ one }) => ({
  user: one(users, {
    fields: [chatHistory.userId],
    references: [users.id],
  }),
}))

export const portfolioHoldingsRelations = relations(portfolioHoldings, ({ one }) => ({
  user: one(users, {
    fields: [portfolioHoldings.userId],
    references: [users.id],
  }),
}))

export const riskProfilesRelations = relations(riskProfiles, ({ one }) => ({
  user: one(users, {
    fields: [riskProfiles.userId],
    references: [users.id],
  }),
}))

// ==================== TYPE EXPORTS ====================
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Watchlist = typeof watchlists.$inferSelect
export type NewWatchlist = typeof watchlists.$inferInsert
export type WatchlistItem = typeof watchlistItems.$inferSelect
export type NewWatchlistItem = typeof watchlistItems.$inferInsert
export type StockAlert = typeof stockAlerts.$inferSelect
export type NewStockAlert = typeof stockAlerts.$inferInsert
export type UserPreferences = typeof userPreferences.$inferSelect
export type NewUserPreferences = typeof userPreferences.$inferInsert
export type ChatHistory = typeof chatHistory.$inferSelect
export type NewChatHistory = typeof chatHistory.$inferInsert
export type PortfolioHolding = typeof portfolioHoldings.$inferSelect
export type NewPortfolioHolding = typeof portfolioHoldings.$inferInsert
export type RiskProfile = typeof riskProfiles.$inferSelect
export type NewRiskProfile = typeof riskProfiles.$inferInsert
