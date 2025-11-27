'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Landmark,
  TrendingUp,
  TrendingDown,
  Minus,
  Percent,
  Users,
  BarChart3,
  Smile,
  RefreshCw,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/cinematic'

interface EconomicIndicator {
  id: string
  name: string
  value: string
  change: number
  trend: 'up' | 'down' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
  color: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose'
}

const defaultIndicators: EconomicIndicator[] = [
  {
    id: 'fed',
    name: 'Fed Funds Rate',
    value: '—',
    change: 0,
    trend: 'neutral',
    icon: Landmark,
    color: 'purple',
  },
  {
    id: 'cpi',
    name: 'CPI (YoY)',
    value: '—',
    change: 0,
    trend: 'neutral',
    icon: Percent,
    color: 'amber',
  },
  {
    id: 'unemployment',
    name: 'Unemployment',
    value: '—',
    change: 0,
    trend: 'neutral',
    icon: Users,
    color: 'blue',
  },
  {
    id: 'gdp',
    name: 'GDP Growth',
    value: '—',
    change: 0,
    trend: 'neutral',
    icon: BarChart3,
    color: 'emerald',
  },
  {
    id: 'sentiment',
    name: 'Consumer Sentiment',
    value: '—',
    change: 0,
    trend: 'neutral',
    icon: Smile,
    color: 'rose',
  },
]

const colorMap = {
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  rose: { bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/20' },
}

interface EconomicIndicatorsSectionProps {
  className?: string
}

export function EconomicIndicatorsSection({ className }: EconomicIndicatorsSectionProps) {
  const [indicators, setIndicators] = useState<EconomicIndicator[]>(defaultIndicators)
  const [isLoading, setIsLoading] = useState(true)

  const fetchIndicators = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/economic/indicators')
      if (!response.ok) throw new Error('Failed to fetch')
      const result = await response.json()

      if (result.success && result.data) {
        const data = result.data
        const mapped: EconomicIndicator[] = []

        if (data.federalFundsRate?.value !== null) {
          mapped.push({
            id: 'fed',
            name: 'Fed Funds Rate',
            value: `${data.federalFundsRate.value.toFixed(2)}%`,
            change: data.federalFundsRate.change || 0,
            trend: (data.federalFundsRate.change || 0) > 0.05 ? 'up' : (data.federalFundsRate.change || 0) < -0.05 ? 'down' : 'neutral',
            icon: Landmark,
            color: 'purple',
          })
        }

        if (data.inflation?.value !== null) {
          mapped.push({
            id: 'cpi',
            name: 'CPI (YoY)',
            value: `${data.inflation.value.toFixed(1)}%`,
            change: data.inflation.change || 0,
            trend: (data.inflation.change || 0) > 0.05 ? 'up' : (data.inflation.change || 0) < -0.05 ? 'down' : 'neutral',
            icon: Percent,
            color: 'amber',
          })
        }

        if (data.unemployment?.value !== null) {
          mapped.push({
            id: 'unemployment',
            name: 'Unemployment',
            value: `${data.unemployment.value.toFixed(1)}%`,
            change: data.unemployment.change || 0,
            trend: (data.unemployment.change || 0) > 0.05 ? 'up' : (data.unemployment.change || 0) < -0.05 ? 'down' : 'neutral',
            icon: Users,
            color: 'blue',
          })
        }

        if (data.gdp?.value !== null) {
          mapped.push({
            id: 'gdp',
            name: 'GDP Growth',
            value: `${data.gdp.value.toFixed(1)}%`,
            change: data.gdp.change || 0,
            trend: (data.gdp.change || 0) > 0.05 ? 'up' : (data.gdp.change || 0) < -0.05 ? 'down' : 'neutral',
            icon: BarChart3,
            color: 'emerald',
          })
        }

        if (data.consumerConfidence?.value !== null) {
          mapped.push({
            id: 'sentiment',
            name: 'Consumer Sentiment',
            value: data.consumerConfidence.value.toFixed(1),
            change: data.consumerConfidence.change || 0,
            trend: (data.consumerConfidence.change || 0) > 0.5 ? 'up' : (data.consumerConfidence.change || 0) < -0.5 ? 'down' : 'neutral',
            icon: Smile,
            color: 'rose',
          })
        }

        if (mapped.length > 0) {
          setIndicators(mapped)
        }
      }
    } catch (error) {
      console.error('Error fetching economic indicators:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchIndicators()
    const interval = setInterval(fetchIndicators, 300000) // Refresh every 5 minutes
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className={className}
    >
      <GlassCard className="h-full p-3 sm:p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-transparent blur-lg opacity-50" />
              <h3 className="relative text-sm sm:text-base font-semibold text-white">Economic Indicators</h3>
            </div>
          </div>
          <button
            onClick={fetchIndicators}
            disabled={isLoading}
            className={cn(
              'p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]',
              'hover:bg-white/[0.06] hover:border-blue-500/30',
              'text-gray-400 hover:text-blue-400 transition-all duration-300',
              'disabled:opacity-50'
            )}
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Indicators List */}
        <div className="space-y-3">
          {indicators.map((indicator, index) => {
            const colors = colorMap[indicator.color]
            const Icon = indicator.icon
            
            return (
              <motion.div
                key={indicator.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                className={cn(
                  'flex items-center justify-between p-3 rounded-xl',
                  'bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08]',
                  'transition-all duration-300 cursor-pointer group'
                )}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'p-2 rounded-lg transition-all',
                    colors.bg,
                    'group-hover:scale-110'
                  )}>
                    <Icon className={cn('w-4 h-4', colors.text)} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">{indicator.name}</p>
                    <p className="text-sm font-bold text-white tabular-nums">{indicator.value}</p>
                  </div>
                </div>
                
                {/* Trend Indicator */}
                <div className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium',
                  indicator.trend === 'up' && 'bg-emerald-500/10 text-emerald-400',
                  indicator.trend === 'down' && 'bg-red-500/10 text-red-400',
                  indicator.trend === 'neutral' && 'bg-gray-500/10 text-gray-400'
                )}>
                  {indicator.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                  {indicator.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                  {indicator.trend === 'neutral' && <Minus className="w-3 h-3" />}
                  <span className="tabular-nums">
                    {indicator.change > 0 ? '+' : ''}{indicator.change.toFixed(1)}
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </GlassCard>
    </motion.div>
  )
}
