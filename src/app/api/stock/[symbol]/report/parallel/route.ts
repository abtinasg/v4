/**
 * Deepin - Parallel AI Stock Report Generator API
 *
 * POST /api/stock/[symbol]/report/parallel
 *
 * FEATURES:
 * - Splits report generation into 3 parallel chunks (10 pages each)
 * - Processes all chunks simultaneously using Promise.all
 * - Aggregates results with final AI pass
 * - Target: <60 seconds for 30-page reports
 * - Includes retry logic and error handling
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
import { getFMPRawData } from '@/lib/data/fmp-adapter';
import { getCached, setCached } from '@/lib/cache/report-cache';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 180;

// Configuration
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;
const OPENROUTER_TIMEOUT_MS = 45000; // 45 seconds per chunk (parallel)
const AGGREGATION_TIMEOUT_MS = 30000; // 30 seconds for aggregation

// Types
interface StockReportRequest {
  audienceType?: 'pro' | 'retail';
}

interface StockData {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  currentPrice: number;
  marketCap: number;
  metrics: any;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate report section chunk prompts
 * Divides the report into 3 parallel sections
 */
function generateChunkPrompts(stockData: StockData, audienceType: 'pro' | 'retail'): string[] {
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

  const stockInfo = `${stockData.symbol} - ${stockData.companyName}
Sector: ${stockData.sector} | Industry: ${stockData.industry}
Current Price: $${stockData.currentPrice}

${keyMetricsSummary}`;

  if (audienceType === 'retail') {
    // Retail investor prompts (simplified, 3-4 pages per chunk)
    return [
      // Chunk 1: Business Overview & Profitability
      `You are a friendly financial educator. Write sections 1-3 of a beginner-friendly stock analysis report (TARGET: 1,000-1,200 words).

${stockInfo}

Write these sections with 3-4 detailed paragraphs each:

## 📊 Quick Overview
- What does this company do in simple terms?
- How big is the company? (explain market cap)
- What industry and why does it matter?

## 🏢 Understanding the Business
- What products/services does the company sell?
- Who are their customers?
- How does the company make money?
- What makes it different from competitors?

## 💰 Is the Company Profitable?
- Gross margin of ${((stockData.metrics.grossMargin || 0) * 100).toFixed(1)}%: explain in simple terms
- Operating margin of ${((stockData.metrics.operatingMargin || 0) * 100).toFixed(1)}%: what this means
- Net profit margin of ${((stockData.metrics.profitMargin || 0) * 100).toFixed(1)}%: bottom line explanation
- ROE of ${((stockData.metrics.returnOnEquity || 0) * 100).toFixed(1)}%: explain for shareholders
- Is profitability improving or declining?

**CRITICAL:** Write in simple, friendly language. Use analogies. Explain every technical term. Complete all 3 sections fully.`,

      // Chunk 2: Valuation & Financial Health
      `You are a friendly financial educator. Write sections 4-6 of a beginner-friendly stock analysis report (TARGET: 1,000-1,200 words).

${stockInfo}

Write these sections with 3-4 detailed paragraphs each:

## 📈 Is the Company Growing?
- Are sales going up or down? By how much?
- Are profits increasing?
- What's driving the growth (or decline)?
- Is this growth sustainable?

## 💵 Is the Stock Price Reasonable?
- P/E ratio of ${stockData.metrics.pe || 'N/A'}: explain what this means
- Explain what a high vs low P/E means
- Compare to buying a house or business
- Other valuation metrics if available
- Help readers understand what they're paying for

## 💪 Financial Health Check
- Current ratio of ${(stockData.metrics.currentRatio || 0).toFixed(2)}: explain liquidity
- Debt-to-equity of ${(stockData.metrics.debtToEquity || 0).toFixed(2)}x: explain debt levels
- Does the company have enough cash?
- Can it pay its bills?

**CRITICAL:** Write in simple, friendly language. Use analogies. Complete all 3 sections fully.`,

      // Chunk 3: Risks & Conclusion
      `You are a friendly financial educator. Write sections 7-8 of a beginner-friendly stock analysis report (TARGET: 800-1,000 words).

${stockInfo}

Write these sections with 3-4 detailed paragraphs each:

## ⚠️ What Could Go Wrong?
- What are the main business risks?
- What could hurt the company's profits?
- Industry-wide challenges?
- External factors that could affect the stock?
- Be honest but balanced

## 📝 Putting It All Together
- Recap the key strengths
- Recap the main concerns
- What makes this company interesting?
- What questions should investors think about?
- Reminder to do own research

End with: _"This guide is for educational purposes only. It is not financial advice. Every investor should do their own research and consider consulting a financial advisor before making investment decisions."_

**CRITICAL:** Write in simple, friendly language. Complete both sections fully.`,
    ];
  } else {
    // Pro investor prompts (CFA-level, ~10 pages per chunk)
    return [
      // Chunk 1: Overview, Business, Macro, Quality
      `You are an expert CFA Charterholder writing sections 0-3 of an institutional equity research report (TARGET: 1,500-2,000 words).

${stockInfo}

Write these sections with 3-4 detailed paragraphs each:

## 0. Executive Summary
- Data coverage and limitations
- Business quality snapshot with key metrics
- Growth trajectory and balance sheet overview
- Valuation stance (expensive/fair/cheap)
- Risk tone and central investment question
- Classification (quality compounder, cyclical value, etc.)

## 1. Company Overview & Business Model
- Complete business description
- Revenue drivers and money-making mechanism
- Business segments and contributions
- Geographic exposure
- Cyclicality and economic sensitivity
- Customer types, end-markets, competitive positioning

## 2. Macroeconomic & Industry Context
- Current macro backdrop affecting this company
- Interest rate, growth, inflation impact
- Industry structure and competitive dynamics
- Moat potential and barriers to entry
- 5-year sector outlook

## 3. Quality, Profitability & Efficiency Analysis
- Gross margin: ${((stockData.metrics.grossMargin || 0) * 100).toFixed(1)}% analysis
- Operating margin: ${((stockData.metrics.operatingMargin || 0) * 100).toFixed(1)}% analysis
- Net margin: ${((stockData.metrics.profitMargin || 0) * 100).toFixed(1)}% analysis
- ROE: ${((stockData.metrics.returnOnEquity || 0) * 100).toFixed(1)}% deep-dive
- ROA: ${((stockData.metrics.returnOnAssets || 0) * 100).toFixed(1)}% analysis
- DuPont decomposition
- Earnings quality

**CRITICAL:** Write in professional, analytical tone. Use complete paragraphs with specific metrics. Complete all 4 sections fully.`,

      // Chunk 2: Growth, Balance Sheet, Cash Flow, Valuation
      `You are an expert CFA Charterholder writing sections 4-7 of an institutional equity research report (TARGET: 1,500-2,000 words).

${stockInfo}

Write these sections with 3-4 detailed paragraphs each:

## 4. Growth Profile
- Revenue growth trajectory and sustainability
- Earnings and EPS growth analysis
- Free cash flow growth trends
- Organic vs inorganic growth
- Capital requirements for future growth

## 5. Balance Sheet, Leverage & Liquidity
- Debt-to-Equity: ${(stockData.metrics.debtToEquity || 0).toFixed(2)}x analysis
- Current ratio: ${(stockData.metrics.currentRatio || 0).toFixed(2)} analysis
- Quick ratio: ${(stockData.metrics.quickRatio || 0).toFixed(2)} analysis
- Interest coverage and debt service
- Working capital efficiency
- Financial flexibility

## 6. Cash Flows & Capital Allocation
- Operating CF: $${((stockData.metrics.operatingCashflow || 0) / 1e9).toFixed(2)}B analysis
- Free CF: $${((stockData.metrics.freeCashflow || 0) / 1e9).toFixed(2)}B analysis
- Cash conversion efficiency
- Capital allocation priorities
- Shareholder return policy

## 7. Valuation Analysis
- P/E: ${stockData.metrics.pe || 'N/A'} analysis and context
- Price-to-Book assessment
- EV/EBITDA analysis
- Free cash flow yield
- Historical valuation context
- Relative valuation

**CRITICAL:** Write in professional, analytical tone. Cite specific metrics. Complete all 4 sections fully.`,

      // Chunk 3: Risk, Accounting, Investment Synthesis
      `You are an expert CFA Charterholder writing sections 8-10 of an institutional equity research report (TARGET: 1,200-1,500 words).

${stockInfo}

Write these sections with 3-4 detailed paragraphs each:

## 8. Risk Assessment & Portfolio Perspective
- Beta and market risk exposure
- Volatility characteristics
- Fundamental business risks
- Financial risks (leverage, liquidity)
- Sector and macro risks
- Portfolio fit considerations
- Position sizing perspective

## 9. Accounting Quality & Sector KPIs
- Revenue recognition policies
- Effective tax rate analysis
- Depreciation and amortization policies
- Sector-specific KPIs
- Accounting red flags or concerns
- Financial statement quality

## 10. Investment Synthesis
- Key strengths with specific metrics
- Key weaknesses with specific metrics
- Bull case with supporting data
- Bear case with supporting data
- Core investment debate
- Information gaps
- Portfolio treatment perspective

End with: _"This analysis is based solely on data provided by Deepin and is for educational purposes only. It does not constitute investment advice. Past performance does not guarantee future results."_

**CRITICAL:** Write in professional, analytical tone. Complete all 3 sections fully with comprehensive analysis.`,
    ];
  }
}

