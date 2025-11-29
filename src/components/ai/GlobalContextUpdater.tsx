/**
 * Global Context Updater
 * 
 * This component provides comprehensive system-wide data to the AI assistant.
 * It runs on ALL pages and provides:
 * - Market indices (S&P 500, Dow, NASDAQ, VIX, etc.)
 * - Economic indicators from FRED
 * - Top movers (gainers/losers)
 * - Sector performance
 * - User's watchlist data
 * - User's portfolio summary
 * - Recent market news
 * 
 * This ensures the AI always has access to full system data,
 * while page-specific context updaters add additional detailed context.
 */

'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useChatStore, type TerminalContext, type EconomicIndicatorsContext, type NewsContextItem } from '@/lib/stores/chat-store'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'

interface GlobalMarketData {
  indices?: {
    symbol: string
    name: string
    price: number
    change: number
    changePercent: number
  }[]
  sectors?: {
    name: string
    change: number
  }[]
  topGainers?: {
    symbol: string
    name: string
    price: number
    changePercent: number
  }[]
  topLosers?: {
    symbol: string
    name: string
    price: number
    changePercent: number
  }[]
  vix?: number
  treasuryYield10Y?: number
  marketStatus?: 'open' | 'closed' | 'pre-market' | 'after-hours'
}

