/**
 * Deep Terminal - Profitability Metrics
 *
 * Calculate and interpret 8 profitability ratios from Yahoo Finance data
 * All data sourced from Income Statement and Balance Sheet
 */

import type { YahooFinanceData, ProfitabilityMetrics } from './types';
import { safeDivide, safeMultiply, safeSubtract, safeAdd } from './helpers';

// ============================================================================
// PROFITABILITY METRICS CALCULATION
// ============================================================================

/**
 * Calculate all profitability metrics from Yahoo Finance data
 *
 * @param data - Raw financial data from Yahoo Finance
 * @returns ProfitabilityMetrics object with all ratios
 */
export function calculateProfitability(
  data: YahooFinanceData,
  wacc: number = 0.10
): ProfitabilityMetrics {
  return {
    grossProfitMargin: calculateGrossProfitMargin(data),
    operatingProfitMargin: calculateOperatingProfitMargin(data),
    ebitdaMargin: calculateEBITDAMargin(data),
    netProfitMargin: calculateNetProfitMargin(data),
    roa: calculateROA(data),
    roe: calculateROE(data),
    roic: calculateROIC(data),
    noplat: calculateNOPLAT(data),
    
    // Extended Profitability
    roce: calculateROCE(data),
    rona: calculateRONA(data),
    cashRoa: calculateCashROA(data),
    cashRoe: calculateCashROE(data),
    pretaxMargin: calculatePretaxMargin(data),
    ebitMargin: calculateEBITMargin(data),
    operatingRoa: calculateOperatingROA(data),
    economicProfit: calculateEconomicProfit(data, wacc),
    residualIncome: calculateResidualIncome(data, wacc),
    spreadAboveWacc: calculateSpreadAboveWacc(data, wacc),
  };
}

// ============================================================================
// EXTENDED PROFITABILITY CALCULATIONS
// ============================================================================

/**
 * Return on Capital Employed = EBIT / (Total Assets - Current Liabilities)
 */
export function calculateROCE(data: YahooFinanceData): number | null {
  const capitalEmployed = safeSubtract(data.totalAssets ?? 0, data.currentLiabilities ?? 0);
  if (!capitalEmployed || capitalEmployed <= 0) return null;
  return safeDivide(data.ebit, capitalEmployed);
}

/**
 * Return on Net Assets = Net Income / Net Assets
 * Simplified: Net Assets = Total Assets - Current Liabilities
 */
export function calculateRONA(data: YahooFinanceData): number | null {
  const netAssets = safeSubtract(data.totalAssets ?? 0, data.currentLiabilities ?? 0);
  if (!netAssets || netAssets <= 0) return null;
  return safeDivide(data.netIncome, netAssets);
}

/**
 * Cash Return on Assets = Operating Cash Flow / Total Assets
 */
export function calculateCashROA(data: YahooFinanceData): number | null {
  return safeDivide(data.operatingCashFlow, data.totalAssets);
}

/**
 * Cash Return on Equity = Operating Cash Flow / Equity
 */
export function calculateCashROE(data: YahooFinanceData): number | null {
  return safeDivide(data.operatingCashFlow, data.totalEquity);
}

/**
 * Pre-Tax Profit Margin = Pre-Tax Income / Revenue
 */
export function calculatePretaxMargin(data: YahooFinanceData): number | null {
  return safeDivide(data.pretaxIncome, data.revenue);
}

/**
 * EBIT Margin = EBIT / Revenue
 */
export function calculateEBITMargin(data: YahooFinanceData): number | null {
  return safeDivide(data.ebit, data.revenue);
}

/**
 * Operating ROA = Operating Income / Total Assets
 */
export function calculateOperatingROA(data: YahooFinanceData): number | null {
  return safeDivide(data.operatingIncome, data.totalAssets);
}

/**
 * Economic Profit (EVA) = NOPAT - (Invested Capital × WACC)
 */
export function calculateEconomicProfit(data: YahooFinanceData, wacc: number): number | null {
  const nopat = calculateNOPLAT(data);
  if (nopat == null) return null;
  const investedCapital = (data.totalEquity ?? 0) + (data.totalDebt ?? 0) - (data.cash ?? 0);
  return nopat - (investedCapital * wacc);
}

/**
 * Residual Income = Net Income - (Equity × Cost of Equity)
 */
export function calculateResidualIncome(data: YahooFinanceData, costOfEquity: number): number | null {
  if (!data.netIncome || !data.totalEquity) return null;
  return data.netIncome - (data.totalEquity * costOfEquity);
}

/**
 * Spread Above WACC = ROIC - WACC
 */
