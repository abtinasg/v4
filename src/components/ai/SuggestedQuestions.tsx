/**
 * Suggested Questions Component
 * 
 * Context-aware question suggestions that adapt based on:
 * - Current page context
 * - Stock being viewed
 * - Market conditions
 * - User's recent activity
 */

'use client'

import React, { memo } from 'react'
import { motion } from 'framer-motion'
import { Sparkles, TrendingUp, BarChart2, PieChart, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSuggestedQuestions, useChatStore } from '@/lib/stores/chat-store'

// ============================================================
// TYPES
// ============================================================

export interface SuggestedQuestionsProps {
  onSelect: (question: string) => void
  className?: string
  maxQuestions?: number
}

// ============================================================
// CONTEXT ICONS
// ============================================================

const contextIcons: Record<string, React.ReactNode> = {
  stock: <TrendingUp className="w-3.5 h-3.5" />,
  market: <BarChart2 className="w-3.5 h-3.5" />,
  portfolio: <PieChart className="w-3.5 h-3.5" />,
  screener: <Search className="w-3.5 h-3.5" />,
  general: <Sparkles className="w-3.5 h-3.5" />,
}

// ============================================================
// SUGGESTED QUESTIONS COMPONENT
// ============================================================

export const SuggestedQuestions = memo(function SuggestedQuestions({
  onSelect,
  className,
  maxQuestions = 4,
}: SuggestedQuestionsProps) {
  const questions = useSuggestedQuestions()
  const context = useChatStore((state) => state.context)
  
  const displayedQuestions = questions.slice(0, maxQuestions)
  const icon = contextIcons[context.type] || contextIcons.general

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 8, scale: 0.98 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 30,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('space-y-4', className)}
    >
      {/* Context indicator - Minimal */}
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 text-white/30">
          {icon}
          <span className="text-xs font-medium tracking-wide">
            {context.type === 'stock' && context.stock?.symbol
              ? `Suggestions for ${context.stock.symbol}`
              : 'Suggested prompts'}
          </span>
        </div>
      </div>

      {/* Questions grid - Premium Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {displayedQuestions.map((question, index) => (
          <motion.button
            key={`${question}-${index}`}
            variants={itemVariants}
            onClick={() => onSelect(question)}
            className={cn(
              'group relative text-left p-4 rounded-xl',
              'bg-white/[0.02] backdrop-blur-sm',
              'border border-white/[0.05] hover:border-white/[0.10]',
              'shadow-[0_4px_16px_rgba(0,0,0,0.06)]',
              'hover:bg-white/[0.04] hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)]',
              'hover:-translate-y-0.5',
              'transition-all duration-200',
              'focus:outline-none focus:ring-1 focus:ring-white/[0.12]',
            )}
          >
            <span className="text-sm text-white/70 group-hover:text-white/90 leading-relaxed line-clamp-2 font-light">
              {question}
            </span>
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
})

// ============================================================
// COMPACT VERSION (for inline use)
// ============================================================

export interface CompactSuggestionsProps {
  onSelect: (question: string) => void
  className?: string
}

export const CompactSuggestions = memo(function CompactSuggestions({
  onSelect,
  className,
}: CompactSuggestionsProps) {
  const questions = useSuggestedQuestions()
  
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {questions.slice(0, 3).map((question, index) => (
        <motion.button
          key={index}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.05 }}
          onClick={() => onSelect(question)}
          className={cn(
            'px-3 py-1.5 text-xs rounded-full',
            'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20',
            'text-white/70 hover:text-white transition-all duration-200',
          )}
        >
          {question.length > 40 ? question.slice(0, 40) + '...' : question}
        </motion.button>
      ))}
    </div>
  )
})

export default SuggestedQuestions
