import { pgTable, text, varchar, timestamp, real, boolean, index, jsonb, serial, decimal, pgEnum, date, integer, uniqueIndex } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Enums for type safety
// Note: subscriptionTierEnum kept for backward compatibility with existing data
export const subscriptionTierEnum = pgEnum('subscription_tier', ['free', 'premium', 'professional', 'enterprise'])
export const alertConditionEnum = pgEnum('alert_condition', ['above', 'below', 'crosses_above', 'crosses_below', 'percent_change'])
export const themeEnum = pgEnum('theme', ['light', 'dark', 'system'])
export const chartTypeEnum = pgEnum('chart_type', ['line', 'candlestick', 'bar', 'area'])
export const riskToleranceEnum = pgEnum('risk_tolerance', ['conservative', 'moderate', 'aggressive'])
export const investmentHorizonEnum = pgEnum('investment_horizon', ['short_term', 'medium_term', 'long_term'])
export const investmentExperienceEnum = pgEnum('investment_experience', ['beginner', 'intermediate', 'advanced'])
export const portfolioTransactionTypeEnum = pgEnum('portfolio_transaction_type', ['buy', 'sell', 'dividend', 'split', 'transfer_in', 'transfer_out'])
export const portfolioAlertTypeEnum = pgEnum('portfolio_alert_type', ['price_above', 'price_below', 'percent_change', 'portfolio_value', 'daily_gain_loss', 'news'])
export const aiReportTypeEnum = pgEnum('ai_report_type', ['pro', 'retail', 'personalized'])
export const aiReportStatusEnum = pgEnum('ai_report_status', ['pending', 'generating', 'completed', 'failed'])
export const contactMessageStatusEnum = pgEnum('contact_message_status', ['new', 'read', 'replied', 'archived'])

// ==================== USERS TABLE ====================
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  clerkId: varchar('clerk_id', { length: 255 }).notNull().unique(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  // subscriptionTier kept for backward compatibility, but not used in new credit-based system
  subscriptionTier: subscriptionTierEnum('subscription_tier').notNull().default('free'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  clerkIdIdx: index('users_clerk_id_idx').on(table.clerkId),
  emailIdx: index('users_email_idx').on(table.email),
  // subscriptionIdx removed - no longer needed in credit-based system
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
  portfolioId: text('portfolio_id').references(() => portfolios.id, { onDelete: 'cascade' }),
  symbol: varchar('symbol', { length: 10 }).notNull(),
  quantity: decimal('quantity', { precision: 15, scale: 4 }).notNull(),
  avgBuyPrice: decimal('avg_buy_price', { precision: 15, scale: 2 }).notNull(),
  currentValue: decimal('current_value', { precision: 15, scale: 2 }),
  notes: text('notes'),
  targetPrice: decimal('target_price', { precision: 15, scale: 2 }),
  stopLoss: decimal('stop_loss', { precision: 15, scale: 2 }),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('portfolio_holdings_user_id_idx').on(table.userId),
  portfolioIdIdx: index('portfolio_holdings_portfolio_id_idx').on(table.portfolioId),
  symbolIdx: index('portfolio_holdings_symbol_idx').on(table.symbol),
  userSymbolIdx: index('portfolio_holdings_user_symbol_idx').on(table.userId, table.symbol),
  lastUpdatedIdx: index('portfolio_holdings_last_updated_idx').on(table.lastUpdated),
}))

// ==================== PORTFOLIOS TABLE ====================
export const portfolios = pgTable('portfolios', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  description: text('description'),
  isDefault: boolean('is_default').default(false).notNull(),
  currency: varchar('currency', { length: 3 }).notNull().default('USD'),
  initialValue: decimal('initial_value', { precision: 15, scale: 2 }).notNull().default('0'),
  isPublic: boolean('is_public').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('portfolios_user_id_idx').on(table.userId),
  isDefaultIdx: index('portfolios_is_default_idx').on(table.isDefault),
}))

