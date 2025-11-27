'use client'

import { motion } from 'framer-motion'
import { Sparkles, Brain, TrendingUp, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassCard, PulsingDot } from '@/components/ui/cinematic'

interface AIInsightBoxProps {
  insight?: string
  confidence?: number
  models?: number
  sector?: string
  className?: string
}

export function AIInsightBox({
  insight = "AI detected bullish momentum in semiconductor stocks. 3 models agree on strong buy signals for NVDA, AMD, and AVGO.",
  confidence = 87,
  models = 3,
  sector = "Semiconductors",
  className,
}: AIInsightBoxProps) {
  // Confidence color mapping
  const getConfidenceColor = (conf: number) => {
    if (conf >= 80) return { text: 'text-emerald-400', bg: 'bg-emerald-500', glow: 'shadow-[0_0_20px_rgba(34,197,94,0.3)]' }
    if (conf >= 60) return { text: 'text-cyan-400', bg: 'bg-cyan-500', glow: 'shadow-[0_0_20px_rgba(0,212,255,0.3)]' }
    if (conf >= 40) return { text: 'text-amber-400', bg: 'bg-amber-500', glow: 'shadow-[0_0_20px_rgba(245,158,11,0.3)]' }
    return { text: 'text-red-400', bg: 'bg-red-500', glow: 'shadow-[0_0_20px_rgba(239,68,68,0.3)]' }
  }

  const confidenceColors = getConfidenceColor(confidence)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      className={className}
    >
      <GlassCard className="relative h-full p-4 sm:p-5 overflow-hidden group">
        {/* Ambient gradient glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-cyan-500/5 opacity-60" />
        <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/20 rounded-full blur-3xl opacity-40" />
        
        {/* Header */}
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-500/15 border border-violet-500/20">
              <Brain className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">AI Insight</h3>
                <PulsingDot color="cyan" size="sm" />
              </div>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider">{sector}</p>
            </div>
          </div>
          
          {/* AI Badge with glow */}
          <motion.div
            animate={{ 
              boxShadow: [
                '0 0 15px rgba(139,92,246,0.3)',
                '0 0 25px rgba(139,92,246,0.5)',
                '0 0 15px rgba(139,92,246,0.3)'
              ]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-500/15 border border-violet-500/30"
          >
            <Sparkles className="w-3 h-3 text-violet-400" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-violet-300">
              AI Insight
            </span>
          </motion.div>
        </div>

        {/* Insight Text */}
        <div className="relative mb-5">
          <p className="text-sm text-gray-300 leading-relaxed">
            {insight}
          </p>
        </div>

        {/* Confidence Bar */}
        <div className="relative space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-[10px] sm:text-xs">
            <span className="text-gray-500 font-medium">Model Confidence</span>
            <span className={cn('font-bold tabular-nums', confidenceColors.text)}>
              {confidence}%
            </span>
          </div>
          
          {/* Progress Bar */}
          <div className="relative h-2 rounded-full bg-white/[0.05] overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${confidence}%` }}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.5 }}
              className={cn(
                'absolute inset-y-0 left-0 rounded-full',
                confidenceColors.bg,
                confidenceColors.glow
              )}
              style={{
                background: `linear-gradient(90deg, ${confidence >= 80 ? '#22c55e' : confidence >= 60 ? '#00d4ff' : confidence >= 40 ? '#f59e0b' : '#ef4444'}, ${confidence >= 80 ? '#10b981' : confidence >= 60 ? '#06b6d4' : confidence >= 40 ? '#eab308' : '#dc2626'})`
              }}
            />
          </div>
        </div>

        {/* Footer Stats */}
        <div className="relative flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-gray-400">Bullish Signal</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-xs text-gray-400">
              {models} models agree
            </span>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
