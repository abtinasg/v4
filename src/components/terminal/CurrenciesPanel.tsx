'use client'

import { useState, useEffect } from 'react'
import { DollarSign, Bitcoin } from 'lucide-react'
import { TerminalPanel, DataRow } from './TerminalPanel'
import { cn } from '@/lib/utils'

interface CurrencyData {
  pair: string
  name: string
  price: number
  change: number
  changePercent: number
  isCrypto?: boolean
}

const defaultCurrencies: CurrencyData[] = [
  { pair: 'EUR/USD', name: 'Euro', price: 1.0542, change: -0.0023, changePercent: -0.22 },
  { pair: 'GBP/USD', name: 'British Pound', price: 1.2634, change: 0.0045, changePercent: 0.36 },
  { pair: 'USD/JPY', name: 'Japanese Yen', price: 154.23, change: 0.87, changePercent: 0.57 },
  { pair: 'USD/CHF', name: 'Swiss Franc', price: 0.8876, change: -0.0012, changePercent: -0.14 },
  { pair: 'AUD/USD', name: 'Australian Dollar', price: 0.6523, change: 0.0034, changePercent: 0.52 },
  { pair: 'USD/CAD', name: 'Canadian Dollar', price: 1.4023, change: 0.0056, changePercent: 0.40 },
  { pair: 'BTC/USD', name: 'Bitcoin', price: 96542.00, change: 2341.00, changePercent: 2.48, isCrypto: true },
  { pair: 'ETH/USD', name: 'Ethereum', price: 3542.00, change: 87.50, changePercent: 2.53, isCrypto: true },
]

interface CurrenciesPanelProps {
  className?: string
}

export function CurrenciesPanel({ className }: CurrenciesPanelProps) {
  const [currencies, setCurrencies] = useState<CurrencyData[]>(defaultCurrencies)
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    // In production, fetch real forex data
    setTimeout(() => setIsLoading(false), 500)
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const fiatCurrencies = currencies.filter(c => !c.isCrypto)
  const cryptoCurrencies = currencies.filter(c => c.isCrypto)

  return (
    <TerminalPanel
      title="Currencies"
      icon={<DollarSign className="w-3 h-3" />}
      badge="FX"
      badgeColor="amber"
      isLoading={isLoading}
      onRefresh={fetchData}
      className={className}
      noPadding
    >
      <div className="divide-y divide-white/[0.04]">
        {/* Fiat Currencies */}
        {fiatCurrencies.map((currency) => (
          <div
            key={currency.pair}
            className="flex items-center justify-between px-3 py-2 hover:bg-white/[0.02] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white">{currency.pair}</span>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono text-white tabular-nums">
                {currency.price.toFixed(currency.price > 100 ? 2 : 4)}
              </div>
              <div className={cn(
                'text-[10px] font-mono tabular-nums',
                currency.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                {currency.changePercent >= 0 ? '+' : ''}{currency.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}

        {/* Crypto Header */}
        <div className="px-3 py-1.5 bg-white/[0.02]">
          <div className="flex items-center gap-1.5">
            <Bitcoin className="w-3 h-3 text-amber-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Crypto</span>
          </div>
        </div>

        {/* Crypto Currencies */}
        {cryptoCurrencies.map((currency) => (
          <div
            key={currency.pair}
            className="flex items-center justify-between px-3 py-2 hover:bg-white/[0.02] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-amber-400">{currency.pair.split('/')[0]}</span>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono text-white tabular-nums">
                ${currency.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={cn(
                'text-[10px] font-mono tabular-nums',
                currency.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                {currency.changePercent >= 0 ? '+' : ''}{currency.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </TerminalPanel>
  )
}
