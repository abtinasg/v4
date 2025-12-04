/**
 * Deepin - Personalized Stock Report Generator API
 * 
 * POST /api/stock/[symbol]/personalized-report
 * 
 * Generates personalized investment reports based on user's risk profile
 * Uses the detailed risk assessment to tailor recommendations
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
export const maxDuration = 120;

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

/**
 * Generate Part 1 of the personalized report
 */
function generatePart1Prompt(
  symbol: string, 
  companyName: string, 
  metricsData: any,
  riskProfile: RiskProfileResult
): string {
  const categoryInfo = getCategoryDisplayInfo(riskProfile.category);
  const allocation = riskProfile.assetAllocation;
  
  return `You are an AI financial educator generating PART 1 of a deep-dive personalized investment analysis for ${symbol} (${companyName}).
IMPORTANT: This analysis is for EDUCATIONAL PURPOSES ONLY.

## INVESTOR'S RISK PROFILE
**Category:** ${categoryInfo.label}
**Risk Score:** ${riskProfile.finalScore.toFixed(2)} / 5.00
**Risk Capacity:** ${riskProfile.capacityScore.normalizedScore.toFixed(2)} / 5.00
**Risk Willingness:** ${riskProfile.willingnessScore.normalizedScore.toFixed(2)} / 5.00
**Behavioral Bias:** ${riskProfile.biasScore.normalizedScore.toFixed(2)} / 5.00

**Recommended Allocation:** Stocks: ${allocation.stocks}%, Bonds: ${allocation.bonds}%

## STOCK DATA
Price: $${metricsData.currentPrice?.toFixed(2) || 'N/A'} | Market Cap: $${(metricsData.marketCap / 1e9)?.toFixed(2) || 'N/A'}B
Sector: ${metricsData.sector || 'N/A'} | Industry: ${metricsData.industry || 'N/A'}
P/E: ${metricsData.metrics?.valuation?.peRatio?.toFixed(2) || 'N/A'} | Div Yield: ${metricsData.metrics?.valuation?.dividendYield ? (metricsData.metrics.valuation.dividendYield * 100).toFixed(2) + '%' : 'N/A'}
Beta: ${metricsData.metrics?.risk?.beta?.toFixed(2) || 'N/A'} | Volatility: ${metricsData.metrics?.risk?.volatility ? (metricsData.metrics.risk.volatility * 100).toFixed(1) + '%' : 'N/A'}

## TASK: GENERATE PART 1 (Sections 1-4)
Write a detailed, long-form analysis for the first 4 sections. Use full paragraphs, not bullet points.

1. **Profile Summary** (📋)
   - Deep analysis of this investor's specific risk profile and psychology.
   - Detailed breakdown of their psychometric scoring.

2. **Business Overview & Competitive Moat** (🏰)
   - Comprehensive explanation of the business model.
   - Deep dive into the "Moat" and competitive advantages.
   - SWOT Analysis (Strengths, Weaknesses, Opportunities, Threats) in detail.

3. **Macroeconomic Backdrop** (🌍)
   - Interest rates, inflation, and economic growth impact on this specific company.
   - Sector outlook for the next 5 years.

4. **Stock-Profile Match Analysis** (🎯)
   - MATCH SCORE (1-10) and detailed justification.
   - Compatibility with long-term goals.
   - Volatility vs Risk Tolerance deep dive.

OUTPUT ONLY THE CONTENT FOR SECTIONS 1-4. DO NOT WRITE A CONCLUSION YET.`;
}

/**
 * Generate Part 2 of the personalized report
 */
