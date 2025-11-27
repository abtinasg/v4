import type { MetricCalculator, StockData, MetricInterpretation } from './types'

/**
 * Quality Metrics
 * Metrics for evaluating company quality and profitability
 */

// Return on Equity (ROE)
export const returnOnEquity: MetricCalculator = {
  id: 'roe',
  name: 'Return on Equity',
  shortName: 'ROE',
  category: 'quality',
  calculate: (data: StockData) => {
    if (!data.netIncome || !data.totalEquity || data.totalEquity === 0) return null
    return (data.netIncome / data.totalEquity) * 100
  },
  format: (value: number) => `${value.toFixed(2)}%`,
  formatType: 'percentage',
  description: 'Net income as percentage of shareholder equity. Measures profitability.',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 0) return 'bad'
    if (value > 15) return 'good'
    if (value < 10) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 15, bad: 10, higherIsBetter: true },
  dependencies: ['netIncome', 'totalEquity'],
}

// Return on Assets (ROA)
export const returnOnAssets: MetricCalculator = {
  id: 'roa',
  name: 'Return on Assets',
  shortName: 'ROA',
  category: 'quality',
  calculate: (data: StockData) => {
    if (!data.netIncome || !data.totalAssets || data.totalAssets === 0) return null
    return (data.netIncome / data.totalAssets) * 100
  },
  format: (value: number) => `${value.toFixed(2)}%`,
  formatType: 'percentage',
  description: 'Net income as percentage of total assets. Measures asset efficiency.',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 0) return 'bad'
    if (value > 10) return 'good'
    if (value < 5) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 10, bad: 5, higherIsBetter: true },
  dependencies: ['netIncome', 'totalAssets'],
}

// Return on Invested Capital (ROIC)
export const returnOnInvestedCapital: MetricCalculator = {
  id: 'roic',
  name: 'Return on Invested Capital',
  shortName: 'ROIC',
  category: 'quality',
  calculate: (data: StockData) => {
    if (!data.operatingIncome || !data.totalEquity || !data.totalDebt) return null
    const investedCapital = data.totalEquity + data.totalDebt
    if (investedCapital === 0) return null
    
    // ROIC = NOPAT / Invested Capital (using operating income as proxy)
    const taxRate = data.taxExpense && data.netIncome 
      ? data.taxExpense / (data.netIncome + data.taxExpense) 
      : 0.25
    const nopat = data.operatingIncome * (1 - taxRate)
    
    return (nopat / investedCapital) * 100
  },
  format: (value: number) => `${value.toFixed(2)}%`,
  formatType: 'percentage',
  description: 'Return generated on capital invested in the business.',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 0) return 'bad'
    if (value > 15) return 'good'
    if (value < 8) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 15, bad: 8, higherIsBetter: true },
  dependencies: ['operatingIncome', 'totalEquity', 'totalDebt'],
}

// Gross Margin
export const grossMarginMetric: MetricCalculator = {
  id: 'gross_margin',
  name: 'Gross Margin',
  shortName: 'Gross Mgn',
  category: 'quality',
  calculate: (data: StockData) => {
    if (data.grossMargin !== undefined) return data.grossMargin
    if (!data.grossProfit || !data.revenue || data.revenue === 0) return null
    return (data.grossProfit / data.revenue) * 100
  },
  format: (value: number) => `${value.toFixed(2)}%`,
  formatType: 'percentage',
  description: 'Gross profit as percentage of revenue. Indicates pricing power.',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 0) return 'bad'
    if (value > 40) return 'good'
    if (value < 20) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 40, bad: 20, higherIsBetter: true },
  dependencies: ['grossProfit', 'revenue'],
}

// Operating Margin
export const operatingMarginMetric: MetricCalculator = {
  id: 'operating_margin',
  name: 'Operating Margin',
  shortName: 'Op Mgn',
  category: 'quality',
  calculate: (data: StockData) => {
    if (data.operatingMargin !== undefined) return data.operatingMargin
    if (!data.operatingIncome || !data.revenue || data.revenue === 0) return null
    return (data.operatingIncome / data.revenue) * 100
  },
  format: (value: number) => `${value.toFixed(2)}%`,
  formatType: 'percentage',
  description: 'Operating income as percentage of revenue. Core business profitability.',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 0) return 'bad'
    if (value > 20) return 'good'
    if (value < 10) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 20, bad: 10, higherIsBetter: true },
  dependencies: ['operatingIncome', 'revenue'],
}

// Net Profit Margin
export const netMarginMetric: MetricCalculator = {
  id: 'net_margin',
  name: 'Net Profit Margin',
  shortName: 'Net Mgn',
  category: 'quality',
  calculate: (data: StockData) => {
    if (data.netMargin !== undefined) return data.netMargin
    if (!data.netIncome || !data.revenue || data.revenue === 0) return null
    return (data.netIncome / data.revenue) * 100
  },
  format: (value: number) => `${value.toFixed(2)}%`,
  formatType: 'percentage',
  description: 'Net income as percentage of revenue. Bottom-line profitability.',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 0) return 'bad'
    if (value > 15) return 'good'
    if (value < 5) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 15, bad: 5, higherIsBetter: true },
  dependencies: ['netIncome', 'revenue'],
}

// Piotroski F-Score (simplified version)
export const piotroskiScore: MetricCalculator = {
  id: 'piotroski_score',
  name: 'Piotroski F-Score',
  shortName: 'F-Score',
  category: 'quality',
  calculate: (data: StockData) => {
    let score = 0
    
    // Profitability (4 points)
    // 1. Positive net income
    if (data.netIncome && data.netIncome > 0) score++
    
    // 2. Positive operating cash flow
    if (data.operatingCashFlow && data.operatingCashFlow > 0) score++
    
    // 3. Positive ROA
    if (data.netIncome && data.totalAssets && (data.netIncome / data.totalAssets) > 0) score++
    
    // 4. Operating cash flow > net income (quality of earnings)
    if (data.operatingCashFlow && data.netIncome && data.operatingCashFlow > data.netIncome) score++
    
    // Leverage & Liquidity (3 points)
    // 5. Lower long-term debt ratio (simplified: debt/assets < 0.5)
    if (data.totalDebt && data.totalAssets && (data.totalDebt / data.totalAssets) < 0.5) score++
    
    // 6. Higher current ratio (current assets / current liabilities > 1)
    if (data.currentAssets && data.currentLiabilities && 
        data.currentLiabilities > 0 && 
        (data.currentAssets / data.currentLiabilities) > 1) score++
    
    // 7. No new shares issued (simplified: check if shares are stable)
    score++ // Give benefit of doubt
    
    // Operating Efficiency (2 points)
    // 8. Higher gross margin than previous year
    if (data.grossMargin && data.grossMargin > 0) score++ // Simplified
    
    // 9. Higher asset turnover
    if (data.revenue && data.totalAssets && data.totalAssets > 0 &&
        (data.revenue / data.totalAssets) > 0.5) score++
    
    return score
  },
  format: (value: number) => `${value}/9`,
  formatType: 'integer',
  description: 'Fundamental strength score (0-9). Higher is better.',
  interpretation: (value: number): MetricInterpretation => {
    if (value >= 7) return 'good'
    if (value <= 3) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 7, bad: 3, higherIsBetter: true },
  dependencies: ['netIncome', 'operatingCashFlow', 'totalAssets'],
}

// Export all quality metrics
export const qualityMetrics: MetricCalculator[] = [
  returnOnEquity,
  returnOnAssets,
  returnOnInvestedCapital,
  grossMarginMetric,
  operatingMarginMetric,
  netMarginMetric,
  piotroskiScore,
]
