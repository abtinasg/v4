'use client'

import { useState, useEffect } from 'react'
import { Activity, TrendingUp, TrendingDown, DollarSign, Clock, Flame } from 'lucide-react'

interface OptionsFlow {
  symbol: string
  name: string
  type: 'call' | 'put'
  strike: number
  expiry: string
  premium: number
  volume: number
  openInterest: number
  sentiment: 'bullish' | 'bearish' | 'neutral'
  unusual: boolean
  time: string
}

export function OptionsPanel() {
  const [flows, setFlows] = useState<OptionsFlow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'calls' | 'puts' | 'unusual'>('all')

  useEffect(() => {
    const fetchOptionsFlow = async () => {
      try {
        setLoading(true)
        // Fetch options for popular symbols
        const symbols = ['SPY', 'QQQ', 'NVDA', 'AAPL', 'TSLA']
        const allFlows: OptionsFlow[] = []
        
        for (const symbol of symbols) {
          try {
            const res = await fetch(`/api/market/options-flow?symbol=${symbol}`)
            if (res.ok) {
              const data = await res.json()
              if (data.success && data.flows?.length > 0) {
                allFlows.push(...data.flows.slice(0, 4)) // Top 4 from each
              }
            }
          } catch (e) {
            console.error(`Failed to fetch options for ${symbol}`)
          }
        }
        
        if (allFlows.length > 0) {
          // Sort by premium
          allFlows.sort((a, b) => b.premium - a.premium)
          setFlows(allFlows.slice(0, 15))
        } else {
          // Fallback sample data
          setFlows([
            { symbol: 'SPY', name: 'S&P 500 ETF', type: 'call', strike: 510, expiry: '2024-03-22', premium: 2500000, volume: 15000, openInterest: 45000, sentiment: 'bullish', unusual: true, time: '14:32:15' },
            { symbol: 'NVDA', name: 'NVIDIA Corp', type: 'call', strike: 900, expiry: '2024-03-22', premium: 3200000, volume: 22000, openInterest: 68000, sentiment: 'bullish', unusual: true, time: '14:25:30' },
          ])
        }
      } catch (error) {
        console.error('Failed to fetch options data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOptionsFlow()
  }, [])

  const filteredFlows = flows.filter(flow => {
    if (filter === 'all') return true
    if (filter === 'calls') return flow.type === 'call'
    if (filter === 'puts') return flow.type === 'put'
    if (filter === 'unusual') return flow.unusual
    return true
  })

  const formatPremium = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toFixed(0)}`
  }

  const formatVolume = (value: number) => {
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toString()
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-500" />
          <span className="text-sm font-bold text-cyan-500">OPTIONS FLOW</span>
        </div>
        <div className="flex gap-1">
          {(['all', 'calls', 'puts', 'unusual'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 text-xs rounded ${
                filter === f 
                  ? 'bg-cyan-600 text-white' 
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
            <div className="text-gray-500">Loading options data...</div>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[#111] border-b border-gray-800">
              <tr className="text-gray-500">
                <th className="text-left p-2">SYMBOL</th>
                <th className="text-center p-2">TYPE</th>
                <th className="text-right p-2">STRIKE</th>
                <th className="text-left p-2">EXPIRY</th>
                <th className="text-right p-2">PREMIUM</th>
                <th className="text-right p-2">VOLUME</th>
                <th className="text-center p-2">SENTIMENT</th>
                <th className="text-left p-2">TIME</th>
              </tr>
            </thead>
            <tbody>
              {filteredFlows.map((flow, idx) => (
                <tr 
                  key={flow.symbol + idx}
                  className={`border-b border-gray-800/50 hover:bg-gray-900/50 cursor-pointer ${flow.unusual ? 'bg-orange-500/5' : ''}`}
                >
                  <td className="p-2">
                    <div className="flex items-center gap-1">
                      {flow.unusual && <Flame className="w-3 h-3 text-orange-500" />}
                      <span className="text-cyan-400 font-mono font-bold">{flow.symbol}</span>
                    </div>
                    <div className="text-gray-500 text-[10px]">{flow.name}</div>
                  </td>
                  <td className="p-2 text-center">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      flow.type === 'call' 
                        ? 'bg-green-500/10 text-green-400' 
                        : 'bg-red-500/10 text-red-400'
                    }`}>
                      {flow.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-2 text-right text-white font-mono">${flow.strike}</td>
                  <td className="p-2 text-gray-400">{flow.expiry}</td>
                  <td className="p-2 text-right">
                    <span className="text-yellow-400 font-mono font-bold">{formatPremium(flow.premium)}</span>
                  </td>
                  <td className="p-2 text-right">
                    <div className="text-white font-mono">{formatVolume(flow.volume)}</div>
                    <div className="text-gray-500 text-[10px]">OI: {formatVolume(flow.openInterest)}</div>
                  </td>
                  <td className="p-2 text-center">
                    {flow.sentiment === 'bullish' ? (
                      <span className="inline-flex items-center gap-1 text-green-400">
                        <TrendingUp className="w-3 h-3" />
                        BULL
                      </span>
                    ) : flow.sentiment === 'bearish' ? (
                      <span className="inline-flex items-center gap-1 text-red-400">
                        <TrendingDown className="w-3 h-3" />
                        BEAR
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </td>
                  <td className="p-2 text-gray-500 font-mono">{flow.time}</td>
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
          <span className="text-gray-500">Calls:</span>
          <span className="text-green-400">{flows.filter(f => f.type === 'call').length}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingDown className="w-3 h-3 text-red-500" />
          <span className="text-gray-500">Puts:</span>
          <span className="text-red-400">{flows.filter(f => f.type === 'put').length}</span>
        </div>
        <div className="flex items-center gap-1">
          <Flame className="w-3 h-3 text-orange-500" />
          <span className="text-gray-500">Unusual:</span>
          <span className="text-orange-400">{flows.filter(f => f.unusual).length}</span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="w-3 h-3 text-yellow-500" />
          <span className="text-gray-500">Total Premium:</span>
          <span className="text-yellow-400">{formatPremium(flows.reduce((a, b) => a + b.premium, 0))}</span>
        </div>
      </div>
    </div>
  )
}
