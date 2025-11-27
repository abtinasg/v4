import type { MetricCalculator, StockData, MetricInterpretation } from './types'

/**
 * Valuation Metrics
 * Metrics for determining if a stock is over/undervalued
 */

// Enterprise Value to EBITDA
export const evToEbitda: MetricCalculator = {
  id: 'ev_to_ebitda',
  name: 'EV/EBITDA',
  shortName: 'EV/EBITDA',
  category: 'valuation',
  calculate: (data: StockData) => {
    if (data.evToEbitda !== undefined) return data.evToEbitda
    if (!data.enterpriseValue || !data.ebitda || data.ebitda === 0) return null
    return data.enterpriseValue / data.ebitda
  },
  format: (value: number) => `${value.toFixed(2)}x`,
  formatType: 'multiple',
  description: 'Enterprise value relative to EBITDA. Popular for comparing companies with different capital structures.',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 0) return 'bad'
    if (value < 10) return 'good'
    if (value > 20) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 10, bad: 20, higherIsBetter: false },
  dependencies: ['enterpriseValue', 'ebitda'],
}

// EV to Revenue
export const evToRevenue: MetricCalculator = {
  id: 'ev_to_revenue',
  name: 'EV/Revenue',
  shortName: 'EV/Rev',
  category: 'valuation',
  calculate: (data: StockData) => {
    if (data.evToRevenue !== undefined) return data.evToRevenue
    if (!data.enterpriseValue || !data.revenue || data.revenue === 0) return null
    return data.enterpriseValue / data.revenue
  },
  format: (value: number) => `${value.toFixed(2)}x`,
  formatType: 'multiple',
  description: 'Enterprise value relative to revenue. Useful for high-growth companies.',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 0) return 'bad'
    if (value < 3) return 'good'
    if (value > 10) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 3, bad: 10, higherIsBetter: false },
  dependencies: ['enterpriseValue', 'revenue'],
}

// PEG Ratio
export const pegRatio: MetricCalculator = {
  id: 'peg_ratio',
  name: 'PEG Ratio',
  shortName: 'PEG',
  category: 'valuation',
  calculate: (data: StockData) => {
    if (data.pegRatio !== undefined) return data.pegRatio
    
    // Calculate P/E
    let pe = data.peRatio
    if (pe === undefined && data.currentPrice && data.eps && data.eps !== 0) {
      pe = data.currentPrice / data.eps
    }
    
    // Get growth rate
    const growth = data.earningsGrowthYoY ?? data.eps5YearCAGR
    
    if (!pe || !growth || growth === 0) return null
    return pe / growth
  },
  format: (value: number) => `${value.toFixed(2)}`,
  formatType: 'ratio',
  description: 'P/E ratio adjusted for growth. Below 1 suggests undervaluation.',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 0) return 'bad'
    if (value < 1) return 'good'
    if (value > 2) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 1, bad: 2, higherIsBetter: false },
  dependencies: ['peRatio', 'earningsGrowthYoY'],
}

// Graham Number
export const grahamNumber: MetricCalculator = {
  id: 'graham_number',
  name: 'Graham Number',
  shortName: 'Graham #',
  category: 'valuation',
  calculate: (data: StockData) => {
    if (!data.eps || !data.bookValuePerShare) return null
    if (data.eps <= 0 || data.bookValuePerShare <= 0) return null
    
    // Graham Number = √(22.5 × EPS × Book Value)
    return Math.sqrt(22.5 * data.eps * data.bookValuePerShare)
  },
  format: (value: number) => `$${value.toFixed(2)}`,
  formatType: 'currency',
  description: 'Maximum price a defensive investor should pay (Benjamin Graham formula).',
  interpretation: (value: number, data?: StockData): MetricInterpretation => {
    if (!data?.currentPrice) return 'neutral'
    const margin = (value - data.currentPrice) / data.currentPrice
    if (margin > 0.2) return 'good' // 20%+ upside
    if (margin < -0.2) return 'bad' // 20%+ overvalued
    return 'neutral'
  },
  dependencies: ['eps', 'bookValuePerShare'],
}

// Price to Free Cash Flow
export const priceToFCF: MetricCalculator = {
  id: 'price_to_fcf',
  name: 'Price to Free Cash Flow',
  shortName: 'P/FCF',
  category: 'valuation',
  calculate: (data: StockData) => {
    if (!data.marketCap || !data.freeCashFlow || data.freeCashFlow === 0) return null
    return data.marketCap / data.freeCashFlow
  },
  format: (value: number) => `${value.toFixed(2)}x`,
  formatType: 'multiple',
  description: 'Market cap relative to free cash flow. Measures cash generation.',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 0) return 'bad' // Negative FCF
    if (value < 15) return 'good'
    if (value > 30) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 15, bad: 30, higherIsBetter: false },
  dependencies: ['marketCap', 'freeCashFlow'],
}

// Earnings Yield
export const earningsYield: MetricCalculator = {
  id: 'earnings_yield',
  name: 'Earnings Yield',
  shortName: 'E. Yield',
  category: 'valuation',
  calculate: (data: StockData) => {
    if (!data.eps || !data.currentPrice || data.currentPrice === 0) return null
    return (data.eps / data.currentPrice) * 100
  },
  format: (value: number) => `${value.toFixed(2)}%`,
  formatType: 'percentage',
  description: 'Inverse of P/E ratio. Compare to bond yields for valuation.',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 0) return 'bad'
    if (value > 7) return 'good'
    if (value < 3) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 7, bad: 3, higherIsBetter: true },
  dependencies: ['eps', 'currentPrice'],
}

// FCF Yield
export const fcfYield: MetricCalculator = {
  id: 'fcf_yield',
  name: 'Free Cash Flow Yield',
  shortName: 'FCF Yield',
  category: 'valuation',
  calculate: (data: StockData) => {
    if (!data.freeCashFlow || !data.marketCap || data.marketCap === 0) return null
    return (data.freeCashFlow / data.marketCap) * 100
  },
  format: (value: number) => `${value.toFixed(2)}%`,
  formatType: 'percentage',
  description: 'Free cash flow as percentage of market cap.',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 0) return 'bad'
    if (value > 8) return 'good'
    if (value < 3) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 8, bad: 3, higherIsBetter: true },
  dependencies: ['freeCashFlow', 'marketCap'],
}

// Export all valuation metrics
export const valuationMetrics: MetricCalculator[] = [
  evToEbitda,
  evToRevenue,
  pegRatio,
  grahamNumber,
  priceToFCF,
  earningsYield,
  fcfYield,
]
