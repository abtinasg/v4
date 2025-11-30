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
  credits: one(userCredits),
  creditTransactions: many(creditTransactions),
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

// ==================== CREDIT SYSTEM ENUMS ====================
export const transactionTypeEnum = pgEnum('transaction_type', [
  'purchase',      // Credit purchase
  'usage',         // Credit usage
  'refund',        // Credit refund
  'bonus',         // Bonus credits
  'monthly_reset', // Monthly free credits
  'admin_adjust'   // Admin adjustment
])

export const creditActionEnum = pgEnum('credit_action', [
  'stock_search',         // Stock search
  'real_time_quote',      // Real-time quote
  'technical_analysis',   // Technical analysis
  'financial_report',     // Financial report
  'ai_analysis',          // AI analysis
  'dcf_valuation',        // DCF valuation
  'stock_comparison',     // Stock comparison
  'news_fetch',           // News fetch
  'watchlist_alert',      // Watchlist alert
  'portfolio_analysis',   // Portfolio analysis
  'chat_message'          // AI chat message
])

// ==================== USER CREDITS TABLE ====================
export const userCredits = pgTable('user_credits', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  balance: decimal('balance', { precision: 15, scale: 2 }).notNull().default('0'),
  lifetimeCredits: decimal('lifetime_credits', { precision: 15, scale: 2 }).notNull().default('0'),
  freeCreditsUsed: decimal('free_credits_used', { precision: 15, scale: 2 }).notNull().default('0'),
  lastFreeCreditsReset: timestamp('last_free_credits_reset', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_credits_user_id_idx').on(table.userId),
  balanceIdx: index('user_credits_balance_idx').on(table.balance),
}))

// ==================== CREDIT TRANSACTIONS TABLE ====================
export const creditTransactions = pgTable('credit_transactions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  amount: decimal('amount', { precision: 15, scale: 2 }).notNull(), // مثبت = افزایش، منفی = کاهش
  type: transactionTypeEnum('type').notNull(),
  action: creditActionEnum('action'),
  description: text('description'),
  balanceBefore: decimal('balance_before', { precision: 15, scale: 2 }).notNull(),
  balanceAfter: decimal('balance_after', { precision: 15, scale: 2 }).notNull(),
  metadata: jsonb('metadata').$type<{
    symbol?: string
    packageId?: string
    stripePaymentId?: string
    apiEndpoint?: string
    ipAddress?: string
  }>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('credit_transactions_user_id_idx').on(table.userId),
  typeIdx: index('credit_transactions_type_idx').on(table.type),
  actionIdx: index('credit_transactions_action_idx').on(table.action),
  createdAtIdx: index('credit_transactions_created_at_idx').on(table.createdAt),
  userCreatedAtIdx: index('credit_transactions_user_created_at_idx').on(table.userId, table.createdAt),
}))

// ==================== CREDIT PACKAGES TABLE ====================
export const creditPackages = pgTable('credit_packages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  credits: decimal('credits', { precision: 15, scale: 2 }).notNull(),
  bonusCredits: decimal('bonus_credits', { precision: 15, scale: 2 }).notNull().default('0'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(), // قیمت به دلار
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  isActive: boolean('is_active').default(true).notNull(),
  isPopular: boolean('is_popular').default(false).notNull(),
  sortOrder: serial('sort_order'),
  stripePriceId: varchar('stripe_price_id', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  isActiveIdx: index('credit_packages_is_active_idx').on(table.isActive),
  sortOrderIdx: index('credit_packages_sort_order_idx').on(table.sortOrder),
}))

// ==================== RATE LIMIT TRACKING TABLE ====================
export const rateLimitTracking = pgTable('rate_limit_tracking', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }),
  ipAddress: varchar('ip_address', { length: 45 }),
  endpoint: varchar('endpoint', { length: 255 }).notNull(),
  requestCount: decimal('request_count', { precision: 10, scale: 0 }).notNull().default('1'),
  windowStart: timestamp('window_start', { withTimezone: true }).defaultNow().notNull(),
  windowEnd: timestamp('window_end', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('rate_limit_tracking_user_id_idx').on(table.userId),
  ipAddressIdx: index('rate_limit_tracking_ip_address_idx').on(table.ipAddress),
  endpointIdx: index('rate_limit_tracking_endpoint_idx').on(table.endpoint),
  windowEndIdx: index('rate_limit_tracking_window_end_idx').on(table.windowEnd),
}))

// ==================== SYSTEM SETTINGS TABLE ====================
export const systemSettings = pgTable('system_settings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  key: varchar('key', { length: 100 }).notNull().unique(),
  value: jsonb('value').notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull().default('general'),
  isPublic: boolean('is_public').default(false).notNull(),
  updatedBy: text('updated_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  keyIdx: index('system_settings_key_idx').on(table.key),
  categoryIdx: index('system_settings_category_idx').on(table.category),
}))

