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
import { GlassPill, GradientHeader, GlassCard } from '@/components/ui/cinematic'

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
      {/* Market Status Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/[0.06]">
        <div className="flex items-center gap-3">
          <GradientHeader title="Market Overview" />
          <GlassPill
            pulse={isMarketOpen}
            color={isMarketOpen ? 'green' : 'red'}
          >
            Market {isMarketOpen ? 'Open' : 'Closed'}
          </GlassPill>
          {data?.marketStatus?.nextChange && (
            <span className="text-sm text-gray-500 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              {data.marketStatus.nextChange}
            </span>
          )}
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className="p-2 rounded-lg glass-panel hover:bg-white/[0.05] text-gray-400 hover:text-cyan-400 transition-all disabled:opacity-50 hover:shadow-[0_0_12px_rgba(0,212,255,0.15)]"
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
            <GlassCard key={i}>
              <div className="space-y-3">
                <div className="h-4 w-20 bg-white/[0.05] rounded animate-pulse" />
                <div className="h-8 w-28 bg-white/[0.05] rounded animate-pulse" />
                <div className="h-4 w-16 bg-white/[0.05] rounded animate-pulse" />
              </div>
            </GlassCard>
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
    <GlassCard className="hover-neon-outline group cursor-pointer">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">{index.name}</p>
          <p className="text-2xl font-bold text-white font-mono mt-1.5">
            {index.price.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>
        <div
          className={cn(
            'p-2 rounded-lg transition-all',
            isPositive 
              ? 'bg-emerald-500/10 group-hover:bg-emerald-500/15' 
              : 'bg-red-500/10 group-hover:bg-red-500/15'
          )}
        >
          {isPositive ? (
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-400" />
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'text-sm font-semibold',
            isPositive ? 'text-emerald-400' : 'text-red-400'
          )}
        >
          {isPositive ? '+' : ''}
          {index.change.toFixed(2)}
        </span>
        <span
          className={cn(
            'text-sm font-semibold px-2 py-0.5 rounded-md border',
            isPositive 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          )}
        >
          {isPositive ? '+' : ''}
          {index.changePercent.toFixed(2)}%
        </span>
      </div>
    </GlassCard>
  )
}
