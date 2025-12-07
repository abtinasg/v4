'use client'

import { useState } from 'react'
import { 
  Coins, 
  AlertTriangle,
  Package,
  Clock,
  Receipt
} from 'lucide-react'
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { CreditOverview } from './CreditOverview'
import { CreditPackages } from './CreditPackages'
import { CreditHistory } from './CreditHistory'
import { CreditCosts } from './CreditCosts'
import { cn } from '@/lib/utils'
import { useCredits } from '@/lib/hooks/use-credits'

interface CreditModalProps {
  trigger?: React.ReactNode
  defaultTab?: 'overview' | 'packages' | 'history' | 'costs'
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function CreditModal({ 
  trigger, 
  defaultTab = 'overview',
  open,
  onOpenChange
}: CreditModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState(defaultTab)
  const { isLowBalance } = useCredits()
  
  const isOpen = open ?? internalOpen
  const setIsOpen = onOpenChange ?? setInternalOpen
  
  const tabs = [
    { id: 'overview', label: 'Overview', icon: Coins },
    { id: 'packages', label: 'Buy Credits', icon: Package },
    { id: 'history', label: 'History', icon: Clock },
    { id: 'costs', label: 'Pricing', icon: Receipt },
  ] as const
  
  const defaultTrigger = (
    <Button 
      variant="ghost" 
      size="sm" 
      className={cn(
        'gap-2 rounded-full px-4',
        'bg-white/[0.04] hover:bg-white/[0.08]',
        'border border-white/[0.06]',
        'transition-all duration-300'
      )}
    >
      <Coins className={cn(
        'w-4 h-4',
        isLowBalance ? 'text-rose-400' : 'text-emerald-400'
      )} />
      <span className="text-white/70">Credits</span>
      {isLowBalance && <AlertTriangle className="w-3 h-3 text-rose-400" />}
    </Button>
  )
  
  // If controlled mode (open prop is provided), don't render trigger
  const isControlled = open !== undefined
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {!isControlled && (
        <DialogTrigger asChild>
          {trigger || defaultTrigger}
        </DialogTrigger>
      )}
      
      <DialogContent className={cn(
        'max-w-4xl max-h-[90vh] overflow-hidden flex flex-col',
        'bg-gradient-to-br from-[#0a0d14] to-[#080a10]',
        'border border-white/[0.06]',
        'shadow-[0_24px_80px_rgba(0,0,0,0.5)]',
        'backdrop-blur-xl',
        'rounded-2xl',
        'p-0'
      )}>
        {/* Header */}
        <div className="px-8 pt-8 pb-0">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-3 text-xl font-semibold text-white/95">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/20">
                <Coins className="w-5 h-5 text-emerald-400" />
              </div>
              Credit Management
            </DialogTitle>
            <DialogDescription className="text-white/40 text-sm">
              Manage your credits, view transaction history, and purchase more
            </DialogDescription>
          </DialogHeader>
        </div>
        
        {/* Tab Navigation */}
        <div className="px-8 pt-6">
          <div className="flex gap-1 p-1 bg-white/[0.03] rounded-xl border border-white/[0.04]">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg',
                    'text-sm font-medium transition-all duration-300',
                    activeTab === tab.id
                      ? 'bg-white/[0.08] text-white/95 shadow-sm'
                      : 'text-white/40 hover:text-white/60 hover:bg-white/[0.02]'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
        
        {/* Content Area */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className={cn(
            'transition-all duration-300',
            activeTab === 'overview' ? 'block' : 'hidden'
          )}>
            <CreditOverview 
              onBuyCredits={() => setActiveTab('packages')}
              onViewHistory={() => setActiveTab('history')}
            />
          </div>
          
          <div className={cn(
            'transition-all duration-300',
            activeTab === 'packages' ? 'block' : 'hidden'
          )}>
            <CreditPackages onPurchase={() => setActiveTab('overview')} />
          </div>
          
          <div className={cn(
            'transition-all duration-300',
            activeTab === 'history' ? 'block' : 'hidden'
          )}>
            <CreditHistory limit={20} />
          </div>
          
          <div className={cn(
            'transition-all duration-300',
            activeTab === 'costs' ? 'block' : 'hidden'
          )}>
            <CreditCosts />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
