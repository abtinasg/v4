'use client'

import { useState, useEffect } from 'react'
import { Star, TrendingUp, TrendingDown, Target, Building2 } from 'lucide-react'

interface AnalystRating {
  symbol: string
  name: string
  firm: string
  analyst: string
  action: 'upgrade' | 'downgrade' | 'initiated' | 'reiterated'
  fromRating: string
  toRating: string
  fromTarget: number | null
  toTarget: number | null
  date: string
}

export function AnalystPanel() {
  const [ratings, setRatings] = useState<AnalystRating[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upgrade' | 'downgrade'>('all')

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/market/analyst-ratings')
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.ratings?.length > 0) {
            setRatings(data.ratings)
          } else {
            // Fallback sample data
            setRatings([
              { symbol: 'NVDA', name: 'NVIDIA Corp', firm: 'Goldman Sachs', analyst: 'John Smith', action: 'upgrade', fromRating: 'Hold', toRating: 'Buy', fromTarget: 800, toTarget: 1000, date: '2024-03-15' },
              { symbol: 'AAPL', name: 'Apple Inc', firm: 'Morgan Stanley', analyst: 'Jane Doe', action: 'reiterated', fromRating: 'Overweight', toRating: 'Overweight', fromTarget: 200, toTarget: 220, date: '2024-03-15' },
            ])
          }
        }
      } catch (error) {
        console.error('Failed to fetch analyst data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRatings()
  }, [])

  const filteredRatings = ratings.filter(r => {
    if (filter === 'all') return true
    return r.action === filter
  })

  const getActionColor = (action: string) => {
    switch (action) {
      case 'upgrade': return 'text-green-400 bg-green-500/10'
      case 'downgrade': return 'text-red-400 bg-red-500/10'
      case 'initiated': return 'text-cyan-400 bg-cyan-500/10'
      case 'reiterated': return 'text-yellow-400 bg-yellow-500/10'
      default: return 'text-gray-400 bg-gray-500/10'
    }
  }

  const getRatingColor = (rating: string) => {
    const lower = rating.toLowerCase()
    if (lower.includes('buy') || lower.includes('overweight') || lower.includes('outperform')) {
      return 'text-green-400'
    }
    if (lower.includes('sell') || lower.includes('underweight') || lower.includes('underperform')) {
      return 'text-red-400'
    }
    return 'text-yellow-400'
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Star className="w-4 h-4 text-yellow-500" />
          <span className="text-sm font-bold text-yellow-500">ANALYST RATINGS</span>
        </div>
        <div className="flex gap-1">
          {(['all', 'upgrade', 'downgrade'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 text-xs rounded ${
                filter === f 
                  ? 'bg-yellow-600 text-white' 
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
            <div className="text-gray-500">Loading analyst data...</div>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[#111] border-b border-gray-800">
              <tr className="text-gray-500">
                <th className="text-left p-2">SYMBOL</th>
                <th className="text-left p-2">FIRM</th>
                <th className="text-center p-2">ACTION</th>
                <th className="text-center p-2">RATING</th>
                <th className="text-center p-2">PRICE TARGET</th>
                <th className="text-left p-2">DATE</th>
              </tr>
            </thead>
            <tbody>
              {filteredRatings.map((rating, idx) => (
                <tr 
                  key={rating.symbol + idx}
                  className="border-b border-gray-800/50 hover:bg-gray-900/50 cursor-pointer"
                >
                  <td className="p-2">
                    <span className="text-yellow-400 font-mono font-bold">{rating.symbol}</span>
                    <div className="text-gray-500 text-[10px]">{rating.name}</div>
                  </td>
                  <td className="p-2">
                    <div className="text-white">{rating.firm}</div>
                    <div className="text-gray-500 text-[10px]">{rating.analyst}</div>
                  </td>
                  <td className="p-2 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${getActionColor(rating.action)}`}>
                      {rating.action}
                    </span>
                  </td>
                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className={getRatingColor(rating.fromRating)}>{rating.fromRating}</span>
                      <span className="text-gray-600">→</span>
                      <span className={`font-bold ${getRatingColor(rating.toRating)}`}>{rating.toRating}</span>
                    </div>
                  </td>
                  <td className="p-2 text-center">
                    <div className="flex items-center justify-center gap-1 font-mono">
                      {rating.fromTarget && (
                        <>
                          <span className="text-gray-500">${rating.fromTarget}</span>
                          <span className="text-gray-600">→</span>
                        </>
                      )}
                      <span className={`font-bold ${rating.toTarget && rating.fromTarget ? (rating.toTarget > rating.fromTarget ? 'text-green-400' : 'text-red-400') : 'text-cyan-400'}`}>
                        ${rating.toTarget}
                      </span>
                    </div>
                  </td>
                  <td className="p-2 text-gray-400">{rating.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary Stats */}
      <div className="p-2 border-t border-gray-800 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3 text-green-500" />
          <span className="text-gray-500">Upgrades:</span>
          <span className="text-green-400">{ratings.filter(r => r.action === 'upgrade').length}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingDown className="w-3 h-3 text-red-500" />
          <span className="text-gray-500">Downgrades:</span>
          <span className="text-red-400">{ratings.filter(r => r.action === 'downgrade').length}</span>
        </div>
        <div className="flex items-center gap-1">
          <Target className="w-3 h-3 text-cyan-500" />
          <span className="text-gray-500">New Coverage:</span>
          <span className="text-cyan-400">{ratings.filter(r => r.action === 'initiated').length}</span>
        </div>
      </div>
    </div>
  )
}
