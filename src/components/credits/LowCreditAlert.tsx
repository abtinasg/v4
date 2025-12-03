'use client'

import { useState } from 'react'
import { AlertTriangle, Sparkles, X, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCredits } from '@/lib/hooks/use-credits'
import { CreditModal } from './CreditModal'

interface LowCreditAlertProps {
  className?: string
  dismissible?: boolean
}

export function LowCreditAlert({ className, dismissible = true }: LowCreditAlertProps) {
  const [dismissed, setDismissed] = useState(false)
  const { credits, isLowBalance, loading } = useCredits()
  const [modalOpen, setModalOpen] = useState(false)
  
  // Don't show if loading, dismissed, or has enough balance
  if (loading || dismissed || !isLowBalance) {
    return null
  }
  
  const balance = credits?.balance ?? 0
  
  return (
    <>
      <div className={cn(
        'relative flex items-center gap-4 p-5 rounded-2xl overflow-hidden',
        'bg-gradient-to-r from-rose-500/[0.08] via-orange-500/[0.06] to-amber-500/[0.04]',
        'border border-rose-500/20',
        'backdrop-blur-xl',
        className
      )}>
        {/* Subtle glow */}
        <div className="absolute inset-0 bg-gradient-to-r from-rose-500/[0.03] to-transparent pointer-events-none" />
        
        {/* Icon */}
        <div className="relative flex-shrink-0 w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-rose-400" />
        </div>
        
        {/* Content */}
        <div className="relative flex-1 min-w-0">
          <h4 className="font-semibold text-rose-400 text-sm">Low Credit Balance</h4>
          <p className="text-sm text-white/50 mt-0.5">
            You have <span className="font-semibold text-rose-400">{balance}</span> credits remaining. 
            Purchase more to continue using premium features.
          </p>
        </div>
        
        {/* Actions */}
        <div className="relative flex items-center gap-2 flex-shrink-0">
          <Button 
            size="sm"
            onClick={() => setModalOpen(true)}
            className={cn(
              'h-10 px-4 rounded-xl font-medium',
              'bg-gradient-to-r from-rose-500 to-orange-500',
              'hover:from-rose-400 hover:to-orange-400',
              'shadow-[0_4px_16px_rgba(244,63,94,0.25)]',
              'hover:shadow-[0_6px_20px_rgba(244,63,94,0.35)]',
              'transition-all duration-300',
              'border-0'
            )}
          >
            <Sparkles className="w-4 h-4 mr-1.5" />
            Buy Credits
            <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
          
          {dismissible && (
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => setDismissed(true)}
              className={cn(
                'w-10 h-10 rounded-xl',
                'text-white/30 hover:text-white/60',
                'hover:bg-white/[0.04]',
                'transition-all duration-300'
              )}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
      
      {/* Credit Modal */}
      <CreditModal 
        open={modalOpen} 
        onOpenChange={setModalOpen}
        defaultTab="packages"
      />
    </>
  )
}
