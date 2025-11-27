/**
 * Deep Terminal - Risk Metrics Calculator
 *
 * Implements 7 risk metrics from data-sources.md (lines 213-222):
 * 1. Beta - Covariance(Stock, Market) / Variance(Market) vs S&P 500
 * 2. Standard Deviation - σ of returns
 * 3. Alpha - Actual Return - Expected Return (CAPM)
 * 4. Sharpe Ratio - (Return - Rf) / σ
 * 5. Sortino Ratio - (Return - Rf) / Downside σ
 * 6. Max Drawdown - Peak to trough decline
 * 7. VaR (95%) - Value at Risk at 95% confidence
 *
 * KEY FORMULAS:
 * - Beta = Covariance(Stock, Market) / Variance(Market)
 * - Sharpe Ratio = (Portfolio Return - Risk-free Rate) / Standard Deviation
 * - Sortino Ratio = (Return - Risk-free) / Downside Deviation (only negative returns)
 * - Max Drawdown = (Trough Value - Peak Value) / Peak Value
 * - VaR 95% = Portfolio value at 5th percentile of distribution
 *
 * REQUIREMENTS:
 * - Price history (1-3 years) for calculations
 * - Calculate daily/monthly returns
 * - Use S&P 500 as market benchmark
 */

import {
  safeDivide,
  mean,
  standardDeviation,
  variance,
  covariance,
  downsideDeviation,
  calculateMaxDrawdown,
} from './helpers';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Price data point
 */
export interface PricePoint {
  date: string | Date;
  price: number;
  volume?: number;
}

/**
 * Input data required for risk calculations
 */
export interface RiskInput {
  // Stock price history (should be 1-3 years of data)
  priceHistory: PricePoint[];

  // Market (S&P 500) price history for same period
  marketPriceHistory: PricePoint[];

  // Risk-free rate (from FRED 10Y Treasury)
  riskFreeRate: number;

  // Optional: Pre-calculated beta from Yahoo Finance
  yahooBeta?: number | null;

  // Optional: Current portfolio/position value for VaR calculation
  positionValue?: number;
}

/**
 * Configuration options for risk calculations
 */
export interface RiskOptions {
  /** Return period: 'daily' | 'weekly' | 'monthly' (default: 'daily') */
  returnPeriod?: 'daily' | 'weekly' | 'monthly';
  /** Annualization factor (default: 252 for daily) */
  annualizationFactor?: number;
  /** VaR confidence level (default: 0.95) */
  varConfidence?: number;
  /** Minimum required data points (default: 30) */
  minDataPoints?: number;
  /** Use Yahoo beta if available (default: true) */
  useYahooBeta?: boolean;
}

/**
 * Complete risk metrics output
 */
export interface RiskMetricsResult {
  // Core Risk Metrics
  beta: number | null;
  standardDeviation: number | null;
  annualizedVolatility: number | null;
  alpha: number | null;

  // Risk-Adjusted Performance
  sharpeRatio: number | null;
  sortinoRatio: number | null;

  // Downside Risk
  maxDrawdown: number | null;
  var95: number | null;
  var99: number | null;
  cvar95: number | null; // Conditional VaR (Expected Shortfall)

  // Additional Statistics
  averageReturn: number | null;
  annualizedReturn: number | null;
  positiveReturns: number;
  negativeReturns: number;
  winRate: number | null;
  downsideDeviation: number | null;

  // Correlation with Market
  correlation: number | null;
  rsquared: number | null;

  // Data Quality
  dataPoints: number;
  startDate: string | null;
  endDate: string | null;
}

// ============================================================================
// RISK CALCULATOR CLASS
// ============================================================================

/**
 * Comprehensive risk metrics calculator
 */
export class RiskCalculator {
  private input: RiskInput;
  private options: Required<RiskOptions>;
  private stockReturns: number[];
  private marketReturns: number[];

  constructor(input: RiskInput, options: RiskOptions = {}) {
    this.input = input;
    this.options = {
      returnPeriod: options.returnPeriod ?? 'daily',
      annualizationFactor: options.annualizationFactor ?? this.getDefaultAnnualizationFactor(options.returnPeriod ?? 'daily'),
      varConfidence: options.varConfidence ?? 0.95,
      minDataPoints: options.minDataPoints ?? 30,
      useYahooBeta: options.useYahooBeta ?? true,
    };

    // Pre-calculate returns
    this.stockReturns = this.calculateReturns(input.priceHistory);
    this.marketReturns = this.calculateReturns(input.marketPriceHistory);
  }

