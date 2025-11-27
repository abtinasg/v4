import { NextResponse } from 'next/server'

const FMP_BASE_URL = 'https://financialmodelingprep.com/api/v3'

function getApiKey(): string {
  const apiKey = process.env.FMP_API_KEY
  if (!apiKey) {
    throw new Error('FMP_API_KEY environment variable is not set')
  }
  return apiKey
}

interface FMPNews {
  symbol: string
  publishedDate: string
  title: string
  image: string
  site: string
  text: string
  url: string
}

export async function GET() {
  try {
    const apiKey = getApiKey()
    // Get general stock news
    const url = `${FMP_BASE_URL}/stock_news?limit=10&apikey=${apiKey}`
    
    const response = await fetch(url, {
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!response.ok) {
      throw new Error(`FMP API error: ${response.status}`)
    }

    const data: FMPNews[] = await response.json()

    // Map to our format and take top 5
    const news = data.slice(0, 5).map((item) => {
      const publishedDate = new Date(item.publishedDate)
      const now = new Date()
      const diffMs = now.getTime() - publishedDate.getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)
      
      let timeAgo = ''
      if (diffDays > 0) {
        timeAgo = `${diffDays}d ago`
      } else if (diffHours > 0) {
        timeAgo = `${diffHours}h ago`
      } else {
        timeAgo = `${diffMins}m ago`
      }

      // Determine sentiment based on keywords (simple heuristic)
      const text = (item.title + ' ' + item.text).toLowerCase()
      let sentiment: 'bullish' | 'bearish' | 'neutral' = 'neutral'
      const bullishKeywords = ['surge', 'jump', 'soar', 'rally', 'gain', 'up', 'rise', 'beat', 'record', 'strong', 'growth', 'positive', 'bullish', 'buy']
      const bearishKeywords = ['fall', 'drop', 'plunge', 'decline', 'down', 'loss', 'miss', 'weak', 'negative', 'bearish', 'sell', 'crash', 'tumble', 'slump']
      
      const bullishCount = bullishKeywords.filter(kw => text.includes(kw)).length
      const bearishCount = bearishKeywords.filter(kw => text.includes(kw)).length
      
      if (bullishCount > bearishCount) sentiment = 'bullish'
      else if (bearishCount > bullishCount) sentiment = 'bearish'

      // Determine category
      let category = 'Market'
      if (item.symbol) category = 'Stock'
      if (text.includes('fed') || text.includes('rate') || text.includes('inflation') || text.includes('economic')) {
        category = 'Macro'
      }
      if (text.includes('earnings') || text.includes('revenue') || text.includes('profit')) {
        category = 'Earnings'
      }

      return {
        id: item.publishedDate + item.title.slice(0, 20),
        headline: item.title,
        summary: item.text.slice(0, 200) + (item.text.length > 200 ? '...' : ''),
        timeAgo,
        source: item.site,
        sentiment,
        category,
        url: item.url,
        symbol: item.symbol || null,
      }
    })

    return NextResponse.json({
      success: true,
      news,
      lastUpdated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Error fetching news:', error)
    
    // Return mock data on error
    return NextResponse.json({
      success: true,
      news: [
        {
          id: '1',
          headline: 'Fed Signals Potential Rate Cut in Early 2025',
          summary: 'Federal Reserve officials hint at possible interest rate reductions as inflation continues to cool toward target levels.',
          timeAgo: '32m ago',
          source: 'Bloomberg',
          sentiment: 'bullish',
          category: 'Macro',
          url: '#',
          symbol: null,
        },
        {
          id: '2',
          headline: 'NVIDIA Reports Record Q4 Revenue',
          summary: 'AI chip demand drives quarterly revenue to $35.1 billion, exceeding analyst expectations by 12%.',
          timeAgo: '1h ago',
          source: 'Reuters',
          sentiment: 'bullish',
          category: 'Earnings',
          url: '#',
          symbol: 'NVDA',
        },
        {
          id: '3',
          headline: 'European Markets Face Headwinds Amid Economic Uncertainty',
          summary: 'DAX and FTSE indices decline as geopolitical tensions and weak manufacturing data weigh on sentiment.',
          timeAgo: '2h ago',
          source: 'FT',
          sentiment: 'bearish',
          category: 'Global',
          url: '#',
          symbol: null,
        },
      ],
      lastUpdated: new Date().toISOString(),
      mock: true,
    })
  }
}

export const revalidate = 300 // 5 minutes
