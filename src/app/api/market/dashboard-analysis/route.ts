/**
 * Dashboard AI Market Analysis API
 * 
 * Comprehensive market analysis using GPT-5.1 and Claude Sonnet 4.5
 * Analyzes market data, news, economic indicators, and trends
 */

import { NextResponse } from 'next/server'
import { getAllEconomicIndicators } from '@/lib/api/fred'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 60

// Use Vercel URL in production, or custom URL, or localhost for dev
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

interface MarketIndex {
  name: string
  price: number
  change: number
  changePercent: number
}

interface NewsItem {
  headline: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  category: string
  source: string
}

interface EconomicData {
  gdp: { value: number | null; change: number | null } | null
  unemployment: { value: number | null; change: number | null } | null
  inflation: { value: number | null; change: number | null } | null
  federalFundsRate: { value: number | null; change: number | null } | null
  consumerConfidence: { value: number | null; change: number | null } | null
  manufacturingPmi: { value: number | null; change: number | null } | null
  servicesPmi: { value: number | null; change: number | null } | null
}

interface MarketData {
  indices: MarketIndex[]
  topGainers: Array<{ symbol: string; name?: string; change: number }>
  topLosers: Array<{ symbol: string; name?: string; change: number }>
}

// Fetch all market data
async function fetchMarketData(): Promise<MarketData | null> {
  try {
    const baseUrl = getBaseUrl()
    const [overviewRes, moversRes] = await Promise.all([
      fetch(`${baseUrl}/api/market/overview`),
      fetch(`${baseUrl}/api/market/movers`)
    ])

    const overview = overviewRes.ok ? await overviewRes.json() : null
    const movers = moversRes.ok ? await moversRes.json() : null

    return {
      indices: overview?.indices || [],
      topGainers: movers?.gainers?.slice(0, 5) || [],
      topLosers: movers?.losers?.slice(0, 5) || []
    }
  } catch (error) {
    console.error('Error fetching market data:', error)
    return null
  }
}

// Fetch economic indicators - direct function call instead of HTTP to avoid self-referential requests
async function fetchEconomicIndicators(): Promise<EconomicData | null> {
  try {
    const data = await getAllEconomicIndicators()
    return data as EconomicData
  } catch (error) {
    console.error('Error fetching economic indicators:', error)
    return null
  }
}

// Fetch recent news
async function fetchRecentNews(): Promise<NewsItem[]> {
  try {
    const baseUrl = getBaseUrl()
    const res = await fetch(`${baseUrl}/api/market/news?limit=20`)
    if (!res.ok) return []
    const data = await res.json()
    return data.news?.slice(0, 20) || []
  } catch (error) {
    console.error('Error fetching news:', error)
    return []
  }
}

// Build comprehensive prompt
function buildAnalysisPrompt(
  marketData: MarketData | null,
  economicData: EconomicData | null,
  news: NewsItem[]
): string {
  // Market indices
  const indicesText = marketData?.indices?.map(idx => 
    `${idx.name}: ${idx.price?.toLocaleString() || 'N/A'} (${idx.changePercent >= 0 ? '+' : ''}${idx.changePercent?.toFixed(2) || 0}%)`
  ).join('\n') || 'Data unavailable'

  // Top movers
  const gainersText = marketData?.topGainers?.map(s => 
    `${s.symbol}: +${s.change?.toFixed(2) || 0}%`
  ).join(', ') || 'N/A'

  const losersText = marketData?.topLosers?.map(s => 
    `${s.symbol}: ${s.change?.toFixed(2) || 0}%`
  ).join(', ') || 'N/A'

  // Economic indicators
  const econ = economicData
  const economicText = econ ? `
- GDP Growth: ${econ.gdp?.value?.toFixed(1) || 'N/A'}%
- Unemployment: ${econ.unemployment?.value?.toFixed(1) || 'N/A'}%
- Inflation (CPI): ${econ.inflation?.value?.toFixed(1) || 'N/A'}%
- Fed Funds Rate: ${econ.federalFundsRate?.value?.toFixed(2) || 'N/A'}%
- Consumer Confidence: ${econ.consumerConfidence?.value?.toFixed(1) || 'N/A'}
- Manufacturing PMI: ${econ.manufacturingPmi?.value?.toFixed(1) || 'N/A'} ${(econ.manufacturingPmi?.value ?? 0) >= 50 ? '(Expansion)' : '(Contraction)'}
- Services PMI: ${econ.servicesPmi?.value?.toFixed(1) || 'N/A'} ${(econ.servicesPmi?.value ?? 0) >= 50 ? '(Expansion)' : '(Contraction)'}
` : 'Economic data unavailable'

  // News analysis
  const newsText = news.slice(0, 15).map((n, i) => 
    `${i + 1}. [${n.sentiment.toUpperCase()}] ${n.headline}`
  ).join('\n')

  const sentimentStats = {
    bullish: news.filter(n => n.sentiment === 'bullish').length,
    bearish: news.filter(n => n.sentiment === 'bearish').length,
    neutral: news.filter(n => n.sentiment === 'neutral').length
  }

  return `You are a world-class financial analyst providing a comprehensive market analysis for professional traders. Analyze ALL the following data carefully:

## MARKET INDICES (Real-time)
${indicesText}

## TOP MOVERS TODAY
🟢 Gainers: ${gainersText}
🔴 Losers: ${losersText}

## ECONOMIC INDICATORS (Latest Data)
${economicText}

## NEWS SENTIMENT ANALYSIS
Total articles: ${news.length}
- Bullish: ${sentimentStats.bullish} (${((sentimentStats.bullish / (news.length || 1)) * 100).toFixed(0)}%)
- Bearish: ${sentimentStats.bearish} (${((sentimentStats.bearish / (news.length || 1)) * 100).toFixed(0)}%)
- Neutral: ${sentimentStats.neutral} (${((sentimentStats.neutral / (news.length || 1)) * 100).toFixed(0)}%)

## RECENT HEADLINES
${newsText}

---

Based on ALL this comprehensive data (market indices, movers, economic indicators, and news), provide a DETAILED market analysis.

Your analysis should be:
1. Professional and insightful
2. Specific with actual numbers from the data
3. Actionable for traders
4. Written in engaging, clear language
5. 150-250 words maximum

Focus on:
- Overall market direction and momentum
- Key economic factors affecting the market
- Sector-specific insights based on movers
- Risk assessment considering PMI and economic data
- Short-term outlook based on sentiment

Write naturally without JSON formatting. Be specific and reference actual data points. End with a brief actionable insight.`
}

