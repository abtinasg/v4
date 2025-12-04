'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  LayoutDashboard, 
  LineChart, 
  Briefcase, 
  Newspaper,
  MessageSquare,
  Terminal,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/dashboard/stock-analysis', icon: LineChart, label: 'Stocks' },
  { href: '/dashboard/portfolio', icon: Briefcase, label: 'Portfolio' },
  { href: '/dashboard/news', icon: Newspaper, label: 'News' },
  { href: '/dashboard/ai-assistant', icon: MessageSquare, label: 'AI' },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Glass backdrop with blur */}
      <div className="absolute inset-0 bg-[#070A0F]/95 backdrop-blur-2xl border-t border-white/[0.08]">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-cyan-500/[0.02] to-transparent" />
      </div>
      
      {/* Safe area padding for iOS */}
      <div className="relative flex items-center justify-around px-1 pt-1 pb-[calc(0.25rem+env(safe-area-inset-bottom))]">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || 
            (item.href !== '/dashboard' && pathname.startsWith(item.href))
          const Icon = item.icon
          const isCenter = index === 2 // Make watchlist center/featured

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center py-2 transition-all active:scale-95",
                isCenter ? "w-14 -mt-3" : "flex-1"
              )}
            >
              {/* Center FAB style for watchlist */}
              {isCenter ? (
                <div className={cn(
                  "relative w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                  isActive 
                    ? "bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/30" 
                    : "bg-white/10 border border-white/10"
                )}>
                  <Icon className={cn(
                    "w-5 h-5 transition-colors",
                    isActive ? "text-white" : "text-gray-400"
                  )} />
                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 blur-lg opacity-50" />
                  )}
                </div>
              ) : (
                <>
                  {/* Active indicator pill */}
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavPill"
                      className="absolute top-0 w-10 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                  
                  {/* Icon */}
                  <div className={cn(
                    "relative p-1.5 rounded-xl transition-all",
                    isActive && "bg-cyan-500/10"
                  )}>
                    <Icon className={cn(
                      "w-[22px] h-[22px] transition-colors",
                      isActive ? "text-cyan-400" : "text-gray-500"
                    )} />
                    {isActive && (
                      <div className="absolute inset-0 rounded-xl bg-cyan-400/20 blur-sm" />
                    )}
                  </div>
                </>
              )}
              
              {/* Label - hidden for center item */}
              {!isCenter && (
                <span className={cn(
                  "text-[10px] font-medium mt-1 transition-colors",
                  isActive ? "text-cyan-400" : "text-gray-500"
                )}>
                  {item.label}
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
