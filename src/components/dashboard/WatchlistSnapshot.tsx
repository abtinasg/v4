'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, TrendingUp, TrendingDown, Plus, RefreshCw, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassCard, PulsingDot } from '@/components/ui/cinematic'
import { useHaptic } from '@/lib/hooks'

interface WatchlistStock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  sparklineData: number[]
}

const defaultWatchlist: WatchlistStock[] = [
  { symbol: 'AAPL', name: 'Apple Inc', price: 232.45, change: 1.23, changePercent: 0.53, sparklineData: [228, 229, 230, 229, 231, 232, 232.45] },
  { symbol: 'MSFT', name: 'Microsoft Corp', price: 428.67, change: 5.89, changePercent: 1.39, sparklineData: [420, 422, 425, 423, 426, 428, 428.67] },
  { symbol: 'GOOGL', name: 'Alphabet Inc', price: 178.23, change: 2.45, changePercent: 1.39, sparklineData: [175, 176, 175, 177, 178, 178, 178.23] },
  { symbol: 'AMZN', name: 'Amazon.com Inc', price: 212.78, change: 3.45, changePercent: 1.65, sparklineData: [208, 209, 210, 211, 212, 213, 212.78] },
  { symbol: 'TSLA', name: 'Tesla Inc', price: 352.89, change: -8.45, changePercent: -2.34, sparklineData: [360, 358, 355, 354, 353, 352, 352.89] },
]

// Mini sparkline component
function MiniSparkline({ data, positive }: { data: number[]; positive: boolean }) {
  if (data.length < 2) return null
  
  const width = 48
  const height = 20
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  
  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')
  
  const color = positive ? '#22c55e' : '#ef4444'
  
  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <filter id={`spark-glow-${positive ? 'green' : 'red'}`}>
          <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        filter={`url(#spark-glow-${positive ? 'green' : 'red'})`}
      />
    </svg>
  )
}

interface WatchlistSnapshotProps {
  className?: string
}