// ==================== PORTFOLIO TRANSACTIONS TABLE ====================
export const portfolioTransactions = pgTable('portfolio_transactions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  portfolioId: text('portfolio_id').notNull().references(() => portfolios.id, { onDelete: 'cascade' }),
  holdingId: text('holding_id').references(() => portfolioHoldings.id, { onDelete: 'set null' }),
  symbol: varchar('symbol', { length: 10 }).notNull(),
  type: portfolioTransactionTypeEnum('type').notNull(),
  quantity: decimal('quantity', { precision: 15, scale: 4 }).notNull(),
  price: decimal('price', { precision: 15, scale: 2 }).notNull(),
  totalAmount: decimal('total_amount', { precision: 15, scale: 2 }).notNull(),
  fees: decimal('fees', { precision: 10, scale: 2 }).default('0'),
  notes: text('notes'),
  executedAt: timestamp('executed_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  portfolioIdIdx: index('portfolio_transactions_portfolio_id_idx').on(table.portfolioId),
  holdingIdIdx: index('portfolio_transactions_holding_id_idx').on(table.holdingId),
  symbolIdx: index('portfolio_transactions_symbol_idx').on(table.symbol),
  typeIdx: index('portfolio_transactions_type_idx').on(table.type),
  executedAtIdx: index('portfolio_transactions_executed_at_idx').on(table.executedAt),
}))

// ==================== PORTFOLIO ALERTS TABLE ====================
export const portfolioAlerts = pgTable('portfolio_alerts', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  portfolioId: text('portfolio_id').references(() => portfolios.id, { onDelete: 'cascade' }),
  holdingId: text('holding_id').references(() => portfolioHoldings.id, { onDelete: 'cascade' }),
  symbol: varchar('symbol', { length: 10 }),
  alertType: portfolioAlertTypeEnum('alert_type').notNull(),
  conditionValue: decimal('condition_value', { precision: 15, scale: 2 }),
  conditionPercent: decimal('condition_percent', { precision: 8, scale: 4 }),
  message: text('message'),
  isActive: boolean('is_active').default(true).notNull(),
  isEmailEnabled: boolean('is_email_enabled').default(true).notNull(),
  isPushEnabled: boolean('is_push_enabled').default(true).notNull(),
  lastTriggeredAt: timestamp('last_triggered_at', { withTimezone: true }),
  triggerCount: integer('trigger_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('portfolio_alerts_user_id_idx').on(table.userId),
  portfolioIdIdx: index('portfolio_alerts_portfolio_id_idx').on(table.portfolioId),
  holdingIdIdx: index('portfolio_alerts_holding_id_idx').on(table.holdingId),
  isActiveIdx: index('portfolio_alerts_is_active_idx').on(table.isActive),
  symbolIdx: index('portfolio_alerts_symbol_idx').on(table.symbol),
}))

