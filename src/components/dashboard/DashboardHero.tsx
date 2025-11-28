"use client"

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  Sparkles,
  CalendarDays,
  Activity,
  TrendingUp,
  TrendingDown,
  ArrowRight,
  LayoutDashboard,
  Clock,
  RefreshCw,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import { GlassCard, GlassPill, PulsingDot } from '@/components/ui/cinematic'

interface MarketData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

interface DashboardHeroProps {
  className?: string
}

const QUICK_ACTIONS = [
  {
    label: 'AI Assistant',
    helper: 'Ask about markets',
    icon: Sparkles,
    href: '/dashboard/ai-assistant',
  },
  {
    label: 'Terminal Pro',
    helper: 'Advanced analysis',
    icon: LayoutDashboard,
    href: '/dashboard/terminal-pro',
  },
]

export function DashboardHero({ className }: DashboardHeroProps) {
  const router = useRouter()
  const [now, setNow] = useState(() => new Date())
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  const fetchMarketData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/market/overview')
      if (response.ok) {
        const result = await response.json()
        if (result.indices) {
          setMarketData(result.indices.slice(0, 4))
        }
      }
    } catch (error) {
      console.error('Error fetching market data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketData()
    const interval = setInterval(fetchMarketData, 60000)
    return () => clearInterval(interval)
  }, [])

  const greeting = useMemo(() => {
    const hour = now.getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [now])

  const formattedDate = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    }).format(now)
  }, [now])

  const formattedTime = useMemo(() => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    }).format(now)
  }, [now])

  const marketSentiment = useMemo(() => {
    if (marketData.length === 0) return { score: 50, label: 'Loading...' }
    const avgChange = marketData.reduce((sum, m) => sum + m.changePercent, 0) / marketData.length
    if (avgChange > 0.5) return { score: 75, label: 'Bullish' }
    if (avgChange > 0) return { score: 60, label: 'Positive' }
    if (avgChange > -0.5) return { score: 45, label: 'Mixed' }
    return { score: 30, label: 'Risk-off' }
  }, [marketData])

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className={className}
    >
      <GlassCard variant="elevated" className="overflow-hidden">
        <div className="relative p-4 sm:p-6">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/5" />
          </div>

          <div className="relative space-y-6">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-cyan-300/80">
                  <PulsingDot color="cyan" />
                  <span>Live Market Data</span>
                </div>
                <h1 className="mt-2 text-2xl sm:text-3xl font-semibold text-white">
                  {greeting}
                </h1>
                <p className="mt-1 text-sm text-gray-400">
                  {formattedDate}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formattedTime}</span>
                </div>
                <button
                  onClick={fetchMarketData}
                  disabled={isLoading}
                  className={cn(
                    'p-2 rounded-lg bg-white/5 border border-white/10',
                    'hover:bg-white/10 transition-all',
                    'disabled:opacity-50'
                  )}
                >
                  <RefreshCw className={cn('h-4 w-4 text-gray-400', isLoading && 'animate-spin')} />
                </button>
              </div>
            </div>

            {/* Market Stats Grid */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-4 animate-pulse">
                    <div className="h-3 w-16 bg-white/10 rounded mb-3" />
                    <div className="h-6 w-24 bg-white/10 rounded" />
                  </div>
                ))
              ) : (
                marketData.map((item) => (
                  <div
                    key={item.symbol}
                    className="rounded-xl border border-white/10 bg-white/5 p-4 hover:bg-white/[0.07] transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs uppercase tracking-wider text-gray-400">{item.name}</p>
                      <span
                        className={cn(
                          'text-xs font-semibold',
                          item.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                        )}
                      >
                        {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="mt-2 flex items-end justify-between">
                      <p className="text-xl font-semibold text-white tabular-nums">
                        {item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                      {item.changePercent >= 0 ? (
                        <TrendingUp className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Bottom Row */}
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Market Sentiment */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-white">
                  <Activity className="h-4 w-4 text-cyan-300" />
                  Market Sentiment
                </div>
                <div className="mt-3 space-y-2">
                  <div className="h-2 w-full rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${marketSentiment.score}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={cn(
                        'h-full rounded-full',
                        marketSentiment.score > 60 ? 'bg-emerald-400' :
                        marketSentiment.score > 40 ? 'bg-cyan-400' : 'bg-red-400'
                      )}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <span>Bearish</span>
                    <span className="font-medium text-white">{marketSentiment.label}</span>
                    <span>Bullish</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-white mb-3">
                  <Sparkles className="h-4 w-4 text-violet-300" />
                  Quick Actions
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {QUICK_ACTIONS.map((action) => {
                    const Icon = action.icon
                    return (
                      <button
                        key={action.label}
                        type="button"
                        onClick={() => router.push(action.href)}
                        className="group flex items-center gap-2 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-left transition-all hover:border-cyan-400/40 hover:bg-white/10"
                      >
                        <Icon className="h-4 w-4 text-cyan-300" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-white truncate">{action.label}</p>
                        </div>
                        <ArrowRight className="h-3 w-3 text-gray-500 group-hover:text-cyan-300 transition-colors" />
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.section>
  )
}
