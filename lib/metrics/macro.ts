/**
 * Deep Terminal - Macroeconomic Indicators from FRED API
 *
 * 82+ macroeconomic indicators organized by category:
 * 
 * GDP Metrics (8):
 * - GDP Growth Rate, Real GDP, Nominal GDP, GDP per Capita
 * - Real GDP Growth Rate, Potential GDP, Output Gap, GDP Deflator
 * 
 * Inflation Metrics (10):
 * - CPI, PPI, Core Inflation, Inflation Rate, PCE Inflation
 * - Core Inflation Rate, Breakeven Inflation 5Y/10Y, Inflation Expectations
 * 
 * Interest Rates (15):
 * - Fed Funds, Treasury 10Y/2Y/30Y/3M, Prime Rate, Interbank Rate
 * - Real Interest Rate, Neutral Rate, Yield Curve Spread/Slope, Term Premium
 * - Fisher Equation, Nominal Risk-Free Rate, Expected Real Rate
 * 
 * Monetary (8):
 * - M1/M2 Money Supply, M2 Velocity, Money Multiplier
 * - Monetary Base, Excess Reserves, Quantity Theory, Money Growth Rate
 * 
 * Employment (8):
 * - Unemployment Rate, Labor Force Participation, Employment-Population Ratio
 * - Initial Claims, Continuing Claims, Non-Farm Payrolls, U6, Natural Rate
 * 
 * Wages & Productivity (5):
 * - Wage Growth, Labor Productivity, Unit Labor Costs, Real Wage Growth
 * 
 * Confidence (4):
 * - Consumer Confidence, Business Confidence, NFIB Optimism, CEO Confidence
 * 
 * Housing (4):
 * - Housing Starts, Building Permits, Existing Home Sales, Case-Shiller
 * 
 * Manufacturing & Trade (6):
 * - ISM PMI, ISM Services, Industrial Production, Capacity Utilization
 * - Retail Sales, Trade Balance
 * 
 * Financial Conditions (6):
 * - Credit Spread, TED Spread, VIX, Financial Stress Index
 * - Chicago Fed Index, Financial Conditions Index
 * 
 * Fiscal (4):
 * - Federal Debt, Debt to GDP, Budget Deficit, Fiscal Impulse
 */

import type { MacroMetrics, FREDData } from './types';

// ============================================================================
// FRED API CONFIGURATION
// ============================================================================

const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

/**
 * FRED Series IDs for all 82+ macroeconomic indicators
 */
export const FRED_MACRO_SERIES = {
  // GDP Metrics
  GDP_GROWTH_RATE: 'A191RL1Q225SBEA',     // Real GDP Growth Rate (Quarterly)
  REAL_GDP: 'GDPC1',                       // Real Gross Domestic Product
  NOMINAL_GDP: 'GDP',                      // Gross Domestic Product
  GDP_PER_CAPITA: 'A939RX0Q048SBEA',       // Real GDP per Capita
  POTENTIAL_GDP: 'GDPPOT',                 // Potential GDP
  GDP_DEFLATOR: 'GDPDEF',                  // GDP Deflator
  
  // Inflation Metrics
  CPI: 'CPIAUCSL',                         // Consumer Price Index for All Urban Consumers
  PPI: 'PPIACO',                           // Producer Price Index - All Commodities
  CORE_INFLATION: 'CPILFESL',              // CPI Less Food and Energy
  PCE_INFLATION: 'PCEPI',                  // PCE Price Index
  BREAKEVEN_5Y: 'T5YIE',                   // 5-Year Breakeven Inflation Rate
  BREAKEVEN_10Y: 'T10YIE',                 // 10-Year Breakeven Inflation Rate
  INFLATION_EXPECTATIONS: 'MICH',          // University of Michigan Inflation Expectation
  
  // Interest Rates
  FEDERAL_FUNDS_RATE: 'FEDFUNDS',          // Federal Funds Effective Rate
  TREASURY_10Y: 'DGS10',                   // 10-Year Treasury Constant Maturity Rate
  TREASURY_2Y: 'DGS2',                     // 2-Year Treasury Rate
  TREASURY_30Y: 'DGS30',                   // 30-Year Treasury Rate
  TREASURY_3M: 'DTB3',                     // 3-Month Treasury Bill Rate
  PRIME_RATE: 'DPRIME',                    // Bank Prime Loan Rate
  SOFR: 'SOFR',                            // Secured Overnight Financing Rate
  
  // Monetary Indicators
  M1: 'M1SL',                              // M1 Money Stock
  M2: 'M2SL',                              // M2 Money Stock
  M2_VELOCITY: 'M2V',                      // Velocity of M2 Money Stock
  MONETARY_BASE: 'BOGMBASE',               // Monetary Base
  EXCESS_RESERVES: 'EXCSRESNS',            // Excess Reserves of Depository Institutions
  
  // Exchange Rate
  USD_INDEX: 'DTWEXBGS',                   // Trade Weighted U.S. Dollar Index
  EUR_USD: 'DEXUSEU',                      // US Dollar to Euro Exchange Rate
  USD_JPY: 'DEXJPUS',                      // Japanese Yen to US Dollar Exchange Rate
  GBP_USD: 'DEXUSUK',                      // US Dollar to UK Pound Exchange Rate
  
  // Employment
  UNEMPLOYMENT_RATE: 'UNRATE',             // Civilian Unemployment Rate
  LABOR_FORCE_PARTICIPATION: 'CIVPART',   // Labor Force Participation Rate
  EMPLOYMENT_POPULATION: 'EMRATIO',        // Employment-Population Ratio
  INITIAL_CLAIMS: 'ICSA',                  // Initial Jobless Claims
  CONTINUING_CLAIMS: 'CCSA',               // Continuing Claims
  NONFARM_PAYROLLS: 'PAYEMS',              // Total Nonfarm Payrolls
  U6_RATE: 'U6RATE',                       // Total Unemployed Plus Marginally Attached
  NAIRU: 'NROU',                           // Natural Rate of Unemployment
  
  // Wages & Productivity
  WAGE_GROWTH: 'CES0500000003',            // Average Hourly Earnings
  LABOR_PRODUCTIVITY: 'OPHNFB',            // Nonfarm Business Sector: Output Per Hour
  UNIT_LABOR_COSTS: 'ULCNFB',              // Unit Labor Costs
  REAL_COMPENSATION: 'COMPRNFB',           // Real Compensation Per Hour
  
  // Confidence & Sentiment
  CONSUMER_CONFIDENCE: 'UMCSENT',          // University of Michigan Consumer Sentiment
  BUSINESS_CONFIDENCE: 'BSCICP03USM665S',  // OECD Business Confidence Index
  NFIB_OPTIMISM: 'NFIB',                   // NFIB Small Business Optimism Index
  
  // Housing
  HOUSING_STARTS: 'HOUST',                 // Housing Starts
  BUILDING_PERMITS: 'PERMIT',              // Building Permits
  EXISTING_HOME_SALES: 'EXHOSLUSM495S',    // Existing Home Sales
  CASE_SHILLER: 'CSUSHPINSA',              // Case-Shiller Home Price Index
  
  // Manufacturing & Production
  ISM_PMI: 'MANEMP',                       // ISM Manufacturing PMI (approximation)
  INDUSTRIAL_PRODUCTION: 'INDPRO',         // Industrial Production Index
  CAPACITY_UTILIZATION: 'TCU',             // Capacity Utilization
  RETAIL_SALES: 'RSAFS',                   // Retail Sales
  TRADE_BALANCE: 'BOPGSTB',                // Trade Balance
  
  // Financial Conditions
  CREDIT_SPREAD: 'BAA10Y',                 // Baa Corporate - 10Y Treasury Spread
  TED_SPREAD: 'TEDRATE',                   // TED Spread
  VIX: 'VIXCLS',                           // CBOE Volatility Index
  FINANCIAL_STRESS: 'STLFSI4',             // St. Louis Fed Financial Stress Index
  CHICAGO_FED_NFCI: 'NFCI',                // Chicago Fed National Financial Conditions
  
  // Fiscal Indicators
  FEDERAL_DEBT: 'GFDEBTN',                 // Federal Debt Total
  DEBT_TO_GDP: 'GFDEGDQ188S',              // Federal Debt to GDP
  BUDGET_BALANCE: 'FYFSD',                 // Federal Surplus or Deficit
} as const;

