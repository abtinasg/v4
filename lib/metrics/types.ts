/**
 * Deep Terminal - Metrics Type Definitions
 *
 * Complete type system for 170+ financial metrics across 15 categories
 * Based on data-sources.md specification
 */

// ============================================================================
// RAW DATA SOURCES
// ============================================================================

/**
 * Raw data from Yahoo Finance API
 * Primary data source for fundamentals, financials, and price data
 */
export interface YahooFinanceData {
  // Quote Data
  symbol: string;
  price: number;
  previousClose: number;
  open: number;
  dayLow: number;
  dayHigh: number;
  volume: number;
  averageVolume: number;
  marketCap: number;
  beta: number;
  pe: number | null;
  eps: number | null;
  forwardPE: number | null;
  forwardEPS: number | null;
  dividendRate: number | null;
  dividendYield: number | null;
  fiftyDayAverage: number | null;
  twoHundredDayAverage: number | null;

  // Income Statement
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  operatingExpenses: number;
  operatingIncome: number;
  ebitda: number;
  ebit: number;
  interestExpense: number;
  pretaxIncome: number;
  incomeTax: number;
  netIncome: number;

  // Balance Sheet
  totalAssets: number;
  currentAssets: number;
  cash: number;
  shortTermInvestments: number;
  netReceivables: number;
  inventory: number;
  totalLiabilities: number;
  currentLiabilities: number;
  shortTermDebt: number;
  accountsPayable: number;
  longTermDebt: number;
  totalDebt: number;
  totalEquity: number;
  retainedEarnings: number;

  // Cash Flow Statement
  operatingCashFlow: number;
  investingCashFlow: number;
  financingCashFlow: number;
  capitalExpenditures: number;
  freeCashFlow: number;
  dividendsPaid: number;

  // Financial Ratios (from financialData module - still works!)
  currentRatio: number | null;
  quickRatio: number | null;
  debtToEquity: number | null;
  returnOnEquity: number | null;
  returnOnAssets: number | null;
  grossMargin: number | null;
  operatingMargin: number | null;
  profitMargin: number | null;
  revenueGrowth: number | null;
  earningsGrowth: number | null;

  // Company Info (from assetProfile)
  sector: string;
  industry: string;

  // Share Data
  sharesOutstanding: number;
  floatShares: number;

  // Historical Data (for growth calculations)
  historicalRevenue: number[];
  historicalNetIncome: number[];
  historicalEPS: number[];
  historicalDividends: number[];
  historicalFCF: number[];

