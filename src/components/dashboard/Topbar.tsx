'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Bell,
  Sun,
  Moon,
  ChevronRight,
  Command,
  X,
  ArrowRight,
  LayoutDashboard,
  LineChart,
  Star,
  Terminal,
  Loader2,
  Menu,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from './Sidebar'

// Search result type
interface StockSearchResult {
  symbol: string
  shortName: string
  longName: string
  exchange: string
  type: string
}

// Breadcrumb mapping
const breadcrumbMap: Record<string, string> = {
  dashboard: 'Dashboard',
  'stock-analysis': 'Stock Analysis',
  watchlist: 'Watchlist',
  'terminal-pro': 'Terminal Pro',
  'ai-assistant': 'AI Assistant',
}

interface TopbarProps {
  subscriptionTier?: string
}

export function Topbar({ subscriptionTier }: TopbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [hasNotifications, setHasNotifications] = useState(true)
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()
  const { toggleMobileSidebar } = useSidebar()

  // Generate breadcrumbs from pathname
  const breadcrumbs = pathname
    .split('/')
    .filter(Boolean)
    .map((segment, index, arr) => ({
      label: breadcrumbMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1),
      href: '/' + arr.slice(0, index + 1).join('/'),
      isLast: index === arr.length - 1,
    }))

  // Keyboard shortcut: Cmd/Ctrl + K to open search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsSearchOpen(true)
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Focus search input when opened
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isSearchOpen])

  // Search stocks API call
  const searchStocks = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)
    try {
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      
      if (data.success && data.data) {
        setSearchResults(data.data)
      } else {
        setSearchResults([])
      }
    } catch (error) {
      console.error('Search error:', error)
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Handle search query change with debounce
  const handleSearchChange = (value: string) => {
    setSearchQuery(value)
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    
    debounceRef.current = setTimeout(() => {
      searchStocks(value)
    }, 300)
  }

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [])

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    // In a real app, this would toggle the actual theme
    document.documentElement.classList.toggle('dark')
  }

  return (
    <>
      <header className="h-14 sm:h-16 bg-[#0d0d0f] border-b border-white/5 flex items-center justify-between px-3 sm:px-6">
        {/* Left: Hamburger Menu + Breadcrumbs */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileSidebar}
            className="lg:hidden p-2 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          
          {/* Breadcrumbs - Hidden on small mobile */}
          <nav className="hidden sm:flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.href} className="flex items-center gap-2">
              {index > 0 && <ChevronRight className="w-4 h-4 text-gray-600" />}
              {crumb.isLast ? (
                <span className="text-white font-medium">{crumb.label}</span>
              ) : (
                <Link
                  href={crumb.href}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-2 sm:px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm hidden md:inline">Search stocks...</span>
            <kbd className="hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-gray-500">
              <Command className="w-3 h-3" />K
            </kbd>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            aria-label="Toggle theme"
          >
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          {/* Notifications */}
          <button
            className="relative p-2.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {hasNotifications && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full" />
            )}
          </button>

          {/* User Button */}
          <div className="ml-1 sm:ml-2 pl-2 sm:pl-4 border-l border-white/10">
            <UserButton
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: 'w-9 h-9 ring-2 ring-white/10',
                  userButtonPopoverCard: 'bg-[#1a1a1f] border border-white/10 shadow-xl',
                  userButtonPopoverActionButton: 'hover:bg-white/5 text-gray-300',
                  userButtonPopoverActionButtonText: 'text-gray-300',
                  userButtonPopoverActionButtonIcon: 'text-gray-400',
                  userButtonPopoverFooter: 'hidden',
                },
              }}
            >
              <UserButton.MenuItems>
                <UserButton.Link
                  label="Dashboard"
                  labelIcon={<LayoutDashboard className="w-4 h-4" />}
                  href="/dashboard"
                />
                <UserButton.Link
                  label="Upgrade"
                  labelIcon={<Terminal className="w-4 h-4" />}
                  href="/pricing"
                />
                <UserButton.Action label="signOut" />
              </UserButton.MenuItems>
            </UserButton>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setIsSearchOpen(false)}
            />

            {/* Search Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-[10%] sm:top-[15%] left-1/2 -translate-x-1/2 w-[95%] sm:w-full max-w-2xl z-50"
            >
              <div className="bg-[#0d0d0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search for stocks, ETFs, or crypto..."
                    className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-lg"
                  />
                  {isSearching && <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />}
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Quick Actions */}
                {!searchQuery && (
                  <div className="p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Quick Actions</p>
                    <div className="grid grid-cols-2 gap-2">
                      <QuickAction
                        icon={<LayoutDashboard className="w-4 h-4" />}
                        label="Go to Overview"
                        shortcut="⌘1"
                        onClick={() => {
                          router.push('/dashboard')
                          setIsSearchOpen(false)
                        }}
                      />
                      <QuickAction
                        icon={<LineChart className="w-4 h-4" />}
                        label="Stock Analysis"
                        shortcut="⌘2"
                        onClick={() => {
                          router.push('/dashboard/stock-analysis')
                          setIsSearchOpen(false)
                        }}
                      />
                      <QuickAction
                        icon={<Star className="w-4 h-4" />}
                        label="Watchlist"
                        shortcut="⌘3"
                        onClick={() => {
                          router.push('/dashboard/watchlist')
                          setIsSearchOpen(false)
                        }}
                      />
                      <QuickAction
                        icon={<Terminal className="w-4 h-4" />}
                        label="Terminal Pro"
                        shortcut="⌘4"
                        onClick={() => {
                          router.push('/dashboard/terminal-pro')
                          setIsSearchOpen(false)
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Popular Stocks - show when no search query */}
                {!searchQuery && (
                  <div className="p-4 border-t border-white/5">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Popular Stocks</p>
                    <div className="space-y-1">
                      <PopularStockItem 
                        symbol="AAPL" 
                        name="Apple Inc." 
                        exchange="NASDAQ"
                        onClick={() => {
                          router.push('/dashboard/stock-analysis?symbol=AAPL')
                          setIsSearchOpen(false)
                        }}
                      />
                      <PopularStockItem 
                        symbol="GOOGL" 
                        name="Alphabet Inc." 
                        exchange="NASDAQ"
                        onClick={() => {
                          router.push('/dashboard/stock-analysis?symbol=GOOGL')
                          setIsSearchOpen(false)
                        }}
                      />
                      <PopularStockItem 
                        symbol="MSFT" 
                        name="Microsoft Corporation" 
                        exchange="NASDAQ"
                        onClick={() => {
                          router.push('/dashboard/stock-analysis?symbol=MSFT')
                          setIsSearchOpen(false)
                        }}
                      />
                      <PopularStockItem 
                        symbol="AMZN" 
                        name="Amazon.com Inc." 
                        exchange="NASDAQ"
                        onClick={() => {
                          router.push('/dashboard/stock-analysis?symbol=AMZN')
                          setIsSearchOpen(false)
                        }}
                      />
                      <PopularStockItem 
                        symbol="NVDA" 
                        name="NVIDIA Corporation" 
                        exchange="NASDAQ"
                        onClick={() => {
                          router.push('/dashboard/stock-analysis?symbol=NVDA')
                          setIsSearchOpen(false)
                        }}
                      />
                      <PopularStockItem 
                        symbol="TSLA" 
                        name="Tesla Inc." 
                        exchange="NASDAQ"
                        onClick={() => {
                          router.push('/dashboard/stock-analysis?symbol=TSLA')
                          setIsSearchOpen(false)
                        }}
                      />
                      <PopularStockItem 
                        symbol="META" 
                        name="Meta Platforms Inc." 
                        exchange="NASDAQ"
                        onClick={() => {
                          router.push('/dashboard/stock-analysis?symbol=META')
                          setIsSearchOpen(false)
                        }}
                      />
                      <PopularStockItem 
                        symbol="JPM" 
                        name="JPMorgan Chase & Co." 
                        exchange="NYSE"
                        onClick={() => {
                          router.push('/dashboard/stock-analysis?symbol=JPM')
                          setIsSearchOpen(false)
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Search Results */}
                {searchQuery && (
                  <div className="p-4 max-h-80 overflow-y-auto">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <>
                        <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                          Results for "{searchQuery}"
                        </p>
                        <div className="space-y-1">
                          {searchResults.map((stock) => (
                            <SearchResult
                              key={stock.symbol}
                              symbol={stock.symbol}
                              name={stock.longName || stock.shortName}
                              exchange={stock.exchange}
                              onClick={() => {
                                router.push(`/dashboard/stock-analysis?symbol=${stock.symbol}`)
                                setIsSearchOpen(false)
                                setSearchQuery('')
                                setSearchResults([])
                              }}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        No stocks found for "{searchQuery}"
                      </div>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="px-4 py-3 bg-white/5 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">↑↓</kbd>
                      Navigate
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">↵</kbd>
                      Select
                    </span>
                    <span className="flex items-center gap-1">
                      <kbd className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded">Esc</kbd>
                      Close
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

function QuickAction({
  icon,
  label,
  shortcut,
  onClick,
}: {
  icon: React.ReactNode
  label: string
  shortcut: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-colors text-left"
    >
      <div className="flex items-center gap-3">
        <span className="text-gray-400">{icon}</span>
        <span className="text-sm text-white">{label}</span>
      </div>
      <kbd className="text-[10px] text-gray-500 font-mono">{shortcut}</kbd>
    </button>
  )
}

function PopularStockItem({
  symbol,
  name,
  exchange,
  onClick,
}: {
  symbol: string
  name: string
  exchange: string
  onClick: () => void
}) {
  return (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors text-left group"
    >
      <div className="flex items-center gap-3">
        <Star className="w-4 h-4 text-yellow-500" />
        <div>
          <span className="text-sm font-medium text-white">{symbol}</span>
          <span className="text-sm text-gray-500 ml-2">{name}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 px-2 py-1 bg-white/5 rounded">{exchange}</span>
        <ArrowRight className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  )
}

function SearchResult({
  symbol,
  name,
  exchange,
  onClick,
}: {
  symbol: string
  name: string
  exchange: string
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors text-left group"
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
          <span className="text-sm font-bold text-white">{symbol.charAt(0)}</span>
        </div>
        <div>
          <p className="text-sm font-medium text-white">{symbol}</p>
          <p className="text-xs text-gray-500">{name}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 px-2 py-1 bg-white/5 rounded">{exchange}</span>
        <ArrowRight className="w-4 h-4 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </button>
  )
}
