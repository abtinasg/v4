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
 * Raw macroeconomic data from FRED API - Extended (40+ series)
 */
export interface FREDData {
  // Core GDP Metrics
  gdpGrowthRate: number | null;        // A191RL1Q225SBEA - Real GDP Growth Rate
  realGDP: number | null;              // GDPC1 - Real Gross Domestic Product
  nominalGDP: number | null;           // GDP - Nominal GDP
  gdpPerCapita: number | null;         // A939RX0Q048SBEA - Real GDP per Capita
  realGDPGrowthRate: number | null;    // Calculated from GDPC1
  potentialGDP: number | null;         // GDPPOT - Potential GDP
  outputGap: number | null;            // Calculated: (Real GDP - Potential GDP) / Potential GDP

  // Inflation Metrics
  cpi: number | null;                  // CPIAUCSL - Consumer Price Index
  ppi: number | null;                  // PPIACO - Producer Price Index
  coreInflation: number | null;        // CPILFESL - CPI Less Food and Energy
  inflationRate: number | null;        // Calculated YoY CPI change
  pceInflation: number | null;         // PCEPI - PCE Price Index
  coreInflationRate: number | null;    // Calculated YoY Core CPI change
  breakEvenInflation5Y: number | null; // T5YIE - 5-Year Breakeven Inflation
  breakEvenInflation10Y: number | null; // T10YIE - 10-Year Breakeven Inflation

  // Interest Rate Metrics
  federalFundsRate: number | null;     // FEDFUNDS - Federal Funds Rate
  treasury10Y: number | null;          // DGS10 - 10-Year Treasury
  treasury2Y: number | null;           // DGS2 - 2-Year Treasury
  treasury30Y: number | null;          // DGS30 - 30-Year Treasury
  treasury3M: number | null;           // DTB3 - 3-Month Treasury Bill
  primeRate: number | null;            // DPRIME - Bank Prime Loan Rate
  interbankRate: number | null;        // USD3MTD156N - 3-Month LIBOR/SOFR
  realInterestRate: number | null;     // Calculated: Nominal Rate - Inflation
  neutralRate: number | null;          // Natural Rate of Interest (r*)
  yieldCurveSpread: number | null;     // Calculated: 10Y - 2Y Spread

  // Monetary Metrics
  m1MoneySupply: number | null;        // M1SL - M1 Money Stock
  m2MoneySupply: number | null;        // M2SL - M2 Money Stock
  m2Velocity: number | null;           // M2V - Velocity of M2 Money Stock
  moneyMultiplier: number | null;      // Calculated: M2 / Monetary Base
  monetaryBase: number | null;         // BOGMBASE - Monetary Base
  excessReserves: number | null;       // EXCSRESNS - Excess Reserves

  // Exchange Rate
  usdIndex: number | null;             // DTWEXBGS - Trade Weighted USD Index
  eurUsd: number | null;               // DEXUSEU - USD/EUR Exchange Rate
  usdJpy: number | null;               // DEXJPUS - USD/JPY Exchange Rate
  gbpUsd: number | null;               // DEXUSUK - GBP/USD Exchange Rate

  // Employment
  unemploymentRate: number | null;     // UNRATE - Civilian Unemployment Rate
  laborForceParticipation: number | null; // CIVPART - Labor Force Participation
  employmentPopulationRatio: number | null; // EMRATIO - Employment-Population Ratio
  initialClaims: number | null;        // ICSA - Initial Jobless Claims
  continuingClaims: number | null;     // CCSA - Continuing Claims
  nonFarmPayrolls: number | null;      // PAYEMS - Total Nonfarm Payrolls

  // Wages & Productivity
  wageGrowth: number | null;           // CES0500000003 - Average Hourly Earnings
  laborProductivity: number | null;    // OPHNFB - Nonfarm Business Productivity
  unitLaborCosts: number | null;       // ULCNFB - Unit Labor Costs
  realWageGrowth: number | null;       // Calculated: Wage Growth - Inflation

  // Confidence & Sentiment
  consumerConfidence: number | null;   // UMCSENT - U of Michigan Consumer Sentiment
  businessConfidence: number | null;   // BSCICP03USM665S - OECD Business Confidence
  nfibOptimism: number | null;         // Small Business Optimism Index
  ceoConfidence: number | null;        // CEO Confidence Index

