/**
 * Stock Context Updater
 * 
 * Client component that fetches full stock data and updates AI context.
 * Use this on stock analysis pages to give AI access to quote and metrics.
 */

'use client'

import { useEffect, useState } from 'react'
import { useChatStore } from '@/lib/stores/chat-store'
import type { StockContext, StockMetrics } from '@/lib/ai/context-builder'

interface StockContextUpdaterProps {
  symbol: string
  /** Initial data from server (partial) */
  initialData?: {
    companyName?: string
    sector?: string
    industry?: string
    currentPrice?: number
    marketCap?: number
    metrics?: any
  }
}

export function StockContextUpdater({ symbol, initialData }: StockContextUpdaterProps) {
  const setContext = useChatStore((s) => s.setContext)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchAndUpdateContext() {
      try {
        // Fetch quote data
        const quoteRes = await fetch(`/api/stocks/quote/${symbol}`)
        if (!quoteRes.ok) {
          console.error(`❌ Quote API failed for ${symbol}:`, quoteRes.status, await quoteRes.text())
        }
        const quoteJson = quoteRes.ok ? await quoteRes.json() : null
        const quoteData = quoteJson?.data?.quote || quoteJson?.quote || null

        // Fetch metrics data  
        const metricsRes = await fetch(`/api/stock/${symbol}/metrics`)
        if (!metricsRes.ok) {
          console.error(`❌ Metrics API failed for ${symbol}:`, metricsRes.status, await metricsRes.text())
        }
        const metricsJson = metricsRes.ok ? await metricsRes.json() : null

        console.log('📊 Fetched data for AI context:', { 
          symbol, 
          quoteSuccess: quoteRes.ok,
          metricsSuccess: metricsRes.ok,
          hasQuoteData: !!quoteData,
          hasMetricsData: !!metricsJson,
          quotePrice: quoteData?.price,
          metricsCount: metricsJson?.metrics ? Object.keys(metricsJson.metrics).length : 0,
        })

        // Build full stock context
        const stockContext: StockContext = {
          symbol: symbol.toUpperCase(),
          name: quoteData?.longName || quoteData?.shortName || metricsJson?.companyName || initialData?.companyName || '',
          sector: metricsJson?.sector || initialData?.sector,
          industry: metricsJson?.industry || initialData?.industry,
        }

        // Add quote if available
        if (quoteData) {
          stockContext.quote = {
            symbol: symbol.toUpperCase(),
            name: stockContext.name || '',
            price: quoteData.price || 0,
            change: quoteData.change || 0,
            changePercent: quoteData.changePercent || 0,
            high: quoteData.dayHigh || 0,
            low: quoteData.dayLow || 0,
            open: quoteData.open || 0,
            previousClose: quoteData.previousClose || 0,
            volume: quoteData.volume || 0,
            marketCap: quoteData.marketCap || 0,
          }
        }

        // Add metrics if available
        if (metricsJson?.metrics) {
          const m = metricsJson.metrics
          stockContext.metrics = {
            // Valuation
            pe: m.valuation?.peRatio,
            forwardPE: m.valuation?.forwardPE,
            pb: m.valuation?.pbRatio,
            ps: m.valuation?.psRatio,
            evToEbitda: m.valuation?.evToEbitda,
            evToRevenue: m.valuation?.evToRevenue,
            peg: m.valuation?.pegRatio,
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
            revenueGrowth5Y: m.growth?.revenueGrowth5Y || m.growth?.revenue5YCAGR,
            epsGrowth5Y: m.growth?.epsGrowth5Y || m.growth?.eps5YCAGR,
            // Financial Health
            currentRatio: m.liquidity?.currentRatio,
            quickRatio: m.liquidity?.quickRatio,
            debtToEquity: m.leverage?.debtToEquity,
            debtToEbitda: m.leverage?.debtToEbitda || m.leverage?.netDebtToEbitda,
            interestCoverage: m.leverage?.interestCoverage,
            // Efficiency
            assetTurnover: m.efficiency?.assetTurnover,
            inventoryTurnover: m.efficiency?.inventoryTurnover,
            receivablesTurnover: m.efficiency?.receivablesTurnover,
            // Cashflow
            freeCashFlow: m.cashflow?.freeCashFlow,
            operatingCashFlow: m.cashflow?.operatingCashFlow,
            fcfPerShare: m.cashflow?.fcfPerShare,
            // Dividend
            dividendYield: m.valuation?.dividendYield || m.dividend?.yield,
            payoutRatio: m.dividend?.payoutRatio,
            // Technical
            rsi: m.technical?.rsi14,
            beta: m.risk?.beta,
            fiftyDayMA: m.technical?.sma50,
            twoHundredDayMA: m.technical?.sma200,
          }
          
          console.log('📈 Metrics extracted for AI:', {
            symbol,
            valuationMetrics: Object.keys(m.valuation || {}).length,
            profitabilityMetrics: Object.keys(m.profitability || {}).length,
            growthMetrics: Object.keys(m.growth || {}).length,
            liquidityMetrics: Object.keys(m.liquidity || {}).length,
            leverageMetrics: Object.keys(m.leverage || {}).length,
            efficiencyMetrics: Object.keys(m.efficiency || {}).length,
            cashflowMetrics: Object.keys(m.cashflow || {}).length,
            technicalMetrics: Object.keys(m.technical || {}).length,
            totalMetricsCategories: Object.keys(m).length,
          })
        }

        // Update the chat context
        setContext({
          type: 'stock',
          stock: stockContext,
          pageContext: {
            currentPage: 'Stock Analysis',
          },
        })

        console.log('✅ AI Context updated with stock data:', {
          symbol: stockContext.symbol,
          hasQuote: !!stockContext.quote,
          hasMetrics: !!stockContext.metrics,
          price: stockContext.quote?.price,
        })
      } catch (error) {
        console.error('Failed to update AI context:', error)
        
        // Still set basic context even if API fails
        setContext({
          type: 'stock',
          stock: {
            symbol: symbol.toUpperCase(),
            name: initialData?.companyName || '',
            sector: initialData?.sector,
            industry: initialData?.industry,
          },
          pageContext: {
            currentPage: 'Stock Analysis',
          },
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAndUpdateContext()

    // Cleanup: Reset context when leaving the page
    return () => {
      setContext({
        type: 'general',
        stock: undefined,
      })
    }
  }, [symbol, initialData, setContext])

  // This component doesn't render anything
  return null
}

export default StockContextUpdater
