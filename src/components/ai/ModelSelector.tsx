/**
 * Model Selector Component
 * 
 * Let users choose their AI model:
 * - GPT-5.1 (Premium)
 * - Claude Sonnet 4.5 (Premium)
 * - GPT-4o (Standard)
 * - Claude 3.5 Haiku (Fast)
 */

'use client'

import React, { useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  Sparkles,
  Zap,
  Crown,
  Check,
  Info,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

// ============================================================
// TYPES
// ============================================================

export interface AIModel {
  id: string
  name: string
  provider: 'openai' | 'anthropic' | 'meta'
  description: string
  tier: 'free' | 'standard' | 'premium'
  contextWindow: number
  speed: 'fast' | 'medium' | 'slow'
  capabilities: string[]
  icon?: React.ReactNode
}

export interface ModelSelectorProps {
  selectedModel: string
  onModelChange: (modelId: string) => void
  disabled?: boolean
  className?: string
}

// ============================================================
// AVAILABLE MODELS
// ============================================================

export const AI_MODELS: AIModel[] = [
  {
    id: 'openai/gpt-5.1',
    name: 'GPT-5.1',
    provider: 'openai',
    description: 'Most advanced reasoning and analysis',
    tier: 'premium',
    contextWindow: 256000,
    speed: 'medium',
    capabilities: ['Deep Analysis', 'Complex Reasoning', 'Financial Modeling'],
    icon: <Crown className="w-4 h-4 text-amber-400" />,
  },
  {
    id: 'anthropic/claude-sonnet-4.5',
    name: 'Claude Sonnet 4.5',
    provider: 'anthropic',
    description: 'Exceptional at nuanced financial analysis',
    tier: 'premium',
    contextWindow: 200000,
    speed: 'medium',
    capabilities: ['Nuanced Analysis', 'Risk Assessment', 'Long-form Reports'],
    icon: <Crown className="w-4 h-4 text-violet-400" />,
  },
  {
    id: 'openai/gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Fast and capable for most tasks',
    tier: 'standard',
    contextWindow: 128000,
    speed: 'fast',
    capabilities: ['Quick Analysis', 'Market Updates', 'Q&A'],
    icon: <Sparkles className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'anthropic/claude-3.5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'anthropic',
    description: 'Ultra-fast responses for quick queries',
    tier: 'free',
    contextWindow: 200000,
    speed: 'fast',
    capabilities: ['Instant Answers', 'Basic Analysis', 'Definitions'],
    icon: <Zap className="w-4 h-4 text-emerald-400" />,
  },
]

// ============================================================
// MODEL SELECTOR COMPONENT
// ============================================================

export const ModelSelector = memo(function ModelSelector({
  selectedModel,
  onModelChange,
  disabled = false,
  className,
}: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const currentModel = AI_MODELS.find((m) => m.id === selectedModel) || AI_MODELS[2] // Default to GPT-4o

  const getTierColor = (tier: AIModel['tier']) => {
    switch (tier) {
      case 'premium':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20'
      case 'standard':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20'
      case 'free':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
    }
  }

  const getSpeedBadge = (speed: AIModel['speed']) => {
    switch (speed) {
      case 'fast':
        return { label: 'Fast', color: 'text-emerald-400' }
      case 'medium':
        return { label: 'Balanced', color: 'text-cyan-400' }
      case 'slow':
        return { label: 'Thorough', color: 'text-amber-400' }
    }
  }

  return (
    <div className={cn('relative', className)}>
      {/* Trigger Button */}
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-2.5 py-1.5 rounded-lg',
          'bg-white/5 border border-white/10',
          'hover:bg-white/10 hover:border-white/20',
          'transition-all duration-200',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          isOpen && 'bg-white/10 border-cyan-500/30'
        )}
      >
        {currentModel.icon}
        <span className="text-xs font-medium text-white">{currentModel.name}</span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-white/50 transition-transform duration-200',
            isOpen && 'rotate-180'
          )}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />

            {/* Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className={cn(
                'absolute top-full left-0 mt-2 w-72 z-50',
                'bg-[#0a0d12]/95 backdrop-blur-xl rounded-xl',
                'border border-white/10 shadow-2xl',
                'overflow-hidden'
              )}
            >
              {/* Header */}
              <div className="px-3 py-2.5 border-b border-white/10 bg-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">Select AI Model</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-3.5 h-3.5 text-white/40" />
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-[200px]">
                        <p className="text-xs">Premium models provide deeper analysis and better reasoning for complex financial questions.</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>

              {/* Models List */}
              <div className="p-2 space-y-1 max-h-[300px] overflow-y-auto">
                {AI_MODELS.map((model) => {
                  const isSelected = model.id === selectedModel
                  const speedBadge = getSpeedBadge(model.speed)

                  return (
                    <motion.button
                      key={model.id}
                      onClick={() => {
                        onModelChange(model.id)
                        setIsOpen(false)
                        if (navigator.vibrate) navigator.vibrate(10)
                      }}
                      className={cn(
                        'w-full p-2.5 rounded-lg text-left',
                        'transition-all duration-150',
                        isSelected
                          ? 'bg-cyan-500/20 border border-cyan-500/30'
                          : 'hover:bg-white/5 border border-transparent'
                      )}
                      whileHover={{ x: 2 }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon */}
                        <div
                          className={cn(
                            'w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0',
                            isSelected ? 'bg-cyan-500/30' : 'bg-white/5'
                          )}
                        >
                          {model.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-sm font-semibold text-white">{model.name}</span>
                            <span
                              className={cn(
                                'text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border',
                                getTierColor(model.tier)
                              )}
                            >
                              {model.tier}
                            </span>
                          </div>
                          <p className="text-xs text-white/50 mb-1.5">{model.description}</p>
                          
                          {/* Capabilities */}
                          <div className="flex flex-wrap gap-1">
                            {model.capabilities.slice(0, 2).map((cap) => (
                              <span
                                key={cap}
                                className="text-[10px] text-white/40 px-1.5 py-0.5 rounded bg-white/5"
                              >
                                {cap}
                              </span>
                            ))}
                            <span className={cn('text-[10px] px-1.5 py-0.5 rounded bg-white/5', speedBadge.color)}>
                              {speedBadge.label}
                            </span>
                          </div>
                        </div>

                        {/* Selected indicator */}
                        {isSelected && (
                          <Check className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        )}
                      </div>
                    </motion.button>
                  )
                })}
              </div>

              {/* Footer */}
              <div className="px-3 py-2 border-t border-white/10 bg-white/5">
                <p className="text-[10px] text-white/40 text-center">
                  Premium models require a Pro subscription
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
})

export default ModelSelector
