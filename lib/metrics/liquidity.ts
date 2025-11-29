/**
 * Deep Terminal - Liquidity Metrics
 *
 * Calculate and interpret 7 liquidity ratios from Yahoo Finance data
 * All data sourced from Balance Sheet and Income Statement
 */

import type { YahooFinanceData, LiquidityMetrics } from './types';
import { safeDivide, safeSubtract, safeAdd } from './helpers';

// ============================================================================
// LIQUIDITY METRICS CALCULATION
// ============================================================================

/**
 * Calculate all liquidity metrics from Yahoo Finance data
 *
 * @param data - Raw financial data from Yahoo Finance
 * @returns LiquidityMetrics object with all ratios
 */
export function calculateLiquidity(data: YahooFinanceData): LiquidityMetrics {
  return {
    currentRatio: calculateCurrentRatio(data),
    quickRatio: calculateQuickRatio(data),
    cashRatio: calculateCashRatio(data),
    daysSalesOutstanding: calculateDaysSalesOutstanding(data),
    daysInventoryOutstanding: calculateDaysInventoryOutstanding(data),
    daysPayablesOutstanding: calculateDaysPayablesOutstanding(data),
    cashConversionCycle: calculateCashConversionCycle(data),
    
    // Extended Liquidity
    absoluteLiquidityRatio: calculateAbsoluteLiquidityRatio(data),
    defensiveInterval: calculateDefensiveInterval(data),
    netWorkingCapitalRatio: calculateNetWorkingCapitalRatio(data),
    operatingCashFlowRatio: calculateOperatingCashFlowRatio(data),
    cashBurnRate: calculateCashBurnRate(data),
  };
}

// ============================================================================
// EXTENDED LIQUIDITY CALCULATIONS
// ============================================================================

/**
 * Absolute Liquidity Ratio = Cash / Current Liabilities
 * (More stringent than cash ratio, excludes short-term investments)
 */
export function calculateAbsoluteLiquidityRatio(data: YahooFinanceData): number | null {
  return safeDivide(data.cash, data.currentLiabilities);
}

/**
 * Defensive Interval = (Cash + Receivables + Marketable Securities) / Daily Operating Expenses
 * Measures days a company can operate without additional cash inflows
 */
export function calculateDefensiveInterval(data: YahooFinanceData): number | null {
  const liquidAssets = safeAdd(data.cash ?? 0, safeAdd(data.netReceivables ?? 0, data.shortTermInvestments ?? 0));
  const operatingExpenses = data.operatingExpenses ?? data.costOfRevenue ?? 0;
  const dailyExpenses = operatingExpenses / 365;
  if (dailyExpenses === 0) return null;
  return safeDivide(liquidAssets, dailyExpenses);
}

/**
 * Net Working Capital Ratio = (Current Assets - Current Liabilities) / Total Assets
 */
export function calculateNetWorkingCapitalRatio(data: YahooFinanceData): number | null {
  const nwc = safeSubtract(data.currentAssets ?? 0, data.currentLiabilities ?? 0);
  return safeDivide(nwc, data.totalAssets);
}

/**
 * Operating Cash Flow Ratio = Operating Cash Flow / Current Liabilities
 */
export function calculateOperatingCashFlowRatio(data: YahooFinanceData): number | null {
  return safeDivide(data.operatingCashFlow, data.currentLiabilities);
}

/**
 * Cash Burn Rate = (Beginning Cash - Ending Cash) / Number of Months
 * Simplified as Operating Cash Flow / 12 when negative (burning cash)
 */
export function calculateCashBurnRate(data: YahooFinanceData): number | null {
  if (!data.operatingCashFlow) return null;
  // If positive cash flow, no burn rate
  if (data.operatingCashFlow > 0) return 0;
  // Return monthly burn rate (positive number)
  return Math.abs(data.operatingCashFlow) / 12;
}

// ============================================================================
// INDIVIDUAL METRIC CALCULATIONS
// ============================================================================

/**
 * Current Ratio = Current Assets / Current Liabilities
 *
 * Measures ability to pay short-term obligations with short-term assets.
 * Higher is generally better, but too high may indicate inefficient use of assets.
 *
 * Source: Yahoo Finance Balance Sheet
 */
export function calculateCurrentRatio(data: YahooFinanceData): number | null {
  return safeDivide(data.currentAssets, data.currentLiabilities);
}

/**
 * Quick Ratio (Acid-Test Ratio) = (Current Assets - Inventory) / Current Liabilities
 *
 * More conservative than current ratio - excludes inventory which may not be
 * easily converted to cash. Important for companies with slow inventory turnover.
 *
 * Note: For service companies with no inventory, this equals the current ratio.
 *
 * Source: Yahoo Finance Balance Sheet
 */
