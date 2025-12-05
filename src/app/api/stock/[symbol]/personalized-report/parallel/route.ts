/**
 * Deepin - Parallel Personalized Stock Report Generator API
 *
 * POST /api/stock/[symbol]/personalized-report/parallel
 *
 * FEATURES:
 * - Splits personalized report generation into 3 parallel chunks
 * - Processes all chunks simultaneously using Promise.all
 * - Aggregates results with final AI pass
 * - Target: <60 seconds for comprehensive reports
 * - Includes retry logic and error handling
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userQueries, detailedRiskAssessmentQueries } from '@/lib/db/queries';
import {
  checkCredits,
  deductCredits,
  checkAndResetMonthlyCredits,
} from '@/lib/credits';
import { getCategoryDisplayInfo, type RiskProfileResult } from '@/lib/risk-assessment';
import { getFMPRawData } from '@/lib/data/fmp-adapter';
import { getCached, setCached } from '@/lib/cache/report-cache';

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 180;

interface PersonalizedReportRequest {
  companyName?: string;
}

interface RouteContext {
  params: Promise<{
    symbol: string;
  }>;
}

// Configuration
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1000; // Reduced from 2000ms to 1000ms for faster retries
const OPENROUTER_TIMEOUT_MS = 35000; // Reduced from 45s to 35s per chunk (parallel)
const AGGREGATION_TIMEOUT_MS = 20000; // Reduced from 30s to 20s for aggregation

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Generate personalized report chunk prompts
 */
