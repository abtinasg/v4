/**
 * Deep Terminal - Valuation Metrics Calculator
 *
 * Implements 14 valuation ratios from data-sources.md (lines 182-198):
 * 1. P/E Ratio - Price / EPS
 * 2. Forward P/E - Price / Forward EPS
 * 3. Justified P/E - (1 - payout ratio) / (required return - growth rate)
 * 4. P/B Ratio - Price / Book Value per Share
 * 5. Justified P/B - (ROE - growth) / (required return - growth)
 * 6. P/S Ratio - Price / Sales per Share
 * 7. P/CF Ratio - Price / Cash Flow per Share
 * 8. Enterprise Value (EV) - Market Cap + Total Debt - Cash
 * 9. EV/EBITDA - EV / EBITDA
 * 10. EV/Sales - EV / Revenue
 * 11. EV/EBIT - EV / EBIT
 * 12. Dividend Yield - DPS / Price
 * 13. PEG Ratio - P/E / Growth Rate
 * 14. Earnings Yield - EPS / Price (inverse of P/E)
 */

import { safeDivide, safeMultiply, safeSubtract, percentageChange } from './helpers';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Input data required for valuation calculations
 */
export interface ValuationInput {
  // Price & Market Data
  price: number;
  marketCap: number;
  sharesOutstanding: number;

  // Earnings Data
  eps: number | null;
  forwardEPS: number | null;
  netIncome: number;

  // Balance Sheet
  totalEquity: number;
  totalDebt: number;
  cash: number;

  // Income Statement
  revenue: number;
  ebitda: number;
  ebit: number;

  // Cash Flow
  operatingCashFlow: number;
  dividendsPaid: number;
  dividendsPerShare: number | null;

  // Historical Data (for growth)
  historicalEPS: number[];

  // Optional Yahoo Finance values (if available)
  yahooPerRatio?: number | null;
  yahooForwardPE?: number | null;
  yahooDividendYield?: number | null;
  yahooPegRatio?: number | null;
}

/**
 * Configuration options for valuation calculations
 */
export interface ValuationOptions {
  /** Required rate of return for justified metrics (default: 0.10 or 10%) */
  requiredReturn?: number;
  /** Terminal growth rate for justified metrics (default: 0.025 or 2.5%) */
  growthRate?: number;
  /** Use Yahoo Finance values where available (default: true) */
  useYahooValues?: boolean;
}

/**
 * Complete valuation metrics output
 */
export interface ValuationMetricsResult {
  // Primary Earnings Multiples
  peRatio: number | null;
  forwardPE: number | null;
  justifiedPE: number | null;

  // Book Value Multiples
  pbRatio: number | null;
  justifiedPB: number | null;

  // Other Price Multiples
  psRatio: number | null;
  pcfRatio: number | null;

  // Enterprise Value Metrics
  enterpriseValue: number | null;
  evToEBITDA: number | null;
  evToSales: number | null;
  evToEBIT: number | null;

  // Yield & Growth Metrics
  dividendYield: number | null;
  pegRatio: number | null;
  earningsYield: number | null;

  // Additional Computed Values
  bookValuePerShare: number | null;
  salesPerShare: number | null;
  cashFlowPerShare: number | null;
  payoutRatio: number | null;
  roe: number | null;
}

// ============================================================================
// VALUATION CALCULATOR CLASS
// ============================================================================

/**
 * Comprehensive valuation metrics calculator
 */
export class ValuationCalculator {
  private input: ValuationInput;
  private options: Required<ValuationOptions>;

  constructor(input: ValuationInput, options: ValuationOptions = {}) {
    this.input = input;
    this.options = {
      requiredReturn: options.requiredReturn ?? 0.10,
      growthRate: options.growthRate ?? 0.025,
      useYahooValues: options.useYahooValues ?? true,
    };
  }

