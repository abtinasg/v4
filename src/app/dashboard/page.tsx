'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Loader2 } from 'lucide-react'
import {
  MarketOverviewSection,
  TopMoversSection,
  AIInsightBox,
  EconomicIndicatorsSection,
  SectorHeatmap,
  WatchlistSnapshot,
  MarketNewsFeed,
} from "@/components/dashboard"
import { usePullToRefresh } from '@/lib/hooks/use-pull-to-refresh'

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  
  const handleRefresh = async () => {
    // Refresh data by triggering re-render
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshKey(prev => prev + 1)
  }
  
  const { isPulling, isRefreshing, pullDistance, shouldRefresh } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
    enabled: true,
  })
  
  return (
    <div className="min-h-screen bg-[#030508] relative">
      {/* Pull to Refresh Indicator */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: pullDistance * 0.5 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-0 left-1/2 -translate-x-1/2 z-50 pt-4"
          >
            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#0a0d12]/95 backdrop-blur-xl border border-white/10 shadow-xl">
              {isRefreshing ? (
                <>
                  <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span className="text-xs text-white font-medium">Refreshing...</span>
                </>
              ) : (
                <>
                  <RefreshCw 
                    className="w-4 h-4 text-cyan-400 transition-transform duration-200"
                    style={{ 
                      transform: `rotate(${Math.min(pullDistance * 2, 360)}deg)`,
                      opacity: Math.min(pullDistance / 80, 1),
                    }}
                  />
                  <span className="text-xs text-white font-medium">
                    {shouldRefresh ? 'Release to refresh' : 'Pull to refresh'}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-violet-500/[0.03]" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/[0.05] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/[0.05] rounded-full blur-[100px]" />
      </div>

      {/* Main Content */}
      <div 
        key={refreshKey}
        className="relative z-10 px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 md:py-5 lg:py-8 space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-8 max-w-[1800px] mx-auto"
      >
        
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-3"
        >
          <div>
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/30 via-violet-500/20 to-transparent blur-2xl opacity-40" />
              <h1 className="relative text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
                Dashboard
              </h1>
            </div>
            <p className="text-gray-500 text-[10px] sm:text-xs md:text-sm mt-0.5 sm:mt-1">
              Real-time market data and portfolio analytics
            </p>
          </div>
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] w-fit">
            <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-[10px] sm:text-xs font-medium text-gray-400">Markets Open</span>
          </div>
        </motion.div>

        {/* SECTION 1 — MARKET OVERVIEW (full width, 5 columns) */}
        <section>
          <MarketOverviewSection />
        </section>

        {/* SECTION 2 — TOP MOVERS + AI INSIGHT (70/30 split) */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {/* Left: Top Movers (70% = ~8.5 cols, using 8) */}
          <div className="xl:col-span-8">
            <TopMoversSection />
          </div>
          
          {/* Right: AI Insight (30% = ~3.5 cols, using 4) */}
          <div className="xl:col-span-4">
            <AIInsightBox />
          </div>
        </section>

        {/* SECTION 3 — ECONOMIC INDICATORS + SECTOR HEATMAP (40/60 split) */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {/* Left: Economic Indicators (40% = ~5 cols) */}
          <div className="xl:col-span-5">
            <EconomicIndicatorsSection />
          </div>
          
          {/* Right: Sector Heatmap (60% = ~7 cols) */}
          <div className="xl:col-span-7">
            <SectorHeatmap />
          </div>
        </section>

        {/* SECTION 4 — WATCHLIST SNAPSHOT + NEWS FEED (60/40 split) */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
          {/* Left: Watchlist Snapshot (60% = ~7 cols) */}
          <div className="xl:col-span-7">
            <WatchlistSnapshot />
          </div>
          
          {/* Right: Market News (40% = ~5 cols) */}
          <div className="xl:col-span-5">
            <MarketNewsFeed />
          </div>
        </section>

        {/* Footer spacing */}
        <div className="h-8" />
      </div>
    </div>
  )
}
