'use client'

import { Activity, ChevronRight, TrendingUp, BarChart3, BrainCircuit, Layers, Search } from 'lucide-react'

export function UIPreview() {
  return (
    <section className="relative py-24 md:py-32 bg-[#05070B] overflow-hidden">
      {/* Ambient glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-[-10%] w-[600px] h-[600px] rounded-full bg-[#00D4FF]/[0.04] blur-[150px]" />
        <div className="absolute bottom-1/4 right-[-10%] w-[500px] h-[500px] rounded-full bg-[#8B5CF6]/[0.03] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <div
          className="text-center mb-16"
        >
          <h2 className="text-display text-3xl md:text-4xl lg:text-5xl text-white mb-4">
            Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#3B82F6]">
              Command Center
            </span>
          </h2>
          <p className="text-subhead text-gray-400 max-w-xl mx-auto">
            A cinematic workspace designed for speed, clarity, and conviction.
          </p>
        </div>

        {/* Terminal Preview */}
        <div
          className="relative"
        >
          {/* Outer glow */}
          <div className="absolute -inset-4 bg-gradient-to-r from-[#00D4FF]/10 via-[#3B82F6]/5 to-[#8B5CF6]/10 blur-3xl rounded-3xl opacity-60" />
          
          {/* Main terminal container */}
          <div className="relative rounded-2xl border border-white/[0.08] bg-[#0A0D12]/95 backdrop-blur-xl overflow-hidden shadow-2xl">
            {/* Glass highlight */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] via-transparent to-transparent pointer-events-none" />
            
            {/* Header bar */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#EF4444]/80" />
                  <div className="h-3 w-3 rounded-full bg-[#F59E0B]/80" />
                  <div className="h-3 w-3 rounded-full bg-[#22C55E]/80" />
                </div>
                <div className="h-4 w-px bg-white/[0.1] mx-2" />
                <div className="text-sm font-medium text-white">Deep Terminal Pro</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 rounded-lg bg-white/[0.03] px-3 py-1.5">
                  <Search className="h-3.5 w-3.5 text-gray-500" />
                  <span className="text-xs text-gray-500">Search stocks...</span>
                  <kbd className="text-[10px] text-gray-600 px-1.5 py-0.5 rounded bg-white/[0.05]">⌘K</kbd>
                </div>
                <div className="flex items-center gap-1.5 text-[#22C55E]">
                  <Activity className="h-3.5 w-3.5" />
                  <span className="text-xs font-medium">LIVE</span>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="flex">
              {/* Sidebar */}
              <div className="w-16 border-r border-white/[0.03] py-4 flex flex-col items-center gap-4">
                {[BarChart3, Layers, BrainCircuit, TrendingUp].map((Icon, i) => (
                  <div key={i} className={`p-2.5 rounded-lg ${i === 0 ? 'bg-[#00D4FF]/10 text-[#00D4FF]' : 'text-gray-600 hover:text-gray-400'} transition-colors`}>
                    <Icon className="h-5 w-5" />
                  </div>
                ))}
              </div>

              {/* Main area */}
              <div className="flex-1 p-6 min-h-[400px]">
                {/* Stock header */}
                <div className="flex items-start justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-semibold text-white">NVDA</h3>
                      <span className="text-xs font-medium text-gray-500 bg-white/[0.03] px-2 py-1 rounded">NASDAQ</span>
                    </div>
                    <div className="text-sm text-gray-500">NVIDIA Corporation</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-semibold text-white tabular-nums">$892.42</div>
                    <div className="flex items-center justify-end gap-1.5 text-[#22C55E]">
                      <TrendingUp className="h-4 w-4" />
                      <span className="text-sm font-medium">+$32.18 (3.74%)</span>
                    </div>
                  </div>
                </div>

                {/* Faux chart */}
                <div className="relative h-48 mb-8 rounded-xl border border-white/[0.03] bg-white/[0.01] overflow-hidden">
                  <svg className="w-full h-full" viewBox="0 0 400 150" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#00D4FF" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#00D4FF" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M0,120 C20,110 40,100 60,95 C80,90 100,85 120,70 C140,55 160,60 180,50 C200,40 220,45 240,35 C260,25 280,30 300,20 C320,10 340,15 360,10 C380,5 400,8 400,8 L400,150 L0,150 Z"
                      fill="url(#chartGradient)"
                    />
                    <path
                      d="M0,120 C20,110 40,100 60,95 C80,90 100,85 120,70 C140,55 160,60 180,50 C200,40 220,45 240,35 C260,25 280,30 300,20 C320,10 340,15 360,10 C380,5 400,8 400,8"
                      fill="none"
                      stroke="#00D4FF"
                      strokeWidth="2"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(0,212,255,0.5))' }}
                    />
                  </svg>
                  {/* Time labels */}
                  <div className="absolute bottom-2 left-4 right-4 flex justify-between text-[10px] text-gray-600">
                    <span>9:30 AM</span>
                    <span>12:00 PM</span>
                    <span>4:00 PM</span>
                  </div>
                </div>

                {/* Metrics row */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: 'P/E Ratio', value: '62.4', color: '#00D4FF' },
                    { label: 'Market Cap', value: '$2.2T', color: '#3B82F6' },
                    { label: 'Volume', value: '48.2M', color: '#8B5CF6' },
                    { label: 'AI Score', value: '94', color: '#22C55E' },
                  ].map((metric) => (
                    <div key={metric.label} className="rounded-xl border border-white/[0.04] bg-white/[0.01] p-4">
                      <div className="text-label text-gray-500 mb-1">{metric.label}</div>
                      <div className="text-xl font-semibold text-white" style={{ color: metric.color }}>{metric.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right panel - AI */}
              <div className="w-72 border-l border-white/[0.03] p-5">
                <div className="flex items-center gap-2 mb-4">
                  <BrainCircuit className="h-4 w-4 text-[#8B5CF6]" />
                  <span className="text-label text-[#8B5CF6]">AI ANALYSIS</span>
                </div>
                <div className="space-y-4">
                  <div className="rounded-xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.03] p-4">
                    <div className="text-sm font-medium text-white mb-2">Bullish Momentum</div>
                    <p className="text-xs text-gray-400 leading-relaxed mb-3">
                      Strong technical setup with RSI breakout. Multiple AI models detecting accumulation pattern.
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-white/[0.05]">
                        <div className="h-full w-[85%] rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#00D4FF]" />
                      </div>
                      <span className="text-xs text-[#8B5CF6]">85%</span>
                    </div>
                  </div>
                  <button className="w-full flex items-center justify-center gap-2 rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/[0.05] py-2.5 text-sm text-[#8B5CF6] hover:bg-[#8B5CF6]/[0.1] transition-colors">
                    Deep Analysis
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
