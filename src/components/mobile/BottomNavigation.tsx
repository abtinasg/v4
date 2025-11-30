'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  Search, 
  Star, 
  Newspaper,
  MessageSquare,
  TrendingUp
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/dashboard/stock-analysis', icon: Search, label: 'Stocks' },
  { href: '/dashboard/watchlist', icon: Star, label: 'Watchlist' },
  { href: '/dashboard/news', icon: Newspaper, label: 'News' },
  { href: '/dashboard/ai-assistant', icon: MessageSquare, label: 'AI' },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Blur backdrop */}
      <div className="absolute inset-0 bg-[#070A0F]/90 backdrop-blur-xl border-t border-white/[0.06]" />
      
      {/* Safe area padding for iOS */}
      <div className="relative flex items-center justify-around px-2 pt-2 pb-[calc(0.5rem+env(safe-area-inset-bottom))]">
        {navItems.map((item) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon

          return (
            <Link
              key={item.href}
              href={item.href}
              className="relative flex flex-col items-center justify-center w-16 py-1"
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute -top-1 w-8 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}
              
              {/* Icon with glow effect */}
              <div className={cn(
                "relative p-2 rounded-xl transition-all duration-200",
                isActive && "bg-cyan-500/10"
              )}>
                <Icon 
                  className={cn(
                    "w-5 h-5 transition-colors duration-200",
                    isActive ? "text-cyan-400" : "text-gray-500"
                  )}
                />
                {isActive && (
                  <div className="absolute inset-0 rounded-xl bg-cyan-400/20 blur-md" />
                )}
              </div>
              
              {/* Label */}
              <span className={cn(
                "text-[10px] font-medium mt-0.5 transition-colors duration-200",
                isActive ? "text-cyan-400" : "text-gray-500"
              )}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
