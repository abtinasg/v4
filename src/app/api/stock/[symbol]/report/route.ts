/**
 * Deepin - AI Stock Report Generator API (REBUILT)
 *
 * POST /api/stock/[symbol]/report
 *
 * IMPROVEMENTS:
 * - Unified model: claude-sonnet-4.5 for both Pro & Retail
 * - Increased token limits: 40,000 (was 32K/16K)
 * - Optimized prompts (shorter, more focused)
 * - Explicit 15+ page requirement
 * - Retry logic for API failures
 * - Better error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { 
  checkCredits, 
  deductCredits, 
  checkAndResetMonthlyCredits,
} from '@/lib/credits';
import { getAllFinancialData } from '@/lib/data/fmp';
import { MetricsCalculator } from '../../../../../../lib/metrics';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Types
interface StockReportRequest {
  includeCharts?: boolean;
  reportType?: 'full' | 'summary' | 'deep-dive';
  audienceType?: 'pro' | 'retail'; // pro = CFA-level, retail = simple language
}

interface StockDataForReport {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  currentPrice: number;
  marketCap: number;
  metrics: any;
  advancedMetrics?: any; // 430+ calculated metrics
  historicalData?: any;
}

/**
 * DEPRECATED: This function is no longer used. We now fetch data from /api/stock/[symbol]/metrics
 * for faster performance and better caching.
 * 
 * Fetch comprehensive stock data for report generation using FMP API
 * Now includes 430+ calculated metrics from MetricsCalculator
 * @param symbol Stock ticker symbol
 * @param timeoutMs Maximum time allowed for data fetching (default: 30 seconds)
 */
