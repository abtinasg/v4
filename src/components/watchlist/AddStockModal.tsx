/**
 * Add Stock Modal Component
 * 
 * Modal for searching and adding stocks to watchlist
 * - Stock search with autocomplete
 * - Recent searches
 * - Popular stocks
 */

'use client'

import React, { useState, useCallback, useEffect, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  X,
  TrendingUp,
  Clock,
  Star,
  Loader2,
  Check,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useWatchlistStore } from '@/lib/stores/watchlist-store'

// ============================================================
// TYPES
// ============================================================

interface SearchResult {
  symbol: string
  name: string
  exchange?: string
  type?: string
}

export interface AddStockModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  watchlistId?: string
}

// ============================================================
// POPULAR STOCKS
// ============================================================

const POPULAR_STOCKS: SearchResult[] = [
  { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', exchange: 'NASDAQ' },
  { symbol: 'TSLA', name: 'Tesla Inc.', exchange: 'NASDAQ' },
  { symbol: 'META', name: 'Meta Platforms Inc.', exchange: 'NASDAQ' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', exchange: 'NYSE' },
]

// ============================================================
// COMPONENT
// ============================================================

export const AddStockModal = memo(function AddStockModal({
  open,
  onOpenChange,
  watchlistId,
}: AddStockModalProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [recentSearches, setRecentSearches] = useState<SearchResult[]>([])
  const [addedSymbols, setAddedSymbols] = useState<Set<string>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  const activeWatchlistId = useWatchlistStore((s) => s.activeWatchlistId)
  const addStock = useWatchlistStore((s) => s.addStock)
  const watchlists = useWatchlistStore((s) => s.watchlists)

  const targetWatchlistId = watchlistId || activeWatchlistId

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('recent-stock-searches')
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored).slice(0, 5))
      } catch {
        // Ignore parse errors
      }
    }
  }, [])

  // Focus input when modal opens
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setAddedSymbols(new Set())
    }
  }, [open])

  // Search handler with debounce
  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)

    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(searchQuery)}&limit=50`)
      const data = await response.json()

      if (data.success && data.data && data.data.length > 0) {
        // Map API response to SearchResult format
        const mappedResults: SearchResult[] = data.data.map((item: { symbol: string; shortName?: string; longName?: string; exchange?: string; type?: string }) => ({
          symbol: item.symbol,
          name: item.longName || item.shortName || item.symbol,
          exchange: item.exchange,
          type: item.type,
        }))
        setResults(mappedResults)
      } else {
        // Fallback to filtering popular stocks
        const filtered = POPULAR_STOCKS.filter(
          (stock) =>
            stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
            stock.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        setResults(filtered)
      }
    } catch {
      // On error, show filtered popular stocks
      const filtered = POPULAR_STOCKS.filter(
        (stock) =>
          stock.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          stock.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setResults(filtered)
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounced search
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    debounceRef.current = setTimeout(() => {
      handleSearch(value)
    }, 300)
  }, [handleSearch])

  // Add stock handler - calls API then updates local store
  const handleAddStock = useCallback(async (stock: SearchResult) => {
    if (!targetWatchlistId) return

    try {
      // Call API to add stock (with plan limit check)
      const response = await fetch(`/api/watchlists/${targetWatchlistId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symbol: stock.symbol }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Check if it's a plan limit error
        if (data.code === 'PLAN_LIMIT_REACHED') {
          alert(data.message || `You've reached the maximum watchlist symbols for your plan. Upgrade to add more.`)
          return
        }
        throw new Error(data.error || 'Failed to add stock')
      }

      // Update local store on success
      addStock(targetWatchlistId, stock.symbol, stock.name)
      setAddedSymbols((prev) => new Set(prev).add(stock.symbol))

      // Save to recent searches
      const updated = [
        stock,
        ...recentSearches.filter((s) => s.symbol !== stock.symbol),
      ].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem('recent-stock-searches', JSON.stringify(updated))
    } catch (error) {
      console.error('Error adding stock:', error)
      alert(error instanceof Error ? error.message : 'Failed to add stock')
    }
  }, [targetWatchlistId, addStock, recentSearches])

  // Check if stock is already in watchlist
  const isInWatchlist = useCallback((symbol: string) => {
    const watchlist = watchlists.find((wl) => wl.id === targetWatchlistId)
    return watchlist?.stocks.some((s) => s.symbol === symbol) || false
  }, [watchlists, targetWatchlistId])

  // Get target watchlist name
  const watchlistName = watchlists.find((wl) => wl.id === targetWatchlistId)?.name || 'Watchlist'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#0a0d12] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">Add Stocks</DialogTitle>
          <DialogDescription className="text-white/50">
            Search and add stocks to {watchlistName}
          </DialogDescription>
        </DialogHeader>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder="Search by symbol or company name..."
            className={cn(
              'w-full pl-10 pr-10 py-3 rounded-lg',
              'bg-white/5 border border-white/10',
              'text-white placeholder:text-white/40',
              'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50',
            )}
          />
          {query && (
            <button
              onClick={() => {
                setQuery('')
                setResults([])
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Results Area */}
        <div className="max-h-[400px] overflow-y-auto -mx-6 px-6">
          {/* Search Results */}
          {query && (
            <div className="space-y-1">
              {isSearching ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                </div>
              ) : results.length > 0 ? (
                <AnimatePresence mode="popLayout">
                  {results.map((stock, index) => (
                    <StockResultItem
                      key={stock.symbol}
                      stock={stock}
                      index={index}
                      onAdd={handleAddStock}
                      isAdded={addedSymbols.has(stock.symbol)}
                      isInWatchlist={isInWatchlist(stock.symbol)}
                    />
                  ))}
                </AnimatePresence>
              ) : (
                <div className="text-center py-8 text-white/40">
                  No stocks found for "{query}"
                </div>
              )}
            </div>
          )}

          {/* Recent Searches */}
          {!query && recentSearches.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wide">
                <Clock className="w-3 h-3" />
                Recent Searches
              </div>
              <div className="space-y-1">
                {recentSearches.map((stock, index) => (
                  <StockResultItem
                    key={stock.symbol}
                    stock={stock}
                    index={index}
                    onAdd={handleAddStock}
                    isAdded={addedSymbols.has(stock.symbol)}
                    isInWatchlist={isInWatchlist(stock.symbol)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Popular Stocks */}
          {!query && (
            <div className="space-y-2 mt-4">
              <div className="flex items-center gap-2 text-xs text-white/40 uppercase tracking-wide">
                <Star className="w-3 h-3" />
                Popular Stocks
              </div>
              <div className="space-y-1">
                {POPULAR_STOCKS.map((stock, index) => (
                  <StockResultItem
                    key={stock.symbol}
                    stock={stock}
                    index={index}
                    onAdd={handleAddStock}
                    isAdded={addedSymbols.has(stock.symbol)}
                    isInWatchlist={isInWatchlist(stock.symbol)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <span className="text-xs text-white/40">
            {addedSymbols.size > 0 && `${addedSymbols.size} stock${addedSymbols.size > 1 ? 's' : ''} added`}
          </span>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
})

// ============================================================
// STOCK RESULT ITEM
// ============================================================

interface StockResultItemProps {
  stock: SearchResult
  index: number
  onAdd: (stock: SearchResult) => void
  isAdded: boolean
  isInWatchlist: boolean
}

const StockResultItem = memo(function StockResultItem({
  stock,
  index,
  onAdd,
  isAdded,
  isInWatchlist,
}: StockResultItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ delay: index * 0.03 }}
      className={cn(
        'flex items-center justify-between p-3 rounded-lg',
        'bg-white/5 hover:bg-white/10 transition-colors',
        'group cursor-pointer',
      )}
      onClick={() => !isInWatchlist && !isAdded && onAdd(stock)}
    >
      <div className="flex items-center gap-3">
        {/* Symbol badge */}
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center">
          <span className="text-sm font-bold text-white">
            {stock.symbol.slice(0, 2)}
          </span>
        </div>

        {/* Info */}
        <div>
          <div className="flex items-center gap-2">
            <span className="font-semibold text-white">{stock.symbol}</span>
            {stock.exchange && (
              <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-white/50">
                {stock.exchange}
              </span>
            )}
          </div>
          <p className="text-sm text-white/50 line-clamp-1">{stock.name}</p>
        </div>
      </div>

      {/* Add button */}
      {isInWatchlist || isAdded ? (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 text-green-400">
          <Check className="w-4 h-4" />
          <span className="text-xs font-medium">
            {isInWatchlist ? 'In watchlist' : 'Added'}
          </span>
        </div>
      ) : (
        <Button
          size="sm"
          variant="ghost"
          className="opacity-0 group-hover:opacity-100 transition-opacity text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
          onClick={(e) => {
            e.stopPropagation()
            onAdd(stock)
          }}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      )}
    </motion.div>
  )
})

export default AddStockModal
