'use client'

import { useState, useEffect } from 'react'
import { Globe } from 'lucide-react'
import { TerminalPanel, MiniChart } from './TerminalPanel'
import { cn } from '@/lib/utils'

interface GlobalMarketData {
  symbol: string
  name: string
  country: string
  region: 'Americas' | 'Europe' | 'Asia'
  price: number
  change: number
  changePercent: number
  status: 'open' | 'closed' | 'pre-market'
}

const defaultMarkets: GlobalMarketData[] = [
  // Americas
  { symbol: 'SPX', name: 'S&P 500', country: 'US', region: 'Americas', price: 5998.74, change: 23.86, changePercent: 0.40, status: 'open' },
  { symbol: 'TSX', name: 'Toronto', country: 'CA', region: 'Americas', price: 25123.45, change: 112.34, changePercent: 0.45, status: 'open' },
  { symbol: 'BOVESPA', name: 'Brazil', country: 'BR', region: 'Americas', price: 128456.78, change: -234.56, changePercent: -0.18, status: 'open' },
  // Europe
  { symbol: 'FTSE', name: 'UK 100', country: 'GB', region: 'Europe', price: 8262.08, change: 38.74, changePercent: 0.47, status: 'closed' },
  { symbol: 'DAX', name: 'Germany', country: 'DE', region: 'Europe', price: 19456.23, change: 87.45, changePercent: 0.45, status: 'closed' },
  { symbol: 'CAC', name: 'France', country: 'FR', region: 'Europe', price: 7345.67, change: 23.45, changePercent: 0.32, status: 'closed' },
  // Asia
  { symbol: 'N225', name: 'Nikkei', country: 'JP', region: 'Asia', price: 38134.97, change: -187.45, changePercent: -0.49, status: 'closed' },
  { symbol: 'HSI', name: 'Hong Kong', country: 'HK', region: 'Asia', price: 19603.13, change: 145.23, changePercent: 0.75, status: 'closed' },
  { symbol: 'SSE', name: 'Shanghai', country: 'CN', region: 'Asia', price: 3089.34, change: 12.45, changePercent: 0.40, status: 'closed' },
  { symbol: 'KOSPI', name: 'Korea', country: 'KR', region: 'Asia', price: 2534.67, change: -23.45, changePercent: -0.92, status: 'closed' },
  { symbol: 'ASX', name: 'Australia', country: 'AU', region: 'Asia', price: 8234.56, change: 45.67, changePercent: 0.56, status: 'closed' },
]

interface GlobalMarketsPanelProps {
  className?: string
}

export function GlobalMarketsPanel({ className }: GlobalMarketsPanelProps) {
  const [markets, setMarkets] = useState<GlobalMarketData[]>(defaultMarkets)
  const [isLoading, setIsLoading] = useState(false)
  const [activeRegion, setActiveRegion] = useState<'all' | 'Americas' | 'Europe' | 'Asia'>('all')

  const fetchData = async () => {
    setIsLoading(true)
    // In production, fetch real global market data
    setTimeout(() => setIsLoading(false), 500)
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const filteredMarkets = activeRegion === 'all' 
    ? markets 
    : markets.filter(m => m.region === activeRegion)

  const statusColors = {
    open: 'bg-emerald-500',
    closed: 'bg-gray-500',
    'pre-market': 'bg-amber-500',
  }

  return (
    <TerminalPanel
      title="Global Markets"
      icon={<Globe className="w-3 h-3" />}
      badge="WORLD"
      badgeColor="cyan"
      isLoading={isLoading}
      onRefresh={fetchData}
      className={className}
      noPadding
      headerRight={
        <div className="flex items-center gap-1 mr-2">
          {['all', 'Americas', 'Europe', 'Asia'].map((region) => (
            <button
              key={region}
              onClick={() => setActiveRegion(region as typeof activeRegion)}
              className={cn(
                'px-1.5 py-0.5 text-[9px] font-bold uppercase rounded transition-colors',
                activeRegion === region
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'text-gray-500 hover:text-gray-300'
              )}
            >
              {region === 'all' ? 'All' : region.substring(0, 2)}
            </button>
          ))}
        </div>
      }
    >
      <div className="divide-y divide-white/[0.04]">
        {filteredMarkets.map((market) => (
          <div
            key={market.symbol}
            className="flex items-center justify-between px-3 py-2 hover:bg-white/[0.02] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <div className={cn('w-1.5 h-1.5 rounded-full', statusColors[market.status])} />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">{market.symbol}</span>
                  <span className="text-[9px] px-1 py-0.5 rounded bg-white/5 text-gray-500">{market.country}</span>
                </div>
                <span className="text-[10px] text-gray-500">{market.name}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-mono text-white tabular-nums">
                {market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className={cn(
                'text-[10px] font-mono tabular-nums',
                market.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
              )}>
                {market.changePercent >= 0 ? '+' : ''}{market.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>
        ))}
      </div>
    </TerminalPanel>
  )
}
