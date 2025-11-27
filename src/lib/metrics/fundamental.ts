import type { MetricCalculator, StockData, MetricInterpretation } from './types'

/**
 * Fundamental Metrics - 30 Comprehensive Metrics
 * Categories: Valuation (10), Profitability (10), Financial Health (10)
 */

// ==================== VALUATION METRICS (10) ====================

// 1. P/E Ratio (Price to Earnings)
export const peRatio: MetricCalculator = {
  id: 'pe_ratio',
  name: 'Price to Earnings Ratio',
  shortName: 'P/E',
  category: 'fundamental',
  calculate: (data: StockData) => {
    if (data.peRatio !== undefined) return data.peRatio
    if (!data.currentPrice || !data.eps || data.eps === 0) return null
    return data.currentPrice / data.eps
  },
  format: (value: number) => `${value.toFixed(2)}x`,
  formatType: 'multiple',
  description: 'Price paid for each dollar of earnings. Lower may indicate undervaluation.',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 0) return 'bad' // Negative earnings
    if (value < 15) return 'good'
    if (value > 30) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 15, bad: 30, higherIsBetter: false },
  dependencies: ['currentPrice', 'eps'],
}

// 2. P/B Ratio (Price to Book)
export const pbRatio: MetricCalculator = {
  id: 'pb_ratio',
  name: 'Price to Book Ratio',
  shortName: 'P/B',
  category: 'fundamental',
  calculate: (data: StockData) => {
    if (data.priceToBook !== undefined) return data.priceToBook
    if (!data.currentPrice || !data.bookValuePerShare || data.bookValuePerShare === 0) return null
    return data.currentPrice / data.bookValuePerShare
  },
  format: (value: number) => `${value.toFixed(2)}x`,
  formatType: 'multiple',
  description: 'Price relative to book value. Below 1 may indicate undervaluation.',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 0) return 'bad'
    if (value < 1) return 'good'
    if (value > 3) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 1, bad: 3, higherIsBetter: false },
  dependencies: ['currentPrice', 'bookValuePerShare'],
}

// 3. P/S Ratio (Price to Sales)
export const psRatio: MetricCalculator = {
  id: 'ps_ratio',
  name: 'Price to Sales Ratio',
  shortName: 'P/S',
  category: 'fundamental',
  calculate: (data: StockData) => {
    if (data.priceToSales !== undefined) return data.priceToSales
    if (!data.marketCap || !data.revenue || data.revenue === 0) return null
    return data.marketCap / data.revenue
  },
  format: (value: number) => `${value.toFixed(2)}x`,
  formatType: 'multiple',
  description: 'Market value relative to revenue. Useful for unprofitable companies.',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 0) return 'bad'
    if (value < 2) return 'good'
    if (value > 8) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 2, bad: 8, higherIsBetter: false },
  dependencies: ['marketCap', 'revenue'],
}

// 4. PEG Ratio (P/E to Growth)
export const pegRatio: MetricCalculator = {
  id: 'peg_ratio',
  name: 'PEG Ratio',
  shortName: 'PEG',
  category: 'fundamental',
  calculate: (data: StockData) => {
    if (data.pegRatio !== undefined) return data.pegRatio
    const pe = data.peRatio || (data.currentPrice && data.eps && data.eps !== 0 ? data.currentPrice / data.eps : null)
    const growth = data.earningsGrowthYoY
    if (!pe || !growth || growth === 0) return null
    return pe / growth
  },
  format: (value: number) => `${value.toFixed(2)}`,
  formatType: 'ratio',
  description: 'P/E ratio divided by earnings growth rate. Below 1 suggests undervaluation relative to growth.',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 0) return 'bad'
    if (value < 1) return 'good'
    if (value > 2) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 1, bad: 2, higherIsBetter: false },
  dependencies: ['peRatio', 'earningsGrowthYoY'],
}

// 6. Price to Cash Flow
export const priceToCashFlow: MetricCalculator = {
  id: 'price_to_cash_flow',
  name: 'Price to Cash Flow',
  shortName: 'P/CF',
  category: 'fundamental',
  calculate: (data: StockData) => {
    if (!data.marketCap || !data.operatingCashFlow || data.operatingCashFlow === 0) return null
    return data.marketCap / data.operatingCashFlow
  },
  format: (value: number) => `${value.toFixed(2)}x`,
  formatType: 'multiple',
  description: 'Market cap relative to operating cash flow. Lower suggests better value.',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 0) return 'bad'
    if (value < 10) return 'good'
    if (value > 20) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 10, bad: 20, higherIsBetter: false },
  dependencies: ['marketCap', 'operatingCashFlow'],
}