  // Housing
  housingStarts: number | null;        // HOUST - Housing Starts
  buildingPermits: number | null;      // PERMIT - Building Permits
  existingHomeSales: number | null;    // EXHOSLUSM495S - Existing Home Sales
  caseShillerIndex: number | null;     // CSUSHPINSA - Case-Shiller Home Price Index

  // Manufacturing & Trade
  ism_pmi: number | null;              // ISM Manufacturing PMI
  ism_services: number | null;         // ISM Non-Manufacturing Index
  industrialProduction: number | null; // INDPRO - Industrial Production Index
  capacityUtilization: number | null;  // TCU - Capacity Utilization
  retailSales: number | null;          // RSAFS - Retail Sales
  tradeBalance: number | null;         // BOPGSTB - Trade Balance

  // Credit & Financial Conditions
  creditSpread: number | null;         // BAA10Y - Baa-Treasury Spread
  tedSpread: number | null;            // TEDRATE - TED Spread
  vix: number | null;                  // VIXCLS - CBOE Volatility Index
  financialStressIndex: number | null; // STLFSI3 - St. Louis Fed Financial Stress
  chicagoFedIndex: number | null;      // NFCI - Chicago Fed National Financial Conditions

  // Fiscal Indicators
  federalDebt: number | null;          // GFDEBTN - Federal Debt Total
  debtToGDP: number | null;            // GFDEGDQ188S - Debt to GDP Ratio
  budgetDeficit: number | null;        // FYFSD - Federal Surplus/Deficit

  // Calculated Macro Formulas
  fisherEquation: number | null;       // (1 + nominal) = (1 + real)(1 + inflation)
  nominalRiskFreeRate: number | null;  // Treasury rate as risk-free proxy
  quantityTheoryOfMoney: number | null; // M * V = P * Y
}

/**
 * Industry data from FMP API - Extended
 */
export interface IndustryData {
  industryName: string;
  sectorName: string;
  industryRevenue: number | null;
  industryGrowthRate: number | null;
  marketSize: number | null;
  competitorRevenues: { symbol: string; revenue: number }[];
  
  // Extended Industry Data
  industryPE: number | null;
  industryPB: number | null;
  industryROE: number | null;
  industryROIC: number | null;
  industryGrossMargin: number | null;
  industryOperatingMargin: number | null;
  industryNetMargin: number | null;
  industryDebtToEquity: number | null;
  industryCurrentRatio: number | null;
  industryBeta: number | null;
  industryDividendYield: number | null;
  sectorPE: number | null;
  sectorGrowthRate: number | null;
}

/**
 * Trade & FX Data
 */
export interface TradeFXData {
  // Trade Metrics
  termsOfTrade: number | null;           // Export Prices / Import Prices
  tradeBalance: number | null;           // Exports - Imports
  currentAccount: number | null;         // Current Account Balance
  capitalAccount: number | null;         // Capital Account Balance
  netExports: number | null;             // Net Exports
  savingInvestmentGap: number | null;    // S - I = X - M
  
  // FX Spot Rates
  spotRate: number | null;               // Current spot FX rate
  spotRateBid: number | null;            // Bid price
  spotRateAsk: number | null;            // Ask price
  spotRateSpread: number | null;         // Ask - Bid
  
  // FX Forward Rates
  forwardRate1M: number | null;          // 1-Month Forward Rate
  forwardRate3M: number | null;          // 3-Month Forward Rate
  forwardRate6M: number | null;          // 6-Month Forward Rate
  forwardRate1Y: number | null;          // 1-Year Forward Rate
  forwardPoints1M: number | null;        // Forward Points 1M
  forwardPoints3M: number | null;        // Forward Points 3M
  forwardPoints6M: number | null;        // Forward Points 6M
  forwardPoints1Y: number | null;        // Forward Points 1Y
  
  // Cross Rates
  crossRate: number | null;              // Cross rate calculation
  triangularArbitrage: number | null;    // Arbitrage opportunity check
  
  // Interest Rate Parity
  coveredInterestParity: number | null;  // CIP: F/S = (1+rd)/(1+rf)
  uncoveredInterestParity: number | null; // UIP: E(S)/S = (1+rd)/(1+rf)
  forwardPremiumDiscount: number | null; // (F - S) / S annualized
  carryTradeReturn: number | null;       // Return from carry trade
  