  private getDefaultAnnualizationFactor(period: 'daily' | 'weekly' | 'monthly'): number {
    switch (period) {
      case 'daily':
        return 252; // Trading days per year
      case 'weekly':
        return 52;
      case 'monthly':
        return 12;
    }
  }

  /**
   * Calculate all risk metrics
   */
  public calculate(): RiskMetricsResult {
    // Check data quality
    const hasEnoughData = this.stockReturns.length >= this.options.minDataPoints;

    if (!hasEnoughData) {
      return this.getEmptyResult();
    }

    // Calculate core metrics
    const beta = this.calculateBeta();
    const stdDev = this.calculateStandardDeviation();
    const annualizedVolatility = this.calculateAnnualizedVolatility(stdDev);
    const avgReturn = this.calculateAverageReturn();
    const annualizedReturn = this.calculateAnnualizedReturn(avgReturn);

    // Calculate risk-adjusted performance
    const alpha = this.calculateAlpha(beta, annualizedReturn);
    const sharpeRatio = this.calculateSharpeRatio(avgReturn, stdDev);
    const sortinoRatio = this.calculateSortinoRatio(avgReturn);

    // Calculate downside risk metrics
    const maxDrawdown = this.calculateMaxDrawdown();
    const { var95, var99, cvar95 } = this.calculateVaR();

    // Calculate additional statistics
    const { positiveReturns, negativeReturns, winRate } = this.calculateWinRate();
    const downDev = this.calculateDownsideDeviation();
    const { correlation, rsquared } = this.calculateCorrelation();

    // Get date range
    const startDate = this.input.priceHistory.length > 0
      ? this.formatDate(this.input.priceHistory[0].date)
      : null;
    const endDate = this.input.priceHistory.length > 0
      ? this.formatDate(this.input.priceHistory[this.input.priceHistory.length - 1].date)
      : null;

    return {
      beta,
      standardDeviation: stdDev,
      annualizedVolatility,
      alpha,
      sharpeRatio,
      sortinoRatio,
      maxDrawdown,
      var95,
      var99,
      cvar95,
      averageReturn: avgReturn,
      annualizedReturn,
      positiveReturns,
      negativeReturns,
      winRate,
      downsideDeviation: downDev,
      correlation,
      rsquared,
      dataPoints: this.stockReturns.length,
      startDate,
      endDate,
    };
  }

  private getEmptyResult(): RiskMetricsResult {
    return {
      beta: this.options.useYahooBeta ? this.input.yahooBeta ?? null : null,
      standardDeviation: null,
      annualizedVolatility: null,
      alpha: null,
      sharpeRatio: null,
      sortinoRatio: null,
      maxDrawdown: null,
      var95: null,
      var99: null,
      cvar95: null,
      averageReturn: null,
      annualizedReturn: null,
      positiveReturns: 0,
      negativeReturns: 0,
      winRate: null,
      downsideDeviation: null,
      correlation: null,
      rsquared: null,
      dataPoints: this.stockReturns.length,
      startDate: null,
      endDate: null,
    };
  }

  private formatDate(date: string | Date): string {
    if (typeof date === 'string') return date;
    return date.toISOString().split('T')[0];
  }

  // ==========================================================================
  // RETURN CALCULATIONS
  // ==========================================================================

  /**
   * Calculate returns from price history
   * Return = (P_t - P_{t-1}) / P_{t-1}
   */
  private calculateReturns(priceHistory: PricePoint[]): number[] {
    if (priceHistory.length < 2) return [];

    const returns: number[] = [];
    for (let i = 1; i < priceHistory.length; i++) {
      const currentPrice = priceHistory[i].price;
      const previousPrice = priceHistory[i - 1].price;

      if (previousPrice > 0) {
        const ret = (currentPrice - previousPrice) / previousPrice;
        returns.push(ret);
      }
    }

    return returns;
  }

  /**
   * Calculate average return
   */
  public calculateAverageReturn(): number | null {
    return mean(this.stockReturns);
  }