  /**
   * Calculate all valuation metrics
   */
  public calculate(): ValuationMetricsResult {
    // Pre-calculate intermediate values
    const bookValuePerShare = this.calculateBookValuePerShare();
    const salesPerShare = this.calculateSalesPerShare();
    const cashFlowPerShare = this.calculateCashFlowPerShare();
    const payoutRatio = this.calculatePayoutRatio();
    const roe = this.calculateROE();
    const enterpriseValue = this.calculateEnterpriseValue();
    const epsGrowthRate = this.calculateEPSGrowthRate();

    return {
      // Earnings Multiples
      peRatio: this.calculatePERatio(),
      forwardPE: this.calculateForwardPE(),
      justifiedPE: this.calculateJustifiedPE(payoutRatio),

      // Book Value Multiples
      pbRatio: this.calculatePBRatio(bookValuePerShare),
      justifiedPB: this.calculateJustifiedPB(roe),

      // Other Price Multiples
      psRatio: this.calculatePSRatio(salesPerShare),
      pcfRatio: this.calculatePCFRatio(cashFlowPerShare),

      // Enterprise Value Metrics
      enterpriseValue,
      evToEBITDA: this.calculateEVToEBITDA(enterpriseValue),
      evToSales: this.calculateEVToSales(enterpriseValue),
      evToEBIT: this.calculateEVToEBIT(enterpriseValue),

      // Yield & Growth Metrics
      dividendYield: this.calculateDividendYield(),
      pegRatio: this.calculatePEGRatio(epsGrowthRate),
      earningsYield: this.calculateEarningsYield(),

      // Additional Values
      bookValuePerShare,
      salesPerShare,
      cashFlowPerShare,
      payoutRatio,
      roe,
    };
  }

  // ==========================================================================
  // EARNINGS MULTIPLES
  // ==========================================================================

  /**
   * P/E Ratio = Price / EPS
   * Source: Yahoo Finance (or calculated)
   */
  public calculatePERatio(): number | null {
    if (this.options.useYahooValues && this.input.yahooPerRatio != null) {
      return this.input.yahooPerRatio;
    }
    return safeDivide(this.input.price, this.input.eps);
  }

  /**
   * Forward P/E = Price / Forward EPS
   * Source: Yahoo Finance (or calculated)
   */
  public calculateForwardPE(): number | null {
    if (this.options.useYahooValues && this.input.yahooForwardPE != null) {
      return this.input.yahooForwardPE;
    }
    return safeDivide(this.input.price, this.input.forwardEPS);
  }

  /**
   * Justified P/E = (1 - payout ratio) / (required return - growth rate)
   *
   * Derived from Gordon Growth Model / Dividend Discount Model
   * This represents the theoretical P/E based on fundamental value drivers
   *
   * Where:
   * - (1 - payout ratio) = retention ratio
   * - required return = cost of equity (typically 8-12%)
   * - growth rate = sustainable growth rate
   */
  public calculateJustifiedPE(payoutRatio?: number | null): number | null {
    const payout = payoutRatio ?? this.calculatePayoutRatio();
    if (payout == null) return null;

    const r = this.options.requiredReturn;
    const g = this.options.growthRate;

    // Ensure r > g (required for model validity)
    if (r <= g) return null;

    const retentionRatio = 1 - Math.abs(payout);
    return safeDivide(retentionRatio, r - g);
  }

  // ==========================================================================
  // BOOK VALUE MULTIPLES
  // ==========================================================================

  /**
   * P/B Ratio = Price / Book Value per Share
   * Source: Yahoo Finance (or calculated)
   */
  public calculatePBRatio(bvps?: number | null): number | null {
    const bookValue = bvps ?? this.calculateBookValuePerShare();
    return safeDivide(this.input.price, bookValue);
  }

  /**
   * Justified P/B = (ROE - growth) / (required return - growth)
   *
   * Derived from residual income model
   * Represents the theoretical P/B based on value creation above cost of capital
   *
   * If ROE > required return: P/B > 1 (creates shareholder value)
   * If ROE < required return: P/B < 1 (destroys shareholder value)
   */
  public calculateJustifiedPB(roe?: number | null): number | null {
    const returnOnEquity = roe ?? this.calculateROE();
    if (returnOnEquity == null) return null;

    const r = this.options.requiredReturn;
    const g = this.options.growthRate;

    // Ensure r > g
    if (r <= g) return null;

    return safeDivide(returnOnEquity - g, r - g);
  }

  // ==========================================================================
  // OTHER PRICE MULTIPLES
  // ==========================================================================

  /**
   * P/S Ratio = Price / Sales per Share = Market Cap / Revenue
   */
  public calculatePSRatio(salesPerShare?: number | null): number | null {
    const sps = salesPerShare ?? this.calculateSalesPerShare();
    if (sps) {
      return safeDivide(this.input.price, sps);
    }
    // Alternative: Market Cap / Revenue
    return safeDivide(this.input.marketCap, this.input.revenue);
  }