  // Real Exchange Rate
  realExchangeRate: number | null;       // Nominal × (P*/P)
  purchasingPowerParity: number | null;  // PPP Exchange Rate
  pppDeviation: number | null;           // Actual vs PPP deviation
  realEffectiveExchangeRate: number | null; // REER
  
  // FX Volatility
  impliedVolatility1M: number | null;    // 1-Month Implied Vol
  impliedVolatility3M: number | null;    // 3-Month Implied Vol
  historicalVolatility: number | null;   // Historical Volatility
  riskReversal25D: number | null;        // 25-Delta Risk Reversal
  butterflySpread25D: number | null;     // 25-Delta Butterfly
}

/**
 * Combined raw data from all sources
 */
export interface RawFinancialData {
  yahoo: YahooFinanceData;
  fred: FREDData;
  industry: IndustryData;
  tradeFx?: TradeFXData;
  timestamp: Date;
}

// ============================================================================
// CALCULATED METRICS BY CATEGORY
// ============================================================================

/**
 * Extended Macroeconomic Metrics (60+ metrics from FRED)
 */
export interface MacroMetrics {
  // Core GDP (8 metrics)
  gdpGrowthRate: number | null;
  realGDP: number | null;
  nominalGDP: number | null;
  gdpPerCapita: number | null;
  realGDPGrowthRate: number | null;
  potentialGDP: number | null;
  outputGap: number | null;
  gdpDeflator: number | null;

  // Inflation (10 metrics)
  cpi: number | null;
  ppi: number | null;
  coreInflation: number | null;
  inflationRate: number | null;
  pceInflation: number | null;
  coreInflationRate: number | null;
  breakEvenInflation5Y: number | null;
  breakEvenInflation10Y: number | null;
  inflationExpectations: number | null;
  realInflationAdjustedReturn: number | null;

  // Interest Rates (15 metrics)
  federalFundsRate: number | null;
  treasury10Y: number | null;
  treasury2Y: number | null;
  treasury30Y: number | null;
  treasury3M: number | null;
  primeRate: number | null;
  interbankRate: number | null;
  realInterestRate: number | null;
  neutralRate: number | null;
  yieldCurveSpread: number | null;
  yieldCurveSlope: number | null;
  termPremium: number | null;
  fisherEquation: number | null;
  nominalRiskFreeRate: number | null;
  expectedRealRate: number | null;

  // Monetary (8 metrics)
  m1MoneySupply: number | null;
  m2MoneySupply: number | null;
  m2Velocity: number | null;
  moneyMultiplier: number | null;
  monetaryBase: number | null;
  excessReserves: number | null;
  quantityTheoryOfMoney: number | null;
  moneyGrowthRate: number | null;

  // FX (4 metrics in macro)
  usdIndex: number | null;
  eurUsd: number | null;
  usdJpy: number | null;
  gbpUsd: number | null;

  // Employment (8 metrics)
  unemploymentRate: number | null;
  laborForceParticipation: number | null;
  employmentPopulationRatio: number | null;
  initialClaims: number | null;
  continuingClaims: number | null;
  nonFarmPayrolls: number | null;
  underemploymentRate: number | null;
  naturalUnemploymentRate: number | null;

  // Wages & Productivity (5 metrics)
  wageGrowth: number | null;
  laborProductivity: number | null;
  unitLaborCosts: number | null;
  realWageGrowth: number | null;
  productivityGrowthRate: number | null;

  // Confidence (4 metrics)
  consumerConfidence: number | null;
  businessConfidence: number | null;
  nfibOptimism: number | null;
  ceoConfidence: number | null;

  // Housing (4 metrics)
  housingStarts: number | null;
  buildingPermits: number | null;
  existingHomeSales: number | null;
  caseShillerIndex: number | null;

  // Manufacturing (6 metrics)
  ism_pmi: number | null;
  ism_services: number | null;
  industrialProduction: number | null;
  capacityUtilization: number | null;
  retailSales: number | null;
  tradeBalance: number | null;

  // Financial Conditions (6 metrics)
  creditSpread: number | null;
  tedSpread: number | null;
  vix: number | null;
  financialStressIndex: number | null;
  chicagoFedIndex: number | null;
  financialConditionsIndex: number | null;

