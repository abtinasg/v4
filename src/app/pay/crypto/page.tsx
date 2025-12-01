'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Copy, Check, Clock, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2, Loader2, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { QRCodeSVG } from 'qrcode.react'
import { cn } from '@/lib/utils'

interface PaymentData {
  id: string
  orderId: string
  status: string
  priceAmount: string
  priceCurrency: string
  payAmount: string
  payCurrency: string
  payAddress: string
  actuallyPaid: string | null
  creditsAmount: string
  bonusCredits: string
  creditsAdded: boolean
  expiresAt: string | null
  paidAt: string | null
  createdAt: string
  metadata?: {
    network?: string
  } | null
  externalStatus?: {
    status: string
    actuallyPaid: number
    payAmount: number
  } | null
}

const STATUS_CONFIGS = {
  waiting: {
    label: 'Waiting for Payment',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    icon: Clock,
    description: 'Send the exact amount to the address below',
  },
  confirming: {
    label: 'Confirming',
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    icon: Loader2,
    description: 'Transaction detected, waiting for confirmations',
  },
  confirmed: {
    label: 'Confirmed',
    color: 'bg-green-500',
    textColor: 'text-green-500',
    icon: CheckCircle2,
    description: 'Payment confirmed, processing credits',
  },
  sending: {
    label: 'Processing',
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    icon: Loader2,
    description: 'Adding credits to your account',
  },
  finished: {
    label: 'Completed',
    color: 'bg-green-500',
    textColor: 'text-green-500',
    icon: CheckCircle2,
    description: 'Payment successful! Credits added to your account',
  },
  failed: {
    label: 'Failed',
    color: 'bg-red-500',
    textColor: 'text-red-500',
    icon: AlertCircle,
    description: 'Payment failed. Please contact support.',
  },
  expired: {
    label: 'Expired',
    color: 'bg-gray-500',
    textColor: 'text-gray-500',
    icon: AlertCircle,
    description: 'Payment expired. Please create a new payment.',
  },
  refunded: {
    label: 'Refunded',
    color: 'bg-orange-500',
    textColor: 'text-orange-500',
    icon: AlertCircle,
    description: 'Payment has been refunded',
  },
}

const CRYPTO_LOGOS: Record<string, string> = {
  BTC: '₿',
  ETH: 'Ξ',
  USDT: '₮',
  USDC: '$',
  TRX: 'T',
  SOL: 'S',
  MATIC: 'M',
  BNB: 'B',
  LTC: 'Ł',
  DOGE: 'Ð',
}

