/**
 * Deep Terminal - Metrics Calculation Helpers
 *
 * Utility functions for safe calculations, statistics, and technical indicators
 */

// ============================================================================
// SAFE MATH OPERATIONS
// ============================================================================

/**
 * Safe division - returns null if denominator is 0 or null
 */
export function safeDivide(
  numerator: number | null | undefined,
  denominator: number | null | undefined
): number | null {
  if (
    numerator == null ||
    denominator == null ||
    denominator === 0 ||
    !isFinite(numerator) ||
    !isFinite(denominator)
  ) {
    return null;
  }
  const result = numerator / denominator;
  return isFinite(result) ? result : null;
}

/**
 * Safe percentage calculation
 */
export function toPercentage(value: number | null): number | null {
  if (value == null || !isFinite(value)) return null;
  return value * 100;
}

/**
 * Calculate percentage change
 */
export function percentageChange(
  current: number | null | undefined,
  previous: number | null | undefined
): number | null {
  if (current == null || previous == null || previous === 0) {
    return null;
  }
  return safeDivide(current - previous, previous);
}

/**
 * Safe multiplication
 */
export function safeMultiply(
  ...values: (number | null | undefined)[]
): number | null {
  if (values.some((v) => v == null)) return null;
  const result = values.reduce<number>((acc, val) => acc * (val as number), 1);
  return isFinite(result) ? result : null;
}

/**
 * Safe addition
 */
export function safeAdd(
  ...values: (number | null | undefined)[]
): number | null {
  const filtered = values.filter((v) => v != null) as number[];
  if (filtered.length === 0) return null;
  const result = filtered.reduce((acc, val) => acc + val, 0);
  return isFinite(result) ? result : null;
}

/**
 * Safe subtraction
 */
export function safeSubtract(
  a: number | null | undefined,
  b: number | null | undefined
): number | null {
  if (a == null || b == null) return null;
  const result = a - b;
  return isFinite(result) ? result : null;
}

// ============================================================================
// GROWTH CALCULATIONS
// ============================================================================

/**
 * Calculate Compound Annual Growth Rate (CAGR)
 */
export function calculateCAGR(
  endValue: number,
  startValue: number,
  years: number
): number | null {
  if (
    startValue <= 0 ||
    endValue <= 0 ||
    years <= 0 ||
    !isFinite(startValue) ||
    !isFinite(endValue)
  ) {
    return null;
  }

  const cagr = Math.pow(endValue / startValue, 1 / years) - 1;
  return isFinite(cagr) ? cagr : null;
}

/**
 * Calculate Year-over-Year growth from array of values
 */
export function calculateYoYGrowth(
  values: (number | null)[]
): (number | null)[] {
  if (values.length < 2) return [];

  const growth: (number | null)[] = [null]; // First year has no YoY
  for (let i = 1; i < values.length; i++) {
    growth.push(percentageChange(values[i], values[i - 1]));
  }

  return growth;
}

// ============================================================================
// STATISTICAL FUNCTIONS
// ============================================================================

/**
 * Calculate mean (average) of an array
 */
export function mean(values: number[]): number | null {
  if (values.length === 0) return null;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
}

/**
 * Calculate standard deviation
 */
export function standardDeviation(values: number[]): number | null {
  if (values.length < 2) return null;

  const avg = mean(values);
  if (avg == null) return null;

  const squaredDiffs = values.map((val) => Math.pow(val - avg, 2));
  const avgSquaredDiff = mean(squaredDiffs);
  if (avgSquaredDiff == null) return null;

  return Math.sqrt(avgSquaredDiff);
}

/**
 * Calculate variance
 */
export function variance(values: number[]): number | null {
  if (values.length < 2) return null;

  const avg = mean(values);
  if (avg == null) return null;

  const squaredDiffs = values.map((val) => Math.pow(val - avg, 2));
  return mean(squaredDiffs);
}

/**
 * Calculate covariance between two arrays
 */
export function covariance(x: number[], y: number[]): number | null {
  if (x.length !== y.length || x.length < 2) return null;

  const meanX = mean(x);
  const meanY = mean(y);
  if (meanX == null || meanY == null) return null;

  let sum = 0;
  for (let i = 0; i < x.length; i++) {
    sum += (x[i] - meanX) * (y[i] - meanY);
  }

  return sum / (x.length - 1);
}

