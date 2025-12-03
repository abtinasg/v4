/**
 * Watchlist Table Component - Premium Fintech Design
 * 
 * Premium table view with:
 * - 35% more negative space (increased row padding)
 * - Soft hover states with glass morphism
 * - Clean typography hierarchy
 * - Right-aligned numbers
 * - Calm color accents (green/red only for changes)
 * - Smooth transitions
 */

'use client'

import React, { memo, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Bell,
  ExternalLink,
  Trash2,
  MoreVertical,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
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

export interface WatchlistTableProps {
  watchlistId: string
  onSetAlert?: (symbol: string) => void
  className?: string
}

type SortField = 'symbol' | 'price' | 'change' | 'changePercent' | 'volume' | 'marketCap'
type SortDirection = 'asc' | 'desc'

// ============================================================
// MINI SPARKLINE
// ============================================================

interface SparklineProps {
  data: number[]
  width?: number
  height?: number
  positive?: boolean
  className?: string
}

const Sparkline = memo(function Sparkline({
  data,
  width = 100,
  height = 36,
  positive = true,
  className,
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

  return (
    <svg width={width} height={height} className={cn('overflow-visible', className)}>
      <polyline
        points={points}
        fill="none"
        stroke={positive ? '#10b981' : '#ef4444'}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
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

function formatMarketCap(marketCap: number | undefined): string {
  if (!marketCap) return '—'
  if (marketCap >= 1_000_000_000_000) {
    return `$${(marketCap / 1_000_000_000_000).toFixed(2)}T`
  }
  if (marketCap >= 1_000_000_000) {
    return `$${(marketCap / 1_000_000_000).toFixed(2)}B`
  }
  if (marketCap >= 1_000_000) {
    return `$${(marketCap / 1_000_000).toFixed(2)}M`
  }
  return `$${marketCap.toLocaleString()}`
}

function formatPrice(price: number | undefined): string {
  if (price === undefined) return '—'
  return `$${price.toFixed(2)}`
}

function formatPercent(percent: number | undefined): string {
  if (percent === undefined) return '—'
  const sign = percent >= 0 ? '+' : ''
  return `${sign}${percent.toFixed(2)}%`
}

// ============================================================
// SORTABLE HEADER
// ============================================================

interface SortableHeaderProps {
  label: string
  field: SortField
  currentField: SortField
  direction: SortDirection
  onSort: (field: SortField) => void
  align?: 'left' | 'right'
}

function SortableHeader({
  label,
  field,
  currentField,
  direction,
  onSort,
  align = 'left',
}: SortableHeaderProps) {
  const isActive = currentField === field

  return (
    <button
      onClick={() => onSort(field)}
      className={cn(
        'group flex items-center gap-2 font-medium text-sm text-white/40',
        'hover:text-white/60 transition-colors duration-200',
        align === 'right' && 'justify-end',
        isActive && 'text-white/60'
      )}
    >
      <span>{label}</span>
      <div className={cn(
        'transition-all duration-200',
        isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-40'
      )}>
        {isActive && direction === 'desc' ? (
          <ArrowDown className="w-3.5 h-3.5" />
        ) : isActive && direction === 'asc' ? (
          <ArrowUp className="w-3.5 h-3.5" />
        ) : (
          <ArrowUpDown className="w-3.5 h-3.5" />
        )}
      </div>
    </button>
  )
}

// ============================================================
// STOCK ROW
// ============================================================

interface StockRowProps {
  stock: WatchlistStock
  quote?: StockQuote
  watchlistId: string
  onSetAlert?: (symbol: string) => void
}

const StockRow = memo(function StockRow({
  stock,
  quote,
  watchlistId,
  onSetAlert,
}: StockRowProps) {
  const removeStock = useWatchlistStore((s) => s.removeStock)
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
    <motion.tr
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -5 }}
      className={cn(
        'group relative',
        'border-b border-white/[0.04]',
        'hover:bg-white/[0.02]',
        'transition-colors duration-200'
      )}
    >
      {/* Symbol & Name */}
      <td className="py-4 pl-6 pr-4">
        <Link
          href={`/dashboard/stock-analysis/${stock.symbol}`}
          className="flex items-center gap-4 group/link"
        >
          {/* Symbol Badge */}
          <div className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center shrink-0',
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
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base text-white group-hover/link:text-cyan-400 transition-colors">
                {stock.symbol}
              </span>
              <ExternalLink className="w-3.5 h-3.5 text-white/20 opacity-0 group-hover/link:opacity-100 transition-opacity" />
            </div>
            {stock.name && (
              <p className="text-sm text-white/40 truncate max-w-[200px]">
                {stock.name}
              </p>
            )}
          </div>
        </Link>
      </td>

      {/* Price */}
      <td className="py-4 px-4 text-right">
        {quote?.price !== undefined ? (
          <div className="flex flex-col items-end gap-0.5">
            <RealTimePrice
              price={quote.price}
              previousPrice={quote?.previousClose}
              size="lg"
              className="text-base font-semibold"
            />
            <span className="text-xs text-white/30">
              {formatPrice(quote.previousClose)}
            </span>
          </div>
        ) : (
          <span className="text-base font-semibold text-white/30">—</span>
        )}
      </td>

      {/* Change $ */}
      <td className="py-4 px-4 text-right">
        {quote?.change !== undefined ? (
          <span className={cn(
            'text-base font-medium tabular-nums',
            isPositive ? 'text-emerald-400' : 'text-red-400'
          )}>
            {isPositive ? '+' : ''}{quote.change.toFixed(2)}
          </span>
        ) : (
          <span className="text-base text-white/30">—</span>
        )}
      </td>

      {/* Change % */}
      <td className="py-4 px-4 text-right">
        {quote?.changePercent !== undefined ? (
          <div className="flex items-center justify-end">
            <div className={cn(
              'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg',
              'font-medium text-sm tabular-nums',
              isPositive 
                ? 'bg-emerald-500/10 text-emerald-400' 
                : 'bg-red-500/10 text-red-400'
            )}>
              {isPositive ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {formatPercent(quote.changePercent)}
            </div>
          </div>
        ) : (
          <span className="text-sm text-white/30">—</span>
        )}
      </td>

      {/* Volume */}
      <td className="py-4 px-4 text-right">
        <span className="text-sm text-white/50 font-medium tabular-nums">
          {formatVolume(quote?.volume)}
        </span>
      </td>

      {/* Market Cap */}
      <td className="py-4 px-4 text-right">
        <span className="text-sm text-white/50 font-medium tabular-nums">
          {formatMarketCap(quote?.marketCap)}
        </span>
      </td>

      {/* Chart */}
      <td className="py-4 px-4">
        <div className="flex justify-center opacity-60 group-hover:opacity-100 transition-opacity">
          <Sparkline data={sparklineData} positive={isPositive} width={100} height={32} />
        </div>
      </td>

      {/* Actions */}
      <td className="py-4 pl-4 pr-6">
        <div className="flex items-center justify-end gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  'h-8 w-8 p-0 rounded-lg',
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
      </td>
    </motion.tr>
  )
})

// ============================================================
// WATCHLIST TABLE
// ============================================================

export const WatchlistTable = memo(function WatchlistTable({
  watchlistId,
  onSetAlert,
  className,
}: WatchlistTableProps) {
  const watchlists = useWatchlistStore((s) => s.watchlists)
  const quotes = useWatchlistStore((s) => s.quotes)
  const watchlist = watchlists.find((wl) => wl.id === watchlistId)
  const stocks = watchlist?.stocks || []

  const [sortField, setSortField] = useState<SortField>('symbol')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Sort handler
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Sorted stocks
  const sortedStocks = useMemo(() => {
    return [...stocks].sort((a, b) => {
      const quoteA = quotes[a.symbol]
      const quoteB = quotes[b.symbol]

      let compareValue = 0

      switch (sortField) {
        case 'symbol':
          compareValue = a.symbol.localeCompare(b.symbol)
          break
        case 'price':
          compareValue = (quoteA?.price ?? 0) - (quoteB?.price ?? 0)
          break
        case 'change':
          compareValue = (quoteA?.change ?? 0) - (quoteB?.change ?? 0)
          break
        case 'changePercent':
          compareValue = (quoteA?.changePercent ?? 0) - (quoteB?.changePercent ?? 0)
          break
        case 'volume':
          compareValue = (quoteA?.volume ?? 0) - (quoteB?.volume ?? 0)
          break
        case 'marketCap':
          compareValue = (quoteA?.marketCap ?? 0) - (quoteB?.marketCap ?? 0)
          break
      }

      return sortDirection === 'asc' ? compareValue : -compareValue
    })
  }, [stocks, quotes, sortField, sortDirection])

  if (stocks.length === 0) {
    return (
      <div className={cn('text-center py-16', className)}>
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
    <div className={cn('w-full overflow-x-auto', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/[0.06]">
            <th className="py-4 pl-6 pr-4 text-left">
              <SortableHeader
                label="Stock"
                field="symbol"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
              />
            </th>
            <th className="py-4 px-4 text-right">
              <SortableHeader
                label="Price"
                field="price"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="right"
              />
            </th>
            <th className="py-4 px-4 text-right">
              <SortableHeader
                label="Change"
                field="change"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="right"
              />
            </th>
            <th className="py-4 px-4 text-right">
              <SortableHeader
                label="Change %"
                field="changePercent"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="right"
              />
            </th>
            <th className="py-4 px-4 text-right">
              <SortableHeader
                label="Volume"
                field="volume"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="right"
              />
            </th>
            <th className="py-4 px-4 text-right">
              <SortableHeader
                label="Market Cap"
                field="marketCap"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                align="right"
              />
            </th>
            <th className="py-4 px-4 text-center">
              <span className="font-medium text-sm text-white/40">Chart</span>
            </th>
            <th className="py-4 pl-4 pr-6 text-right">
              <span className="font-medium text-sm text-white/40">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence>
            {sortedStocks.map((stock) => (
              <StockRow
                key={stock.symbol}
                stock={stock}
                quote={quotes[stock.symbol]}
                watchlistId={watchlistId}
                onSetAlert={onSetAlert}
              />
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  )
})

export default WatchlistTable
