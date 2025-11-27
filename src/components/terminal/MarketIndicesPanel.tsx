'use client'

import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { TerminalPanel, DataRow, MiniChart } from './TerminalPanel'
import { cn } from '@/lib/utils'

interface IndexData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  sparkline?: number[]
}

const defaultIndices: IndexData[] = [
  { symbol: '^GSPC', name: 'S&P 500', price: 5998.74, change: 23.86, changePercent: 0.40 },
  { symbol: '^DJI', name: 'Dow Jones', price: 44722.06, change: 188.59, changePercent: 0.42 },
  { symbol: '^IXIC', name: 'Nasdaq', price: 19060.48, change: 157.69, changePercent: 0.83 },
  { symbol: '^RUT', name: 'Russell 2000', price: 2434.73, change: -12.56, changePercent: -0.51 },
  { symbol: '^VIX', name: 'VIX', price: 14.10, change: -0.54, changePercent: -3.69 },
  { symbol: '^FTSE', name: 'FTSE 100', price: 8262.08, change: 38.74, changePercent: 0.47 },
  { symbol: '^N225', name: 'Nikkei 225', price: 38134.97, change: -187.45, changePercent: -0.49 },
  { symbol: '^HSI', name: 'Hang Seng', price: 19603.13, change: 145.23, changePercent: 0.75 },
]

// Generate synthetic sparkline
function generateSparkline(basePrice: number, changePercent: number): number[] {
  const points = 20
  const data: number[] = []
  const startPrice = basePrice / (1 + changePercent / 100)
  
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1)
    const trend = startPrice + (basePrice - startPrice) * progress
    const noise = trend * (Math.random() - 0.5) * 0.005
    data.push(trend + noise)
  }
  data[data.length - 1] = basePrice
  return data
}

interface MarketIndicesPanelProps {
  className?: string
}

export function MarketIndicesPanel({ className }: MarketIndicesPanelProps) {
  const [indices, setIndices] = useState<IndexData[]>(defaultIndices)
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/market/overview')
      const result = await response.json()
      if (result.indices) {
        const updated = result.indices.map((idx: any) => ({
          ...idx,
          sparkline: generateSparkline(idx.price, idx.changePercent),
        }))
        setIndices(updated)
      }
    } catch (error) {
      console.error('Error fetching indices:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Ensure sparklines exist
  const indicesWithSparkline = indices.map(idx => ({
    ...idx,
    sparkline: idx.sparkline || generateSparkline(idx.price, idx.changePercent)
  }))

  return (
    <TerminalPanel
      title="Market Indices"
      icon={<TrendingUp className="w-3 h-3" />}
      badge="LIVE"
      badgeColor="green"
      isLoading={isLoading}
      onRefresh={fetchData}
      className={className}
      noPadding
    >
      <div className="divide-y divide-white/[0.04]">
        {indicesWithSparkline.map((index) => (
          <div
            key={index.symbol}
            className="flex items-center justify-between px-3 py-2 hover:bg-white/[0.02] transition-colors cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">{index.symbol.replace('^', '')}</span>
                <span className="text-[10px] text-gray-500 truncate">{index.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <MiniChart
                data={index.sparkline}
                color={index.changePercent >= 0 ? 'green' : 'red'}
                width={50}
                height={20}
              />
              <div className="text-right w-20">
                <div className="text-xs font-mono text-white tabular-nums">
                  {index.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={cn(
                  'text-[10px] font-mono tabular-nums',
                  index.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </TerminalPanel>
  )
}
