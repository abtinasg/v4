'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/cinematic'
import { RefreshCw } from 'lucide-react'

interface Sector {
  name: string
  symbol: string
  change: number
}

const defaultSectors: Sector[] = [
  { name: 'Technology', symbol: 'XLK', change: 0 },
  { name: 'Healthcare', symbol: 'XLV', change: 0 },
  { name: 'Financials', symbol: 'XLF', change: 0 },
  { name: 'Consumer', symbol: 'XLY', change: 0 },
  { name: 'Industrials', symbol: 'XLI', change: 0 },
  { name: 'Energy', symbol: 'XLE', change: 0 },
  { name: 'Materials', symbol: 'XLB', change: 0 },
  { name: 'Utilities', symbol: 'XLU', change: 0 },
  { name: 'Real Estate', symbol: 'XLRE', change: 0 },
  { name: 'Comm. Svcs', symbol: 'XLC', change: 0 },
]

const getHeatmapStyle = (change: number) => {
  const absChange = Math.abs(change)
  const intensity = Math.min(absChange / 3, 1)
  
  if (change >= 0) {
    return {
      background: `rgba(16, 185, 129, ${0.1 + intensity * 0.25})`,
      border: `rgba(16, 185, 129, ${0.1 + intensity * 0.15})`,
      text: change > 1 ? 'text-emerald-300' : 'text-emerald-400',
    }
  } else {
    return {
      background: `rgba(244, 63, 94, ${0.1 + intensity * 0.25})`,
      border: `rgba(244, 63, 94, ${0.1 + intensity * 0.15})`,
      text: change < -1 ? 'text-rose-300' : 'text-rose-400',
    }
  }
}

interface SectorHeatmapProps {
  className?: string
}

export function SectorHeatmap({ className }: SectorHeatmapProps) {
  const [sectors, setSectors] = useState<Sector[]>(defaultSectors)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSectors = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/market/sectors')
      if (!response.ok) throw new Error('Failed to fetch sectors')
      const result = await response.json()
      
      const sectorData = result.sectors || result.data
      if (result.success && sectorData) {
        const sectorMapping: Record<string, string> = {
          'Technology': 'XLK',
          'Healthcare': 'XLV',
          'Financial Services': 'XLF',
          'Financials': 'XLF',
          'Consumer Cyclical': 'XLY',
          'Consumer Discretionary': 'XLY',
          'Industrials': 'XLI',
          'Energy': 'XLE',
          'Basic Materials': 'XLB',
          'Materials': 'XLB',
          'Utilities': 'XLU',
          'Real Estate': 'XLRE',
          'Communication Services': 'XLC',
        }

        const mappedSectors = sectorData
          .filter((s: { name: string }) => sectorMapping[s.name])
          .map((s: { name: string; change?: number; changesPercentage?: number }) => ({
            name: s.name
              .replace('Financial Services', 'Financials')
              .replace('Consumer Cyclical', 'Consumer')
              .replace('Consumer Discretionary', 'Consumer')
              .replace('Basic Materials', 'Materials')
              .replace('Communication Services', 'Comm. Svcs'),
            symbol: sectorMapping[s.name],
            change: s.change ?? s.changesPercentage ?? 0,
          }))
          .slice(0, 10)

        if (mappedSectors.length > 0) {
          setSectors(mappedSectors)
        }
      }
    } catch (err) {
      console.error('Error fetching sectors:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSectors()
    const interval = setInterval(fetchSectors, 60000)
    return () => clearInterval(interval)
  }, [])

  const sortedSectors = [...sectors].sort((a, b) => Math.abs(b.change) - Math.abs(a.change))

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn('h-full', className)}
    >
      <GlassCard className="h-full p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-medium text-white">Sector Performance</h3>
            <p className="text-xs text-white/35 mt-0.5">Today's performance</p>
          </div>
          <button
            onClick={fetchSectors}
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

        {/* Heatmap Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {sortedSectors.map((sector, index) => {
            const style = getHeatmapStyle(sector.change)
            
            return (
              <motion.div
                key={sector.symbol}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: index * 0.03 }}
                className={cn(
                  'relative rounded-xl p-3 sm:p-4 cursor-pointer',
                  'border transition-all duration-200',
                  'hover:scale-[1.02]'
                )}
                style={{
                  backgroundColor: style.background,
                  borderColor: style.border,
                }}
              >
                <div className="text-center">
                  <span className="text-[10px] sm:text-xs text-white/60 font-medium block mb-1 truncate">
                    {sector.name}
                  </span>
                  <span className={cn('text-sm sm:text-base font-semibold tabular-nums', style.text)}>
                    {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(2)}%
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-white/[0.04]">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-emerald-500/30" />
            <span className="text-xs text-white/40">Gainers</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded bg-rose-500/30" />
            <span className="text-xs text-white/40">Losers</span>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
