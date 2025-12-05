/**
 * Streaming Personalized Report Generation API
 *
 * POST /api/stock/[symbol]/personalized-report/stream
 *
 * Streams personalized investment reports based on user's risk profile
 */

import { NextRequest } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userQueries, detailedRiskAssessmentQueries } from '@/lib/db/queries';
import {
  checkCredits,
  deductCredits,
  checkAndResetMonthlyCredits,
} from '@/lib/credits';
import { getCategoryDisplayInfo, type RiskProfileResult } from '@/lib/risk-assessment';
import { getFMPRawData } from '@/lib/data/fmp-adapter';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 180;

interface RouteContext {
  params: Promise<{
    symbol: string;
  }>;
}

/**
 * Generate comprehensive personalized report prompt
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

## 1. 📋 INVESTOR PROFILE SUMMARY
Deep dive into this investor's ${categoryInfo.label} classification, interpretation of risk scores, and psychological profile.

## 2. 🏰 BUSINESS OVERVIEW & COMPETITIVE MOAT
${companyName}'s business model, competitive advantages, SWOT analysis, and industry positioning.

## 3. 🌍 MACROECONOMIC BACKDROP
Current macro environment, interest rates, inflation, and sector outlook.

## 4. 🎯 STOCK-PROFILE MATCH ANALYSIS
**MATCH SCORE: X/10** with detailed justification for how this stock aligns with the investor's profile.

## 5. ⚠️ RISK ANALYSIS TAILORED TO THIS INVESTOR
Specific risks for a ${categoryInfo.label} investor, behavioral bias warnings, and scenario analysis (bull/base/bear cases).

## 6. 📊 PORTFOLIO INTEGRATION
Position sizing recommendations, diversification strategy, and rebalancing rules.

## 7. ✅ HYPOTHETICAL INVESTMENT CONSIDERATIONS
DCA vs lump sum, risk management rules, valuation context, and time horizon.

## 8. 📈 KEY METRICS THAT MATTER FOR THIS INVESTOR
5-7 key metrics explained with relevance to this specific investor profile.

## 9. 💡 SUITABILITY VERDICT & EXECUTIVE SUMMARY
**Final Suitability Rating: [HIGH / MEDIUM / LOW / NOT SUITABLE]** with comprehensive summary.

═══════════════════════════════════════════════════════════════
OUTPUT RULES
═══════════════════════════════════════════════════════════════

1. Output in clean Markdown with proper section headers
2. Use emojis for section headers as shown
3. Use ONLY the data provided - no hallucinating numbers
4. End with educational disclaimer

_"This personalized analysis is for educational purposes only and does not constitute investment advice."_

**BEGIN YOUR PERSONALIZED ANALYSIS NOW:**`;
}

export async function POST(
  request: NextRequest,
  context: RouteContext
) {
  try {
    // Auth check
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { symbol } = await context.params;
    const upperSymbol = symbol.toUpperCase();

    // Get user from database
    const user = await userQueries.getByClerkId(clerkId);
    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get risk assessment
    const assessment = await detailedRiskAssessmentQueries.getByUserId(user.id);
    if (!assessment) {
      return new Response(JSON.stringify({ 
        error: 'Risk assessment not found. Please complete the risk assessment first.' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Build risk profile result
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

    // Check credits
    await checkAndResetMonthlyCredits(user.id);
    const creditCheck = await checkCredits(user.id, 'ai_analysis');
    if (!creditCheck.success) {
      return new Response(JSON.stringify({ 
        error: 'insufficient_credits',
        message: 'Not enough credits for AI analysis',
      }), {
        status: 402,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Fetch stock data
    console.log(`[PersonalizedStream] Fetching data for ${upperSymbol}...`);
    const fmpData = await getFMPRawData(upperSymbol);
    
    if (!fmpData.profile && !fmpData.quote) {
      return new Response(JSON.stringify({ error: 'Stock data not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const metricsData = {
      symbol: upperSymbol,
      companyName: fmpData.profile?.companyName || upperSymbol,
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

    // Generate prompt
    const prompt = generatePersonalizedReportPrompt(
      upperSymbol,
      metricsData.companyName,
      metricsData,
      riskProfile
    );

    // Stream from OpenRouter
    console.log(`[PersonalizedStream] Starting streaming for ${upperSymbol}...`);
    
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://deepterm.com',
        'X-Title': 'Deepin - Personalized Report',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4.5',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 16000,
        temperature: 0.2,
        stream: true,
      }),
    });

    if (!openRouterResponse.ok) {
      const error = await openRouterResponse.text();
      console.error('[PersonalizedStream] OpenRouter error:', error);
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Deduct credits
    await deductCredits(user.id, 'ai_analysis', {
      symbol: upperSymbol,
      endpoint: '/api/stock/[symbol]/personalized-report/stream',
    });

    const categoryInfo = getCategoryDisplayInfo(riskProfile.category);

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send metadata first
        const metadata = {
          type: 'metadata',
          symbol: upperSymbol,
          companyName: metricsData.companyName,
          sector: metricsData.sector,
          riskCategory: categoryInfo.label,
          riskScore: riskProfile.finalScore,
          generatedAt: new Date().toISOString(),
        };
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`));

        const reader = openRouterResponse.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();
        let buffer = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') {
                  controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                  continue;
                }
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  if (content) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'content', content })}\n\n`));
                  }
                } catch (e) {
                  // Skip invalid JSON
                }
              }
            }
          }
        } catch (error) {
          console.error('[PersonalizedStream] Stream error:', error);
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('[PersonalizedStream] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