  /**
   * P/CF Ratio = Price / Cash Flow per Share
   * Uses Operating Cash Flow as the cash flow metric
   */
  public calculatePCFRatio(cfps?: number | null): number | null {
    const cashFlowPerShare = cfps ?? this.calculateCashFlowPerShare();
    return safeDivide(this.input.price, cashFlowPerShare);
  }

  // ==========================================================================
  // ENTERPRISE VALUE METRICS
  // ==========================================================================

  /**
   * Enterprise Value = Market Cap + Total Debt - Cash
   *
   * EV represents the total value of a business available to all capital providers
   * (debt holders + equity holders)
   */
  public calculateEnterpriseValue(): number | null {
    const { marketCap, totalDebt, cash } = this.input;

    if (marketCap == null || !isFinite(marketCap)) return null;

    const ev = marketCap + (totalDebt || 0) - (cash || 0);
    return isFinite(ev) ? ev : null;
  }

  /**
   * EV/EBITDA = Enterprise Value / EBITDA
   *
   * Most commonly used EV multiple
   * Useful for comparing companies with different capital structures
   */
  public calculateEVToEBITDA(ev?: number | null): number | null {
    const enterpriseValue = ev ?? this.calculateEnterpriseValue();
    return safeDivide(enterpriseValue, this.input.ebitda);
  }

  /**
   * EV/Sales = Enterprise Value / Revenue
   *
   * Useful for early-stage or unprofitable companies
   */
  public calculateEVToSales(ev?: number | null): number | null {
    const enterpriseValue = ev ?? this.calculateEnterpriseValue();
    return safeDivide(enterpriseValue, this.input.revenue);
  }

  /**
   * EV/EBIT = Enterprise Value / EBIT
   *
   * Similar to EV/EBITDA but accounts for depreciation/amortization
   * Better for capital-intensive businesses
   */
  public calculateEVToEBIT(ev?: number | null): number | null {
    const enterpriseValue = ev ?? this.calculateEnterpriseValue();
    return safeDivide(enterpriseValue, this.input.ebit);
  }

  // ==========================================================================
  // YIELD & GROWTH METRICS
  // ==========================================================================

  /**
   * Dividend Yield = Dividends per Share / Price
   * Source: Yahoo Finance (or calculated)
   */
  public calculateDividendYield(): number | null {
    if (this.options.useYahooValues && this.input.yahooDividendYield != null) {
      return this.input.yahooDividendYield;
    }
    return safeDivide(this.input.dividendsPerShare, this.input.price);
  }

  /**
   * PEG Ratio = P/E Ratio / EPS Growth Rate
   *
   * Peter Lynch popularized this metric
   * PEG < 1 may indicate undervaluation relative to growth
   * PEG > 1 may indicate overvaluation relative to growth
   */
  public calculatePEGRatio(epsGrowthRate?: number | null): number | null {
    if (this.options.useYahooValues && this.input.yahooPegRatio != null) {
      return this.input.yahooPegRatio;
    }

    const peRatio = this.calculatePERatio();
    const growth = epsGrowthRate ?? this.calculateEPSGrowthRate();

    if (peRatio == null || growth == null || growth === 0) return null;

    // Growth is typically expressed as percentage (e.g., 15 for 15%)
    // If growth is decimal, convert to percentage
    const growthPercent = Math.abs(growth) < 1 ? growth * 100 : growth;

    if (growthPercent <= 0) return null; // PEG not meaningful for negative growth

    return safeDivide(peRatio, growthPercent);
  }

  /**
   * Earnings Yield = EPS / Price = 1 / P/E
   *
   * Inverse of P/E ratio
   * Can be compared to bond yields to assess relative value
   */
  public calculateEarningsYield(): number | null {
    const peRatio = this.calculatePERatio();
    if (peRatio == null || peRatio === 0) return null;
    return safeDivide(1, peRatio);
  }

  // ==========================================================================
  // HELPER CALCULATIONS
  // ==========================================================================

  /**
   * Book Value per Share = Total Equity / Shares Outstanding
   */
  public calculateBookValuePerShare(): number | null {
    return safeDivide(this.input.totalEquity, this.input.sharesOutstanding);
  }

  /**
   * Sales per Share = Revenue / Shares Outstanding
   */
  public calculateSalesPerShare(): number | null {
    return safeDivide(this.input.revenue, this.input.sharesOutstanding);
  }

  /**
   * Cash Flow per Share = Operating Cash Flow / Shares Outstanding
   */
  public calculateCashFlowPerShare(): number | null {
    return safeDivide(this.input.operatingCashFlow, this.input.sharesOutstanding);
  }

