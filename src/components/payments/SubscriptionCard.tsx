'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Sparkles, Zap, Loader2, Bitcoin } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface SubscriptionPlan {
  id: string
  name: string
  price: number
  description: string
  credits: number
  features: string[]
  trialDays: number
  isPopular: boolean
}

interface SubscriptionCardProps {
  plan: SubscriptionPlan
  isLoggedIn: boolean
}

export function SubscriptionCard({ plan, isLoggedIn }: SubscriptionCardProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubscribe = async () => {
    if (!isLoggedIn) {
      router.push(`/sign-up?plan=${plan.id}&trial=true`)
      return
    }

    // Free plan - just redirect
    if (plan.price === 0) {
      router.push('/dashboard')
      return
    }

    // For paid plans with trial
    if (plan.trialDays > 0) {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch('/api/subscriptions/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            planId: plan.id,
            startTrial: true,
          }),
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          if (data.error?.includes('not eligible')) {
            // Not eligible for trial, show payment modal
            setShowPaymentModal(true)
          } else {
            throw new Error(data.error || 'Failed to start trial')
          }
        } else {
          // Trial started successfully
          router.push('/dashboard?trial=started')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setIsLoading(false)
      }
    } else {
      // No trial - go directly to payment
      setShowPaymentModal(true)
    }
  }

  const handleCryptoPayment = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/subscriptions/pay-crypto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          billingCycle: 'monthly',
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create payment')
      }

      // Redirect to payment page
      if (data.data?.invoiceUrl) {
        window.location.href = data.data.invoiceUrl
      } else if (data.data?.paymentId) {
        router.push(`/pay/crypto?id=${data.data.paymentId}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process payment')
    } finally {
      setIsLoading(false)
    }
  }

  const isFreePlan = plan.price === 0
  const ctaText = isFreePlan 
    ? 'Get Started' 
    : plan.trialDays > 0 
      ? `Start ${plan.trialDays}-day free trial` 
      : 'Subscribe Now'

  return (
    <>
      <div
        className={cn(
          "relative rounded-2xl p-8 transition-all duration-300",
          plan.isPopular
            ? 'bg-gradient-to-b from-blue-500/10 to-transparent border-2 border-blue-500/30'
            : 'bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1]'
        )}
      >
        {plan.isPopular && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500 text-white text-xs font-medium">
              <Sparkles className="h-3 w-3" />
              Most popular
            </div>
          </div>
        )}

        <div className="mb-6">
          <h3 className="text-lg font-semibold text-white mb-1">{plan.name}</h3>
          <p className="text-sm text-zinc-500">{plan.description}</p>
        </div>

        <div className="mb-6">
          <div className="flex items-baseline gap-1">
            <span className="text-zinc-500">$</span>
            <span className="text-4xl font-bold text-white">{plan.price}</span>
            {plan.price > 0 && <span className="text-zinc-500">/mo</span>}
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            {plan.credits.toLocaleString()} credits/mo
          </p>
        </div>

        <ul className="space-y-3 mb-8">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <Check className={cn(
                "h-5 w-5 flex-shrink-0",
                plan.isPopular ? 'text-blue-400' : 'text-zinc-500'
              )} />
              <span className="text-sm text-zinc-400">{feature}</span>
            </li>
          ))}
        </ul>

        <button
          onClick={handleSubscribe}
          disabled={isLoading}
          className={cn(
            "w-full py-3 rounded-xl text-[14px] font-medium transition-all flex items-center justify-center gap-2",
            plan.isPopular
              ? 'bg-blue-500 hover:bg-blue-400 text-white'
              : 'bg-white/5 hover:bg-white/10 text-white border border-white/10',
            isLoading && 'opacity-50 cursor-not-allowed'
          )}
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            ctaText
          )}
        </button>

        {plan.trialDays > 0 && !isFreePlan && (
          <p className="text-xs text-center text-zinc-500 mt-3 flex items-center justify-center gap-1">
            <Zap className="h-3 w-3" />
            {plan.trialDays} days free, then ${plan.price}/mo
          </p>
        )}

        {error && (
          <p className="text-xs text-red-400 text-center mt-3">{error}</p>
        )}
      </div>

      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-md border-white/[0.1] bg-[#0A0D12]/95 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white font-light text-xl">
              <Bitcoin className="w-5 h-5 text-white/60" />
              Subscribe to {plan.name}
            </DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <div className="mb-6 p-5 bg-white/[0.03] rounded-xl border border-white/[0.06]">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/40 font-light">Plan</span>
                <span className="text-white font-light">{plan.name}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/40 font-light">Credits</span>
                <span className="text-white font-light">{plan.credits.toLocaleString()}/mo</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-white/40 font-light text-sm">Amount</span>
                <span className="text-white font-light text-2xl">${plan.price}/mo</span>
              </div>
            </div>

            <button
              onClick={handleCryptoPayment}
              disabled={isLoading}
              className="w-full py-4 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Bitcoin className="h-5 w-5" />
                  Pay with Crypto
                </>
              )}
            </button>

            <p className="text-xs text-center text-zinc-500 mt-4">
              BTC, ETH, USDT & 50+ cryptocurrencies accepted
            </p>

            {error && (
              <p className="text-sm text-red-400 text-center mt-4">{error}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
