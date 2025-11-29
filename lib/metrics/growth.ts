/**
 * Deep Terminal - Growth Metrics
 *
 * Calculate and interpret 9 growth metrics from Yahoo Finance data
 * Includes historical data analysis for CAGR calculations
 */

import type { YahooFinanceData, GrowthMetrics } from './types';
import { safeDivide, safeMultiply, safeSubtract, calculateCAGR, percentageChange } from './helpers';

// ============================================================================
// GROWTH METRICS CALCULATION
// ============================================================================

/**
 * Calculate all growth metrics from Yahoo Finance data
 *
 * @param data - Raw financial data from Yahoo Finance (with historical data)
 * @returns GrowthMetrics object with all metrics
 */
export function calculateGrowth(data: YahooFinanceData): GrowthMetrics {
  const retentionRatio = calculateRetentionRatio(data);
  const roe = data.returnOnEquity ?? null;
  const roa = data.returnOnAssets ?? null;
  
  return {
    revenueGrowthYoY: calculateRevenueGrowthYoY(data),
    epsGrowthYoY: calculateEPSGrowthYoY(data),
    dpsGrowth: calculateDPSGrowth(data),
    fcfGrowth: calculateFCFGrowth(data),
    revenue3YearCAGR: calculateRevenue3YearCAGR(data),
    revenue5YearCAGR: calculateRevenue5YearCAGR(data),
    sustainableGrowthRate: calculateSustainableGrowthRate(data),
    retentionRatio: retentionRatio,
    payoutRatio: calculatePayoutRatio(data),
    
    // Extended Growth
    netIncomeGrowthYoY: calculateNetIncomeGrowthYoY(data),
    ebitdaGrowthYoY: null, // Requires historical EBITDA
    operatingIncomeGrowth: null, // Requires historical operating income
    grossProfitGrowth: null, // Requires historical gross profit
    assetGrowthRate: null, // Requires historical total assets
    equityGrowthRate: null, // Requires historical equity
    bookValueGrowthRate: null, // Requires historical book value
    eps3YearCAGR: calculateEPS3YearCAGR(data),
    eps5YearCAGR: calculateEPS5YearCAGR(data),
    internalGrowthRate: roa !== null && retentionRatio !== null ? roa * retentionRatio : null,
    plowbackRatio: retentionRatio, // Same as retention ratio
  };
}

// Helper function for net income growth
function calculateNetIncomeGrowthYoY(data: YahooFinanceData): number | null {
  if (!data.historicalNetIncome || data.historicalNetIncome.length < 2) {
    return null;
  }
  const current = data.historicalNetIncome[data.historicalNetIncome.length - 1];
  const previous = data.historicalNetIncome[data.historicalNetIncome.length - 2];
  return safeDivide(current - previous, Math.abs(previous));
}

// Helper for EPS 3Y CAGR
function calculateEPS3YearCAGR(data: YahooFinanceData): number | null {
  if (!data.historicalEPS || data.historicalEPS.length < 3) {
    return null;
  }
  const start = data.historicalEPS[0];
  const end = data.historicalEPS[Math.min(2, data.historicalEPS.length - 1)];
  if (start <= 0) return null;
  return Math.pow(end / start, 1 / 3) - 1;
}

// Helper for EPS 5Y CAGR
function calculateEPS5YearCAGR(data: YahooFinanceData): number | null {
  if (!data.historicalEPS || data.historicalEPS.length < 5) {
    return null;
  }
  const start = data.historicalEPS[0];
  const end = data.historicalEPS[data.historicalEPS.length - 1];
  if (start <= 0) return null;
  return Math.pow(end / start, 1 / 5) - 1;
}

// ============================================================================
// INDIVIDUAL METRIC CALCULATIONS
// ============================================================================

/**
 * Revenue Growth YoY = (Revenue₁ - Revenue₀) / Revenue₀
 *
 * Year-over-year revenue growth rate.
 * Positive is good - indicates top-line growth.
 *
 * Source: Yahoo Finance Income Statement (current and prior year revenue)
 */
