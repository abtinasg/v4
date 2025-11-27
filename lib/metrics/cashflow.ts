/**
 * Deep Terminal - Cash Flow Metrics
 *
 * Calculate and interpret 8 cash flow metrics from Yahoo Finance data
 * All data sourced from Cash Flow Statement, Income Statement, and Balance Sheet
 */

import type { YahooFinanceData, CashFlowMetrics } from './types';
import { safeDivide, safeMultiply, safeAdd, safeSubtract } from './helpers';

// ============================================================================
// CASH FLOW METRICS CALCULATION
// ============================================================================

/**
 * Calculate all 8 cash flow metrics from Yahoo Finance data
 *
 * @param data - Raw financial data from Yahoo Finance
 * @returns CashFlowMetrics object with all 8 metrics
 */
export function calculateCashFlow(data: YahooFinanceData): CashFlowMetrics {
  return {
    operatingCashFlow: getOperatingCashFlow(data),
    investingCashFlow: getInvestingCashFlow(data),
    financingCashFlow: getFinancingCashFlow(data),
    freeCashFlow: calculateFreeCashFlow(data),
    fcff: calculateFCFF(data),
    fcfe: calculateFCFE(data),
    cashFlowAdequacy: calculateCashFlowAdequacy(data),
    cashReinvestmentRatio: calculateCashReinvestmentRatio(data),
  };
}

// ============================================================================
// INDIVIDUAL METRIC CALCULATIONS
// ============================================================================

/**
 * Operating Cash Flow (OCF)
 *
 * Cash generated from core business operations.
 * This is a direct value from the cash flow statement.
 * Positive OCF is essential for business sustainability.
 *
 * Source: Yahoo Finance Cash Flow Statement
 */
export function getOperatingCashFlow(data: YahooFinanceData): number | null {
  return data.operatingCashFlow ?? null;
}

/**
 * Investing Cash Flow
 *
 * Cash used for investments (CapEx, acquisitions, securities).
 * Typically negative as companies invest in growth.
 * This is a direct value from the cash flow statement.
 *
 * Source: Yahoo Finance Cash Flow Statement
 */
export function getInvestingCashFlow(data: YahooFinanceData): number | null {
  return data.investingCashFlow ?? null;
}

/**
 * Financing Cash Flow
 *
 * Cash from financing activities (debt, equity, dividends).
 * Can be positive (raising capital) or negative (paying dividends/debt).
 * This is a direct value from the cash flow statement.
 *
 * Source: Yahoo Finance Cash Flow Statement
 */
export function getFinancingCashFlow(data: YahooFinanceData): number | null {
  return data.financingCashFlow ?? null;
}

/**
 * Free Cash Flow (FCF) = Operating Cash Flow - Capital Expenditures
 *
 * Cash available to investors (debt and equity holders) after maintaining/expanding asset base.
 * This is the most important cash flow metric for valuation.
 * Positive FCF indicates the company generates more cash than needed for operations.
 *
 * Source: Yahoo Finance Cash Flow Statement (OCF - CapEx)
 */
export function calculateFreeCashFlow(data: YahooFinanceData): number | null {
  // Try to use pre-calculated FCF from Yahoo if available
  if (data.freeCashFlow != null) {
    return data.freeCashFlow;
  }

  // Otherwise calculate it: OCF - CapEx
  if (!data.operatingCashFlow || !data.capitalExpenditures) {
    return null;
  }

  // CapEx is typically negative in cash flow statement, so we subtract it
  // This makes FCF = OCF - |CapEx|
  return safeSubtract(data.operatingCashFlow, Math.abs(data.capitalExpenditures));
}

/**
 * FCFF (Free Cash Flow to Firm) = EBIT(1-t) + D&A - CapEx - ΔNWC
 *
 * Cash available to all investors (debt + equity) before financing activities.
 * Used in enterprise valuation (DCF) to calculate firm value.
 *
 * Formula breakdown:
 * - EBIT(1-t): After-tax operating profit (NOPLAT)
 * - + D&A: Add back non-cash charges (Depreciation & Amortization)
 * - - CapEx: Subtract capital expenditures
 * - - ΔNWC: Subtract change in net working capital
 *
 * Simplified calculation (when D&A and ΔNWC not available):
 * FCFF ≈ OCF - CapEx + Interest Expense(1-t)
 *
 * Source: Yahoo Finance Income Statement + Cash Flow Statement + Balance Sheet
 */
