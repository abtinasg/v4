/**
 * Deepin - Personalized Stock Report Generator API (REBUILT)
 *
 * POST /api/stock/[symbol]/personalized-report
 *
 * Generates personalized investment reports based on user's risk profile
 *
 * IMPROVEMENTS:
 * - Single API call (no more fragile two-part generation)
 * - Increased token limit: 40,000 (was 16,384)
 * - Latest model: claude-sonnet-4.5 (was claude-3.5-sonnet)
 * - Explicit 15+ page requirement
 * - Better error handling with retry logic
 * - Comprehensive prompt with all 9 sections in one go
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

// Force Node.js runtime
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 180; // Increased from 120 to 180 seconds

interface PersonalizedReportRequest {
  companyName?: string;
}

interface RouteContext {
  params: Promise<{
    symbol: string;
  }>;
}

// Credit cost for personalized report
const PERSONALIZED_REPORT_CREDIT_COST = 15;

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

/**
 * Generate comprehensive personalized report prompt (ALL 9 SECTIONS IN ONE)
 */
function generatePersonalizedReportPrompt(
  symbol: string,
  companyName: string,
  metricsData: any,
  riskProfile: RiskProfileResult
): string {
  const categoryInfo = getCategoryDisplayInfo(riskProfile.category);
  const allocation = riskProfile.assetAllocation;

  return `You are an expert CFA Charterholder and Behavioral Finance Specialist generating a COMPREHENSIVE personalized investment analysis.

LENGTH REQUIREMENT:
- Target: 8-10 pages when converted to PDF
- Target: 5,000-7,000 words
- Each section should have good depth with detailed paragraphs
- Focus on quality and personalized insights over length

PURPOSE: Educational analysis matching this specific investor's risk profile. NOT investment advice.

═══════════════════════════════════════════════════════════════
INVESTOR'S COMPLETE RISK PROFILE
═══════════════════════════════════════════════════════════════

**Risk Category:** ${categoryInfo.label}
**Overall Risk Score:** ${riskProfile.finalScore.toFixed(2)} / 5.00

**Component Scores:**
├─ Risk Capacity: ${riskProfile.capacityScore.normalizedScore.toFixed(2)} / 5.00
├─ Risk Willingness: ${riskProfile.willingnessScore.normalizedScore.toFixed(2)} / 5.00
└─ Behavioral Bias Control: ${riskProfile.biasScore.normalizedScore.toFixed(2)} / 5.00

**Recommended Asset Allocation:**
• Stocks: ${allocation.stocks}%
• Bonds: ${allocation.bonds}%
${allocation.alternatives ? `• Alternatives: ${allocation.alternatives}%` : ''}
${allocation.cash ? `• Cash: ${allocation.cash}%` : ''}

**Investor Characteristics:**
${riskProfile.characteristics?.map(c => `• ${c}`).join('\n') || 'Not specified'}

**Behavioral Bias Profile:**
• Primary Interpretation: ${riskProfile.biasScore.interpretation}
${riskProfile.biasScore.biasDetails ? `• Overconfidence Level: ${riskProfile.biasScore.biasDetails.overconfidence}/5
• Loss Aversion: ${riskProfile.biasScore.biasDetails.lossAversion}/5
• Herding Tendency: ${riskProfile.biasScore.biasDetails.herding}/5
• Disposition Effect: ${riskProfile.biasScore.biasDetails.dispositionEffect}/5
• Hindsight Bias: ${riskProfile.biasScore.biasDetails.hindsightBias}/5` : ''}

═══════════════════════════════════════════════════════════════
STOCK FINANCIAL DATA: ${symbol} (${companyName})
═══════════════════════════════════════════════════════════════

**Market Overview:**
• Current Price: $${metricsData.price?.toFixed(2) || 'N/A'}
• Market Capitalization: $${metricsData.marketCap ? (metricsData.marketCap / 1e9).toFixed(2) + 'B' : 'N/A'}
• Sector: ${metricsData.sector || 'N/A'}
• Industry: ${metricsData.industry || 'N/A'}

**Valuation Metrics:**
• P/E Ratio: ${metricsData.pe?.toFixed(2) || 'N/A'}
• P/B Ratio: ${metricsData.pb?.toFixed(2) || 'N/A'}
• Dividend Yield: ${metricsData.dividendYield ? (metricsData.dividendYield * 100).toFixed(2) + '%' : 'N/A'}

**Risk Indicators:**
• Beta: ${metricsData.beta?.toFixed(2) || 'N/A'}
• Debt-to-Equity: ${metricsData.debtToEquity?.toFixed(2) || 'N/A'}

**Profitability:**
• Gross Margin: ${metricsData.grossMargin ? (metricsData.grossMargin * 100).toFixed(1) + '%' : 'N/A'}
• Operating Margin: ${metricsData.operatingMargin ? (metricsData.operatingMargin * 100).toFixed(1) + '%' : 'N/A'}
• Net Margin: ${metricsData.netMargin ? (metricsData.netMargin * 100).toFixed(1) + '%' : 'N/A'}
• ROE: ${metricsData.roe ? (metricsData.roe * 100).toFixed(1) + '%' : 'N/A'}
• ROA: ${metricsData.roa ? (metricsData.roa * 100).toFixed(1) + '%' : 'N/A'}

**Financial Health:**
• Current Ratio: ${metricsData.currentRatio?.toFixed(2) || 'N/A'}

═══════════════════════════════════════════════════════════════
YOUR TASK: WRITE A COMPREHENSIVE 9-SECTION ANALYSIS
═══════════════════════════════════════════════════════════════

Write a detailed analysis covering ALL 9 sections below.
Each section should have clear, well-organized paragraphs.

## 1. 📋 INVESTOR PROFILE SUMMARY

**Write 3-5 detailed paragraphs analyzing:**
- Deep dive into this investor's ${categoryInfo.label} classification
- Detailed interpretation of the ${riskProfile.finalScore.toFixed(2)}/5.00 risk score
- Analysis of the three component scores and how they interact
- Psychological profile based on the behavioral bias scores
- What this profile means for investment approach and decision-making
- How the recommended ${allocation.stocks}/${allocation.bonds} allocation reflects their profile
- Specific investor characteristics and what they imply

## 2. 🏰 BUSINESS OVERVIEW & COMPETITIVE MOAT

**Write 4-6 detailed paragraphs covering:**
- Comprehensive explanation of ${companyName}'s business model
- How the company generates revenue and creates value
- Deep analysis of the competitive moat (brand, scale, network effects, switching costs, etc.)
- Porter's Five Forces analysis for this industry
- Complete SWOT Analysis:
  * Strengths: What gives this company an edge?
  * Weaknesses: Where is it vulnerable?
  * Opportunities: What growth vectors exist?
  * Threats: What external risks loom?
- Competitive positioning within the ${metricsData.sector} sector
- Industry dynamics and this company's relative position

## 3. 🌍 MACROECONOMIC BACKDROP

**Write 3-5 detailed paragraphs discussing:**
- Current macroeconomic environment and how it affects ${companyName}
- Interest rate environment impact on this company's operations and valuation
- Inflation considerations for revenue, costs, and pricing power
- Economic growth/recession implications for this sector
- Currency considerations if company has international exposure
- Sector-specific tailwinds and headwinds
- 5-year outlook for the ${metricsData.sector} sector
- How macro factors align or conflict with this investor's profile

## 4. 🎯 STOCK-PROFILE MATCH ANALYSIS

**Write 4-6 detailed paragraphs with:**
- **MATCH SCORE: X/10** (where X is your reasoned score based on analysis)
- Detailed justification for the match score
- Alignment analysis: How does this stock's characteristics match the ${categoryInfo.label} profile?
- Volatility analysis: Beta of ${metricsData.beta?.toFixed(2) || 'N/A'} vs investor's willingness score of ${riskProfile.willingnessScore.normalizedScore.toFixed(2)}
- Time horizon compatibility (is this suitable for this investor's timeline?)
- Income needs: Dividend yield of ${metricsData.dividendYield ? (metricsData.dividendYield * 100).toFixed(2) + '%' : 'N/A'} vs investor's income requirements
- Compatibility with ${allocation.stocks}% equity allocation target
- Long-term goals alignment
- Psychological comfort: Will this investor sleep well owning this stock?

## 5. ⚠️ RISK ANALYSIS TAILORED TO THIS INVESTOR

**Write 5-7 detailed paragraphs covering:**
- **Specific risks for a ${categoryInfo.label} investor holding this stock**
- Business/operational risks and how they affect someone with this risk profile
- Financial risks: Leverage analysis (D/E: ${metricsData.debtToEquity?.toFixed(2) || 'N/A'})
- Market/volatility risks: Beta implications
- Liquidity considerations
- **Behavioral bias warnings specific to ${riskProfile.biasScore.interpretation}:**
  * How might overconfidence affect decisions with this stock?
  * Loss aversion traps to avoid
  * Herding behavior risks
  * Disposition effect considerations
- **Scenario Analysis with specific % estimates:**
  * 🐂 Bull Case: Best realistic outcome (be specific about % returns, timeline)
  * 📊 Base Case: Most likely outcome (% returns, timeline)
  * 🐻 Bear Case: Downside scenario (% loss, what triggers it)
- Downside protection and risk mitigation specific to this profile

## 6. 📊 PORTFOLIO INTEGRATION

**Write 4-5 detailed paragraphs on:**
- **Recommended position sizing:** Maximum % of equity portfolio
- Justification for position size based on risk score and volatility
- Diversification strategy: What other holdings would complement this?
- Correlation considerations with typical ${categoryInfo.label} portfolios
- Sector concentration limits (already have tech exposure? etc.)
- **Rebalancing rules specific to this investor:**
  * When to trim (at what % gain or portfolio weight?)
  * When to add more (at what % decline?)
  * Frequency of review
- How this fits within the ${allocation.stocks}% stocks / ${allocation.bonds}% bonds framework
- Impact on overall portfolio risk profile

## 7. ✅ HYPOTHETICAL INVESTMENT CONSIDERATIONS

**Write 4-5 detailed paragraphs discussing:**
- **Dollar-Cost Averaging (DCA) vs Lump Sum for this investor:**
  * Which approach fits their risk willingness of ${riskProfile.willingnessScore.normalizedScore.toFixed(2)}?
  * Psychological comfort vs statistical optimality
  * Recommended approach with specific timeline
- **Risk management rules:**
  * Stop-loss strategy (yes/no? at what %?)
  * Trailing stops vs time-based reviews
  * When to cut losses vs when to hold
- **Valuation context:**
  * Historical valuation ranges vs current P/E of ${metricsData.pe?.toFixed(2) || 'N/A'}
  * Is this an attractive entry point?
  * Margin of safety considerations
- **Tax considerations** (tax-loss harvesting, holding period, etc.)
- **Time horizon alignment:** Is this a 1-year, 5-year, or 10+ year hold for this investor?

## 8. 📈 KEY METRICS THAT MATTER FOR THIS INVESTOR

**Write 4-6 detailed paragraphs analyzing 5-7 key metrics:**

Choose the most relevant metrics for this ${categoryInfo.label} investor and explain each in depth:

**For each metric you discuss:**
- State the current value
- Explain what it means in simple terms
- Explain why it matters specifically for THIS investor's profile
- Compare to industry benchmarks if possible
- Flag if it's a red flag or green flag

**Example metrics to consider:**
- Profitability metrics (margins, ROE, ROA)
- Growth metrics (if growth investor)
- Value metrics (if value investor)
- Safety metrics (current ratio, debt coverage if conservative)
- Quality metrics (cash conversion, earnings quality)
- Return metrics (ROIC, ROE)

**For each, answer:** "Why should a ${categoryInfo.label} investor care about this?"

## 9. 💡 SUITABILITY VERDICT & EXECUTIVE SUMMARY

**Write 5-6 detailed paragraphs with:**

**Final Suitability Rating: [HIGH / MEDIUM / LOW / NOT SUITABLE]**

- Clear statement of overall suitability with detailed justification
- Comprehensive executive summary of the entire analysis (tie together all 8 previous sections)
- Key takeaways for this specific investor
- What makes this stock a good fit (or not) for their profile
- Risk-adjusted expected outcome
- **Action framework:**
  * If suitable: How to approach this investment
  * If not suitable: Why to avoid despite any appealing characteristics
- Final thoughts on behavioral considerations
- Reminder about risk profile alignment

═══════════════════════════════════════════════════════════════
CRITICAL FORMATTING & OUTPUT RULES
═══════════════════════════════════════════════════════════════

1. **Output in clean Markdown** with proper section headers
2. **Use emojis** for section headers as shown above (📋 🏰 🌍 🎯 ⚠️ 📊 ✅ 📈 💡)
3. **Each section should be clear and well-organized**
4. **Target: 5,000-7,000 words / 8-10 pages**
5. **Use ONLY the data provided** - no guessing or hallucinating numbers
6. **If data is missing**, state "Data not available" and work with what you have
7. **This is EDUCATIONAL ONLY** - include this disclaimer at the end:

_"This personalized analysis is for educational purposes only and does not constitute investment advice. All investors should conduct their own research and consult with a qualified financial advisor before making investment decisions. Past performance does not guarantee future results."_

═══════════════════════════════════════════════════════════════
⚠️ ABSOLUTELY CRITICAL - READ THIS CAREFULLY:
═══════════════════════════════════════════════════════════════

- **WRITE THE COMPLETE REPORT IN ONE RESPONSE** - ALL 9 SECTIONS
- **DO NOT ASK** if I want you to continue
- **DO NOT WRITE** phrases like "Would you like me to continue?" or "Continued in next sections..."
- **DO NOT PAUSE** or break the report into parts
- **NEVER** say things like "[Note: I can continue...]" or "[Shall I proceed...]"
- If you run out of space, prioritize completing all sections with slightly less detail
- The report MUST be complete and self-contained

═══════════════════════════════════════════════════════════════

**BEGIN YOUR PERSONALIZED ANALYSIS NOW - WRITE ALL 9 SECTIONS COMPLETELY:**`;
}

