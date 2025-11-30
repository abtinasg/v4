'use client'

import { useState } from 'react'
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
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
  const { balance, hasEnoughCredits } = useCredits()
  
  // گروه‌بندی بر اساس هزینه
  const grouped = {
    low: Object.entries(CREDIT_COSTS).filter(([_, cost]) => cost <= 3),
    medium: Object.entries(CREDIT_COSTS).filter(([_, cost]) => cost > 3 && cost <= 10),
    high: Object.entries(CREDIT_COSTS).filter(([_, cost]) => cost > 10),
  }
  
  const CostItem = ({ action, cost }: { action: CreditAction; cost: number }) => {
    const canAfford = hasEnoughCredits(action)
    
    return (
      <div className={cn(
        'flex items-center gap-3 p-3 rounded-lg transition-colors',
        canAfford ? 'bg-muted/50 hover:bg-muted/70' : 'bg-red-500/5 border border-red-500/20'
      )}>
        <div className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center',
          canAfford ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'
        )}>
          {actionIcons[action]}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm">{actionLabels[action]}</div>
          <div className="text-xs text-muted-foreground truncate">
            {actionDescriptions[action]}
          </div>
        </div>
        
        <div className={cn(
          'flex items-center gap-1 font-bold',
          canAfford ? 'text-emerald-500' : 'text-red-500'
        )}>
          <Coins className="w-3 h-3" />
          {cost}
        </div>
      </div>
    )
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-emerald-500" />
          Credit Costs
        </CardTitle>
        <CardDescription>
          How many credits each action costs
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Low Cost */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            Basic (1-3 credits)
          </h4>
          <div className="space-y-2">
            {grouped.low.map(([action, cost]) => (
              <CostItem key={action} action={action as CreditAction} cost={cost} />
            ))}
          </div>
        </div>
        
        {/* Medium Cost */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
            Standard (5-10 credits)
          </h4>
          <div className="space-y-2">
            {grouped.medium.map(([action, cost]) => (
              <CostItem key={action} action={action as CreditAction} cost={cost} />
            ))}
          </div>
        </div>
        
        {/* High Cost */}
        <div>
          <h4 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
            Premium (15+ credits)
          </h4>
          <div className="space-y-2">
            {grouped.high.map(([action, cost]) => (
              <CostItem key={action} action={action as CreditAction} cost={cost} />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
