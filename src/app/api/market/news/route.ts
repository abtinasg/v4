import { NextResponse } from 'next/server'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface NewsItem {
  id: string
  headline: string
  summary: string
  fullText?: string
  timeAgo: string
  publishedDate: string
  source: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  category: string
  url: string
  symbol: string | null
  image: string | null
}

function getTimeAgo(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMins / 60)
  const diffDays = Math.floor(diffHours / 24)
  
  if (diffDays > 0) return `${diffDays}d ago`
  if (diffHours > 0) return `${diffHours}h ago`
  if (diffMins > 0) return `${diffMins}m ago`
  return 'Just now'
}

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

function categorizeNews(text: string): string {
  const lowerText = text.toLowerCase()
  
  if (lowerText.includes('fed') || lowerText.includes('rate') || lowerText.includes('inflation') || lowerText.includes('economic') || lowerText.includes('gdp') || lowerText.includes('employment') || lowerText.includes('treasury')) {
    return 'Macro'
  }
  if (lowerText.includes('earnings') || lowerText.includes('revenue') || lowerText.includes('profit') || lowerText.includes('quarterly') || lowerText.includes('eps') || lowerText.includes('q1') || lowerText.includes('q2') || lowerText.includes('q3') || lowerText.includes('q4')) {
    return 'Earnings'
  }
  if (lowerText.includes('global') || lowerText.includes('europe') || lowerText.includes('asia') || lowerText.includes('china') || lowerText.includes('japan') || lowerText.includes('uk') || lowerText.includes('germany')) {
    return 'Global'
  }
  return 'Market'
}

function extractSymbolFromText(text: string): string | null {
  // Common stock tickers pattern
  const tickerMatch = text.match(/\b([A-Z]{1,5})\b(?:\s+stock|\s+shares)?/g)
  const knownTickers = ['AAPL', 'MSFT', 'GOOGL', 'GOOG', 'AMZN', 'NVDA', 'TSLA', 'META', 'JPM', 'V', 'MA', 'UNH', 'HD', 'PG', 'DIS', 'NFLX', 'PYPL', 'INTC', 'AMD', 'CRM', 'ADBE', 'ORCL', 'CSCO', 'IBM', 'QCOM', 'TXN', 'AVGO', 'COST', 'PEP', 'KO', 'WMT', 'MCD', 'NKE', 'SBUX', 'BA', 'GE', 'CAT', 'MMM', 'HON', 'UPS', 'FDX', 'XOM', 'CVX', 'COP', 'SLB', 'EOG', 'PXD', 'MRK', 'PFE', 'JNJ', 'ABBV', 'LLY', 'BMY', 'AMGN', 'GILD', 'REGN', 'VRTX', 'BIIB', 'GS', 'MS', 'BAC', 'WFC', 'C', 'USB', 'PNC', 'SCHW', 'AXP', 'BLK', 'COIN', 'SQ', 'SHOP', 'SNOW', 'PLTR', 'UBER', 'LYFT', 'ABNB', 'DASH', 'RBLX', 'U', 'ZM', 'DOCU', 'OKTA', 'CRWD', 'ZS', 'NET', 'DDOG', 'MDB', 'TEAM', 'NOW', 'WDAY', 'SPLK', 'PANW', 'FTNT', 'SNAP', 'PINS', 'TWTR', 'SPOT', 'SQ', 'ROKU', 'TTD', 'ETSY', 'CHWY', 'W', 'BABA', 'JD', 'PDD', 'NIO', 'XPEV', 'LI', 'BIDU', 'TME', 'BILI', 'IQ']
  
  if (tickerMatch) {
    for (const match of tickerMatch) {
      const ticker = match.split(/\s+/)[0]
      if (knownTickers.includes(ticker)) {
        return ticker
      }
    }
  }
  return null
}