// ==================== PORTFOLIO SNAPSHOTS TABLE ====================
export const portfolioSnapshots = pgTable('portfolio_snapshots', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  portfolioId: text('portfolio_id').notNull().references(() => portfolios.id, { onDelete: 'cascade' }),
  totalValue: decimal('total_value', { precision: 15, scale: 2 }).notNull(),
  totalCost: decimal('total_cost', { precision: 15, scale: 2 }).notNull(),
  totalGainLoss: decimal('total_gain_loss', { precision: 15, scale: 2 }).notNull(),
  totalGainLossPercent: decimal('total_gain_loss_percent', { precision: 8, scale: 4 }).notNull(),
  dayChange: decimal('day_change', { precision: 15, scale: 2 }),
  dayChangePercent: decimal('day_change_percent', { precision: 8, scale: 4 }),
  holdingsCount: integer('holdings_count').notNull(),
  snapshotDate: date('snapshot_date').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  portfolioIdIdx: index('portfolio_snapshots_portfolio_id_idx').on(table.portfolioId),
  dateIdx: index('portfolio_snapshots_date_idx').on(table.snapshotDate),
  portfolioDateIdx: uniqueIndex('portfolio_snapshots_portfolio_date_idx').on(table.portfolioId, table.snapshotDate),
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
  portfolios: many(portfolios),
  portfolioHoldings: many(portfolioHoldings),
  portfolioAlerts: many(portfolioAlerts),
  riskProfile: one(riskProfiles),
  detailedRiskAssessment: one(detailedRiskAssessments),
  credits: one(userCredits),
  creditTransactions: many(creditTransactions),
  cryptoPayments: many(cryptoPayments),
  pushSubscriptions: many(pushSubscriptions),
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

export const portfolioHoldingsRelations = relations(portfolioHoldings, ({ one, many }) => ({
  user: one(users, {
    fields: [portfolioHoldings.userId],
    references: [users.id],
  }),
  portfolio: one(portfolios, {
    fields: [portfolioHoldings.portfolioId],
    references: [portfolios.id],
  }),
  transactions: many(portfolioTransactions),
  alerts: many(portfolioAlerts),
}))

export const portfoliosRelations = relations(portfolios, ({ one, many }) => ({
  user: one(users, {
    fields: [portfolios.userId],
    references: [users.id],
  }),
  holdings: many(portfolioHoldings),
  transactions: many(portfolioTransactions),
  alerts: many(portfolioAlerts),
  snapshots: many(portfolioSnapshots),
}))

export const portfolioTransactionsRelations = relations(portfolioTransactions, ({ one }) => ({
  portfolio: one(portfolios, {
    fields: [portfolioTransactions.portfolioId],
    references: [portfolios.id],
  }),
  holding: one(portfolioHoldings, {
    fields: [portfolioTransactions.holdingId],
    references: [portfolioHoldings.id],
  }),
}))

export const portfolioAlertsRelations = relations(portfolioAlerts, ({ one }) => ({
  user: one(users, {
    fields: [portfolioAlerts.userId],
    references: [users.id],
  }),
  portfolio: one(portfolios, {
    fields: [portfolioAlerts.portfolioId],
    references: [portfolios.id],
  }),
  holding: one(portfolioHoldings, {
    fields: [portfolioAlerts.holdingId],
    references: [portfolioHoldings.id],
  }),
}))

export const portfolioSnapshotsRelations = relations(portfolioSnapshots, ({ one }) => ({
  portfolio: one(portfolios, {
    fields: [portfolioSnapshots.portfolioId],
    references: [portfolios.id],
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
  'admin_adjust',  // Admin adjustment
  'promo'          // Promo code redemption
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
  model: varchar('model', { length: 100 }).notNull().default('anthropic/claude-sonnet-4.5'),
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
// Simplified for credit-based system - no tier-based access
export const aiAccessControl = pgTable('ai_access_control', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  // subscriptionTier kept for backward compatibility but not actively used
  subscriptionTier: subscriptionTierEnum('subscription_tier'),
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
  featureIdx: index('ai_access_control_feature_idx').on(table.feature),
}))

// ==================== RATE LIMIT CONFIG TABLE ====================
// Simplified for credit-based system - same limits for all users
export const rateLimitConfig = pgTable('rate_limit_config', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  endpoint: varchar('endpoint', { length: 255 }).notNull(),
  // subscriptionTier kept for backward compatibility but not actively used
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
}))

// ==================== PROMO CODES TABLE ====================
export const promoCodes = pgTable('promo_codes', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  code: varchar('code', { length: 50 }).notNull().unique(),
  type: varchar('type', { length: 20 }).notNull().default('credits'), // 'credits' | 'discount' | 'trial'
  credits: decimal('credits', { precision: 15, scale: 2 }), // تعداد کردیت رایگان
  discountPercent: decimal('discount_percent', { precision: 5, scale: 2 }), // درصد تخفیف
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }), // مبلغ تخفیف
  trialDays: decimal('trial_days', { precision: 5, scale: 0 }), // روزهای رایگان
  maxUses: decimal('max_uses', { precision: 10, scale: 0 }), // حداکثر استفاده کلی
  usedCount: decimal('used_count', { precision: 10, scale: 0 }).notNull().default('0'),
  maxUsesPerUser: decimal('max_uses_per_user', { precision: 5, scale: 0 }).notNull().default('1'),
  minPurchaseAmount: decimal('min_purchase_amount', { precision: 10, scale: 2 }), // حداقل خرید
  applicablePackages: jsonb('applicable_packages').$type<string[]>(), // پکیج‌های قابل اعمال
  applicableTiers: jsonb('applicable_tiers').$type<string[]>(), // تیرهای قابل استفاده
  startsAt: timestamp('starts_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  isActive: boolean('is_active').default(true).notNull(),
  description: text('description'),
  createdBy: text('created_by'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  codeIdx: index('promo_codes_code_idx').on(table.code),
  isActiveIdx: index('promo_codes_is_active_idx').on(table.isActive),
  expiresAtIdx: index('promo_codes_expires_at_idx').on(table.expiresAt),
}))

