'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, Loader2 } from 'lucide-react'
import {
  TopMoversSection,
  SectorHeatmap,
  MarketNewsFeed,
  DashboardHero,
  MarketStatusBanner,
} from "@/components/dashboard"
import { usePullToRefresh } from '@/lib/hooks/use-pull-to-refresh'
import { FullDataButton } from '@/components/mobile/full-data-button'

export default function DashboardPage() {
  const [refreshKey, setRefreshKey] = useState(0)
  
  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000))
    setRefreshKey(prev => prev + 1)
  }
  
  const { isPulling, isRefreshing, pullDistance, shouldRefresh } = usePullToRefresh({
    onRefresh: handleRefresh,
    threshold: 80,
    enabled: true,
  })
  
  return (
    <div className="min-h-screen bg-[#04060A] relative">
      {/* Pull to Refresh Indicator - Premium Style */}
      <AnimatePresence>
        {(isPulling || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: pullDistance * 0.5 }}
            exit={{ opacity: 0, y: -40 }}
            className="fixed top-14 md:top-0 left-1/2 -translate-x-1/2 z-50 pt-4"
          >
            <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-[#0C1017]/90 backdrop-blur-2xl border border-white/[0.06] shadow-xl">
              {isRefreshing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 text-[#00C9E4] animate-spin" />
                  <span className="text-xs text-white/80 font-medium">Refreshing</span>
                </>
              ) : (
                <>
                  <RefreshCw 
                    className="w-3.5 h-3.5 text-[#00C9E4] transition-transform duration-200"
                    style={{ 
                      transform: `rotate(${Math.min(pullDistance * 2, 360)}deg)`,
                      opacity: Math.min(pullDistance / 80, 1),
                    }}
                  />
                  <span className="text-xs text-white/80 font-medium">
                    {shouldRefresh ? 'Release' : 'Pull'}
                  </span>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Ambient Background - Refined */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Very subtle gradient wash */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#0C1017] via-[#04060A] to-[#04060A]" />
        {/* Single soft glow - top center */}
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#00C9E4]/[0.02] rounded-full blur-[120px]" />
      </div>

      {/* Main Content - Premium Spacing */}
      <div 
        key={refreshKey}
        className="relative z-10 max-w-[1600px] mx-auto"
      >
        {/* Content Container with generous padding */}
        <div className="px-4 sm:px-6 lg:px-8 xl:px-12 py-6 sm:py-8 lg:py-10">
          
          {/* Market Status - Minimal top bar */}
          <section className="mb-6 lg:mb-8">
            <MarketStatusBanner />
          </section>

          {/* Hero Section - Primary Focus */}
          <section className="mb-8 lg:mb-12">
            <DashboardHero />
          </section>

          {/* Main Grid - Information Hierarchy */}
          {/* Top Movers - Full Width */}
          <section className="mb-8 lg:mb-12">
            <TopMoversSection />
          </section>

          {/* News Feed - Full Width with 4 cards */}
          <section className="mb-8 lg:mb-12">
            <MarketNewsFeed />
          </section>

          {/* Sector Heatmap - Full Width at Bottom */}
          <section className="mb-8 lg:mb-12">
            <SectorHeatmap />
          </section>

          {/* Bottom Spacing */}
          <div className="h-8 lg:h-12" />
        </div>
      </div>

      {/* Full Data Button for Mobile */}
      <FullDataButton />
    </div>
  )
}
