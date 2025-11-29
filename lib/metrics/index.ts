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
  TradeFXData,
  RawFinancialData,

  // Metric Category Types
  MacroMetrics,
  TradeFXMetrics,
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

// Import types for internal use
import type {
  RawFinancialData,
  CalculatorOptions,
  AllMetrics,
  MetricMetadata,
} from './types';
import { MetricsCalculator } from './calculator';

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

// Liquidity Metrics
export {
  // Calculation Functions
  calculateLiquidity,
  calculateCurrentRatio,
  calculateQuickRatio,
  calculateCashRatio,
  calculateDaysSalesOutstanding,
  calculateDaysInventoryOutstanding,
  calculateDaysPayablesOutstanding,
  calculateCashConversionCycle,

  // Interpretation Functions
  interpretCurrentRatio,
  interpretQuickRatio,
  interpretCashRatio,
  interpretDaysSalesOutstanding,
  interpretDaysInventoryOutstanding,
  interpretDaysPayablesOutstanding,
  interpretCashConversionCycle,
  interpretAllLiquidityMetrics,

  // Utility Functions
  isServiceCompany,
  getLiquidityScore,
} from './liquidity';

// Liquidity Types
export type { InterpretationLevel, MetricInterpretation } from './liquidity';

// Leverage Metrics
export {
  // Calculation Functions
  calculateLeverage,
  calculateDebtToAssets,
  calculateDebtToEquity,
  calculateFinancialDebtToEquity,
  calculateInterestCoverage,
  calculateDebtServiceCoverage,
  calculateEquityMultiplier,
  calculateDebtToEBITDA,

  // Interpretation Functions
  interpretDebtToAssets,
  interpretDebtToEquity,
  interpretFinancialDebtToEquity,
  interpretInterestCoverage,
  interpretDebtServiceCoverage,
  interpretEquityMultiplier,
  interpretDebtToEBITDA,
  interpretAllLeverageMetrics,

  // Utility Functions
  isDebtFree,
  getLeverageScore,
  isOverLeveraged,
  getLeverageHealthRating,
} from './leverage';

// Efficiency Metrics
export {
  // Calculation Functions
  calculateEfficiency,
  calculateTotalAssetTurnover,
  calculateFixedAssetTurnover,
  calculateInventoryTurnover,
  calculateReceivablesTurnover,
  calculatePayablesTurnover,
  calculateWorkingCapitalTurnover,

  // Interpretation Functions
  interpretTotalAssetTurnover,
  interpretFixedAssetTurnover,
  interpretInventoryTurnover,
  interpretReceivablesTurnover,
  interpretPayablesTurnover,
  interpretWorkingCapitalTurnover,
  interpretAllEfficiencyMetrics,

  // Utility Functions
  getEfficiencyScore,
} from './efficiency';

// Profitability Metrics
export {
  // Calculation Functions
  calculateProfitability,
  calculateGrossProfitMargin,
  calculateOperatingProfitMargin,
  calculateEBITDAMargin,
  calculateNetProfitMargin,
  calculateROA,
  calculateROE,
  calculateROIC,
  calculateNOPLAT,

  // Interpretation Functions
  interpretGrossProfitMargin,
  interpretOperatingProfitMargin,
  interpretEBITDAMargin,
  interpretNetProfitMargin,
  interpretROA,
  interpretROE,
  interpretROIC,
  interpretNOPLAT,
  interpretAllProfitabilityMetrics,

  // Utility Functions
  calculateEffectiveTaxRate,
  getProfitabilityScore,
  isProfitable,
  compareToBenchmark,
} from './profitability';

// Growth Metrics
export {
  // Calculation Functions
  calculateGrowth,
  calculateRevenueGrowthYoY,
  calculateEPSGrowthYoY,
  calculateDPSGrowth,
  calculateFCFGrowth,
  calculateRevenue3YearCAGR,
  calculateRevenue5YearCAGR,
  calculateSustainableGrowthRate,
  calculateRetentionRatio,
  calculatePayoutRatio,

  // Interpretation Functions
  interpretRevenueGrowthYoY,
  interpretEPSGrowthYoY,
  interpretSustainableGrowthRate,
  interpretPayoutRatio,
  interpretRevenueCAGR,
  interpretAllGrowthMetrics,

  // Utility Functions
  getGrowthScore,
  isGrowing,
  getGrowthStage,
} from './growth';

