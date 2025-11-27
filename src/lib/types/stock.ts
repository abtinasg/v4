// Stock Quote Types
export interface StockQuote {
  symbol: string
  shortName: string
  longName: string
  price: number
  previousClose: number
  open: number
  dayHigh: number
  dayLow: number
  change: number
  changePercent: number
  volume: number
  avgVolume: number
  marketCap: number
  peRatio: number | null
  eps: number | null
  dividend: number | null
  dividendYield: number | null
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
  exchange: string
  currency: string
  marketState: 'PRE' | 'REGULAR' | 'POST' | 'CLOSED'
  timestamp: number
}

// Historical Data Types
export interface HistoricalDataPoint {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
  adjClose: number
}

export interface HistoricalData {
  symbol: string
  data: HistoricalDataPoint[]
  interval: string
  range: string
}

// Stock Profile Types
export interface StockProfile {
  symbol: string
  shortName: string
  longName: string
  sector: string
  industry: string
  website: string
  description: string
  fullTimeEmployees: number
  country: string
  city: string
  state: string
  address: string
  zip: string
  phone: string
  ceo: string | null
}

// Search Result Types
export interface StockSearchResult {
  symbol: string
  shortName: string
  longName: string
  exchange: string
  type: string
  score: number
}

// Market Index Types
export interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  timestamp: number
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  cached?: boolean
  timestamp: number
}

// Chart Data Types
export interface ChartDataPoint {
  time: number
  value: number
}

export interface CandlestickDataPoint {
  time: number
  open: number
  high: number
  low: number
  close: number
}

// Watchlist Types
export interface WatchlistStock extends StockQuote {
  addedAt: Date
  notes?: string
}

// Alert Types
export type AlertCondition = 
  | 'price_above'
  | 'price_below'
  | 'percent_change_up'
  | 'percent_change_down'
  | 'volume_above'

export interface StockAlert {
  id: string
  symbol: string
  condition: AlertCondition
  targetValue: number
  currentValue: number
  triggered: boolean
  createdAt: Date
  triggeredAt?: Date
}

// News Types
export interface StockNews {
  title: string
  description: string
  url: string
  source: string
  publishedAt: string
  thumbnail?: string
}

// Options Types
export interface OptionContract {
  symbol: string
  strike: number
  expiration: string
  type: 'call' | 'put'
  bid: number
  ask: number
  lastPrice: number
  volume: number
  openInterest: number
  impliedVolatility: number
}

// Insider Trading Types
export interface InsiderTransaction {
  name: string
  relation: string
  transactionDate: string
  transactionType: string
  shares: number
  value: number
  sharesOwned: number
}

// Earnings Types
export interface EarningsData {
  date: string
  epsEstimate: number | null
  epsActual: number | null
  surprise: number | null
  surprisePercent: number | null
  revenue: number | null
  revenueEstimate: number | null
}

// Financial Statements Types
export interface IncomeStatement {
  date: string
  revenue: number
  costOfRevenue: number
  grossProfit: number
  operatingExpenses: number
  operatingIncome: number
  netIncome: number
  eps: number
  ebitda: number
}

export interface BalanceSheet {
  date: string
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  cash: number
  debt: number
  currentAssets: number
  currentLiabilities: number
}

export interface CashFlowStatement {
  date: string
  operatingCashFlow: number
  investingCashFlow: number
  financingCashFlow: number
  freeCashFlow: number
  capitalExpenditures: number
  dividendsPaid: number
}

// Key Statistics Types
export interface KeyStatistics {
  marketCap: number
  enterpriseValue: number
  trailingPE: number | null
  forwardPE: number | null
  pegRatio: number | null
  priceToBook: number | null
  priceToSales: number | null
  profitMargin: number | null
  operatingMargin: number | null
  returnOnAssets: number | null
  returnOnEquity: number | null
  revenuePerShare: number | null
  quarterlyRevenueGrowth: number | null
  grossProfit: number | null
  ebitda: number | null
  debtToEquity: number | null
  currentRatio: number | null
  bookValue: number | null
  beta: number | null
  fiftyDayAverage: number | null
  twoHundredDayAverage: number | null
  sharesOutstanding: number | null
  sharesFloat: number | null
  percentHeldByInsiders: number | null
  percentHeldByInstitutions: number | null
  shortRatio: number | null
  shortPercentOfFloat: number | null
}

// Recommendation Types
export interface AnalystRecommendation {
  period: string
  strongBuy: number
  buy: number
  hold: number
  sell: number
  strongSell: number
}

// Price Target Types
export interface PriceTarget {
  current: number
  low: number
  high: number
  mean: number
  median: number
  numberOfAnalysts: number
}
