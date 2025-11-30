import { NextResponse } from 'next/server'
import { getPolygonNews, isPolygonConfigured } from '@/lib/api/polygon'

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const maxDuration = 30

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

interface NewsAPIArticle {
  source: { id: string | null; name: string }
  author: string | null
  title: string
  description: string | null
  url: string
  urlToImage: string | null
  publishedAt: string
  content: string | null
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
    const limit = parseInt(searchParams.get('limit') || '50') // Increased default limit
    const symbol = searchParams.get('symbol')
    const source = searchParams.get('source') // 'yahoo', 'newsapi', 'all' (default)
    
    let allNews: NewsItem[] = []
    const newsMap = new Map<string, NewsItem>()
    
    const fetchYahooNews = async (): Promise<void> => {
      // Yahoo Finance RSS feeds - multiple feeds for more variety
      const rssFeeds = symbol 
        ? [`https://feeds.finance.yahoo.com/rss/2.0/headline?s=${symbol}&region=US&lang=en-US`]
        : [
            // Tech giants
            'https://feeds.finance.yahoo.com/rss/2.0/headline?s=AAPL,MSFT,GOOGL,AMZN,NVDA,TSLA,META&region=US&lang=en-US',
            // Major indices ETFs
            'https://feeds.finance.yahoo.com/rss/2.0/headline?s=SPY,QQQ,DIA,IWM&region=US&lang=en-US',
            // Finance sector
            'https://feeds.finance.yahoo.com/rss/2.0/headline?s=JPM,GS,MS,BAC,V,MA&region=US&lang=en-US',
            // More tech
            'https://feeds.finance.yahoo.com/rss/2.0/headline?s=AMD,INTC,CRM,ORCL,IBM,NFLX&region=US&lang=en-US',
            // Healthcare & Consumer
            'https://feeds.finance.yahoo.com/rss/2.0/headline?s=JNJ,PFE,UNH,WMT,HD,MCD&region=US&lang=en-US',
            // Energy & Industrial
            'https://feeds.finance.yahoo.com/rss/2.0/headline?s=XOM,CVX,BA,CAT,GE&region=US&lang=en-US',
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
      
      results.flat().forEach((item) => {
        if (!item.title) return
        
        const id = `yahoo-${item.link || item.title.slice(0, 50)}`
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
    }
    
    const fetchNewsAPI = async (): Promise<void> => {
      const newsApiKey = process.env.NEWS_API_KEY
      if (!newsApiKey) {
        console.log('NEWS_API_KEY not configured, skipping NewsAPI')
        return
      }
      
      try {
        // Build query based on symbol or general business news
        let apiUrl: string
        if (symbol) {
          // Get company name for better search (map common tickers)
          const companyNames: Record<string, string> = {
            'AAPL': 'Apple',
            'MSFT': 'Microsoft',
            'GOOGL': 'Google Alphabet',
            'GOOG': 'Google Alphabet',
            'AMZN': 'Amazon',
            'NVDA': 'Nvidia',
            'TSLA': 'Tesla',
            'META': 'Meta Facebook',
            'JPM': 'JPMorgan',
            'V': 'Visa',
            'MA': 'Mastercard',
            'NFLX': 'Netflix',
            'DIS': 'Disney',
            'AMD': 'AMD semiconductor',
            'INTC': 'Intel',
            'CRM': 'Salesforce',
            'ORCL': 'Oracle',
            'IBM': 'IBM',
            'BA': 'Boeing',
            'WMT': 'Walmart',
            'XOM': 'ExxonMobil',
            'CVX': 'Chevron',
            'PFE': 'Pfizer',
            'JNJ': 'Johnson Johnson',
            'UNH': 'UnitedHealth',
            'GS': 'Goldman Sachs',
            'MS': 'Morgan Stanley',
            'BAC': 'Bank of America',
            'COIN': 'Coinbase',
            'UBER': 'Uber',
            'ABNB': 'Airbnb',
            'PLTR': 'Palantir',
            'SNOW': 'Snowflake',
          }
          const searchQuery = companyNames[symbol.toUpperCase()] || symbol
          apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery + ' stock')}&language=en&sortBy=publishedAt&pageSize=20&apiKey=${newsApiKey}`
        } else {
          // General business/finance news - increased pageSize
          apiUrl = `https://newsapi.org/v2/top-headlines?category=business&language=en&country=us&pageSize=50&apiKey=${newsApiKey}`
        }
        
        const response = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'DeepTerminal/1.0',
          },
          next: { revalidate: 300 },
        })
        
