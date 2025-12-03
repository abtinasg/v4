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
      
      if (data.success && data.data) {
        // data.data is an array of currency strings like ['btc', 'eth', ...]
        const currencyList: Currency[] = (Array.isArray(data.data) ? data.data : []).map((c: string) => ({
          currency: c,
          name: CURRENCY_NAMES[c.toLowerCase()] || c.toUpperCase(),
        }))
        
        // Sort currencies: popular first, then alphabetically
        const sorted = currencyList.sort((a: Currency, b: Currency) => {
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
      <div className="space-y-3">
        <button
          onClick={handleOpenModal}
          disabled={isLoading}
          className={`w-full py-3.5 text-sm rounded-xl font-light transition-all duration-300 flex items-center justify-center gap-2 border ${
            isPopular
              ? 'bg-white/[0.08] text-white hover:bg-white/[0.12] border-white/[0.12] hover:border-white/[0.18]'
              : 'bg-white/[0.05] text-white hover:bg-white/[0.08] border-white/[0.08] hover:border-white/[0.12]'
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin opacity-60" />
              Processing...
            </>
          ) : (
            <>
              <Bitcoin className="w-4 h-4 opacity-60" />
              Pay with Crypto
            </>
          )}
        </button>
        
        {error && (
          <p className="text-xs text-red-400/80 text-center font-light">{error}</p>
        )}
        
        <p className="text-[10px] text-white/30 text-center flex items-center justify-center gap-1.5 font-light">
          <Wallet className="w-3 h-3 opacity-60" />
          BTC, ETH, USDT & more
        </p>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md border-white/[0.1] bg-[#0A0D12]/95 backdrop-blur-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-white font-light text-xl">
              <Bitcoin className="w-5 h-5 text-white/60" />
              Select Cryptocurrency
            </DialogTitle>
          </DialogHeader>
          
          <div className="py-2">
            <div className="mb-6 p-5 bg-white/[0.03] rounded-xl border border-white/[0.06]">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/40 font-light">Package</span>
                <span className="text-white font-light">{packageName}</span>
              </div>
              <div className="flex justify-between items-end">
                <span className="text-white/40 font-light text-sm">Amount</span>
                <span className="text-white font-light text-2xl">${price}</span>
              </div>
            </div>

            {loadingCurrencies ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-white/40" />
              </div>
            ) : (
              <ScrollArea className="h-[320px] pr-4">
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
                          "w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-300",
                          "hover:bg-white/[0.04] hover:border-white/[0.12]",
                          "disabled:opacity-50 disabled:cursor-not-allowed",
                          isSelected && "border-white/[0.15] bg-white/[0.06]",
                          isPopularCurrency ? "border-white/[0.1]" : "border-white/[0.06]"
                        )}
                      >
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center text-base font-light",
                          isPopularCurrency ? "bg-white/[0.08] text-white/80" : "bg-white/[0.04] text-white/50"
                        )}>
                          {getCurrencyIcon(curr.currency)}
                        </div>
                        <div className="flex-1 text-left">
                          <div className="text-white font-light">{curr.currency.toUpperCase()}</div>
                          <div className="text-xs text-white/40 font-light">
                            {getCurrencyName(curr.currency)}
                            {curr.network && ` (${curr.network})`}
                          </div>
                        </div>
                        {isSelected && isLoading ? (
                          <Loader2 className="w-5 h-5 animate-spin text-white/60" />
                        ) : (
                          <ChevronRight className="w-5 h-5 text-white/30" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </ScrollArea>
            )}

            {error && (
              <p className="text-sm text-red-400/80 text-center mt-4 font-light">{error}</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
