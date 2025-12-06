/**
 * useSubscription Hook
 * هوک برای دریافت اطلاعات سابسکریپشن کاربر
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import type { PlanId } from '@/lib/subscriptions/plans'

// Custom event for subscription updates
export const SUBSCRIPTION_UPDATE_EVENT = 'subscription-update'

// Helper to trigger subscription refresh from anywhere
export function triggerSubscriptionRefresh() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(SUBSCRIPTION_UPDATE_EVENT))
  }
}

export interface SubscriptionPlan {
  id: PlanId
  name: string
  description: string
  price: number
  yearlyPrice: number
  credits: number
  features: string[]
  isPopular?: boolean
  trialDays: number
}

export interface SubscriptionData {
  hasSubscription: boolean
  subscription: {
    id: string
    userId: string
    planId: PlanId
    status: 'active' | 'trial' | 'cancelled' | 'expired'
    trialEndsAt: string | null
    currentPeriodStart: string
    currentPeriodEnd: string
    cancelledAt: string | null
    daysRemaining: number
    isTrial: boolean
    trialDaysRemaining: number
  } | null
  plan: SubscriptionPlan
  isEligibleForTrial: boolean
}

export function useSubscription() {
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSubscription = useCallback(async (retryCount = 0) => {
    try {
      const response = await fetch('/api/subscriptions/current')
      const data = await response.json()
      
      if (data.success) {
        setSubscription(data.data)
        setError(null)
      } else {
        // Retry up to 3 times with exponential backoff
        if (retryCount < 3) {
          setTimeout(() => {
            fetchSubscription(retryCount + 1)
          }, Math.pow(2, retryCount) * 1000)
        } else {
          setError(data.error)
        }
      }
    } catch (err) {
      if (retryCount < 3) {
        setTimeout(() => {
          fetchSubscription(retryCount + 1)
        }, Math.pow(2, retryCount) * 1000)
      } else {
        setError('Failed to fetch subscription')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubscription()
    
    // Listen for subscription updates
    const handleUpdate = () => {
      fetchSubscription()
    }
    
    window.addEventListener(SUBSCRIPTION_UPDATE_EVENT, handleUpdate)
    return () => {
      window.removeEventListener(SUBSCRIPTION_UPDATE_EVENT, handleUpdate)
    }
  }, [fetchSubscription])

  const refresh = useCallback(() => {
    setLoading(true)
    fetchSubscription()
  }, [fetchSubscription])

  // Computed properties
  const planId = subscription?.subscription?.planId ?? 'free'
  const planName = subscription?.plan?.name ?? 'Free'
  const isFree = planId === 'free'
  const isPro = planId === 'pro'
  const isPremium = planId === 'premium'
  const isEnterprise = planId === 'enterprise'
  const isTrial = subscription?.subscription?.status === 'trial'
  const isActive = subscription?.subscription?.status === 'active'
  const trialDaysRemaining = subscription?.subscription?.trialDaysRemaining ?? 0

  return {
    subscription,
    loading,
    error,
    refresh,
    // Quick access properties
    planId,
    planName,
    isFree,
    isPro,
    isPremium,
    isEnterprise,
    isTrial,
    isActive,
    trialDaysRemaining,
    hasActiveSubscription: subscription?.hasSubscription ?? false,
    isEligibleForTrial: subscription?.isEligibleForTrial ?? true,
  }
}
