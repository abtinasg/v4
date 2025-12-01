'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  LineChart,
  Star,
  Terminal,
  MessageSquare,
  Newspaper,
  ChevronLeft,
  ChevronRight,
  Crown,
  Zap,
  Settings,
  LogOut,
  X,
  Coins,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Sidebar context for global state
interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (value: boolean) => void
  toggleSidebar: () => void
  isMobileOpen: boolean
  setIsMobileOpen: (value: boolean) => void
  toggleMobileSidebar: () => void
}

const SidebarContext = createContext<SidebarContextType | null>(null)

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  const toggleSidebar = () => setIsCollapsed((prev) => !prev)
  const toggleMobileSidebar = () => setIsMobileOpen((prev) => !prev)

  // Keyboard shortcut: Cmd/Ctrl + B to toggle sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Close mobile sidebar when pressing Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMobileOpen) {
        setIsMobileOpen(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isMobileOpen])

  // Lock body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isMobileOpen])

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, toggleSidebar, isMobileOpen, setIsMobileOpen, toggleMobileSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

const navItems = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Overview',
    shortcut: '1',
  },
  {
    href: '/dashboard/stock-analysis',
    icon: LineChart,
    label: 'Stock Analysis',
    shortcut: '2',
  },
  {
    href: '/dashboard/watchlist',
    icon: Star,
    label: 'Watchlist',
    shortcut: '3',
  },
  {
    href: '/dashboard/news',
    icon: Newspaper,
    label: 'Market News',
    shortcut: '4',
  },
  {
    href: '/dashboard/terminal-pro',
    icon: Terminal,
    label: 'Terminal Pro',
    shortcut: '5',
    badge: 'Pro',
  },
  {
    href: '/dashboard/ai-assistant',
    icon: MessageSquare,
    label: 'AI Assistant',
    shortcut: '6',
    badge: 'New',
  },
]

// Credit-based system - no subscription tier props needed
export function Sidebar() {
  const { isCollapsed, toggleSidebar, isMobileOpen, setIsMobileOpen } = useSidebar()
  const pathname = usePathname()
  const { user } = useUser()
  const [isMounted, setIsMounted] = useState(false)
  const [creditBalance, setCreditBalance] = useState<number | null>(null)

  // Track if component is mounted (for SSR safety)
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Fetch credit balance
  useEffect(() => {
    async function fetchCredits() {
      try {
        const res = await fetch('/api/credits')
        if (res.ok) {
          const data = await res.json()
          setCreditBalance(Number(data.balance) || 0)
        }
      } catch (error) {
        console.error('Failed to fetch credits:', error)
      }
    }
    fetchCredits()
  }, [])

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname, setIsMobileOpen])

  // Calculate sidebar width - on mobile always 280, on desktop depends on collapsed state
  const sidebarWidth = isMounted && typeof window !== 'undefined' && window.innerWidth >= 1024 && isCollapsed ? 80 : 280

  return (
    <>
      {/* Mobile Overlay Backdrop */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: sidebarWidth }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={cn(
          'fixed left-0 top-0 bottom-0 z-50 glass-panel flex flex-col',
          'transition-transform duration-300 ease-in-out',
          // Mobile: hidden by default, shown when isMobileOpen
          // Desktop: always visible
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/[0.02] via-transparent to-violet-500/[0.02] pointer-events-none" />

      {/* Logo Section */}
      <div className="relative h-16 flex items-center justify-between px-4 border-b border-white/[0.06]">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Terminal className="w-5 h-5 text-white" />
            {/* Glow effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 blur-md opacity-40" />
          </div>
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="text-lg font-bold text-white whitespace-nowrap"
              >
                Deep Terminal
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-2 rounded-lg hover:bg-white/[0.05] text-gray-400 hover:text-white transition-colors"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Toggle Button - Hidden on mobile */}
      <button
        onClick={toggleSidebar}
        className="hidden lg:flex absolute -right-3 top-20 z-10 w-6 h-6 rounded-full bg-[#0C1017] border border-white/[0.1] items-center justify-center text-gray-400 hover:text-cyan-400 hover:border-cyan-500/30 hover:shadow-[0_0_10px_rgba(0,212,255,0.2)] transition-all"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto relative">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-transparent text-cyan-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
              )}
            >
              {/* Neon active indicator line */}
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-6 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,212,255,0.6)]"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              {/* Icon with glow effect on active */}
              <div className="relative">
                <Icon 
                  className={cn(
                    'w-5 h-5 flex-shrink-0 transition-all duration-200',
                    isActive && 'text-cyan-400 drop-shadow-[0_0_6px_rgba(0,212,255,0.5)]'
                  )} 
                />
              </div>

              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between flex-1 min-w-0"
                  >
                    <span className={cn(
                      "text-sm font-medium truncate",
                      isActive && "text-cyan-400"
                    )}>{item.label}</span>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span
                          className={cn(
                            'px-1.5 py-0.5 text-[10px] font-semibold rounded-md border',
                            item.badge === 'Pro'
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-600 font-mono opacity-0 group-hover:opacity-100 transition-opacity">⌘{item.shortcut}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-3 py-1.5 glass-panel rounded-lg text-sm text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 border border-white/[0.08]">
                  {item.label}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Credits Section */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <AnimatePresence>
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="p-3 rounded-xl relative overflow-hidden glass-panel border border-white/[0.08]"
            >
              <div className="relative flex items-center gap-2 mb-2">
                <Coins className="w-4 h-4 text-cyan-400" />
                <span className="text-sm font-semibold text-white">
                  {creditBalance !== null ? creditBalance.toLocaleString() : '...'} Credits
                </span>
              </div>
              <Link
                href="/pricing"
                className="relative block w-full px-3 py-2 text-xs font-semibold text-center text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30"
              >
                Buy Credits
              </Link>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              <Link
                href="/pricing"
                className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20"
                title={`${creditBalance !== null ? creditBalance.toLocaleString() : '...'} Credits`}
              >
                <Coins className="w-4 h-4 text-white" />
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Profile */}
      <div className="px-3 py-4 border-t border-white/[0.06]">
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors cursor-pointer',
            isCollapsed && 'justify-center'
          )}
        >
          <div className="relative">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || 'User'}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white/[0.1] ring-offset-2 ring-offset-[#0C1017]"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                <span className="text-sm font-semibold text-white">
                  {user?.firstName?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0C1017] shadow-[0_0_6px_rgba(52,211,153,0.5)]" />
          </div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white truncate">
                  {user?.fullName || user?.firstName || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.primaryEmailAddress?.emailAddress || 'user@example.com'}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
    </>
  )
}
