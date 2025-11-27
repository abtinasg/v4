import type { MetricCalculator, StockData, MetricInterpretation } from './types'

/**
 * DuPont Analysis Metrics
 * 
 * DuPont analysis breaks down Return on Equity (ROE) into component parts
 * to identify the drivers of profitability.
 * 
 * 3-Step DuPont Formula:
 * ROE = Net Profit Margin × Asset Turnover × Equity Multiplier
 * 
 * Extended 5-Step DuPont Formula:
 * ROE = Tax Burden × Interest Burden × Operating Margin × Asset Turnover × Equity Multiplier
 */

// ==================== 3-STEP DUPONT COMPONENTS ====================

// 1. Net Profit Margin (NPM)
// Source: Yahoo | Formula: Net Income / Revenue
export const dupontNetProfitMargin: MetricCalculator = {
  id: 'dupont_npm',
  name: 'Net Profit Margin',
  shortName: 'NPM',
  category: 'efficiency',
  calculate: (data: StockData) => {
    // Use pre-calculated margin if available
    if (data.netMargin !== undefined) return data.netMargin
    if (!data.netIncome || !data.revenue || data.revenue === 0) return null
    return (data.netIncome / data.revenue) * 100
  },
  format: (value: number) => `${value.toFixed(2)}%`,
  formatType: 'percentage',
  description: 'Measures how much profit a company generates from its revenue after all expenses.',
  interpretation: (value: number): MetricInterpretation => {
    if (value > 20) return 'good'
    if (value < 5) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 20, bad: 5, higherIsBetter: true },
  dependencies: ['netIncome', 'revenue'],
}

// 2. Asset Turnover (AT)
// Source: Backend | Formula: Revenue / Assets
export const dupontAssetTurnover: MetricCalculator = {
  id: 'dupont_at',
  name: 'Asset Turnover',
  shortName: 'AT',
  category: 'efficiency',
  calculate: (data: StockData) => {
    if (!data.revenue || !data.totalAssets || data.totalAssets === 0) return null
    return data.revenue / data.totalAssets
  },
  format: (value: number) => `${value.toFixed(2)}x`,
  formatType: 'ratio',
  description: 'Measures how efficiently a company uses its assets to generate revenue.',
  interpretation: (value: number): MetricInterpretation => {
    if (value > 1.5) return 'good'
    if (value < 0.5) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 1.5, bad: 0.5, higherIsBetter: true },
  dependencies: ['revenue', 'totalAssets'],
}

// 3. Equity Multiplier (EM)
// Source: Backend | Formula: Assets / Equity
export const dupontEquityMultiplier: MetricCalculator = {
  id: 'dupont_em',
  name: 'Equity Multiplier',
  shortName: 'EM',
  category: 'leverage',
  calculate: (data: StockData) => {
    if (!data.totalAssets || !data.totalEquity || data.totalEquity === 0) return null
    return data.totalAssets / data.totalEquity
  },
  format: (value: number) => `${value.toFixed(2)}x`,
  formatType: 'ratio',
  description: 'Measures financial leverage. Higher values indicate more debt financing.',
  interpretation: (value: number): MetricInterpretation => {
    // Lower is generally better (less leverage risk)
    // But too low might indicate underutilization of leverage
    if (value >= 1 && value <= 2) return 'good'
    if (value > 4) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 2, bad: 4, higherIsBetter: false },
  dependencies: ['totalAssets', 'totalEquity'],
}

// 4. ROE (3-Step DuPont)
// Source: Backend | Formula: NPM × AT × EM
export const dupontROE3Step: MetricCalculator = {
  id: 'dupont_roe_3step',
  name: 'ROE (3-Step DuPont)',
  shortName: 'ROE',
  category: 'efficiency',
  calculate: (data: StockData) => {
    // Calculate components
    const npm = dupontNetProfitMargin.calculate(data)
    const at = dupontAssetTurnover.calculate(data)
    const em = dupontEquityMultiplier.calculate(data)
    
    if (npm === null || at === null || em === null) return null
    
    // NPM is already in percentage, convert to decimal for calculation
    const npmDecimal = npm / 100
    return npmDecimal * at * em * 100 // Return as percentage
  },
  format: (value: number) => `${value.toFixed(2)}%`,
  formatType: 'percentage',
  description: 'Return on Equity calculated via 3-step DuPont: NPM × Asset Turnover × Equity Multiplier.',
  interpretation: (value: number): MetricInterpretation => {
    if (value > 15) return 'good'
    if (value < 8) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 15, bad: 8, higherIsBetter: true },
  dependencies: ['netIncome', 'revenue', 'totalAssets', 'totalEquity'],
}

