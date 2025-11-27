'use client'

import { useState, useEffect } from 'react'
import { Fuel, Gem } from 'lucide-react'
import { TerminalPanel, MiniChart } from './TerminalPanel'
import { cn } from '@/lib/utils'

interface CommodityData {
  symbol: string
  name: string
  category: 'energy' | 'metals' | 'agriculture'
  price: number
  change: number
  changePercent: number
  unit: string
  sparkline?: number[]
}

const defaultCommodities: CommodityData[] = [
  // Energy
  { symbol: 'CL', name: 'Crude Oil WTI', category: 'energy', price: 68.72, change: -0.45, changePercent: -0.65, unit: '/bbl' },
  { symbol: 'BZ', name: 'Brent Crude', category: 'energy', price: 72.34, change: -0.23, changePercent: -0.32, unit: '/bbl' },
  { symbol: 'NG', name: 'Natural Gas', category: 'energy', price: 3.24, change: 0.12, changePercent: 3.85, unit: '/MMBtu' },
  { symbol: 'RB', name: 'Gasoline', category: 'energy', price: 2.12, change: 0.03, changePercent: 1.44, unit: '/gal' },
  // Metals
  { symbol: 'GC', name: 'Gold', category: 'metals', price: 2634.50, change: 12.30, changePercent: 0.47, unit: '/oz' },
  { symbol: 'SI', name: 'Silver', category: 'metals', price: 30.45, change: 0.34, changePercent: 1.13, unit: '/oz' },
  { symbol: 'HG', name: 'Copper', category: 'metals', price: 4.12, change: 0.05, changePercent: 1.23, unit: '/lb' },
  { symbol: 'PL', name: 'Platinum', category: 'metals', price: 934.20, change: -5.60, changePercent: -0.60, unit: '/oz' },
  // Agriculture
  { symbol: 'ZC', name: 'Corn', category: 'agriculture', price: 4.28, change: -0.02, changePercent: -0.47, unit: '/bu' },
  { symbol: 'ZW', name: 'Wheat', category: 'agriculture', price: 5.67, change: 0.08, changePercent: 1.43, unit: '/bu' },
  { symbol: 'ZS', name: 'Soybeans', category: 'agriculture', price: 9.89, change: 0.12, changePercent: 1.23, unit: '/bu' },
]

// Generate synthetic sparkline
function generateSparkline(basePrice: number, changePercent: number): number[] {
  const points = 15
  const data: number[] = []
  const startPrice = basePrice / (1 + changePercent / 100)
  
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1)
    const trend = startPrice + (basePrice - startPrice) * progress
    const noise = trend * (Math.random() - 0.5) * 0.008
    data.push(trend + noise)
  }
  data[data.length - 1] = basePrice
  return data
}

interface CommoditiesPanelProps {
  className?: string
}

export function CommoditiesPanel({ className }: CommoditiesPanelProps) {
  const [commodities, setCommodities] = useState<CommodityData[]>(defaultCommodities)
  const [isLoading, setIsLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState<'all' | 'energy' | 'metals' | 'agriculture'>('all')

  const fetchData = async () => {
    setIsLoading(true)
    // In production, fetch real commodity data
    setTimeout(() => setIsLoading(false), 500)
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredCommodities = activeCategory === 'all'
    ? commodities
    : commodities.filter(c => c.category === activeCategory)

  // Add sparklines
  const commoditiesWithSparkline = filteredCommodities.map(c => ({
    ...c,
    sparkline: c.sparkline || generateSparkline(c.price, c.changePercent)
  }))

  const categoryIcons = {
    energy: '⛽',
    metals: '🥇',
    agriculture: '🌾',
  }

  return (
    <TerminalPanel
      title="Commodities"
      icon={<Fuel className="w-3 h-3" />}
      badge="CMDT"
      badgeColor="amber"
      isLoading={isLoading}
      onRefresh={fetchData}
      className={className}
      noPadding
      headerRight={
        <div className="flex items-center gap-1 mr-2">
          {['all', 'energy', 'metals', 'agriculture'].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat as typeof activeCategory)}
              className={cn(
                'px-1.5 py-0.5 text-[9px] font-bold uppercase rounded transition-colors',
                activeCategory === cat
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'text-gray-500 hover:text-gray-300'
              )}
            >
              {cat === 'all' ? 'All' : cat.substring(0, 3)}
            </button>
          ))}
        </div>
      }
    >
      <div className="divide-y divide-white/[0.04]">
        {commoditiesWithSparkline.map((commodity) => (
          <div
            key={commodity.symbol}
            className="flex items-center justify-between px-3 py-2 hover:bg-white/[0.02] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <span className="text-sm">{categoryIcons[commodity.category]}</span>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white">{commodity.symbol}</span>
                </div>
                <span className="text-[10px] text-gray-500 truncate block">{commodity.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <MiniChart
                data={commodity.sparkline}
                color={commodity.changePercent >= 0 ? 'green' : 'red'}
                width={40}
                height={18}
              />
              <div className="text-right w-20">
                <div className="text-xs font-mono text-white tabular-nums">
                  ${commodity.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className={cn(
                  'text-[10px] font-mono tabular-nums',
                  commodity.changePercent >= 0 ? 'text-emerald-400' : 'text-red-400'
                )}>
                  {commodity.changePercent >= 0 ? '+' : ''}{commodity.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </TerminalPanel>
  )
}
