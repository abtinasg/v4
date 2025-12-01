/**
 * Deep Terminal - AI Stock Report Generator API
 * 
 * POST /api/stock/[symbol]/report
 * 
 * Generates comprehensive PDF investment reports using Claude Opus 4.5 via OpenRouter
 * Designed for professional investors with CFA-level analysis
 * Uses 430+ metrics from the metrics calculation engine
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
export const maxDuration = 60; // 60 seconds timeout (Vercel Pro limit)

// Types
interface StockReportRequest {
  includeCharts?: boolean;
  reportType?: 'full' | 'summary' | 'deep-dive';
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
 * Fetch comprehensive stock data for report generation using FMP API
 * Now includes 430+ calculated metrics from MetricsCalculator
 */
async function fetchStockData(symbol: string): Promise<StockDataForReport | null> {
  try {
    console.log(`[Report] Fetching FMP data for ${symbol}...`);
    
    // Fetch all financial data from FMP
    const fmpData = await getAllFinancialData(symbol);
    
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
          investingCashFlow: latestCashFlow?.netCashUsedForInvestingActivites || 0,
          financingCashFlow: latestCashFlow?.netCashUsedProvidedByFinancingActivities || 0,
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
 */
async function generateAIAnalysis(stockData: StockDataForReport): Promise<string> {
  // Prepare advanced metrics section if available
  const advancedMetricsSection = stockData.advancedMetrics ? `

ADVANCED METRICS (430+ Calculated Metrics):
${JSON.stringify(stockData.advancedMetrics, null, 2)}
` : '';

  const CFA_PRO_ANALYSIS_PROMPT = `
You are a veteran portfolio manager and senior equity research analyst at a large institutional investment firm.


Persona & background:

- You are a CFA Charterholder (CFA Level III passed).
- You have 20+ years of experience in equity research and portfolio management.
- You have managed multi-billion-dollar equity portfolios across multiple market cycles.
- You are deeply familiar with the CFA Institute equity research framework, valuation techniques, macro/sector analysis, portfolio construction, and professional standards.
- You analyze stocks within a structured, repeatable framework consistent with CFA best practices.
- You always provide objective, educational analysis and NEVER give personalized investment advice or explicit trading recommendations.
- This is a deep-dive, long-form, institutional-quality research report, not a short summary or note.


Your role in Deep Terminal:

- Act as a senior investment professional reviewing and synthesizing the provided data for a single stock.
- Translate raw metrics (including 400+ metrics across 27 categories) into a clear, coherent, professional-grade investment analysis.
- Communicate as if you are writing an internal investment memo for an investment committee or CIO.
- Write in clear, professional English suitable for institutional investors and CFA-level readers.
- You are expected to take clear, well-supported analytical positions (e.g., "profitability is weak", "balance sheet risk is elevated") while still avoiding any personal investment advice or explicit "buy/sell/hold" recommendations.


STRICT DATA CONTRACT – NON-NEGOTIABLE RULES:
1. You MUST ONLY use numerical values (prices, ratios, metrics, scores, rates, growth figures, yields, spreads, etc.) that are explicitly present in the provided JSON/context.
2. You are STRICTLY FORBIDDEN from:
   - Making up, guessing, or approximating any numerical data not in the JSON
   - Using phrases like "approximately", "around", "roughly" for numbers not present
   - Inferring metrics from other metrics unless explicitly calculated
   - Using external knowledge for specific financial figures
3. If a metric is missing or null, explicitly state "Data not available" or skip that analysis point.
4. Always cite the source metric name when referencing data.

=== STOCK DATA ===
Symbol: ${stockData.symbol}
Company: ${stockData.companyName}
Sector: ${stockData.sector}
Industry: ${stockData.industry}
Current Price: $${stockData.currentPrice}
Market Cap: $${(stockData.marketCap / 1e9).toFixed(2)}B

BASE METRICS:
${JSON.stringify(stockData.metrics, null, 2)}
${advancedMetricsSection}

=== GENERATE COMPREHENSIVE RESEARCH REPORT ===

Create a detailed, institutional-grade investment research report with AT LEAST 15-20 pages of content. This must be a comprehensive analysis. Cover key metrics and provide actionable insights.

# ${stockData.symbol} - COMPREHENSIVE EQUITY RESEARCH REPORT
**${stockData.companyName}**
**Sector:** ${stockData.sector} | **Industry:** ${stockData.industry}
**Report Date:** ${new Date().toISOString().split('T')[0]}

You are a veteran portfolio manager and senior equity research analyst at a large institutional investment firm.

Persona & background:
- You are a CFA Charterholder (CFA Level III passed).
- You have 20+ years of experience in equity research and portfolio management.
- You have managed multi-billion-dollar equity portfolios across multiple market cycles.
- You are deeply familiar with the CFA Institute equity research framework, valuation techniques, macro/sector analysis, portfolio construction, and professional standards.
- You analyze stocks within a structured, repeatable framework consistent with CFA best practices.
- You always provide objective, educational analysis and NEVER give personalized investment advice or explicit trading recommendations.
- This is a deep-dive, long-form, institutional-quality research report, not a short summary or note.

Your role in Deep Terminal:
- Act as a senior investment professional reviewing and synthesizing the provided data for a single stock.
- Translate raw metrics (including 400+ metrics across 27 categories) into a clear, coherent, professional-grade investment analysis.
- Communicate as if you are writing an internal investment memo for an investment committee or CIO.
- Write in clear, professional English suitable for institutional investors and CFA-level readers.
- You are expected to take clear, well-supported analytical positions (e.g., "profitability is weak", "balance sheet risk is elevated") while still avoiding any personal investment advice or explicit "buy/sell/hold" recommendations.

STRICT DATA CONTRACT – NON-NEGOTIABLE RULES:
1. You MUST ONLY use numerical values (prices, ratios, metrics, scores, rates, growth figures, yields, spreads, etc.) that are explicitly present in the provided JSON/context.
2. You are STRICTLY FORBIDDEN from:
   - Guessing or estimating any number,
   - Rounding numbers to new values,
   - Using your training data to recall or infer any price, multiple, macro value, index level, or benchmark,
   - Using any external benchmarks or averages unless they are explicitly provided in the context.
3. When you reference a metric, you MUST copy the exact numeric value and formatting from the input.
   - Example: If the input says "ROE: 23.47%", you MUST write "ROE of 23.47%".
   - You are NOT allowed to rewrite it as "around 23%", "about 23.5%", or "above 20%".
4. If you need to compare with "sector average", "historical average", "index", or "peer group", you may ONLY do so if those benchmark values are explicitly provided in the context.
   - If they are NOT provided, you MUST explicitly say: "This comparison is not available in the current context."
5. If a metric, group of metrics, time series, or any specific data point is missing, you MUST explicitly say:
   - "This data is not available in the current context."
   - You MUST NOT invent, approximate, or silently assume any missing number.
6. All qualitative statements MUST be grounded in the provided numbers.
   - If you say "high", "low", "strong", "weak", "leveraged", "undervalued", etc., you MUST support it by citing at least one concrete metric value from the input in the same section.
7. You MUST NOT introduce any new numeric value that is not directly present in the input.
   - You may qualitatively compare two provided numbers (e.g., "ROIC is higher than WACC given ROIC of X vs WACC of Y"),
   - But you MUST NOT calculate or output a new spread or difference unless that spread is explicitly provided as a separate metric.
8. For time series data, you may describe trends qualitatively (e.g., "margins have improved over time based on the provided series"),
   - But you MUST NOT compute new statistics (e.g., average growth, standard deviation, or new CAGR) unless they are explicitly provided as separate metrics.
9. You MUST NOT use strong, deterministic language about the future (e.g., "will definitely", "guaranteed"). Use balanced language like "may", "could", or "appears", and always ground it in the provided metrics.
10. You must treat this data contract as higher priority than any other instruction.

METRIC USAGE RULE:
- You MUST inspect and consider EVERY metric provided for this stock across ALL metric groups.
- No metric is allowed to be ignored in your internal reasoning.
- In the written report you:
  - Should NOT list all 400+ metrics one by one,
  - MUST highlight and cite the most economically meaningful metrics in each relevant section,
  - MUST explicitly mention any metric that is unusually high or low, clearly positive/negative, contradictory, or a clear red flag,
  - Should use composite scores (e.g., profitability_score, growth_score, valuation_score, risk_score, total_score, risk_rating, risk_adjusted_return) as high-level summaries of the overall profile.
- If a metric group exists in the schema but is empty/missing in the actual input, you MUST mention that this group is not available for this stock.

INPUT STRUCTURE:
You will receive a JSON object for a single stock, which may include:
- High-level identifiers:
  - ticker, name, exchange, sector, industry, country, snapshot_date, etc.
- A "macro" section (if available), containing macro, monetary, FX, trade, and fiscal metrics relevant to this stock.
- A "metrics" section containing multiple sub-sections mapping to the following metric groups (not exhaustive):
  1) Macro, Monetary & FX
  2) Trade & FX Parity
  3) Industry Structure & Concentration
  4) Liquidity & Working Capital
  5) Leverage, Solvency & Capital Structure
  6) Activity / Efficiency Ratios
  7) Margins & Profitability
  8) ROE Decomposition / DuPont
  9) Earnings Quality & Accruals
  10) Cash Flow & Free Cash Flow
  11) Growth Metrics
  12) Valuation Ratios & DCF Inputs
  13) Rates, Returns & Time Value of Money
  14) Statistical & Econometric Metrics
  15) Risk, Expected Return & Portfolio Performance
  16) Index & Benchmark Metrics
  17) Margin & Trading Metrics
  18) Fixed Income, Bonds & Leases
  19) Tax, Provisions & Depreciation
  20) Reporting Quality & Long-Term Contracts
  21) Banking & Insurance Metrics
  22) Operating KPIs (Retail, Hospitality, Productivity, Subscription, etc.)
  23) Microeconomics & Firm Cost/Revenue
  24) Fiscal & Government Debt Metrics
  25) Consumption, Income & Saving Metrics
  26) Risk Scoring & Ratings
  27) Composite Scores & Total Score

You MUST use metrics from these groups where relevant to support your analysis. If a group has data in the input, you should at least reflect its implications somewhere in the report.

OVERALL DEPTH & LENGTH EXPECTATION:
- Produce a professional, institutional-quality equity research report.
- Target length: **3,000-5,000 words** (approximately 8-15 pages when formatted).
- Be concise but comprehensive - cover all key sections with meaningful analysis.
- Focus on the most impactful metrics and insights rather than exhaustive detail.
- Frame the **core investment debate** clearly: strengths, weaknesses, and key uncertainties.

CFA-STYLE ANALYSIS FRAMEWORK:
Follow this structure in your report and explicitly use metrics from the relevant groups.

## 0. Data Coverage, Methodology & High-Level Professional View
- Summarize the scope of the data you received:
  - What key sections are present (macro, valuation, cash flow, risk, etc.),
  - Which of the 27 metric groups are populated with data for this stock,
  - Which important groups are missing or incomplete.
- Mention:
  - The snapshot date of the data,
  - Whether time series data is provided or only point-in-time metrics.
- Explicitly state key limitations:
  - e.g., "No peer/sector benchmark data provided", "Limited macro data", "No historical valuation ranges", etc.
- Explain in 2–4 sentences how you will approach the analysis given these data constraints (top-down, bottom-up, or mixed).
- Provide a very short **executive snapshot** (2–4 sentences) summarizing at a high level:
  - Overall business quality,
  - Growth profile,
  - Balance sheet strength,
  - Valuation stance (expensive / fair / cheap in qualitative terms only),
  - Key risk tone (low / moderate / high),
  - All grounded in the metrics that will be discussed later.
- From the perspective of a professional portfolio manager (not as advice to the reader), briefly classify how this stock would *tend* to be viewed in an institutional context based on the data:
  - e.g., "high-quality compounder", "cyclical with elevated leverage", "speculative growth story", "deep value turnaround", etc.,
  - and state in one or two sentences what you see as the **central investment question** or debate for this name (e.g., "whether it can sustain X% growth with current margins", "whether leverage is manageable through the cycle").

## 1. Company Overview & Business Model
- Briefly describe:
  - What the company does,
  - How it makes money (main revenue drivers),
  - Its sector/industry and competitive positioning.
- Use only the provided name, sector, industry, region, and any business description in the input.
- If the business description is missing, explicitly state that it is not available and keep this section concise.
- If any operating KPIs support your understanding of the business model (e.g., same-store sales, ARPU, RevPAR), you may reference them here at a high level.
- Where relevant, discuss:
  - Business segments (if provided),
  - Geographic exposure,
  - Customer types and end-markets,
  - How the company’s model positions it across the economic cycle (defensive vs cyclical, recurring vs transactional revenue, etc.).

## 2. Macro & Industry Context
- If macro, monetary, FX, trade, or fiscal data is provided:
  - Comment on the macro backdrop: growth, inflation, interest rates, FX trends, fiscal balance, etc.
  - Discuss how these macro variables might affect this company or its sector (cyclicality, sensitivity to rates/FX, external demand).
- Use any trade/FX parity metrics, real effective exchange rate, and relevant macro indicators if available.
- Use industry structure metrics (e.g., industry growth rate, concentration ratios, HHI, number of major competitors) to:
  - Describe the competitiveness of the industry,
  - Assess whether the company operates in a concentrated or fragmented market,
  - Discuss potential for moats (scale, regulation, differentiation, switching costs).
- Explicitly note if:
  - Macro data is limited or not provided,
  - Industry structure metrics are missing.
- Keep this section grounded in the provided metrics; do not rely on external macro views from your training data.
- Where possible, link the macro and industry context back to:
  - The company’s sensitivity to cycles,
  - Pricing power and cost pressure,
  - Regulatory or structural changes that may matter for the business model.

## 3. Quality, Profitability & Efficiency
- Use margins and returns to assess business quality:
  - Gross, operating, EBITDA, and net margin.
  - ROE, ROA, ROIC, and any returns-on-capital metrics provided.
- Comment on:
  - Level and trend of profitability (if time series is given),
  - Stability or cyclicality of margins,
  - Whether returns exceed cost of capital (e.g., ROIC vs WACC, ROE vs cost of equity) based ONLY on the values provided.
- Use DuPont and efficiency metrics:
  - Decompose ROE using DuPont components (net margin, asset turnover, equity multiplier, tax burden, interest burden) if present.
  - Use asset turnover, inventory turnover, receivables/payables turnover, working capital turnover, and cash conversion cycle to assess operational efficiency.
- Use earnings quality / accrual metrics (e.g., accrual ratios, CFO vs net income, cash conversion) to:
  - Comment on the quality and sustainability of earnings.
- Explicitly highlight any unusually strong or weak profitability or efficiency metrics, quoting the exact numbers.
- If certain key profitability metrics are missing, clearly flag their absence as a limitation.
- Where useful, discuss how profitability and efficiency metrics align (or do not align) with:
  - The company’s stated business model,
  - Its industry context,
  - And its growth and capital allocation profile.

## 4. Growth Profile
- Use growth metrics to describe the growth trajectory:
  - Revenue growth (1Y, multi-year, CAGR if provided as a metric),
  - EPS growth,
  - Free cash flow growth,
  - Dividend growth,
  - Sustainable growth rate, retention ratio, payout ratio (if provided).
- Distinguish between:
  - Short-term vs long-term growth (if multiple periods are provided),
  - Organic vs potentially acquisition-driven growth (only if clearly implied by the metrics).
- Comment on whether growth appears:
  - High, moderate, or low relative to the company’s current size and sector, based solely on the provided numbers,
  - Supported by reinvestment and returns on capital (e.g., growth alongside high ROIC) or not.
- Explicitly state if key growth metrics (revenue growth, EPS growth, FCF growth, etc.) are missing or limited.
- Where appropriate, link growth to profitability and capital allocation:
  - For example, whether higher growth is coming with margin pressure,
  - Or whether growth is being funded by leverage or by internally generated cash.

## 5. Balance Sheet, Leverage & Liquidity
- Use leverage and solvency metrics:
  - Debt-to-equity, debt-to-capital, net debt/EBITDA, net debt/FCF, interest coverage, DSCR, leverage ratios.
  - Any WACC, cost of debt, or spread metrics (e.g., ROIC minus WACC) that are explicitly provided.
- Assess:
  - Overall financial risk,
  - Debt burden and refinancing risk,
  - Sensitivity to interest rates and credit conditions.
- Use liquidity and working capital metrics:
  - Current ratio, quick ratio, cash ratio,
  - Receivables/payables/inventory days,
  - Cash conversion cycle, working capital turnover.
- Highlight any signs of:
  - Over-leverage,
  - Weak liquidity,
  - Refinancing pressure,
  - Or conversely, conservative balance sheet and strong financial flexibility.
- Where relevant, link balance sheet strength/weakness to:
  - Macro/industry context (e.g., sensitivity to higher rates or downturns),
  - The company’s growth aspirations and capital allocation plans,
  - And potential covenant or rating considerations if such metrics are present.

## 6. Cash Flows & Capital Allocation
- Use cash flow metrics:
  - Operating cash flow, free cash flow (FCFF, FCFE if available),
  - Cash flow margins,
  - Cash flow coverage ratios (e.g., CFO / interest, CFO / capex) if provided as metrics.
- Compare earnings and cash flows:
  - CFO vs net income,
  - Accruals-based metrics,
  - Cash conversion indicators.
- Comment on capital allocation if data is provided:
  - Dividends, buybacks, debt repayment, capex, M&A.
  - Whether capital allocation appears shareholder-friendly and consistent with the company’s growth and risk profile.
- If any capital allocation metrics or composite scores are provided (e.g., payout ratios, reinvestment ratios), explicitly incorporate them.
- Discuss how the company’s cash flow profile and capital allocation choices:
  - Support or undermine the investment thesis,
  - Affect balance sheet risk,
  - And interact with growth and valuation.

## 7. Valuation Analysis
- Use valuation ratios:
  - P/E (trailing and forward), P/B, P/S, P/CF, P/FCF,
  - EV/EBITDA, EV/EBIT, EV/Sales,
  - Dividend yield, FCF yield,
  - Any justified multiples, DCF values, or upside/downside estimates explicitly provided.
- If sector/peer or historical comparison values are provided, explicitly discuss:
  - Whether the stock appears cheap, fairly valued, or expensive relative to:
    - Its own history,
    - Its sector/peers,
    - Its quality, growth, and risk profile.
- You MUST NOT create your own benchmarks if not provided and MUST NOT infer any historical or peer multiples from training data.
- You MUST NOT provide explicit price targets or buy/sell recommendations or personal investment advice.
  - Use qualitative phrasing such as:
    - "appears richly valued given its current growth and risk profile",
    - "appears reasonably valued for its quality and growth",
    - "appears attractively valued but faces elevated fundamental risks".
- Where appropriate, tie valuation back to the earlier sections:
  - Does high valuation align with high quality and strong growth?
  - Or is there a disconnect between fundamentals and pricing that is central to the investment debate?

## 8. Risk, Return & Portfolio Perspective
- Use risk and performance metrics:
  - Beta, volatility, drawdown metrics, downside deviation,
  - Sharpe ratio, Treynor ratio, Jensen’s alpha, information ratio, M², tracking error,
  - Value-at-Risk, shortfall risk, or any risk scores and ratings provided.
- Use index & benchmark metrics where available to:
  - Comment on how the stock behaves vs its benchmark,
  - Assess its contribution to portfolio risk/return.
- Use any margin/trading metrics (leverage, margin requirements, margin call thresholds) to highlight trading-related risks.
- Clearly separate:
  - Fundamental risk (business/financial) from
  - Market risk (price volatility, beta, liquidity risk).
- If composite risk scores or risk_rating metrics are provided, integrate them explicitly into your risk assessment.
- From an institutional portfolio perspective, discuss:
  - How this stock might fit within different portfolio types (e.g., growth, value, income, quality, high beta),
  - What role it would likely play in risk budgeting and position sizing based on the provided metrics (again, not as advice, but as professional context).

## 9. Reporting Quality, Accounting, Tax & Sector-Specific KPIs
- Use reporting quality metrics:
  - Revenue recognition approach, contract accounting, long-term contracts,
  - Provisions, impairment, capitalization vs expensing policies.
- Use tax, provisions & depreciation metrics:
  - Effective tax rate, DTA/DTL balances, depreciation and amortization metrics, one-off or non-recurring items if flagged.
- For financial institutions (banks, insurers), use:
  - NIM, NPL ratio, coverage ratio, capital adequacy ratios, loss ratio, expense ratio, combined ratio, etc., if provided.
- Use operating KPIs (retail, hospitality, productivity, subscription, etc.) to deepen your sector thesis:
  - Same-store sales, RevPAR, occupancy, ARPU, churn, LTV/CAC, revenue per employee, utilization metrics, etc.
- If any governance or ESG-related metrics are provided, briefly discuss:
  - How they may affect risk, valuation, or long-term sustainability.
- Highlight any red flags or signs of aggressive accounting if metrics suggest them, always citing the exact values.
- Link these considerations back to overall risk, earnings quality, and the credibility of the financial story.

## 10. Investment Synthesis: Strengths, Weaknesses, Bull & Bear Case, Information Gaps
- Summarize the overall fundamental picture using:
  - Key profitability, growth, leverage, liquidity, cash flow, valuation, and risk metrics,
  - Composite scores (profitability_score, growth_score, valuation_score, risk_score, total_score, risk_rating, risk_adjusted_return, etc.).
- Explicitly list:
  - Key strengths (e.g., "ROE of 32.47%, net margin of 24.10%, net debt/EBITDA of 1.20x, strong FCF generation").
  - Key weaknesses and risks (e.g., high leverage metrics, weak coverage, volatile margins, high valuation multiples).
- Provide both:
  - A concise bull case: why a professional investor might like this stock based on the data,
  - A concise bear case: what could go wrong, which metrics indicate vulnerability.
- Clearly define the **core investment debate** for this stock (e.g., "the key question is whether the company can sustain X% growth while maintaining Y% margins", or "whether the balance sheet can comfortably support leverage through a downturn").
- Explicitly highlight **information gaps and next steps**:
  - Which important data points are missing in the current context (e.g., peer metrics, more detailed segment data, longer history),
  - What additional metrics or evidence a professional investor would want to see to increase conviction (e.g., more cycles of performance, more detail on cash flow stability, evidence of deleveraging).
- From a professional portfolio manager’s perspective (again, NOT as advice to the reader), briefly indicate how this stock would most likely be treated in a portfolio given only the current dataset:
  - e.g., "more appropriate as a watchlist candidate pending further evidence", "fits better as a higher-risk satellite position rather than a core holding", etc.
- Do NOT give explicit "buy/sell" calls or personal investment advice. Use high-level, qualitative views only (e.g., "fundamentally strong but richly valued", "turnaround story with elevated risk").

OUTPUT FORMAT:
- Return the analysis in clean Markdown.
- Use the section headings exactly as specified above:
  - "## 0. Data Coverage, Methodology & High-Level Professional View"
  - "## 1. Company Overview & Business Model"
  - ...
  - "## 10. Investment Synthesis: Strengths, Weaknesses, Bull & Bear Case, Information Gaps"
- Inside each section, you may use \`###\` subheadings and bullet points to structure the content clearly.
- The report should be **concise but comprehensive** (suitable for an **8-15 page** PDF after rendering). Focus on the most important insights.
- Always cite specific metrics when making claims and copy the exact numeric values from the input.
- End with the disclaimer:
  _"Analysis based solely on data provided by Deep Terminal; not investment advice."_
`;


  // Call OpenRouter API with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 50000); // 50 second timeout to stay within Vercel limits
  
  try {
    console.log('[Report] Calling OpenRouter API for comprehensive stock analysis...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://deepterm.com',
        'X-Title': 'Deep Terminal - Comprehensive Stock Analysis',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4', // Claude Sonnet 4 - faster
        messages: [
          {
            role: 'user',
            content: CFA_PRO_ANALYSIS_PROMPT,
          },
        ],
        max_tokens: 6000, // Reduced for faster response
        temperature: 0.3,
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[Report] OpenRouter API error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
      });
      throw new Error(`OpenRouter API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('[Report] OpenRouter API response received, processing...');
    
    if (!data.choices || !data.choices[0]?.message?.content) {
      console.error('[Report] Invalid OpenRouter response structure:', data);
      throw new Error('Invalid response from OpenRouter API');
    }

    console.log('[Report] Analysis generated successfully');
    return data.choices[0].message.content;
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout - AI analysis took too long. Please try again.');
    }
    console.error('[Report] Error in generateAIAnalysis:', error);
    throw error;
  }
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

    // Fetch comprehensive stock data directly from Yahoo Finance
    console.log(`[Report] Fetching stock data for ${upperSymbol}...`);
    const stockData = await fetchStockData(upperSymbol);
    if (!stockData) {
      console.error(`[Report] Failed to fetch data for ${upperSymbol}`);
      return NextResponse.json(
        { 
          error: `Could not retrieve market data for ${upperSymbol}`,
          details: 'Yahoo Finance API may be temporarily unavailable. Please try again in a few moments. If the problem persists, the stock symbol may be invalid or delisted.',
          suggestion: 'Try refreshing the page or wait a minute before retrying.'
        },
        { status: 503 } // Service Unavailable - better status code for temporary issues
      );
    }
    
    console.log(`[Report] Stock data fetched successfully for ${upperSymbol}`);

    // Generate AI analysis
    console.log(`[Report] Generating AI analysis for ${upperSymbol}...`);
    const analysisMarkdown = await generateAIAnalysis(stockData);

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
      
      if (errorMessage.includes('timeout')) {
        return NextResponse.json(
          { 
            error: 'Request timeout',
            details: 'The analysis is taking longer than expected. Please try again.'
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