export function calculateRevenueGrowthYoY(data: YahooFinanceData): number | null {
  if (!data.historicalRevenue || data.historicalRevenue.length < 2) {
    return null;
  }

  // Most recent year is at index 0, prior year at index 1
  const currentRevenue = data.historicalRevenue[0];
  const priorRevenue = data.historicalRevenue[1];

  return percentageChange(currentRevenue, priorRevenue);
}

/**
 * EPS Growth YoY = (EPS₁ - EPS₀) / EPS₀
 *
 * Year-over-year earnings per share growth rate.
 * Higher is better - indicates growing profitability per share.
 *
 * Source: Yahoo Finance (current and prior year EPS)
 */
export function calculateEPSGrowthYoY(data: YahooFinanceData): number | null {
  if (!data.historicalEPS || data.historicalEPS.length < 2) {
    return null;
  }

  const currentEPS = data.historicalEPS[0];
  const priorEPS = data.historicalEPS[1];

  return percentageChange(currentEPS, priorEPS);
}

/**
 * DPS Growth = (DPS₁ - DPS₀) / DPS₀
 *
 * Dividend per share growth rate.
 * Positive growth indicates increasing dividends for shareholders.
 *
 * Source: Yahoo Finance (current and prior year dividends)
 */
export function calculateDPSGrowth(data: YahooFinanceData): number | null {
  if (!data.historicalDividends || data.historicalDividends.length < 2) {
    return null;
  }

  const currentDPS = data.historicalDividends[0];
  const priorDPS = data.historicalDividends[1];

  // Skip calculation if either value is zero or negative
  if (currentDPS <= 0 || priorDPS <= 0) {
    return null;
  }

  return percentageChange(currentDPS, priorDPS);
}

/**
 * FCF Growth = (FCF₁ - FCF₀) / FCF₀
 *
 * Free cash flow growth rate.
 * Positive growth indicates improving cash generation.
 *
 * Source: Yahoo Finance Cash Flow Statement (current and prior year FCF)
 */
export function calculateFCFGrowth(data: YahooFinanceData): number | null {
  if (!data.historicalFCF || data.historicalFCF.length < 2) {
    return null;
  }

  const currentFCF = data.historicalFCF[0];
  const priorFCF = data.historicalFCF[1];

  // Skip if either FCF is zero or negative (can't calculate meaningful growth)
  if (currentFCF <= 0 || priorFCF <= 0) {
    return null;
  }

  return percentageChange(currentFCF, priorFCF);
}

/**
 * 3-Year Revenue CAGR = (Rev₃/Rev₀)^(1/3) - 1
 *
 * Compound annual growth rate of revenue over 3 years.
 * Smooths out year-to-year volatility to show sustainable growth trend.
 *
 * Source: Yahoo Finance Income Statement (3 years of revenue data)
 */
export function calculateRevenue3YearCAGR(data: YahooFinanceData): number | null {
  if (!data.historicalRevenue || data.historicalRevenue.length < 4) {
    return null;
  }

  // Most recent year is at index 0, 3 years ago at index 3
  const endValue = data.historicalRevenue[0];
  const startValue = data.historicalRevenue[3];

  return calculateCAGR(endValue, startValue, 3);
}

/**
 * 5-Year Revenue CAGR = (Rev₅/Rev₀)^(1/5) - 1
 *
 * Compound annual growth rate of revenue over 5 years.
 * Shows long-term sustainable growth trend.
 *
 * Source: Yahoo Finance Income Statement (5 years of revenue data)
 */
export function calculateRevenue5YearCAGR(data: YahooFinanceData): number | null {
  if (!data.historicalRevenue || data.historicalRevenue.length < 6) {
    return null;
  }

  // Most recent year is at index 0, 5 years ago at index 5
  const endValue = data.historicalRevenue[0];
  const startValue = data.historicalRevenue[5];

  return calculateCAGR(endValue, startValue, 5);
}