  /**
   * Calculate annualized return
   * Annualized Return = (1 + Average Return)^annualization_factor - 1
   */
  public calculateAnnualizedReturn(avgReturn?: number | null): number | null {
    const avg = avgReturn ?? this.calculateAverageReturn();
    if (avg == null) return null;

    return Math.pow(1 + avg, this.options.annualizationFactor) - 1;
  }

  // ==========================================================================
  // CORE RISK METRICS
  // ==========================================================================

  /**
   * Calculate Beta
   * Formula: β = Cov(Stock, Market) / Var(Market)
   *
   * Beta measures systematic risk (market risk)
   * - β > 1: More volatile than market
   * - β = 1: Same volatility as market
   * - β < 1: Less volatile than market
   * - β < 0: Inverse correlation with market
   */
  public calculateBeta(): number | null {
    // Use Yahoo beta if available and configured
    if (this.options.useYahooBeta && this.input.yahooBeta != null) {
      return this.input.yahooBeta;
    }

    if (this.stockReturns.length !== this.marketReturns.length || this.stockReturns.length < 2) {
      return this.input.yahooBeta ?? null;
    }

    const cov = covariance(this.stockReturns, this.marketReturns);
    const marketVar = variance(this.marketReturns);

    return safeDivide(cov, marketVar);
  }

  /**
   * Calculate Standard Deviation of returns
   * Measures total risk (volatility)
   */
  public calculateStandardDeviation(): number | null {
    return standardDeviation(this.stockReturns);
  }

  /**
   * Calculate Annualized Volatility
   * Annualized Vol = Daily Vol × √252 (or √52 for weekly, √12 for monthly)
   */
  public calculateAnnualizedVolatility(stdDev?: number | null): number | null {
    const sd = stdDev ?? this.calculateStandardDeviation();
    if (sd == null) return null;

    return sd * Math.sqrt(this.options.annualizationFactor);
  }

  /**
   * Calculate Alpha (Jensen's Alpha)
   * Formula: α = Actual Return - Expected Return
   * Where Expected Return = Rf + β(Rm - Rf) [CAPM]
   *
   * Alpha measures excess return over CAPM expected return
   * - α > 0: Outperformed risk-adjusted expectation
   * - α = 0: Performed as expected
   * - α < 0: Underperformed risk-adjusted expectation
   */
  public calculateAlpha(beta?: number | null, annualizedReturn?: number | null): number | null {
    const b = beta ?? this.calculateBeta();
    const actualReturn = annualizedReturn ?? this.calculateAnnualizedReturn();

    if (b == null || actualReturn == null) return null;

    const rf = this.input.riskFreeRate;
    const marketReturn = this.calculateAnnualizedReturn(mean(this.marketReturns));

    if (marketReturn == null) return null;

    // Expected Return (CAPM) = Rf + β(Rm - Rf)
    const expectedReturn = rf + b * (marketReturn - rf);

    // Alpha = Actual - Expected
    return actualReturn - expectedReturn;
  }

  // ==========================================================================
  // RISK-ADJUSTED PERFORMANCE
  // ==========================================================================

  /**
   * Calculate Sharpe Ratio
   * Formula: (Return - Rf) / σ
   *
   * Measures risk-adjusted return
   * - Sharpe > 1: Good risk-adjusted return
   * - Sharpe > 2: Very good
   * - Sharpe > 3: Excellent
   * - Sharpe < 0: Losing money vs risk-free
   */
  public calculateSharpeRatio(avgReturn?: number | null, stdDev?: number | null): number | null {
    const avg = avgReturn ?? this.calculateAverageReturn();
    const sd = stdDev ?? this.calculateStandardDeviation();

    if (avg == null || sd == null || sd === 0) return null;

    // Daily risk-free rate
    const dailyRf = this.input.riskFreeRate / this.options.annualizationFactor;

    // Sharpe Ratio (can annualize by multiplying by √annualization_factor)
    const dailySharpe = safeDivide(avg - dailyRf, sd);

    // Annualize Sharpe Ratio
    if (dailySharpe == null) return null;
    return dailySharpe * Math.sqrt(this.options.annualizationFactor);
  }