// Call AI with fallback
async function callAI(prompt: string): Promise<string | null> {
  const openRouterKey = process.env.OPENROUTER_API_KEY
  if (!openRouterKey) {
    console.error('OPENROUTER_API_KEY not configured')
    return null
  }

  const models = [
    'openai/gpt-4o',           // GPT-4o as primary (most reliable)
    'anthropic/claude-3.5-sonnet', // Claude 3.5 Sonnet as fallback
    'anthropic/claude-3-haiku'     // Fast fallback
  ]

  for (const model of models) {
    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openRouterKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': getBaseUrl(),
          'X-Title': 'TradeFX Dashboard Analysis'
        },
        body: JSON.stringify({
          model,
          messages: [
            { 
              role: 'system', 
              content: 'You are a senior financial analyst at a major investment bank. Your analysis is trusted by professional traders worldwide. Be specific, data-driven, and insightful.' 
            },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 800
        })
      })

      if (response.ok) {
        const data = await response.json()
        const content = data.choices?.[0]?.message?.content
        if (content) {
          return content
        }
      }
    } catch (error) {
      console.error(`Error with model ${model}:`, error)
    }
  }

  return null
}

export async function GET() {
  try {
    // Fetch all data in parallel
    const [marketData, economicData, news] = await Promise.all([
      fetchMarketData(),
      fetchEconomicIndicators(),
      fetchRecentNews()
    ])

    // Build prompt
    const prompt = buildAnalysisPrompt(marketData, economicData, news)

    // Get AI analysis
    const analysis = await callAI(prompt)

    if (!analysis) {
      return NextResponse.json({
        success: false,
        error: 'Unable to generate analysis',
        analysis: 'Market analysis temporarily unavailable. Please try again later.',
        timestamp: new Date().toISOString()
      }, { status: 500 })
    }

    // Calculate market mood from indices
    const avgChange = marketData?.indices?.reduce((sum, idx) => sum + (idx.changePercent || 0), 0) || 0
    const indicesCount = marketData?.indices?.length || 1
    const avgChangePercent = avgChange / indicesCount

    let marketMood: 'bullish' | 'bearish' | 'neutral' | 'mixed' = 'neutral'
    if (avgChangePercent > 0.5) marketMood = 'bullish'
    else if (avgChangePercent > 0) marketMood = 'mixed'
    else if (avgChangePercent > -0.5) marketMood = 'mixed'
    else marketMood = 'bearish'

    // News sentiment
    const sentimentBreakdown = {
      bullish: news.filter(n => n.sentiment === 'bullish').length,
      bearish: news.filter(n => n.sentiment === 'bearish').length,
      neutral: news.filter(n => n.sentiment === 'neutral').length
    }

    return NextResponse.json({
      success: true,
      analysis,
      marketMood,
      indices: marketData?.indices || [],
      economicIndicators: economicData,
      sentimentBreakdown,
      newsCount: news.length,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Dashboard analysis error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to generate analysis',
      analysis: 'Market analysis temporarily unavailable.',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
