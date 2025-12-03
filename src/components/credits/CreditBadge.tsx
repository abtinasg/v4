'use client'

import { Coins, TrendingDown, AlertTriangle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCredits } from '@/lib/hooks/use-credits'

interface CreditBadgeProps {
  showIcon?: boolean
  showTrend?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function CreditBadge({ 
  showIcon = true, 
  showTrend = false,
  size = 'md',
  className 
}: CreditBadgeProps) {
  const { credits, loading, isLowBalance } = useCredits()
  
  const sizeClasses = {
    sm: 'text-xs px-2.5 py-1 gap-1.5',
    md: 'text-sm px-3.5 py-1.5 gap-2',
    lg: 'text-base px-4 py-2 gap-2',
  }
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }
  
  if (loading) {
    return (
      <div className={cn(
        'inline-flex items-center rounded-full',
        'bg-white/[0.04] border border-white/[0.06]',
        'backdrop-blur-sm',
        sizeClasses[size],
        className
      )}>
        <Loader2 className={cn(iconSizes[size], 'animate-spin text-white/30')} />
        <span className="text-white/30">...</span>
      </div>
    )
  }
  
  const balance = credits?.balance ?? 0
  const todayChange = credits?.stats?.todayUsage ?? 0
  
  return (
    <div className={cn(
      'inline-flex items-center rounded-full font-medium transition-all duration-300',
      'backdrop-blur-sm',
      isLowBalance 
        ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
      sizeClasses[size],
      className
    )}>
      {showIcon && (
        isLowBalance 
          ? <AlertTriangle className={iconSizes[size]} />
          : <Coins className={iconSizes[size]} />
      )}
      
      <span className="tabular-nums">{balance.toLocaleString()}</span>
      
      {showTrend && todayChange > 0 && (
        <span className="flex items-center gap-0.5 text-rose-400/70 ml-0.5">
          <TrendingDown className="w-3 h-3" />
          <span className="text-xs">-{todayChange}</span>
        </span>
      )}
    </div>
  )
}
