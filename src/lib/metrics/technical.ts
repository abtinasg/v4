import type { MetricCalculator, StockData, MetricInterpretation } from './types'

/**
 * Technical Analysis Metrics
 * Indicators based on price and volume data
 */

// Helper: Calculate Simple Moving Average
function calculateSMA(prices: number[], period: number): number | null {
  if (!prices || prices.length < period) return null
  const slice = prices.slice(-period)
  return slice.reduce((sum, p) => sum + p, 0) / period
}

// Helper: Calculate Exponential Moving Average
function calculateEMA(prices: number[], period: number): number | null {
  if (!prices || prices.length < period) return null
  
  const k = 2 / (period + 1)
  let ema = prices.slice(0, period).reduce((sum, p) => sum + p, 0) / period
  
  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k)
  }
  
  return ema
}

// 52-Week High/Low Position
export const fiftyTwoWeekPosition: MetricCalculator = {
  id: '52_week_position',
  name: '52-Week Range Position',
  shortName: '52W Pos',
  category: 'technical',
  calculate: (data: StockData) => {
    if (!data.currentPrice || !data.high52Week || !data.low52Week) return null
    if (data.high52Week === data.low52Week) return 50
    return ((data.currentPrice - data.low52Week) / (data.high52Week - data.low52Week)) * 100
  },
  format: (value: number) => `${value.toFixed(1)}%`,
  formatType: 'percentage',
  description: 'Current price position within 52-week range (0% = low, 100% = high).',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 20) return 'good' // Near 52-week low (potential value)
    if (value > 90) return 'bad' // Near 52-week high (extended)
    return 'neutral'
  },
  benchmark: { good: 30, bad: 90, higherIsBetter: false },
  dependencies: ['currentPrice', 'high52Week', 'low52Week'],
}

// Distance from 52-Week High
export const distanceFrom52WeekHigh: MetricCalculator = {
  id: 'distance_52w_high',
  name: 'Distance from 52-Week High',
  shortName: 'From High',
  category: 'technical',
  calculate: (data: StockData) => {
    if (!data.currentPrice || !data.high52Week || data.high52Week === 0) return null
    return ((data.currentPrice - data.high52Week) / data.high52Week) * 100
  },
  format: (value: number) => `${value.toFixed(2)}%`,
  formatType: 'percentage',
  description: 'Percentage below 52-week high.',
  interpretation: (value: number): MetricInterpretation => {
    if (value > -5) return 'neutral' // Near highs
    if (value < -30) return 'good' // Significant pullback (potential opportunity)
    return 'neutral'
  },
  dependencies: ['currentPrice', 'high52Week'],
}

// Simple Moving Average (20-day)
export const sma20: MetricCalculator = {
  id: 'sma_20',
  name: '20-Day SMA',
  shortName: 'SMA20',
  category: 'technical',
  calculate: (data: StockData) => {
    return calculateSMA(data.priceHistory || [], 20)
  },
  format: (value: number) => `$${value.toFixed(2)}`,
  formatType: 'currency',
  description: '20-day simple moving average of closing prices.',
  interpretation: (value: number, data?: StockData): MetricInterpretation => {
    if (!data?.currentPrice) return 'neutral'
    if (data.currentPrice > value * 1.02) return 'good' // Above SMA
    if (data.currentPrice < value * 0.98) return 'bad' // Below SMA
    return 'neutral'
  },
  dependencies: ['priceHistory'],
}

// Simple Moving Average (50-day)
export const sma50: MetricCalculator = {
  id: 'sma_50',
  name: '50-Day SMA',
  shortName: 'SMA50',
  category: 'technical',
  calculate: (data: StockData) => {
    return calculateSMA(data.priceHistory || [], 50)
  },
  format: (value: number) => `$${value.toFixed(2)}`,
  formatType: 'currency',
  description: '50-day simple moving average. Key trend indicator.',
  interpretation: (value: number, data?: StockData): MetricInterpretation => {
    if (!data?.currentPrice) return 'neutral'
    if (data.currentPrice > value * 1.02) return 'good'
    if (data.currentPrice < value * 0.98) return 'bad'
    return 'neutral'
  },
  dependencies: ['priceHistory'],
}

