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
      const data = await res.json()
      
      if (!res.ok) {
        // Handle specific error cases
        if (res.status === 401) {
          throw new Error('Please sign in to view AI reports')
        } else if (res.status === 402) {
          throw new Error('Insufficient credits. Please purchase more credits.')
        } else if (res.status === 429) {
          throw new Error('Rate limit exceeded. Please try again later.')
        } else {
          throw new Error(data.error || data.message || 'Failed to fetch AI report')
        }
      }
      
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
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30">
            <Brain className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Market Overview</h3>
            <p className="text-xs text-white/50">Powered by Deep AI</p>
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
        <div className="py-8">
          {/* Animated Loading State */}
          <div className="space-y-4">
            {/* Brain Animation */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-purple-500/20 blur-xl animate-pulse" />
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative p-4 rounded-full bg-gradient-to-br from-purple-500/20 to-violet-500/20 border border-purple-500/30"
                >
                  <Brain className="w-8 h-8 text-purple-400" />
                </motion.div>
              </div>
            </div>
            
            {/* Loading Text */}
            <div className="text-center space-y-2">
              <motion.p 
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="text-sm font-medium text-purple-400"
              >
                Analyzing Market Data
              </motion.p>
              <p className="text-xs text-gray-500">AI is processing real-time information...</p>
            </div>
            
            {/* Progress Steps */}
            <div className="space-y-3 px-4 pt-4">
              {[
                { label: 'Gathering market data', delay: 0 },
                { label: 'Analyzing trends', delay: 0.3 },
                { label: 'Generating insights', delay: 0.6 },
              ].map((step, i) => (
                <motion.div
                  key={step.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: step.delay }}
                  className="flex items-center gap-3"
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Infinity, delay: step.delay }}
                    className="w-2 h-2 rounded-full bg-purple-500"
                  />
                  <span className="text-xs text-gray-400">{step.label}</span>
                  <motion.div
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 1.5, repeat: Infinity, delay: step.delay }}
                    className="ml-auto"
                  >
                    <Loader2 className="w-3 h-3 text-purple-400/50 animate-spin" />
                  </motion.div>
                </motion.div>
              ))}
            </div>

            {/* Shimmer Effect Placeholder */}
            <div className="space-y-3 mt-4">
              <div className="h-12 rounded-lg bg-gradient-to-r from-white/[0.02] via-white/[0.05] to-white/[0.02] animate-shimmer overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
              </div>
              <div className="h-16 rounded-lg bg-gradient-to-r from-white/[0.02] via-white/[0.05] to-white/[0.02] overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent -translate-x-full animate-[shimmer_2s_infinite_0.3s]" />
              </div>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <div className="mb-4">
            {error.includes('sign in') || error.includes('authentication') ? (
              <div className="w-12 h-12 mx-auto rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
                <Brain className="w-6 h-6 text-amber-400" />
              </div>
            ) : error.includes('credit') ? (
              <div className="w-12 h-12 mx-auto rounded-full bg-purple-500/10 flex items-center justify-center mb-3">
                <Sparkles className="w-6 h-6 text-purple-400" />
              </div>
            ) : (
              <div className="w-12 h-12 mx-auto rounded-full bg-red-500/10 flex items-center justify-center mb-3">
                <Brain className="w-6 h-6 text-red-400" />
              </div>
            )}
          </div>
          <p className="text-sm text-gray-300 mb-2">{error}</p>
          {error.includes('credit') ? (
            <a
              href="/pricing"
              className="inline-block px-4 py-2 rounded-lg bg-purple-500/20 text-purple-400 text-sm hover:bg-purple-500/30 transition-all"
            >
              Get Credits
            </a>
          ) : (
            <button
              onClick={fetchReport}
              className="px-4 py-2 rounded-lg bg-purple-500/10 text-purple-400 text-sm hover:bg-purple-500/20 transition-all"
            >
              Try Again
            </button>
          )}
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
            <span className="text-xs text-gray-500 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Deep AI</span>
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
