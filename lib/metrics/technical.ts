/**
 * Deep Terminal - Technical Indicators
 *
 * Calculate 8 technical indicators from price history data
 * Based on data-sources.md specification (lines 224-234)
 *
 * Indicators:
 * 1. RSI (Relative Strength Index)
 * 2. MACD
 * 3. MACD Signal
 * 4. 50 Day MA
 * 5. 200 Day MA
 * 6. Bollinger Bands (Upper/Lower)
 * 7. Trading Volume
 * 8. Relative Volume
 */

import type { YahooFinanceData, TechnicalMetrics } from './types';
import { mean, standardDeviation, safeDivide } from './helpers';

// ============================================================================
// TECHNICAL METRICS CALCULATION
// ============================================================================

/**
 * Calculate all 8 technical indicators from Yahoo Finance data
 *
 * @param data - Raw financial data from Yahoo Finance (with price history)
 * @returns TechnicalMetrics object with all indicators
 */
export function calculateTechnical(data: YahooFinanceData): TechnicalMetrics {
  const closePrices = extractClosePrices(data.priceHistory);
  const volumes = extractVolumes(data.priceHistory);

  const macdResult = calculateMACDFull(closePrices);
  const bollingerResult = calculateBollingerBandsFull(closePrices);

  return {
    rsi: calculateRSI14(closePrices),
    macd: macdResult.macd,
    macdSignal: macdResult.signal,
    fiftyDayMA: calculateSMA(closePrices, 50),
    twoHundredDayMA: calculateSMA(closePrices, 200),
    bollingerUpper: bollingerResult.upper,
    bollingerLower: bollingerResult.lower,
    relativeVolume: calculateRelativeVolume(data.volume, data.averageVolume),
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract closing prices from price history
 */
function extractClosePrices(
  priceHistory: YahooFinanceData['priceHistory']
): number[] {
  if (!priceHistory || priceHistory.length === 0) return [];
  return priceHistory.map((p) => p.close);
}

/**
 * Extract volumes from price history
 */
function extractVolumes(
  priceHistory: YahooFinanceData['priceHistory']
): number[] {
  if (!priceHistory || priceHistory.length === 0) return [];
  return priceHistory.map((p) => p.volume);
}

// ============================================================================
// MOVING AVERAGES
// ============================================================================

/**
 * Calculate Simple Moving Average (SMA)
 *
 * SMA = Sum of prices over period / Period
 *
 * @param prices - Array of closing prices (oldest to newest)
 * @param period - Number of periods
 * @returns SMA value or null if insufficient data
 */
export function calculateSMA(prices: number[], period: number): number | null {
  if (!prices || prices.length < period) return null;
  const relevantPrices = prices.slice(-period);
  return mean(relevantPrices);
}

/**
 * Calculate Exponential Moving Average (EMA)
 *
 * EMA = Price(t) × k + EMA(y) × (1-k)
 * where k = 2/(N+1) and N is the number of periods
 *
 * @param prices - Array of closing prices (oldest to newest)
 * @param period - Number of periods
 * @returns EMA value or null if insufficient data
 */
export function calculateEMA(prices: number[], period: number): number | null {
  if (!prices || prices.length < period) return null;

  const k = 2 / (period + 1);

  // Initialize EMA with SMA of first 'period' prices
  let ema = mean(prices.slice(0, period));
  if (ema == null) return null;

  // Calculate EMA for remaining prices
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }

  return ema;
}

/**
 * Calculate EMA series for all values (needed for MACD signal line)
 *
 * @param prices - Array of values
 * @param period - Number of periods
 * @returns Array of EMA values
 */
export function calculateEMASeries(
  prices: number[],
  period: number
): number[] {
  if (!prices || prices.length < period) return [];

  const k = 2 / (period + 1);
  const emaSeries: number[] = [];

  // First EMA is SMA of first 'period' prices
  let ema = mean(prices.slice(0, period));
  if (ema == null) return [];

  // Fill initial values with null equivalent
  for (let i = 0; i < period - 1; i++) {
    emaSeries.push(NaN);
  }
  emaSeries.push(ema);

  // Calculate EMA for remaining prices
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
    emaSeries.push(ema);
  }

  return emaSeries;
}

