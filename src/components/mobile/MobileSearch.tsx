'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, TrendingUp, Clock, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

interface MobileSearchProps {
  onSearch?: (query: string) => void
  placeholder?: string
  recentSearches?: string[]
  trendingSymbols?: Array<{ symbol: string; name: string; change: number }>
}

export function MobileSearch({
  onSearch,
  placeholder = "Search stocks, ETFs...",
  recentSearches = [],
  trendingSymbols = [],
}: MobileSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  // Lock body scroll when search is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      onSearch?.(searchQuery)
      router.push(`/dashboard/stock-analysis?symbol=${searchQuery.toUpperCase()}`)
      setIsOpen(false)
      setQuery('')
    }
  }

  const handleSymbolClick = (symbol: string) => {
    router.push(`/dashboard/stock-analysis?symbol=${symbol}`)
    setIsOpen(false)
    setQuery('')
  }

  return (
    <>
      {/* Search Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/[0.05] border border-white/[0.06] text-gray-400 hover:bg-white/[0.08] transition-all w-full md:w-auto"
      >
        <Search className="w-4 h-4" />
        <span className="text-sm">{placeholder}</span>
      </button>

      {/* Full Screen Search Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-[#030508]"
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-[#030508] border-b border-white/[0.06] safe-top">
              <div className="flex items-center gap-3 px-4 py-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    placeholder={placeholder}
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-white/[0.05] border border-white/[0.08] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-all"
                  />
                  {query && (
                    <button
                      onClick={() => setQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <X className="w-4 h-4 text-gray-400" />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="px-3 py-2 text-cyan-400 font-medium text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="overflow-y-auto h-[calc(100vh-80px)] pb-safe">
              {/* Quick Actions */}
              {!query && (
                <div className="px-4 py-4">
                  {/* Recent Searches */}
                  {recentSearches.length > 0 && (
                    <div className="mb-6">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          Recent
                        </h3>
                        <button className="text-xs text-cyan-400">Clear</button>
                      </div>
                      <div className="space-y-1">
                        {recentSearches.map((search, i) => (
                          <button
                            key={i}
                            onClick={() => handleSearch(search)}
                            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-white/[0.05] transition-colors"
                          >
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-300">{search}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trending */}
                  {trendingSymbols.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Trending
                      </h3>
                      <div className="grid grid-cols-2 gap-2">
                        {trendingSymbols.map((item) => (
                          <button
                            key={item.symbol}
                            onClick={() => handleSymbolClick(item.symbol)}
                            className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all"
                          >
                            <div className="flex-1 text-left">
                              <div className="font-semibold text-white text-sm">{item.symbol}</div>
                              <div className="text-xs text-gray-500 truncate">{item.name}</div>
                            </div>
                            <div className={cn(
                              "text-xs font-medium",
                              item.change >= 0 ? "text-green-400" : "text-red-400"
                            )}>
                              {item.change >= 0 ? '+' : ''}{item.change.toFixed(2)}%
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Popular Categories */}
                  <div className="mt-6">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                      Browse
                    </h3>
                    <div className="space-y-1">
                      {[
                        { label: 'Top Gainers', icon: '📈' },
                        { label: 'Top Losers', icon: '📉' },
                        { label: 'Most Active', icon: '🔥' },
                        { label: 'Tech Stocks', icon: '💻' },
                        { label: 'ETFs', icon: '📊' },
                      ].map((item) => (
                        <button
                          key={item.label}
                          className="flex items-center justify-between w-full px-3 py-3 rounded-lg hover:bg-white/[0.05] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">{item.icon}</span>
                            <span className="text-sm text-gray-300">{item.label}</span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-600" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Search Results would go here */}
              {query && (
                <div className="px-4 py-4">
                  <p className="text-center text-gray-500 text-sm py-8">
                    Press Enter to search for "{query}"
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
