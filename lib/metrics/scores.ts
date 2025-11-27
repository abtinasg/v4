/**
 * Deep Terminal - Quality/Scoring Metrics
 *
 * Calculate 6 composite scores (0-100 scale) from fundamental data
 * Based on data-sources.md specification (lines 236-244)
 *
 * Scores:
 * 1. Profitability Score - Weighted avg of margins, ROE, ROIC
 * 2. Growth Score - Weighted avg of growth rates
 * 3. Valuation Score - Inverse of P/E, P/B vs sector
 * 4. Risk Score - Inverse of beta, volatility
 * 5. Health Score - Liquidity + Solvency ratios
 * 6. Total Score - Weighted average of all scores
 */

import type {
  YahooFinanceData,
  ScoreMetrics,
  ProfitabilityMetrics,
  GrowthMetrics,
  LiquidityMetrics,
  LeverageMetrics,
  ValuationMetrics,
  RiskMetrics,
} from './types';
import {
  safeDivide,
  normalizeToScale,
  weightedAverage,
  mean,
} from './helpers';
import { calculateProfitability } from './profitability';
import { calculateGrowth } from './growth';
import { calculateLiquidity } from './liquidity';
import { calculateLeverage } from './leverage';

// ============================================================================
// SCORE WEIGHTS CONFIGURATION
// ============================================================================

/**
 * Profitability Score Weights (20% each)
 */
const PROFITABILITY_WEIGHTS = {
  grossMargin: 0.2,
  operatingMargin: 0.2,
  netMargin: 0.2,
  roe: 0.2,
  roic: 0.2,
};

/**
 * Growth Score Weights
 */
const GROWTH_WEIGHTS = {
  revenueGrowthYoY: 0.3,
  epsGrowthYoY: 0.3,
  fcfGrowth: 0.2,
  revenue3YearCAGR: 0.2,
};

/**
 * Valuation Score Weights
 */
const VALUATION_WEIGHTS = {
  pe: 0.3,
  pb: 0.25,
  peg: 0.25,
  evToEbitda: 0.2,
};

/**
 * Risk Score Weights
 */
const RISK_WEIGHTS = {
  beta: 0.35,
  volatility: 0.35,
  sharpeRatio: 0.3,
};

/**
 * Health Score Weights (25% each)
 */
const HEALTH_WEIGHTS = {
  currentRatio: 0.25,
  quickRatio: 0.25,
  debtToEquity: 0.25,
  interestCoverage: 0.25,
};

/**
 * Total Score Category Weights
 */
const TOTAL_SCORE_WEIGHTS = {
  profitability: 0.25,
  growth: 0.2,
  valuation: 0.2,
  risk: 0.15,
  health: 0.2,
};

// ============================================================================
// NORMALIZATION BENCHMARKS
// ============================================================================

/**
 * Benchmark ranges for normalizing metrics to 0-100 scale
 * Based on typical stock market ranges
 */
const BENCHMARKS = {
  // Profitability benchmarks (as decimals)
  grossMargin: { min: 0, max: 0.8, higherIsBetter: true },
  operatingMargin: { min: -0.2, max: 0.4, higherIsBetter: true },
  netMargin: { min: -0.2, max: 0.3, higherIsBetter: true },
  roe: { min: -0.1, max: 0.4, higherIsBetter: true },
  roic: { min: -0.1, max: 0.3, higherIsBetter: true },

  // Growth benchmarks (as decimals)
  revenueGrowthYoY: { min: -0.3, max: 0.5, higherIsBetter: true },
  epsGrowthYoY: { min: -0.5, max: 1.0, higherIsBetter: true },
  fcfGrowth: { min: -0.5, max: 0.5, higherIsBetter: true },
  revenue3YearCAGR: { min: -0.1, max: 0.3, higherIsBetter: true },

  // Valuation benchmarks (inverse - lower is better)
  pe: { min: 5, max: 50, higherIsBetter: false },
  pb: { min: 0.5, max: 10, higherIsBetter: false },
  peg: { min: 0.5, max: 3, higherIsBetter: false },
  evToEbitda: { min: 3, max: 25, higherIsBetter: false },

  // Risk benchmarks
  beta: { min: 0.5, max: 2.0, higherIsBetter: false },
  volatility: { min: 0.1, max: 0.6, higherIsBetter: false },
  sharpeRatio: { min: -0.5, max: 2.0, higherIsBetter: true },

  // Health benchmarks
  currentRatio: { min: 0.5, max: 3.0, higherIsBetter: true },
  quickRatio: { min: 0.3, max: 2.5, higherIsBetter: true },
  debtToEquity: { min: 0, max: 3.0, higherIsBetter: false },
  interestCoverage: { min: 0, max: 20, higherIsBetter: true },
};

