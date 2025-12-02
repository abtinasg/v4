'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  LineChart, 
  List, 
  Terminal, 
  Newspaper, 
  Briefcase,
  Sparkles,
  CreditCard
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

export function DashboardSidebar() {
  const pathname = usePathname()
  
  return (
    <aside className="w-[260px] h-screen flex flex-col bg-[#06080C]/95 backdrop-blur-2xl border-r border-white/[0.04]">
      {/* Logo Section */}
      <div className="px-6 py-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="relative">
            <img src="/deep-logo.svg" alt="Deep" className="h-8 w-8" />
            <div className="absolute inset-0 bg-[#00C9E4]/20 blur-xl rounded-full" />
          </div>
          <span className="text-lg font-semibold text-white tracking-tight">Deep</span>
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1">
        {/* Primary Section */}
        <div className="space-y-0.5">
          <NavItem 
            href="/dashboard" 
            icon={LayoutDashboard}
            label="Overview"
            active={pathname === '/dashboard'}
          />
          <NavItem 
            href="/dashboard/stock-analysis" 
            icon={LineChart}
            label="Analysis"
            active={pathname === '/dashboard/stock-analysis'}
          />
        </div>

        {/* Divider */}
        <div className="py-3">
          <div className="h-px bg-white/[0.04]" />
        </div>

        {/* Portfolio Section */}
        <div className="space-y-0.5">
          <SectionLabel>Portfolio</SectionLabel>
          <NavItem 
            href="/dashboard/portfolio" 
            icon={Briefcase}
            label="Holdings"
            active={pathname === '/dashboard/portfolio'}
          />
          <NavItem 
            href="/dashboard/watchlist" 
            icon={List}
            label="Watchlist"
            active={pathname === '/dashboard/watchlist'}
          />
        </div>

        {/* Divider */}
        <div className="py-3">
          <div className="h-px bg-white/[0.04]" />
        </div>

        {/* Discover Section */}
        <div className="space-y-0.5">
          <SectionLabel>Discover</SectionLabel>
          <NavItem 
            href="/dashboard/news" 
            icon={Newspaper}
            label="News"
            active={pathname === '/dashboard/news'}
          />
          <NavItem 
            href="/dashboard/terminal-pro" 
            icon={Terminal}
            label="Terminal"
            active={pathname === '/dashboard/terminal-pro'}
            badge="Pro"
          />
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="p-4 space-y-3">
        {/* AI Assistant Card */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-[#9B87F5]/[0.08] to-[#00C9E4]/[0.04] border border-white/[0.06] p-4">
          <div className="absolute top-0 right-0 w-20 h-20 bg-[#9B87F5]/10 rounded-full blur-2xl" />
          <div className="relative">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#9B87F5]" />
              <span className="text-xs font-medium text-white/80">AI Assistant</span>
            </div>
            <p className="text-[11px] text-white/40 leading-relaxed">
              Get instant insights on any stock
            </p>
          </div>
        </div>

        {/* Credits Button */}
        <Link 
          href="/pricing"
          className={cn(
            'flex items-center justify-center gap-2 w-full',
            'px-4 py-2.5 rounded-xl',
            'bg-white/[0.04] border border-white/[0.06]',
            'hover:bg-white/[0.08] hover:border-white/[0.10]',
            'transition-all duration-200'
          )}
        >
          <CreditCard className="w-4 h-4 text-white/50" />
          <span className="text-sm font-medium text-white/70">Buy Credits</span>
        </Link>
      </div>
    </aside>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="block px-3 py-2 text-[10px] font-medium uppercase tracking-widest text-white/30">
      {children}
    </span>
  )
}

interface NavItemProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  active?: boolean
  badge?: string
}

function NavItem({ href, icon: Icon, label, active, badge }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl',
        'transition-all duration-200',
        active 
          ? 'bg-white/[0.06]' 
          : 'hover:bg-white/[0.04]'
      )}
    >
      {/* Active Indicator */}
      {active && (
        <motion.div
          layoutId="activeIndicator"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-[#00C9E4] rounded-full"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
      )}
      
      {/* Icon */}
      <Icon 
        className={cn(
          'w-[18px] h-[18px] transition-colors duration-200',
          active 
            ? 'text-white' 
            : 'text-white/40 group-hover:text-white/60'
        )} 
      />
      
      {/* Label */}
      <span 
        className={cn(
          'text-[13px] font-medium transition-colors duration-200',
          active 
            ? 'text-white' 
            : 'text-white/50 group-hover:text-white/70'
        )}
      >
        {label}
      </span>

      {/* Badge */}
      {badge && (
        <span className="ml-auto px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-[#9B87F5] bg-[#9B87F5]/10 rounded-md">
          {badge}
        </span>
      )}
    </Link>
  )
}
