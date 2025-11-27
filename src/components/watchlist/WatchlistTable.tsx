/**
 * Watchlist Table Component
 * 
 * Table view for watchlist stocks with:
 * - Symbol, Name, Price, Change, Volume
 * - Mini sparkline charts
 * - Sortable columns
 * - Real-time price updates
 */

'use client'

import React, { useState, useCallback, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Bell,
  Trash2,
  ExternalLink,
  MoreHorizontal,
  TrendingUp,
  TrendingDown,
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
import { useWatchlistStore, type WatchlistStock, type SortField } from '@/lib/stores/watchlist-store'
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

interface Column {
  key: SortField | 'high' | 'low'
  label: string
  align?: 'left' | 'center' | 'right'
  width?: string
  sortable?: boolean
}

// ============================================================
// COLUMNS CONFIG
// ============================================================

const COLUMNS: Column[] = [
  { key: 'symbol', label: 'Symbol', align: 'left', sortable: true },
  { key: 'price', label: 'Price', align: 'right', sortable: true },
  { key: 'change', label: 'Change', align: 'right', sortable: true },
  { key: 'changePercent', label: '%', align: 'right', sortable: true },
  { key: 'volume', label: 'Volume', align: 'right', sortable: true },
  { key: 'high', label: 'High', align: 'right', sortable: false },
  { key: 'low', label: 'Low', align: 'right', sortable: false },
]

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
  width = 60,
  height = 24,
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

  return (
    <svg width={width} height={height} className="overflow-visible">
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
// FORMAT HELPERS
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

function formatPrice(price: number | undefined): string {
  if (price === undefined) return '—'
  return `$${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function formatChange(change: number | undefined): string {
  if (change === undefined) return '—'
  const sign = change >= 0 ? '+' : ''
  return `${sign}$${change.toFixed(2)}`
}

function formatPercent(percent: number | undefined): string {
  if (percent === undefined) return '—'
  const sign = percent >= 0 ? '+' : ''
  return `${sign}${percent.toFixed(2)}%`
}

// ============================================================
// COMPONENT
// ============================================================

export const WatchlistTable = memo(function WatchlistTable({
  watchlistId,
  onSetAlert,
  className,
}: WatchlistTableProps) {
  const watchlists = useWatchlistStore((s) => s.watchlists)
  const quotes = useWatchlistStore((s) => s.quotes)
  const removeStock = useWatchlistStore((s) => s.removeStock)
  const settings = useWatchlistStore((s) => s.settings)
  const updateSettings = useWatchlistStore((s) => s.updateSettings)

  const watchlist = watchlists.find((wl) => wl.id === watchlistId)
  const stocks = watchlist?.stocks || []

  // Sort stocks
  const sortedStocks = useMemo(() => {
    if (!settings.sortField || settings.sortField === 'custom') return stocks

    return [...stocks].sort((a, b) => {
      const quoteA = quotes[a.symbol]
      const quoteB = quotes[b.symbol]

      let valueA: number | string
      let valueB: number | string

      switch (settings.sortField) {
        case 'symbol':
          valueA = a.symbol
          valueB = b.symbol
          break
        case 'name':
          valueA = a.name
          valueB = b.name
          break
        case 'price':
          valueA = quoteA?.price ?? 0
          valueB = quoteB?.price ?? 0
          break
        case 'change':
          valueA = quoteA?.change ?? 0
          valueB = quoteB?.change ?? 0
          break
        case 'changePercent':
          valueA = quoteA?.changePercent ?? 0
          valueB = quoteB?.changePercent ?? 0
          break
        case 'volume':
          valueA = quoteA?.volume ?? 0
          valueB = quoteB?.volume ?? 0
          break
        default:
          return 0
      }

      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return settings.sortDirection === 'asc'
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA)
      }

      return settings.sortDirection === 'asc'
        ? (valueA as number) - (valueB as number)
        : (valueB as number) - (valueA as number)
    })
  }, [stocks, quotes, settings.sortField, settings.sortDirection])

  // Handle sort
  const handleSort = useCallback((field: SortField) => {
    if (settings.sortField === field) {
      updateSettings({
        sortDirection: settings.sortDirection === 'asc' ? 'desc' : 'asc'
      })
    } else {
      updateSettings({
        sortField: field,
        sortDirection: 'desc'
      })
    }
  }, [settings.sortField, settings.sortDirection, updateSettings])

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (settings.sortField !== field) {
      return <ArrowUpDown className="w-3 h-3 opacity-50" />
    }
    return settings.sortDirection === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-cyan-400" />
    ) : (
      <ArrowDown className="w-3 h-3 text-cyan-400" />
    )
  }

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
    <div className={cn('overflow-x-auto', className)}>
      <table className="w-full">
        {/* Header */}
        <thead>
          <tr className="border-b border-white/10">
            {COLUMNS.map((column) => (
              <th
                key={column.key}
                className={cn(
                  'px-4 py-3 text-xs font-medium text-white/50 uppercase tracking-wide',
                  column.align === 'right' && 'text-right',
                  column.align === 'center' && 'text-center',
                  column.sortable && 'cursor-pointer hover:text-white/80 transition-colors'
                )}
                onClick={() => column.sortable && column.key !== 'high' && column.key !== 'low' && handleSort(column.key)}
              >
                <div className={cn(
                  'flex items-center gap-1',
                  column.align === 'right' && 'justify-end',
                  column.align === 'center' && 'justify-center'
                )}>
                  {column.label}
                  {column.sortable && column.key !== 'high' && column.key !== 'low' && getSortIcon(column.key)}
                </div>
              </th>
            ))}
            <th className="px-4 py-3 w-12" /> {/* Actions */}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          <AnimatePresence mode="popLayout">
            {sortedStocks.map((stock, index) => (
              <StockRow
                key={stock.symbol}
                stock={stock}
                quote={quotes[stock.symbol]}
                index={index}
                watchlistId={watchlistId}
                onRemove={() => removeStock(watchlistId, stock.symbol)}
                onSetAlert={onSetAlert}
              />
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  )
})

// ============================================================
// STOCK ROW
// ============================================================

interface StockRowProps {
  stock: WatchlistStock
  quote?: {
    price: number
    change: number
    changePercent: number
    volume?: number
    dayHigh?: number
    dayLow?: number
    previousClose?: number
  }
  index: number
  watchlistId: string
  onRemove: () => void
  onSetAlert?: (symbol: string) => void
}

const StockRow = memo(function StockRow({
  stock,
  quote,
  index,
  watchlistId,
  onRemove,
  onSetAlert,
}: StockRowProps) {
  const isPositive = (quote?.change ?? 0) >= 0

  // Generate fake sparkline data (in production, this would come from historical data)
  const sparklineData = useMemo(() => {
    if (!quote?.price) return []
    const base = quote.previousClose || quote.price
    return Array.from({ length: 20 }, (_, i) => {
      const progress = i / 19
      const noise = (Math.random() - 0.5) * 2
      return base + (quote.price - base) * progress + noise
    })
  }, [quote?.price, quote?.previousClose])

  return (
    <motion.tr
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ delay: index * 0.02 }}
      className="border-b border-white/5 hover:bg-white/5 transition-colors group"
    >
      {/* Symbol & Name */}
      <td className="px-4 py-3">
        <Link
          href={`/dashboard/stock-analysis?symbol=${stock.symbol}`}
          className="flex items-center gap-3 group/link"
        >
          {/* Symbol badge */}
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-white">
              {stock.symbol.slice(0, 2)}
            </span>
          </div>

          {/* Name */}
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white group-hover/link:text-cyan-400 transition-colors">
                {stock.symbol}
              </span>
              <ExternalLink className="w-3 h-3 text-white/30 opacity-0 group-hover/link:opacity-100 transition-opacity" />
            </div>
            {stock.name && (
              <p className="text-xs text-white/50 line-clamp-1 max-w-[150px]">
                {stock.name}
              </p>
            )}
          </div>
        </Link>
      </td>

      {/* Price */}
      <td className="px-4 py-3 text-right">
        {quote?.price !== undefined ? (
          <RealTimePrice
            price={quote.price}
            previousPrice={quote?.previousClose}
            className="justify-end"
          />
        ) : (
          <span className="text-white/40">—</span>
        )}
      </td>

      {/* Change */}
      <td className="px-4 py-3 text-right">
        <span className={cn(
          'font-medium',
          isPositive ? 'text-green-400' : 'text-red-400'
        )}>
          {formatChange(quote?.change)}
        </span>
      </td>

      {/* Change % */}
      <td className="px-4 py-3 text-right">
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
      </td>

      {/* Volume */}
      <td className="px-4 py-3 text-right text-white/60">
        {formatVolume(quote?.volume)}
      </td>

      {/* Day High */}
      <td className="px-4 py-3 text-right text-white/60">
        {formatPrice(quote?.dayHigh)}
      </td>

      {/* Day Low */}
      <td className="px-4 py-3 text-right text-white/60">
        {formatPrice(quote?.dayLow)}
      </td>

      {/* Actions */}
      <td className="px-4 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
            >
              <MoreHorizontal className="w-4 h-4" />
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
              onClick={onRemove}
              className="text-red-400 hover:text-red-300 focus:text-red-300"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Remove
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </motion.tr>
  )
})

export default WatchlistTable
