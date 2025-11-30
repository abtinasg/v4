'use client'

import { useState, useEffect } from 'react'
import { UserCheck, TrendingUp, TrendingDown, DollarSign, Building2 } from 'lucide-react'

interface InsiderTrade {
  symbol: string
  name: string
  insiderName: string
  insiderTitle: string
  transactionType: 'buy' | 'sell' | 'option'
  shares: number
  price: number
  value: number
  date: string
  ownership: string
}

export function InsiderPanel() {
  const [trades, setTrades] = useState<InsiderTrade[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'buy' | 'sell'>('all')

  useEffect(() => {
    const fetchInsiderTrades = async () => {
      try {
        setLoading(true)
        // Fetch from multiple symbols
        const symbols = ['NVDA', 'AAPL', 'TSLA', 'META', 'MSFT', 'GOOGL', 'AMZN', 'AMD']
        const allTrades: InsiderTrade[] = []
        
        for (const symbol of symbols.slice(0, 4)) { // Limit to avoid rate limiting
          try {
            const res = await fetch(`/api/market/insider-trading?symbol=${symbol}`)
            if (res.ok) {
              const data = await res.json()
              if (data.success && data.trades?.length > 0) {
                allTrades.push(...data.trades)
              }
            }
          } catch (e) {
            console.error(`Failed to fetch insider data for ${symbol}`)
          }
        }
        
        if (allTrades.length > 0) {
          // Sort by date and take top 20
          allTrades.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          setTrades(allTrades.slice(0, 20))
        } else {
          // Fallback sample data
          setTrades([
            { symbol: 'NVDA', name: 'NVIDIA Corp', insiderName: 'Jensen Huang', insiderTitle: 'CEO', transactionType: 'sell', shares: 120000, price: 878.35, value: 105402000, date: '2024-03-15', ownership: 'Direct' },
            { symbol: 'AAPL', name: 'Apple Inc', insiderName: 'Tim Cook', insiderTitle: 'CEO', transactionType: 'sell', shares: 50000, price: 172.50, value: 8625000, date: '2024-03-14', ownership: 'Direct' },
          ])
        }
      } catch (error) {
        console.error('Failed to fetch insider data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchInsiderTrades()
  }, [])

  const filteredTrades = trades.filter(trade => {
    if (filter === 'all') return true
    return trade.transactionType === filter
  })

  const formatValue = (value: number) => {
    if (value >= 1000000) return `$${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `$${(value / 1000).toFixed(0)}K`
    return `$${value.toFixed(0)}`
  }

  const formatShares = (shares: number) => {
    if (shares >= 1000000) return `${(shares / 1000000).toFixed(1)}M`
    if (shares >= 1000) return `${(shares / 1000).toFixed(0)}K`
    return shares.toString()
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-bold text-purple-500">INSIDER TRADING</span>
        </div>
        <div className="flex gap-1">
          {(['all', 'buy', 'sell'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-2 py-1 text-xs rounded ${
                filter === f 
                  ? 'bg-purple-600 text-white' 
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
            <div className="text-gray-500">Loading insider data...</div>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[#111] border-b border-gray-800">
              <tr className="text-gray-500">
                <th className="text-left p-2">SYMBOL</th>
                <th className="text-left p-2">INSIDER</th>
                <th className="text-center p-2">TYPE</th>
                <th className="text-right p-2">SHARES</th>
                <th className="text-right p-2">PRICE</th>
                <th className="text-right p-2">VALUE</th>
                <th className="text-left p-2">DATE</th>
              </tr>
            </thead>
            <tbody>
              {filteredTrades.map((trade, idx) => (
                <tr 
                  key={trade.symbol + idx}
                  className="border-b border-gray-800/50 hover:bg-gray-900/50 cursor-pointer"
                >
                  <td className="p-2">
                    <span className="text-purple-400 font-mono font-bold">{trade.symbol}</span>
                    <div className="text-gray-500 text-[10px]">{trade.name}</div>
                  </td>
                  <td className="p-2">
                    <div className="text-white">{trade.insiderName}</div>
                    <div className="text-gray-500 text-[10px]">{trade.insiderTitle}</div>
                  </td>
                  <td className="p-2 text-center">
                    {trade.transactionType === 'buy' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-500/10 text-green-400 text-[10px]">
                        <TrendingUp className="w-3 h-3" />
                        BUY
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-red-500/10 text-red-400 text-[10px]">
                        <TrendingDown className="w-3 h-3" />
                        SELL
                      </span>
                    )}
                  </td>
                  <td className="p-2 text-right text-gray-300 font-mono">{formatShares(trade.shares)}</td>
                  <td className="p-2 text-right text-cyan-400 font-mono">${trade.price.toFixed(2)}</td>
                  <td className="p-2 text-right">
                    <span className={`font-mono font-bold ${trade.transactionType === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
                      {formatValue(trade.value)}
                    </span>
                  </td>
                  <td className="p-2 text-gray-400">{trade.date}</td>
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
          <span className="text-gray-500">Buys:</span>
          <span className="text-green-400">{trades.filter(t => t.transactionType === 'buy').length}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingDown className="w-3 h-3 text-red-500" />
          <span className="text-gray-500">Sells:</span>
          <span className="text-red-400">{trades.filter(t => t.transactionType === 'sell').length}</span>
        </div>
        <div className="flex items-center gap-1">
          <DollarSign className="w-3 h-3 text-cyan-500" />
          <span className="text-gray-500">Total Value:</span>
          <span className="text-cyan-400">{formatValue(trades.reduce((a, b) => a + b.value, 0))}</span>
        </div>
      </div>
    </div>
  )
}