/**
 * Call OpenRouter API with retry logic and timeout
 */
async function callOpenRouterWithRetry(
  prompt: string,
  symbol: string,
  attempt: number = 1
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OPENROUTER_TIMEOUT_MS);

  try {
    console.log(`[PersonalizedReport] API call attempt ${attempt}/${MAX_RETRIES + 1} for ${symbol}`);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://deepterm.co',
        'X-Title': 'Deepin - Personalized Report',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4.5', // Claude Sonnet 4.5 - highest quality
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 64000, // Maximum token limit - MUST complete entire report
        temperature: 0.1, // Very low for consistent, complete output
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

    console.log(`[PersonalizedReport] Successfully generated report for ${symbol} (${content.length} chars)`);
    return content;

  } catch (error) {
    clearTimeout(timeoutId);
    console.error(`[PersonalizedReport] Attempt ${attempt} failed:`, error);

    // Retry logic
    if (attempt <= MAX_RETRIES) {
      const delay = RETRY_DELAY_MS * attempt; // Exponential backoff
      console.log(`[PersonalizedReport] Retrying after ${delay}ms...`);
      await sleep(delay);
      return callOpenRouterWithRetry(prompt, symbol, attempt + 1);
    }

    // Max retries exceeded
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

    // Get symbol from params
    const { symbol } = await context.params;
    const upperSymbol = symbol.toUpperCase();

    // Parse request body
    const body: PersonalizedReportRequest = await request.json().catch(() => ({}));
    const companyName = body.companyName || upperSymbol;

    // Get user from database
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

    // Build risk profile result from assessment
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

    // Check and reset monthly credits if needed
    await checkAndResetMonthlyCredits(user.id);

    // Check credits
    const hasCredits = await checkCredits(user.id, 'ai_analysis');
    if (!hasCredits) {
      return NextResponse.json(
        { error: 'Insufficient credits', creditsRequired: PERSONALIZED_REPORT_CREDIT_COST },
        { status: 402 }
      );
    }

    // Fetch stock data directly from FMP
    let metricsData;
    try {
      console.log(`[PersonalizedReport] Fetching FMP data for ${upperSymbol}...`);
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

      console.log(`[PersonalizedReport] FMP data fetched successfully for ${upperSymbol}`);
    } catch (error) {
      console.error(`[PersonalizedReport] Failed to fetch data for ${upperSymbol}:`, error);
      return NextResponse.json(
        {
          error: 'Failed to fetch stock data',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }

    // Generate comprehensive prompt (ALL 9 sections in one)
    const prompt = generatePersonalizedReportPrompt(
      upperSymbol,
      metricsData.companyName,
      metricsData,
      riskProfile
    );

    console.log(`[PersonalizedReport] Generating report for ${upperSymbol}...`);

    // Single API call with retry logic
    const reportContent = await callOpenRouterWithRetry(prompt, upperSymbol);

    if (!reportContent || reportContent.length < 1000) {
      return NextResponse.json(
        { error: 'Generated report is too short or empty' },
        { status: 500 }
      );
    }

    // Deduct credits only after successful generation
    await deductCredits(
      user.id,
      'ai_analysis',
      { symbol: upperSymbol, endpoint: '/api/stock/[symbol]/personalized-report' }
    );

    const processingTime = Date.now() - startTime;
    console.log(`[PersonalizedReport] Report generated successfully for ${upperSymbol} in ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      symbol: upperSymbol,
      companyName: metricsData.companyName,
      generatedAt: new Date().toISOString(),
      report: reportContent,
      riskProfile,
      metadata: {
        reportType: 'personalized',
        processingTime,
        modelUsed: 'anthropic/claude-sonnet-4.5',
        tokenLimit: 40000,
        version: '2.0-rebuilt',
      },
    });

  } catch (error) {
    console.error('[PersonalizedReport] Error:', error);

    // Better error messages
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      if (errorMessage.includes('timeout') || errorMessage.includes('abort')) {
        return NextResponse.json(
          {
            error: 'Request timeout',
            details: 'Report generation took too long. This can happen with very detailed analysis. Please try again.'
          },
          { status: 408 }
        );
      }

      if (errorMessage.includes('rate limit') || errorMessage.includes('429')) {
        return NextResponse.json(
          {
            error: 'Service temporarily unavailable',
            details: 'Too many requests. Please wait a moment and try again.'
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: 'Failed to generate personalized report',
          details: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
