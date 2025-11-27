// Re-export database types
export type {
  User,
  NewUser,
  Watchlist,
  NewWatchlist,
  WatchlistItem,
  NewWatchlistItem,
  StockAlert,
  NewStockAlert,
  UserPreferences,
  NewUserPreferences,
  ChatHistory,
  NewChatHistory,
  PortfolioHolding,
  NewPortfolioHolding,
} from '@/lib/db/schema'

// API Response Types
export interface StockQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  high: number
  low: number
  open: number
  previousClose: number
  timestamp?: Date
}

export interface MarketIndex {
  symbol: string
  name: string
  value: number
  change: number
  changePercent: number
}

export interface StockSearchResult {
  symbol: string
  name: string
  exchange: string
  type?: string
}

// Chart Data Types
export interface ChartDataPoint {
  timestamp: Date
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface TimeSeriesData {
  symbol: string
  interval: '1min' | '5min' | '15min' | '30min' | '1hour' | '1day' | '1week' | '1month'
  data: ChartDataPoint[]
}

// Alert Types
export type AlertCondition = 'above' | 'below' | 'crosses_above' | 'crosses_below' | 'percent_change'
export type SubscriptionTier = 'free' | 'premium' | 'professional' | 'enterprise'
export type Theme = 'light' | 'dark' | 'system'
export type ChartType = 'line' | 'candlestick' | 'bar' | 'area'

// Preferences Types
export interface UserSettings {
  notifications?: boolean
  emailAlerts?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
  displayCurrency?: string
  timezone?: string
}

// Chat Context Types
export interface ChatContext {
  symbols?: string[]
  metrics?: string[]
  timeframe?: string
  sentiment?: 'positive' | 'negative' | 'neutral'
  sources?: string[]
}

// Portfolio Calculations
export interface PortfolioMetrics {
  totalValue: number
  totalCost: number
  totalGainLoss: number
  totalGainLossPercent: number
  topGainer?: {
    symbol: string
    gainPercent: number
  }
  topLoser?: {
    symbol: string
    lossPercent: number
  }
}

export interface HoldingWithMetrics extends PortfolioHolding {
  currentPrice: number
  totalValue: number
  totalCost: number
  gainLoss: number
  gainLossPercent: number
}

// API Response Wrappers
export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Watchlist with Items
export interface WatchlistWithItems extends Watchlist {
  items: WatchlistItem[]
  itemCount: number
}

// User with Relations
export interface UserWithRelations extends User {
  preferences?: UserPreferences
  watchlistCount?: number
  alertCount?: number
  portfolioValue?: number
}

// Filter and Sort Types
export interface WatchlistFilters {
  search?: string
  symbols?: string[]
}

export interface AlertFilters {
  symbol?: string
  isActive?: boolean
  condition?: AlertCondition
}

export interface SortOptions {
  field: string
  direction: 'asc' | 'desc'
}

// Notification Types
export interface Notification {
  id: string
  type: 'alert' | 'news' | 'system'
  title: string
  message: string
  read: boolean
  createdAt: Date
  link?: string
}

// Market Status
export interface MarketStatus {
  status: 'open' | 'closed' | 'pre-market' | 'after-hours'
  nextChange: Date
  timezone: string
}

// Real-time Data Types
export interface RealtimeQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  timestamp: Date
}

export interface RealtimeTrade {
  symbol: string
  price: number
  volume: number
  timestamp: Date
  side: 'buy' | 'sell'
}