export function calculateFCFF(data: YahooFinanceData): number | null {
  // Calculate effective tax rate
  let taxRate = 0.21; // Default US corporate tax rate

  if (data.pretaxIncome && data.incomeTax && data.pretaxIncome > 0) {
    const calculatedTaxRate = safeDivide(data.incomeTax, data.pretaxIncome);
    if (calculatedTaxRate !== null && calculatedTaxRate >= 0 && calculatedTaxRate <= 1) {
      taxRate = calculatedTaxRate;
    }
  }

  // NOPLAT = EBIT × (1 - Tax Rate)
  const noplat = safeMultiply(data.ebit, 1 - taxRate);
  if (noplat === null) return null;

  // Get FCF (which is OCF - CapEx)
  const fcf = calculateFreeCashFlow(data);
  if (fcf === null) return null;

  // FCFF = FCF + Interest Expense(1-t)
  // This adds back the after-tax interest to get cash flow to ALL investors
  if (data.interestExpense && data.interestExpense > 0) {
    const afterTaxInterest = safeMultiply(data.interestExpense, 1 - taxRate);
    if (afterTaxInterest !== null) {
      return safeAdd(fcf, afterTaxInterest);
    }
  }

  // If no interest expense, FCFF ≈ FCF
  return fcf;
}

/**
 * FCFE (Free Cash Flow to Equity) = FCFF - Interest(1-t) + Net Borrowing
 *
 * Cash available to equity holders after all obligations.
 * Used in equity valuation to calculate intrinsic value per share.
 *
 * Formula:
 * FCFE = FCFF - Interest(1-t) + Net Borrowing
 *
 * Where Net Borrowing = New Debt Issued - Debt Repayments
 *
 * Simplified calculation:
 * FCFE = FCF (since FCF already accounts for all cash flows to equity)
 *
 * Source: Yahoo Finance Cash Flow Statement
 */
export function calculateFCFE(data: YahooFinanceData): number | null {
  // Start with FCFF
  const fcff = calculateFCFF(data);
  if (fcff === null) return null;

  // Calculate effective tax rate
  let taxRate = 0.21; // Default US corporate tax rate

  if (data.pretaxIncome && data.incomeTax && data.pretaxIncome > 0) {
    const calculatedTaxRate = safeDivide(data.incomeTax, data.pretaxIncome);
    if (calculatedTaxRate !== null && calculatedTaxRate >= 0 && calculatedTaxRate <= 1) {
      taxRate = calculatedTaxRate;
    }
  }

  // FCFE = FCFF - Interest(1-t) + Net Borrowing
  // Simplified: FCFE ≈ FCF (Free Cash Flow already represents equity cash flow)
  const fcf = calculateFreeCashFlow(data);

  return fcf;
}

/**
 * Cash Flow Adequacy = Operating Cash Flow / (CapEx + Debt Repayments + Dividends)
 *
 * Measures if company generates enough cash to cover capital expenditures,
 * debt obligations, and dividend payments.
 *
 * Ratio > 1.0: Company generates sufficient cash for all obligations
 * Ratio < 1.0: Company may need external financing
 *
 * Note: Debt repayments and dividends are typically part of financing cash flow
 * Simplified: Uses CapEx and Dividends (most critical obligations)
 *
 * Source: Yahoo Finance Cash Flow Statement
 */
export function calculateCashFlowAdequacy(data: YahooFinanceData): number | null {
  if (!data.operatingCashFlow) return null;

  // Calculate total cash obligations
  // CapEx is typically negative, dividends are typically negative
  const capEx = Math.abs(data.capitalExpenditures ?? 0);
  const dividends = Math.abs(data.dividendsPaid ?? 0);

  // For debt, we'll use a portion of current debt as proxy for annual payments
  // Typically debt service = interest + principal payments
  // Conservative estimate: use short-term debt as proxy for annual debt payments
  const debtPayments = Math.abs(data.shortTermDebt ?? 0);

  const totalObligations = safeAdd(capEx, debtPayments, dividends);

  if (totalObligations === null || totalObligations === 0) {
    // If no obligations, adequacy is infinite (very good)
    return null;
  }

  return safeDivide(data.operatingCashFlow, totalObligations);
}

/**
 * Cash Reinvestment Ratio = (CapEx - Depreciation) / Operating Cash Flow
 *
 * Measures the percentage of operating cash flow reinvested in the business.
 * Indicates capital intensity and growth investment strategy.
 *
 * High ratio (>50%): Capital-intensive business or high growth investment
 * Low ratio (<20%): Asset-light business or mature company
 * Negative ratio: Company is not replacing depreciating assets
 *
 * Note: Depreciation is part of EBITDA calculation
 * D&A = EBITDA - EBIT
 *
 * Source: Yahoo Finance Cash Flow Statement + Income Statement
 */
