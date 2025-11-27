'use client'

import { useState, useEffect } from 'react'
import { PieChart } from 'lucide-react'
import { TerminalPanel, SectorBar } from './TerminalPanel'

interface SectorData {
  name: string
  symbol: string
  change: number
}

const defaultSectors: SectorData[] = [
  { name: 'Technology', symbol: 'XLK', change: 1.24 },
  { name: 'Healthcare', symbol: 'XLV', change: 0.45 },
  { name: 'Financials', symbol: 'XLF', change: 0.82 },
  { name: 'Consumer Disc.', symbol: 'XLY', change: -0.31 },
  { name: 'Industrials', symbol: 'XLI', change: 0.56 },
  { name: 'Energy', symbol: 'XLE', change: -1.12 },
  { name: 'Materials', symbol: 'XLB', change: 0.23 },
  { name: 'Utilities', symbol: 'XLU', change: -0.18 },
  { name: 'Real Estate', symbol: 'XLRE', change: 0.67 },
  { name: 'Comm. Services', symbol: 'XLC', change: 1.45 },
  { name: 'Consumer Staples', symbol: 'XLP', change: 0.12 },
]

interface SectorsPanelProps {
  className?: string
}

export function SectorsPanel({ className }: SectorsPanelProps) {
  const [sectors, setSectors] = useState<SectorData[]>(defaultSectors)
  const [isLoading, setIsLoading] = useState(false)

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/market/sectors')
      const result = await response.json()
      if (result.success && result.sectors) {
        const mapped = result.sectors.map((s: any) => ({
          name: s.name,
          symbol: s.symbol || s.name.substring(0, 3).toUpperCase(),
          change: s.change ?? s.changesPercentage ?? 0,
        }))
        if (mapped.length > 0) setSectors(mapped)
      }
    } catch (error) {
      console.error('Error fetching sectors:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  // Sort by absolute change
  const sortedSectors = [...sectors].sort((a, b) => Math.abs(b.change) - Math.abs(a.change))

  return (
    <TerminalPanel
      title="Equity Sectors"
      icon={<PieChart className="w-3 h-3" />}
      badge="11"
      badgeColor="cyan"
      isLoading={isLoading}
      onRefresh={fetchData}
      className={className}
      noPadding
    >
      <div className="py-1">
        {sortedSectors.map((sector) => (
          <SectorBar
            key={sector.symbol}
            name={sector.name}
            symbol={sector.symbol}
            change={sector.change}
          />
        ))}
      </div>
    </TerminalPanel>
  )
}