// ============================================================================
// MAIN CALCULATION FUNCTION
// ============================================================================

/**
 * Calculate all 6 composite scores from Yahoo Finance data
 *
 * @param data - Raw financial data from Yahoo Finance
 * @param sectorMedians - Optional sector median values for comparison
 * @returns ScoreMetrics object with all 6 scores (0-100)
 */
export function calculateScores(
  data: YahooFinanceData,
  sectorMedians?: SectorMedians
): ScoreMetrics {
  // Calculate individual category metrics
  const profitabilityMetrics = calculateProfitability(data);
  const growthMetrics = calculateGrowth(data);
  const liquidityMetrics = calculateLiquidity(data);
  const leverageMetrics = calculateLeverage(data);

  // Calculate individual scores
  const profitabilityScore = calculateProfitabilityScore(profitabilityMetrics);
  const growthScore = calculateGrowthScore(growthMetrics);
  const valuationScore = calculateValuationScore(data, sectorMedians);
  const riskScore = calculateRiskScore(data);
  const healthScore = calculateHealthScore(liquidityMetrics, leverageMetrics);

  // Calculate total score
  const totalScore = calculateTotalScore({
    profitabilityScore,
    growthScore,
    valuationScore,
    riskScore,
    healthScore,
  });

  return {
    profitabilityScore,
    growthScore,
    valuationScore,
    riskScore,
    healthScore,
    totalScore,
  };
}

// ============================================================================
// SECTOR MEDIANS TYPE
// ============================================================================

/**
 * Sector median values for relative valuation
 */
export interface SectorMedians {
  pe?: number | null;
  pb?: number | null;
  peg?: number | null;
  evToEbitda?: number | null;
}

// ============================================================================
// INDIVIDUAL SCORE CALCULATIONS
// ============================================================================

/**
 * Calculate Profitability Score (0-100)
 *
 * Weighted average of:
 * - Gross Margin (20%)
 * - Operating Margin (20%)
 * - Net Margin (20%)
 * - ROE (20%)
 * - ROIC (20%)
 *
 * Each metric is normalized to 0-100 scale before averaging
 */
export function calculateProfitabilityScore(
  metrics: ProfitabilityMetrics
): number | null {
  const components: { value: number | null; weight: number }[] = [
    {
      value: normalizeMetric(
        metrics.grossProfitMargin,
        BENCHMARKS.grossMargin
      ),
      weight: PROFITABILITY_WEIGHTS.grossMargin,
    },
    {
      value: normalizeMetric(
        metrics.operatingProfitMargin,
        BENCHMARKS.operatingMargin
      ),
      weight: PROFITABILITY_WEIGHTS.operatingMargin,
    },
    {
      value: normalizeMetric(metrics.netProfitMargin, BENCHMARKS.netMargin),
      weight: PROFITABILITY_WEIGHTS.netMargin,
    },
    {
      value: normalizeMetric(metrics.roe, BENCHMARKS.roe),
      weight: PROFITABILITY_WEIGHTS.roe,
    },
    {
      value: normalizeMetric(metrics.roic, BENCHMARKS.roic),
      weight: PROFITABILITY_WEIGHTS.roic,
    },
  ];

  return calculateWeightedScore(components);
}

/**
 * Calculate Growth Score (0-100)
 *
 * Weighted average of:
 * - Revenue Growth YoY (30%)
 * - EPS Growth YoY (30%)
 * - FCF Growth (20%)
 * - 3Y Revenue CAGR (20%)
 */
