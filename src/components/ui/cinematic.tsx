'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

// ============================================
// GLASS CARD
// ============================================

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'subtle'
  glow?: 'none' | 'cyan' | 'violet' | 'green' | 'red'
  hover?: boolean
}

export function GlassCard({
  className,
  variant = 'default',
  glow = 'none',
  hover = false,
  children,
  ...props
}: GlassCardProps) {
  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden',
        // Base glass styles by variant
        variant === 'default' && 'bg-[#0C1017]/60 backdrop-blur-xl border border-white/[0.08]',
        variant === 'elevated' && 'bg-[#0F1318]/70 backdrop-blur-2xl border border-white/[0.1] shadow-depth-2',
        variant === 'subtle' && 'bg-white/[0.02] backdrop-blur-md border border-white/[0.05]',
        // Glow effects
        glow === 'cyan' && 'glow-cyan-soft',
        glow === 'violet' && 'glow-violet',
        glow === 'green' && 'glow-green-soft',
        glow === 'red' && 'glow-red-soft',
        // Hover effect
        hover && 'transition-all duration-300 hover:border-[#00D4FF]/30 hover:shadow-[0_0_30px_rgba(0,212,255,0.1)]',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

// ============================================
// PULSING DOT (for LIVE indicators)
// ============================================

interface PulsingDotProps {
  color?: 'green' | 'red' | 'cyan' | 'yellow'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PulsingDot({
  color = 'green',
  size = 'sm',
  className,
}: PulsingDotProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  }

  const colorClasses = {
    green: 'bg-green-500',
    red: 'bg-red-500',
    cyan: 'bg-cyan-400',
    yellow: 'bg-yellow-500',
  }

  const glowClasses = {
    green: 'shadow-[0_0_8px_rgba(34,197,94,0.6)]',
    red: 'shadow-[0_0_8px_rgba(239,68,68,0.6)]',
    cyan: 'shadow-[0_0_8px_rgba(0,212,255,0.6)]',
    yellow: 'shadow-[0_0_8px_rgba(234,179,8,0.6)]',
  }

  return (
    <span className={cn('relative inline-flex', className)}>
      <span
        className={cn(
          'rounded-full animate-pulse-dot',
          sizeClasses[size],
          colorClasses[color],
          glowClasses[color]
        )}
      />
      <span
        className={cn(
          'absolute inset-0 rounded-full animate-ping opacity-40',
          colorClasses[color]
        )}
      />
    </span>
  )
}

// ============================================
// GLASS PILL (for status badges)
// ============================================

interface GlassPillProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info'
  size?: 'sm' | 'md'
  pulse?: boolean
}

export function GlassPill({
  className,
  variant = 'default',
  size = 'md',
  pulse = false,
  children,
  ...props
}: GlassPillProps) {
  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full backdrop-blur-md font-medium',
        // Size
        size === 'sm' && 'px-2.5 py-1 text-xs',
        size === 'md' && 'px-3 py-1.5 text-sm',
        // Variants
        variant === 'default' && 'bg-white/[0.05] border border-white/[0.08] text-gray-300',
        variant === 'success' && 'bg-green-500/10 border border-green-500/20 text-green-400',
        variant === 'danger' && 'bg-red-500/10 border border-red-500/20 text-red-400',
        variant === 'warning' && 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400',
        variant === 'info' && 'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400',
        className
      )}
      {...props}
    >
      {pulse && (
        <PulsingDot
          color={
            variant === 'success' ? 'green' :
            variant === 'danger' ? 'red' :
            variant === 'warning' ? 'yellow' : 'cyan'
          }
        />
      )}
      {children}
    </div>
  )
}

// ============================================
// NEON BADGE (for gainers/losers)
// ============================================

interface NeonBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant: 'positive' | 'negative' | 'neutral'
  glow?: boolean
}