        if (!response.ok) {
          console.error(`NewsAPI fetch failed: ${response.status}`)
          return
        }
        
        const data = await response.json()
        
        if (data.status !== 'ok' || !data.articles) {
          console.error('NewsAPI error:', data.message)
          return
        }
        
        (data.articles as NewsAPIArticle[]).forEach((article, index) => {
          if (!article.title || article.title === '[Removed]') return
          
          const id = `newsapi-${article.url || index}`
          if (newsMap.has(id)) return
          
          const publishedDate = new Date(article.publishedAt)
          const headline = article.title
          const summary = article.description || article.title
          const extractedSymbol = symbol?.toUpperCase() || extractSymbolFromText(headline + ' ' + summary)
          
          newsMap.set(id, {
            id,
            headline,
            summary: summary.slice(0, 300),
            fullText: article.content || summary,
            timeAgo: getTimeAgo(publishedDate),
            publishedDate: publishedDate.toISOString(),
            source: article.source?.name || 'NewsAPI',
            sentiment: analyzeSentiment(headline + ' ' + summary),
            category: extractedSymbol ? 'Stock' : categorizeNews(headline),
            url: article.url,
            symbol: extractedSymbol,
            image: article.urlToImage,
          })
        })
        
        console.log(`📰 NewsAPI: Fetched ${data.articles.length} articles`)
      } catch (err) {
        console.error('NewsAPI fetch error:', err)
      }
    }
    
    // Fetch from both sources based on query param
    const shouldFetchYahoo = !source || source === 'yahoo' || source === 'all'
    const shouldFetchNewsAPI = !source || source === 'newsapi' || source === 'all'
    
    await Promise.all([
      shouldFetchYahoo ? fetchYahooNews() : Promise.resolve(),
      shouldFetchNewsAPI ? fetchNewsAPI() : Promise.resolve(),
    ])
    
    allNews = Array.from(newsMap.values())
      .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
    
    // Balance sources - don't let one source dominate
    // If both sources have news, ensure diversity
    const yahooNews = allNews.filter(n => n.source === 'Yahoo Finance')
    const otherNews = allNews.filter(n => n.source !== 'Yahoo Finance')
    
    let balancedNews: NewsItem[] = []
    if (yahooNews.length > 0 && otherNews.length > 0) {
      // Interleave sources for better variety, with slight preference for recency
      const maxPerSource = Math.ceil(limit / 2)
      const limitedYahoo = yahooNews.slice(0, maxPerSource)
      const limitedOther = otherNews.slice(0, maxPerSource)
      
      // Merge and sort by date
      balancedNews = [...limitedYahoo, ...limitedOther]
        .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
        .slice(0, limit)
    } else {
      // If only one source, just use it
      balancedNews = allNews.slice(0, limit)
    }
    
    allNews = balancedNews

    // If no news, try Finnhub as backup
    if (allNews.length === 0) {
      console.log('📰 No news from primary sources, trying Finnhub...')
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
              id: `finnhub-${item.id?.toString() || index}`,
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
    
    // Final fallback: Generate sample news if still empty
    if (allNews.length === 0) {
      console.log('📰 No news available, trying Polygon.io...')
      
      // Try Polygon.io as another backup
      if (isPolygonConfigured()) {
        try {
          const polygonResult = await getPolygonNews(symbol || undefined, limit)
          if (polygonResult.success && polygonResult.data && polygonResult.data.length > 0) {
            allNews = polygonResult.data.map((article, index) => ({
              id: `polygon-${article.id || index}`,
              headline: article.title,
              summary: article.description || article.title,
              fullText: article.description || article.title,
              timeAgo: getTimeAgo(new Date(article.published_utc)),
              publishedDate: article.published_utc,
              source: article.publisher.name || 'Polygon',
              sentiment: analyzeSentiment(article.title + ' ' + (article.description || '')),
              category: article.tickers.length > 0 ? 'Stock' : categorizeNews(article.title),
              url: article.article_url,
              symbol: article.tickers[0] || symbol || null,
              image: article.image_url || null,
            }))
            console.log(`📰 Polygon.io: Fetched ${allNews.length} articles`)
          }
        } catch (err) {
          console.error('Polygon news failed:', err)
        }
      }
    }
    
    // Ultimate fallback: Generate sample news if still empty
    if (allNews.length === 0) {
      console.log('📰 No news available, generating sample news...')
      allNews = generateSampleNews(limit)
    }
    
    // Count sources
    const sourceBreakdown = {
      yahoo: Array.from(newsMap.values()).filter(n => n.source === 'Yahoo Finance').length,
      newsapi: Array.from(newsMap.values()).filter(n => n.source !== 'Yahoo Finance' && n.source !== 'Finnhub').length,
      finnhub: Array.from(newsMap.values()).filter(n => n.source === 'Finnhub').length,
    }

    console.log('📰 News API response:', { 
      total: allNews.length, 
      sources: sourceBreakdown,
      sampleSentiments: allNews.slice(0, 5).map(n => n.sentiment)
    })

    return NextResponse.json({
      success: true,
      news: allNews,
      total: allNews.length,
      sources: sourceBreakdown,
      page: 0,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching news:', error)
    
    // Return sample news on error
    const sampleNews = generateSampleNews(20)
    return NextResponse.json({
      success: true,
      news: sampleNews,
      total: sampleNews.length,
      sources: { sample: sampleNews.length },
      page: 0,
      lastUpdated: new Date().toISOString(),
      fallback: true,
    })
  }
}

// Generate sample news when external APIs fail
function generateSampleNews(count: number): NewsItem[] {
  const sampleHeadlines = [
    { headline: 'S&P 500 Reaches New All-Time High Amid Strong Tech Rally', sentiment: 'bullish' as const, category: 'Market' },
    { headline: 'Federal Reserve Signals Potential Rate Cut in Coming Months', sentiment: 'bullish' as const, category: 'Macro' },
    { headline: 'NVIDIA Reports Record Revenue, Beats Analyst Expectations', sentiment: 'bullish' as const, category: 'Earnings' },
    { headline: 'Apple Announces Major AI Integration Across Product Line', sentiment: 'bullish' as const, category: 'Stock' },
    { headline: 'Tesla Deliveries Exceed Estimates, Stock Surges', sentiment: 'bullish' as const, category: 'Stock' },
    { headline: 'Microsoft Cloud Revenue Grows 30% Year-Over-Year', sentiment: 'bullish' as const, category: 'Earnings' },
    { headline: 'Amazon Web Services Expands AI Infrastructure', sentiment: 'bullish' as const, category: 'Stock' },
    { headline: 'Global Markets Mixed as Investors Await Economic Data', sentiment: 'neutral' as const, category: 'Global' },
    { headline: 'Oil Prices Stabilize After Recent Volatility', sentiment: 'neutral' as const, category: 'Macro' },
    { headline: 'Treasury Yields Hold Steady Ahead of Fed Meeting', sentiment: 'neutral' as const, category: 'Macro' },
    { headline: 'Semiconductor Stocks Lead Market Higher', sentiment: 'bullish' as const, category: 'Market' },
    { headline: 'Banking Sector Shows Resilience Amid Rate Uncertainty', sentiment: 'neutral' as const, category: 'Market' },
    { headline: 'Consumer Confidence Index Rises to Six-Month High', sentiment: 'bullish' as const, category: 'Macro' },
    { headline: 'Healthcare Stocks Underperform Broader Market', sentiment: 'bearish' as const, category: 'Market' },
    { headline: 'Tech Giants Face Regulatory Scrutiny in Europe', sentiment: 'bearish' as const, category: 'Global' },
    { headline: 'Retail Sales Data Points to Steady Consumer Spending', sentiment: 'bullish' as const, category: 'Macro' },
    { headline: 'Bond Market Signals Cautious Outlook on Growth', sentiment: 'bearish' as const, category: 'Macro' },
    { headline: 'Small-Cap Stocks Rally on Improved Risk Sentiment', sentiment: 'bullish' as const, category: 'Market' },
    { headline: 'Energy Sector Faces Headwinds from Lower Oil Prices', sentiment: 'bearish' as const, category: 'Market' },
    { headline: 'Cryptocurrency Markets Show Renewed Momentum', sentiment: 'bullish' as const, category: 'Market' },
  ]
  
  const now = new Date()
  return sampleHeadlines.slice(0, count).map((item, index) => {
    const minutesAgo = index * 15 + Math.floor(Math.random() * 10)
    const publishedDate = new Date(now.getTime() - minutesAgo * 60000)
    
    return {
      id: `sample-${index}`,
      headline: item.headline,
      summary: item.headline + ' Market participants are closely monitoring developments as trading continues.',
      fullText: item.headline,
      timeAgo: `${minutesAgo}m ago`,
      publishedDate: publishedDate.toISOString(),
      source: 'Market Update',
      sentiment: item.sentiment,
      category: item.category,
      url: '#',
      symbol: null,
      image: null,
    }
  })
}

function getDateString(daysOffset: number): string {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  return date.toISOString().split('T')[0]
}