  /**
   * Payout Ratio = Dividends Paid / Net Income
   */
  public calculatePayoutRatio(): number | null {
    return safeDivide(Math.abs(this.input.dividendsPaid), this.input.netIncome);
  }

  /**
   * Return on Equity = Net Income / Total Equity
   */
  public calculateROE(): number | null {
    return safeDivide(this.input.netIncome, this.input.totalEquity);
  }

  /**
   * Calculate EPS growth rate from historical data
   * Uses Year-over-Year growth
   */
  public calculateEPSGrowthRate(): number | null {
    const eps = this.input.historicalEPS;
    if (eps.length < 2) return null;

    const current = eps[eps.length - 1];
    const previous = eps[eps.length - 2];

    return percentageChange(current, previous);
  }
}

// ============================================================================
// STANDALONE FUNCTIONS
// ============================================================================

/**
 * Calculate P/E Ratio
 */
export function calculatePERatio(price: number, eps: number | null): number | null {
  return safeDivide(price, eps);
}

/**
 * Calculate Forward P/E
 */
export function calculateForwardPE(price: number, forwardEPS: number | null): number | null {
  return safeDivide(price, forwardEPS);
}

/**
 * Calculate Justified P/E based on Gordon Growth Model
 * Formula: (1 - payout ratio) / (required return - growth rate)
 */
export function calculateJustifiedPE(
  payoutRatio: number,
  requiredReturn: number,
  growthRate: number
): number | null {
  if (requiredReturn <= growthRate) return null;
  const retentionRatio = 1 - Math.abs(payoutRatio);
  return safeDivide(retentionRatio, requiredReturn - growthRate);
}

/**
 * Calculate P/B Ratio
 */
export function calculatePBRatio(
  price: number,
  totalEquity: number,
  sharesOutstanding: number
): number | null {
  const bvps = safeDivide(totalEquity, sharesOutstanding);
  return safeDivide(price, bvps);
}

/**
 * Calculate Justified P/B based on Residual Income Model
 * Formula: (ROE - growth) / (required return - growth)
 */
export function calculateJustifiedPB(
  roe: number,
  requiredReturn: number,
  growthRate: number
): number | null {
  if (requiredReturn <= growthRate) return null;
  return safeDivide(roe - growthRate, requiredReturn - growthRate);
}

/**
 * Calculate P/S Ratio
 */
export function calculatePSRatio(marketCap: number, revenue: number): number | null {
  return safeDivide(marketCap, revenue);
}

/**
 * Calculate P/CF Ratio
 */
export function calculatePCFRatio(
  price: number,
  operatingCashFlow: number,
  sharesOutstanding: number
): number | null {
  const cfps = safeDivide(operatingCashFlow, sharesOutstanding);
  return safeDivide(price, cfps);
}

/**
 * Calculate Enterprise Value
 * Formula: Market Cap + Total Debt - Cash
 */
export function calculateEnterpriseValue(
  marketCap: number,
  totalDebt: number,
  cash: number
): number | null {
  if (!isFinite(marketCap)) return null;
  const ev = marketCap + (totalDebt || 0) - (cash || 0);
  return isFinite(ev) ? ev : null;
}

/**
 * Calculate EV/EBITDA
 */
export function calculateEVToEBITDA(ev: number | null, ebitda: number): number | null {
  return safeDivide(ev, ebitda);
}

/**
 * Calculate EV/Sales
 */
export function calculateEVToSales(ev: number | null, revenue: number): number | null {
  return safeDivide(ev, revenue);
}

/**
 * Calculate EV/EBIT
 */
export function calculateEVToEBIT(ev: number | null, ebit: number): number | null {
  return safeDivide(ev, ebit);
}

/**
 * Calculate Dividend Yield
 * Formula: DPS / Price
 */
export function calculateDividendYield(
  dividendsPerShare: number | null,
  price: number
): number | null {
  return safeDivide(dividendsPerShare, price);
}

/**
 * Calculate PEG Ratio
 * Formula: P/E / EPS Growth Rate (%)
 */
export function calculatePEGRatio(
  peRatio: number | null,
  epsGrowthRate: number | null
): number | null {
  if (peRatio == null || epsGrowthRate == null || epsGrowthRate <= 0) return null;
  // Convert decimal to percentage if needed
  const growthPercent = Math.abs(epsGrowthRate) < 1 ? epsGrowthRate * 100 : epsGrowthRate;
  return safeDivide(peRatio, growthPercent);
}

