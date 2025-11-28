/**
 * Context Badge Component
 * 
 * Shows the current AI context awareness:
 * - Stock page → Stock symbol and key data
 * - Market overview → Market summary
 * - Screener → Active filters/results
 * - Portfolio → Holdings summary
 */

'use client'

import React, { memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  BarChart2,
  PieChart,
  Search,
  Sparkles,
  X,
  ChevronDown,
  ChevronUp,
  Eye,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChatStore, type ChatContext } from '@/lib/stores/chat-store'
import { Button } from '@/components/ui/button'

// ============================================================
// TYPES
// ============================================================

export interface ContextBadgeProps {
  className?: string
  showDetails?: boolean
  onClear?: () => void
}

// ============================================================
// CONTEXT COLORS & ICONS
// ============================================================

const contextConfig: Record<ChatContext['type'], {
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  label: string
}> = {
  stock: {
    icon: <TrendingUp className="w-3.5 h-3.5" />,
    color: 'text-cyan-400',
    bgColor: 'bg-cyan-500/10',
    borderColor: 'border-cyan-500/30',
    label: 'Stock Analysis',
  },
  market: {
    icon: <BarChart2 className="w-3.5 h-3.5" />,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
    label: 'Market Overview',
  },
  portfolio: {
    icon: <PieChart className="w-3.5 h-3.5" />,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/10',
    borderColor: 'border-violet-500/30',
    label: 'Portfolio',
  },
  screener: {
    icon: <Search className="w-3.5 h-3.5" />,
    color: 'text-teal-400',
    bgColor: 'bg-teal-500/10',
    borderColor: 'border-teal-500/30',
    label: 'Screener',
  },
  news: {
    icon: <BarChart2 className="w-3.5 h-3.5" />,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
    label: 'Market News',
  },
  terminal: {
    icon: <BarChart2 className="w-3.5 h-3.5" />,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/10',
    borderColor: 'border-orange-500/30',
    label: 'Terminal Pro',
  },
  general: {
    icon: <Sparkles className="w-3.5 h-3.5" />,
    color: 'text-white/60',
    bgColor: 'bg-white/5',
    borderColor: 'border-white/10',
    label: 'General',
  },
}

// ============================================================
// CONTEXT BADGE COMPONENT
// ============================================================

export const ContextBadge = memo(function ContextBadge({
  className,
  showDetails = false,
  onClear,
}: ContextBadgeProps) {
  const context = useChatStore((state) => state.context)
  const clearContext = useChatStore((state) => state.clearContext)
  const [expanded, setExpanded] = React.useState(false)
  
  const config = contextConfig[context.type]
  const hasContext = context.type !== 'general'

  const handleClear = () => {
    clearContext()
    onClear?.()
  }

  return (
    <div className={cn('relative', className)}>
      <motion.div
        layout
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all duration-200',
          config.bgColor,
          config.borderColor,
          hasContext && 'cursor-pointer hover:bg-opacity-20',
        )}
        onClick={() => hasContext && showDetails && setExpanded(!expanded)}
      >
        {/* Icon */}
        <span className={config.color}>{config.icon}</span>
        
        {/* Label */}
        <span className={cn('text-xs font-medium', config.color)}>
          {context.type === 'stock' && context.stock?.symbol
            ? context.stock.symbol
            : config.label}
        </span>

        {/* Expand indicator */}
        {hasContext && showDetails && (
          <motion.span
            animate={{ rotate: expanded ? 180 : 0 }}
            className={config.color}
          >
            <ChevronDown className="w-3 h-3" />
          </motion.span>
        )}

        {/* Clear button */}
        {hasContext && (
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation()
              handleClear()
            }}
            className={cn(
              'h-4 w-4 ml-1 rounded-full',
              'hover:bg-white/20',
              config.color,
            )}
          >
            <X className="w-2.5 h-2.5" />
          </Button>
        )}
      </motion.div>

      {/* Expanded details */}
      <AnimatePresence>
        {expanded && hasContext && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className={cn(
              'absolute top-full left-0 right-0 mt-2 p-3 rounded-xl',
              'bg-[#0a0d12] border border-white/10',
              'shadow-xl shadow-black/20 z-50',
            )}
          >
            <ContextDetails context={context} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
})