interface WatchlistItem {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

interface UserRiskProfile {
  riskTolerance: 'conservative' | 'moderate' | 'aggressive'
  investmentHorizon: 'short_term' | 'medium_term' | 'long_term'
  investmentExperience: 'beginner' | 'intermediate' | 'advanced'
  riskScore: number
  preferredSectors?: string[]
  avoidSectors?: string[]
}

interface GlobalContextState {
  marketData: GlobalMarketData
  economicIndicators: EconomicIndicatorsContext
  watchlist: WatchlistItem[]
  recentNews: NewsContextItem[]
  userRiskProfile?: UserRiskProfile
  lastUpdated: number
}

interface GlobalContextUpdaterProps {
  /** Refresh interval in milliseconds (default: 60 seconds) */
  refreshInterval?: number
}

export function GlobalContextUpdater({ 
  refreshInterval = 60000 
}: GlobalContextUpdaterProps) {
  const setContext = useChatStore((s) => s.setContext)
  const currentContext = useChatStore((s) => s.context)
  const holdings = usePortfolioStore((s) => s.holdings)
  const summary = usePortfolioStore((s) => s.summary)
  
  const lastFetchRef = useRef<number>(0)
  const isFetchingRef = useRef(false)
  const globalDataRef = useRef<GlobalContextState | null>(null)

  const fetchGlobalData = useCallback(async (): Promise<GlobalContextState> => {
    const now = Date.now()
    
    // Prevent duplicate fetches
    if (isFetchingRef.current) {
      return globalDataRef.current || {
        marketData: {},
        economicIndicators: {},
        watchlist: [],
        recentNews: [],
        lastUpdated: 0,
      }
    }
    
    // Use cached data if recent (within 30 seconds)
    if (globalDataRef.current && now - lastFetchRef.current < 30000) {
      return globalDataRef.current
    }
    
    isFetchingRef.current = true
    
    try {
      // Fetch all global data in parallel
      const [
        indicesRes,
        sectorsRes,
        moversRes,
        economicRes,
        newsRes,
        watchlistRes,
        riskProfileRes,
      ] = await Promise.allSettled([
        fetch('/api/market/overview'),
        fetch('/api/market/sectors'),
        fetch('/api/market/movers'),
        fetch('/api/economic/indicators'),
        fetch('/api/market/news?limit=10'),
        fetch('/api/watchlists'),
        fetch('/api/onboarding/risk-profile'),
      ])

      const marketData: GlobalMarketData = {}
      let economicIndicators: EconomicIndicatorsContext = {}
      let watchlist: WatchlistItem[] = []
      let recentNews: NewsContextItem[] = []
      let userRiskProfile: UserRiskProfile | undefined = undefined

      // Parse market indices
      if (indicesRes.status === 'fulfilled' && indicesRes.value.ok) {
        try {
          const data = await indicesRes.value.json()
          if (data.indices) {
            marketData.indices = data.indices.map((idx: any) => ({
              symbol: idx.symbol,
              name: idx.name,
              price: idx.price,
              change: idx.change,
              changePercent: idx.changePercent,
            }))
            
            // Extract VIX from indices if available
            const vixIndex = data.indices.find((idx: any) => 
              idx.symbol === '^VIX' || idx.name?.includes('VIX')
            )
            if (vixIndex) {
              marketData.vix = vixIndex.price
            }
            
            // Extract Treasury yield if available
            const tltIndex = data.indices.find((idx: any) => 
              idx.symbol === 'TLT' || idx.name?.includes('Treasury')
            )
            if (tltIndex) {
              marketData.treasuryYield10Y = tltIndex.price
            }
          }
          if (data.marketStatus) {
            marketData.marketStatus = data.marketStatus
          }
        } catch (e) {
          console.error('Error parsing indices data:', e)
        }
      }

      // Parse sectors
      if (sectorsRes.status === 'fulfilled' && sectorsRes.value.ok) {
        try {
          const data = await sectorsRes.value.json()
          if (data.sectors) {
            marketData.sectors = data.sectors.slice(0, 11).map((s: any) => ({
              name: s.name,
              change: s.change,
            }))
          }
        } catch (e) {
          console.error('Error parsing sectors data:', e)
        }
      }

      // Parse movers
      if (moversRes.status === 'fulfilled' && moversRes.value.ok) {
        try {
          const data = await moversRes.value.json()
          if (data.gainers) {
            marketData.topGainers = data.gainers.slice(0, 5).map((g: any) => ({
              symbol: g.symbol,
              name: g.name,
              price: g.price,
              changePercent: g.changePercent,
            }))
          }
          if (data.losers) {
            marketData.topLosers = data.losers.slice(0, 5).map((l: any) => ({
              symbol: l.symbol,
              name: l.name,
              price: l.price,
              changePercent: l.changePercent,
            }))
          }
        } catch (e) {
          console.error('Error parsing movers data:', e)
        }
      }

      // Parse economic indicators
      if (economicRes.status === 'fulfilled' && economicRes.value.ok) {
        try {
          const data = await economicRes.value.json()
          economicIndicators = {
            gdp: data.gdp,
            unemployment: data.unemployment,
            inflation: data.inflation,
            federalFundsRate: data.federalFundsRate,
            consumerConfidence: data.consumerConfidence,
            manufacturingPmi: data.manufacturingPmi,
            servicesPmi: data.servicesPmi,
          }
        } catch (e) {
          console.error('Error parsing economic data:', e)
        }
      }

      // Parse news
      if (newsRes.status === 'fulfilled' && newsRes.value.ok) {
        try {
          const data = await newsRes.value.json()
          if (data.news) {
            recentNews = data.news.slice(0, 10).map((n: any) => ({
              headline: n.headline,
              summary: n.summary || '',
              category: n.category || 'General',
              sentiment: n.sentiment || 'neutral',
              source: n.source || 'Unknown',
              timeAgo: n.timeAgo || 'recently',
              symbol: n.symbol || undefined,
            }))
          }
        } catch (e) {
          console.error('Error parsing news data:', e)
        }
      }

      // Parse watchlist
      if (watchlistRes.status === 'fulfilled' && watchlistRes.value.ok) {
        try {
          const data = await watchlistRes.value.json()
          if (data.watchlists && Array.isArray(data.watchlists)) {
            // Flatten all watchlist symbols
            const allSymbols = new Set<string>()
            data.watchlists.forEach((wl: any) => {
              if (wl.symbols && Array.isArray(wl.symbols)) {
                wl.symbols.forEach((s: string) => allSymbols.add(s))
              }
            })
            
            // Fetch quotes for watchlist symbols (max 10)
            const symbolsToFetch = Array.from(allSymbols).slice(0, 10)
            if (symbolsToFetch.length > 0) {
              const quotePromises = symbolsToFetch.map(async (symbol) => {
                try {
                  const res = await fetch(`/api/stocks/quote/${symbol}`)
                  if (res.ok) {
                    const quoteData = await res.json()
                    const quote = quoteData?.data?.quote || quoteData?.quote
                    if (quote) {
                      return {
                        symbol,
                        name: quote.longName || quote.shortName || symbol,
                        price: quote.price || 0,
                        change: quote.change || 0,
                        changePercent: quote.changePercent || 0,
                      }
                    }
                  }
                  return null
                } catch {
                  return null
                }
              })
              
              const watchlistResults = await Promise.all(quotePromises)
              watchlist = watchlistResults.filter((w): w is WatchlistItem => w !== null)
            }
          }
        } catch (e) {
          console.error('Error parsing watchlist data:', e)
        }
      }

      // Parse user risk profile
      if (riskProfileRes.status === 'fulfilled' && riskProfileRes.value.ok) {
        try {
          const data = await riskProfileRes.value.json()
          if (data.hasProfile && data.riskProfile) {
            userRiskProfile = {
              riskTolerance: data.riskProfile.riskTolerance,
              investmentHorizon: data.riskProfile.investmentHorizon,
              investmentExperience: data.riskProfile.investmentExperience,
              riskScore: parseFloat(data.riskProfile.riskScore) || 50,
              preferredSectors: data.riskProfile.preferredSectors,
              avoidSectors: data.riskProfile.avoidSectors,
            }
          }
        } catch (e) {
          console.error('Error parsing risk profile data:', e)
        }
      }

      const result: GlobalContextState = {
        marketData,
        economicIndicators,
        watchlist,
        recentNews,
        userRiskProfile,
        lastUpdated: now,
      }
      
      globalDataRef.current = result
      lastFetchRef.current = now
      
      return result
    } catch (error) {
      console.error('Error fetching global context:', error)
      return globalDataRef.current || {
        marketData: {},
        economicIndicators: {},
        watchlist: [],
        recentNews: [],
        lastUpdated: 0,
      }
    } finally {
      isFetchingRef.current = false
    }
  }, [])

  const updateGlobalContext = useCallback(async () => {
    const globalData = await fetchGlobalData()
    
    // Build terminal context from global data
    const terminalContext: TerminalContext = {
      indices: globalData.marketData.indices,
      sectors: globalData.marketData.sectors,
      topGainers: globalData.marketData.topGainers,
      topLosers: globalData.marketData.topLosers,
    }
    
    // Build portfolio summary if available
    const portfolioSummary = holdings.length > 0 && summary ? {
      totalValue: summary.totalValue,
      totalGainLoss: summary.totalGainLoss,
      dayChange: summary.dayGainLoss,
      holdings: holdings.slice(0, 10).map(h => ({
        symbol: h.symbol,
        shares: h.quantity,
        avgCost: h.avgBuyPrice,
        currentValue: h.totalValue,
        gainLoss: h.gainLoss,
        gainLossPercent: h.gainLossPercent,
        weight: summary.totalValue > 0 ? (h.totalValue / summary.totalValue) * 100 : 0,
      })),
    } : undefined
    
    // Build news context
    const newsContext = globalData.recentNews.length > 0 ? {
      recentNews: globalData.recentNews,
      newsCount: globalData.recentNews.length,
      sentimentBreakdown: {
        bullish: globalData.recentNews.filter(n => n.sentiment === 'bullish').length,
        bearish: globalData.recentNews.filter(n => n.sentiment === 'bearish').length,
        neutral: globalData.recentNews.filter(n => n.sentiment === 'neutral').length,
      },
    } : undefined
    
    // Build market context
    const marketContext = globalData.marketData.indices ? {
      indices: globalData.marketData.indices.map(idx => ({
        symbol: idx.symbol,
        name: idx.name,
        value: idx.price,
        change: idx.change,
        changePercent: idx.changePercent,
      })),
      vix: globalData.marketData.vix,
      treasuryYield10Y: globalData.marketData.treasuryYield10Y,
      topGainers: globalData.marketData.topGainers?.map(g => ({
        symbol: g.symbol,
        change: g.changePercent,
      })),
      topLosers: globalData.marketData.topLosers?.map(l => ({
        symbol: l.symbol,
        change: l.changePercent,
      })),
      sectorPerformance: globalData.marketData.sectors?.reduce((acc, s) => {
        acc[s.name] = s.change
        return acc
      }, {} as Record<string, number>),
    } : undefined

    // Update context preserving existing page-specific context
    setContext({
      // Preserve current type - page-specific updaters set this
      type: currentContext.type || 'general',
      // Add global market context
      market: marketContext,
      // Add terminal context with live data
      terminalContext,
      // Add economic indicators
      economicIndicators: globalData.economicIndicators,
      // Add user risk profile from database
      userRiskProfile: globalData.userRiskProfile,
      // Add news context if we have news
      newsContext: currentContext.newsContext || newsContext,
      // Preserve page-specific portfolio data, or use summary
      portfolio: currentContext.portfolio || portfolioSummary,
      // Preserve page-specific stock data
      stock: currentContext.stock,
      // Preserve page context
      pageContext: currentContext.pageContext,
    })

    console.log('🌐 Global AI context updated:', {
      hasIndices: !!globalData.marketData.indices?.length,
      hasSectors: !!globalData.marketData.sectors?.length,
      hasMovers: !!(globalData.marketData.topGainers?.length || globalData.marketData.topLosers?.length),
      hasEconomic: Object.keys(globalData.economicIndicators).length > 0,
      hasNews: globalData.recentNews.length > 0,
      hasWatchlist: globalData.watchlist.length > 0,
      hasPortfolio: holdings.length > 0,
      hasRiskProfile: !!globalData.userRiskProfile,
      pageType: currentContext.type,
    })
  }, [fetchGlobalData, setContext, currentContext, holdings, summary])

  useEffect(() => {
    // Initial fetch with a small delay to let page-specific updaters set their context first
    const initialTimeout = setTimeout(() => {
      updateGlobalContext()
    }, 500)

    // Set up periodic refresh
    const interval = setInterval(updateGlobalContext, refreshInterval)

    return () => {
      clearTimeout(initialTimeout)
      clearInterval(interval)
    }
  }, [updateGlobalContext, refreshInterval])

  // Update when portfolio changes
  useEffect(() => {
    if (holdings.length > 0) {
      updateGlobalContext()
    }
  }, [holdings.length, updateGlobalContext])

  // This component doesn't render anything
  return null
}

export default GlobalContextUpdater
