/**
 * Deep Terminal - Other Key Metrics
 *
 * 10 additional financial metrics:
 * 1. Effective Tax Rate
 * 2. Working Capital
 * 3. Book Value per Share
 * 4. Sales per Share
 * 5. Cash Flow per Share
 * 6. DOL (Operating Leverage)
 * 7. DFL (Financial Leverage)
 * 8. Altman Z-Score
 * 9. Piotroski F-Score
 * 10. Excess ROIC
 */

import { safeDivide, safeSubtract, safeAdd, percentageChange } from './helpers';
import type { YahooFinanceData, OtherMetrics } from './types';

// ============================================================================
// TYPES
// ============================================================================

export type ZScoreZone = 'safe' | 'grey' | 'distress';
export type FScoreStrength = 'strong' | 'moderate' | 'weak';

export interface InterpretationLevel {
  level: 'good' | 'fair' | 'poor' | 'critical';
  description: string;
}

export interface MetricInterpretation {
  value: number | null;
  level: InterpretationLevel;
  benchmark?: string;
}

export interface ZScoreInterpretation extends MetricInterpretation {
  zone: ZScoreZone;
  components: {
    workingCapitalToAssets: number | null;
    retainedEarningsToAssets: number | null;
    ebitToAssets: number | null;
    marketValueToLiabilities: number | null;
    salesToAssets: number | null;
  };
}

export interface FScoreInterpretation extends MetricInterpretation {
  strength: FScoreStrength;
  tests: {
    positiveNetIncome: boolean;
    positiveOperatingCashFlow: boolean;
    roaIncreasing: boolean;
    cashFlowGreaterThanNetIncome: boolean;
    debtToAssetsDecreasing: boolean;
    currentRatioIncreasing: boolean;
    noNewSharesIssued: boolean;
    grossMarginIncreasing: boolean;
    assetTurnoverIncreasing: boolean;
  };
}

// ============================================================================
// CALCULATION FUNCTIONS
// ============================================================================

/**
 * Calculate all Other Key Metrics
 */
export function calculateOther(
  data: YahooFinanceData,
  industryROIC: number | null = null,
  previousYearData?: Partial<YahooFinanceData>
): OtherMetrics {
  return {
    effectiveTaxRate: calculateEffectiveTaxRate(data.incomeTax, data.pretaxIncome),
    workingCapital: calculateWorkingCapital(data.currentAssets, data.currentLiabilities),
    bookValuePerShare: calculateBookValuePerShare(data.totalEquity, data.sharesOutstanding),
    salesPerShare: calculateSalesPerShare(data.revenue, data.sharesOutstanding),
    cashFlowPerShare: calculateCashFlowPerShare(data.operatingCashFlow, data.sharesOutstanding),
    operatingLeverage: calculateOperatingLeverage(data, previousYearData),
    financialLeverage: calculateFinancialLeverage(data, previousYearData),
    altmanZScore: calculateAltmanZScore(data),
    piotroskiFScore: calculatePiotroskiFScore(data, previousYearData),
    excessROIC: calculateExcessROIC(data, industryROIC),
  };
}

/**
 * 1. Effective Tax Rate = Tax / EBT (Earnings Before Tax)
 *
 * Measures the actual tax rate paid by the company
 * - Higher values indicate higher tax burden
 * - Can vary due to tax planning, credits, and deferrals
 */
export function calculateEffectiveTaxRate(
  incomeTax: number | null | undefined,
  pretaxIncome: number | null | undefined
): number | null {
  // Only calculate if pretax income is positive (tax rate is meaningless otherwise)
  if (pretaxIncome == null || pretaxIncome <= 0) return null;
  if (incomeTax == null) return null;
  
  const rate = safeDivide(incomeTax, pretaxIncome);
  // Tax rate should be between 0 and 100%
  if (rate != null && (rate < 0 || rate > 1)) return null;
  return rate;
}

