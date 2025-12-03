/**
 * Watchlist Card Component - Premium Fintech Design
 * 
 * Premium card view with:
 * - Glass morphism and backdrop blur
 * - 25-35% more padding and spacing
 * - Smooth hover transitions
 * - Clean typography
 * - Elegant sparkline charts
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
  width = 90,
  height = 36,
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
          <stop offset="0%" stopColor={positive ? '#10b981' : '#ef4444'} stopOpacity="0.2" />
          <stop offset="100%" stopColor={positive ? '#10b981' : '#ef4444'} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path
        d={areaPath}
        fill={`url(#sparkline-gradient-${positive ? 'up' : 'down'})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#10b981' : '#ef4444'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.9"
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
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative group rounded-2xl overflow-hidden',
        'bg-white/[0.03] border border-white/[0.06]',
        'hover:border-white/[0.12] hover:bg-white/[0.04]',
        'transition-all duration-300',
        className
      )}
    >
      {/* Subtle glow effect on hover */}
      <div className={cn(
        'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
        'bg-gradient-to-br',
        isPositive
          ? 'from-emerald-500/5 to-transparent'
          : 'from-red-500/5 to-transparent'
      )} />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <Link
            href={`/dashboard/stock-analysis/${stock.symbol}`}
            className="flex items-center gap-3 group/link flex-1 min-w-0"
          >
            {/* Symbol badge */}
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
              'bg-gradient-to-br transition-all duration-300',
              isPositive
                ? 'from-emerald-500/15 to-emerald-500/5 group-hover/link:from-emerald-500/20 group-hover/link:to-emerald-500/10'
                : 'from-red-500/15 to-red-500/5 group-hover/link:from-red-500/20 group-hover/link:to-red-500/10'
            )}>
              <span className="text-sm font-bold text-white/90">
                {stock.symbol.slice(0, 2).toUpperCase()}
              </span>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base text-white group-hover/link:text-cyan-400 transition-colors truncate">
                  {stock.symbol}
                </span>
                <ExternalLink className="w-3.5 h-3.5 text-white/20 opacity-0 group-hover/link:opacity-100 transition-opacity shrink-0" />
              </div>
              {stock.name && (
                <p className="text-xs text-white/40 line-clamp-1 mt-0.5">
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
                className={cn(
                  'h-8 w-8 p-0 rounded-lg shrink-0 ml-2',
                  'opacity-0 group-hover:opacity-100',
                  'hover:bg-white/[0.06] transition-all duration-200'
                )}
              >
                <MoreVertical className="w-4 h-4 text-white/60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              align="end" 
              className="w-48 bg-[#0d1117]/95 backdrop-blur-xl border-white/[0.08] rounded-xl shadow-2xl p-1"
            >
              <DropdownMenuItem
                onClick={() => onSetAlert?.(stock.symbol)}
                className="px-3 py-2.5 text-white/80 hover:text-white focus:text-white focus:bg-white/[0.06] rounded-lg cursor-pointer"
              >
                <Bell className="w-4 h-4 mr-3 text-white/50" />
                Set Alert
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href={`/dashboard/stock-analysis/${stock.symbol}`}
                  className="px-3 py-2.5 text-white/80 hover:text-white focus:text-white focus:bg-white/[0.06] rounded-lg cursor-pointer"
                >
                  <ExternalLink className="w-4 h-4 mr-3 text-white/50" />
                  View Analysis
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/[0.06] my-1" />
              <DropdownMenuItem
                onClick={() => removeStock(watchlistId, stock.symbol)}
                className="px-3 py-2.5 text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/10 rounded-lg cursor-pointer"
              >
                <Trash2 className="w-4 h-4 mr-3" />
                Remove
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Price Section */}
        <div className="space-y-3">
          {/* Current Price */}
          <div>
            {quote?.price !== undefined ? (
              <RealTimePrice
                price={quote.price}
                previousPrice={quote?.previousClose}
                size="lg"
                className="text-2xl font-semibold tracking-tight"
              />
            ) : (
              <span className="text-2xl font-semibold text-white/30">—</span>
            )}
          </div>

          {/* Change and Volume Row */}
          <div className="flex items-center justify-between">
            {/* Change Badge */}
            <div className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg',
              'font-medium text-sm',
              isPositive 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'bg-red-500/10 text-red-400'
            )}>
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {formatPercent(quote?.changePercent)}
            </div>

            {/* Volume */}
            <div className="text-right">
              <p className="text-xs text-white/30 mb-0.5">Volume</p>
              <p className="text-sm text-white/50 font-medium tabular-nums">
                {formatVolume(quote?.volume)}
              </p>
            </div>
          </div>

          {/* Sparkline Chart */}
          {sparklineData.length > 0 && (
            <div className="flex justify-center pt-2 opacity-80">
              <Sparkline data={sparklineData} positive={isPositive} />
            </div>
          )}
        </div>
      </div>

      {/* Subtle bottom gradient accent */}
      <div className={cn(
        'absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent',
        'opacity-0 group-hover:opacity-100 transition-opacity duration-300'
      )} />
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
      <div className={cn('text-center py-16', className)}>
        <div className="inline-flex p-4 rounded-2xl bg-white/[0.04] mb-6">
          <TrendingUp className="w-10 h-10 text-white/20" />
        </div>
        <h3 className="text-lg font-semibold text-white/60 mb-2">
          No stocks in this watchlist
        </h3>
        <p className="text-sm text-white/40">
          Add stocks to start tracking their performance
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
