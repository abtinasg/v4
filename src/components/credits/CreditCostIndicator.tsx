'use client'

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
 * Credit cost indicator for actions
 * Can be placed next to buttons
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
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
  }
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
  }
  
  const badge = (
    <div className={cn(
      'inline-flex items-center rounded-full font-medium transition-all duration-300',
      'backdrop-blur-sm',
      canAfford 
        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
      sizeClasses[size],
      className
    )}>
      <Coins className={iconSizes[size]} />
      <span className="tabular-nums">{cost}</span>
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
        <TooltipContent 
          className={cn(
            'bg-[#0c1017]/95 backdrop-blur-xl',
            'border border-white/[0.08]',
            'shadow-[0_8px_32px_rgba(0,0,0,0.3)]',
            'rounded-xl px-3 py-2'
          )}
        >
          <div className="text-sm">
            {canAfford ? (
              <div className="flex items-center gap-1.5 text-emerald-400">
                <Check className="w-4 h-4" />
                <span>This action costs {cost} credits</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-rose-400">
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
 * Gate component that shows content based on credit availability
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
      <div className={cn(
        'flex items-center gap-2.5 p-4 rounded-xl text-sm',
        'bg-rose-500/[0.06] border border-rose-500/20',
        'text-rose-400'
      )}>
        <AlertCircle className="w-4 h-4" />
        <span>Requires {cost} credits</span>
      </div>
    )
  }
  
  return (
    <div className="relative">
      {children}
      {showCost && (
        <div className="absolute top-3 right-3">
          <CreditCostIndicator action={action} size="sm" />
        </div>
      )}
    </div>
  )
}