/**
 * 2. Working Capital = Current Assets - Current Liabilities
 *
 * Measures short-term liquidity and operational efficiency
 * - Positive: Company can meet short-term obligations
 * - Negative: Potential liquidity issues
 */
export function calculateWorkingCapital(
  currentAssets: number | null | undefined,
  currentLiabilities: number | null | undefined
): number | null {
  return safeSubtract(currentAssets, currentLiabilities);
}

/**
 * 3. Book Value per Share = Total Equity / Shares Outstanding
 *
 * Theoretical value if company were liquidated
 * - Used in P/B ratio calculations
 * - Higher values indicate more assets per share
 */
export function calculateBookValuePerShare(
  totalEquity: number | null | undefined,
  sharesOutstanding: number | null | undefined
): number | null {
  return safeDivide(totalEquity, sharesOutstanding);
}

/**
 * 4. Sales per Share = Revenue / Shares Outstanding
 *
 * Revenue generated per share
 * - Used in P/S ratio calculations
 * - Useful for comparing companies regardless of profitability
 */
export function calculateSalesPerShare(
  revenue: number | null | undefined,
  sharesOutstanding: number | null | undefined
): number | null {
  return safeDivide(revenue, sharesOutstanding);
}

/**
 * 5. Cash Flow per Share = Operating Cash Flow / Shares Outstanding
 *
 * Operating cash generated per share
 * - More reliable than EPS as it's harder to manipulate
 * - Used in P/CF ratio calculations
 */
export function calculateCashFlowPerShare(
  operatingCashFlow: number | null | undefined,
  sharesOutstanding: number | null | undefined
): number | null {
  return safeDivide(operatingCashFlow, sharesOutstanding);
}

/**
 * 6. Degree of Operating Leverage (DOL) = % Change in EBIT / % Change in Sales
 *
 * Measures sensitivity of operating income to sales changes
 * - Higher DOL: More fixed costs, higher risk but higher potential returns
 * - Lower DOL: More variable costs, lower risk
 */
export function calculateOperatingLeverage(
  currentData: YahooFinanceData,
  previousYearData?: Partial<YahooFinanceData>
): number | null {
  if (!previousYearData) return null;

  const currentEBIT = currentData.ebit;
  const previousEBIT = previousYearData.ebit;
  const currentRevenue = currentData.revenue;
  const previousRevenue = previousYearData.revenue;

  const ebitChange = percentageChange(currentEBIT, previousEBIT);
  const revenueChange = percentageChange(currentRevenue, previousRevenue);

  return safeDivide(ebitChange, revenueChange);
}

/**
 * 7. Degree of Financial Leverage (DFL) = % Change in EPS / % Change in EBIT
 *
 * Measures sensitivity of EPS to operating income changes
 * - Higher DFL: More debt financing, higher financial risk
 * - Lower DFL: Less debt, more stable earnings
 */
export function calculateFinancialLeverage(
  currentData: YahooFinanceData,
  previousYearData?: Partial<YahooFinanceData>
): number | null {
  if (!previousYearData) return null;

  const currentEPS = currentData.eps;
  const previousEPS = previousYearData.eps;
  const currentEBIT = currentData.ebit;
  const previousEBIT = previousYearData.ebit;

  const epsChange = percentageChange(currentEPS, previousEPS);
  const ebitChange = percentageChange(currentEBIT, previousEBIT);

  return safeDivide(epsChange, ebitChange);
}

/**
 * 8. Altman Z-Score
 *
 * Bankruptcy predictor formula:
 * Z = 1.2(WC/TA) + 1.4(RE/TA) + 3.3(EBIT/TA) + 0.6(MVE/TL) + 1.0(Sales/TA)
 *
 * Interpretation:
 * - Z > 2.99: Safe zone (low bankruptcy risk)
 * - 1.81 < Z < 2.99: Grey zone (moderate risk)
 * - Z < 1.81: Distress zone (high bankruptcy risk)
 */