// ==================== PROMO CODE USAGE TABLE ====================
export const promoCodeUsage = pgTable('promo_code_usage', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  promoCodeId: text('promo_code_id').notNull().references(() => promoCodes.id, { onDelete: 'cascade' }),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  creditsAwarded: decimal('credits_awarded', { precision: 15, scale: 2 }),
  discountApplied: decimal('discount_applied', { precision: 10, scale: 2 }),
  purchaseId: text('purchase_id'), // آیدی خرید مرتبط (اگر برای خرید استفاده شده)
  metadata: jsonb('metadata').$type<{
    ipAddress?: string
    userAgent?: string
    packageId?: string
  }>(),
  usedAt: timestamp('used_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  promoCodeIdIdx: index('promo_code_usage_promo_code_id_idx').on(table.promoCodeId),
  userIdIdx: index('promo_code_usage_user_id_idx').on(table.userId),
  promoUserIdx: index('promo_code_usage_promo_user_idx').on(table.promoCodeId, table.userId),
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

export const promoCodesRelations = relations(promoCodes, ({ many }) => ({
  usages: many(promoCodeUsage),
}))

export const promoCodeUsageRelations = relations(promoCodeUsage, ({ one }) => ({
  promoCode: one(promoCodes, {
    fields: [promoCodeUsage.promoCodeId],
    references: [promoCodes.id],
  }),
  user: one(users, {
    fields: [promoCodeUsage.userId],
    references: [users.id],
  }),
}))

// ==================== PAYMENT STATUS ENUM ====================
export const paymentStatusEnum = pgEnum('payment_status', [
  'pending',
  'waiting',
  'confirming',
  'confirmed',
  'sending',
  'partially_paid',
  'finished',
  'failed',
  'refunded',
  'expired'
])

export const paymentProviderEnum = pgEnum('payment_provider', [
  'nowpayments',
  'stripe',
  'manual'
])

// ==================== CRYPTO PAYMENTS TABLE ====================
export const cryptoPayments = pgTable('crypto_payments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  packageId: text('package_id').references(() => creditPackages.id),
  
  // Payment Provider Info
  provider: paymentProviderEnum('provider').notNull().default('nowpayments'),
  externalPaymentId: varchar('external_payment_id', { length: 255 }),
  externalInvoiceId: varchar('external_invoice_id', { length: 255 }),
  
  // Order Info
  orderId: varchar('order_id', { length: 100 }).notNull().unique(),
  orderDescription: text('order_description'),
  
  // Price Info
  priceAmount: decimal('price_amount', { precision: 15, scale: 2 }).notNull(),
  priceCurrency: varchar('price_currency', { length: 10 }).notNull().default('USD'),
  
  // Crypto Payment Info
  payAmount: decimal('pay_amount', { precision: 20, scale: 8 }),
  payCurrency: varchar('pay_currency', { length: 20 }),
  payAddress: varchar('pay_address', { length: 255 }),
  actuallyPaid: decimal('actually_paid', { precision: 20, scale: 8 }),
  
  // Status
  status: paymentStatusEnum('status').notNull().default('pending'),
  
  // Credits to be added
  creditsAmount: decimal('credits_amount', { precision: 15, scale: 2 }).notNull(),
  bonusCredits: decimal('bonus_credits', { precision: 15, scale: 2 }).notNull().default('0'),
  creditsAdded: boolean('credits_added').default(false).notNull(),
  
  // URLs
  invoiceUrl: varchar('invoice_url', { length: 500 }),
  successUrl: varchar('success_url', { length: 500 }),
  cancelUrl: varchar('cancel_url', { length: 500 }),
  
  // Metadata
  metadata: jsonb('metadata').$type<{
    ipAddress?: string
    userAgent?: string
    network?: string
    purchaseId?: string
    outcomeAmount?: number
    outcomeCurrency?: string
    networkPrecision?: number
    // Subscription payment fields
    planId?: string
    billingCycle?: string
    isSubscriptionPayment?: boolean
  }>(),
  
  // Timestamps
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('crypto_payments_user_id_idx').on(table.userId),
  packageIdIdx: index('crypto_payments_package_id_idx').on(table.packageId),
  orderIdIdx: index('crypto_payments_order_id_idx').on(table.orderId),
  externalPaymentIdIdx: index('crypto_payments_external_payment_id_idx').on(table.externalPaymentId),
  statusIdx: index('crypto_payments_status_idx').on(table.status),
  createdAtIdx: index('crypto_payments_created_at_idx').on(table.createdAt),
}))

// ==================== CRYPTO PAYMENTS RELATIONS ====================
export const cryptoPaymentsRelations = relations(cryptoPayments, ({ one }) => ({
  user: one(users, {
    fields: [cryptoPayments.userId],
    references: [users.id],
  }),
  package: one(creditPackages, {
    fields: [cryptoPayments.packageId],
    references: [creditPackages.id],
  }),
}))

// ==================== USER SUBSCRIPTIONS TABLE ====================
export const subscriptionStatusEnum = pgEnum('subscription_status', ['active', 'trial', 'cancelled', 'expired'])
export const subscriptionPlanEnum = pgEnum('subscription_plan', ['free', 'pro', 'premium', 'enterprise'])