export function calculateSpreadAboveWacc(data: YahooFinanceData, wacc: number): number | null {
  const roic = calculateROIC(data);
  if (roic == null) return null;
  return roic - wacc;
}

// ============================================================================
// INDIVIDUAL METRIC CALCULATIONS
// ============================================================================

/**
 * Gross Profit Margin = Gross Profit / Revenue
 *
 * Measures profitability after cost of goods sold.
 * Higher is better - indicates pricing power and production efficiency.
 *
 * Gross Profit = Revenue - COGS
 *
 * Source: Yahoo Finance Income Statement
 */
export function calculateGrossProfitMargin(
  data: YahooFinanceData
): number | null {
  return safeDivide(data.grossProfit, data.revenue);
}

/**
 * Operating Profit Margin = Operating Income / Revenue
 *
 * Measures profitability from core operations (before interest and taxes).
 * Higher is better - indicates operational efficiency.
 *
 * Operating Income = Gross Profit - Operating Expenses
 *
 * Source: Yahoo Finance Income Statement
 */
export function calculateOperatingProfitMargin(
  data: YahooFinanceData
): number | null {
  return safeDivide(data.operatingIncome, data.revenue);
}

/**
 * EBITDA Margin = EBITDA / Revenue
 *
 * Measures profitability before interest, taxes, depreciation, and amortization.
 * Useful for comparing companies with different capital structures and tax situations.
 *
 * EBITDA = Earnings Before Interest, Taxes, Depreciation, and Amortization
 *
 * Source: Yahoo Finance Income Statement
 */
export function calculateEBITDAMargin(data: YahooFinanceData): number | null {
  return safeDivide(data.ebitda, data.revenue);
}

/**
 * Net Profit Margin = Net Income / Revenue
 *
 * Measures bottom-line profitability after all expenses.
 * Higher is better - indicates overall profitability and efficiency.
 *
 * This is the most comprehensive profit margin metric.
 *
 * Source: Yahoo Finance Income Statement
 */
export function calculateNetProfitMargin(data: YahooFinanceData): number | null {
  return safeDivide(data.netIncome, data.revenue);
}

/**
 * ROA (Return on Assets) = Net Income / Total Assets
 *
 * Measures how efficiently a company uses its assets to generate profit.
 * Higher is better - indicates more profit per dollar of assets.
 *
 * Particularly useful for comparing companies in the same industry.
 *
 * Source: Yahoo Finance Income Statement (Net Income) + Balance Sheet (Total Assets)
 */
export function calculateROA(data: YahooFinanceData): number | null {
  return safeDivide(data.netIncome, data.totalAssets);
}

/**
 * ROE (Return on Equity) = Net Income / Total Equity
 *
 * Measures return on shareholder equity - profitability from owners' perspective.
 * Higher is better - indicates more profit per dollar of shareholder investment.
 *
 * Key metric for equity investors. Should be compared to cost of equity.
 *
 * Source: Yahoo Finance Income Statement (Net Income) + Balance Sheet (Total Equity)
 */
export function calculateROE(data: YahooFinanceData): number | null {
  return safeDivide(data.netIncome, data.totalEquity);
}

/**
 * ROIC (Return on Invested Capital) = NOPLAT / Invested Capital
 *
 * Measures return on all capital invested (debt + equity), regardless of source.
 * Higher is better - indicates efficient use of all capital.
 *
 * Invested Capital = Total Debt + Total Equity - Cash
 * (Cash is excluded as it's not "invested" in operations)
 *
 * ROIC > WACC indicates value creation.
 *
 * Source: Yahoo Finance Income Statement + Balance Sheet
 */
export function calculateROIC(data: YahooFinanceData): number | null {
  // Calculate NOPLAT first
  const noplat = calculateNOPLAT(data);
  if (noplat === null) return null;

  // Calculate Invested Capital = Debt + Equity - Cash
  const debtPlusEquity = safeAdd(data.totalDebt ?? 0, data.totalEquity ?? 0);
  if (debtPlusEquity === null) return null;

  const investedCapital = safeSubtract(debtPlusEquity, data.cash ?? 0);
  if (investedCapital === null || investedCapital <= 0) return null;

  return safeDivide(noplat, investedCapital);
}

/**
 * NOPLAT (Net Operating Profit Less Adjusted Taxes) = EBIT × (1 - Tax Rate)
 *
 * Represents after-tax operating profit, excluding effects of financing.
 * Used in ROIC and DCF valuations.
 *
 * Tax Rate = Income Tax / Pretax Income (Effective Tax Rate)
 * If tax rate cannot be calculated, assumes 21% (US federal corporate rate)
 *
 * Source: Yahoo Finance Income Statement
 */
