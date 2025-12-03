'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { UserButton } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Bell,
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
  TrendingUp,
  TrendingDown,
  AlertTriangle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSidebar } from './Sidebar'
import { CreditBadge, CreditModal } from '@/components/credits'
import { useWatchlistStore, type PriceAlert } from '@/lib/stores/watchlist-store'

// Search result type
interface StockSearchResult {
  symbol: string
  shortName: string
  longName: string
  exchange: string
  type: string
}

// Breadcrumb mapping - cleaner labels
const breadcrumbMap: Record<string, string> = {
  dashboard: 'Overview',
  'stock-analysis': 'Analysis',
  watchlist: 'Watchlist',
  'terminal-pro': 'Terminal',
  'ai-assistant': 'Assistant',
  portfolio: 'Portfolio',
  news: 'News',
}

// Credit-based system - no subscription tier needed
export function Topbar() {
  const pathname = usePathname()
  const router = useRouter()
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false)
  const [searchResults, setSearchResults] = useState<StockSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<NodeJS.Timeout>()
  const { toggleMobileSidebar } = useSidebar()
  
  // Get alerts from watchlist store
  const alerts = useWatchlistStore((s) => s.alerts)
  const activeAlerts = alerts.filter(a => a.isActive)
  const hasNotifications = activeAlerts.length > 0
  
  // Close notifications when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false)
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Generate breadcrumbs from pathname - skip 'dashboard' as it's implied
  const breadcrumbs = pathname
    .split('/')
    .filter(Boolean)
    .filter(segment => segment !== 'dashboard') // Remove 'dashboard' from breadcrumbs
    .map((segment, index, arr) => ({
      label: breadcrumbMap[segment] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' '),
      href: '/dashboard/' + arr.slice(0, index + 1).join('/'),
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
      const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}&limit=50`)
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

  return (
    <>
      {/* Premium Glass Navbar */}
      <header className="h-[72px] relative">
        {/* Glass background with refined blur */}
        <div className="absolute inset-0 bg-[#0a0c10]/70 backdrop-blur-[8px] border-b border-white/[0.06]" />
        
        {/* Subtle top highlight for depth */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        
        {/* Content container with generous padding */}
        <div className="relative h-full px-6 lg:px-8 flex items-center">
          
          {/* Left Section: Mobile Menu + Breadcrumbs */}
          <div className="flex items-center gap-4">
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileSidebar}
              className="lg:hidden p-2 -ml-2 rounded-xl hover:bg-white/[0.04] text-white/50 hover:text-white/80 transition-all duration-200"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumbs - Clean, subtle typography */}
            <nav className="hidden md:flex items-center gap-2">
              {breadcrumbs.map((crumb, index) => (
                <div key={crumb.href} className="flex items-center gap-2">
                  {index > 0 && (
                    <ChevronRight className="w-3.5 h-3.5 text-white/20" strokeWidth={1.5} />
                  )}
                  {crumb.isLast ? (
                    <span className="text-[15px] font-medium text-white/90 tracking-[-0.01em] leading-[1.4]">
                      {crumb.label}
                    </span>
                  ) : (
                    <Link
                      href={crumb.href}
                      className="text-[15px] font-normal text-white/40 hover:text-white/70 transition-colors duration-200 tracking-[-0.01em] leading-[1.4]"
                    >
                      {crumb.label}
                    </Link>
                  )}
                </div>
              ))}
            </nav>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Right Section: Search → Notifications → User */}
          <div className="flex items-center gap-3">
            {/* Search Button - Premium, wider design */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="group flex items-center gap-3 h-11 px-5 bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] hover:border-white/[0.10] rounded-xl transition-all duration-200"
            >
              <Search className="w-[18px] h-[18px] text-white/40 group-hover:text-white/60 transition-colors" strokeWidth={1.5} />
              <span className="hidden md:block text-[15px] text-white/40 group-hover:text-white/60 transition-colors tracking-[-0.01em] min-w-[140px] text-left">
                Search stocks...
              </span>
              <kbd className="hidden lg:flex items-center gap-1 h-6 px-2 bg-white/[0.04] border border-white/[0.06] rounded-md text-[11px] text-white/30 font-medium">
                <Command className="w-3 h-3" strokeWidth={1.5} />
                <span>K</span>
              </kbd>
            </button>

            {/* Credit Badge - Subtle integration */}
            <CreditModal 
              trigger={
                <button className="hidden sm:flex items-center gap-2 h-10 px-4 bg-emerald-500/[0.06] hover:bg-emerald-500/[0.10] border border-emerald-500/[0.12] hover:border-emerald-500/[0.20] rounded-xl transition-all duration-200">
                  <CreditBadge showIcon={true} size="sm" className="border-0 bg-transparent p-0" />
                </button>
              }
            />

            {/* Notifications - With dropdown */}
            <div className="relative" ref={notificationsRef}>
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="relative p-2.5 rounded-xl hover:bg-white/[0.04] text-white/40 hover:text-white/70 transition-all duration-200"
                aria-label="Notifications"
              >
                <Bell className="w-[18px] h-[18px]" strokeWidth={1.5} />
                {hasNotifications && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-[#0a0c10]" />
                )}
              </button>
              
              {/* Notifications Dropdown */}
              <AnimatePresence>
                {isNotificationsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-2 w-80 bg-[#0c0e14]/95 backdrop-blur-xl border border-white/[0.08] rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50"
                  >
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white/90">Price Alerts</h3>
                      <Link 
                        href="/dashboard/watchlist"
                        onClick={() => setIsNotificationsOpen(false)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        Manage
                      </Link>
                    </div>
                    
                    {/* Alerts List */}
                    <div className="max-h-80 overflow-y-auto">
                      {activeAlerts.length === 0 ? (
                        <div className="p-6 text-center">
                          <Bell className="w-8 h-8 text-white/20 mx-auto mb-2" />
                          <p className="text-sm text-white/40">No active alerts</p>
                          <p className="text-xs text-white/25 mt-1">Set alerts from stock analysis pages</p>
                        </div>
                      ) : (
                        <div className="py-2">
                          {activeAlerts.slice(0, 5).map((alert) => (
                            <AlertItem 
                              key={alert.id} 
                              alert={alert}
                              onClick={() => {
                                router.push(`/dashboard/stock-analysis/${alert.symbol}`)
                                setIsNotificationsOpen(false)
                              }}
                            />
                          ))}
                          {activeAlerts.length > 5 && (
                            <div className="px-4 py-2 text-center">
                              <Link 
                                href="/dashboard/watchlist"
                                onClick={() => setIsNotificationsOpen(false)}
                                className="text-xs text-white/40 hover:text-white/60 transition-colors"
                              >
                                +{activeAlerts.length - 5} more alerts
                              </Link>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User Button - Premium spacing */}
            <div className="ml-2 pl-4 border-l border-white/[0.06]">
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-9 h-9 ring-2 ring-white/[0.08] ring-offset-2 ring-offset-[#0a0c10]',
                    userButtonPopoverCard: 'bg-[#12141a] border border-white/[0.08] shadow-2xl shadow-black/40 rounded-2xl',
                    userButtonPopoverActionButton: 'hover:bg-white/[0.04] text-white/70 rounded-xl',
                    userButtonPopoverActionButtonText: 'text-white/70 font-normal',
                    userButtonPopoverActionButtonIcon: 'text-white/40',
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
        </div>
      </header>

      {/* Search Modal - Premium Glass Design */}
      <AnimatePresence>
        {isSearchOpen && (
          <>
            {/* Backdrop with subtle blur */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
              onClick={() => setIsSearchOpen(false)}
            />

            {/* Search Panel - Centered, floating glass card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -8 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="fixed top-[12%] left-1/2 -translate-x-1/2 w-[92%] sm:w-full max-w-[640px] z-50"
            >
              <div className="relative bg-[#0c0e14]/95 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
                {/* Top highlight */}
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.12] to-transparent" />
                
                {/* Search Input - Larger, premium feel */}
                <div className="flex items-center gap-4 px-6 py-5 border-b border-white/[0.06]">
                  <Search className="w-5 h-5 text-white/30 flex-shrink-0" strokeWidth={1.5} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search stocks, ETFs, or crypto..."
                    className="flex-1 bg-transparent text-white/90 placeholder-white/30 outline-none text-[17px] font-normal tracking-[-0.01em] leading-[1.4]"
                  />
                  {isSearching && <Loader2 className="w-5 h-5 text-cyan-400/70 animate-spin flex-shrink-0" />}
                  <button
                    onClick={() => setIsSearchOpen(false)}
                    className="p-2 -mr-2 rounded-xl hover:bg-white/[0.04] text-white/30 hover:text-white/60 transition-all duration-200"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                  </button>
                </div>

                {/* Quick Actions - Clean grid */}
                {!searchQuery && (
                  <div className="p-5">
                    <p className="text-[11px] font-medium text-white/30 uppercase tracking-[0.08em] mb-4">Quick Actions</p>
                    <div className="grid grid-cols-2 gap-2">
                      <QuickAction
                        icon={<LayoutDashboard className="w-4 h-4" />}
                        label="Overview"
                        shortcut="⌘1"
                        onClick={() => {
                          router.push('/dashboard')
                          setIsSearchOpen(false)
                        }}
                      />
                      <QuickAction
                        icon={<LineChart className="w-4 h-4" />}
                        label="Analysis"
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
                        label="Terminal"
                        shortcut="⌘4"
                        onClick={() => {
                          router.push('/dashboard/terminal-pro')
                          setIsSearchOpen(false)
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Popular Stocks - Refined list */}
                {!searchQuery && (
                  <div className="px-5 pb-5">
                    <p className="text-[11px] font-medium text-white/30 uppercase tracking-[0.08em] mb-3">Trending</p>
                    <div className="space-y-0.5">
                      <PopularStockItem 
                        symbol="AAPL" 
                        name="Apple Inc." 
                        exchange="NASDAQ"
                        onClick={() => {
                          router.push('/dashboard/stock-analysis/AAPL')
                          setIsSearchOpen(false)
                        }}
                      />
                      <PopularStockItem 
                        symbol="NVDA" 
                        name="NVIDIA Corporation" 
                        exchange="NASDAQ"
                        onClick={() => {
                          router.push('/dashboard/stock-analysis/NVDA')
                          setIsSearchOpen(false)
                        }}
                      />
                      <PopularStockItem 
                        symbol="TSLA" 
                        name="Tesla Inc." 
                        exchange="NASDAQ"
                        onClick={() => {
                          router.push('/dashboard/stock-analysis/TSLA')
                          setIsSearchOpen(false)
                        }}
                      />
                      <PopularStockItem 
                        symbol="MSFT" 
                        name="Microsoft Corporation" 
                        exchange="NASDAQ"
                        onClick={() => {
                          router.push('/dashboard/stock-analysis/MSFT')
                          setIsSearchOpen(false)
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Search Results - Clean, scannable */}
                {searchQuery && (
                  <div className="p-5 max-h-[360px] overflow-y-auto">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-6 h-6 text-cyan-400/60 animate-spin" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      <>
                        <p className="text-[11px] font-medium text-white/30 uppercase tracking-[0.08em] mb-3">
                          Results
                        </p>
                        <div className="space-y-0.5">
                          {searchResults.map((stock) => (
                            <SearchResult
                              key={stock.symbol}
                              symbol={stock.symbol}
                              name={stock.longName || stock.shortName}
                              exchange={stock.exchange}
                              onClick={() => {
                                router.push(`/dashboard/stock-analysis/${stock.symbol}`)
                                setIsSearchOpen(false)
                                setSearchQuery('')
                                setSearchResults([])
                              }}
                            />
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-[14px] text-white/40">No results found</p>
                        <p className="text-[13px] text-white/25 mt-1">Try a different search term</p>
                      </div>
                    )}
                  </div>
                )}

                {/* Footer - Minimal keyboard hints */}
                <div className="px-5 py-3.5 bg-white/[0.02] border-t border-white/[0.04] flex items-center gap-6">
                  <span className="flex items-center gap-2 text-[11px] text-white/25">
                    <kbd className="px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-[10px]">↵</kbd>
                    Select
                  </span>
                  <span className="flex items-center gap-2 text-[11px] text-white/25">
                    <kbd className="px-1.5 py-0.5 bg-white/[0.04] border border-white/[0.06] rounded text-[10px]">esc</kbd>
                    Close
                  </span>
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
      className="group flex items-center justify-between p-3.5 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/[0.04] hover:border-white/[0.08] transition-all duration-200 text-left"
    >
      <div className="flex items-center gap-3">
        <span className="text-white/40 group-hover:text-white/60 transition-colors">{icon}</span>
        <span className="text-[14px] text-white/70 group-hover:text-white/90 font-normal tracking-[-0.01em] transition-colors">{label}</span>
      </div>
      <kbd className="text-[10px] text-white/25 font-mono">{shortcut}</kbd>
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
      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-all duration-200 text-left group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/10 flex items-center justify-center">
          <Star className="w-3.5 h-3.5 text-amber-500/70" strokeWidth={1.5} />
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-[14px] font-medium text-white/90 tracking-[-0.01em]">{symbol}</span>
          <span className="text-[13px] text-white/40 font-normal">{name}</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-white/30 font-normal">{exchange}</span>
        <ArrowRight className="w-3.5 h-3.5 text-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200" strokeWidth={1.5} />
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
      className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-white/[0.03] transition-all duration-200 text-left group"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
          <span className="text-[13px] font-medium text-white/60">{symbol.charAt(0)}</span>
        </div>
        <div>
          <p className="text-[14px] font-medium text-white/90 tracking-[-0.01em]">{symbol}</p>
          <p className="text-[12px] text-white/40 font-normal mt-0.5 leading-[1.35]">{name}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[11px] text-white/30 font-normal">{exchange}</span>
        <ArrowRight className="w-3.5 h-3.5 text-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200" strokeWidth={1.5} />
      </div>
    </button>
  )
}

function AlertItem({
  alert,
  onClick,
}: {
  alert: PriceAlert
  onClick: () => void
}) {
  const getConditionIcon = () => {
    switch (alert.condition) {
      case 'above':
      case 'crosses_above':
        return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
      case 'below':
      case 'crosses_below':
        return <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
      default:
        return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
    }
  }
  
  const getConditionText = () => {
    switch (alert.condition) {
      case 'above':
        return `Above $${alert.targetValue}`
      case 'below':
        return `Below $${alert.targetValue}`
      case 'crosses_above':
        return `Crosses above $${alert.targetValue}`
      case 'crosses_below':
        return `Crosses below $${alert.targetValue}`
      case 'percent_change':
        return `${alert.targetValue}% change`
      case 'volume_spike':
        return `Volume spike ${alert.targetValue}x`
      default:
        return `$${alert.targetValue}`
    }
  }
  
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] transition-all duration-200 text-left"
    >
      <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center">
        {getConditionIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white/90">{alert.symbol}</p>
        <p className="text-xs text-white/40 truncate">{getConditionText()}</p>
      </div>
      <ArrowRight className="w-3.5 h-3.5 text-white/20 flex-shrink-0" />
    </button>
  )
}
