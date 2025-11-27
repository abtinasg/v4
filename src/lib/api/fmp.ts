import type {
  IncomeStatement,
  BalanceSheet,
  CashFlowStatement,
  KeyMetrics,
  KeyMetricsTTM,
  CompanyProfile,
  FinancialRatios,
  Period,
} from '@/lib/types/financials';

const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3';

function getApiKey(): string {
  const apiKey = process.env.FMP_API_KEY;
  if (!apiKey) {
    throw new Error('FMP_API_KEY environment variable is not set');
  }
  return apiKey;
}

async function fetchFromFMP<T>(endpoint: string): Promise<T> {
  const apiKey = getApiKey();
  const url = `${FMP_BASE_URL}${endpoint}${endpoint.includes('?') ? '&' : '?'}apikey=${apiKey}`;
  
  const response = await fetch(url, {
    next: { revalidate: 86400 }, // Cache for 24 hours
  });

  if (!response.ok) {
    throw new Error(`FMP API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  
  // FMP returns an error message object when there's an issue
  if (data && typeof data === 'object' && 'Error Message' in data) {
    throw new Error(data['Error Message']);
  }

  return data as T;
}

/**
 * Get income statement for a company
 * @param symbol - Stock ticker symbol (e.g., 'AAPL')
 * @param period - 'quarter' or 'annual'
 * @param limit - Number of periods to return (default: 4 for quarterly, 5 for annual)
 */
export async function getIncomeStatement(
  symbol: string,
  period: Period = 'annual',
  limit?: number
): Promise<IncomeStatement[]> {
  const defaultLimit = period === 'quarter' ? 4 : 5;
  const endpoint = `/income-statement/${symbol.toUpperCase()}?period=${period}&limit=${limit ?? defaultLimit}`;
  return fetchFromFMP<IncomeStatement[]>(endpoint);
}

/**
 * Get balance sheet for a company
 * @param symbol - Stock ticker symbol (e.g., 'AAPL')
 * @param period - 'quarter' or 'annual'
 * @param limit - Number of periods to return (default: 4 for quarterly, 5 for annual)
 */
export async function getBalanceSheet(
  symbol: string,
  period: Period = 'annual',
  limit?: number
): Promise<BalanceSheet[]> {
  const defaultLimit = period === 'quarter' ? 4 : 5;
  const endpoint = `/balance-sheet-statement/${symbol.toUpperCase()}?period=${period}&limit=${limit ?? defaultLimit}`;
  return fetchFromFMP<BalanceSheet[]>(endpoint);
}

/**
 * Get cash flow statement for a company
 * @param symbol - Stock ticker symbol (e.g., 'AAPL')
 * @param period - 'quarter' or 'annual'
 * @param limit - Number of periods to return (default: 4 for quarterly, 5 for annual)
 */
export async function getCashFlow(
  symbol: string,
  period: Period = 'annual',
  limit?: number
): Promise<CashFlowStatement[]> {
  const defaultLimit = period === 'quarter' ? 4 : 5;
  const endpoint = `/cash-flow-statement/${symbol.toUpperCase()}?period=${period}&limit=${limit ?? defaultLimit}`;
  return fetchFromFMP<CashFlowStatement[]>(endpoint);
}

/**
 * Get key metrics for a company
 * @param symbol - Stock ticker symbol (e.g., 'AAPL')
 * @param period - 'quarter' or 'annual'
 * @param limit - Number of periods to return (default: 4 for quarterly, 5 for annual)
 */
export async function getKeyMetrics(
  symbol: string,
  period: Period = 'annual',
  limit?: number
): Promise<KeyMetrics[]> {
  const defaultLimit = period === 'quarter' ? 4 : 5;
  const endpoint = `/key-metrics/${symbol.toUpperCase()}?period=${period}&limit=${limit ?? defaultLimit}`;
  return fetchFromFMP<KeyMetrics[]>(endpoint);
}

/**
 * Get TTM (Trailing Twelve Months) key metrics for a company
 * @param symbol - Stock ticker symbol (e.g., 'AAPL')
 */
export async function getKeyMetricsTTM(symbol: string): Promise<KeyMetricsTTM[]> {
  const endpoint = `/key-metrics-ttm/${symbol.toUpperCase()}`;
  return fetchFromFMP<KeyMetricsTTM[]>(endpoint);
}

/**
 * Get company profile
 * @param symbol - Stock ticker symbol (e.g., 'AAPL')
 */
export async function getCompanyProfile(symbol: string): Promise<CompanyProfile | null> {
  const endpoint = `/profile/${symbol.toUpperCase()}`;
  const data = await fetchFromFMP<CompanyProfile[]>(endpoint);
  return data.length > 0 ? data[0] : null;
}

/**
 * Get financial ratios for a company
 * @param symbol - Stock ticker symbol (e.g., 'AAPL')
 * @param period - 'quarter' or 'annual'
 * @param limit - Number of periods to return (default: 4 for quarterly, 5 for annual)
 */
export async function getFinancialRatios(
  symbol: string,
  period: Period = 'annual',
  limit?: number
): Promise<FinancialRatios[]> {
  const defaultLimit = period === 'quarter' ? 4 : 5;
  const endpoint = `/ratios/${symbol.toUpperCase()}?period=${period}&limit=${limit ?? defaultLimit}`;
  return fetchFromFMP<FinancialRatios[]>(endpoint);
}

/**
 * Get all financial data for a company (combined endpoint)
 * @param symbol - Stock ticker symbol (e.g., 'AAPL')
 * @param period - 'quarter' or 'annual'
 */
export async function getAllFinancials(
  symbol: string,
  period: Period = 'annual'
) {
  const [incomeStatement, balanceSheet, cashFlow, keyMetrics, keyMetricsTTM, profile, ratios] =
    await Promise.all([
      getIncomeStatement(symbol, period),
      getBalanceSheet(symbol, period),
      getCashFlow(symbol, period),
      getKeyMetrics(symbol, period),
      getKeyMetricsTTM(symbol),
      getCompanyProfile(symbol),
      getFinancialRatios(symbol, period),
    ]);

  return {
    incomeStatement,
    balanceSheet,
    cashFlow,
    keyMetrics,
    keyMetricsTTM: keyMetricsTTM[0] ?? null,
    profile,
    ratios,
  };
}

// Export types for convenience
export type {
  IncomeStatement,
  BalanceSheet,
  CashFlowStatement,
  KeyMetrics,
  KeyMetricsTTM,
  CompanyProfile,
  FinancialRatios,
  Period,
};
