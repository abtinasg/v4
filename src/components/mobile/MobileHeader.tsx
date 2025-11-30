'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Search, Bell, X, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { CreditBadge } from '@/components/credits'

interface MobileHeaderProps {
  showSearch?: boolean
  title?: string
}

export function MobileHeader({ showSearch = true, title }: MobileHeaderProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [hasNotifications] = useState(true)

  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}&limit=10`)
      const data = await response.json()
      if (data.success && data.data) {
        setSearchResults(data.data)
      }
    } catch (error) {
      console.error('Search error:', error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <>
      {/* Mobile Header - Only visible on mobile */}
      <header className="md:hidden sticky top-0 z-50 bg-[#070A0F]/95 backdrop-blur-xl border-b border-white/[0.06]">
        {/* Safe area for notch */}
        <div className="pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between h-14 px-4">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                <Terminal className="w-4 h-4 text-white" />
                <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-500 blur-sm opacity-40" />
              </div>
              {title ? (
                <span className="text-base font-semibold text-white">{title}</span>
              ) : (
                <span className="text-base font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Deep Terminal
                </span>
              )}
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-1">
              {/* Credits - compact for mobile */}
              <div className="flex items-center px-2 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <CreditBadge showIcon size="sm" className="border-0 bg-transparent p-0 text-xs" />
              </div>

              {/* Search */}
              {showSearch && (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400 active:scale-95 transition-all"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}

              {/* Notifications */}
              <button
                className="relative p-2 rounded-lg hover:bg-white/5 text-gray-400 active:scale-95 transition-all"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {hasNotifications && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>

              {/* User */}
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8 ring-2 ring-white/10',
                    userButtonPopoverCard: 'bg-[#1a1a1f] border border-white/10 shadow-xl',
                  },
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] md:hidden"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setIsSearchOpen(false)}
            />

            {/* Search Panel */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="relative bg-[#0a0d12] pt-[env(safe-area-inset-top)] h-full"
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 px-4 h-14 border-b border-white/[0.06]">
                <Search className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search stocks, ETFs..."
                  className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-base"
                  autoFocus
                />
                {isSearching && <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />}
                <button
                  onClick={() => {
                    setIsSearchOpen(false)
                    setSearchQuery('')
                    setSearchResults([])
                  }}
                  className="p-2 rounded-lg hover:bg-white/5 text-gray-400"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Search Results */}
              <div className="overflow-y-auto h-[calc(100%-3.5rem)] pb-[env(safe-area-inset-bottom)]">
                {searchResults.length > 0 ? (
                  <div className="divide-y divide-white/[0.06]">
                    {searchResults.map((result: any) => (
                      <Link
                        key={result.symbol}
                        href={`/dashboard/stock-analysis?symbol=${result.symbol}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center justify-between px-4 py-3 hover:bg-white/5 active:bg-white/10 transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{result.symbol}</span>
                            <span className="text-xs text-gray-500 px-1.5 py-0.5 bg-white/5 rounded">
                              {result.exchange}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 truncate">{result.shortName || result.longName}</p>
                        </div>
                        <span className="text-xs text-gray-500">{result.type}</span>
                      </Link>
                    ))}
                  </div>
                ) : searchQuery && !isSearching ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Search className="w-12 h-12 mb-3 opacity-50" />
                    <p>No results found</p>
                  </div>
                ) : (
                  <div className="p-4">
                    <p className="text-xs text-gray-500 mb-3">Quick searches</p>
                    <div className="flex flex-wrap gap-2">
                      {['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL', 'AMZN'].map((symbol) => (
                        <button
                          key={symbol}
                          onClick={() => handleSearch(symbol)}
                          className="px-3 py-1.5 bg-white/5 rounded-full text-sm text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                          {symbol}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