/*
async function fetchStockData(symbol: string, timeoutMs = 30000): Promise<StockDataForReport | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    console.log(`[Report] Fetching FMP data for ${symbol}... (timeout: ${timeoutMs}ms)`);
    const startTime = Date.now();
    
    // Fetch all financial data from FMP with timeout
    const fmpData = await Promise.race([
      getAllFinancialData(symbol),
      new Promise<never>((_, reject) => 
        setTimeout(() => reject(new Error('Data fetch timeout')), timeoutMs)
      )
    ]);
    
    clearTimeout(timeoutId);
    const fetchTime = Date.now() - startTime;
    console.log(`[Report] FMP data fetched in ${fetchTime}ms`);
    
    if (!fmpData.quote || !fmpData.profile) {
      console.error(`[Report] No quote or profile data for ${symbol}`);
      return null;
    }

    const { profile, quote, incomeStatements, balanceSheets, cashFlows, keyMetrics, ratios, historicalPrices } = fmpData;

    // Get latest financial data
    const latestIncome = incomeStatements[0];
    const latestBalance = balanceSheets[0];
    const latestCashFlow = cashFlows[0];
    const latestMetrics = keyMetrics[0];
    const latestRatios = ratios[0];

    // Build comprehensive metrics object from FMP data
    const metrics = {
      // Valuation
      pe: quote.pe,
      priceToBook: latestRatios?.priceToBookRatio,
      priceToSales: latestRatios?.priceToSalesRatio,
      priceToFreeCashFlow: latestRatios?.priceToFreeCashFlowRatio,
      enterpriseValue: latestMetrics?.enterpriseValue,
      evToRevenue: latestMetrics?.evToSales,
      evToEbitda: latestMetrics?.evToEBITDA,
      evToOperatingCashFlow: latestMetrics?.evToOperatingCashFlow,
      evToFreeCashFlow: latestMetrics?.evToFreeCashFlow,
      
      // Profitability
      grossMargin: latestRatios?.grossProfitMargin,
      operatingMargin: latestRatios?.operatingProfitMargin,
      ebitMargin: latestRatios?.ebitMargin,
      ebitdaMargin: latestRatios?.ebitdaMargin,
      netProfitMargin: latestRatios?.netProfitMargin,
      pretaxProfitMargin: latestRatios?.pretaxProfitMargin,
      returnOnEquity: latestMetrics?.returnOnEquity,
      returnOnAssets: latestMetrics?.returnOnAssets,
      returnOnInvestedCapital: latestMetrics?.returnOnInvestedCapital,
      returnOnCapitalEmployed: latestMetrics?.returnOnCapitalEmployed,
      
      // Growth (calculate from historical data if available)
      revenueGrowth: incomeStatements.length >= 2 ? 
        ((incomeStatements[0].revenue - incomeStatements[1].revenue) / incomeStatements[1].revenue) : null,
      earningsGrowth: incomeStatements.length >= 2 ?
        ((incomeStatements[0].netIncome - incomeStatements[1].netIncome) / incomeStatements[1].netIncome) : null,
      
      // Financial Health
      currentRatio: latestMetrics?.currentRatio || latestRatios?.currentRatio,
      quickRatio: latestRatios?.quickRatio,
      cashRatio: latestRatios?.cashRatio,
      debtToEquity: latestRatios?.debtToEquityRatio,
      debtToAssets: latestRatios?.debtToAssetsRatio,
      debtToCapital: latestRatios?.debtToCapitalRatio,
      netDebtToEBITDA: latestMetrics?.netDebtToEBITDA,
      interestCoverage: latestRatios?.interestCoverageRatio,
      
      // Cash Flow
      freeCashflow: latestCashFlow?.freeCashFlow,
      operatingCashflow: latestCashFlow?.operatingCashFlow,
      freeCashFlowYield: latestMetrics?.freeCashFlowYield,
      capexToOperatingCashFlow: latestMetrics?.capexToOperatingCashFlow,
      capexToRevenue: latestMetrics?.capexToRevenue,
      
      // Working Capital & Efficiency
      workingCapital: latestMetrics?.workingCapital,
      daysSalesOutstanding: latestMetrics?.daysOfSalesOutstanding,
      daysInventoryOutstanding: latestMetrics?.daysOfInventoryOutstanding,
      daysPayablesOutstanding: latestMetrics?.daysOfPayablesOutstanding,
      operatingCycle: latestMetrics?.operatingCycle,
      cashConversionCycle: latestMetrics?.cashConversionCycle,
      assetTurnover: latestRatios?.assetTurnover,
      inventoryTurnover: latestRatios?.inventoryTurnover,
      receivablesTurnover: latestRatios?.receivablesTurnover,
      payablesTurnover: latestRatios?.payablesTurnover,
      
      // Dividends
      dividendYield: latestRatios?.dividendYield,
      dividendPayoutRatio: latestRatios?.dividendPayoutRatio,
      
      // Risk & Volatility
      beta: profile.beta,
      
      // Shares & Per Share Metrics
      sharesOutstanding: quote.sharesOutstanding,
      eps: quote.eps,
      revenuePerShare: latestRatios?.revenuePerShare,
      bookValuePerShare: latestRatios?.bookValuePerShare,
      operatingCashFlowPerShare: latestRatios?.operatingCashFlowPerShare,
      freeCashFlowPerShare: latestRatios?.freeCashFlowPerShare,
      
      // Tax & Other
      effectiveTaxRate: latestRatios?.effectiveTaxRate,
      incomeQuality: latestMetrics?.incomeQuality,
      grahamNumber: latestMetrics?.grahamNumber,
      
      // DuPont Analysis
      taxBurden: latestMetrics?.taxBurden,
      interestBurden: latestMetrics?.interestBurden,
    };

    // Calculate technical metrics from historical data
    let technicalMetrics = {};
    if (historicalPrices.length > 0) {
      const prices = historicalPrices.map(d => d.close).filter(Boolean).reverse(); // Reverse to chronological order
      if (prices.length > 20) {
        const last20 = prices.slice(-20);
        const last50 = prices.slice(-50);
        const last200 = prices.slice(-200);
        const volatility = calculateVolatility(prices.slice(-30));
        
        technicalMetrics = {
          sma20: last20.reduce((a, b) => a + b, 0) / last20.length,
          sma50: last50.length >= 50 ? last50.reduce((a, b) => a + b, 0) / 50 : null,
          sma200: last200.length >= 200 ? last200.reduce((a, b) => a + b, 0) / 200 : null,
          volatility30Day: volatility,
          priceChange1Month: prices.length > 21 ? ((prices[prices.length - 1] - prices[prices.length - 22]) / prices[prices.length - 22]) : null,
          priceChange3Month: prices.length > 63 ? ((prices[prices.length - 1] - prices[prices.length - 64]) / prices[prices.length - 64]) : null,
          priceChange1Year: prices.length > 252 ? ((prices[prices.length - 1] - prices[0]) / prices[0]) : null,
          fiftyTwoWeekHigh: quote.yearHigh,
          fiftyTwoWeekLow: quote.yearLow,
        };
      }
    }

    // Calculate 430+ advanced metrics using MetricsCalculator
    let advancedMetrics = null;
    try {
      // Prepare raw financial data for calculator matching RawFinancialData interface
      const rawData = {
        yahoo: {
          symbol: quote.symbol,
          price: quote.price,
          previousClose: quote.previousClose || quote.price,
          open: quote.open || quote.price,
          dayLow: quote.dayLow || quote.price,
          dayHigh: quote.dayHigh || quote.price,
          volume: quote.volume || 0,
          averageVolume: quote.avgVolume || 0,
          marketCap: quote.marketCap,
          beta: profile.beta || 1,
          pe: quote.pe || null,
          eps: quote.eps || null,
          forwardPE: null,
          forwardEPS: null,
          dividendRate: null,
          dividendYield: latestRatios?.dividendYield || null,
          fiftyDayAverage: quote.priceAvg50 || null,
          twoHundredDayAverage: quote.priceAvg200 || null,
          
          // Income Statement
          revenue: latestIncome?.revenue || 0,
          costOfRevenue: latestIncome?.costOfRevenue || 0,
          grossProfit: latestIncome?.grossProfit || 0,
          operatingExpenses: latestIncome?.operatingExpenses || 0,
          operatingIncome: latestIncome?.operatingIncome || 0,
          ebitda: latestIncome?.ebitda || 0,
          ebit: latestIncome?.ebit || 0,
          interestExpense: latestIncome?.interestExpense || 0,
          pretaxIncome: latestIncome?.incomeBeforeTax || 0,
          incomeTax: latestIncome?.incomeTaxExpense || 0,
          netIncome: latestIncome?.netIncome || 0,
          
          // Balance Sheet
          totalAssets: latestBalance?.totalAssets || 0,
          currentAssets: latestBalance?.totalCurrentAssets || 0,
          cash: latestBalance?.cashAndCashEquivalents || 0,
          shortTermInvestments: latestBalance?.shortTermInvestments || 0,
          netReceivables: latestBalance?.netReceivables || 0,
          inventory: latestBalance?.inventory || 0,
          totalLiabilities: latestBalance?.totalLiabilities || 0,
          currentLiabilities: latestBalance?.totalCurrentLiabilities || 0,
          shortTermDebt: latestBalance?.shortTermDebt || 0,
          accountsPayable: latestBalance?.accountPayables || 0,
          longTermDebt: latestBalance?.longTermDebt || 0,
          totalDebt: (latestBalance?.longTermDebt || 0) + (latestBalance?.shortTermDebt || 0),
          totalEquity: latestBalance?.totalStockholdersEquity || 0,
          retainedEarnings: latestBalance?.retainedEarnings || 0,
          workingCapital: latestMetrics?.workingCapital || 0,
          
          // Cash Flow Statement
          operatingCashFlow: latestCashFlow?.operatingCashFlow || 0,
          investingCashFlow: latestCashFlow?.netCashProvidedByInvestingActivities || 0,
          financingCashFlow: latestCashFlow?.netCashProvidedByFinancingActivities || 0,
          capitalExpenditures: Math.abs(latestCashFlow?.capitalExpenditure || 0),
          freeCashFlow: latestCashFlow?.freeCashFlow || 0,
          dividendsPaid: Math.abs(latestCashFlow?.dividendsPaid || 0),
          
          // Financial Ratios
          currentRatio: latestMetrics?.currentRatio || null,
          quickRatio: latestRatios?.quickRatio || null,
          debtToEquity: latestRatios?.debtToEquityRatio || null,
          returnOnEquity: latestMetrics?.returnOnEquity || null,
          returnOnAssets: latestMetrics?.returnOnAssets || null,
          grossMargin: latestRatios?.grossProfitMargin || null,
          operatingMargin: latestRatios?.operatingProfitMargin || null,
          profitMargin: latestRatios?.netProfitMargin || null,
          revenueGrowth: incomeStatements.length >= 2 ? 
            ((incomeStatements[0].revenue - incomeStatements[1].revenue) / incomeStatements[1].revenue) : null,
          earningsGrowth: incomeStatements.length >= 2 ?
            ((incomeStatements[0].netIncome - incomeStatements[1].netIncome) / incomeStatements[1].netIncome) : null,
          
          // Company Info
          sector: profile.sector || 'N/A',
          industry: profile.industry || 'N/A',
          
          // Share Data
          sharesOutstanding: quote.sharesOutstanding || 0,
          floatShares: 0,
          
          // Historical Data
          historicalRevenue: incomeStatements.map(is => is.revenue).reverse(),
          historicalNetIncome: incomeStatements.map(is => is.netIncome).reverse(),
          historicalEPS: incomeStatements.map(is => is.eps).reverse(),
          historicalDividends: [],
          historicalFCF: cashFlows.map(cf => cf.freeCashFlow).reverse(),
          
          // Price History
          priceHistory: historicalPrices.slice(0, 252).reverse().map(hp => ({
            date: hp.date,
            open: hp.open,
            high: hp.high,
            low: hp.low,
            close: hp.close,
            volume: hp.volume,
          })),
        },
        fred: {
          gdpGrowthRate: null,
          realGDP: null,
          nominalGDP: null,
          gdpPerCapita: null,
          realGDPGrowthRate: null,
          potentialGDP: null,
          outputGap: null,
          cpi: null,
          ppi: null,
          coreInflation: null,
          inflationRate: null,
          pceInflation: null,
          coreInflationRate: null,
          breakEvenInflation5Y: null,
          breakEvenInflation10Y: null,
          federalFundsRate: null,
          treasury10Y: 0.04, // Default risk-free rate
          treasury2Y: null,
          treasury30Y: null,
          treasury3M: null,
          primeRate: null,
          interbankRate: null,
          realInterestRate: null,
          neutralRate: null,
          yieldCurveSpread: null,
          m1MoneySupply: null,
          m2MoneySupply: null,
        } as any, // Cast to avoid listing all 40+ FRED fields
        industry: {
          sectorName: profile.sector || 'N/A',
          industryName: profile.industry || 'N/A',
          sectorPE: null,
          industryGrowthRate: null,
        } as any,
        tradeFx: {
          usdIndex: null,
          realEffectiveExchangeRate: null,
        } as any,
        timestamp: new Date(),
      };
      
      const calculator = new MetricsCalculator(rawData, {
        marketRiskPremium: 0.05,
        terminalGrowthRate: 0.025,
        riskFreeRate: 0.04,
      });
      
      advancedMetrics = calculator.calculateAll();
      console.log('[Report] Advanced metrics calculated successfully (430+ metrics)');
    } catch (metricsError) {
      console.warn('[Report] Could not calculate advanced metrics:', metricsError);
    }

    return {
      symbol: quote.symbol,
      companyName: profile.companyName,
      sector: profile.sector || 'N/A',
      industry: profile.industry || 'N/A',
      currentPrice: quote.price || 0,
      marketCap: quote.marketCap || 0,
      metrics: { ...metrics, ...technicalMetrics },
      advancedMetrics,
      historicalData: historicalPrices.length > 0 ? {
        prices: historicalPrices.slice(0, 60).reverse().map(d => ({
          date: d.date,
          close: d.close,
          volume: d.volume,
        })),
      } : null,
    };
  } catch (error) {
    console.error('[Report] Error fetching stock data:', error);
    return null;
  }
}
*/