// Simple Moving Average (200-day)
export const sma200: MetricCalculator = {
  id: 'sma_200',
  name: '200-Day SMA',
  shortName: 'SMA200',
  category: 'technical',
  calculate: (data: StockData) => {
    return calculateSMA(data.priceHistory || [], 200)
  },
  format: (value: number) => `$${value.toFixed(2)}`,
  formatType: 'currency',
  description: '200-day simple moving average. Major trend indicator.',
  interpretation: (value: number, data?: StockData): MetricInterpretation => {
    if (!data?.currentPrice) return 'neutral'
    if (data.currentPrice > value * 1.05) return 'good'
    if (data.currentPrice < value * 0.95) return 'bad'
    return 'neutral'
  },
  dependencies: ['priceHistory'],
}

// RSI (Relative Strength Index)
export const rsi14: MetricCalculator = {
  id: 'rsi_14',
  name: 'RSI (14-day)',
  shortName: 'RSI',
  category: 'technical',
  calculate: (data: StockData) => {
    const prices = data.priceHistory
    if (!prices || prices.length < 15) return null
    
    let gains = 0
    let losses = 0
    
    // Calculate initial average gain/loss
    for (let i = 1; i <= 14; i++) {
      const change = prices[i] - prices[i - 1]
      if (change > 0) gains += change
      else losses += Math.abs(change)
    }
    
    let avgGain = gains / 14
    let avgLoss = losses / 14
    
    // Calculate RSI using smoothed averages
    for (let i = 15; i < prices.length; i++) {
      const change = prices[i] - prices[i - 1]
      if (change > 0) {
        avgGain = (avgGain * 13 + change) / 14
        avgLoss = (avgLoss * 13) / 14
      } else {
        avgGain = (avgGain * 13) / 14
        avgLoss = (avgLoss * 13 + Math.abs(change)) / 14
      }
    }
    
    if (avgLoss === 0) return 100
    const rs = avgGain / avgLoss
    return 100 - (100 / (1 + rs))
  },
  format: (value: number) => `${value.toFixed(1)}`,
  formatType: 'number',
  description: 'Momentum indicator (0-100). Above 70 = overbought, below 30 = oversold.',
  interpretation: (value: number): MetricInterpretation => {
    if (value < 30) return 'good' // Oversold (potential buy)
    if (value > 70) return 'bad' // Overbought (potential sell)
    return 'neutral'
  },
  benchmark: { good: 30, bad: 70, higherIsBetter: false },
  dependencies: ['priceHistory'],
}

// MACD
export const macd: MetricCalculator = {
  id: 'macd',
  name: 'MACD',
  shortName: 'MACD',
  category: 'technical',
  calculate: (data: StockData) => {
    const prices = data.priceHistory
    if (!prices || prices.length < 26) return null
    
    const ema12 = calculateEMA(prices, 12)
    const ema26 = calculateEMA(prices, 26)
    
    if (ema12 === null || ema26 === null) return null
    return ema12 - ema26
  },
  format: (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}`,
  formatType: 'number',
  description: 'Moving Average Convergence Divergence. Positive = bullish momentum.',
  interpretation: (value: number): MetricInterpretation => {
    if (value > 0) return 'good' // Bullish
    if (value < 0) return 'bad' // Bearish
    return 'neutral'
  },
  dependencies: ['priceHistory'],
}

// Daily Price Change
export const dailyChange: MetricCalculator = {
  id: 'daily_change',
  name: 'Daily Change',
  shortName: 'Day Chg',
  category: 'technical',
  calculate: (data: StockData) => {
    if (!data.currentPrice || !data.previousClose || data.previousClose === 0) return null
    return ((data.currentPrice - data.previousClose) / data.previousClose) * 100
  },
  format: (value: number) => `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`,
  formatType: 'percentage',
  description: 'Price change from previous close.',
  interpretation: (value: number): MetricInterpretation => {
    if (value > 3) return 'good'
    if (value < -3) return 'bad'
    return 'neutral'
  },
  dependencies: ['currentPrice', 'previousClose'],
}

// Export all technical metrics
export const technicalMetrics: MetricCalculator[] = [
  fiftyTwoWeekPosition,
  distanceFrom52WeekHigh,
  sma20,
  sma50,
  sma200,
  rsi14,
  macd,
  dailyChange,
]
