'use client'

/**
 * Insufficient Credits Alert
 * Shows a beautiful alert when user doesn't have enough credits
 */

import { AlertTriangle, CreditCard, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import type { CreditErrorDetails } from '@/lib/hooks/use-credit-error'

interface InsufficientCreditsAlertProps {
  details: CreditErrorDetails
  onClose?: () => void
  className?: string
}

export function InsufficientCreditsAlert({ 
  details, 
  onClose,
  className = '' 
}: InsufficientCreditsAlertProps) {
  const actionLabels: Record<string, string> = {
    stock_search: 'Stock Search',
    real_time_quote: 'Real-time Quote',
    technical_analysis: 'Technical Analysis',
    financial_report: 'Financial Report',
    ai_analysis: 'AI Analysis',
    dcf_valuation: 'DCF Valuation',
    stock_comparison: 'Stock Comparison',
    portfolio_analysis: 'Portfolio Analysis',
    news_fetch: 'News Fetch',
    watchlist_alert: 'Watchlist Alert',
    chat_message: 'Chat Message',
  }

  const actionLabel = details.action 
    ? actionLabels[details.action] || details.action 
    : 'this action'

  return (
    <Card className={`border-amber-500/50 bg-amber-500/5 ${className}`}>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-amber-600">
          <AlertTriangle className="h-5 w-5" />
          Insufficient Credits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          {actionLabel} requires{' '}
          <span className="font-semibold text-foreground">
            {details.requiredCredits} credits
          </span>
          , but your balance is{' '}
          <span className="font-semibold text-foreground">
            {details.currentBalance} credits
          </span>
          .
        </p>
        
        <div className="flex items-center justify-between rounded-lg bg-background/50 p-3">
          <div className="text-sm">
            <div className="text-muted-foreground">Credits Shortfall</div>
            <div className="text-lg font-bold text-red-500">
              {details.shortfall} credits
            </div>
          </div>
          <Sparkles className="h-8 w-8 text-amber-500/50" />
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button asChild className="flex-1">
          <Link href="/pricing">
            <CreditCard className="mr-2 h-4 w-4" />
            Buy Credits
          </Link>
        </Button>
        {onClose && (
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

/**
 * Inline insufficient credits message
 * Use this for smaller inline alerts
 */
export function InsufficientCreditsInline({ 
  details,
  className = '' 
}: { 
  details: CreditErrorDetails
  className?: string 
}) {
  return (
    <div className={`flex items-center gap-2 rounded-lg border border-amber-500/50 bg-amber-500/10 p-3 text-sm ${className}`}>
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <span className="text-amber-700 dark:text-amber-400">
        Insufficient credits. Required: {details.requiredCredits}, Balance: {details.currentBalance}
      </span>
      <Link 
        href="/pricing" 
        className="ml-auto text-xs font-medium text-amber-600 hover:underline"
      >
        Buy Credits
      </Link>
    </div>
  )
}
