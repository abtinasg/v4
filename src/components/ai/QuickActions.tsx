/**
 * Quick Actions / Command Palette Component
 * 
 * Slash commands for quick actions:
 * - /compare AAPL MSFT - Compare stocks
 * - /watchlist add TSLA - Add to watchlist
 * - /alert NVDA > 150 - Set price alert
 * - /analyze GOOGL - Quick analysis
 * - /news AMZN - Get stock news
 * - /chart AAPL 1Y - Show chart
 */

'use client'

import React, { useState, useCallback, useMemo, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Command,
  TrendingUp,
  Bell,
  BarChart2,
  Newspaper,
  LineChart,
  GitCompare,
  Plus,
  Zap,
  Search,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================
// TYPES
// ============================================================

export interface QuickAction {
  command: string
  description: string
  icon: React.ReactNode
  example: string
  category: 'analysis' | 'watchlist' | 'alerts' | 'data'
}

export interface QuickActionsProps {
  input: string
  onSelect: (command: string) => void
  className?: string
}

// ============================================================
// AVAILABLE COMMANDS
// ============================================================

const QUICK_ACTIONS: QuickAction[] = [
  {
    command: '/analyze',
    description: 'Get AI analysis for a stock',
    icon: <TrendingUp className="w-4 h-4" />,
    example: '/analyze AAPL',
    category: 'analysis',
  },
  {
    command: '/compare',
    description: 'Compare multiple stocks',
    icon: <GitCompare className="w-4 h-4" />,
    example: '/compare AAPL MSFT GOOGL',
    category: 'analysis',
  },
  {
    command: '/watchlist add',
    description: 'Add stock to watchlist',
    icon: <Plus className="w-4 h-4" />,
    example: '/watchlist add TSLA',
    category: 'watchlist',
  },
  {
    command: '/alert',
    description: 'Set price alert',
    icon: <Bell className="w-4 h-4" />,
    example: '/alert NVDA > 150',
    category: 'alerts',
  },
  {
    command: '/news',
    description: 'Get latest news for stock',
    icon: <Newspaper className="w-4 h-4" />,
    example: '/news AMZN',
    category: 'data',
  },
  {
    command: '/chart',
    description: 'Show stock chart',
    icon: <LineChart className="w-4 h-4" />,
    example: '/chart AAPL 1Y',
    category: 'data',
  },
  {
    command: '/metrics',
    description: 'Show key financial metrics',
    icon: <BarChart2 className="w-4 h-4" />,
    example: '/metrics MSFT',
    category: 'data',
  },
  {
    command: '/brainstorm',
    description: 'Start brainstorming mode',
    icon: <Zap className="w-4 h-4" />,
    example: '/brainstorm investment ideas',
    category: 'analysis',
  },
]

// ============================================================
// QUICK ACTIONS COMPONENT
// ============================================================

export const QuickActions = memo(function QuickActions({
  input,
  onSelect,
  className,
}: QuickActionsProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Filter commands based on input
  const filteredActions = useMemo(() => {
    if (!input.startsWith('/')) return []
    
    const query = input.toLowerCase()
    return QUICK_ACTIONS.filter(
      (action) =>
        action.command.toLowerCase().startsWith(query) ||
        action.description.toLowerCase().includes(query.slice(1))
    )
  }, [input])

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!filteredActions.length) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev + 1) % filteredActions.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length)
      } else if (e.key === 'Tab' || e.key === 'Enter') {
        e.preventDefault()
        onSelect(filteredActions[selectedIndex].command + ' ')
      }
    },
    [filteredActions, selectedIndex, onSelect]
  )

  // Reset selection when filter changes
  React.useEffect(() => {
    setSelectedIndex(0)
  }, [input])

  if (!filteredActions.length) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className={cn(
          'absolute bottom-full left-0 right-0 mb-2 p-2',
          'bg-[#0a0d12]/95 backdrop-blur-xl rounded-xl',
          'border border-white/10 shadow-xl',
          className
        )}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-2 py-1.5 mb-1 border-b border-white/10">
          <Command className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-xs font-medium text-white/50">Quick Actions</span>
        </div>

        {/* Actions list */}
        <div className="max-h-[200px] overflow-y-auto">
          {filteredActions.map((action, index) => (
            <motion.button
              key={action.command}
              onClick={() => onSelect(action.command + ' ')}
              className={cn(
                'w-full flex items-center gap-3 px-2 py-2 rounded-lg text-left',
                'transition-all duration-150',
                index === selectedIndex
                  ? 'bg-cyan-500/20 text-white'
                  : 'hover:bg-white/5 text-white/70'
              )}
              whileHover={{ x: 2 }}
            >
              {/* Icon */}
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  index === selectedIndex ? 'bg-cyan-500/30 text-cyan-400' : 'bg-white/5 text-white/50'
                )}
              >
                {action.icon}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium font-mono">{action.command}</span>
                  <span className="text-xs text-white/30">{action.description}</span>
                </div>
                <span className="text-xs text-white/40 font-mono">{action.example}</span>
              </div>

              {/* Tab hint */}
              {index === selectedIndex && (
                <span className="text-[10px] text-white/30 px-1.5 py-0.5 rounded bg-white/10">
                  Tab
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
})

// ============================================================
// COMMAND PARSER
// ============================================================

export interface ParsedCommand {
  type: 'analyze' | 'compare' | 'watchlist' | 'alert' | 'news' | 'chart' | 'metrics' | 'brainstorm' | 'text'
  symbols?: string[]
  action?: string
  params?: Record<string, string>
  rawText: string
}

export function parseCommand(input: string): ParsedCommand {
  const trimmed = input.trim()
  
  if (!trimmed.startsWith('/')) {
    return { type: 'text', rawText: trimmed }
  }

  const parts = trimmed.split(/\s+/)
  const command = parts[0].toLowerCase()
  const args = parts.slice(1)

  switch (command) {
    case '/analyze':
      return {
        type: 'analyze',
        symbols: args.filter((a) => /^[A-Z]{1,5}$/i.test(a)).map((s) => s.toUpperCase()),
        rawText: trimmed,
      }

    case '/compare':
      return {
        type: 'compare',
        symbols: args.filter((a) => /^[A-Z]{1,5}$/i.test(a)).map((s) => s.toUpperCase()),
        rawText: trimmed,
      }

    case '/watchlist':
      return {
        type: 'watchlist',
        action: args[0], // 'add' or 'remove'
        symbols: args.slice(1).filter((a) => /^[A-Z]{1,5}$/i.test(a)).map((s) => s.toUpperCase()),
        rawText: trimmed,
      }

    case '/alert':
      // Parse: /alert NVDA > 150
      const symbol = args[0]?.toUpperCase()
      const operator = args[1] // '>' or '<'
      const price = args[2]
      return {
        type: 'alert',
        symbols: symbol ? [symbol] : [],
        params: { operator, price },
        rawText: trimmed,
      }

    case '/news':
      return {
        type: 'news',
        symbols: args.filter((a) => /^[A-Z]{1,5}$/i.test(a)).map((s) => s.toUpperCase()),
        rawText: trimmed,
      }

    case '/chart':
      return {
        type: 'chart',
        symbols: [args[0]?.toUpperCase()].filter(Boolean),
        params: { timeframe: args[1] || '1Y' },
        rawText: trimmed,
      }

    case '/metrics':
      return {
        type: 'metrics',
        symbols: args.filter((a) => /^[A-Z]{1,5}$/i.test(a)).map((s) => s.toUpperCase()),
        rawText: trimmed,
      }

    case '/brainstorm':
      return {
        type: 'brainstorm',
        params: { topic: args.join(' ') },
        rawText: trimmed,
      }

    default:
      return { type: 'text', rawText: trimmed }
  }
}

export default QuickActions