export const userSubscriptions = pgTable('user_subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  planId: subscriptionPlanEnum('plan_id').notNull().default('free'),
  status: subscriptionStatusEnum('status').notNull().default('active'),
  trialEndsAt: timestamp('trial_ends_at', { withTimezone: true }),
  currentPeriodStart: timestamp('current_period_start', { withTimezone: true }).notNull().defaultNow(),
  currentPeriodEnd: timestamp('current_period_end', { withTimezone: true }).notNull(),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  // Payment info
  paymentMethod: varchar('payment_method', { length: 50 }), // 'crypto', 'stripe', etc.
  lastPaymentId: varchar('last_payment_id', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('user_subscriptions_user_id_idx').on(table.userId),
  statusIdx: index('user_subscriptions_status_idx').on(table.status),
  planIdIdx: index('user_subscriptions_plan_id_idx').on(table.planId),
  trialEndsAtIdx: index('user_subscriptions_trial_ends_at_idx').on(table.trialEndsAt),
  currentPeriodEndIdx: index('user_subscriptions_current_period_end_idx').on(table.currentPeriodEnd),
}))

// ==================== USER SUBSCRIPTIONS RELATIONS ====================
export const userSubscriptionsRelations = relations(userSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [userSubscriptions.userId],
    references: [users.id],
  }),
}))

// ==================== PUSH SUBSCRIPTIONS TABLE ====================
export const pushSubscriptions = pgTable('push_subscriptions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  endpoint: text('endpoint').notNull(),
  p256dh: text('p256dh').notNull(),
  auth: text('auth').notNull(),
  userAgent: text('user_agent'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('push_subscriptions_user_id_idx').on(table.userId),
  isActiveIdx: index('push_subscriptions_is_active_idx').on(table.isActive),
  endpointIdx: uniqueIndex('push_subscriptions_endpoint_idx').on(table.endpoint),
}))

// ==================== PUSH SUBSCRIPTIONS RELATIONS ====================
export const pushSubscriptionsRelations = relations(pushSubscriptions, ({ one }) => ({
  user: one(users, {
    fields: [pushSubscriptions.userId],
    references: [users.id],
  }),
}))

// ==================== RISK PROFILE CATEGORY ENUM ====================
export const riskProfileCategoryEnum = pgEnum('risk_profile_category', [
  'conservative',
  'moderate_conservative', 
  'balanced',
  'growth',
  'aggressive'
])

// ==================== DETAILED RISK ASSESSMENT TABLE ====================
// Comprehensive risk assessment with 25 questions, weighted scoring
export const detailedRiskAssessments = pgTable('detailed_risk_assessments', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  
  // Score Components (1.0 - 5.0 scale)
  capacityScore: decimal('capacity_score', { precision: 4, scale: 2 }).notNull(),
  willingnessScore: decimal('willingness_score', { precision: 4, scale: 2 }).notNull(),
  biasScore: decimal('bias_score', { precision: 4, scale: 2 }).notNull(),
  finalScore: decimal('final_score', { precision: 4, scale: 2 }).notNull(),
  
  // Category
  category: riskProfileCategoryEnum('category').notNull(),
  
  // All answers stored as JSONB for flexibility
  answers: jsonb('answers').$type<{
    // Risk Capacity (Q1-Q10)
    q1_emergency_fund: number;
    q2_income_stability: number;
    q3_investment_to_income_ratio: number;
    q4_investment_horizon: number;
    q5_liquidity_needs: number;
    q6_debt_ratio: number;
    q7_age: number;
    q8_dependents: number;
    q9_insurance_coverage: number;
    q10_investment_experience: number;
    // Risk Willingness (Q11-Q20)
    q11_reaction_to_20_drop: number;
    q12_max_tolerable_loss: number;
    q13_return_preference: number;
    q14_reaction_to_30_gain: number;
    q15_diversification_preference: number;
    q16_market_volatility_reaction: number;
    q17_uncertainty_comfort: number;
    q18_investment_goal_priority: number;
    q19_past_loss_experience: number;
    q20_financial_knowledge_self_assessment: number;
    // Behavioral Biases (Q21-Q25)
    q21_decision_confidence: number;
    q22_loss_vs_gain_focus: number;
    q23_investment_idea_sources: number;
    q24_selling_decision: number;
    q25_post_decision_review: number;
  }>().notNull(),
  
  // Full calculated result stored as JSONB
  fullResult: jsonb('full_result').$type<{
    capacityScore: {
      rawScore: number;
      weightedScore: number;
      normalizedScore: number;
      interpretation: string;
    };
    willingnessScore: {
      rawScore: number;
      normalizedScore: number;
      interpretation: string;
    };
    biasScore: {
      rawScore: number;
      normalizedScore: number;
      interpretation: string;
      biasDetails: {
        overconfidence: number;
        lossAversion: number;
        herding: number;
        dispositionEffect: number;
        hindsightBias: number;
      };
    };
    characteristics: string[];
    recommendedProducts: string[];
    assetAllocation: {
      stocks: number;
      bonds: number;
      alternatives?: number;
      cash?: number;
    };
    version: string;
  }>().notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('detailed_risk_assessments_user_id_idx').on(table.userId),
  categoryIdx: index('detailed_risk_assessments_category_idx').on(table.category),
  finalScoreIdx: index('detailed_risk_assessments_final_score_idx').on(table.finalScore),
}))

