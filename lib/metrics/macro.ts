/**
 * Deep Terminal - Macroeconomic Indicators from FRED API
 *
 * 15 macroeconomic indicators:
 * 1. GDP Growth Rate (A191RL1Q225SBEA)
 * 2. Real GDP (GDPC1)
 * 3. Nominal GDP (GDP)
 * 4. GDP per Capita (A939RX0Q048SBEA)
 * 5. CPI - Consumer Price Index (CPIAUCSL)
 * 6. PPI - Producer Price Index (PPIACO)
 * 7. Core Inflation (CPILFESL)
 * 8. Federal Funds Rate (FEDFUNDS)
 * 9. 10-Year Treasury (DGS10)
 * 10. Exchange Rate / USD Index (DTWEXBGS)
 * 11. Unemployment Rate (UNRATE)
 * 12. Wage Growth (CES0500000003)
 * 13. Labor Productivity (OPHNFB)
 * 14. Consumer Confidence (UMCSENT)
 * 15. Business Confidence (BSCICP03USM665S)
 */

import type { MacroMetrics, FREDData } from './types';

// ============================================================================
// FRED API CONFIGURATION
// ============================================================================

const FRED_BASE_URL = 'https://api.stlouisfed.org/fred';

/**
 * FRED Series IDs for all 15 macroeconomic indicators
 */
export const FRED_MACRO_SERIES = {
  GDP_GROWTH_RATE: 'A191RL1Q225SBEA',     // Real GDP Growth Rate (Quarterly)
  REAL_GDP: 'GDPC1',                       // Real Gross Domestic Product
  NOMINAL_GDP: 'GDP',                      // Gross Domestic Product
  GDP_PER_CAPITA: 'A939RX0Q048SBEA',       // Real GDP per Capita
  CPI: 'CPIAUCSL',                         // Consumer Price Index for All Urban Consumers
  PPI: 'PPIACO',                           // Producer Price Index - All Commodities
  CORE_INFLATION: 'CPILFESL',              // CPI Less Food and Energy
  FEDERAL_FUNDS_RATE: 'FEDFUNDS',          // Federal Funds Effective Rate
  TREASURY_10Y: 'DGS10',                   // 10-Year Treasury Constant Maturity Rate
  USD_INDEX: 'DTWEXBGS',                   // Trade Weighted U.S. Dollar Index
  UNEMPLOYMENT_RATE: 'UNRATE',             // Civilian Unemployment Rate
  WAGE_GROWTH: 'CES0500000003',            // Average Hourly Earnings
  LABOR_PRODUCTIVITY: 'OPHNFB',            // Nonfarm Business Sector: Output Per Hour
  CONSUMER_CONFIDENCE: 'UMCSENT',          // University of Michigan Consumer Sentiment
  BUSINESS_CONFIDENCE: 'BSCICP03USM665S',  // OECD Business Confidence Index
} as const;

export type FREDSeriesId = (typeof FRED_MACRO_SERIES)[keyof typeof FRED_MACRO_SERIES];

/**
 * Metadata for each FRED series
 */
export const SERIES_METADATA: Record<
  keyof typeof FRED_MACRO_SERIES,
  {
    name: string;
    unit: string;
    frequency: 'Daily' | 'Monthly' | 'Quarterly' | 'Annual';
    cacheTTL: number; // Time-to-live in seconds
    description: string;
  }
