import type { MetricCalculator, StockData, MetricInterpretation } from './types'

/**
 * Efficiency Metrics
 * Metrics for evaluating operational efficiency
 */

// Asset Turnover
export const assetTurnover: MetricCalculator = {
  id: 'asset_turnover',
  name: 'Asset Turnover',
  shortName: 'Asset Turn',
  category: 'efficiency',
  calculate: (data: StockData) => {
    if (!data.revenue || !data.totalAssets || data.totalAssets === 0) return null
    return data.revenue / data.totalAssets
  },
  format: (value: number) => `${value.toFixed(2)}x`,
  formatType: 'ratio',
  description: 'Revenue generated per dollar of assets. Measures asset efficiency.',
  interpretation: (value: number): MetricInterpretation => {
    if (value > 1) return 'good'
    if (value < 0.5) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 1, bad: 0.5, higherIsBetter: true },
  dependencies: ['revenue', 'totalAssets'],
}

// Inventory Turnover
export const inventoryTurnover: MetricCalculator = {
  id: 'inventory_turnover',
  name: 'Inventory Turnover',
  shortName: 'Inv Turn',
  category: 'efficiency',
  calculate: (data: StockData) => {
    if (!data.costOfGoodsSold || !data.inventory || data.inventory === 0) return null
    return data.costOfGoodsSold / data.inventory
  },
  format: (value: number) => `${value.toFixed(2)}x`,
  formatType: 'ratio',
  description: 'How many times inventory is sold and replaced. Higher is better.',
  interpretation: (value: number): MetricInterpretation => {
    if (value > 8) return 'good'
    if (value < 4) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 8, bad: 4, higherIsBetter: true },
  dependencies: ['costOfGoodsSold', 'inventory'],
}

// Days Inventory Outstanding
export const daysInventoryOutstanding: MetricCalculator = {
  id: 'days_inventory',
  name: 'Days Inventory Outstanding',
  shortName: 'DIO',
  category: 'efficiency',
  calculate: (data: StockData) => {
    if (!data.costOfGoodsSold || !data.inventory || data.costOfGoodsSold === 0) return null
    return (data.inventory / data.costOfGoodsSold) * 365
  },
  format: (value: number) => `${value.toFixed(0)} days`,
  formatType: 'number',
  description: 'Average days to sell inventory. Lower is better.',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 30) return 'good'
    if (value > 90) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 30, bad: 90, higherIsBetter: false },
  dependencies: ['costOfGoodsSold', 'inventory'],
}

// Receivables Turnover
export const receivablesTurnover: MetricCalculator = {
  id: 'receivables_turnover',
  name: 'Receivables Turnover',
  shortName: 'AR Turn',
  category: 'efficiency',
  calculate: (data: StockData) => {
    if (!data.revenue || !data.accountsReceivable || data.accountsReceivable === 0) return null
    return data.revenue / data.accountsReceivable
  },
  format: (value: number) => `${value.toFixed(2)}x`,
  formatType: 'ratio',
  description: 'How efficiently a company collects receivables.',
  interpretation: (value: number): MetricInterpretation => {
    if (value > 10) return 'good'
    if (value < 5) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 10, bad: 5, higherIsBetter: true },
  dependencies: ['revenue', 'accountsReceivable'],
}

// Days Sales Outstanding
export const daysSalesOutstanding: MetricCalculator = {
  id: 'days_sales_outstanding',
  name: 'Days Sales Outstanding',
  shortName: 'DSO',
  category: 'efficiency',
  calculate: (data: StockData) => {
    if (!data.revenue || !data.accountsReceivable || data.revenue === 0) return null
    return (data.accountsReceivable / data.revenue) * 365
  },
  format: (value: number) => `${value.toFixed(0)} days`,
  formatType: 'number',
  description: 'Average days to collect receivables. Lower is better.',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 30) return 'good'
    if (value > 60) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 30, bad: 60, higherIsBetter: false },
  dependencies: ['revenue', 'accountsReceivable'],
}

// Payables Turnover
export const payablesTurnover: MetricCalculator = {
  id: 'payables_turnover',
  name: 'Payables Turnover',
  shortName: 'AP Turn',
  category: 'efficiency',
  calculate: (data: StockData) => {
    if (!data.costOfGoodsSold || !data.accountsPayable || data.accountsPayable === 0) return null
    return data.costOfGoodsSold / data.accountsPayable
  },
  format: (value: number) => `${value.toFixed(2)}x`,
  formatType: 'ratio',
  description: 'How quickly a company pays its suppliers.',
  interpretation: (): MetricInterpretation => 'neutral', // Context dependent
  dependencies: ['costOfGoodsSold', 'accountsPayable'],
}

// Cash Conversion Cycle
export const cashConversionCycle: MetricCalculator = {
  id: 'cash_conversion_cycle',
  name: 'Cash Conversion Cycle',
  shortName: 'CCC',
  category: 'efficiency',
  calculate: (data: StockData) => {
    // DIO + DSO - DPO
    if (!data.costOfGoodsSold || !data.revenue || !data.inventory || 
        !data.accountsReceivable || !data.accountsPayable) return null
    
    if (data.costOfGoodsSold === 0 || data.revenue === 0) return null
    
    const dio = (data.inventory / data.costOfGoodsSold) * 365
    const dso = (data.accountsReceivable / data.revenue) * 365
    const dpo = (data.accountsPayable / data.costOfGoodsSold) * 365
    
    return dio + dso - dpo
  },
  format: (value: number) => `${value.toFixed(0)} days`,
  formatType: 'number',
  description: 'Time to convert investments into cash. Lower (or negative) is better.',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 30) return 'good'
    if (value > 90) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 30, bad: 90, higherIsBetter: false },
  dependencies: ['costOfGoodsSold', 'revenue', 'inventory', 'accountsReceivable', 'accountsPayable'],
}

// Export all efficiency metrics
export const efficiencyMetrics: MetricCalculator[] = [
  assetTurnover,
  inventoryTurnover,
  daysInventoryOutstanding,
  receivablesTurnover,
  daysSalesOutstanding,
  payablesTurnover,
  cashConversionCycle,
]
