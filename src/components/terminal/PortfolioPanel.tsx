'use client'

import { useState, useEffect } from 'react'
import { Briefcase, TrendingUp, TrendingDown, DollarSign, PieChart, BarChart3, Plus } from 'lucide-react'

interface PortfolioHolding {
  symbol: string
  name: string
  shares: number
  avgCost: number
  currentPrice: number
  value: number
  gain: number
  gainPercent: number
  dayChange: number
  dayChangePercent: number
  allocation: number
}

export function PortfolioPanel() {
  const [holdings, setHoldings] = useState<PortfolioHolding[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'value' | 'gain' | 'day'>('value')

  useEffect(() => {
    // Sample portfolio data
    const sampleHoldings: PortfolioHolding[] = [
      { symbol: 'AAPL', name: 'Apple Inc', shares: 50, avgCost: 150.25, currentPrice: 182.52, value: 9126, gain: 1613.50, gainPercent: 21.48, dayChange: 126, dayChangePercent: 1.40, allocation: 25.2 },
      { symbol: 'NVDA', name: 'NVIDIA Corp', shares: 15, avgCost: 450.00, currentPrice: 878.35, value: 13175.25, gain: 6425.25, gainPercent: 95.19, dayChange: 395.25, dayChangePercent: 3.09, allocation: 36.3 },
      { symbol: 'MSFT', name: 'Microsoft Corp', shares: 20, avgCost: 350.00, currentPrice: 415.50, value: 8310, gain: 1310, gainPercent: 18.71, dayChange: -82, dayChangePercent: -0.98, allocation: 22.9 },
      { symbol: 'GOOGL', name: 'Alphabet Inc', shares: 30, avgCost: 125.00, currentPrice: 141.80, value: 4254, gain: 504, gainPercent: 13.44, dayChange: 42.60, dayChangePercent: 1.01, allocation: 11.7 },
      { symbol: 'META', name: 'Meta Platforms', shares: 5, avgCost: 280.00, currentPrice: 502.30, value: 2511.50, gain: 1111.50, gainPercent: 79.39, dayChange: 75.45, dayChangePercent: 3.10, allocation: 6.9 },
      { symbol: 'TSLA', name: 'Tesla Inc', shares: 10, avgCost: 200.00, currentPrice: 178.25, value: 1782.50, gain: -217.50, gainPercent: -10.88, dayChange: -53.47, dayChangePercent: -2.91, allocation: 4.9 },
    ]
    
    setHoldings(sampleHoldings)
    setLoading(false)
  }, [])

  const sortedHoldings = [...holdings].sort((a, b) => {
    switch (sortBy) {
      case 'value': return b.value - a.value
      case 'gain': return b.gainPercent - a.gainPercent
      case 'day': return b.dayChangePercent - a.dayChangePercent
      default: return 0
    }
  })

  const totalValue = holdings.reduce((a, b) => a + b.value, 0)
  const totalGain = holdings.reduce((a, b) => a + b.gain, 0)
  const totalDayChange = holdings.reduce((a, b) => a + b.dayChange, 0)
  const totalCost = holdings.reduce((a, b) => a + (b.avgCost * b.shares), 0)
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0
  const totalDayPercent = totalValue > 0 ? (totalDayChange / (totalValue - totalDayChange)) * 100 : 0

  const formatCurrency = (value: number) => {
    if (Math.abs(value) >= 1000000) return `$${(value / 1000000).toFixed(2)}M`
    if (Math.abs(value) >= 1000) return `$${(value / 1000).toFixed(1)}K`
    return `$${value.toFixed(2)}`
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-blue-500" />
          <span className="text-sm font-bold text-blue-500">PORTFOLIO</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(['value', 'gain', 'day'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                className={`px-2 py-1 text-xs rounded ${
                  sortBy === s 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {s === 'value' ? 'VALUE' : s === 'gain' ? 'TOTAL P/L' : 'DAY'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-4 gap-2 p-3 border-b border-gray-800 bg-gray-900/30">
        <div>
          <div className="text-gray-500 text-[10px] mb-1">TOTAL VALUE</div>
          <div className="text-white font-mono text-lg">{formatCurrency(totalValue)}</div>
        </div>
        <div>
          <div className="text-gray-500 text-[10px] mb-1">TOTAL GAIN/LOSS</div>
          <div className={`font-mono text-lg ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalGain >= 0 ? '+' : ''}{formatCurrency(totalGain)}
            <span className="text-xs ml-1">({totalGainPercent.toFixed(2)}%)</span>
          </div>
        </div>
        <div>
          <div className="text-gray-500 text-[10px] mb-1">TODAY</div>
          <div className={`font-mono text-lg ${totalDayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalDayChange >= 0 ? '+' : ''}{formatCurrency(totalDayChange)}
            <span className="text-xs ml-1">({totalDayPercent.toFixed(2)}%)</span>
          </div>
        </div>
        <div>
          <div className="text-gray-500 text-[10px] mb-1">POSITIONS</div>
          <div className="text-white font-mono text-lg">{holdings.length}</div>
        </div>
      </div>

      {/* Holdings Table */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading portfolio...</div>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[#111] border-b border-gray-800">
              <tr className="text-gray-500">
                <th className="text-left p-2">SYMBOL</th>
                <th className="text-right p-2">SHARES</th>
                <th className="text-right p-2">PRICE</th>
                <th className="text-right p-2">VALUE</th>
                <th className="text-right p-2">GAIN/LOSS</th>
                <th className="text-right p-2">TODAY</th>
                <th className="text-right p-2">ALLOC</th>
              </tr>
            </thead>
            <tbody>
              {sortedHoldings.map((holding) => (
                <tr 
                  key={holding.symbol}
                  className="border-b border-gray-800/50 hover:bg-gray-900/50 cursor-pointer"
                >
                  <td className="p-2">
                    <span className="text-blue-400 font-mono font-bold">{holding.symbol}</span>
                    <div className="text-gray-500 text-[10px]">{holding.name}</div>
                  </td>
                  <td className="p-2 text-right text-gray-300 font-mono">{holding.shares}</td>
                  <td className="p-2 text-right">
                    <div className="text-white font-mono">${holding.currentPrice.toFixed(2)}</div>
                    <div className="text-gray-500 text-[10px]">Avg: ${holding.avgCost.toFixed(2)}</div>
                  </td>
                  <td className="p-2 text-right text-cyan-400 font-mono font-bold">{formatCurrency(holding.value)}</td>
                  <td className="p-2 text-right">
                    <div className={`font-mono ${holding.gain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {holding.gain >= 0 ? '+' : ''}{formatCurrency(holding.gain)}
                    </div>
                    <div className={`text-[10px] ${holding.gainPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {holding.gainPercent >= 0 ? '+' : ''}{holding.gainPercent.toFixed(2)}%
                    </div>
                  </td>
                  <td className="p-2 text-right">
                    <div className={`flex items-center justify-end gap-1 font-mono ${holding.dayChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {holding.dayChange >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {holding.dayChangePercent >= 0 ? '+' : ''}{holding.dayChangePercent.toFixed(2)}%
                    </div>
                  </td>
                  <td className="p-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <div className="w-12 h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${holding.allocation}%` }}
                        />
                      </div>
                      <span className="text-gray-400 font-mono w-10">{holding.allocation.toFixed(1)}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-800 flex justify-between text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-green-500" />
            <span className="text-gray-500">Winners:</span>
            <span className="text-green-400">{holdings.filter(h => h.gain > 0).length}</span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingDown className="w-3 h-3 text-red-500" />
            <span className="text-gray-500">Losers:</span>
            <span className="text-red-400">{holdings.filter(h => h.gain < 0).length}</span>
          </div>
        </div>
        <button className="flex items-center gap-1 px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white">
          <Plus className="w-3 h-3" />
          Add Position
        </button>
      </div>
    </div>
  )
}
