/**
 * Deep Terminal - Leverage/Solvency Metrics
 *
 * Calculate and interpret 7 leverage/solvency ratios from Yahoo Finance data
 * All data sourced from Balance Sheet and Income Statement
 */

import type { YahooFinanceData, LeverageMetrics } from './types';
import { safeDivide, safeAdd } from './helpers';

// ============================================================================
// LEVERAGE METRICS CALCULATION
// ============================================================================

/**
 * Calculate all leverage/solvency metrics from Yahoo Finance data
 *
 * @param data - Raw financial data from Yahoo Finance
 * @returns LeverageMetrics object with all ratios
 */
export function calculateLeverage(data: YahooFinanceData): LeverageMetrics {
  return {
    debtToAssets: calculateDebtToAssets(data),
    debtToEquity: calculateDebtToEquity(data),
    financialDebtToEquity: calculateFinancialDebtToEquity(data),
    interestCoverage: calculateInterestCoverage(data),
    debtServiceCoverage: calculateDebtServiceCoverage(data),
    equityMultiplier: calculateEquityMultiplier(data),
    debtToEBITDA: calculateDebtToEBITDA(data),
    
    // Extended Leverage
    netDebtToEBITDA: calculateNetDebtToEBITDA(data),
    debtToCapital: calculateDebtToCapital(data),
    longTermDebtRatio: calculateLongTermDebtRatio(data),
    fixedChargeCoverage: calculateFixedChargeCoverage(data),
    cashFlowCoverage: calculateCashFlowCoverage(data),
    timesInterestEarned: calculateTimesInterestEarned(data),
    capitalGearing: calculateCapitalGearing(data),
    debtCapacityUtilization: calculateDebtCapacityUtilization(data),
  };
}

// ============================================================================
// EXTENDED LEVERAGE CALCULATIONS
// ============================================================================

/**
 * Net Debt-to-EBITDA = (Total Debt - Cash) / EBITDA
 */
export function calculateNetDebtToEBITDA(data: YahooFinanceData): number | null {
  if (!data.ebitda || data.ebitda <= 0) return null;
  const netDebt = (data.totalDebt ?? 0) - (data.cash ?? 0);
  return safeDivide(netDebt, data.ebitda);
}

/**
 * Debt-to-Capital = Total Debt / (Total Debt + Equity)
 */
export function calculateDebtToCapital(data: YahooFinanceData): number | null {
  const capital = safeAdd(data.totalDebt ?? 0, data.totalEquity ?? 0);
  if (capital === 0) return null;
  return safeDivide(data.totalDebt, capital);
}

/**
 * Long-Term Debt Ratio = Long-Term Debt / Total Assets
 */
export function calculateLongTermDebtRatio(data: YahooFinanceData): number | null {
  return safeDivide(data.longTermDebt, data.totalAssets);
}

/**
 * Fixed Charge Coverage = (EBIT + Fixed Charges) / (Fixed Charges + Interest)
 * Approximated using operating lease payments as fixed charges
 */
export function calculateFixedChargeCoverage(data: YahooFinanceData): number | null {
  // Using interest expense as primary fixed charge (simplified)
  const fixedCharges = data.interestExpense ?? 0;
  if (fixedCharges === 0) return null;
  const numerator = (data.ebit ?? 0) + fixedCharges;
  return safeDivide(numerator, fixedCharges);
}

/**
 * Cash Flow Coverage = Operating Cash Flow / Total Debt
 */
export function calculateCashFlowCoverage(data: YahooFinanceData): number | null {
  return safeDivide(data.operatingCashFlow, data.totalDebt);
}

/**
 * Times Interest Earned (TIE) = EBIT / Interest Expense
 * Same as Interest Coverage but commonly named differently
 */
export function calculateTimesInterestEarned(data: YahooFinanceData): number | null {
  if (!data.interestExpense || data.interestExpense === 0) return null;
  return safeDivide(data.ebit, data.interestExpense);
}

/**
 * Capital Gearing = (Long-Term Debt + Preferred Stock) / Equity
 * Simplified to Long-Term Debt / Equity if preferred stock not available
 */