// ==================== 5-STEP DUPONT COMPONENTS ====================

// 5. Operating Margin
// Source: Yahoo | Formula: Operating Income / Revenue
export const dupontOperatingMargin: MetricCalculator = {
  id: 'dupont_opm',
  name: 'Operating Margin',
  shortName: 'OPM',
  category: 'efficiency',
  calculate: (data: StockData) => {
    // Use pre-calculated margin if available
    if (data.operatingMargin !== undefined) return data.operatingMargin
    if (!data.operatingIncome || !data.revenue || data.revenue === 0) return null
    return (data.operatingIncome / data.revenue) * 100
  },
  format: (value: number) => `${value.toFixed(2)}%`,
  formatType: 'percentage',
  description: 'Measures operating efficiency - profit from core operations relative to revenue.',
  interpretation: (value: number): MetricInterpretation => {
    if (value > 20) return 'good'
    if (value < 10) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 20, bad: 10, higherIsBetter: true },
  dependencies: ['operatingIncome', 'revenue'],
}

// 6. Interest Burden
// Source: Backend | Formula: EBT / EBIT
// EBT = Earnings Before Tax (Pre-tax Income)
// EBIT = Earnings Before Interest and Tax (Operating Income)
export const dupontInterestBurden: MetricCalculator = {
  id: 'dupont_interest_burden',
  name: 'Interest Burden',
  shortName: 'IB',
  category: 'efficiency',
  calculate: (data: StockData) => {
    // EBT = Net Income + Tax Expense (Pre-tax Income)
    // EBIT ≈ Operating Income
    if (!data.netIncome || !data.operatingIncome || data.operatingIncome === 0) return null
    
    // Calculate EBT (Pre-tax Income)
    const taxExpense = data.taxExpense || 0
    const ebt = data.netIncome + taxExpense
    
    // EBIT is approximately Operating Income
    const ebit = data.operatingIncome
    
    if (ebit === 0) return null
    return ebt / ebit
  },
  format: (value: number) => `${value.toFixed(3)}`,
  formatType: 'ratio',
  description: 'Measures the impact of interest expense on profits. Closer to 1 means less interest burden.',
  interpretation: (value: number): MetricInterpretation => {
    if (value >= 0.9) return 'good'
    if (value < 0.7) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 0.9, bad: 0.7, higherIsBetter: true },
  dependencies: ['netIncome', 'operatingIncome', 'taxExpense'],
}

// 7. Tax Burden
// Source: Backend | Formula: Net Income / EBT
export const dupontTaxBurden: MetricCalculator = {
  id: 'dupont_tax_burden',
  name: 'Tax Burden',
  shortName: 'TB',
  category: 'efficiency',
  calculate: (data: StockData) => {
    if (!data.netIncome) return null
    
    // Calculate EBT (Pre-tax Income)
    const taxExpense = data.taxExpense || 0
    const ebt = data.netIncome + taxExpense
    
    if (ebt === 0) return null
    return data.netIncome / ebt
  },
  format: (value: number) => `${value.toFixed(3)}`,
  formatType: 'ratio',
  description: 'Measures the proportion of pre-tax income retained after taxes. Higher means lower effective tax rate.',
  interpretation: (value: number): MetricInterpretation => {
    if (value >= 0.75) return 'good' // ~25% or less effective tax rate
    if (value < 0.65) return 'bad'   // ~35%+ effective tax rate
    return 'neutral'
  },
  benchmark: { good: 0.75, bad: 0.65, higherIsBetter: true },
  dependencies: ['netIncome', 'taxExpense'],
}