// ==================== DETAILED RISK ASSESSMENT RELATIONS ====================
export const detailedRiskAssessmentsRelations = relations(detailedRiskAssessments, ({ one }) => ({
  user: one(users, {
    fields: [detailedRiskAssessments.userId],
    references: [users.id],
  }),
}))

// ==================== PDF ANNOTATIONS TABLE ====================
export const pdfAnnotations = pgTable('pdf_annotations', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  symbol: varchar('symbol', { length: 10 }).notNull(),
  reportType: varchar('report_type', { length: 50 }).default('standard'),
  
  // Highlight data
  text: text('text').notNull(), // The highlighted text content
  color: varchar('color', { length: 20 }).notNull(), // Hex color code (e.g., #fef08a)
  // Position coordinates in pixels, relative to the content container's top-left corner
  // Used to overlay the highlight on the exact location of the text
  position: jsonb('position').$type<{
    top: number;    // Distance from top of container in pixels
    left: number;   // Distance from left of container in pixels
    width: number;  // Width of highlighted area in pixels
    height: number; // Height of highlighted area in pixels
  }>().notNull(),
  note: text('note'), // Optional note/comment about the highlight
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('pdf_annotations_user_id_idx').on(table.userId),
  symbolIdx: index('pdf_annotations_symbol_idx').on(table.symbol),
  userSymbolIdx: index('pdf_annotations_user_symbol_idx').on(table.userId, table.symbol),
}))

// ==================== AI REPORTS TABLE ====================
// Stores generated AI reports so users can access them after closing/refreshing
export const aiReports = pgTable('ai_reports', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  symbol: varchar('symbol', { length: 10 }).notNull(),
  companyName: varchar('company_name', { length: 255 }),
  reportType: aiReportTypeEnum('report_type').notNull(),
  status: aiReportStatusEnum('status').notNull().default('pending'),
  content: text('content'), // The full markdown content of the report
  error: text('error'), // Error message if generation failed
  metadata: jsonb('metadata').$type<{
    sector?: string;
    riskCategory?: string;
    riskScore?: number;
    generatedAt?: string;
  }>(),
  expiresAt: timestamp('expires_at', { withTimezone: true }), // Reports expire after 5 hours
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('ai_reports_user_id_idx').on(table.userId),
  symbolIdx: index('ai_reports_symbol_idx').on(table.symbol),
  userSymbolTypeIdx: index('ai_reports_user_symbol_type_idx').on(table.userId, table.symbol, table.reportType),
  statusIdx: index('ai_reports_status_idx').on(table.status),
  expiresAtIdx: index('ai_reports_expires_at_idx').on(table.expiresAt),
}))

// ==================== CONTACT MESSAGES TABLE ====================
// Stores contact form messages for admin review
export const contactMessages = pgTable('contact_messages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 500 }),
  message: text('message').notNull(),
  status: contactMessageStatusEnum('status').notNull().default('new'),
  adminReply: text('admin_reply'),
  repliedAt: timestamp('replied_at', { withTimezone: true }),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  statusIdx: index('contact_messages_status_idx').on(table.status),
  emailIdx: index('contact_messages_email_idx').on(table.email),
  createdAtIdx: index('contact_messages_created_at_idx').on(table.createdAt),
}))

// ==================== ABTIN ENUMS ====================
export const abtinChatModeEnum = pgEnum('abtin_chat_mode', ['brainstorm', 'debate'])
export const abtinTaskPriorityEnum = pgEnum('abtin_task_priority', ['low', 'medium', 'high', 'urgent'])
export const abtinTaskStatusEnum = pgEnum('abtin_task_status', ['pending', 'in_progress', 'completed', 'cancelled'])

// ==================== ABTIN USERS TABLE ====================
// Separate user management for Abtin section with Basic Auth
export const abtinUsers = pgTable('abtin_users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: varchar('username', { length: 100 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(), // Hashed password
  email: varchar('email', { length: 255 }),
  fullName: varchar('full_name', { length: 255 }),
  isActive: boolean('is_active').default(true).notNull(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  usernameIdx: index('abtin_users_username_idx').on(table.username),
  isActiveIdx: index('abtin_users_is_active_idx').on(table.isActive),
}))