  // Fiscal (4 metrics)
  federalDebt: number | null;
  debtToGDP: number | null;
  budgetDeficit: number | null;
  fiscalImpulse: number | null;
}

/**
 * Trade & FX Parity Metrics (35 metrics)
 */
export interface TradeFXMetrics {
  // Trade Balance (8 metrics)
  termsOfTrade: number | null;
  tradeBalance: number | null;
  currentAccount: number | null;
  capitalAccount: number | null;
  netExports: number | null;
  savingInvestmentGap: number | null;
  exportGrowthRate: number | null;
  importGrowthRate: number | null;

  // Spot FX (5 metrics)
  spotRate: number | null;
  spotRateBid: number | null;
  spotRateAsk: number | null;
  spotRateSpread: number | null;
  spotRateMidpoint: number | null;

  // Forward FX (8 metrics)
  forwardRate1M: number | null;
  forwardRate3M: number | null;
  forwardRate6M: number | null;
  forwardRate1Y: number | null;
  forwardPoints1M: number | null;
  forwardPoints3M: number | null;
  forwardPoints6M: number | null;
  forwardPoints1Y: number | null;

  // Cross Rates (3 metrics)
  crossRate: number | null;
  triangularArbitrage: number | null;
  syntheticCrossRate: number | null;

  // Interest Rate Parity (5 metrics)
  coveredInterestParity: number | null;
  uncoveredInterestParity: number | null;
  forwardPremiumDiscount: number | null;
  carryTradeReturn: number | null;
  interestRateDifferential: number | null;

  // Real Exchange Rate (4 metrics)
  realExchangeRate: number | null;
  purchasingPowerParity: number | null;
  pppDeviation: number | null;
  realEffectiveExchangeRate: number | null;

  // FX Volatility (5 metrics)
  impliedVolatility1M: number | null;
  impliedVolatility3M: number | null;
  historicalVolatility: number | null;
  riskReversal25D: number | null;
  butterflySpread25D: number | null;
}

/**
 * Industry Metrics (15 metrics)
 */
export interface IndustryMetrics {
  industryGrowthRate: number | null;
  marketSize: number | null;
  marketShare: number | null;
  hhiIndex: number | null;           // Herfindahl-Hirschman Index
  cr4: number | null;                // Top 4 Concentration Ratio
  cr8: number | null;                // Top 8 Concentration Ratio
  industryPE: number | null;
  industryPB: number | null;
  industryROE: number | null;
  industryROIC: number | null;
  industryGrossMargin: number | null;
  industryBeta: number | null;
  relativeValuation: number | null;  // Company vs Industry
  sectorRotationScore: number | null;
  competitivePosition: number | null;
}

/**
 * Liquidity Ratios (12 metrics)
 */
export interface LiquidityMetrics {
  currentRatio: number | null;
  quickRatio: number | null;
  cashRatio: number | null;
  daysSalesOutstanding: number | null;
  daysInventoryOutstanding: number | null;
  daysPayablesOutstanding: number | null;
  cashConversionCycle: number | null;
  
  // Extended Liquidity
  absoluteLiquidityRatio: number | null;
  defensiveInterval: number | null;
  netWorkingCapitalRatio: number | null;
  operatingCashFlowRatio: number | null;
  cashBurnRate: number | null;
}

/**
 * Leverage / Solvency Ratios (15 metrics)
 */
export interface LeverageMetrics {
  debtToAssets: number | null;
  debtToEquity: number | null;
  financialDebtToEquity: number | null;
  interestCoverage: number | null;
  debtServiceCoverage: number | null;
  equityMultiplier: number | null;
  debtToEBITDA: number | null;
  
  // Extended Leverage
  netDebtToEBITDA: number | null;
  debtToCapital: number | null;
  longTermDebtRatio: number | null;
  fixedChargeCoverage: number | null;
  cashFlowCoverage: number | null;
  timesInterestEarned: number | null;
  capitalGearing: number | null;
  debtCapacityUtilization: number | null;
}

/**
 * Activity / Efficiency Ratios (12 metrics)
 */
export interface EfficiencyMetrics {
  totalAssetTurnover: number | null;
  fixedAssetTurnover: number | null;
  inventoryTurnover: number | null;
  receivablesTurnover: number | null;
  payablesTurnover: number | null;
  workingCapitalTurnover: number | null;
  