// ==================== AI PROMPTS TABLE ====================
export const aiPrompts = pgTable('ai_prompts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 100 }).notNull(),
  slug: varchar('slug', { length: 100 }).notNull().unique(),
  systemPrompt: text('system_prompt').notNull(),
  userPromptTemplate: text('user_prompt_template'),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull().default('general'),
  model: varchar('model', { length: 100 }).notNull().default('claude-sonnet-4-20250514'),
  temperature: decimal('temperature', { precision: 3, scale: 2 }).notNull().default('0.7'),
  maxTokens: decimal('max_tokens', { precision: 10, scale: 0 }).notNull().default('4096'),
  isActive: boolean('is_active').default(true).notNull(),
  version: decimal('version', { precision: 5, scale: 0 }).notNull().default('1'),
  variables: jsonb('variables').$type<string[]>().default([]),
  metadata: jsonb('metadata').$type<{
    costPerRequest?: number
    avgResponseTime?: number
    successRate?: number
  }>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  slugIdx: index('ai_prompts_slug_idx').on(table.slug),
  categoryIdx: index('ai_prompts_category_idx').on(table.category),
  isActiveIdx: index('ai_prompts_is_active_idx').on(table.isActive),
}))

// ==================== AI ACCESS CONTROL TABLE ====================
export const aiAccessControl = pgTable('ai_access_control', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  subscriptionTier: subscriptionTierEnum('subscription_tier').notNull(),
  feature: varchar('feature', { length: 100 }).notNull(),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  dailyLimit: decimal('daily_limit', { precision: 10, scale: 0 }),
  monthlyLimit: decimal('monthly_limit', { precision: 10, scale: 0 }),
  creditsPerUse: decimal('credits_per_use', { precision: 10, scale: 2 }).notNull().default('1'),
  priority: decimal('priority', { precision: 3, scale: 0 }).notNull().default('0'),
  metadata: jsonb('metadata').$type<{
    description?: string
    rateLimit?: { requests: number; window: number }
  }>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  tierFeatureIdx: index('ai_access_control_tier_feature_idx').on(table.subscriptionTier, table.feature),
  featureIdx: index('ai_access_control_feature_idx').on(table.feature),
}))

// ==================== RATE LIMIT CONFIG TABLE ====================
export const rateLimitConfig = pgTable('rate_limit_config', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  endpoint: varchar('endpoint', { length: 255 }).notNull(),
  subscriptionTier: subscriptionTierEnum('subscription_tier'),
  requestsPerMinute: decimal('requests_per_minute', { precision: 10, scale: 0 }).notNull().default('60'),
  requestsPerHour: decimal('requests_per_hour', { precision: 10, scale: 0 }).notNull().default('1000'),
  requestsPerDay: decimal('requests_per_day', { precision: 10, scale: 0 }).notNull().default('10000'),
  burstLimit: decimal('burst_limit', { precision: 10, scale: 0 }).notNull().default('10'),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  description: text('description'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  endpointIdx: index('rate_limit_config_endpoint_idx').on(table.endpoint),
  tierIdx: index('rate_limit_config_tier_idx').on(table.subscriptionTier),
  endpointTierIdx: index('rate_limit_config_endpoint_tier_idx').on(table.endpoint, table.subscriptionTier),
}))

// ==================== CREDIT SYSTEM RELATIONS ====================
export const userCreditsRelations = relations(userCredits, ({ one }) => ({
  user: one(users, {
    fields: [userCredits.userId],
    references: [users.id],
  }),
}))

export const creditTransactionsRelations = relations(creditTransactions, ({ one }) => ({
  user: one(users, {
    fields: [creditTransactions.userId],
    references: [users.id],
  }),
}))

export const rateLimitTrackingRelations = relations(rateLimitTracking, ({ one }) => ({
  user: one(users, {
    fields: [rateLimitTracking.userId],
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

// Credit System Types
export type UserCredit = typeof userCredits.$inferSelect
export type NewUserCredit = typeof userCredits.$inferInsert
export type CreditTransaction = typeof creditTransactions.$inferSelect
export type NewCreditTransaction = typeof creditTransactions.$inferInsert
export type CreditPackage = typeof creditPackages.$inferSelect
export type NewCreditPackage = typeof creditPackages.$inferInsert
export type RateLimitTracking = typeof rateLimitTracking.$inferSelect
export type NewRateLimitTracking = typeof rateLimitTracking.$inferInsert

// System & AI Types
export type SystemSetting = typeof systemSettings.$inferSelect
export type NewSystemSetting = typeof systemSettings.$inferInsert
export type AiPrompt = typeof aiPrompts.$inferSelect
export type NewAiPrompt = typeof aiPrompts.$inferInsert
export type AiAccessControl = typeof aiAccessControl.$inferSelect
export type NewAiAccessControl = typeof aiAccessControl.$inferInsert
export type RateLimitConfig = typeof rateLimitConfig.$inferSelect
export type NewRateLimitConfig = typeof rateLimitConfig.$inferInsert