> = {
  GDP_GROWTH_RATE: {
    name: 'GDP Growth Rate',
    unit: '%',
    frequency: 'Quarterly',
    cacheTTL: 86400, // 24 hours
    description: 'Annualized quarterly real GDP growth rate',
  },
  REAL_GDP: {
    name: 'Real GDP',
    unit: 'Billions of Chained 2017 Dollars',
    frequency: 'Quarterly',
    cacheTTL: 86400,
    description: 'Inflation-adjusted gross domestic product',
  },
  NOMINAL_GDP: {
    name: 'Nominal GDP',
    unit: 'Billions of Dollars',
    frequency: 'Quarterly',
    cacheTTL: 86400,
    description: 'Gross domestic product at current prices',
  },
  GDP_PER_CAPITA: {
    name: 'Real GDP per Capita',
    unit: 'Chained 2017 Dollars',
    frequency: 'Quarterly',
    cacheTTL: 86400,
    description: 'Real GDP divided by population',
  },
  CPI: {
    name: 'Consumer Price Index',
    unit: 'Index 1982-84=100',
    frequency: 'Monthly',
    cacheTTL: 86400,
    description: 'Measure of average change in prices paid by urban consumers',
  },
  PPI: {
    name: 'Producer Price Index',
    unit: 'Index 1982=100',
    frequency: 'Monthly',
    cacheTTL: 86400,
    description: 'Measure of average change in selling prices by domestic producers',
  },
  CORE_INFLATION: {
    name: 'Core Inflation (CPI less Food & Energy)',
    unit: 'Index 1982-84=100',
    frequency: 'Monthly',
    cacheTTL: 86400,
    description: 'CPI excluding volatile food and energy prices',
  },
  FEDERAL_FUNDS_RATE: {
    name: 'Federal Funds Rate',
    unit: '%',
    frequency: 'Monthly',
    cacheTTL: 3600, // 1 hour - rates change more frequently
    description: 'Interest rate at which banks lend reserve balances to other banks',
  },
  TREASURY_10Y: {
    name: '10-Year Treasury Yield',
    unit: '%',
    frequency: 'Daily',
    cacheTTL: 3600, // 1 hour
    description: 'Yield on 10-year U.S. Treasury securities',
  },
  USD_INDEX: {
    name: 'U.S. Dollar Index',
    unit: 'Index Jan 2006=100',
    frequency: 'Daily',
    cacheTTL: 3600,
    description: 'Trade-weighted value of the U.S. dollar',
  },
  UNEMPLOYMENT_RATE: {
    name: 'Unemployment Rate',
    unit: '%',
    frequency: 'Monthly',
    cacheTTL: 86400,
    description: 'Percentage of labor force that is unemployed',
  },
  WAGE_GROWTH: {
    name: 'Average Hourly Earnings',
    unit: 'Dollars per Hour',
    frequency: 'Monthly',
    cacheTTL: 86400,
    description: 'Average hourly earnings of all employees',
  },
  LABOR_PRODUCTIVITY: {
    name: 'Labor Productivity',
    unit: 'Index 2012=100',
    frequency: 'Quarterly',
    cacheTTL: 86400,
    description: 'Output per hour of all persons in nonfarm business sector',
  },
  CONSUMER_CONFIDENCE: {
    name: 'Consumer Confidence Index',
    unit: 'Index 1966:Q1=100',
    frequency: 'Monthly',
    cacheTTL: 86400,
    description: 'University of Michigan consumer sentiment index',
  },
  BUSINESS_CONFIDENCE: {
    name: 'Business Confidence Index',
    unit: 'Index',
    frequency: 'Monthly',
    cacheTTL: 86400,
    description: 'OECD business confidence indicator',
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

    const ttl = seriesKey ? SERIES_METADATA[seriesKey].cacheTTL : 86400;

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
 * Fetch all 15 macroeconomic indicators in parallel
 */
export async function fetchAllMacroData(): Promise<FREDData> {
  const [
    gdpGrowthRate,
    realGDP,
    nominalGDP,
    gdpPerCapita,
    cpi,
    ppi,
    coreInflation,
    federalFundsRate,
    treasury10Y,
    usdIndex,
    unemploymentRate,
    wageGrowth,
    laborProductivity,
    consumerConfidence,
    businessConfidence,
  ] = await Promise.all([
    getFredSeries(FRED_MACRO_SERIES.GDP_GROWTH_RATE),
    getFredSeries(FRED_MACRO_SERIES.REAL_GDP),
    getFredSeries(FRED_MACRO_SERIES.NOMINAL_GDP),
    getFredSeries(FRED_MACRO_SERIES.GDP_PER_CAPITA),
    getFredSeries(FRED_MACRO_SERIES.CPI),
    getFredSeries(FRED_MACRO_SERIES.PPI),
    getFredSeries(FRED_MACRO_SERIES.CORE_INFLATION),
    getFredSeries(FRED_MACRO_SERIES.FEDERAL_FUNDS_RATE),
    getFredSeries(FRED_MACRO_SERIES.TREASURY_10Y),
    getFredSeries(FRED_MACRO_SERIES.USD_INDEX),
    getFredSeries(FRED_MACRO_SERIES.UNEMPLOYMENT_RATE),
    getFredSeries(FRED_MACRO_SERIES.WAGE_GROWTH),
    getFredSeries(FRED_MACRO_SERIES.LABOR_PRODUCTIVITY),
    getFredSeries(FRED_MACRO_SERIES.CONSUMER_CONFIDENCE),
    getFredSeries(FRED_MACRO_SERIES.BUSINESS_CONFIDENCE),
  ]);

  return {
    gdpGrowthRate,
    realGDP,
    nominalGDP,
    gdpPerCapita,
    cpi,
    ppi,
    coreInflation,
    federalFundsRate,
    treasury10Y,
    usdIndex,
    unemploymentRate,
    wageGrowth,
    laborProductivity,
    consumerConfidence,
    businessConfidence,
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
    gdpGrowthRate: fredData.gdpGrowthRate,
    realGDP: fredData.realGDP,
    nominalGDP: fredData.nominalGDP,
    gdpPerCapita: fredData.gdpPerCapita,
    cpi: fredData.cpi,
    ppi: fredData.ppi,
    coreInflation: fredData.coreInflation,
    federalFundsRate: fredData.federalFundsRate,
    treasury10Y: fredData.treasury10Y,
    usdIndex: fredData.usdIndex,
    unemploymentRate: fredData.unemploymentRate,
    wageGrowth: fredData.wageGrowth,
    laborProductivity: fredData.laborProductivity,
    consumerConfidence: fredData.consumerConfidence,
    businessConfidence: fredData.businessConfidence,
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