/**
 * Sustainable Growth Rate = ROE × Retention Ratio
 *
 * Maximum growth rate a company can sustain without external financing.
 * Higher ROE and higher retention (lower payout) = higher sustainable growth.
 *
 * Formula: SGR = ROE × (1 - Payout Ratio)
 *
 * Source: Calculated from Yahoo Finance data
 */
export function calculateSustainableGrowthRate(data: YahooFinanceData): number | null {
  // Calculate ROE = Net Income / Total Equity
  const roe = safeDivide(data.netIncome, data.totalEquity);
  if (roe === null) return null;

  // Calculate Retention Ratio = 1 - Payout Ratio
  const retentionRatio = calculateRetentionRatio(data);
  if (retentionRatio === null) return null;

  // SGR = ROE × Retention Ratio
  return safeMultiply(roe, retentionRatio);
}

/**
 * Retention Ratio = 1 - Payout Ratio
 *
 * Percentage of earnings retained in the business (not paid as dividends).
 * Higher retention = more capital for growth investments.
 *
 * Source: Calculated from Yahoo Finance data
 */
export function calculateRetentionRatio(data: YahooFinanceData): number | null {
  const payoutRatio = calculatePayoutRatio(data);
  if (payoutRatio === null) return null;

  // Retention Ratio = 1 - Payout Ratio
  const retention = 1 - payoutRatio;

  // Ensure ratio is between 0 and 1
  if (retention < 0 || retention > 1) return null;

  return retention;
}

/**
 * Payout Ratio = Dividends / Net Income
 *
 * Percentage of earnings paid out as dividends.
 * Lower payout = more earnings retained for growth.
 * Higher payout = more income returned to shareholders.
 *
 * Source: Yahoo Finance Income Statement and Cash Flow Statement
 */