export default function CryptoPaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('id')
  
  const [payment, setPayment] = useState<PaymentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<'address' | 'amount' | null>(null)
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  
  const fetchPaymentStatus = useCallback(async () => {
    if (!paymentId) return
    
    try {
      const response = await fetch(`/api/payments/nowpayments/status/${paymentId}`)
      const data = await response.json()
      
      if (data.success) {
        setPayment(data.data)
        setError(null)
      } else {
        setError(data.error || 'Failed to fetch payment status')
      }
    } catch (err) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [paymentId])
  
  // Initial fetch
  useEffect(() => {
    fetchPaymentStatus()
  }, [fetchPaymentStatus])
  
  // Auto-refresh every 10 seconds for pending payments
  useEffect(() => {
    if (!payment) return
    
    const status = payment.externalStatus?.status || payment.status
    const shouldRefresh = ['waiting', 'confirming', 'confirmed', 'sending'].includes(status)
    
    if (shouldRefresh) {
      const interval = setInterval(fetchPaymentStatus, 10000)
      return () => clearInterval(interval)
    }
  }, [payment, fetchPaymentStatus])
  
  // Countdown timer
  useEffect(() => {
    if (!payment?.expiresAt) return
    
    const updateTimeLeft = () => {
      const expires = new Date(payment.expiresAt!).getTime()
      const now = Date.now()
      const diff = Math.max(0, expires - now)
      setTimeLeft(diff)
    }
    
    updateTimeLeft()
    const interval = setInterval(updateTimeLeft, 1000)
    return () => clearInterval(interval)
  }, [payment?.expiresAt])
  
  const handleCopy = async (text: string, type: 'address' | 'amount') => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    }
  }
  
  const handleRefresh = () => {
    setRefreshing(true)
    fetchPaymentStatus()
  }
  
  const formatTimeLeft = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }
  
  const getProgressPercent = () => {
    if (!payment?.expiresAt) return 100
    const total = 20 * 60 * 1000 // 20 minutes default
    const elapsed = total - (timeLeft || 0)
    return Math.min(100, (elapsed / total) * 100)
  }
  
  if (!paymentId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Payment Not Found</h2>
            <p className="text-muted-foreground mb-4">No payment ID was provided.</p>
            <Button onClick={() => router.push('/pricing')}>
              Go to Pricing
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <Skeleton className="h-8 w-48 mx-auto" />
            <Skeleton className="h-4 w-32 mx-auto mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-48 w-48 mx-auto rounded-lg" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }
  
  if (error || !payment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p className="text-muted-foreground mb-4">{error || 'Payment not found'}</p>
            <div className="flex gap-2 justify-center">
              <Button variant="outline" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
              <Button onClick={handleRefresh}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }
  
  const status = payment.externalStatus?.status || payment.status
  const statusConfig = STATUS_CONFIGS[status as keyof typeof STATUS_CONFIGS] || STATUS_CONFIGS.waiting
  const StatusIcon = statusConfig.icon
  const totalCredits = parseFloat(payment.creditsAmount) + parseFloat(payment.bonusCredits)
  const cryptoSymbol = CRYPTO_LOGOS[payment.payCurrency] || payment.payCurrency
  
  const isCompleted = status === 'finished'
  const isPending = ['waiting', 'confirming', 'confirmed', 'sending'].includes(status)
  const isFailed = ['failed', 'expired', 'refunded'].includes(status)
  
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => router.push('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Dashboard
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", refreshing && "animate-spin")} />
            Refresh
          </Button>
        </div>
        
        {/* Main Payment Card */}
        <Card className="overflow-hidden">
          {/* Status Banner */}
          <div className={cn(
            "p-4 text-white text-center",
            statusConfig.color
          )}>
            <StatusIcon className={cn(
              "h-8 w-8 mx-auto mb-2",
              status === 'confirming' || status === 'sending' ? "animate-spin" : ""
            )} />
            <h2 className="text-lg font-semibold">{statusConfig.label}</h2>
            <p className="text-sm opacity-90">{statusConfig.description}</p>
          </div>
          
          <CardContent className="p-6 space-y-6">
            {/* Order Info */}
            <div className="flex justify-between items-center p-3 bg-muted rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">Order Amount</p>
                <p className="text-xl font-bold">${payment.priceAmount} USD</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Credits</p>
                <p className="text-xl font-bold text-green-500">+{totalCredits.toLocaleString()}</p>
              </div>
            </div>
            
            {/* Payment Details for Pending Status */}
            {isPending && payment.payAddress && (
              <>
                {/* QR Code */}
                <div className="flex flex-col items-center">
                  <div className="bg-white p-4 rounded-xl shadow-sm">
                    <QRCodeSVG
                      value={payment.payAddress}
                      size={180}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <Badge variant="secondary" className="mt-3">
                    <Wallet className="h-3 w-3 mr-1" />
                    {payment.payCurrency} {payment.metadata?.network ? `(${payment.metadata.network})` : ''}
                  </Badge>
                </div>
                
                {/* Amount to Send */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Amount to Send
                  </label>
                  <div 
                    className="flex items-center gap-2 p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition"
                    onClick={() => handleCopy(payment.payAmount, 'amount')}
                  >
                    <span className="text-2xl">{cryptoSymbol}</span>
                    <code className="flex-1 font-mono text-lg font-semibold break-all">
                      {payment.payAmount}
                    </code>
                    <Button variant="ghost" size="sm">
                      {copied === 'amount' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click to copy the exact amount
                  </p>
                </div>
                
                {/* Wallet Address */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">
                    Send to Address
                  </label>
                  <div 
                    className="flex items-center gap-2 p-3 bg-muted rounded-lg cursor-pointer hover:bg-muted/80 transition"
                    onClick={() => handleCopy(payment.payAddress, 'address')}
                  >
                    <code className="flex-1 font-mono text-sm break-all">
                      {payment.payAddress}
                    </code>
                    <Button variant="ghost" size="sm">
                      {copied === 'address' ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click to copy the wallet address
                  </p>
                </div>
                
                {/* Timer */}
                {timeLeft !== null && timeLeft > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Time Remaining</span>
                      <span className={cn(
                        "font-mono font-semibold",
                        timeLeft < 300000 ? "text-red-500" : "text-foreground"
                      )}>
                        {formatTimeLeft(timeLeft)}
                      </span>
                    </div>
                    <Progress value={100 - getProgressPercent()} className="h-2" />
                  </div>
                )}
              </>
            )}
            
            {/* Completed Status */}
            {isCompleted && (
              <div className="text-center py-4">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
                <p className="text-muted-foreground mb-4">
                  {totalCredits.toLocaleString()} credits have been added to your account.
                </p>
                <Button onClick={() => router.push('/dashboard')}>
                  Go to Dashboard
                </Button>
              </div>
            )}
            
            {/* Failed Status */}
            {isFailed && (
              <div className="text-center py-4">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Payment {status}</h3>
                <p className="text-muted-foreground mb-4">
                  {status === 'expired' 
                    ? 'This payment has expired. Please create a new payment.'
                    : 'There was an issue with your payment. Please contact support.'}
                </p>
                <div className="flex gap-2 justify-center">
                  <Button variant="outline" onClick={() => router.push('/pricing')}>
                    Try Again
                  </Button>
                  <Button onClick={() => router.push('/dashboard')}>
                    Dashboard
                  </Button>
                </div>
              </div>
            )}
            
            {/* Actually Paid (for partial payments) */}
            {payment.actuallyPaid && parseFloat(payment.actuallyPaid) > 0 && (
              <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <p className="text-sm text-blue-500">
                  <strong>Received:</strong> {payment.actuallyPaid} {payment.payCurrency}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Order Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order ID</span>
              <code className="font-mono text-xs">{payment.orderId}</code>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Created</span>
              <span>{new Date(payment.createdAt).toLocaleString()}</span>
            </div>
            {payment.paidAt && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Paid At</span>
                <span>{new Date(payment.paidAt).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Currency</span>
              <span>{payment.payCurrency}</span>
            </div>
          </CardContent>
        </Card>
        
        {/* Instructions */}
        {isPending && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Important</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• Send the <strong>exact</strong> amount shown above</p>
              <p>• Send only <strong>{payment.payCurrency}</strong> to this address</p>
              <p>• Payment will be confirmed after network confirmations</p>
              <p>• Do not close this page until payment is complete</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