export function calculateGrowthScore(metrics: GrowthMetrics): number | null {
  const components: { value: number | null; weight: number }[] = [
    {
      value: normalizeMetric(
        metrics.revenueGrowthYoY,
        BENCHMARKS.revenueGrowthYoY
      ),
      weight: GROWTH_WEIGHTS.revenueGrowthYoY,
    },
    {
      value: normalizeMetric(metrics.epsGrowthYoY, BENCHMARKS.epsGrowthYoY),
      weight: GROWTH_WEIGHTS.epsGrowthYoY,
    },
    {
      value: normalizeMetric(metrics.fcfGrowth, BENCHMARKS.fcfGrowth),
      weight: GROWTH_WEIGHTS.fcfGrowth,
    },
    {
      value: normalizeMetric(
        metrics.revenue3YearCAGR,
        BENCHMARKS.revenue3YearCAGR
      ),
      weight: GROWTH_WEIGHTS.revenue3YearCAGR,
    },
  ];

  return calculateWeightedScore(components);
}

/**
 * Calculate Valuation Score (0-100)
 *
 * Inverse scoring - lower valuations = higher score
 *
 * Weighted average of:
 * - P/E vs sector median (30%)
 * - P/B vs sector median (25%)
 * - PEG ratio (25%)
 * - EV/EBITDA vs sector (20%)
 */
export function calculateValuationScore(
  data: YahooFinanceData,
  sectorMedians?: SectorMedians
): number | null {
  // Use sector medians if provided, otherwise use benchmarks
  const peValue = data.pe;
  const pbValue = safeDivide(
    data.price * data.sharesOutstanding,
    data.totalEquity
  );
  const pegValue = calculatePEG(data);
  const evToEbitda = calculateEVToEBITDA(data);

  const components: { value: number | null; weight: number }[] = [
    {
      value: normalizeMetric(peValue, BENCHMARKS.pe),
      weight: VALUATION_WEIGHTS.pe,
    },
    {
      value: normalizeMetric(pbValue, BENCHMARKS.pb),
      weight: VALUATION_WEIGHTS.pb,
    },
    {
      value: normalizeMetric(pegValue, BENCHMARKS.peg),
      weight: VALUATION_WEIGHTS.peg,
    },
    {
      value: normalizeMetric(evToEbitda, BENCHMARKS.evToEbitda),
      weight: VALUATION_WEIGHTS.evToEbitda,
    },
  ];

  // Apply sector relative adjustment if medians provided
  if (sectorMedians) {
    return calculateValuationScoreRelative(data, sectorMedians);
  }

  return calculateWeightedScore(components);
}

/**
 * Calculate valuation score relative to sector medians
 */
function calculateValuationScoreRelative(
  data: YahooFinanceData,
  sectorMedians: SectorMedians
): number | null {
  const scores: number[] = [];
  const weights: number[] = [];

  // P/E relative to sector
  if (data.pe != null && sectorMedians.pe != null && sectorMedians.pe > 0) {
    const relPE = data.pe / sectorMedians.pe;
    // Score: if ratio < 1, undervalued (good); if > 1, overvalued (bad)
    scores.push(normalizeInverse(relPE, 0.5, 2.0));
    weights.push(VALUATION_WEIGHTS.pe);
  }

  // P/B relative to sector
  const pbValue = safeDivide(
    data.price * data.sharesOutstanding,
    data.totalEquity
  );
  if (pbValue != null && sectorMedians.pb != null && sectorMedians.pb > 0) {
    const relPB = pbValue / sectorMedians.pb;
    scores.push(normalizeInverse(relPB, 0.5, 2.0));
    weights.push(VALUATION_WEIGHTS.pb);
  }

  // PEG ratio
  const pegValue = calculatePEG(data);
  if (pegValue != null) {
    scores.push(normalizeInverse(pegValue, 0.5, 3.0));
    weights.push(VALUATION_WEIGHTS.peg);
  }

  // EV/EBITDA relative to sector
  const evToEbitda = calculateEVToEBITDA(data);
  if (
    evToEbitda != null &&
    sectorMedians.evToEbitda != null &&
    sectorMedians.evToEbitda > 0
  ) {
    const relEVEBITDA = evToEbitda / sectorMedians.evToEbitda;
    scores.push(normalizeInverse(relEVEBITDA, 0.5, 2.0));
    weights.push(VALUATION_WEIGHTS.evToEbitda);
  }

  if (scores.length === 0) return null;
  return weightedAverage(scores, weights);
}