// ==================== ABTIN CHAT SESSIONS TABLE ====================
// Manages multiple chat conversations (like ChatGPT)
export const abtinChatSessions = pgTable('abtin_chat_sessions', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  abtinUserId: text('abtin_user_id').notNull().references(() => abtinUsers.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull().default('New Chat'),
  mode: abtinChatModeEnum('mode').notNull().default('brainstorm'),
  model: varchar('model', { length: 100 }).notNull().default('openai/gpt-5.1'),
  isPinned: boolean('is_pinned').default(false).notNull(),
  lastMessageAt: timestamp('last_message_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('abtin_chat_sessions_user_id_idx').on(table.abtinUserId),
  lastMessageAtIdx: index('abtin_chat_sessions_last_message_at_idx').on(table.lastMessageAt),
  isPinnedIdx: index('abtin_chat_sessions_is_pinned_idx').on(table.isPinned),
}))

// ==================== ABTIN CHAT MESSAGES TABLE ====================
// Stores all messages for persistent chat history
export const abtinChatMessages = pgTable('abtin_chat_messages', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text('session_id').notNull().references(() => abtinChatSessions.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }).notNull(), // 'user' or 'assistant'
  content: text('content').notNull(),
  modelName: varchar('model_name', { length: 100 }), // Which model generated this (for assistant messages)
  metadata: jsonb('metadata').$type<{
    tokens?: number
    responseTime?: number
    model?: string
  }>(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  sessionIdIdx: index('abtin_chat_messages_session_id_idx').on(table.sessionId),
  roleIdx: index('abtin_chat_messages_role_idx').on(table.role),
  createdAtIdx: index('abtin_chat_messages_created_at_idx').on(table.createdAt),
}))

// ==================== ABTIN DAILY TASKS TABLE ====================
// Task management and daily planning
export const abtinDailyTasks = pgTable('abtin_daily_tasks', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  abtinUserId: text('abtin_user_id').notNull().references(() => abtinUsers.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  priority: abtinTaskPriorityEnum('priority').notNull().default('medium'),
  status: abtinTaskStatusEnum('status').notNull().default('pending'),
  category: varchar('category', { length: 100 }),
  tags: jsonb('tags').$type<string[]>().default([]),
  dueDate: timestamp('due_date', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
  estimatedMinutes: integer('estimated_minutes'),
  actualMinutes: integer('actual_minutes'),
  reminderAt: timestamp('reminder_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('abtin_daily_tasks_user_id_idx').on(table.abtinUserId),
  statusIdx: index('abtin_daily_tasks_status_idx').on(table.status),
  priorityIdx: index('abtin_daily_tasks_priority_idx').on(table.priority),
  dueDateIdx: index('abtin_daily_tasks_due_date_idx').on(table.dueDate),
  categoryIdx: index('abtin_daily_tasks_category_idx').on(table.category),
}))

// ==================== ABTIN USER SETTINGS TABLE ====================
// Personalized preferences for Abtin dashboard
export const abtinUserSettings = pgTable('abtin_user_settings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  abtinUserId: text('abtin_user_id').notNull().references(() => abtinUsers.id, { onDelete: 'cascade' }).unique(),
  defaultChatMode: abtinChatModeEnum('default_chat_mode').default('brainstorm'),
  defaultModel: varchar('default_model', { length: 100 }).default('openai/gpt-5.1'),
  theme: themeEnum('theme').default('dark').notNull(),
  dashboardLayout: jsonb('dashboard_layout').$type<{
    sidebarCollapsed?: boolean
    activeSections?: string[]
    widgetOrder?: string[]
  }>().default({}),
  notifications: jsonb('notifications').$type<{
    taskReminders?: boolean
    chatNotifications?: boolean
    dailySummary?: boolean
  }>().default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('abtin_user_settings_user_id_idx').on(table.abtinUserId),
}))

// ==================== ABTIN AUTH LOGS TABLE ====================
// Track authentication attempts for security
export const abtinAuthLogs = pgTable('abtin_auth_logs', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: varchar('username', { length: 100 }).notNull(),
  ipAddress: varchar('ip_address', { length: 45 }).notNull(),
  userAgent: text('user_agent'),
  success: boolean('success').notNull(),
  failureReason: varchar('failure_reason', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  usernameIdx: index('abtin_auth_logs_username_idx').on(table.username),
  ipAddressIdx: index('abtin_auth_logs_ip_address_idx').on(table.ipAddress),
  successIdx: index('abtin_auth_logs_success_idx').on(table.success),
  createdAtIdx: index('abtin_auth_logs_created_at_idx').on(table.createdAt),
}))

