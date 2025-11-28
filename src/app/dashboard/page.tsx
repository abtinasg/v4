'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Loader2 } from 'lucide-react'
import {
  TopMoversSection,
  AIInsightBox,
  EconomicIndicatorsSection,
  SectorHeatmap,
  MarketNewsFeed,
  WatchlistSnapshot,
  DashboardHero,
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
        className="relative z-10 px-2 sm:px-3 md:px-4 lg:px-6 py-3 sm:py-4 md:py-5 lg:py-8 space-y-6 lg:space-y-10 max-w-[1800px] mx-auto"
      >
        <DashboardHero />

        <section className="grid grid-cols-1 gap-6 xl:grid-cols-12">
          <div className="space-y-6 xl:col-span-8">
            <TopMoversSection />
            <MarketNewsFeed />
          </div>
          <div className="space-y-6 xl:col-span-4">
            <AIInsightBox />
            <WatchlistSnapshot />
            <EconomicIndicatorsSection />
          </div>
        </section>

        <section>
          <SectorHeatmap />
        </section>

        <div className="h-8" />
      </div>
    </div>
  )
}
