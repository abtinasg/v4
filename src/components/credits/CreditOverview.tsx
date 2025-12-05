'use client'

import { useEffect } from 'react'
import { 
  History, 
  TrendingDown,
  Calendar,
  Zap,
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCredits } from '@/lib/hooks/use-credits'

interface CreditOverviewProps {
  onBuyCredits?: () => void
  onViewHistory?: () => void
  className?: string
}

export function CreditOverview({ 
  onBuyCredits, 
  onViewHistory,
  className 
}: CreditOverviewProps) {
  const { credits, loading, isLowBalance, fetchCredits } = useCredits()
  
  // Refetch on mount to ensure fresh data
  useEffect(() => {
    fetchCredits()
  }, [fetchCredits])
  
  if (loading || !credits) {
    return (
      <div className={cn(
        'relative rounded-2xl overflow-hidden',
        'bg-gradient-to-br from-white/[0.03] to-white/[0.01]',
        'backdrop-blur-xl border border-white/[0.06]',
        'shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
        'p-8',
        className
      )}>
        <div className="space-y-8 animate-pulse">
          <div className="h-5 bg-white/[0.06] rounded-lg w-32" />
          <div className="h-14 bg-white/[0.06] rounded-xl w-40" />
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-white/[0.04] rounded-xl" />
            <div className="h-24 bg-white/[0.04] rounded-xl" />
          </div>
        </div>
      </div>
    )
  }
  
  const balance = credits?.balance ?? 0
  const todayUsage = credits?.stats?.todayUsage ?? 0
  const monthUsage = credits?.stats?.monthUsage ?? 0
  
  return (
    <div className={cn(
      'relative rounded-2xl overflow-hidden',
      'bg-gradient-to-br from-white/[0.04] to-white/[0.01]',
      'backdrop-blur-xl',
      'border',
      isLowBalance ? 'border-rose-500/20' : 'border-white/[0.06]',
      'shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
      className
    )}>
      {/* Subtle Gradient Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.03] via-transparent to-cyan-500/[0.02] pointer-events-none" />
      
      {/* Content Container with Premium Spacing */}
      <div className="relative p-8 space-y-8">
        
        {/* Header Section */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-white/40 uppercase tracking-wider">
              Credit Balance
            </p>
          </div>
          
          {isLowBalance && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20">
              <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-xs font-medium text-rose-400">Low Balance</span>
            </div>
          )}
        </div>
        
        {/* Main Balance Display */}
        <div className="space-y-1">
          <div className="flex items-baseline gap-3">
            <span className={cn(
              'text-5xl font-semibold tracking-tight',
              isLowBalance ? 'text-rose-400' : 'text-white/95'
            )}>
              {balance.toLocaleString()}
            </span>
            <span className="text-lg font-normal text-white/30">credits</span>
          </div>
        </div>
        
        {/* Usage Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {/* Today's Usage */}
          <div className={cn(
            'relative p-5 rounded-xl overflow-hidden',
            'bg-white/[0.02]',
            'border border-white/[0.04]',
            'transition-all duration-300 hover:bg-white/[0.03]'
          )}>
            <div className="flex items-center gap-2 mb-3">
              <Zap className="w-4 h-4 text-white/30" />
              <span className="text-sm font-medium text-white/40">Today</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-white/90">{todayUsage}</span>
              {todayUsage > 0 && (
                <TrendingDown className="w-4 h-4 text-rose-400/70" />
              )}
            </div>
          </div>
          
          {/* This Month Usage */}
          <div className={cn(
            'relative p-5 rounded-xl overflow-hidden',
            'bg-white/[0.02]',
            'border border-white/[0.04]',
            'transition-all duration-300 hover:bg-white/[0.03]'
          )}>
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-white/30" />
              <span className="text-sm font-medium text-white/40">This Month</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-white/90">{monthUsage.toLocaleString()}</span>
              <span className="text-sm text-white/25">used</span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button 
            onClick={onBuyCredits}
            className={cn(
              'flex-1 h-12 rounded-xl font-medium',
              'bg-gradient-to-r from-emerald-500 to-teal-500',
              'hover:from-emerald-400 hover:to-teal-400',
              'shadow-[0_4px_16px_rgba(16,185,129,0.25)]',
              'hover:shadow-[0_6px_20px_rgba(16,185,129,0.35)]',
              'transition-all duration-300',
              'border-0'
            )}
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Buy Credits
          </Button>
          <Button 
            variant="ghost"
            onClick={onViewHistory}
            className={cn(
              'flex-1 h-12 rounded-xl font-medium',
              'bg-white/[0.04] hover:bg-white/[0.08]',
              'border border-white/[0.06]',
              'text-white/70 hover:text-white/90',
              'backdrop-blur-sm',
              'transition-all duration-300'
            )}
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
        </div>
      </div>
    </div>
  )
}
