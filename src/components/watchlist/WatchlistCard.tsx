/**
 * Watchlist Card Component
 * 
 * Card view for individual stocks in a watchlist
 * - Compact display with sparkline
 * - Price and change indicators
 * - Quick action buttons
 */

'use client'

import React, { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  Bell,
  Trash2,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  MoreVertical,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useWatchlistStore, type WatchlistStock, type StockQuote } from '@/lib/stores/watchlist-store'
import { RealTimePrice } from './RealTimePrice'
import Link from 'next/link'

// ============================================================
// TYPES
// ============================================================

export interface WatchlistCardProps {
  stock: WatchlistStock
  watchlistId: string
  onSetAlert?: (symbol: string) => void
  className?: string
}

// ============================================================
// MINI SPARKLINE
// ============================================================

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  positive?: boolean
}

const Sparkline = memo(function Sparkline({
  data,
  width = 80,
  height = 32,
  positive = true,
}: SparklineProps) {
  if (!data || data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data
    .map((value, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    })
    .join(' ')

  // Create gradient path for area fill
  const areaPath = `M0,${height} L${points.split(' ').map((p, i) => {
    const [x, y] = p.split(',')
    return i === 0 ? `${x},${y}` : ` L${x},${y}`
  }).join('')} L${width},${height} Z`

  return (
    <svg width={width} height={height} className="overflow-visible">
      <defs>
        <linearGradient id={`sparkline-gradient-${positive ? 'up' : 'down'}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={positive ? '#22c55e' : '#ef4444'} stopOpacity="0.3" />
          <stop offset="100%" stopColor={positive ? '#22c55e' : '#ef4444'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={areaPath}
        fill={`url(#sparkline-gradient-${positive ? 'up' : 'down'})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#22c55e' : '#ef4444'}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
})

// ============================================================
// HELPERS
// ============================================================

function formatVolume(volume: number | undefined): string {
  if (!volume) return '—'
  if (volume >= 1_000_000_000) {
    return `${(volume / 1_000_000_000).toFixed(2)}B`
  }
  if (volume >= 1_000_000) {
    return `${(volume / 1_000_000).toFixed(2)}M`
  }
  if (volume >= 1_000) {
    return `${(volume / 1_000).toFixed(1)}K`
  }
  return volume.toLocaleString()
}

function formatPercent(percent: number | undefined): string {
  if (percent === undefined) return '—'
  const sign = percent >= 0 ? '+' : ''
  return `${sign}${percent.toFixed(2)}%`
}

// ============================================================
// COMPONENT
// ============================================================

export const WatchlistCard = memo(function WatchlistCard({
  stock,
  watchlistId,
  onSetAlert,
  className,
}: WatchlistCardProps) {
  const quotes = useWatchlistStore((s) => s.quotes)
  const removeStock = useWatchlistStore((s) => s.removeStock)

  const quote = quotes[stock.symbol]
  const isPositive = (quote?.change ?? 0) >= 0

  // Generate sparkline data
  const sparklineData = useMemo(() => {
    if (!quote?.price) return []
    if (quote.sparklineData) return quote.sparklineData
    
    const base = quote.previousClose || quote.price
    return Array.from({ length: 20 }, (_, i) => {
      const progress = i / 19
      const noise = (Math.random() - 0.5) * 2
      return base + (quote.price - base) * progress + noise
    })
  }, [quote?.price, quote?.previousClose, quote?.sparklineData])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'relative group rounded-xl overflow-hidden',
        'bg-gradient-to-br from-white/5 to-white/[0.02]',
        'border border-white/10 hover:border-white/20',
        'transition-all duration-300',
        className
      )}
    >
      {/* Glow effect on hover */}
      <div className={cn(
        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
        isPositive
          ? 'bg-gradient-to-br from-green-500/5 to-transparent'
          : 'bg-gradient-to-br from-red-500/5 to-transparent'
      )} />

      <div className="relative p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <Link
            href={`/dashboard/stock-analysis?symbol=${stock.symbol}`}
            className="flex items-center gap-3 group/link"
          >
            {/* Symbol badge */}
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
              'bg-gradient-to-br',
              isPositive
                ? 'from-green-500/20 to-emerald-500/10'
                : 'from-red-500/20 to-rose-500/10'
            )}>
              <span className="text-sm font-bold text-white">
                {stock.symbol.slice(0, 2)}
              </span>
            </div>

            {/* Info */}
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white group-hover/link:text-cyan-400 transition-colors">
                  {stock.symbol}
                </span>
                <ExternalLink className="w-3 h-3 text-white/30 opacity-0 group-hover/link:opacity-100 transition-opacity" />
              </div>
              {stock.name && (
                <p className="text-xs text-white/50 line-clamp-1 max-w-[120px]">
                  {stock.name}
                </p>
              )}
            </div>
          </Link>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0a0d12] border-white/10">
              <DropdownMenuItem
                onClick={() => onSetAlert?.(stock.symbol)}
                className="text-white/80 hover:text-white focus:text-white"
              >
                <Bell className="w-4 h-4 mr-2" />
                Set Alert
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/stock-analysis?symbol=${stock.symbol}`}
                  className="text-white/80 hover:text-white focus:text-white"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Analysis
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={() => removeStock(watchlistId, stock.symbol)}
                className="text-red-400 hover:text-red-300 focus:text-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Price and Chart Row */}
        <div className="flex items-end justify-between">
          {/* Price */}
          <div>
            {quote?.price !== undefined ? (
              <RealTimePrice
                price={quote.price}
                previousPrice={quote?.previousClose}
                size="lg"
              />
            ) : (
              <span className="text-xl font-bold text-white/40">—</span>
            )}

            {/* Change */}
            <div className="flex items-center gap-2 mt-1">
              <div className={cn(
                'inline-flex items-center gap-1 px-2 py-0.5 rounded text-sm font-medium',
                isPositive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
              )}>
                {isPositive ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {formatPercent(quote?.changePercent)}
              </div>
              <span className="text-xs text-white/40">
                Vol: {formatVolume(quote?.volume)}
              </span>
            </div>
          </div>

          {/* Sparkline */}
          <div className="opacity-80">
            <Sparkline data={sparklineData} positive={isPositive} />
          </div>
        </div>
      </div>
    </motion.div>
  )
})

// ============================================================
// CARD GRID WRAPPER
// ============================================================

export interface WatchlistCardGridProps {
  watchlistId: string
  onSetAlert?: (symbol: string) => void
  className?: string
}

export const WatchlistCardGrid = memo(function WatchlistCardGrid({
  watchlistId,
  onSetAlert,
  className,
}: WatchlistCardGridProps) {
  const watchlists = useWatchlistStore((s) => s.watchlists)
  const watchlist = watchlists.find((wl) => wl.id === watchlistId)
  const stocks = watchlist?.stocks || []

  if (stocks.length === 0) {
    return (
      <div className={cn('text-center py-12', className)}>
        <TrendingUp className="w-12 h-12 mx-auto mb-4 text-white/20" />
        <h3 className="text-lg font-medium text-white/60 mb-2">
          No stocks in this watchlist
        </h3>
        <p className="text-sm text-white/40">
          Add stocks to start tracking
        </p>
      </div>
    )
  }

  return (
    <div className={cn(
      'grid gap-4',
      'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
      className
    )}>
      {stocks.map((stock) => (
        <WatchlistCard
          key={stock.symbol}
          stock={stock}
          watchlistId={watchlistId}
          onSetAlert={onSetAlert}
        />
      ))}
    </div>
  )
})

export default WatchlistCard