  /**
   * Calculate Sortino Ratio
   * Formula: (Return - Rf) / Downside Deviation
   *
   * Similar to Sharpe but only penalizes downside volatility
   * More appropriate for investors who only care about downside risk
   */
  public calculateSortinoRatio(avgReturn?: number | null): number | null {
    const avg = avgReturn ?? this.calculateAverageReturn();
    const downDev = this.calculateDownsideDeviation();

    if (avg == null || downDev == null || downDev === 0) return null;

    // Daily risk-free rate
    const dailyRf = this.input.riskFreeRate / this.options.annualizationFactor;

    // Sortino Ratio
    const dailySortino = safeDivide(avg - dailyRf, downDev);

    // Annualize
    if (dailySortino == null) return null;
    return dailySortino * Math.sqrt(this.options.annualizationFactor);
  }

  /**
   * Calculate Downside Deviation
   * Only considers returns below the target (typically 0 or Rf)
   */
  public calculateDownsideDeviation(): number | null {
    const targetReturn = this.input.riskFreeRate / this.options.annualizationFactor;
    return downsideDeviation(this.stockReturns, targetReturn);
  }

  // ==========================================================================
  // DOWNSIDE RISK METRICS
  // ==========================================================================

  /**
   * Calculate Maximum Drawdown
   * Formula: (Trough - Peak) / Peak
   *
   * Measures the largest peak-to-trough decline
   * Important for understanding worst-case scenario
   */
  public calculateMaxDrawdown(): number | null {
    const prices = this.input.priceHistory.map((p) => p.price);
    return calculateMaxDrawdown(prices);
  }

  /**
   * Calculate Value at Risk (VaR)
   * Returns the potential loss at a given confidence level
   *
   * VaR 95% = The loss level that won't be exceeded 95% of the time
   * In other words, 5% of the time, losses will exceed this amount
   *
   * Historical VaR method (percentile approach)
   */
  public calculateVaR(): { var95: number | null; var99: number | null; cvar95: number | null } {
    if (this.stockReturns.length < 20) {
      return { var95: null, var99: null, cvar95: null };
    }

    const sortedReturns = [...this.stockReturns].sort((a, b) => a - b);
    const n = sortedReturns.length;

    // 95% VaR (5th percentile)
    const var95Index = Math.floor(n * 0.05);
    const var95 = sortedReturns[var95Index];

    // 99% VaR (1st percentile)
    const var99Index = Math.floor(n * 0.01);
    const var99 = sortedReturns[var99Index] ?? sortedReturns[0];

    // Conditional VaR (Expected Shortfall) at 95%
    // Average of returns below the VaR threshold
    const tailReturns = sortedReturns.slice(0, var95Index + 1);
    const cvar95 = mean(tailReturns);

    return { var95, var99, cvar95 };
  }

  /**
   * Calculate Dollar VaR
   * Translates percentage VaR to dollar amount
   */
  public calculateDollarVaR(confidence: number = 0.95): number | null {
    const positionValue = this.input.positionValue;
    if (positionValue == null) return null;

    const { var95, var99 } = this.calculateVaR();
    const varPct = confidence >= 0.99 ? var99 : var95;

    if (varPct == null) return null;

    return Math.abs(varPct) * positionValue;
  }

  // ==========================================================================
  // ADDITIONAL STATISTICS
  // ==========================================================================

  /**
   * Calculate win rate and return distribution
   */
  public calculateWinRate(): { positiveReturns: number; negativeReturns: number; winRate: number | null } {
    let positiveReturns = 0;
    let negativeReturns = 0;

    for (const ret of this.stockReturns) {
      if (ret > 0) positiveReturns++;
      else if (ret < 0) negativeReturns++;
    }

    const total = positiveReturns + negativeReturns;
    const winRate = total > 0 ? safeDivide(positiveReturns, total) : null;

    return { positiveReturns, negativeReturns, winRate };
  }

  /**
   * Calculate correlation with market and R-squared
   */
  public calculateCorrelation(): { correlation: number | null; rsquared: number | null } {
    if (this.stockReturns.length !== this.marketReturns.length || this.stockReturns.length < 2) {
      return { correlation: null, rsquared: null };
    }

    const cov = covariance(this.stockReturns, this.marketReturns);
    const stockStd = standardDeviation(this.stockReturns);
    const marketStd = standardDeviation(this.marketReturns);

    if (cov == null || stockStd == null || marketStd == null || stockStd === 0 || marketStd === 0) {
      return { correlation: null, rsquared: null };
    }

    const correlation = cov / (stockStd * marketStd);
    const rsquared = correlation * correlation;

    return { correlation, rsquared };
  }
}

