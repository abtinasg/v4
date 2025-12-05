/**
 * Dashboard AI Market Analysis API
 * 
 * Comprehensive market analysis using GPT-4o and Claude Sonnet
 * Analyzes market data, news, economic indicators, and trends
 * 
 * Note: Uses direct API calls instead of self-referential HTTP requests
 * to avoid Vercel serverless function issues
 */

import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { getAllEconomicIndicators } from '@/lib/api/fred'
import YahooFinance from 'yahoo-finance2'
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

const yahooFinance = new YahooFinance()

// ========== CACHE CONFIGURATION ==========
// 15-minute cache for AI Market Analysis to reduce API costs
const CACHE_DURATION_MS = 15 * 60 * 1000 // 15 minutes

interface CachedAnalysis {
  analysis: string
  marketMood: 'bullish' | 'bearish' | 'neutral' | 'mixed'
  indices: MarketIndex[]
  economicIndicators: EconomicData | null
  sentimentBreakdown: { bullish: number; bearish: number; neutral: number }
  newsCount: number
  timestamp: string
  cachedAt: number
}

// In-memory cache (works for single instance, consider Redis for multi-instance)
let analysisCache: CachedAnalysis | null = null

function isCacheValid(): boolean {
  if (!analysisCache) return false
  const now = Date.now()
  return (now - analysisCache.cachedAt) < CACHE_DURATION_MS
}

function getCachedAnalysis(): CachedAnalysis | null {
  if (isCacheValid()) {
    return analysisCache
  }
  return null
}

function setCachedAnalysis(data: Omit<CachedAnalysis, 'cachedAt'>): void {
  analysisCache = {
    ...data,
    cachedAt: Date.now()
  }
}

function getCacheRemainingTime(): number {
  if (!analysisCache) return 0
  const elapsed = Date.now() - analysisCache.cachedAt
  const remaining = CACHE_DURATION_MS - elapsed
  return Math.max(0, Math.floor(remaining / 1000)) // seconds
}
// ========================================

