'use client'

import { useState, useEffect } from 'react'
import { Calendar, TrendingUp, Building2, DollarSign, Clock, ExternalLink } from 'lucide-react'

interface IPOData {
  symbol: string
  name: string
  exchange: string
  priceRange: string
  shares: string
  expectedDate: string
  status: 'upcoming' | 'priced' | 'withdrawn'
  industry: string
}

export function IPOPanel() {
  const [ipos, setIpos] = useState<IPOData[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'priced'>('all')

  useEffect(() => {
    const fetchIPOs = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/market/ipo-calendar')
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.ipos?.length > 0) {
            setIpos(data.ipos)
          } else {
            // Fallback sample data if API returns empty
            setIpos([
              { symbol: 'RDDT', name: 'Reddit Inc', exchange: 'NYSE', priceRange: '$31-34', shares: '22M', expectedDate: '2024-03-21', status: 'priced', industry: 'Technology' },
              { symbol: 'ASPR', name: 'Astera Labs', exchange: 'NASDAQ', priceRange: '$32-36', shares: '18M', expectedDate: '2024-03-20', status: 'priced', industry: 'Semiconductors' },
              { symbol: 'VZIO', name: 'Vizio Holdings', exchange: 'NYSE', priceRange: '$21-23', shares: '15M', expectedDate: '2024-03-15', status: 'upcoming', industry: 'Consumer Electronics' },
            ])
          }
        }
      } catch (error) {
        console.error('Failed to fetch IPO data:', error)
        // Use sample data on error
        setIpos([
          { symbol: 'RDDT', name: 'Reddit Inc', exchange: 'NYSE', priceRange: '$31-34', shares: '22M', expectedDate: '2024-03-21', status: 'priced', industry: 'Technology' },
        ])
      } finally {
        setLoading(false)
      }
    }

    fetchIPOs()
  }, [])

  const filteredIPOs = ipos.filter(ipo => {
    if (filter === 'all') return true
    return ipo.status === filter
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'priced': return 'text-green-400 bg-green-500/10'
      case 'upcoming': return 'text-yellow-400 bg-yellow-500/10'
      case 'withdrawn': return 'text-red-400 bg-red-500/10'
      default: return 'text-gray-400 bg-gray-500/10'
    }
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-bold text-orange-500">IPO CALENDAR</span>
        </div>
        <div className="flex gap-1">
          {(['all', 'upcoming', 'priced'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 text-xs rounded ${
                filter === f 
                  ? 'bg-orange-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading IPO data...</div>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[#111] border-b border-gray-800">
              <tr className="text-gray-500">
                <th className="text-left p-2">SYMBOL</th>
                <th className="text-left p-2">COMPANY</th>
                <th className="text-left p-2">EXCHANGE</th>
                <th className="text-right p-2">PRICE RANGE</th>
                <th className="text-right p-2">SHARES</th>
                <th className="text-left p-2">DATE</th>
                <th className="text-left p-2">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {filteredIPOs.map((ipo, idx) => (
                <tr 
                  key={ipo.symbol + idx}
                  className="border-b border-gray-800/50 hover:bg-gray-900/50 cursor-pointer"
                >
                  <td className="p-2">
                    <span className="text-orange-400 font-mono font-bold">{ipo.symbol}</span>
                  </td>
                  <td className="p-2">
                    <div className="text-white">{ipo.name}</div>
                    <div className="text-gray-500 text-[10px]">{ipo.industry}</div>
                  </td>
                  <td className="p-2 text-gray-400">{ipo.exchange}</td>
                  <td className="p-2 text-right text-cyan-400 font-mono">{ipo.priceRange}</td>
                  <td className="p-2 text-right text-gray-400 font-mono">{ipo.shares}</td>
                  <td className="p-2 text-gray-300">{ipo.expectedDate}</td>
                  <td className="p-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${getStatusColor(ipo.status)}`}>
                      {ipo.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer Stats */}
      <div className="p-2 border-t border-gray-800 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-yellow-500" />
          <span className="text-gray-500">Upcoming:</span>
          <span className="text-yellow-400">{ipos.filter(i => i.status === 'upcoming').length}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-green-500" />
          <span className="text-gray-500">Priced:</span>
          <span className="text-green-400">{ipos.filter(i => i.status === 'priced').length}</span>
        </div>
      </div>
    </div>
  )
}