/**
 * Calculate Earnings Yield
 * Formula: EPS / Price = 1 / P/E
 */
export function calculateEarningsYield(peRatio: number | null): number | null {
  if (peRatio == null || peRatio === 0) return null;
  return safeDivide(1, peRatio);
}

// ============================================================================
// VALUATION ANALYSIS UTILITIES
// ============================================================================

/**
 * Compare actual valuation to justified valuation
 */
export interface ValuationComparison {
  metric: string;
  actual: number | null;
  justified: number | null;
  premium: number | null; // Percentage premium/discount to fair value
  interpretation: string;
}

/**
 * Analyze valuation metrics and provide comparison
 */
export function analyzeValuation(metrics: ValuationMetricsResult): ValuationComparison[] {
  const comparisons: ValuationComparison[] = [];

  // P/E Comparison
  if (metrics.peRatio != null && metrics.justifiedPE != null) {
    const premium = safeDivide(metrics.peRatio - metrics.justifiedPE, metrics.justifiedPE);
    comparisons.push({
      metric: 'P/E Ratio',
      actual: metrics.peRatio,
      justified: metrics.justifiedPE,
      premium,
      interpretation: interpretPremium(premium, 'P/E'),
    });
  }

  // P/B Comparison
  if (metrics.pbRatio != null && metrics.justifiedPB != null) {
    const premium = safeDivide(metrics.pbRatio - metrics.justifiedPB, metrics.justifiedPB);
    comparisons.push({
      metric: 'P/B Ratio',
      actual: metrics.pbRatio,
      justified: metrics.justifiedPB,
      premium,
      interpretation: interpretPremium(premium, 'P/B'),
    });
  }

  return comparisons;
}

/**
 * Interpret premium/discount to fair value
 */
function interpretPremium(premium: number | null, metric: string): string {
  if (premium == null) return 'Insufficient data';

  const percentPremium = premium * 100;

  if (percentPremium > 50) {
    return `${metric} significantly overvalued (${percentPremium.toFixed(1)}% premium)`;
  } else if (percentPremium > 20) {
    return `${metric} moderately overvalued (${percentPremium.toFixed(1)}% premium)`;
  } else if (percentPremium > -20) {
    return `${metric} fairly valued (${percentPremium.toFixed(1)}% ${percentPremium >= 0 ? 'premium' : 'discount'})`;
  } else if (percentPremium > -50) {
    return `${metric} moderately undervalued (${Math.abs(percentPremium).toFixed(1)}% discount)`;
  } else {
    return `${metric} significantly undervalued (${Math.abs(percentPremium).toFixed(1)}% discount)`;
  }
}

/**
 * Calculate composite valuation score (0-100)
 */
export function calculateValuationScore(metrics: ValuationMetricsResult): number | null {
  const scores: number[] = [];

  // P/E Score: Lower is better (0-40 range → 100-0)
  if (metrics.peRatio != null && metrics.peRatio > 0) {
    const peScore = Math.max(0, Math.min(100, 100 - (metrics.peRatio / 40) * 100));
    scores.push(peScore);
  }

  // P/B Score: Lower is better (0-5 range → 100-0)
  if (metrics.pbRatio != null && metrics.pbRatio > 0) {
    const pbScore = Math.max(0, Math.min(100, 100 - (metrics.pbRatio / 5) * 100));
    scores.push(pbScore);
  }

  // PEG Score: Lower is better (0-3 range → 100-0)
  if (metrics.pegRatio != null && metrics.pegRatio > 0) {
    const pegScore = Math.max(0, Math.min(100, 100 - (metrics.pegRatio / 3) * 100));
    scores.push(pegScore);
  }

  // EV/EBITDA Score: Lower is better (0-20 range → 100-0)
  if (metrics.evToEBITDA != null && metrics.evToEBITDA > 0) {
    const evScore = Math.max(0, Math.min(100, 100 - (metrics.evToEBITDA / 20) * 100));
    scores.push(evScore);
  }

  // Earnings Yield Score: Higher is better (0-0.15 range → 0-100)
  if (metrics.earningsYield != null && metrics.earningsYield > 0) {
    const eyScore = Math.max(0, Math.min(100, (metrics.earningsYield / 0.15) * 100));
    scores.push(eyScore);
  }

  if (scores.length === 0) return null;

  return scores.reduce((a, b) => a + b, 0) / scores.length;
}