  // Extended Efficiency
  equityTurnover: number | null;
  capitalEmployedTurnover: number | null;
  cashTurnover: number | null;
  operatingCycle: number | null;
  netTradeCycle: number | null;
  assetUtilization: number | null;
}

/**
 * Profitability Ratios (18 metrics)
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
  
  // Extended Profitability
  roce: number | null;               // Return on Capital Employed
  rona: number | null;               // Return on Net Assets
  cashRoa: number | null;            // Cash Return on Assets
  cashRoe: number | null;            // Cash Return on Equity
  pretaxMargin: number | null;
  ebitMargin: number | null;
  operatingRoa: number | null;
  economicProfit: number | null;     // EVA
  residualIncome: number | null;
  spreadAboveWacc: number | null;    // ROIC - WACC
}

/**
 * DuPont Analysis (12 metrics)
 */
export interface DupontMetrics {
  netProfitMargin: number | null;
  assetTurnover: number | null;
  equityMultiplier: number | null;
  roeDupont: number | null;          // NPM × AT × EM
  operatingMargin: number | null;
  interestBurden: number | null;     // EBT / EBIT
  taxBurden: number | null;          // Net Income / EBT
  
  // Extended 5-Factor DuPont
  taxEfficiency: number | null;
  interestBurdenRatio: number | null;
  operatingProfitMargin: number | null;
  assetTurnoverRatio: number | null;
  financialLeverageRatio: number | null;
}

/**
 * Growth Metrics (20 metrics)
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
  
  // Extended Growth
  netIncomeGrowthYoY: number | null;
  ebitdaGrowthYoY: number | null;
  operatingIncomeGrowth: number | null;
  grossProfitGrowth: number | null;
  assetGrowthRate: number | null;
  equityGrowthRate: number | null;
  bookValueGrowthRate: number | null;
  eps3YearCAGR: number | null;
  eps5YearCAGR: number | null;
  internalGrowthRate: number | null;
  plowbackRatio: number | null;
}

/**
 * Cash Flow Metrics (18 metrics)
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
  
  // Extended Cash Flow
  leveredFreeCashFlow: number | null;
  unleveredFreeCashFlow: number | null;
  fcfMargin: number | null;
  fcfYield: number | null;
  fcfToDebt: number | null;
  fcfToEquity: number | null;
  operatingCashFlowMargin: number | null;
  capexToRevenue: number | null;
  capexToDepreciation: number | null;
  cashGenerationEfficiency: number | null;
}

/**
 * Valuation Metrics (25 metrics)
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
  
  // Extended Valuation
  priceToFcf: number | null;
  evToFcf: number | null;
  evToOcf: number | null;
  evToInvestedCapital: number | null;
  priceToTangibleBook: number | null;
  enterpriseValuePerShare: number | null;
  marketCapToGdp: number | null;     // Buffett Indicator
  tobin_Q: number | null;            // Market Value / Replacement Cost
  grahamNumber: number | null;
  netCurrentAssetValue: number | null;
  liquidationValue: number | null;
}

/**
 * DCF / Intrinsic Value Metrics (18 metrics)
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
  
  // Extended DCF
  pvOfFcf: number | null;
  pvOfTerminalValue: number | null;
  equityValuePerShare: number | null;
  marginOfSafety: number | null;
  impliedGrowthRate: number | null;
  reverseDcfGrowth: number | null;
  exitMultiple: number | null;
  perpetuityGrowthRate: number | null;
}

/**
 * Risk Metrics (22 metrics)
 */
export interface RiskMetrics {
  beta: number | null;
  standardDeviation: number | null;
  alpha: number | null;
  sharpeRatio: number | null;
  sortinoRatio: number | null;
  maxDrawdown: number | null;
  var95: number | null;              // Value at Risk (95%)
  
  // Extended Risk
  var99: number | null;              // Value at Risk (99%)
  cvar95: number | null;             // Conditional VaR
  cvar99: number | null;             // Conditional VaR 99%
  treynorRatio: number | null;
  informationRatio: number | null;
  trackingError: number | null;
  jensensAlpha: number | null;
  modigliani_M2: number | null;
  omegaRatio: number | null;
  calmarRatio: number | null;
  ulcerIndex: number | null;
  painIndex: number | null;
  tailRatio: number | null;
  upsideCapture: number | null;
  downsideCapture: number | null;
}

/**
 * Technical Indicators (35 metrics)
 */