// ============================================================
// CONTEXT DETAILS
// ============================================================

interface ContextDetailsProps {
  context: ChatContext
}

const ContextDetails = memo(function ContextDetails({ context }: ContextDetailsProps) {
  if (context.type === 'stock' && context.stock) {
    const { stock } = context
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white">{stock.symbol}</span>
          {stock.quote && (
            <span className={cn(
              'text-sm font-mono',
              stock.quote.change >= 0 ? 'text-green-400' : 'text-red-400',
            )}>
              ${stock.quote.price.toFixed(2)}
              {' '}
              ({stock.quote.change >= 0 ? '+' : ''}{stock.quote.changePercent.toFixed(2)}%)
            </span>
          )}
        </div>
        {stock.name && (
          <p className="text-xs text-white/50">{stock.name}</p>
        )}
        {stock.metrics && (
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
            {stock.metrics.pe && (
              <div className="text-xs">
                <span className="text-white/40">P/E: </span>
                <span className="text-white/80">{stock.metrics.pe.toFixed(2)}</span>
              </div>
            )}
            {stock.quote?.marketCap && (
              <div className="text-xs">
                <span className="text-white/40">Cap: </span>
                <span className="text-white/80">
                  ${(stock.quote.marketCap / 1e9).toFixed(1)}B
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (context.type === 'market' && context.market) {
    const { market } = context
    return (
      <div className="space-y-2">
        <p className="text-xs text-white/50">Market context loaded</p>
        {market.indices && market.indices.length > 0 && (
          <div className="space-y-1">
            {market.indices.slice(0, 3).map((idx) => (
              <div key={idx.symbol} className="flex items-center justify-between text-xs">
                <span className="text-white/70">{idx.name}</span>
                <span className={idx.change >= 0 ? 'text-green-400' : 'text-red-400'}>
                  {idx.change >= 0 ? '+' : ''}{idx.changePercent.toFixed(2)}%
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (context.type === 'portfolio' && context.portfolio) {
    const { portfolio } = context
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50">Portfolio Value</span>
          {portfolio.totalValue && (
            <span className="text-sm font-mono text-white">
              ${portfolio.totalValue.toLocaleString()}
            </span>
          )}
        </div>
        {portfolio.holdings && (
          <p className="text-xs text-white/40">
            {portfolio.holdings.length} holdings loaded
          </p>
        )}
      </div>
    )
  }

  if (context.type === 'screener' && context.screenerResults) {
    const { screenerResults } = context
    return (
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-white/50">Screener Results</span>
          <span className="text-sm font-mono text-white">
            {screenerResults.count} stocks
          </span>
        </div>
        {screenerResults.topResults && (
          <div className="flex flex-wrap gap-1">
            {screenerResults.topResults.slice(0, 5).map((stock) => (
              <span
                key={stock.symbol}
                className="px-2 py-0.5 text-xs rounded bg-white/10 text-white/70"
              >
                {stock.symbol}
              </span>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <p className="text-xs text-white/50">No specific context</p>
  )
})

// ============================================================
// INLINE CONTEXT INDICATOR (minimal version)
// ============================================================

export interface InlineContextIndicatorProps {
  className?: string
}

export const InlineContextIndicator = memo(function InlineContextIndicator({
  className,
}: InlineContextIndicatorProps) {
  const context = useChatStore((state) => state.context)
  const config = contextConfig[context.type]

  if (context.type === 'general') {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs',
        config.bgColor,
        config.color,
        className,
      )}
    >
      <Eye className="w-3 h-3" />
      <span>
        AI aware of {context.type === 'stock' && context.stock?.symbol 
          ? context.stock.symbol 
          : context.type}
      </span>
    </motion.div>
  )
})

export default ContextBadge