export function calculatePayoutRatio(data: YahooFinanceData): number | null {
  // If no dividends paid, payout ratio is 0
  if (!data.dividendsPaid || data.dividendsPaid === 0) {
    return 0;
  }

  // If net income is zero or negative, ratio is undefined
  if (!data.netIncome || data.netIncome <= 0) {
    return null;
  }

  // Dividends are typically negative in cash flow statement, so use absolute value
  const dividends = Math.abs(data.dividendsPaid);
  const payoutRatio = safeDivide(dividends, data.netIncome);

  // Validate that payout ratio is reasonable (0-150%)
  // (can exceed 100% if company pays more in dividends than it earns)
  if (payoutRatio === null || payoutRatio < 0 || payoutRatio > 1.5) {
    return null;
  }

  return payoutRatio;
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
 * Interpret Revenue Growth YoY
 *
 * Thresholds:
 * - Good: >= 0.15 (15%+ growth)
 * - Neutral: 0.05 - 0.15 (5-15% growth)
 * - Bad: < 0.05 (< 5% growth or declining)
 */
export function interpretRevenueGrowthYoY(growth: number | null): MetricInterpretation {
  if (growth == null) {
    return {
      level: 'neutral',
      message: 'Insufficient historical data to calculate revenue growth',
      threshold: 'N/A',
    };
  }

  if (growth >= 0.15) {
    return {
      level: 'good',
      message: 'Strong revenue growth - company is expanding rapidly',
      threshold: '>= 15%',
    };
  }

  if (growth >= 0.05) {
    return {
      level: 'neutral',
      message: 'Moderate revenue growth - steady expansion',
      threshold: '5% - 15%',
    };
  }

  if (growth >= 0) {
    return {
      level: 'bad',
      message: 'Low revenue growth - minimal expansion',
      threshold: '< 5%',
    };
  }

  return {
    level: 'bad',
    message: 'Negative revenue growth - declining sales',
    threshold: '< 0%',
  };
}

/**
 * Interpret EPS Growth YoY
 *
 * Thresholds:
 * - Good: >= 0.15 (15%+ growth)
 * - Neutral: 0.05 - 0.15 (5-15% growth)
 * - Bad: < 0.05 (< 5% growth or declining)
 */
export function interpretEPSGrowthYoY(growth: number | null): MetricInterpretation {
  if (growth == null) {
    return {
      level: 'neutral',
      message: 'Insufficient historical data to calculate EPS growth',
      threshold: 'N/A',
    };
  }

  if (growth >= 0.15) {
    return {
      level: 'good',
      message: 'Strong EPS growth - increasing profitability per share',
      threshold: '>= 15%',
    };
  }

  if (growth >= 0.05) {
    return {
      level: 'neutral',
      message: 'Moderate EPS growth - steady profit improvement',
      threshold: '5% - 15%',
    };
  }

  if (growth >= 0) {
    return {
      level: 'bad',
      message: 'Low EPS growth - minimal profit expansion',
      threshold: '< 5%',
    };
  }

  return {
    level: 'bad',
    message: 'Negative EPS growth - declining profitability',
    threshold: '< 0%',
  };
}

/**
 * Interpret Sustainable Growth Rate
 *
 * Thresholds:
 * - Good: >= 0.12 (12%+ sustainable growth)
 * - Neutral: 0.05 - 0.12 (5-12% sustainable growth)
 * - Bad: < 0.05 (< 5% sustainable growth)
 */
export function interpretSustainableGrowthRate(sgr: number | null): MetricInterpretation {
  if (sgr == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate sustainable growth rate',
      threshold: 'N/A',
    };
  }

  if (sgr >= 0.12) {
    return {
      level: 'good',
      message: 'High sustainable growth rate - strong internal growth potential',
      threshold: '>= 12%',
    };
  }

  if (sgr >= 0.05) {
    return {
      level: 'neutral',
      message: 'Moderate sustainable growth rate - steady organic growth capacity',
      threshold: '5% - 12%',
    };
  }

  if (sgr >= 0) {
    return {
      level: 'bad',
      message: 'Low sustainable growth rate - limited internal growth capacity',
      threshold: '< 5%',
    };
  }

  return {
    level: 'bad',
    message: 'Negative sustainable growth rate - not generating sufficient returns',
    threshold: '< 0%',
  };
}

/**
 * Interpret Payout Ratio
 *
 * Thresholds:
 * - Good: 0.30 - 0.60 (30-60% - balanced)
 * - Neutral: 0.20 - 0.30 or 0.60 - 0.80 (growth vs income focused)
 * - Bad: > 0.80 (unsustainable) or < 0.20 (too low for income investors)
 */
export function interpretPayoutRatio(ratio: number | null): MetricInterpretation {
  if (ratio == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate payout ratio',
      threshold: 'N/A',
    };
  }

  // Zero payout (growth company)
  if (ratio === 0) {
    return {
      level: 'neutral',
      message: 'No dividends paid - growth company retaining all earnings',
      threshold: '0%',
    };
  }

  // Balanced payout
  if (ratio >= 0.30 && ratio <= 0.60) {
    return {
      level: 'good',
      message: 'Balanced payout ratio - good mix of dividends and retention for growth',
      threshold: '30% - 60%',
    };
  }

  // Lower payout (growth focused) or higher payout (income focused)
  if ((ratio >= 0.20 && ratio < 0.30) || (ratio > 0.60 && ratio <= 0.80)) {
    return {
      level: 'neutral',
      message:
        ratio < 0.30
          ? 'Low payout - growth-focused, retaining most earnings'
          : 'High payout - income-focused, generous dividends',
      threshold: ratio < 0.30 ? '20% - 30%' : '60% - 80%',
    };
  }

  // Very high payout (potentially unsustainable)
  if (ratio > 0.80) {
    return {
      level: 'bad',
      message: 'Very high payout ratio - may not be sustainable long-term',
      threshold: '> 80%',
    };
  }

  // Very low payout
  return {
    level: 'bad',
    message: 'Very low payout - minimal income for shareholders',
    threshold: '< 20%',
  };
}

