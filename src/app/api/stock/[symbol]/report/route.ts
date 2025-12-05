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
export const maxDuration = 180; // Increased from 120 to 180 seconds

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;
const OPENROUTER_TIMEOUT_MS = 120000; // 120 second timeout for OpenRouter calls

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

  const CFA_PRO_ANALYSIS_PROMPT = `You are an expert CFA Charterholder writing an institutional equity research report. Write in a professional, analytical tone with detailed paragraphs.

═══════════════════════════════════════════════════════════════
LENGTH & STYLE REQUIREMENTS - CRITICAL
═══════════════════════════════════════════════════════════════

**MANDATORY LENGTH:**
- Target: 5-7 pages when converted to PDF
- Target: 2,500-3,000 words
- Each section MUST have 3-4 detailed paragraphs (not bullet points)
- Write in flowing, professional prose - NOT lists or bullet points
- Each paragraph should be 80-100 words

**WRITING STYLE:**
- Write complete, detailed paragraphs
- Use transitional phrases between ideas
- Provide deep analysis, not surface-level observations
- Connect metrics to business implications
- Include specific numbers from the data provided

**DATA RULES:**
- ONLY use numbers from provided data - never guess or estimate
- If data is missing: state "Data not available" and continue
- NO buy/sell/hold recommendations
- Cite exact metric values with decimals

═══════════════════════════════════════════════════════════════
STOCK DATA
═══════════════════════════════════════════════════════════════

${stockData.symbol} - ${stockData.companyName}
Sector: ${stockData.sector} | Industry: ${stockData.industry}
Current Price: $${stockData.currentPrice}

${keyMetricsSummary}
${advancedMetricsSection}

═══════════════════════════════════════════════════════════════
REPORT STRUCTURE - WRITE ALL 11 SECTIONS IN FULL
═══════════════════════════════════════════════════════════════

# ${stockData.symbol} INSTITUTIONAL EQUITY RESEARCH REPORT
**${stockData.companyName}** | ${stockData.sector} | ${new Date().toISOString().split('T')[0]}

Write a COMPREHENSIVE research report with these 11 sections. Each section needs 3-4 detailed paragraphs:

## 0. Executive Summary (3-4 paragraphs)
Write a comprehensive executive summary covering:
- Data coverage assessment and any limitations
- High-level business quality snapshot with key metrics
- Growth trajectory and balance sheet health overview
- Valuation stance assessment (expensive/fair/cheap based on metrics)
- Risk tone and central investment question
- Professional classification (quality compounder, cyclical value, growth stock, etc.)

## 1. Company Overview & Business Model (3-4 paragraphs)
Write detailed analysis of:
- Complete description of what the company does
- Revenue drivers and how the company makes money
- Business segments and their contributions
- Geographic exposure and market presence
- Cyclicality and economic sensitivity
- Customer types, end-markets, and competitive positioning

## 2. Macroeconomic & Industry Context (3-4 paragraphs)
Write thorough analysis of:
- Current macroeconomic backdrop affecting this company
- Interest rate, growth, and inflation impact on operations
- Industry structure and competitive dynamics
- Moat potential and barriers to entry
- 5-year sector outlook and trends

## 3. Quality, Profitability & Efficiency Analysis (3-4 paragraphs)
Write in-depth analysis of:
- Gross margin analysis and trends (cite the ${((stockData.metrics.grossMargin || 0) * 100).toFixed(1)}% figure)
- Operating margin analysis (cite the ${((stockData.metrics.operatingMargin || 0) * 100).toFixed(1)}% figure)
- Net profit margin analysis (cite the ${((stockData.metrics.profitMargin || 0) * 100).toFixed(1)}% figure)
- Return on Equity deep-dive (cite the ${((stockData.metrics.returnOnEquity || 0) * 100).toFixed(1)}% figure)
- Return on Assets analysis (cite the ${((stockData.metrics.returnOnAssets || 0) * 100).toFixed(1)}% figure)
- DuPont decomposition and efficiency metrics
- Earnings quality indicators and sustainability

## 4. Growth Profile (3-4 paragraphs)
Write comprehensive analysis of:
- Revenue growth trajectory and sustainability
- Earnings and EPS growth analysis
- Free cash flow growth trends
- Organic vs inorganic growth components
- Capital requirements for future growth
- Growth sustainability assessment

## 5. Balance Sheet, Leverage & Liquidity (3-4 paragraphs)
Write detailed analysis of:
- Debt-to-Equity ratio analysis (cite the ${(stockData.metrics.debtToEquity || 0).toFixed(2)}x figure)
- Current ratio analysis (cite the ${(stockData.metrics.currentRatio || 0).toFixed(2)} figure)
- Quick ratio analysis (cite the ${(stockData.metrics.quickRatio || 0).toFixed(2)} figure)
- Net debt to EBITDA if available
- Interest coverage and debt service capability
- Working capital efficiency
- Financial flexibility and refinancing risk assessment

## 6. Cash Flows & Capital Allocation (3-4 paragraphs)
Write thorough analysis of:
- Operating cash flow quality (cite the $${((stockData.metrics.operatingCashflow || 0) / 1e9).toFixed(2)}B figure)
- Free cash flow generation (cite the $${((stockData.metrics.freeCashflow || 0) / 1e9).toFixed(2)}B figure)
- Cash conversion efficiency
- Capital allocation priorities (dividends, buybacks, capex, M&A)
- Shareholder return policy assessment
- Investment capacity and flexibility

## 7. Valuation Analysis (3-4 paragraphs)
Write comprehensive valuation analysis:
- P/E ratio analysis and context (cite the ${stockData.metrics.pe || 'N/A'} figure)
- Price-to-Book assessment if available
- EV/EBITDA analysis if available
- Free cash flow yield calculation
- Dividend yield analysis if applicable
- Historical valuation context
- Relative valuation considerations (qualitative only)

## 8. Risk Assessment & Portfolio Perspective (3-4 paragraphs)
Write detailed risk analysis:
- Beta and market risk exposure
- Volatility characteristics
- Fundamental business risks
- Financial risks (leverage, liquidity)
- Sector and macro risks
- Portfolio fit considerations
- Position sizing perspective

## 9. Accounting Quality & Sector KPIs (3-4 paragraphs)
Write thorough analysis of:
- Revenue recognition policies and quality
- Effective tax rate analysis
- Depreciation and amortization policies
- Sector-specific key performance indicators
- Accounting red flags or concerns (if any)
- Financial statement quality assessment

## 10. Investment Synthesis (3-4 paragraphs)
Write comprehensive conclusion:
- Summary of key strengths with specific metrics
- Summary of key weaknesses with specific metrics
- Bull case scenario with supporting data
- Bear case scenario with supporting data
- Core investment debate and thesis
- Information gaps and areas needing more research
- Portfolio treatment perspective (educational only, NOT advice)

End with disclaimer: _"This analysis is based solely on data provided by Deepin and is for educational purposes only. It does not constitute investment advice. Past performance does not guarantee future results."_

═══════════════════════════════════════════════════════════════
⚠️ ABSOLUTELY CRITICAL - READ THIS CAREFULLY:
═══════════════════════════════════════════════════════════════

- **WRITE THE COMPLETE REPORT IN ONE RESPONSE** - ALL 10 SECTIONS
- **DO NOT ASK** if I want you to continue
- **DO NOT WRITE** phrases like "Would you like me to continue?" or "Continued in next sections..."
- **DO NOT PAUSE** or break the report into parts
- **NEVER** say things like "[Note: I can continue...]" or "[Shall I proceed...]"
- If you run out of space, prioritize completing all sections with slightly less detail
- The report MUST be complete and self-contained
- **START WRITING THE REPORT NOW - ALL SECTIONS**
`;

  // =====================================================
  // RETAIL INVESTOR PROMPT - Simple, educational language
  // =====================================================
  const RETAIL_SUMMARY_PROMPT = `You are a friendly financial educator explaining stock analysis to everyday investors. Write in simple, clear language that anyone can understand.

═══════════════════════════════════════════════════════════════
LENGTH & STYLE REQUIREMENTS - CRITICAL
═══════════════════════════════════════════════════════════════

**MANDATORY LENGTH:**
- Target: 4-6 pages when converted to PDF
- Target: 2,000-3,000 words
- Each section MUST have 2-3 detailed paragraphs
- Write in flowing, friendly prose - explain everything clearly
- Each paragraph should be 80-100 words

**WRITING STYLE:**
- Use simple, everyday language
- Short sentences (15-20 words max)
- Explain EVERY technical term when you use it
- Use analogies and examples to explain concepts
- Make it feel like a friendly conversation
- Write for someone with no financial background

**DATA RULES:**
- ONLY use numbers from provided data - never guess
- If data is missing: state "This information isn't available" and continue
- NO buy/sell/hold recommendations
- Explain what each number actually means

═══════════════════════════════════════════════════════════════
STOCK DATA
═══════════════════════════════════════════════════════════════

${stockData.symbol} - ${stockData.companyName}
Sector: ${stockData.sector} | Industry: ${stockData.industry}
Current Price: $${stockData.currentPrice}

${keyMetricsSummary}
${advancedMetricsSection}

═══════════════════════════════════════════════════════════════
REPORT STRUCTURE - WRITE ALL 8 SECTIONS IN FULL
═══════════════════════════════════════════════════════════════

# Understanding ${stockData.symbol}: A Beginner's Guide
**${stockData.companyName}** | ${stockData.sector} | ${new Date().toISOString().split('T')[0]}

Write a COMPREHENSIVE beginner-friendly report with these 8 sections. Each section needs 3-5 detailed paragraphs:

## 📊 Quick Overview (3-4 paragraphs)
Start with a friendly introduction:
- What does this company do in simple terms?
- How big is this company? (explain market cap in relatable terms)
- What industry is it in and why does that matter?
- Give readers a general sense of where this company stands

## 🏢 Understanding the Business (4-5 paragraphs)
Explain the business model clearly:
- What products or services does the company sell?
- Who are their customers? (regular people, businesses, governments?)
- How does the company actually make money?
- What makes this company different from competitors?
- Use examples and analogies to make it relatable

## 💰 Is the Company Profitable? (4-5 paragraphs)
Explain profitability in plain English:
- Gross margin of ${((stockData.metrics.grossMargin || 0) * 100).toFixed(1)}%: "For every $100 in sales, the company keeps $X after paying for what it sells"
- Operating margin of ${((stockData.metrics.operatingMargin || 0) * 100).toFixed(1)}%: "After paying all operating costs, the company keeps $X from every $100"
- Net profit margin of ${((stockData.metrics.profitMargin || 0) * 100).toFixed(1)}%: "At the end of the day, the company pockets $X from every $100 in sales"
- ROE of ${((stockData.metrics.returnOnEquity || 0) * 100).toFixed(1)}%: Explain what this means for shareholders
- Is the company getting better or worse at making money?

## 📈 Is the Company Growing? (3-4 paragraphs)
Explain growth simply:
- Are sales going up or down? By how much?
- Are profits increasing?
- What's driving the growth (or decline)?
- Is this growth likely to continue? Why?

## 💵 Is the Stock Price Reasonable? (4-5 paragraphs)
Explain valuation in beginner terms:
- P/E ratio of ${stockData.metrics.pe || 'N/A'}: "If you buy this stock, you're paying $X for every $1 the company earns"
- Explain what a high vs low P/E means (without saying if it's good or bad)
- Compare the concept to buying a house or small business
- Explain other valuation metrics if available
- Help readers understand what they're paying for

## 💪 Financial Health Check (4-5 paragraphs)
Check if the company is financially stable:
- Current ratio of ${(stockData.metrics.currentRatio || 0).toFixed(2)}: "For every $1 the company owes short-term, it has $X to pay it"
- Debt-to-equity of ${(stockData.metrics.debtToEquity || 0).toFixed(2)}x: "The company has borrowed $X for every $1 of its own money"
- Explain if the company has enough cash
- Is the debt level concerning or manageable?
- Can the company pay its bills?

## ⚠️ What Could Go Wrong? (3-4 paragraphs)
Explain the risks in plain language:
- What are the main business risks?
- What could hurt the company's profits?
- Are there industry-wide challenges?
- What external factors could affect the stock?
- Be honest but balanced

## 📝 Putting It All Together (4-5 paragraphs)
Summarize everything:
- Recap the key strengths of the company
- Recap the main concerns or weaknesses
- What makes this company interesting (educational perspective)?
- What questions should an investor think about?
- Remind readers to do their own research

End with: _"This guide is for educational purposes only. It is not financial advice. Every investor should do their own research and consider consulting a financial advisor before making investment decisions."_

═══════════════════════════════════════════════════════════════
⚠️ ABSOLUTELY CRITICAL - READ THIS CAREFULLY:
═══════════════════════════════════════════════════════════════

- **WRITE THE COMPLETE REPORT IN ONE RESPONSE** - ALL SECTIONS
- **DO NOT ASK** if I want you to continue
- **DO NOT WRITE** phrases like "Would you like me to continue?" or "Continued in next sections..."
- **DO NOT PAUSE** or break the report into parts
- **NEVER** say things like "[Note: I can continue...]" or "[Shall I proceed...]"
- If you run out of space, prioritize completing all sections with slightly less detail
- The report MUST be complete and self-contained
- **START WRITING THE REPORT NOW - ALL SECTIONS**
`;

  // Select the appropriate prompt based on audience type
  const selectedPrompt = audienceType === 'retail' ? RETAIL_SUMMARY_PROMPT : CFA_PRO_ANALYSIS_PROMPT;
  const reportLabel = audienceType === 'retail' ? 'Retail' : 'Pro';

  // Call OpenRouter API with retry logic and timeout
  async function callWithRetry(attempt: number = 1): Promise<string> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT_MS);

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
          model: 'anthropic/claude-3.5-sonnet', // Faster model for better reliability
          messages: [{ role: 'user', content: selectedPrompt }],
          max_tokens: 16000, // Reduced from 40K to 16K for faster generation
          temperature: 0.3,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

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
      clearTimeout(timeoutId);
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
