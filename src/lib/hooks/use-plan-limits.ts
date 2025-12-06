/**
 * usePlanLimits Hook
 * هوک برای بررسی محدودیت‌های پلن کاربر
 */

'use client'

import { useSubscription } from './use-subscription'
import { PLAN_LIMITS, isUnlimited, type PlanLimits } from '@/lib/credits/config'

export function usePlanLimits() {
  const { planId, isTrial, loading } = useSubscription()
  
  // Trial users get Pro plan limits
  const effectivePlanId = isTrial ? 'pro' : planId
  const limits = PLAN_LIMITS[effectivePlanId] || PLAN_LIMITS.free
  
  // Helper functions
  const canAddWatchlistSymbol = (currentCount: number): boolean => {
    if (isUnlimited(limits.watchlistSymbols)) return true
    return currentCount < limits.watchlistSymbols
  }
  
  const canAddPortfolio = (currentCount: number): boolean => {
    if (isUnlimited(limits.portfolios)) return true
    return currentCount < limits.portfolios
  }
  
  const canAddAlert = (currentCount: number): boolean => {
    if (isUnlimited(limits.alerts)) return true
    return currentCount < limits.alerts
  }
  
  const canGenerateAIReport = (currentMonthCount: number): boolean => {
    if (isUnlimited(limits.aiReportsPerMonth)) return true
    return currentMonthCount < limits.aiReportsPerMonth
  }
  
  const getRemainingWatchlistSlots = (currentCount: number): number | 'unlimited' => {
    if (isUnlimited(limits.watchlistSymbols)) return 'unlimited'
    return Math.max(0, limits.watchlistSymbols - currentCount)
  }
  
  const getRemainingPortfolioSlots = (currentCount: number): number | 'unlimited' => {
    if (isUnlimited(limits.portfolios)) return 'unlimited'
    return Math.max(0, limits.portfolios - currentCount)
  }
  
  const getRemainingAlertSlots = (currentCount: number): number | 'unlimited' => {
    if (isUnlimited(limits.alerts)) return 'unlimited'
    return Math.max(0, limits.alerts - currentCount)
  }
  
  const getRemainingAIReports = (currentMonthCount: number): number | 'unlimited' => {
    if (isUnlimited(limits.aiReportsPerMonth)) return 'unlimited'
    return Math.max(0, limits.aiReportsPerMonth - currentMonthCount)
  }

  return {
    limits,
    loading,
    planId: effectivePlanId,
    isTrial,
    // Check functions
    canAddWatchlistSymbol,
    canAddPortfolio,
    canAddAlert,
    canGenerateAIReport,
    canExport: limits.exportEnabled,
    hasApiAccess: limits.apiAccessEnabled,
    hasPrioritySupport: limits.prioritySupport,
    hasCustomIntegrations: limits.customIntegrations,
    hasDedicatedAccountManager: limits.dedicatedAccountManager,
    // Remaining slots
    getRemainingWatchlistSlots,
    getRemainingPortfolioSlots,
    getRemainingAlertSlots,
    getRemainingAIReports,
    // Utils
    isUnlimited,
  }
}
