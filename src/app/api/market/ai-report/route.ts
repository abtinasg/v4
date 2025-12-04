/**
 * AI Market Report API - GPT-4.1 Powered
 * 
 * Fetches latest news and generates intelligent market analysis
 * using OpenRouter GPT-4.1
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { 
  checkCredits, 
  deductCredits, 
  checkRateLimit,
  checkAndResetMonthlyCredits,
  createInsufficientCreditsResponse,
  createAuthRequiredResponse,
  createRateLimitResponse,
} from '@/lib/credits'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

// Fetch latest news for analysis (using same endpoint as market news page)
async function fetchLatestNews(): Promise<string[]> {
  try {
    const FMP_API_KEY = process.env.FMP_API_KEY
    if (!FMP_API_KEY) {
      console.warn('[AI Report] FMP API key not configured')
      return []
    }

    // Use the STABLE endpoint that works (same as market/news)
    const response = await fetch(
      `https://financialmodelingprep.com/stable/news/stock-latest?limit=20&apikey=${FMP_API_KEY}`,
      { 
        headers: { 'User-Agent': 'DeepTerminal/1.0' },
        cache: 'no-store'
      }
    )

    if (!response.ok) {
      console.error('[AI Report] Failed to fetch news:', response.status)
      return []
    }

    const news = await response.json()
    
    if (!Array.isArray(news) || news.length === 0) {
      console.error('[AI Report] No news returned from API')
      return []
    }

    console.log(`[AI Report] Fetched ${news.length} news items`)
    
    // Extract headlines and summaries
    return news.slice(0, 12).map((item: { title: string; text: string; symbol?: string }) => 
      `${item.symbol ? `[${item.symbol}] ` : ''}${item.title}${item.text ? `: ${item.text.substring(0, 150)}` : ''}`
    )
  } catch (error) {
    console.error('[AI Report] Error fetching news:', error)
    return []
  }
}

// Generate AI analysis using OpenRouter GPT-4.1
async function generateAIAnalysis(newsItems: string[]): Promise<{
  marketMood: 'bullish' | 'bearish' | 'neutral' | 'mixed'
  summary: string
  keyHighlights: string[]
}> {
  const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY
  
  if (!OPENROUTER_API_KEY) {
    throw new Error('OpenRouter API key not configured')
  }

  const newsContext = newsItems.length > 0 
    ? newsItems.join('\n\n')
    : 'No recent news available'

  const systemPrompt = `You are an elite financial analyst at a top Wall Street firm. Analyze the latest market news and provide a concise, professional market overview.

Your response MUST be valid JSON in this exact format:
{
  "marketMood": "bullish" | "bearish" | "neutral" | "mixed",
  "summary": "2-3 sentence professional market summary",
  "keyHighlights": ["highlight 1", "highlight 2", "highlight 3"]
}

Guidelines:
- Be concise but insightful
- Focus on actionable market intelligence
- Identify key themes and trends
- Use professional financial language
- Provide 3 key highlights maximum
- Summary should be 2-3 sentences max`

  const userPrompt = `Analyze these latest market news headlines and provide your market assessment:

${newsContext}

Current date: ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}

Respond with valid JSON only.`

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://deepinhq.com',
        'X-Title': 'Deepin - AI Market Report',
      },
      body: JSON.stringify({
        model: 'openai/gpt-4.1',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 500,
        response_format: { type: 'json_object' }
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('[AI Report] OpenRouter error:', response.status, errorText)
      throw new Error(`OpenRouter API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('No content in AI response')
    }

    // Parse JSON response
    const parsed = JSON.parse(content)
    
    return {
      marketMood: parsed.marketMood || 'neutral',
      summary: parsed.summary || 'Market analysis in progress.',
      keyHighlights: parsed.keyHighlights || []
    }
  } catch (error) {
    console.error('[AI Report] AI generation error:', error)
    
    // Fallback response
    return {
      marketMood: 'neutral',
      summary: 'Market conditions are being evaluated. Check back shortly for updated analysis.',
      keyHighlights: [
        'Market data is being processed',
        'Analysis will be available soon',
        'Refresh for latest insights'
      ]
    }
  }
}

export async function GET(request: Request) {
  try {
    // === Authentication Check ===
    const { userId } = await auth()
    
    if (!userId) {
      return createAuthRequiredResponse()
    }
    
    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, userId),
    })
    
    if (!user) {
      return createAuthRequiredResponse()
    }

    // === Check and Reset Monthly Credits ===
    await checkAndResetMonthlyCredits(user.id)
    
    // === Rate Limit Check ===
    const { pathname } = new URL(request.url)
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown'
    
    const rateLimitResult = await checkRateLimit(
      { userId: user.id, ipAddress },
      pathname
    )
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(
        rateLimitResult.retryAfter || 60,
        rateLimitResult.limit,
        rateLimitResult.resetAt
      )
    }
    
    // === Credit Check (5 credits for AI report) ===
    const creditCheck = await checkCredits(user.id, 'news_fetch')
    if (!creditCheck.success) {
      return createInsufficientCreditsResponse(
        creditCheck.currentBalance,
        creditCheck.requiredCredits,
        'news_fetch'
      )
    }

    // Fetch latest news
    console.log('[AI Report] Fetching latest news...')
    const newsItems = await fetchLatestNews()
    console.log(`[AI Report] Got ${newsItems.length} news items`)

    // Generate AI analysis
    console.log('[AI Report] Generating AI analysis with GPT-4.1...')
    const analysis = await generateAIAnalysis(newsItems)
    console.log('[AI Report] Analysis complete:', analysis.marketMood)
    
    // === Deduct Credits after successful report generation ===
    await deductCredits(user.id, 'news_fetch', {
      apiEndpoint: pathname,
      ipAddress,
    })
    
    const response = NextResponse.json({
      success: true,
      report: analysis,
      generatedAt: new Date().toISOString(),
      newsCount: newsItems.length,
      model: 'gpt-4.1'
    }, {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    })
    
    // Add credit headers
    response.headers.set('X-Credit-Balance', String(creditCheck.remainingBalance))
    response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining))
    
    return response
  } catch (error) {
    console.error('[AI Report] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to generate market report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