export function calculateCapitalGearing(data: YahooFinanceData): number | null {
  return safeDivide(data.longTermDebt, data.totalEquity);
}

/**
 * Debt Capacity Utilization = Total Debt / (EBITDA * 4)
 * Approximates how much of theoretical debt capacity (typically 4x EBITDA) is used
 */
export function calculateDebtCapacityUtilization(data: YahooFinanceData): number | null {
  if (!data.ebitda || data.ebitda <= 0) return null;
  const debtCapacity = data.ebitda * 4;
  return safeDivide(data.totalDebt, debtCapacity);
}

// ============================================================================
// INDIVIDUAL METRIC CALCULATIONS
// ============================================================================

/**
 * Debt-to-Assets Ratio = Total Debt / Total Assets
 *
 * Measures the proportion of a company's assets financed by debt.
 * Lower is generally better - indicates less financial risk.
 *
 * Source: Yahoo Finance Balance Sheet
 */
export function calculateDebtToAssets(data: YahooFinanceData): number | null {
  return safeDivide(data.totalDebt, data.totalAssets);
}

/**
 * Debt-to-Equity Ratio = Total Debt / Equity
 *
 * Measures financial leverage by comparing total debt to shareholder equity.
 * Lower is generally safer, but optimal ratio varies by industry.
 *
 * Source: Yahoo Finance Balance Sheet
 */
export function calculateDebtToEquity(data: YahooFinanceData): number | null {
  return safeDivide(data.totalDebt, data.totalEquity);
}

/**
 * Financial Debt-to-Equity Ratio = Financial Debt / Equity
 *
 * Similar to D/E but uses only financial debt (excludes operating liabilities).
 * Provides a more focused view of capital structure decisions.
 *
 * Note: Financial debt includes short-term and long-term debt.
 *
 * Source: Yahoo Finance Balance Sheet
 */
export function calculateFinancialDebtToEquity(
  data: YahooFinanceData
): number | null {
  // Financial debt = Short-term debt + Long-term debt
  const financialDebt = safeAdd(data.shortTermDebt ?? 0, data.longTermDebt ?? 0);
  return safeDivide(financialDebt, data.totalEquity);
}

/**
 * Interest Coverage Ratio = EBIT / Interest Expense
 *
 * Measures ability to pay interest on outstanding debt.
 * Higher is better - indicates greater ability to meet interest obligations.
 *
 * A ratio below 1.5 is generally considered risky.
 *
 * Source: Yahoo Finance Income Statement
 */
export function calculateInterestCoverage(
  data: YahooFinanceData
): number | null {
  // Return null if no interest expense (company has no debt)
  if (!data.interestExpense || data.interestExpense === 0) return null;

  return safeDivide(data.ebit, data.interestExpense);
}

/**
 * Debt Service Coverage Ratio (DSCR) = NOI / Debt Service
 *
 * Measures cash flow available to pay current debt obligations.
 * Higher is better - indicates stronger ability to service debt.
 *
 * NOI = Net Operating Income (Operating Income)
 * Debt Service = Interest Expense + Principal Payments (approximated by current portion of debt)
 *
 * Note: This is a simplified DSCR using operating income as NOI proxy.
 * Ideally would use actual cash flow and scheduled debt payments.
 *
 * Source: Yahoo Finance Income Statement + Balance Sheet
 */
export function calculateDebtServiceCoverage(
  data: YahooFinanceData
): number | null {
  // Use operating income as NOI proxy
  const noi = data.operatingIncome;

  // Debt service = Interest expense + current portion of debt (approximated by short-term debt)
  const debtService = safeAdd(
    data.interestExpense ?? 0,
    data.shortTermDebt ?? 0
  );

  // Return null if no debt service
  if (debtService === 0) return null;

  return safeDivide(noi, debtService);
}

/**
 * Equity Multiplier = Assets / Equity
 *
 * Measures financial leverage - how much assets are funded by equity vs debt.
 * Higher value indicates more leverage (more debt relative to equity).
 *
 * Part of DuPont analysis: ROE = ROA × Equity Multiplier
 *
 * Source: Yahoo Finance Balance Sheet
 */
