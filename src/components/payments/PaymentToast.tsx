'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, XCircle, AlertCircle, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PaymentToastProps {
  className?: string
}

export function PaymentToast({ className }: PaymentToastProps) {
  const searchParams = useSearchParams()
  const [show, setShow] = useState(false)
  const [type, setType] = useState<'success' | 'cancelled' | 'error' | null>(null)
  
  useEffect(() => {
    const paymentStatus = searchParams.get('payment')
    
    if (paymentStatus === 'success') {
      setType('success')
      setShow(true)
    } else if (paymentStatus === 'cancelled') {
      setType('cancelled')
      setShow(true)
    } else if (paymentStatus === 'error') {
      setType('error')
      setShow(true)
    }
    
    // Auto-hide after 8 seconds
    if (paymentStatus) {
      const timer = setTimeout(() => {
        setShow(false)
      }, 8000)
      
      // Clean up URL params
      const url = new URL(window.location.href)
      url.searchParams.delete('payment')
      url.searchParams.delete('order')
      window.history.replaceState({}, '', url.toString())
      
      return () => clearTimeout(timer)
    }
  }, [searchParams])
  
  if (!show || !type) return null
  
  const config = {
    success: {
      icon: CheckCircle2,
      title: 'Payment Successful',
      message: 'Your credits have been added to your account.',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      iconColor: 'text-emerald-500',
    },
    cancelled: {
      icon: AlertCircle,
      title: 'Payment Cancelled',
      message: 'Your payment was cancelled. No charges were made.',
      bgColor: 'bg-amber-500/10 border-amber-500/20',
      iconColor: 'text-amber-500',
    },
    error: {
      icon: XCircle,
      title: 'Payment Failed',
      message: 'There was an issue processing your payment. Please try again.',
      bgColor: 'bg-red-500/10 border-red-500/20',
      iconColor: 'text-red-500',
    },
  }
  
  const current = config[type]
  const Icon = current.icon
  
  return (
    <div
      className={cn(
        'fixed top-4 right-4 z-50 max-w-sm w-full animate-in slide-in-from-top-2 fade-in duration-300',
        className
      )}
    >
      <div className={cn(
        'rounded-lg border p-4 shadow-lg backdrop-blur-sm',
        current.bgColor
      )}>
        <div className="flex items-start gap-3">
          <Icon className={cn('w-5 h-5 mt-0.5', current.iconColor)} />
          <div className="flex-1">
            <h4 className="font-semibold text-sm text-foreground">{current.title}</h4>
            <p className="text-xs text-muted-foreground mt-1">{current.message}</p>
          </div>
          <button
            onClick={() => setShow(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
