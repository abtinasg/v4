'use client'

import { useState } from 'react'
import { AlertTriangle, Coins, X, ArrowRight } from 'lucide-react'
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
  
  // نمایش نده اگر لودینگ، رد شده، یا موجودی کافی
  if (loading || dismissed || !isLowBalance) {
    return null
  }
  
  const balance = credits?.balance || 0
  
  return (
    <>
      <div className={cn(
        'relative flex items-center gap-3 p-4 rounded-lg bg-gradient-to-r from-red-500/10 via-orange-500/10 to-yellow-500/10 border border-red-500/20',
        className
      )}>
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-500" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-red-500">Low Credit Balance!</h4>
          <p className="text-sm text-muted-foreground">
            You have only <span className="font-bold text-red-400">{balance}</span> credits remaining. 
            Buy more to continue using premium features.
          </p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button 
            size="sm"
            onClick={() => setModalOpen(true)}
            className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
          >
            <Coins className="w-4 h-4 mr-1" />
            Buy Credits
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
          
          {dismissible && (
            <Button 
              size="icon" 
              variant="ghost" 
              onClick={() => setDismissed(true)}
              className="w-8 h-8 text-muted-foreground hover:text-foreground"
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
