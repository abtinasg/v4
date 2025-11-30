'use client'

import { useState } from 'react'
import { 
  Check, 
  Sparkles, 
  Coins, 
  Loader2,
  Gift,
  Zap
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCredits, type CreditPackage } from '@/lib/hooks/use-credits'

interface CreditPackagesProps {
  onPurchase?: (pkg: CreditPackage) => void
  className?: string
}

export function CreditPackages({ onPurchase, className }: CreditPackagesProps) {
  const { packages, purchaseCredits, loading } = useCredits()
  const [purchasingId, setPurchasingId] = useState<string | null>(null)
  
  const handlePurchase = async (pkg: CreditPackage) => {
    setPurchasingId(pkg.id)
    try {
      const result = await purchaseCredits(pkg.id)
      if (result.success) {
        onPurchase?.(pkg)
      } else {
        alert(result.error || 'Purchase failed')
      }
    } finally {
      setPurchasingId(null)
    }
  }
  
  if (loading) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-muted rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-12 bg-muted rounded w-32 mb-4"></div>
              <div className="h-4 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }
  
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4', className)}>
      {packages.map((pkg) => (
        <Card 
          key={pkg.id} 
          className={cn(
            'relative overflow-hidden transition-all hover:shadow-lg',
            pkg.isPopular && 'border-emerald-500 shadow-emerald-500/10'
          )}
        >
          {/* Popular Badge */}
          {pkg.isPopular && (
            <div className="absolute top-0 right-0">
              <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Popular
              </div>
            </div>
          )}
          
          {/* Background Gradient for Popular */}
          {pkg.isPopular && (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-blue-500/5 pointer-events-none" />
          )}
          
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-500" />
              {pkg.name}
            </CardTitle>
            <CardDescription>{pkg.description}</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* قیمت */}
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">${pkg.price}</span>
              <span className="text-muted-foreground">USD</span>
            </div>
            
            {/* کردیت */}
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Base Credits</span>
                <span className="font-semibold">{pkg.credits.toLocaleString()}</span>
              </div>
              
              {pkg.bonusCredits > 0 && (
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <span className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Gift className="w-4 h-4" />
                    Bonus Credits
                  </span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    +{pkg.bonusCredits.toLocaleString()}
                  </span>
                </div>
              )}
              
              <div className="flex items-center justify-between p-2 rounded-lg bg-primary/10 border border-primary/20">
                <span className="text-sm font-medium">Total Credits</span>
                <span className="font-bold text-lg">{pkg.totalCredits.toLocaleString()}</span>
              </div>
            </div>
            
            {/* قیمت هر کردیت */}
            <div className="text-center text-sm text-muted-foreground">
              <Zap className="w-4 h-4 inline mr-1" />
              ${pkg.pricePerCredit.toFixed(4)} per credit
            </div>
          </CardContent>
          
          <CardFooter>
            <Button 
              onClick={() => handlePurchase(pkg)}
              disabled={purchasingId === pkg.id}
              className={cn(
                'w-full',
                pkg.isPopular 
                  ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700' 
                  : ''
              )}
            >
              {purchasingId === pkg.id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Buy Now
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