export function calculateQuickRatio(data: YahooFinanceData): number | null {
  const quickAssets = safeSubtract(data.currentAssets, data.inventory ?? 0);
  return safeDivide(quickAssets, data.currentLiabilities);
}

/**
 * Cash Ratio = Cash / Current Liabilities
 *
 * Most conservative liquidity ratio - measures ability to pay current liabilities
 * with only cash and cash equivalents. Banks and creditors often use this metric.
 *
 * Source: Yahoo Finance Balance Sheet
 */
export function calculateCashRatio(data: YahooFinanceData): number | null {
  // Cash includes cash and short-term investments
  const totalCash = safeAdd(data.cash, data.shortTermInvestments ?? 0);
  return safeDivide(totalCash, data.currentLiabilities);
}

/**
 * Days Sales Outstanding (DSO) = (Receivables / Revenue) × 365
 *
 * Measures average number of days to collect payment after a sale.
 * Lower is better - indicates faster collection of receivables.
 *
 * Source: Yahoo Finance Balance Sheet (Receivables) + Income Statement (Revenue)
 */
export function calculateDaysSalesOutstanding(
  data: YahooFinanceData
): number | null {
  const receivablesTurnover = safeDivide(data.netReceivables, data.revenue);
  return receivablesTurnover != null ? receivablesTurnover * 365 : null;
}

/**
 * Days Inventory Outstanding (DIO) = (Inventory / COGS) × 365
 *
 * Measures average number of days inventory is held before being sold.
 * Lower is generally better - indicates faster inventory turnover.
 *
 * Note: Returns null for service companies with no inventory or COGS.
 *
 * Source: Yahoo Finance Balance Sheet (Inventory) + Income Statement (COGS)
 */
export function calculateDaysInventoryOutstanding(
  data: YahooFinanceData
): number | null {
  // Return null if inventory or COGS is zero (e.g., service companies)
  if (!data.inventory || !data.costOfRevenue) return null;

  const inventoryTurnover = safeDivide(data.inventory, data.costOfRevenue);
  return inventoryTurnover != null ? inventoryTurnover * 365 : null;
}

/**
 * Days Payables Outstanding (DPO) = (Payables / COGS) × 365
 *
 * Measures average number of days taken to pay suppliers.
 * Higher can be beneficial (preserving cash) but too high may damage supplier relationships.
 *
 * Source: Yahoo Finance Balance Sheet (Payables) + Income Statement (COGS)
 */
export function calculateDaysPayablesOutstanding(
  data: YahooFinanceData
): number | null {
  // Return null if no COGS (service companies)
  if (!data.costOfRevenue) return null;

  const payablesTurnover = safeDivide(data.accountsPayable, data.costOfRevenue);
  return payablesTurnover != null ? payablesTurnover * 365 : null;
}

/**
 * Cash Conversion Cycle (CCC) = DSO + DIO - DPO
 *
 * Measures how many days it takes to convert inventory and receivables into cash.
 * Lower (or negative) is better - indicates faster cash conversion.
 *
 * Note: Returns null if any component is missing (e.g., service companies without inventory).
 *
 * Source: Calculated from DSO, DIO, and DPO
 */
export function calculateCashConversionCycle(
  data: YahooFinanceData
): number | null {
  const dso = calculateDaysSalesOutstanding(data);
  const dio = calculateDaysInventoryOutstanding(data);
  const dpo = calculateDaysPayablesOutstanding(data);

  // All three components must be present for a valid CCC
  if (dso == null || dio == null || dpo == null) return null;

  return dso + dio - dpo;
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
 * Interpret Current Ratio
 *
 * Thresholds:
 * - Good: >= 2.0 (strong liquidity)
 * - Neutral: 1.0 - 2.0 (acceptable liquidity)
 * - Bad: < 1.0 (liquidity concerns)
 */
export function interpretCurrentRatio(
  ratio: number | null
): MetricInterpretation {
  if (ratio == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate current ratio',
      threshold: 'N/A',
    };
  }

  if (ratio >= 2.0) {
    return {
      level: 'good',
      message: 'Strong liquidity position - can easily cover short-term obligations',
      threshold: '>= 2.0',
    };
  }

  if (ratio >= 1.0) {
    return {
      level: 'neutral',
      message: 'Acceptable liquidity - current assets cover current liabilities',
      threshold: '1.0 - 2.0',
    };
  }

  return {
    level: 'bad',
    message: 'Liquidity concerns - may struggle to meet short-term obligations',
    threshold: '< 1.0',
  };
}

