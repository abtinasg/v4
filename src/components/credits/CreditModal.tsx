'use client'

import { useState } from 'react'
import { 
  X, 
  Coins, 
  AlertTriangle
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  
  const defaultTrigger = (
    <Button variant="outline" size="sm" className="gap-2">
      <Coins className={cn(
        'w-4 h-4',
        isLowBalance ? 'text-red-500' : 'text-emerald-500'
      )} />
      Credits
      {isLowBalance && <AlertTriangle className="w-3 h-3 text-red-500" />}
    </Button>
  )
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="w-6 h-6 text-emerald-500" />
            Credit Management
          </DialogTitle>
          <DialogDescription>
            Manage your credits, view history, and purchase more
          </DialogDescription>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="packages">Buy Credits</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="costs">Pricing</TabsTrigger>
          </TabsList>
          
          <div className="flex-1 overflow-y-auto mt-4">
            <TabsContent value="overview" className="m-0">
              <CreditOverview 
                onBuyCredits={() => setActiveTab('packages')}
                onViewHistory={() => setActiveTab('history')}
              />
            </TabsContent>
            
            <TabsContent value="packages" className="m-0">
              <CreditPackages onPurchase={() => setActiveTab('overview')} />
            </TabsContent>
            
            <TabsContent value="history" className="m-0">
              <CreditHistory limit={20} />
            </TabsContent>
            
            <TabsContent value="costs" className="m-0">
              <CreditCosts />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
