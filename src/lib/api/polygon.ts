/**
 * Polygon.io API Client
 * 
 * Free tier: 5 API calls/minute, 15-min delayed quotes, 2 years historical data
 * Used as backup when Yahoo Finance fails
 */

const POLYGON_BASE_URL = 'https://api.polygon.io'

interface PolygonQuote {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  open: number
  high: number
  low: number
  close: number
  volume: number
  previousClose: number
  timestamp: number
}

interface PolygonAggregateBar {
  o: number  // open
  h: number  // high
  l: number  // low
  c: number  // close
  v: number  // volume
  t: number  // timestamp
  n: number  // number of transactions
}

interface PolygonTickerDetails {
  ticker: string
  name: string
  market: string
  locale: string
  primary_exchange: string
  type: string
  currency_name: string
  market_cap?: number
  description?: string
  sic_description?: string
  total_employees?: number
  list_date?: string
  homepage_url?: string
  branding?: {
    logo_url?: string
    icon_url?: string
  }
}

interface PolygonNewsArticle {
  id: string
  publisher: {
    name: string
    homepage_url: string
    logo_url?: string
  }
  title: string
  author?: string
  published_utc: string
  article_url: string
  tickers: string[]
  description?: string
  keywords?: string[]
  image_url?: string
}

// Check if API key is configured
function getApiKey(): string | null {
  return process.env.POLYGON_API_KEY || null
}

// Rate limiting - track last call time
let lastCallTime = 0
const MIN_CALL_INTERVAL = 12000 // 12 seconds between calls (5 calls/min = 12s interval)

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now()
  const timeSinceLastCall = now - lastCallTime
  
  if (timeSinceLastCall < MIN_CALL_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_CALL_INTERVAL - timeSinceLastCall))
  }
  
  lastCallTime = Date.now()
  return fetch(url)
}

/**
 * Get stock quote from Polygon (15-min delayed on free tier)
 */
