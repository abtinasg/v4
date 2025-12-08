'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Calendar,
  MessageSquare,
  TrendingUp,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Brain,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

const navItems: NavItem[] = [
  { name: 'Overview', href: '/abtin', icon: LayoutDashboard },
  { name: 'Daily Planning', href: '/abtin/planning', icon: Calendar },
  { name: 'Psychology Chat', href: '/abtin/chat', icon: MessageSquare },
  { name: 'Portfolio', href: '/abtin/portfolio', icon: TrendingUp },
  { name: 'Settings', href: '/abtin/settings', icon: Settings },
]

interface DashboardSidebarProps {
  user: {
    username: string
    email?: string
    fullName?: string
  }
}

export default function DashboardSidebar({ user }: DashboardSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    try {
      await fetch('/api/abtin/auth/logout', { method: 'POST' })
      router.push('/abtin')
      router.refresh()
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 280 }}
      className="bg-white/[0.02] border-r border-white/[0.05] flex flex-col h-screen sticky top-0"
    >
      {/* Header */}
      <div className="p-6 border-b border-white/[0.05]">
        <div className="flex items-center justify-between">
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-3"
              >
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center">
                  <Brain className="w-5 h-5 text-white/70" />
                </div>
                <div>
                  <h1 className="text-sm font-semibold text-white">Abtin</h1>
                  <p className="text-xs text-white/40">Personal Dashboard</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 hover:bg-white/[0.05] rounded-lg transition-colors"
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4 text-white/60" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-white/60" />
            )}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href || (item.href !== '/abtin' && pathname.startsWith(item.href))
          
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all relative',
                isActive
                  ? 'bg-violet-500/20 text-white border border-violet-500/30'
                  : 'text-white/60 hover:bg-white/[0.05] hover:text-white'
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <AnimatePresence mode="wait">
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-sm font-medium"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              {item.badge && !collapsed && (
                <span className="ml-auto bg-red-500/20 text-red-400 text-xs px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-white/[0.05] space-y-2">
        <div
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.03]',
            collapsed && 'justify-center'
          )}
        >
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-medium">
              {user.fullName?.[0] || user.username[0].toUpperCase()}
            </span>
          </div>
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1 min-w-0"
              >
                <p className="text-sm font-medium text-white truncate">
                  {user.fullName || user.username}
                </p>
                <p className="text-xs text-white/40 truncate">
                  {user.email || '@' + user.username}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-white/60 hover:bg-red-500/10 hover:text-red-400 transition-all',
            collapsed && 'justify-center'
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence mode="wait">
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </motion.aside>
  )
}
