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

import React, { memo } from 'react'
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
  iconColor: string
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
  iconColor,
  delay = 0,
}: SummaryCardProps) {
  const isPositive = change !== undefined && change >= 0
  const showChange = change !== undefined && change !== 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={cn(
        'relative overflow-hidden rounded-xl',
        'bg-gradient-to-br from-white/5 to-white/[0.02]',
        'border border-white/10',
        'p-4 sm:p-5',
      )}
    >
      {/* Background icon */}
      <div className="absolute -right-4 -top-4 opacity-5">
        <Icon className="w-24 h-24" />
      </div>

      {/* Content */}
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <div className={cn('p-1.5 rounded-lg', iconColor)}>
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

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {/* Total Value */}
      <SummaryCard
        title="Total Value"
        value={formatCurrency(summary.totalValue)}
        icon={Wallet}
        iconColor="bg-cyan-500/20"
        delay={0}
      />

      {/* Day Change */}
      <SummaryCard
        title="Day Change"
        value={formatChange(summary.dayGainLoss)}
        change={summary.dayGainLossPercent}
        changeLabel="today"
        icon={summary.dayGainLoss >= 0 ? TrendingUp : TrendingDown}
        iconColor={summary.dayGainLoss >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}
        delay={0.1}
      />

      {/* Total P&L */}
      <SummaryCard
        title="Total P&L"
        value={formatChange(summary.totalGainLoss)}
        change={summary.totalGainLossPercent}
        changeLabel="all time"
        icon={DollarSign}
        iconColor={summary.totalGainLoss >= 0 ? 'bg-emerald-500/20' : 'bg-red-500/20'}
        delay={0.2}
      />

      {/* Holdings Count */}
      <SummaryCard
        title="Holdings"
        value={summary.holdingsCount.toString()}
        icon={PieChart}
        iconColor="bg-violet-500/20"
        delay={0.3}
      />
    </div>
  )
})

export default PortfolioSummary
