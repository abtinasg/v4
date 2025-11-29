/**
 * Deep Terminal - Industry Metrics
 *
 * 5 Industry Analysis Metrics:
 * 1. Industry Growth Rate - from FMP API
 * 2. Market Size - from FMP API
 * 3. Market Share - Company Revenue / Total Industry Revenue
 * 4. HHI Index - Herfindahl-Hirschman Index (market concentration)
 * 5. CR4 - Top 4 Concentration Ratio
 */

import type { IndustryMetrics, IndustryData } from './types';
import { safeDivide, safeAdd } from './helpers';

// ============================================================================
// FMP API CONFIGURATION
// ============================================================================

const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';

function getApiKey(): string {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    throw new Error('FMP_API_KEY environment variable is not set');
  }
  return apiKey;
}

// ============================================================================
// FMP API TYPES
// ============================================================================

interface FMPStockScreenerResult {
  symbol: string;
  companyName: string;
  marketCap: number;
  sector: string;
  industry: string;
  beta: number;
  price: number;
  lastAnnualDividend: number;
  volume: number;
  exchange: string;
  exchangeShortName: string;
  country: string;
  isEtf: boolean;
  isActivelyTrading: boolean;
}

interface FMPCompanyProfile {
  symbol: string;
  companyName: string;
  currency: string;
  cik: string;
  isin: string;
  cusip: string;
  exchange: string;
  exchangeShortName: string;
  industry: string;
  website: string;
  description: string;
  ceo: string;
  sector: string;
  country: string;
  fullTimeEmployees: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dcfDiff: number;
  dcf: number;
  image: string;
  ipoDate: string;
  defaultImage: boolean;
  isEtf: boolean;
  isActivelyTrading: boolean;
  isAdr: boolean;
  isFund: boolean;
  mktCap: number;
  lastDiv: number;
  range: string;
  changes: number;
  volAvg: number;
  price: number;
  beta: number;
}

interface FMPIncomeStatement {
  date: string;
  symbol: string;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  operatingIncome: number;
  netIncome: number;
  eps: number;
  period: string;
  calendarYear: string;
}

interface FMPSectorPerformance {
  sector: string;
  changesPercentage: string;
}

// ============================================================================
// FMP API FUNCTIONS
// ============================================================================

/**
 * Fetch data from FMP API
 */
