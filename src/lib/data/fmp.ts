/**
 * Financial Modeling Prep (FMP) API Client
 * 
 * Primary data source for financial metrics
 * Using stable endpoints (not legacy v3)
 */

const FMP_API_KEY = process.env.FMP_API_KEY;
const FMP_BASE_URL = 'https://financialmodelingprep.com/stable';

// Types for FMP responses
export interface FMPProfile {
  symbol: string;
  companyName: string;
  price: number;
  marketCap: number;
  beta: number;
  lastDividend: number;
  range: string;
  change: number;
  changePercentage: number;
  volume: number;
  averageVolume: number;
  currency: string;
  cik: string;
  isin: string;
  cusip: string;
  exchangeFullName: string;
  exchange: string;
  industry: string;
  sector: string;
  website: string;
  description: string;
  ceo: string;
  country: string;
  fullTimeEmployees: number;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  image: string;
  ipoDate: string;
  isEtf: boolean;
  isActivelyTrading: boolean;
  isFund: boolean;
  isAdr: boolean;
}

export interface FMPIncomeStatement {
  date: string;
  symbol: string;
  reportedCurrency: string;
  fiscalYear: string;
  period: string;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  researchAndDevelopmentExpenses: number;
  sellingGeneralAndAdministrativeExpenses: number;
  operatingExpenses: number;
  operatingIncome: number;
  interestIncome: number;
  interestExpense: number;
  ebitda: number;
  ebit: number;
  incomeBeforeTax: number;
  incomeTaxExpense: number;
  netIncome: number;
  eps: number;
  epsDiluted: number;
  weightedAverageShsOut: number;
  weightedAverageShsOutDil: number;
}

export interface FMPBalanceSheet {
  date: string;
  symbol: string;
  reportedCurrency: string;
  fiscalYear: string;
  period: string;
  cashAndCashEquivalents: number;
  shortTermInvestments: number;
  cashAndShortTermInvestments: number;
  netReceivables: number;
  inventory: number;
  otherCurrentAssets: number;
  totalCurrentAssets: number;
  propertyPlantEquipmentNet: number;
  goodwill: number;
  intangibleAssets: number;
  longTermInvestments: number;
  otherNonCurrentAssets: number;
  totalNonCurrentAssets: number;
  totalAssets: number;
  accountPayables: number;
  shortTermDebt: number;
  deferredRevenue: number;
  otherCurrentLiabilities: number;
  totalCurrentLiabilities: number;
  longTermDebt: number;
  deferredRevenueNonCurrent: number;
  otherNonCurrentLiabilities: number;
  totalNonCurrentLiabilities: number;
  totalLiabilities: number;
  commonStock: number;
  retainedEarnings: number;
  totalStockholdersEquity: number;
  totalEquity: number;
  totalLiabilitiesAndStockholdersEquity: number;
  minorityInterest: number;
  totalLiabilitiesAndTotalEquity: number;
}

export interface FMPCashFlow {
  date: string;
  symbol: string;
  reportedCurrency: string;
  fiscalYear: string;
  period: string;
  netIncome: number;
  depreciationAndAmortization: number;
  stockBasedCompensation: number;
  changeInWorkingCapital: number;
  accountsReceivables: number;
  inventory: number;
  accountsPayables: number;
  otherWorkingCapital: number;
  otherNonCashItems: number;
  netCashProvidedByOperatingActivities: number;
  investmentsInPropertyPlantAndEquipment: number;
  acquisitionsNet: number;
  purchasesOfInvestments: number;
  salesMaturitiesOfInvestments: number;
  otherInvestingActivities: number;
  netCashProvidedByInvestingActivities: number;
  debtRepayment: number;
  commonStockIssued: number;
  commonStockRepurchased: number;
  dividendsPaid: number;
  commonDividendsPaid: number;
  netDividendsPaid: number;
  preferredDividendsPaid: number;
  otherFinancingActivities: number;
  netCashProvidedByFinancingActivities: number;
  netChangeInCash: number;
  cashAtEndOfPeriod: number;
  cashAtBeginningOfPeriod: number;
  operatingCashFlow: number;
  capitalExpenditure: number;
  freeCashFlow: number;
}

