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

      {/* Navigation content with safe area */}
      <div className="relative flex items-center justify-around px-2 h-16 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item, index) => {
          // Fix: Use exact match for /dashboard, prefix match with / for other routes
          const isActive = item.href === '/dashboard'
            ? pathname === '/dashboard'
            : pathname === item.href || pathname.startsWith(item.href + '/')
          const Icon = item.icon
          const isCenter = index === 2 // Make portfolio center/featured

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-col items-center justify-center transition-all active:scale-95",
                isCenter ? "w-16 -mt-4" : "flex-1 h-full"
              )}
            >
              {/* Center FAB style for portfolio */}
              {isCenter ? (
                <div className={cn(
                  "relative w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-lg",
                  isActive 
                    ? "bg-gradient-to-br from-cyan-500 to-blue-600" 
                    : "bg-[#1a1f2e] border border-white/10"
                )}>
                  <Icon className={cn(
                    "w-6 h-6 transition-colors",
                    isActive ? "text-white" : "text-gray-400"
                  )} />
                  {isActive && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 blur-xl opacity-40 -z-10" />
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {/* Active indicator pill */}
                  {isActive && (
                    <motion.div
                      layoutId="bottomNavPill"
                      className="absolute -top-0.5 w-8 h-1 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
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
                  </div>
                  
                  {/* Label */}
                  <span className={cn(
                    "text-[10px] font-medium mt-0.5 transition-colors",
                    isActive ? "text-cyan-400" : "text-gray-500"
                  )}>
                    {item.label}
                  </span>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
