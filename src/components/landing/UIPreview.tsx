'use client'

import { Activity, TrendingUp, TrendingDown, Search, Sparkles, DollarSign, BarChart2 } from 'lucide-react'

export function UIPreview() {
  const currentTime = new Date().toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })

  return (
    <section className="relative py-24 md:py-32 bg-[#05070B] overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-[-10%] w-[600px] h-[600px] rounded-full bg-[#00D4FF]/[0.04] blur-[150px]" />
        <div className="absolute bottom-1/4 right-[-10%] w-[500px] h-[500px] rounded-full bg-[#8B5CF6]/[0.03] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-display text-3xl md:text-4xl lg:text-5xl text-white mb-4">
            Meet{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#3B82F6]">
              Terminal Pro
            </span>
          </h2>
          <p className="text-subhead text-gray-400 max-w-xl mx-auto">
            Bloomberg-style command terminal with real-time data and AI-powered insights.
          </p>
        </div>

        {/* Terminal Pro Preview */}
        <div className="relative">
          {/* Outer glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-orange-500/10 via-[#00D4FF]/10 to-[#00D4FF]/5 blur-3xl rounded-3xl opacity-60" />
          
          {/* Terminal container */}
          <div className="relative rounded-2xl border border-white/[0.08] bg-black/95 backdrop-blur-xl overflow-hidden shadow-2xl">
            {/* Terminal header */}
            <div className="bg-[#0a0a0a] border-b border-orange-500/20 px-4 py-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-orange-400 text-xs font-mono font-semibold">DEEPIN PRO</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400">LIVE</span>
                </div>
                <span className="text-gray-500">{currentTime}</span>
              </div>
            </div>

            {/* Status bar */}
            <div className="bg-[#0f0f0f] border-b border-white/5 px-4 py-2 flex items-center justify-between text-[10px] font-mono">
              <div className="flex items-center gap-4">
                <span className="text-gray-500">NYSE:</span>
                <span className="text-green-400">OPEN</span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-500">NASDAQ:</span>
                <span className="text-green-400">OPEN</span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-500">LSE:</span>
                <span className="text-yellow-400">PRE</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-500">S&P:</span>
                <span className="text-green-400">+0.82%</span>
                <span className="text-gray-600">|</span>
                <span className="text-gray-500">VIX:</span>
                <span className="text-cyan-400">14.2</span>
              </div>
            </div>

            {/* Main terminal area */}
            <div className="bg-black p-6">
              {/* Top movers panel */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-orange-500" />
                  <h3 className="text-orange-400 text-sm font-mono font-semibold">TOP MOVERS - NASDAQ</h3>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { symbol: 'NVDA', price: '892.42', change: '+3.74%', trend: 'up' },
                    { symbol: 'TSLA', price: '248.50', change: '+2.89%', trend: 'up' },
                    { symbol: 'MSFT', price: '412.20', change: '-1.23%', trend: 'down' },
                  ].map((stock) => (
                    <div key={stock.symbol} className="bg-white/[0.02] border border-white/10 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-cyan-400 font-mono text-sm font-bold">{stock.symbol}</span>
                        {stock.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4 text-green-400" />
                        ) : (
                          <TrendingDown className="w-4 h-4 text-red-400" />
                        )}
                      </div>
                      <div className="text-white font-mono text-lg mb-1">${stock.price}</div>
                      <div className={`font-mono text-xs ${stock.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                        {stock.change}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Market indices */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-cyan-400" />
                  <h3 className="text-cyan-400 text-sm font-mono font-semibold">MARKET INDICES</h3>
                </div>
                
                <div className="grid grid-cols-4 gap-3">
                  {[
                    { name: 'S&P 500', value: '4,783.45', change: '+0.82%' },
                    { name: 'DOW', value: '37,248.53', change: '+0.56%' },
                    { name: 'NASDAQ', value: '14,914.22', change: '+1.24%' },
                    { name: 'RUSSELL', value: '2,018.67', change: '+0.43%' },
                  ].map((index) => (
                    <div key={index.name} className="bg-white/[0.02] border border-white/10 rounded-lg p-3">
                      <div className="text-gray-400 text-[10px] font-mono mb-1">{index.name}</div>
                      <div className="text-white font-mono text-sm mb-1">{index.value}</div>
                      <div className="text-green-400 font-mono text-xs">{index.change}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insights */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-1 h-4 bg-purple-500" />
                  <h3 className="text-purple-400 text-sm font-mono font-semibold">AI MARKET INSIGHTS</h3>
                  <Sparkles className="w-3 h-3 text-purple-400 ml-1" />
                </div>
                
                <div className="bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-lg p-4">
                  <p className="text-gray-300 text-sm font-mono leading-relaxed mb-3">
                    Strong bullish momentum detected across tech sector. AI models showing 78% probability of continued uptrend through Q1. Watch semiconductor stocks for breakout opportunities.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[78%] bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" />
                    </div>
                    <span className="text-purple-400 text-xs font-mono font-bold">78%</span>
                  </div>
                </div>
              </div>

              {/* Command input */}
              <div className="flex items-center gap-3 bg-white/[0.02] border border-orange-500/30 rounded-lg px-4 py-3">
                <span className="text-orange-400 font-mono text-sm">{'>'}</span>
                <input 
                  type="text" 
                  placeholder="Type command or symbol (e.g., AAPL GO, HELP, TOP)" 
                  className="flex-1 bg-transparent text-white font-mono text-sm outline-none placeholder:text-gray-600"
                  readOnly
                />
                <kbd className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-gray-500">
                  F1 HELP
                </kbd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
