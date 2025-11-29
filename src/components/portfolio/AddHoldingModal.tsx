/**
 * Add Holding Modal Component
 * 
 * Modal for adding new holdings to portfolio
 * - Stock search with autocomplete
 * - Quantity and price input
 * - Real-time price preview
 */

'use client'

import React, { useState, useCallback, useEffect, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  X,
  Loader2,
  Check,
  DollarSign,
  Hash,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'

// ============================================================
// TYPES
// ============================================================

interface SearchResult {
  symbol: string
  name: string
  exchange?: string
  price?: number
}

// ============================================================
// POPULAR STOCKS
// ============================================================

const POPULAR_STOCKS: SearchResult[] = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
]

// ============================================================
// COMPONENT
// ============================================================

export const AddHoldingModal = memo(function AddHoldingModal() {
  const isOpen = usePortfolioStore((state) => state.isAddModalOpen)
  const closeModal = usePortfolioStore((state) => state.closeAddModal)
  const addHolding = usePortfolioStore((state) => state.addHolding)
  const isLoading = usePortfolioStore((state) => state.isLoading)

  // Form state
  const [step, setStep] = useState<'search' | 'details'>('search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedStock, setSelectedStock] = useState<SearchResult | null>(null)
  const [quantity, setQuantity] = useState('')
  const [avgPrice, setAvgPrice] = useState('')
  const [error, setError] = useState<string | null>(null)

  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('search')
      setQuery('')
      setResults([])
      setSelectedStock(null)
      setQuantity('')
      setAvgPrice('')
      setError(null)
    }
  }, [isOpen])

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && step === 'search') {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, step])

  // Search stocks
  const searchStocks = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      // Use Yahoo Finance search endpoint
      const response = await fetch(
        `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(searchQuery)}&quotesCount=8&newsCount=0`
      )
      const data = await response.json()

      const quotes = data.quotes || []
      setResults(
        quotes
          .filter((q: any) => q.quoteType === 'EQUITY' && q.symbol)
          .slice(0, 6)
          .map((q: any) => ({
            symbol: q.symbol,
            name: q.shortname || q.longname || q.symbol,
            exchange: q.exchange,
          }))
      )
    } catch (err) {
      console.error('Search error:', err)
      setResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    debounceRef.current = setTimeout(() => {
      searchStocks(query)
    }, 300)

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [query, searchStocks])

  // Select stock and move to details
  const handleSelectStock = (stock: SearchResult) => {
    setSelectedStock(stock)
    setStep('details')
  }

  // Submit holding
  const handleSubmit = async () => {
    if (!selectedStock) return

    const qty = parseFloat(quantity)
    const price = parseFloat(avgPrice)

    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity')
      return
    }

    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price')
      return
    }

    setError(null)

    const success = await addHolding(selectedStock.symbol, qty, price)
    if (success) {
      closeModal()
    }
  }

  // Calculate preview values
  const previewTotal = () => {
    const qty = parseFloat(quantity) || 0
    const price = parseFloat(avgPrice) || 0
    return qty * price
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-md bg-[#0a0d12] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">
            {step === 'search' ? 'Add Holding' : `Add ${selectedStock?.symbol}`}
          </DialogTitle>
          <DialogDescription className="text-white/50">
            {step === 'search'
              ? 'Search for a stock to add to your portfolio'
              : 'Enter the quantity and average buy price'}
          </DialogDescription>
        </DialogHeader>

        <AnimatePresence mode="wait">
          {step === 'search' ? (
            <motion.div
              key="search"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <Input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by symbol or company name..."
                  className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
                {isSearching && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30 animate-spin" />
                )}
              </div>

              {/* Search Results */}
              {results.length > 0 && (
                <div className="space-y-1 max-h-60 overflow-y-auto">
                  {results.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => handleSelectStock(stock)}
                      className={cn(
                        'w-full flex items-center justify-between p-3 rounded-lg',
                        'bg-white/5 hover:bg-white/10 transition-colors',
                        'text-left'
                      )}
                    >
                      <div>
                        <div className="font-semibold text-white">{stock.symbol}</div>
                        <div className="text-xs text-white/50 truncate max-w-[250px]">
                          {stock.name}
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-white/30" />
                    </button>
                  ))}
                </div>
              )}

              {/* Popular Stocks */}
              {!query && results.length === 0 && (
                <div>
                  <p className="text-xs text-white/40 mb-2">Popular stocks</p>
                  <div className="grid grid-cols-2 gap-2">
                    {POPULAR_STOCKS.map((stock) => (
                      <button
                        key={stock.symbol}
                        onClick={() => handleSelectStock(stock)}
                        className={cn(
                          'flex items-center gap-2 p-2.5 rounded-lg',
                          'bg-white/5 hover:bg-white/10 transition-colors',
                          'text-left'
                        )}
                      >
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center shrink-0">
                          <span className="text-[10px] font-bold text-white">
                            {stock.symbol.slice(0, 2)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-white text-sm">{stock.symbol}</div>
                          <div className="text-[10px] text-white/40 truncate">{stock.name}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              {/* Selected Stock */}
              <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center shrink-0">
                  <span className="text-sm font-bold text-white">
                    {selectedStock?.symbol.slice(0, 2)}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-white">{selectedStock?.symbol}</div>
                  <div className="text-xs text-white/50">{selectedStock?.name}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setStep('search')}
                  className="ml-auto h-8 w-8 text-white/40 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Quantity Input */}
              <div className="space-y-2">
                <Label className="text-white/70">Number of Shares</Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 font-mono"
                  />
                </div>
              </div>

              {/* Average Price Input */}
              <div className="space-y-2">
                <Label className="text-white/70">Average Buy Price</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    type="number"
                    value={avgPrice}
                    onChange={(e) => setAvgPrice(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 font-mono"
                  />
                </div>
              </div>

              {/* Total Preview */}
              {previewTotal() > 0 && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                  <span className="text-sm text-white/70">Total Cost Basis</span>
                  <span className="font-semibold text-white font-mono">
                    ${previewTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {/* Error */}
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <DialogFooter className="gap-2 sm:gap-0">
          {step === 'details' && (
            <>
              <Button
                variant="ghost"
                onClick={() => setStep('search')}
                className="text-white/50 hover:text-white"
              >
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isLoading || !quantity || !avgPrice}
                className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Add Holding
                  </>
                )}
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

export default AddHoldingModal