function generatePersonalizedChunkPrompts(
  symbol: string,
  companyName: string,
  metricsData: any,
  riskProfile: RiskProfileResult
): string[] {
  const categoryInfo = getCategoryDisplayInfo(riskProfile.category);
  const allocation = riskProfile.assetAllocation;

  const stockInfo = `
STOCK: ${symbol} - ${companyName}
Sector: ${metricsData.sector} | Industry: ${metricsData.industry}
Price: $${metricsData.price?.toFixed(2) || 'N/A'}
Market Cap: $${metricsData.marketCap ? (metricsData.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}

KEY METRICS:
• P/E: ${metricsData.pe?.toFixed(2) || 'N/A'}
• Beta: ${metricsData.beta?.toFixed(2) || 'N/A'}
• Debt/Equity: ${metricsData.debtToEquity?.toFixed(2) || 'N/A'}
• ROE: ${metricsData.roe ? (metricsData.roe * 100).toFixed(1) + '%' : 'N/A'}
• Gross Margin: ${metricsData.grossMargin ? (metricsData.grossMargin * 100).toFixed(1) + '%' : 'N/A'}
• Current Ratio: ${metricsData.currentRatio?.toFixed(2) || 'N/A'}
`;

  const riskInfo = `
INVESTOR PROFILE:
• Risk Category: ${categoryInfo.label}
• Risk Score: ${riskProfile.finalScore.toFixed(2)}/5.00
• Recommended Allocation: ${allocation.stocks}% stocks, ${allocation.bonds}% bonds
• Risk Capacity: ${riskProfile.capacityScore.normalizedScore.toFixed(2)}/5.00
• Risk Willingness: ${riskProfile.willingnessScore.normalizedScore.toFixed(2)}/5.00
• Behavioral Bias Control: ${riskProfile.biasScore.normalizedScore.toFixed(2)}/5.00
`;

  return [
    // Chunk 1: Profile, Business, Macro, Match
    `You are a CFA Charterholder and Behavioral Finance Specialist. Write sections 1-4 of a personalized investment analysis (TARGET: 1,500-1,800 words).

${stockInfo}
${riskInfo}

Write these sections with 3-5 detailed paragraphs each:

## 1. 📋 INVESTOR PROFILE SUMMARY
- Deep dive into ${categoryInfo.label} classification
- Interpret ${riskProfile.finalScore.toFixed(2)}/5.00 risk score
- Analyze component scores interaction
- Psychological profile based on behavioral biases
- Investment approach implications
- ${allocation.stocks}/${allocation.bonds} allocation meaning

## 2. 🏰 BUSINESS OVERVIEW & COMPETITIVE MOAT
- ${companyName}'s business model
- Revenue generation and value creation
- Competitive moat analysis
- Porter's Five Forces
- Complete SWOT Analysis
- Competitive positioning in ${metricsData.sector}

## 3. 🌍 MACROECONOMIC BACKDROP
- Current macro environment impact
- Interest rate, inflation, growth considerations
- Sector-specific tailwinds/headwinds
- 5-year ${metricsData.sector} outlook
- Alignment with investor profile

## 4. 🎯 STOCK-PROFILE MATCH ANALYSIS
- **MATCH SCORE: X/10** (justify with reasoning)
- Alignment with ${categoryInfo.label} profile
- Beta ${metricsData.beta?.toFixed(2) || 'N/A'} vs willingness ${riskProfile.willingnessScore.normalizedScore.toFixed(2)}
- Time horizon compatibility
- Income needs vs dividend yield
- Compatibility with ${allocation.stocks}% equity target
- Psychological comfort assessment

**CRITICAL:** Write personalized analysis specific to this investor. Complete all 4 sections.`,

    // Chunk 2: Risk, Portfolio, Investment Considerations
    `You are a CFA Charterholder and Behavioral Finance Specialist. Write sections 5-7 of a personalized investment analysis (TARGET: 1,500-1,800 words).

${stockInfo}
${riskInfo}

Write these sections with 4-6 detailed paragraphs each:

## 5. ⚠️ RISK ANALYSIS TAILORED TO THIS INVESTOR
- Specific risks for ${categoryInfo.label} investor
- Business/operational risks for this profile
- Financial risks: D/E ${metricsData.debtToEquity?.toFixed(2) || 'N/A'} analysis
- Market/volatility risks: Beta implications
- Behavioral bias warnings:
  * Overconfidence risks
  * Loss aversion traps
  * Herding behavior
  * Disposition effect
- **Scenario Analysis:**
  * 🐂 Bull Case: % returns, timeline
  * 📊 Base Case: % returns, timeline
  * 🐻 Bear Case: % loss, triggers
- Downside protection strategies

## 6. 📊 PORTFOLIO INTEGRATION
- **Recommended position sizing:** Max % of equity portfolio
- Justification based on risk and volatility
- Diversification strategy
- Correlation with typical ${categoryInfo.label} portfolios
- Sector concentration limits
- **Rebalancing rules:**
  * When to trim (% gain or weight)
  * When to add (% decline)
  * Review frequency
- Fit within ${allocation.stocks}%/${allocation.bonds}% framework

## 7. ✅ HYPOTHETICAL INVESTMENT CONSIDERATIONS
- DCA vs Lump Sum for willingness ${riskProfile.willingnessScore.normalizedScore.toFixed(2)}
- Risk management rules (stop-loss strategy)
- Valuation context: P/E ${metricsData.pe?.toFixed(2) || 'N/A'}
- Entry point assessment
- Tax considerations
- Time horizon: 1-year, 5-year, or 10+ year hold?

**CRITICAL:** Focus on personalization for this specific investor profile. Complete all 3 sections.`,

    // Chunk 3: Key Metrics, Suitability Verdict
    `You are a CFA Charterholder and Behavioral Finance Specialist. Write sections 8-9 of a personalized investment analysis (TARGET: 1,200-1,500 words).

${stockInfo}
${riskInfo}

Write these sections with 4-6 detailed paragraphs each:

## 8. 📈 KEY METRICS THAT MATTER FOR THIS INVESTOR
Choose 5-7 most relevant metrics for ${categoryInfo.label} investor. For each:
- State current value
- Explain meaning in simple terms
- Explain why it matters for THIS investor's profile
- Compare to industry benchmarks
- Flag red or green

Example metrics:
- Profitability (margins, ROE: ${metricsData.roe ? (metricsData.roe * 100).toFixed(1) + '%' : 'N/A'})
- Growth metrics (if growth investor)
- Value metrics (if value investor)
- Safety metrics (current ratio: ${metricsData.currentRatio?.toFixed(2) || 'N/A'})
- Quality metrics
- Return metrics

For each: "Why should a ${categoryInfo.label} investor care?"

## 9. 💡 SUITABILITY VERDICT & EXECUTIVE SUMMARY
**Final Suitability Rating: [HIGH / MEDIUM / LOW / NOT SUITABLE]**

- Clear suitability statement with detailed justification
- Comprehensive executive summary (tie all previous sections)
- Key takeaways for this investor
- What makes this fit (or not) for profile
- Risk-adjusted expected outcome
- **Action framework:**
  * If suitable: How to approach
  * If not suitable: Why to avoid
- Final behavioral considerations
- Risk profile alignment reminder

End with: _"This personalized analysis is for educational purposes only and does not constitute investment advice. All investors should conduct their own research and consult with a qualified financial advisor before making investment decisions. Past performance does not guarantee future results."_

**CRITICAL:** Provide clear, actionable verdict. Complete both sections fully.`,
  ];
}

/**
 * Generate aggregation prompt for personalized report
 */
