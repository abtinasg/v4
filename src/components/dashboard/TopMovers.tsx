'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RefreshCw,
  Clock,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { StockRow, type StockData } from './StockRow'

type SortField = 'symbol' | 'price' | 'change' | 'changePercent' | 'volume' | 'marketCap'
type SortDirection = 'asc' | 'desc'
type TabValue = 'gainers' | 'losers' | 'active'

interface TopMoversProps {
  className?: string
}

export function TopMovers({ className }: TopMoversProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('gainers')
  const [sortField, setSortField] = useState<SortField>('changePercent')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const [data, setData] = useState<{
    gainers: StockData[]
    losers: StockData[]
    mostActive: StockData[]
  }>({
    gainers: [],
    losers: [],
    mostActive: [],
  })

  // Fetch data from API
  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/market/movers')
      const result = await response.json()
      setData({
        gainers: result.gainers || [],
        losers: result.losers || [],
        mostActive: result.mostActive || [],
      })
      setLastUpdated(new Date(result.lastUpdated))
    } catch (error) {
      console.error('Error fetching market movers:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchData()
  }, [])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  // Handle sort
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortDirection(field === 'symbol' ? 'asc' : 'desc')
    }
  }

  // Get current data based on active tab
  const currentData = useMemo(() => {
    let items: StockData[] = []
    switch (activeTab) {
      case 'gainers':
        items = [...data.gainers]
        break
      case 'losers':
        items = [...data.losers]
        break
      case 'active':
        items = [...data.mostActive]
        break
    }

    // Sort data
    items.sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'symbol':
          comparison = a.symbol.localeCompare(b.symbol)
          break
        case 'price':
          comparison = a.price - b.price
          break
        case 'change':
          comparison = a.change - b.change
          break
        case 'changePercent':
          comparison = a.changePercent - b.changePercent
          break
        case 'volume':
          comparison = a.volume - b.volume
          break
        case 'marketCap':
          comparison = a.marketCap - b.marketCap
          break
      }
      return sortDirection === 'asc' ? comparison : -comparison
    })

    return items
  }, [activeTab, data, sortField, sortDirection])

  // Get sort icon
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 text-gray-600" />
    }
    return sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-blue-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-blue-400" />
    )
  }

  // Format time ago
  const getTimeAgo = () => {
    if (!lastUpdated) return ''
    const seconds = Math.floor((new Date().getTime() - lastUpdated.getTime()) / 1000)
    if (seconds < 60) return 'Just now'
    const minutes = Math.floor(seconds / 60)
    return `${minutes}m ago`
  }

  return (
    <div className={cn('bg-[#0d0d0f] border border-white/5 rounded-xl overflow-hidden', className)}>
      {/* Header */}
      <div className="p-4 border-b border-white/5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">Top Movers</h2>
            <p className="text-sm text-gray-500">Real-time market activity</p>
          </div>
          <div className="flex items-center gap-3">
            {lastUpdated && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                {getTimeAgo()}
              </div>
            )}
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors disabled:opacity-50"
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)}>
          <TabsList className="bg-white/5 border border-white/10 p-1">
            <TabsTrigger
              value="gainers"
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 text-gray-400"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Gainers
            </TabsTrigger>
            <TabsTrigger
              value="losers"
              className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 text-gray-400"
            >
              <TrendingDown className="w-4 h-4 mr-2" />
              Losers
            </TabsTrigger>
            <TabsTrigger
              value="active"
              className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-gray-400"
            >
              <Activity className="w-4 h-4 mr-2" />
              Most Active
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-white/5 hover:bg-transparent">
              <TableHead
                className="text-gray-500 font-medium cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('symbol')}
              >
                <div className="flex items-center gap-2">
                  Symbol
                  {getSortIcon('symbol')}
                </div>
              </TableHead>
              <TableHead
                className="text-gray-500 font-medium cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center gap-2">
                  Price
                  {getSortIcon('price')}
                </div>
              </TableHead>
              <TableHead
                className="text-gray-500 font-medium cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('change')}
              >
                <div className="flex items-center gap-2">
                  Change ($)
                  {getSortIcon('change')}
                </div>
              </TableHead>
              <TableHead
                className="text-gray-500 font-medium cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('changePercent')}
              >
                <div className="flex items-center gap-2">
                  Change (%)
                  {getSortIcon('changePercent')}
                </div>
              </TableHead>
              <TableHead
                className="text-gray-500 font-medium cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('volume')}
              >
                <div className="flex items-center gap-2">
                  Volume
                  {getSortIcon('volume')}
                </div>
              </TableHead>
              <TableHead
                className="text-gray-500 font-medium cursor-pointer hover:text-white transition-colors"
                onClick={() => handleSort('marketCap')}
              >
                <div className="flex items-center gap-2">
                  Market Cap
                  {getSortIcon('marketCap')}
                </div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="wait">
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="border-b border-white/5">
                    <td className="py-4 px-4" colSpan={6}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white/5 animate-pulse" />
                        <div className="space-y-2">
                          <div className="w-16 h-4 bg-white/5 rounded animate-pulse" />
                          <div className="w-24 h-3 bg-white/5 rounded animate-pulse" />
                        </div>
                      </div>
                    </td>
                  </TableRow>
                ))
              ) : currentData.length === 0 ? (
                <TableRow>
                  <td colSpan={6} className="py-12 text-center text-gray-500">
                    No data available
                  </td>
                </TableRow>
              ) : (
                currentData.map((stock, index) => (
                  <StockRow key={stock.symbol} stock={stock} index={index} />
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/5 bg-white/[0.02]">
        <p className="text-xs text-gray-600 text-center">
          Showing top {currentData.length} {activeTab === 'gainers' ? 'gainers' : activeTab === 'losers' ? 'losers' : 'most active stocks'} • Data updates every 30 seconds
        </p>
      </div>
    </div>
  )
}
