/**
 * Brainstorm Mode Component
 * 
 * When activated:
 * - AI generates multiple ideas/perspectives
 * - Creative exploration mode
 * - Mind-map style output
 * - Idea expansion on click
 */

'use client'

import React, { useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Lightbulb,
  Sparkles,
  GitBranch,
  ArrowRight,
  RefreshCw,
  ChevronRight,
  Zap,
  TrendingUp,
  Shield,
  Target,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

// ============================================================
// TYPES
// ============================================================

export interface BrainstormIdea {
  id: string
  title: string
  description: string
  category: 'opportunity' | 'risk' | 'strategy' | 'insight'
  confidence: number // 0-100
  expanded?: boolean
  subIdeas?: BrainstormIdea[]
}

export interface BrainstormToggleProps {
  isActive: boolean
  onToggle: () => void
  className?: string
}

export interface BrainstormOutputProps {
  ideas: BrainstormIdea[]
  isLoading?: boolean
  onExpandIdea: (id: string) => void
  onRegenerateIdea: (id: string) => void
  className?: string
}

// ============================================================
// CATEGORY CONFIG
// ============================================================

const CATEGORY_CONFIG = {
  opportunity: {
    icon: <TrendingUp className="w-4 h-4" />,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  risk: {
    icon: <Shield className="w-4 h-4" />,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
  },
  strategy: {
    icon: <Target className="w-4 h-4" />,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  insight: {
    icon: <Lightbulb className="w-4 h-4" />,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
}

// ============================================================
// BRAINSTORM TOGGLE
// ============================================================

export const BrainstormToggle = memo(function BrainstormToggle({
  isActive,
  onToggle,
  className,
}: BrainstormToggleProps) {
  return (
    <motion.button
      onClick={() => {
        onToggle()
        if (navigator.vibrate) navigator.vibrate(isActive ? 10 : [10, 50, 10])
      }}
      className={cn(
        'flex items-center gap-2 px-3 py-1.5 rounded-full',
        'border transition-all duration-300',
        isActive
          ? 'bg-gradient-to-r from-violet-500/20 to-cyan-500/20 border-violet-500/30 text-violet-300'
          : 'bg-white/5 border-white/10 text-white/50 hover:text-white hover:border-white/20',
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <motion.div
        animate={isActive ? { rotate: 360 } : { rotate: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Zap className={cn('w-4 h-4', isActive && 'text-violet-400')} />
      </motion.div>
      <span className="text-xs font-medium">Brainstorm</span>
      {isActive && (
        <motion.span
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-1.5 h-1.5 rounded-full bg-violet-400"
        />
      )}
    </motion.button>
  )
})

// ============================================================
// BRAINSTORM OUTPUT
// ============================================================

export const BrainstormOutput = memo(function BrainstormOutput({
  ideas,
  isLoading,
  onExpandIdea,
  onRegenerateIdea,
  className,
}: BrainstormOutputProps) {
  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={cn('p-4', className)}
      >
        <div className="flex items-center justify-center gap-3 py-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-6 h-6 text-violet-400" />
          </motion.div>
          <span className="text-sm text-white/70">Generating ideas...</span>
        </div>
      </motion.div>
    )
  }

  if (!ideas.length) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('p-3', className)}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-3 px-1">
        <GitBranch className="w-4 h-4 text-violet-400" />
        <span className="text-xs font-semibold text-white/70">Brainstorm Ideas</span>
        <span className="text-xs text-white/40">({ideas.length})</span>
      </div>

      {/* Ideas Grid */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {ideas.map((idea, index) => {
            const config = CATEGORY_CONFIG[idea.category]

            return (
              <motion.div
                key={idea.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: index * 0.05 }}
                className={cn(
                  'p-3 rounded-xl border',
                  'bg-white/[0.02] hover:bg-white/[0.04]',
                  'border-white/[0.06] hover:border-white/[0.12]',
                  'transition-all duration-200 cursor-pointer group'
                )}
                onClick={() => onExpandIdea(idea.id)}
              >
                {/* Header */}
                <div className="flex items-start gap-3">
                  {/* Category Icon */}
                  <div
                    className={cn(
                      'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                      config.bg,
                      config.border,
                      'border'
                    )}
                  >
                    <span className={config.color}>{config.icon}</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                        {idea.title}
                      </h4>
                      {/* Confidence */}
                      <span
                        className={cn(
                          'text-[10px] font-medium px-1.5 py-0.5 rounded',
                          idea.confidence >= 70
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : idea.confidence >= 40
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-red-500/20 text-red-400'
                        )}
                      >
                        {idea.confidence}%
                      </span>
                    </div>
                    <p className="text-xs text-white/60 leading-relaxed">{idea.description}</p>

                    {/* Sub-ideas */}
                    {idea.expanded && idea.subIdeas && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-3 pl-3 border-l-2 border-white/10 space-y-2"
                      >
                        {idea.subIdeas.map((sub) => (
                          <div key={sub.id} className="flex items-start gap-2">
                            <ArrowRight className="w-3 h-3 text-white/30 mt-0.5 flex-shrink-0" />
                            <div>
                              <span className="text-xs font-medium text-white/80">{sub.title}</span>
                              <p className="text-[11px] text-white/50">{sub.description}</p>
                            </div>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onRegenerateIdea(idea.id)
                        if (navigator.vibrate) navigator.vibrate(10)
                      }}
                      className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-all"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <ChevronRight
                      className={cn(
                        'w-4 h-4 text-white/30 transition-transform',
                        idea.expanded && 'rotate-90'
                      )}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  )
})

// ============================================================
// BRAINSTORM PROMPT BUILDER
// ============================================================

export function buildBrainstormPrompt(topic: string, context?: string): string {
  return `
🧠 BRAINSTORM MODE ACTIVATED

You are now in creative brainstorming mode. Generate multiple diverse perspectives and ideas about: "${topic}"

${context ? `Context: ${context}` : ''}

For each idea, provide:
1. A clear, concise title
2. A brief description (1-2 sentences)
3. Category: opportunity, risk, strategy, or insight
4. Confidence level (0-100%)

Generate 4-6 ideas covering different angles. Be creative but realistic.

Format your response as a JSON array:
\`\`\`json
[
  {
    "title": "Idea title",
    "description": "Brief description",
    "category": "opportunity|risk|strategy|insight",
    "confidence": 75
  }
]
\`\`\`

Think outside the box and consider:
- Contrarian viewpoints
- Hidden opportunities
- Potential risks others might miss
- Novel strategies
- Key insights from data
`
}

export default BrainstormToggle