function generatePersonalizedAggregationPrompt(
  symbol: string,
  companyName: string,
  chunks: string[],
  categoryLabel: string
): string {
  return `Combine these 3 personalized analysis sections for ${symbol} - ${companyName} (${categoryLabel} Investor).

REQUIREMENTS:
- Add title: # ${symbol} PERSONALIZED INVESTMENT ANALYSIS
  **${companyName}** | Tailored for ${categoryLabel} Investor | ${new Date().toISOString().split('T')[0]}
- Keep all sections 1-9 in order, maintain all personalized content
- Fix formatting, ensure smooth flow and transitions
- Remove redundancy while keeping detailed analysis
- Output complete report immediately

SECTION 1:
${chunks[0]}

SECTION 2:
${chunks[1]}

SECTION 3:
${chunks[2]}

OUTPUT COMPLETE COMBINED REPORT:`;
}

/**
 * Call OpenRouter API with retry logic
 */
async function callOpenRouterWithRetry(
  prompt: string,
  timeoutMs: number,
  label: string,
  attempt: number = 1,
  maxTokens: number = 8000
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  const callStartTime = Date.now();

  try {
    console.log(`[ParallelPersonalized] ${label} - attempt ${attempt}/${MAX_RETRIES + 1} (timeout: ${timeoutMs}ms)`);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://deepterm.co',
        'X-Title': 'Deepin - Parallel Personalized Report',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4.5',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature: 0.1,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenRouter API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error('No content in API response');
    }

    const callDuration = Date.now() - callStartTime;
    console.log(`[ParallelPersonalized] ${label} - success (${content.length} chars, ${callDuration}ms)`);
    return content;

  } catch (error) {
    clearTimeout(timeoutId);
    const callDuration = Date.now() - callStartTime;
    const isTimeout = error instanceof Error && error.name === 'AbortError';
    console.error(`[ParallelPersonalized] ${label} - attempt ${attempt} failed after ${callDuration}ms (timeout: ${isTimeout}):`, error);

    if (attempt <= MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * attempt;
      console.log(`[ParallelPersonalized] ${label} - retrying after ${delay}ms...`);
      await sleep(delay);
      return callOpenRouterWithRetry(prompt, timeoutMs, label, attempt + 1, maxTokens);
    }

    // Add more context to the error
    if (isTimeout) {
      throw new Error(`${label} timed out after ${timeoutMs}ms across ${MAX_RETRIES + 1} attempts`);
    }
    throw error;
  }
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  const startTime = Date.now();

  try {
    // Auth check
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get symbol
    const { symbol } = await context.params;
    const upperSymbol = symbol.toUpperCase();

    // Parse request body
    const body: PersonalizedReportRequest = await request.json().catch(() => ({}));
    const companyName = body.companyName || upperSymbol;

    // Get user
    const user = await userQueries.getByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get risk assessment
    const assessment = await detailedRiskAssessmentQueries.getByUserId(user.id);
    if (!assessment) {
      return NextResponse.json(
        { error: 'Risk assessment not found. Please complete the risk assessment first.' },
        { status: 400 }
      );
    }

    // Build risk profile
    const riskProfile: RiskProfileResult = {
      capacityScore: {
        rawScore: 0,
        weightedScore: 0,
        normalizedScore: parseFloat(assessment.capacityScore),
        interpretation: 'moderate_to_good',
      },
      willingnessScore: {
        rawScore: 0,
        normalizedScore: parseFloat(assessment.willingnessScore),
        interpretation: 'moderate_to_high',
      },
      biasScore: {
        rawScore: 0,
        normalizedScore: parseFloat(assessment.biasScore),
        interpretation: 'moderate',
        biasDetails: assessment.fullResult?.biasScore?.biasDetails || {
          overconfidence: 3,
          lossAversion: 3,
          herding: 3,
          dispositionEffect: 3,
          hindsightBias: 3,
        },
      },
      finalScore: parseFloat(assessment.finalScore),
      category: assessment.category,
      characteristics: assessment.fullResult?.characteristics || [],
      recommendedProducts: assessment.fullResult?.recommendedProducts || [],
      assetAllocation: assessment.fullResult?.assetAllocation || {
        stocks: 50,
        bonds: 50,
      },
      answers: assessment.answers,
      completedAt: assessment.createdAt.toISOString(),
      version: '2.0',
    };

    const categoryInfo = getCategoryDisplayInfo(riskProfile.category);

    // Check credits
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

    // Fetch stock data (with caching)
    console.log(`[ParallelPersonalized] Fetching data for ${upperSymbol}...`);
    let metricsData;
    const cacheKey = `fmp-metrics:${upperSymbol}`;
    
    // Try cache first
    const cachedMetrics = getCached<any>(cacheKey);
    if (cachedMetrics) {
      metricsData = cachedMetrics;
      console.log(`[ParallelPersonalized] Using cached data for ${upperSymbol}`);
    } else {
      // Fetch fresh data
      try {
        const fmpData = await getFMPRawData(upperSymbol);

        if (!fmpData.profile && !fmpData.quote) {
          throw new Error('No data returned from FMP');
        }

        metricsData = {
          symbol: upperSymbol,
          companyName: fmpData.profile?.companyName || companyName,
          sector: fmpData.profile?.sector || 'N/A',
          industry: fmpData.profile?.industry || 'N/A',
          price: fmpData.quote?.price || 0,
          marketCap: fmpData.quote?.marketCap || 0,
          pe: fmpData.quote?.pe || fmpData.ratios?.[0]?.priceToEarningsRatio || null,
          pb: fmpData.ratios?.[0]?.priceToBookRatio || null,
          dividendYield: fmpData.ratios?.[0]?.dividendYield || 0,
          beta: fmpData.profile?.beta || null,
          grossMargin: fmpData.ratios?.[0]?.grossProfitMargin || null,
          operatingMargin: fmpData.ratios?.[0]?.operatingProfitMargin || null,
          netMargin: fmpData.ratios?.[0]?.netProfitMargin || null,
          roe: fmpData.keyMetrics?.[0]?.returnOnEquity || null,
          roa: fmpData.keyMetrics?.[0]?.returnOnAssets || null,
          debtToEquity: fmpData.ratios?.[0]?.debtToEquityRatio || null,
          currentRatio: fmpData.ratios?.[0]?.currentRatio || null,
        };

        // Cache for 5 minutes
        setCached(cacheKey, metricsData);
        console.log(`[ParallelPersonalized] Data fetched and cached successfully`);
      } catch (error) {
        console.error(`[ParallelPersonalized] Failed to fetch data:`, error);
        return NextResponse.json(
          { error: 'Failed to fetch stock data' },
          { status: 500 }
        );
      }
    }

    // Generate chunks in parallel
    console.log(`[ParallelPersonalized] Generating 3 chunks in parallel...`);
    const chunkStartTime = Date.now();

    const chunkPrompts = generatePersonalizedChunkPrompts(
      upperSymbol,
      metricsData.companyName,
      metricsData,
      riskProfile
    );

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
      console.log(`[ParallelPersonalized] All chunks generated in ${chunkTime}ms`);
    } catch (error) {
      console.error(`[ParallelPersonalized] Failed to generate chunks:`, error);
      return NextResponse.json(
        { error: 'Failed to generate report chunks' },
        { status: 500 }
      );
    }

    // Aggregate chunks
    console.log(`[ParallelPersonalized] Aggregating chunks...`);
    const aggStartTime = Date.now();

    let finalReport: string;
    try {
      const aggregationPrompt = generatePersonalizedAggregationPrompt(
        upperSymbol,
        metricsData.companyName,
        chunks,
        categoryInfo.label
      );
      finalReport = await callOpenRouterWithRetry(
        aggregationPrompt,
        AGGREGATION_TIMEOUT_MS,
        'Aggregation',
        1,
        12000 // Higher token limit for aggregation to accommodate combined content
      );
      const aggTime = Date.now() - aggStartTime;
      console.log(`[ParallelPersonalized] Aggregation completed in ${aggTime}ms`);
    } catch (error) {
      console.error(`[ParallelPersonalized] Aggregation failed, using fallback:`, error);
      finalReport = `# ${upperSymbol} PERSONALIZED INVESTMENT ANALYSIS
**${metricsData.companyName}** | Tailored for ${categoryInfo.label} Investor | ${new Date().toISOString().split('T')[0]}

${chunks.join('\n\n')}`;
    }

    const totalTime = Date.now() - startTime;
    console.log(`[ParallelPersonalized] Report generated in ${totalTime}ms (${(totalTime / 1000).toFixed(1)}s)`);

    // Deduct credits
    await deductCredits(
      user.id,
      'ai_analysis',
      { symbol: upperSymbol, endpoint: '/api/stock/[symbol]/personalized-report/parallel' }
    );

    return NextResponse.json({
      success: true,
      symbol: upperSymbol,
      companyName: metricsData.companyName,
      generatedAt: new Date().toISOString(),
      report: finalReport,
      riskProfile,
      metadata: {
        reportType: 'personalized',
        processingTime: totalTime,
        parallelProcessing: true,
        chunks: chunks.length,
        modelUsed: 'anthropic/claude-sonnet-4.5',
        version: '2.0-parallel',
      },
    });

  } catch (error) {
    console.error('[ParallelPersonalized] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
