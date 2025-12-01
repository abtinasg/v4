'use client'

import { useState, useEffect } from 'react'
import { Loader2, Bitcoin, Wallet, X, ChevronRight } from 'lucide-react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface BuyButtonProps {
  packageId: string
  packageName: string
  price: number
  isPopular?: boolean
}

interface Currency {
  currency: string
  name: string
  network?: string
  logo?: string
}

// Popular crypto currencies to show first
const POPULAR_CURRENCIES = ['btc', 'eth', 'usdt', 'usdttrc20', 'usdterc20', 'trx', 'sol', 'matic', 'bnb', 'ltc', 'doge']

const CURRENCY_NAMES: Record<string, string> = {
  btc: 'Bitcoin',
  eth: 'Ethereum',
  usdt: 'Tether (USDT)',
  usdttrc20: 'USDT (TRC20)',
  usdterc20: 'USDT (ERC20)',
  trx: 'TRON',
  sol: 'Solana',
  matic: 'Polygon',
  bnb: 'BNB',
  ltc: 'Litecoin',
  doge: 'Dogecoin',
  xrp: 'Ripple',
  ada: 'Cardano',
  dot: 'Polkadot',
  avax: 'Avalanche',
  link: 'Chainlink',
  uni: 'Uniswap',
  xlm: 'Stellar',
  atom: 'Cosmos',
  near: 'NEAR',
}

const CURRENCY_ICONS: Record<string, string> = {
  btc: '₿',
  eth: 'Ξ',
  usdt: '₮',
  usdttrc20: '₮',
  usdterc20: '₮',
  trx: 'T',
  sol: '◎',
  matic: 'M',
  bnb: 'B',
  ltc: 'Ł',
  doge: 'Ð',
  xrp: 'X',
  ada: '₳',
}

export function BuyButton({ packageId, packageName, price, isPopular }: BuyButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currencies, setCurrencies] = useState<Currency[]>([])
  const [loadingCurrencies, setLoadingCurrencies] = useState(false)
  const [selectedCurrency, setSelectedCurrency] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { isSignedIn } = useUser()
  const router = useRouter()

  // Fetch available currencies when modal opens
  useEffect(() => {
    if (isModalOpen && currencies.length === 0) {
      fetchCurrencies()
    }
  }, [isModalOpen])

  const fetchCurrencies = async () => {
    setLoadingCurrencies(true)
    try {
      const response = await fetch('/api/payments/nowpayments/currencies')
      const data = await response.json()
      
      if (data.success && data.data?.currencies) {
        // Sort currencies: popular first, then alphabetically
        const sorted = data.data.currencies.sort((a: Currency, b: Currency) => {
          const aPopular = POPULAR_CURRENCIES.indexOf(a.currency.toLowerCase())
          const bPopular = POPULAR_CURRENCIES.indexOf(b.currency.toLowerCase())
          
          if (aPopular !== -1 && bPopular !== -1) return aPopular - bPopular
          if (aPopular !== -1) return -1
          if (bPopular !== -1) return 1
          return a.currency.localeCompare(b.currency)
        })
        setCurrencies(sorted)
      }
    } catch (err) {
      console.error('Failed to fetch currencies:', err)
    } finally {
      setLoadingCurrencies(false)
    }
  }

  const handleOpenModal = () => {
    if (!isSignedIn) {
      router.push('/sign-in?redirect=/pricing')
      return
    }
    setIsModalOpen(true)
    setError(null)
  }

  const handleSelectCurrency = async (currency: string) => {
    setSelectedCurrency(currency)
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/payments/nowpayments/create-direct', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          packageId,
          payCurrency: currency,
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to create payment')
      }

      // Redirect to our custom payment page
      if (data.data?.paymentId) {
        router.push(`/pay/crypto?id=${data.data.paymentId}`)
      } else {
        throw new Error('No payment ID received')
      }
    } catch (err) {
      console.error('Purchase error:', err)
      setError(err instanceof Error ? err.message : 'Failed to initiate payment')
      setIsLoading(false)
      setSelectedCurrency(null)
    }
  }

  const getCurrencyName = (currency: string) => {
    return CURRENCY_NAMES[currency.toLowerCase()] || currency.toUpperCase()
  }

  const getCurrencyIcon = (currency: string) => {
    return CURRENCY_ICONS[currency.toLowerCase()] || currency.slice(0, 2).toUpperCase()
  }

  return (
    <>
      <div className="space-y-2">
        <button
          onClick={handleOpenModal}
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

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Bitcoin className="w-5 h-5 text-orange-500" />
              Select Cryptocurrency
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-2">
            <div className="mb-4 p-3 bg-muted rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Package</span>
                <span className="font-medium">{packageName}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-bold text-lg">${price}</span>
              </div>
            </div>

            {loadingCurrencies ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <ScrollArea className="h-[300px] pr-4">
                <div className="space-y-2">
                  {currencies.map((curr) => {
                    const isSelected = selectedCurrency === curr.currency
                    const isPopularCurrency = POPULAR_CURRENCIES.includes(curr.currency.toLowerCase())
                    
                    return (
                      <button
                        key={curr.currency}
                        onClick={() => handleSelectCurrency(curr.currency)}
                        disabled={isLoading}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-lg border transition-all",
                          "hover:bg-accent hover:border-primary/50",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          isSelected && "border-primary bg-primary/10",
                          isPopularCurrency && "border-amber-500/30"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold",
                          isPopularCurrency ? "bg-amber-500/20 text-amber-500" : "bg-muted text-muted-foreground"
                        )}>
                          {getCurrencyIcon(curr.currency)}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="font-medium">{curr.currency.toUpperCase()}</div>
                          <div className="text-xs text-muted-foreground">
                            {getCurrencyName(curr.currency)}
                            {curr.network && ` (${curr.network})`}
                          </div>
                        </div>
                        {isSelected && isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin text-primary" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-muted-foreground" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            )}

            {error && (
              <p className="text-sm text-red-500 text-center mt-4">{error}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
