'use client'

import { TrendingUp, TrendingDown, Activity, BrainCircuit, AlertCircle } from 'lucide-react'

const topMovers = [
  { symbol: 'NVDA', name: 'NVIDIA Corp', change: '+4.82%', positive: true },
  { symbol: 'AAPL', name: 'Apple Inc', change: '+1.23%', positive: true },
  { symbol: 'META', name: 'Meta Platforms', change: '-2.14%', positive: false },
]

const macroData = {
  indicator: 'Fed Funds Rate',
  value: '5.25%',
  change: 'Unchanged',
  lastUpdate: '2 hrs ago'
}

const aiInsight = {
  title: 'Tech Sector Momentum',
  summary: 'Strong bullish signals detected in semiconductor stocks. 3 models converging on accumulation pattern.',
  confidence: 87
}

export function LiveData() {
  return (
    <section className="relative py-20 bg-[#05070B] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(0,212,255,0.04),transparent)] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle,rgba(59,130,246,0.03),transparent)] pointer-events-none" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <div
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#22C55E]/20 bg-[#22C55E]/[0.06] px-4 py-1.5 text-xs font-medium text-[#22C55E] mb-6">
            <Activity className="h-3 w-3" />
            <span className="h-1.5 w-1.5 rounded-full bg-[#22C55E] animate-pulse" />
            LIVE DATA FEED
          </div>
          <h2 className="text-display text-3xl md:text-4xl text-white">
            Markets at a Glance
          </h2>
        </div>

        {/* Data Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          {/* Top Movers */}
          <div
            className="rounded-2xl border border-white/[0.05] bg-[#0A0D12]/60 p-6 backdrop-blur-sm"
          >
            <h3 className="text-label text-gray-500 mb-4">TOP MOVERS</h3>
            <div className="space-y-3">
              {topMovers.map((stock) => (
                <div key={stock.symbol} className="flex items-center justify-between py-2 border-b border-white/[0.03] last:border-0">
                  <div>
                    <div className="font-semibold text-white text-sm">{stock.symbol}</div>
                    <div className="text-xs text-gray-500">{stock.name}</div>
                  </div>
                  <div className={`flex items-center gap-1.5 ${stock.positive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                    {stock.positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                    <span className="text-sm font-medium">{stock.change}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Macro Indicator */}
          <div
            className="rounded-2xl border border-white/[0.05] bg-[#0A0D12]/60 p-6 backdrop-blur-sm"
          >
            <h3 className="text-label text-gray-500 mb-4">MACRO INDICATOR</h3>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-gray-400 mb-1">{macroData.indicator}</div>
                <div className="text-3xl font-semibold text-white tabular-nums">{macroData.value}</div>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-white/[0.05]">
                <div className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                  <AlertCircle className="h-3 w-3" />
                  {macroData.change}
                </div>
                <div className="text-xs text-gray-600">{macroData.lastUpdate}</div>
              </div>
            </div>
          </div>

          {/* AI Insight */}
          <div
            className="rounded-2xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.03] p-6 backdrop-blur-sm"
          >
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="h-4 w-4 text-[#8B5CF6]" />
              <h3 className="text-label text-[#8B5CF6]">AI INSIGHT</h3>
            </div>
            <div className="space-y-3">
              <div className="text-white font-semibold">{aiInsight.title}</div>
              <p className="text-sm text-gray-400 leading-relaxed">{aiInsight.summary}</p>
              <div className="flex items-center gap-3 pt-2">
                <div className="flex-1 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#00D4FF]"
                    style={{ width: `${aiInsight.confidence}%` }}
                  />
                </div>
                <span className="text-xs text-[#8B5CF6] font-medium">{aiInsight.confidence}%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