/**
 * Generate aggregation prompt to combine chunks
 */
function generateAggregationPrompt(
  stockData: StockData,
  chunks: string[],
  audienceType: 'pro' | 'retail'
): string {
  const reportType = audienceType === 'retail' ? 'Beginner-Friendly Stock Analysis' : 'Institutional Equity Research Report';
  
  return `You are an expert editor combining sections of a ${reportType} into a final cohesive document.

STOCK: ${stockData.symbol} - ${stockData.companyName}
REPORT TYPE: ${reportType}

You have received 3 separately-generated sections:

═══════════════════════════════════════════════════════════════
SECTION 1:
═══════════════════════════════════════════════════════════════
${chunks[0]}

═══════════════════════════════════════════════════════════════
SECTION 2:
═══════════════════════════════════════════════════════════════
${chunks[1]}

═══════════════════════════════════════════════════════════════
SECTION 3:
═══════════════════════════════════════════════════════════════
${chunks[2]}

═══════════════════════════════════════════════════════════════
YOUR TASK:
═══════════════════════════════════════════════════════════════

Combine these 3 sections into ONE cohesive, well-formatted report with:

1. **Add a proper report title at the top:**
   # ${stockData.symbol} ${reportType.toUpperCase()}
   **${stockData.companyName}** | ${stockData.sector} | ${new Date().toISOString().split('T')[0]}

2. **Keep all sections in order** - do NOT reorder, remove, or add sections

3. **Smooth transitions** - add brief transitional sentences between major sections if needed

4. **Consistent formatting** - ensure headers, paragraphs, and spacing are uniform

5. **Remove any redundancy** - if sections repeat information, keep the most detailed version

6. **Ensure flow** - the report should read as one cohesive document, not 3 separate pieces

7. **Maintain all technical content** - do NOT remove analysis, metrics, or insights

8. **Fix any formatting issues** - ensure proper markdown formatting

OUTPUT THE COMPLETE, COMBINED REPORT NOW:`;
}

