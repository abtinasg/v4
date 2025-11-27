'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RefreshCw, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassPill } from '@/components/ui/cinematic'
import { MarketIndexCard } from './MarketIndexCard'

interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  sparklineData?: number[]
}

interface MarketStatus {
  status: string
  nextChange: string
  timestamp: string
}

// Map API symbols to display names
const indexNameMap: Record<string, string> = {
  '^GSPC': 'S&P 500',
  '^DJI': 'Dow Jones',
  '^IXIC': 'Nasdaq',
  '^RUT': 'Russell 2000',
  '^VIX': 'VIX',
}

export function MarketOverviewSection() {
  const [indices, setIndices] = useState<MarketIndex[]>([])
  const [marketStatus, setMarketStatus] = useState<MarketStatus | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/market/overview')
      if (!response.ok) throw new Error('Failed to fetch')
      const result = await response.json()
      
      // Transform data to match our expected format
      const transformedIndices = result.indices?.map((idx: MarketIndex) => ({
        ...idx,
        name: indexNameMap[idx.symbol] || idx.name,
      })) || []
      
      setIndices(transformedIndices)
      setMarketStatus(result.marketStatus)
    } catch (err) {
      setError('Failed to load market data')
      console.error('Error fetching market overview:', err)
      // Set mock data on error for demo purposes
      setIndices([
        { symbol: '^GSPC', name: 'S&P 500', price: 5998.74, change: 23.86, changePercent: 0.40, sparklineData: generateMockSparkline(5998.74) },
        { symbol: '^DJI', name: 'Dow Jones', price: 44722.06, change: 188.59, changePercent: 0.42, sparklineData: generateMockSparkline(44722.06) },
        { symbol: '^IXIC', name: 'Nasdaq', price: 19060.48, change: 157.69, changePercent: 0.83, sparklineData: generateMockSparkline(19060.48) },
        { symbol: '^RUT', name: 'Russell 2000', price: 2434.73, change: -12.56, changePercent: -0.51, sparklineData: generateMockSparkline(2434.73) },
        { symbol: '^VIX', name: 'VIX', price: 14.10, change: -0.54, changePercent: -3.69, sparklineData: generateMockSparkline(14.10) },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const isMarketOpen = marketStatus?.status === 'open'

  return (
    <section className="space-y-4 sm:space-y-5">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative">
            {/* Glow behind title */}
            <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 via-transparent to-violet-500/20 blur-xl opacity-50" />
            <h2 className="relative text-base sm:text-lg font-semibold text-white tracking-tight">
              Market Overview
            </h2>
          </div>
          <GlassPill
            variant={isMarketOpen ? 'success' : 'default'}
            pulse={isMarketOpen}
            size="sm"
          >
            {isMarketOpen ? 'Market Open' : 'Market Closed'}
          </GlassPill>
          {marketStatus?.nextChange && (
            <span className="hidden sm:flex text-xs text-gray-500 items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {marketStatus.nextChange}
            </span>
          )}
        </div>
        <button
          onClick={fetchData}
          disabled={isLoading}
          className={cn(
            'p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]',
            'hover:bg-white/[0.06] hover:border-cyan-500/30',
            'text-gray-400 hover:text-cyan-400 transition-all duration-300',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'hover:shadow-[0_0_20px_rgba(0,212,255,0.15)]'
          )}
        >
          <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 text-xs">
          {error} — Showing demo data
        </div>
      )}

      {/* Responsive Grid - 2 cols on mobile, 3 on tablet, 5 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 lg:gap-5">
        {isLoading ? (
          // Loading skeletons
          Array.from({ length: 5 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              className="h-[110px] rounded-xl bg-[#0C1017]/60 backdrop-blur-xl border border-white/[0.06] p-4"
            >
              <div className="space-y-3">
                <div className="h-3 w-16 bg-white/[0.05] rounded animate-pulse" />
                <div className="h-6 w-24 bg-white/[0.05] rounded animate-pulse" />
                <div className="h-4 w-20 bg-white/[0.05] rounded animate-pulse" />
              </div>
            </motion.div>
          ))
        ) : (
          indices.map((index, i) => (
            <MarketIndexCard
              key={index.symbol}
              symbol={index.symbol}
              name={index.name}
              price={index.price}
              change={index.change}
              changePercent={index.changePercent}
              sparklineData={index.sparklineData}
              index={i}
            />
          ))
        )}
      </div>
    </section>
  )
}

// Helper to generate mock sparkline data
function generateMockSparkline(basePrice: number): number[] {
  const data: number[] = []
  let price = basePrice * 0.995
  for (let i = 0; i < 20; i++) {
    price = price * (0.998 + Math.random() * 0.004)
    data.push(price)
  }
  data.push(basePrice)
  return data
}
