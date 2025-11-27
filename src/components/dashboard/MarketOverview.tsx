'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  RefreshCw,
  DollarSign,
  BarChart3,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  previousClose: number
}

interface MarketStatus {
  status: string
  nextChange: string
  timestamp: string
}

interface MarketData {
  indices: MarketIndex[]
  marketStatus: MarketStatus
}

export function MarketOverview() {
  const [data, setData] = useState<MarketData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/market/overview')
      if (!response.ok) throw new Error('Failed to fetch')
      const result = await response.json()
      setData(result)
    } catch (err) {
      setError('Failed to load market data')
      console.error('Error fetching market overview:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Refresh every 60 seconds
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const isMarketOpen = data?.marketStatus?.status === 'open'

  return (
    <div className="space-y-6">
      {/* Market Status Banner */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium',
              isMarketOpen
                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                : 'bg-red-500/10 text-red-400 border border-red-500/20'
            )}
          >
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                isMarketOpen ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              )}
            />
            Market {isMarketOpen ? 'Open' : 'Closed'}
          </div>
          {data?.marketStatus?.nextChange && (
            <span className="text-sm text-gray-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {data.marketStatus.nextChange}
            </span>
          )}
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Major Indices */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <Card key={i} className="bg-[#0d0d0f] border-white/5">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="h-4 w-20 bg-white/5 rounded animate-pulse" />
                  <div className="h-8 w-28 bg-white/5 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-white/5 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          data?.indices.map((index, i) => (
            <motion.div
              key={index.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <IndexCard index={index} />
            </motion.div>
          ))
        )}
      </div>
    </div>
  )
}

function IndexCard({ index }: { index: MarketIndex }) {
  const isPositive = index.changePercent >= 0

  return (
    <Card className="bg-[#0d0d0f] border-white/5 hover:border-white/10 transition-colors">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wider">{index.name}</p>
            <p className="text-2xl font-bold text-white font-mono mt-1">
              {index.price.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
          <div
            className={cn(
              'p-2 rounded-lg',
              isPositive ? 'bg-green-500/10' : 'bg-red-500/10'
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-4 h-4 text-green-400" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-400" />
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium',
              isPositive ? 'text-green-400' : 'text-red-400'
            )}
          >
            {isPositive ? '+' : ''}
            {index.change.toFixed(2)}
          </span>
          <span
            className={cn(
              'text-sm font-medium px-1.5 py-0.5 rounded',
              isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
            )}
          >
            {isPositive ? '+' : ''}
            {index.changePercent.toFixed(2)}%
          </span>
        </div>
      </CardContent>
    </Card>
  )
}
