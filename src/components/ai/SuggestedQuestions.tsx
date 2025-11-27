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
    hidden: { opacity: 0, y: 10, scale: 0.95 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 25,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={cn('space-y-2', className)}
    >
      {/* Context indicator */}
      <div className="flex items-center gap-2 px-1">
        <div className="flex items-center gap-1.5 text-white/40">
          {icon}
          <span className="text-xs font-medium">
            {context.type === 'stock' && context.stock?.symbol
              ? `Suggestions for ${context.stock.symbol}`
              : context.type === 'general'
              ? 'Suggested questions'
              : `${context.type.charAt(0).toUpperCase() + context.type.slice(1)} suggestions`}
          </span>
        </div>
      </div>

      {/* Questions grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {displayedQuestions.map((question, index) => (
          <motion.button
            key={`${question}-${index}`}
            variants={itemVariants}
            onClick={() => onSelect(question)}
            className={cn(
              'group relative text-left p-3 rounded-xl',
              'bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-cyan-500/50',
            )}
          >
            <span className="text-sm text-white/80 group-hover:text-white line-clamp-2">
              {question}
            </span>
            
            {/* Hover indicator */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/5 to-violet-500/5" />
            </div>
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
