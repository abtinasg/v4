'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Brain,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Loader2,
  Sparkles,
  CheckCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/cinematic'

// Simplified interface - just basic AI overview
interface AIReport {
  marketMood: 'bullish' | 'bearish' | 'neutral' | 'mixed'
  summary: string
  keyHighlights?: string[]
}

interface AIReportResponse {
  success: boolean
  report: AIReport
  generatedAt: string
}

const getMoodConfig = (mood: string) => {
  switch (mood) {
    case 'bullish':
      return {
        icon: TrendingUp,
        color: 'text-emerald-400',
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/20',
        label: 'Bullish'
      }
    case 'bearish':
      return {
        icon: TrendingDown,
        color: 'text-red-400',
        bg: 'bg-red-500/10',
        border: 'border-red-500/20',
        label: 'Bearish'
      }
    default:
      return {
        icon: Brain,
        color: 'text-purple-400',
        bg: 'bg-purple-500/10',
        border: 'border-purple-500/20',
        label: 'Market Overview'
      }
  }
}

interface AIMarketReportProps {
  className?: string
}

export function AIMarketReport({ className }: AIMarketReportProps) {
  const [report, setReport] = useState<AIReportResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <GlassCard className={cn('p-6', className)}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Market Overview</h3>
            <p className="text-xs text-white/50">Powered by AI Analysis</p>
          </div>
        </div>
        <button
          onClick={fetchReport}
          disabled={isLoading}
          className="p-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-gray-400 hover:text-purple-400 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
        </button>
      </div>

      {isLoading && !report ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-2">
            <Loader2 className="w-5 h-5 text-purple-400 animate-spin" />
            <span className="text-sm text-gray-400">Analyzing market...</span>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-sm text-red-400 mb-3">{error}</p>
          <button
            onClick={fetchReport}
            className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 text-sm hover:bg-purple-500/20 transition-all"
          >
            Try Again
          </button>
        </div>
      ) : report && moodConfig ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {/* Market Mood Badge */}
          <div className={cn(
            'flex items-center gap-2 px-4 py-3 rounded-lg border',
            moodConfig.bg,
            moodConfig.border
          )}>
            <moodConfig.icon className={cn('w-5 h-5', moodConfig.color)} />
            <span className={cn('font-semibold', moodConfig.color)}>{moodConfig.label}</span>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <p className="text-sm text-gray-300 leading-relaxed">
              {report.report.summary}
            </p>
          </div>

          {/* Key Highlights - if available */}
          {report.report.keyHighlights && report.report.keyHighlights.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-white/[0.06]">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-semibold text-white">Key Highlights</span>
              </div>
              <div className="space-y-2">
                {report.report.keyHighlights.map((highlight, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-xs text-gray-400">{highlight}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Brain className="w-3 h-3" />
              AI-Powered Analysis
            </span>
            <span className="text-xs text-gray-500">
              {new Date(report.generatedAt).toLocaleTimeString()}
            </span>
          </div>
        </motion.div>
      ) : null}
    </GlassCard>
  )
}