/**
 * Interpret Revenue CAGR (3-year or 5-year)
 *
 * Thresholds:
 * - Good: >= 0.12 (12%+ CAGR)
 * - Neutral: 0.05 - 0.12 (5-12% CAGR)
 * - Bad: < 0.05 (< 5% CAGR)
 */
export function interpretRevenueCAGR(cagr: number | null): MetricInterpretation {
  if (cagr == null) {
    return {
      level: 'neutral',
      message: 'Insufficient historical data to calculate CAGR',
      threshold: 'N/A',
    };
  }

  if (cagr >= 0.12) {
    return {
      level: 'good',
      message: 'Strong revenue CAGR - consistent long-term growth',
      threshold: '>= 12%',
    };
  }

  if (cagr >= 0.05) {
    return {
      level: 'neutral',
      message: 'Moderate revenue CAGR - steady long-term expansion',
      threshold: '5% - 12%',
    };
  }

  if (cagr >= 0) {
    return {
      level: 'bad',
      message: 'Low revenue CAGR - minimal long-term growth',
      threshold: '< 5%',
    };
  }

  return {
    level: 'bad',
    message: 'Negative revenue CAGR - declining sales trend',
    threshold: '< 0%',
  };
}

/**
 * Get comprehensive interpretation of all growth metrics
 */
export function interpretAllGrowthMetrics(
  metrics: GrowthMetrics
): Record<string, MetricInterpretation> {
  return {
    revenueGrowthYoY: interpretRevenueGrowthYoY(metrics.revenueGrowthYoY),
    epsGrowthYoY: interpretEPSGrowthYoY(metrics.epsGrowthYoY),
    dpsGrowth: interpretRevenueGrowthYoY(metrics.dpsGrowth), // Same thresholds as revenue
    fcfGrowth: interpretRevenueGrowthYoY(metrics.fcfGrowth), // Same thresholds as revenue
    revenue3YearCAGR: interpretRevenueCAGR(metrics.revenue3YearCAGR),
    revenue5YearCAGR: interpretRevenueCAGR(metrics.revenue5YearCAGR),
    sustainableGrowthRate: interpretSustainableGrowthRate(metrics.sustainableGrowthRate),
    payoutRatio: interpretPayoutRatio(metrics.payoutRatio),
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get growth summary score (0-100)
 * Combines all growth metrics into a single score
 */
export function getGrowthScore(metrics: GrowthMetrics): number | null {
  const interpretations = interpretAllGrowthMetrics(metrics);

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
 * Check if company is in growth mode
 * True if revenue and EPS are both growing
 */
export function isGrowing(metrics: GrowthMetrics): boolean {
  return (
    (metrics.revenueGrowthYoY ?? 0) > 0 &&
    (metrics.epsGrowthYoY ?? 0) > 0
  );
}

/**
 * Determine growth stage based on growth metrics
 */
export function getGrowthStage(metrics: GrowthMetrics): string {
  const revenueGrowth = metrics.revenueGrowthYoY ?? 0;
  const payoutRatio = metrics.payoutRatio ?? 0;

  if (revenueGrowth >= 0.25 && payoutRatio < 0.20) {
    return 'High Growth';
  }

  if (revenueGrowth >= 0.10 && payoutRatio < 0.40) {
    return 'Growth';
  }

  if (revenueGrowth >= 0.05 && payoutRatio >= 0.40 && payoutRatio <= 0.70) {
    return 'Mature Growth';
  }

  if (revenueGrowth < 0.05 && payoutRatio > 0.60) {
    return 'Mature/Income';
  }

  if (revenueGrowth < 0) {
    return 'Declining';
  }

  return 'Transitional';
}
