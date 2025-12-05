'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  RefreshCw,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/cinematic'

type TabValue = 'gainers' | 'losers' | 'active' | 'unusual'

interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
}

interface TopMoversSectionProps {
  className?: string
}

const formatVolume = (vol: number) => {
  if (vol >= 1000000000) return `${(vol / 1000000000).toFixed(1)}B`
  if (vol >= 1000000) return `${(vol / 1000000).toFixed(1)}M`
  if (vol >= 1000) return `${(vol / 1000).toFixed(1)}K`
  return vol.toString()
}

const formatMarketCap = (cap: number) => {
  if (cap >= 1000000000000) return `$${(cap / 1000000000000).toFixed(2)}T`
  if (cap >= 1000000000) return `$${(cap / 1000000000).toFixed(1)}B`
  if (cap >= 1000000) return `$${(cap / 1000000).toFixed(1)}M`
  return `$${cap}`
}

export function TopMoversSection({ className }: TopMoversSectionProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('gainers')
  const [isLoading, setIsLoading] = useState(true)
  const [data, setData] = useState<{
    gainers: StockData[]
    losers: StockData[]
    mostActive: StockData[]
    unusualVolume: StockData[]
  }>({
    gainers: [],
    losers: [],
    mostActive: [],
    unusualVolume: [],
  })

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/market/movers')
      const result = await response.json()
      if (result.success) {
        setData({
          gainers: result.gainers || [],
          losers: result.losers || [],
          mostActive: result.mostActive || [],
          unusualVolume: result.unusualVolume || [],
        })
      }
    } catch (error) {
      console.error('Error fetching movers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getData = () => {
    switch (activeTab) {
      case 'gainers': return data.gainers
      case 'losers': return data.losers
      case 'active': return data.mostActive
      case 'unusual': return data.unusualVolume
      default: return data.gainers
    }
  }

  const sortedData = useMemo(() => {
    return [...getData()].slice(0, 6)
  }, [activeTab, data])

  const tabs = [
    { value: 'gainers', label: 'Gainers', icon: TrendingUp, color: 'emerald' },
    { value: 'losers', label: 'Losers', icon: TrendingDown, color: 'rose' },
    { value: 'active', label: 'Most Active', icon: Activity, color: 'cyan' },
    { value: 'unusual', label: 'Unusual Vol', icon: BarChart3, color: 'amber' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={cn('h-full', className)}
    >
      <GlassCard className="h-full overflow-hidden">
        {/* Header */}
        <div className="p-6 pb-0">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-medium text-white">Top Movers</h3>
              <p className="text-xs text-white/35 mt-0.5">Real-time market activity</p>
            </div>
            <button
              onClick={fetchData}
              disabled={isLoading}
              className={cn(
                'p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]',
                'hover:bg-white/[0.06] transition-all duration-200',
                'disabled:opacity-40'
              )}
            >
              <RefreshCw className={cn('w-3.5 h-3.5 text-white/40', isLoading && 'animate-spin')} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 rounded-xl bg-white/[0.02] border border-white/[0.04] overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value as TabValue)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-2 rounded-lg min-w-0',
                  'text-[10px] sm:text-xs font-medium transition-all duration-200 whitespace-nowrap',
                  activeTab === tab.value
                    ? `bg-${tab.color}-500/10 text-${tab.color}-400 border border-${tab.color}-500/20`
                    : 'text-white/40 hover:text-white/60 border border-transparent'
                )}
                style={activeTab === tab.value ? {
                  backgroundColor: tab.color === 'emerald' ? 'rgba(16, 185, 129, 0.1)' :
                                   tab.color === 'rose' ? 'rgba(244, 63, 94, 0.1)' :
                                   tab.color === 'cyan' ? 'rgba(0, 201, 228, 0.1)' :
                                   'rgba(245, 158, 11, 0.1)',
                  color: tab.color === 'emerald' ? '#10B981' :
                         tab.color === 'rose' ? '#F43F5E' :
                         tab.color === 'cyan' ? '#00C9E4' :
                         '#F59E0B',
                  borderColor: tab.color === 'emerald' ? 'rgba(16, 185, 129, 0.2)' :
                               tab.color === 'rose' ? 'rgba(244, 63, 94, 0.2)' :
                               tab.color === 'cyan' ? 'rgba(0, 201, 228, 0.2)' :
                               'rgba(245, 158, 11, 0.2)',
                } : {}}
              >
                <tab.icon className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="p-6 pt-4">
          {/* Table Header */}
          <div className="grid grid-cols-8 sm:grid-cols-12 gap-2 sm:gap-4 px-3 sm:px-4 py-2 text-[10px] sm:text-xs text-white/30 uppercase tracking-wide font-medium border-b border-white/[0.04]">
            <div className="col-span-3 sm:col-span-4">Symbol</div>
            <div className="col-span-2 text-right">Price</div>
            <div className="col-span-3 sm:col-span-2 text-right">Change</div>
            <div className="col-span-2 text-right hidden sm:block">Volume</div>
            <div className="col-span-2 text-right hidden sm:block">Mkt Cap</div>
          </div>

          {/* Table Body */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="divide-y divide-white/[0.04]"
            >
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="grid grid-cols-8 sm:grid-cols-12 gap-2 sm:gap-4 px-3 sm:px-4 py-3 animate-pulse">
                    <div className="col-span-3 sm:col-span-4 flex items-center gap-2 sm:gap-3">
                      <div className="h-4 w-10 sm:w-12 bg-white/[0.06] rounded" />
                      <div className="h-3 w-16 sm:w-20 bg-white/[0.04] rounded hidden sm:block" />
                    </div>
                    <div className="col-span-2"><div className="h-4 w-12 sm:w-16 bg-white/[0.06] rounded ml-auto" /></div>
                    <div className="col-span-3 sm:col-span-2"><div className="h-4 w-12 sm:w-14 bg-white/[0.06] rounded ml-auto" /></div>
                    <div className="col-span-2 hidden sm:block"><div className="h-4 w-12 bg-white/[0.04] rounded ml-auto" /></div>
                    <div className="col-span-2 hidden sm:block"><div className="h-4 w-14 bg-white/[0.04] rounded ml-auto" /></div>
                  </div>
                ))
              ) : sortedData.length === 0 ? (
                <div className="px-3 sm:px-4 py-8 text-center text-white/40 text-sm">
                  No data available
                </div>
              ) : (
                sortedData.map((stock, index) => (
                  <motion.div
                    key={stock.symbol}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={cn(
                      'grid grid-cols-8 sm:grid-cols-12 gap-2 sm:gap-4 px-3 sm:px-4 py-3',
                      'hover:bg-white/[0.02] transition-colors duration-150 cursor-pointer'
                    )}
                  >
                    <div className="col-span-3 sm:col-span-4 flex items-center gap-2 sm:gap-3 min-w-0">
                      <span className="text-xs sm:text-sm font-medium text-white">{stock.symbol}</span>
                      <span className="text-xs text-white/30 truncate hidden sm:block">{stock.name}</span>
                    </div>
                    <div className="col-span-2 text-right">
                      <span className="text-xs sm:text-sm text-white tabular-nums">
                        ${stock.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div className="col-span-3 sm:col-span-2 text-right">
                      <span className={cn(
                        'text-xs sm:text-sm font-medium tabular-nums',
                        stock.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      )}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </div>
                    <div className="col-span-2 text-right hidden sm:block">
                      <span className="text-sm text-white/50 tabular-nums">{formatVolume(stock.volume)}</span>
                    </div>
                    <div className="col-span-2 text-right hidden sm:block">
                      <span className="text-sm text-white/40 tabular-nums">{formatMarketCap(stock.marketCap)}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </GlassCard>
    </motion.div>
  )
}
