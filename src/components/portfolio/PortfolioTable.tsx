/**
 * Portfolio Table Component
 * 
 * Displays holdings in a sortable table with real-time prices
 * - Sorting by various columns
 * - Real-time price flash animations
 * - Edit/Delete actions
 */

'use client'

import React, { memo, useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  ExternalLink,
  Search,
  LayoutGrid,
  List,
  Plus,
  ArrowUpRight,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { RealTimePrice } from '@/components/watchlist/RealTimePrice'
import {
  usePortfolioStore,
  useSortedHoldings,
  type PortfolioHolding,
} from '@/lib/stores/portfolio-store'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

// ============================================================
// TYPES
// ============================================================

type SortField = 'symbol' | 'value' | 'gainLoss' | 'gainLossPercent' | 'dayGainLoss'

interface ColumnHeader {
  field: SortField
  label: string
  align?: 'left' | 'right'
  className?: string
}

interface StockSearchSuggestion {
  symbol: string
  name: string
  exchange?: string
  type?: string
}

// ============================================================
// TABLE HEADERS
// ============================================================

const columns: ColumnHeader[] = [
  { field: 'symbol', label: 'Symbol', align: 'left' },
  { field: 'value', label: 'Market Value', align: 'right' },
  { field: 'gainLoss', label: 'Total P&L', align: 'right' },
  { field: 'gainLossPercent', label: 'Return %', align: 'right' },
  { field: 'dayGainLoss', label: 'Day Change', align: 'right' },
]

// ============================================================
// HOLDING ROW
// ============================================================

interface HoldingRowProps {
  holding: PortfolioHolding
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

const HoldingRow = memo(function HoldingRow({
  holding,
  onEdit,
  onDelete,
}: HoldingRowProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    const formatted = Math.abs(value).toFixed(2)
    return value >= 0 ? `+${formatted}%` : `-${formatted}%`
  }

  return (
    <>
      <tr className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
        {/* Symbol & Name */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">{holding.symbol.slice(0, 2)}</span>
            </div>
            <div className="min-w-0">
              <Link
                href={`/dashboard/stock-analysis?symbol=${holding.symbol}`}
                className="font-semibold text-white hover:text-cyan-400 transition-colors flex items-center gap-1 group"
              >
                {holding.symbol}
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <p className="text-xs text-white/40 truncate max-w-[150px]">{holding.name}</p>
            </div>
          </div>
        </td>

        {/* Shares & Price */}
        <td className="py-3 px-4 hidden sm:table-cell">
          <div className="text-right">
            <div className="text-sm text-white font-medium">{holding.quantity.toFixed(2)} shares</div>
            <div className="text-xs text-white/40">@ {formatCurrency(holding.avgBuyPrice)}</div>
          </div>
        </td>

        {/* Current Price */}
        <td className="py-3 px-4">
          <div className="flex justify-end">
            <RealTimePrice
              price={holding.currentPrice}
              previousPrice={holding.previousClose}
              change={holding.change}
              changePercent={holding.changePercent}
              showChange={false}
              showPercent={false}
              size="sm"
            />
          </div>
        </td>

        {/* Market Value */}
        <td className="py-3 px-4">
          <div className="text-right font-mono tabular-nums">
            <div className="text-sm text-white font-medium">
              {formatCurrency(holding.totalValue)}
            </div>
            <div className="text-xs text-white/40">
              Cost: {formatCurrency(holding.totalCost)}
            </div>
          </div>
        </td>

        {/* Total P&L */}
        <td className="py-3 px-4">
          <div className={cn(
            'text-right font-mono tabular-nums',
            holding.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'
          )}>
            <div className="text-sm font-medium flex items-center justify-end gap-1">
              {holding.gainLoss >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {formatCurrency(Math.abs(holding.gainLoss))}
            </div>
            <div className="text-xs opacity-75">
              {formatPercent(holding.gainLossPercent)}
            </div>
          </div>
        </td>

        {/* Day Change */}
        <td className="py-3 px-4 hidden md:table-cell">
          <div className={cn(
            'text-right font-mono tabular-nums',
            holding.dayGainLoss >= 0 ? 'text-green-400' : 'text-red-400'
          )}>
            <div className="text-sm font-medium">
              {holding.dayGainLoss >= 0 ? '+' : ''}{formatCurrency(holding.dayGainLoss)}
            </div>
            <div className="text-xs opacity-75">
              {formatPercent(holding.dayGainLossPercent)}
            </div>
          </div>
        </td>

        {/* Actions */}
        <td className="py-3 px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-[#0f1419] border-white/10">
              <DropdownMenuItem
                onClick={() => onEdit(holding.id)}
                className="text-white/70 hover:text-white focus:text-white"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-400 hover:text-red-300 focus:text-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-[#0f1419] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Holding</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to remove <span className="font-semibold text-white">{holding.symbol}</span> from your portfolio? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(holding.id)
                setShowDeleteConfirm(false)
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
})

// ============================================================
// HOLDING CARD (ALTERNATE VIEW)
// ============================================================

const HoldingCard = memo(function HoldingCard({
  holding,
  onEdit,
  onDelete,
}: HoldingRowProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)

  const formatPercent = (value: number) => `${value >= 0 ? '+' : ''}${Math.abs(value).toFixed(2)}%`

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-white/10 bg-white/5 p-4 flex flex-col gap-4"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-white/50">{holding.name}</p>
            <Link
              href={`/dashboard/stock-analysis?symbol=${holding.symbol}`}
              className="text-xl font-semibold text-white hover:text-cyan-400 transition-colors"
            >
              {holding.symbol}
            </Link>
          </div>
          <div className="text-right">
            <p className="text-xs text-white/40">Current value</p>
            <p className="text-lg font-mono text-white">{formatCurrency(holding.totalValue)}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-xs text-white/40">Shares</p>
            <p className="font-semibold text-white">{holding.quantity.toFixed(2)}</p>
            <p className="text-xs text-white/40">Avg {formatCurrency(holding.avgBuyPrice)}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3 text-right">
            <p className="text-xs text-white/40">Day change</p>
            <p className={cn(
              'font-semibold',
              holding.dayGainLoss >= 0 ? 'text-emerald-300' : 'text-rose-300'
            )}>
              {holding.dayGainLoss >= 0 ? '+' : ''}{formatCurrency(holding.dayGainLoss)}
            </p>
            <p className="text-xs text-white/40">{formatPercent(holding.dayGainLossPercent)}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs text-white/40">Unrealized P&L</p>
            <p className={cn(
              'text-lg font-semibold flex items-center gap-2',
              holding.gainLoss >= 0 ? 'text-emerald-300' : 'text-rose-300'
            )}>
              {holding.gainLoss >= 0 ? '+' : ''}{formatCurrency(holding.gainLoss)}
              <span className="text-xs font-normal">
                {formatPercent(holding.gainLossPercent)}
              </span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white/50 hover:text-white hover:bg-white/10"
              onClick={() => onEdit(holding.id)}
            >
              <Pencil className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </motion.div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-[#0f1419] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Holding</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Remove <span className="font-semibold text-white">{holding.symbol}</span> from your portfolio?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(holding.id)
                setShowDeleteConfirm(false)
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
})

// ============================================================
// PORTFOLIO TABLE COMPONENT
// ============================================================

export const PortfolioTable = memo(function PortfolioTable() {
  const holdings = useSortedHoldings()
  const settings = usePortfolioStore((state) => state.settings)
  const updateSettings = usePortfolioStore((state) => state.updateSettings)
  const openEditModal = usePortfolioStore((state) => state.openEditModal)
  const deleteHolding = usePortfolioStore((state) => state.deleteHolding)
  const openAddModal = usePortfolioStore((state) => state.openAddModal)
  const isLoading = usePortfolioStore((state) => state.isLoading)
  const summary = usePortfolioStore((state) => state.summary)
  const router = useRouter()

  const [searchTerm, setSearchTerm] = useState('')
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | 'YTD'>('1D')
  const [globalResults, setGlobalResults] = useState<StockSearchSuggestion[]>([])
  const [isGlobalSearching, setIsGlobalSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const searchRef = useRef<HTMLDivElement | null>(null)

  const handleSort = (field: SortField) => {
    if (settings.sortBy === field) {
      updateSettings({ sortDirection: settings.sortDirection === 'asc' ? 'desc' : 'asc' })
    } else {
      updateSettings({ sortBy: field, sortDirection: 'desc' })
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (settings.sortBy !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />
    }
    return settings.sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
    )
  }

  const filteredHoldings = useMemo(() => {
    if (!searchTerm) return holdings
    return holdings.filter((holding) =>
      `${holding.symbol} ${holding.name}`.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [holdings, searchTerm])

  const timeframeBadges: Record<'1D' | '1W' | '1M' | 'YTD', string> = {
    '1D': 'Intraday momentum',
    '1W': 'Weekly outlook',
    '1M': 'Monthly trend',
    'YTD': 'Year to date',
  }

  const showGlobalSearch =
    searchTerm.trim().length >= 2 && (isSearchFocused || globalResults.length > 0 || isGlobalSearching)

  useEffect(() => {
    if (searchTerm.trim().length < 2) {
      setGlobalResults([])
      setIsGlobalSearching(false)
      setSearchError(null)
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(async () => {
      setIsGlobalSearching(true)
      try {
        const response = await fetch(
          `/api/stocks/search?q=${encodeURIComponent(searchTerm)}&limit=50`,
          { signal: controller.signal }
        )

        if (!response.ok) {
          throw new Error('Search failed')
        }

        const data = await response.json()

        if (data.success && Array.isArray(data.data)) {
          setGlobalResults(
            data.data.map((item: { symbol: string; longName?: string; shortName?: string; exchange?: string; type?: string }) => ({
              symbol: item.symbol,
              name: item.longName || item.shortName || item.symbol,
              exchange: item.exchange,
              type: item.type,
            }))
          )
          setSearchError(null)
        } else {
          setGlobalResults([])
          setSearchError('No matches found')
        }
      } catch (error) {
        if (controller.signal.aborted) return
        setGlobalResults([])
        setSearchError('Unable to search right now')
      } finally {
        if (!controller.signal.aborted) {
          setIsGlobalSearching(false)
        }
      }
    }, 250)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [searchTerm])

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false)
      }
    }

    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleQuickAdd = (result: StockSearchSuggestion) => {
    openAddModal(result.symbol, result.name, result.exchange)
    setIsSearchFocused(false)
    setSearchTerm('')
  }

  const handleNavigateToAnalysis = (symbol: string) => {
    router.push(`/dashboard/stock-analysis?symbol=${symbol}`)
    setIsSearchFocused(false)
  }

  const toolbar = (
    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-4">
      <div>
        <p className="text-xs uppercase tracking-[0.25em] text-white/40">Positions</p>
        <div className="flex items-center gap-2 mt-1 text-sm text-white/60">
          <span>{filteredHoldings.length} visible</span>
          <span className="text-white/20">•</span>
          <span>{summary.holdingsCount} total</span>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-3 w-full md:w-auto">
        <div className="flex gap-1 bg-white/5 rounded-full p-1 text-xs text-white/60">
          {(['1D', '1W', '1M', 'YTD'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={cn(
                'px-3 py-1 rounded-full transition-colors',
                timeframe === tf ? 'bg-white/20 text-white font-semibold' : 'hover:bg-white/10'
              )}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <Input
            value={searchTerm}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            placeholder="Search entire market or filter holdings"
            className="pl-9 bg-white/5 border-white/10 text-white placeholder:text-white/40"
          />
          {showGlobalSearch && (
            <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] z-30 rounded-2xl border border-white/10 bg-[#0a0f16] shadow-2xl">
              <div className="px-4 py-3 border-b border-white/5 text-[10px] font-semibold tracking-[0.4em] uppercase text-white/40">
                Global Stock Search
              </div>
              <div className="max-h-72 overflow-y-auto">
                {isGlobalSearching ? (
                  <div className="flex items-center justify-center gap-2 py-6 text-white/60">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Searching...
                  </div>
                ) : globalResults.length > 0 ? (
                  globalResults.map((result) => (
                    <div
                      key={result.symbol}
                      className="flex items-center justify-between gap-3 px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-white">{result.symbol}</span>
                          {result.type && (
                            <span className="text-[10px] uppercase tracking-wide text-white/40">
                              {result.type}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-white/50 truncate">{result.name}</p>
                        {result.exchange && (
                          <p className="text-[10px] text-white/30">{result.exchange}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                          onClick={() => handleQuickAdd(result)}
                          aria-label={`Add ${result.symbol}`}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10"
                          onClick={() => handleNavigateToAnalysis(result.symbol)}
                          aria-label={`Open ${result.symbol} analysis`}
                        >
                          <ArrowUpRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-6 text-sm text-white/50">
                    {searchError || 'No matches found. Try a different ticker or name.'}
                  </div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-white/5 text-[11px] text-white/40">
                Showing up to 50 matches · Powered by Yahoo Finance
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1">
          <button
            onClick={() => updateSettings({ viewMode: 'table' })}
            className={cn(
              'px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm transition-colors',
              settings.viewMode === 'table'
                ? 'bg-white/20 text-white'
                : 'text-white/50 hover:text-white'
            )}
          >
            <List className="w-4 h-4" /> Table
          </button>
          <button
            onClick={() => updateSettings({ viewMode: 'card' })}
            className={cn(
              'px-3 py-1.5 rounded-lg flex items-center gap-1 text-sm transition-colors',
              settings.viewMode === 'card'
                ? 'bg-white/20 text-white'
                : 'text-white/50 hover:text-white'
            )}
          >
            <LayoutGrid className="w-4 h-4" /> Cards
          </button>
        </div>
      </div>
    </div>
  )

  if (filteredHoldings.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col gap-6">
        {toolbar}
        <div className="flex flex-col items-center justify-center py-16 text-center rounded-2xl border border-dashed border-white/20">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <TrendingUp className="w-8 h-8 text-white/20" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">No matching holdings</h3>
          <p className="text-sm text-white/50 max-w-xs">
            Adjust your filters or add a new position to see it here.
          </p>
        </div>
      </div>
    )
  }

  if (settings.viewMode === 'card') {
    return (
      <div>
        {toolbar}
        <p className="text-xs text-white/40 mb-3">{timeframeBadges[timeframe]}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredHoldings.map((holding) => (
            <HoldingCard
              key={holding.id}
              holding={holding}
              onEdit={openEditModal}
              onDelete={deleteHolding}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      {toolbar}
      <p className="text-xs text-white/40 mb-2">{timeframeBadges[timeframe]}</p>
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="py-3 px-4 text-left">
              <button
                onClick={() => handleSort('symbol')}
                className="flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white transition-colors"
              >
                Asset
                <SortIcon field="symbol" />
              </button>
            </th>
            <th className="py-3 px-4 text-right hidden sm:table-cell">
              <span className="text-xs font-medium text-white/50">Shares</span>
            </th>
            <th className="py-3 px-4 text-right">
              <span className="text-xs font-medium text-white/50">Price</span>
            </th>
            <th className="py-3 px-4 text-right">
              <button
                onClick={() => handleSort('value')}
                className="flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white transition-colors ml-auto"
              >
                Value
                <SortIcon field="value" />
              </button>
            </th>
            <th className="py-3 px-4 text-right">
              <button
                onClick={() => handleSort('gainLoss')}
                className="flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white transition-colors ml-auto"
              >
                P&L
                <SortIcon field="gainLoss" />
              </button>
            </th>
            <th className="py-3 px-4 text-right hidden md:table-cell">
              <button
                onClick={() => handleSort('dayGainLoss')}
                className="flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white transition-colors ml-auto"
              >
                Day
                <SortIcon field="dayGainLoss" />
              </button>
            </th>
            <th className="py-3 px-4 w-10"></th>
          </tr>
        </thead>
        <tbody>
          {filteredHoldings.map((holding) => (
            <HoldingRow
              key={holding.id}
              holding={holding}
              onEdit={openEditModal}
              onDelete={deleteHolding}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
})

export default PortfolioTable