// 7. Price to Free Cash Flow
export const priceToFreeCashFlow: MetricCalculator = {
  id: 'price_to_fcf',
  name: 'Price to Free Cash Flow',
  shortName: 'P/FCF',
  category: 'fundamental',
  calculate: (data: StockData) => {
    if (!data.marketCap || !data.freeCashFlow || data.freeCashFlow === 0) return null
    return data.marketCap / data.freeCashFlow
  },
  format: (value: number) => `${value.toFixed(2)}x`,
  formatType: 'multiple',
  description: 'Market cap relative to free cash flow. Lower is better.',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 0) return 'bad'
    if (value < 15) return 'good'
    if (value > 25) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 15, bad: 25, higherIsBetter: false },
  dependencies: ['marketCap', 'freeCashFlow'],
}

// 8. Enterprise Value
export const enterpriseValueMetric: MetricCalculator = {
  id: 'enterprise_value',
  name: 'Enterprise Value',
  shortName: 'EV',
  category: 'fundamental',
  calculate: (data: StockData) => {
    if (data.enterpriseValue !== undefined) return data.enterpriseValue
    if (!data.marketCap) return null
    const debt = data.totalDebt || 0
    const cash = data.cashAndEquivalents || data.cash || 0
    return data.marketCap + debt - cash
  },
  format: (value: number) => {
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
    return `$${value.toLocaleString()}`
  },
  formatType: 'currency',
  description: 'Total company value including debt, minus cash.',
  interpretation: (): MetricInterpretation => 'neutral',
  dependencies: ['marketCap', 'totalDebt', 'cash'],
}

// 9. Market Cap to GDP (not implemented - requires GDP data)
export const marketCapToGDP: MetricCalculator = {
  id: 'market_cap_to_gdp',
  name: 'Market Cap to GDP',
  shortName: 'MC/GDP',
  category: 'fundamental',
  calculate: () => null, // Requires external GDP data
  format: (value: number) => `${value.toFixed(2)}%`,
  formatType: 'percentage',
  description: 'Market cap as percentage of GDP. Requires external data.',
  interpretation: (): MetricInterpretation => 'neutral',
  dependencies: ['marketCap'],
}

// Dividend Yield
export const dividendYieldMetric: MetricCalculator = {
  id: 'dividend_yield',
  name: 'Dividend Yield',
  shortName: 'Div Yield',
  category: 'fundamental',
  calculate: (data: StockData) => {
    if (data.dividendYield !== undefined) return data.dividendYield
    if (!data.dividendPerShare || !data.currentPrice || data.currentPrice === 0) return null
    return (data.dividendPerShare / data.currentPrice) * 100
  },
  format: (value: number) => `${value.toFixed(2)}%`,
  formatType: 'percentage',
  description: 'Annual dividend as percentage of stock price.',
  interpretation: (value: number): MetricInterpretation => {
    if (value === 0) return 'neutral'
    if (value >= 2 && value <= 6) return 'good'
    if (value > 8) return 'bad' // Unsustainably high
    return 'neutral'
  },
  benchmark: { good: 3, bad: 8, higherIsBetter: true },
  dependencies: ['dividendPerShare', 'currentPrice'],
}

// Payout Ratio
export const payoutRatioMetric: MetricCalculator = {
  id: 'payout_ratio',
  name: 'Dividend Payout Ratio',
  shortName: 'Payout',
  category: 'fundamental',
  calculate: (data: StockData) => {
    if (data.payoutRatio !== undefined) return data.payoutRatio
    if (!data.dividendPerShare || !data.eps || data.eps === 0) return null
    return (data.dividendPerShare / data.eps) * 100
  },
  format: (value: number) => `${value.toFixed(1)}%`,
  formatType: 'percentage',
  description: 'Percentage of earnings paid as dividends.',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 0 || value > 100) return 'bad'
    if (value >= 30 && value <= 60) return 'good'
    if (value > 80) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 50, bad: 80, higherIsBetter: false },
  dependencies: ['dividendPerShare', 'eps'],
}

// Export all fundamental metrics
export const fundamentalMetrics: MetricCalculator[] = [
  peRatio,
  pbRatio,
  psRatio,
  pegRatio,
  priceToCashFlow,
  priceToFreeCashFlow,
  enterpriseValueMetric,
  dividendYieldMetric,
  payoutRatioMetric,
]
