/**
 * Deep Terminal - Personalized Stock Report Generator API
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
 * Generate personalized report prompt based on risk profile
 */
function generatePersonalizedPrompt(
  symbol: string, 
  companyName: string, 
  metricsData: any,
  riskProfile: RiskProfileResult
): string {
  const categoryInfo = getCategoryDisplayInfo(riskProfile.category);
  const allocation = riskProfile.assetAllocation;
  
  return `You are an AI financial advisor generating a personalized investment analysis for ${symbol} (${companyName}).

## INVESTOR'S RISK PROFILE

**Category:** ${categoryInfo.label}
**Risk Score:** ${riskProfile.finalScore.toFixed(2)} / 5.00
**Risk Capacity Score:** ${riskProfile.capacityScore.normalizedScore.toFixed(2)} / 5.00
**Risk Willingness Score:** ${riskProfile.willingnessScore.normalizedScore.toFixed(2)} / 5.00
**Behavioral Bias Score:** ${riskProfile.biasScore.normalizedScore.toFixed(2)} / 5.00

**Recommended Asset Allocation:**
- Stocks: ${allocation.stocks}%
- Bonds: ${allocation.bonds}%
${allocation.alternatives ? `- Alternatives: ${allocation.alternatives}%` : ''}
${allocation.cash ? `- Cash: ${allocation.cash}%` : ''}

**Investor Characteristics:**
${riskProfile.characteristics.map(c => `- ${c}`).join('\n')}

## STOCK DATA FOR ${symbol}

Current Price: $${metricsData.currentPrice?.toFixed(2) || 'N/A'}
Market Cap: $${(metricsData.marketCap / 1e9)?.toFixed(2) || 'N/A'}B
Sector: ${metricsData.sector || 'N/A'}
Industry: ${metricsData.industry || 'N/A'}

Key Metrics:
- P/E Ratio: ${metricsData.metrics?.valuation?.peRatio?.toFixed(2) || 'N/A'}
- Dividend Yield: ${metricsData.metrics?.valuation?.dividendYield ? (metricsData.metrics.valuation.dividendYield * 100).toFixed(2) + '%' : 'N/A'}
- Beta: ${metricsData.metrics?.risk?.beta?.toFixed(2) || 'N/A'}
- 52-Week Volatility: ${metricsData.metrics?.risk?.volatility ? (metricsData.metrics.risk.volatility * 100).toFixed(1) + '%' : 'N/A'}
- ROE: ${metricsData.metrics?.profitability?.roe ? (metricsData.metrics.profitability.roe * 100).toFixed(1) + '%' : 'N/A'}
- Debt/Equity: ${metricsData.metrics?.leverage?.debtToEquity?.toFixed(2) || 'N/A'}
- Current Ratio: ${metricsData.metrics?.liquidity?.currentRatio?.toFixed(2) || 'N/A'}
- Revenue Growth: ${metricsData.metrics?.growth?.revenueGrowth ? (metricsData.metrics.growth.revenueGrowth * 100).toFixed(1) + '%' : 'N/A'}
- EPS Growth: ${metricsData.metrics?.growth?.epsGrowth ? (metricsData.metrics.growth.epsGrowth * 100).toFixed(1) + '%' : 'N/A'}
- Profit Margin: ${metricsData.metrics?.profitability?.netMargin ? (metricsData.metrics.profitability.netMargin * 100).toFixed(1) + '%' : 'N/A'}

## YOUR TASK

Generate a comprehensive personalized investment analysis. The report should start with a profile summary and then analyze the stock FOR THIS SPECIFIC investor:

1. **Profile Summary** (📋)
   - Brief recap of this investor's risk profile
   - What kind of investments suit them best
   - Their key behavioral tendencies to watch out for

2. **Stock-Profile Match Analysis** (🎯)
   - Give a MATCH SCORE (1-10) showing how well ${symbol} fits this investor
   - Explain exactly why it matches or doesn't match their profile
   - Compare stock's volatility/beta to their risk tolerance
   - Assess if the stock's characteristics align with their investment style

3. **Risk Analysis Tailored to This Investor** (⚠️)
   - Identify specific risks that matter MOST to a ${categoryInfo.label} investor
   - How the stock's volatility compares to what they can handle
   - Red flags specific to their capacity and willingness scores
   - How their behavioral biases might affect decisions about this stock

4. **Portfolio Integration** (📊)
   - What percentage of their EQUITY portion should go to this stock (max %)
   - How it fits with their ${allocation.stocks}/${allocation.bonds} target allocation
   - Diversification considerations for their risk level
   - Complementary holdings they should consider

5. **Personalized Entry Strategy** (✅)
   - Entry approach suited to their risk tolerance (DCA vs lump sum)
   - Position sizing recommendation based on their profile
   - Stop-loss levels appropriate for their risk capacity
   - When to add or reduce position based on their risk profile

6. **Key Metrics That Matter for This Investor** (📈)
   - Highlight 5-7 metrics most relevant to their specific profile
   - Explain each metric's importance for their investment style
   - Flag any concerning values based on their risk capacity
   - Show how each metric affects suitability for them

7. **Final Recommendation** (💡)
   - Clear BUY / HOLD / AVOID rating for THIS investor
   - Why this recommendation makes sense for their specific profile
   - What would need to change for a different recommendation
   - Realistic return expectations aligned with their risk tolerance

## FORMATTING GUIDELINES

- Use clear section headers with emojis as shown above
- Keep language accessible but professional
- Be specific with numbers, percentages, and scores
- ALWAYS relate advice back to their specific risk profile
- Use bullet points for easy scanning
- Avoid generic advice - everything must be personalized
- Include the Match Score prominently at the top of section 2

Write the complete personalized analysis now:`;
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

    // Fetch stock metrics from our internal API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    
    const metricsResponse = await fetch(`${baseUrl}/api/stock/${upperSymbol}/metrics`, {
      headers: {
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (!metricsResponse.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch stock data' },
        { status: 500 }
      );
    }

    const metricsData = await metricsResponse.json();

    // Generate personalized prompt
    const prompt = generatePersonalizedPrompt(
      upperSymbol, 
      companyName, 
      metricsData,
      riskProfile
    );

    // Call Claude API via OpenRouter
    const openrouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': baseUrl,
        'X-Title': 'Deep Terminal - Personalized Report',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4',
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 4000,
        temperature: 0.7,
      }),
    });

    if (!openrouterResponse.ok) {
      const errorData = await openrouterResponse.json().catch(() => ({}));
      console.error('[PersonalizedReport] OpenRouter error:', errorData);
      return NextResponse.json(
        { error: 'Failed to generate report' },
        { status: 500 }
      );
    }

    const aiResponse = await openrouterResponse.json();
    const reportContent = aiResponse.choices?.[0]?.message?.content || '';

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