export function calculateAltmanZScore(data: YahooFinanceData): number | null {
  const {
    currentAssets,
    currentLiabilities,
    totalAssets,
    retainedEarnings,
    ebit,
    marketCap,
    totalLiabilities,
    revenue,
  } = data;

  // All components must be available
  if (
    totalAssets == null ||
    totalAssets <= 0 ||
    totalLiabilities == null ||
    totalLiabilities <= 0
  ) {
    return null;
  }

  // Calculate working capital
  const workingCapital = safeSubtract(currentAssets, currentLiabilities);

  // Calculate each component
  const wcToTA = safeDivide(workingCapital, totalAssets);
  const reToTA = safeDivide(retainedEarnings, totalAssets);
  const ebitToTA = safeDivide(ebit, totalAssets);
  const mveToTL = safeDivide(marketCap, totalLiabilities);
  const salesToTA = safeDivide(revenue, totalAssets);

  // If any component is null, we can't calculate Z-Score
  if (wcToTA == null || reToTA == null || ebitToTA == null || mveToTL == null || salesToTA == null) {
    return null;
  }

  // Z = 1.2(WC/TA) + 1.4(RE/TA) + 3.3(EBIT/TA) + 0.6(MVE/TL) + 1.0(Sales/TA)
  const zScore =
    1.2 * wcToTA +
    1.4 * reToTA +
    3.3 * ebitToTA +
    0.6 * mveToTL +
    1.0 * salesToTA;

  return isFinite(zScore) ? zScore : null;
}

/**
 * Get Altman Z-Score zone classification
 */
export function getZScoreZone(zScore: number | null): ZScoreZone | null {
  if (zScore == null) return null;
  if (zScore > 2.99) return 'safe';
  if (zScore >= 1.81) return 'grey';
  return 'distress';
}

/**
 * 9. Piotroski F-Score (0-9)
 *
 * Binary tests measuring financial strength:
 * 1. Positive Net Income (1 point)
 * 2. Positive Operating Cash Flow (1 point)
 * 3. ROA increasing YoY (1 point)
 * 4. OCF > Net Income (quality of earnings) (1 point)
 * 5. Debt/Assets decreasing (1 point)
 * 6. Current Ratio increasing (1 point)
 * 7. No new shares issued (1 point)
 * 8. Gross Margin increasing (1 point)
 * 9. Asset Turnover increasing (1 point)
 *
 * Score 8-9: Strong
 * Score 3-7: Moderate
 * Score 0-2: Weak
 */
