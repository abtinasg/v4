'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, TrendingUp, BarChart3, Activity, DollarSign, Gauge, Zap, Apple, Cpu, Car, ShoppingCart } from 'lucide-react'
import { MarketCard, MarketCardSkeleton } from '@/components/dashboard/MarketCard'
import { EconomicIndicators } from '@/components/dashboard'

interface MarketData {
  symbol: string
  name: string
  value: number
  change: number
  changePercent: number
  sparklineData: number[]
}

interface FearGreedData {
  value: number
  classification: string
  change: number
}

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  sparklineData: number[]
}

// Top 4 stocks to display
const TOP_STOCKS = ['AAPL', 'NVDA', 'TSLA', 'AMZN']

// Generate mock sparkline data
function generateMockSparkline(currentValue: number, changePercent: number): number[] {
  const points = 7
  const data: number[] = []
  const startValue = currentValue / (1 + changePercent / 100)
  
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1)
    const baseValue = startValue + (currentValue - startValue) * progress
    const noise = baseValue * (Math.random() * 0.02 - 0.01)
    data.push(baseValue + noise)
  }
  
  return data
}

export default function OverviewPage() {
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [topStocks, setTopStocks] = useState<StockData[]>([])
  const [fearGreedIndex, setFearGreedIndex] = useState<FearGreedData | null>(null)
  const [volumeLeaders, setVolumeLeaders] = useState<MarketData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isStocksLoading, setIsStocksLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Fetch top stocks data
  const fetchTopStocks = useCallback(async () => {
    try {
      setIsStocksLoading(true)
      
      const stocksData = await Promise.all(
        TOP_STOCKS.map(async (symbol) => {
          try {
            // Fetch quote
            const quoteResponse = await fetch(`/api/stocks/quote/${symbol}`)
            const quoteData = await quoteResponse.json()
            
            // Fetch historical for sparkline
            const historicalResponse = await fetch(
              `/api/stocks/historical/${symbol}?range=5d&interval=1d`
            )
            const historicalData = await historicalResponse.json()
            
            const sparklineData = historicalData.success && historicalData.data?.data
              ? historicalData.data.data.map((d: { close: number }) => d.close)
              : generateMockSparkline(quoteData.data?.price || 100, quoteData.data?.changePercent || 0)

            if (quoteData.success && quoteData.data) {
              return {
                symbol: quoteData.data.symbol,
                name: quoteData.data.name,
                price: quoteData.data.price,
                change: quoteData.data.change,
                changePercent: quoteData.data.changePercent,
                sparklineData,
              }
            }
            return null
          } catch (error) {
            console.error(`Error fetching ${symbol}:`, error)
            return null
          }
        })
      )

      const validStocks = stocksData.filter((s): s is StockData => s !== null)
      setTopStocks(validStocks)
    } catch (error) {
      console.error('Error fetching top stocks:', error)
    } finally {
      setIsStocksLoading(false)
    }
  }, [])

  const fetchMarketData = useCallback(async () => {
    try {
      // Fetch market indices
      const indicesResponse = await fetch('/api/stocks/indices')
      const indicesData = await indicesResponse.json()

      if (indicesData.success && indicesData.data) {
        // Fetch historical data for sparklines
        const indicesWithSparklines = await Promise.all(
          indicesData.data.map(async (index: { symbol: string; name: string; price: number; change: number; changePercent: number }) => {
            try {
              const historicalResponse = await fetch(
                `/api/stocks/historical/${encodeURIComponent(index.symbol)}?range=5d&interval=1d`
              )
              const historicalData = await historicalResponse.json()
              
              const sparklineData = historicalData.success && historicalData.data?.data
                ? historicalData.data.data.map((d: { close: number }) => d.close)
                : generateMockSparkline(index.price, index.changePercent)

              return {
                symbol: index.symbol,
                name: index.name,
                value: index.price,
                change: index.change,
                changePercent: index.changePercent,
                sparklineData,
              }
            } catch {
              return {
                symbol: index.symbol,
                name: index.name,
                value: index.price,
                change: index.change,
                changePercent: index.changePercent,
                sparklineData: generateMockSparkline(index.price, index.changePercent),
              }
            }
          })
        )

        setMarketData(indicesWithSparklines)
      }

      // Mock Fear & Greed Index (CNN's index doesn't have a free API)
      setFearGreedIndex({
        value: Math.floor(Math.random() * 30) + 40, // Random value between 40-70
        classification: 'Neutral',
        change: (Math.random() * 10 - 5),
      })

      // Mock volume leaders
      setVolumeLeaders([
        {
          symbol: 'NVDA',
          name: 'NVIDIA Corp',
          value: 875.32,
          change: 23.45,
          changePercent: 2.75,
          sparklineData: generateMockSparkline(875.32, 2.75),
        },
        {
          symbol: 'TSLA',
          name: 'Tesla Inc',
          value: 342.18,
          change: -8.92,
          changePercent: -2.54,
          sparklineData: generateMockSparkline(342.18, -2.54),
        },
      ])

      setLastUpdated(new Date())
    } catch (error) {
      console.error('Error fetching market data:', error)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchMarketData()
    fetchTopStocks()

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      setIsRefreshing(true)
      fetchMarketData()
      fetchTopStocks()
    }, 30000)

    return () => clearInterval(interval)
  }, [fetchMarketData, fetchTopStocks])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchMarketData()
    fetchTopStocks()
  }

  // Get icon for market index
  const getIndexIcon = (symbol: string) => {
    switch (symbol) {
      case '^GSPC':
        return <TrendingUp className="w-4 h-4 text-blue-400" />
      case '^DJI':
        return <BarChart3 className="w-4 h-4 text-purple-400" />
      case '^IXIC':
        return <Activity className="w-4 h-4 text-cyan-400" />
      case '^RUT':
        return <TrendingUp className="w-4 h-4 text-orange-400" />
      case '^VIX':
        return <Gauge className="w-4 h-4 text-yellow-400" />
      default:
        return <TrendingUp className="w-4 h-4 text-gray-400" />
    }
  }

  // Get icon for stock
  const getStockIcon = (symbol: string) => {
    switch (symbol) {
      case 'AAPL':
        return <Apple className="w-4 h-4 text-gray-300" />
      case 'NVDA':
        return <Cpu className="w-4 h-4 text-green-400" />
      case 'TSLA':
        return <Car className="w-4 h-4 text-red-400" />
      case 'AMZN':
        return <ShoppingCart className="w-4 h-4 text-orange-400" />
      default:
        return <TrendingUp className="w-4 h-4 text-blue-400" />
    }
  }

  // Calculate total market cap (mock)
  const totalMarketCap = {
    value: 52.3,
    change: 0.8,
    changePercent: 1.55,
    sparklineData: generateMockSparkline(52.3, 1.55),
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-white"
          >
            Market Overview
          </motion.h1>
          <p className="text-gray-400 text-sm">
            Real-time market data and indices
          </p>
        </div>

        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-xs text-gray-500">
              Updated {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={`w-4 h-4 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`}
            />
          </button>
        </div>
      </div>

      {/* Top Stocks - 4 Cards */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Top Stocks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isStocksLoading ? (
            <>
              <MarketCardSkeleton />
              <MarketCardSkeleton />
              <MarketCardSkeleton />
              <MarketCardSkeleton />
            </>
          ) : (
            topStocks.map((stock) => (
              <MarketCard
                key={stock.symbol}
                name={stock.name}
                symbol={stock.symbol}
                value={stock.price}
                change={stock.change}
                changePercent={stock.changePercent}
                sparklineData={stock.sparklineData}
                icon={getStockIcon(stock.symbol)}
                prefix="$"
              />
            ))
          )}
        </div>
      </div>

      {/* Market Indices Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Major Indices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              <MarketCardSkeleton />
              <MarketCardSkeleton />
              <MarketCardSkeleton />
              <MarketCardSkeleton />
            </>
          ) : (
            <>
              {marketData.map((index) => (
                <MarketCard
                  key={index.symbol}
                  name={index.name}
                  symbol={index.symbol.replace('^', '')}
                  value={index.value}
                  change={index.change}
                  changePercent={index.changePercent}
                  sparklineData={index.sparklineData}
                  icon={getIndexIcon(index.symbol)}
                />
              ))}

              {/* Total Market Cap */}
              <MarketCard
                name="Total Market Cap"
                symbol="US Markets"
                value={totalMarketCap.value}
                change={totalMarketCap.change}
                changePercent={totalMarketCap.changePercent}
                sparklineData={totalMarketCap.sparklineData}
                icon={<DollarSign className="w-4 h-4 text-green-400" />}
                suffix="T"
                prefix="$"
              />
            </>
          )}
        </div>
      </div>

      {/* Fear & Greed Index */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Market Sentiment</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Fear & Greed Gauge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center">
                  <Gauge className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-white">Fear & Greed Index</p>
                  <p className="text-xs text-gray-500">Market sentiment indicator</p>
                </div>
              </div>
            </div>

            {fearGreedIndex && (
              <>
                {/* Gauge */}
                <div className="relative h-8 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full mb-4 overflow-hidden">
                  <div
                    className="absolute top-0 h-full w-1 bg-white shadow-lg transition-all duration-500"
                    style={{ left: `${fearGreedIndex.value}%` }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-3xl font-bold text-white">{fearGreedIndex.value}</p>
                    <p className="text-sm text-yellow-400">{fearGreedIndex.classification}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Labels</p>
                    <div className="flex gap-2 text-xs mt-1">
                      <span className="text-red-400">Fear</span>
                      <span className="text-yellow-400">Neutral</span>
                      <span className="text-green-400">Greed</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </motion.div>

          {/* Volume Leaders */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-white">Volume Leaders</p>
                <p className="text-xs text-gray-500">Most active stocks today</p>
              </div>
            </div>

            <div className="space-y-3">
              {volumeLeaders.map((stock) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white">
                      {stock.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <p className="font-medium text-white text-sm">{stock.symbol}</p>
                      <p className="text-xs text-gray-500">{stock.name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-white text-sm">
                      ${stock.value.toFixed(2)}
                    </p>
                    <p
                      className={`text-xs ${
                        stock.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {stock.changePercent >= 0 ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Quick Stats */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.03]">
          <p className="text-xs text-gray-500 mb-1">Market Status</p>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <p className="text-sm font-medium text-white">Open</p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.03]">
          <p className="text-xs text-gray-500 mb-1">Gainers</p>
          <p className="text-sm font-medium text-green-400">2,847</p>
        </div>
        <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.03]">
          <p className="text-xs text-gray-500 mb-1">Losers</p>
          <p className="text-sm font-medium text-red-400">1,932</p>
        </div>
        <div className="p-4 rounded-xl border border-white/[0.08] bg-white/[0.03]">
          <p className="text-xs text-gray-500 mb-1">Unchanged</p>
          <p className="text-sm font-medium text-gray-400">421</p>
        </div>
      </motion.div>

      {/* Economic Indicators */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Economic Indicators</h2>
        <EconomicIndicators />
      </div>
    </div>
  )
}