  // Price History (for technical indicators)
  priceHistory: {
    date: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

/**
 * Raw macroeconomic data from FRED API
 */
export interface FREDData {
  gdpGrowthRate: number | null;        // A191RL1Q225SBEA
  realGDP: number | null;              // GDPC1
  nominalGDP: number | null;           // GDP
  gdpPerCapita: number | null;         // A939RX0Q048SBEA
  cpi: number | null;                  // CPIAUCSL
  ppi: number | null;                  // PPIACO
  coreInflation: number | null;        // CPILFESL
  federalFundsRate: number | null;     // FEDFUNDS
  treasury10Y: number | null;          // DGS10
  usdIndex: number | null;             // DTWEXBGS
  unemploymentRate: number | null;     // UNRATE
  wageGrowth: number | null;           // CES0500000003
  laborProductivity: number | null;    // OPHNFB
  consumerConfidence: number | null;   // UMCSENT
  businessConfidence: number | null;   // BSCICP03USM665S
}

/**
 * Industry data from FMP API
 */
export interface IndustryData {
  industryName: string;
  sectorName: string;
  industryRevenue: number | null;
  industryGrowthRate: number | null;
  marketSize: number | null;
  competitorRevenues: { symbol: string; revenue: number }[];
}

/**
 * Combined raw data from all sources
 */
export interface RawFinancialData {
  yahoo: YahooFinanceData;
  fred: FREDData;
  industry: IndustryData;
  timestamp: Date;
}

// ============================================================================
// CALCULATED METRICS BY CATEGORY
// ============================================================================

/**
 * Macroeconomic Metrics (15 metrics from FRED)
 */
export interface MacroMetrics {
  gdpGrowthRate: number | null;
  realGDP: number | null;
  nominalGDP: number | null;
  gdpPerCapita: number | null;
  cpi: number | null;
  ppi: number | null;
  coreInflation: number | null;
  federalFundsRate: number | null;
  treasury10Y: number | null;
  usdIndex: number | null;
  unemploymentRate: number | null;
  wageGrowth: number | null;
  laborProductivity: number | null;
  consumerConfidence: number | null;
  businessConfidence: number | null;
}

/**
 * Industry Metrics (5 metrics)
 */
export interface IndustryMetrics {
  industryGrowthRate: number | null;
  marketSize: number | null;
  marketShare: number | null;
  hhiIndex: number | null;           // Herfindahl-Hirschman Index
  cr4: number | null;                // Top 4 Concentration Ratio
}

/**
 * Liquidity Ratios (7 metrics)
 */
export interface LiquidityMetrics {
  currentRatio: number | null;
  quickRatio: number | null;
  cashRatio: number | null;
  daysSalesOutstanding: number | null;
  daysInventoryOutstanding: number | null;
  daysPayablesOutstanding: number | null;
  cashConversionCycle: number | null;
}

/**
 * Leverage / Solvency Ratios (7 metrics)
 */
export interface LeverageMetrics {
  debtToAssets: number | null;
  debtToEquity: number | null;
  financialDebtToEquity: number | null;
  interestCoverage: number | null;
  debtServiceCoverage: number | null;
  equityMultiplier: number | null;
  debtToEBITDA: number | null;
}

/**
 * Activity / Efficiency Ratios (6 metrics)
 */
export interface EfficiencyMetrics {
  totalAssetTurnover: number | null;
  fixedAssetTurnover: number | null;
  inventoryTurnover: number | null;
  receivablesTurnover: number | null;
  payablesTurnover: number | null;
  workingCapitalTurnover: number | null;
}

/**
 * Profitability Ratios (8 metrics)
 */
export interface ProfitabilityMetrics {
  grossProfitMargin: number | null;
  operatingProfitMargin: number | null;
  ebitdaMargin: number | null;
  netProfitMargin: number | null;
  roa: number | null;                // Return on Assets
  roe: number | null;                // Return on Equity
  roic: number | null;               // Return on Invested Capital
  noplat: number | null;             // Net Operating Profit Less Adjusted Taxes
}

/**
 * DuPont Analysis (7 metrics)
 */
export interface DupontMetrics {
  netProfitMargin: number | null;
  assetTurnover: number | null;
  equityMultiplier: number | null;
  roeDupont: number | null;          // NPM × AT × EM
  operatingMargin: number | null;
  interestBurden: number | null;     // EBT / EBIT
  taxBurden: number | null;          // Net Income / EBT
}

/**
 * Growth Metrics (9 metrics)
 */
export interface GrowthMetrics {
  revenueGrowthYoY: number | null;
  epsGrowthYoY: number | null;
  dpsGrowth: number | null;          // Dividend per Share growth
  fcfGrowth: number | null;
  revenue3YearCAGR: number | null;
  revenue5YearCAGR: number | null;
  sustainableGrowthRate: number | null;
  retentionRatio: number | null;
  payoutRatio: number | null;
}

/**
 * Cash Flow Metrics (8 metrics)
 */
export interface CashFlowMetrics {
  operatingCashFlow: number | null;
  investingCashFlow: number | null;
  financingCashFlow: number | null;
  freeCashFlow: number | null;
  fcff: number | null;               // Free Cash Flow to Firm
  fcfe: number | null;               // Free Cash Flow to Equity
  cashFlowAdequacy: number | null;
  cashReinvestmentRatio: number | null;
}

/**
 * Valuation Metrics (14 metrics)
 */
export interface ValuationMetrics {
  peRatio: number | null;
  forwardPE: number | null;
  justifiedPE: number | null;
  pbRatio: number | null;
  justifiedPB: number | null;
  psRatio: number | null;
  pcfRatio: number | null;           // Price to Cash Flow
  ev: number | null;                 // Enterprise Value
  evToEBITDA: number | null;
  evToSales: number | null;
  evToEBIT: number | null;
  dividendYield: number | null;
  pegRatio: number | null;
  earningsYield: number | null;      // Inverse of P/E
}

/**
 * DCF / Intrinsic Value Metrics (10 metrics)
 */
export interface DCFMetrics {
  riskFreeRate: number | null;
  marketRiskPremium: number | null;
  beta: number | null;
  costOfEquity: number | null;       // Re = Rf + β(Rm - Rf)
  costOfDebt: number | null;         // Rd = Interest / Debt
  wacc: number | null;               // Weighted Average Cost of Capital
  terminalValue: number | null;
  intrinsicValue: number | null;
  targetPrice: number | null;
  upsideDownside: number | null;     // (Target - Price) / Price
}

/**
 * Risk Metrics (7 metrics)
 */
export interface RiskMetrics {
  beta: number | null;
  standardDeviation: number | null;
  alpha: number | null;
  sharpeRatio: number | null;
  sortinoRatio: number | null;
  maxDrawdown: number | null;
  var95: number | null;              // Value at Risk (95%)
}

/**
 * Technical Indicators (8 metrics)
 */
export interface TechnicalMetrics {
  rsi: number | null;                // Relative Strength Index
  macd: number | null;
  macdSignal: number | null;
  fiftyDayMA: number | null;
  twoHundredDayMA: number | null;
  bollingerUpper: number | null;
  bollingerLower: number | null;
  relativeVolume: number | null;
}

/**
 * Composite Scores (6 scores, 0-100 scale)
 */
export interface ScoreMetrics {
  profitabilityScore: number | null;
  growthScore: number | null;
  valuationScore: number | null;
  riskScore: number | null;
  healthScore: number | null;
  totalScore: number | null;
}

/**
 * Other Key Metrics (10 metrics)
 */
export interface OtherMetrics {
  effectiveTaxRate: number | null;
  workingCapital: number | null;
  bookValuePerShare: number | null;
  salesPerShare: number | null;
  cashFlowPerShare: number | null;
  operatingLeverage: number | null;  // DOL
  financialLeverage: number | null;  // DFL
  altmanZScore: number | null;
  piotroskiFScore: number | null;    // 0-9 scale
  excessROIC: number | null;         // ROIC - Industry ROIC
}

// ============================================================================
// COMPLETE METRICS INTERFACE
// ============================================================================

/**
 * Complete metrics object containing all 170+ calculated metrics
 */
export interface AllMetrics {
  symbol: string;
  companyName: string;
  sector: string;
  industryName: string;
  timestamp: Date;

  // Metric Categories
  macro: MacroMetrics;
  industry: IndustryMetrics;
  liquidity: LiquidityMetrics;
  leverage: LeverageMetrics;
  efficiency: EfficiencyMetrics;
  profitability: ProfitabilityMetrics;
  dupont: DupontMetrics;
  growth: GrowthMetrics;
  cashFlow: CashFlowMetrics;
  valuation: ValuationMetrics;
  dcf: DCFMetrics;
  risk: RiskMetrics;
  technical: TechnicalMetrics;
  scores: ScoreMetrics;
  other: OtherMetrics;
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Calculator configuration options
 */
export interface CalculatorOptions {
  marketRiskPremium?: number;        // Default: 0.05 (5%)
  terminalGrowthRate?: number;       // Default: 0.025 (2.5%)
  taxRate?: number | null;           // If null, will be calculated
  riskFreeRate?: number | null;      // If null, will use FRED treasury10Y
}

/**
 * Cache configuration
 */
export interface CacheConfig {
  quoteTTL: number;                  // Time-to-live for quote data (seconds)
  fundamentalsTTL: number;           // Time-to-live for fundamentals (seconds)
  macroTTL: number;                  // Time-to-live for macro data (seconds)
}

/**
 * API Response envelope
 */
export interface MetricsAPIResponse {
  success: boolean;
  data?: AllMetrics;
  error?: string;
  cached: boolean;
  timestamp: Date;
}

/**
 * Metric metadata for documentation
 */
export interface MetricMetadata {
  name: string;
  category: string;
  formula: string;
  description: string;
  source: 'yahoo' | 'fred' | 'fmp' | 'calculated';
  unit?: string;
  range?: { min: number; max: number };
}
