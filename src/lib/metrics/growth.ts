import type { MetricCalculator, StockData, MetricInterpretation } from './types'

/**
 * Growth Metrics
 * Metrics for evaluating company growth rates
 */

// Revenue Growth YoY
export const revenueGrowthYoY: MetricCalculator = {
  id: 'revenue_growth_yoy',
  name: 'Revenue Growth (YoY)',
  shortName: 'Rev YoY',
  category: 'growth',
  calculate: (data: StockData) => {
    if (data.revenueGrowthYoY !== undefined) return data.revenueGrowthYoY
    if (!data.revenue || !data.revenuePreviousYear || data.revenuePreviousYear === 0) return null
    return ((data.revenue - data.revenuePreviousYear) / data.revenuePreviousYear) * 100
  },
  format: (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`,
  formatType: 'percentage',
  description: 'Year-over-year revenue growth rate.',
  interpretation: (value: number): MetricInterpretation => {
    if (value > 20) return 'good'
    if (value < 0) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 20, bad: 0, higherIsBetter: true },
  dependencies: ['revenue', 'revenuePreviousYear'],
}

// Earnings Growth YoY
export const earningsGrowthYoY: MetricCalculator = {
  id: 'earnings_growth_yoy',
  name: 'Earnings Growth (YoY)',
  shortName: 'EPS YoY',
  category: 'growth',
  calculate: (data: StockData) => {
    if (data.earningsGrowthYoY !== undefined) return data.earningsGrowthYoY
    if (!data.netIncome || !data.netIncomePreviousYear) return null
    if (data.netIncomePreviousYear === 0) {
      return data.netIncome > 0 ? 100 : -100
    }
    return ((data.netIncome - data.netIncomePreviousYear) / Math.abs(data.netIncomePreviousYear)) * 100
  },
  format: (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`,
  formatType: 'percentage',
  description: 'Year-over-year net income growth rate.',
  interpretation: (value: number): MetricInterpretation => {
    if (value > 15) return 'good'
    if (value < -10) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 15, bad: -10, higherIsBetter: true },
  dependencies: ['netIncome', 'netIncomePreviousYear'],
}

// Revenue Growth QoQ
export const revenueGrowthQoQ: MetricCalculator = {
  id: 'revenue_growth_qoq',
  name: 'Revenue Growth (QoQ)',
  shortName: 'Rev QoQ',
  category: 'growth',
  calculate: (data: StockData) => {
    if (data.revenueGrowthQoQ !== undefined) return data.revenueGrowthQoQ
    if (!data.revenue || !data.revenuePreviousQuarter || data.revenuePreviousQuarter === 0) return null
    return ((data.revenue - data.revenuePreviousQuarter) / data.revenuePreviousQuarter) * 100
  },
  format: (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`,
  formatType: 'percentage',
  description: 'Quarter-over-quarter revenue growth rate.',
  interpretation: (value: number): MetricInterpretation => {
    if (value > 10) return 'good'
    if (value < -5) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 10, bad: -5, higherIsBetter: true },
  dependencies: ['revenue', 'revenuePreviousQuarter'],
}

// 5-Year Revenue CAGR
export const revenue5YearCAGR: MetricCalculator = {
  id: 'revenue_cagr_5y',
  name: '5-Year Revenue CAGR',
  shortName: 'Rev CAGR',
  category: 'growth',
  calculate: (data: StockData) => {
    if (data.revenue5YearCAGR !== undefined) return data.revenue5YearCAGR
    return null // Would need historical data
  },
  format: (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`,
  formatType: 'percentage',
  description: 'Compound annual growth rate of revenue over 5 years.',
  interpretation: (value: number): MetricInterpretation => {
    if (value > 15) return 'good'
    if (value < 5) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 15, bad: 5, higherIsBetter: true },
  dependencies: ['revenue5YearCAGR'],
}

// 5-Year EPS CAGR
export const eps5YearCAGR: MetricCalculator = {
  id: 'eps_cagr_5y',
  name: '5-Year EPS CAGR',
  shortName: 'EPS CAGR',
  category: 'growth',
  calculate: (data: StockData) => {
    if (data.eps5YearCAGR !== undefined) return data.eps5YearCAGR
    return null // Would need historical data
  },
  format: (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`,
  formatType: 'percentage',
  description: 'Compound annual growth rate of EPS over 5 years.',
  interpretation: (value: number): MetricInterpretation => {
    if (value > 12) return 'good'
    if (value < 0) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 12, bad: 0, higherIsBetter: true },
  dependencies: ['eps5YearCAGR'],
}

// Equity Growth
export const equityGrowth: MetricCalculator = {
  id: 'equity_growth',
  name: 'Equity Growth (YoY)',
  shortName: 'Equity YoY',
  category: 'growth',
  calculate: (data: StockData) => {
    if (!data.totalEquity || !data.totalEquityPreviousYear || data.totalEquityPreviousYear === 0) return null
    return ((data.totalEquity - data.totalEquityPreviousYear) / data.totalEquityPreviousYear) * 100
  },
  format: (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`,
  formatType: 'percentage',
  description: 'Year-over-year shareholder equity growth.',
  interpretation: (value: number): MetricInterpretation => {
    if (value > 10) return 'good'
    if (value < -5) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 10, bad: -5, higherIsBetter: true },
  dependencies: ['totalEquity', 'totalEquityPreviousYear'],
}

// Export all growth metrics
export const growthMetrics: MetricCalculator[] = [
  revenueGrowthYoY,
  earningsGrowthYoY,
  revenueGrowthQoQ,
  revenue5YearCAGR,
  eps5YearCAGR,
  equityGrowth,
]
