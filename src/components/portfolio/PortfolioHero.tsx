/**
 * Portfolio Hero Section
 *
 * High-impact gradient banner that highlights overall portfolio health
 * with quick stats for top/worst performers and daily momentum.
 */

'use client'

import React, { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, TrendingDown, ShieldCheck, Flame } from 'lucide-react'
import { cn } from '@/lib/utils'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'

interface StatChipProps {
  icon: React.ElementType
  label: string
  value: string
  tone?: 'default' | 'positive' | 'negative'
}

const StatChip = memo(function StatChip({ icon: Icon, label, value, tone = 'default' }: StatChipProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium border',
        tone === 'positive' && 'border-emerald-400/40 text-emerald-200 bg-emerald-500/10',
        tone === 'negative' && 'border-rose-400/40 text-rose-200 bg-rose-500/10',
        tone === 'default' && 'border-white/10 text-white/70 bg-white/5'
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      <span className="text-white/60">{label}</span>
      <span className="text-white font-semibold">{value}</span>
    </div>
  )
})

export const PortfolioHero = memo(function PortfolioHero() {
  const summary = usePortfolioStore((s) => s.summary)
  const holdings = usePortfolioStore((s) => s.holdings)

  const { topGainer, topLoser, dayMover } = useMemo(() => {
    if (!holdings.length) {
      return { topGainer: null, topLoser: null, dayMover: null }
    }

    const sortedByGain = [...holdings].sort((a, b) => b.gainLossPercent - a.gainLossPercent)
    const sortedByDay = [...holdings].sort((a, b) => b.dayGainLossPercent - a.dayGainLossPercent)

    return {
      topGainer: sortedByGain[0],
      topLoser: sortedByGain[sortedByGain.length - 1],
      dayMover: sortedByDay[0],
    }
  }, [holdings])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)

  const formatPercent = (value: number) =>
    `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`

  return (
    <motion.section
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={cn(
        'relative overflow-hidden rounded-3xl border border-white/10',
        'bg-[radial-gradient(circle_at_top,_rgba(14,165,233,0.35),_rgba(15,23,42,0.95))]'
      )}
    >
      <div className="absolute inset-0 opacity-60 bg-[radial-gradient(circle_at_20%_20%,rgba(147,51,234,0.35),transparent_45%)]" />
      <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-br from-transparent via-cyan-500/10 to-indigo-500/30 blur-3xl" />

      <div className="relative p-6 sm:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-sm text-cyan-200/80 mb-3">
              <Sparkles className="w-4 h-4" />
              Intelligent Portfolio Overview
            </div>
            <div className="flex items-baseline gap-3 flex-wrap">
              <motion.h2
                key={summary.totalValue}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="text-4xl sm:text-5xl font-semibold text-white font-mono"
              >
                {formatCurrency(summary.totalValue)}
              </motion.h2>
              <span className="text-sm text-white/60">
                Total portfolio value · {summary.holdingsCount} positions
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <StatChip
                icon={summary.totalGainLoss >= 0 ? TrendingUp : TrendingDown}
                label="All time"
                value={formatPercent(summary.totalGainLossPercent)}
                tone={summary.totalGainLoss >= 0 ? 'positive' : 'negative'}
              />
              <StatChip
                icon={summary.dayGainLoss >= 0 ? Flame : TrendingDown}
                label="Today"
                value={`${summary.dayGainLoss >= 0 ? '+' : ''}${formatCurrency(summary.dayGainLoss)}`}
                tone={summary.dayGainLoss >= 0 ? 'positive' : 'negative'}
              />
              <StatChip icon={ShieldCheck} label="Risk" value={summary.holdingsCount > 8 ? 'Balanced' : 'Concentrated'} />
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 w-full md:max-w-sm">
            <p className="text-xs uppercase tracking-[0.2em] text-white/40 mb-3">Performance radar</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 p-3">
                <p className="text-xs text-emerald-200/80 mb-1">Top performer</p>
                <p className="text-sm font-semibold text-white">{topGainer?.symbol ?? '—'}</p>
                <p className="text-lg font-bold text-emerald-300">
                  {topGainer ? formatPercent(topGainer.gainLossPercent) : '--'}
                </p>
              </div>
              <div className="rounded-xl bg-rose-500/5 border border-rose-500/20 p-3">
                <p className="text-xs text-rose-200/80 mb-1">Under performer</p>
                <p className="text-sm font-semibold text-white">{topLoser?.symbol ?? '—'}</p>
                <p className="text-lg font-bold text-rose-300">
                  {topLoser ? formatPercent(topLoser.gainLossPercent) : '--'}
                </p>
              </div>
              <div className="col-span-2 rounded-xl bg-white/5 border border-white/10 p-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/40">Momentum leader (24h)</p>
                  <p className="text-sm font-semibold text-white">{dayMover?.symbol ?? '—'}</p>
                </div>
                <div className="text-right">
                  <p className={cn(
                    'text-lg font-bold',
                    (dayMover?.dayGainLossPercent ?? 0) >= 0 ? 'text-emerald-300' : 'text-rose-300'
                  )}>
                    {dayMover ? formatPercent(dayMover.dayGainLossPercent) : '--'}
                  </p>
                  <p className="text-xs text-white/40">intraday change</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.section>
  )
})

export default PortfolioHero
