'use client'

import { useState, useEffect, ReactNode } from 'react'
import { motion } from 'framer-motion'
import {
  Maximize2,
  Minimize2,
  RefreshCw,
  Settings,
  X,
  GripVertical,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface TerminalPanelProps {
  title: string
  icon?: ReactNode
  children: ReactNode
  className?: string
  isLoading?: boolean
  onRefresh?: () => void
  onClose?: () => void
  badge?: string
  badgeColor?: 'green' | 'red' | 'amber' | 'cyan' | 'blue' | 'violet'
  headerRight?: ReactNode
  noPadding?: boolean
}

export function TerminalPanel({
  title,
  icon,
  children,
  className,
  isLoading = false,
  onRefresh,
  onClose,
  badge,
  badgeColor = 'green',
  headerRight,
  noPadding = false,
}: TerminalPanelProps) {
  const [isMaximized, setIsMaximized] = useState(false)

  const badgeColors = {
    green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    cyan: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    violet: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  }

  return (
    <motion.div
      layout
      className={cn(
        'flex flex-col rounded-lg overflow-hidden',
        'bg-[#0a0d12]/90 backdrop-blur-sm',
        'border border-white/[0.06]',
        isMaximized && 'fixed inset-4 z-50',
        className
      )}
    >
      {/* Panel Header - Bloomberg style */}
      <div className="flex items-center justify-between px-3 py-2 bg-[#0d1117] border-b border-white/[0.06]">
        <div className="flex items-center gap-2">
          <GripVertical className="w-3 h-3 text-gray-600 cursor-grab" />
          {icon && <span className="text-gray-400">{icon}</span>}
          <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
            {title}
          </span>
          {badge && (
            <span className={cn(
              'px-1.5 py-0.5 text-[9px] font-bold uppercase rounded border',
              badgeColors[badgeColor]
            )}>
              {badge}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1">
          {headerRight}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors"
            >
              <RefreshCw className={cn('w-3 h-3', isLoading && 'animate-spin')} />
            </button>
          )}
          <button
            onClick={() => setIsMaximized(!isMaximized)}
            className="p-1 rounded hover:bg-white/5 text-gray-500 hover:text-gray-300 transition-colors"
          >
            {isMaximized ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Panel Content */}
      <div className={cn('flex-1 overflow-auto', !noPadding && 'p-2')}>
        {children}
      </div>
    </motion.div>
  )
}

// Bloomberg-style data row
interface DataRowProps {
  label: string
  value: string | number
  change?: number
  changePercent?: number
  subLabel?: string
  onClick?: () => void
}

export function DataRow({ label, value, change, changePercent, subLabel, onClick }: DataRowProps) {
  const isPositive = (change ?? 0) >= 0

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center justify-between py-1.5 px-2 rounded',
        'hover:bg-white/[0.03] transition-colors',
        onClick && 'cursor-pointer'
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-gray-300 truncate">{label}</div>
        {subLabel && <div className="text-[10px] text-gray-600">{subLabel}</div>}
      </div>
      <div className="text-right">
        <div className="text-xs font-mono text-white tabular-nums">
          {typeof value === 'number' ? value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}
        </div>
        {(change !== undefined || changePercent !== undefined) && (
          <div className={cn(
            'text-[10px] font-mono tabular-nums',
            isPositive ? 'text-emerald-400' : 'text-red-400'
          )}>
            {change !== undefined && (
              <span>{isPositive ? '+' : ''}{change.toFixed(2)}</span>
            )}
            {changePercent !== undefined && (
              <span className="ml-1">({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Sector performance bar
interface SectorBarProps {
  name: string
  symbol: string
  change: number
  onClick?: () => void
}

export function SectorBar({ name, symbol, change, onClick }: SectorBarProps) {
  const isPositive = change >= 0
  const width = Math.min(Math.abs(change) * 15, 100)

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex items-center gap-2 py-1 px-2 rounded',
        'hover:bg-white/[0.03] transition-colors',
        onClick && 'cursor-pointer'
      )}
    >
      <div className="w-16 text-[10px] font-medium text-gray-400 truncate">{symbol}</div>
      <div className="flex-1 h-4 bg-white/[0.03] rounded overflow-hidden relative">
        <div
          className={cn(
            'absolute top-0 h-full rounded transition-all duration-500',
            isPositive ? 'left-1/2 bg-emerald-500/60' : 'right-1/2 bg-red-500/60'
          )}
          style={{ width: `${width / 2}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            'text-[10px] font-bold tabular-nums',
            isPositive ? 'text-emerald-400' : 'text-red-400'
          )}>
            {isPositive ? '+' : ''}{change.toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  )
}

// Mini sparkline chart
interface MiniChartProps {
  data: number[]
  color?: 'green' | 'red' | 'cyan' | 'amber'
  height?: number
  width?: number
}

export function MiniChart({ data, color = 'cyan', height = 24, width = 60 }: MiniChartProps) {
  if (data.length < 2) return null

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((value, i) => {
    const x = (i / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  const colors = {
    green: '#22c55e',
    red: '#ef4444',
    cyan: '#00d4ff',
    amber: '#f59e0b',
  }

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        fill="none"
        stroke={colors[color]}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        style={{ filter: `drop-shadow(0 0 3px ${colors[color]}40)` }}
      />
    </svg>
  )
}