export interface FMPKeyMetrics {
  symbol: string;
  date: string;
  fiscalYear: string;
  period: string;
  marketCap: number;
  enterpriseValue: number;
  evToSales: number;
  evToOperatingCashFlow: number;
  evToFreeCashFlow: number;
  evToEBITDA: number;
  netDebtToEBITDA: number;
  currentRatio: number;
  incomeQuality: number;
  grahamNumber: number;
  workingCapital: number;
  investedCapital: number;
  returnOnAssets: number;
  returnOnEquity: number;
  returnOnInvestedCapital: number;
  returnOnCapitalEmployed: number;
  earningsYield: number;
  freeCashFlowYield: number;
  capexToOperatingCashFlow: number;
  capexToRevenue: number;
  daysOfSalesOutstanding: number;
  daysOfPayablesOutstanding: number;
  daysOfInventoryOutstanding: number;
  operatingCycle: number;
  cashConversionCycle: number;
  freeCashFlowToEquity: number;
  freeCashFlowToFirm: number;
  tangibleAssetValue: number;
  netCurrentAssetValue: number;
  taxBurden: number;
  interestBurden: number;
}

export interface FMPRatios {
  symbol: string;
  date: string;
  fiscalYear: string;
  period: string;
  grossProfitMargin: number;
  ebitMargin: number;
  ebitdaMargin: number;
  operatingProfitMargin: number;
  pretaxProfitMargin: number;
  netProfitMargin: number;
  receivablesTurnover: number;
  payablesTurnover: number;
  inventoryTurnover: number;
  fixedAssetTurnover: number;
  assetTurnover: number;
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  priceToEarningsRatio: number;
  priceToBookRatio: number;
  priceToSalesRatio: number;
  priceToFreeCashFlowRatio: number;
  priceToOperatingCashFlowRatio: number;
  debtToAssetsRatio: number;
  debtToEquityRatio: number;
  debtToCapitalRatio: number;
  longTermDebtToCapitalRatio: number;
  financialLeverageRatio: number;
  interestCoverageRatio: number;
  dividendPayoutRatio: number;
  dividendYield: number;
  revenuePerShare: number;
  netIncomePerShare: number;
  bookValuePerShare: number;
  operatingCashFlowPerShare: number;
  freeCashFlowPerShare: number;
  effectiveTaxRate: number;
}

export interface FMPQuote {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  avgVolume: number;
  exchange: string;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  earningsAnnouncement: string;
  sharesOutstanding: number;
  timestamp: number;
}

export interface FMPHistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  adjClose: number;
  volume: number;
  unadjustedVolume: number;
  change: number;
  changePercent: number;
  vwap: number;
  label: string;
  changeOverTime: number;
}

// Error type
class FMPError extends Error {
  constructor(message: string, public statusCode?: number) {
    super(message);
    this.name = 'FMPError';
  }
}