export function calculateNOPLAT(data: YahooFinanceData): number | null {
  // Calculate effective tax rate
  let taxRate: number | null = null;

  if (data.pretaxIncome && data.incomeTax && data.pretaxIncome !== 0) {
    taxRate = safeDivide(data.incomeTax, data.pretaxIncome);
  }

  // If tax rate cannot be calculated or is invalid, use 21% default
  if (taxRate === null || taxRate < 0 || taxRate > 1) {
    taxRate = 0.21; // US federal corporate tax rate
  }

  // NOPLAT = EBIT × (1 - Tax Rate)
  const oneMinusTaxRate = 1 - taxRate;
  return safeMultiply(data.ebit, oneMinusTaxRate);
}

// ============================================================================
// INTERPRETATION FUNCTIONS
// ============================================================================

export type InterpretationLevel = 'good' | 'neutral' | 'bad';

export interface MetricInterpretation {
  level: InterpretationLevel;
  message: string;
  threshold: string;
}

/**
 * Interpret Gross Profit Margin
 *
 * Thresholds (industry-dependent):
 * - Good: >= 0.40 (40%+)
 * - Neutral: 0.20 - 0.40 (20-40%)
 * - Bad: < 0.20 (< 20%)
 */
export function interpretGrossProfitMargin(
  margin: number | null
): MetricInterpretation {
  if (margin == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate gross profit margin',
      threshold: 'N/A',
    };
  }

  if (margin >= 0.40) {
    return {
      level: 'good',
      message: 'Strong gross margin - indicates pricing power and efficient production',
      threshold: '>= 40%',
    };
  }

  if (margin >= 0.20) {
    return {
      level: 'neutral',
      message: 'Moderate gross margin - acceptable but monitor cost pressures',
      threshold: '20% - 40%',
    };
  }

  return {
    level: 'bad',
    message: 'Low gross margin - indicates competitive pricing or high production costs',
    threshold: '< 20%',
  };
}

/**
 * Interpret Operating Profit Margin
 *
 * Thresholds:
 * - Good: >= 0.15 (15%+)
 * - Neutral: 0.05 - 0.15 (5-15%)
 * - Bad: < 0.05 (< 5%)
 */
export function interpretOperatingProfitMargin(
  margin: number | null
): MetricInterpretation {
  if (margin == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate operating profit margin',
      threshold: 'N/A',
    };
  }

  if (margin >= 0.15) {
    return {
      level: 'good',
      message: 'Strong operating margin - efficient core operations',
      threshold: '>= 15%',
    };
  }

  if (margin >= 0.05) {
    return {
      level: 'neutral',
      message: 'Moderate operating margin - acceptable operational efficiency',
      threshold: '5% - 15%',
    };
  }

  if (margin >= 0) {
    return {
      level: 'bad',
      message: 'Low operating margin - high operating expenses relative to revenue',
      threshold: '< 5%',
    };
  }

  return {
    level: 'bad',
    message: 'Negative operating margin - operating at a loss',
    threshold: '< 0%',
  };
}

/**
 * Interpret EBITDA Margin
 *
 * Thresholds:
 * - Good: >= 0.20 (20%+)
 * - Neutral: 0.10 - 0.20 (10-20%)
 * - Bad: < 0.10 (< 10%)
 */
export function interpretEBITDAMargin(
  margin: number | null
): MetricInterpretation {
  if (margin == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate EBITDA margin',
      threshold: 'N/A',
    };
  }

  if (margin >= 0.20) {
    return {
      level: 'good',
      message: 'Strong EBITDA margin - robust cash generation potential',
      threshold: '>= 20%',
    };
  }

  if (margin >= 0.10) {
    return {
      level: 'neutral',
      message: 'Moderate EBITDA margin - adequate cash generation',
      threshold: '10% - 20%',
    };
  }

  if (margin >= 0) {
    return {
      level: 'bad',
      message: 'Low EBITDA margin - limited cash generation capacity',
      threshold: '< 10%',
    };
  }

  return {
    level: 'bad',
    message: 'Negative EBITDA - not generating positive cash from operations',
    threshold: '< 0%',
  };
}

/**
 * Interpret Net Profit Margin
 *
 * Thresholds:
 * - Good: >= 0.10 (10%+)
 * - Neutral: 0.03 - 0.10 (3-10%)
 * - Bad: < 0.03 (< 3%)
 */
