'use client'

import { useState } from 'react'
import { Loader2, Bitcoin, Wallet } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

interface BuyButtonProps {
  packageId: string
  packageName: string
  price: number
  isPopular?: boolean
}

export function BuyButton({ packageId, packageName, price, isPopular }: BuyButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isSignedIn } = useUser()
  const router = useRouter()

  const handlePurchase = async () => {
    if (!isSignedIn) {
      router.push('/sign-in?redirect=/pricing')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/payments/nowpayments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create payment')
      }

      // Redirect to NOWPayments invoice page
      if (data.data?.invoiceUrl) {
        window.location.href = data.data.invoiceUrl
      } else {
        throw new Error('No payment URL received')
      }
    } catch (err) {
      console.error('Purchase error:', err)
      setError(err instanceof Error ? err.message : 'Failed to initiate payment')
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-2">
      <button
        onClick={handlePurchase}
        disabled={isLoading}
        className={`w-full py-2.5 text-sm rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
          isPopular
            ? 'bg-emerald-500 text-white hover:bg-emerald-600 disabled:bg-emerald-500/70'
            : 'bg-accent text-foreground hover:bg-accent/80 disabled:bg-accent/50'
        } disabled:cursor-not-allowed`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Bitcoin className="w-4 h-4" />
            Pay with Crypto
          </>
        )}
      </button>
      
      {error && (
        <p className="text-xs text-red-500 text-center">{error}</p>
      )}
      
      <p className="text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
        <Wallet className="w-3 h-3" />
        BTC, ETH, USDT & more
      </p>
    </div>
  )
}
