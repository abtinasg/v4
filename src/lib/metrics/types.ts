// Metric Categories
export type MetricCategory =
  | 'fundamental'
  | 'technical'
  | 'valuation'
  | 'quality'
  | 'growth'
  | 'efficiency'
  | 'liquidity'
  | 'leverage'

// Interpretation result
export type MetricInterpretation = 'good' | 'neutral' | 'bad'

// Format types for display
export type MetricFormat = 
  | 'number'      // 123.45
  | 'percentage'  // 12.34%
  | 'currency'    // $123.45
  | 'ratio'       // 1.23x
  | 'multiple'    // 12.3x
  | 'integer'     // 123

// Stock financial data input
export interface StockData {
  // Identification
  symbol?: string
  
  // Price data
  currentPrice: number
  previousClose?: number
  high52Week?: number
  low52Week?: number
  priceHistory?: number[] // For technical calculations
  volumeHistory?: number[]
  
  // Income Statement
  revenue?: number
  revenueGrowth?: number
  revenuePreviousYear?: number
  revenuePreviousQuarter?: number
  grossProfit?: number
  operatingIncome?: number
  netIncome?: number
  netIncomePreviousYear?: number
  ebitda?: number
  eps?: number
  epsDiluted?: number
  epsPreviousYear?: number
  
  // Balance Sheet
  totalAssets?: number
  totalAssetsPreviousYear?: number
  totalLiabilities?: number
  totalEquity?: number
  totalEquityPreviousYear?: number
  currentAssets?: number
  currentLiabilities?: number
  cash?: number
  cashAndEquivalents?: number
  shortTermInvestments?: number
  inventory?: number
  inventoryPreviousYear?: number
  accountsReceivable?: number
  accountsReceivablePreviousYear?: number
  accountsPayable?: number
  longTermDebt?: number
  shortTermDebt?: number
  totalDebt?: number
  retainedEarnings?: number
  bookValuePerShare?: number
  tangibleBookValue?: number
  
  // Cash Flow
  operatingCashFlow?: number
  capitalExpenditures?: number
  freeCashFlow?: number
  dividendsPaid?: number
  
  // Shares & Market
  sharesOutstanding?: number
  marketCap?: number
  enterpriseValue?: number
  
  // Ratios (pre-calculated)
  peRatio?: number
  forwardPE?: number
  pegRatio?: number
  priceToBook?: number
  priceToSales?: number
  evToEbitda?: number
  evToRevenue?: number
  
  // Dividends
  dividendYield?: number
  dividendPerShare?: number
  payoutRatio?: number
  
  // Growth rates
  revenueGrowthYoY?: number
  earningsGrowthYoY?: number
  revenueGrowthQoQ?: number
  earningsGrowthQoQ?: number
  revenue5YearCAGR?: number
  eps5YearCAGR?: number
  
  // Margins
  grossMargin?: number
  operatingMargin?: number
  netMargin?: number
  ebitdaMargin?: number
  
  // Analyst estimates
  targetPrice?: number
  epsEstimate?: number
  revenueEstimate?: number
  
  // Additional data for calculations
  costOfGoodsSold?: number
  interestExpense?: number
  taxExpense?: number
  depreciation?: number
  amortization?: number
  researchAndDevelopment?: number
  sellingGeneralAdmin?: number
  
  // Sector/Industry averages for comparison
  sectorPE?: number
  industryPE?: number
  sectorPB?: number
  industryPB?: number
}

// Main metric calculator interface
export interface MetricCalculator {
  id: string
  name: string
  shortName?: string
  category: MetricCategory
  calculate: (data: StockData) => number | null
  format: (value: number) => string
  formatType: MetricFormat
  description: string
  interpretation: (value: number, data?: StockData) => MetricInterpretation
  benchmark?: {
    good: number
    bad: number
    higherIsBetter: boolean
  }
  dependencies?: string[] // List of required data fields
}

// Calculated metric result
export interface MetricResult {
  id: string
  name: string
  shortName?: string
  category: MetricCategory
  value: number | null
  formatted: string
  interpretation: MetricInterpretation
  description: string
  benchmark?: {
    good: number
    bad: number
    higherIsBetter: boolean
  }
  error?: string
}

// Batch calculation result
export interface BatchMetricResult {
  symbol: string
  timestamp: number | Date
  metrics: Record<string, MetricResult>
  errors?: string[]
  calculatedCount?: number
  totalCount?: number
  calculatedAt?: string
  meta?: {
    totalMetrics: number
    calculated: number
    failed: number
    errors?: Record<string, string>
    calculationTimeMs: number
  }
}

// Cache entry
export interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

// Registry options
export interface RegistryOptions {
  enableCache?: boolean
  cacheTTL?: number // in milliseconds
  logErrors?: boolean
}