/**
 * Calculate correlation coefficient
 */
export function correlation(x: number[], y: number[]): number | null {
  const cov = covariance(x, y);
  const stdX = standardDeviation(x);
  const stdY = standardDeviation(y);

  return safeDivide(cov, safeMultiply(stdX, stdY));
}

/**
 * Calculate downside deviation (for Sortino ratio)
 */
export function downsideDeviation(
  returns: number[],
  targetReturn: number = 0
): number | null {
  if (returns.length < 2) return null;

  const downsideReturns = returns.filter((r) => r < targetReturn);
  if (downsideReturns.length === 0) return 0;

  const squaredDeviations = downsideReturns.map((r) =>
    Math.pow(r - targetReturn, 2)
  );
  const avgSquaredDev = mean(squaredDeviations);
  if (avgSquaredDev == null) return null;

  return Math.sqrt(avgSquaredDev);
}

// ============================================================================
// TECHNICAL INDICATORS
// ============================================================================

/**
 * Calculate Simple Moving Average (SMA)
 */
export function calculateSMA(prices: number[], period: number): number | null {
  if (prices.length < period) return null;
  const relevantPrices = prices.slice(-period);
  return mean(relevantPrices);
}

/**
 * Calculate Exponential Moving Average (EMA)
 */
export function calculateEMA(
  prices: number[],
  period: number
): number | null {
  if (prices.length < period) return null;

  const multiplier = 2 / (period + 1);
  let ema = mean(prices.slice(0, period));
  if (ema == null) return null;

  for (let i = period; i < prices.length; i++) {
    ema = (prices[i] - ema) * multiplier + ema;
  }

  return ema;
}

/**
 * Calculate RSI (Relative Strength Index)
 */
export function calculateRSI(prices: number[], period: number = 14): number | null {
  if (prices.length < period + 1) return null;

  // Calculate price changes
  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  // Separate gains and losses
  const gains = changes.map((change) => (change > 0 ? change : 0));
  const losses = changes.map((change) => (change < 0 ? -change : 0));

  // Calculate average gain and loss
  const avgGain = mean(gains.slice(-period));
  const avgLoss = mean(losses.slice(-period));

  if (avgGain == null || avgLoss == null || avgLoss === 0) {
    return avgLoss === 0 ? 100 : null;
  }

  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return isFinite(rsi) ? rsi : null;
}

/**
 * Calculate MACD (Moving Average Convergence Divergence)
 */
export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number | null; signal: number | null; histogram: number | null } {
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);

  if (fastEMA == null || slowEMA == null) {
    return { macd: null, signal: null, histogram: null };
  }

  const macd = fastEMA - slowEMA;

  // For signal line, we need to calculate EMA of MACD values
  // Simplified: just return MACD for now
  // Full implementation would require storing MACD history
  const signal = null; // Would need MACD history
  const histogram = null;

  return { macd, signal, histogram };
}

/**
 * Calculate Bollinger Bands
 */
export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): { upper: number | null; middle: number | null; lower: number | null } {
  const sma = calculateSMA(prices, period);
  const recentPrices = prices.slice(-period);
  const stdDev = standardDeviation(recentPrices);

  if (sma == null || stdDev == null) {
    return { upper: null, middle: null, lower: null };
  }

  return {
    upper: sma + stdDev * stdDevMultiplier,
    middle: sma,
    lower: sma - stdDev * stdDevMultiplier,
  };
}

/**
 * Calculate Maximum Drawdown
 */
export function calculateMaxDrawdown(prices: number[]): number | null {
  if (prices.length < 2) return null;

  let maxDrawdown = 0;
  let peak = prices[0];

  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > peak) {
      peak = prices[i];
    }

    const drawdown = (peak - prices[i]) / peak;
    if (drawdown > maxDrawdown) {
      maxDrawdown = drawdown;
    }
  }

  return maxDrawdown;
}

// ============================================================================
// FINANCIAL RATIOS HELPERS
// ============================================================================

/**
 * Calculate weighted average
 */
