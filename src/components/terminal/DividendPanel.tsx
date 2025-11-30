'use client'

import { useState, useEffect } from 'react'
import { Calendar, DollarSign, TrendingUp, TrendingDown, Percent } from 'lucide-react'

interface DividendData {
  symbol: string
  name: string
  exDate: string
  payDate: string
  amount: number
  yield: number
  frequency: string
  change: number
}

export function DividendPanel() {
  const [dividends, setDividends] = useState<DividendData[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'upcoming' | 'exdiv' | 'highyield'>('upcoming')

  useEffect(() => {
    const fetchDividends = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/market/dividend-calendar')
        if (res.ok) {
          const data = await res.json()
          if (data.success && data.dividends?.length > 0) {
            setDividends(data.dividends)
          } else {
            // Fallback sample data
            setDividends([
              { symbol: 'AAPL', name: 'Apple Inc', exDate: '2024-02-09', payDate: '2024-02-15', amount: 0.24, yield: 0.51, frequency: 'Quarterly', change: 0 },
              { symbol: 'MSFT', name: 'Microsoft Corp', exDate: '2024-02-14', payDate: '2024-03-14', amount: 0.75, yield: 0.73, frequency: 'Quarterly', change: 10.3 },
              { symbol: 'JNJ', name: 'Johnson & Johnson', exDate: '2024-02-20', payDate: '2024-03-05', amount: 1.24, yield: 3.02, frequency: 'Quarterly', change: 5.1 },
            ])
          }
        }
      } catch (error) {
        console.error('Failed to fetch dividend data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDividends()
  }, [])

  const sortedDividends = [...dividends].sort((a, b) => {
    if (view === 'highyield') return b.yield - a.yield
    return new Date(a.exDate).getTime() - new Date(b.exDate).getTime()
  })

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <DollarSign className="w-4 h-4 text-green-500" />
          <span className="text-sm font-bold text-green-500">DIVIDEND CALENDAR</span>
        </div>
        <div className="flex gap-1">
          {(['upcoming', 'exdiv', 'highyield'] as const).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-2 py-1 text-xs rounded ${
                view === v 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {v === 'upcoming' ? 'UPCOMING' : v === 'exdiv' ? 'EX-DIV' : 'HIGH YIELD'}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading dividend data...</div>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[#111] border-b border-gray-800">
              <tr className="text-gray-500">
                <th className="text-left p-2">SYMBOL</th>
                <th className="text-left p-2">COMPANY</th>
                <th className="text-left p-2">EX-DATE</th>
                <th className="text-left p-2">PAY DATE</th>
                <th className="text-right p-2">AMOUNT</th>
                <th className="text-right p-2">YIELD</th>
                <th className="text-right p-2">CHANGE</th>
              </tr>
            </thead>
            <tbody>
              {sortedDividends.map((div, idx) => (
                <tr 
                  key={div.symbol + idx}
                  className="border-b border-gray-800/50 hover:bg-gray-900/50 cursor-pointer"
                >
                  <td className="p-2">
                    <span className="text-green-400 font-mono font-bold">{div.symbol}</span>
                  </td>
                  <td className="p-2">
                    <div className="text-white">{div.name}</div>
                    <div className="text-gray-500 text-[10px]">{div.frequency}</div>
                  </td>
                  <td className="p-2 text-gray-300">{div.exDate}</td>
                  <td className="p-2 text-gray-400">{div.payDate}</td>
                  <td className="p-2 text-right text-cyan-400 font-mono">${div.amount.toFixed(2)}</td>
                  <td className="p-2 text-right">
                    <span className={`font-mono ${div.yield >= 4 ? 'text-green-400' : 'text-gray-300'}`}>
                      {div.yield.toFixed(2)}%
                    </span>
                  </td>
                  <td className="p-2 text-right">
                    {div.change > 0 ? (
                      <span className="text-green-400 font-mono flex items-center justify-end gap-1">
                        <TrendingUp className="w-3 h-3" />
                        +{div.change}%
                      </span>
                    ) : div.change < 0 ? (
                      <span className="text-red-400 font-mono flex items-center justify-end gap-1">
                        <TrendingDown className="w-3 h-3" />
                        {div.change}%
                      </span>
                    ) : (
                      <span className="text-gray-500 font-mono">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Summary Stats */}
      <div className="p-2 border-t border-gray-800 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3 text-green-500" />
          <span className="text-gray-500">This Week:</span>
          <span className="text-green-400">{dividends.length}</span>
        </div>
        <div className="flex items-center gap-1">
          <Percent className="w-3 h-3 text-cyan-500" />
          <span className="text-gray-500">Avg Yield:</span>
          <span className="text-cyan-400">
            {(dividends.reduce((a, b) => a + b.yield, 0) / dividends.length).toFixed(2)}%
          </span>
        </div>
      </div>
    </div>
  )
}
