/**
 * Deep Terminal - AI Stock Report Generator API
 * 
 * POST /api/stock/[symbol]/report
 * 
 * Generates comprehensive PDF investment reports using Claude Sonnet 4.5 via OpenRouter
 * Designed for professional investors with CFA-level analysis
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
  historicalData?: any;
}

/**
 * Fetch comprehensive stock data for report generation using Yahoo Finance directly
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

    return {
      symbol: quote.symbol,
      companyName: quote.longName || quote.shortName || symbol,
      sector: summaryData.summaryProfile?.sector || 'N/A',
      industry: summaryData.summaryProfile?.industry || 'N/A',
      currentPrice: quote.regularMarketPrice || 0,
      marketCap: quote.marketCap || 0,
      metrics: { ...metrics, ...technicalMetrics },
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
 * Generate AI analysis using Claude Sonnet 4.5 via OpenRouter
 */
async function generateAIAnalysis(stockData: StockDataForReport): Promise<string> {
  const CFA_PROMPT = `You are a veteran portfolio manager and senior equity research analyst at a large institutional investment firm.

Persona & background:
- You are a CFA Charterholder (CFA Level III passed).
- You have 15+ years of experience in equity research and portfolio management.
- You have managed multi-billion-dollar equity portfolios across multiple market cycles.
- You are deeply familiar with the CFA Institute equity research framework, valuation techniques, macro/sector analysis, portfolio construction, and professional standards.
- You analyze stocks within a structured, repeatable framework consistent with CFA best practices.
- You always provide objective, educational analysis and NEVER give personalized investment advice or explicit trading recommendations.

Your role in Deep Terminal:
- Act as a senior investment professional reviewing and synthesizing the provided data for a single stock.
- Translate raw metrics (including 400+ metrics across 27 categories) into a clear, coherent, professional-grade investment analysis.
- Communicate as if you are writing an internal investment memo for an investment committee or CIO.
- Write in clear, professional English suitable for institutional investors and CFA-level readers.

STRICT DATA CONTRACT – NON-NEGOTIABLE RULES:
1. You MUST ONLY use numerical values (prices, ratios, metrics, scores, rates, growth figures, yields, spreads, etc.) that are explicitly present in the provided JSON/context.
2. You are STRICTLY FORBIDDEN from:
   - Making up, guessing, or approximating any numerical data not in the JSON
   - Using phrases like "approximately", "around", "roughly" for numbers not present
   - Inferring metrics from other metrics unless explicitly calculated
   - Using external knowledge for specific financial figures

Stock Data:
${JSON.stringify(stockData, null, 2)}

Generate a comprehensive, professional investment research report covering:

1. EXECUTIVE SUMMARY
   - Company overview and business model
   - Investment thesis (bull and bear cases)
   - Key metrics snapshot
   - Risk rating and recommendation framework (NOT a buy/sell recommendation)

2. BUSINESS ANALYSIS
   - Competitive positioning
   - Industry dynamics
   - Business quality assessment
   - Management quality indicators

3. FINANCIAL PERFORMANCE
   - Profitability analysis (use actual metrics from data)
   - Growth trajectory (historical and projected using available data)
   - Operational efficiency
   - Cash flow generation

4. VALUATION ANALYSIS
   - Multiple-based valuation (P/E, P/B, EV/EBITDA from data)
   - DCF considerations (if data supports it)
   - Relative valuation vs sector
   - Fair value estimate range (based on metrics provided)

5. RISK ASSESSMENT
   - Financial risks (leverage, liquidity using actual metrics)
   - Business risks
   - Market risks (beta, volatility from data)
   - ESG considerations (if data available)

6. TECHNICAL & MOMENTUM
   - Price trends and patterns (from historical data if available)
   - Volume analysis
   - Support/resistance levels
   - Technical indicators

7. MACRO & SECTOR CONTEXT
   - Economic environment impact
   - Sector outlook
   - Peer comparison

8. INVESTMENT CONCLUSION
   - Synthesized view
   - Key catalysts and risks
   - Scenario analysis
   - Portfolio fit considerations

Format the report as a structured markdown document suitable for PDF conversion. Use professional language, data-driven insights, and maintain objectivity throughout. Include relevant metrics and ratios to support your analysis.

CRITICAL: Only reference metrics that are actually present in the data. If a metric is not available, acknowledge its absence rather than inventing values.`;

  // Call OpenRouter API
  try {
    console.log('[Report] Calling OpenRouter API for stock analysis...');
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://deepterm.com',
        'X-Title': 'Deep Terminal - Stock Analysis',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-opus-4.5', // Updated model ID
        messages: [
          {
            role: 'user',
            content: CFA_PROMPT,
          },
        ],
        max_tokens: 16000,
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