export interface TechnicalMetrics {
  // Core Technical
  rsi: number | null;                // Relative Strength Index
  macd: number | null;
  macdSignal: number | null;
  macdHistogram: number | null;
  fiftyDayMA: number | null;
  twoHundredDayMA: number | null;
  bollingerUpper: number | null;
  bollingerLower: number | null;
  bollingerMiddle: number | null;
  bollingerWidth: number | null;
  relativeVolume: number | null;
  
  // Extended Technical
  stochastic_K: number | null;
  stochastic_D: number | null;
  williamsR: number | null;
  cci: number | null;                // Commodity Channel Index
  atr: number | null;                // Average True Range
  atrPercent: number | null;
  adx: number | null;                // Average Directional Index
  plusDI: number | null;
  minusDI: number | null;
  obv: number | null;                // On-Balance Volume
  obvTrend: number | null;
  mfi: number | null;                // Money Flow Index
  vwap: number | null;               // Volume Weighted Average Price
  
  // Moving Averages
  ema12: number | null;
  ema26: number | null;
  sma10: number | null;
  sma20: number | null;
  sma100: number | null;
  
  // Price Action
  priceToSMA50: number | null;
  priceToSMA200: number | null;
  goldenCross: boolean | null;
  deathCross: boolean | null;
  trendStrength: number | null;
  supportLevel: number | null;
  resistanceLevel: number | null;
}

/**
 * Composite Scores (12 scores, 0-100 scale)
 */
export interface ScoreMetrics {
  profitabilityScore: number | null;
  growthScore: number | null;
  valuationScore: number | null;
  riskScore: number | null;
  healthScore: number | null;
  totalScore: number | null;
  
  // Extended Scores
  momentumScore: number | null;
  qualityScore: number | null;
  stabilityScore: number | null;
  efficiencyScore: number | null;
  solvencyScore: number | null;
  technicalScore: number | null;
}

/**
 * Other Key Metrics (20 metrics)
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
  
  // Extended Other Metrics
  beneishMScore: number | null;      // Earnings manipulation detection
  tangibleBookValuePerShare: number | null;
  revenuePerEmployee: number | null;
  profitPerEmployee: number | null;
  marketCapPerEmployee: number | null;
  enterpriseValuePerEmployee: number | null;
  taxBurdenRatio: number | null;
  operatingRoi: number | null;
  investedCapitalTurnover: number | null;
  totalLeverage: number | null;      // DOL × DFL
}

/**
 * Bond/Fixed Income Metrics (25 metrics)
 */
export interface BondMetrics {
  // Yield Metrics
  couponRate: number | null;
  currentYield: number | null;
  yieldToMaturity: number | null;
  yieldToCall: number | null;
  yieldToWorst: number | null;
  taxEquivalentYield: number | null;
  nominalYield: number | null;
  realYield: number | null;

  // Duration & Convexity
  macaulayDuration: number | null;
  modifiedDuration: number | null;
  effectiveDuration: number | null;
  keyRateDuration: number | null;
  dollarDuration: number | null;
  convexity: number | null;
  effectiveConvexity: number | null;

  // Price Metrics
  cleanPrice: number | null;
  dirtyPrice: number | null;
  accruedInterest: number | null;
  priceValue01: number | null;       // PV01 / DV01

  // Spread Metrics
  gSpread: number | null;            // vs Government
  iSpread: number | null;            // vs Swap
  zSpread: number | null;            // Zero-volatility spread
  oas: number | null;                // Option-Adjusted Spread
  assetSwapSpread: number | null;
  creditSpread: number | null;
}

/**
 * Options Metrics (20 metrics)
 */
export interface OptionsMetrics {
  // Greeks
  delta: number | null;
  gamma: number | null;
  theta: number | null;
  vega: number | null;
  rho: number | null;
  
  // Second Order Greeks
  vanna: number | null;
  volga: number | null;
  charm: number | null;
  
  // Volatility
  impliedVolatility: number | null;
  historicalVolatility: number | null;
  volatilitySkew: number | null;
  volatilitySmile: number | null;
  ivRank: number | null;
  ivPercentile: number | null;
  
  // Options Analysis
  intrinsicValue: number | null;
  timeValue: number | null;
  moneyness: number | null;
  probabilityITM: number | null;
  probabilityOTM: number | null;
  expectedMove: number | null;
}

