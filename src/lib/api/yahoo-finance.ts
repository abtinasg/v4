import YahooFinance from 'yahoo-finance2'
import type {
  StockQuote,
  HistoricalData,
  HistoricalDataPoint,
  StockProfile,
  StockSearchResult,
  MarketIndex,
  KeyStatistics,
  ApiResponse,
} from '@/lib/types/stock'

// Initialize Yahoo Finance v3
const yahooFinance = new YahooFinance()

// Cache implementation
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

class SimpleCache {
  private cache: Map<string, CacheEntry<unknown>> = new Map()

  set<T>(key: string, data: T, ttlMs: number): void {
    const now = Date.now()
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + ttlMs,
    })
  }

  get<T>(key: string): { data: T; cached: boolean } | null {
    const entry = this.cache.get(key)
    if (!entry) return null

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key)
      return null
    }

    return { data: entry.data as T, cached: true }
  }

  clear(): void {
    this.cache.clear()
  }

  clearByPrefix(prefix: string): void {
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key)
      }
    }
  }
}

// Cache instances with different TTLs
const quoteCache = new SimpleCache() // 5 minutes for quotes
const historicalCache = new SimpleCache() // 1 hour for historical
const profileCache = new SimpleCache() // 24 hours for profiles
const searchCache = new SimpleCache() // 15 minutes for search

// Cache TTLs in milliseconds
const CACHE_TTL = {
  QUOTE: 5 * 60 * 1000, // 5 minutes
  HISTORICAL: 60 * 60 * 1000, // 1 hour
  PROFILE: 24 * 60 * 60 * 1000, // 24 hours
  SEARCH: 15 * 60 * 1000, // 15 minutes
  INDEX: 1 * 60 * 1000, // 1 minute for indices
}

// Rate limiter
class RateLimiter {
  private requests: number[] = []
  private readonly maxRequests: number
  private readonly windowMs: number

  constructor(maxRequests: number = 100, windowMs: number = 60000) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }

  canMakeRequest(): boolean {
    const now = Date.now()
    this.requests = this.requests.filter((time) => now - time < this.windowMs)
    return this.requests.length < this.maxRequests
  }

  recordRequest(): void {
    this.requests.push(Date.now())
  }

  async waitForSlot(): Promise<void> {
    while (!this.canMakeRequest()) {
      await new Promise((resolve) => setTimeout(resolve, 100))
    }
    this.recordRequest()
  }
}

const rateLimiter = new RateLimiter(100, 60000) // 100 requests per minute

/**
 * Get real-time stock quote
 */