// ============================================================================
// RSI (RELATIVE STRENGTH INDEX)
// ============================================================================

/**
 * Calculate RSI (Relative Strength Index) with 14-day period
 *
 * RSI = 100 - (100 / (1 + RS))
 * where RS = Average Gain / Average Loss over 14 periods
 *
 * Using Wilder's smoothing method:
 * - First average: Simple average of first 14 periods
 * - Subsequent: ((prev_avg × 13) + current_value) / 14
 *
 * @param prices - Array of closing prices (oldest to newest, needs 200+ for accurate calculation)
 * @returns RSI value (0-100) or null if insufficient data
 */
export function calculateRSI14(prices: number[]): number | null {
  const period = 14;

  if (!prices || prices.length < period + 1) return null;

  // Calculate price changes
  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  // Calculate initial average gain and loss (first 14 periods)
  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) {
      avgGain += changes[i];
    } else {
      avgLoss += Math.abs(changes[i]);
    }
  }

  avgGain /= period;
  avgLoss /= period;

  // Use Wilder's smoothing for subsequent values
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];

    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
    }
  }

  // Calculate RSI
  if (avgLoss === 0) return 100; // All gains, no losses

  const rs = avgGain / avgLoss;
  const rsi = 100 - 100 / (1 + rs);

  return isFinite(rsi) ? rsi : null;
}

/**
 * Calculate RSI with custom period
 *
 * @param prices - Array of closing prices
 * @param period - RSI period (default 14)
 * @returns RSI value (0-100) or null if insufficient data
 */
export function calculateRSI(
  prices: number[],
  period: number = 14
): number | null {
  if (!prices || prices.length < period + 1) return null;

  const changes: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    changes.push(prices[i] - prices[i - 1]);
  }

  let avgGain = 0;
  let avgLoss = 0;

  for (let i = 0; i < period; i++) {
    if (changes[i] > 0) avgGain += changes[i];
    else avgLoss += Math.abs(changes[i]);
  }

  avgGain /= period;
  avgLoss /= period;

  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    if (change > 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) + Math.abs(change)) / period;
    }
  }

  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

// ============================================================================
// MACD (MOVING AVERAGE CONVERGENCE DIVERGENCE)
// ============================================================================

/**
 * Calculate MACD with Signal Line and Histogram
 *
 * MACD = 12-day EMA - 26-day EMA
 * Signal Line = 9-day EMA of MACD
 * Histogram = MACD - Signal
 *
 * @param prices - Array of closing prices (oldest to newest, needs 35+ days)
 * @returns Object containing MACD, signal, and histogram values
 */
export function calculateMACDFull(prices: number[]): {
  macd: number | null;
  signal: number | null;
  histogram: number | null;
} {
  const fastPeriod = 12;
  const slowPeriod = 26;
  const signalPeriod = 9;

  // Need at least slowPeriod + signalPeriod - 1 data points for accurate signal
  if (!prices || prices.length < slowPeriod + signalPeriod - 1) {
    return { macd: null, signal: null, histogram: null };
  }

  // Calculate 12-day EMA series
  const ema12Series = calculateEMASeries(prices, fastPeriod);

  // Calculate 26-day EMA series
  const ema26Series = calculateEMASeries(prices, slowPeriod);

  // Calculate MACD series (12 EMA - 26 EMA)
  const macdSeries: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (isNaN(ema12Series[i]) || isNaN(ema26Series[i])) {
      macdSeries.push(NaN);
    } else {
      macdSeries.push(ema12Series[i] - ema26Series[i]);
    }
  }

  // Filter out NaN values for signal calculation
  const validMacdValues = macdSeries.filter((v) => !isNaN(v));

  if (validMacdValues.length < signalPeriod) {
    const macd = validMacdValues.length > 0
      ? validMacdValues[validMacdValues.length - 1]
      : null;
    return { macd, signal: null, histogram: null };
  }

  // Calculate 9-day EMA of MACD (signal line)
  const signal = calculateEMA(validMacdValues, signalPeriod);

  // Current MACD value
  const macd = validMacdValues[validMacdValues.length - 1];

  // Histogram = MACD - Signal
  const histogram = macd != null && signal != null ? macd - signal : null;

  return { macd, signal, histogram };
}