export function calculateEquityMultiplier(
  data: YahooFinanceData
): number | null {
  return safeDivide(data.totalAssets, data.totalEquity);
}

/**
 * Debt-to-EBITDA Ratio = Total Debt / EBITDA
 *
 * Measures how many years it would take to pay off debt using EBITDA.
 * Lower is better - indicates debt is more manageable relative to earnings.
 *
 * Commonly used by credit rating agencies. Generally:
 * - < 3: Strong
 * - 3-4: Moderate
 * - > 4: High leverage
 *
 * Source: Yahoo Finance Balance Sheet (Debt) + Income Statement (EBITDA)
 */
export function calculateDebtToEBITDA(data: YahooFinanceData): number | null {
  // Return null if EBITDA is zero or negative
  if (!data.ebitda || data.ebitda <= 0) return null;

  return safeDivide(data.totalDebt, data.ebitda);
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
 * Interpret Debt-to-Assets Ratio
 *
 * Thresholds:
 * - Good: < 0.3 (low leverage)
 * - Neutral: 0.3 - 0.6 (moderate leverage)
 * - Bad: > 0.6 (high leverage)
 */
export function interpretDebtToAssets(
  ratio: number | null
): MetricInterpretation {
  if (ratio == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate debt-to-assets ratio',
      threshold: 'N/A',
    };
  }

  if (ratio < 0.3) {
    return {
      level: 'good',
      message: 'Low leverage - strong financial position with minimal debt burden',
      threshold: '< 0.3',
    };
  }

  if (ratio <= 0.6) {
    return {
      level: 'neutral',
      message: 'Moderate leverage - acceptable debt levels for most industries',
      threshold: '0.3 - 0.6',
    };
  }

  return {
    level: 'bad',
    message: 'High leverage - significant portion of assets financed by debt',
    threshold: '> 0.6',
  };
}

/**
 * Interpret Debt-to-Equity Ratio
 *
 * Thresholds:
 * - Good: < 1.0 (conservative capital structure)
 * - Neutral: 1.0 - 2.0 (moderate leverage)
 * - Bad: > 2.0 (aggressive leverage)
 */
export function interpretDebtToEquity(
  ratio: number | null
): MetricInterpretation {
  if (ratio == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate debt-to-equity ratio',
      threshold: 'N/A',
    };
  }

  if (ratio < 1.0) {
    return {
      level: 'good',
      message: 'Conservative capital structure - equity exceeds debt',
      threshold: '< 1.0',
    };
  }

  if (ratio <= 2.0) {
    return {
      level: 'neutral',
      message: 'Moderate leverage - balanced use of debt and equity',
      threshold: '1.0 - 2.0',
    };
  }

  return {
    level: 'bad',
    message: 'High leverage - debt significantly exceeds equity',
    threshold: '> 2.0',
  };
}

/**
 * Interpret Financial Debt-to-Equity Ratio
 *
 * Thresholds (typically lower than total D/E):
 * - Good: < 0.8 (conservative)
 * - Neutral: 0.8 - 1.5 (moderate)
 * - Bad: > 1.5 (aggressive)
 */
export function interpretFinancialDebtToEquity(
  ratio: number | null
): MetricInterpretation {
  if (ratio == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate financial debt-to-equity ratio',
      threshold: 'N/A',
    };
  }

  if (ratio < 0.8) {
    return {
      level: 'good',
      message: 'Conservative financial leverage - strong equity cushion',
      threshold: '< 0.8',
    };
  }

  if (ratio <= 1.5) {
    return {
      level: 'neutral',
      message: 'Moderate financial leverage - acceptable debt levels',
      threshold: '0.8 - 1.5',
    };
  }

  return {
    level: 'bad',
    message: 'High financial leverage - may face refinancing or interest rate risk',
    threshold: '> 1.5',
  };
}

/**
 * Interpret Interest Coverage Ratio
 *
 * Thresholds:
 * - Good: >= 5.0 (strong coverage)
 * - Neutral: 2.5 - 5.0 (adequate coverage)
 * - Bad: < 2.5 (weak coverage)
 */
