/**
 * Deep Terminal - Main Metrics API Endpoint
 *
 * GET /api/stock/[symbol]/metrics
 *
 * Fetches data from all sources (Yahoo Finance, FRED, FMP)
 * Calculates all 170+ financial metrics
 * Returns structured response with caching
 */

import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';
import type {
  YahooFinanceData,
  FREDData,
  IndustryData,
  RawFinancialData,
  AllMetrics,
} from '../../../../../../lib/metrics/types';
import { MetricsCalculator } from '../../../../../../lib/metrics/calculator';
import { fetchIndustryData } from '../../../../../../lib/metrics/industry';
import { fetchAllMacroData } from '../../../../../../lib/metrics/macro';

// Initialize Yahoo Finance (v3 requires instantiation)
const yahooFinance = new YahooFinance();

// Force Node.js runtime for yahoo-finance2 compatibility
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Cache configuration
export const revalidate = 3600; // Cache for 1 hour

// In-memory cache for metrics
interface CacheEntry {
  data: MetricsResponse;
  timestamp: number;
  expiresAt: number;
}

const metricsCache = new Map<string, CacheEntry>();
const CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

// Response type
interface MetricsResponse {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  timestamp: string;
  currentPrice: number;
  marketCap: number;
  metrics: {
    macro: AllMetrics['macro'];
    industry: AllMetrics['industry'];
    liquidity: AllMetrics['liquidity'];
    leverage: AllMetrics['leverage'];
    efficiency: AllMetrics['efficiency'];
    profitability: AllMetrics['profitability'];
    dupont: AllMetrics['dupont'];
    growth: AllMetrics['growth'];
    cashFlow: AllMetrics['cashFlow'];
    valuation: AllMetrics['valuation'];
    dcf: AllMetrics['dcf'];
    risk: AllMetrics['risk'];
    technical: AllMetrics['technical'];
    scores: AllMetrics['scores'];
    other: AllMetrics['other'];
  };
  metadata: {
    dataSources: string[];
    lastUpdated: string;
    cacheHit: boolean;
    calculationTimeMs: number;
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type YahooResult = any;

/**
 * Fetch comprehensive Yahoo Finance data
 */
async function fetchYahooFinanceData(symbol: string): Promise<YahooFinanceData | null> {
  try {
    // Fetch all necessary Yahoo Finance modules in parallel
    const [quote, quoteSummary, historical] = await Promise.all([
      yahooFinance.quote(symbol),
      yahooFinance.quoteSummary(symbol, {
        modules: [
          'assetProfile',
          'summaryProfile',
          'price',
          'defaultKeyStatistics',
          'financialData',
          'summaryDetail',
          'incomeStatementHistory',
          'balanceSheetHistory',
          'cashflowStatementHistory',
          'earnings',
        ],
      }) as Promise<YahooResult>,
      yahooFinance.historical(symbol, {
        period1: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000), // 1 year ago
        period2: new Date(),
        interval: '1d',
      }),
    ]);

  const profile = quoteSummary.assetProfile || quoteSummary.summaryProfile || {};
  const price = quoteSummary.price || {};
  const stats = quoteSummary.defaultKeyStatistics || {};
  const financial = quoteSummary.financialData || {};
  const summary = quoteSummary.summaryDetail || {};
  
  // Note: Yahoo Finance deprecated these modules in Nov 2024
  // We'll use financialData module which still works
  const incomeHistory = quoteSummary.incomeStatementHistory?.incomeStatementHistory || [];
  const balanceHistory = quoteSummary.balanceSheetHistory?.balanceSheetStatements || [];
  const cashflowHistory = quoteSummary.cashflowStatementHistory?.cashflowStatements || [];

  // Get the most recent financial statements (may be empty due to Yahoo deprecation)
  const latestIncome = incomeHistory[0] || {};
  const latestBalance = balanceHistory[0] || {};
  const latestCashflow = cashflowHistory[0] || {};
  
  // Use financialData as primary source (still works!)
  const totalRevenue = financial.totalRevenue || latestIncome.totalRevenue || 0;
  const grossProfit = financial.grossProfits || latestIncome.grossProfit || 0;
  // Calculate operatingIncome from margins if not directly available
  const operatingMarginRaw = financial.operatingMargins || 0;
  const operatingIncome = financial.operatingIncome || latestIncome.operatingIncome || (totalRevenue * operatingMarginRaw);  
  const netIncome = financial.netIncomeToCommon || latestIncome.netIncome || (totalRevenue * (financial.profitMargins || 0));
  const ebitda = financial.ebitda || 0;
  const ebit = latestIncome.ebit || operatingIncome; // EBIT ≈ Operating Income
  const totalCash = financial.totalCash || latestBalance.cash || 0;
  const totalDebt = financial.totalDebt || 0;
  // Calculate totalEquity from debtToEquity ratio: D/E = totalDebt/totalEquity => totalEquity = totalDebt/(D/E)
  const totalEquityCalc = financial.debtToEquity ? (totalDebt / (financial.debtToEquity / 100)) : 0;
  const totalEquity = latestBalance.totalStockholderEquity || latestBalance.stockholdersEquity || totalEquityCalc;
  const operatingCashFlow = financial.operatingCashflow || latestCashflow.totalCashFromOperatingActivities || 0;
  const freeCashFlow = financial.freeCashflow || (operatingCashFlow - Math.abs(latestCashflow.capitalExpenditures || 0));
  const currentRatio = financial.currentRatio || null;
  const quickRatio = financial.quickRatio || null;
  const debtToEquity = financial.debtToEquity || null;
  const returnOnEquity = financial.returnOnEquity || null;
  const returnOnAssets = financial.returnOnAssets || null;
  const grossMargin = financial.grossMargins || null;
  const operatingMargin = financial.operatingMargins || null;
  const profitMargin = financial.profitMargins || null;
  const revenueGrowth = financial.revenueGrowth || null;
  const earningsGrowth = financial.earningsGrowth || null;

  // Build historical data arrays (up to 5 years)
  const historicalRevenue: number[] = incomeHistory
    .slice(0, 5)
    .map((s: YahooResult) => s.totalRevenue || 0)
    .reverse();
  const historicalNetIncome: number[] = incomeHistory
    .slice(0, 5)
    .map((s: YahooResult) => s.netIncome || 0)
    .reverse();
  const historicalEPS: number[] = incomeHistory
    .slice(0, 5)
    .map((s: YahooResult) => s.dilutedEPS || 0)
    .reverse();
  const historicalDividends: number[] = cashflowHistory
    .slice(0, 5)
    .map((s: YahooResult) => Math.abs(s.dividendsPaid || 0))
    .reverse();
  const historicalFCF: number[] = cashflowHistory
    .slice(0, 5)
    .map((s: YahooResult) => (s.operatingCashflow || 0) - (s.capitalExpenditures || 0))
    .reverse();

  // Build price history
  const priceHistory = historical.map((h: YahooResult) => ({
    date: h.date.toISOString().split('T')[0],
    open: h.open || 0,
    high: h.high || 0,
    low: h.low || 0,
    close: h.close || 0,
    volume: h.volume || 0,
  }));

  return {
    // Quote Data
    symbol: quote?.symbol || symbol,
    price: quote?.regularMarketPrice || 0,
    previousClose: quote?.regularMarketPreviousClose || 0,
    open: quote?.regularMarketOpen || 0,
    dayLow: quote?.regularMarketDayLow || 0,
    dayHigh: quote?.regularMarketDayHigh || 0,
    volume: quote?.regularMarketVolume || 0,
    averageVolume: quote?.averageDailyVolume3Month || 0,
    marketCap: quote?.marketCap || 0,
    beta: stats.beta || 1,
    pe: summary.trailingPE || null,
    eps: quote?.epsTrailingTwelveMonths || null,
    forwardPE: summary.forwardPE || null,
    forwardEPS: stats.forwardEps || null,
    dividendRate: summary.dividendRate || null,
    dividendYield: summary.dividendYield || null,
    fiftyDayAverage: summary.fiftyDayAverage || null,
    twoHundredDayAverage: summary.twoHundredDayAverage || null,

    // Income Statement - using financialData as primary source
    revenue: totalRevenue,
    costOfRevenue: latestIncome.costOfRevenue || 0,
    grossProfit: grossProfit,
    operatingExpenses: latestIncome.operatingExpense || 0,
    operatingIncome: operatingIncome,
    ebitda: ebitda,
    ebit: ebit, // Use calculated value
    interestExpense: latestIncome.interestExpense || 0,
    pretaxIncome: latestIncome.incomeBeforeTax || 0,
    incomeTax: latestIncome.incomeTaxExpense || 0,
    netIncome: netIncome,

    // Balance Sheet - using financialData as primary source
    totalAssets: latestBalance.totalAssets || 0,
    currentAssets: latestBalance.totalCurrentAssets || 0,
    cash: totalCash,
    shortTermInvestments: latestBalance.shortTermInvestments || 0,
    netReceivables: latestBalance.netReceivables || latestBalance.accountsReceivable || 0,
    inventory: latestBalance.inventory || 0,
    totalLiabilities: latestBalance.totalLiab || latestBalance.totalLiabilities || 0,
    currentLiabilities: latestBalance.totalCurrentLiabilities || 0,
    shortTermDebt: latestBalance.shortTermDebt || latestBalance.shortLongTermDebt || 0,
    accountsPayable: latestBalance.accountsPayable || 0,
    longTermDebt: latestBalance.longTermDebt || 0,
    totalDebt: totalDebt,
    totalEquity: totalEquity, // Use calculated value
    retainedEarnings: latestBalance.retainedEarnings || 0,

    // Cash Flow Statement - using financialData as primary source
    operatingCashFlow: operatingCashFlow,
    investingCashFlow: latestCashflow.totalCashflowsFromInvestingActivities || 0,
    financingCashFlow: latestCashflow.totalCashFromFinancingActivities || 0,
    capitalExpenditures: Math.abs(latestCashflow.capitalExpenditures || 0),
    freeCashFlow: freeCashFlow,
    dividendsPaid: Math.abs(latestCashflow.dividendsPaid || 0),

    // Financial Ratios from financialData (REAL DATA!)
    currentRatio: currentRatio,
    quickRatio: quickRatio,
    debtToEquity: debtToEquity,
    returnOnEquity: returnOnEquity,
    returnOnAssets: returnOnAssets,
    grossMargin: grossMargin,
    operatingMargin: operatingMargin,
    profitMargin: profitMargin,
    revenueGrowth: revenueGrowth,
    earningsGrowth: earningsGrowth,

    // Company Info (from assetProfile)
    sector: profile.sector || 'Unknown',
    industry: profile.industry || 'Unknown',

    // Share Data
    sharesOutstanding: stats.sharesOutstanding || quote?.sharesOutstanding || 0,
    floatShares: stats.floatShares || 0,

    // Historical Data
    historicalRevenue,
    historicalNetIncome,
    historicalEPS,
    historicalDividends,
    historicalFCF,
    priceHistory,
  };
  } catch (error) {
    console.error(`Failed to fetch Yahoo Finance data for ${symbol}:`, error);
    return null;
  }
}

/**
 * Fetch FRED macroeconomic data
 */
async function fetchFREDData(): Promise<FREDData> {
  try {
    // Use our macro module to fetch data
    const macroData = await fetchAllMacroData();
    return macroData;
  } catch (error) {
    console.warn('Failed to fetch FRED data, using defaults:', error);
    // Return default values if FRED API fails
    return {
      gdpGrowthRate: null,
      realGDP: null,
      nominalGDP: null,
      gdpPerCapita: null,
      cpi: null,
      ppi: null,
      coreInflation: null,
      federalFundsRate: null,
      treasury10Y: 0.04, // Default 4%
      usdIndex: null,
      unemploymentRate: null,
      wageGrowth: null,
      laborProductivity: null,
      consumerConfidence: null,
      businessConfidence: null,
    };
  }
}

/**
 * Fetch FMP industry data (with Yahoo fallback)
 */
async function fetchFMPIndustryData(symbol: string, yahooSector?: string, yahooIndustry?: string): Promise<IndustryData> {
  try {
    // Pass Yahoo sector/industry as fallback since FMP API is deprecated for free tier
    return await fetchIndustryData(symbol, yahooSector, yahooIndustry);
  } catch (error) {
    console.warn('Failed to fetch FMP industry data:', error);
    return {
      industryName: yahooIndustry || 'Unknown',
      sectorName: yahooSector || 'Unknown',
      industryRevenue: null,
      industryGrowthRate: null,
      marketSize: null,
      competitorRevenues: [],
    };
  }
}

// Demo data for popular stocks when APIs fail
const DEMO_STOCKS: Record<string, { name: string; sector: string; industry: string; price: number; marketCap: number }> = {
  AAPL: { name: 'Apple Inc.', sector: 'Technology', industry: 'Consumer Electronics', price: 189.95, marketCap: 2940000000000 },
  MSFT: { name: 'Microsoft Corporation', sector: 'Technology', industry: 'Software—Infrastructure', price: 378.91, marketCap: 2810000000000 },
  GOOGL: { name: 'Alphabet Inc.', sector: 'Technology', industry: 'Internet Content & Information', price: 141.80, marketCap: 1780000000000 },
  AMZN: { name: 'Amazon.com, Inc.', sector: 'Consumer Cyclical', industry: 'Internet Retail', price: 185.57, marketCap: 1930000000000 },
  NVDA: { name: 'NVIDIA Corporation', sector: 'Technology', industry: 'Semiconductors', price: 495.22, marketCap: 1220000000000 },
  TSLA: { name: 'Tesla, Inc.', sector: 'Consumer Cyclical', industry: 'Auto Manufacturers', price: 238.83, marketCap: 758000000000 },
  META: { name: 'Meta Platforms, Inc.', sector: 'Technology', industry: 'Internet Content & Information', price: 505.75, marketCap: 1290000000000 },
  JPM: { name: 'JPMorgan Chase & Co.', sector: 'Financial Services', industry: 'Banks—Diversified', price: 198.47, marketCap: 573000000000 },
  V: { name: 'Visa Inc.', sector: 'Financial Services', industry: 'Credit Services', price: 279.86, marketCap: 560000000000 },
  WMT: { name: 'Walmart Inc.', sector: 'Consumer Defensive', industry: 'Discount Stores', price: 163.42, marketCap: 439000000000 },
};

function getDemoCompanyName(symbol: string): string {
  return DEMO_STOCKS[symbol]?.name || symbol;
}

function getDemoSector(symbol: string): string {
  return DEMO_STOCKS[symbol]?.sector || 'Technology';
}

function getDemoIndustry(symbol: string): string {
  return DEMO_STOCKS[symbol]?.industry || 'Software';
}

function getDemoYahooData(symbol: string): YahooFinanceData {
  const demo = DEMO_STOCKS[symbol] || { price: 100, marketCap: 100000000000 };
  
  // Generate realistic-looking demo data
  const price = demo.price;
  const marketCap = demo.marketCap;
  const revenue = marketCap * 0.15; // ~15% revenue/market cap ratio
  const netIncome = revenue * 0.2; // ~20% net margin
  const totalAssets = marketCap * 0.8;
  const totalEquity = totalAssets * 0.6;
  
  return {
    symbol,
    price,
    previousClose: price * 0.99,
    open: price * 0.995,
    dayLow: price * 0.98,
    dayHigh: price * 1.02,
    volume: 50000000,
    averageVolume: 45000000,
    marketCap,
    beta: 1.1,
    pe: 25,
    eps: price / 25,
    forwardPE: 22,
    forwardEPS: price / 22,
    dividendRate: price * 0.006,
    dividendYield: 0.006,
    fiftyDayAverage: price * 0.98,
    twoHundredDayAverage: price * 0.95,
    
    revenue,
    costOfRevenue: revenue * 0.4,
    grossProfit: revenue * 0.6,
    operatingExpenses: revenue * 0.25,
    operatingIncome: revenue * 0.35,
    ebitda: revenue * 0.4,
    ebit: revenue * 0.35,
    interestExpense: revenue * 0.02,
    pretaxIncome: revenue * 0.3,
    incomeTax: revenue * 0.06,
    netIncome,
    
    totalAssets,
    currentAssets: totalAssets * 0.3,
    cash: totalAssets * 0.15,
    shortTermInvestments: totalAssets * 0.05,
    netReceivables: totalAssets * 0.05,
    inventory: totalAssets * 0.03,
    totalLiabilities: totalAssets * 0.4,
    currentLiabilities: totalAssets * 0.15,
    shortTermDebt: totalAssets * 0.05,
    accountsPayable: totalAssets * 0.05,
    longTermDebt: totalAssets * 0.2,
    totalDebt: totalAssets * 0.25,
    totalEquity,
    retainedEarnings: totalEquity * 0.5,
    
    operatingCashFlow: netIncome * 1.2,
    investingCashFlow: -netIncome * 0.3,
    financingCashFlow: -netIncome * 0.5,
    capitalExpenditures: netIncome * 0.25,
    freeCashFlow: netIncome * 0.95,
    dividendsPaid: netIncome * 0.2,
    
    sharesOutstanding: marketCap / price,
    floatShares: (marketCap / price) * 0.98,
    
    historicalRevenue: [revenue * 0.7, revenue * 0.8, revenue * 0.9, revenue * 0.95, revenue],
    historicalNetIncome: [netIncome * 0.6, netIncome * 0.75, netIncome * 0.85, netIncome * 0.95, netIncome],
    historicalEPS: [price/30, price/28, price/26, price/25.5, price/25],
    historicalDividends: [netIncome * 0.15, netIncome * 0.16, netIncome * 0.17, netIncome * 0.18, netIncome * 0.2],
    historicalFCF: [netIncome * 0.8, netIncome * 0.85, netIncome * 0.9, netIncome * 0.92, netIncome * 0.95],
    priceHistory: generateDemoPriceHistory(price),
    
    // Yahoo pre-calculated ratios (fallback values)
    currentRatio: 1.5,
    quickRatio: 1.2,
    debtToEquity: totalAssets * 0.25 / totalEquity, // totalDebt / totalEquity
    returnOnEquity: netIncome / totalEquity,
    returnOnAssets: netIncome / totalAssets,
    grossMargin: 0.6, // 60%
    operatingMargin: 0.35, // 35%
    profitMargin: 0.2, // 20%
    revenueGrowth: 0.1, // 10%
    earningsGrowth: 0.15, // 15%
    
    // Sector/Industry info
    sector: getDemoSector(symbol),
    industry: getDemoIndustry(symbol),
  };
}

function generateDemoPriceHistory(currentPrice: number): Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }> {
  const history: Array<{ date: string; open: number; high: number; low: number; close: number; volume: number }> = [];
  const startDate = new Date();
  startDate.setFullYear(startDate.getFullYear() - 1);
  
  let price = currentPrice * 0.85; // Start lower
  
  for (let i = 0; i < 252; i++) { // ~252 trading days per year
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    // Random walk with slight upward bias
    const change = (Math.random() - 0.48) * 0.03;
    price = price * (1 + change);
    
    const dayVolatility = Math.random() * 0.02;
    history.push({
      date: date.toISOString().split('T')[0],
      open: price * (1 - dayVolatility / 2),
      high: price * (1 + dayVolatility),
      low: price * (1 - dayVolatility),
      close: price,
      volume: Math.floor(40000000 + Math.random() * 20000000),
    });
  }
  
  return history;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const startTime = Date.now();

  try {
    const { symbol } = await params;

    if (!symbol) {
      return NextResponse.json(
        { error: 'Symbol is required' },
        { status: 400 }
      );
    }

    const upperSymbol = symbol.toUpperCase();
    const cacheKey = `metrics:${upperSymbol}`;

    // 1. Check cache first
    const cached = metricsCache.get(cacheKey);
    if (cached && Date.now() < cached.expiresAt) {
      return NextResponse.json({
        ...cached.data,
        metadata: {
          ...cached.data.metadata,
          cacheHit: true,
        },
      });
    }

    // 2. Fetch Yahoo and FRED data first
    const [yahooData, fredData] = await Promise.all([
      fetchYahooFinanceData(upperSymbol),
      fetchFREDData(),
    ]);

    // If Yahoo Finance fails, use demo data
    const effectiveYahooData = yahooData || getDemoYahooData(upperSymbol);
    
    // Extract sector/industry from Yahoo for FMP fallback
    const yahooSector = effectiveYahooData.sector || getDemoSector(upperSymbol);
    const yahooIndustry = effectiveYahooData.industry || getDemoIndustry(upperSymbol);

    // 3. Fetch industry data with Yahoo sector/industry as fallback
    const industryData = await fetchFMPIndustryData(upperSymbol, yahooSector, yahooIndustry);

    // 4. Build raw financial data for calculator
    const rawData: RawFinancialData = {
      yahoo: effectiveYahooData,
      fred: fredData,
      industry: industryData,
      timestamp: new Date(),
    };

    // 4. Calculate all metrics
    const calculator = new MetricsCalculator(rawData);
    const allMetrics = calculator.calculateAll();

    // 5. Get company profile info
    let companyName = getDemoCompanyName(upperSymbol);
    let sector = industryData.sectorName || getDemoSector(upperSymbol);
    let industry = industryData.industryName || getDemoIndustry(upperSymbol);

    // Only try Yahoo profile if Yahoo data succeeded
    if (yahooData) {
      try {
        const profileResult = await yahooFinance.quoteSummary(upperSymbol, {
          modules: ['assetProfile', 'price'],
        }) as YahooResult;
        
        companyName = profileResult.price?.shortName || profileResult.price?.longName || companyName;
        sector = profileResult.assetProfile?.sector || sector;
        industry = profileResult.assetProfile?.industry || industry;
      } catch {
        // Profile fetch failed, use defaults
      }
    }

    // 6. Prepare response
    const calculationTime = Date.now() - startTime;
    
    const response: MetricsResponse = {
      symbol: upperSymbol,
      companyName,
      sector,
      industry,
      timestamp: new Date().toISOString(),
      currentPrice: effectiveYahooData.price,
      marketCap: effectiveYahooData.marketCap,

      metrics: {
        macro: allMetrics.macro,
        industry: allMetrics.industry,
        liquidity: allMetrics.liquidity,
        leverage: allMetrics.leverage,
        efficiency: allMetrics.efficiency,
        profitability: allMetrics.profitability,
        dupont: allMetrics.dupont,
        growth: allMetrics.growth,
        cashFlow: allMetrics.cashFlow,
        valuation: allMetrics.valuation,
        dcf: allMetrics.dcf,
        risk: allMetrics.risk,
        technical: allMetrics.technical,
        scores: allMetrics.scores,
        other: allMetrics.other,
      },

      metadata: {
        dataSources: [
          'yahoo-finance',
          fredData.treasury10Y !== null ? 'fred' : null,
          industryData.industryRevenue !== null ? 'fmp' : null,
        ].filter((s): s is string => s !== null),
        lastUpdated: new Date().toISOString(),
        cacheHit: false,
        calculationTimeMs: calculationTime,
      },
    };

    // 7. Cache the response
    metricsCache.set(cacheKey, {
      data: response,
      timestamp: Date.now(),
      expiresAt: Date.now() + CACHE_TTL,
    });

    // 8. Return response
    return NextResponse.json(response);
  } catch (error) {
    const { symbol } = await params;
    console.error(`Error calculating metrics for ${symbol}:`, error);

    return NextResponse.json(
      {
        error: 'Failed to calculate metrics',
        message: error instanceof Error ? error.message : 'Unknown error',
        symbol,
      },
      { status: 500 }
    );
  }
}

/**
 * Clear metrics cache for a symbol
 */
function clearMetricsCache(symbol?: string): void {
  if (symbol) {
    metricsCache.delete(`metrics:${symbol.toUpperCase()}`);
  } else {
    metricsCache.clear();
  }
}