/**
 * Calculate annualized volatility from price array
 */
function calculateVolatility(prices: number[]): number {
  if (prices.length < 2) return 0;
  
  const returns: number[] = [];
  for (let i = 1; i < prices.length; i++) {
    returns.push(Math.log(prices[i] / prices[i - 1]));
  }
  
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
  const dailyStdDev = Math.sqrt(variance);
  
  // Annualize (252 trading days)
  return dailyStdDev * Math.sqrt(252) * 100;
}

/**
 * Generate AI analysis using Claude Opus 4.5 via OpenRouter
 * Now uses 430+ metrics for comprehensive analysis
 * @param audienceType 'pro' for CFA-level analysis, 'retail' for simple language
 */
async function generateAIAnalysis(stockData: StockDataForReport, audienceType: 'pro' | 'retail' = 'pro'): Promise<string> {
  // Prepare a concise summary of key metrics (instead of full JSON dump)
  const keyMetricsSummary = `
KEY FINANCIAL METRICS:
Valuation: PE=${stockData.metrics.pe || 'N/A'}, Market Cap=$${((stockData.marketCap || 0) / 1e9).toFixed(2)}B
Profitability: Gross Margin=${((stockData.metrics.grossMargin || 0) * 100).toFixed(1)}%, Operating Margin=${((stockData.metrics.operatingMargin || 0) * 100).toFixed(1)}%, Net Margin=${((stockData.metrics.profitMargin || 0) * 100).toFixed(1)}%
Returns: ROE=${((stockData.metrics.returnOnEquity || 0) * 100).toFixed(1)}%, ROA=${((stockData.metrics.returnOnAssets || 0) * 100).toFixed(1)}%
Liquidity: Current Ratio=${(stockData.metrics.currentRatio || 0).toFixed(2)}, Quick Ratio=${(stockData.metrics.quickRatio || 0).toFixed(2)}
Leverage: Debt/Equity=${(stockData.metrics.debtToEquity || 0).toFixed(2)}x
Cash Flow: FCF=$${((stockData.metrics.freeCashflow || 0) / 1e9).toFixed(2)}B, Operating CF=$${((stockData.metrics.operatingCashflow || 0) / 1e9).toFixed(2)}B
Growth: Revenue Growth=${((stockData.metrics.revenueGrowth || 0) * 100).toFixed(1)}%, Earnings Growth=${((stockData.metrics.earningsGrowth || 0) * 100).toFixed(1)}%
`;

  const advancedMetricsSection = stockData.advancedMetrics ? `
ADVANCED METRICS AVAILABLE: Yes (430+ institutional-grade metrics calculated)
` : '';

  const CFA_PRO_ANALYSIS_PROMPT = `
You are a CFA Charterholder writing an institutional equity research report.

CRITICAL LENGTH REQUIREMENT:
- MINIMUM 15 FULL PAGES when converted to PDF
- Target: 12,000-15,000 words
- Each section MUST have substantial depth with multiple detailed paragraphs
- DO NOT provide shorter responses

DATA RULES:
- ONLY use numbers from provided data - never guess
- If data missing: state "Data not available"
- NO buy/sell recommendations
- Cite exact metric values with decimals

=== DATA ===
${stockData.symbol} - ${stockData.companyName}
Sector: ${stockData.sector} | Industry: ${stockData.industry}
Price: $${stockData.currentPrice}

${keyMetricsSummary}
${advancedMetricsSection}

=== WRITE COMPREHENSIVE REPORT (15+ pages) ===

# ${stockData.symbol} INSTITUTIONAL EQUITY RESEARCH REPORT
**${stockData.companyName}** | ${stockData.sector} | ${new Date().toISOString().split('T')[0]}

Write an EXHAUSTIVE research report with these 10 sections. Each section needs multiple detailed paragraphs:

## 0. Executive Summary
- Data coverage assessment & limitations
- High-level snapshot: business quality, growth, balance sheet, valuation stance, risk tone
- Central investment question/debate
- Professional classification (e.g., quality compounder, cyclical value, etc.)

## 1. Company Overview & Business Model
- What company does, revenue drivers, competitive position
- Business segments, geographic exposure, cyclicality
- Customer types and end-markets

## 2. Macro & Industry Context
- Macro backdrop: growth, rates, inflation impact on this company
- Industry structure, competitiveness, moat potential
- 5-year sector outlook

## 3. Quality, Profitability & Efficiency
- Margins (gross, operating, net), returns (ROE, ROA, ROIC)
- DuPont analysis, operational efficiency metrics
- Earnings quality indicators
- Compare to cost of capital where data available

## 4. Growth Profile
- Revenue, EPS, FCF growth rates
- Organic vs inorganic, short vs long-term
- Growth sustainability and capital requirements

## 5. Balance Sheet, Leverage & Liquidity
- Debt metrics: D/E, net debt/EBITDA, interest coverage
- Liquidity ratios, working capital efficiency
- Financial flexibility and refinancing risk

## 6. Cash Flows & Capital Allocation
- Operating CF, free CF, cash conversion
- Capital allocation: dividends, buybacks, capex, M&A
- Shareholder friendliness

## 7. Valuation Analysis
- P/E, P/B, EV/EBITDA, FCF yield, dividend yield
- Relative valuation (if peer data provided)
- Qualitative assessment only (no price targets)

## 8. Risk, Return & Portfolio Perspective
- Beta, volatility, risk-adjusted returns
- Fundamental vs market risk
- Portfolio fit and position sizing considerations

## 9. Accounting Quality & Sector KPIs
- Revenue recognition, tax rate, D&A policies
- Sector-specific KPIs if relevant
- Red flags or quality concerns

## 10. Investment Synthesis
- Key strengths and weaknesses (with specific metrics)
- Bull case vs Bear case
- Core investment debate
- Information gaps
- Portfolio treatment perspective (NOT advice)

End with: _"Analysis based solely on data provided by Deepin; not investment advice."_
`;

  // =====================================================
  // RETAIL INVESTOR PROMPT - Simple, educational language
  // =====================================================
  const RETAIL_SUMMARY_PROMPT = `
You are a CFA Charterholder explaining stock analysis to beginners in simple language.

STYLE:
- Use simple, clear language - short sentences
- Explain technical terms when used (e.g., "ROE" means...)
- Write for non-professionals
- Educational only - NO buy/sell/hold recommendations

DATA RULES:
- ONLY use numbers from provided data
- Never guess, estimate, or use external benchmarks
- Copy exact values (e.g., if data says "ROE: 23.47%", write "ROE of 23.47%")

LENGTH REQUIREMENT:
- MINIMUM 10 FULL PAGES
- Target: 5,000-8,000 words
- DO NOT provide shorter responses

=== DATA ===
${stockData.symbol} - ${stockData.companyName}
Sector: ${stockData.sector} | Industry: ${stockData.industry}
Price: $${stockData.currentPrice}

${keyMetricsSummary}
${advancedMetricsSection}

=== WRITE BEGINNER-FRIENDLY REPORT (10+ pages) ===

# ${stockData.symbol} Stock Analysis
**${stockData.companyName}** | ${stockData.sector} | ${new Date().toISOString().split('T')[0]}

Write clear, easy-to-understand report. Each section needs detailed explanation:

## 📊 Quick Summary
In 3-4 simple sentences: What does company do? Is it doing well? Overall picture?

## 🏢 What Does This Company Do?
Explain business in plain terms. What they sell, who buys it. Avoid jargon.

## 💰 Is the Company Making Money?
Explain profitability simply. Use phrases like "For every $100 in sales, keeps $X as profit."
If ROE/ROIC provided, explain in plain English.

## 📈 Is the Company Growing?
Sales/profits going up or down? By how much? Keep it simple.

## 💵 Is the Stock Expensive or Cheap?
Explain P/E, P/B etc. in simple terms.
Example: "P/E of X means investors pay $X for every $1 company earns."
NO judgment on if it's good/bad - just explain numbers.

## ⚠️ What Are the Risks?
List 3-5 key risks. Plain language: "Company has lot of debt" not "elevated leverage."

## ✅ Strengths and ❌ Weaknesses
Two lists: What company does well, where it could improve.

## 📝 The Bottom Line
2-3 sentence summary for regular person.
End: _"This analysis is for educational purposes only. Always do your own research before making investment decisions."_
`;

  // Select the appropriate prompt based on audience type
  const selectedPrompt = audienceType === 'retail' ? RETAIL_SUMMARY_PROMPT : CFA_PRO_ANALYSIS_PROMPT;
  const reportLabel = audienceType === 'retail' ? 'Retail' : 'Pro';

  // Call OpenRouter API with retry logic
  async function callWithRetry(attempt: number = 1): Promise<string> {
    try {
      console.log(`[Report] API attempt ${attempt}/${MAX_RETRIES + 1} for ${stockData.symbol} (${reportLabel})...`);

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
          'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://deepterm.com',
          'X-Title': 'Deepin - Stock Analysis',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'anthropic/claude-sonnet-4.5', // Unified model for both Pro and Retail
          messages: [{ role: 'user', content: selectedPrompt }],
          max_tokens: 40000, // Increased to 40K for both types
          temperature: 0.3,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`OpenRouter API error (${response.status}): ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();

      if (!data.choices?.[0]?.message?.content) {
        throw new Error('Invalid response structure from API');
      }

      const content = data.choices[0].message.content;
      console.log(`[Report] Successfully generated ${reportLabel} report (${content.length} chars)`);
      return content;

    } catch (error) {
      console.error(`[Report] Attempt ${attempt} failed:`, error);

      // Retry logic
      if (attempt <= MAX_RETRIES) {
        const delay = RETRY_DELAY_MS * attempt;
        console.log(`[Report] Retrying after ${delay}ms...`);
        await sleep(delay);
        return callWithRetry(attempt + 1);
      }

      throw error;
    }
  }

  return callWithRetry();
}

/**
 * POST handler - Generate stock report
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    // === Credit System Check ===
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    await checkAndResetMonthlyCredits(user.id);

    const creditCheck = await checkCredits(user.id, 'ai_analysis');
    if (!creditCheck.success) {
      return NextResponse.json(
        { 
          success: false,
          error: 'insufficient_credits',
          message: 'You do not have enough credits for this action. Please purchase more credits.',
          details: {
            currentBalance: creditCheck.currentBalance,
            requiredCredits: creditCheck.requiredCredits,
            shortfall: creditCheck.requiredCredits - creditCheck.currentBalance,
            action: 'ai_analysis',
          },
          links: {
            pricing: '/pricing',
            credits: '/dashboard/settings/credits',
          },
        },
        { 
          status: 402,
          headers: {
            'X-Credit-Balance': String(creditCheck.currentBalance),
            'X-Credit-Required': String(creditCheck.requiredCredits),
          }
        }
      );
    }
    // === End Credit Check ===

    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();
    
    console.log(`[Report] Starting report generation for ${upperSymbol}`);

    // Check for OpenRouter API key
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('[Report] OpenRouter API key not configured');
      return NextResponse.json(
        { 
          error: 'AI service not configured. Please add OPENROUTER_API_KEY to environment variables.',
          details: 'Contact administrator to set up OpenRouter API access.'
        },
        { status: 500 }
      );
    }

    // Get request body
    const body: StockReportRequest = await request.json().catch(() => ({}));
    const audienceType = body.audienceType || 'pro'; // Default to pro if not specified
    console.log(`[Report] Audience type: ${audienceType}`);

    // Fetch stock data directly using FMP adapter (same as metrics endpoint)
    console.log(`[Report] Fetching stock data for ${upperSymbol}...`);
    const startFetch = Date.now();
    
    let stockData;
    try {
      // Import the FMP adapter to get data directly
      const { getFMPRawData } = await import('@/lib/data/fmp-adapter');
      
      // Fetch comprehensive data from FMP (raw data with profile)
      const fmpRawData = await getFMPRawData(upperSymbol);
      
      if (!fmpRawData.profile && !fmpRawData.quote) {
        throw new Error('No data returned from FMP');
      }
      
      const fetchTime = Date.now() - startFetch;
      console.log(`[Report] FMP data fetched in ${fetchTime}ms`);
      
      const { profile, quote, keyMetrics, ratios, cashFlows } = fmpRawData;
      const latestMetrics = keyMetrics?.[0];
      const latestRatios = ratios?.[0];
      const latestCashFlow = cashFlows?.[0];
      
      // Transform FMP data to stockData format
      stockData = {
        symbol: upperSymbol,
        companyName: profile?.companyName || quote?.name || upperSymbol,
        sector: profile?.sector || 'N/A',
        industry: profile?.industry || 'N/A',
        currentPrice: quote?.price || 0,
        marketCap: quote?.marketCap || profile?.marketCap || 0,
        metrics: {
          // Basic valuation
          pe: quote?.pe || latestRatios?.priceToEarningsRatio,
          marketCap: quote?.marketCap,
          
          // Profitability
          grossMargin: latestRatios?.grossProfitMargin,
          operatingMargin: latestRatios?.operatingProfitMargin,
          profitMargin: latestRatios?.netProfitMargin,
          returnOnEquity: latestMetrics?.returnOnEquity,
          returnOnAssets: latestMetrics?.returnOnAssets,
          
          // Financial Health
          currentRatio: latestMetrics?.currentRatio || latestRatios?.currentRatio,
          quickRatio: latestRatios?.quickRatio,
          debtToEquity: latestRatios?.debtToEquityRatio,
          
          // Cash Flow
          freeCashflow: latestCashFlow?.freeCashFlow,
          operatingCashflow: latestCashFlow?.operatingCashFlow,
          
          // Growth (would need to calculate from historical)
          revenueGrowth: null,
          earningsGrowth: null,
        },
        advancedMetrics: null,
        historicalData: null,
      };
    } catch (error) {
      console.error(`[Report] Failed to fetch data for ${upperSymbol}:`, error);
      return NextResponse.json(
        { 
          error: `Could not retrieve market data for ${upperSymbol}`,
          details: 'Market data API may be temporarily unavailable. Please try again in a few moments. If the problem persists, the stock symbol may be invalid or delisted.',
          suggestion: 'Try refreshing the page or wait a minute before retrying.'
        },
        { status: 503 } // Service Unavailable - better status code for temporary issues
      );
    }
    
    console.log(`[Report] Stock data fetched successfully for ${upperSymbol}`);

    // Generate AI analysis
    console.log(`[Report] Generating AI analysis for ${upperSymbol} (${audienceType} audience)...`);
    const analysisMarkdown = await generateAIAnalysis(stockData, audienceType);

    console.log(`[Report] Report generated successfully for ${upperSymbol}`);

    // Deduct credits after successful report generation
    await deductCredits(user.id, 'ai_analysis', {
      symbol: upperSymbol,
      endpoint: '/api/stock/[symbol]/report',
    });

    // Return markdown report (frontend will convert to PDF)
    return NextResponse.json({
      success: true,
      symbol: upperSymbol,
      companyName: stockData.companyName,
      generatedAt: new Date().toISOString(),
      report: analysisMarkdown,
      metadata: {
        reportType: body.reportType || 'full',
        includeCharts: body.includeCharts !== false,
      },
    });

  } catch (error) {
    console.error('[Report] Error generating stock report:', error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();
      
      if (errorMessage.includes('data fetch timeout')) {
        return NextResponse.json(
          { 
            error: 'Data fetch timeout',
            details: 'Unable to fetch financial data within time limit. The market data provider may be slow or unavailable. Please try again in a few moments.'
          },
          { status: 504 }
        );
      }
      
      if (errorMessage.includes('api key') || errorMessage.includes('unauthorized')) {
        return NextResponse.json(
          { 
            error: 'AI service authentication failed',
            details: 'Please check that OPENROUTER_API_KEY is correctly configured.'
          },
          { status: 500 }
        );
      }
      
      if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        return NextResponse.json(
          { 
            error: 'Service temporarily unavailable',
            details: 'Rate limit reached. Please try again in a few minutes.'
          },
          { status: 429 }
        );
      }
      
      if (errorMessage.includes('timeout') || errorMessage.includes('abort')) {
        return NextResponse.json(
          { 
            error: 'Request timeout',
            details: 'AI analysis is taking longer than expected. This can happen with complex reports. Please try again. If the issue persists, try using a summary report instead of a full report.'
          },
          { status: 408 }
        );
      }
      
      // Return the actual error message for debugging
      return NextResponse.json(
        { 
          error: 'Failed to generate report',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to generate report',
        details: 'An unexpected error occurred. Please try again.'
      },
      { status: 500 }
    );
  }
}
