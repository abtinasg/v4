/**
 * Deep Terminal - Efficiency/Activity Metrics
 *
 * Calculate and interpret 6 efficiency/activity ratios from Yahoo Finance data
 * All data sourced from Balance Sheet and Income Statement
 */

import type { YahooFinanceData, EfficiencyMetrics } from './types';
import { safeDivide, safeSubtract } from './helpers';

// ============================================================================
// EFFICIENCY METRICS CALCULATION
// ============================================================================

/**
 * Calculate all 6 efficiency/activity metrics from Yahoo Finance data
 *
 * @param data - Raw financial data from Yahoo Finance
 * @returns EfficiencyMetrics object with all 6 ratios
 */
export function calculateEfficiency(data: YahooFinanceData): EfficiencyMetrics {
  return {
    totalAssetTurnover: calculateTotalAssetTurnover(data),
    fixedAssetTurnover: calculateFixedAssetTurnover(data),
    inventoryTurnover: calculateInventoryTurnover(data),
    receivablesTurnover: calculateReceivablesTurnover(data),
    payablesTurnover: calculatePayablesTurnover(data),
    workingCapitalTurnover: calculateWorkingCapitalTurnover(data),
  };
}

// ============================================================================
// INDIVIDUAL METRIC CALCULATIONS
// ============================================================================

/**
 * Total Asset Turnover = Revenue / Total Assets
 *
 * Measures how efficiently a company uses its assets to generate revenue.
 * Higher is better - indicates more revenue per dollar of assets.
 *
 * Varies significantly by industry (asset-heavy vs asset-light businesses).
 *
 * Source: Yahoo Finance Income Statement (Revenue) + Balance Sheet (Total Assets)
 */
export function calculateTotalAssetTurnover(
  data: YahooFinanceData
): number | null {
  return safeDivide(data.revenue, data.totalAssets);
}

/**
 * Fixed Asset Turnover = Revenue / Fixed Assets
 *
 * Measures how efficiently a company uses its fixed assets (PP&E) to generate revenue.
 * Higher is better - indicates more revenue per dollar of fixed assets.
 *
 * Particularly important for capital-intensive industries (manufacturing, utilities).
 * Fixed Assets = Total Assets - Current Assets (approximation for PP&E)
 *
 * Source: Yahoo Finance Income Statement (Revenue) + Balance Sheet (Assets)
 */
export function calculateFixedAssetTurnover(
  data: YahooFinanceData
): number | null {
  // Fixed assets approximated as Total Assets - Current Assets
  const fixedAssets = safeSubtract(data.totalAssets, data.currentAssets);
  if (fixedAssets === null || fixedAssets <= 0) return null;

  return safeDivide(data.revenue, fixedAssets);
}

/**
 * Inventory Turnover = COGS / Inventory
 *
 * Measures how many times inventory is sold and replaced during a period.
 * Higher is generally better - indicates faster inventory movement.
 *
 * Note: Returns null for service companies with no inventory.
 *
 * Source: Yahoo Finance Income Statement (COGS) + Balance Sheet (Inventory)
 */
export function calculateInventoryTurnover(
  data: YahooFinanceData
): number | null {
  // Return null if no inventory or COGS (service companies)
  if (!data.inventory || !data.costOfRevenue) return null;

  return safeDivide(data.costOfRevenue, data.inventory);
}

/**
 * Receivables Turnover = Revenue / Receivables
 *
 * Measures how efficiently a company collects receivables from customers.
 * Higher is better - indicates faster collection and better credit management.
 *
 * Related to Days Sales Outstanding (DSO = 365 / Receivables Turnover)
 *
 * Source: Yahoo Finance Income Statement (Revenue) + Balance Sheet (Receivables)
 */
export function calculateReceivablesTurnover(
  data: YahooFinanceData
): number | null {
  // Return null if no receivables
  if (!data.netReceivables) return null;

  return safeDivide(data.revenue, data.netReceivables);
}

/**
 * Payables Turnover = COGS / Payables
 *
 * Measures how frequently a company pays its suppliers.
 * Higher turnover = faster payment (less time to pay suppliers)
 *
 * Optimal rate varies - too high may miss cash preservation opportunities,
 * too low may strain supplier relationships.
 *
 * Related to Days Payables Outstanding (DPO = 365 / Payables Turnover)
 *
 * Source: Yahoo Finance Income Statement (COGS) + Balance Sheet (Payables)
 */
export function calculatePayablesTurnover(
  data: YahooFinanceData
): number | null {
  // Return null if no COGS or payables
  if (!data.costOfRevenue || !data.accountsPayable) return null;

  return safeDivide(data.costOfRevenue, data.accountsPayable);
}