export function interpretNetProfitMargin(
  margin: number | null
): MetricInterpretation {
  if (margin == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate net profit margin',
      threshold: 'N/A',
    };
  }

  if (margin >= 0.10) {
    return {
      level: 'good',
      message: 'Strong net margin - highly profitable after all expenses',
      threshold: '>= 10%',
    };
  }

  if (margin >= 0.03) {
    return {
      level: 'neutral',
      message: 'Moderate net margin - profitable but room for improvement',
      threshold: '3% - 10%',
    };
  }

  if (margin >= 0) {
    return {
      level: 'bad',
      message: 'Low net margin - minimal profitability, vulnerable to cost increases',
      threshold: '< 3%',
    };
  }

  return {
    level: 'bad',
    message: 'Negative net margin - operating at a net loss',
    threshold: '< 0%',
  };
}

/**
 * Interpret ROA (Return on Assets)
 *
 * Thresholds:
 * - Good: >= 0.08 (8%+)
 * - Neutral: 0.03 - 0.08 (3-8%)
 * - Bad: < 0.03 (< 3%)
 */
export function interpretROA(roa: number | null): MetricInterpretation {
  if (roa == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate ROA',
      threshold: 'N/A',
    };
  }

  if (roa >= 0.08) {
    return {
      level: 'good',
      message: 'Strong ROA - efficient use of assets to generate profits',
      threshold: '>= 8%',
    };
  }

  if (roa >= 0.03) {
    return {
      level: 'neutral',
      message: 'Moderate ROA - acceptable asset efficiency',
      threshold: '3% - 8%',
    };
  }

  if (roa >= 0) {
    return {
      level: 'bad',
      message: 'Low ROA - assets are not being used efficiently',
      threshold: '< 3%',
    };
  }

  return {
    level: 'bad',
    message: 'Negative ROA - company is losing money relative to asset base',
    threshold: '< 0%',
  };
}

/**
 * Interpret ROE (Return on Equity)
 *
 * Thresholds:
 * - Good: >= 0.15 (15%+)
 * - Neutral: 0.08 - 0.15 (8-15%)
 * - Bad: < 0.08 (< 8%)
 */
export function interpretROE(roe: number | null): MetricInterpretation {
  if (roe == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate ROE',
      threshold: 'N/A',
    };
  }

  if (roe >= 0.15) {
    return {
      level: 'good',
      message: 'Strong ROE - excellent returns for shareholders',
      threshold: '>= 15%',
    };
  }

  if (roe >= 0.08) {
    return {
      level: 'neutral',
      message: 'Moderate ROE - acceptable returns, may lag cost of equity',
      threshold: '8% - 15%',
    };
  }

  if (roe >= 0) {
    return {
      level: 'bad',
      message: 'Low ROE - weak returns for shareholders, likely below cost of equity',
      threshold: '< 8%',
    };
  }

  return {
    level: 'bad',
    message: 'Negative ROE - destroying shareholder value',
    threshold: '< 0%',
  };
}

/**
 * Interpret ROIC (Return on Invested Capital)
 *
 * Thresholds:
 * - Good: >= 0.12 (12%+, typically above WACC)
 * - Neutral: 0.06 - 0.12 (6-12%)
 * - Bad: < 0.06 (< 6%, likely below WACC)
 */
export function interpretROIC(roic: number | null): MetricInterpretation {
  if (roic == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate ROIC',
      threshold: 'N/A',
    };
  }

  if (roic >= 0.12) {
    return {
      level: 'good',
      message: 'Strong ROIC - likely creating value (typically above WACC)',
      threshold: '>= 12%',
    };
  }

  if (roic >= 0.06) {
    return {
      level: 'neutral',
      message: 'Moderate ROIC - may or may not exceed WACC, compare to industry',
      threshold: '6% - 12%',
    };
  }

  if (roic >= 0) {
    return {
      level: 'bad',
      message: 'Low ROIC - likely destroying value (below typical WACC)',
      threshold: '< 6%',
    };
  }

  return {
    level: 'bad',
    message: 'Negative ROIC - capital is being deployed unprofitably',
    threshold: '< 0%',
  };
}

/**
 * Interpret NOPLAT
 *
 * Note: NOPLAT is an absolute value metric, not a ratio.
 * Interpretation focuses on whether it's positive and growing.
 */
export function interpretNOPLAT(noplat: number | null): MetricInterpretation {
  if (noplat == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate NOPLAT',
      threshold: 'N/A',
    };
  }

  if (noplat > 0) {
    return {
      level: 'good',
      message: 'Positive NOPLAT - generating after-tax operating profits',
      threshold: '> 0',
    };
  }

  return {
    level: 'bad',
    message: 'Negative or zero NOPLAT - not generating operating profits after taxes',
    threshold: '<= 0',
  };
}