export async function getPolygonQuote(symbol: string): Promise<{ success: boolean; data?: PolygonQuote; error?: string }> {
  const apiKey = getApiKey()
  if (!apiKey) {
    return { success: false, error: 'POLYGON_API_KEY not configured' }
  }

  try {
    // Get previous day's data
    const url = `${POLYGON_BASE_URL}/v2/aggs/ticker/${symbol.toUpperCase()}/prev?apiKey=${apiKey}`
    const response = await rateLimitedFetch(url)
    
    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.results || data.results.length === 0) {
      return { success: false, error: 'No data available' }
    }
    
    const result = data.results[0]
    const previousClose = result.c // Using previous close as reference
    
    // Get ticker details for name
    const detailsUrl = `${POLYGON_BASE_URL}/v3/reference/tickers/${symbol.toUpperCase()}?apiKey=${apiKey}`
    const detailsResponse = await rateLimitedFetch(detailsUrl)
    let name = symbol
    
    if (detailsResponse.ok) {
      const detailsData = await detailsResponse.json()
      if (detailsData.results?.name) {
        name = detailsData.results.name
      }
    }
    
    return {
      success: true,
      data: {
        symbol: symbol.toUpperCase(),
        name,
        price: result.c,
        change: result.c - result.o,
        changePercent: ((result.c - result.o) / result.o) * 100,
        open: result.o,
        high: result.h,
        low: result.l,
        close: result.c,
        volume: result.v,
        previousClose,
        timestamp: result.t,
      }
    }
  } catch (error) {
    console.error('Polygon quote error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Get historical aggregates (candles) from Polygon
 */
export async function getPolygonHistorical(
  symbol: string,
  timespan: 'day' | 'week' | 'month' = 'day',
  from: string, // YYYY-MM-DD
  to: string,   // YYYY-MM-DD
): Promise<{ success: boolean; data?: PolygonAggregateBar[]; error?: string }> {
  const apiKey = getApiKey()
  if (!apiKey) {
    return { success: false, error: 'POLYGON_API_KEY not configured' }
  }

  try {
    const url = `${POLYGON_BASE_URL}/v2/aggs/ticker/${symbol.toUpperCase()}/range/1/${timespan}/${from}/${to}?apiKey=${apiKey}&sort=asc`
    const response = await rateLimitedFetch(url)
    
    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.results) {
      return { success: false, error: 'No historical data available' }
    }
    
    return {
      success: true,
      data: data.results,
    }
  } catch (error) {
    console.error('Polygon historical error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Get ticker details from Polygon
 */
export async function getPolygonTickerDetails(symbol: string): Promise<{ success: boolean; data?: PolygonTickerDetails; error?: string }> {
  const apiKey = getApiKey()
  if (!apiKey) {
    return { success: false, error: 'POLYGON_API_KEY not configured' }
  }

  try {
    const url = `${POLYGON_BASE_URL}/v3/reference/tickers/${symbol.toUpperCase()}?apiKey=${apiKey}`
    const response = await rateLimitedFetch(url)
    
    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    if (!data.results) {
      return { success: false, error: 'Ticker not found' }
    }
    
    return {
      success: true,
      data: data.results,
    }
  } catch (error) {
    console.error('Polygon ticker details error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Get news from Polygon (1000 articles/month on free tier)
 */
export async function getPolygonNews(
  symbol?: string,
  limit: number = 10
): Promise<{ success: boolean; data?: PolygonNewsArticle[]; error?: string }> {
  const apiKey = getApiKey()
  if (!apiKey) {
    return { success: false, error: 'POLYGON_API_KEY not configured' }
  }

  try {
    let url = `${POLYGON_BASE_URL}/v2/reference/news?limit=${limit}&apiKey=${apiKey}`
    if (symbol) {
      url += `&ticker=${symbol.toUpperCase()}`
    }
    
    const response = await rateLimitedFetch(url)
    
    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    return {
      success: true,
      data: data.results || [],
    }
  } catch (error) {
    console.error('Polygon news error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Search tickers from Polygon
 */
export async function searchPolygonTickers(
  query: string,
  limit: number = 10
): Promise<{ success: boolean; data?: Array<{ ticker: string; name: string; market: string; type: string }>; error?: string }> {
  const apiKey = getApiKey()
  if (!apiKey) {
    return { success: false, error: 'POLYGON_API_KEY not configured' }
  }

  try {
    const url = `${POLYGON_BASE_URL}/v3/reference/tickers?search=${encodeURIComponent(query)}&active=true&limit=${limit}&apiKey=${apiKey}`
    const response = await rateLimitedFetch(url)
    
    if (!response.ok) {
      throw new Error(`Polygon API error: ${response.status}`)
    }
    
    const data = await response.json()
    
    return {
      success: true,
      data: data.results?.map((r: any) => ({
        ticker: r.ticker,
        name: r.name,
        market: r.market,
        type: r.type,
      })) || [],
    }
  } catch (error) {
    console.error('Polygon search error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Get market indices snapshot (S&P 500, etc.)
 */
export async function getPolygonIndices(): Promise<{ success: boolean; data?: any[]; error?: string }> {
  const apiKey = getApiKey()
  if (!apiKey) {
    return { success: false, error: 'POLYGON_API_KEY not configured' }
  }

  // ETFs that track major indices
  const indexETFs = ['SPY', 'QQQ', 'DIA', 'IWM']
  
  try {
    const results = await Promise.all(
      indexETFs.map(async (symbol) => {
        const quote = await getPolygonQuote(symbol)
        if (quote.success && quote.data) {
          return {
            symbol,
            name: symbol === 'SPY' ? 'S&P 500' :
                  symbol === 'QQQ' ? 'NASDAQ 100' :
                  symbol === 'DIA' ? 'Dow Jones' :
                  symbol === 'IWM' ? 'Russell 2000' : symbol,
            price: quote.data.price,
            change: quote.data.change,
            changePercent: quote.data.changePercent,
          }
        }
        return null
      })
    )
    
    return {
      success: true,
      data: results.filter(r => r !== null),
    }
  } catch (error) {
    console.error('Polygon indices error:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
}

/**
 * Check if Polygon API is available and configured
 */
export function isPolygonConfigured(): boolean {
  return !!getApiKey()
}