// Cash Flow Metrics
export {
  // Calculation Functions
  calculateCashFlow,
  getOperatingCashFlow,
  getInvestingCashFlow,
  getFinancingCashFlow,
  calculateFreeCashFlow,
  calculateFCFF,
  calculateFCFE,
  calculateCashFlowAdequacy,
  calculateCashReinvestmentRatio,

  // Interpretation Functions
  interpretOperatingCashFlow,
  interpretFreeCashFlow,
  interpretCashFlowAdequacy,
  interpretCashReinvestmentRatio,
  interpretFCFF,
  interpretFCFE,
  interpretAllCashFlowMetrics,

  // Utility Functions
  getCashFlowScore,
  hasHealthyCashFlow,
  calculateFCFMargin,
  calculateFCFPerShare,
  assessCashFlowQuality,
} from './cashflow';

// Technical Indicators
export {
  // Main Calculation Function
  calculateTechnical,

  // Moving Averages
  calculateSMA as calculateSMAIndicator,
  calculateEMA as calculateEMAIndicator,
  calculateEMASeries,

  // RSI (Relative Strength Index)
  calculateRSI as calculateRSIIndicator,
  calculateRSI14,

  // MACD (Moving Average Convergence Divergence)
  calculateMACD as calculateMACDIndicator,
  calculateMACDFull,

  // Bollinger Bands
  calculateBollingerBandsFull,
  calculateBollingerBandWidth,
  calculateBollingerPercentB,

  // Volume Indicators
  calculateRelativeVolume,
  calculateVolumeMA,
  calculateOBV,

  // Additional Technical Indicators
  calculateATR,
  calculateStochastic,
  calculateWilliamsR,
  calculateMFI,

  // Interpretation Functions
  interpretRSI,
  interpretMACD,
  interpretBollingerPosition,
  interpretRelativeVolume,

  // Technical Indicators Bundle
  technicalIndicators,
} from './technical';

// Quality/Scoring Metrics
export {
  // Main Calculation Function
  calculateScores,
  getScoreBreakdown,

  // Individual Score Calculations
  calculateProfitabilityScore,
  calculateGrowthScore,
  calculateValuationScore,
  calculateRiskScore,
  calculateHealthScore,
  calculateTotalScore,

  // Interpretation Functions
  interpretScore,
  getScoreColor,

  // Scoring System Bundle
  scoringSystem,
} from './scores';

// Scoring Types
export type { SectorMedians, ScoreBreakdown } from './scores';

// ============================================================================
// VALUATION METRICS (14 metrics)
// ============================================================================

export {
  // Calculator Class
  ValuationCalculator,

  // Standalone Functions
  calculatePERatio,
  calculateForwardPE,
  calculateJustifiedPE,
  calculatePBRatio,
  calculateJustifiedPB,
  calculatePSRatio,
  calculatePCFRatio,
  calculateEnterpriseValue,
  calculateEVToEBITDA,
  calculateEVToSales,
  calculateEVToEBIT,
  calculateDividendYield,
  calculatePEGRatio,
  calculateEarningsYield,

  // Analysis Functions
  analyzeValuation,
  calculateValuationScore as calculateValuationMetricsScore,
} from './valuation';

// Valuation Types
export type {
  ValuationInput,
  ValuationOptions,
  ValuationMetricsResult,
  ValuationComparison,
} from './valuation';

// ============================================================================
// DCF / INTRINSIC VALUE METRICS (10 metrics)
// ============================================================================

export {
  // Calculator Class
  DCFCalculator,

  // Standalone Functions
  calculateBeta as calculateBetaFromReturns,
  calculateCostOfEquity,
  calculateCostOfDebt,
  calculateWACC,
  calculateTerminalValue,
  calculatePresentValue,
  calculateSimpleDCF,

  // Sensitivity Analysis
  dcfSensitivityAnalysis,

  // Interpretation
  interpretDCFResults,
} from './dcf';

// DCF Types
export type {
  DCFInput,
  DCFOptions,
  DCFMetricsResult,
  ProjectedFCF,
  DCFSensitivityResult,
  DCFInterpretation,
} from './dcf';

// ============================================================================
// RISK METRICS (7 metrics)
// ============================================================================

export {
  // Calculator Class
  RiskCalculator,

  // Standalone Functions
  calculateBeta as calculateBetaRisk,
  calculateSharpeRatio as calculateSharpeRatioRisk,
  calculateSortinoRatio as calculateSortinoRatioRisk,
  calculateAlpha,
  calculateVaR,
  calculateCVaR,
  calculateReturns,
  calculateAnnualizedVolatility,

  // Scoring & Interpretation
  calculateRiskScore as calculateRiskMetricsScore,
  interpretRiskMetrics,
} from './risk';

