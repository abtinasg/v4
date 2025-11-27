/**
 * Real-Time Price Component
 * 
 * Displays price with flash animations on updates
 * - Green flash on price increase
 * - Red flash on price decrease
 * - Optional sound notification
 */

'use client'

import React, { useState, useEffect, useRef, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

// ============================================================
// TYPES
// ============================================================

export interface RealTimePriceProps {
  price: number
  previousPrice?: number
  change?: number
  changePercent?: number
  showChange?: boolean
  showPercent?: boolean
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  flashOnChange?: boolean
  className?: string
}

// ============================================================
// SIZE CONFIGS
// ============================================================

const sizeConfig = {
  sm: {
    price: 'text-sm font-medium',
    change: 'text-xs',
    icon: 'w-3 h-3',
    gap: 'gap-1',
  },
  md: {
    price: 'text-base font-semibold',
    change: 'text-sm',
    icon: 'w-4 h-4',
    gap: 'gap-1.5',
  },
  lg: {
    price: 'text-xl font-bold',
    change: 'text-base',
    icon: 'w-5 h-5',
    gap: 'gap-2',
  },
}

// ============================================================
// COMPONENT
// ============================================================

export const RealTimePrice = memo(function RealTimePrice({
  price,
  previousPrice,
  change,
  changePercent,
  showChange = true,
  showPercent = true,
  showIcon = true,
  size = 'md',
  flashOnChange = true,
  className,
}: RealTimePriceProps) {
  const [flash, setFlash] = useState<'up' | 'down' | null>(null)
  const prevPriceRef = useRef(price)
  const config = sizeConfig[size]

  // Calculate change if not provided
  const actualChange = change ?? (previousPrice ? price - previousPrice : 0)
  const actualChangePercent = changePercent ?? (previousPrice ? ((price - previousPrice) / previousPrice) * 100 : 0)

  const isPositive = actualChange > 0
  const isNegative = actualChange < 0
  const isNeutral = actualChange === 0

  // Flash animation on price change
  useEffect(() => {
    if (flashOnChange && prevPriceRef.current !== price) {
      if (price > prevPriceRef.current) {
        setFlash('up')
      } else if (price < prevPriceRef.current) {
        setFlash('down')
      }
      
      prevPriceRef.current = price
      
      const timer = setTimeout(() => setFlash(null), 1000)
      return () => clearTimeout(timer)
    }
  }, [price, flashOnChange])

  // Format price
  const formattedPrice = price.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

  // Format change
  const formattedChange = actualChange >= 0 
    ? `+${actualChange.toFixed(2)}` 
    : actualChange.toFixed(2)
  
  const formattedPercent = actualChangePercent >= 0
    ? `+${actualChangePercent.toFixed(2)}%`
    : `${actualChangePercent.toFixed(2)}%`

  // Color classes
  const changeColor = isPositive
    ? 'text-green-400'
    : isNegative
    ? 'text-red-400'
    : 'text-white/50'

  const flashBg = flash === 'up'
    ? 'bg-green-500/20'
    : flash === 'down'
    ? 'bg-red-500/20'
    : ''

  return (
    <div className={cn('flex items-center', config.gap, className)}>
      {/* Price with flash effect */}
      <motion.div
        className={cn(
          'relative rounded-md px-1 -mx-1 transition-colors duration-300',
          flashBg,
        )}
      >
        <span className={cn(config.price, 'text-white font-mono tabular-nums')}>
          {formattedPrice}
        </span>
        
        {/* Flash overlay */}
        <AnimatePresence>
          {flash && (
            <motion.div
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className={cn(
                'absolute inset-0 rounded-md',
                flash === 'up' ? 'bg-green-500/30' : 'bg-red-500/30',
              )}
            />
          )}
        </AnimatePresence>
      </motion.div>

      {/* Change indicator */}
      {(showChange || showPercent) && (
        <div className={cn('flex items-center', config.gap, changeColor)}>
          {/* Icon */}
          {showIcon && (
            <span className={cn(config.icon)}>
              {isPositive ? (
                <TrendingUp className="w-full h-full" />
              ) : isNegative ? (
                <TrendingDown className="w-full h-full" />
              ) : (
                <Minus className="w-full h-full" />
              )}
            </span>
          )}

          {/* Change values */}
          <span className={cn(config.change, 'font-mono tabular-nums')}>
            {showChange && formattedChange}
            {showChange && showPercent && ' '}
            {showPercent && `(${formattedPercent})`}
          </span>
        </div>
      )}
    </div>
  )
})

// ============================================================
// COMPACT VERSION
// ============================================================

export interface CompactPriceProps {
  price: number
  changePercent: number
  className?: string
}

export const CompactPrice = memo(function CompactPrice({
  price,
  changePercent,
  className,
}: CompactPriceProps) {
  const isPositive = changePercent > 0
  const isNegative = changePercent < 0

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span className="text-sm font-medium text-white font-mono tabular-nums">
        ${price.toFixed(2)}
      </span>
      <span
        className={cn(
          'text-xs font-medium font-mono tabular-nums px-1.5 py-0.5 rounded',
          isPositive && 'text-green-400 bg-green-500/10',
          isNegative && 'text-red-400 bg-red-500/10',
          !isPositive && !isNegative && 'text-white/50 bg-white/5',
        )}
      >
        {changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%
      </span>
    </div>
  )
})

// ============================================================
// MINI SPARKLINE
// ============================================================

export interface MiniSparklineProps {
  data: number[]
  width?: number
  height?: number
  className?: string
}

export const MiniSparkline = memo(function MiniSparkline({
  data,
  width = 80,
  height = 24,
  className,
}: MiniSparklineProps) {
  if (!data || data.length < 2) {
    return <div className={cn('bg-white/5 rounded', className)} style={{ width, height }} />
  }

  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1

  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width
    const y = height - ((value - min) / range) * height
    return `${x},${y}`
  }).join(' ')

  const isPositive = data[data.length - 1] >= data[0]
  const strokeColor = isPositive ? '#22c55e' : '#ef4444'

  return (
    <svg
      width={width}
      height={height}
      className={cn('overflow-visible', className)}
    >
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  )
})

export default RealTimePrice
