/**
 * SEC EDGAR API Client
 * Fetches official financial statements from SEC filings (10-K, 10-Q)
 * 
 * API Docs: https://www.sec.gov/edgar/sec-api-documentation
 * 
 * Free, no API key required, no rate limits (be respectful)
 */

const SEC_BASE_URL = 'https://data.sec.gov';
const SEC_SUBMISSIONS_URL = `${SEC_BASE_URL}/submissions`;
const SEC_COMPANY_FACTS_URL = `${SEC_BASE_URL}/api/xbrl/companyfacts`;

// User-Agent is required by SEC
const SEC_HEADERS = {
  'User-Agent': 'DeepTerminal/1.0 (contact@deepterminal.com)',
  'Accept': 'application/json',
};

// CIK mapping for popular stocks (SEC uses CIK instead of ticker)
const CIK_CACHE: Record<string, string> = {
  'AAPL': '0000320193',
  'MSFT': '0000789019',
  'GOOGL': '0001652044',
  'GOOG': '0001652044',
  'AMZN': '0001018724',
  'META': '0001326801',
  'TSLA': '0001318605',
  'NVDA': '0001045810',
  'JPM': '0000019617',
  'V': '0001403161',
  'JNJ': '0000200406',
  'WMT': '0000104169',
  'PG': '0000080424',
  'MA': '0001141391',
  'UNH': '0000731766',
  'HD': '0000354950',
  'DIS': '0001744489',
  'BAC': '0000070858',
  'ADBE': '0000796343',
  'CRM': '0001108524',
  'NFLX': '0001065280',
  'KO': '0000021344',
  'PEP': '0000077476',
  'TMO': '0000097745',
  'COST': '0000909832',
  'CSCO': '0000858877',
  'ABT': '0000001800',
  'AVGO': '0001730168',
  'ACN': '0001467373',
  'MRK': '0000310158',
  'NKE': '0000320187',
  'ORCL': '0001341439',
  'AMD': '0000002488',
  'INTC': '0000050863',
  'QCOM': '0000804328',
  'TXN': '0000097476',
  'IBM': '0000051143',
  'INTU': '0000896878',
  'AMAT': '0000006951',
  'NOW': '0001373715',
  'PYPL': '0001633917',
  'BKNG': '0001075531',
  'ISRG': '0001035267',
  'ADP': '0000008670',
  'REGN': '0000872589',
  'VRTX': '0000875320',
  'MDLZ': '0001103982',
  'GILD': '0000882095',
  'ADI': '0000006281',
  'PANW': '0001327567',
  'LRCX': '0000707549',
  'MU': '0000723125',
  'KLAC': '0000319201',
  'SNPS': '0000883241',
  'CDNS': '0000813672',
  'MRVL': '0001058057',
  'FTNT': '0001262039',
  'WDAY': '0001327811',
  'TEAM': '0001650372',
  'DDOG': '0001561550',
  'ZS': '0001713683',
  'CRWD': '0001535527',
};

export interface SECFinancials {
  // Balance Sheet
  totalAssets: number | null;
  currentAssets: number | null;
  cash: number | null;
  shortTermInvestments: number | null;
  accountsReceivable: number | null;
  inventory: number | null;
  totalLiabilities: number | null;
  currentLiabilities: number | null;
  accountsPayable: number | null;
  shortTermDebt: number | null;
  longTermDebt: number | null;
  totalDebt: number | null;
  totalEquity: number | null;
  retainedEarnings: number | null;
  
  // Income Statement
  revenue: number | null;
  costOfRevenue: number | null;
  grossProfit: number | null;
  operatingExpenses: number | null;
  operatingIncome: number | null;
  netIncome: number | null;
  ebit: number | null;
  interestExpense: number | null;
  incomeTax: number | null;
  
  // Cash Flow
  operatingCashFlow: number | null;
  investingCashFlow: number | null;
  financingCashFlow: number | null;
  capitalExpenditures: number | null;
  dividendsPaid: number | null;
  
  // Shares
  sharesOutstanding: number | null;
  
  // Historical (last 5 years)
  historicalRevenue: number[];
  historicalNetIncome: number[];
  historicalAssets: number[];
  historicalEquity: number[];
  
  // Meta
  fiscalYear: number | null;
  fiscalPeriod: string | null;
  filingDate: string | null;
  cik: string | null;
}

/**
 * Get CIK (Central Index Key) for a ticker symbol
 */
