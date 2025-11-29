'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Brain,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertTriangle,
  Sparkles,
  RefreshCw,
  Loader2,
  ChevronRight,
  Target,
  Shield,
  Zap,
  Activity,
  BarChart3,
  Clock,
  Globe,
  Bitcoin,
  LineChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  Ban,
  Laptop,
  Landmark,
  Stethoscope,
  ShoppingCart,
  Coins,
  Flag
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/cinematic'

interface TechnicalAnalysis {
  spyOutlook: 'bullish' | 'bearish' | 'neutral'
  rsiSignal: string
  trendStrength: 'strong' | 'moderate' | 'weak'
  keyLevels: {
    support: string
    resistance: string
  }
}

interface GlobalAnalysis {
  europeOutlook: 'bullish' | 'bearish' | 'neutral'
  asiaOutlook: 'bullish' | 'bearish' | 'neutral'
  correlation: string
}

interface CryptoAnalysis {
  btcOutlook: 'bullish' | 'bearish' | 'neutral'
  marketSentiment: string
  correlation: string
}

interface SectorInfo {
  outlook: 'bullish' | 'bearish' | 'neutral'
  reason: string
}

interface EconomicOutlook {
  upcomingRisks: string[]
  fedExpectation: string
  inflationView: string
}

interface TradingStrategy {
  shortTerm: string
  mediumTerm: string
  riskManagement: string
}

interface TopPicks {
  bullish: string[]
  watchlist: string[]
  avoid: string[]
}

interface AIReport {
  marketMood: 'bullish' | 'bearish' | 'neutral' | 'mixed'
  fearGreedScore: number
  confidenceLevel: 'high' | 'medium' | 'low'
  summary: string
  keyHighlights: string[]
  technicalAnalysis: TechnicalAnalysis
  globalAnalysis: GlobalAnalysis
  cryptoAnalysis: CryptoAnalysis
  sectorOutlook: {
    technology: SectorInfo
    finance: SectorInfo
    healthcare: SectorInfo
    energy: SectorInfo
    consumer: SectorInfo
  }
  economicOutlook: EconomicOutlook
  riskFactors: string[]
  opportunities: string[]
  tradingStrategy: TradingStrategy
  topPicks: TopPicks
  aiConfidenceNote: string
}

interface AIReportResponse {
  success: boolean
  report: AIReport
  generatedAt: string
  model: string
  dataQuality: {
    usMarketsAvailable: boolean
    globalMarketsAvailable: boolean
    cryptoAvailable: boolean
    technicalIndicatorsAvailable: boolean
    newsAnalyzed: number
  }
  rawData: {
    technicals: {
      spy: { rsi?: number; sma20?: number; sma50?: number; trend?: string }
      qqq: { rsi?: number }
    }
    breadth: { advancers: number; decliners: number; unchanged: number }
    sentimentBreakdown: { bullish: number; bearish: number; neutral: number }
  }
}

const getMoodConfig = (mood: string) => {
  switch (mood) {
    case 'bullish':
      return {
        icon: TrendingUp,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        label: 'Bullish',
        gradient: 'from-emerald-500/20 to-emerald-600/5'
      }
    case 'bearish':
      return {
        icon: TrendingDown,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        label: 'Bearish',
        gradient: 'from-red-500/20 to-red-600/5'
      }
    case 'mixed':
      return {
        icon: Activity,
        color: 'text-amber-400',
        bg: 'bg-amber-500/10',
        border: 'border-amber-500/20',
        label: 'Mixed',
        gradient: 'from-amber-500/20 to-amber-600/5'
      }
    default:
      return {
        icon: Minus,
        color: 'text-gray-400',
        bg: 'bg-gray-500/10',
        border: 'border-gray-500/20',
        label: 'Neutral',
        gradient: 'from-gray-500/20 to-gray-600/5'
      }
  }
}

const getFearGreedLabel = (score: number) => {
  if (score <= 20) return { label: 'Extreme Fear', color: 'text-red-500' }
  if (score <= 40) return { label: 'Fear', color: 'text-orange-400' }
  if (score <= 60) return { label: 'Neutral', color: 'text-gray-400' }
  if (score <= 80) return { label: 'Greed', color: 'text-emerald-400' }
  return { label: 'Extreme Greed', color: 'text-emerald-500' }
}