// ============================================================================
// STANDALONE FUNCTIONS
// ============================================================================

/**
 * Calculate Beta from returns
 * Formula: Cov(Stock, Market) / Var(Market)
 */
export function calculateBeta(
  stockReturns: number[],
  marketReturns: number[]
): number | null {
  const cov = covariance(stockReturns, marketReturns);
  const marketVar = variance(marketReturns);
  return safeDivide(cov, marketVar);
}

/**
 * Calculate Sharpe Ratio
 * Formula: (Return - Rf) / σ
 */
export function calculateSharpeRatio(
  returns: number[],
  riskFreeRate: number,
  annualizationFactor: number = 252
): number | null {
  const avgReturn = mean(returns);
  const stdDev = standardDeviation(returns);

  if (avgReturn == null || stdDev == null || stdDev === 0) return null;

  const dailyRf = riskFreeRate / annualizationFactor;
  const dailySharpe = (avgReturn - dailyRf) / stdDev;

  return dailySharpe * Math.sqrt(annualizationFactor);
}

/**
 * Calculate Sortino Ratio
 * Formula: (Return - Rf) / Downside σ
 */
export function calculateSortinoRatio(
  returns: number[],
  riskFreeRate: number,
  annualizationFactor: number = 252
): number | null {
  const avgReturn = mean(returns);
  const dailyRf = riskFreeRate / annualizationFactor;
  const downDev = downsideDeviation(returns, dailyRf);

  if (avgReturn == null || downDev == null || downDev === 0) return null;

  const dailySortino = (avgReturn - dailyRf) / downDev;
  return dailySortino * Math.sqrt(annualizationFactor);
}

/**
 * Calculate Alpha (Jensen's Alpha)
 */
export function calculateAlpha(
  stockReturn: number,
  marketReturn: number,
  beta: number,
  riskFreeRate: number
): number {
  const expectedReturn = riskFreeRate + beta * (marketReturn - riskFreeRate);
  return stockReturn - expectedReturn;
}

/**
 * Calculate VaR at specified confidence level
 */
export function calculateVaR(
  returns: number[],
  confidence: number = 0.95
): number | null {
  if (returns.length < 20) return null;

  const sortedReturns = [...returns].sort((a, b) => a - b);
  const index = Math.floor(sortedReturns.length * (1 - confidence));

  return sortedReturns[index] ?? null;
}

/**
 * Calculate Conditional VaR (Expected Shortfall)
 * Average of returns below VaR threshold
 */
export function calculateCVaR(
  returns: number[],
  confidence: number = 0.95
): number | null {
  if (returns.length < 20) return null;

  const sortedReturns = [...returns].sort((a, b) => a - b);
  const varIndex = Math.floor(sortedReturns.length * (1 - confidence));
  const tailReturns = sortedReturns.slice(0, varIndex + 1);

  return mean(tailReturns);
}

/**
 * Calculate returns from price array
 */
export function calculateReturns(prices: number[]): number[] {
  if (prices.length < 2) return [];

  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    if (prices[i - 1] > 0) {
      returns.push((prices[i] - prices[i - 1]) / prices[i - 1]);
    }
  }

  return returns;
}

/**
 * Calculate annualized volatility
 */
export function calculateAnnualizedVolatility(
  returns: number[],
  annualizationFactor: number = 252
): number | null {
  const stdDev = standardDeviation(returns);
  if (stdDev == null) return null;
  return stdDev * Math.sqrt(annualizationFactor);
}

// ============================================================================
// RISK SCORING
// ============================================================================

/**
 * Calculate composite risk score (0-100)
 * Lower score = Lower risk
 * Higher score = Higher risk
 */