export function WatchlistSnapshot({ className }: WatchlistSnapshotProps) {
  const { triggerHaptic } = useHaptic()
  const [watchlist, setWatchlist] = useState<WatchlistStock[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEmpty, setIsEmpty] = useState(false)

  const fetchWatchlist = async () => {
    setIsLoading(true)
    try {
      // Get user's watchlists
      console.log('🔍 WatchlistSnapshot: Fetching user watchlists...')
      const response = await fetch('/api/watchlists')
      
      // If unauthorized or error, show empty state
      if (!response.ok) {
        console.log('❌ WatchlistSnapshot: Failed to fetch watchlists (status:', response.status, ')')
        setWatchlist([])
        setIsEmpty(true)
        setIsLoading(false)
        return
      }
      
      const result = await response.json()
      console.log('✅ WatchlistSnapshot: Received watchlists:', result.watchlists?.length || 0, 'watchlist(s)')

      // Get the first watchlist (or default watchlist) with items
      const userWatchlist = result.watchlists?.[0]
      
      if (!userWatchlist || !userWatchlist.items || userWatchlist.items.length === 0) {
        // No watchlist items found, show empty state
        console.log('⚠️ WatchlistSnapshot: No watchlist items found')
        setWatchlist([])
        setIsEmpty(true)
        setIsLoading(false)
        return
      }

      setIsEmpty(false)
      // Get symbols from watchlist items (limit to 5 for dashboard)
      const symbols = userWatchlist.items.slice(0, 5).map((item: any) => item.symbol)
      console.log('📊 WatchlistSnapshot: Fetching quotes for symbols:', symbols.join(', '))
      
      // Fetch quotes for all symbols
      const quotesResponse = await fetch(`/api/stocks/quote?symbols=${symbols.join(',')}`)
      if (!quotesResponse.ok) {
        console.log('❌ WatchlistSnapshot: Failed to fetch quotes (status:', quotesResponse.status, ')')
        throw new Error('Failed to fetch quotes')
      }
      const quotesResult = await quotesResponse.json()
      console.log('✅ WatchlistSnapshot: Received', quotesResult.quotes?.length || 0, 'quote(s)')

      if (quotesResult.success && quotesResult.quotes && quotesResult.quotes.length > 0) {
        const mapped = quotesResult.quotes.map((quote: any) => ({
          symbol: quote.symbol,
          name: quote.name || quote.shortName || quote.longName || quote.symbol,
          price: quote.price || quote.regularMarketPrice || 0,
          change: quote.change || quote.regularMarketChange || 0,
          changePercent: quote.changePercent || quote.regularMarketChangePercent || 0,
          // Generate synthetic sparkline from current price
          sparklineData: generateSparkline(
            quote.price || quote.regularMarketPrice || 0, 
            quote.changePercent || quote.regularMarketChangePercent || 0
          ),
        }))
        console.log('🎉 WatchlistSnapshot: Successfully loaded real user data for', mapped.length, 'stocks')
        setWatchlist(mapped)
      } else {
        // If quotes failed, show empty state
        console.log('⚠️ WatchlistSnapshot: Quotes result invalid')
        setWatchlist([])
        setIsEmpty(true)
      }
    } catch (error) {
      console.error('❌ WatchlistSnapshot: Error fetching watchlist:', error)
      setWatchlist([])
      setIsEmpty(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Generate synthetic sparkline data
  const generateSparkline = (currentPrice: number, changePercent: number): number[] => {
    const points = 7
    const data: number[] = []
    const startPrice = currentPrice / (1 + changePercent / 100)
    const step = (currentPrice - startPrice) / (points - 1)
    
    for (let i = 0; i < points; i++) {
      // Add some randomness for natural look
      const randomFactor = 1 + (Math.random() - 0.5) * 0.01
      data.push((startPrice + step * i) * randomFactor)
    }
    data[data.length - 1] = currentPrice // Ensure last point is exact
    return data
  }

  useEffect(() => {
    fetchWatchlist()
    const interval = setInterval(fetchWatchlist, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.6 }}
      className={className}
    >
      <GlassCard className="h-full p-2.5 sm:p-3 md:p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-2 sm:mb-3 md:mb-4">
          <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3">
            <div className="p-1 sm:p-1.5 md:p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <Eye className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm md:text-base font-semibold text-white">Watchlist</h3>
              <p className="text-[9px] sm:text-[10px] text-gray-500">{watchlist.length} symbols</p>
            </div>
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5">
            <button
              onClick={() => {
                triggerHaptic('light')
                fetchWatchlist()
              }}
              disabled={isLoading}
              className={cn(
                'p-1 sm:p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]',
                'hover:bg-white/[0.06] hover:border-cyan-500/30',
                'text-gray-400 hover:text-cyan-400 transition-all duration-300',
                'disabled:opacity-50'
              )}
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              )}
            </button>
            <button className={cn(
              'p-1 sm:p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]',
              'hover:bg-cyan-500/10 hover:border-cyan-500/30 hover:text-cyan-400',
              'text-gray-400 transition-all duration-300'
            )}>
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Watchlist Items */}
        <div className="space-y-1.5 sm:space-y-2">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            </div>
          ) : isEmpty || watchlist.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 sm:py-8">
              <div className="p-3 rounded-full bg-cyan-500/10 border border-cyan-500/20 mb-3">
                <Eye className="w-6 h-6 text-cyan-400" />
              </div>
              <p className="text-sm text-gray-400 mb-1">No stocks in watchlist</p>
              <p className="text-xs text-gray-500 mb-3">Add stocks to track them here</p>
              <a 
                href="/dashboard/watchlist"
                className="px-4 py-2 text-xs font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded-lg hover:bg-cyan-500/20 transition-colors"
              >
                Go to Watchlist
              </a>
            </div>
          ) : (
            watchlist.map((stock, index) => {
              const isPositive = stock.changePercent >= 0
              
              return (
                <motion.div
                  key={stock.symbol}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                  onClick={() => {
                    triggerHaptic('light')
                    window.location.href = `/dashboard/stock-analysis/${stock.symbol}`
                  }}
                  className={cn(
                    'flex items-center justify-between p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl',
                    'bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08]',
                    'transition-all duration-300 cursor-pointer group'
                  )}
                >
                  {/* Symbol & Name */}
                  <div className="flex-1 min-w-0 mr-2 sm:mr-3">
                    <p className="text-xs sm:text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                      {stock.symbol}
                    </p>
                    <p className="text-[9px] sm:text-[10px] text-gray-500 truncate">
                      {stock.name}
                    </p>
                  </div>

                  {/* Sparkline */}
                  <div className="mr-2 sm:mr-3 opacity-60 group-hover:opacity-100 transition-opacity hidden sm:block">
                    <MiniSparkline data={stock.sparklineData} positive={isPositive} />
                  </div>

                  {/* Price & Change */}
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-medium text-white tabular-nums">
                      ${stock.price.toFixed(2)}
                    </p>
                    <div className="flex items-center justify-end gap-0.5 sm:gap-1">
                      {isPositive ? (
                        <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-red-400" />
                      )}
                      <span className={cn(
                        'text-[9px] sm:text-[10px] font-semibold tabular-nums',
                        isPositive ? 'text-emerald-400' : 'text-red-400'
                      )}>
                        {isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              )
            })
          )}
        </div>

        {/* View All Link */}
        <div className="mt-2.5 sm:mt-3 md:mt-4 pt-2.5 sm:pt-3 md:pt-4 border-t border-white/[0.06]">
          <a href="/dashboard/watchlist" className="w-full block py-1.5 sm:py-2 text-[10px] sm:text-xs font-medium text-gray-400 hover:text-cyan-400 transition-colors text-center">
            View Full Watchlist →
          </a>
        </div>
      </GlassCard>
    </motion.div>
  )
}
