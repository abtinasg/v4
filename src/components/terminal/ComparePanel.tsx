'use client'

import { useState, useEffect } from 'react'
import { GitCompare, TrendingUp, TrendingDown, Plus, X, Search } from 'lucide-react'

interface CompareStock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  marketCap: string
  peRatio: number
  eps: number
  dividend: number
  beta: number
  revenue: string
  profit: string
  margin: number
  roe: number
  debtEquity: number
  fiftyTwoWeekHigh: number
  fiftyTwoWeekLow: number
}

export function ComparePanel() {
  const [stocks, setStocks] = useState<CompareStock[]>([])
  const [loading, setLoading] = useState(true)
  const [searchInput, setSearchInput] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  useEffect(() => {
    // Sample comparison data
    setStocks([
      { symbol: 'AAPL', name: 'Apple Inc', price: 182.52, change: 2.45, changePercent: 1.36, marketCap: '2.84T', peRatio: 28.5, eps: 6.40, dividend: 0.51, beta: 1.28, revenue: '383.3B', profit: '96.9B', margin: 25.3, roe: 147.2, debtEquity: 1.81, fiftyTwoWeekHigh: 199.62, fiftyTwoWeekLow: 164.08 },
      { symbol: 'MSFT', name: 'Microsoft Corp', price: 415.50, change: -3.12, changePercent: -0.74, marketCap: '3.09T', peRatio: 36.2, eps: 11.48, dividend: 0.72, beta: 0.89, revenue: '211.9B', profit: '72.4B', margin: 34.2, roe: 38.5, debtEquity: 0.35, fiftyTwoWeekHigh: 430.82, fiftyTwoWeekLow: 309.45 },
      { symbol: 'GOOGL', name: 'Alphabet Inc', price: 141.80, change: 1.25, changePercent: 0.89, marketCap: '1.78T', peRatio: 24.8, eps: 5.72, dividend: 0, beta: 1.05, revenue: '307.4B', profit: '73.8B', margin: 24.0, roe: 25.3, debtEquity: 0.11, fiftyTwoWeekHigh: 153.78, fiftyTwoWeekLow: 120.21 },
    ])
    setLoading(false)
  }, [])

  const handleAddStock = (symbol: string) => {
    // Sample data for new stock
    const newStock: CompareStock = {
      symbol: symbol.toUpperCase(),
      name: symbol.toUpperCase(),
      price: Math.random() * 500 + 50,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      marketCap: `${(Math.random() * 2 + 0.1).toFixed(2)}T`,
      peRatio: Math.random() * 50 + 10,
      eps: Math.random() * 15 + 1,
      dividend: Math.random() * 3,
      beta: Math.random() * 1.5 + 0.5,
      revenue: `${(Math.random() * 300 + 50).toFixed(1)}B`,
      profit: `${(Math.random() * 100 + 10).toFixed(1)}B`,
      margin: Math.random() * 30 + 10,
      roe: Math.random() * 50 + 5,
      debtEquity: Math.random() * 2,
      fiftyTwoWeekHigh: Math.random() * 600 + 100,
      fiftyTwoWeekLow: Math.random() * 200 + 50,
    }
    setStocks(prev => [...prev, newStock])
    setSearchInput('')
    setShowSearch(false)
  }

  const handleRemoveStock = (symbol: string) => {
    setStocks(prev => prev.filter(s => s.symbol !== symbol))
  }

  const getComparisonColor = (values: number[], index: number, higherIsBetter: boolean = true) => {
    if (values.length < 2) return 'text-white'
    const sorted = [...values].sort((a, b) => higherIsBetter ? b - a : a - b)
    if (values[index] === sorted[0]) return 'text-green-400'
    if (values[index] === sorted[sorted.length - 1]) return 'text-red-400'
    return 'text-white'
  }

  const metrics: { label: string; key: string; format: (v: any) => string; higherIsBetter: boolean | null }[] = [
    { label: 'Price', key: 'price', format: (v: number) => `$${v.toFixed(2)}`, higherIsBetter: null },
    { label: 'Change', key: 'changePercent', format: (v: number) => `${v >= 0 ? '+' : ''}${v.toFixed(2)}%`, higherIsBetter: true },
    { label: 'Market Cap', key: 'marketCap', format: (v: string) => v, higherIsBetter: null },
    { label: 'P/E Ratio', key: 'peRatio', format: (v: number) => v.toFixed(1), higherIsBetter: false },
    { label: 'EPS', key: 'eps', format: (v: number) => `$${v.toFixed(2)}`, higherIsBetter: true },
    { label: 'Dividend Yield', key: 'dividend', format: (v: number) => `${v.toFixed(2)}%`, higherIsBetter: true },
    { label: 'Beta', key: 'beta', format: (v: number) => v.toFixed(2), higherIsBetter: null },
    { label: 'Revenue', key: 'revenue', format: (v: string) => v, higherIsBetter: null },
    { label: 'Net Income', key: 'profit', format: (v: string) => v, higherIsBetter: null },
    { label: 'Profit Margin', key: 'margin', format: (v: number) => `${v.toFixed(1)}%`, higherIsBetter: true },
    { label: 'ROE', key: 'roe', format: (v: number) => `${v.toFixed(1)}%`, higherIsBetter: true },
    { label: 'Debt/Equity', key: 'debtEquity', format: (v: number) => v.toFixed(2), higherIsBetter: false },
    { label: '52W High', key: 'fiftyTwoWeekHigh', format: (v: number) => `$${v.toFixed(2)}`, higherIsBetter: null },
    { label: '52W Low', key: 'fiftyTwoWeekLow', format: (v: number) => `$${v.toFixed(2)}`, higherIsBetter: null },
  ]

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-purple-500" />
          <span className="text-sm font-bold text-purple-500">STOCK COMPARE</span>
          <span className="text-xs text-gray-500">({stocks.length} stocks)</span>
        </div>
        <div className="flex items-center gap-2">
          {showSearch ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value.toUpperCase())}
                onKeyDown={(e) => e.key === 'Enter' && searchInput && handleAddStock(searchInput)}
                placeholder="SYMBOL"
                className="w-24 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white font-mono"
                autoFocus
              />
              <button
                onClick={() => searchInput && handleAddStock(searchInput)}
                className="p-1.5 rounded bg-purple-600 hover:bg-purple-500 text-white"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => { setShowSearch(false); setSearchInput('') }}
                className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="flex items-center gap-1 px-2 py-1 rounded bg-purple-600 hover:bg-purple-500 text-white text-xs"
            >
              <Plus className="w-3 h-3" />
              Add Stock
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading comparison...</div>
          </div>
        ) : stocks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <GitCompare className="w-12 h-12 mb-2 opacity-20" />
            <span>Add stocks to compare</span>
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-[#111] border-b border-gray-800 z-10">
              <tr>
                <th className="text-left p-2 text-gray-500 w-32">METRIC</th>
                {stocks.map((stock) => (
                  <th key={stock.symbol} className="text-center p-2 min-w-[120px]">
                    <div className="flex items-center justify-center gap-1">
                      <span className="text-purple-400 font-mono font-bold">{stock.symbol}</span>
                      <button
                        onClick={() => handleRemoveStock(stock.symbol)}
                        className="p-0.5 rounded hover:bg-red-900/50 text-gray-500 hover:text-red-400"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-gray-500 text-[10px] font-normal">{stock.name}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric, idx) => {
                const values = stocks.map(s => {
                  const val = s[metric.key as keyof CompareStock]
                  return typeof val === 'number' ? val : 0
                })
                
                return (
                  <tr 
                    key={metric.key}
                    className={`border-b border-gray-800/50 ${idx % 2 === 0 ? 'bg-gray-900/20' : ''}`}
                  >
                    <td className="p-2 text-gray-400 font-medium">{metric.label}</td>
                    {stocks.map((stock, i) => {
                      const value = stock[metric.key as keyof CompareStock]
                      const color = metric.higherIsBetter !== null 
                        ? getComparisonColor(values, i, metric.higherIsBetter)
                        : 'text-white'
                      
                      return (
                        <td key={stock.symbol} className={`p-2 text-center font-mono ${color}`}>
                          {typeof value === 'number' 
                            ? metric.format(value)
                            : value
                          }
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      <div className="p-2 border-t border-gray-800 text-xs text-gray-500 flex justify-between">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Best
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            Worst
          </span>
        </div>
        <span>Compare up to 5 stocks</span>
      </div>
    </div>
  )
}