/**
 * Calculate Risk Score (0-100)
 *
 * Inverse scoring - lower risk = higher score
 *
 * Weighted average of:
 * - Low Beta (35%)
 * - Low Volatility (35%)
 * - High Sharpe Ratio (30%)
 */
export function calculateRiskScore(data: YahooFinanceData): number | null {
  const volatility = calculateVolatility(data);
  const sharpeRatio = calculateSharpeRatio(data);

  const components: { value: number | null; weight: number }[] = [
    {
      value: normalizeMetric(data.beta, BENCHMARKS.beta),
      weight: RISK_WEIGHTS.beta,
    },
    {
      value: normalizeMetric(volatility, BENCHMARKS.volatility),
      weight: RISK_WEIGHTS.volatility,
    },
    {
      value: normalizeMetric(sharpeRatio, BENCHMARKS.sharpeRatio),
      weight: RISK_WEIGHTS.sharpeRatio,
    },
  ];

  return calculateWeightedScore(components);
}

/**
 * Calculate Health Score (0-100)
 *
 * Combination of liquidity and solvency ratios
 *
 * Weighted average of:
 * - Current Ratio (25%)
 * - Quick Ratio (25%)
 * - Debt/Equity (25% - inverse)
 * - Interest Coverage (25%)
 */
export function calculateHealthScore(
  liquidityMetrics: LiquidityMetrics,
  leverageMetrics: LeverageMetrics
): number | null {
  const components: { value: number | null; weight: number }[] = [
    {
      value: normalizeMetric(
        liquidityMetrics.currentRatio,
        BENCHMARKS.currentRatio
      ),
      weight: HEALTH_WEIGHTS.currentRatio,
    },
    {
      value: normalizeMetric(liquidityMetrics.quickRatio, BENCHMARKS.quickRatio),
      weight: HEALTH_WEIGHTS.quickRatio,
    },
    {
      value: normalizeMetric(
        leverageMetrics.debtToEquity,
        BENCHMARKS.debtToEquity
      ),
      weight: HEALTH_WEIGHTS.debtToEquity,
    },
    {
      value: normalizeMetric(
        leverageMetrics.interestCoverage,
        BENCHMARKS.interestCoverage
      ),
      weight: HEALTH_WEIGHTS.interestCoverage,
    },
  ];

  return calculateWeightedScore(components);
}

/**
 * Calculate Total Score (0-100)
 *
 * Weighted average of all category scores:
 * - Profitability: 25%
 * - Growth: 20%
 * - Valuation: 20%
 * - Risk: 15%
 * - Health: 20%
 */