/**
 * Credit Analysis Metrics (18 metrics)
 */
export interface CreditMetrics {
  // Credit Ratios
  creditRating: string | null;
  creditRatingNumeric: number | null;
  probabilityOfDefault: number | null;
  lossGivenDefault: number | null;
  expectedLoss: number | null;
  
  // Debt Coverage
  fcfToTotalDebt: number | null;
  retainedCashFlowToDebt: number | null;
  ebitdaToInterest: number | null;
  
  // Leverage Analysis
  netLeverage: number | null;
  grossLeverage: number | null;
  securedLeverage: number | null;
  
  // Liquidity
  liquidityCoverage: number | null;
  cashToShortTermDebt: number | null;
  
  // Credit Metrics
  distanceToDefault: number | null;
  creditSpreadDuration: number | null;
  recoveryRate: number | null;
  debtCapacityRatio: number | null;
  mertonsModel: number | null;
}

/**
 * ESG Metrics (15 metrics)
 */
export interface ESGMetrics {
  // Overall
  esgScore: number | null;
  esgRating: string | null;
  
  // Environmental
  environmentalScore: number | null;
  carbonIntensity: number | null;
  carbonFootprint: number | null;
  energyIntensity: number | null;
  waterUsage: number | null;
  wasteGeneration: number | null;
  
  // Social
  socialScore: number | null;
  employeeSatisfaction: number | null;
  diversityRatio: number | null;
  safetyIncidents: number | null;
  
  // Governance
  governanceScore: number | null;
  boardIndependence: number | null;
  executiveCompRatio: number | null;
}

/**
 * Portfolio Analytics (20 metrics)
 */
export interface PortfolioMetrics {
  // Return Metrics
  portfolioReturn: number | null;
  excessReturn: number | null;
  activeReturn: number | null;
  
  // Risk Metrics
  portfolioBeta: number | null;
  portfolioAlpha: number | null;
  portfolioVolatility: number | null;
  systematicRisk: number | null;
  unsystematicRisk: number | null;
  
  // Risk-Adjusted
  portfolioSharpe: number | null;
  portfolioSortino: number | null;
  portfolioTreynor: number | null;
  portfolioInformationRatio: number | null;
  
  // Attribution
  sectorAllocation: number | null;
  securitySelection: number | null;
  interactionEffect: number | null;
  
  // Diversification
  diversificationRatio: number | null;
  effectiveNumberOfBets: number | null;
  herfindahlIndex: number | null;
  correlationWithBenchmark: number | null;
  rSquared: number | null;
}

// ============================================================================
// COMPLETE METRICS INTERFACE
// ============================================================================

/**
 * Complete metrics object containing all 422+ calculated metrics
 */
export interface AllMetrics {
  symbol: string;
  companyName: string;
  sector: string;
  industryName: string;
  timestamp: Date;

  // Core Metric Categories (Original 15)
  macro: MacroMetrics;               // 82 metrics
  industry: IndustryMetrics;         // 15 metrics
  liquidity: LiquidityMetrics;       // 12 metrics
  leverage: LeverageMetrics;         // 15 metrics
  efficiency: EfficiencyMetrics;     // 12 metrics
  profitability: ProfitabilityMetrics; // 18 metrics
  dupont: DupontMetrics;             // 12 metrics
  growth: GrowthMetrics;             // 20 metrics
  cashFlow: CashFlowMetrics;         // 18 metrics
  valuation: ValuationMetrics;       // 25 metrics
  dcf: DCFMetrics;                   // 18 metrics
  risk: RiskMetrics;                 // 22 metrics
  technical: TechnicalMetrics;       // 35 metrics
  scores: ScoreMetrics;              // 12 metrics
  other: OtherMetrics;               // 20 metrics

  // Extended Categories (New)
  tradeFx: TradeFXMetrics;           // 35 metrics
  bonds: BondMetrics;                // 25 metrics
  options: OptionsMetrics;           // 20 metrics
  credit: CreditMetrics;             // 18 metrics
  esg: ESGMetrics;                   // 15 metrics
  portfolio: PortfolioMetrics;       // 20 metrics
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
  wacc?: number;                     // Default: 0.10 (10%) - Weighted Average Cost of Capital
  costOfEquity?: number;             // Default: 0.12 (12%) - Cost of Equity
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
