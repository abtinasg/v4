/**
 * Interactive Chart Component for AI Responses
 * 
 * Renders mini charts within AI chat messages:
 * - Price charts with key levels
 * - Metric comparisons
 * - Performance sparklines
 */

'use client'

import React, { memo, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================
// TYPES
// ============================================================

export interface ChartData {
  labels: string[]
  values: number[]
  type: 'line' | 'bar' | 'area'
}

export interface InteractiveChartProps {
  symbol: string
  data: ChartData
  title?: string
  subtitle?: string
  change?: number
  changePercent?: number
  currentPrice?: number
  onClick?: () => void
  className?: string
}

export interface ComparisonChartProps {
  symbols: string[]
  data: Record<string, number[]>
  metric: string
  onClick?: (symbol: string) => void
  className?: string
}

export interface MetricBarProps {
  label: string
  value: number
  maxValue: number
  benchmark?: number
  color?: string
  className?: string
}

// ============================================================
// SVG PATH GENERATOR
// ============================================================

function generatePath(values: number[], width: number, height: number, type: 'line' | 'area'): string {
  if (values.length < 2) return ''
  
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  
  const points = values.map((value, i) => {
    const x = (i / (values.length - 1)) * width
    const y = height - ((value - min) / range) * height * 0.85 - height * 0.075
    return { x, y }
  })
  
  const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ')
  
  if (type === 'area') {
    return `${pathData} L ${width} ${height} L 0 ${height} Z`
  }
  
  return pathData
}

// ============================================================
// INTERACTIVE CHART
// ============================================================

export const InteractiveChart = memo(function InteractiveChart({
  symbol,
  data,
  title,
  subtitle,
  change,
  changePercent,
  currentPrice,
  onClick,
  className,
}: InteractiveChartProps) {
  const isPositive = (changePercent ?? 0) >= 0
  const width = 200
  const height = 60

  const linePath = useMemo(
    () => generatePath(data.values, width, height, 'line'),
    [data.values]
  )

  const areaPath = useMemo(
    () => generatePath(data.values, width, height, 'area'),
    [data.values]
  )

  return (
    <motion.div
      onClick={onClick}
      className={cn(
        'p-3 rounded-xl border cursor-pointer group',
        'bg-white/[0.02] hover:bg-white/[0.04]',
        'border-white/[0.06] hover:border-white/[0.12]',
        'transition-all duration-200',
        className
      )}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-white">{symbol}</span>
            {onClick && (
              <ExternalLink className="w-3 h-3 text-white/30 group-hover:text-cyan-400 transition-colors" />
            )}
          </div>
          {title && <p className="text-xs text-white/50">{title}</p>}
        </div>
        
        {/* Price & Change */}
        <div className="text-right">
          {currentPrice && (
            <p className="text-sm font-semibold text-white tabular-nums">
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          )}
          {changePercent !== undefined && (
            <div className={cn(
              'flex items-center justify-end gap-1 text-xs font-medium',
              isPositive ? 'text-emerald-400' : 'text-red-400'
            )}>
              {isPositive ? (
                <ArrowUpRight className="w-3 h-3" />
              ) : (
                <ArrowDownRight className="w-3 h-3" />
              )}
              <span>{isPositive ? '+' : ''}{changePercent.toFixed(2)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Chart */}
      <svg width={width} height={height} className="w-full overflow-visible">
        <defs>
          <linearGradient id={`gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="0%"
              stopColor={isPositive ? '#22c55e' : '#ef4444'}
              stopOpacity="0.3"
            />
            <stop
              offset="100%"
              stopColor={isPositive ? '#22c55e' : '#ef4444'}
              stopOpacity="0"
            />
          </linearGradient>
          <filter id={`glow-${symbol}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Area fill */}
        <motion.path
          d={areaPath}
          fill={`url(#gradient-${symbol})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        />

        {/* Line */}
        <motion.path
          d={linePath}
          fill="none"
          stroke={isPositive ? '#22c55e' : '#ef4444'}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={`url(#glow-${symbol})`}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />

        {/* Current value dot */}
        <motion.circle
          cx={width}
          cy={height - ((data.values[data.values.length - 1] - Math.min(...data.values)) / (Math.max(...data.values) - Math.min(...data.values) || 1)) * height * 0.85 - height * 0.075}
          r="4"
          fill={isPositive ? '#22c55e' : '#ef4444'}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.8 }}
        />
      </svg>

      {/* Subtitle */}
      {subtitle && (
        <p className="text-[10px] text-white/40 mt-2 text-center">{subtitle}</p>
      )}
    </motion.div>
  )
})

// ============================================================
// COMPARISON CHART
// ============================================================

export const ComparisonChart = memo(function ComparisonChart({
  symbols,
  data,
  metric,
  onClick,
  className,
}: ComparisonChartProps) {
  const colors = ['#00d4ff', '#8b5cf6', '#22c55e', '#f59e0b', '#ef4444']

  return (
    <div className={cn('p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]', className)}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-white/70">Comparison: {metric}</span>
        <span className="text-[10px] text-white/40">{symbols.length} stocks</span>
      </div>

      {/* Bars */}
      <div className="space-y-2">
        {symbols.map((symbol, i) => {
          const values = data[symbol] || []
          const currentValue = values[values.length - 1] || 0
          const maxValue = Math.max(...symbols.map(s => data[s]?.[data[s]?.length - 1] || 0))
          const percentage = (currentValue / maxValue) * 100

          return (
            <motion.div
              key={symbol}
              className="group cursor-pointer"
              onClick={() => onClick?.(symbol)}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-white group-hover:text-cyan-400 transition-colors">
                  {symbol}
                </span>
                <span className="text-xs text-white/60 tabular-nums">
                  {currentValue.toFixed(2)}
                </span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{ backgroundColor: colors[i % colors.length] }}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
})

// ============================================================
// METRIC BAR
// ============================================================

export const MetricBar = memo(function MetricBar({
  label,
  value,
  maxValue,
  benchmark,
  color = '#00d4ff',
  className,
}: MetricBarProps) {
  const percentage = (value / maxValue) * 100
  const benchmarkPercentage = benchmark ? (benchmark / maxValue) * 100 : null

  return (
    <div className={cn('space-y-1', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs text-white/60">{label}</span>
        <span className="text-xs font-medium text-white tabular-nums">{value.toFixed(2)}</span>
      </div>
      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(percentage, 100)}%` }}
          transition={{ duration: 0.5 }}
        />
        {benchmarkPercentage && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white/50"
            style={{ left: `${Math.min(benchmarkPercentage, 100)}%` }}
          />
        )}
      </div>
    </div>
  )
})

// ============================================================
// CHART PARSER FOR AI RESPONSES
// ============================================================

export interface ParsedChart {
  type: 'price' | 'comparison' | 'metric'
  symbol?: string
  symbols?: string[]
  data?: number[]
  metric?: string
}

export function parseChartFromResponse(response: string): ParsedChart[] {
  const charts: ParsedChart[] = []
  
  // Look for chart markers in AI response
  // Format: [CHART:PRICE:AAPL] or [CHART:COMPARE:AAPL,MSFT,GOOGL:PE] or [CHART:METRIC:ROE:15.4]
  const chartRegex = /\[CHART:(\w+):([^\]]+)\]/g
  let match

  while ((match = chartRegex.exec(response)) !== null) {
    const type = match[1].toLowerCase()
    const params = match[2].split(':')

    if (type === 'price' && params[0]) {
      charts.push({
        type: 'price',
        symbol: params[0].toUpperCase(),
      })
    } else if (type === 'compare' && params[0]) {
      charts.push({
        type: 'comparison',
        symbols: params[0].split(',').map(s => s.trim().toUpperCase()),
        metric: params[1] || 'Price',
      })
    } else if (type === 'metric') {
      charts.push({
        type: 'metric',
        metric: params[0],
        data: params.slice(1).map(Number),
      })
    }
  }

  return charts
}

export default InteractiveChart