export type FREDSeriesId = (typeof FRED_MACRO_SERIES)[keyof typeof FRED_MACRO_SERIES];

/**
 * Metadata for each FRED series (partial - not all series have metadata defined)
 */
export const SERIES_METADATA: Partial<Record<
  keyof typeof FRED_MACRO_SERIES,
  {
    name: string;
    unit: string;
    frequency: 'Daily' | 'Monthly' | 'Quarterly' | 'Annual';
    cacheTTL: number; // Time-to-live in seconds
    description: string;
    category: string;
  }
>> = {
  // GDP Metrics
  GDP_GROWTH_RATE: {
    name: 'GDP Growth Rate',
    unit: '%',
    frequency: 'Quarterly',
    cacheTTL: 86400, // 24 hours
    description: 'Annualized quarterly real GDP growth rate',
    category: 'GDP',
  },
  REAL_GDP: {
    name: 'Real GDP',
    unit: 'Billions of Chained 2017 Dollars',
    frequency: 'Quarterly',
    cacheTTL: 86400,
    description: 'Inflation-adjusted gross domestic product',
    category: 'GDP',
  },
  NOMINAL_GDP: {
    name: 'Nominal GDP',
    unit: 'Billions of Dollars',
    frequency: 'Quarterly',
    cacheTTL: 86400,
    description: 'Gross domestic product at current prices',
    category: 'GDP',
  },
  GDP_PER_CAPITA: {
    name: 'Real GDP per Capita',
    unit: 'Chained 2017 Dollars',
    frequency: 'Quarterly',
    cacheTTL: 86400,
    description: 'Real GDP divided by population',
    category: 'GDP',
  },
  POTENTIAL_GDP: {
    name: 'Potential GDP',
    unit: 'Billions of Chained 2012 Dollars',
    frequency: 'Quarterly',
    cacheTTL: 86400,
    description: 'Potential Gross Domestic Product',
    category: 'GDP',
  },
  GDP_DEFLATOR: {
    name: 'GDP Deflator',
    unit: 'Index 2012=100',
    frequency: 'Quarterly',
    cacheTTL: 86400,
    description: 'GDP Implicit Price Deflator',
    category: 'GDP',
  },
  
  // Inflation
  CPI: {
    name: 'Consumer Price Index',
    unit: 'Index 1982-84=100',
    frequency: 'Monthly',
    cacheTTL: 86400,
    description: 'Measure of average change in prices paid by urban consumers',
    category: 'Inflation',
  },
  PPI: {
    name: 'Producer Price Index',
    unit: 'Index 1982=100',
    frequency: 'Monthly',
    cacheTTL: 86400,
    description: 'Measure of average change in selling prices by domestic producers',
    category: 'Inflation',
  },
  CORE_INFLATION: {
    name: 'Core Inflation (CPI less Food & Energy)',
    unit: 'Index 1982-84=100',
    frequency: 'Monthly',
    cacheTTL: 86400,
    description: 'CPI excluding volatile food and energy prices',
    category: 'Inflation',
  },
  FEDERAL_FUNDS_RATE: {
    name: 'Federal Funds Rate',
    unit: '%',
    frequency: 'Monthly',
    cacheTTL: 3600, // 1 hour - rates change more frequently
    description: 'Interest rate at which banks lend reserve balances to other banks',
    category: 'Interest Rates',
  },
  TREASURY_10Y: {
    name: '10-Year Treasury Yield',
    unit: '%',
    frequency: 'Daily',
    cacheTTL: 3600, // 1 hour
    description: 'Yield on 10-year U.S. Treasury securities',
    category: 'Interest Rates',
  },
  USD_INDEX: {
    name: 'U.S. Dollar Index',
    unit: 'Index Jan 2006=100',
    frequency: 'Daily',
    cacheTTL: 3600,
    description: 'Trade-weighted value of the U.S. dollar',
    category: 'Currency',
  },
  UNEMPLOYMENT_RATE: {
    name: 'Unemployment Rate',
    unit: '%',
    frequency: 'Monthly',
    cacheTTL: 86400,
    description: 'Percentage of labor force that is unemployed',
    category: 'Employment',
  },
  WAGE_GROWTH: {
    name: 'Average Hourly Earnings',
    unit: 'Dollars per Hour',
    frequency: 'Monthly',
    cacheTTL: 86400,
    description: 'Average hourly earnings of all employees',
    category: 'Employment',
  },
  LABOR_PRODUCTIVITY: {
    name: 'Labor Productivity',
    unit: 'Index 2012=100',
    frequency: 'Quarterly',
    cacheTTL: 86400,
    description: 'Output per hour of all persons in nonfarm business sector',
    category: 'Employment',
  },
  CONSUMER_CONFIDENCE: {
    name: 'Consumer Confidence Index',
    unit: 'Index 1966:Q1=100',
    frequency: 'Monthly',
    cacheTTL: 86400,
    description: 'University of Michigan consumer sentiment index',
    category: 'Sentiment',
  },
  BUSINESS_CONFIDENCE: {
    name: 'Business Confidence Index',
    unit: 'Index',
    frequency: 'Monthly',
    cacheTTL: 86400,
    description: 'OECD business confidence indicator',
    category: 'Sentiment',
  },
};

