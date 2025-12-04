"use client"

import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Brain,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/cinematic'

interface MarketData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
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

export function DashboardHero({ className }: DashboardHeroProps) {
  const { user } = useUser()
  const [now, setNow] = useState(() => new Date())
  const [marketData, setMarketData] = useState<MarketData[]>([])
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
    const analysisInterval = setInterval(fetchAiAnalysis, 300000)
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

  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      <GlassCard variant="elevated" className="overflow-hidden">
        <div className="relative p-6 sm:p-8 lg:p-10">
          {/* Subtle gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00C9E4]/[0.03] via-transparent to-[#9B87F5]/[0.02] pointer-events-none" />

          <div className="relative space-y-8">
            {/* Header Row */}
            <div className="flex items-start justify-between">
              <div>
                {/* Greeting */}
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-tight">
                  {greeting}
                  {userName && <span className="text-white/50">, {userName}</span>}
                </h1>
                <p className="mt-2 text-sm text-white/35 font-normal">
                  {formattedDate}
                </p>
              </div>
              
              {/* Refresh Button - Minimal */}
              <button
                onClick={() => {
                  fetchMarketData()
                  fetchAiAnalysis()
                }}
                disabled={isLoading || isAnalysisLoading}
                className={cn(
                  'p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]',
                  'hover:bg-white/[0.06] transition-all duration-200',
                  'disabled:opacity-40'
                )}
                aria-label="Refresh data"
              >
                <RefreshCw className={cn(
                  'h-4 w-4 text-white/40',
                  (isLoading || isAnalysisLoading) && 'animate-spin'
                )} />
              </button>
            </div>

            {/* Market Indices - Clean Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {isLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div 
                    key={i} 
                    className="rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 sm:p-4 animate-pulse"
                  >
                    <div className="h-3 w-16 bg-white/[0.06] rounded mb-3" />
                    <div className="h-6 w-20 bg-white/[0.06] rounded" />
                  </div>
                ))
              ) : (
                marketData.map((item) => (
                  <div
                    key={item.symbol}
                    className={cn(
                      'rounded-xl bg-white/[0.02] border border-white/[0.04] p-3 sm:p-4 overflow-hidden',
                      'hover:bg-white/[0.03] hover:border-white/[0.06] transition-all duration-200'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                      <span className="text-[10px] sm:text-xs font-medium text-white/40 uppercase tracking-wide truncate">
                        {item.name}
                      </span>
                      {item.changePercent >= 0 ? (
                        <TrendingUp className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <TrendingDown className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-rose-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2">
                      <span className="text-base sm:text-xl font-semibold text-white tabular-nums tracking-tight truncate">
                        {item.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                      </span>
                      <span className={cn(
                        'text-xs sm:text-sm font-medium tabular-nums',
                        item.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      )}>
                        {item.changePercent >= 0 ? '+' : ''}{item.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* AI Analysis - Primary Insight Card */}
            <div className="rounded-2xl bg-gradient-to-br from-[#9B87F5]/[0.06] to-[#00C9E4]/[0.03] border border-white/[0.06] p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-[#9B87F5]/10 border border-[#9B87F5]/20">
                    <Brain className="h-4 w-4 text-[#9B87F5]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-white">AI Market Analysis</h3>
                    <p className="text-xs text-white/30">Real-time insight</p>
                  </div>
                </div>
                {aiAnalysis?.marketMood && (
                  <span className={cn(
                    'px-3 py-1 rounded-full text-xs font-medium',
                    aiAnalysis.marketMood === 'bullish' && 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
                    aiAnalysis.marketMood === 'bearish' && 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
                    aiAnalysis.marketMood === 'neutral' && 'bg-white/5 text-white/50 border border-white/10',
                    aiAnalysis.marketMood === 'mixed' && 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  )}>
                    {aiAnalysis.marketMood.charAt(0).toUpperCase() + aiAnalysis.marketMood.slice(1)}
                  </span>
                )}
              </div>
              
              {isAnalysisLoading ? (
                <div className="flex items-center gap-2 py-4">
                  <Loader2 className="h-4 w-4 text-[#9B87F5] animate-spin" />
                  <span className="text-sm text-white/40">Analyzing markets...</span>
                </div>
              ) : aiAnalysis?.analysis ? (
                <div className="space-y-4">
                  <p className="text-sm text-white/65 leading-relaxed">
                    {aiAnalysis.analysis}
                  </p>
                  {aiAnalysis.sentimentBreakdown && (
                    <div className="flex items-center gap-6 pt-3 border-t border-white/[0.04]">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-400" />
                        <span className="text-xs text-white/40">
                          Bullish {aiAnalysis.sentimentBreakdown.bullish}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-rose-400" />
                        <span className="text-xs text-white/40">
                          Bearish {aiAnalysis.sentimentBreakdown.bearish}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-white/30" />
                        <span className="text-xs text-white/40">
                          Neutral {aiAnalysis.sentimentBreakdown.neutral}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2 py-4 text-white/40">
                  <AlertCircle className="h-4 w-4" />
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