// Fetch helper with error handling
async function fmpFetch<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  if (!FMP_API_KEY) {
    throw new FMPError('FMP_API_KEY is not configured');
  }

  const url = new URL(`${FMP_BASE_URL}${endpoint}`);
  url.searchParams.set('apikey', FMP_API_KEY);
  
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  try {
    const response = await fetch(url.toString(), {
      cache: 'force-cache',
    });

    if (!response.ok) {
      throw new FMPError(`FMP API error: ${response.status}`, response.status);
    }

    const data = await response.json();
    
    // Check for FMP error responses
    if (data && data['Error Message']) {
      throw new FMPError(data['Error Message']);
    }

    return data;
  } catch (error) {
    if (error instanceof FMPError) throw error;
    throw new FMPError(`FMP fetch failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get company profile
 */
export async function getProfile(symbol: string): Promise<FMPProfile | null> {
  try {
    const data = await fmpFetch<FMPProfile[]>('/profile', { symbol });
    return data?.[0] || null;
  } catch (error) {
    console.error(`FMP getProfile error for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get real-time quote
 */
export async function getQuote(symbol: string): Promise<FMPQuote | null> {
  try {
    const data = await fmpFetch<FMPQuote[]>('/quote', { symbol });
    return data?.[0] || null;
  } catch (error) {
    console.error(`FMP getQuote error for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get income statements (annual by default)
 */
export async function getIncomeStatements(
  symbol: string, 
  period: 'annual' | 'quarter' = 'annual',
  limit: number = 5
): Promise<FMPIncomeStatement[]> {
  try {
    const data = await fmpFetch<FMPIncomeStatement[]>('/income-statement', { 
      symbol,
      period,
      limit: limit.toString(),
    });
    return data || [];
  } catch (error) {
    console.error(`FMP getIncomeStatements error for ${symbol}:`, error);
    return [];
  }
}

/**
 * Get balance sheet statements (annual by default)
 */
export async function getBalanceSheets(
  symbol: string,
  period: 'annual' | 'quarter' = 'annual',
  limit: number = 5
): Promise<FMPBalanceSheet[]> {
  try {
    const data = await fmpFetch<FMPBalanceSheet[]>('/balance-sheet-statement', {
      symbol,
      period,
      limit: limit.toString(),
    });
    return data || [];
  } catch (error) {
    console.error(`FMP getBalanceSheets error for ${symbol}:`, error);
    return [];
  }
}

/**
 * Get cash flow statements (annual by default)
 */
export async function getCashFlowStatements(
  symbol: string,
  period: 'annual' | 'quarter' = 'annual',
  limit: number = 5
): Promise<FMPCashFlow[]> {
  try {
    const data = await fmpFetch<FMPCashFlow[]>('/cash-flow-statement', {
      symbol,
      period,
      limit: limit.toString(),
    });
    return data || [];
  } catch (error) {
    console.error(`FMP getCashFlowStatements error for ${symbol}:`, error);
    return [];
  }
}

/**
 * Get key metrics
 */
export async function getKeyMetrics(
  symbol: string,
  period: 'annual' | 'quarter' = 'annual',
  limit: number = 5
): Promise<FMPKeyMetrics[]> {
  try {
    const data = await fmpFetch<FMPKeyMetrics[]>('/key-metrics', {
      symbol,
      period,
      limit: limit.toString(),
    });
    return data || [];
  } catch (error) {
    console.error(`FMP getKeyMetrics error for ${symbol}:`, error);
    return [];
  }
}

/**
 * Get financial ratios
 */
export async function getRatios(
  symbol: string,
  period: 'annual' | 'quarter' = 'annual',
  limit: number = 5
): Promise<FMPRatios[]> {
  try {
    const data = await fmpFetch<FMPRatios[]>('/ratios', {
      symbol,
      period,
      limit: limit.toString(),
    });
    return data || [];
  } catch (error) {
    console.error(`FMP getRatios error for ${symbol}:`, error);
    return [];
  }
}

/**
 * Get historical stock prices
 */
export async function getHistoricalPrices(
  symbol: string,
  from?: string,
  to?: string
): Promise<FMPHistoricalPrice[]> {
  try {
    const params: Record<string, string> = { symbol };
    if (from) params.from = from;
    if (to) params.to = to;
    
    const data = await fmpFetch<FMPHistoricalPrice[] | { historical: FMPHistoricalPrice[] }>('/historical-price-eod/full', params);
    
    // Handle both array and object response formats
    if (Array.isArray(data)) {
      return data;
    }
    return data?.historical || [];
  } catch (error) {
    console.error(`FMP getHistoricalPrices error for ${symbol}:`, error);
    return [];
  }
}

/**
 * Get all financial data for a symbol (combines multiple endpoints)
 */
export async function getAllFinancialData(symbol: string): Promise<{
  profile: FMPProfile | null;
  quote: FMPQuote | null;
  incomeStatements: FMPIncomeStatement[];
  balanceSheets: FMPBalanceSheet[];
  cashFlows: FMPCashFlow[];
  keyMetrics: FMPKeyMetrics[];
  ratios: FMPRatios[];
  historicalPrices: FMPHistoricalPrice[];
}> {
  // Get date range for historical prices (1 year)
  const to = new Date().toISOString().split('T')[0];
  const from = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Fetch all data in parallel
  const [
    profile,
    quote,
    incomeStatements,
    balanceSheets,
    cashFlows,
    keyMetrics,
    ratios,
    historicalPrices,
  ] = await Promise.all([
    getProfile(symbol),
    getQuote(symbol),
    getIncomeStatements(symbol, 'annual', 5),
    getBalanceSheets(symbol, 'annual', 5),
    getCashFlowStatements(symbol, 'annual', 5),
    getKeyMetrics(symbol, 'annual', 5),
    getRatios(symbol, 'annual', 5),
    getHistoricalPrices(symbol, from, to),
  ]);

  // Debug logging
  console.log(`[FMP API] ${symbol} Raw Data:`, {
    hasProfile: !!profile,
    hasQuote: !!quote,
    incomeStatementsCount: incomeStatements.length,
    balanceSheetsCount: balanceSheets.length,
    cashFlowsCount: cashFlows.length,
    keyMetricsCount: keyMetrics.length,
    ratiosCount: ratios.length,
    pricesCount: historicalPrices.length,
  });

  return {
    profile,
    quote,
    incomeStatements,
    balanceSheets,
    cashFlows,
    keyMetrics,
    ratios,
    historicalPrices,
  };
}

// Export types
export type {
  FMPError,
};