export function interpretInterestCoverage(
  ratio: number | null
): MetricInterpretation {
  if (ratio == null) {
    return {
      level: 'neutral',
      message: 'No interest expense or insufficient data',
      threshold: 'N/A',
    };
  }

  if (ratio >= 5.0) {
    return {
      level: 'good',
      message: 'Strong interest coverage - earnings comfortably exceed interest obligations',
      threshold: '>= 5.0',
    };
  }

  if (ratio >= 2.5) {
    return {
      level: 'neutral',
      message: 'Adequate interest coverage - sufficient earnings to cover interest',
      threshold: '2.5 - 5.0',
    };
  }

  if (ratio >= 1.5) {
    return {
      level: 'bad',
      message: 'Weak interest coverage - limited cushion for interest payments',
      threshold: '1.5 - 2.5',
    };
  }

  return {
    level: 'bad',
    message: 'Critical interest coverage - may struggle to meet interest obligations',
    threshold: '< 1.5',
  };
}

/**
 * Interpret Debt Service Coverage Ratio
 *
 * Thresholds:
 * - Good: >= 2.0 (strong coverage)
 * - Neutral: 1.25 - 2.0 (adequate coverage)
 * - Bad: < 1.25 (weak coverage)
 */
export function interpretDebtServiceCoverage(
  ratio: number | null
): MetricInterpretation {
  if (ratio == null) {
    return {
      level: 'neutral',
      message: 'No debt service or insufficient data',
      threshold: 'N/A',
    };
  }

  if (ratio >= 2.0) {
    return {
      level: 'good',
      message: 'Strong debt service coverage - cash flow comfortably exceeds debt obligations',
      threshold: '>= 2.0',
    };
  }

  if (ratio >= 1.25) {
    return {
      level: 'neutral',
      message: 'Adequate debt service coverage - sufficient cash flow for debt payments',
      threshold: '1.25 - 2.0',
    };
  }

  if (ratio >= 1.0) {
    return {
      level: 'bad',
      message: 'Weak debt service coverage - minimal cushion for debt payments',
      threshold: '1.0 - 1.25',
    };
  }

  return {
    level: 'bad',
    message: 'Critical debt service coverage - cash flow insufficient for debt obligations',
    threshold: '< 1.0',
  };
}

/**
 * Interpret Equity Multiplier
 *
 * Thresholds:
 * - Good: 1.0 - 2.0 (low leverage)
 * - Neutral: 2.0 - 3.0 (moderate leverage)
 * - Bad: > 3.0 (high leverage)
 */
export function interpretEquityMultiplier(
  ratio: number | null
): MetricInterpretation {
  if (ratio == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate equity multiplier',
      threshold: 'N/A',
    };
  }

  if (ratio >= 1.0 && ratio <= 2.0) {
    return {
      level: 'good',
      message: 'Low leverage - assets primarily funded by equity',
      threshold: '1.0 - 2.0',
    };
  }

  if (ratio <= 3.0) {
    return {
      level: 'neutral',
      message: 'Moderate leverage - balanced capital structure',
      threshold: '2.0 - 3.0',
    };
  }

  return {
    level: 'bad',
    message: 'High leverage - significant reliance on debt financing',
    threshold: '> 3.0',
  };
}

/**
 * Interpret Debt-to-EBITDA Ratio
 *
 * Thresholds:
 * - Good: < 3.0 (manageable debt)
 * - Neutral: 3.0 - 4.0 (moderate debt)
 * - Bad: > 4.0 (heavy debt burden)
 */
export function interpretDebtToEBITDA(
  ratio: number | null
): MetricInterpretation {
  if (ratio == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate debt-to-EBITDA ratio',
      threshold: 'N/A',
    };
  }

  if (ratio < 3.0) {
    return {
      level: 'good',
      message: 'Strong position - debt is manageable relative to earnings',
      threshold: '< 3.0',
    };
  }

  if (ratio <= 4.0) {
    return {
      level: 'neutral',
      message: 'Moderate debt burden - monitor for deterioration',
      threshold: '3.0 - 4.0',
    };
  }

  return {
    level: 'bad',
    message: 'High debt burden - may face challenges refinancing or servicing debt',
    threshold: '> 4.0',
  };
}