// Extended ROE (5-Step DuPont)
// Formula: Tax Burden × Interest Burden × Operating Margin × Asset Turnover × Equity Multiplier
export const dupontROE5Step: MetricCalculator = {
  id: 'dupont_roe_5step',
  name: 'ROE (5-Step DuPont)',
  shortName: 'ROE-5',
  category: 'efficiency',
  calculate: (data: StockData) => {
    // Calculate all components
    const tb = dupontTaxBurden.calculate(data)
    const ib = dupontInterestBurden.calculate(data)
    const opm = dupontOperatingMargin.calculate(data)
    const at = dupontAssetTurnover.calculate(data)
    const em = dupontEquityMultiplier.calculate(data)
    
    if (tb === null || ib === null || opm === null || at === null || em === null) return null
    
    // OPM is in percentage, convert to decimal
    const opmDecimal = opm / 100
    return tb * ib * opmDecimal * at * em * 100 // Return as percentage
  },
  format: (value: number) => `${value.toFixed(2)}%`,
  formatType: 'percentage',
  description: 'Extended ROE breakdown: Tax Burden × Interest Burden × Operating Margin × Asset Turnover × Equity Multiplier.',
  interpretation: (value: number): MetricInterpretation => {
    if (value > 15) return 'good'
    if (value < 8) return 'bad'
    return 'neutral'
  },
  benchmark: { good: 15, bad: 8, higherIsBetter: true },
  dependencies: ['netIncome', 'operatingIncome', 'revenue', 'totalAssets', 'totalEquity', 'taxExpense'],
}

// ==================== DUPONT ANALYSIS HELPER ====================

/**
 * Calculate complete DuPont Analysis for a stock
 * Returns both 3-step and 5-step breakdowns with all components
 */
export interface DuPontAnalysis {
  // 3-Step Components
  netProfitMargin: number | null
  assetTurnover: number | null
  equityMultiplier: number | null
  roe3Step: number | null
  
  // 5-Step Additional Components
  operatingMargin: number | null
  interestBurden: number | null
  taxBurden: number | null
  roe5Step: number | null
  
  // Validation
  is3StepValid: boolean
  is5StepValid: boolean
}

export function calculateDuPontAnalysis(data: StockData): DuPontAnalysis {
  const npm = dupontNetProfitMargin.calculate(data)
  const at = dupontAssetTurnover.calculate(data)
  const em = dupontEquityMultiplier.calculate(data)
  const roe3 = dupontROE3Step.calculate(data)
  
  const opm = dupontOperatingMargin.calculate(data)
  const ib = dupontInterestBurden.calculate(data)
  const tb = dupontTaxBurden.calculate(data)
  const roe5 = dupontROE5Step.calculate(data)
  
  return {
    netProfitMargin: npm,
    assetTurnover: at,
    equityMultiplier: em,
    roe3Step: roe3,
    operatingMargin: opm,
    interestBurden: ib,
    taxBurden: tb,
    roe5Step: roe5,
    is3StepValid: npm !== null && at !== null && em !== null,
    is5StepValid: opm !== null && ib !== null && tb !== null && at !== null && em !== null,
  }
}

/**
 * Format DuPont analysis for display
 */
export function formatDuPontAnalysis(analysis: DuPontAnalysis): Record<string, string> {
  const formatValue = (value: number | null, formatter: (v: number) => string): string => {
    return value !== null ? formatter(value) : 'N/A'
  }
  
  return {
    netProfitMargin: formatValue(analysis.netProfitMargin, dupontNetProfitMargin.format),
    assetTurnover: formatValue(analysis.assetTurnover, dupontAssetTurnover.format),
    equityMultiplier: formatValue(analysis.equityMultiplier, dupontEquityMultiplier.format),
    roe3Step: formatValue(analysis.roe3Step, dupontROE3Step.format),
    operatingMargin: formatValue(analysis.operatingMargin, dupontOperatingMargin.format),
    interestBurden: formatValue(analysis.interestBurden, dupontInterestBurden.format),
    taxBurden: formatValue(analysis.taxBurden, dupontTaxBurden.format),
    roe5Step: formatValue(analysis.roe5Step, dupontROE5Step.format),
  }
}

// Export all DuPont metrics as an array for registry (7 core metrics)
export const dupontMetrics: MetricCalculator[] = [
  dupontNetProfitMargin,
  dupontAssetTurnover,
  dupontEquityMultiplier,
  dupontROE3Step,
  dupontOperatingMargin,
  dupontInterestBurden,
  dupontTaxBurden,
]

// Export 5-step ROE separately for advanced usage (not in core 7)
export { dupontROE5Step as dupontROEExtended }
