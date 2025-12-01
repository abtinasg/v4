'use client'

import { useEffect } from 'react'
import { 
  Coins, 
  History, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Zap,
  AlertCircle,
  ChevronRight
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCredits } from '@/lib/hooks/use-credits'
import { CREDIT_COSTS } from '@/lib/credits/config'

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
      <Card className={cn('animate-pulse', className)}>
        <CardHeader>
          <div className="h-6 bg-muted rounded w-32"></div>
        </CardHeader>
        <CardContent>
          <div className="h-12 bg-muted rounded w-24 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-16 bg-muted rounded"></div>
            <div className="h-16 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }
  
  const balance = credits?.balance || 0
  const todayUsage = credits?.stats.todayUsage || 0
  const monthUsage = credits?.stats.monthUsage || 0
  const tier = credits?.tier || 'free'
  
  // محاسبه درصد مصرف ماهانه
  const monthlyLimit = credits?.limits.monthlyCredits || 100
  const usagePercent = monthlyLimit > 0 ? (monthUsage / monthlyLimit) * 100 : 0
  
  return (
    <Card className={cn(
      'relative overflow-hidden',
      isLowBalance && 'border-red-500/50',
      className
    )}>
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn(
              'p-2 rounded-lg',
              isLowBalance ? 'bg-red-500/10' : 'bg-emerald-500/10'
            )}>
              <Coins className={cn(
                'w-5 h-5',
                isLowBalance ? 'text-red-500' : 'text-emerald-500'
              )} />
            </div>
            <div>
              <CardTitle className="text-lg">Credit Balance</CardTitle>
              <CardDescription className="capitalize">{tier} Plan</CardDescription>
            </div>
          </div>
          
          {isLowBalance && (
            <div className="flex items-center gap-1 text-red-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>Low Balance</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* موجودی اصلی */}
        <div className="flex items-baseline gap-2">
          <span className={cn(
            'text-4xl font-bold',
            isLowBalance ? 'text-red-500' : 'text-foreground'
          )}>
            {balance.toLocaleString()}
          </span>
          <span className="text-muted-foreground">credits</span>
        </div>
        
        {/* آمار مصرف */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Zap className="w-4 h-4" />
              <span>Today</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xl font-semibold">{todayUsage}</span>
              {todayUsage > 0 && <TrendingDown className="w-4 h-4 text-red-400" />}
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-muted/50">
            <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
              <Calendar className="w-4 h-4" />
              <span>This Month</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xl font-semibold">{monthUsage}</span>
              <span className="text-xs text-muted-foreground">/ {monthlyLimit}</span>
            </div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Monthly Usage</span>
            <span>{usagePercent.toFixed(0)}%</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={cn(
                'h-full rounded-full transition-all',
                usagePercent > 80 ? 'bg-red-500' : usagePercent > 50 ? 'bg-yellow-500' : 'bg-emerald-500'
              )}
              style={{ width: `${Math.min(usagePercent, 100)}%` }}
            />
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button 
            onClick={onBuyCredits}
            className="flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
          >
            <Coins className="w-4 h-4 mr-2" />
            Buy Credits
          </Button>
          <Button 
            variant="outline" 
            onClick={onViewHistory}
            className="flex-1"
          >
            <History className="w-4 h-4 mr-2" />
            History
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