/**
 * Working Capital Turnover = Revenue / Working Capital
 *
 * Measures how efficiently a company uses working capital to generate revenue.
 * Higher is better (to a point) - indicates efficient use of working capital.
 *
 * Working Capital = Current Assets - Current Liabilities
 * Negative working capital makes this metric less meaningful.
 *
 * Source: Yahoo Finance Income Statement (Revenue) + Balance Sheet (Current Assets/Liabilities)
 */
export function calculateWorkingCapitalTurnover(
  data: YahooFinanceData
): number | null {
  const workingCapital = safeSubtract(data.currentAssets, data.currentLiabilities);

  // Return null if working capital is negative or zero
  if (workingCapital === null || workingCapital <= 0) return null;

  return safeDivide(data.revenue, workingCapital);
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
 * Interpret Total Asset Turnover
 *
 * Thresholds (industry-dependent):
 * - Good: >= 2.0 (efficient asset utilization)
 * - Neutral: 1.0 - 2.0 (average efficiency)
 * - Bad: < 1.0 (underutilized assets)
 */
export function interpretTotalAssetTurnover(
  ratio: number | null
): MetricInterpretation {
  if (ratio == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate total asset turnover',
      threshold: 'N/A',
    };
  }

  if (ratio >= 2.0) {
    return {
      level: 'good',
      message: 'Efficient asset utilization - generating strong revenue per dollar of assets',
      threshold: '>= 2.0',
    };
  }

  if (ratio >= 1.0) {
    return {
      level: 'neutral',
      message: 'Average asset efficiency - generating revenue in line with asset base',
      threshold: '1.0 - 2.0',
    };
  }

  return {
    level: 'bad',
    message: 'Low asset turnover - assets may be underutilized or company is capital-intensive',
    threshold: '< 1.0',
  };
}

/**
 * Interpret Fixed Asset Turnover
 *
 * Thresholds (highly industry-dependent):
 * - Good: >= 5.0 (efficient use of fixed assets)
 * - Neutral: 2.0 - 5.0 (moderate efficiency)
 * - Bad: < 2.0 (underutilized fixed assets)
 */
export function interpretFixedAssetTurnover(
  ratio: number | null
): MetricInterpretation {
  if (ratio == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate fixed asset turnover',
      threshold: 'N/A',
    };
  }

  if (ratio >= 5.0) {
    return {
      level: 'good',
      message: 'Highly efficient use of fixed assets - strong revenue generation',
      threshold: '>= 5.0',
    };
  }

  if (ratio >= 2.0) {
    return {
      level: 'neutral',
      message: 'Moderate fixed asset efficiency - typical for capital-intensive industries',
      threshold: '2.0 - 5.0',
    };
  }

  return {
    level: 'bad',
    message: 'Low fixed asset turnover - may indicate underutilized equipment or facilities',
    threshold: '< 2.0',
  };
}

/**
 * Interpret Inventory Turnover
 *
 * Thresholds (highly industry-dependent):
 * - Good: >= 8.0 (fast-moving inventory)
 * - Neutral: 4.0 - 8.0 (moderate turnover)
 * - Bad: < 4.0 (slow-moving inventory)
 *
 * Note: Optimal varies widely by industry (grocery: 15+, luxury goods: 2-3)
 */
export function interpretInventoryTurnover(
  ratio: number | null
): MetricInterpretation {
  if (ratio == null) {
    return {
      level: 'neutral',
      message: 'Not applicable (service company) or insufficient data',
      threshold: 'N/A',
    };
  }

  if (ratio >= 8.0) {
    return {
      level: 'good',
      message: 'Fast inventory turnover - efficient inventory management and strong demand',
      threshold: '>= 8.0',
    };
  }

  if (ratio >= 4.0) {
    return {
      level: 'neutral',
      message: 'Moderate inventory turnover - acceptable for most industries',
      threshold: '4.0 - 8.0',
    };
  }

  return {
    level: 'bad',
    message: 'Slow inventory turnover - may indicate overstocking, obsolescence, or weak demand',
    threshold: '< 4.0',
  };
}

/**
 * Interpret Receivables Turnover
 *
 * Thresholds:
 * - Good: >= 12.0 (fast collection, ~30 days)
 * - Neutral: 6.0 - 12.0 (average collection, 30-60 days)
 * - Bad: < 6.0 (slow collection, >60 days)
 */
export function interpretReceivablesTurnover(
  ratio: number | null
): MetricInterpretation {
  if (ratio == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate receivables turnover',
      threshold: 'N/A',
    };
  }

  if (ratio >= 12.0) {
    return {
      level: 'good',
      message: 'Fast receivables collection - efficient credit management (~30 days DSO)',
      threshold: '>= 12.0',
    };
  }

  if (ratio >= 6.0) {
    return {
      level: 'neutral',
      message: 'Average collection period - monitor for deterioration (30-60 days DSO)',
      threshold: '6.0 - 12.0',
    };
  }

  return {
    level: 'bad',
    message: 'Slow receivables collection - may indicate credit issues or customer payment problems (>60 days DSO)',
    threshold: '< 6.0',
  };
}