// Use Vercel URL in production, or custom URL, or localhost for dev
function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`
  return 'http://localhost:3000'
}

// Major market indices symbols
const MARKET_INDICES = [
  { symbol: '^GSPC', name: 'S&P 500' },
  { symbol: '^DJI', name: 'Dow Jones' },
  { symbol: '^IXIC', name: 'NASDAQ' },
  { symbol: '^RUT', name: 'Russell 2000' },
  { symbol: '^VIX', name: 'VIX' },
]

// Top stocks to track for movers
const TOP_STOCKS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'NVDA', 'TSLA',
  'AMD', 'INTC', 'JPM', 'BAC', 'GS', 'V', 'MA',
  'UNH', 'JNJ', 'PFE', 'XOM', 'CVX', 'WMT', 'HD', 'COST'
]

// Fallback indices data
const FALLBACK_INDICES: MarketIndex[] = [
  { name: 'S&P 500', price: 6032.38, change: 33.64, changePercent: 0.56 },
  { name: 'Dow Jones', price: 44910.65, change: 188.59, changePercent: 0.42 },
  { name: 'NASDAQ', price: 19218.17, change: 157.69, changePercent: 0.83 },
  { name: 'Russell 2000', price: 2434.72, change: 21.45, changePercent: 0.89 },
  { name: 'VIX', price: 13.51, change: -0.59, changePercent: -4.18 },
]

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

// Fetch market data directly from Yahoo Finance (no self-referential HTTP)
async function fetchMarketData(): Promise<MarketData | null> {
  try {
    // Fetch indices
    const indicesData = await Promise.all(
      MARKET_INDICES.map(async (index) => {
        try {
          const quote = await yahooFinance.quote(index.symbol)
          return {
            name: index.name,
            price: quote.regularMarketPrice || 0,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
          }
        } catch (error) {
          console.error(`Error fetching ${index.symbol}:`, error)
          return null
        }
      })
    )

    // Fetch top stocks for movers
    const stocksData = await Promise.all(
      TOP_STOCKS.map(async (symbol) => {
        try {
          const quote = await yahooFinance.quote(symbol)
          return {
            symbol,
            name: quote.shortName || symbol,
            change: quote.regularMarketChangePercent || 0,
          }
        } catch (error) {
          console.error(`Error fetching ${symbol}:`, error)
          return null
        }
      })
    )

    const validStocks = stocksData.filter((s): s is NonNullable<typeof s> => s !== null)
    const validIndices = indicesData.filter((i): i is MarketIndex => i !== null)

    // Sort for gainers and losers
    const sortedByChange = [...validStocks].sort((a, b) => b.change - a.change)
    const topGainers = sortedByChange.filter(s => s.change > 0).slice(0, 5)
    const topLosers = sortedByChange.filter(s => s.change < 0).slice(-5).reverse()

    return {
      indices: validIndices.length > 0 ? validIndices : FALLBACK_INDICES,
      topGainers,
      topLosers
    }
  } catch (error) {
    console.error('Error fetching market data:', error)
    return {
      indices: FALLBACK_INDICES,
      topGainers: [],
      topLosers: []
    }
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

// Sentiment analysis helper
function analyzeSentiment(text: string): 'bullish' | 'bearish' | 'neutral' {
  const lowerText = text.toLowerCase()
  const bullishKeywords = ['surge', 'jump', 'soar', 'rally', 'gain', 'up', 'rise', 'beat', 'record', 'strong', 'growth', 'positive', 'bullish', 'buy', 'upgrade', 'outperform', 'breakout', 'momentum', 'high', 'profit']
  const bearishKeywords = ['fall', 'drop', 'plunge', 'decline', 'down', 'loss', 'miss', 'weak', 'negative', 'bearish', 'sell', 'crash', 'tumble', 'slump', 'downgrade', 'warning', 'concern', 'risk', 'low', 'cut']
  
  const bullishCount = bullishKeywords.filter(kw => lowerText.includes(kw)).length
  const bearishCount = bearishKeywords.filter(kw => lowerText.includes(kw)).length
  
  if (bullishCount > bearishCount) return 'bullish'
  if (bearishCount > bullishCount) return 'bearish'
  return 'neutral'
}

// Categorize news
function categorizeNews(text: string): string {
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('fed') || lowerText.includes('rate') || lowerText.includes('inflation') || lowerText.includes('economic') || lowerText.includes('gdp')) {
    return 'Macro'
  }
  if (lowerText.includes('earnings') || lowerText.includes('revenue') || lowerText.includes('profit') || lowerText.includes('quarterly')) {
    return 'Earnings'
  }
  return 'Market'
}

// Parse RSS XML
function parseRSSXml(xml: string): Array<{title: string, pubDate: string, description: string, source?: string}> {
  const items: Array<{title: string, pubDate: string, description: string, source?: string}> = []
  
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1]
    
    const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)
    const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/)
    const descMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/)
    const sourceMatch = itemContent.match(/<source[^>]*>(.*?)<\/source>/)
    
    const title = titleMatch ? (titleMatch[1] || titleMatch[2] || '') : ''
    const pubDate = pubDateMatch ? pubDateMatch[1] : ''
    const description = descMatch ? (descMatch[1] || descMatch[2] || '') : ''
    const source = sourceMatch ? sourceMatch[1] : undefined
    
    if (title) {
      items.push({ title, pubDate, description, source })
    }
  }
  
  return items
}

// Fetch recent news directly (no self-referential HTTP)
async function fetchRecentNews(): Promise<NewsItem[]> {
  try {
    // Fetch from Yahoo Finance RSS feeds directly
    const rssFeeds = [
      'https://feeds.finance.yahoo.com/rss/2.0/headline?s=AAPL,MSFT,GOOGL,AMZN,NVDA,TSLA,META&region=US&lang=en-US',
      'https://feeds.finance.yahoo.com/rss/2.0/headline?s=SPY,QQQ,DIA,IWM&region=US&lang=en-US',
    ]

    const allItems: NewsItem[] = []
    
    for (const feedUrl of rssFeeds) {
      try {
        const response = await fetch(feedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        })
        
        if (response.ok) {
          const xml = await response.text()
          const items = parseRSSXml(xml)
          
          items.forEach((item) => {
            if (item.title) {
              const headline = item.title
              const summary = item.description || item.title
              
              allItems.push({
                headline,
                sentiment: analyzeSentiment(headline + ' ' + summary),
                category: categorizeNews(headline),
                source: item.source || 'Yahoo Finance',
              })
            }
          })
        }
      } catch (err) {
        console.error('RSS fetch error:', err)
      }
    }
    
    return allItems.slice(0, 20)
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

export async function GET(request: Request) {
  try {
    const pathname = '/api/market/dashboard-analysis'
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0] || 
                     request.headers.get('x-real-ip') ||
                     'unknown'

    // === Authentication ===
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return createAuthRequiredResponse()
    }
    
    // Find internal user
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
    })
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      )
    }
    
    // === Check and reset monthly credits ===
    await checkAndResetMonthlyCredits(user.id)
    
    // === Rate Limiting ===
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
    
    // === Credit Check ===
    const creditCheck = await checkCredits(user.id, 'ai_analysis')
    
    if (!creditCheck.success) {
      return createInsufficientCreditsResponse(
        creditCheck.currentBalance,
        creditCheck.requiredCredits,
        'ai_analysis'
      )
    }

    // ========== CHECK CACHE FIRST ==========
    const cachedData = getCachedAnalysis()
    if (cachedData) {
      console.log('Returning cached AI Market Analysis (cache hit)')
      
      const response = NextResponse.json({
        success: true,
        analysis: cachedData.analysis,
        marketMood: cachedData.marketMood,
        indices: cachedData.indices,
        economicIndicators: cachedData.economicIndicators,
        sentimentBreakdown: cachedData.sentimentBreakdown,
        newsCount: cachedData.newsCount,
        timestamp: cachedData.timestamp,
        cached: true,
        cacheExpiresIn: getCacheRemainingTime()
      })
      
      // Note: No credits deducted for cached response
      response.headers.set('X-Credit-Balance', String(creditCheck.remainingBalance + (creditCheck.requiredCredits || 0)))
      response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining))
      response.headers.set('X-Cache-Status', 'HIT')
      response.headers.set('X-Cache-Expires-In', String(getCacheRemainingTime()))
      
      return response
    }
    // =======================================

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

    // === Deduct Credits after successful AI call ===
    await deductCredits(user.id, 'ai_analysis', {
      apiEndpoint: pathname,
      ipAddress,
    })

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

    // ========== CACHE THE RESULT ==========
    const cacheData = {
      analysis,
      marketMood,
      indices: marketData?.indices || [],
      economicIndicators: economicData,
      sentimentBreakdown,
      newsCount: news.length,
      timestamp: new Date().toISOString()
    }
    setCachedAnalysis(cacheData)
    console.log('AI Market Analysis cached for 15 minutes')
    // ======================================

    const response = NextResponse.json({
      success: true,
      analysis,
      marketMood,
      indices: marketData?.indices || [],
      economicIndicators: economicData,
      sentimentBreakdown,
      newsCount: news.length,
      timestamp: new Date().toISOString(),
      cached: false,
      cacheExpiresIn: getCacheRemainingTime()
    })
    
    // Add credit headers
    response.headers.set('X-Credit-Balance', String(creditCheck.remainingBalance))
    response.headers.set('X-RateLimit-Remaining', String(rateLimitResult.remaining))
    response.headers.set('X-Cache-Status', 'MISS')
    
    return response

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
