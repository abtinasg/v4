'use client'

import { useState, useEffect } from 'react'
import { Landmark, TrendingDown, TrendingUp } from 'lucide-react'
import { TerminalPanel, MiniChart } from './TerminalPanel'
import { cn } from '@/lib/utils'

interface BondData {
  symbol: string
  name: string
  category: 'treasury' | 'corporate' | 'municipal'
  yield: number
  change: number
  price: number
  priceChange: number
  duration?: string
  sparkline?: number[]
}

const defaultBonds: BondData[] = [
  // US Treasuries
  { symbol: 'US1M', name: '1-Month T-Bill', category: 'treasury', yield: 5.35, change: 0.02, price: 99.56, priceChange: -0.01 },
  { symbol: 'US3M', name: '3-Month T-Bill', category: 'treasury', yield: 5.24, change: 0.01, price: 98.69, priceChange: -0.02 },
  { symbol: 'US6M', name: '6-Month T-Bill', category: 'treasury', yield: 5.12, change: -0.02, price: 97.44, priceChange: 0.03 },
  { symbol: 'US1Y', name: '1-Year Note', category: 'treasury', yield: 4.89, change: -0.03, price: 95.23, priceChange: 0.05 },
  { symbol: 'US2Y', name: '2-Year Note', category: 'treasury', yield: 4.56, change: -0.05, price: 98.75, priceChange: 0.08 },
  { symbol: 'US5Y', name: '5-Year Note', category: 'treasury', yield: 4.38, change: -0.04, price: 97.89, priceChange: 0.12 },
  { symbol: 'US10Y', name: '10-Year Note', category: 'treasury', yield: 4.42, change: -0.02, price: 95.34, priceChange: 0.15 },
  { symbol: 'US30Y', name: '30-Year Bond', category: 'treasury', yield: 4.58, change: 0.01, price: 92.45, priceChange: -0.08 },
]

// Generate synthetic sparkline
function generateSparkline(baseYield: number, change: number): number[] {
  const points = 15
  const data: number[] = []
  const startYield = baseYield - change
  
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1)
    const trend = startYield + change * progress
    const noise = (Math.random() - 0.5) * 0.02
    data.push(trend + noise)
  }
  data[data.length - 1] = baseYield
  return data
}

interface FixedIncomePanelProps {
  className?: string
}

export function FixedIncomePanel({ className }: FixedIncomePanelProps) {
  const [bonds, setBonds] = useState<BondData[]>(defaultBonds)
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    // In production, fetch real bond data
    setTimeout(() => setIsLoading(false), 500)
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Add sparklines
  const bondsWithSparkline = bonds.map(b => ({
    ...b,
    sparkline: b.sparkline || generateSparkline(b.yield, b.change)
  }))

  // Calculate yield curve summary
  const shortTermAvg = bonds.filter(b => ['US1M', 'US3M', 'US6M'].includes(b.symbol)).reduce((a, b) => a + b.yield, 0) / 3
  const longTermAvg = bonds.filter(b => ['US10Y', 'US30Y'].includes(b.symbol)).reduce((a, b) => a + b.yield, 0) / 2
  const yieldCurveSpread = longTermAvg - shortTermAvg
  const isInverted = yieldCurveSpread < 0

  return (
    <TerminalPanel
      title="Fixed Income"
      icon={<Landmark className="w-3 h-3" />}
      badge="BOND"
      badgeColor="blue"
      isLoading={isLoading}
      onRefresh={fetchData}
      className={className}
      noPadding
    >
      {/* Yield Curve Summary */}
      <div className="px-3 py-2 border-b border-white/[0.04] bg-black/20">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-gray-500 uppercase">Yield Curve</span>
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded',
              isInverted ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'
            )}>
              {isInverted ? 'INVERTED' : 'NORMAL'}
            </span>
            <span className="text-xs font-mono text-white">
              {yieldCurveSpread >= 0 ? '+' : ''}{(yieldCurveSpread * 100).toFixed(0)}bps
            </span>
          </div>
        </div>
        
        {/* Simple Yield Curve Visualization */}
        <div className="mt-2 flex items-end gap-1 h-8">
          {bondsWithSparkline.map((bond, index) => {
            const maxYield = Math.max(...bonds.map(b => b.yield))
            const height = (bond.yield / maxYield) * 100
            
            return (
              <div
                key={bond.symbol}
                className="flex-1 flex flex-col items-center gap-0.5"
                title={`${bond.name}: ${bond.yield.toFixed(2)}%`}
              >
                <div 
                  className={cn(
                    'w-full rounded-t',
                    bond.change >= 0 ? 'bg-red-500/60' : 'bg-emerald-500/60'
                  )}
                  style={{ height: `${height}%`, minHeight: '4px' }}
                />
                <span className="text-[7px] text-gray-500">
                  {bond.symbol.replace('US', '')}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Bond List */}
      <div className="divide-y divide-white/[0.04]">
        {bondsWithSparkline.map((bond) => (
          <div
            key={bond.symbol}
            className="flex items-center justify-between px-3 py-2 hover:bg-white/[0.02] transition-colors cursor-pointer"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white">{bond.symbol}</span>
                <span className="text-[10px] text-gray-500 truncate">{bond.name}</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MiniChart
                data={bond.sparkline}
                color={bond.change >= 0 ? 'red' : 'green'}
                width={36}
                height={16}
              />
              
              <div className="text-right w-14">
                <div className="text-xs font-mono text-white tabular-nums">
                  {bond.yield.toFixed(2)}%
                </div>
                <div className="flex items-center justify-end gap-0.5">
                  {bond.change >= 0 ? (
                    <TrendingUp className="w-2 h-2 text-red-400" />
                  ) : (
                    <TrendingDown className="w-2 h-2 text-emerald-400" />
                  )}
                  <span className={cn(
                    'text-[10px] font-mono tabular-nums',
                    bond.change >= 0 ? 'text-red-400' : 'text-emerald-400'
                  )}>
                    {bond.change >= 0 ? '+' : ''}{bond.change.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </TerminalPanel>
  )
}