export function calculatePiotroskiFScore(
  currentData: YahooFinanceData,
  previousYearData?: Partial<YahooFinanceData>
): number | null {
  let score = 0;

  // Tests that don't require previous year data
  // 1. Positive Net Income
  if (currentData.netIncome != null && currentData.netIncome > 0) {
    score += 1;
  }

  // 2. Positive Operating Cash Flow
  if (currentData.operatingCashFlow != null && currentData.operatingCashFlow > 0) {
    score += 1;
  }

  // 4. OCF > Net Income (quality of earnings)
  if (
    currentData.operatingCashFlow != null &&
    currentData.netIncome != null &&
    currentData.operatingCashFlow > currentData.netIncome
  ) {
    score += 1;
  }

  // If we don't have previous year data, return partial score
  if (!previousYearData) {
    // Can only calculate 3 out of 9 tests
    return score;
  }

  // Tests requiring previous year data
  // 3. ROA increasing YoY
  const currentROA = safeDivide(currentData.netIncome, currentData.totalAssets);
  const previousROA = safeDivide(previousYearData.netIncome, previousYearData.totalAssets);
  if (currentROA != null && previousROA != null && currentROA > previousROA) {
    score += 1;
  }

  // 5. Debt/Assets decreasing
  const currentDebtToAssets = safeDivide(currentData.totalDebt, currentData.totalAssets);
  const previousDebtToAssets = safeDivide(previousYearData.totalDebt, previousYearData.totalAssets);
  if (
    currentDebtToAssets != null &&
    previousDebtToAssets != null &&
    currentDebtToAssets < previousDebtToAssets
  ) {
    score += 1;
  }

  // 6. Current Ratio increasing
  const currentRatio = safeDivide(currentData.currentAssets, currentData.currentLiabilities);
  const previousCurrentRatio = safeDivide(
    previousYearData.currentAssets,
    previousYearData.currentLiabilities
  );
  if (currentRatio != null && previousCurrentRatio != null && currentRatio > previousCurrentRatio) {
    score += 1;
  }

  // 7. No new shares issued
  const currentShares = currentData.sharesOutstanding;
  const previousShares = previousYearData.sharesOutstanding;
  if (currentShares != null && previousShares != null && currentShares <= previousShares) {
    score += 1;
  }

  // 8. Gross Margin increasing
  const currentGrossMargin = safeDivide(currentData.grossProfit, currentData.revenue);
  const previousGrossMargin = safeDivide(previousYearData.grossProfit, previousYearData.revenue);
  if (
    currentGrossMargin != null &&
    previousGrossMargin != null &&
    currentGrossMargin > previousGrossMargin
  ) {
    score += 1;
  }

  // 9. Asset Turnover increasing
  const currentAssetTurnover = safeDivide(currentData.revenue, currentData.totalAssets);
  const previousAssetTurnover = safeDivide(previousYearData.revenue, previousYearData.totalAssets);
  if (
    currentAssetTurnover != null &&
    previousAssetTurnover != null &&
    currentAssetTurnover > previousAssetTurnover
  ) {
    score += 1;
  }

  return score;
}

/**
 * Get Piotroski F-Score strength classification
 */
export function getFScoreStrength(fScore: number | null): FScoreStrength | null {
  if (fScore == null) return null;
  if (fScore >= 8) return 'strong';
  if (fScore >= 3) return 'moderate';
  return 'weak';
}

/**
 * 10. Excess ROIC = ROIC - Industry ROIC
 *
 * Measures how much better (or worse) a company's return on invested
 * capital is compared to its industry average.
 * - Positive: Company creating more value than industry average
 * - Negative: Company underperforming industry
 */
export function calculateExcessROIC(
  data: YahooFinanceData,
  industryROIC: number | null
): number | null {
  if (industryROIC == null) return null;

  // Calculate company's ROIC
  // ROIC = NOPAT / Invested Capital
  // NOPAT = EBIT * (1 - Tax Rate)
  // Invested Capital = Total Debt + Total Equity
  const effectiveTaxRate = safeDivide(data.incomeTax, data.pretaxIncome);
  if (effectiveTaxRate == null || effectiveTaxRate < 0) return null;

  const nopat = data.ebit != null ? data.ebit * (1 - effectiveTaxRate) : null;
  const investedCapital = safeAdd(data.totalDebt, data.totalEquity);

  const companyROIC = safeDivide(nopat, investedCapital);
  if (companyROIC == null) return null;

  return companyROIC - industryROIC;
}

// ============================================================================
// INTERPRETATION FUNCTIONS
// ============================================================================

/**
 * Interpret Effective Tax Rate
 */
export function interpretEffectiveTaxRate(rate: number | null): MetricInterpretation {
  if (rate == null) {
    return {
      value: null,
      level: { level: 'fair', description: 'Unable to calculate effective tax rate' },
    };
  }

  const ratePercent = rate * 100;
  
  if (ratePercent < 15) {
    return {
      value: rate,
      level: { level: 'good', description: 'Low effective tax rate (< 15%)' },
      benchmark: 'Below average, may benefit from tax planning strategies',
    };
  } else if (ratePercent <= 25) {
    return {
      value: rate,
      level: { level: 'good', description: 'Moderate effective tax rate (15-25%)' },
      benchmark: 'Near corporate average',
    };
  } else if (ratePercent <= 35) {
    return {
      value: rate,
      level: { level: 'fair', description: 'Higher effective tax rate (25-35%)' },
      benchmark: 'Above average tax burden',
    };
  } else {
    return {
      value: rate,
      level: { level: 'poor', description: 'Very high effective tax rate (> 35%)' },
      benchmark: 'May indicate limited tax optimization',
    };
  }
}