function generatePart2Prompt(
  symbol: string, 
  companyName: string, 
  metricsData: any,
  riskProfile: RiskProfileResult
): string {
  const categoryInfo = getCategoryDisplayInfo(riskProfile.category);
  
  return `You are an AI financial educator generating PART 2 of a deep-dive personalized investment analysis for ${symbol} (${companyName}).
This is a continuation of the previous analysis.

## INVESTOR CONTEXT
**Category:** ${categoryInfo.label} (Score: ${riskProfile.finalScore.toFixed(2)}/5)
**Key Bias:** ${riskProfile.biasScore.interpretation}

## TASK: GENERATE PART 2 (Sections 5-9)
Write a detailed, long-form analysis for the remaining sections. Use full paragraphs.

5. **Risk Analysis Tailored to This Investor** (⚠️)
   - Specific risks for a ${categoryInfo.label} investor.
   - Behavioral bias warnings (specifically for ${riskProfile.biasScore.interpretation} bias).
   - Scenario Analysis: Best, Base, and Worst case scenarios with % estimates.

6. **Portfolio Integration** (📊)
   - Allocation sizing recommendations (max % of equity).
   - Diversification strategy and complementary holdings.
   - Rebalancing rules.

7. **Hypothetical Investment Considerations** (✅)
   - DCA vs Lump Sum discussion for this profile.
   - Stop-loss and risk management rules.
   - Valuation context (Historical vs Current).

8. **Key Metrics That Matter for This Investor** (📈)
   - Deep dive into 5-7 key metrics relevant to this profile.
   - Explain "Why this matters to YOU".

9. **Suitability Verdict** (💡)
   - Final Suitability Rating (High/Medium/Low).
   - Comprehensive Executive Summary of the entire analysis (Part 1 & 2).

OUTPUT ONLY THE CONTENT FOR SECTIONS 5-9. START DIRECTLY WITH SECTION 5.`;
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
    } catch (error) {
      console.error(`[PersonalizedReport] Failed to fetch data for ${upperSymbol}:`, error);
      return NextResponse.json(
        { error: 'Failed to fetch stock data', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      );
    }

    // Generate Part 1 Prompt
    const promptPart1 = generatePart1Prompt(
      upperSymbol, 
      companyName, 
      metricsData,
      riskProfile
    );

    // Call OpenRouter API for Part 1
    const response1 = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://deepterm.co',
        'X-Title': 'Deepin - Personalized Report',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [{ role: 'user', content: promptPart1 }],
        max_tokens: 8192,
        temperature: 0.4,
      }),
    });

    if (!response1.ok) throw new Error('Failed to generate Part 1');
    const data1 = await response1.json();
    const content1 = data1.choices?.[0]?.message?.content || '';

    // Generate Part 2 Prompt
    const promptPart2 = generatePart2Prompt(
      upperSymbol, 
      companyName, 
      metricsData,
      riskProfile
    );

    // Call OpenRouter API for Part 2
    const response2 = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://deepterm.co',
        'X-Title': 'Deepin - Personalized Report',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'user', content: promptPart1 },
          { role: 'assistant', content: content1 },
          { role: 'user', content: promptPart2 }
        ],
        max_tokens: 8192,
        temperature: 0.4,
      }),
    });

    if (!response2.ok) throw new Error('Failed to generate Part 2');
    const data2 = await response2.json();
    const content2 = data2.choices?.[0]?.message?.content || '';

    const reportContent = content1 + "\n\n" + content2;

    if (!reportContent) {
      return NextResponse.json(
        { error: 'No report content generated' },
        { status: 500 }
      );
    }

    // Deduct credits
    await deductCredits(
      user.id, 
      'ai_analysis', 
      { symbol: upperSymbol, endpoint: '/api/stock/[symbol]/personalized-report' }
    );

    const processingTime = Date.now() - startTime;
    console.log(`[PersonalizedReport] Generated for ${upperSymbol} in ${processingTime}ms`);

    return NextResponse.json({
      success: true,
      symbol: upperSymbol,
      companyName,
      generatedAt: new Date().toISOString(),
      report: reportContent,
      riskProfile,
      metadata: {
        reportType: 'personalized',
        processingTime,
      },
    });

  } catch (error) {
    console.error('[PersonalizedReport] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