/**
 * Calculate simple MACD (without signal line)
 *
 * @param prices - Array of closing prices
 * @returns MACD value or null
 */
export function calculateMACD(prices: number[]): number | null {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);

  if (ema12 == null || ema26 == null) return null;
  return ema12 - ema26;
}

// ============================================================================
// BOLLINGER BANDS
// ============================================================================

/**
 * Calculate Bollinger Bands
 *
 * Middle Band = 20-day SMA
 * Upper Band = Middle Band + (2 × Standard Deviation)
 * Lower Band = Middle Band - (2 × Standard Deviation)
 *
 * @param prices - Array of closing prices (oldest to newest)
 * @param period - SMA period (default 20)
 * @param stdDevMultiplier - Standard deviation multiplier (default 2)
 * @returns Object containing upper, middle, and lower band values
 */
export function calculateBollingerBandsFull(
  prices: number[],
  period: number = 20,
  stdDevMultiplier: number = 2
): { upper: number | null; middle: number | null; lower: number | null } {
  if (!prices || prices.length < period) {
    return { upper: null, middle: null, lower: null };
  }

  // Middle band = 20-day SMA
  const recentPrices = prices.slice(-period);
  const middle = mean(recentPrices);

  if (middle == null) {
    return { upper: null, middle: null, lower: null };
  }

  // Calculate standard deviation of recent prices
  const stdDev = standardDeviation(recentPrices);

  if (stdDev == null) {
    return { upper: null, middle, lower: null };
  }

  // Upper and lower bands
  const upper = middle + stdDev * stdDevMultiplier;
  const lower = middle - stdDev * stdDevMultiplier;

  return { upper, middle, lower };
}

/**
 * Calculate Bollinger Band Width
 *
 * BBW = (Upper Band - Lower Band) / Middle Band
 *
 * @param prices - Array of closing prices
 * @returns Bollinger Band Width or null
 */
export function calculateBollingerBandWidth(prices: number[]): number | null {
  const bands = calculateBollingerBandsFull(prices);

  if (bands.upper == null || bands.lower == null || bands.middle == null) {
    return null;
  }

  return (bands.upper - bands.lower) / bands.middle;
}

/**
 * Calculate %B (Bollinger Band Position)
 *
 * %B = (Price - Lower Band) / (Upper Band - Lower Band)
 *
 * @param currentPrice - Current stock price
 * @param prices - Array of closing prices
 * @returns %B value or null
 */
export function calculateBollingerPercentB(
  currentPrice: number,
  prices: number[]
): number | null {
  const bands = calculateBollingerBandsFull(prices);

  if (bands.upper == null || bands.lower == null) {
    return null;
  }

  const bandWidth = bands.upper - bands.lower;
  if (bandWidth === 0) return null;

  return (currentPrice - bands.lower) / bandWidth;
}

// ============================================================================
// VOLUME INDICATORS
// ============================================================================

/**
 * Calculate Relative Volume
 *
 * Relative Volume = Current Volume / Average Volume
 *
 * @param currentVolume - Current trading volume
 * @param averageVolume - Average trading volume
 * @returns Relative volume ratio or null
 */
export function calculateRelativeVolume(
  currentVolume: number | null | undefined,
  averageVolume: number | null | undefined
): number | null {
  return safeDivide(currentVolume ?? null, averageVolume ?? null);
}