async function getCIK(symbol: string): Promise<string | null> {
  // Check cache first
  const upperSymbol = symbol.toUpperCase();
  if (CIK_CACHE[upperSymbol]) {
    return CIK_CACHE[upperSymbol];
  }
  
  try {
    // Fetch ticker to CIK mapping from SEC
    const response = await fetch(
      `${SEC_BASE_URL}/files/company_tickers.json`,
      { headers: SEC_HEADERS }
    );
    
    if (!response.ok) {
      console.error('Failed to fetch CIK mapping:', response.status);
      return null;
    }
    
    const data = await response.json();
    
    // Find the ticker in the mapping
    for (const key of Object.keys(data)) {
      const company = data[key];
      if (company.ticker === upperSymbol) {
        // Pad CIK to 10 digits
        const cik = String(company.cik_str).padStart(10, '0');
        CIK_CACHE[upperSymbol] = cik;
        return cik;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching CIK:', error);
    return null;
  }
}

/**
 * Extract the most recent value from SEC XBRL facts
 */
function getLatestValue(facts: any, concept: string, unit: string = 'USD'): number | null {
  try {
    const conceptData = facts?.facts?.['us-gaap']?.[concept];
    if (!conceptData) return null;
    
    const units = conceptData.units?.[unit] || conceptData.units?.['shares'] || conceptData.units?.['pure'];
    if (!units || !Array.isArray(units) || units.length === 0) return null;
    
    // Filter for 10-K (annual) filings and get the most recent
    const annualFilings = units.filter((item: any) => 
      item.form === '10-K' && item.val !== undefined
    );
    
    if (annualFilings.length === 0) {
      // Fallback to 10-Q if no 10-K
      const quarterlyFilings = units.filter((item: any) => 
        item.form === '10-Q' && item.val !== undefined
      );
      if (quarterlyFilings.length === 0) return null;
      
      // Sort by end date descending
      quarterlyFilings.sort((a: any, b: any) => 
        new Date(b.end).getTime() - new Date(a.end).getTime()
      );
      return quarterlyFilings[0].val;
    }
    
    // Sort by end date descending
    annualFilings.sort((a: any, b: any) => 
      new Date(b.end).getTime() - new Date(a.end).getTime()
    );
    
    return annualFilings[0].val;
  } catch {
    return null;
  }
}

/**
 * Extract historical values (last 5 years) from SEC XBRL facts
 */
function getHistoricalValues(facts: any, concept: string, years: number = 5): number[] {
  try {
    const conceptData = facts?.facts?.['us-gaap']?.[concept];
    if (!conceptData) return [];
    
    const units = conceptData.units?.['USD'] || conceptData.units?.['shares'];
    if (!units || !Array.isArray(units)) return [];
    
    // Filter for 10-K (annual) filings
    const annualFilings = units.filter((item: any) => 
      item.form === '10-K' && item.val !== undefined
    );
    
    if (annualFilings.length === 0) return [];
    
    // Sort by end date descending
    annualFilings.sort((a: any, b: any) => 
      new Date(b.end).getTime() - new Date(a.end).getTime()
    );
    
    // Get unique years (deduplicate by fiscal year)
    const seen = new Set<string>();
    const values: number[] = [];
    
    for (const filing of annualFilings) {
      const year = filing.fy || new Date(filing.end).getFullYear();
      if (!seen.has(year) && values.length < years) {
        seen.add(year);
        values.push(filing.val);
      }
    }
    
    // Reverse to get chronological order (oldest first)
    return values.reverse();
  } catch {
    return [];
  }
}

/**
 * Fetch financial data from SEC EDGAR
 */
export async function fetchSECFinancials(symbol: string): Promise<SECFinancials | null> {
  try {
    const cik = await getCIK(symbol);
    if (!cik) {
      console.log(`CIK not found for ${symbol}`);
      return null;
    }
    
    // Fetch company facts (XBRL data)
    const response = await fetch(
      `${SEC_COMPANY_FACTS_URL}/CIK${cik}.json`,
      { headers: SEC_HEADERS }
    );
    
    if (!response.ok) {
      console.error(`SEC API error for ${symbol}:`, response.status);
      return null;
    }
    
    const facts = await response.json();
    
    // Extract financial data from XBRL facts
    const financials: SECFinancials = {
      // Balance Sheet
      totalAssets: getLatestValue(facts, 'Assets'),
      currentAssets: getLatestValue(facts, 'AssetsCurrent'),
      cash: getLatestValue(facts, 'CashAndCashEquivalentsAtCarryingValue') || 
            getLatestValue(facts, 'Cash'),
      shortTermInvestments: getLatestValue(facts, 'ShortTermInvestments') ||
                           getLatestValue(facts, 'MarketableSecuritiesCurrent'),
      accountsReceivable: getLatestValue(facts, 'AccountsReceivableNetCurrent') ||
                         getLatestValue(facts, 'ReceivablesNetCurrent'),
      inventory: getLatestValue(facts, 'InventoryNet'),
      totalLiabilities: getLatestValue(facts, 'Liabilities'),
      currentLiabilities: getLatestValue(facts, 'LiabilitiesCurrent'),
      accountsPayable: getLatestValue(facts, 'AccountsPayableCurrent'),
      shortTermDebt: getLatestValue(facts, 'ShortTermBorrowings') ||
                    getLatestValue(facts, 'DebtCurrent'),
      longTermDebt: getLatestValue(facts, 'LongTermDebt') ||
                   getLatestValue(facts, 'LongTermDebtNoncurrent'),
      totalDebt: null, // Calculated below
      totalEquity: getLatestValue(facts, 'StockholdersEquity') ||
                  getLatestValue(facts, 'StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest'),
      retainedEarnings: getLatestValue(facts, 'RetainedEarningsAccumulatedDeficit'),
      
      // Income Statement
      revenue: getLatestValue(facts, 'RevenueFromContractWithCustomerExcludingAssessedTax') ||
              getLatestValue(facts, 'Revenues') ||
              getLatestValue(facts, 'SalesRevenueNet'),
      costOfRevenue: getLatestValue(facts, 'CostOfGoodsAndServicesSold') ||
                    getLatestValue(facts, 'CostOfRevenue'),
      grossProfit: getLatestValue(facts, 'GrossProfit'),
      operatingExpenses: getLatestValue(facts, 'OperatingExpenses'),
      operatingIncome: getLatestValue(facts, 'OperatingIncomeLoss'),
      netIncome: getLatestValue(facts, 'NetIncomeLoss'),
      ebit: getLatestValue(facts, 'OperatingIncomeLoss'), // EBIT ≈ Operating Income
      interestExpense: getLatestValue(facts, 'InterestExpense'),
      incomeTax: getLatestValue(facts, 'IncomeTaxExpenseBenefit'),
      
      // Cash Flow
      operatingCashFlow: getLatestValue(facts, 'NetCashProvidedByUsedInOperatingActivities'),
      investingCashFlow: getLatestValue(facts, 'NetCashProvidedByUsedInInvestingActivities'),
      financingCashFlow: getLatestValue(facts, 'NetCashProvidedByUsedInFinancingActivities'),
      capitalExpenditures: getLatestValue(facts, 'PaymentsToAcquirePropertyPlantAndEquipment') ||
                          getLatestValue(facts, 'PaymentsToAcquireProductiveAssets'),
      dividendsPaid: getLatestValue(facts, 'PaymentsOfDividends') ||
                    getLatestValue(facts, 'PaymentsOfDividendsCommonStock'),
      
      // Shares
      sharesOutstanding: getLatestValue(facts, 'CommonStockSharesOutstanding', 'shares') ||
                        getLatestValue(facts, 'WeightedAverageNumberOfSharesOutstandingBasic', 'shares'),
      
      // Historical
      historicalRevenue: getHistoricalValues(facts, 'RevenueFromContractWithCustomerExcludingAssessedTax') ||
                        getHistoricalValues(facts, 'Revenues'),
      historicalNetIncome: getHistoricalValues(facts, 'NetIncomeLoss'),
      historicalAssets: getHistoricalValues(facts, 'Assets'),
      historicalEquity: getHistoricalValues(facts, 'StockholdersEquity'),
      
      // Meta
      fiscalYear: null,
      fiscalPeriod: null,
      filingDate: null,
      cik: cik,
    };
    
    // Calculate total debt
    const shortDebt = financials.shortTermDebt || 0;
    const longDebt = financials.longTermDebt || 0;
    financials.totalDebt = shortDebt + longDebt > 0 ? shortDebt + longDebt : null;
    
    // Calculate gross profit if not available
    if (!financials.grossProfit && financials.revenue && financials.costOfRevenue) {
      financials.grossProfit = financials.revenue - financials.costOfRevenue;
    }
    
    return financials;
  } catch (error) {
    console.error(`Error fetching SEC data for ${symbol}:`, error);
    return null;
  }
}

/**
 * Get company info from SEC submissions
 */
export async function fetchSECCompanyInfo(symbol: string): Promise<{
  name: string;
  cik: string;
  sic: string;
  sicDescription: string;
  fiscalYearEnd: string;
  stateOfIncorporation: string;
} | null> {
  try {
    const cik = await getCIK(symbol);
    if (!cik) return null;
    
    const response = await fetch(
      `${SEC_SUBMISSIONS_URL}/CIK${cik}.json`,
      { headers: SEC_HEADERS }
    );
    
    if (!response.ok) return null;
    
    const data = await response.json();
    
    return {
      name: data.name || '',
      cik: cik,
      sic: data.sic || '',
      sicDescription: data.sicDescription || '',
      fiscalYearEnd: data.fiscalYearEnd || '',
      stateOfIncorporation: data.stateOfIncorporation || '',
    };
  } catch {
    return null;
  }
}

/**
 * Check if SEC data is available for a symbol
 */
export async function isSECDataAvailable(symbol: string): Promise<boolean> {
  const cik = await getCIK(symbol);
  return cik !== null;
}