export function NeonBadge({
  className,
  variant,
  glow = true,
  children,
  ...props
}: NeonBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold transition-all',
        variant === 'positive' && [
          'bg-green-500/15 text-green-400 border border-green-500/20',
          glow && 'shadow-[0_0_10px_rgba(34,197,94,0.2)] animate-glow-flicker'
        ],
        variant === 'negative' && [
          'bg-red-500/15 text-red-400 border border-red-500/20',
          glow && 'shadow-[0_0_10px_rgba(239,68,68,0.2)] animate-glow-flicker'
        ],
        variant === 'neutral' && 'bg-gray-500/15 text-gray-400 border border-gray-500/20',
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

// ============================================
// GLOW TEXT
// ============================================

interface GlowTextProps extends React.HTMLAttributes<HTMLSpanElement> {
  color?: 'cyan' | 'green' | 'red' | 'violet' | 'blue'
  as?: 'span' | 'p' | 'h1' | 'h2' | 'h3' | 'h4'
}

export function GlowText({
  className,
  color = 'cyan',
  as: Component = 'span',
  children,
  ...props
}: GlowTextProps) {
  return (
    <Component
      className={cn(
        color === 'cyan' && 'text-cyan-400 text-glow-cyan',
        color === 'green' && 'text-green-400 text-glow-green',
        color === 'red' && 'text-red-400 text-glow-red',
        color === 'violet' && 'text-violet-400 text-glow-violet',
        color === 'blue' && 'text-blue-400 text-glow-blue',
        className
      )}
      {...props}
    >
      {children}
    </Component>
  )
}

// ============================================
// GRADIENT HEADER
// ============================================

interface GradientHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
}

export function GradientHeader({
  className,
  title,
  subtitle,
  children,
  ...props
}: GradientHeaderProps) {
  return (
    <div
      className={cn(
        'relative pb-4 mb-6 border-b border-white/[0.06]',
        className
      )}
      {...props}
    >
      {/* Gradient glow behind title */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-violet-500/5 blur-2xl" />
      
      <div className="relative flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white text-headline">
            {title}
          </h1>
          {subtitle && (
            <p className="text-gray-400 mt-1 text-sm">{subtitle}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}

// ============================================
// DATA TILE (for economic indicators)
// ============================================

interface DataTileProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: string | number
  change?: number
  icon?: React.ReactNode
  color?: 'emerald' | 'blue' | 'amber' | 'purple' | 'rose'
  trend?: number[]
}

export function DataTile({
  className,
  label,
  value,
  change,
  icon,
  color = 'blue',
  ...props
}: DataTileProps) {
  const colorMap = {
    emerald: {
      bg: 'bg-emerald-500/10',
      text: 'text-emerald-400',
      glow: 'shadow-[0_0_20px_rgba(16,185,129,0.1)]',
    },
    blue: {
      bg: 'bg-blue-500/10',
      text: 'text-blue-400',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.1)]',
    },
    amber: {
      bg: 'bg-amber-500/10',
      text: 'text-amber-400',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.1)]',
    },
    purple: {
      bg: 'bg-purple-500/10',
      text: 'text-purple-400',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.1)]',
    },
    rose: {
      bg: 'bg-rose-500/10',
      text: 'text-rose-400',
      glow: 'shadow-[0_0_20px_rgba(244,63,94,0.1)]',
    },
  }

  const isPositive = change !== undefined && change > 0
  const isNegative = change !== undefined && change < 0

  return (
    <div
      className={cn(
        'relative p-4 rounded-xl bg-[#0C1017]/60 backdrop-blur-xl',
        'border border-white/[0.06] hover:border-white/[0.12]',
        'transition-all duration-300 group cursor-pointer',
        colorMap[color].glow,
        className
      )}
      {...props}
    >
      {/* Gradient background */}
      <div className={cn(
        'absolute inset-0 opacity-30 rounded-xl',
        'bg-gradient-to-br',
        color === 'emerald' && 'from-emerald-500/10 to-transparent',
        color === 'blue' && 'from-blue-500/10 to-transparent',
        color === 'amber' && 'from-amber-500/10 to-transparent',
        color === 'purple' && 'from-purple-500/10 to-transparent',
        color === 'rose' && 'from-rose-500/10 to-transparent',
      )} />

      <div className="relative flex items-center gap-3">
        {icon && (
          <div className={cn('p-2 rounded-lg', colorMap[color].bg)}>
            <span className={colorMap[color].text}>{icon}</span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider truncate">
            {label}
          </p>
          <p className="text-xl font-bold text-white tabular-nums mt-0.5">
            {value}
          </p>
        </div>
        {change !== undefined && (
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium animate-arrow-fade',
            isPositive && 'text-green-400',
            isNegative && 'text-red-400',
            !isPositive && !isNegative && 'text-gray-400'
          )}>
            {isPositive && '↑'}
            {isNegative && '↓'}
            {!isPositive && !isNegative && '→'}
            <span>{Math.abs(change).toFixed(2)}%</span>
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================
// PILL TABS (glass tab buttons)
// ============================================

interface PillTabsProps {
  tabs: { value: string; label: string; icon?: React.ReactNode }[]
  value: string
  onChange: (value: string) => void
  className?: string
}

export function PillTabs({ tabs, value, onChange, className }: PillTabsProps) {
  return (
    <div className={cn(
      'inline-flex p-1 rounded-xl bg-white/[0.03] backdrop-blur-md border border-white/[0.06]',
      className
    )}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
            'flex items-center gap-2',
            value === tab.value
              ? 'text-white bg-white/[0.08]'
              : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
          )}
        >
          {tab.icon}
          {tab.label}
          {/* Neon bottom bar for active */}
          {value === tab.value && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(0,212,255,0.5)]" />
          )}
        </button>
      ))}
    </div>
  )
}