// Risk Types
export type {
  PricePoint,
  RiskInput,
  RiskOptions,
  RiskMetricsResult,
  RiskInterpretation,
} from './risk';

// ============================================================================
// OTHER KEY METRICS (10 metrics)
// ============================================================================

export {
  // Main Calculation Function
  calculateOther,

  // Individual Metric Calculations
  calculateEffectiveTaxRate as calculateEffectiveTaxRateOther,
  calculateWorkingCapital,
  calculateBookValuePerShare,
  calculateSalesPerShare,
  calculateCashFlowPerShare,
  calculateOperatingLeverage,
  calculateFinancialLeverage,
  calculateAltmanZScore,
  calculatePiotroskiFScore,
  calculateExcessROIC,

  // Zone/Strength Classifications
  getZScoreZone,
  getFScoreStrength,

  // Interpretation Functions
  interpretEffectiveTaxRate,
  interpretWorkingCapital,
  interpretAltmanZScore,
  interpretPiotroskiFScore,
  interpretOperatingLeverage,
  interpretFinancialLeverage,
  interpretExcessROIC,
  interpretAllOtherMetrics,

  // Utility Functions
  getOtherMetricsScore,
  isInFinancialDistress,
  getTotalLeverage,
} from './other';

// Other Metrics Types
export type {
  ZScoreZone,
  FScoreStrength,
  ZScoreInterpretation,
  FScoreInterpretation,
} from './other';

// ============================================================================
// MACRO METRICS (15 FRED indicators)
// ============================================================================

export {
  // FRED Series Configuration
  FRED_MACRO_SERIES,
  SERIES_METADATA,

  // Cache Management
  clearMacroCache,
  getMacroCacheStats,

  // FRED API Functions
  getFredSeries,
  getFredSeriesWithHistory,
  fetchAllMacroData,

  // Macro Metrics Calculation
  calculateMacro,
  fetchMacroMetrics,

  // Interpretation Functions
  interpretGDPGrowth,
  interpretUnemployment,
  interpretInflation,
  interpretFedFundsRate,
  interpretTreasury10Y,
  interpretConsumerConfidence,
  interpretAllMacroMetrics,

  // Utility Functions
  getEconomicHealthScore,
  isRecession,
  getYieldCurveStatus,
  getRealInterestRate,
  formatMacroValue,
  getSeriesMetadata,
} from './macro';

// Macro Types
export type { MacroInterpretation, FREDSeriesId } from './macro';

// ============================================================================
// TRADE & FX PARITY METRICS (35+ metrics)
// ============================================================================

export {
  // Series Configuration
  TRADE_FX_SERIES,

  // Trade Calculations
  calculateTermsOfTrade,
  calculateOpportunityCost,
  calculateTradeBalance,
  calculateSavingInvestmentGap,
  calculateNetExports,

  // Spot FX Calculations
  calculateSpotSpread,
  calculateSpotMidpoint,

  // Forward FX Calculations
  calculateForwardPoints,
  calculateForwardRate,

  // Cross Rate Calculations
  calculateCrossRate,
  calculateTriangularArbitrage,
  calculateSyntheticCrossRate,

  // Interest Rate Parity Calculations
  calculateCoveredInterestParity,
  calculateUncoveredInterestParity,
  calculateForwardPremiumDiscount,
  calculateCarryTradeReturn,
  calculateInterestRateDifferential,

  // Real Exchange Rate Calculations
  calculateRealExchangeRate,
  calculatePPPRate,
  calculatePPPDeviation,

  // FX Volatility Calculations
  calculateHistoricalVolatility,

  // Main Calculation Function
  calculateTradeFX,

  // Interpretation Functions
  interpretTermsOfTrade,
  interpretCIPDeviation,
  interpretPPPDeviation,
  interpretTradeBalance,
} from './tradefx';

// Trade & FX Types
export type { TradeFXInterpretation } from './tradefx';

// Industry Metrics
export {
  // API Functions
  getCompanyProfile as getIndustryCompanyProfile,
  getIndustryPeers,
  getIncomeStatement as getIndustryIncomeStatement,
  getSectorPerformance,
  fetchIndustryData,

  // Calculation Functions
  calculateMarketShare,
  calculateHHI,
  calculateCR4,
  calculateIndustryMetrics,
  calculateIndustryMetricsFromData,

  // Interpretation Functions
  getHHIInterpretation,
  getCR4Interpretation,
  getIndustryAnalysis,
  getCompetitivePosition,
} from './industry';

// Industry Types
export type {
  FMPStockScreenerResult,
  FMPCompanyProfile,
  FMPIncomeStatement,
  FMPSectorPerformance,
} from './industry';

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