const getSectorIcon = (sector: string) => {
  switch (sector) {
    case 'technology': return Laptop
    case 'finance': return Landmark
    case 'healthcare': return Stethoscope
    case 'energy': return Zap
    case 'consumer': return ShoppingCart
    default: return BarChart3
  }
}

const getConfidenceConfig = (level: string) => {
  switch (level) {
    case 'high': return { color: 'text-emerald-400', bg: 'bg-emerald-500/20' }
    case 'medium': return { color: 'text-amber-400', bg: 'bg-amber-500/20' }
    default: return { color: 'text-red-400', bg: 'bg-red-500/20' }
  }
}

interface AIMarketReportProps {
  className?: string
  compact?: boolean
}

export function AIMarketReport({ className, compact = false }: AIMarketReportProps) {
  const [report, setReport] = useState<AIReportResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'global' | 'strategy'>('overview')

  const fetchReport = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const res = await fetch('/api/market/ai-report')
      if (!res.ok) {
        throw new Error('Failed to fetch AI report')
      }
      const data = await res.json()
      if (data.success) {
        setReport(data)
        setLastUpdated(new Date())
      } else {
        throw new Error(data.error || 'Unknown error')
      }
    } catch (err) {
      console.error('AI Report error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load report')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchReport()
  }, [])

  const moodConfig = report ? getMoodConfig(report.report.marketMood) : null
  const fearGreed = report ? getFearGreedLabel(report.report.fearGreedScore) : null
  const confidenceConfig = report ? getConfidenceConfig(report.report.confidenceLevel) : null

  if (compact) {
    return (
      <GlassCard className={cn('p-4', className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/20">
              <Brain className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-sm font-semibold text-white">AI Market Intelligence</span>
          </div>
          <button
            onClick={fetchReport}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-gray-400 hover:text-purple-400 transition-all disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {isLoading && !report ? (
          <div className="flex items-center justify-center py-6">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
              <span className="text-sm text-gray-400">Analyzing market...</span>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        ) : report && moodConfig ? (
          <div className="space-y-3">
            <div className={cn(
              'flex items-center justify-between p-3 rounded-lg border',
              moodConfig.bg, moodConfig.border
            )}>
              <div className="flex items-center gap-2">
                <moodConfig.icon className={cn('w-5 h-5', moodConfig.color)} />
                <span className={cn('font-semibold', moodConfig.color)}>{moodConfig.label}</span>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-500">Fear & Greed</div>
                <div className={cn('font-bold', fearGreed?.color)}>
                  {report.report.fearGreedScore}
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 leading-relaxed line-clamp-3">
              {report.report.summary}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-white/[0.06]">
              <span className="text-[10px] text-gray-600 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {report.model}
              </span>
              <span className={cn('text-[10px] px-1.5 py-0.5 rounded', confidenceConfig?.bg, confidenceConfig?.color)}>
                {report.report.confidenceLevel} confidence
              </span>
            </div>
          </div>
        ) : null}
      </GlassCard>
    )
  }

  return (
    <div className={className}>
      <GlassCard className="p-0 overflow-hidden">
        {/* Enhanced Header with Gradient Background */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-purple-900/40 via-indigo-900/30 to-cyan-900/20 border-b border-purple-500/10">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-0 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-cyan-500/20 rounded-full blur-3xl" />
          </div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-purple-500/30 rounded-2xl blur-xl animate-pulse" />
                <div className="relative p-3 rounded-2xl bg-gradient-to-br from-purple-500/30 to-cyan-500/20 border border-purple-400/30 backdrop-blur-sm">
                  <Brain className="w-7 h-7 text-purple-300" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                  AI Market Intelligence
                  <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    PRO
                  </span>
                </h2>
                <p className="text-sm text-gray-400 mt-0.5 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Analysis • US Markets • Global • Crypto • Technical
                </p>
              </div>
            </div>
            <button
              onClick={fetchReport}
              disabled={isLoading}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-xl',
                'bg-white/[0.08] backdrop-blur-sm border border-white/10',
                'hover:bg-white/[0.12] hover:border-purple-400/40 hover:shadow-[0_0_20px_rgba(168,85,247,0.2)]',
                'text-white text-sm font-medium transition-all duration-300',
                'disabled:opacity-50 group'
              )}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-purple-400" />
                  <span className="text-purple-300">Analyzing...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
                  Refresh Analysis
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="p-5">

        {isLoading && !report ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-4" />
            <p className="text-base font-medium text-white">Analyzing Market Data</p>
            <p className="text-sm text-gray-500 mt-2">Processing US Markets • Global Data • Crypto • Technical Indicators</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <p className="text-white font-medium">{error}</p>
            <button
              onClick={fetchReport}
              className="mt-3 px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 text-sm hover:bg-purple-500/20 transition-all"
            >
              Try Again
            </button>
          </div>
        ) : report && moodConfig && fearGreed && confidenceConfig ? (
          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-5"
            >
              {/* Enhanced Tabs */}
              <div className="flex gap-1 p-1.5 bg-black/30 rounded-xl border border-white/[0.08] backdrop-blur-sm">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3, color: 'purple' },
                  { id: 'technical', label: 'Technical', icon: LineChart, color: 'cyan' },
                  { id: 'global', label: 'Global', icon: Globe, color: 'emerald' },
                  { id: 'strategy', label: 'Strategy', icon: Target, color: 'amber' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-300',
                      activeTab === tab.id
                        ? cn(
                            'text-white shadow-lg',
                            tab.color === 'purple' && 'bg-gradient-to-r from-purple-600/80 to-purple-500/60 shadow-purple-500/25',
                            tab.color === 'cyan' && 'bg-gradient-to-r from-cyan-600/80 to-cyan-500/60 shadow-cyan-500/25',
                            tab.color === 'emerald' && 'bg-gradient-to-r from-emerald-600/80 to-emerald-500/60 shadow-emerald-500/25',
                            tab.color === 'amber' && 'bg-gradient-to-r from-amber-600/80 to-amber-500/60 shadow-amber-500/25'
                          )
                        : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                    )}
                  >
                    <tab.icon className={cn('w-4 h-4', activeTab === tab.id && 'animate-pulse')} />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Market Mood & Fear/Greed */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Market Mood Card */}
                    <div className={cn(
                      'relative p-5 rounded-2xl border bg-gradient-to-br overflow-hidden group',
                      moodConfig.gradient,
                      moodConfig.border
                    )}>
                      {/* Animated Glow */}
                      <div className={cn(
                        'absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity',
                        moodConfig.color === 'text-emerald-400' && 'bg-emerald-500',
                        moodConfig.color === 'text-red-400' && 'bg-red-500',
                        moodConfig.color === 'text-amber-400' && 'bg-amber-500',
                        moodConfig.color === 'text-gray-400' && 'bg-gray-500'
                      )} />
                      <div className="relative">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Market Mood</span>
                          <div className={cn('p-2 rounded-lg', moodConfig.bg)}>
                            <moodConfig.icon className={cn('w-5 h-5', moodConfig.color)} />
                          </div>
                        </div>
                        <div className={cn('text-3xl font-bold mb-2', moodConfig.color)}>
                          {moodConfig.label}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">AI Confidence:</span>
                          <span className={cn('text-xs font-semibold px-2 py-0.5 rounded-full', confidenceConfig?.bg, confidenceConfig?.color)}>
                            {report.report.confidenceLevel}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Fear & Greed Gauge */}
                    <div className="relative p-5 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-white/[0.04] to-transparent overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Fear & Greed Index</span>
                      </div>
                      <div className="flex items-baseline gap-3 mb-4">
                        <span className={cn('text-4xl font-black tabular-nums', fearGreed.color)}>
                          {report.report.fearGreedScore}
                        </span>
                        <span className={cn('text-base font-semibold', fearGreed.color)}>
                          {fearGreed.label}
                        </span>
                      </div>
                      {/* Enhanced Gauge Bar */}
                      <div className="relative">
                        <div className="h-3 rounded-full bg-gradient-to-r from-red-600 via-amber-500 via-50% to-emerald-500 shadow-inner">
                          <div className="absolute inset-0 rounded-full bg-black/20" />
                        </div>
                        <div
                          className="absolute top-1/2 w-5 h-5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)] border-2 border-gray-800 transition-all duration-700 ease-out"
                          style={{ left: `${report.report.fearGreedScore}%`, transform: 'translate(-50%, -50%)' }}
                        >
                          <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white to-gray-200" />
                        </div>
                      </div>
                      <div className="flex justify-between mt-2 text-[10px] text-gray-600">
                        <span>Extreme Fear</span>
                        <span>Neutral</span>
                        <span>Extreme Greed</span>
                      </div>
                    </div>

                    {/* Data Quality */}
                    <div className="relative p-5 rounded-2xl border border-white/[0.08] bg-gradient-to-br from-cyan-500/5 to-transparent overflow-hidden">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-gray-300 uppercase tracking-wider">Data Sources</span>
                        <div className="p-1.5 rounded-lg bg-cyan-500/20">
                          <Activity className="w-4 h-4 text-cyan-400" />
                        </div>
                      </div>
                      <div className="space-y-2.5">
                        {[
                          { label: 'US Markets', active: report.dataQuality.usMarketsAvailable, icon: Flag },
                          { label: 'Global Markets', active: report.dataQuality.globalMarketsAvailable, icon: Globe },
                          { label: 'Crypto', active: report.dataQuality.cryptoAvailable, icon: Coins },
                          { label: 'Technicals', active: report.dataQuality.technicalIndicatorsAvailable, icon: BarChart3 }
                        ].map(item => (
                          <div key={item.label} className="flex items-center justify-between p-2 rounded-lg bg-black/20">
                            <div className="flex items-center gap-2">
                              <item.icon className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-400">{item.label}</span>
                            </div>
                            <div className={cn(
                              'flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium',
                              item.active 
                                ? 'bg-emerald-500/20 text-emerald-400' 
                                : 'bg-red-500/20 text-red-400'
                            )}>
                              <span className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                item.active ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                              )} />
                              {item.active ? 'Live' : 'Offline'}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                        <span className="text-[11px] text-gray-500">News Analyzed</span>
                        <span className="text-sm font-bold text-cyan-400">{report.dataQuality.newsAnalyzed}</span>
                      </div>
                    </div>
                  </div>

                  {/* Executive Summary */}
                  <div className="relative p-5 rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/5 overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl" />
                    <h3 className="relative text-base font-bold text-white mb-3 flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-cyan-500/20">
                        <BarChart3 className="w-4 h-4 text-cyan-400" />
                      </div>
                      Executive Summary
                    </h3>
                    <p className="relative text-sm text-gray-300 leading-relaxed">
                      {report.report.summary}
                    </p>
                  </div>

                  {/* Key Highlights */}
                  <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Zap className="w-4 h-4 text-amber-400" />
                      Key Highlights
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {report.report.keyHighlights.map((highlight, i) => (
                        <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-white/[0.02]">
                          <ChevronRight className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                          <span className="text-xs text-gray-300">{highlight}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sector Outlook */}
                  <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4 text-purple-400" />
                      Sector Outlook
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                      {Object.entries(report.report.sectorOutlook).map(([sector, info]) => {
                        const config = getMoodConfig(info.outlook)
                        const Icon = getSectorIcon(sector)
                        return (
                          <div
                            key={sector}
                            className={cn(
                              'p-3 rounded-lg border text-center group cursor-pointer hover:scale-105 transition-transform',
                              config.bg, config.border
                            )}
                            title={info.reason}
                          >
                            <Icon className="w-5 h-5 mx-auto mb-2 text-gray-400" />
                            <div className="text-xs font-medium text-white capitalize">{sector}</div>
                            <div className={cn('text-[10px] font-semibold uppercase', config.color)}>
                              {info.outlook}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Risk & Opportunities */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-red-400" />
                        Risk Factors
                      </h3>
                      <div className="space-y-2">
                        {report.report.riskFactors.map((risk, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-300">{risk}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-emerald-400" />
                        Opportunities
                      </h3>
                      <div className="space-y-2">
                        {report.report.opportunities.map((opp, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <TrendingUp className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                            <span className="text-xs text-gray-300">{opp}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Technical Tab */}
              {activeTab === 'technical' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <LineChart className="w-4 h-4 text-cyan-400" />
                        SPY Technical Analysis
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Outlook</span>
                          <span className={cn(
                            'px-2 py-0.5 rounded text-xs font-medium',
                            getMoodConfig(report.report.technicalAnalysis.spyOutlook).bg,
                            getMoodConfig(report.report.technicalAnalysis.spyOutlook).color
                          )}>
                            {report.report.technicalAnalysis.spyOutlook}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Trend Strength</span>
                          <span className="text-xs text-white">{report.report.technicalAnalysis.trendStrength}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Support</span>
                          <span className="text-xs text-emerald-400">{report.report.technicalAnalysis.keyLevels.support}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">Resistance</span>
                          <span className="text-xs text-red-400">{report.report.technicalAnalysis.keyLevels.resistance}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Activity className="w-4 h-4 text-purple-400" />
                        Live Indicators
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">SPY RSI(14)</span>
                          <span className={cn(
                            'text-xs font-mono',
                            (report.rawData.technicals.spy.rsi || 50) > 70 ? 'text-red-400' :
                            (report.rawData.technicals.spy.rsi || 50) < 30 ? 'text-emerald-400' : 'text-white'
                          )}>
                            {report.rawData.technicals.spy.rsi?.toFixed(1) || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">QQQ RSI(14)</span>
                          <span className="text-xs font-mono text-white">
                            {report.rawData.technicals.qqq.rsi?.toFixed(1) || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">SPY SMA20</span>
                          <span className="text-xs font-mono text-white">
                            ${report.rawData.technicals.spy.sma20?.toFixed(2) || 'N/A'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-gray-500">SPY SMA50</span>
                          <span className="text-xs font-mono text-white">
                            ${report.rawData.technicals.spy.sma50?.toFixed(2) || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-cyan-500/20 bg-cyan-500/5">
                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <LineChart className="w-4 h-4 text-cyan-400" />
                      RSI Analysis
                    </h3>
                    <p className="text-xs text-gray-300">{report.report.technicalAnalysis.rsiSignal}</p>
                  </div>

                  <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <h3 className="text-sm font-semibold text-white mb-3">Market Breadth</h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-emerald-400">Advancers</span>
                          <span className="text-white">{report.rawData.breadth.advancers}</span>
                        </div>
                        <div className="h-2 rounded-full bg-emerald-500/30">
                          <div 
                            className="h-full rounded-full bg-emerald-500"
                            style={{ 
                              width: `${(report.rawData.breadth.advancers / (report.rawData.breadth.advancers + report.rawData.breadth.decliners + report.rawData.breadth.unchanged || 1)) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-red-400">Decliners</span>
                          <span className="text-white">{report.rawData.breadth.decliners}</span>
                        </div>
                        <div className="h-2 rounded-full bg-red-500/30">
                          <div 
                            className="h-full rounded-full bg-red-500"
                            style={{ 
                              width: `${(report.rawData.breadth.decliners / (report.rawData.breadth.advancers + report.rawData.breadth.decliners + report.rawData.breadth.unchanged || 1)) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Global Tab */}
              {activeTab === 'global' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Flag className="w-4 h-4 text-blue-400" />
                        Europe
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Outlook</span>
                        <span className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium',
                          getMoodConfig(report.report.globalAnalysis.europeOutlook).bg,
                          getMoodConfig(report.report.globalAnalysis.europeOutlook).color
                        )}>
                          {report.report.globalAnalysis.europeOutlook}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Globe className="w-4 h-4 text-emerald-400" />
                        Asia
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Outlook</span>
                        <span className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium',
                          getMoodConfig(report.report.globalAnalysis.asiaOutlook).bg,
                          getMoodConfig(report.report.globalAnalysis.asiaOutlook).color
                        )}>
                          {report.report.globalAnalysis.asiaOutlook}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <Activity className="w-4 h-4 text-purple-400" />
                      Global Correlation
                    </h3>
                    <p className="text-xs text-gray-300">{report.report.globalAnalysis.correlation}</p>
                  </div>

                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Bitcoin className="w-4 h-4 text-amber-400" />
                      Crypto Analysis
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-gray-500">BTC Outlook</span>
                        <span className={cn(
                          'px-2 py-0.5 rounded text-xs font-medium',
                          getMoodConfig(report.report.cryptoAnalysis.btcOutlook).bg,
                          getMoodConfig(report.report.cryptoAnalysis.btcOutlook).color
                        )}>
                          {report.report.cryptoAnalysis.btcOutlook}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300">{report.report.cryptoAnalysis.marketSentiment}</p>
                      <div className="pt-2 border-t border-white/[0.06]">
                        <span className="text-[10px] text-gray-500">Crypto-Equity Correlation:</span>
                        <p className="text-xs text-gray-400 mt-1">{report.report.cryptoAnalysis.correlation}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-cyan-400" />
                      Economic Outlook
                    </h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase">Fed Expectation</span>
                        <p className="text-xs text-gray-300 mt-1">{report.report.economicOutlook.fedExpectation}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase">Inflation View</span>
                        <p className="text-xs text-gray-300 mt-1">{report.report.economicOutlook.inflationView}</p>
                      </div>
                      <div>
                        <span className="text-[10px] text-gray-500 uppercase">Upcoming Risks</span>
                        <div className="mt-1 space-y-1">
                          {report.report.economicOutlook.upcomingRisks.map((risk, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <AlertTriangle className="w-3 h-3 text-amber-400" />
                              <span className="text-xs text-gray-300">{risk}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Strategy Tab */}
              {activeTab === 'strategy' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 to-purple-500/5">
                    <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                      <Target className="w-4 h-4 text-cyan-400" />
                      Trading Strategy
                    </h3>
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-black/20">
                        <div className="text-[10px] text-cyan-400 uppercase tracking-wider mb-1">Short-Term (1-3 Days)</div>
                        <p className="text-sm text-white">{report.report.tradingStrategy.shortTerm}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-black/20">
                        <div className="text-[10px] text-purple-400 uppercase tracking-wider mb-1">Medium-Term (1-2 Weeks)</div>
                        <p className="text-sm text-white">{report.report.tradingStrategy.mediumTerm}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                        <div className="flex items-center gap-1.5 text-[10px] text-red-400 uppercase tracking-wider mb-1">
                          <AlertTriangle className="w-3 h-3" />
                          Risk Management
                        </div>
                        <p className="text-sm text-gray-300">{report.report.tradingStrategy.riskManagement}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        Bullish Picks
                      </h3>
                      <div className="space-y-2">
                        {report.report.topPicks.bullish.map((stock, i) => (
                          <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded bg-emerald-500/10">
                            <TrendingUp className="w-3 h-3 text-emerald-400" />
                            <span className="text-xs font-mono text-white">{stock}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5">
                      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Eye className="w-4 h-4 text-amber-400" />
                        Watchlist
                      </h3>
                      <div className="space-y-2">
                        {report.report.topPicks.watchlist.map((stock, i) => (
                          <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded bg-amber-500/10">
                            <Eye className="w-3 h-3 text-amber-400" />
                            <span className="text-xs font-mono text-white">{stock}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-xl border border-red-500/20 bg-red-500/5">
                      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                        <Ban className="w-4 h-4 text-red-400" />
                        Avoid
                      </h3>
                      <div className="space-y-2">
                        {report.report.topPicks.avoid.map((stock, i) => (
                          <div key={i} className="flex items-center gap-2 px-2 py-1.5 rounded bg-red-500/10">
                            <ArrowDownRight className="w-3 h-3 text-red-400" />
                            <span className="text-xs font-mono text-white">{stock}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
                    <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                      <Brain className="w-4 h-4 text-purple-400" />
                      AI Analysis Note
                    </h3>
                    <p className="text-xs text-gray-400 italic">{report.report.aiConfidenceNote}</p>
                  </div>
                </div>
              )}

              {/* Enhanced Footer */}
              <div className="flex items-center justify-between pt-5 mt-5 border-t border-white/[0.08]">
                <div className="flex items-center gap-3">
                  {[
                    { label: 'Bullish', value: report.rawData.sentimentBreakdown.bullish, color: 'emerald' },
                    { label: 'Bearish', value: report.rawData.sentimentBreakdown.bearish, color: 'red' },
                    { label: 'Neutral', value: report.rawData.sentimentBreakdown.neutral, color: 'gray' }
                  ].map(item => (
                    <div key={item.label} className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-lg',
                      item.color === 'emerald' && 'bg-emerald-500/10',
                      item.color === 'red' && 'bg-red-500/10',
                      item.color === 'gray' && 'bg-gray-500/10'
                    )}>
                      <div className={cn(
                        'w-2 h-2 rounded-full',
                        item.color === 'emerald' && 'bg-emerald-500',
                        item.color === 'red' && 'bg-red-500',
                        item.color === 'gray' && 'bg-gray-500'
                      )} />
                      <span className="text-xs text-gray-400">{item.label}:</span>
                      <span className={cn(
                        'text-xs font-bold',
                        item.color === 'emerald' && 'text-emerald-400',
                        item.color === 'red' && 'text-red-400',
                        item.color === 'gray' && 'text-gray-400'
                      )}>{item.value}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-purple-500/10">
                  <Clock className="w-3.5 h-3.5 text-purple-400" />
                  {lastUpdated && (
                    <span className="text-xs text-purple-300">Updated {lastUpdated.toLocaleTimeString()}</span>
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : null}
        </div>
      </GlassCard>
    </div>
  )
}
