'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Sparkline } from './Sparkline'
import { cn } from '@/lib/utils'

interface MarketCardProps {
  name: string
  symbol: string
  value: number
  change: number
  changePercent: number
  sparklineData: number[]
  icon?: React.ReactNode
  suffix?: string
  prefix?: string
  isLoading?: boolean
}

export function MarketCard({
  name,
  symbol,
  value,
  change,
  changePercent,
  sparklineData,
  icon,
  suffix = '',
  prefix = '',
  isLoading = false,
}: MarketCardProps) {
  const isPositive = change >= 0

  if (isLoading) {
    return <MarketCardSkeleton />
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-5 hover:bg-white/[0.06] hover:border-white/[0.15] transition-all duration-300"
    >
      {/* Background gradient glow */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl',
          isPositive ? 'bg-green-500/10' : 'bg-red-500/10'
        )}
      />

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {icon && (
              <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                {icon}
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-400">{symbol}</p>
              <p className="text-xs text-gray-500">{name}</p>
            </div>
          </div>
          <div
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              isPositive
                ? 'bg-green-500/10 text-green-400'
                : 'bg-red-500/10 text-red-400'
            )}
          >
            {isPositive ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {isPositive ? '+' : ''}
            {changePercent.toFixed(2)}%
          </div>
        </div>

        {/* Value */}
        <div className="mb-3">
          <p className="text-2xl font-bold text-white">
            {prefix}
            {typeof value === 'number' ? value.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }) : value}
            {suffix}
          </p>
          <p
            className={cn(
              'text-sm font-medium',
              isPositive ? 'text-green-400' : 'text-red-400'
            )}
          >
            {isPositive ? '+' : ''}
            {change.toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
            {' '}today
          </p>
        </div>

        {/* Sparkline */}
        <div className="h-10">
          <Sparkline data={sparklineData} positive={isPositive} />
        </div>
      </div>
    </motion.div>
  )
}

function MarketCardSkeleton() {
  return (
    <div className="relative overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm p-5">
      <div className="animate-pulse">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white/10" />
            <div>
              <div className="h-4 w-16 bg-white/10 rounded mb-1" />
              <div className="h-3 w-24 bg-white/10 rounded" />
            </div>
          </div>
          <div className="h-6 w-16 bg-white/10 rounded-full" />
        </div>

        {/* Value */}
        <div className="mb-3">
          <div className="h-8 w-32 bg-white/10 rounded mb-2" />
          <div className="h-4 w-24 bg-white/10 rounded" />
        </div>

        {/* Sparkline placeholder */}
        <div className="h-10 bg-white/5 rounded" />
      </div>
    </div>
  )
}

export { MarketCardSkeleton }