/**
 * Interpret Payables Turnover
 *
 * Thresholds:
 * - Good: 6.0 - 12.0 (balanced payment, 30-60 days)
 * - Neutral: 4.0 - 6.0 or 12.0 - 18.0 (extended or fast payment)
 * - Bad: < 4.0 (very slow, >90 days) or > 18.0 (too fast, <20 days)
 */
export function interpretPayablesTurnover(
  ratio: number | null
): MetricInterpretation {
  if (ratio == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate payables turnover',
      threshold: 'N/A',
    };
  }

  if (ratio >= 6.0 && ratio <= 12.0) {
    return {
      level: 'good',
      message: 'Balanced payment terms - maintains supplier relationships while preserving cash (30-60 days DPO)',
      threshold: '6.0 - 12.0',
    };
  }

  if ((ratio >= 4.0 && ratio < 6.0) || (ratio > 12.0 && ratio <= 18.0)) {
    return {
      level: 'neutral',
      message: ratio > 12.0
        ? 'Fast payment to suppliers - good relationships but less cash preservation (20-30 days DPO)'
        : 'Extended payment terms - good for cash but monitor supplier relationships (60-90 days DPO)',
      threshold: ratio > 12.0 ? '12.0 - 18.0' : '4.0 - 6.0',
    };
  }

  if (ratio < 4.0) {
    return {
      level: 'bad',
      message: 'Very slow payment to suppliers - may strain relationships or indicate cash issues (>90 days DPO)',
      threshold: '< 4.0',
    };
  }

  return {
    level: 'bad',
    message: 'Paying suppliers very quickly - missing cash preservation opportunities (<20 days DPO)',
    threshold: '> 18.0',
  };
}

/**
 * Interpret Working Capital Turnover
 *
 * Thresholds:
 * - Good: 4.0 - 8.0 (efficient use of working capital)
 * - Neutral: 2.0 - 4.0 or 8.0 - 12.0 (acceptable efficiency)
 * - Bad: < 2.0 (excess working capital) or > 12.0 (potential liquidity strain)
 */
export function interpretWorkingCapitalTurnover(
  ratio: number | null
): MetricInterpretation {
  if (ratio == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data or negative working capital',
      threshold: 'N/A',
    };
  }

  if (ratio >= 4.0 && ratio <= 8.0) {
    return {
      level: 'good',
      message: 'Efficient use of working capital - optimal balance between growth and liquidity',
      threshold: '4.0 - 8.0',
    };
  }

  if ((ratio >= 2.0 && ratio < 4.0) || (ratio > 8.0 && ratio <= 12.0)) {
    return {
      level: 'neutral',
      message: ratio > 8.0
        ? 'High working capital turnover - efficient but monitor liquidity buffer'
        : 'Moderate working capital turnover - may have excess working capital',
      threshold: ratio > 8.0 ? '8.0 - 12.0' : '2.0 - 4.0',
    };
  }

  if (ratio < 2.0) {
    return {
      level: 'bad',
      message: 'Low working capital turnover - significant excess working capital tied up inefficiently',
      threshold: '< 2.0',
    };
  }

  return {
    level: 'bad',
    message: 'Very high working capital turnover - may indicate insufficient liquidity buffer',
    threshold: '> 12.0',
  };
}

/**
 * Get comprehensive interpretation of all efficiency metrics
 */
export function interpretAllEfficiencyMetrics(
  metrics: EfficiencyMetrics
): Record<keyof EfficiencyMetrics, MetricInterpretation> {
  return {
    totalAssetTurnover: interpretTotalAssetTurnover(metrics.totalAssetTurnover),
    fixedAssetTurnover: interpretFixedAssetTurnover(metrics.fixedAssetTurnover),
    inventoryTurnover: interpretInventoryTurnover(metrics.inventoryTurnover),
    receivablesTurnover: interpretReceivablesTurnover(metrics.receivablesTurnover),
    payablesTurnover: interpretPayablesTurnover(metrics.payablesTurnover),
    workingCapitalTurnover: interpretWorkingCapitalTurnover(metrics.workingCapitalTurnover),
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get efficiency summary score (0-100)
 * Combines all efficiency metrics into a single score
 */
export function getEfficiencyScore(metrics: EfficiencyMetrics): number | null {
  const interpretations = interpretAllEfficiencyMetrics(metrics);

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