/**
 * Interpret Working Capital
 */
export function interpretWorkingCapital(
  workingCapital: number | null,
  currentLiabilities: number | null
): MetricInterpretation {
  if (workingCapital == null || currentLiabilities == null) {
    return {
      value: null,
      level: { level: 'fair', description: 'Unable to calculate working capital' },
    };
  }

  // Calculate working capital ratio (WC / Current Liabilities)
  const wcRatio = currentLiabilities > 0 ? workingCapital / currentLiabilities : null;

  if (workingCapital < 0) {
    return {
      value: workingCapital,
      level: {
        level: 'critical',
        description: 'Negative working capital - potential liquidity issues',
      },
    };
  } else if (wcRatio != null && wcRatio < 0.2) {
    return {
      value: workingCapital,
      level: { level: 'poor', description: 'Low working capital relative to obligations' },
    };
  } else if (wcRatio != null && wcRatio <= 0.5) {
    return {
      value: workingCapital,
      level: { level: 'fair', description: 'Adequate working capital' },
    };
  } else {
    return {
      value: workingCapital,
      level: { level: 'good', description: 'Strong working capital position' },
    };
  }
}

/**
 * Interpret Altman Z-Score with detailed breakdown
 */
export function interpretAltmanZScore(
  data: YahooFinanceData
): ZScoreInterpretation {
  const zScore = calculateAltmanZScore(data);
  const zone = getZScoreZone(zScore);

  // Calculate individual components for transparency
  const workingCapital = safeSubtract(data.currentAssets, data.currentLiabilities);
  const components = {
    workingCapitalToAssets: safeDivide(workingCapital, data.totalAssets),
    retainedEarningsToAssets: safeDivide(data.retainedEarnings, data.totalAssets),
    ebitToAssets: safeDivide(data.ebit, data.totalAssets),
    marketValueToLiabilities: safeDivide(data.marketCap, data.totalLiabilities),
    salesToAssets: safeDivide(data.revenue, data.totalAssets),
  };

  let level: InterpretationLevel;
  if (zone === 'safe') {
    level = {
      level: 'good',
      description: `Z-Score ${zScore?.toFixed(2)}: Safe zone - Low bankruptcy risk`,
    };
  } else if (zone === 'grey') {
    level = {
      level: 'fair',
      description: `Z-Score ${zScore?.toFixed(2)}: Grey zone - Moderate bankruptcy risk`,
    };
  } else if (zone === 'distress') {
    level = {
      level: 'critical',
      description: `Z-Score ${zScore?.toFixed(2)}: Distress zone - High bankruptcy risk`,
    };
  } else {
    level = {
      level: 'fair',
      description: 'Unable to calculate Z-Score',
    };
  }

  return {
    value: zScore,
    level,
    zone: zone || 'grey',
    components,
    benchmark: 'Z > 2.99 Safe | 1.81-2.99 Grey | < 1.81 Distress',
  };
}

/**
 * Interpret Piotroski F-Score with detailed breakdown
 */
