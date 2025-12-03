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
      <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5', className)}>
        {[1, 2, 3].map(i => (
          <div 
            key={i} 
            className={cn(
              'rounded-2xl p-6 animate-pulse',
              'bg-gradient-to-br from-white/[0.03] to-white/[0.01]',
              'border border-white/[0.06]'
            )}
          >
            <div className="h-5 bg-white/[0.06] rounded-lg w-24 mb-4" />
            <div className="h-10 bg-white/[0.06] rounded-xl w-32 mb-6" />
            <div className="space-y-3">
              <div className="h-12 bg-white/[0.04] rounded-xl" />
              <div className="h-12 bg-white/[0.04] rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  return (
    <div className={cn('grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5', className)}>
      {packages.map((pkg) => (
        <div 
          key={pkg.id} 
          className={cn(
            'relative rounded-2xl overflow-hidden transition-all duration-300',
            'bg-gradient-to-br from-white/[0.04] to-white/[0.01]',
            'backdrop-blur-xl',
            'border',
            'hover:shadow-[0_12px_40px_rgba(0,0,0,0.2)]',
            'group',
            pkg.isPopular 
              ? 'border-emerald-500/30 shadow-[0_0_40px_rgba(16,185,129,0.08)]' 
              : 'border-white/[0.06]'
          )}
        >
          {/* Popular Badge */}
          {pkg.isPopular && (
            <div className="absolute top-4 right-4">
              <div className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
                'bg-gradient-to-r from-emerald-500/20 to-teal-500/20',
                'border border-emerald-500/30',
                'text-emerald-400'
              )}>
                <Sparkles className="w-3 h-3" />
                Popular
              </div>
            </div>
          )}
          
          {/* Subtle Glow for Popular */}
          {pkg.isPopular && (
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/[0.04] via-transparent to-teal-500/[0.02] pointer-events-none" />
          )}
          
          {/* Content */}
          <div className="relative p-6 space-y-6">
            {/* Header */}
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white/90 flex items-center gap-2">
                <Coins className="w-5 h-5 text-emerald-400" />
                {pkg.name}
              </h3>
              <p className="text-sm text-white/40">{pkg.description}</p>
            </div>
            
            {/* Price */}
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-semibold text-white/95 tracking-tight">${pkg.price}</span>
              <span className="text-sm text-white/35">USD</span>
            </div>
            
            {/* Credit Breakdown */}
            <div className="space-y-3">
              <div className={cn(
                'flex items-center justify-between p-4 rounded-xl',
                'bg-white/[0.02] border border-white/[0.04]'
              )}>
                <span className="text-sm text-white/50">Base Credits</span>
                <span className="font-semibold text-white/80">{pkg.credits.toLocaleString()}</span>
              </div>
              
              {pkg.bonusCredits > 0 && (
                <div className={cn(
                  'flex items-center justify-between p-4 rounded-xl',
                  'bg-emerald-500/[0.06] border border-emerald-500/20'
                )}>
                  <span className="text-sm text-emerald-400/80 flex items-center gap-2">
                    <Gift className="w-4 h-4" />
                    Bonus Credits
                  </span>
                  <span className="font-semibold text-emerald-400">
                    +{pkg.bonusCredits.toLocaleString()}
                  </span>
                </div>
              )}
              
              <div className={cn(
                'flex items-center justify-between p-4 rounded-xl',
                'bg-gradient-to-r from-white/[0.04] to-white/[0.02]',
                'border border-white/[0.08]'
              )}>
                <span className="text-sm font-medium text-white/70">Total Credits</span>
                <span className="text-xl font-bold text-white/95">{pkg.totalCredits.toLocaleString()}</span>
              </div>
            </div>
            
            {/* Price Per Credit */}
            <div className="text-center">
              <span className="inline-flex items-center gap-1.5 text-xs text-white/35">
                <Zap className="w-3.5 h-3.5" />
                ${pkg.pricePerCredit.toFixed(4)} per credit
              </span>
            </div>
            
            {/* CTA Button */}
            <Button 
              onClick={() => handlePurchase(pkg)}
              disabled={purchasingId === pkg.id}
              className={cn(
                'w-full h-12 rounded-xl font-medium transition-all duration-300',
                pkg.isPopular 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 shadow-[0_4px_16px_rgba(16,185,129,0.25)] hover:shadow-[0_6px_20px_rgba(16,185,129,0.35)]' 
                  : 'bg-white/[0.06] hover:bg-white/[0.10] border border-white/[0.08] text-white/80 hover:text-white/95'
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
          </div>
        </div>
      ))}
    </div>
  )
}
