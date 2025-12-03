'use client'

import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassCard, PulsingDot } from '@/components/ui/cinematic'
import { useHaptic } from '@/lib/hooks'

interface MarketIndexCardProps {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  sparklineData?: number[]
  index?: number
}

export function MarketIndexCard({
  symbol,
  name,
  price,
  change,
  changePercent,
  sparklineData = [],
  index = 0,
}: MarketIndexCardProps) {
  const { triggerHaptic } = useHaptic()
  const isPositive = changePercent >= 0

  const handleClick = () => {
    triggerHaptic('light')
    window.location.href = `/dashboard/stock-analysis/${symbol}`
  }
  
  // Generate sparkline path
  const generateSparklinePath = (data: number[]) => {
    if (data.length < 2) return ''
    const width = 80
    const height = 32
    const min = Math.min(...data)
    const max = Math.max(...data)
    const range = max - min || 1
    
    const points = data.map((value, i) => {
      const x = (i / (data.length - 1)) * width
      const y = height - ((value - min) / range) * height
      return `${x},${y}`
    })
    
    return `M ${points.join(' L ')}`
  }

  const sparklinePath = generateSparklinePath(
    sparklineData.length > 0 ? sparklineData : Array.from({ length: 20 }, () => price * (0.98 + Math.random() * 0.04))
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ 
        duration: 0.5, 
        delay: index * 0.1,
        ease: [0.22, 1, 0.36, 1]
      }}
    >
      <GlassCard 
        hover
        onClick={handleClick}
        className={cn(
          'relative p-2.5 sm:p-3 md:p-4 h-[85px] sm:h-[95px] md:h-[110px] overflow-hidden group cursor-pointer',
          'transition-all duration-300 rounded-lg sm:rounded-xl',
          'hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(0,212,255,0.1)]'
        )}
      >
        {/* Ambient glow based on performance */}
        <div className={cn(
          'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500',
          isPositive 
            ? 'bg-gradient-to-br from-emerald-500/10 via-transparent to-transparent' 
            : 'bg-gradient-to-br from-red-500/10 via-transparent to-transparent'
        )} />
        
        {/* Top row: Name + LIVE indicator */}
        <div className="relative flex items-center justify-between mb-1 sm:mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              {name}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <PulsingDot color="green" size="sm" />
            <span className="text-[8px] sm:text-[9px] font-bold uppercase tracking-widest text-emerald-400/80">
              LIVE
            </span>
          </div>
        </div>

        {/* Price */}
        <div className="relative flex items-end justify-between">
          <div>
            <p className="text-xl font-bold text-white tabular-nums tracking-tight">
              {symbol === '^VIX' || symbol === 'VIX' 
                ? price.toFixed(2)
                : price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })
              }
            </p>
            
            {/* Change */}
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-1.5">
              <span className={cn(
                'flex items-center gap-0.5 text-[10px] sm:text-xs font-semibold',
                isPositive ? 'text-emerald-400' : 'text-red-400'
              )}>
                {isPositive ? (
                  <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                )}
                {isPositive ? '+' : ''}{change.toFixed(2)}
              </span>
              <span className={cn(
                'text-[9px] sm:text-[10px] font-bold px-1 sm:px-1.5 py-0.5 rounded',
                isPositive 
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                  : 'bg-red-500/15 text-red-400 border border-red-500/20'
              )}>
                {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Sparkline */}
          <div className="absolute right-0 bottom-0 opacity-60 group-hover:opacity-100 transition-opacity">
            <svg width="80" height="32" className="overflow-visible">
              <defs>
                <linearGradient id={`sparkline-gradient-${symbol}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={isPositive ? '#22c55e' : '#ef4444'} stopOpacity="0" />
                </linearGradient>
                <filter id={`glow-${symbol}`}>
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <path
                d={sparklinePath}
                fill="none"
                stroke={isPositive ? '#22c55e' : '#ef4444'}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                filter={`url(#glow-${symbol})`}
                className="transition-all duration-300"
              />
            </svg>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