/**
 * Interpret Quick Ratio
 *
 * Thresholds:
 * - Good: >= 1.5 (strong liquid position)
 * - Neutral: 1.0 - 1.5 (adequate liquid assets)
 * - Bad: < 1.0 (potential liquidity issues)
 */
export function interpretQuickRatio(
  ratio: number | null
): MetricInterpretation {
  if (ratio == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate quick ratio',
      threshold: 'N/A',
    };
  }

  if (ratio >= 1.5) {
    return {
      level: 'good',
      message: 'Strong liquid position - can cover obligations without selling inventory',
      threshold: '>= 1.5',
    };
  }

  if (ratio >= 1.0) {
    return {
      level: 'neutral',
      message: 'Adequate liquid assets to cover current liabilities',
      threshold: '1.0 - 1.5',
    };
  }

  return {
    level: 'bad',
    message: 'May need to sell inventory or secure financing to meet obligations',
    threshold: '< 1.0',
  };
}

/**
 * Interpret Cash Ratio
 *
 * Thresholds:
 * - Good: >= 0.5 (strong cash reserves)
 * - Neutral: 0.2 - 0.5 (adequate cash)
 * - Bad: < 0.2 (low cash reserves)
 */
export function interpretCashRatio(ratio: number | null): MetricInterpretation {
  if (ratio == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate cash ratio',
      threshold: 'N/A',
    };
  }

  if (ratio >= 0.5) {
    return {
      level: 'good',
      message: 'Strong cash reserves - can cover significant portion of liabilities immediately',
      threshold: '>= 0.5',
    };
  }

  if (ratio >= 0.2) {
    return {
      level: 'neutral',
      message: 'Adequate cash position for immediate needs',
      threshold: '0.2 - 0.5',
    };
  }

  return {
    level: 'bad',
    message: 'Low cash reserves - may face challenges in emergency situations',
    threshold: '< 0.2',
  };
}

/**
 * Interpret Days Sales Outstanding (DSO)
 *
 * Thresholds (industry-dependent, these are general guidelines):
 * - Good: <= 30 days (fast collection)
 * - Neutral: 30 - 60 days (average collection)
 * - Bad: > 60 days (slow collection)
 */
export function interpretDaysSalesOutstanding(
  days: number | null
): MetricInterpretation {
  if (days == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate DSO',
      threshold: 'N/A',
    };
  }

  if (days <= 30) {
    return {
      level: 'good',
      message: 'Fast collection of receivables - efficient credit management',
      threshold: '<= 30 days',
    };
  }

  if (days <= 60) {
    return {
      level: 'neutral',
      message: 'Average collection period - monitor for deterioration',
      threshold: '30 - 60 days',
    };
  }

  return {
    level: 'bad',
    message: 'Slow collection - may indicate credit policy issues or customer payment problems',
    threshold: '> 60 days',
  };
}

/**
 * Interpret Days Inventory Outstanding (DIO)
 *
 * Thresholds (highly industry-dependent):
 * - Good: <= 45 days (fast turnover)
 * - Neutral: 45 - 90 days (average turnover)
 * - Bad: > 90 days (slow turnover)
 *
 * Note: Lower is generally better, but varies significantly by industry
 * (e.g., grocery stores vs. luxury goods vs. aircraft manufacturers)
 */
export function interpretDaysInventoryOutstanding(
  days: number | null
): MetricInterpretation {
  if (days == null) {
    return {
      level: 'neutral',
      message: 'Not applicable (service company) or insufficient data',
      threshold: 'N/A',
    };
  }

  if (days <= 45) {
    return {
      level: 'good',
      message: 'Fast inventory turnover - efficient inventory management',
      threshold: '<= 45 days',
    };
  }

  if (days <= 90) {
    return {
      level: 'neutral',
      message: 'Average inventory turnover for the period',
      threshold: '45 - 90 days',
    };
  }

  return {
    level: 'bad',
    message: 'Slow inventory turnover - may indicate overstocking or weak demand',
    threshold: '> 90 days',
  };
}

/**
 * Interpret Days Payables Outstanding (DPO)
 *
 * Thresholds:
 * - Good: 30 - 60 days (balanced payment terms)
 * - Neutral: 60 - 90 days (extended terms, monitor)
 * - Bad: < 30 days (too fast, losing cash) or > 90 days (too slow, supplier risk)
 *
 * Note: Unlike other metrics, both very high and very low can be problematic
 */