export function calculateRiskScore(metrics: RiskMetricsResult): number | null {
  const scores: number[] = [];

  // Beta Score: 0-2 → 0-100 (higher beta = higher risk)
  if (metrics.beta != null) {
    const betaScore = Math.min(100, Math.max(0, (Math.abs(metrics.beta) / 2) * 100));
    scores.push(betaScore);
  }

  // Volatility Score: 0-0.50 annualized → 0-100
  if (metrics.annualizedVolatility != null) {
    const volScore = Math.min(100, Math.max(0, (metrics.annualizedVolatility / 0.50) * 100));
    scores.push(volScore);
  }

  // Max Drawdown Score: 0-0.50 → 0-100 (higher drawdown = higher risk)
  if (metrics.maxDrawdown != null) {
    const ddScore = Math.min(100, Math.max(0, (Math.abs(metrics.maxDrawdown) / 0.50) * 100));
    scores.push(ddScore);
  }

  // Sharpe Ratio Score (inverted): 3 to -1 → 0-100 (lower Sharpe = higher risk)
  if (metrics.sharpeRatio != null) {
    const sharpeScore = Math.min(100, Math.max(0, ((3 - metrics.sharpeRatio) / 4) * 100));
    scores.push(sharpeScore);
  }

  // VaR Score: 0 to -0.10 → 0-100 (more negative = higher risk)
  if (metrics.var95 != null) {
    const varScore = Math.min(100, Math.max(0, (Math.abs(metrics.var95) / 0.10) * 100));
    scores.push(varScore);
  }

  if (scores.length === 0) return null;

  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

/**
 * Risk level interpretation
 */
export interface RiskInterpretation {
  level: 'very low' | 'low' | 'moderate' | 'high' | 'very high';
  score: number | null;
  summary: string;
  details: string[];
}

/**
 * Interpret risk metrics
 */
export function interpretRiskMetrics(metrics: RiskMetricsResult): RiskInterpretation {
  const score = calculateRiskScore(metrics);
  const details: string[] = [];

  // Beta interpretation
  if (metrics.beta != null) {
    if (metrics.beta < 0.5) {
      details.push(`Low beta (${metrics.beta.toFixed(2)}) - Less volatile than market`);
    } else if (metrics.beta < 1) {
      details.push(`Moderate beta (${metrics.beta.toFixed(2)}) - Slightly less volatile than market`);
    } else if (metrics.beta < 1.5) {
      details.push(`Elevated beta (${metrics.beta.toFixed(2)}) - More volatile than market`);
    } else {
      details.push(`High beta (${metrics.beta.toFixed(2)}) - Significantly more volatile than market`);
    }
  }

  // Sharpe interpretation
  if (metrics.sharpeRatio != null) {
    if (metrics.sharpeRatio > 2) {
      details.push(`Excellent risk-adjusted return (Sharpe: ${metrics.sharpeRatio.toFixed(2)})`);
    } else if (metrics.sharpeRatio > 1) {
      details.push(`Good risk-adjusted return (Sharpe: ${metrics.sharpeRatio.toFixed(2)})`);
    } else if (metrics.sharpeRatio > 0) {
      details.push(`Acceptable risk-adjusted return (Sharpe: ${metrics.sharpeRatio.toFixed(2)})`);
    } else {
      details.push(`Poor risk-adjusted return (Sharpe: ${metrics.sharpeRatio.toFixed(2)})`);
    }
  }

  // Max drawdown interpretation
  if (metrics.maxDrawdown != null) {
    const ddPct = (Math.abs(metrics.maxDrawdown) * 100).toFixed(1);
    if (Math.abs(metrics.maxDrawdown) < 0.10) {
      details.push(`Low maximum drawdown (${ddPct}%)`);
    } else if (Math.abs(metrics.maxDrawdown) < 0.25) {
      details.push(`Moderate maximum drawdown (${ddPct}%)`);
    } else if (Math.abs(metrics.maxDrawdown) < 0.40) {
      details.push(`High maximum drawdown (${ddPct}%)`);
    } else {
      details.push(`Very high maximum drawdown (${ddPct}%)`);
    }
  }

  // Determine risk level from score
  let level: 'very low' | 'low' | 'moderate' | 'high' | 'very high';
  let summary: string;

  if (score == null) {
    level = 'moderate';
    summary = 'Insufficient data to calculate risk metrics';
  } else if (score < 20) {
    level = 'very low';
    summary = 'Very low risk profile - Conservative investment';
  } else if (score < 40) {
    level = 'low';
    summary = 'Low risk profile - Below average volatility';
  } else if (score < 60) {
    level = 'moderate';
    summary = 'Moderate risk profile - Average market volatility';
  } else if (score < 80) {
    level = 'high';
    summary = 'High risk profile - Above average volatility';
  } else {
    level = 'very high';
    summary = 'Very high risk profile - Speculative investment';
  }

  return {
    level,
    score,
    summary,
    details,
  };
}