export function calculateTotalScore(scores: {
  profitabilityScore: number | null;
  growthScore: number | null;
  valuationScore: number | null;
  riskScore: number | null;
  healthScore: number | null;
}): number | null {
  const components: { value: number | null; weight: number }[] = [
    {
      value: scores.profitabilityScore,
      weight: TOTAL_SCORE_WEIGHTS.profitability,
    },
    { value: scores.growthScore, weight: TOTAL_SCORE_WEIGHTS.growth },
    { value: scores.valuationScore, weight: TOTAL_SCORE_WEIGHTS.valuation },
    { value: scores.riskScore, weight: TOTAL_SCORE_WEIGHTS.risk },
    { value: scores.healthScore, weight: TOTAL_SCORE_WEIGHTS.health },
  ];

  return calculateWeightedScore(components);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalize a metric to 0-100 scale based on benchmarks
 */
function normalizeMetric(
  value: number | null | undefined,
  benchmark: { min: number; max: number; higherIsBetter: boolean }
): number | null {
  if (value == null || !isFinite(value)) return null;

  // Clamp value to benchmark range
  const clamped = Math.max(benchmark.min, Math.min(benchmark.max, value));

  // Normalize to 0-100
  let normalized = normalizeToScale(clamped, benchmark.min, benchmark.max);

  // Invert if lower is better
  if (!benchmark.higherIsBetter) {
    normalized = 100 - normalized;
  }

  return normalized;
}

/**
 * Normalize inverse metric (lower is better) to 0-100 scale
 */
function normalizeInverse(
  value: number,
  min: number,
  max: number
): number {
  const clamped = Math.max(min, Math.min(max, value));
  const normalized = normalizeToScale(clamped, min, max);
  return 100 - normalized;
}

/**
 * Calculate weighted score from components with null handling
 */
function calculateWeightedScore(
  components: { value: number | null; weight: number }[]
): number | null {
  const validComponents = components.filter((c) => c.value != null);

  if (validComponents.length === 0) return null;

  // Recalculate weights to sum to 1
  const totalWeight = validComponents.reduce((sum, c) => sum + c.weight, 0);

  if (totalWeight === 0) return null;

  const score = validComponents.reduce(
    (sum, c) => sum + (c.value as number) * (c.weight / totalWeight),
    0
  );

  // Clamp to 0-100
  return Math.max(0, Math.min(100, score));
}

/**
 * Calculate PEG ratio
 */
function calculatePEG(data: YahooFinanceData): number | null {
  if (data.pe == null || data.pe <= 0) return null;

  // Use EPS growth if available
  if (data.historicalEPS && data.historicalEPS.length >= 2) {
    const currentEPS = data.historicalEPS[0];
    const priorEPS = data.historicalEPS[1];

    if (priorEPS > 0) {
      const epsGrowth = ((currentEPS - priorEPS) / priorEPS) * 100;
      if (epsGrowth > 0) {
        return data.pe / epsGrowth;
      }
    }
  }

  return null;
}

/**
 * Calculate EV/EBITDA
 */
function calculateEVToEBITDA(data: YahooFinanceData): number | null {
  if (!data.ebitda || data.ebitda <= 0) return null;

  // Enterprise Value = Market Cap + Total Debt - Cash
  const marketCap = data.marketCap;
  const ev = marketCap + (data.totalDebt ?? 0) - (data.cash ?? 0);

  return safeDivide(ev, data.ebitda);
}

/**
 * Calculate annualized volatility from price history
 */
function calculateVolatility(data: YahooFinanceData): number | null {
  if (!data.priceHistory || data.priceHistory.length < 20) return null;

  const prices = data.priceHistory.map((p) => p.close);

  // Calculate daily returns
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    const dailyReturn = (prices[i] - prices[i - 1]) / prices[i - 1];
    returns.push(dailyReturn);
  }

  // Calculate standard deviation of returns
  const avg = mean(returns);
  if (avg == null) return null;

  const squaredDiffs = returns.map((r) => Math.pow(r - avg, 2));
  const variance = mean(squaredDiffs);
  if (variance == null) return null;

  // Daily volatility
  const dailyVol = Math.sqrt(variance);

  // Annualize (assuming 252 trading days)
  return dailyVol * Math.sqrt(252);
}

/**
 * Calculate Sharpe Ratio
 *
 * Sharpe = (Return - Risk-Free Rate) / Volatility
 */
function calculateSharpeRatio(data: YahooFinanceData): number | null {
  if (!data.priceHistory || data.priceHistory.length < 252) return null;

  const prices = data.priceHistory.map((p) => p.close);

  // Calculate annualized return
  const firstPrice = prices[0];
  const lastPrice = prices[prices.length - 1];
  const totalReturn = (lastPrice - firstPrice) / firstPrice;
  const years = prices.length / 252;
  const annualizedReturn = Math.pow(1 + totalReturn, 1 / years) - 1;

  // Get volatility
  const volatility = calculateVolatility(data);
  if (volatility == null || volatility === 0) return null;

  // Assume risk-free rate of 4% (could use FRED data in production)
  const riskFreeRate = 0.04;

  return (annualizedReturn - riskFreeRate) / volatility;
}

// ============================================================================
// INTERPRETATION HELPERS
// ============================================================================

/**
 * Interpret a score value
 */
export function interpretScore(score: number | null): string {
  if (score == null) return 'Unknown';
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  if (score >= 20) return 'Poor';
  return 'Very Poor';
}