export function interpretPiotroskiFScore(
  currentData: YahooFinanceData,
  previousYearData?: Partial<YahooFinanceData>
): FScoreInterpretation {
  const fScore = calculatePiotroskiFScore(currentData, previousYearData);
  const strength = getFScoreStrength(fScore);

  // Calculate individual tests for transparency
  const currentROA = safeDivide(currentData.netIncome, currentData.totalAssets);
  const previousROA = previousYearData
    ? safeDivide(previousYearData.netIncome, previousYearData.totalAssets)
    : null;

  const currentDebtToAssets = safeDivide(currentData.totalDebt, currentData.totalAssets);
  const previousDebtToAssets = previousYearData
    ? safeDivide(previousYearData.totalDebt, previousYearData.totalAssets)
    : null;

  const currentRatio = safeDivide(currentData.currentAssets, currentData.currentLiabilities);
  const previousCurrentRatio = previousYearData
    ? safeDivide(previousYearData.currentAssets, previousYearData.currentLiabilities)
    : null;

  const currentGrossMargin = safeDivide(currentData.grossProfit, currentData.revenue);
  const previousGrossMargin = previousYearData
    ? safeDivide(previousYearData.grossProfit, previousYearData.revenue)
    : null;

  const currentAssetTurnover = safeDivide(currentData.revenue, currentData.totalAssets);
  const previousAssetTurnover = previousYearData
    ? safeDivide(previousYearData.revenue, previousYearData.totalAssets)
    : null;

  const tests = {
    positiveNetIncome: currentData.netIncome != null && currentData.netIncome > 0,
    positiveOperatingCashFlow:
      currentData.operatingCashFlow != null && currentData.operatingCashFlow > 0,
    roaIncreasing: currentROA != null && previousROA != null && currentROA > previousROA,
    cashFlowGreaterThanNetIncome:
      currentData.operatingCashFlow != null &&
      currentData.netIncome != null &&
      currentData.operatingCashFlow > currentData.netIncome,
    debtToAssetsDecreasing:
      currentDebtToAssets != null &&
      previousDebtToAssets != null &&
      currentDebtToAssets < previousDebtToAssets,
    currentRatioIncreasing:
      currentRatio != null && previousCurrentRatio != null && currentRatio > previousCurrentRatio,
    noNewSharesIssued:
      currentData.sharesOutstanding != null &&
      previousYearData?.sharesOutstanding != null &&
      currentData.sharesOutstanding <= previousYearData.sharesOutstanding,
    grossMarginIncreasing:
      currentGrossMargin != null &&
      previousGrossMargin != null &&
      currentGrossMargin > previousGrossMargin,
    assetTurnoverIncreasing:
      currentAssetTurnover != null &&
      previousAssetTurnover != null &&
      currentAssetTurnover > previousAssetTurnover,
  };

  let level: InterpretationLevel;
  if (strength === 'strong') {
    level = {
      level: 'good',
      description: `F-Score ${fScore}/9: Strong financial health`,
    };
  } else if (strength === 'moderate') {
    level = {
      level: 'fair',
      description: `F-Score ${fScore}/9: Moderate financial health`,
    };
  } else if (strength === 'weak') {
    level = {
      level: 'poor',
      description: `F-Score ${fScore}/9: Weak financial health`,
    };
  } else {
    level = {
      level: 'fair',
      description: 'Unable to calculate F-Score',
    };
  }

  return {
    value: fScore,
    level,
    strength: strength || 'moderate',
    tests,
    benchmark: '8-9 Strong | 3-7 Moderate | 0-2 Weak',
  };
}

/**
 * Interpret Operating Leverage (DOL)
 */
export function interpretOperatingLeverage(dol: number | null): MetricInterpretation {
  if (dol == null) {
    return {
      value: null,
      level: { level: 'fair', description: 'Unable to calculate operating leverage' },
    };
  }

  if (dol > 3) {
    return {
      value: dol,
      level: {
        level: 'poor',
        description: 'Very high operating leverage - sensitive to sales changes',
      },
      benchmark: 'High fixed costs increase business risk',
    };
  } else if (dol > 2) {
    return {
      value: dol,
      level: { level: 'fair', description: 'High operating leverage' },
      benchmark: 'Moderate fixed cost structure',
    };
  } else if (dol > 1) {
    return {
      value: dol,
      level: { level: 'good', description: 'Moderate operating leverage' },
      benchmark: 'Balanced cost structure',
    };
  } else {
    return {
      value: dol,
      level: { level: 'good', description: 'Low operating leverage' },
      benchmark: 'Variable cost structure, lower risk',
    };
  }
}