/**
 * Call OpenRouter API with retry logic
 */
async function callOpenRouterWithRetry(
  prompt: string,
  timeoutMs: number,
  label: string,
  attempt: number = 1
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    console.log(`[ParallelReport] ${label} - attempt ${attempt}/${MAX_RETRIES + 1}`);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://deepterm.com',
        'X-Title': 'Deepin - Parallel Stock Analysis',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4.5',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 8000, // Smaller chunks = fewer tokens needed per call
        temperature: 0.1,
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
    console.log(`[ParallelReport] ${label} - success (${content.length} chars)`);
    return content;

  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`[ParallelReport] ${label} - attempt ${attempt} failed:`, error);

    // Retry logic
    if (attempt <= MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * attempt;
      console.log(`[ParallelReport] ${label} - retrying after ${delay}ms...`);
      await sleep(delay);
      return callOpenRouterWithRetry(prompt, timeoutMs, label, attempt + 1);
    }

    throw error;
  }
}

/**
 * POST handler - Generate stock report in parallel
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  const startTime = Date.now();

  try {
    // === Authentication & Credits ===
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
          message: 'You do not have enough credits for this action.',
          details: {
            currentBalance: creditCheck.currentBalance,
            requiredCredits: creditCheck.requiredCredits,
          },
        },
        { status: 402 }
      );
    }

    // === Get Parameters ===
    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();
    
    console.log(`[ParallelReport] Starting parallel generation for ${upperSymbol}`);

    // Check for OpenRouter API key
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('[ParallelReport] OpenRouter API key not configured');
      return NextResponse.json(
        { 
          error: 'AI service not configured',
          details: 'Contact administrator to set up OpenRouter API access.'
        },
        { status: 500 }
      );
    }

    // Get request body
    const body: StockReportRequest = await request.json().catch(() => ({}));
    const audienceType = body.audienceType || 'pro';
    console.log(`[ParallelReport] Audience type: ${audienceType}`);

    // === Fetch Stock Data (with caching) ===
    console.log(`[ParallelReport] Fetching stock data for ${upperSymbol}...`);
    const dataStartTime = Date.now();
    
    let stockData: StockData;
    const cacheKey = `fmp-data:${upperSymbol}`;
    
    // Try to get from cache first
    const cachedData = getCached<StockData>(cacheKey);
    if (cachedData) {
      stockData = cachedData;
      console.log(`[ParallelReport] Using cached data for ${upperSymbol}`);
    } else {
      // Fetch fresh data
      try {
        const fmpRawData = await getFMPRawData(upperSymbol);
        
        if (!fmpRawData.profile && !fmpRawData.quote) {
          throw new Error('No data returned from FMP');
        }
        
        const dataFetchTime = Date.now() - dataStartTime;
        console.log(`[ParallelReport] Data fetched in ${dataFetchTime}ms`);
        
        const { profile, quote, keyMetrics, ratios, cashFlows } = fmpRawData;
        
        // Validate data structure and provide specific error messages
        if (!keyMetrics || !Array.isArray(keyMetrics)) {
          console.warn(`[ParallelReport] Missing or invalid keyMetrics for ${upperSymbol}`);
        }
        if (!ratios || !Array.isArray(ratios)) {
          console.warn(`[ParallelReport] Missing or invalid ratios for ${upperSymbol}`);
        }
        if (!cashFlows || !Array.isArray(cashFlows)) {
          console.warn(`[ParallelReport] Missing or invalid cashFlows for ${upperSymbol}`);
        }
        
        const latestMetrics = keyMetrics?.[0] || null;
        const latestRatios = ratios?.[0] || null;
        const latestCashFlow = cashFlows?.[0] || null;
        
        stockData = {
          symbol: upperSymbol,
          companyName: profile?.companyName || quote?.name || upperSymbol,
          sector: profile?.sector || 'N/A',
          industry: profile?.industry || 'N/A',
          currentPrice: quote?.price || 0,
          marketCap: quote?.marketCap || profile?.marketCap || 0,
          metrics: {
            pe: quote?.pe || latestRatios?.priceToEarningsRatio || null,
            grossMargin: latestRatios?.grossProfitMargin || null,
            operatingMargin: latestRatios?.operatingProfitMargin || null,
            profitMargin: latestRatios?.netProfitMargin || null,
            returnOnEquity: latestMetrics?.returnOnEquity || null,
            returnOnAssets: latestMetrics?.returnOnAssets || null,
            currentRatio: latestMetrics?.currentRatio || latestRatios?.currentRatio || null,
            quickRatio: latestRatios?.quickRatio || null,
            debtToEquity: latestRatios?.debtToEquityRatio || null,
            freeCashflow: latestCashFlow?.freeCashFlow || null,
            operatingCashflow: latestCashFlow?.operatingCashFlow || null,
            revenueGrowth: null,
            earningsGrowth: null,
          },
        };
        
        // Cache the data for 5 minutes
        setCached(cacheKey, stockData);
      } catch (error) {
        console.error(`[ParallelReport] Failed to fetch data for ${upperSymbol}:`, error);
        return NextResponse.json(
          { 
            error: `Could not retrieve market data for ${upperSymbol}`,
            details: 'Market data API may be temporarily unavailable.'
          },
          { status: 503 }
        );
      }
    }
    
    console.log(`[ParallelReport] Stock data prepared successfully`);

    // === Generate Report Chunks in Parallel ===
    console.log(`[ParallelReport] Generating 3 report chunks in parallel...`);
    const chunkStartTime = Date.now();
    
    const chunkPrompts = generateChunkPrompts(stockData, audienceType);
    
    // Process all chunks in parallel
    const chunkPromises = chunkPrompts.map((prompt, index) =>
      callOpenRouterWithRetry(
        prompt,
        OPENROUTER_TIMEOUT_MS,
        `Chunk ${index + 1}/3`
      )
    );
    
    let chunks: string[];
    try {
      chunks = await Promise.all(chunkPromises);
      const chunkTime = Date.now() - chunkStartTime;
      console.log(`[ParallelReport] All chunks generated in ${chunkTime}ms`);
    } catch (error) {
      console.error(`[ParallelReport] Failed to generate chunks:`, error);
      return NextResponse.json(
        { 
          error: 'Failed to generate report chunks',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // === Aggregate Chunks ===
    console.log(`[ParallelReport] Aggregating chunks...`);
    const aggStartTime = Date.now();
    
    let finalReport: string;
    try {
      const aggregationPrompt = generateAggregationPrompt(stockData, chunks, audienceType);
      finalReport = await callOpenRouterWithRetry(
        aggregationPrompt,
        AGGREGATION_TIMEOUT_MS,
        'Aggregation'
      );
      const aggTime = Date.now() - aggStartTime;
      console.log(`[ParallelReport] Aggregation completed in ${aggTime}ms`);
    } catch (error) {
      console.error(`[ParallelReport] Failed to aggregate chunks:`, error);
      // Fallback: concatenate chunks directly
      console.log(`[ParallelReport] Using fallback concatenation`);
      finalReport = `# ${stockData.symbol} EQUITY RESEARCH REPORT
**${stockData.companyName}** | ${stockData.sector} | ${new Date().toISOString().split('T')[0]}

${chunks.join('\n\n')}`;
    }

    const totalTime = Date.now() - startTime;
    console.log(`[ParallelReport] Report generated successfully in ${totalTime}ms (${(totalTime / 1000).toFixed(1)}s)`);

    // === Deduct Credits ===
    await deductCredits(user.id, 'ai_analysis', {
      symbol: upperSymbol,
      endpoint: '/api/stock/[symbol]/report/parallel',
    });

    // === Return Response ===
    return NextResponse.json({
      success: true,
      symbol: upperSymbol,
      companyName: stockData.companyName,
      generatedAt: new Date().toISOString(),
      report: finalReport,
      metadata: {
        reportType: 'full',
        audienceType,
        processingTime: totalTime,
        parallelProcessing: true,
        chunks: chunks.length,
        includeCharts: true,
      },
    });

  } catch (error) {
    console.error('[ParallelReport] Error generating report:', error);
    
    if (error instanceof Error) {
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
        details: 'An unexpected error occurred'
      },
      { status: 500 }
    );
  }
}
