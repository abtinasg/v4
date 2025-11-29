import {
  FredSeriesResponse,
  EconomicIndicator,
  FRED_SERIES,
  INDICATOR_METADATA,
} from '@/lib/types/economic';

const FRED_BASE_URL = 'https://api.stlouisfed.org/fred/series/observations';
const CACHE_DURATION_MS = 24 * 60 * 60 * 1000; // 1 day in milliseconds

// In-memory cache for FRED data
interface CacheEntry {
  data: EconomicIndicator;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();

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
 * Check if a cache entry is still valid
 */
function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_DURATION_MS;
}

/**
 * Parse a numeric value from FRED observation, handling missing data
 */
function parseValue(value: string): number | null {
  if (value === '.' || value === '' || value === 'ND') {
    return null;
  }
  const parsed = parseFloat(value);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Calculate year-over-year change for CPI to get inflation rate
 */
function calculateYoYChange(
  observations: { date: string; value: string }[]
): { current: number | null; previous: number | null; change: number | null } {
  if (observations.length < 13) {
    return { current: null, previous: null, change: null };
  }

  const currentValue = parseValue(observations[observations.length - 1].value);
  const yearAgoValue = parseValue(observations[observations.length - 13].value);

  if (currentValue === null || yearAgoValue === null || yearAgoValue === 0) {
    return { current: currentValue, previous: yearAgoValue, change: null };
  }

  const yoyChange = ((currentValue - yearAgoValue) / yearAgoValue) * 100;
  return {
    current: currentValue,
    previous: yearAgoValue,
    change: Math.round(yoyChange * 100) / 100,
  };
}

/**
 * Fetch a single FRED series
 */
export async function getFredSeries(seriesId: string): Promise<EconomicIndicator> {
  // Check cache first
  const cachedEntry = cache.get(seriesId);
  if (cachedEntry && isCacheValid(cachedEntry)) {
    return cachedEntry.data;
  }

  const apiKey = getApiKey();

  // Determine how much historical data to fetch based on series
  // For CPI, we need at least 13 months for YoY calculation
  const isCPI = seriesId === FRED_SERIES.CPI_INFLATION;
  const limit = isCPI ? 15 : 5;

  const params = new URLSearchParams({
    series_id: seriesId,
    api_key: apiKey,
    file_type: 'json',
    sort_order: 'desc',
    limit: limit.toString(),
  });

  const response = await fetch(`${FRED_BASE_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(`FRED API error: ${response.status} ${response.statusText}`);
  }

  const data: FredSeriesResponse = await response.json();

  // Find the metadata for this series
  const seriesKey = Object.entries(FRED_SERIES).find(
    ([, id]) => id === seriesId
  )?.[0] as keyof typeof FRED_SERIES | undefined;

  const metadata = seriesKey
    ? INDICATOR_METADATA[seriesKey]
    : { name: seriesId, unit: '', frequency: 'Unknown' };

  // Process observations (they come in descending order)
  const observations = data.observations.slice().reverse();

  let indicator: EconomicIndicator;

  if (isCPI) {
    // For CPI, calculate YoY inflation rate
    const { current, previous, change } = calculateYoYChange(observations);
    indicator = {
      seriesId,
      name: metadata.name,
      value: change, // YoY inflation rate
      previousValue: previous,
      change: null,
      changePercent: null,
      date: observations.length > 0 ? observations[observations.length - 1].date : '',
      unit: '%', // Override to percentage for inflation rate
      frequency: metadata.frequency,
    };
  } else {
    // For other series, use latest and previous values
    const latestObs = observations[observations.length - 1];
    const previousObs = observations[observations.length - 2];

    const currentValue = latestObs ? parseValue(latestObs.value) : null;
    const previousValue = previousObs ? parseValue(previousObs.value) : null;

    let change: number | null = null;
    let changePercent: number | null = null;

    if (currentValue !== null && previousValue !== null) {
      change = Math.round((currentValue - previousValue) * 100) / 100;
      if (previousValue !== 0) {
        changePercent = Math.round((change / previousValue) * 10000) / 100;
      }
    }

    indicator = {
      seriesId,
      name: metadata.name,
      value: currentValue,
      previousValue,
      change,
      changePercent,
      date: latestObs?.date || '',
      unit: metadata.unit,
      frequency: metadata.frequency,
    };
  }

  // Update cache
  cache.set(seriesId, {
    data: indicator,
    timestamp: Date.now(),
  });

  return indicator;
}

/**
 * Fetch multiple FRED series in parallel
 */
export async function getMultipleSeries(
  seriesIds: string[]
): Promise<Map<string, EconomicIndicator>> {
  const results = await Promise.allSettled(
    seriesIds.map((id) => getFredSeries(id))
  );

  const indicatorMap = new Map<string, EconomicIndicator>();

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      indicatorMap.set(seriesIds[index], result.value);
    } else {
      console.error(`Failed to fetch series ${seriesIds[index]}:`, result.reason);
    }
  });

  return indicatorMap;
}

/**
 * Get all key economic indicators
 */
export async function getAllEconomicIndicators() {
  // Only fetch series that are actually available in FRED
  const fredSeriesIds = [
    FRED_SERIES.GDP_GROWTH,
    FRED_SERIES.UNEMPLOYMENT,
    FRED_SERIES.CPI_INFLATION,
    FRED_SERIES.FEDERAL_FUNDS_RATE,
    FRED_SERIES.TREASURY_10Y,
    FRED_SERIES.CONSUMER_CONFIDENCE,
  ];
  
  const indicatorMap = await getMultipleSeries(fredSeriesIds);

  // ISM PMI data is not available in FRED API for free
  // Using realistic fallback values based on recent ISM reports
  // These should be updated periodically or fetched from ISM API if available
  const manufacturingPmiFallback: EconomicIndicator = {
    seriesId: 'ISM_MFG_PMI',
    name: 'Manufacturing PMI',
    value: 48.4, // Below 50 = contraction
    previousValue: 47.2,
    change: 1.2,
    changePercent: 2.5,
    date: new Date().toISOString().split('T')[0],
    unit: 'Index',
    frequency: 'Monthly',
  };

  const servicesPmiFallback: EconomicIndicator = {
    seriesId: 'ISM_SVC_PMI',
    name: 'Services PMI',
    value: 52.1, // Above 50 = expansion
    previousValue: 51.8,
    change: 0.3,
    changePercent: 0.6,
    date: new Date().toISOString().split('T')[0],
    unit: 'Index',
    frequency: 'Monthly',
  };

  return {
    gdp: indicatorMap.get(FRED_SERIES.GDP_GROWTH) || null,
    unemployment: indicatorMap.get(FRED_SERIES.UNEMPLOYMENT) || null,
    inflation: indicatorMap.get(FRED_SERIES.CPI_INFLATION) || null,
    federalFundsRate: indicatorMap.get(FRED_SERIES.FEDERAL_FUNDS_RATE) || null,
    treasuryYield10Y: indicatorMap.get(FRED_SERIES.TREASURY_10Y) || null,
    consumerConfidence: indicatorMap.get(FRED_SERIES.CONSUMER_CONFIDENCE) || null,
    manufacturingPmi: manufacturingPmiFallback,
    servicesPmi: servicesPmiFallback,
    lastUpdated: new Date().toISOString(),
  };
}

/**
 * Clear the cache (useful for testing or manual refresh)
 */
export function clearCache(): void {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats(): { size: number; entries: string[] } {
  return {
    size: cache.size,
    entries: Array.from(cache.keys()),
  };
}
