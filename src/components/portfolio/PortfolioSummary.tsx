/**
 * Portfolio Summary Component
 * 
 * Displays key portfolio metrics:
 * - Total Value
 * - Day Change
 * - Total P&L
 * - Number of Holdings
 */

'use client'

import React, { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  PieChart,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePortfolioStore, type PortfolioSummary as PortfolioSummaryType } from '@/lib/stores/portfolio-store'

// ============================================================
// TYPES
// ============================================================

interface SummaryCardProps {
  title: string
  value: string
  change?: number
  changeLabel?: string
  icon: React.ElementType
  accent: string
  delay?: number
}

// ============================================================
// SUMMARY CARD
// ============================================================

const SummaryCard = memo(function SummaryCard({
  title,
  value,
  change,
  changeLabel,
  icon: Icon,
  accent,
  delay = 0,
}: SummaryCardProps) {
  const isPositive = change !== undefined && change >= 0
  const showChange = change !== undefined && change !== 0
  const progress = typeof change === 'number' ? Math.min(100, Math.abs(change)) : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={cn(
        'relative overflow-hidden rounded-2xl p-4 sm:p-5 border',
        'bg-gradient-to-br from-white/5 to-white/[0.03] backdrop-blur-sm',
        accent,
      )}
    >
      {/* Background icon */}
      <div className="absolute -right-6 -top-6 opacity-5">
        <Icon className="w-24 h-24" />
      </div>

      {/* Content */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-1.5 rounded-lg bg-white/10 border border-white/20">
            <Icon className="w-4 h-4 text-white" />
          </div>
          <span className="text-xs sm:text-sm text-white/50 font-medium">{title}</span>
        </div>

        <div className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-1 font-mono tabular-nums">
          {value}
        </div>

        {showChange && (
          <div className={cn(
            'flex items-center gap-1 text-xs sm:text-sm font-medium',
            isPositive ? 'text-green-400' : 'text-red-400'
          )}>
            {isPositive ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            <span>
              {isPositive ? '+' : ''}{change.toFixed(2)}%
            </span>
            {changeLabel && (
              <span className="text-white/30 ml-1">{changeLabel}</span>
            )}
          </div>
        )}

        {progress !== null && (
          <div className="mt-4">
            <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full bg-gradient-to-r',
                  isPositive
                    ? 'from-emerald-400 via-cyan-400 to-blue-500'
                    : 'from-rose-500 via-orange-400 to-amber-400'
                )}
                style={{ width: `${Math.min(100, Math.max(5, progress))}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </motion.div>
  )
})

// ============================================================
// PORTFOLIO SUMMARY COMPONENT
// ============================================================

export const PortfolioSummary = memo(function PortfolioSummary() {
  const summary = usePortfolioStore((state) => state.summary)
  const isLoading = usePortfolioStore((state) => state.isLoading)
  const isRefreshing = usePortfolioStore((state) => state.isRefreshing)
  const holdings = usePortfolioStore((state) => state.holdings)

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  // Format change with sign
  const formatChange = (value: number) => {
    const formatted = formatCurrency(Math.abs(value))
    return value >= 0 ? `+${formatted}` : `-${formatted}`
  }

  if (isLoading && !isRefreshing) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-28 sm:h-32 rounded-xl bg-white/5 animate-pulse"
          />
        ))}
      </div>
    )
  }

  const winRate = useMemo(() => {
    if (!holdings.length) return 0
    const winners = holdings.filter((h) => h.gainLoss >= 0).length
    return (winners / holdings.length) * 100
  }, [holdings])

  const avgPosition = summary.holdingsCount > 0
    ? summary.totalValue / summary.holdingsCount
    : 0

  const dailyVol = summary.totalValue > 0
    ? Math.abs((summary.dayGainLoss / summary.totalValue) * 100)
    : 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Value */}
      <SummaryCard
        title="Total Value"
        value={formatCurrency(summary.totalValue)}
        icon={Wallet}
          accent="border-white/10"
        delay={0}
      />

      {/* Day Change */}
      <SummaryCard
        title="Day Change"
        value={formatChange(summary.dayGainLoss)}
        change={summary.dayGainLossPercent}
        changeLabel="today"
        icon={summary.dayGainLoss >= 0 ? TrendingUp : TrendingDown}
          accent={summary.dayGainLoss >= 0 ? 'border-emerald-400/30' : 'border-rose-400/30'}
        delay={0.1}
      />

      {/* Total P&L */}
      <SummaryCard
        title="Total P&L"
        value={formatChange(summary.totalGainLoss)}
        change={summary.totalGainLossPercent}
        changeLabel="all time"
        icon={DollarSign}
          accent={summary.totalGainLoss >= 0 ? 'border-emerald-400/30' : 'border-rose-400/30'}
        delay={0.2}
      />

      {/* Holdings Count */}
      <SummaryCard
        title="Holdings"
        value={summary.holdingsCount.toString()}
        icon={PieChart}
          accent="border-violet-400/30"
        delay={0.3}
      />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/40 mb-1">Win rate</p>
          <p className="text-2xl font-semibold text-white">{winRate.toFixed(1)}%</p>
          <div className="mt-3 h-1.5 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-cyan-400 rounded-full"
              style={{ width: `${Math.min(100, winRate)}%` }}
            />
          </div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/40 mb-1">Avg. position size</p>
          <p className="text-2xl font-semibold text-white">{formatCurrency(avgPosition)}</p>
          <p className="text-xs text-white/40 mt-2">Across {summary.holdingsCount || 0} holdings</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-xs text-white/40 mb-1">Daily volatility</p>
          <p className="text-2xl font-semibold text-white">{dailyVol.toFixed(2)}%</p>
          <p className="text-xs text-white/40 mt-2">vs total portfolio value</p>
        </div>
      </div>
    </div>
  )
})

export default PortfolioSummary
