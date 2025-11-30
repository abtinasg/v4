'use client'

import { useState } from 'react'
import { Coins, TrendingDown, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react'
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
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-3 py-1',
    lg: 'text-base px-4 py-1.5',
  }
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }
  
  if (loading) {
    return (
      <div className={cn(
        'inline-flex items-center gap-1.5 rounded-full bg-muted animate-pulse',
        sizeClasses[size],
        className
      )}>
        <Loader2 className={cn(iconSizes[size], 'animate-spin')} />
        <span>...</span>
      </div>
    )
  }
  
  const balance = credits?.balance || 0
  const todayChange = credits?.stats.todayUsage || 0
  
  return (
    <div className={cn(
      'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors',
      isLowBalance 
        ? 'bg-red-500/10 text-red-500 border border-red-500/20' 
        : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20',
      sizeClasses[size],
      className
    )}>
      {showIcon && (
        isLowBalance 
          ? <AlertTriangle className={iconSizes[size]} />
          : <Coins className={iconSizes[size]} />
      )}
      
      <span>{balance.toLocaleString()}</span>
      
      {showTrend && todayChange > 0 && (
        <span className="flex items-center gap-0.5 text-red-400">
          <TrendingDown className="w-3 h-3" />
          <span className="text-xs">-{todayChange}</span>
        </span>
      )}
    </div>
  )
}
