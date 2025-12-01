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

interface FMPNewsArticle {
  symbol: string
  publishedDate: string
  title: string
  image: string | null
  site: string
  publisher: string  // New API response field
  text: string
  url: string
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '50')
    const symbol = searchParams.get('symbol')
    const source = searchParams.get('source') // 'fmp', 'newsapi', 'all' (default)
    
    let allNews: NewsItem[] = []
    const newsMap = new Map<string, NewsItem>()
    
    // FMP - Primary source (best quality, 50+ articles)
    const fetchFMPNews = async (): Promise<void> => {
      const fmpApiKey = process.env.FMP_API_KEY
      if (!fmpApiKey) {
        console.log('FMP_API_KEY not configured, skipping FMP')
        return
      }
      
      try {
        // FMP NEW stable endpoints (updated Dec 2025)
        let apiUrl: string
        if (symbol) {
          apiUrl = `https://financialmodelingprep.com/stable/news/stock?symbol=${symbol}&limit=50&apikey=${fmpApiKey}`
        } else {
          // General stock news - get 100 to ensure variety
          apiUrl = `https://financialmodelingprep.com/stable/news/stock?limit=100&apikey=${fmpApiKey}`
        }
        
        const response = await fetch(apiUrl, {
          headers: {
            'User-Agent': 'DeepTerminal/1.0',
          },
          next: { revalidate: 300 },
        })
        
        if (!response.ok) {
          console.error(`FMP fetch failed: ${response.status}`)
          return
        }
        
        const data = await response.json() as FMPNewsArticle[]
        
        if (!Array.isArray(data)) {
          console.error('FMP error: Invalid response format')
          return
        }
        
        data.forEach((article, index) => {
          if (!article.title) return
          
          const idSource = article.url || `${article.title}-${index}`
          const simpleHash = Buffer.from(idSource).toString('base64')
            .replace(/[+/=]/g, '')
            .slice(0, 12)
          const id = `news-${simpleHash}`
          
          if (newsMap.has(id)) return
          
          const publishedDate = new Date(article.publishedDate)
          const headline = article.title
          const summary = article.text || article.title
          
          newsMap.set(id, {
            id,
            headline,
            summary: summary.slice(0, 300),
            fullText: article.text || summary,
            timeAgo: getTimeAgo(publishedDate),
            publishedDate: publishedDate.toISOString(),
            source: article.publisher || article.site || 'FMP',
            sentiment: analyzeSentiment(headline + ' ' + summary),
            category: article.symbol ? 'Stock' : categorizeNews(headline),
            url: article.url,
            symbol: article.symbol || symbol?.toUpperCase() || null,
            image: article.image,
          })
        })
        
        console.log(`📰 FMP: Fetched ${data.length} articles`)
      } catch (err) {
        console.error('FMP fetch error:', err)
      }
    }
    
    const fetchNewsAPI = async (): Promise<void> => {
      const newsApiKey = process.env.NEWS_API_KEY
      if (!newsApiKey) {
        console.log('NEWS_API_KEY not configured, skipping NewsAPI')
        return
      }
      
      try {
        let apiUrl: string
        if (symbol) {
          // Get company name for better search
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
          apiUrl = `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery + ' stock')}&language=en&sortBy=publishedAt&pageSize=30&apiKey=${newsApiKey}`
        } else {
          // General business/finance news - use everything endpoint for more results
          const fromDate = new Date()
          fromDate.setDate(fromDate.getDate() - 7) // Last 7 days
          const fromDateStr = fromDate.toISOString().split('T')[0]
          
          apiUrl = `https://newsapi.org/v2/everything?q=stock market OR earnings OR nasdaq OR S%26P 500 OR dow jones OR federal reserve&language=en&sortBy=publishedAt&from=${fromDateStr}&pageSize=50&apiKey=${newsApiKey}`
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
          
          const idSource = article.url || `${article.title}-${index}`
          const simpleHash = Buffer.from(idSource).toString('base64')
            .replace(/[+/=]/g, '')
            .slice(0, 12)
          const id = `news-${simpleHash}`
          
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
    
    // Fetch from sources based on query param
    const shouldFetchFMP = !source || source === 'fmp' || source === 'all'
    const shouldFetchNewsAPI = !source || source === 'newsapi' || source === 'all'
    
    await Promise.all([
      shouldFetchFMP ? fetchFMPNews() : Promise.resolve(),
      shouldFetchNewsAPI ? fetchNewsAPI() : Promise.resolve(),
    ])
    
    allNews = Array.from(newsMap.values())
      .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
    
    // Balance sources - ensure diversity
    const fmpNews = allNews.filter(n => n.source !== 'NewsAPI' && !['CNN', 'BBC', 'Reuters'].includes(n.source))
    const newsApiNews = allNews.filter(n => n.source === 'NewsAPI' || ['CNN', 'BBC', 'Reuters', 'Bloomberg', 'CNBC'].some(s => n.source.includes(s)))
    
    let balancedNews: NewsItem[] = []
    if (fmpNews.length > 0 && newsApiNews.length > 0) {
      // FMP gets 60%, NewsAPI gets 40% for better stock news coverage
      const fmpLimit = Math.ceil(limit * 0.6)
      const newsApiLimit = Math.ceil(limit * 0.4)
      const limitedFMP = fmpNews.slice(0, fmpLimit)
      const limitedNewsAPI = newsApiNews.slice(0, newsApiLimit)
      
      balancedNews = [...limitedFMP, ...limitedNewsAPI]
        .sort((a, b) => new Date(b.publishedDate).getTime() - new Date(a.publishedDate).getTime())
        .slice(0, limit)
    } else {
      balancedNews = allNews.slice(0, limit)
    }
    
    allNews = balancedNews

    // If no news, try Polygon as backup
    if (allNews.length === 0 && isPolygonConfigured()) {
      console.log('📰 No news from primary sources, trying Polygon.io...')
      try {
        const polygonResult = await getPolygonNews(symbol || undefined, limit)
        if (polygonResult.success && polygonResult.data && polygonResult.data.length > 0) {
          allNews = polygonResult.data.map((article, index) => {
            const idSource = article.id || `${article.title}-${index}`
            const simpleHash = Buffer.from(idSource).toString('base64')
              .replace(/[+/=]/g, '')
              .slice(0, 12)
            return {
              id: `news-${simpleHash}`,
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
            }
          })
          console.log(`📰 Polygon.io: Fetched ${allNews.length} articles`)
        }
      } catch (err) {
        console.error('Polygon news failed:', err)
      }
    }
    
    // Ultimate fallback: Generate sample news if still empty
    if (allNews.length === 0) {
      console.log('📰 No news available, generating sample news...')
      allNews = generateSampleNews(limit)
    }
    
    // Count sources
    const sourceBreakdown = {
      fmp: Array.from(newsMap.values()).filter(n => !['CNN', 'BBC', 'Reuters', 'Bloomberg', 'CNBC'].some(s => n.source.includes(s))).length,
      newsapi: Array.from(newsMap.values()).filter(n => ['CNN', 'BBC', 'Reuters', 'Bloomberg', 'CNBC'].some(s => n.source.includes(s)) || n.source === 'NewsAPI').length,
      polygon: allNews.filter(n => n.source === 'Polygon').length,
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