/**
 * Interpret Financial Leverage (DFL)
 */
export function interpretFinancialLeverage(dfl: number | null): MetricInterpretation {
  if (dfl == null) {
    return {
      value: null,
      level: { level: 'fair', description: 'Unable to calculate financial leverage' },
    };
  }

  if (dfl > 2) {
    return {
      value: dfl,
      level: {
        level: 'critical',
        description: 'Very high financial leverage - high financial risk',
      },
      benchmark: 'High interest burden amplifies earnings volatility',
    };
  } else if (dfl > 1.5) {
    return {
      value: dfl,
      level: { level: 'poor', description: 'High financial leverage' },
      benchmark: 'Significant debt financing',
    };
  } else if (dfl > 1) {
    return {
      value: dfl,
      level: { level: 'fair', description: 'Moderate financial leverage' },
      benchmark: 'Reasonable debt levels',
    };
  } else {
    return {
      value: dfl,
      level: { level: 'good', description: 'Low financial leverage' },
      benchmark: 'Conservative capital structure',
    };
  }
}

/**
 * Interpret Excess ROIC
 */
export function interpretExcessROIC(excessROIC: number | null): MetricInterpretation {
  if (excessROIC == null) {
    return {
      value: null,
      level: { level: 'fair', description: 'Unable to calculate excess ROIC' },
    };
  }

  const excessPercent = excessROIC * 100;

  if (excessPercent > 10) {
    return {
      value: excessROIC,
      level: { level: 'good', description: 'Significantly outperforming industry' },
      benchmark: `Earning ${excessPercent.toFixed(1)}% more than industry average`,
    };
  } else if (excessPercent > 0) {
    return {
      value: excessROIC,
      level: { level: 'good', description: 'Outperforming industry' },
      benchmark: `Earning ${excessPercent.toFixed(1)}% more than industry average`,
    };
  } else if (excessPercent > -5) {
    return {
      value: excessROIC,
      level: { level: 'fair', description: 'Slightly underperforming industry' },
      benchmark: `Earning ${Math.abs(excessPercent).toFixed(1)}% less than industry average`,
    };
  } else {
    return {
      value: excessROIC,
      level: { level: 'poor', description: 'Significantly underperforming industry' },
      benchmark: `Earning ${Math.abs(excessPercent).toFixed(1)}% less than industry average`,
    };
  }
}

/**
 * Interpret all Other Key Metrics
 */
