'use client'

import { Crown, Sparkles, Star, Zap, Timer, Loader2, Building2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSubscription } from '@/lib/hooks/use-subscription'
import type { PlanId } from '@/lib/subscriptions/plans'

interface SubscriptionBadgeProps {
  showIcon?: boolean
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showTrialDays?: boolean
}

// Plan configuration for badges
const PLAN_CONFIG: Record<PlanId, {
  label: string
  icon: React.ElementType
  bgClass: string
  textClass: string
  borderClass: string
  glowClass?: string
}> = {
  free: {
    label: 'Free',
    icon: Star,
    bgClass: 'bg-zinc-500/10',
    textClass: 'text-zinc-400',
    borderClass: 'border-zinc-500/20',
  },
  pro: {
    label: 'Pro',
    icon: Zap,
    bgClass: 'bg-blue-500/10',
    textClass: 'text-blue-400',
    borderClass: 'border-blue-500/30',
    glowClass: 'shadow-blue-500/10',
  },
  premium: {
    label: 'Premium',
    icon: Crown,
    bgClass: 'bg-purple-500/10',
    textClass: 'text-purple-400',
    borderClass: 'border-purple-500/30',
    glowClass: 'shadow-purple-500/10',
  },
  enterprise: {
    label: 'Enterprise',
    icon: Building2,
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-400',
    borderClass: 'border-amber-500/30',
    glowClass: 'shadow-amber-500/10',
  },
}

export function SubscriptionBadge({ 
  showIcon = true, 
  size = 'md',
  className,
  showTrialDays = true,
}: SubscriptionBadgeProps) {
  const { planId, isTrial, trialDaysRemaining, loading } = useSubscription()
  
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3 py-1.5 gap-2',
  }
  
  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
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
  
  const config = PLAN_CONFIG[planId]
  const Icon = config.icon
  
  // Trial badge (special styling)
  if (isTrial) {
    return (
      <div className={cn(
        'inline-flex items-center rounded-full font-medium transition-all duration-300',
        'backdrop-blur-sm',
        'bg-gradient-to-r from-blue-500/20 to-purple-500/20',
        'text-blue-300',
        'border border-blue-500/30',
        'shadow-sm shadow-blue-500/10',
        sizeClasses[size],
        className
      )}>
        {showIcon && <Timer className={iconSizes[size]} />}
        <span>Pro Trial</span>
        {showTrialDays && trialDaysRemaining > 0 && (
          <span className="text-blue-400/70 ml-0.5">
            {trialDaysRemaining}d
          </span>
        )}
      </div>
    )
  }
  
  return (
    <div className={cn(
      'inline-flex items-center rounded-full font-medium transition-all duration-300',
      'backdrop-blur-sm border',
      config.bgClass,
      config.textClass,
      config.borderClass,
      config.glowClass && `shadow-sm ${config.glowClass}`,
      sizeClasses[size],
      className
    )}>
      {showIcon && <Icon className={iconSizes[size]} />}
      <span>{config.label}</span>
    </div>
  )
}

// Inline badge for text (smaller, no icon)
export function SubscriptionBadgeInline({ className }: { className?: string }) {
  const { planName, isTrial } = useSubscription()
  
  return (
    <span className={cn(
      'text-xs font-medium px-1.5 py-0.5 rounded',
      isTrial 
        ? 'bg-blue-500/20 text-blue-400' 
        : 'bg-white/[0.06] text-white/60',
      className
    )}>
      {isTrial ? 'Trial' : planName}
    </span>
  )
}