/**
 * Get score color for UI
 */
export function getScoreColor(score: number | null): string {
  if (score == null) return 'gray';
  if (score >= 80) return 'green';
  if (score >= 60) return 'blue';
  if (score >= 40) return 'yellow';
  if (score >= 20) return 'orange';
  return 'red';
}

/**
 * Get detailed score breakdown
 */
export function getScoreBreakdown(
  data: YahooFinanceData,
  sectorMedians?: SectorMedians
): ScoreBreakdown {
  const profitabilityMetrics = calculateProfitability(data);
  const growthMetrics = calculateGrowth(data);
  const liquidityMetrics = calculateLiquidity(data);
  const leverageMetrics = calculateLeverage(data);

  return {
    profitability: {
      score: calculateProfitabilityScore(profitabilityMetrics),
      components: {
        grossMargin: profitabilityMetrics.grossProfitMargin,
        operatingMargin: profitabilityMetrics.operatingProfitMargin,
        netMargin: profitabilityMetrics.netProfitMargin,
        roe: profitabilityMetrics.roe,
        roic: profitabilityMetrics.roic,
      },
    },
    growth: {
      score: calculateGrowthScore(growthMetrics),
      components: {
        revenueGrowthYoY: growthMetrics.revenueGrowthYoY,
        epsGrowthYoY: growthMetrics.epsGrowthYoY,
        fcfGrowth: growthMetrics.fcfGrowth,
        revenue3YearCAGR: growthMetrics.revenue3YearCAGR,
      },
    },
    valuation: {
      score: calculateValuationScore(data, sectorMedians),
      components: {
        pe: data.pe,
        pb: safeDivide(data.price * data.sharesOutstanding, data.totalEquity),
        peg: calculatePEG(data),
        evToEbitda: calculateEVToEBITDA(data),
      },
    },
    risk: {
      score: calculateRiskScore(data),
      components: {
        beta: data.beta,
        volatility: calculateVolatility(data),
        sharpeRatio: calculateSharpeRatio(data),
      },
    },
    health: {
      score: calculateHealthScore(liquidityMetrics, leverageMetrics),
      components: {
        currentRatio: liquidityMetrics.currentRatio,
        quickRatio: liquidityMetrics.quickRatio,
        debtToEquity: leverageMetrics.debtToEquity,
        interestCoverage: leverageMetrics.interestCoverage,
      },
    },
  };
}

/**
 * Score breakdown type
 */
export interface ScoreBreakdown {
  profitability: {
    score: number | null;
    components: {
      grossMargin: number | null;
      operatingMargin: number | null;
      netMargin: number | null;
      roe: number | null;
      roic: number | null;
    };
  };
  growth: {
    score: number | null;
    components: {
      revenueGrowthYoY: number | null;
      epsGrowthYoY: number | null;
      fcfGrowth: number | null;
      revenue3YearCAGR: number | null;
    };
  };
  valuation: {
    score: number | null;
    components: {
      pe: number | null;
      pb: number | null;
      peg: number | null;
      evToEbitda: number | null;
    };
  };
  risk: {
    score: number | null;
    components: {
      beta: number | null;
      volatility: number | null;
      sharpeRatio: number | null;
    };
  };
  health: {
    score: number | null;
    components: {
      currentRatio: number | null;
      quickRatio: number | null;
      debtToEquity: number | null;
      interestCoverage: number | null;
    };
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export const scoringSystem = {
  // Main functions
  calculateScores,
  getScoreBreakdown,

  // Individual scores
  calculateProfitabilityScore,
  calculateGrowthScore,
  calculateValuationScore,
  calculateRiskScore,
  calculateHealthScore,
  calculateTotalScore,

  // Interpretation
  interpretScore,
  getScoreColor,

  // Weights (for transparency)
  weights: {
    profitability: PROFITABILITY_WEIGHTS,
    growth: GROWTH_WEIGHTS,
    valuation: VALUATION_WEIGHTS,
    risk: RISK_WEIGHTS,
    health: HEALTH_WEIGHTS,
    total: TOTAL_SCORE_WEIGHTS,
  },

  // Benchmarks (for transparency)
  benchmarks: BENCHMARKS,
};
