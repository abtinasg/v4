/**
 * Add Holding Modal Component
 * 
 * Professional-grade modal for adding new holdings to portfolio
 * Features:
 * - Real-time validation with visual feedback
 * - "Use current price" auto-fill
 * - Auto-calculated total investment
 * - Mobile-optimized with sticky CTA
 * - Dark theme with blur/glow effects
 */

'use client'

import React, { useState, useCallback, useEffect, useRef, memo, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Plus,
  X,
  Loader2,
  Check,
  DollarSign,
  Hash,
  Zap,
  RotateCcw,
  TrendingUp,
  AlertCircle,
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

interface ValidationState {
  shares: { valid: boolean; message: string }
  price: { valid: boolean; message: string }
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
// HELPER FUNCTIONS
// ============================================================

/**
 * Format number with proper locale and decimal places
 */
const formatCurrency = (value: number): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/**
 * Parse and validate numeric input - strips non-numeric except decimal
 */
const parseNumericInput = (value: string): string => {
  // Allow only numbers and one decimal point
  const cleaned = value.replace(/[^0-9.]/g, '')
  const parts = cleaned.split('.')
  if (parts.length > 2) {
    return parts[0] + '.' + parts.slice(1).join('')
  }
  return cleaned
}

// ============================================================
// COMPONENT
// ============================================================

export const AddHoldingModal = memo(function AddHoldingModal() {
  const isOpen = usePortfolioStore((state) => state.isAddModalOpen)
  const closeModal = usePortfolioStore((state) => state.closeAddModal)
  const addHolding = usePortfolioStore((state) => state.addHolding)
  const isLoading = usePortfolioStore((state) => state.isLoading)
  const addModalPrefill = usePortfolioStore((state) => state.addModalPrefill)

  // Prevent hydration mismatch by only rendering after mount
  const [isMounted, setIsMounted] = useState(false)

  // Form state
  const [step, setStep] = useState<'search' | 'details'>('search')
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedStock, setSelectedStock] = useState<SearchResult | null>(null)
  const [quantity, setQuantity] = useState('')
  const [avgPrice, setAvgPrice] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  // New state for current price fetching
  const [currentPrice, setCurrentPrice] = useState<number | null>(null)
  const [isFetchingPrice, setIsFetchingPrice] = useState(false)
  
  // Touch state for validation feedback
  const [touched, setTouched] = useState({ shares: false, price: false })

  const inputRef = useRef<HTMLInputElement>(null)
  const sharesInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()

  // Set mounted on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // ============================================================
  // VALIDATION
  // ============================================================
  
  const validation = useMemo((): ValidationState => {
    const sharesNum = parseFloat(quantity)
    const priceNum = parseFloat(avgPrice)
    
    return {
      shares: {
        valid: !isNaN(sharesNum) && sharesNum > 0,
        message: !quantity 
          ? 'Enter number of shares' 
          : isNaN(sharesNum) 
            ? 'Invalid number' 
            : sharesNum <= 0 
              ? 'Must be greater than 0' 
              : ''
      },
      price: {
        valid: !isNaN(priceNum) && priceNum > 0,
        message: !avgPrice 
          ? 'Enter average buy price' 
          : isNaN(priceNum) 
            ? 'Invalid price' 
            : priceNum <= 0 
              ? 'Must be greater than 0' 
              : ''
      }
    }
  }, [quantity, avgPrice])

  const isFormValid = validation.shares.valid && validation.price.valid

  // ============================================================
  // COMPUTED VALUES
  // ============================================================
  
  const totalInvestment = useMemo(() => {
    const qty = parseFloat(quantity) || 0
    const price = parseFloat(avgPrice) || 0
    return qty * price
  }, [quantity, avgPrice])

  // ============================================================
  // EFFECTS
  // ============================================================

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
      setCurrentPrice(null)
      setTouched({ shares: false, price: false })
    }
  }, [isOpen])

  // Focus input when modal opens or step changes
  useEffect(() => {
    if (isOpen && step === 'search') {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else if (isOpen && step === 'details') {
      setTimeout(() => sharesInputRef.current?.focus(), 100)
    }
  }, [isOpen, step])

  // Prefill selected stock when launched from quick search
  useEffect(() => {
    if (isOpen && addModalPrefill) {
      const preset: SearchResult = {
        symbol: addModalPrefill.symbol,
        name: addModalPrefill.name || addModalPrefill.symbol,
        exchange: addModalPrefill.exchange,
      }
      setSelectedStock(preset)
      setStep('details')
      setQuery(addModalPrefill.symbol)
    }
  }, [isOpen, addModalPrefill])

  // Fetch current price when stock is selected
  useEffect(() => {
    if (selectedStock && step === 'details') {
      fetchCurrentPrice(selectedStock.symbol)
    }
  }, [selectedStock, step])

  // ============================================================
  // HANDLERS
  // ============================================================

  // Fetch current stock price
  const fetchCurrentPrice = async (symbol: string) => {
    setIsFetchingPrice(true)
    try {
      const response = await fetch(`/api/stock/${symbol}/quote`)
      const data = await response.json()
      if (data.success && data.data?.regularMarketPrice) {
        setCurrentPrice(data.data.regularMarketPrice)
      }
    } catch (err) {
      console.error('Failed to fetch price:', err)
    } finally {
      setIsFetchingPrice(false)
    }
  }

  // Search stocks
  const searchStocks = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(
        `/api/stocks/search?q=${encodeURIComponent(searchQuery)}&limit=50`
      )
      const data = await response.json()

      if (data.success && Array.isArray(data.data)) {
        setResults(
          data.data.map((item: { symbol: string; shortName?: string; longName?: string; exchange?: string }) => ({
            symbol: item.symbol,
            name: item.longName || item.shortName || item.symbol,
            exchange: item.exchange,
          }))
        )
      } else {
        setResults([])
      }
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

  // Handle numeric input with validation
  const handleSharesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseNumericInput(e.target.value)
    setQuantity(value)
  }

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseNumericInput(e.target.value)
    setAvgPrice(value)
  }

  // Use current price
  const handleUseCurrentPrice = () => {
    if (currentPrice) {
      setAvgPrice(currentPrice.toString())
      setTouched(prev => ({ ...prev, price: true }))
    }
  }

  // Clear all fields
  const handleClearFields = () => {
    setQuantity('')
    setAvgPrice('')
    setTouched({ shares: false, price: false })
    setError(null)
    sharesInputRef.current?.focus()
  }

  // Submit holding
  const handleSubmit = async () => {
    if (!selectedStock || !isFormValid) return

    const qty = parseFloat(quantity)
    const price = parseFloat(avgPrice)

    setError(null)

    const success = await addHolding(selectedStock.symbol, qty, price)
    if (success) {
      closeModal()
    }
  }

  // Prevent hydration mismatch - only render on client
  if (!isMounted) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent 
        className={cn(
          "sm:max-w-md bg-[#0a0d12]/95 backdrop-blur-xl border-white/10",
          "shadow-[0_0_50px_rgba(6,182,212,0.15)]",
          // Mobile optimizations - reduced padding
          "p-4 sm:p-6 rounded-xl sm:rounded-2xl",
          "max-h-[90vh] overflow-hidden flex flex-col"
        )}
      >
        {/* Header */}
        <DialogHeader className="space-y-1 pb-2 sm:pb-3">
          <DialogTitle className="text-white text-lg sm:text-xl font-semibold">
            {step === 'search' ? 'Add Holding' : `Add ${selectedStock?.symbol}`}
          </DialogTitle>
          <DialogDescription className="text-white/50 text-xs sm:text-sm">
            {step === 'search'
              ? 'Search for a stock to add to your portfolio'
              : 'Enter your position details below'}
          </DialogDescription>
        </DialogHeader>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            {step === 'search' ? (
              <motion.div
                key="search"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-3 sm:space-y-4"
              >
                {/* Search Input */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                  <Input
                    ref={inputRef}
                    value={query}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                    placeholder="Search by symbol or company name..."
                    className={cn(
                      "pl-10 h-10 sm:h-11",
                      "bg-white/5 border-white/10 text-white placeholder:text-white/30",
                      "focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all"
                    )}
                  />
                  {isSearching && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400 animate-spin" />
                  )}
                </div>

                {/* Search Results */}
                {results.length > 0 && (
                  <div className="space-y-1 max-h-52 sm:max-h-60 overflow-y-auto rounded-lg">
                    {results.map((stock) => (
                      <button
                        key={stock.symbol}
                        onClick={() => handleSelectStock(stock)}
                        className={cn(
                          'w-full flex items-center justify-between p-2.5 sm:p-3 rounded-lg',
                          'bg-white/5 hover:bg-white/10 transition-all duration-200',
                          'hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]',
                          'text-left group'
                        )}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="font-semibold text-white text-sm sm:text-base">{stock.symbol}</div>
                          <div className="text-[11px] sm:text-xs text-white/50 truncate">
                            {stock.name}
                          </div>
                        </div>
                        <Plus className="w-4 h-4 text-white/30 group-hover:text-cyan-400 transition-colors shrink-0 ml-2" />
                      </button>
                    ))}
                  </div>
                )}

                {/* Popular Stocks */}
                {!query && results.length === 0 && (
                  <div>
                    <p className="text-[11px] sm:text-xs text-white/40 mb-2 flex items-center gap-1.5">
                      <TrendingUp className="w-3 h-3" />
                      Popular stocks
                    </p>
                    <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
                      {POPULAR_STOCKS.map((stock) => (
                        <button
                          key={stock.symbol}
                          onClick={() => handleSelectStock(stock)}
                          className={cn(
                            'flex items-center gap-2 p-2 sm:p-2.5 rounded-lg',
                            'bg-white/5 hover:bg-white/10 transition-all duration-200',
                            'hover:shadow-[0_0_15px_rgba(6,182,212,0.1)]',
                            'text-left group'
                          )}
                        >
                          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-md sm:rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center shrink-0 group-hover:from-cyan-500/30 group-hover:to-violet-500/30 transition-all">
                            <span className="text-[9px] sm:text-[10px] font-bold text-white">
                              {stock.symbol.slice(0, 2)}
                            </span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-white text-xs sm:text-sm">{stock.symbol}</div>
                            <div className="text-[9px] sm:text-[10px] text-white/40 truncate">{stock.name}</div>
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
                className="space-y-3 sm:space-y-4"
              >
                {/* Selected Stock Card - Enhanced with shadow */}
                <div className={cn(
                  "flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3",
                  "rounded-lg sm:rounded-xl bg-white/5",
                  "border border-white/5",
                  "shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                )}>
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-md sm:rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center shrink-0 shadow-lg">
                    <span className="text-xs sm:text-sm font-bold text-white">
                      {selectedStock?.symbol.slice(0, 2)}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-white text-sm sm:text-base">{selectedStock?.symbol}</div>
                    <div className="text-[10px] sm:text-xs text-white/50 truncate">{selectedStock?.name}</div>
                  </div>
                  {/* Current Price Badge */}
                  {currentPrice && (
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-white/40">Current</div>
                      <div className="text-xs sm:text-sm font-mono text-cyan-400">${formatCurrency(currentPrice)}</div>
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setStep('search')}
                    className="h-7 w-7 sm:h-8 sm:w-8 text-white/40 hover:text-white shrink-0"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </Button>
                </div>

                {/* Shares Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-white/70 text-xs sm:text-sm">Number of Shares</Label>
                    {touched.shares && !validation.shares.valid && (
                      <span className="text-[10px] sm:text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validation.shares.message}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      ref={sharesInputRef}
                      type="text"
                      inputMode="decimal"
                      value={quantity}
                      onChange={handleSharesChange}
                      onBlur={() => setTouched(prev => ({ ...prev, shares: true }))}
                      placeholder="0.00"
                      className={cn(
                        "pl-10 h-10 sm:h-11 font-mono",
                        "bg-white/5 border-white/10 text-white placeholder:text-white/30",
                        "focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all",
                        touched.shares && !validation.shares.valid && "border-red-500/50 focus:border-red-500/50"
                      )}
                    />
                    {touched.shares && validation.shares.valid && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                </div>

                {/* Average Price Input */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label className="text-white/70 text-xs sm:text-sm">Average Buy Price</Label>
                    {touched.price && !validation.price.valid && (
                      <span className="text-[10px] sm:text-xs text-red-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {validation.price.message}
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                    <Input
                      type="text"
                      inputMode="decimal"
                      value={avgPrice}
                      onChange={handlePriceChange}
                      onBlur={() => setTouched(prev => ({ ...prev, price: true }))}
                      placeholder="0.00"
                      className={cn(
                        "pl-10 pr-28 h-10 sm:h-11 font-mono",
                        "bg-white/5 border-white/10 text-white placeholder:text-white/30",
                        "focus:border-cyan-500/50 focus:ring-cyan-500/20 transition-all",
                        touched.price && !validation.price.valid && "border-red-500/50 focus:border-red-500/50"
                      )}
                    />
                    {/* Use Current Price Button */}
                    {currentPrice && (
                      <button
                        type="button"
                        onClick={handleUseCurrentPrice}
                        disabled={isFetchingPrice}
                        className={cn(
                          "absolute right-2 top-1/2 -translate-y-1/2",
                          "flex items-center gap-1 px-2 py-1 rounded-md",
                          "text-[10px] sm:text-xs font-medium",
                          "bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30",
                          "transition-all duration-200",
                          "disabled:opacity-50 disabled:cursor-not-allowed"
                        )}
                      >
                        <Zap className="w-3 h-3" />
                        <span className="hidden sm:inline">Use current</span>
                        <span className="sm:hidden">Current</span>
                      </button>
                    )}
                    {touched.price && validation.price.valid && !currentPrice && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                    )}
                  </div>
                </div>

                {/* Total Investment - Always visible, read-only */}
                <div className={cn(
                  "flex items-center justify-between p-3 sm:p-3.5 rounded-lg sm:rounded-xl",
                  "bg-gradient-to-r from-cyan-500/10 to-violet-500/10",
                  "border border-cyan-500/20",
                  totalInvestment > 0 && "shadow-[0_0_20px_rgba(6,182,212,0.1)]"
                )}>
                  <div>
                    <span className="text-[10px] sm:text-xs text-white/50 block">Total Investment</span>
                    <span className="text-xs text-white/40">(read-only)</span>
                  </div>
                  <span className={cn(
                    "font-semibold font-mono text-base sm:text-lg",
                    totalInvestment > 0 ? "text-white" : "text-white/30"
                  )}>
                    ${formatCurrency(totalInvestment)}
                  </span>
                </div>

                {/* Clear Fields Button */}
                {(quantity || avgPrice) && (
                  <button
                    type="button"
                    onClick={handleClearFields}
                    className="flex items-center justify-center gap-1.5 w-full py-1.5 text-xs text-white/40 hover:text-white/60 transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                    Clear fields
                  </button>
                )}

                {/* Error */}
                {error && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xs sm:text-sm text-red-400 flex items-center gap-1.5 p-2 rounded-lg bg-red-500/10"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {error}
                  </motion.p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer - Sticky on mobile */}
        {step === 'details' && (
          <div className={cn(
            "flex gap-2 sm:gap-3 pt-3 sm:pt-4 mt-2",
            "border-t border-white/5",
            // Mobile sticky footer
            "sticky bottom-0 bg-[#0a0d12]/95 backdrop-blur-xl",
            "-mx-4 px-4 pb-1 sm:mx-0 sm:px-0 sm:pb-0"
          )}>
            <Button
              variant="ghost"
              onClick={() => setStep('search')}
              className={cn(
                "flex-1 sm:flex-none h-10 sm:h-11",
                "text-white/50 hover:text-white hover:bg-white/5",
                "border border-white/10"
              )}
            >
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isLoading || !isFormValid}
              className={cn(
                "flex-[2] sm:flex-1 h-10 sm:h-11",
                "bg-gradient-to-r from-cyan-500 to-violet-500",
                "hover:from-cyan-400 hover:to-violet-400",
                "disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50",
                "text-white font-medium",
                "shadow-[0_0_20px_rgba(6,182,212,0.3)]",
                "disabled:shadow-none",
                "transition-all duration-300"
              )}
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
})

export default AddHoldingModal