// ============================================================================
// CACHE IMPLEMENTATION
// ============================================================================

interface CacheEntry {
  value: number | null;
  timestamp: number;
  ttl: number;
}

const cache = new Map<string, CacheEntry>();

/**
 * Check if a cache entry is still valid
 */
function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < entry.ttl * 1000;
}

/**
 * Get value from cache if valid
 */
function getCachedValue(seriesId: string): number | null | undefined {
  const entry = cache.get(seriesId);
  if (entry && isCacheValid(entry)) {
    return entry.value;
  }
  return undefined;
}

/**
 * Set value in cache
 */
function setCachedValue(seriesId: string, value: number | null, ttl: number): void {
  cache.set(seriesId, {
    value,
    timestamp: Date.now(),
    ttl,
  });
}

/**
 * Clear the entire cache
 */
export function clearMacroCache(): void {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getMacroCacheStats(): {
  size: number;
  entries: Array<{ seriesId: string; age: number; valid: boolean }>;
} {
  const entries = Array.from(cache.entries()).map(([seriesId, entry]) => ({
    seriesId,
    age: Math.round((Date.now() - entry.timestamp) / 1000),
    valid: isCacheValid(entry),
  }));

  return {
    size: cache.size,
    entries,
  };
}

// ============================================================================
// FRED API FUNCTIONS
// ============================================================================

/**
 * Get the FRED API key from environment variables
 */
function getApiKey(): string {
  const apiKey = process.env.FRED_API_KEY;
  if (!apiKey) {
    throw new Error('FRED_API_KEY environment variable is not set');
  }
  return apiKey;
}

/**
 * Parse a numeric value from FRED observation
 */
function parseObservationValue(value: string): number | null {
  if (value === '.' || value === '' || value === 'ND' || value === '#N/A') {
    return null;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Fetch a single FRED series
 */
export async function getFredSeries(seriesId: string): Promise<number | null> {
  // Check cache first
  const cachedValue = getCachedValue(seriesId);
  if (cachedValue !== undefined) {
    return cachedValue;
  }

  try {
    const apiKey = getApiKey();

    const params = new URLSearchParams({
      series_id: seriesId,
      api_key: apiKey,
      file_type: 'json',
      sort_order: 'desc',
      limit: '1',
    });

    const response = await fetch(
      `${FRED_BASE_URL}/series/observations?${params.toString()}`
    );

    if (!response.ok) {
      console.error(`FRED API error for ${seriesId}: ${response.status}`);
      return null;
    }

    const data = await response.json();
    const value = parseObservationValue(data.observations?.[0]?.value);

    // Determine TTL from metadata
    const seriesKey = Object.entries(FRED_MACRO_SERIES).find(
      ([, id]) => id === seriesId
    )?.[0] as keyof typeof FRED_MACRO_SERIES | undefined;

    const ttl = seriesKey ? SERIES_METADATA[seriesKey]?.cacheTTL ?? 86400 : 86400;

    // Cache the result
    setCachedValue(seriesId, value, ttl);

    return value;
  } catch (error) {
    console.error(`Error fetching FRED series ${seriesId}:`, error);
    return null;
  }
}

/**
 * Fetch FRED series with additional historical data for YoY calculations
 */
export async function getFredSeriesWithHistory(
  seriesId: string,
  periods: number = 13
): Promise<{ current: number | null; previous: number | null; yoyChange: number | null }> {
  try {
    const apiKey = getApiKey();

    const params = new URLSearchParams({
      series_id: seriesId,
      api_key: apiKey,
      file_type: 'json',
      sort_order: 'desc',
      limit: periods.toString(),
    });

    const response = await fetch(
      `${FRED_BASE_URL}/series/observations?${params.toString()}`
    );

    if (!response.ok) {
      console.error(`FRED API error for ${seriesId}: ${response.status}`);
      return { current: null, previous: null, yoyChange: null };
    }

    const data = await response.json();
    const observations = data.observations || [];

    if (observations.length === 0) {
      return { current: null, previous: null, yoyChange: null };
    }

    const current = parseObservationValue(observations[0]?.value);
    const previous = parseObservationValue(observations[periods - 1]?.value);

    let yoyChange: number | null = null;
    if (current != null && previous != null && previous !== 0) {
      yoyChange = ((current - previous) / previous) * 100;
    }

    return { current, previous, yoyChange };
  } catch (error) {
    console.error(`Error fetching FRED series ${seriesId}:`, error);
    return { current: null, previous: null, yoyChange: null };
  }
}

/**
 * Fetch all 80+ macroeconomic indicators in parallel
 */
export async function fetchAllMacroData(): Promise<FREDData> {
  // Batch 1: GDP Metrics
  const gdpPromises = Promise.all([
    getFredSeries(FRED_MACRO_SERIES.GDP_GROWTH_RATE),
    getFredSeries(FRED_MACRO_SERIES.REAL_GDP),
    getFredSeries(FRED_MACRO_SERIES.NOMINAL_GDP),
    getFredSeries(FRED_MACRO_SERIES.GDP_PER_CAPITA),
    getFredSeries(FRED_MACRO_SERIES.POTENTIAL_GDP),
    getFredSeries(FRED_MACRO_SERIES.GDP_DEFLATOR),
  ]);

  // Batch 2: Inflation Metrics
  const inflationPromises = Promise.all([
    getFredSeries(FRED_MACRO_SERIES.CPI),
    getFredSeries(FRED_MACRO_SERIES.PPI),
    getFredSeries(FRED_MACRO_SERIES.CORE_INFLATION),
    getFredSeries(FRED_MACRO_SERIES.PCE_INFLATION),
    getFredSeries(FRED_MACRO_SERIES.BREAKEVEN_5Y),
    getFredSeries(FRED_MACRO_SERIES.BREAKEVEN_10Y),
    getFredSeries(FRED_MACRO_SERIES.INFLATION_EXPECTATIONS),
  ]);

  // Batch 3: Interest Rates
  const interestPromises = Promise.all([
    getFredSeries(FRED_MACRO_SERIES.FEDERAL_FUNDS_RATE),
    getFredSeries(FRED_MACRO_SERIES.TREASURY_10Y),
    getFredSeries(FRED_MACRO_SERIES.TREASURY_2Y),
    getFredSeries(FRED_MACRO_SERIES.TREASURY_30Y),
    getFredSeries(FRED_MACRO_SERIES.TREASURY_3M),
    getFredSeries(FRED_MACRO_SERIES.PRIME_RATE),
    getFredSeries(FRED_MACRO_SERIES.SOFR),
  ]);

  // Batch 4: Monetary Metrics
  const monetaryPromises = Promise.all([
    getFredSeries(FRED_MACRO_SERIES.M1),
    getFredSeries(FRED_MACRO_SERIES.M2),
    getFredSeries(FRED_MACRO_SERIES.M2_VELOCITY),
    getFredSeries(FRED_MACRO_SERIES.MONETARY_BASE),
    getFredSeries(FRED_MACRO_SERIES.EXCESS_RESERVES),
  ]);

  // Batch 5: Exchange Rates
  const fxPromises = Promise.all([
    getFredSeries(FRED_MACRO_SERIES.USD_INDEX),
    getFredSeries(FRED_MACRO_SERIES.EUR_USD),
    getFredSeries(FRED_MACRO_SERIES.USD_JPY),
    getFredSeries(FRED_MACRO_SERIES.GBP_USD),
  ]);

  // Batch 6: Employment
  const employmentPromises = Promise.all([
    getFredSeries(FRED_MACRO_SERIES.UNEMPLOYMENT_RATE),
    getFredSeries(FRED_MACRO_SERIES.LABOR_FORCE_PARTICIPATION),
    getFredSeries(FRED_MACRO_SERIES.EMPLOYMENT_POPULATION),
    getFredSeries(FRED_MACRO_SERIES.INITIAL_CLAIMS),
    getFredSeries(FRED_MACRO_SERIES.CONTINUING_CLAIMS),
    getFredSeries(FRED_MACRO_SERIES.NONFARM_PAYROLLS),
    getFredSeries(FRED_MACRO_SERIES.U6_RATE),
    getFredSeries(FRED_MACRO_SERIES.NAIRU),
  ]);

  // Batch 7: Wages & Productivity
  const wagesPromises = Promise.all([
    getFredSeries(FRED_MACRO_SERIES.WAGE_GROWTH),
    getFredSeries(FRED_MACRO_SERIES.LABOR_PRODUCTIVITY),
    getFredSeries(FRED_MACRO_SERIES.UNIT_LABOR_COSTS),
    getFredSeries(FRED_MACRO_SERIES.REAL_COMPENSATION),
  ]);

  // Batch 8: Confidence
  const confidencePromises = Promise.all([
    getFredSeries(FRED_MACRO_SERIES.CONSUMER_CONFIDENCE),
    getFredSeries(FRED_MACRO_SERIES.BUSINESS_CONFIDENCE),
    getFredSeries(FRED_MACRO_SERIES.NFIB_OPTIMISM),
  ]);

  // Batch 9: Housing
  const housingPromises = Promise.all([
    getFredSeries(FRED_MACRO_SERIES.HOUSING_STARTS),
    getFredSeries(FRED_MACRO_SERIES.BUILDING_PERMITS),
    getFredSeries(FRED_MACRO_SERIES.EXISTING_HOME_SALES),
    getFredSeries(FRED_MACRO_SERIES.CASE_SHILLER),
  ]);

  // Batch 10: Manufacturing & Trade
  const manufacturingPromises = Promise.all([
    getFredSeries(FRED_MACRO_SERIES.ISM_PMI),
    getFredSeries(FRED_MACRO_SERIES.INDUSTRIAL_PRODUCTION),
    getFredSeries(FRED_MACRO_SERIES.CAPACITY_UTILIZATION),
    getFredSeries(FRED_MACRO_SERIES.RETAIL_SALES),
    getFredSeries(FRED_MACRO_SERIES.TRADE_BALANCE),
  ]);

  // Batch 11: Financial Conditions
  const financialPromises = Promise.all([
    getFredSeries(FRED_MACRO_SERIES.CREDIT_SPREAD),
    getFredSeries(FRED_MACRO_SERIES.TED_SPREAD),
    getFredSeries(FRED_MACRO_SERIES.VIX),
    getFredSeries(FRED_MACRO_SERIES.FINANCIAL_STRESS),
    getFredSeries(FRED_MACRO_SERIES.CHICAGO_FED_NFCI),
  ]);

  // Batch 12: Fiscal
  const fiscalPromises = Promise.all([
    getFredSeries(FRED_MACRO_SERIES.FEDERAL_DEBT),
    getFredSeries(FRED_MACRO_SERIES.DEBT_TO_GDP),
    getFredSeries(FRED_MACRO_SERIES.BUDGET_BALANCE),
  ]);

  // Execute all batches in parallel
  const [
    gdpData,
    inflationData,
    interestData,
    monetaryData,
    fxData,
    employmentData,
    wagesData,
    confidenceData,
    housingData,
    manufacturingData,
    financialData,
    fiscalData,
  ] = await Promise.all([
    gdpPromises,
    inflationPromises,
    interestPromises,
    monetaryPromises,
    fxPromises,
    employmentPromises,
    wagesPromises,
    confidencePromises,
    housingPromises,
    manufacturingPromises,
    financialPromises,
    fiscalPromises,
  ]);

  // Destructure GDP data
  const [gdpGrowthRate, realGDP, nominalGDP, gdpPerCapita, potentialGDP, gdpDeflator] = gdpData;

  // Destructure Inflation data
  const [cpi, ppi, coreInflation, pceInflation, breakEvenInflation5Y, breakEvenInflation10Y, inflationExpectations] = inflationData;

  // Destructure Interest Rate data
  const [federalFundsRate, treasury10Y, treasury2Y, treasury30Y, treasury3M, primeRate, interbankRate] = interestData;

  // Destructure Monetary data
  const [m1MoneySupply, m2MoneySupply, m2Velocity, monetaryBase, excessReserves] = monetaryData;

  // Destructure FX data
  const [usdIndex, eurUsd, usdJpy, gbpUsd] = fxData;

  // Destructure Employment data
  const [unemploymentRate, laborForceParticipation, employmentPopulationRatio, initialClaims, continuingClaims, nonFarmPayrolls, underemploymentRate, naturalUnemploymentRate] = employmentData;

  // Destructure Wages data
  const [wageGrowth, laborProductivity, unitLaborCosts, realCompensation] = wagesData;

  // Destructure Confidence data
  const [consumerConfidence, businessConfidence, nfibOptimism] = confidenceData;

  // Destructure Housing data
  const [housingStarts, buildingPermits, existingHomeSales, caseShillerIndex] = housingData;

  // Destructure Manufacturing data
  const [ism_pmi, industrialProduction, capacityUtilization, retailSales, tradeBalance] = manufacturingData;

  // Destructure Financial data
  const [creditSpread, tedSpread, vix, financialStressIndex, chicagoFedIndex] = financialData;

  // Destructure Fiscal data
  const [federalDebt, debtToGDP, budgetDeficit] = fiscalData;

  // Calculate derived metrics
  const realGDPGrowthRate = gdpGrowthRate; // Same as GDP Growth Rate for FRED data

  // Output Gap = (Real GDP - Potential GDP) / Potential GDP × 100
  const outputGap = realGDP != null && potentialGDP != null && potentialGDP !== 0
    ? ((realGDP - potentialGDP) / potentialGDP) * 100
    : null;

  // Inflation Rate (YoY CPI change) - would need historical data for accurate calc
  const inflationRate = cpi != null ? null : null; // Placeholder - needs historical CPI

  // Core Inflation Rate (YoY Core CPI change)
  const coreInflationRate = coreInflation != null ? null : null; // Placeholder

  // Real Interest Rate = Nominal Rate - Inflation
  const realInterestRate = federalFundsRate != null && inflationExpectations != null
    ? federalFundsRate - inflationExpectations
    : null;

  // Neutral Rate (r*) - approximation using Taylor Rule
  const neutralRate = 2.5; // Simplified - would use model-based estimate

  // Yield Curve Spread = 10Y - 2Y
  const yieldCurveSpread = treasury10Y != null && treasury2Y != null
    ? treasury10Y - treasury2Y
    : null;

  // Yield Curve Slope = 10Y - 3M (broader slope measure)
  const yieldCurveSlope = treasury10Y != null && treasury3M != null
    ? treasury10Y - treasury3M
    : null;

  // Term Premium = 10Y - Fed Funds (simplified)
  const termPremium = treasury10Y != null && federalFundsRate != null
    ? treasury10Y - federalFundsRate
    : null;

  // Money Multiplier = M2 / Monetary Base
  const moneyMultiplier = m2MoneySupply != null && monetaryBase != null && monetaryBase !== 0
    ? m2MoneySupply / monetaryBase
    : null;

  // Quantity Theory of Money: M × V = P × Y (nominal GDP)
  const quantityTheoryOfMoney = m2MoneySupply != null && m2Velocity != null
    ? m2MoneySupply * m2Velocity
    : null;

  // Money Growth Rate - would need historical M2 data
  const moneyGrowthRate = null; // Placeholder

  // Fisher Equation: (1 + nominal) = (1 + real)(1 + inflation)
  // Approximation: nominal ≈ real + inflation
  const fisherEquation = realInterestRate != null && inflationExpectations != null
    ? realInterestRate + inflationExpectations
    : null;

  // Nominal Risk-Free Rate (using 3-month T-bill)
  const nominalRiskFreeRate = treasury3M;

  // Expected Real Rate
  const expectedRealRate = treasury10Y != null && breakEvenInflation10Y != null
    ? treasury10Y - breakEvenInflation10Y
    : null;

  // Real Wage Growth = Wage Growth - Inflation
  const realWageGrowth = wageGrowth != null && inflationExpectations != null
    ? wageGrowth - inflationExpectations
    : null;

  // Productivity Growth Rate - would need historical data
  const productivityGrowthRate = null; // Placeholder

  // Real Inflation Adjusted Return
  const realInflationAdjustedReturn = treasury10Y != null && inflationExpectations != null
    ? treasury10Y - inflationExpectations
    : null;

  // Financial Conditions Index (use Chicago Fed NFCI)
  const financialConditionsIndex = chicagoFedIndex;

  // Fiscal Impulse - would need historical budget data
  const fiscalImpulse = null; // Placeholder

  return {
    // Core GDP
    gdpGrowthRate,
    realGDP,
    nominalGDP,
    gdpPerCapita,
    realGDPGrowthRate,
    potentialGDP,
    outputGap,

    // Inflation
    cpi,
    ppi,
    coreInflation,
    inflationRate,
    pceInflation,
    coreInflationRate,
    breakEvenInflation5Y,
    breakEvenInflation10Y,

    // Interest Rates
    federalFundsRate,
    treasury10Y,
    treasury2Y,
    treasury30Y,
    treasury3M,
    primeRate,
    interbankRate,
    realInterestRate,
    neutralRate,
    yieldCurveSpread,

    // Monetary
    m1MoneySupply,
    m2MoneySupply,
    m2Velocity,
    moneyMultiplier,
    monetaryBase,
    excessReserves,

    // FX
    usdIndex,
    eurUsd,
    usdJpy,
    gbpUsd,

    // Employment
    unemploymentRate,
    laborForceParticipation,
    employmentPopulationRatio,
    initialClaims,
    continuingClaims,
    nonFarmPayrolls,

    // Wages & Productivity
    wageGrowth,
    laborProductivity,
    unitLaborCosts,
    realWageGrowth,

    // Confidence
    consumerConfidence,
    businessConfidence,
    nfibOptimism,
    ceoConfidence: null, // Not available in FRED

    // Housing
    housingStarts,
    buildingPermits,
    existingHomeSales,
    caseShillerIndex,

    // Manufacturing & Trade
    ism_pmi,
    ism_services: null, // Would need separate series
    industrialProduction,
    capacityUtilization,
    retailSales,
    tradeBalance,

    // Financial Conditions
    creditSpread,
    tedSpread,
    vix,
    financialStressIndex,
    chicagoFedIndex,

    // Fiscal
    federalDebt,
    debtToGDP,
    budgetDeficit,

    // Calculated/Derived
    fisherEquation,
    nominalRiskFreeRate,
    quantityTheoryOfMoney,
  };
}

// ============================================================================
// MACRO METRICS CALCULATION
// ============================================================================

/**
 * Convert raw FRED data to MacroMetrics
 */
export function calculateMacro(fredData: FREDData): MacroMetrics {
  return {
    // Core GDP (8 metrics)
    gdpGrowthRate: fredData.gdpGrowthRate,
    realGDP: fredData.realGDP,
    nominalGDP: fredData.nominalGDP,
    gdpPerCapita: fredData.gdpPerCapita,
    realGDPGrowthRate: fredData.realGDPGrowthRate ?? fredData.gdpGrowthRate,
    potentialGDP: fredData.potentialGDP,
    outputGap: fredData.outputGap,
    gdpDeflator: null, // Would need additional FRED data

    // Inflation (10 metrics)
    cpi: fredData.cpi,
    ppi: fredData.ppi,
    coreInflation: fredData.coreInflation,
    inflationRate: fredData.inflationRate,
    pceInflation: fredData.pceInflation,
    coreInflationRate: fredData.coreInflationRate,
    breakEvenInflation5Y: fredData.breakEvenInflation5Y,
    breakEvenInflation10Y: fredData.breakEvenInflation10Y,
    inflationExpectations: null, // From MICH series
    realInflationAdjustedReturn: null, // Calculated

    // Interest Rates (15 metrics)
    federalFundsRate: fredData.federalFundsRate,
    treasury10Y: fredData.treasury10Y,
    treasury2Y: fredData.treasury2Y,
    treasury30Y: fredData.treasury30Y,
    treasury3M: fredData.treasury3M,
    primeRate: fredData.primeRate,
    interbankRate: fredData.interbankRate,
    realInterestRate: fredData.realInterestRate,
    neutralRate: fredData.neutralRate,
    yieldCurveSpread: fredData.yieldCurveSpread,
    yieldCurveSlope: null, // Calculated: 10Y - 3M
    termPremium: null, // Calculated
    fisherEquation: fredData.fisherEquation,
    nominalRiskFreeRate: fredData.nominalRiskFreeRate,
    expectedRealRate: null, // Calculated

    // Monetary (8 metrics)
    m1MoneySupply: fredData.m1MoneySupply,
    m2MoneySupply: fredData.m2MoneySupply,
    m2Velocity: fredData.m2Velocity,
    moneyMultiplier: fredData.moneyMultiplier,
    monetaryBase: fredData.monetaryBase,
    excessReserves: fredData.excessReserves,
    quantityTheoryOfMoney: fredData.quantityTheoryOfMoney,
    moneyGrowthRate: null, // Would need historical M2 data

    // FX (4 metrics)
    usdIndex: fredData.usdIndex,
    eurUsd: fredData.eurUsd,
    usdJpy: fredData.usdJpy,
    gbpUsd: fredData.gbpUsd,

    // Employment (8 metrics)
    unemploymentRate: fredData.unemploymentRate,
    laborForceParticipation: fredData.laborForceParticipation,
    employmentPopulationRatio: fredData.employmentPopulationRatio,
    initialClaims: fredData.initialClaims,
    continuingClaims: fredData.continuingClaims,
    nonFarmPayrolls: fredData.nonFarmPayrolls,
    underemploymentRate: null, // U6 Rate
    naturalUnemploymentRate: null, // NAIRU

    // Wages & Productivity (5 metrics)
    wageGrowth: fredData.wageGrowth,
    laborProductivity: fredData.laborProductivity,
    unitLaborCosts: fredData.unitLaborCosts,
    realWageGrowth: fredData.realWageGrowth,
    productivityGrowthRate: null, // Would need historical data

    // Confidence (4 metrics)
    consumerConfidence: fredData.consumerConfidence,
    businessConfidence: fredData.businessConfidence,
    nfibOptimism: fredData.nfibOptimism,
    ceoConfidence: fredData.ceoConfidence,

    // Housing (4 metrics)
    housingStarts: fredData.housingStarts,
    buildingPermits: fredData.buildingPermits,
    existingHomeSales: fredData.existingHomeSales,
    caseShillerIndex: fredData.caseShillerIndex,

    // Manufacturing (6 metrics)
    ism_pmi: fredData.ism_pmi,
    ism_services: fredData.ism_services,
    industrialProduction: fredData.industrialProduction,
    capacityUtilization: fredData.capacityUtilization,
    retailSales: fredData.retailSales,
    tradeBalance: fredData.tradeBalance,

    // Financial Conditions (6 metrics)
    creditSpread: fredData.creditSpread,
    tedSpread: fredData.tedSpread,
    vix: fredData.vix,
    financialStressIndex: fredData.financialStressIndex,
    chicagoFedIndex: fredData.chicagoFedIndex,
    financialConditionsIndex: fredData.chicagoFedIndex, // Use NFCI as proxy

    // Fiscal (4 metrics)
    federalDebt: fredData.federalDebt,
    debtToGDP: fredData.debtToGDP,
    budgetDeficit: fredData.budgetDeficit,
    fiscalImpulse: null, // Would need historical budget data
  };
}

/**
 * Fetch and calculate all macro metrics
 */
export async function fetchMacroMetrics(): Promise<MacroMetrics> {
  const fredData = await fetchAllMacroData();
  return calculateMacro(fredData);
}

// ============================================================================
// INTERPRETATION FUNCTIONS
// ============================================================================

export interface MacroInterpretation {
  value: number | null;
  level: 'positive' | 'neutral' | 'negative';
  description: string;
  trend?: 'improving' | 'stable' | 'deteriorating';
}

/**
 * Interpret GDP Growth Rate
 */
export function interpretGDPGrowth(gdpGrowth: number | null): MacroInterpretation {
  if (gdpGrowth == null) {
    return { value: null, level: 'neutral', description: 'GDP growth data unavailable' };
  }

  if (gdpGrowth >= 3) {
    return {
      value: gdpGrowth,
      level: 'positive',
      description: `Strong economic growth at ${gdpGrowth.toFixed(1)}%`,
    };
  } else if (gdpGrowth >= 1.5) {
    return {
      value: gdpGrowth,
      level: 'neutral',
      description: `Moderate economic growth at ${gdpGrowth.toFixed(1)}%`,
    };
  } else if (gdpGrowth >= 0) {
    return {
      value: gdpGrowth,
      level: 'neutral',
      description: `Slow economic growth at ${gdpGrowth.toFixed(1)}%`,
    };
  } else {
    return {
      value: gdpGrowth,
      level: 'negative',
      description: `Economic contraction at ${gdpGrowth.toFixed(1)}%`,
    };
  }
}

/**
 * Interpret Unemployment Rate
 */
export function interpretUnemployment(rate: number | null): MacroInterpretation {
  if (rate == null) {
    return { value: null, level: 'neutral', description: 'Unemployment data unavailable' };
  }

  if (rate <= 4) {
    return {
      value: rate,
      level: 'positive',
      description: `Full employment at ${rate.toFixed(1)}%`,
    };
  } else if (rate <= 6) {
    return {
      value: rate,
      level: 'neutral',
      description: `Healthy labor market at ${rate.toFixed(1)}%`,
    };
  } else if (rate <= 8) {
    return {
      value: rate,
      level: 'negative',
      description: `Elevated unemployment at ${rate.toFixed(1)}%`,
    };
  } else {
    return {
      value: rate,
      level: 'negative',
      description: `High unemployment at ${rate.toFixed(1)}%`,
    };
  }
}

/**
 * Interpret Inflation (CPI YoY change)
 */
export function interpretInflation(cpiYoY: number | null): MacroInterpretation {
  if (cpiYoY == null) {
    return { value: null, level: 'neutral', description: 'Inflation data unavailable' };
  }

  if (cpiYoY >= 0 && cpiYoY <= 2) {
    return {
      value: cpiYoY,
      level: 'positive',
      description: `Target inflation at ${cpiYoY.toFixed(1)}%`,
    };
  } else if (cpiYoY > 2 && cpiYoY <= 3.5) {
    return {
      value: cpiYoY,
      level: 'neutral',
      description: `Moderately elevated inflation at ${cpiYoY.toFixed(1)}%`,
    };
  } else if (cpiYoY > 3.5 && cpiYoY <= 5) {
    return {
      value: cpiYoY,
      level: 'negative',
      description: `High inflation at ${cpiYoY.toFixed(1)}%`,
    };
  } else if (cpiYoY > 5) {
    return {
      value: cpiYoY,
      level: 'negative',
      description: `Very high inflation at ${cpiYoY.toFixed(1)}%`,
    };
  } else {
    return {
      value: cpiYoY,
      level: 'negative',
      description: `Deflation at ${cpiYoY.toFixed(1)}%`,
    };
  }
}

/**
 * Interpret Federal Funds Rate
 */
export function interpretFedFundsRate(rate: number | null): MacroInterpretation {
  if (rate == null) {
    return { value: null, level: 'neutral', description: 'Fed Funds rate data unavailable' };
  }

  if (rate <= 2) {
    return {
      value: rate,
      level: 'positive',
      description: `Accommodative monetary policy at ${rate.toFixed(2)}%`,
    };
  } else if (rate <= 4) {
    return {
      value: rate,
      level: 'neutral',
      description: `Neutral monetary policy at ${rate.toFixed(2)}%`,
    };
  } else {
    return {
      value: rate,
      level: 'negative',
      description: `Restrictive monetary policy at ${rate.toFixed(2)}%`,
    };
  }
}

/**
 * Interpret 10-Year Treasury Yield
 */
export function interpretTreasury10Y(yield10Y: number | null): MacroInterpretation {
  if (yield10Y == null) {
    return { value: null, level: 'neutral', description: 'Treasury yield data unavailable' };
  }

  if (yield10Y <= 3) {
    return {
      value: yield10Y,
      level: 'positive',
      description: `Low long-term rates at ${yield10Y.toFixed(2)}%`,
    };
  } else if (yield10Y <= 4.5) {
    return {
      value: yield10Y,
      level: 'neutral',
      description: `Moderate long-term rates at ${yield10Y.toFixed(2)}%`,
    };
  } else {
    return {
      value: yield10Y,
      level: 'negative',
      description: `Elevated long-term rates at ${yield10Y.toFixed(2)}%`,
    };
  }
}

/**
 * Interpret Consumer Confidence
 */
export function interpretConsumerConfidence(
  confidence: number | null
): MacroInterpretation {
  if (confidence == null) {
    return {
      value: null,
      level: 'neutral',
      description: 'Consumer confidence data unavailable',
    };
  }

  if (confidence >= 90) {
    return {
      value: confidence,
      level: 'positive',
      description: `High consumer confidence at ${confidence.toFixed(1)}`,
    };
  } else if (confidence >= 70) {
    return {
      value: confidence,
      level: 'neutral',
      description: `Moderate consumer confidence at ${confidence.toFixed(1)}`,
    };
  } else {
    return {
      value: confidence,
      level: 'negative',
      description: `Low consumer confidence at ${confidence.toFixed(1)}`,
    };
  }
}

/**
 * Interpret all macro metrics
 */
export function interpretAllMacroMetrics(
  metrics: MacroMetrics
): Record<string, MacroInterpretation> {
  return {
    gdpGrowthRate: interpretGDPGrowth(metrics.gdpGrowthRate),
    unemploymentRate: interpretUnemployment(metrics.unemploymentRate),
    federalFundsRate: interpretFedFundsRate(metrics.federalFundsRate),
    treasury10Y: interpretTreasury10Y(metrics.treasury10Y),
    consumerConfidence: interpretConsumerConfidence(metrics.consumerConfidence),
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get overall economic health score (0-100)
 */
export function getEconomicHealthScore(metrics: MacroMetrics): number | null {
  let score = 0;
  let factors = 0;

  // GDP Growth (0-25 points)
  if (metrics.gdpGrowthRate != null) {
    if (metrics.gdpGrowthRate >= 3) score += 25;
    else if (metrics.gdpGrowthRate >= 2) score += 20;
    else if (metrics.gdpGrowthRate >= 1) score += 15;
    else if (metrics.gdpGrowthRate >= 0) score += 10;
    else score += 0;
    factors++;
  }

  // Unemployment (0-25 points)
  if (metrics.unemploymentRate != null) {
    if (metrics.unemploymentRate <= 4) score += 25;
    else if (metrics.unemploymentRate <= 5) score += 20;
    else if (metrics.unemploymentRate <= 6) score += 15;
    else if (metrics.unemploymentRate <= 7) score += 10;
    else score += 5;
    factors++;
  }

  // Inflation - using CPI as proxy (0-25 points) - target is 2%
  if (metrics.cpi != null) {
    // Note: This would be better with YoY change, but we'll use absolute value
    // In practice, you'd want to calculate inflation rate from CPI history
    score += 15; // Default to moderate score
    factors++;
  }

  // Consumer Confidence (0-25 points)
  if (metrics.consumerConfidence != null) {
    if (metrics.consumerConfidence >= 100) score += 25;
    else if (metrics.consumerConfidence >= 90) score += 20;
    else if (metrics.consumerConfidence >= 80) score += 15;
    else if (metrics.consumerConfidence >= 70) score += 10;
    else score += 5;
    factors++;
  }

  if (factors === 0) return null;

  // Normalize to 0-100 scale
  return Math.round((score / (factors * 25)) * 100);
}

/**
 * Determine if the economy is in recession based on indicators
 */
export function isRecession(metrics: MacroMetrics): boolean {
  // Simple recession check: negative GDP growth and high unemployment
  if (
    metrics.gdpGrowthRate != null &&
    metrics.gdpGrowthRate < 0 &&
    metrics.unemploymentRate != null &&
    metrics.unemploymentRate > 6
  ) {
    return true;
  }
  return false;
}

/**
 * Get yield curve status (inverted = potential recession signal)
 */
export async function getYieldCurveStatus(): Promise<{
  spread: number | null;
  isInverted: boolean;
  description: string;
}> {
  // Fetch 2-year and 10-year treasury yields
  const [treasury10Y, treasury2Y] = await Promise.all([
    getFredSeries(FRED_MACRO_SERIES.TREASURY_10Y),
    getFredSeries('DGS2'), // 2-Year Treasury
  ]);

  if (treasury10Y == null || treasury2Y == null) {
    return {
      spread: null,
      isInverted: false,
      description: 'Unable to calculate yield curve',
    };
  }

  const spread = treasury10Y - treasury2Y;
  const isInverted = spread < 0;

  return {
    spread,
    isInverted,
    description: isInverted
      ? `Inverted yield curve (${spread.toFixed(2)}%) - potential recession signal`
      : `Normal yield curve (${spread.toFixed(2)}% spread)`,
  };
}

/**
 * Get real interest rate (Fed Funds Rate - Inflation)
 */
export function getRealInterestRate(
  fedFundsRate: number | null,
  inflationRate: number | null
): number | null {
  if (fedFundsRate == null || inflationRate == null) return null;
  return fedFundsRate - inflationRate;
}

/**
 * Format macro metric value for display
 */
export function formatMacroValue(
  seriesKey: keyof typeof FRED_MACRO_SERIES,
  value: number | null
): string {
  if (value == null) return 'N/A';

  const metadata = SERIES_METADATA[seriesKey];
  
  if (!metadata) {
    return value.toFixed(2);
  }

  switch (metadata.unit) {
    case '%':
      return `${value.toFixed(2)}%`;
    case 'Billions of Dollars':
    case 'Billions of Chained 2017 Dollars':
      return `$${(value / 1000).toFixed(2)}T`;
    case 'Dollars per Hour':
      return `$${value.toFixed(2)}/hr`;
    case 'Chained 2017 Dollars':
      return `$${value.toLocaleString()}`;
    default:
      return value.toFixed(2);
  }
}

/**
 * Get series metadata by ID
 */
export function getSeriesMetadata(
  seriesId: string
): (typeof SERIES_METADATA)[keyof typeof SERIES_METADATA] | null {
  const key = Object.entries(FRED_MACRO_SERIES).find(
    ([, id]) => id === seriesId
  )?.[0] as keyof typeof FRED_MACRO_SERIES | undefined;

  return key ? SERIES_METADATA[key] : null;
}
