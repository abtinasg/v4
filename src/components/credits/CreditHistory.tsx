'use client'

import { useEffect, useState } from 'react'
import { 
  ArrowUpRight, 
  ArrowDownRight,
  Coins,
  Gift,
  RefreshCw,
  Settings,
  Loader2,
  ChevronDown
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCredits, type CreditTransaction } from '@/lib/hooks/use-credits'

interface CreditHistoryProps {
  limit?: number
  showLoadMore?: boolean
  className?: string
}

const transactionIcons: Record<string, React.ReactNode> = {
  purchase: <Coins className="w-4 h-4 text-emerald-500" />,
  usage: <ArrowDownRight className="w-4 h-4 text-red-400" />,
  refund: <RefreshCw className="w-4 h-4 text-blue-500" />,
  bonus: <Gift className="w-4 h-4 text-purple-500" />,
  monthly_reset: <RefreshCw className="w-4 h-4 text-emerald-500" />,
  admin_adjust: <Settings className="w-4 h-4 text-orange-500" />,
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
  const { history, fetchHistory, loading } = useCredits()
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  
  useEffect(() => {
    fetchHistory(limit, 0)
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
  
  if (loading && history.length === 0) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 animate-pulse">
                <div className="w-10 h-10 rounded-full bg-muted"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-32 mb-2"></div>
                  <div className="h-3 bg-muted rounded w-24"></div>
                </div>
                <div className="h-6 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <RefreshCw className="w-5 h-5" />
          Transaction History
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {history.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Coins className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No transactions yet</p>
          </div>
        ) : (
          <>
            {history.map((tx) => (
              <div 
                key={tx.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted/70 transition-colors"
              >
                {/* Icon */}
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center',
                  tx.amount >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'
                )}>
                  {transactionIcons[tx.type] || <Coins className="w-4 h-4" />}
                </div>
                
                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {tx.description || transactionLabels[tx.type] || tx.type}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <span>{formatDate(tx.createdAt)}</span>
                    {tx.action && (
                      <>
                        <span>•</span>
                        <span className="capitalize">{tx.action.replace('_', ' ')}</span>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Amount */}
                <div className={cn(
                  'font-bold text-right',
                  tx.amount >= 0 ? 'text-emerald-500' : 'text-red-400'
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
                className="w-full mt-2"
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
      </CardContent>
    </Card>
  )
}