/**
 * Calculate Volume Moving Average
 *
 * @param volumes - Array of volume data
 * @param period - Number of periods
 * @returns Volume MA or null
 */
export function calculateVolumeMA(
  volumes: number[],
  period: number = 20
): number | null {
  if (!volumes || volumes.length < period) return null;
  return mean(volumes.slice(-period));
}

/**
 * Calculate On-Balance Volume (OBV)
 *
 * OBV adds volume on up days and subtracts volume on down days
 *
 * @param prices - Array of closing prices
 * @param volumes - Array of volumes
 * @returns Current OBV value or null
 */
export function calculateOBV(
  prices: number[],
  volumes: number[]
): number | null {
  if (
    !prices ||
    !volumes ||
    prices.length < 2 ||
    prices.length !== volumes.length
  ) {
    return null;
  }

  let obv = 0;

  for (let i = 1; i < prices.length; i++) {
    if (prices[i] > prices[i - 1]) {
      obv += volumes[i];
    } else if (prices[i] < prices[i - 1]) {
      obv -= volumes[i];
    }
    // If prices are equal, OBV stays the same
  }

  return obv;
}

// ============================================================================
// ADDITIONAL TECHNICAL INDICATORS
// ============================================================================

/**
 * Calculate Average True Range (ATR)
 *
 * @param priceHistory - Array of OHLC price data
 * @param period - Number of periods (default 14)
 * @returns ATR value or null
 */
export function calculateATR(
  priceHistory: YahooFinanceData['priceHistory'],
  period: number = 14
): number | null {
  if (!priceHistory || priceHistory.length < period + 1) return null;

  // Calculate True Range for each day
  const trueRanges: number[] = [];

  for (let i = 1; i < priceHistory.length; i++) {
    const current = priceHistory[i];
    const previousClose = priceHistory[i - 1].close;

    const tr = Math.max(
      current.high - current.low,
      Math.abs(current.high - previousClose),
      Math.abs(current.low - previousClose)
    );

    trueRanges.push(tr);
  }

  // Calculate ATR using SMA of True Ranges
  return mean(trueRanges.slice(-period));
}

/**
 * Calculate Stochastic Oscillator
 *
 * %K = (Current Close - Lowest Low) / (Highest High - Lowest Low) × 100
 *
 * @param priceHistory - Array of OHLC price data
 * @param period - Number of periods (default 14)
 * @returns %K value or null
 */
export function calculateStochastic(
  priceHistory: YahooFinanceData['priceHistory'],
  period: number = 14
): number | null {
  if (!priceHistory || priceHistory.length < period) return null;

  const recentData = priceHistory.slice(-period);
  const currentClose = priceHistory[priceHistory.length - 1].close;

  const lowestLow = Math.min(...recentData.map((d) => d.low));
  const highestHigh = Math.max(...recentData.map((d) => d.high));

  const range = highestHigh - lowestLow;
  if (range === 0) return 50; // Neutral if no range

  return ((currentClose - lowestLow) / range) * 100;
}

/**
 * Calculate Williams %R
 *
 * %R = (Highest High - Current Close) / (Highest High - Lowest Low) × -100
 *
 * @param priceHistory - Array of OHLC price data
 * @param period - Number of periods (default 14)
 * @returns Williams %R value or null
 */
export function calculateWilliamsR(
  priceHistory: YahooFinanceData['priceHistory'],
  period: number = 14
): number | null {
  if (!priceHistory || priceHistory.length < period) return null;

  const recentData = priceHistory.slice(-period);
  const currentClose = priceHistory[priceHistory.length - 1].close;

  const lowestLow = Math.min(...recentData.map((d) => d.low));
  const highestHigh = Math.max(...recentData.map((d) => d.high));

  const range = highestHigh - lowestLow;
  if (range === 0) return -50; // Neutral if no range

  return ((highestHigh - currentClose) / range) * -100;
}