// ============================================
// SPARKLINE (mini chart with glow)
// ============================================

interface SparklineProps {
  data: number[]
  color?: 'cyan' | 'green' | 'red'
  width?: number
  height?: number
  className?: string
}

export function Sparkline({
  data,
  color = 'cyan',
  width = 60,
  height = 24,
  className,
}: SparklineProps) {
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  const colorMap = {
    cyan: { stroke: '#00D4FF', glow: 'drop-shadow(0 0 4px rgba(0,212,255,0.5))' },
    green: { stroke: '#22C55E', glow: 'drop-shadow(0 0 4px rgba(34,197,94,0.5))' },
    red: { stroke: '#EF4444', glow: 'drop-shadow(0 0 4px rgba(239,68,68,0.5))' },
  }

  return (
    <svg
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
    >
      <polyline
        fill="none"
        stroke={colorMap[color].stroke}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        style={{ filter: colorMap[color].glow }}
      />
    </svg>
  )
}

// ============================================
// NEON LINE (vertical indicator for sidebar)
// ============================================

export function NeonLine({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'w-0.5 h-6 rounded-full bg-cyan-400',
        'shadow-[0_0_10px_rgba(0,212,255,0.6),0_0_20px_rgba(0,212,255,0.3)]',
        'animate-neon-pulse',
        className
      )}
    />
  )
}

// ============================================
// LOADING SKELETON with shimmer
// ============================================

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-white/[0.05] rounded animate-shimmer',
        className
      )}
    />
  )
}

// ============================================
// FADE UP WRAPPER (for loading animations)
// ============================================

interface FadeUpProps extends React.HTMLAttributes<HTMLDivElement> {
  delay?: number
}

export function FadeUp({ className, delay = 0, children, ...props }: FadeUpProps) {
  return (
    <div
      className={cn('animate-fade-up', className)}
      style={{ animationDelay: `${delay}ms` }}
      {...props}
    >
      {children}
    </div>
  )
}
