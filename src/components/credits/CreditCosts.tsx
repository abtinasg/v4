'use client'

import { 
  Coins, 
  Zap, 
  Search, 
  LineChart, 
  FileText,
  Bot,
  Calculator,
  GitCompare,
  Newspaper,
  MessageSquare
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CREDIT_COSTS, type CreditAction } from '@/lib/credits/config'
import { useCredits } from '@/lib/hooks/use-credits'

interface CreditCostsProps {
  className?: string
}

const actionIcons: Record<CreditAction, React.ReactNode> = {
  stock_search: <Search className="w-4 h-4" />,
  real_time_quote: <Zap className="w-4 h-4" />,
  technical_analysis: <LineChart className="w-4 h-4" />,
  financial_report: <FileText className="w-4 h-4" />,
  ai_analysis: <Bot className="w-4 h-4" />,
  dcf_valuation: <Calculator className="w-4 h-4" />,
  stock_comparison: <GitCompare className="w-4 h-4" />,
  news_fetch: <Newspaper className="w-4 h-4" />,
  watchlist_alert: <Zap className="w-4 h-4" />,
  portfolio_analysis: <LineChart className="w-4 h-4" />,
  chat_message: <MessageSquare className="w-4 h-4" />,
}

const actionLabels: Record<CreditAction, string> = {
  stock_search: 'Stock Search',
  real_time_quote: 'Real-time Quote',
  technical_analysis: 'Technical Analysis',
  financial_report: 'Financial Report',
  ai_analysis: 'AI Analysis',
  dcf_valuation: 'DCF Valuation',
  stock_comparison: 'Stock Comparison',
  news_fetch: 'News Fetch',
  watchlist_alert: 'Watchlist Alert',
  portfolio_analysis: 'Portfolio Analysis',
  chat_message: 'AI Chat Message',
}

const actionDescriptions: Record<CreditAction, string> = {
  stock_search: 'Search for stocks by symbol or name',
  real_time_quote: 'Get real-time price data',
  technical_analysis: 'Technical indicators and patterns',
  financial_report: 'Full financial statements',
  ai_analysis: 'AI-powered stock analysis',
  dcf_valuation: 'Discounted cash flow valuation',
  stock_comparison: 'Compare multiple stocks',
  news_fetch: 'Latest news and updates',
  watchlist_alert: 'Price alert notifications',
  portfolio_analysis: 'Full portfolio analysis',
  chat_message: 'Ask AI about stocks',
}

export function CreditCosts({ className }: CreditCostsProps) {
  const { hasEnoughCredits } = useCredits()
  
  // Group by cost
  const grouped = {
    low: Object.entries(CREDIT_COSTS).filter(([, cost]) => cost <= 3),
    medium: Object.entries(CREDIT_COSTS).filter(([, cost]) => cost > 3 && cost <= 10),
    high: Object.entries(CREDIT_COSTS).filter(([, cost]) => cost > 10),
  }
  
  const CostItem = ({ action, cost }: { action: CreditAction; cost: number }) => {
    const canAfford = hasEnoughCredits(action)
    
    return (
      <div className={cn(
        'flex items-center gap-4 p-4 rounded-xl transition-all duration-300',
        'bg-white/[0.02] hover:bg-white/[0.04]',
        'border',
        canAfford ? 'border-white/[0.04]' : 'border-rose-500/20 bg-rose-500/[0.02]'
      )}>
        <div className={cn(
          'w-10 h-10 rounded-xl flex items-center justify-center transition-colors',
          canAfford 
            ? 'bg-white/[0.06] text-white/50' 
            : 'bg-rose-500/10 text-rose-400'
        )}>
          {actionIcons[action]}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm text-white/80">{actionLabels[action]}</div>
          <div className="text-xs text-white/35 truncate mt-0.5">
            {actionDescriptions[action]}
          </div>
        </div>
        
        <div className={cn(
          'flex items-center gap-1.5 font-semibold text-sm',
          canAfford ? 'text-emerald-400' : 'text-rose-400'
        )}>
          <Coins className="w-3.5 h-3.5" />
          {cost}
        </div>
      </div>
    )
  }
  
  const CategorySection = ({ 
    title, 
    items, 
    color 
  }: { 
    title: string
    items: [string, number][]
    color: 'emerald' | 'amber' | 'violet'
  }) => {
    const colorClasses = {
      emerald: 'bg-emerald-400',
      amber: 'bg-amber-400',
      violet: 'bg-violet-400',
    }
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full', colorClasses[color])} />
          <h4 className="text-sm font-medium text-white/50">{title}</h4>
        </div>
        <div className="space-y-2">
          {items.map(([action, cost]) => (
            <CostItem key={action} action={action as CreditAction} cost={cost} />
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
        <div className="flex items-center gap-3 mb-2">
          <Coins className="w-5 h-5 text-emerald-400" />
          <h3 className="text-lg font-semibold text-white/90">Credit Costs</h3>
        </div>
        <p className="text-sm text-white/40">
          How many credits each action costs
        </p>
      </div>
      
      {/* Content */}
      <div className="px-8 pb-8 space-y-8">
        {grouped.low.length > 0 && (
          <CategorySection 
            title="Basic (1-3 credits)" 
            items={grouped.low} 
            color="emerald" 
          />
        )}
        
        {grouped.medium.length > 0 && (
          <CategorySection 
            title="Standard (5-10 credits)" 
            items={grouped.medium} 
            color="amber" 
          />
        )}
        
        {grouped.high.length > 0 && (
          <CategorySection 
            title="Premium (15+ credits)" 
            items={grouped.high} 
            color="violet" 
          />
        )}
      </div>
    </div>
  )
}
