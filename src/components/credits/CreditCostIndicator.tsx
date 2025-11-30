'use client'

import { useState } from 'react'
import { Coins, AlertCircle, Check } from 'lucide-react'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useCredits } from '@/lib/hooks/use-credits'
import { CREDIT_COSTS, type CreditAction } from '@/lib/credits/config'

interface CreditCostIndicatorProps {
  action: CreditAction
  className?: string
  showTooltip?: boolean
  size?: 'sm' | 'md'
}

/**
 * نشان‌دهنده هزینه کردیت یک عملیات
 * می‌توان کنار دکمه‌ها قرار داد
 */
export function CreditCostIndicator({ 
  action, 
  className,
  showTooltip = true,
  size = 'md'
}: CreditCostIndicatorProps) {
  const { hasEnoughCredits, balance } = useCredits()
  const cost = CREDIT_COSTS[action]
  const canAfford = hasEnoughCredits(action)
  
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 gap-1',
    md: 'text-sm px-2 py-1 gap-1.5',
  }
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
  }
  
  const badge = (
    <div className={cn(
      'inline-flex items-center rounded-full font-medium',
      canAfford 
        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
        : 'bg-red-500/10 text-red-500 border border-red-500/20',
      sizeClasses[size],
      className
    )}>
      <Coins className={iconSizes[size]} />
      <span>{cost}</span>
    </div>
  )
  
  if (!showTooltip) {
    return badge
  }
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {badge}
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            {canAfford ? (
              <div className="flex items-center gap-1 text-emerald-500">
                <Check className="w-4 h-4" />
                <span>This action costs {cost} credits</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-red-500">
                <AlertCircle className="w-4 h-4" />
                <span>Not enough credits (need {cost}, have {balance})</span>
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

interface CreditGateProps {
  action: CreditAction
  children: React.ReactNode
  fallback?: React.ReactNode
  showCost?: boolean
}

/**
 * کامپوننت Gate که محتوا را بر اساس کردیت نمایش می‌دهد
 */
export function CreditGate({ 
  action, 
  children, 
  fallback,
  showCost = true
}: CreditGateProps) {
  const { hasEnoughCredits, loading } = useCredits()
  const canAfford = hasEnoughCredits(action)
  const cost = CREDIT_COSTS[action]
  
  if (loading) {
    return null
  }
  
  if (!canAfford) {
    return fallback || (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
        <AlertCircle className="w-4 h-4" />
        <span>Requires {cost} credits</span>
      </div>
    )
  }
  
  return (
    <div className="relative">
      {children}
      {showCost && (
        <div className="absolute top-2 right-2">
          <CreditCostIndicator action={action} size="sm" />
        </div>
      )}
    </div>
  )
}