// ==================== ABTIN RELATIONS ====================
export const abtinUsersRelations = relations(abtinUsers, ({ many, one }) => ({
  chatSessions: many(abtinChatSessions),
  dailyTasks: many(abtinDailyTasks),
  settings: one(abtinUserSettings),
}))

export const abtinChatSessionsRelations = relations(abtinChatSessions, ({ one, many }) => ({
  user: one(abtinUsers, {
    fields: [abtinChatSessions.abtinUserId],
    references: [abtinUsers.id],
  }),
  messages: many(abtinChatMessages),
}))

export const abtinChatMessagesRelations = relations(abtinChatMessages, ({ one }) => ({
  session: one(abtinChatSessions, {
    fields: [abtinChatMessages.sessionId],
    references: [abtinChatSessions.id],
  }),
}))

export const abtinDailyTasksRelations = relations(abtinDailyTasks, ({ one }) => ({
  user: one(abtinUsers, {
    fields: [abtinDailyTasks.abtinUserId],
    references: [abtinUsers.id],
  }),
}))

export const abtinUserSettingsRelations = relations(abtinUserSettings, ({ one }) => ({
  user: one(abtinUsers, {
    fields: [abtinUserSettings.abtinUserId],
    references: [abtinUsers.id],
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
export type Portfolio = typeof portfolios.$inferSelect
export type NewPortfolio = typeof portfolios.$inferInsert
export type PortfolioTransaction = typeof portfolioTransactions.$inferSelect
export type NewPortfolioTransaction = typeof portfolioTransactions.$inferInsert
export type PortfolioAlert = typeof portfolioAlerts.$inferSelect
export type NewPortfolioAlert = typeof portfolioAlerts.$inferInsert
export type PortfolioSnapshot = typeof portfolioSnapshots.$inferSelect
export type NewPortfolioSnapshot = typeof portfolioSnapshots.$inferInsert
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

// Promo Code Types
export type PromoCode = typeof promoCodes.$inferSelect
export type NewPromoCode = typeof promoCodes.$inferInsert
export type PromoCodeUsage = typeof promoCodeUsage.$inferSelect
export type NewPromoCodeUsage = typeof promoCodeUsage.$inferInsert

// Crypto Payment Types
export type CryptoPayment = typeof cryptoPayments.$inferSelect
export type NewCryptoPayment = typeof cryptoPayments.$inferInsert

// User Subscription Types
export type UserSubscription = typeof userSubscriptions.$inferSelect
export type NewUserSubscription = typeof userSubscriptions.$inferInsert

// Push Subscription Types
export type PushSubscription = typeof pushSubscriptions.$inferSelect
export type NewPushSubscription = typeof pushSubscriptions.$inferInsert

// Detailed Risk Assessment Types
export type DetailedRiskAssessment = typeof detailedRiskAssessments.$inferSelect
export type NewDetailedRiskAssessment = typeof detailedRiskAssessments.$inferInsert

// PDF Annotations Types
export type PdfAnnotation = typeof pdfAnnotations.$inferSelect
export type NewPdfAnnotation = typeof pdfAnnotations.$inferInsert

// AI Reports Types
export type AiReport = typeof aiReports.$inferSelect
export type NewAiReport = typeof aiReports.$inferInsert

// Contact Messages Types
export type ContactMessage = typeof contactMessages.$inferSelect
export type NewContactMessage = typeof contactMessages.$inferInsert

// Abtin Types
export type AbtinUser = typeof abtinUsers.$inferSelect
export type NewAbtinUser = typeof abtinUsers.$inferInsert
export type AbtinChatSession = typeof abtinChatSessions.$inferSelect
export type NewAbtinChatSession = typeof abtinChatSessions.$inferInsert
export type AbtinChatMessage = typeof abtinChatMessages.$inferSelect
export type NewAbtinChatMessage = typeof abtinChatMessages.$inferInsert
export type AbtinDailyTask = typeof abtinDailyTasks.$inferSelect
export type NewAbtinDailyTask = typeof abtinDailyTasks.$inferInsert
export type AbtinUserSettings = typeof abtinUserSettings.$inferSelect
export type NewAbtinUserSettings = typeof abtinUserSettings.$inferInsert
export type AbtinAuthLog = typeof abtinAuthLogs.$inferSelect
export type NewAbtinAuthLog = typeof abtinAuthLogs.$inferInsert