export function interpretDaysPayablesOutstanding(
  days: number | null
): MetricInterpretation {
  if (days == null) {
    return {
      level: 'neutral',
      message: 'Not applicable (service company) or insufficient data',
      threshold: 'N/A',
    };
  }

  if (days >= 30 && days <= 60) {
    return {
      level: 'good',
      message: 'Balanced payment terms - maintains good supplier relationships while preserving cash',
      threshold: '30 - 60 days',
    };
  }

  if (days > 60 && days <= 90) {
    return {
      level: 'neutral',
      message: 'Extended payment terms - good for cash flow but monitor supplier relationships',
      threshold: '60 - 90 days',
    };
  }

  if (days < 30) {
    return {
      level: 'bad',
      message: 'Paying suppliers too quickly - may be missing opportunities to preserve cash',
      threshold: '< 30 days',
    };
  }

  return {
    level: 'bad',
    message: 'Very long payment period - may strain supplier relationships or indicate cash flow issues',
    threshold: '> 90 days',
  };
}

/**
 * Interpret Cash Conversion Cycle (CCC)
 *
 * Thresholds:
 * - Good: <= 30 days or negative (very efficient)
 * - Neutral: 30 - 60 days (average efficiency)
 * - Bad: > 60 days (inefficient cash conversion)
 *
 * Note: Negative CCC is excellent - means company gets paid before paying suppliers
 */
export function interpretCashConversionCycle(
  days: number | null
): MetricInterpretation {
  if (days == null) {
    return {
      level: 'neutral',
      message: 'Not applicable (service company) or insufficient data',
      threshold: 'N/A',
    };
  }

  if (days <= 30) {
    if (days < 0) {
      return {
        level: 'good',
        message: 'Negative CCC - exceptional cash management! Gets paid before paying suppliers',
        threshold: '< 0 days',
      };
    }
    return {
      level: 'good',
      message: 'Very efficient cash conversion - minimal working capital needs',
      threshold: '<= 30 days',
    };
  }

  if (days <= 60) {
    return {
      level: 'neutral',
      message: 'Average cash conversion period - room for improvement',
      threshold: '30 - 60 days',
    };
  }

  return {
    level: 'bad',
    message: 'Long cash conversion cycle - significant working capital tied up',
    threshold: '> 60 days',
  };
}

/**
 * Generic interpretation for extended liquidity metrics
 */
function interpretExtendedLiquidity(value: number | null, name: string): MetricInterpretation {
  if (value == null) {
    return {
      level: 'neutral',
      message: `Insufficient data to calculate ${name}`,
      threshold: 'N/A',
    };
  }
  if (value >= 1.0) {
    return { level: 'good', message: `Strong ${name}`, threshold: '>= 1.0' };
  } else if (value >= 0.5) {
    return { level: 'neutral', message: `Moderate ${name}`, threshold: '0.5 - 1.0' };
  }
  return { level: 'bad', message: `Low ${name}`, threshold: '< 0.5' };
}

/**
 * Get comprehensive interpretation of all liquidity metrics
 */
export function interpretAllLiquidityMetrics(
  metrics: LiquidityMetrics
): Record<keyof LiquidityMetrics, MetricInterpretation> {
  return {
    currentRatio: interpretCurrentRatio(metrics.currentRatio),
    quickRatio: interpretQuickRatio(metrics.quickRatio),
    cashRatio: interpretCashRatio(metrics.cashRatio),
    daysSalesOutstanding: interpretDaysSalesOutstanding(
      metrics.daysSalesOutstanding
    ),
    daysInventoryOutstanding: interpretDaysInventoryOutstanding(
      metrics.daysInventoryOutstanding
    ),
    daysPayablesOutstanding: interpretDaysPayablesOutstanding(
      metrics.daysPayablesOutstanding
    ),
    cashConversionCycle: interpretCashConversionCycle(
      metrics.cashConversionCycle
    ),
    
    // Extended Liquidity Interpretations
    absoluteLiquidityRatio: interpretExtendedLiquidity(metrics.absoluteLiquidityRatio, 'Absolute Liquidity Ratio'),
    defensiveInterval: interpretExtendedLiquidity(metrics.defensiveInterval, 'Defensive Interval'),
    netWorkingCapitalRatio: interpretExtendedLiquidity(metrics.netWorkingCapitalRatio, 'Net Working Capital Ratio'),
    operatingCashFlowRatio: interpretExtendedLiquidity(metrics.operatingCashFlowRatio, 'Operating Cash Flow Ratio'),
    cashBurnRate: interpretExtendedLiquidity(metrics.cashBurnRate, 'Cash Burn Rate'),
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if a company is a service company (no inventory)
 */
export function isServiceCompany(data: YahooFinanceData): boolean {
  return !data.inventory || data.inventory === 0;
}

/**
 * Get liquidity summary score (0-100)
 * Combines all liquidity metrics into a single score
 */
export function getLiquidityScore(metrics: LiquidityMetrics): number | null {
  const interpretations = interpretAllLiquidityMetrics(metrics);

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
