'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface MobileCardProps {
  children: React.ReactNode
  className?: string
  title?: string
  icon?: LucideIcon
  badge?: string
  badgeColor?: 'cyan' | 'emerald' | 'amber' | 'red'
  onClick?: () => void
  noPadding?: boolean
}

export function MobileCard({ 
  children, 
  className, 
  title, 
  icon: Icon,
  badge,
  badgeColor = 'cyan',
  onClick,
  noPadding = false,
}: MobileCardProps) {
  const badgeColors = {
    cyan: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    red: 'bg-red-500/10 text-red-400 border-red-500/20',
  }

  return (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        "relative bg-[#0a0d12]/80 backdrop-blur-sm rounded-2xl border border-white/[0.06] overflow-hidden",
        onClick && "cursor-pointer active:bg-white/[0.02]",
        className
      )}
    >
      {/* Header */}
      {(title || Icon || badge) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.04]">
          <div className="flex items-center gap-2">
            {Icon && (
              <div className="p-1.5 rounded-lg bg-white/5">
                <Icon className="w-4 h-4 text-cyan-400" />
              </div>
            )}
            {title && (
              <h3 className="text-sm font-semibold text-white">{title}</h3>
            )}
          </div>
          {badge && (
            <span className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded-full border",
              badgeColors[badgeColor]
            )}>
              {badge}
            </span>
          )}
        </div>
      )}

      {/* Content */}
      <div className={cn(!noPadding && "p-4")}>
        {children}
      </div>
    </motion.div>
  )
}

// Quick Stat Card for mobile dashboards
interface QuickStatProps {
  label: string
  value: string | number
  change?: number
  icon?: LucideIcon
  iconColor?: string
}

export function QuickStat({ label, value, change, icon: Icon, iconColor = 'text-cyan-400' }: QuickStatProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/[0.02] rounded-xl border border-white/[0.04]">
      {Icon && (
        <div className={cn("p-2 rounded-lg bg-white/5", iconColor)}>
          <Icon className="w-4 h-4" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 truncate">{label}</p>
        <p className="text-lg font-bold text-white">{value}</p>
      </div>
      {change !== undefined && (
        <span className={cn(
          "text-xs font-medium px-2 py-1 rounded-full",
          change >= 0 
            ? "bg-emerald-500/10 text-emerald-400" 
            : "bg-red-500/10 text-red-400"
        )}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
      )}
    </div>
  )
}

// Compact List Item for mobile
interface ListItemProps {
  title: string
  subtitle?: string
  value?: string
  valueColor?: 'default' | 'positive' | 'negative'
  leftIcon?: LucideIcon
  rightElement?: React.ReactNode
  onClick?: () => void
}

export function MobileListItem({ 
  title, 
  subtitle, 
  value, 
  valueColor = 'default',
  leftIcon: LeftIcon,
  rightElement,
  onClick 
}: ListItemProps) {
  const valueColors = {
    default: 'text-white',
    positive: 'text-emerald-400',
    negative: 'text-red-400',
  }

  return (
    <motion.div
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 p-3 rounded-xl transition-colors",
        onClick && "cursor-pointer active:bg-white/[0.03]"
      )}
    >
      {LeftIcon && (
        <div className="p-2 rounded-lg bg-white/5">
          <LeftIcon className="w-4 h-4 text-gray-400" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 truncate">{subtitle}</p>
        )}
      </div>
      {value && (
        <span className={cn("text-sm font-semibold", valueColors[valueColor])}>
          {value}
        </span>
      )}
      {rightElement}
    </motion.div>
  )
}

// Section Header for mobile
interface SectionHeaderProps {
  title: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function MobileSectionHeader({ title, action }: SectionHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-base font-bold text-white">{title}</h2>
      {action && (
        <button 
          onClick={action.onClick}
          className="text-xs text-cyan-400 font-medium hover:text-cyan-300 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

// Horizontal Scroll Container
interface HorizontalScrollProps {
  children: React.ReactNode
  className?: string
}

export function HorizontalScroll({ children, className }: HorizontalScrollProps) {
  return (
    <div className={cn(
      "flex gap-3 overflow-x-auto pb-2 -mx-2 px-2 scrollbar-hide snap-x snap-mandatory",
      className
    )}>
      {children}
    </div>
  )
}

// Scroll Card (for horizontal lists)
interface ScrollCardProps {
  children: React.ReactNode
  className?: string
  width?: 'sm' | 'md' | 'lg'
}

export function ScrollCard({ children, className, width = 'md' }: ScrollCardProps) {
  const widths = {
    sm: 'w-32 min-w-[8rem]',
    md: 'w-44 min-w-[11rem]',
    lg: 'w-64 min-w-[16rem]',
  }

  return (
    <div className={cn(
      "flex-shrink-0 snap-start bg-white/[0.02] rounded-xl border border-white/[0.04] p-3",
      widths[width],
      className
    )}>
      {children}
    </div>
  )
}
