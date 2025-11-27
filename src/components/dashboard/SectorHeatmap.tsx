'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/cinematic'
import { RefreshCw, Loader2 } from 'lucide-react'

interface Sector {
  name: string
  symbol: string
  change: number
}

const defaultSectors: Sector[] = [
  { name: 'Technology', symbol: 'XLK', change: 0 },
  { name: 'Healthcare', symbol: 'XLV', change: 0 },
  { name: 'Financials', symbol: 'XLF', change: 0 },
  { name: 'Consumer Disc.', symbol: 'XLY', change: 0 },
  { name: 'Industrials', symbol: 'XLI', change: 0 },
  { name: 'Energy', symbol: 'XLE', change: 0 },
  { name: 'Materials', symbol: 'XLB', change: 0 },
  { name: 'Utilities', symbol: 'XLU', change: 0 },
  { name: 'Real Estate', symbol: 'XLRE', change: 0 },
  { name: 'Comm. Services', symbol: 'XLC', change: 0 },
]

// Get color intensity based on change percentage
const getHeatmapColor = (change: number) => {
  const absChange = Math.abs(change)
  
  if (change >= 2) return { bg: 'bg-emerald-500', intensity: 'opacity-90' }
  if (change >= 1) return { bg: 'bg-emerald-500', intensity: 'opacity-70' }
  if (change >= 0.5) return { bg: 'bg-emerald-500', intensity: 'opacity-50' }
  if (change >= 0) return { bg: 'bg-emerald-500', intensity: 'opacity-30' }
  if (change >= -0.5) return { bg: 'bg-red-500', intensity: 'opacity-30' }
  if (change >= -1) return { bg: 'bg-red-500', intensity: 'opacity-50' }
  if (change >= -2) return { bg: 'bg-red-500', intensity: 'opacity-70' }
  return { bg: 'bg-red-500', intensity: 'opacity-90' }
}

const getTextColor = (change: number) => {
  if (change >= 0) return 'text-emerald-300'
  return 'text-red-300'
}

interface SectorHeatmapProps {
  className?: string
}

export function SectorHeatmap({ className }: SectorHeatmapProps) {
  const [sectors, setSectors] = useState<Sector[]>(defaultSectors)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSectors = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/market/sectors')
      if (!response.ok) throw new Error('Failed to fetch sectors')
      const result = await response.json()
      
      // API returns { success, sectors } or { success, data }
      const sectorData = result.sectors || result.data
      if (result.success && sectorData) {
        // Map API response to our sector format
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
          'Consumer Defensive': 'XLP',
        }

        const mappedSectors = sectorData
          .filter((s: { name: string }) => sectorMapping[s.name])
          .map((s: { name: string; change?: number; changesPercentage?: number }) => ({
            name: s.name.replace('Financial Services', 'Financials')
                      .replace('Consumer Cyclical', 'Consumer Disc.')
                      .replace('Consumer Discretionary', 'Consumer Disc.')
                      .replace('Basic Materials', 'Materials')
                      .replace('Communication Services', 'Comm. Services'),
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
      setError('Failed to load sector data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSectors()
    const interval = setInterval(fetchSectors, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [])

  // Sort sectors by absolute change for visual impact
  const sortedSectors = [...sectors].sort((a, b) => Math.abs(b.change) - Math.abs(a.change))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.5 }}
      className={className}
    >
      <GlassCard className="h-full p-3 sm:p-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4 sm:mb-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 via-transparent to-red-500/20 blur-lg opacity-50" />
              <h3 className="relative text-sm sm:text-base font-semibold text-white">Sector Performance</h3>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-3 text-[10px] text-gray-500">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-emerald-500 opacity-70" />
                <span>Gainers</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-red-500 opacity-70" />
                <span>Losers</span>
              </div>
            </div>
            <button
              onClick={fetchSectors}
              disabled={isLoading}
              className={cn(
                'p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]',
                'hover:bg-white/[0.06] hover:border-emerald-500/30',
                'text-gray-400 hover:text-emerald-400 transition-all duration-300',
                'disabled:opacity-50'
              )}
            >
              {isLoading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <RefreshCw className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Heatmap Grid - 2x5 on mobile, 5x2 on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {sortedSectors.map((sector, index) => {
            const { bg, intensity } = getHeatmapColor(sector.change)
            const textColor = getTextColor(sector.change)
            
            return (
              <motion.div
                key={sector.symbol}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ 
                  duration: 0.4, 
                  delay: 0.2 + index * 0.05,
                  ease: [0.22, 1, 0.36, 1]
                }}
                whileHover={{ scale: 1.05 }}
                className={cn(
                  'relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer',
                  'border border-white/[0.08] hover:border-white/[0.15]',
                  'transition-all duration-300',
                  'group'
                )}
              >
                {/* Background color layer */}
                <div className={cn(
                  'absolute inset-0',
                  bg,
                  intensity,
                  'transition-opacity duration-300 group-hover:opacity-90'
                )} />
                
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                
                {/* Content */}
                <div className="relative h-full flex flex-col items-center justify-center p-2">
                  <span className="text-[10px] font-medium text-white/80 text-center leading-tight mb-1 truncate max-w-full">
                    {sector.name}
                  </span>
                  <span className={cn(
                    'text-sm font-bold tabular-nums',
                    textColor
                  )}>
                    {sector.change >= 0 ? '+' : ''}{sector.change.toFixed(2)}%
                  </span>
                </div>

                {/* Hover glow */}
                <div className={cn(
                  'absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300',
                  sector.change >= 0 
                    ? 'shadow-[inset_0_0_20px_rgba(34,197,94,0.3)]' 
                    : 'shadow-[inset_0_0_20px_rgba(239,68,68,0.3)]'
                )} />
              </motion.div>
            )
          })}
        </div>

        {/* Summary Stats */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/[0.06]">
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Top:</span>
              <span className="font-semibold text-emerald-400">
                {sectors.reduce((best, s) => s.change > best.change ? s : best).name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">Bottom:</span>
              <span className="font-semibold text-red-400">
                {sectors.reduce((worst, s) => s.change < worst.change ? s : worst).name}
              </span>
            </div>
          </div>
        </div>
      </GlassCard>
    </motion.div>
  )
}