/**
 * Generic interpretation for extended leverage metrics
 */
function interpretExtendedLeverage(value: number | null, name: string): MetricInterpretation {
  if (value == null) {
    return {
      level: 'neutral',
      message: `Insufficient data to calculate ${name}`,
      threshold: 'N/A',
    };
  }
  // Default interpretation for most leverage ratios
  if (value < 0.5) {
    return { level: 'good', message: `Low ${name}`, threshold: '< 0.5' };
  } else if (value <= 1.0) {
    return { level: 'neutral', message: `Moderate ${name}`, threshold: '0.5 - 1.0' };
  }
  return { level: 'bad', message: `High ${name}`, threshold: '> 1.0' };
}

/**
 * Get comprehensive interpretation of all leverage metrics
 */
export function interpretAllLeverageMetrics(
  metrics: LeverageMetrics
): Record<keyof LeverageMetrics, MetricInterpretation> {
  return {
    debtToAssets: interpretDebtToAssets(metrics.debtToAssets),
    debtToEquity: interpretDebtToEquity(metrics.debtToEquity),
    financialDebtToEquity: interpretFinancialDebtToEquity(
      metrics.financialDebtToEquity
    ),
    interestCoverage: interpretInterestCoverage(metrics.interestCoverage),
    debtServiceCoverage: interpretDebtServiceCoverage(
      metrics.debtServiceCoverage
    ),
    equityMultiplier: interpretEquityMultiplier(metrics.equityMultiplier),
    debtToEBITDA: interpretDebtToEBITDA(metrics.debtToEBITDA),
    
    // Extended Leverage Interpretations
    netDebtToEBITDA: interpretExtendedLeverage(metrics.netDebtToEBITDA, 'Net Debt-to-EBITDA'),
    debtToCapital: interpretExtendedLeverage(metrics.debtToCapital, 'Debt-to-Capital'),
    longTermDebtRatio: interpretExtendedLeverage(metrics.longTermDebtRatio, 'Long-Term Debt Ratio'),
    fixedChargeCoverage: interpretExtendedLeverage(metrics.fixedChargeCoverage, 'Fixed Charge Coverage'),
    cashFlowCoverage: interpretExtendedLeverage(metrics.cashFlowCoverage, 'Cash Flow Coverage'),
    timesInterestEarned: interpretExtendedLeverage(metrics.timesInterestEarned, 'Times Interest Earned'),
    capitalGearing: interpretExtendedLeverage(metrics.capitalGearing, 'Capital Gearing'),
    debtCapacityUtilization: interpretExtendedLeverage(metrics.debtCapacityUtilization, 'Debt Capacity Utilization'),
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a company has no debt
 */
export function isDebtFree(data: YahooFinanceData): boolean {
  return !data.totalDebt || data.totalDebt === 0;
}

/**
 * Get leverage summary score (0-100)
 * Combines all leverage metrics into a single score
 */
export function getLeverageScore(metrics: LeverageMetrics): number | null {
  const interpretations = interpretAllLeverageMetrics(metrics);

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
 * Check if company is over-leveraged (multiple warning signs)
 */
export function isOverLeveraged(metrics: LeverageMetrics): boolean {
  const interpretations = interpretAllLeverageMetrics(metrics);

  // Count how many metrics are "bad"
  const badMetrics = Object.values(interpretations).filter(
    (i) => i.level === 'bad' && i.threshold !== 'N/A'
  ).length;

  // Consider over-leveraged if 3+ metrics are bad
  return badMetrics >= 3;
}

/**
 * Get financial health rating based on leverage metrics
 */
export function getLeverageHealthRating(
  metrics: LeverageMetrics
): 'Excellent' | 'Good' | 'Fair' | 'Poor' | 'Critical' {
  const score = getLeverageScore(metrics);

  if (score == null) return 'Fair';

  if (score >= 80) return 'Excellent';
  if (score >= 65) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 35) return 'Poor';
  return 'Critical';
}
