'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GlassCard, PulsingDot } from '@/components/ui/cinematic'

type SortField = 'symbol' | 'price' | 'change' | 'changePercent' | 'volume' | 'marketCap'
type SortDirection = 'asc' | 'desc'
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

// Format helpers
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
  const [sortField, setSortField] = useState<SortField>('changePercent')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [data, setData] = useState<{
    gainers: StockData[]
    losers: StockData[]
    mostActive: StockData[]
  }>({
    gainers: [],
    losers: [],
    mostActive: [],
  })

  // Fetch real data from API
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
        })
        setLastUpdated(new Date(result.lastUpdated))
      }
    } catch (error) {
      console.error('Error fetching movers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Get data based on active tab
  const getData = () => {
    switch (activeTab) {
      case 'gainers': return data.gainers
      case 'losers': return data.losers
      case 'active': return data.mostActive
      case 'unusual': return data.mostActive.filter(s => s.volume > 50000000) // High volume = unusual
      default: return data.gainers
    }
  }

  // Sorted data
  const sortedData = useMemo(() => {
    const items = [...getData()]
    items.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'symbol': comparison = a.symbol.localeCompare(b.symbol); break
        case 'price': comparison = a.price - b.price; break
        case 'change': comparison = a.change - b.change; break
        case 'changePercent': comparison = a.changePercent - b.changePercent; break
        case 'volume': comparison = a.volume - b.volume; break
        case 'marketCap': comparison = a.marketCap - b.marketCap; break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })
    return items.slice(0, 6) // Only show 6 rows
  }, [activeTab, data, sortField, sortDirection])

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection(field === 'symbol' ? 'asc' : 'desc')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 text-gray-600" />
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3 h-3 text-cyan-400" />
      : <ArrowDown className="w-3 h-3 text-cyan-400" />
  }

  const getTimeAgo = () => {
    const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ago`
  }

  const handleRefresh = () => {
    fetchData()
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.3 }}
      className={className}
    >
      <GlassCard className="h-full overflow-hidden">
        {/* Header */}
        <div className="p-3 sm:p-5 border-b border-white/[0.06]">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-transparent blur-lg opacity-50" />
                <h3 className="relative text-sm sm:text-base font-semibold text-white">Top Movers</h3>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
                <PulsingDot color="cyan" size="sm" />
                <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">Live</span>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span className="hidden sm:inline">{getTimeAgo()}</span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className={cn(
                  'p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]',
                  'hover:bg-white/[0.06] hover:border-cyan-500/30',
                  'text-gray-400 hover:text-cyan-400 transition-all duration-300',
                  'disabled:opacity-50'
                )}
              >
                <RefreshCw className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')} />
              </button>
            </div>
          </div>

          {/* Tabs - Scrollable on mobile */}
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
            <TabsList className="bg-white/[0.03] border border-white/[0.06] p-1 h-auto overflow-x-auto flex-nowrap">
              <TabsTrigger
                value="gainers"
                className={cn(
                  'text-xs px-3 py-1.5 rounded-md transition-all',
                  'data-[state=active]:bg-emerald-500/15 data-[state=active]:text-emerald-400',
                  'data-[state=active]:border-emerald-500/30 data-[state=active]:shadow-[0_0_12px_rgba(34,197,94,0.2)]',
                  'text-gray-400 border border-transparent'
                )}
              >
                <TrendingUp className="w-3.5 h-3.5 mr-1.5" />
                Gainers
              </TabsTrigger>
              <TabsTrigger
                value="losers"
                className={cn(
                  'text-xs px-3 py-1.5 rounded-md transition-all',
                  'data-[state=active]:bg-red-500/15 data-[state=active]:text-red-400',
                  'data-[state=active]:border-red-500/30 data-[state=active]:shadow-[0_0_12px_rgba(239,68,68,0.2)]',
                  'text-gray-400 border border-transparent'
                )}
              >
                <TrendingDown className="w-3.5 h-3.5 mr-1.5" />
                Losers
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className={cn(
                  'text-xs px-3 py-1.5 rounded-md transition-all',
                  'data-[state=active]:bg-cyan-500/15 data-[state=active]:text-cyan-400',
                  'data-[state=active]:border-cyan-500/30 data-[state=active]:shadow-[0_0_12px_rgba(0,212,255,0.2)]',
                  'text-gray-400 border border-transparent'
                )}
              >
                <Activity className="w-3.5 h-3.5 mr-1.5" />
                Most Active
              </TabsTrigger>
              <TabsTrigger
                value="unusual"
                className={cn(
                  'text-xs px-3 py-1.5 rounded-md transition-all',
                  'data-[state=active]:bg-amber-500/15 data-[state=active]:text-amber-400',
                  'data-[state=active]:border-amber-500/30 data-[state=active]:shadow-[0_0_12px_rgba(245,158,11,0.2)]',
                  'text-gray-400 border border-transparent'
                )}
              >
                <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
                Unusual Volume
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Table - Horizontally scrollable on mobile */}
        <div className="overflow-x-auto -mx-3 sm:mx-0 px-3 sm:px-0">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {[
                  { field: 'symbol' as SortField, label: 'Symbol' },
                  { field: 'price' as SortField, label: 'Price' },
                  { field: 'change' as SortField, label: 'Change $' },
                  { field: 'changePercent' as SortField, label: 'Change %' },
                  { field: 'volume' as SortField, label: 'Volume' },
                  { field: 'marketCap' as SortField, label: 'Market Cap' },
                ].map(({ field, label }) => (
                  <th
                    key={field}
                    onClick={() => handleSort(field)}
                    className={cn(
                      'px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-500',
                      'cursor-pointer hover:text-white transition-colors',
                      'first:pl-5 last:pr-5'
                    )}
                  >
                    <div className="flex items-center gap-1.5">
                      {label}
                      {getSortIcon(field)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="wait">
                {sortedData.map((stock, index) => (
                  <motion.tr
                    key={stock.symbol}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={cn(
                      'border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors',
                      'cursor-pointer group'
                    )}
                  >
                    {/* Symbol */}
                    <td className="px-4 py-3 pl-5">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold',
                          stock.changePercent >= 0 
                            ? 'bg-emerald-500/10 text-emerald-400' 
                            : 'bg-red-500/10 text-red-400'
                        )}>
                          {stock.symbol.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors">
                            {stock.symbol}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate max-w-[120px]">
                            {stock.name}
                          </p>
                        </div>
                      </div>
                    </td>
                    
                    {/* Price */}
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-white tabular-nums">
                        ${stock.price.toFixed(2)}
                      </span>
                    </td>
                    
                    {/* Change $ */}
                    <td className="px-4 py-3">
                      <span className={cn(
                        'text-sm font-medium tabular-nums',
                        stock.change >= 0 ? 'text-emerald-400' : 'text-red-400'
                      )}>
                        {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}
                      </span>
                    </td>
                    
                    {/* Change % */}
                    <td className="px-4 py-3">
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold',
                        stock.changePercent >= 0 
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                          : 'bg-red-500/15 text-red-400 border border-red-500/20'
                      )}>
                        {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                      </span>
                    </td>
                    
                    {/* Volume */}
                    <td className="px-4 py-3">
                      <span className="text-sm text-gray-400 tabular-nums">
                        {formatVolume(stock.volume)}
                      </span>
                    </td>
                    
                    {/* Market Cap */}
                    <td className="px-4 py-3 pr-5">
                      <span className="text-sm text-gray-400 tabular-nums">
                        {formatMarketCap(stock.marketCap)}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </GlassCard>
    </motion.div>
  )
}