export function calculateCashReinvestmentRatio(data: YahooFinanceData): number | null {
  if (!data.operatingCashFlow || data.operatingCashFlow === 0) {
    return null;
  }

  const capEx = Math.abs(data.capitalExpenditures ?? 0);

  // Calculate D&A (Depreciation & Amortization) = EBITDA - EBIT
  let depreciation = 0;
  if (data.ebitda && data.ebit) {
    depreciation = safeSubtract(data.ebitda, data.ebit) ?? 0;
  }

  // Net Capital Investment = CapEx - D&A
  const netCapitalInvestment = safeSubtract(capEx, depreciation);
  if (netCapitalInvestment === null) return null;

  // Cash Reinvestment Ratio = Net Capital Investment / OCF
  return safeDivide(netCapitalInvestment, data.operatingCashFlow);
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
 * Interpret Operating Cash Flow
 *
 * Positive OCF is essential. Higher is better.
 */
export function interpretOperatingCashFlow(ocf: number | null): MetricInterpretation {
  if (ocf == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate operating cash flow',
      threshold: 'N/A',
    };
  }

  if (ocf > 0) {
    return {
      level: 'good',
      message: 'Positive operating cash flow - generating cash from operations',
      threshold: '> 0',
    };
  }

  return {
    level: 'bad',
    message: 'Negative operating cash flow - burning cash in operations',
    threshold: '<= 0',
  };
}

/**
 * Interpret Free Cash Flow
 *
 * Positive FCF is critical for sustainable business.
 */
export function interpretFreeCashFlow(fcf: number | null): MetricInterpretation {
  if (fcf == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate free cash flow',
      threshold: 'N/A',
    };
  }

  if (fcf > 0) {
    return {
      level: 'good',
      message: 'Positive free cash flow - generating cash after capital investments',
      threshold: '> 0',
    };
  }

  return {
    level: 'bad',
    message: 'Negative free cash flow - capital expenditures exceed operating cash',
    threshold: '<= 0',
  };
}

/**
 * Interpret Cash Flow Adequacy
 *
 * Thresholds:
 * - Good: >= 1.2 (120%+)
 * - Neutral: 0.8 - 1.2 (80-120%)
 * - Bad: < 0.8 (< 80%)
 */
export function interpretCashFlowAdequacy(ratio: number | null): MetricInterpretation {
  if (ratio == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate cash flow adequacy',
      threshold: 'N/A',
    };
  }

  if (ratio >= 1.2) {
    return {
      level: 'good',
      message: 'Strong cash flow adequacy - easily covers all obligations with room to spare',
      threshold: '>= 1.2',
    };
  }

  if (ratio >= 0.8) {
    return {
      level: 'neutral',
      message: 'Adequate cash flow - covers most obligations but limited buffer',
      threshold: '0.8 - 1.2',
    };
  }

  return {
    level: 'bad',
    message: 'Insufficient cash flow - may need external financing to meet obligations',
    threshold: '< 0.8',
  };
}

/**
 * Interpret Cash Reinvestment Ratio
 *
 * Thresholds:
 * - Good: 0.20 - 0.50 (20-50% - balanced reinvestment)
 * - Neutral: 0.10 - 0.20 or 0.50 - 0.70 (low or high reinvestment)
 * - Bad: < 0.10 (underinvesting) or > 0.70 (overinvesting)
 */
export function interpretCashReinvestmentRatio(ratio: number | null): MetricInterpretation {
  if (ratio == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate cash reinvestment ratio',
      threshold: 'N/A',
    };
  }

  // Negative ratio (not replacing assets)
  if (ratio < 0) {
    return {
      level: 'bad',
      message: 'Negative reinvestment - not replacing depreciating assets, potential future issues',
      threshold: '< 0',
    };
  }

  // Balanced reinvestment
  if (ratio >= 0.20 && ratio <= 0.50) {
    return {
      level: 'good',
      message: 'Balanced reinvestment - healthy capital allocation for growth and maintenance',
      threshold: '20% - 50%',
    };
  }

  // Low or high reinvestment
  if ((ratio >= 0.10 && ratio < 0.20) || (ratio > 0.50 && ratio <= 0.70)) {
    return {
      level: 'neutral',
      message:
        ratio < 0.20
          ? 'Low reinvestment - asset-light business or mature company'
          : 'High reinvestment - capital-intensive or high-growth business',
      threshold: ratio < 0.20 ? '10% - 20%' : '50% - 70%',
    };
  }

  // Very high reinvestment
  if (ratio > 0.70) {
    return {
      level: 'bad',
      message: 'Very high reinvestment - may indicate inefficient capital deployment',
      threshold: '> 70%',
    };
  }

  // Very low reinvestment
  return {
    level: 'bad',
    message: 'Very low reinvestment - potential underinvestment in business',
    threshold: '< 10%',
  };
}