async function fetchFromFMP<T>(endpoint: string): Promise<T> {
  const apiKey = getApiKey();
  const url = `${FMP_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${apiKey}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();

  if (data && typeof data === 'object' && 'Error Message' in data) {
    throw new Error(data['Error Message']);
  }

  return data as T;
}

/**
 * Get company profile to determine industry/sector
 */
export async function getCompanyProfile(symbol: string): Promise<FMPCompanyProfile | null> {
  try {
    const data = await fetchFromFMP<FMPCompanyProfile[]>(`/profile/${symbol.toUpperCase()}`);
    return data.length > 0 ? data[0] : null;
  } catch (error) {
    console.error(`Error fetching company profile for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get companies in the same industry using stock screener
 */
export async function getIndustryPeers(
  industry: string,
  sector: string,
  limit: number = 50
): Promise<FMPStockScreenerResult[]> {
  try {
    // Use stock screener to find peers in the same industry
    const endpoint = `/stock-screener?industry=${encodeURIComponent(industry)}&sector=${encodeURIComponent(sector)}&limit=${limit}&isActivelyTrading=true`;
    const data = await fetchFromFMP<FMPStockScreenerResult[]>(endpoint);
    return data || [];
  } catch (error) {
    console.error(`Error fetching industry peers:`, error);
    return [];
  }
}

/**
 * Get income statement for revenue data
 */
export async function getIncomeStatement(
  symbol: string,
  period: 'annual' | 'quarter' = 'annual',
  limit: number = 1
): Promise<FMPIncomeStatement[]> {
  try {
    const endpoint = `/income-statement/${symbol.toUpperCase()}?period=${period}&limit=${limit}`;
    return await fetchFromFMP<FMPIncomeStatement[]>(endpoint);
  } catch (error) {
    console.error(`Error fetching income statement for ${symbol}:`, error);
    return [];
  }
}

/**
 * Get sector performance data
 */
export async function getSectorPerformance(): Promise<FMPSectorPerformance[]> {
  try {
    return await fetchFromFMP<FMPSectorPerformance[]>('/sector-performance');
  } catch (error) {
    console.error('Error fetching sector performance:', error);
    return [];
  }
}

// ============================================================================
// INDUSTRY METRICS CALCULATIONS
// ============================================================================

/**
 * Calculate Market Share
 * Market Share = Company Revenue / Total Industry Revenue
 *
 * @param companyRevenue - Company's annual revenue
 * @param totalIndustryRevenue - Sum of all industry participants' revenue
 * @returns Market share as decimal (e.g., 0.15 = 15%)
 */
export function calculateMarketShare(
  companyRevenue: number | null,
  totalIndustryRevenue: number | null
): number | null {
  return safeDivide(companyRevenue, totalIndustryRevenue);
}

/**
 * Calculate Herfindahl-Hirschman Index (HHI)
 * HHI = Σ(Market Share of each firm)² × 10,000
 *
 * Interpretation:
 * - HHI < 1,500: Competitive market
 * - 1,500 < HHI < 2,500: Moderately concentrated
 * - HHI > 2,500: Highly concentrated
 *
 * @param marketShares - Array of market shares as decimals (e.g., [0.25, 0.20, 0.15, ...])
 * @returns HHI index (0-10,000 scale)
 */
export function calculateHHI(marketShares: number[]): number | null {
  if (!marketShares || marketShares.length === 0) {
    return null;
  }

  // Filter out invalid values
  const validShares = marketShares.filter(
    (share) => share != null && isFinite(share) && share >= 0
  );

  if (validShares.length === 0) {
    return null;
  }

  // HHI = Σ(market share²) × 10,000
  // Market shares should be in decimal form (e.g., 0.25 for 25%)
  const sumOfSquares = validShares.reduce((sum, share) => sum + share * share, 0);

  return sumOfSquares * 10000;
}

/**
 * Get HHI interpretation
 */
export function getHHIInterpretation(hhi: number | null): string {
  if (hhi == null) return 'Unknown';
  if (hhi < 1500) return 'Competitive market';
  if (hhi < 2500) return 'Moderately concentrated';
  return 'Highly concentrated';
}

/**
 * Calculate CR4 (Four-Firm Concentration Ratio)
 * CR4 = Sum of market shares of top 4 firms
 *
 * Interpretation:
 * - CR4 < 40%: Competitive
 * - 40% < CR4 < 60%: Oligopoly
 * - CR4 > 60%: High concentration
 *
 * @param marketShares - Array of market shares as decimals, sorted descending
 * @returns CR4 as decimal (e.g., 0.65 = 65%)
 */
export function calculateCR4(marketShares: number[]): number | null {
  if (!marketShares || marketShares.length === 0) {
    return null;
  }

  // Filter and sort descending
  const validShares = marketShares
    .filter((share) => share != null && isFinite(share) && share >= 0)
    .sort((a, b) => b - a);

  if (validShares.length === 0) {
    return null;
  }

  // Sum top 4 (or all if less than 4)
  const top4 = validShares.slice(0, 4);
  return safeAdd(...top4);
}

/**
 * Get CR4 interpretation
 */
export function getCR4Interpretation(cr4: number | null): string {
  if (cr4 == null) return 'Unknown';
  if (cr4 < 0.4) return 'Competitive';
  if (cr4 < 0.6) return 'Oligopoly';
  return 'High concentration';
}

/**
 * CR8 (8-Firm Concentration Ratio)
 * Sum of market shares of the 8 largest firms
 */
export function calculateCR8(marketShares: number[]): number | null {
  if (!marketShares || marketShares.length === 0) {
    return null;
  }

  // Filter and sort descending
  const validShares = marketShares
    .filter((share) => share != null && isFinite(share) && share >= 0)
    .sort((a, b) => b - a);

  if (validShares.length === 0) {
    return null;
  }

  // Sum top 8 (or all if less than 8)
  const top8 = validShares.slice(0, 8);
  return safeAdd(...top8);
}

// ============================================================================
// MAIN INDUSTRY DATA FETCHER
// ============================================================================

/**
 * Fetch industry data for a given company
 * Gets peers, calculates market shares, and computes concentration metrics
 */
export async function fetchIndustryData(symbol: string, yahooSector?: string, yahooIndustry?: string): Promise<IndustryData> {
  const defaultExtended = {
    industryPE: null,
    industryPB: null,
    industryROE: null,
    industryROIC: null,
    industryGrossMargin: null,
    industryOperatingMargin: null,
    industryNetMargin: null,
    industryDebtToEquity: null,
    industryCurrentRatio: null,
    industryBeta: null,
    industryDividendYield: null,
    sectorPE: null,
    sectorGrowthRate: null,
  };

  // If Yahoo provided sector/industry, use those (FMP API is deprecated)
  if (yahooSector || yahooIndustry) {
    return {
      industryName: yahooIndustry || 'Unknown',
      sectorName: yahooSector || 'Unknown',
      industryRevenue: null,
      industryGrowthRate: null,
      marketSize: null,
      competitorRevenues: [],
      ...defaultExtended,
    };
  }

  // Try FMP API (may fail with 403 for free tier)
  try {
    const profile = await getCompanyProfile(symbol);

    if (!profile) {
      return {
        industryName: 'Unknown',
        sectorName: 'Unknown',
        industryRevenue: null,
        industryGrowthRate: null,
        marketSize: null,
        competitorRevenues: [],
        ...defaultExtended,
      };
    }

    const { industry, sector } = profile;

    // Get industry peers
    const peers = await getIndustryPeers(industry, sector, 50);

    // Filter for valid tickers and include the target company
    const peerSymbols = peers
      .map((p) => p.symbol)
      .filter((s) => s && s.length > 0);

    // Ensure target company is included
    if (!peerSymbols.includes(symbol.toUpperCase())) {
      peerSymbols.unshift(symbol.toUpperCase());
    }

    // Fetch revenue for all peers (batch in groups to avoid rate limiting)
    const competitorRevenues: { symbol: string; revenue: number }[] = [];
    const batchSize = 10;

    for (let i = 0; i < peerSymbols.length; i += batchSize) {
      const batch = peerSymbols.slice(i, i + batchSize);
      const revenuePromises = batch.map(async (sym) => {
        const income = await getIncomeStatement(sym, 'annual', 1);
        if (income.length > 0 && income[0].revenue > 0) {
          return { symbol: sym, revenue: income[0].revenue };
        }
        return null;
      });

      const results = await Promise.all(revenuePromises);
      results.forEach((r) => {
        if (r) competitorRevenues.push(r);
      });
    }

    // Calculate total industry revenue (sum of all peer revenues)
    const industryRevenue = competitorRevenues.reduce((sum, c) => sum + c.revenue, 0);

    // Estimate market size from total market caps
    const marketSize = peers.reduce((sum, p) => sum + (p.marketCap || 0), 0);

    // Get sector performance for growth rate proxy
    const sectorPerf = await getSectorPerformance();
    const sectorData = sectorPerf.find(
      (s) => s.sector.toLowerCase() === sector.toLowerCase()
    );
    const industryGrowthRate = sectorData
      ? parseFloat(sectorData.changesPercentage) / 100
      : null;

    return {
      industryName: industry,
      sectorName: sector,
      industryRevenue: industryRevenue > 0 ? industryRevenue : null,
      industryGrowthRate,
      marketSize: marketSize > 0 ? marketSize : null,
      competitorRevenues,
      ...defaultExtended,
    };
  } catch (error) {
    console.error('FMP API failed, returning basic industry data:', error);
    return {
      industryName: yahooIndustry || 'Unknown',
      sectorName: yahooSector || 'Unknown',
      industryRevenue: null,
      industryGrowthRate: null,
      marketSize: null,
      competitorRevenues: [],
      ...defaultExtended,
    };
  }
}

// ============================================================================
// MAIN CALCULATOR
// ============================================================================

/**
 * Calculate all industry metrics for a company
 */
export async function calculateIndustryMetrics(
  symbol: string,
  industryData?: IndustryData
): Promise<IndustryMetrics> {
  // Fetch industry data if not provided
  const data = industryData || (await fetchIndustryData(symbol));

  // Get company's revenue
  const companyData = data.competitorRevenues.find(
    (c) => c.symbol.toUpperCase() === symbol.toUpperCase()
  );
  const companyRevenue = companyData?.revenue || null;

  // Calculate market shares for all competitors
  const marketShares = data.competitorRevenues.map((c) =>
    calculateMarketShare(c.revenue, data.industryRevenue)
  ).filter((share): share is number => share !== null);

  // Calculate company's market share
  const marketShare = calculateMarketShare(companyRevenue, data.industryRevenue);

  // Calculate HHI
  const hhiIndex = calculateHHI(marketShares);

  // Calculate CR4
  const cr4 = calculateCR4(marketShares);

  // Calculate CR8
  const cr8 = calculateCR8(marketShares);

  return {
    industryGrowthRate: data.industryGrowthRate,
    marketSize: data.marketSize,
    marketShare,
    hhiIndex,
    cr4,
    cr8,
    industryPE: data.industryPE,
    industryPB: data.industryPB,
    industryROE: data.industryROE,
    industryROIC: data.industryROIC,
    industryGrossMargin: data.industryGrossMargin,
    industryBeta: data.industryBeta,
    relativeValuation: null,
    sectorRotationScore: null,
    competitivePosition: null,
  };
}

/**
 * Calculate industry metrics from pre-loaded data
 * Use this when you already have the industry data loaded
 */
export function calculateIndustryMetricsFromData(
  companyRevenue: number | null,
  industryData: IndustryData
): IndustryMetrics {
  // Calculate market shares for all competitors
  const marketShares = industryData.competitorRevenues
    .map((c) => calculateMarketShare(c.revenue, industryData.industryRevenue))
    .filter((share): share is number => share !== null);

  // Calculate company's market share
  const marketShare = calculateMarketShare(companyRevenue, industryData.industryRevenue);

  // Calculate HHI
  const hhiIndex = calculateHHI(marketShares);

  // Calculate CR4
  const cr4 = calculateCR4(marketShares);

  // Calculate CR8
  const cr8 = calculateCR8(marketShares);

  return {
    industryGrowthRate: industryData.industryGrowthRate,
    marketSize: industryData.marketSize,
    marketShare,
    hhiIndex,
    cr4,
    cr8,
    industryPE: industryData.industryPE,
    industryPB: industryData.industryPB,
    industryROE: industryData.industryROE,
    industryROIC: industryData.industryROIC,
    industryGrossMargin: industryData.industryGrossMargin,
    industryBeta: industryData.industryBeta,
    relativeValuation: null,
    sectorRotationScore: null,
    competitivePosition: null,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Get detailed industry analysis with interpretations
 */
export function getIndustryAnalysis(metrics: IndustryMetrics): {
  metrics: IndustryMetrics;
  interpretations: {
    marketShare: string;
    concentration: string;
    competitiveness: string;
  };
  rankings: {
    isMarketLeader: boolean;
    isTop4: boolean;
  };
} {
  const marketSharePct = metrics.marketShare ? metrics.marketShare * 100 : 0;

  let marketShareInterpretation: string;
  if (marketSharePct >= 30) {
    marketShareInterpretation = 'Market leader with dominant position';
  } else if (marketSharePct >= 15) {
    marketShareInterpretation = 'Strong market position';
  } else if (marketSharePct >= 5) {
    marketShareInterpretation = 'Moderate market presence';
  } else {
    marketShareInterpretation = 'Small market participant';
  }

  return {
    metrics,
    interpretations: {
      marketShare: marketShareInterpretation,
      concentration: getHHIInterpretation(metrics.hhiIndex),
      competitiveness: getCR4Interpretation(metrics.cr4),
    },
    rankings: {
      isMarketLeader: marketSharePct >= 30,
      isTop4: marketSharePct >= 10, // Rough estimate
    },
  };
}

/**
 * Compare company's position against industry averages
 */
export function getCompetitivePosition(
  companyRevenue: number,
  competitorRevenues: { symbol: string; revenue: number }[]
): {
  rank: number;
  totalCompetitors: number;
  percentile: number;
  revenueVsMedian: number | null;
  revenueVsAverage: number | null;
} {
  // Sort revenues descending
  const sortedRevenues = [...competitorRevenues]
    .sort((a, b) => b.revenue - a.revenue);

  // Find company rank
  const rank = sortedRevenues.findIndex((c) => c.revenue <= companyRevenue) + 1;
  const totalCompetitors = sortedRevenues.length;

  // Calculate percentile (higher is better)
  const percentile = ((totalCompetitors - rank + 1) / totalCompetitors) * 100;

  // Calculate vs median
  const revenues = sortedRevenues.map((c) => c.revenue);
  const medianIndex = Math.floor(revenues.length / 2);
  const medianRevenue = revenues.length % 2 === 0
    ? (revenues[medianIndex - 1] + revenues[medianIndex]) / 2
    : revenues[medianIndex];

  // Calculate vs average
  const avgRevenue = revenues.reduce((sum, r) => sum + r, 0) / revenues.length;

  return {
    rank,
    totalCompetitors,
    percentile,
    revenueVsMedian: safeDivide(companyRevenue - medianRevenue, medianRevenue),
    revenueVsAverage: safeDivide(companyRevenue - avgRevenue, avgRevenue),
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  FMPStockScreenerResult,
  FMPCompanyProfile,
  FMPIncomeStatement,
  FMPSectorPerformance,
};
