'use client'

import { useState, useEffect, useRef } from 'react'
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
  TrendingUp,
  TrendingDown,
  Clock,
  ArrowRight,
  LayoutDashboard,
  LineChart,
  Star,
  Terminal,
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
  const searchInputRef = useRef<HTMLInputElement>(null)

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

  // Toggle theme
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode)
    // In a real app, this would toggle the actual theme
    document.documentElement.classList.toggle('dark')
  }

  return (
    <>
      <header className="h-16 bg-[#0d0d0f] border-b border-white/5 flex items-center justify-between px-6">
        {/* Left: Breadcrumbs */}
        <nav className="flex items-center gap-2 text-sm">
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

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-400 hover:text-white transition-colors"
          >
            <Search className="w-4 h-4" />
            <span className="text-sm hidden sm:inline">Search stocks...</span>
            <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] text-gray-500">
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
          <div className="ml-2 pl-4 border-l border-white/10">
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
              className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl z-50"
            >
              <div className="bg-[#0d0d0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Search Input */}
                <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for stocks, ETFs, or crypto..."
                    className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-lg"
                  />
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

                {/* Recent Searches */}
                {!searchQuery && (
                  <div className="p-4 border-t border-white/5">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Recent</p>
                    <div className="space-y-1">
                      <RecentItem symbol="AAPL" name="Apple Inc." change={2.34} />
                      <RecentItem symbol="TSLA" name="Tesla Inc." change={-1.28} />
                      <RecentItem symbol="NVDA" name="NVIDIA Corporation" change={5.67} />
                    </div>
                  </div>
                )}

                {/* Search Results */}
                {searchQuery && (
                  <div className="p-4 max-h-80 overflow-y-auto">
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">
                      Results for "{searchQuery}"
                    </p>
                    <div className="space-y-1">
                      <SearchResult
                        symbol="AAPL"
                        name="Apple Inc."
                        exchange="NASDAQ"
                        onClick={() => setIsSearchOpen(false)}
                      />
                      <SearchResult
                        symbol="AMZN"
                        name="Amazon.com Inc."
                        exchange="NASDAQ"
                        onClick={() => setIsSearchOpen(false)}
                      />
                      <SearchResult
                        symbol="AMD"
                        name="Advanced Micro Devices"
                        exchange="NASDAQ"
                        onClick={() => setIsSearchOpen(false)}
                      />
                    </div>
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

function RecentItem({
  symbol,
  name,
  change,
}: {
  symbol: string
  name: string
  change: number
}) {
  const isPositive = change >= 0

  return (
    <button className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors text-left group">
      <div className="flex items-center gap-3">
        <Clock className="w-4 h-4 text-gray-500" />
        <div>
          <span className="text-sm font-medium text-white">{symbol}</span>
          <span className="text-sm text-gray-500 ml-2">{name}</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={cn(
            'text-sm font-medium flex items-center gap-1',
            isPositive ? 'text-green-400' : 'text-red-400'
          )}
        >
          {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {isPositive ? '+' : ''}{change}%
        </span>
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
