/**
 * Portfolio Context Updater
 * 
 * Client component that fetches comprehensive data for all portfolio holdings
 * and updates AI context with:
 * - Real-time quotes from Yahoo Finance
 * - Financial metrics from lib/metrics
 * - Economic indicators from FRED
 * - Portfolio-level analytics
 */

'use client'

import { useEffect, useCallback, useRef } from 'react'
import { useChatStore } from '@/lib/stores/chat-store'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'
import type { PortfolioContext, StockContext, EconomicIndicatorsContext } from '@/lib/ai/context-builder'

interface HoldingMetrics {
  symbol: string
  name: string
  sector?: string
  industry?: string
  // Valuation
  pe?: number
  forwardPE?: number
  pb?: number
  ps?: number
  evToEbitda?: number
  pegRatio?: number
  // Profitability
  grossMargin?: number
  operatingMargin?: number
  netMargin?: number
  roe?: number
  roa?: number
  roic?: number
  // Growth
  revenueGrowth?: number
  earningsGrowth?: number
  // Financial Health
  debtToEquity?: number
  currentRatio?: number
  quickRatio?: number
  interestCoverage?: number
  // Dividends
  dividendYield?: number
  payoutRatio?: number
  // Technical
  beta?: number
  fiftyTwoWeekHigh?: number
  fiftyTwoWeekLow?: number
  sma50?: number
  sma200?: number
  rsi?: number
  // Analyst
  targetPrice?: number
  analystRating?: string
  numberOfAnalysts?: number
}

interface EnhancedPortfolioContext extends PortfolioContext {
  holdingsAnalysis?: HoldingMetrics[]
  portfolioMetrics?: {
    weightedPE?: number
    weightedPB?: number
    weightedDividendYield?: number
    averageBeta?: number
    sectorConcentration?: { sector: string; weight: number }[]
    riskMetrics?: {
      portfolioBeta: number
      diversificationScore: number
      concentrationRisk: number
    }
  }
  economicContext?: EconomicIndicatorsContext
}

interface PortfolioContextUpdaterProps {
  /** Refresh interval in milliseconds */
  refreshInterval?: number
}