export function weightedAverage(
  values: number[],
  weights: number[]
): number | null {
  if (values.length !== weights.length || values.length === 0) return null;

  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  if (totalWeight === 0) return null;

  const weightedSum = values.reduce(
    (sum, val, i) => sum + val * weights[i],
    0
  );

  return weightedSum / totalWeight;
}

/**
 * Normalize value to 0-100 scale
 */
export function normalizeToScale(
  value: number,
  min: number,
  max: number
): number {
  if (max === min) return 50; // Middle value if no range
  const normalized = ((value - min) / (max - min)) * 100;
  return Math.max(0, Math.min(100, normalized)); // Clamp to 0-100
}

/**
 * Calculate percentile rank
 */
export function percentileRank(value: number, dataset: number[]): number {
  const sorted = [...dataset].sort((a, b) => a - b);
  const index = sorted.findIndex((v) => v >= value);

  if (index === -1) return 100;
  if (index === 0) return 0;

  return (index / sorted.length) * 100;
}

/**
 * Check if value is outlier (using IQR method)
 */
export function isOutlier(value: number, dataset: number[]): boolean {
  const sorted = [...dataset].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);

  const q1 = sorted[q1Index];
  const q3 = sorted[q3Index];
  const iqr = q3 - q1;

  const lowerBound = q1 - 1.5 * iqr;
  const upperBound = q3 + 1.5 * iqr;

  return value < lowerBound || value > upperBound;
}

// ============================================================================
// DATE HELPERS
// ============================================================================

/**
 * Calculate number of years between two dates
 */
export function yearsBetween(startDate: Date, endDate: Date): number {
  const msPerYear = 365.25 * 24 * 60 * 60 * 1000;
  return (endDate.getTime() - startDate.getTime()) / msPerYear;
}

/**
 * Check if date is within market hours (9:30 AM - 4:00 PM ET)
 */
export function isMarketHours(date: Date = new Date()): boolean {
  const hours = date.getHours();
  const day = date.getDay();

  // Weekend
  if (day === 0 || day === 6) return false;

  // Market hours: 9:30 AM - 4:00 PM (simplified)
  return hours >= 9 && hours < 16;
}

// ============================================================================
// VALIDATION HELPERS
// ============================================================================

/**
 * Validate that all required fields exist in an object
 */
export function hasRequiredFields<T extends object>(
  obj: Partial<T>,
  fields: (keyof T)[]
): boolean {
  return fields.every((field) => obj[field] != null);
}

/**
 * Remove null/undefined values from object
 */
export function removeNullValues<T extends object>(obj: T): Partial<T> {
  const result: Partial<T> = {};

  for (const key in obj) {
    if (obj[key] != null) {
      result[key] = obj[key];
    }
  }

  return result;
}

/**
 * Count non-null values in object
 */
export function countNonNullValues(obj: Record<string, any>): number {
  return Object.values(obj).filter((v) => v != null).length;
}

// ============================================================================
// FORMATTING HELPERS
// ============================================================================

/**
 * Format number to fixed decimal places
 */
export function formatNumber(
  value: number | null,
  decimals: number = 2
): string {
  if (value == null) return 'N/A';
  return value.toFixed(decimals);
}

/**
 * Format percentage
 */
export function formatPercentage(
  value: number | null,
  decimals: number = 2
): string {
  if (value == null) return 'N/A';
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format currency
 */
export function formatCurrency(
  value: number | null,
  currency: string = 'USD'
): string {
  if (value == null) return 'N/A';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Format large numbers (K, M, B, T)
 */
export function formatLargeNumber(value: number | null): string {
  if (value == null) return 'N/A';

  const absValue = Math.abs(value);
  const sign = value < 0 ? '-' : '';

  if (absValue >= 1e12) return `${sign}${(absValue / 1e12).toFixed(2)}T`;
  if (absValue >= 1e9) return `${sign}${(absValue / 1e9).toFixed(2)}B`;
  if (absValue >= 1e6) return `${sign}${(absValue / 1e6).toFixed(2)}M`;
  if (absValue >= 1e3) return `${sign}${(absValue / 1e3).toFixed(2)}K`;

  return `${sign}${absValue.toFixed(2)}`;
}
