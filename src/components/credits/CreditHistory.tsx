'use client'

import { useEffect, useState } from 'react'
import { 
  ArrowDownRight,
  Coins,
  Gift,
  RefreshCw,
  Settings,
  Loader2,
  ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCredits } from '@/lib/hooks/use-credits'

interface CreditHistoryProps {
  limit?: number
  showLoadMore?: boolean
  className?: string
}

const transactionIcons: Record<string, React.ReactNode> = {
  purchase: <Coins className="w-4 h-4 text-emerald-400" />,
  usage: <ArrowDownRight className="w-4 h-4 text-rose-400" />,
  refund: <RefreshCw className="w-4 h-4 text-cyan-400" />,
  bonus: <Gift className="w-4 h-4 text-violet-400" />,
  monthly_reset: <RefreshCw className="w-4 h-4 text-emerald-400" />,
  admin_adjust: <Settings className="w-4 h-4 text-amber-400" />,
}

const transactionLabels: Record<string, string> = {
  purchase: 'Credit Purchase',
  usage: 'Credit Used',
  refund: 'Credit Refund',
  bonus: 'Bonus Credits',
  monthly_reset: 'Monthly Reset',
  admin_adjust: 'Admin Adjustment',
}

export function CreditHistory({ 
  limit = 10, 
  showLoadMore = true,
  className 
}: CreditHistoryProps) {
  const { history, fetchHistory } = useCredits()
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  
  useEffect(() => {
    const load = async () => {
      setIsLoading(true)
      await fetchHistory(limit, 0)
      setIsLoading(false)
    }
    load()
  }, [fetchHistory, limit])
  
  const loadMore = async () => {
    setIsLoadingMore(true)
    const more = await fetchHistory(limit, history.length)
    setHasMore(more)
    setIsLoadingMore(false)
  }
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }
  
  if (isLoading && history.length === 0) {
    return (
      <div className={cn(
        'relative rounded-2xl overflow-hidden',
        'bg-gradient-to-br from-white/[0.03] to-white/[0.01]',
        'backdrop-blur-xl border border-white/[0.06]',
        'p-8',
        className
      )}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-5 h-5 bg-white/[0.06] rounded animate-pulse" />
          <div className="h-5 bg-white/[0.06] rounded-lg w-40 animate-pulse" />
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] animate-pulse">
              <div className="w-10 h-10 rounded-full bg-white/[0.06]" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-white/[0.06] rounded w-32" />
                <div className="h-3 bg-white/[0.04] rounded w-24" />
              </div>
              <div className="h-5 bg-white/[0.06] rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    )
  }
  
  return (
    <div className={cn(
      'relative rounded-2xl overflow-hidden',
      'bg-gradient-to-br from-white/[0.03] to-white/[0.01]',
      'backdrop-blur-xl border border-white/[0.06]',
      'shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
      className
    )}>
      {/* Header */}
      <div className="px-8 pt-8 pb-6">
        <div className="flex items-center gap-3">
          <RefreshCw className="w-5 h-5 text-white/40" />
          <h3 className="text-lg font-semibold text-white/90">Transaction History</h3>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-8 pb-8 space-y-2">
        {history.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/[0.03] flex items-center justify-center">
              <Coins className="w-8 h-8 text-white/20" />
            </div>
            <p className="text-white/40 text-sm">No transactions yet</p>
          </div>
        ) : (
          <>
            {history.map((tx) => (
              <div 
                key={tx.id}
                className={cn(
                  'flex items-center gap-4 p-4 rounded-xl',
                  'bg-white/[0.02] hover:bg-white/[0.04]',
                  'border border-transparent hover:border-white/[0.04]',
                  'transition-all duration-300',
                  'group'
                )}
              >
                {/* Icon */}
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center',
                  'transition-all duration-300',
                  tx.amount >= 0 
                    ? 'bg-emerald-500/10 group-hover:bg-emerald-500/15' 
                    : 'bg-rose-500/10 group-hover:bg-rose-500/15'
                )}>
                  {transactionIcons[tx.type] || <Coins className="w-4 h-4 text-white/40" />}
                </div>
                
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white/85 truncate text-sm">
                    {tx.description || transactionLabels[tx.type] || tx.type}
                  </div>
                  <div className="text-xs text-white/35 flex items-center gap-2 mt-0.5">
                    <span>{formatDate(tx.createdAt)}</span>
                    {tx.action && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="capitalize">{tx.action.replace('_', ' ')}</span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Amount */}
                <div className={cn(
                  'font-semibold text-right tabular-nums',
                  tx.amount >= 0 ? 'text-emerald-400' : 'text-rose-400'
                )}>
                  {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString()}
                </div>
              </div>
            ))}
            
            {/* Load More Button */}
            {showLoadMore && hasMore && (
              <Button 
                variant="ghost"
                onClick={loadMore}
                disabled={isLoadingMore}
                className={cn(
                  'w-full mt-4 h-12 rounded-xl',
                  'bg-white/[0.02] hover:bg-white/[0.04]',
                  'border border-white/[0.04]',
                  'text-white/50 hover:text-white/70',
                  'transition-all duration-300'
                )}
              >
                {isLoadingMore ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4 mr-2" />
                    Load More
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  )
}
