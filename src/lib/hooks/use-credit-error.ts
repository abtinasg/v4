/**
 * Credit Error Hook
 * Helper for handling insufficient credit errors in the frontend
 */

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

export interface CreditErrorDetails {
  currentBalance: number
  requiredCredits: number
  shortfall: number
  action?: string
}

export interface CreditErrorResponse {
  success: false
  error: 'insufficient_credits'
  message: string
  details: CreditErrorDetails
  links: {
    pricing: string
    credits: string
  }
}

export function isCreditError(error: unknown): error is CreditErrorResponse {
  return (
    typeof error === 'object' &&
    error !== null &&
    'error' in error &&
    (error as any).error === 'insufficient_credits'
  )
}

export function useCreditError() {
  const router = useRouter()

  const handleCreditError = useCallback((error: CreditErrorResponse) => {
    // You can customize this to show a toast, modal, or redirect
    console.warn('Insufficient credits:', error.details)
    
    // Return the error details for custom handling
    return {
      currentBalance: error.details.currentBalance,
      requiredCredits: error.details.requiredCredits,
      shortfall: error.details.shortfall,
      action: error.details.action,
      message: error.message,
    }
  }, [])

  const goToPricing = useCallback(() => {
    router.push('/pricing')
  }, [router])

  const goToCredits = useCallback(() => {
    router.push('/dashboard/settings/credits')
  }, [router])

  return {
    handleCreditError,
    goToPricing,
    goToCredits,
  }
}

/**
 * Check if a response is a credit error
 * Use this in API calls to handle credit errors
 * 
 * @example
 * const response = await fetch('/api/some-endpoint')
 * const data = await response.json()
 * 
 * if (checkCreditError(response, data)) {
 *   // Handle credit error
 *   showInsufficientCreditsDialog(data)
 *   return
 * }
 */
export function checkCreditError(
  response: Response,
  data: unknown
): data is CreditErrorResponse {
  return response.status === 402 && isCreditError(data)
}

/**
 * Standard API call wrapper that handles credit errors
 * 
 * @example
 * const { data, error, creditError } = await fetchWithCreditCheck('/api/analysis')
 * 
 * if (creditError) {
 *   // Show insufficient credits UI
 *   return
 * }
 * 
 * if (error) {
 *   // Handle other errors
 *   return
 * }
 * 
 * // Use data
 */
export async function fetchWithCreditCheck<T>(
  url: string,
  options?: RequestInit
): Promise<{
  data: T | null
  error: string | null
  creditError: CreditErrorResponse | null
  response: Response
}> {
  const response = await fetch(url, options)
  
  let data: unknown = null
  
  try {
    data = await response.json()
  } catch {
    // Response might not be JSON
  }
  
  if (response.status === 402 && isCreditError(data)) {
    return {
      data: null,
      error: null,
      creditError: data as CreditErrorResponse,
      response,
    }
  }
  
  if (!response.ok) {
    const errorMessage = (data as any)?.error || 
                        (data as any)?.message || 
                        `Request failed with status ${response.status}`
    return {
      data: null,
      error: errorMessage,
      creditError: null,
      response,
    }
  }
  
  return {
    data: data as T,
    error: null,
    creditError: null,
    response,
  }
}