export function interpretAllOtherMetrics(
  currentData: YahooFinanceData,
  industryROIC: number | null = null,
  previousYearData?: Partial<YahooFinanceData>
): Record<string, MetricInterpretation | ZScoreInterpretation | FScoreInterpretation> {
  const metrics = calculateOther(currentData, industryROIC, previousYearData);

  return {
    effectiveTaxRate: interpretEffectiveTaxRate(metrics.effectiveTaxRate),
    workingCapital: interpretWorkingCapital(metrics.workingCapital, currentData.currentLiabilities),
    bookValuePerShare: {
      value: metrics.bookValuePerShare,
      level: {
        level: metrics.bookValuePerShare != null && metrics.bookValuePerShare > 0 ? 'good' : 'fair',
        description: metrics.bookValuePerShare != null
          ? `$${metrics.bookValuePerShare.toFixed(2)} book value per share`
          : 'Unable to calculate',
      },
    },
    salesPerShare: {
      value: metrics.salesPerShare,
      level: {
        level: metrics.salesPerShare != null && metrics.salesPerShare > 0 ? 'good' : 'fair',
        description: metrics.salesPerShare != null
          ? `$${metrics.salesPerShare.toFixed(2)} revenue per share`
          : 'Unable to calculate',
      },
    },
    cashFlowPerShare: {
      value: metrics.cashFlowPerShare,
      level: {
        level: metrics.cashFlowPerShare != null && metrics.cashFlowPerShare > 0 ? 'good' : 'fair',
        description: metrics.cashFlowPerShare != null
          ? `$${metrics.cashFlowPerShare.toFixed(2)} operating cash flow per share`
          : 'Unable to calculate',
      },
    },
    operatingLeverage: interpretOperatingLeverage(metrics.operatingLeverage),
    financialLeverage: interpretFinancialLeverage(metrics.financialLeverage),
    altmanZScore: interpretAltmanZScore(currentData),
    piotroskiFScore: interpretPiotroskiFScore(currentData, previousYearData),
    excessROIC: interpretExcessROIC(metrics.excessROIC),
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get a comprehensive financial health score based on other metrics
 */
export function getOtherMetricsScore(
  currentData: YahooFinanceData,
  industryROIC: number | null = null,
  previousYearData?: Partial<YahooFinanceData>
): number | null {
  const metrics = calculateOther(currentData, industryROIC, previousYearData);
  let score = 0;
  let factors = 0;

  // Altman Z-Score (0-30 points)
  const zZone = getZScoreZone(metrics.altmanZScore);
  if (zZone === 'safe') {
    score += 30;
    factors++;
  } else if (zZone === 'grey') {
    score += 15;
    factors++;
  } else if (zZone === 'distress') {
    score += 0;
    factors++;
  }

  // Piotroski F-Score (0-30 points, scaled from 0-9)
  if (metrics.piotroskiFScore != null) {
    score += (metrics.piotroskiFScore / 9) * 30;
    factors++;
  }

  // Working Capital (0-20 points)
  if (metrics.workingCapital != null && currentData.currentLiabilities != null) {
    const wcRatio = metrics.workingCapital / currentData.currentLiabilities;
    if (wcRatio > 0.5) score += 20;
    else if (wcRatio > 0.2) score += 10;
    else if (wcRatio > 0) score += 5;
    factors++;
  }

  // Effective Tax Rate (0-10 points)
  if (metrics.effectiveTaxRate != null) {
    if (metrics.effectiveTaxRate <= 0.25) score += 10;
    else if (metrics.effectiveTaxRate <= 0.35) score += 5;
    factors++;
  }

  // Excess ROIC (0-10 points)
  if (metrics.excessROIC != null) {
    if (metrics.excessROIC > 0.1) score += 10;
    else if (metrics.excessROIC > 0) score += 7;
    else if (metrics.excessROIC > -0.05) score += 3;
    factors++;
  }

  if (factors === 0) return null;

  // Normalize to 0-100 scale
  const maxPossibleScore = factors * 20; // Average points per factor
  return Math.min(100, (score / maxPossibleScore) * 100);
}

/**
 * Check if company shows signs of financial distress
 */
export function isInFinancialDistress(
  currentData: YahooFinanceData,
  previousYearData?: Partial<YahooFinanceData>
): boolean {
  const zScore = calculateAltmanZScore(currentData);
  const fScore = calculatePiotroskiFScore(currentData, previousYearData);
  const workingCapital = calculateWorkingCapital(
    currentData.currentAssets,
    currentData.currentLiabilities
  );

  // Company is in distress if:
  // - Z-Score is in distress zone, OR
  // - F-Score is weak AND working capital is negative
  if (zScore != null && zScore < 1.81) return true;
  if (fScore != null && fScore <= 2 && workingCapital != null && workingCapital < 0) return true;

  return false;
}

/**
 * Get combined leverage score (Total Leverage = DOL × DFL)
 */
export function getTotalLeverage(
  currentData: YahooFinanceData,
  previousYearData?: Partial<YahooFinanceData>
): number | null {
  const dol = calculateOperatingLeverage(currentData, previousYearData);
  const dfl = calculateFinancialLeverage(currentData, previousYearData);

  if (dol == null || dfl == null) return null;
  return dol * dfl;
}
