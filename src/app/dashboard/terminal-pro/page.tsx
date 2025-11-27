'use client'

import { useState } from 'react'
import { 
  LayoutGrid, 
  Maximize2, 
  Settings, 
  RefreshCcw,
  Monitor,
  Grid3X3
} from 'lucide-react'
import {
  MarketIndicesPanel,
  SectorsPanel,
  CurrenciesPanel,
  GlobalMarketsPanel,
  CommoditiesPanel,
  FixedIncomePanel,
  NewsPanel,
  MarketStatusPanel
} from '@/components/terminal'
import { cn } from '@/lib/utils'

type LayoutMode = '8-panel' | '6-panel' | '4-panel'

export default function TerminalProPage() {
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('8-panel')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const refreshAll = () => {
    // Trigger refresh on all panels
    window.location.reload()
  }

  return (
    <div className={cn(
      "flex flex-col h-full",
      isFullscreen ? "fixed inset-0 z-50 bg-[#030508]" : ""
    )}>
      {/* Terminal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0 pb-4 border-b border-white/[0.04] mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Monitor className="w-5 h-5 text-cyan-400" />
            <h1 className="text-xl sm:text-2xl font-bold text-white">Terminal Pro</h1>
            <span className="text-[9px] font-bold text-cyan-400 bg-cyan-500/10 px-1.5 py-0.5 rounded">BETA</span>
          </div>
          <p className="text-gray-500 text-xs sm:text-sm mt-1">
            Bloomberg-style professional trading terminal with real-time market data
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Layout Selector */}
          <div className="flex items-center gap-1 bg-white/[0.02] rounded-lg p-1">
            {(['8-panel', '6-panel', '4-panel'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setLayoutMode(mode)}
                className={cn(
                  'px-2 py-1 text-[10px] font-bold rounded transition-colors',
                  layoutMode === mode
                    ? 'bg-cyan-500/20 text-cyan-400'
                    : 'text-gray-500 hover:text-gray-300'
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <button
            onClick={refreshAll}
            className="p-2 text-gray-500 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
            title="Refresh All"
          >
            <RefreshCcw className="w-4 h-4" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-500 hover:text-white hover:bg-white/[0.05] rounded-lg transition-colors"
            title="Fullscreen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Terminal Grid */}
      <div className={cn(
        "flex-1 grid gap-3",
        layoutMode === '8-panel' && "grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-fr",
        layoutMode === '6-panel' && "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr",
        layoutMode === '4-panel' && "grid-cols-1 md:grid-cols-2 auto-rows-fr"
      )}>
        {/* Row 1: Market Status & Indices */}
        <MarketStatusPanel className="h-full min-h-[320px] lg:min-h-0" />
        <MarketIndicesPanel className="h-full min-h-[320px] lg:min-h-0" />
        
        {layoutMode !== '4-panel' && (
          <>
            <SectorsPanel className="h-full min-h-[320px] lg:min-h-0" />
            {layoutMode === '8-panel' && (
              <GlobalMarketsPanel className="h-full min-h-[320px] lg:min-h-0" />
            )}
          </>
        )}

        {/* Row 2: Fixed Income, Commodities, Currencies, News */}
        <FixedIncomePanel className="h-full min-h-[320px] lg:min-h-0" />
        <CommoditiesPanel className="h-full min-h-[320px] lg:min-h-0" />
        
        {layoutMode !== '4-panel' && (
          <>
            <CurrenciesPanel className="h-full min-h-[320px] lg:min-h-0" />
            {layoutMode === '8-panel' && (
              <NewsPanel className="h-full min-h-[320px] lg:min-h-0" />
            )}
          </>
        )}
      </div>

      {/* Terminal Footer */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 pt-3 mt-4 border-t border-white/[0.04] text-[10px] text-gray-500">
        <div className="flex flex-wrap items-center gap-2 sm:gap-4">
          <span>Data updates every 30s</span>
          <span className="hidden sm:inline">•</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            Live Connection
          </span>
          <span className="hidden sm:inline">•</span>
          <span>Press F11 for fullscreen</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Deep Terminal Pro v1.0</span>
          <span className="text-gray-600">|</span>
          <span className="text-cyan-400/70">Bloomberg-style Interface</span>
        </div>
      </div>
    </div>
  )
}