/**
 * Interpret FCFF (Free Cash Flow to Firm)
 */
export function interpretFCFF(fcff: number | null): MetricInterpretation {
  if (fcff == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate FCFF',
      threshold: 'N/A',
    };
  }

  if (fcff > 0) {
    return {
      level: 'good',
      message: 'Positive FCFF - generating cash for all investors (debt + equity)',
      threshold: '> 0',
    };
  }

  return {
    level: 'bad',
    message: 'Negative FCFF - not generating sufficient cash for investors',
    threshold: '<= 0',
  };
}

/**
 * Interpret FCFE (Free Cash Flow to Equity)
 */
export function interpretFCFE(fcfe: number | null): MetricInterpretation {
  if (fcfe == null) {
    return {
      level: 'neutral',
      message: 'Insufficient data to calculate FCFE',
      threshold: 'N/A',
    };
  }

  if (fcfe > 0) {
    return {
      level: 'good',
      message: 'Positive FCFE - generating cash for equity holders after all obligations',
      threshold: '> 0',
    };
  }

  return {
    level: 'bad',
    message: 'Negative FCFE - not generating cash for equity after debt obligations',
    threshold: '<= 0',
  };
}

/**
 * Get comprehensive interpretation of all cash flow metrics
 */
export function interpretAllCashFlowMetrics(
  metrics: CashFlowMetrics
): Record<string, MetricInterpretation> {
  return {
    operatingCashFlow: interpretOperatingCashFlow(metrics.operatingCashFlow),
    freeCashFlow: interpretFreeCashFlow(metrics.freeCashFlow),
    fcff: interpretFCFF(metrics.fcff),
    fcfe: interpretFCFE(metrics.fcfe),
    cashFlowAdequacy: interpretCashFlowAdequacy(metrics.cashFlowAdequacy),
    cashReinvestmentRatio: interpretCashReinvestmentRatio(metrics.cashReinvestmentRatio),
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get cash flow summary score (0-100)
 * Combines all cash flow metrics into a single score
 */
export function getCashFlowScore(metrics: CashFlowMetrics): number | null {
  const interpretations = interpretAllCashFlowMetrics(metrics);

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
 * Check if company has healthy cash flow
 * True if OCF, FCF, and FCFE are all positive
 */
export function hasHealthyCashFlow(metrics: CashFlowMetrics): boolean {
  return (
    (metrics.operatingCashFlow ?? 0) > 0 &&
    (metrics.freeCashFlow ?? 0) > 0 &&
    (metrics.fcfe ?? 0) > 0
  );
}

/**
 * Calculate FCF margin (FCF / Revenue)
 * Useful for comparing cash generation efficiency across companies
 */
export function calculateFCFMargin(
  fcf: number | null,
  revenue: number | null
): number | null {
  return safeDivide(fcf, revenue);
}

/**
 * Calculate FCF per share
 */
export function calculateFCFPerShare(
  fcf: number | null,
  sharesOutstanding: number | null
): number | null {
  return safeDivide(fcf, sharesOutstanding);
}

/**
 * Determine cash flow quality
 * Compares OCF to Net Income to assess earnings quality
 */
export function assessCashFlowQuality(
  ocf: number | null,
  netIncome: number | null
): string {
  if (ocf === null || netIncome === null || netIncome === 0) {
    return 'Unknown';
  }

  const ratio = safeDivide(ocf, netIncome);
  if (ratio === null) return 'Unknown';

  if (ratio >= 1.2) return 'High Quality'; // OCF significantly exceeds earnings
  if (ratio >= 0.8) return 'Good Quality'; // OCF close to earnings
  if (ratio >= 0.5) return 'Moderate Quality'; // OCF somewhat less than earnings
  return 'Low Quality'; // OCF much less than earnings (potential earnings manipulation)
}
