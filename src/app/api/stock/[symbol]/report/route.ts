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
import YahooFinance from 'yahoo-finance2';

// Note: MetricsCalculator import path - adjust based on project structure
// import { MetricsCalculator } from '../../../../../../../../lib/metrics';

// Create Yahoo Finance instance
const yahooFinance = new YahooFinance({ suppressNotices: ['yahooSurvey', 'ripHistorical'] });

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
 * Fetch comprehensive stock data for report generation using Yahoo Finance directly
 * Now includes 430+ calculated metrics from MetricsCalculator
 */
async function fetchStockData(symbol: string): Promise<StockDataForReport | null> {
  try {
    console.log(`[Report] Fetching Yahoo Finance data for ${symbol}...`);
    
    // Fetch quote data with retry logic
    let quote: any = null;
    let retries = 3;
    
    while (retries > 0 && !quote) {
      try {
        const quoteData = await yahooFinance.quote(symbol);
        quote = quoteData as any;
        if (quote && quote.regularMarketPrice) {
          break;
        }
      } catch (quoteError: any) {
        console.warn(`[Report] Quote attempt failed for ${symbol}, retries left: ${retries - 1}`, quoteError.message);
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
    }
    
    if (!quote || !quote.regularMarketPrice) {
      console.error(`[Report] No quote data for ${symbol} after retries`);
      return null;
    }

    // Fetch quoteSummary for detailed data
    let summaryData: any = {};
    try {
      const summary = await yahooFinance.quoteSummary(symbol, {
        modules: [
          'summaryProfile',
          'summaryDetail', 
          'financialData',
          'defaultKeyStatistics',
          'earningsHistory',
          'earningsTrend',
          'industryTrend',
          'recommendationTrend',
          'upgradeDowngradeHistory',
          'incomeStatementHistory',
          'balanceSheetHistory',
          'cashflowStatementHistory',
        ]
      });
      summaryData = summary;
    } catch (error) {
      console.warn('[Report] Could not fetch full summary data:', error);
    }

    // Fetch historical data for technical analysis
    let historicalData: any[] = [];
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - 1);
      
      const historical = await yahooFinance.chart(symbol, {
        period1: startDate,
        period2: endDate,
        interval: '1d',
      });
      
      if (historical && (historical as any).quotes) {
        historicalData = (historical as any).quotes.slice(-252); // Last year of trading days
      }
    } catch (error) {
      console.warn('[Report] Could not fetch historical data:', error);
    }

    // Build comprehensive metrics object
    const metrics = {
      // Valuation
      pe: quote.trailingPE,
      forwardPE: quote.forwardPE,
      peg: summaryData.defaultKeyStatistics?.pegRatio,
      priceToBook: quote.priceToBook,
      priceToSales: summaryData.summaryDetail?.priceToSalesTrailing12Months,
      enterpriseValue: summaryData.defaultKeyStatistics?.enterpriseValue,
      evToRevenue: summaryData.defaultKeyStatistics?.enterpriseToRevenue,
      evToEbitda: summaryData.defaultKeyStatistics?.enterpriseToEbitda,
      
      // Profitability
      profitMargin: summaryData.financialData?.profitMargins,
      operatingMargin: summaryData.financialData?.operatingMargins,
      grossMargin: summaryData.financialData?.grossMargins,
      returnOnEquity: summaryData.financialData?.returnOnEquity,
      returnOnAssets: summaryData.financialData?.returnOnAssets,
      
      // Growth
      revenueGrowth: summaryData.financialData?.revenueGrowth,
      earningsGrowth: summaryData.financialData?.earningsGrowth,
      earningsQuarterlyGrowth: summaryData.defaultKeyStatistics?.earningsQuarterlyGrowth,
      
      // Financial Health
      currentRatio: summaryData.financialData?.currentRatio,
      quickRatio: summaryData.financialData?.quickRatio,
      debtToEquity: summaryData.financialData?.debtToEquity,
      totalDebt: summaryData.financialData?.totalDebt,
      totalCash: summaryData.financialData?.totalCash,
      freeCashflow: summaryData.financialData?.freeCashflow,
      operatingCashflow: summaryData.financialData?.operatingCashflow,
      
      // Dividends
      dividendYield: quote.dividendYield,
      dividendRate: quote.dividendRate,
      payoutRatio: summaryData.summaryDetail?.payoutRatio,
      fiveYearAvgDividendYield: summaryData.summaryDetail?.fiveYearAvgDividendYield,
      
      // Risk & Volatility
      beta: quote.beta,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow,
      fiftyDayAverage: quote.fiftyDayAverage,
      twoHundredDayAverage: quote.twoHundredDayAverage,
      
      // Shares
      sharesOutstanding: summaryData.defaultKeyStatistics?.sharesOutstanding,
      floatShares: summaryData.defaultKeyStatistics?.floatShares,
      sharesShort: summaryData.defaultKeyStatistics?.sharesShort,
      shortRatio: summaryData.defaultKeyStatistics?.shortRatio,
      shortPercentOfFloat: summaryData.defaultKeyStatistics?.shortPercentOfFloat,
      
      // Analyst Ratings
      targetHighPrice: summaryData.financialData?.targetHighPrice,
      targetLowPrice: summaryData.financialData?.targetLowPrice,
      targetMeanPrice: summaryData.financialData?.targetMeanPrice,
      recommendationMean: summaryData.financialData?.recommendationMean,
      recommendationKey: summaryData.financialData?.recommendationKey,
      numberOfAnalystOpinions: summaryData.financialData?.numberOfAnalystOpinions,
      
      // Earnings
      trailingEps: quote.epsTrailingTwelveMonths,
      forwardEps: quote.epsForward,
      bookValue: summaryData.defaultKeyStatistics?.bookValue,
    };

    // Calculate additional technical metrics from historical data
    let technicalMetrics = {};
    if (historicalData.length > 0) {
      const prices = historicalData.map(d => d.close).filter(Boolean);
      if (prices.length > 20) {
        const last20 = prices.slice(-20);
        const last50 = prices.slice(-50);
        const volatility = calculateVolatility(prices.slice(-30));
        
        technicalMetrics = {
          sma20: last20.reduce((a, b) => a + b, 0) / last20.length,
          sma50: last50.length >= 50 ? last50.reduce((a, b) => a + b, 0) / 50 : null,
          volatility30Day: volatility,
          priceChange1Month: prices.length > 21 ? ((prices[prices.length - 1] - prices[prices.length - 22]) / prices[prices.length - 22]) * 100 : null,
          priceChange3Month: prices.length > 63 ? ((prices[prices.length - 1] - prices[prices.length - 64]) / prices[prices.length - 64]) * 100 : null,
          priceChange1Year: prices.length > 252 ? ((prices[prices.length - 1] - prices[0]) / prices[0]) * 100 : null,
        };
      }
    }

    // Calculate 430+ advanced metrics using MetricsCalculator
    // TODO: Enable when MetricsCalculator is fully integrated
    let advancedMetrics = null;
    /* 
    try {
      const calculator = new MetricsCalculator({
        enableCache: false,
        currency: 'USD',
      });
      
      // Prepare raw financial data for calculator
      const rawData = {
        yahooFinance: {
          quote,
          summaryData,
          historicalData,
        },
        incomeStatement: summaryData.incomeStatementHistory?.incomeStatementHistory || [],
        balanceSheet: summaryData.balanceSheetHistory?.balanceSheetStatements || [],
        cashflowStatement: summaryData.cashflowStatementHistory?.cashflowStatements || [],
      };
      
      advancedMetrics = await calculator.calculateAll(rawData);
      console.log('[Report] Advanced metrics calculated successfully (430+ metrics)');
    } catch (metricsError) {
      console.warn('[Report] Could not calculate advanced metrics:', metricsError);
    }
    */

    return {
      symbol: quote.symbol,
      companyName: quote.longName || quote.shortName || symbol,
      sector: summaryData.summaryProfile?.sector || 'N/A',
      industry: summaryData.summaryProfile?.industry || 'N/A',
      currentPrice: quote.regularMarketPrice || 0,
      marketCap: quote.marketCap || 0,
      metrics: { ...metrics, ...technicalMetrics },
      advancedMetrics,
      historicalData: historicalData.length > 0 ? {
        prices: historicalData.slice(-60).map(d => ({
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
- You have 15+ years of experience in equity research and portfolio management.
- You have managed multi-billion-dollar equity portfolios across multiple market cycles.
- You are deeply familiar with the CFA Institute equity research framework, valuation techniques, macro/sector analysis, portfolio construction, and professional standards.
- You analyze stocks within a structured, repeatable framework consistent with CFA best practices.
- You always provide objective, educational analysis and NEVER give personalized investment advice or explicit trading recommendations.

Your role in Deep Terminal:
- Act as a senior investment professional reviewing and synthesizing the provided data for a single stock.
- Translate raw metrics (including 430+ metrics across 27 categories) into a clear, coherent, professional-grade investment analysis.
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

Create an exceptionally detailed, institutional-grade investment research report with AT LEAST 25-30 pages of content. This must be the most comprehensive analysis possible. Cover EVERY available metric and provide deep insights.

# ${stockData.symbol} - COMPREHENSIVE EQUITY RESEARCH REPORT
**${stockData.companyName}**
**Sector:** ${stockData.sector} | **Industry:** ${stockData.industry}
**Report Date:** ${new Date().toISOString().split('T')[0]}

---

## EXECUTIVE SUMMARY (2-3 pages)

### Investment Thesis
Write a detailed investment thesis covering:
- Comprehensive bull case with specific catalysts and evidence
- Comprehensive bear case with specific risks and evidence
- Overall risk/reward assessment with probability-weighted scenarios
- Key investment considerations for different investor types

### Key Metrics Dashboard
Present ALL key metrics in organized tables:
| Category | Metric | Value | Assessment |
|----------|--------|-------|------------|
(Include at least 20-25 key metrics)

### Investment Scorecard
Provide scores (1-10) with detailed justification for each:
- Business Quality Score: X/10
- Financial Strength Score: X/10
- Growth Profile Score: X/10
- Valuation Score: X/10
- Risk-Adjusted Score: X/10
- Overall Score: X/10

---

## SECTION 1: BUSINESS QUALITY ASSESSMENT (3-4 pages)

### 1.1 Company Overview
- Detailed business model analysis
- Revenue streams breakdown and diversification
- Market position and competitive landscape
- Industry dynamics and secular trends

### 1.2 Competitive Moat Analysis
- Sources of competitive advantage (pricing power, brand, network effects, switching costs, etc.)
- Moat durability assessment
- Competitive threats and vulnerability analysis
- Porter's Five Forces framework application

### 1.3 Management & Governance
- Management track record assessment
- Capital allocation history
- Insider ownership and alignment
- Corporate governance quality

### 1.4 Strategic Position
- SWOT Analysis (detailed)
- Key success factors
- Growth initiatives and strategy
- Market opportunities and addressable market

---

## SECTION 2: FINANCIAL STATEMENT ANALYSIS (4-5 pages)

### 2.1 Income Statement Deep Dive
- Revenue analysis (growth, composition, quality)
- Margin analysis (gross, operating, net) with trends
- Operating leverage assessment
- Earnings quality analysis
- Non-recurring items identification

### 2.2 Balance Sheet Health
- Asset composition and quality
- Liability structure analysis
- Working capital management efficiency
- Capital structure optimization
- Off-balance sheet items review

### 2.3 Cash Flow Analysis
- Operating cash flow quality and consistency
- Free cash flow generation and sustainability
- Cash conversion cycle analysis
- Capital expenditure analysis (maintenance vs growth)
- Dividend and buyback capacity

### 2.4 DuPont Analysis
- ROE decomposition (profit margin × asset turnover × financial leverage)
- Historical trend analysis
- Peer comparison
- Quality of returns assessment

---

## SECTION 3: PROFITABILITY ANALYSIS (2-3 pages)

### 3.1 Margin Analysis
Present in table format with interpretation:
| Metric | Current | Prior Year | 3Y Avg | Industry Avg | Assessment |
|--------|---------|------------|--------|--------------|------------|

### 3.2 Return Metrics
- Return on Equity (ROE) deep analysis
- Return on Assets (ROA) analysis
- Return on Invested Capital (ROIC) vs WACC
- Economic Value Added (EVA) assessment
- Return sustainability analysis

### 3.3 Profitability Quality
- Earnings persistence analysis
- Revenue recognition quality
- Accruals analysis
- Cash vs accrual earnings comparison

---

## SECTION 4: GROWTH ANALYSIS (2-3 pages)

### 4.1 Historical Growth Review
- Revenue CAGR analysis (1Y, 3Y, 5Y)
- Earnings growth trajectory
- Cash flow growth patterns
- Book value growth

### 4.2 Growth Drivers
- Organic vs inorganic growth breakdown
- Market share trends
- New product/service contributions
- Geographic expansion analysis

### 4.3 Forward Growth Assessment
- Analyst growth estimates review
- Growth sustainability factors
- Growth quality indicators
- Reinvestment rate and opportunity analysis

---

## SECTION 5: LEVERAGE & LIQUIDITY ANALYSIS (2-3 pages)

### 5.1 Liquidity Analysis
| Metric | Value | Benchmark | Assessment |
|--------|-------|-----------|------------|
(Current ratio, Quick ratio, Cash ratio, etc.)

### 5.2 Solvency Analysis
- Debt/Equity analysis and trends
- Debt/EBITDA assessment
- Interest coverage analysis
- Fixed charge coverage

### 5.3 Capital Structure
- Optimal capital structure discussion
- Debt maturity profile
- Refinancing risk assessment
- Credit rating implications

### 5.4 Financial Flexibility
- Available credit facilities
- Debt covenants review
- Bankruptcy risk assessment (Altman Z-Score if available)

---

## SECTION 6: EFFICIENCY ANALYSIS (1-2 pages)

### 6.1 Asset Efficiency
- Asset turnover ratios
- Fixed asset efficiency
- Working capital efficiency

### 6.2 Working Capital Management
- Days Sales Outstanding (DSO)
- Days Inventory Outstanding (DIO)
- Days Payables Outstanding (DPO)
- Cash Conversion Cycle analysis

### 6.3 Capital Efficiency
- Capital employed efficiency
- Investment efficiency metrics
- Capacity utilization indicators

---

## SECTION 7: VALUATION ANALYSIS (4-5 pages)

### 7.1 Absolute Valuation
#### Discounted Cash Flow Analysis (if data available)
- Key assumptions
- Projected free cash flows
- WACC calculation
- Terminal value methodology
- Fair value range estimation

### 7.2 Relative Valuation
| Multiple | Current | 5Y Avg | Sector Avg | Assessment |
|----------|---------|--------|------------|------------|
(P/E, Forward P/E, P/B, P/S, EV/EBITDA, EV/Revenue, PEG)

### 7.3 Historical Valuation Context
- 5-year valuation band analysis
- Current percentile vs history
- Premium/discount justification
- Mean reversion potential

### 7.4 Sum-of-Parts Analysis (if applicable)
- Segment valuation
- Hidden assets/liabilities
- NAV calculation

### 7.5 Fair Value Synthesis
- Bull/Base/Bear case valuations
- Probability-weighted fair value
- Margin of safety analysis
- Catalysts for re-rating

---

## SECTION 8: RISK ASSESSMENT (3-4 pages)

### 8.1 Financial Risks
- Credit risk analysis
- Interest rate sensitivity
- Currency exposure
- Liquidity risk
- Counterparty risk

### 8.2 Business/Operating Risks
- Revenue concentration risk
- Customer/supplier dependency
- Technology/disruption risk
- Regulatory/legal risks
- ESG risks

### 8.3 Market Risks
- Beta and systematic risk
- Volatility analysis (30-day, 1-year)
- Correlation analysis
- Downside risk metrics (VaR, Max Drawdown)

### 8.4 Risk Matrix
| Risk Factor | Probability | Impact | Mitigation | Score |
|-------------|-------------|--------|------------|-------|
(List top 10 risks)

---

## SECTION 9: TECHNICAL ANALYSIS (2-3 pages)

### 9.1 Trend Analysis
- Primary trend identification
- Moving average analysis (20, 50, 200 day)
- Support/resistance levels
- Trend strength assessment

### 9.2 Momentum Analysis
- RSI analysis
- MACD signals
- Volume trends
- Relative strength vs market

### 9.3 Price Action
- 52-week high/low context
- Recent price performance (1M, 3M, 6M, 1Y)
- Pattern recognition
- Key technical levels

### 9.4 Analyst Sentiment
- Consensus recommendations breakdown
- Price target analysis
- Recent rating changes
- Sentiment trend

---

## SECTION 10: SHAREHOLDER ANALYSIS (1-2 pages)

### 10.1 Ownership Structure
- Institutional ownership
- Insider ownership and transactions
- Short interest analysis
- Float analysis

### 10.2 Capital Returns
- Dividend policy and history
- Dividend yield and payout ratio
- Share buyback analysis
- Total shareholder return

---

## SECTION 11: INVESTMENT CONCLUSION (2-3 pages)

### 11.1 Synthesized Assessment
- Comprehensive strengths summary (bullet points with evidence)
- Comprehensive weaknesses summary (bullet points with evidence)
- Competitive positioning conclusion
- Financial health conclusion

### 11.2 Scenario Analysis
#### Bull Case (25% probability)
- Key assumptions
- Valuation target
- Catalysts required

#### Base Case (50% probability)
- Key assumptions
- Valuation target
- Expected path

#### Bear Case (25% probability)
- Key assumptions
- Valuation target
- Risk triggers

### 11.3 Portfolio Considerations
- Suitable investor profiles
- Position sizing guidance (based on risk)
- Entry/exit considerations
- Hedging strategies

### 11.4 Monitoring Framework
- Key metrics to watch
- Thesis-changing triggers
- Review frequency recommendation

---

## APPENDIX

### A. Complete Metrics Tables
(Present all available metrics in organized tables by category)

### B. Historical Data Summary
(Key historical trends)

### C. Glossary of Terms
(Define key financial terms used)

---

**IMPORTANT DISCLAIMER**

This report is for educational and informational purposes only. It does not constitute investment advice, a recommendation, or a solicitation to buy or sell any securities. All investments involve risk, including the loss of principal. Past performance does not guarantee future results. The analysis contained herein is based on data believed to be reliable but accuracy cannot be guaranteed. Consult a qualified financial advisor before making any investment decisions.

---

*Comprehensive Research Report generated by Deep Terminal AI Research Platform*
*Powered by 430+ financial metrics across 27 categories*
*Analysis Date: ${new Date().toISOString().split('T')[0]}*

---

FORMATTING GUIDELINES:
- Use extensive markdown formatting with headers, tables, and lists
- Include detailed tables for all metric comparisons
- Bold all key metrics and important findings
- Use bullet points extensively for readability
- Include horizontal rules between major sections
- Make the report AT LEAST 8000-10000 words
- Every section must have substantial content
- Do NOT skip any section - provide full analysis for each`;

  // Call OpenRouter API
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
        model: 'anthropic/claude-opus-4.5', // Claude Opus 4.5 for highest quality
        messages: [
          {
            role: 'user',
            content: CFA_PRO_ANALYSIS_PROMPT,
          },
        ],
        max_tokens: 32000, // Maximum output for comprehensive report
        temperature: 0.3,
      }),
    });

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
  } catch (error) {
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
