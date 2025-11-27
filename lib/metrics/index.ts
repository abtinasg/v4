/**
 * Deep Terminal - Metrics Module
 *
 * Main entry point for the metrics calculation engine
 * Exports all types, calculator, and helper functions
 */

// ============================================================================
// CORE EXPORTS
// ============================================================================

// Calculator
export { MetricsCalculator } from './calculator';

// Types
export type {
  // Raw Data Types
  YahooFinanceData,
  FREDData,
  IndustryData,
  RawFinancialData,

  // Metric Category Types
  MacroMetrics,
  IndustryMetrics,
  LiquidityMetrics,
  LeverageMetrics,
  EfficiencyMetrics,
  ProfitabilityMetrics,
  DupontMetrics,
  GrowthMetrics,
  CashFlowMetrics,
  ValuationMetrics,
  DCFMetrics,
  RiskMetrics,
  TechnicalMetrics,
  ScoreMetrics,
  OtherMetrics,

  // Complete Metrics
  AllMetrics,

  // Configuration Types
  CalculatorOptions,
  CacheConfig,
  MetricsAPIResponse,
  MetricMetadata,
} from './types';

// Helper Functions
export {
  // Math Operations
  safeDivide,
  safeMultiply,
  safeAdd,
  safeSubtract,
  toPercentage,
  percentageChange,

  // Growth Calculations
  calculateCAGR,
  calculateYoYGrowth,

  // Statistical Functions
  mean,
  standardDeviation,
  variance,
  covariance,
  correlation,
  downsideDeviation,

  // Technical Indicators
  calculateSMA,
  calculateEMA,
  calculateRSI,
  calculateMACD,
  calculateBollingerBands,
  calculateMaxDrawdown,

  // Financial Ratios Helpers
  weightedAverage,
  normalizeToScale,
  percentileRank,
  isOutlier,

  // Date Helpers
  yearsBetween,
  isMarketHours,

  // Validation Helpers
  hasRequiredFields,
  removeNullValues,
  countNonNullValues,

  // Formatting Helpers
  formatNumber,
  formatPercentage,
  formatCurrency,
  formatLargeNumber,
} from './helpers';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Default calculator options
 */
export const DEFAULT_CALCULATOR_OPTIONS = {
  marketRiskPremium: 0.05, // 5% US market historical
  terminalGrowthRate: 0.025, // 2.5% GDP growth proxy
  taxRate: null, // Will be calculated from data
  riskFreeRate: null, // Will use FRED 10Y Treasury
} as const;

/**
 * Default cache configuration
 */
export const DEFAULT_CACHE_CONFIG = {
  quoteTTL: 300, // 5 minutes
  fundamentalsTTL: 3600, // 1 hour
  macroTTL: 3600, // 1 hour
} as const;

/**
 * FRED Series IDs for macroeconomic data
 */
export const FRED_SERIES = {
  GDP_GROWTH: 'A191RL1Q225SBEA',
  REAL_GDP: 'GDPC1',
  NOMINAL_GDP: 'GDP',
  GDP_PER_CAPITA: 'A939RX0Q048SBEA',
  CPI: 'CPIAUCSL',
  PPI: 'PPIACO',
  CORE_CPI: 'CPILFESL',
  FED_FUNDS: 'FEDFUNDS',
  TREASURY_10Y: 'DGS10',
  USD_INDEX: 'DTWEXBGS',
  UNEMPLOYMENT: 'UNRATE',
  WAGE_GROWTH: 'CES0500000003',
  LABOR_PRODUCTIVITY: 'OPHNFB',
  CONSUMER_SENTIMENT: 'UMCSENT',
  BUSINESS_CONFIDENCE: 'BSCICP03USM665S',
} as const;

/**
 * Score weights for total score calculation
 */
export const SCORE_WEIGHTS = {
  profitability: 0.25,
  growth: 0.2,
  valuation: 0.2,
  risk: 0.15,
  health: 0.2,
} as const;

/**
 * Metric count by category
 */
export const METRIC_COUNTS = {
  macro: 15,
  industry: 5,
  liquidity: 7,
  leverage: 7,
  efficiency: 6,
  profitability: 8,
  dupont: 7,
  growth: 9,
  cashFlow: 8,
  valuation: 14,
  dcf: 10,
  risk: 7,
  technical: 8,
  scores: 6,
  other: 10,
  total: 127, // Excludes macro (FRED pass-through)
} as const;

/**
 * Supported asset types
 */
export const SUPPORTED_ASSETS = {
  US_STOCKS: true,
  ETFS: true,
  CRYPTO: false, // v2
  INTERNATIONAL: false, // v2
} as const;

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Quick helper to calculate a single metric category
 */
export function calculateMetricCategory<T>(
  rawData: RawFinancialData,
  category:
    | 'macro'
    | 'industry'
    | 'liquidity'
    | 'leverage'
    | 'efficiency'
    | 'profitability'
    | 'dupont'
    | 'growth'
    | 'cashFlow'
    | 'valuation'
    | 'dcf'
    | 'risk'
    | 'technical'
    | 'scores'
    | 'other',
  options?: CalculatorOptions
): T {
  const calculator = new MetricsCalculator(rawData, options);
  const allMetrics = calculator.calculateAll();
  return allMetrics[category] as T;
}

/**
 * Validate raw financial data completeness
 */
export function validateRawData(data: Partial<RawFinancialData>): {
  valid: boolean;
  missingFields: string[];
} {
  const required = ['yahoo', 'fred', 'industry', 'timestamp'];
  const missing = required.filter((field) => !data[field as keyof RawFinancialData]);

  return {
    valid: missing.length === 0,
    missingFields: missing,
  };
}

/**
 * Get metric metadata for documentation
 */
export function getMetricMetadata(
  category: string,
  metricName: string
): MetricMetadata | null {
  // This would be populated from a comprehensive metadata store
  // For now, return null (can be extended later)
  return null;
}

/**
 * Count total non-null metrics in result
 */
export function countCalculatedMetrics(metrics: AllMetrics): {
  total: number;
  byCategory: Record<string, number>;
} {
  const categories = [
    'macro',
    'industry',
    'liquidity',
    'leverage',
    'efficiency',
    'profitability',
    'dupont',
    'growth',
    'cashFlow',
    'valuation',
    'dcf',
    'risk',
    'technical',
    'scores',
    'other',
  ];

  const byCategory: Record<string, number> = {};
  let total = 0;

  for (const category of categories) {
    const categoryMetrics = metrics[category as keyof AllMetrics];
    if (categoryMetrics && typeof categoryMetrics === 'object') {
      const count = Object.values(categoryMetrics).filter((v) => v != null).length;
      byCategory[category] = count;
      total += count;
    }
  }

  return { total, byCategory };
}

// ============================================================================
// VERSION
// ============================================================================

export const VERSION = '1.0.0';
export const METRICS_VERSION = {
  major: 1,
  minor: 0,
  patch: 0,
  total_metrics: 170,
  categories: 15,
} as const;
