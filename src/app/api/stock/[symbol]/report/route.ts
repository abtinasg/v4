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
 * Fetch comprehensive stock data for report generation
 */
async function fetchStockData(symbol: string, baseUrl: string): Promise<StockDataForReport | null> {
  try {
    // Fetch metrics
    const metricsResponse = await fetch(`${baseUrl}/api/stock/${symbol}/metrics`, {
      cache: 'no-store',
    });

    if (!metricsResponse.ok) {
      console.error(`Failed to fetch metrics for ${symbol}`);
      return null;
    }

    const metricsData = await metricsResponse.json();

    // Fetch historical data
    let historicalData = null;
    try {
      const historicalResponse = await fetch(`${baseUrl}/api/stock/${symbol}/historical?period=1y`, {
        cache: 'no-store',
      });
      if (historicalResponse.ok) {
        historicalData = await historicalResponse.json();
      }
    } catch (error) {
      console.warn('Could not fetch historical data:', error);
    }

    return {
      symbol: metricsData.symbol,
      companyName: metricsData.companyName,
      sector: metricsData.sector,
      industry: metricsData.industry,
      currentPrice: metricsData.currentPrice,
      marketCap: metricsData.marketCap,
      metrics: metricsData.metrics,
      historicalData,
    };
  } catch (error) {
    console.error('Error fetching stock data for report:', error);
    return null;
  }
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

    // Get base URL for internal API calls
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const host = request.headers.get('host') || 'localhost:3000';
    const baseUrl = `${protocol}://${host}`;
    
    console.log(`[Report] Using base URL: ${baseUrl}`);

    // Fetch comprehensive stock data
    console.log(`[Report] Fetching stock data for ${upperSymbol}...`);
    const stockData = await fetchStockData(upperSymbol, baseUrl);
    if (!stockData) {
      console.error(`[Report] Failed to fetch data for ${upperSymbol}`);
      return NextResponse.json(
        { 
          error: `Could not retrieve data for ${upperSymbol}`,
          details: 'The stock symbol may be invalid or data is temporarily unavailable.'
        },
        { status: 404 }
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
