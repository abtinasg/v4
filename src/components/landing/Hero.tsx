'use client'

import Link from 'next/link'
import { ArrowRight, Zap, BrainCircuit, BarChart3, Activity } from 'lucide-react'

// Sparkline SVG component
function Sparkline({ data, color, positive }: { data: number[]; color: string; positive: boolean }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 70 - 15}`).join(' ')
  
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.1" />
          <stop offset="100%" stopColor={color} stopOpacity="0.8" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={`url(#spark-${color.replace('#', '')})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        style={{ filter: `drop-shadow(0 0 6px ${color})` }}
      />
    </svg>
  )
}

const marketData = [
  { symbol: 'S&P 500', value: '5,892.34', change: '+1.24%', positive: true, data: [45, 52, 48, 61, 55, 70, 65, 78, 72, 85] },
  { symbol: 'NASDAQ', value: '18,724.18', change: '+1.89%', positive: true, data: [30, 42, 38, 55, 48, 62, 58, 75, 82, 90] },
  { symbol: 'VIX', value: '14.23', change: '-8.2%', positive: false, data: [80, 72, 68, 55, 62, 48, 52, 40, 35, 28] },
]

const featurePills = [
  { icon: Zap, label: 'Real-time Data' },
  { icon: BrainCircuit, label: 'AI Orchestration' },
  { icon: BarChart3, label: '150+ Metrics' },
]

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#05070B] pt-28 pb-20">
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-30%] left-[5%] w-[700px] h-[700px] rounded-full bg-[#00D4FF]/[0.08] blur-[150px]" />
        <div className="absolute top-[10%] right-[-15%] w-[600px] h-[600px] rounded-full bg-[#8B5CF6]/[0.06] blur-[130px]" />
        <div className="absolute bottom-[-20%] left-[40%] w-[500px] h-[500px] rounded-full bg-[#3B82F6]/[0.05] blur-[120px]" />
        
        {/* Grid */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />
        
        {/* Hero spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(0,212,255,0.12),transparent)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-20 items-center min-h-[75vh]">
          
          {/* Left: Copy */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full border border-[#00D4FF]/20 bg-[#00D4FF]/[0.08] px-4 py-1.5 text-xs font-medium text-[#00D4FF] glow-cyan">
              <Activity className="h-3.5 w-3.5 animate-pulse" />
              Trusted by 10,000+ Retail Investors
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-display text-5xl md:text-6xl lg:text-7xl text-white leading-tight">
                <span className="text-gray-400">Stock Analysis Made</span>
                <br />
                <span className="relative inline-block">
                  <span className="text-glow-cyan text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] via-[#3B82F6] to-[#8B5CF6]">
                    Simple
                  </span>
                  <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-[#00D4FF]/30 to-[#8B5CF6]/30 -z-10" />
                </span>
                {' & '}
                <span className="relative inline-block">
                  <span className="text-glow-cyan text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#3B82F6] to-[#00D4FF]">
                    Powerful
                  </span>
                  <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-[#8B5CF6]/30 to-[#00D4FF]/30 -z-10" />
                </span>
              </h1>
            </div>

            {/* Subheadline */}
            <p className="text-subhead text-lg text-gray-400 max-w-lg">
              Professional stock analysis tools designed for retail investors. Get AI-powered insights, real-time data, and 150+ metrics—without the Bloomberg Terminal price tag.
            </p>

            {/* Value Props */}
            <div className="grid grid-cols-3 gap-4 max-w-lg">
              <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="text-2xl font-bold text-[#00D4FF] mb-1">$0</div>
                <div className="text-xs text-gray-500">Start Free</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="text-2xl font-bold text-[#22C55E] mb-1">150+</div>
                <div className="text-xs text-gray-500">Metrics</div>
              </div>
              <div className="text-center p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]">
                <div className="text-2xl font-bold text-[#8B5CF6] mb-1">AI</div>
                <div className="text-xs text-gray-500">Powered</div>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/sign-up"
                className="group inline-flex items-center gap-2.5 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#3B82F6] px-7 py-3.5 text-sm font-semibold text-white transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,212,255,0.4)] hover:scale-[1.02]"
              >
                Start Free Today
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/pricing"
                className="group inline-flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-[#8B5CF6]/30 hover:bg-[#8B5CF6]/[0.05]"
              >
                View Pricing
                <span className="text-xs text-gray-500">→ From $0/mo</span>
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00D4FF] to-[#8B5CF6] border-2 border-[#05070B] flex items-center justify-center text-xs font-bold text-white">
                    {i}
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full bg-white/10 border-2 border-[#05070B] flex items-center justify-center text-xs text-gray-400">
                  +10k
                </div>
              </div>
              <div className="text-sm text-gray-400">
                Join thousands of retail investors
              </div>
            </div>
          </div>

          {/* Right: Terminal Mockup */}
          <div
            className="relative hidden lg:block"
          >
            {/* Glow behind */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#00D4FF]/15 via-[#3B82F6]/10 to-[#8B5CF6]/15 blur-3xl rounded-full scale-110 animate-pulse-soft" />
            
            {/* Terminal Card */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-[#0A0D12]/90 backdrop-blur-xl overflow-hidden shadow-2xl">
              {/* Glass reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />
              
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3 border-b border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#EF4444]/80" />
                  <div className="h-3 w-3 rounded-full bg-[#F59E0B]/80" />
                  <div className="h-3 w-3 rounded-full bg-[#22C55E]/80" />
                </div>
                <div className="text-label text-gray-500 flex items-center gap-1.5">
                  <Activity className="h-3 w-3 text-[#22C55E]" />
                  LIVE SESSION
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* Market Data */}
                {marketData.map((item, i) => (
                  <div
                    key={item.symbol}
                    className="group rounded-xl border border-white/[0.04] bg-white/[0.01] p-4 hover:border-[#00D4FF]/20 hover:bg-[#00D4FF]/[0.02] transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-label text-gray-500 mb-1">{item.symbol}</div>
                        <div className="flex items-baseline gap-2.5">
                          <span className="text-xl font-semibold text-white tabular-nums">{item.value}</span>
                          <span className={`text-sm font-medium ${item.positive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                            {item.change}
                          </span>
                        </div>
                      </div>
                      <div className="w-20 h-10">
                        <Sparkline 
                          data={item.data} 
                          color={item.positive ? '#22C55E' : '#EF4444'} 
                          positive={item.positive} 
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* AI Status */}
                <div
                  className="rounded-xl border border-[#8B5CF6]/20 bg-[#8B5CF6]/[0.05] p-4"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-[#8B5CF6]/20 flex items-center justify-center">
                      <BrainCircuit className="h-5 w-5 text-[#8B5CF6]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-label text-[#8B5CF6] mb-0.5">AI ORCHESTRATOR</div>
                      <div className="text-xs text-gray-400 truncate">Analyzing 847 signals across 3 models...</div>
                    </div>
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-1.5 w-1.5 rounded-full bg-[#8B5CF6]"
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