// Parse RSS XML
function parseRSSXml(xml: string): Array<{title: string, link: string, pubDate: string, description: string, source?: string}> {
  const items: Array<{title: string, link: string, pubDate: string, description: string, source?: string}> = []
  
  // Simple regex-based XML parsing
  const itemRegex = /<item>([\s\S]*?)<\/item>/g
  let match
  
  while ((match = itemRegex.exec(xml)) !== null) {
    const itemContent = match[1]
    
    const titleMatch = itemContent.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/)
    const linkMatch = itemContent.match(/<link>(.*?)<\/link>/)
    const pubDateMatch = itemContent.match(/<pubDate>(.*?)<\/pubDate>/)
    const descMatch = itemContent.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/)
    const sourceMatch = itemContent.match(/<source[^>]*>(.*?)<\/source>/)
    
    const title = titleMatch ? (titleMatch[1] || titleMatch[2] || '') : ''
    const link = linkMatch ? linkMatch[1] : ''
    const pubDate = pubDateMatch ? pubDateMatch[1] : ''
    const description = descMatch ? (descMatch[1] || descMatch[2] || '') : ''
    const source = sourceMatch ? sourceMatch[1] : undefined
    
    if (title && link) {
      items.push({ title, link, pubDate, description, source })
    }
  }
  
  return items
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '20')
    const symbol = searchParams.get('symbol')
    
    let allNews: NewsItem[] = []
    
    // Yahoo Finance RSS feeds
    const rssFeeds = symbol 
      ? [`https://feeds.finance.yahoo.com/rss/2.0/headline?s=${symbol}&region=US&lang=en-US`]
      : [
          'https://feeds.finance.yahoo.com/rss/2.0/headline?s=AAPL,MSFT,GOOGL,AMZN,NVDA,TSLA,META&region=US&lang=en-US',
          'https://feeds.finance.yahoo.com/rss/2.0/headline?s=SPY,QQQ,DIA&region=US&lang=en-US',
        ]
    
    const fetchPromises = rssFeeds.map(async (feedUrl) => {
      try {
        const response = await fetch(feedUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
          next: { revalidate: 300 },
        })
        
        if (!response.ok) {
          console.error(`RSS fetch failed: ${response.status}`)
          return []
        }
        
        const xml = await response.text()
        return parseRSSXml(xml)
      } catch (err) {
        console.error('RSS fetch error:', err)
        return []
      }
    })
    
    const results = await Promise.all(fetchPromises)
    const newsMap = new Map<string, NewsItem>()
    
    results.flat().forEach((item) => {
      if (!item.title) return
      
      const id = item.link || item.title.slice(0, 50)
      if (newsMap.has(id)) return
      
      const publishedDate = item.pubDate ? new Date(item.pubDate) : new Date()
      const headline = item.title
      const summary = item.description || item.title
      const extractedSymbol = symbol?.toUpperCase() || extractSymbolFromText(headline)
      
      newsMap.set(id, {
        id,
        headline,
        summary: summary.replace(/<[^>]*>/g, '').slice(0, 300),
        fullText: summary.replace(/<[^>]*>/g, ''),
        timeAgo: getTimeAgo(publishedDate),
        publishedDate: publishedDate.toISOString(),
        source: item.source || 'Yahoo Finance',
        sentiment: analyzeSentiment(headline + ' ' + summary),
        category: extractedSymbol ? 'Stock' : categorizeNews(headline),
        url: item.link,
        symbol: extractedSymbol,
        image: null,
      })
    })
    
    allNews = Array.from(newsMap.values())
      .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
      .slice(0, limit)

    // If no news from RSS, try Finnhub as backup
    if (allNews.length === 0) {
      try {
        const finnhubKey = process.env.FINNHUB_API_KEY
        if (finnhubKey) {
          const finnhubUrl = symbol 
            ? `https://finnhub.io/api/v1/company-news?symbol=${symbol}&from=${getDateString(-7)}&to=${getDateString(0)}&token=${finnhubKey}`
            : `https://finnhub.io/api/v1/news?category=general&token=${finnhubKey}`
          
          const response = await fetch(finnhubUrl)
          if (response.ok) {
            const data = await response.json()
            allNews = (data as any[]).slice(0, limit).map((item: any, index: number) => ({
              id: item.id?.toString() || `finnhub-${index}`,
              headline: item.headline || item.title || '',
              summary: item.summary || item.headline || '',
              fullText: item.summary || '',
              timeAgo: getTimeAgo(new Date(item.datetime * 1000)),
              publishedDate: new Date(item.datetime * 1000).toISOString(),
              source: item.source || 'Finnhub',
              sentiment: analyzeSentiment(item.headline || ''),
              category: item.category || 'Market',
              url: item.url || '#',
              symbol: item.related || symbol || null,
              image: item.image || null,
            }))
          }
        }
      } catch (err) {
        console.error('Finnhub backup failed:', err)
      }
    }

    return NextResponse.json({
      success: true,
      news: allNews,
      total: allNews.length,
      page: 0,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching news:', error)
    
    return NextResponse.json({
      success: false,
      news: [],
      error: 'Failed to fetch news',
      lastUpdated: new Date().toISOString(),
    }, { status: 500 })
  }
}

function getDateString(daysOffset: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  return date.toISOString().split('T')[0]
}
