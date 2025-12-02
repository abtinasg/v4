'use client'

import { useState } from 'react'
import Link from 'next/link'
import { UserButton } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, X, Loader2 } from 'lucide-react'
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
      {/* Mobile Header - Premium glass design */}
      <header className="md:hidden sticky top-0 z-50">
        {/* Glass background with refined blur */}
        <div className="absolute inset-0 bg-[#0a0c10]/80 backdrop-blur-[8px] border-b border-white/[0.06]" />
        
        {/* Subtle top highlight for depth */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        
        {/* Safe area for notch */}
        <div className="relative pt-[env(safe-area-inset-top)]">
          <div className="flex items-center justify-between h-16 px-5">
            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-3">
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-400/20 to-violet-500/20 border border-white/[0.08] flex items-center justify-center">
                <span className="text-sm font-semibold bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent">V</span>
              </div>
              {title ? (
                <span className="text-[15px] font-medium text-white/90 tracking-[-0.01em]">{title}</span>
              ) : (
                <span className="text-[15px] font-medium text-white/90 tracking-[-0.01em]">
                  Deep Terminal
                </span>
              )}
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Credits - refined mobile style */}
              <div className="flex items-center h-9 px-3 rounded-xl bg-emerald-500/[0.06] border border-emerald-500/[0.12]">
                <CreditBadge showIcon size="sm" className="border-0 bg-transparent p-0 text-[12px]" />
              </div>

              {/* Search */}
              {showSearch && (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2.5 rounded-xl hover:bg-white/[0.04] text-white/40 active:scale-95 transition-all duration-200"
                  aria-label="Search"
                >
                  <Search className="w-[18px] h-[18px]" strokeWidth={1.5} />
                </button>
              )}

              {/* Notifications */}
              <button
                className="relative p-2.5 rounded-xl hover:bg-white/[0.04] text-white/40 active:scale-95 transition-all duration-200"
                aria-label="Notifications"
              >
                <Bell className="w-[18px] h-[18px]" strokeWidth={1.5} />
                {hasNotifications && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-[#0a0c10]" />
                )}
              </button>

              {/* User */}
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-8 h-8 ring-2 ring-white/[0.08] ring-offset-2 ring-offset-[#0a0c10]',
                    userButtonPopoverCard: 'bg-[#12141a] border border-white/[0.08] shadow-2xl shadow-black/40 rounded-2xl',
                    userButtonPopoverActionButton: 'hover:bg-white/[0.04] text-white/70 rounded-xl',
                    userButtonPopoverActionButtonText: 'text-white/70 font-normal',
                    userButtonPopoverFooter: 'hidden',
                  },
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Search Overlay - Premium glass design */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-[60] md:hidden"
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setIsSearchOpen(false)}
            />

            {/* Search Panel */}
            <motion.div
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -16, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="relative bg-[#0c0e14]/98 backdrop-blur-xl pt-[env(safe-area-inset-top)] h-full"
            >
              {/* Top highlight */}
              <div className="absolute inset-x-0 top-[env(safe-area-inset-top)] h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
              
              {/* Search Input */}
              <div className="flex items-center gap-4 px-5 h-16 border-b border-white/[0.06]">
                <Search className="w-5 h-5 text-white/30 flex-shrink-0" strokeWidth={1.5} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search stocks, ETFs..."
                  className="flex-1 bg-transparent text-white/90 placeholder-white/30 outline-none text-[17px] font-normal tracking-[-0.01em]"
                  autoFocus
                />
                {isSearching && <Loader2 className="w-5 h-5 text-cyan-400/70 animate-spin flex-shrink-0" />}
                <button
                  onClick={() => {
                    setIsSearchOpen(false)
                    setSearchQuery('')
                    setSearchResults([])
                  }}
                  className="p-2 -mr-2 rounded-xl hover:bg-white/[0.04] text-white/30"
                >
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </button>
              </div>

              {/* Search Results */}
              <div className="overflow-y-auto h-[calc(100%-4rem)] pb-[env(safe-area-inset-bottom)]">
                {searchResults.length > 0 ? (
                  <div className="p-4 space-y-0.5">
                    {searchResults.map((result: any) => (
                      <Link
                        key={result.symbol}
                        href={`/dashboard/stock-analysis/${result.symbol}`}
                        onClick={() => setIsSearchOpen(false)}
                        className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-white/[0.03] active:bg-white/[0.06] transition-all duration-200"
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[14px] font-medium text-white/90 tracking-[-0.01em]">{result.symbol}</span>
                            <span className="text-[11px] text-white/30 font-normal">
                              {result.exchange}
                            </span>
                          </div>
                          <p className="text-[13px] text-white/40 truncate font-normal leading-[1.4] mt-0.5">{result.shortName || result.longName}</p>
                        </div>
                        <span className="text-[11px] text-white/25">{result.type}</span>
                      </Link>
                    ))}
                  </div>
                ) : searchQuery && !isSearching ? (
                  <div className="flex flex-col items-center justify-center py-16 text-white/40">
                    <Search className="w-10 h-10 mb-3 opacity-30" strokeWidth={1.5} />
                    <p className="text-[14px] font-normal">No results found</p>
                    <p className="text-[13px] text-white/25 mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="p-5">
                    <p className="text-[11px] font-medium text-white/30 uppercase tracking-[0.08em] mb-4">Quick searches</p>
                    <div className="flex flex-wrap gap-2">
                      {['AAPL', 'TSLA', 'NVDA', 'MSFT', 'GOOGL'].map((symbol) => (
                        <button
                          key={symbol}
                          onClick={() => handleSearch(symbol)}
                          className="px-4 py-2 bg-white/[0.03] border border-white/[0.06] rounded-xl text-[13px] text-white/50 hover:text-white/70 hover:bg-white/[0.05] hover:border-white/[0.10] transition-all duration-200"
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
