'use client'

import { motion } from 'framer-motion'
import {
  MarketOverviewSection,
  TopMoversSection,
  AIInsightBox,
  EconomicIndicatorsSection,
  SectorHeatmap,
  WatchlistSnapshot,
  MarketNewsFeed,
} from "@/components/dashboard"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#030508]">
      {/* Cinematic Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-transparent to-violet-500/[0.03]" />
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/[0.05] rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-500/[0.05] rounded-full blur-[100px]" />
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 space-y-4 sm:space-y-6 lg:space-y-8 max-w-[1800px] mx-auto">
        
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0"
        >
          <div>
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/30 via-violet-500/20 to-transparent blur-2xl opacity-40" />
              <h1 className="relative text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Dashboard
              </h1>
            </div>
            <p className="text-gray-500 text-xs sm:text-sm mt-1 sm:mt-2">
              Real-time market data and portfolio analytics
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] w-fit">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
            <span className="text-xs font-medium text-gray-400">Markets Open</span>
          </div>
        </motion.div>

        {/* SECTION 1 — MARKET OVERVIEW (full width, 5 columns) */}
        <section>
          <MarketOverviewSection />
        </section>

        {/* SECTION 2 — TOP MOVERS + AI INSIGHT (70/30 split) */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
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
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
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
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-4 sm:gap-5 lg:gap-6">
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
