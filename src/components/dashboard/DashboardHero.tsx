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
  Sun,
  Moon,
  Sunrise,
  Sunset,
  Factory,
  Briefcase,
  Percent,
  Users,
  BarChart3,
  Landmark,
  Smile,
  Brain,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { GlassCard, GlassPill, PulsingDot } from '@/components/ui/cinematic'

interface MarketData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

interface EconomicIndicatorData {
  value: number | null
  change: number | null
}

interface EconomicData {
  gdp: EconomicIndicatorData | null
  unemployment: EconomicIndicatorData | null
  inflation: EconomicIndicatorData | null
  federalFundsRate: EconomicIndicatorData | null
  consumerConfidence: EconomicIndicatorData | null
  manufacturingPmi: EconomicIndicatorData | null
  servicesPmi: EconomicIndicatorData | null
}

interface DashboardAnalysis {
  analysis: string
  marketMood: 'bullish' | 'bearish' | 'neutral' | 'mixed'
  sentimentBreakdown: {
    bullish: number
    bearish: number
    neutral: number
  }
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
  const { user } = useUser()
  const [now, setNow] = useState(() => new Date())
  const [marketData, setMarketData] = useState<MarketData[]>([])
  const [economicData, setEconomicData] = useState<EconomicData | null>(null)
  const [aiAnalysis, setAiAnalysis] = useState<DashboardAnalysis | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalysisLoading, setIsAnalysisLoading] = useState(true)

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

  const fetchAiAnalysis = async () => {
    setIsAnalysisLoading(true)
    try {
      const response = await fetch('/api/market/dashboard-analysis')
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setAiAnalysis({
            analysis: result.analysis,
            marketMood: result.marketMood,
            sentimentBreakdown: result.sentimentBreakdown
          })
          setEconomicData(result.economicIndicators)
        }
      }
    } catch (error) {
      console.error('Error fetching AI analysis:', error)
    } finally {
      setIsAnalysisLoading(false)
    }
  }

  useEffect(() => {
    fetchMarketData()
    fetchAiAnalysis()
    const marketInterval = setInterval(fetchMarketData, 60000)
    const analysisInterval = setInterval(fetchAiAnalysis, 300000) // Refresh AI analysis every 5 min
    return () => {
      clearInterval(marketInterval)
      clearInterval(analysisInterval)
    }
  }, [])

  const greeting = useMemo(() => {
    const hour = now.getHours()
    if (hour >= 5 && hour < 12) return 'Good morning'
    if (hour >= 12 && hour < 17) return 'Good afternoon'
    if (hour >= 17 && hour < 21) return 'Good evening'
    return 'Good night'
  }, [now])

  const greetingIcon = useMemo(() => {
    const hour = now.getHours()
    if (hour >= 5 && hour < 12) return <Sunrise className="h-5 w-5 text-amber-400" />
    if (hour >= 12 && hour < 17) return <Sun className="h-5 w-5 text-yellow-400" />
    if (hour >= 17 && hour < 21) return <Sunset className="h-5 w-5 text-orange-400" />
    return <Moon className="h-5 w-5 text-blue-300" />
  }, [now])

  const userName = useMemo(() => {
    if (!user) return ''
    return user.firstName || user.username || ''
  }, [user])

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
        <div className="relative p-3 sm:p-4 md:p-6">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-violet-500/5" />
          </div>

          <div className="relative space-y-4 md:space-y-6">
            {/* Header - Compact on mobile */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-[10px] sm:text-xs uppercase tracking-wider text-cyan-300/80">
                  <PulsingDot color="cyan" />
                  <span>Live Market</span>
                </div>
                <h1 className="mt-1 sm:mt-2 text-lg sm:text-2xl md:text-3xl font-semibold text-white flex items-center gap-2 sm:gap-3">
                  <span className="hidden sm:inline">{greetingIcon}</span>
                  <span className="truncate">
                    {greeting}
                    {userName && <span className="text-cyan-400">, {userName}</span>}
                  </span>
                </h1>
                <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm text-gray-400">
                  {formattedDate} • {formattedTime}
                </p>
              </div>
              <button
                onClick={() => {
                  fetchMarketData()
                  fetchAiAnalysis()
                }}
                disabled={isLoading || isAnalysisLoading}
                className={cn(
                  'p-2 rounded-lg bg-white/5 border border-white/10 flex-shrink-0',
                  'hover:bg-white/10 transition-all active:scale-95',
                  'disabled:opacity-50'
                )}
              >
                <RefreshCw className={cn('h-4 w-4 text-gray-400', (isLoading || isAnalysisLoading) && 'animate-spin')} />
              </button>
            </div>

            {/* Market Stats Grid - 2 cols on mobile, 4 on desktop */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="rounded-xl border border-white/10 bg-white/5 p-2.5 sm:p-4 animate-pulse">
                    <div className="h-2.5 sm:h-3 w-12 sm:w-16 bg-white/10 rounded mb-2 sm:mb-3" />
                    <div className="h-5 sm:h-6 w-16 sm:w-24 bg-white/10 rounded" />
                  </div>
                ))
              ) : (
                marketData.map((item) => (
                  <div
                    key={item.symbol}
                    className="rounded-xl border border-white/10 bg-white/5 p-2.5 sm:p-4 hover:bg-white/[0.07] transition-colors active:scale-[0.98]"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-[10px] sm:text-xs uppercase tracking-wider text-gray-400 truncate">{item.name}</p>
                      <span
                        className={cn(
                          'text-[10px] sm:text-xs font-semibold ml-1',
                          item.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                        )}
                      >
                        {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="mt-1.5 sm:mt-2 flex items-end justify-between">
                      <p className="text-base sm:text-xl font-semibold text-white tabular-nums">
                        {item.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </p>
                      {item.changePercent >= 0 ? (
                        <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-emerald-400" />
                      ) : (
                        <TrendingDown className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-400" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Economic Indicators Grid - Hidden on small mobile */}
            <div className="hidden xs:grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3">
              {/* Manufacturing PMI */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Factory className="h-3.5 w-3.5 text-orange-400" />
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">Mfg PMI</p>
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-lg font-semibold text-white tabular-nums">
                    {economicData?.manufacturingPmi?.value?.toFixed(1) ?? '—'}
                  </p>
                  <span className={cn(
                    'text-[10px] font-medium',
                    (economicData?.manufacturingPmi?.value ?? 0) >= 50 ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {(economicData?.manufacturingPmi?.value ?? 0) >= 50 ? 'Exp' : 'Con'}
                  </span>
                </div>
              </div>

              {/* Services PMI */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Briefcase className="h-3.5 w-3.5 text-blue-400" />
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">Svc PMI</p>
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-lg font-semibold text-white tabular-nums">
                    {economicData?.servicesPmi?.value?.toFixed(1) ?? '—'}
                  </p>
                  <span className={cn(
                    'text-[10px] font-medium',
                    (economicData?.servicesPmi?.value ?? 0) >= 50 ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {(economicData?.servicesPmi?.value ?? 0) >= 50 ? 'Exp' : 'Con'}
                  </span>
                </div>
              </div>

              {/* Inflation (CPI) */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="h-3.5 w-3.5 text-amber-400" />
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">CPI</p>
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-lg font-semibold text-white tabular-nums">
                    {economicData?.inflation?.value?.toFixed(1) ?? '—'}%
                  </p>
                  {economicData?.inflation?.change !== null && (
                    <span className={cn(
                      'text-[10px] font-medium',
                      (economicData?.inflation?.change ?? 0) <= 0 ? 'text-emerald-400' : 'text-red-400'
                    )}>
                      {(economicData?.inflation?.change ?? 0) >= 0 ? '+' : ''}{economicData?.inflation?.change?.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Unemployment */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="h-3.5 w-3.5 text-cyan-400" />
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">Unemp</p>
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-lg font-semibold text-white tabular-nums">
                    {economicData?.unemployment?.value?.toFixed(1) ?? '—'}%
                  </p>
                  {economicData?.unemployment?.change !== null && (
                    <span className={cn(
                      'text-[10px] font-medium',
                      (economicData?.unemployment?.change ?? 0) <= 0 ? 'text-emerald-400' : 'text-red-400'
                    )}>
                      {(economicData?.unemployment?.change ?? 0) >= 0 ? '+' : ''}{economicData?.unemployment?.change?.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Fed Funds Rate */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <Landmark className="h-3.5 w-3.5 text-purple-400" />
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">Fed Rate</p>
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-lg font-semibold text-white tabular-nums">
                    {economicData?.federalFundsRate?.value?.toFixed(2) ?? '—'}%
                  </p>
                </div>
              </div>

              {/* GDP Growth */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/[0.07] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-3.5 w-3.5 text-emerald-400" />
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">GDP</p>
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-lg font-semibold text-white tabular-nums">
                    {economicData?.gdp?.value?.toFixed(1) ?? '—'}%
                  </p>
                  <span className={cn(
                    'text-[10px] font-medium',
                    (economicData?.gdp?.value ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                  )}>
                    {(economicData?.gdp?.value ?? 0) >= 0 ? 'Growth' : 'Decline'}
                  </span>
                </div>
              </div>

              {/* Consumer Confidence */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-3 hover:bg-white/[0.07] transition-colors col-span-2">
                <div className="flex items-center gap-2 mb-2">
                  <Smile className="h-3.5 w-3.5 text-rose-400" />
                  <p className="text-[10px] uppercase tracking-wider text-gray-400">Consumer Confidence</p>
                </div>
                <div className="flex items-baseline justify-between">
                  <p className="text-lg font-semibold text-white tabular-nums">
                    {economicData?.consumerConfidence?.value?.toFixed(1) ?? '—'}
                  </p>
                  {economicData?.consumerConfidence?.change !== null && (
                    <span className={cn(
                      'text-[10px] font-medium',
                      (economicData?.consumerConfidence?.change ?? 0) >= 0 ? 'text-emerald-400' : 'text-red-400'
                    )}>
                      {(economicData?.consumerConfidence?.change ?? 0) >= 0 ? '+' : ''}{economicData?.consumerConfidence?.change?.toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* AI Market Analysis */}
            <div className="rounded-xl border border-white/10 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/10 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Brain className="h-4 w-4 text-violet-400" />
                    <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                  </div>
                  <span className="text-sm font-medium text-white">AI Market Analysis</span>
                  <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded-full">GPT-4o + Claude</span>
                </div>
                {aiAnalysis?.marketMood && (
                  <span className={cn(
                    'text-xs font-semibold px-2 py-1 rounded-full',
                    aiAnalysis.marketMood === 'bullish' && 'bg-emerald-500/20 text-emerald-400',
                    aiAnalysis.marketMood === 'bearish' && 'bg-red-500/20 text-red-400',
                    aiAnalysis.marketMood === 'neutral' && 'bg-gray-500/20 text-gray-400',
                    aiAnalysis.marketMood === 'mixed' && 'bg-amber-500/20 text-amber-400'
                  )}>
                    {aiAnalysis.marketMood.charAt(0).toUpperCase() + aiAnalysis.marketMood.slice(1)}
                  </span>
                )}
              </div>
              
              {isAnalysisLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 text-violet-400 animate-spin mr-2" />
                  <span className="text-sm text-gray-400">Analyzing markets...</span>
                </div>
              ) : aiAnalysis?.analysis ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {aiAnalysis.analysis}
                  </p>
                  {aiAnalysis.sentimentBreakdown && (
                    <div className="flex items-center gap-4 pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-[10px] text-gray-400">
                          Bullish: {aiAnalysis.sentimentBreakdown.bullish}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <span className="text-[10px] text-gray-400">
                          Bearish: {aiAnalysis.sentimentBreakdown.bearish}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-gray-400" />
                        <span className="text-[10px] text-gray-400">
                          Neutral: {aiAnalysis.sentimentBreakdown.neutral}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center py-6 text-gray-500">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  <span className="text-sm">Analysis unavailable</span>
                </div>
              )}
            </div>

      
            
          </div>
        </div>
      </GlassCard>
    </motion.section>
  )
}
