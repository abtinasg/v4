/**
 * Portfolio Page
 * 
 * Comprehensive portfolio management with:
 * - Portfolio summary cards
 * - Holdings table with real-time prices
 * - Allocation chart
 * - Auto-refresh functionality
 * - Add/Edit/Delete holdings
 */

'use client'

import React, { useEffect, useCallback, useRef, Suspense, lazy } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  RefreshCw,
  Settings,
  Download,
  PieChart,
  List,
  LayoutGrid,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'
import {
  PortfolioSummary,
  PortfolioTable,
  AddHoldingModal,
  EditHoldingModal,
} from '@/components/portfolio'
import { PortfolioContextUpdater } from '@/components/ai'

// Lazy load heavy components
const AllocationChart = lazy(() => import('@/components/portfolio/AllocationChart').then(m => ({ default: m.AllocationChart })))

// ============================================================
// PORTFOLIO PAGE
// ============================================================

function PortfolioPage() {
  const fetchPortfolio = usePortfolioStore((state) => state.fetchPortfolio)
  const openAddModal = usePortfolioStore((state) => state.openAddModal)
  const settings = usePortfolioStore((state) => state.settings)
  const updateSettings = usePortfolioStore((state) => state.updateSettings)
  const isRefreshing = usePortfolioStore((state) => state.isRefreshing)
  const lastRefresh = usePortfolioStore((state) => state.lastRefresh)
  const holdings = usePortfolioStore((state) => state.holdings)
  const summary = usePortfolioStore((state) => state.summary)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Initial fetch
  useEffect(() => {
    fetchPortfolio()
  }, [fetchPortfolio])

  // Auto-refresh
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    // Only enable auto-refresh if refresh interval is less than 60 seconds
    if (settings.refreshInterval < 60) {
      intervalRef.current = setInterval(() => {
        fetchPortfolio()
      }, settings.refreshInterval * 1000)
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [settings.refreshInterval, fetchPortfolio])

  // Manual refresh
  const handleRefresh = useCallback(() => {
    fetchPortfolio()
  }, [fetchPortfolio])

  // Export to CSV
  const handleExport = useCallback(() => {
    if (holdings.length === 0) return

    const headers = ['Symbol', 'Name', 'Shares', 'Avg Cost', 'Current Price', 'Market Value', 'P&L', 'P&L %', 'Day Change', 'Day Change %']
    const rows = holdings.map((h) => [
      h.symbol,
      h.name,
      h.quantity.toFixed(4),
      h.avgBuyPrice.toFixed(2),
      h.currentPrice.toFixed(2),
      h.totalValue.toFixed(2),
      h.gainLoss.toFixed(2),
      h.gainLossPercent.toFixed(2),
      h.dayGainLoss.toFixed(2),
      h.dayGainLossPercent.toFixed(2),
    ])

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `portfolio-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [holdings])

  // Format last refresh time
  const formatLastRefresh = () => {
    if (!lastRefresh) return 'Never'
    const date = new Date(lastRefresh)
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit' 
    })
  }

  return (
    <div className="min-h-screen bg-[#0a0d12]">
      {/* Portfolio AI Context Updater - fetches comprehensive data for AI */}
      <PortfolioContextUpdater refreshInterval={120000} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Portfolio</h1>
            <p className="text-sm text-white/50 mt-1">
              Track your investments and performance
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh Indicator */}
            <div className="hidden sm:flex items-center gap-2 text-xs text-white/40 mr-2">
              <span>Last updated: {formatLastRefresh()}</span>
            </div>

            {/* Refresh Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="h-9 w-9 text-white/50 hover:text-white hover:bg-white/10"
            >
              <RefreshCw className={cn('w-4 h-4', isRefreshing && 'animate-spin')} />
            </Button>

            {/* Settings Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 text-white/50 hover:text-white hover:bg-white/10"
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#0f1419] border-white/10">
                <DropdownMenuLabel className="text-white/50">Settings</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={() => updateSettings({ refreshInterval: 5 })}
                  className={cn(
                    'text-white/70 hover:text-white',
                    settings.refreshInterval === 5 && 'text-cyan-400'
                  )}
                >
                  Refresh every 5 seconds
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateSettings({ refreshInterval: 10 })}
                  className={cn(
                    'text-white/70 hover:text-white',
                    settings.refreshInterval === 10 && 'text-cyan-400'
                  )}
                >
                  Refresh every 10 seconds
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateSettings({ refreshInterval: 30 })}
                  className={cn(
                    'text-white/70 hover:text-white',
                    settings.refreshInterval === 30 && 'text-cyan-400'
                  )}
                >
                  Refresh every 30 seconds
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => updateSettings({ refreshInterval: 60 })}
                  className={cn(
                    'text-white/70 hover:text-white',
                    settings.refreshInterval === 60 && 'text-cyan-400'
                  )}
                >
                  Refresh every 60 seconds
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/10" />
                <DropdownMenuItem
                  onClick={handleExport}
                  disabled={holdings.length === 0}
                  className="text-white/70 hover:text-white"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export to CSV
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add Holding Button */}
            <Button
              onClick={() => openAddModal()}
              className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Holding
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="mb-6">
          <PortfolioSummary />
        </div>

        {/* Main Content */}
        <Tabs defaultValue="holdings" className="space-y-6">
          <TabsList className="bg-white/5 border border-white/10">
            <TabsTrigger 
              value="holdings" 
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50"
            >
              <List className="w-4 h-4 mr-2" />
              Holdings
            </TabsTrigger>
            <TabsTrigger 
              value="allocation"
              className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/50"
            >
              <PieChart className="w-4 h-4 mr-2" />
              Allocation
            </TabsTrigger>
          </TabsList>

          {/* Holdings Tab */}
          <TabsContent value="holdings">
            <div
              className={cn(
                'rounded-xl overflow-hidden',
                'bg-gradient-to-br from-white/5 to-white/[0.02]',
                'border border-white/10',
              )}
            >
              <PortfolioTable />
            </div>
          </TabsContent>

          {/* Allocation Tab */}
          <TabsContent value="allocation">
            <div
              className={cn(
                'rounded-xl p-6',
                'bg-gradient-to-br from-white/5 to-white/[0.02]',
                'border border-white/10',
              )}
            >
              <h3 className="text-lg font-semibold text-white mb-6">Portfolio Allocation</h3>
              <Suspense fallback={
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-8 h-8 text-white/30 animate-spin" />
                </div>
              }>
                <AllocationChart />
              </Suspense>
            </div>
          </TabsContent>
        </Tabs>


      </div>

      {/* Modals */}
      <AddHoldingModal />
      <EditHoldingModal />
    </div>
  )
}

export default React.memo(PortfolioPage)