/**
 * Calculate Money Flow Index (MFI)
 *
 * Similar to RSI but incorporates volume
 *
 * @param priceHistory - Array of OHLC price data with volume
 * @param period - Number of periods (default 14)
 * @returns MFI value (0-100) or null
 */
export function calculateMFI(
  priceHistory: YahooFinanceData['priceHistory'],
  period: number = 14
): number | null {
  if (!priceHistory || priceHistory.length < period + 1) return null;

  let positiveFlow = 0;
  let negativeFlow = 0;

  for (let i = 1; i <= period; i++) {
    const idx = priceHistory.length - period - 1 + i;
    const current = priceHistory[idx];
    const previous = priceHistory[idx - 1];

    // Typical Price = (High + Low + Close) / 3
    const typicalPrice = (current.high + current.low + current.close) / 3;
    const previousTypical =
      (previous.high + previous.low + previous.close) / 3;

    // Raw Money Flow = Typical Price × Volume
    const rawFlow = typicalPrice * current.volume;

    if (typicalPrice > previousTypical) {
      positiveFlow += rawFlow;
    } else {
      negativeFlow += rawFlow;
    }
  }

  if (negativeFlow === 0) return 100;

  const moneyRatio = positiveFlow / negativeFlow;
  return 100 - 100 / (1 + moneyRatio);
}

// ============================================================================
// INTERPRETATION HELPERS
// ============================================================================

/**
 * Interpret RSI value
 */
export function interpretRSI(rsi: number | null): string {
  if (rsi == null) return 'Unknown';
  if (rsi >= 70) return 'Overbought';
  if (rsi <= 30) return 'Oversold';
  if (rsi >= 60) return 'Bullish';
  if (rsi <= 40) return 'Bearish';
  return 'Neutral';
}

/**
 * Interpret MACD
 */
export function interpretMACD(
  macd: number | null,
  signal: number | null
): string {
  if (macd == null) return 'Unknown';
  if (signal == null) return macd > 0 ? 'Bullish' : 'Bearish';

  if (macd > signal && macd > 0) return 'Strong Bullish';
  if (macd > signal) return 'Bullish Crossover';
  if (macd < signal && macd < 0) return 'Strong Bearish';
  if (macd < signal) return 'Bearish Crossover';
  return 'Neutral';
}

/**
 * Interpret Bollinger Band position
 */
export function interpretBollingerPosition(
  price: number,
  upper: number | null,
  lower: number | null
): string {
  if (upper == null || lower == null) return 'Unknown';

  if (price >= upper) return 'Overbought (above upper band)';
  if (price <= lower) return 'Oversold (below lower band)';

  const middle = (upper + lower) / 2;
  if (price > middle) return 'Above middle band';
  return 'Below middle band';
}

/**
 * Interpret Relative Volume
 */
export function interpretRelativeVolume(relVol: number | null): string {
  if (relVol == null) return 'Unknown';
  if (relVol >= 2) return 'Very High Volume';
  if (relVol >= 1.5) return 'High Volume';
  if (relVol >= 0.7) return 'Normal Volume';
  if (relVol >= 0.5) return 'Low Volume';
  return 'Very Low Volume';
}

// ============================================================================
// EXPORTS
// ============================================================================

export const technicalIndicators = {
  // Core functions
  calculateTechnical,
  extractClosePrices,
  extractVolumes,

  // Moving Averages
  calculateSMA,
  calculateEMA,
  calculateEMASeries,

  // RSI
  calculateRSI,
  calculateRSI14,

  // MACD
  calculateMACD,
  calculateMACDFull,

  // Bollinger Bands
  calculateBollingerBandsFull,
  calculateBollingerBandWidth,
  calculateBollingerPercentB,

  // Volume
  calculateRelativeVolume,
  calculateVolumeMA,
  calculateOBV,

  // Additional Indicators
  calculateATR,
  calculateStochastic,
  calculateWilliamsR,
  calculateMFI,

  // Interpretation
  interpretRSI,
  interpretMACD,
  interpretBollingerPosition,
  interpretRelativeVolume,
};