/**
 * Generic interpretation for extended profitability metrics
 */
function interpretExtendedProfitability(value: number | null, name: string): MetricInterpretation {
  if (value == null) {
    return {
      level: 'neutral',
      message: `Insufficient data to calculate ${name}`,
      threshold: 'N/A',
    };
  }
  if (value > 0.15) {
    return { level: 'good', message: `Strong ${name}`, threshold: '> 15%' };
  } else if (value >= 0) {
    return { level: 'neutral', message: `Moderate ${name}`, threshold: '0 - 15%' };
  }
  return { level: 'bad', message: `Negative ${name}`, threshold: '< 0' };
}

/**
 * Get comprehensive interpretation of all profitability metrics
 */
export function interpretAllProfitabilityMetrics(
  metrics: ProfitabilityMetrics
): Record<keyof ProfitabilityMetrics, MetricInterpretation> {
  return {
    grossProfitMargin: interpretGrossProfitMargin(metrics.grossProfitMargin),
    operatingProfitMargin: interpretOperatingProfitMargin(metrics.operatingProfitMargin),
    ebitdaMargin: interpretEBITDAMargin(metrics.ebitdaMargin),
    netProfitMargin: interpretNetProfitMargin(metrics.netProfitMargin),
    roa: interpretROA(metrics.roa),
    roe: interpretROE(metrics.roe),
    roic: interpretROIC(metrics.roic),
    noplat: interpretNOPLAT(metrics.noplat),
    
    // Extended Profitability Interpretations
    roce: interpretExtendedProfitability(metrics.roce, 'ROCE'),
    rona: interpretExtendedProfitability(metrics.rona, 'RONA'),
    cashRoa: interpretExtendedProfitability(metrics.cashRoa, 'Cash ROA'),
    cashRoe: interpretExtendedProfitability(metrics.cashRoe, 'Cash ROE'),
    pretaxMargin: interpretExtendedProfitability(metrics.pretaxMargin, 'Pre-Tax Margin'),
    ebitMargin: interpretExtendedProfitability(metrics.ebitMargin, 'EBIT Margin'),
    operatingRoa: interpretExtendedProfitability(metrics.operatingRoa, 'Operating ROA'),
    economicProfit: interpretExtendedProfitability(metrics.economicProfit, 'Economic Profit'),
    residualIncome: interpretExtendedProfitability(metrics.residualIncome, 'Residual Income'),
    spreadAboveWacc: interpretExtendedProfitability(metrics.spreadAboveWacc, 'Spread Above WACC'),
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate effective tax rate from financial data
 */
export function calculateEffectiveTaxRate(data: YahooFinanceData): number | null {
  if (!data.pretaxIncome || !data.incomeTax || data.pretaxIncome === 0) {
    return null;
  }

  const taxRate = safeDivide(data.incomeTax, data.pretaxIncome);

  // Validate tax rate is in reasonable range (0-100%)
  if (taxRate === null || taxRate < 0 || taxRate > 1) {
    return null;
  }

  return taxRate;
}

/**
 * Get profitability summary score (0-100)
 * Combines all profitability metrics into a single score
 */
export function getProfitabilityScore(
  metrics: ProfitabilityMetrics
): number | null {
  const interpretations = interpretAllProfitabilityMetrics(metrics);

  let totalScore = 0;
  let validMetrics = 0;

  // Score each metric: good = 100, neutral = 50, bad = 0
  const scoreMap: Record<InterpretationLevel, number> = {
    good: 100,
    neutral: 50,
    bad: 0,
  };

  for (const interpretation of Object.values(interpretations)) {
    if (interpretation.threshold !== 'N/A') {
      totalScore += scoreMap[interpretation.level];
      validMetrics++;
    }
  }

  if (validMetrics === 0) return null;

  return Math.round(totalScore / validMetrics);
}

/**
 * Check if company is profitable across all metrics
 */
export function isProfitable(metrics: ProfitabilityMetrics): boolean {
  return (
    (metrics.netProfitMargin ?? 0) > 0 &&
    (metrics.operatingProfitMargin ?? 0) > 0 &&
    (metrics.roa ?? 0) > 0 &&
    (metrics.roe ?? 0) > 0
  );
}

/**
 * Compare profitability to industry benchmarks
 * Returns how many standard deviations above/below industry average
 */
export function compareToBenchmark(
  metric: number | null,
  industryAverage: number,
  industryStdDev: number
): number | null {
  if (metric === null || industryStdDev === 0) return null;

  return (metric - industryAverage) / industryStdDev;
}