export async function getStockQuote(symbol: string): Promise<ApiResponse<StockQuote>> {
  try {
    const cacheKey = `quote:${symbol.toUpperCase()}`
    const cached = quoteCache.get<StockQuote>(cacheKey)
    
    if (cached) {
      return {
        success: true,
        data: cached.data,
        cached: true,
        timestamp: Date.now(),
      }
    }

    await rateLimiter.waitForSlot()

    const quote = await yahooFinance.quote(symbol)
    
    if (!quote) {
      return {
        success: false,
        error: `No data found for symbol: ${symbol}`,
        timestamp: Date.now(),
      }
    }

    const stockQuote: StockQuote = {
      symbol: quote.symbol,
      shortName: quote.shortName || quote.symbol,
      longName: quote.longName || quote.shortName || quote.symbol,
      price: quote.regularMarketPrice || 0,
      previousClose: quote.regularMarketPreviousClose || 0,
      open: quote.regularMarketOpen || 0,
      dayHigh: quote.regularMarketDayHigh || 0,
      dayLow: quote.regularMarketDayLow || 0,
      change: quote.regularMarketChange || 0,
      changePercent: quote.regularMarketChangePercent || 0,
      volume: quote.regularMarketVolume || 0,
      avgVolume: quote.averageDailyVolume3Month || 0,
      marketCap: quote.marketCap || 0,
      peRatio: quote.trailingPE || null,
      eps: quote.epsTrailingTwelveMonths || null,
      dividend: quote.dividendRate || null,
      dividendYield: quote.dividendYield || null,
      fiftyTwoWeekHigh: quote.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: quote.fiftyTwoWeekLow || 0,
      exchange: quote.exchange || 'UNKNOWN',
      currency: quote.currency || 'USD',
      marketState: (quote.marketState as StockQuote['marketState']) || 'CLOSED',
      timestamp: Date.now(),
    }

    quoteCache.set(cacheKey, stockQuote, CACHE_TTL.QUOTE)

    return {
      success: true,
      data: stockQuote,
      cached: false,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error(`Error fetching quote for ${symbol}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stock quote',
      timestamp: Date.now(),
    }
  }
}

/**
 * Get historical stock data (OHLCV)
 */
export async function getHistoricalData(
  symbol: string,
  options: {
    period1?: Date | string
    period2?: Date | string
    interval?: '1d' | '1wk' | '1mo' | '1h' | '5m' | '15m' | '30m'
    range?: '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | 'max'
  } = {}
): Promise<ApiResponse<HistoricalData>> {
  try {
    const { interval = '1d', range = '1mo' } = options
    const cacheKey = `historical:${symbol.toUpperCase()}:${interval}:${range}`
    const cached = historicalCache.get<HistoricalData>(cacheKey)
    
    if (cached) {
      return {
        success: true,
        data: cached.data,
        cached: true,
        timestamp: Date.now(),
      }
    }

    await rateLimiter.waitForSlot()

    // Calculate period1 and period2 based on range
    const period2 = options.period2 ? new Date(options.period2) : new Date()
    let period1: Date

    if (options.period1) {
      period1 = new Date(options.period1)
    } else {
      period1 = new Date()
      switch (range) {
        case '1d':
          period1.setDate(period1.getDate() - 1)
          break
        case '5d':
          period1.setDate(period1.getDate() - 5)
          break
        case '1mo':
          period1.setMonth(period1.getMonth() - 1)
          break
        case '3mo':
          period1.setMonth(period1.getMonth() - 3)
          break
        case '6mo':
          period1.setMonth(period1.getMonth() - 6)
          break
        case '1y':
          period1.setFullYear(period1.getFullYear() - 1)
          break
        case '2y':
          period1.setFullYear(period1.getFullYear() - 2)
          break
        case '5y':
          period1.setFullYear(period1.getFullYear() - 5)
          break
        case 'max':
          period1.setFullYear(1970)
          break
      }
    }

    // Map interval to supported values for yahoo-finance2 v3
    const supportedInterval = ['5m', '15m', '30m', '1h'].includes(interval) ? '1d' : interval
    
    const result = await yahooFinance.historical(symbol, {
      period1,
      period2,
      interval: supportedInterval as '1d' | '1wk' | '1mo',
    })

    if (!result || result.length === 0) {
      return {
        success: false,
        error: `No historical data found for symbol: ${symbol}`,
        timestamp: Date.now(),
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: HistoricalDataPoint[] = result.map((item: any) => ({
      date: item.date.toISOString().split('T')[0],
      open: item.open || 0,
      high: item.high || 0,
      low: item.low || 0,
      close: item.close || 0,
      volume: item.volume || 0,
      adjClose: item.adjClose || item.close || 0,
    }))

    const historicalData: HistoricalData = {
      symbol: symbol.toUpperCase(),
      data,
      interval,
      range,
    }

    historicalCache.set(cacheKey, historicalData, CACHE_TTL.HISTORICAL)

    return {
      success: true,
      data: historicalData,
      cached: false,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error(`Error fetching historical data for ${symbol}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch historical data',
      timestamp: Date.now(),
    }
  }
}

/**
 * Get stock profile/info
 */
export async function getStockProfile(symbol: string): Promise<ApiResponse<StockProfile>> {
  try {
    const cacheKey = `profile:${symbol.toUpperCase()}`
    const cached = profileCache.get<StockProfile>(cacheKey)
    
    if (cached) {
      return {
        success: true,
        data: cached.data,
        cached: true,
        timestamp: Date.now(),
      }
    }

    await rateLimiter.waitForSlot()

    const result = await yahooFinance.quoteSummary(symbol, {
      modules: ['assetProfile', 'summaryProfile', 'price'],
    })

    if (!result) {
      return {
        success: false,
        error: `No profile data found for symbol: ${symbol}`,
        timestamp: Date.now(),
      }
    }

    const profile = result.assetProfile || result.summaryProfile
    const price = result.price

    const stockProfile: StockProfile = {
      symbol: symbol.toUpperCase(),
      shortName: price?.shortName || symbol,
      longName: price?.longName || price?.shortName || symbol,
      sector: profile?.sector || 'Unknown',
      industry: profile?.industry || 'Unknown',
      website: profile?.website || '',
      description: profile?.longBusinessSummary || '',
      fullTimeEmployees: profile?.fullTimeEmployees || 0,
      country: profile?.country || 'Unknown',
      city: profile?.city || '',
      state: profile?.state || '',
      address: profile?.address1 || '',
      zip: profile?.zip || '',
      phone: profile?.phone || '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ceo: (profile?.companyOfficers?.[0] as any)?.name || null,
    }

    profileCache.set(cacheKey, stockProfile, CACHE_TTL.PROFILE)

    return {
      success: true,
      data: stockProfile,
      cached: false,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error(`Error fetching profile for ${symbol}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch stock profile',
      timestamp: Date.now(),
    }
  }
}

/**
 * Search stocks by symbol or name
 */
export async function searchStocks(
  query: string,
  options?: { limit?: number }
): Promise<ApiResponse<StockSearchResult[]>> {
  try {
    if (!query || query.length < 1) {
      return {
        success: false,
        error: 'Search query is required',
        timestamp: Date.now(),
      }
    }

    const limit = Math.min(Math.max(options?.limit ?? 25, 1), 50)

    const cacheKey = `search:${query.toLowerCase()}:${limit}`
    const cached = searchCache.get<StockSearchResult[]>(cacheKey)
    
    if (cached) {
      return {
        success: true,
        data: cached.data,
        cached: true,
        timestamp: Date.now(),
      }
    }

    await rateLimiter.waitForSlot()

    const results = await yahooFinance.search(query, {
      quotesCount: limit,
      newsCount: 0,
    })

    if (!results || !results.quotes || results.quotes.length === 0) {
      return {
        success: true,
        data: [],
        cached: false,
        timestamp: Date.now(),
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const searchResults: StockSearchResult[] = results.quotes
      .filter((item: any) => item.symbol && (item.quoteType === 'EQUITY' || item.quoteType === 'ETF'))
      .slice(0, limit)
      .map((item: any, index: number) => ({
        symbol: item.symbol as string,
        shortName: item.shortname || item.symbol,
        longName: item.longname || item.shortname || item.symbol,
        exchange: item.exchange || 'UNKNOWN',
        type: item.quoteType || 'EQUITY',
        score: 100 - index * 10, // Simple scoring based on result order
      }))

    searchCache.set(cacheKey, searchResults, CACHE_TTL.SEARCH)

    return {
      success: true,
      data: searchResults,
      cached: false,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error(`Error searching for ${query}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to search stocks',
      timestamp: Date.now(),
    }
  }
}

/**
 * Get major market indices
 */
export async function getMarketIndices(): Promise<ApiResponse<MarketIndex[]>> {
  try {
    const cacheKey = 'indices:major'
    const cached = quoteCache.get<MarketIndex[]>(cacheKey)
    
    if (cached) {
      return {
        success: true,
        data: cached.data,
        cached: true,
        timestamp: Date.now(),
      }
    }

    await rateLimiter.waitForSlot()

    const indexSymbols = [
      { symbol: '^GSPC', name: 'S&P 500' },
      { symbol: '^DJI', name: 'Dow Jones' },
      { symbol: '^IXIC', name: 'NASDAQ' },
      { symbol: '^RUT', name: 'Russell 2000' },
      { symbol: '^VIX', name: 'VIX' },
    ]

    const quotes = await Promise.all(
      indexSymbols.map(async ({ symbol, name }) => {
        try {
          const quote = await yahooFinance.quote(symbol)
          return {
            symbol,
            name,
            price: quote?.regularMarketPrice || 0,
            change: quote?.regularMarketChange || 0,
            changePercent: quote?.regularMarketChangePercent || 0,
            timestamp: Date.now(),
          }
        } catch {
          return {
            symbol,
            name,
            price: 0,
            change: 0,
            changePercent: 0,
            timestamp: Date.now(),
          }
        }
      })
    )

    quoteCache.set(cacheKey, quotes, CACHE_TTL.INDEX)

    return {
      success: true,
      data: quotes,
      cached: false,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error('Error fetching market indices:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch market indices',
      timestamp: Date.now(),
    }
  }
}

/**
 * Get multiple stock quotes at once
 */
export async function getMultipleQuotes(symbols: string[]): Promise<ApiResponse<StockQuote[]>> {
  try {
    if (!symbols || symbols.length === 0) {
      return {
        success: false,
        error: 'At least one symbol is required',
        timestamp: Date.now(),
      }
    }

    const results = await Promise.all(
      symbols.map(async (symbol) => {
        const result = await getStockQuote(symbol)
        return result.success ? result.data : null
      })
    )

    const validQuotes = results.filter((quote): quote is StockQuote => quote !== null)

    return {
      success: true,
      data: validQuotes,
      cached: false,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error('Error fetching multiple quotes:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch quotes',
      timestamp: Date.now(),
    }
  }
}

/**
 * Get key statistics for a stock
 */
export async function getKeyStatistics(symbol: string): Promise<ApiResponse<KeyStatistics>> {
  try {
    const cacheKey = `stats:${symbol.toUpperCase()}`
    const cached = profileCache.get<KeyStatistics>(cacheKey)
    
    if (cached) {
      return {
        success: true,
        data: cached.data,
        cached: true,
        timestamp: Date.now(),
      }
    }

    await rateLimiter.waitForSlot()

    const result = await yahooFinance.quoteSummary(symbol, {
      modules: ['defaultKeyStatistics', 'financialData', 'summaryDetail'],
    })

    if (!result) {
      return {
        success: false,
        error: `No statistics found for symbol: ${symbol}`,
        timestamp: Date.now(),
      }
    }

    const stats = result.defaultKeyStatistics
    const financial = result.financialData
    const summary = result.summaryDetail

    const keyStats: KeyStatistics = {
      marketCap: summary?.marketCap || 0,
      enterpriseValue: stats?.enterpriseValue || 0,
      trailingPE: summary?.trailingPE || null,
      forwardPE: summary?.forwardPE || null,
      pegRatio: stats?.pegRatio || null,
      priceToBook: stats?.priceToBook || null,
      priceToSales: summary?.priceToSalesTrailing12Months || null,
      profitMargin: financial?.profitMargins || null,
      operatingMargin: financial?.operatingMargins || null,
      returnOnAssets: financial?.returnOnAssets || null,
      returnOnEquity: financial?.returnOnEquity || null,
      revenuePerShare: financial?.revenuePerShare || null,
      quarterlyRevenueGrowth: financial?.revenueGrowth || null,
      grossProfit: financial?.grossProfits || null,
      ebitda: financial?.ebitda || null,
      debtToEquity: financial?.debtToEquity || null,
      currentRatio: financial?.currentRatio || null,
      bookValue: stats?.bookValue || null,
      beta: stats?.beta || null,
      fiftyDayAverage: summary?.fiftyDayAverage || null,
      twoHundredDayAverage: summary?.twoHundredDayAverage || null,
      sharesOutstanding: stats?.sharesOutstanding || null,
      sharesFloat: stats?.floatShares || null,
      percentHeldByInsiders: stats?.heldPercentInsiders || null,
      percentHeldByInstitutions: stats?.heldPercentInstitutions || null,
      shortRatio: stats?.shortRatio || null,
      shortPercentOfFloat: stats?.shortPercentOfFloat || null,
    }

    profileCache.set(cacheKey, keyStats, CACHE_TTL.HISTORICAL)

    return {
      success: true,
      data: keyStats,
      cached: false,
      timestamp: Date.now(),
    }
  } catch (error) {
    console.error(`Error fetching key statistics for ${symbol}:`, error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch key statistics',
      timestamp: Date.now(),
    }
  }
}

/**
 * Clear all caches
 */
export function clearAllCaches(): void {
  quoteCache.clear()
  historicalCache.clear()
  profileCache.clear()
  searchCache.clear()
}

/**
 * Clear cache for a specific symbol
 */
export function clearSymbolCache(symbol: string): void {
  const upperSymbol = symbol.toUpperCase()
  quoteCache.clearByPrefix(`quote:${upperSymbol}`)
  historicalCache.clearByPrefix(`historical:${upperSymbol}`)
  profileCache.clearByPrefix(`profile:${upperSymbol}`)
  profileCache.clearByPrefix(`stats:${upperSymbol}`)
}
