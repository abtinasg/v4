/**
 * Streaming Report Generation API (REBUILT)
 *
 * POST /api/stock/[symbol]/report/stream
 *
 * IMPROVEMENTS:
 * - Increased token limit: 8,000 (was 4,000)
 * - Optimized prompt for better quality
 * - Better error handling
 * - Consistent with other report types
 */

import { NextRequest } from 'next/server';
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

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 120;

interface StockDataForReport {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  currentPrice: number;
  marketCap: number;
  metrics: Record<string, any>;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ symbol: string }> }
) {
  try {
    // === Auth & Credit Check ===
    const { userId: clerkUserId } = await auth();
    
    if (!clerkUserId) {
      return new Response(JSON.stringify({ error: 'Authentication required' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
    });

    if (!user) {
      return new Response(JSON.stringify({ error: 'User not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

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

    const { symbol } = await params;
    const upperSymbol = symbol.toUpperCase();

    if (!process.env.OPENROUTER_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI service not configured' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // === Fetch Stock Data ===
    console.log(`[StreamReport] Fetching data for ${upperSymbol}...`);
    const fmpRawData = await getFMPRawData(upperSymbol);
    
    if (!fmpRawData.profile && !fmpRawData.quote) {
      return new Response(JSON.stringify({ error: 'Stock data not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { profile, quote, keyMetrics, ratios, cashFlows } = fmpRawData;
    const latestMetrics = keyMetrics?.[0];
    const latestRatios = ratios?.[0];
    const latestCashFlow = cashFlows?.[0];

    const stockData: StockDataForReport = {
      symbol: upperSymbol,
      companyName: profile?.companyName || quote?.name || upperSymbol,
      sector: profile?.sector || 'N/A',
      industry: profile?.industry || 'N/A',
      currentPrice: quote?.price || 0,
      marketCap: quote?.marketCap || profile?.marketCap || 0,
      metrics: {
        pe: quote?.pe || latestRatios?.priceToEarningsRatio,
        grossMargin: latestRatios?.grossProfitMargin,
        operatingMargin: latestRatios?.operatingProfitMargin,
        profitMargin: latestRatios?.netProfitMargin,
        returnOnEquity: latestMetrics?.returnOnEquity,
        returnOnAssets: latestMetrics?.returnOnAssets,
        currentRatio: latestMetrics?.currentRatio || latestRatios?.currentRatio,
        quickRatio: latestRatios?.quickRatio,
        debtToEquity: latestRatios?.debtToEquityRatio,
        freeCashflow: latestCashFlow?.freeCashFlow,
        operatingCashflow: latestCashFlow?.operatingCashFlow,
      },
    };

    // === Build Prompt ===
    const keyMetricsSummary = `
KEY FINANCIAL METRICS:
Valuation: PE=${stockData.metrics.pe || 'N/A'}, Market Cap=$${((stockData.marketCap || 0) / 1e9).toFixed(2)}B
Profitability: Gross Margin=${((stockData.metrics.grossMargin || 0) * 100).toFixed(1)}%, Operating Margin=${((stockData.metrics.operatingMargin || 0) * 100).toFixed(1)}%, Net Margin=${((stockData.metrics.profitMargin || 0) * 100).toFixed(1)}%
Returns: ROE=${((stockData.metrics.returnOnEquity || 0) * 100).toFixed(1)}%, ROA=${((stockData.metrics.returnOnAssets || 0) * 100).toFixed(1)}%
Liquidity: Current Ratio=${(stockData.metrics.currentRatio || 0).toFixed(2)}, Quick Ratio=${(stockData.metrics.quickRatio || 0).toFixed(2)}
Leverage: Debt/Equity=${(stockData.metrics.debtToEquity || 0).toFixed(2)}x
Cash Flow: FCF=$${((stockData.metrics.freeCashflow || 0) / 1e9).toFixed(2)}B, Operating CF=$${((stockData.metrics.operatingCashflow || 0) / 1e9).toFixed(2)}B
`;

    const prompt = `You are a CFA Charterholder writing a concise equity research report for real-time streaming.

RULES:
- ONLY use numbers from provided data
- If data missing: state "Data not available"
- NO buy/sell recommendations
- Target length: 3,000-4,000 words (suitable for 5-7 page PDF)

=== DATA ===
${stockData.symbol} - ${stockData.companyName}
Sector: ${stockData.sector} | Industry: ${stockData.industry}
Price: $${stockData.currentPrice}

${keyMetricsSummary}

=== WRITE COMPREHENSIVE BUT CONCISE REPORT ===

# ${stockData.symbol} EQUITY RESEARCH REPORT
**${stockData.companyName}** | ${stockData.sector} | ${new Date().toISOString().split('T')[0]}

Write detailed research report with these sections (each needs 2-3 solid paragraphs):

## Executive Summary
Business quality snapshot, valuation stance, key risks, central investment question.

## Business Overview & Competitive Position
What company does, revenue model, competitive moat, industry dynamics.

## Financial Analysis
- Profitability: margins, returns (ROE, ROA)
- Financial Health: liquidity, leverage, debt coverage
- Cash Flow: operating CF, free CF, cash conversion

## Valuation & Growth Profile
Current valuation metrics (P/E, EV/EBITDA, etc.), growth rates, sustainability.

## Risk Assessment
Key financial and business risks. Market volatility considerations.

## Investment Synthesis
Key strengths, key weaknesses, bull case, bear case, portfolio perspective (NOT advice).

End with: _"Analysis based solely on data provided by Deep; not investment advice."_`;

    // === Stream from OpenRouter ===
    console.log(`[StreamReport] Starting streaming for ${upperSymbol}...`);
    
    const openRouterResponse = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://deepterm.com',
        'X-Title': 'Deepin - Stock Analysis',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-sonnet-4.5',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 8000, // Increased from 4000 to 8000
        temperature: 0.3, // Consistent with other reports
        stream: true,
      }),
    });

    if (!openRouterResponse.ok) {
      const error = await openRouterResponse.text();
      console.error('[StreamReport] OpenRouter error:', error);
      return new Response(JSON.stringify({ error: 'AI service error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Deduct credits
    await deductCredits(user.id, 'ai_analysis', {
      symbol: upperSymbol,
      endpoint: '/api/stock/[symbol]/report/stream',
    });

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Send metadata first
        const metadata = {
          type: 'metadata',
          symbol: upperSymbol,
          companyName: stockData.companyName,
          sector: stockData.sector,
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
          console.error('[StreamReport] Stream error:', error);
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
    console.error('[StreamReport] Error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
