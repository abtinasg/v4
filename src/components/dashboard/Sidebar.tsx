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
  ChevronLeft,
  ChevronRight,
  Crown,
  Zap,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// Sidebar context for global state
interface SidebarContextType {
  isCollapsed: boolean
  setIsCollapsed: (value: boolean) => void
  toggleSidebar: () => void
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

  const toggleSidebar = () => setIsCollapsed((prev) => !prev)

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

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed, toggleSidebar }}>
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
    href: '/dashboard/terminal-pro',
    icon: Terminal,
    label: 'Terminal Pro',
    shortcut: '4',
    badge: 'Pro',
  },
  {
    href: '/dashboard/ai-assistant',
    icon: MessageSquare,
    label: 'AI Assistant',
    shortcut: '5',
    badge: 'New',
  },
]

interface SidebarProps {
  subscriptionTier: string
}

export function Sidebar({ subscriptionTier }: SidebarProps) {
  const { isCollapsed, toggleSidebar } = useSidebar()
  const pathname = usePathname()
  const { user } = useUser()

  const isPro = subscriptionTier === 'pro' || subscriptionTier === 'enterprise'

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 bottom-0 z-50 bg-[#0d0d0f] border-r border-white/5 flex flex-col"
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Terminal className="w-5 h-5 text-white" />
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
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-20 z-10 w-6 h-6 rounded-full bg-[#1a1a1f] border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#252529] transition-colors"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
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
                  ? 'bg-blue-500/10 text-blue-400'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full bg-blue-500"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}

              <Icon className={cn('w-5 h-5 flex-shrink-0', isActive && 'text-blue-400')} />

              <AnimatePresence>
                {!isCollapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-between flex-1 min-w-0"
                  >
                    <span className="text-sm font-medium truncate">{item.label}</span>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span
                          className={cn(
                            'px-1.5 py-0.5 text-[10px] font-semibold rounded',
                            item.badge === 'Pro'
                              ? 'bg-amber-500/20 text-amber-400'
                              : 'bg-green-500/20 text-green-400'
                          )}
                        >
                          {item.badge}
                        </span>
                      )}
                      <span className="text-[10px] text-gray-600 font-mono">⌘{item.shortcut}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-[#1a1a1f] border border-white/10 rounded-md text-sm text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                  {item.label}
                </div>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Subscription Badge */}
      <div className="px-3 py-4 border-t border-white/5">
        <AnimatePresence>
          {!isCollapsed ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={cn(
                'p-3 rounded-xl',
                isPro
                  ? 'bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20'
                  : 'bg-white/5 border border-white/10'
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                {isPro ? (
                  <Crown className="w-4 h-4 text-amber-400" />
                ) : (
                  <Zap className="w-4 h-4 text-gray-400" />
                )}
                <span className={cn('text-sm font-semibold', isPro ? 'text-amber-400' : 'text-white')}>
                  {subscriptionTier.charAt(0).toUpperCase() + subscriptionTier.slice(1)} Plan
                </span>
              </div>
              {!isPro && (
                <Link
                  href="/pricing"
                  className="block w-full px-3 py-2 text-xs font-semibold text-center text-white bg-blue-500 hover:bg-blue-600 rounded-lg transition-colors"
                >
                  Upgrade to Pro
                </Link>
              )}
              {isPro && (
                <p className="text-xs text-gray-400">Full access to all features</p>
              )}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center"
            >
              {isPro ? (
                <Crown className="w-5 h-5 text-amber-400" />
              ) : (
                <Link
                  href="/pricing"
                  className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 transition-colors"
                >
                  <Zap className="w-4 h-4 text-white" />
                </Link>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* User Profile */}
      <div className="px-3 py-4 border-t border-white/5">
        <div
          className={cn(
            'flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer',
            isCollapsed && 'justify-center'
          )}
        >
          <div className="relative">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || 'User'}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-white/10"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {user?.firstName?.charAt(0) || 'U'}
                </span>
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-[#0d0d0f]" />
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
  )
}