export function PortfolioContextUpdater({ 
  refreshInterval = 60000 // 1 minute default
}: PortfolioContextUpdaterProps) {
  const setContext = useChatStore((s) => s.setContext)
  const holdings = usePortfolioStore((s) => s.holdings)
  const summary = usePortfolioStore((s) => s.summary)
  const isRefreshing = usePortfolioStore((s) => s.isRefreshing)
  
  const lastUpdateRef = useRef<number>(0)
  const isFetchingRef = useRef(false)

  const fetchHoldingMetrics = useCallback(async (symbol: string): Promise<HoldingMetrics | null> => {
    try {
      const [metricsRes, quoteRes] = await Promise.all([
        fetch(`/api/stock/${symbol}/metrics`),
        fetch(`/api/stocks/quote/${symbol}`)
      ])

      const metricsData = metricsRes.ok ? await metricsRes.json() : null
      const quoteData = quoteRes.ok ? await quoteRes.json() : null
      const quote = quoteData?.data?.quote || quoteData?.quote

      if (!metricsData && !quote) return null

      const m = metricsData?.metrics || {}

      return {
        symbol: symbol.toUpperCase(),
        name: metricsData?.companyName || quote?.longName || quote?.shortName || symbol,
        sector: metricsData?.sector,
        industry: metricsData?.industry,
        // Valuation
        pe: m.valuation?.peRatio,
        forwardPE: m.valuation?.forwardPE,
        pb: m.valuation?.pbRatio,
        ps: m.valuation?.psRatio,
        evToEbitda: m.valuation?.evToEbitda,
        pegRatio: m.valuation?.pegRatio,
        // Profitability
        grossMargin: m.profitability?.grossMargin,
        operatingMargin: m.profitability?.operatingMargin,
        netMargin: m.profitability?.netMargin,
        roe: m.profitability?.roe,
        roa: m.profitability?.roa,
        roic: m.profitability?.roic,
        // Growth
        revenueGrowth: m.growth?.revenueGrowth,
        earningsGrowth: m.growth?.earningsGrowth,
        // Financial Health
        debtToEquity: m.leverage?.debtToEquity,
        currentRatio: m.liquidity?.currentRatio,
        quickRatio: m.liquidity?.quickRatio,
        interestCoverage: m.leverage?.interestCoverage,
        // Dividends
        dividendYield: m.dividends?.dividendYield,
        payoutRatio: m.dividends?.payoutRatio,
        // Technical
        beta: m.risk?.beta,
        fiftyTwoWeekHigh: quote?.fiftyTwoWeekHigh,
        fiftyTwoWeekLow: quote?.fiftyTwoWeekLow,
        sma50: m.technical?.sma50,
        sma200: m.technical?.sma200,
        rsi: m.technical?.rsi,
        // Analyst
        targetPrice: m.valuation?.targetPrice,
        analystRating: m.analyst?.recommendation,
        numberOfAnalysts: m.analyst?.numberOfAnalysts,
      }
    } catch (error) {
      console.error(`Error fetching metrics for ${symbol}:`, error)
      return null
    }
  }, [])

  const fetchEconomicIndicators = useCallback(async (): Promise<EconomicIndicatorsContext> => {
    try {
      const res = await fetch('/api/economic/indicators')
      if (!res.ok) return {}
      const data = await res.json()
      return {
        gdp: data.gdp,
        unemployment: data.unemployment,
        inflation: data.inflation,
        federalFundsRate: data.federalFundsRate,
        consumerConfidence: data.consumerConfidence,
        manufacturingPmi: data.manufacturingPmi,
        servicesPmi: data.servicesPmi,
      }
    } catch (error) {
      console.error('Error fetching economic indicators:', error)
      return {}
    }
  }, [])

  const calculatePortfolioMetrics = useCallback((
    holdingsData: HoldingMetrics[],
    portfolioHoldings: typeof holdings
  ) => {
    if (holdingsData.length === 0 || portfolioHoldings.length === 0) return undefined

    const totalValue = portfolioHoldings.reduce((sum, h) => sum + h.totalValue, 0)
    if (totalValue === 0) return undefined

    // Calculate weighted averages
    let weightedPE = 0
    let weightedPB = 0
    let weightedDividendYield = 0
    let totalBeta = 0
    let betaCount = 0

    // Sector allocation
    const sectorWeights: Record<string, number> = {}

    holdingsData.forEach((metrics) => {
      const holding = portfolioHoldings.find(h => h.symbol === metrics.symbol)
      if (!holding) return

      const weight = holding.totalValue / totalValue

      if (metrics.pe && metrics.pe > 0 && metrics.pe < 1000) {
        weightedPE += metrics.pe * weight
      }
      if (metrics.pb && metrics.pb > 0 && metrics.pb < 100) {
        weightedPB += metrics.pb * weight
      }
      if (metrics.dividendYield && metrics.dividendYield >= 0) {
        weightedDividendYield += metrics.dividendYield * weight
      }
      if (metrics.beta) {
        totalBeta += metrics.beta * weight
        betaCount++
      }

      if (metrics.sector) {
        sectorWeights[metrics.sector] = (sectorWeights[metrics.sector] || 0) + weight
      }
    })

    // Calculate concentration risk (HHI - Herfindahl-Hirschman Index)
    const weights = portfolioHoldings.map(h => h.totalValue / totalValue)
    const hhi = weights.reduce((sum, w) => sum + w * w, 0)
    
    // Diversification score (1 - HHI normalized)
    const maxHHI = 1 // Single stock
    const minHHI = 1 / portfolioHoldings.length // Equal weight
    const diversificationScore = portfolioHoldings.length > 1 
      ? Math.max(0, Math.min(100, ((maxHHI - hhi) / (maxHHI - minHHI)) * 100))
      : 0

    // Top sector concentration
    const sortedSectors = Object.entries(sectorWeights)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([sector, weight]) => ({ sector, weight: weight * 100 }))

    return {
      weightedPE: weightedPE > 0 ? weightedPE : undefined,
      weightedPB: weightedPB > 0 ? weightedPB : undefined,
      weightedDividendYield: weightedDividendYield > 0 ? weightedDividendYield : undefined,
      averageBeta: betaCount > 0 ? totalBeta : undefined,
      sectorConcentration: sortedSectors,
      riskMetrics: {
        portfolioBeta: totalBeta || 1,
        diversificationScore,
        concentrationRisk: hhi * 100,
      }
    }
  }, [])

  const updatePortfolioContext = useCallback(async () => {
    if (isFetchingRef.current) return
    if (holdings.length === 0) {
      // Clear portfolio context if no holdings
      setContext({
        type: 'portfolio',
        portfolio: undefined,
      })
      return
    }

    const now = Date.now()
    if (now - lastUpdateRef.current < 5000) return // Debounce 5 seconds

    isFetchingRef.current = true
    lastUpdateRef.current = now

    try {
      console.log('[PortfolioContextUpdater] Fetching data for', holdings.length, 'holdings')

      // Fetch metrics for all holdings in parallel (max 5 concurrent)
      const batchSize = 5
      const holdingsMetrics: HoldingMetrics[] = []
      
      for (let i = 0; i < holdings.length; i += batchSize) {
        const batch = holdings.slice(i, i + batchSize)
        const batchResults = await Promise.all(
          batch.map(h => fetchHoldingMetrics(h.symbol))
        )
        holdingsMetrics.push(...batchResults.filter((m): m is HoldingMetrics => m !== null))
      }

      // Fetch economic indicators
      const economicContext = await fetchEconomicIndicators()

      // Calculate portfolio-level metrics
      const portfolioMetrics = calculatePortfolioMetrics(holdingsMetrics, holdings)

      // Build portfolio context for AI
      const portfolioContext: EnhancedPortfolioContext = {
        holdings: holdings.map(h => ({
          symbol: h.symbol,
          shares: h.quantity,
          avgCost: h.avgBuyPrice,
          currentValue: h.totalValue,
          gainLoss: h.gainLoss,
          gainLossPercent: h.gainLossPercent,
          weight: summary.totalValue > 0 ? (h.totalValue / summary.totalValue) * 100 : 0,
        })),
        totalValue: summary.totalValue,
        totalGainLoss: summary.totalGainLoss,
        dayChange: summary.dayGainLoss,
        holdingsAnalysis: holdingsMetrics,
        portfolioMetrics,
        economicContext,
      }

      // Calculate sector allocation
      const sectorAllocation: Record<string, number> = {}
      holdingsMetrics.forEach(m => {
        if (m.sector) {
          const holding = holdings.find(h => h.symbol === m.symbol)
          if (holding && summary.totalValue > 0) {
            const weight = (holding.totalValue / summary.totalValue) * 100
            sectorAllocation[m.sector] = (sectorAllocation[m.sector] || 0) + weight
          }
        }
      })
      if (Object.keys(sectorAllocation).length > 0) {
        portfolioContext.sectorAllocation = sectorAllocation
      }

      console.log('[PortfolioContextUpdater] Context updated:', {
        holdingsCount: holdings.length,
        metricsCount: holdingsMetrics.length,
        hasEconomicData: Object.keys(economicContext).length > 0,
        hasPortfolioMetrics: !!portfolioMetrics,
      })

      setContext({
        type: 'portfolio',
        portfolio: portfolioContext,
        economicIndicators: economicContext,
      })

    } catch (error) {
      console.error('[PortfolioContextUpdater] Error:', error)
    } finally {
      isFetchingRef.current = false
    }
  }, [holdings, summary, setContext, fetchHoldingMetrics, fetchEconomicIndicators, calculatePortfolioMetrics])

  // Initial update and on holdings change
  useEffect(() => {
    // Small delay to avoid race conditions with portfolio store
    const timeout = setTimeout(() => {
      updatePortfolioContext()
    }, 500)

    return () => clearTimeout(timeout)
  }, [holdings.length, summary.totalValue]) // Only re-run when holdings count or total value changes

  // Periodic refresh
  useEffect(() => {
    if (holdings.length === 0) return

    const interval = setInterval(() => {
      if (!isRefreshing) {
        updatePortfolioContext()
      }
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval, updatePortfolioContext, holdings.length, isRefreshing])

  // This is a context updater component, doesn't render anything
  return null
}
