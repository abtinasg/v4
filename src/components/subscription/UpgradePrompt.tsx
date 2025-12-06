'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Sparkles, Crown, Lock, ArrowRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useSubscription } from '@/lib/hooks/use-subscription'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface UpgradePromptProps {
  feature: string
  description?: string
  requiredPlan?: 'pro' | 'premium' | 'enterprise'
  open?: boolean
  onOpenChange?: (open: boolean) => void
  className?: string
}

export function UpgradePrompt({
  feature,
  description,
  requiredPlan = 'pro',
  open,
  onOpenChange,
  className,
}: UpgradePromptProps) {
  const { planName, isFree, isEligibleForTrial } = useSubscription()
  
  const planConfig = {
    pro: {
      name: 'Pro',
      price: 29,
      icon: Sparkles,
      color: 'blue',
    },
    premium: {
      name: 'Premium',
      price: 59,
      icon: Crown,
      color: 'purple',
    },
    enterprise: {
      name: 'Enterprise',
      price: 199,
      icon: Crown,
      color: 'amber',
    },
  }
  
  const config = planConfig[requiredPlan]
  const Icon = config.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-white/[0.1] bg-[#0A0D12]/95 backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-white font-light text-xl">
            <div className={cn(
              'p-2 rounded-xl',
              config.color === 'blue' && 'bg-blue-500/10',
              config.color === 'purple' && 'bg-purple-500/10',
              config.color === 'amber' && 'bg-amber-500/10',
            )}>
              <Lock className={cn(
                'w-5 h-5',
                config.color === 'blue' && 'text-blue-400',
                config.color === 'purple' && 'text-purple-400',
                config.color === 'amber' && 'text-amber-400',
              )} />
            </div>
            Upgrade Required
          </DialogTitle>
        </DialogHeader>

        <div className="py-4 space-y-4">
          <div className="p-4 bg-white/[0.02] rounded-xl border border-white/[0.06]">
            <p className="text-white/80 text-sm font-medium mb-1">{feature}</p>
            {description && (
              <p className="text-white/40 text-xs">{description}</p>
            )}
          </div>
          
          <p className="text-white/50 text-sm text-center">
            You are currently on the <span className="text-white">{planName}</span> plan.
            <br />
            Upgrade to <span className={cn(
              config.color === 'blue' && 'text-blue-400',
              config.color === 'purple' && 'text-purple-400',
              config.color === 'amber' && 'text-amber-400',
            )}>{config.name}</span> to unlock this feature.
          </p>

          <div className="space-y-2">
            {isFree && requiredPlan === 'pro' && isEligibleForTrial && (
              <Link
                href="/pricing"
                className={cn(
                  'w-full py-3 rounded-xl text-[14px] font-medium transition-all flex items-center justify-center gap-2',
                  'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-400 hover:to-purple-400 text-white',
                )}
              >
                <Icon className="w-4 h-4" />
                Start 14-Day Free Trial
                <ArrowRight className="w-4 h-4" />
              </Link>
            )}
            
            <Link
              href="/pricing"
              className={cn(
                'w-full py-3 rounded-xl text-[14px] font-medium transition-all flex items-center justify-center gap-2',
                isFree && requiredPlan === 'pro' && isEligibleForTrial
                  ? 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                  : 'bg-blue-500 hover:bg-blue-400 text-white',
              )}
            >
              View Plans & Pricing
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Inline upgrade banner for limited features
interface UpgradeBannerProps {
  feature: string
  requiredPlan?: 'pro' | 'premium' | 'enterprise'
  className?: string
  compact?: boolean
}

export function UpgradeBanner({
  feature,
  requiredPlan = 'pro',
  className,
  compact = false,
}: UpgradeBannerProps) {
  const { isEligibleForTrial } = useSubscription()
  
  if (compact) {
    return (
      <Link
        href="/pricing"
        className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-xl',
          'bg-gradient-to-r from-blue-500/10 to-purple-500/10',
          'border border-blue-500/20',
          'text-xs text-blue-400 hover:text-blue-300',
          'transition-all duration-200',
          className
        )}
      >
        <Lock className="w-3 h-3" />
        <span>Upgrade to unlock</span>
        <ArrowRight className="w-3 h-3" />
      </Link>
    )
  }

  return (
    <div className={cn(
      'p-4 rounded-xl',
      'bg-gradient-to-r from-blue-500/10 to-purple-500/10',
      'border border-blue-500/20',
      className
    )}>
      <div className="flex items-start gap-3">
        <div className="p-2 bg-blue-500/20 rounded-lg">
          <Lock className="w-4 h-4 text-blue-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-white/80 font-medium">{feature}</p>
          <p className="text-xs text-white/40 mt-0.5">
            {isEligibleForTrial 
              ? 'Start a free trial to unlock this feature'
              : `Upgrade to ${requiredPlan === 'pro' ? 'Pro' : requiredPlan === 'premium' ? 'Premium' : 'Enterprise'} to unlock`
            }
          </p>
        </div>
        <Link
          href="/pricing"
          className="px-3 py-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-xs text-blue-400 flex items-center gap-1 transition-colors"
        >
          {isEligibleForTrial ? 'Try Free' : 'Upgrade'}
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}

// Limit reached warning
interface LimitReachedProps {
  limitType: 'watchlist' | 'portfolio' | 'alert' | 'aiReport'
  current: number
  max: number
  className?: string
}

export function LimitReached({
  limitType,
  current,
  max,
  className,
}: LimitReachedProps) {
  const limitLabels = {
    watchlist: 'watchlist symbols',
    portfolio: 'portfolios',
    alert: 'alerts',
    aiReport: 'AI reports this month',
  }

  return (
    <div className={cn(
      'p-4 rounded-xl bg-amber-500/10 border border-amber-500/20',
      className
    )}>
      <div className="flex items-center gap-3">
        <div className="p-2 bg-amber-500/20 rounded-lg">
          <Sparkles className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-amber-300 font-medium">
            Limit Reached
          </p>
          <p className="text-xs text-amber-400/60 mt-0.5">
            You&apos;ve used {current} of {max} {limitLabels[limitType]}
          </p>
        </div>
        <Link
          href="/pricing"
          className="px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 rounded-lg text-xs text-amber-400 flex items-center gap-1 transition-colors"
        >
          Upgrade
          <ArrowRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  )
}
