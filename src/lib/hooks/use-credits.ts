/**
 * useCredits Hook
 * هوک برای مدیریت کردیت در کلاینت
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { CREDIT_COSTS, type CreditAction } from '@/lib/credits/config'

export interface CreditData {
  balance: number
  lifetimeCredits: number
  freeCreditsUsed: number
  lastReset: string | null
  stats: {
    todayUsage: number
    monthUsage: number
  }
  tier: string
  limits: {
    requestsPerMinute: number
    requestsPerHour: number
    requestsPerDay: number
    monthlyCredits: number
  }
  creditCosts: typeof CREDIT_COSTS
}

export interface CreditTransaction {
  id: string
  amount: number
  type: string
  action: string | null
  description: string | null
  balanceBefore: number
  balanceAfter: number
  metadata: Record<string, any> | null
  createdAt: string
}

export interface CreditPackage {
  id: string
  name: string
  description: string | null
  credits: number
  bonusCredits: number
  totalCredits: number
  price: number
  currency: string
  isPopular: boolean
  pricePerCredit: number
}

export function useCredits() {
  const [credits, setCredits] = useState<CreditData | null>(null)
  const [history, setHistory] = useState<CreditTransaction[]>([])
  const [packages, setPackages] = useState<CreditPackage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // دریافت اطلاعات کردیت
  const fetchCredits = useCallback(async () => {
    try {
      const response = await fetch('/api/credits')
      const data = await response.json()
      
      if (data.success) {
        setCredits(data.data)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch credits')
    }
  }, [])

  // دریافت تاریخچه
  const fetchHistory = useCallback(async (limit = 50, offset = 0) => {
    try {
      const response = await fetch(`/api/credits/history?limit=${limit}&offset=${offset}`)
      const data = await response.json()
      
      if (data.success) {
        if (offset === 0) {
          setHistory(data.data.transactions)
        } else {
          setHistory(prev => [...prev, ...data.data.transactions])
        }
        return data.data.pagination.hasMore
      } else {
        setError(data.error)
        return false
      }
    } catch (err) {
      setError('Failed to fetch history')
      return false
    }
  }, [])

  // دریافت پکیج‌ها
  const fetchPackages = useCallback(async () => {
    try {
      const response = await fetch('/api/credits/packages')
      const data = await response.json()
      
      if (data.success) {
        setPackages(data.data.packages)
      } else {
        setError(data.error)
      }
    } catch (err) {
      setError('Failed to fetch packages')
    }
  }, [])

  // خرید کردیت
  const purchaseCredits = useCallback(async (packageId: string) => {
    try {
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      })
      
      const data = await response.json()
      
      if (data.success) {
        // رفرش کردیت بعد از خرید
        await fetchCredits()
        return { success: true, data: data.data }
      } else {
        return { success: false, error: data.error }
      }
    } catch (err) {
      return { success: false, error: 'Failed to purchase credits' }
    }
  }, [fetchCredits])

  // بررسی کافی بودن کردیت برای یک عملیات
  const hasEnoughCredits = useCallback((action: CreditAction): boolean => {
    if (!credits) return false
    const cost = CREDIT_COSTS[action]
    return credits.balance >= cost
  }, [credits])

  // دریافت هزینه یک عملیات
  const getCost = useCallback((action: CreditAction): number => {
    return CREDIT_COSTS[action]
  }, [])

  // لود اولیه
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([
        fetchCredits(),
        fetchPackages(),
      ])
      setLoading(false)
    }
    
    loadData()
  }, [fetchCredits, fetchPackages])

  return {
    // Data
    credits,
    history,
    packages,
    loading,
    error,
    
    // Actions
    fetchCredits,
    fetchHistory,
    fetchPackages,
    purchaseCredits,
    
    // Helpers
    hasEnoughCredits,
    getCost,
    
    // Computed
    isLowBalance: credits ? credits.balance <= 50 : false,
    balance: credits?.balance || 0,
  }
}
