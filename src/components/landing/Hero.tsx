'use client'

import Link from 'next/link'
import { ArrowRight, Sparkles, BarChart3, BrainCircuit, Shield, Zap, Activity, TrendingUp, TrendingDown } from 'lucide-react'

// Sparkline component for market data
function Sparkline({ data, color, positive }: { data: number[]; color: string; positive: boolean }) {
  const max = Math.max(...data)
  const min = Math.min(...data)
  const range = max - min || 1
  const points = data.map((v, i) => `${(i / (data.length - 1)) * 100},${100 - ((v - min) / range) * 70 - 15}`).join(' ')

  return (
    <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
      <defs>
        <linearGradient id={`spark-${color.replace('#', '')}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke={`url(#spark-${color.replace('#', '')})`}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        style={{ filter: `drop-shadow(0 0 8px ${color}50)` }}
      />
    </svg>
  )
}

const marketData = [
  { symbol: 'S&P 500', value: '5,892.34', change: '+1.24%', positive: true, data: [45, 52, 48, 61, 55, 70, 65, 78, 72, 85] },
  { symbol: 'NASDAQ', value: '18,724.18', change: '+1.89%', positive: true, data: [30, 42, 38, 55, 48, 62, 58, 75, 82, 90] },
  { symbol: 'DOW', value: '42,156.92', change: '+0.76%', positive: true, data: [55, 58, 52, 60, 65, 62, 68, 72, 70, 78] },
]

const valuePills = [
  { icon: Sparkles, label: '70 Free Credits', sublabel: 'On signup', color: '#5B7CFF' },
  { icon: BarChart3, label: '150+ Metrics', sublabel: 'Institutional-grade', color: '#00C9E4' },
  { icon: BrainCircuit, label: '3 AI Models', sublabel: 'Multi-model analysis', color: '#8B5CF6' },
  { icon: Shield, label: 'Bank-Grade Security', sublabel: 'SOC 2 compliant', color: '#22C55E' },
]

export function Hero() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#030508] pt-32 pb-24 lg:pt-40 lg:pb-32">
      {/* Premium Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient orbs */}
        <div className="absolute top-[-20%] left-[10%] w-[800px] h-[800px] rounded-full bg-[#5B7CFF]/[0.08] blur-[180px]" />
        <div className="absolute top-[5%] right-[-10%] w-[600px] h-[600px] rounded-full bg-[#00C9E4]/[0.06] blur-[160px]" />
        <div className="absolute bottom-[-10%] left-[30%] w-[500px] h-[500px] rounded-full bg-[#8B5CF6]/[0.05] blur-[150px]" />

        {/* Subtle grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)`,
            backgroundSize: '80px 80px'
          }}
        />

        {/* Hero spotlight */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(91,124,255,0.12),transparent)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-16 lg:gap-24 items-center">

          {/* Left: Content */}
          <div className="space-y-10">
            {/* Trust Badge */}
            <div className="inline-flex items-center gap-2.5 rounded-full border border-[#5B7CFF]/20 bg-[#5B7CFF]/[0.06] px-5 py-2 text-sm font-medium text-[#5B7CFF] backdrop-blur-sm">
              <Activity className="h-4 w-4 animate-pulse" />
              <span>Trusted by 10,000+ Investors Worldwide</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.08] text-white">
                Stock Analysis Made{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-[#5B7CFF] via-[#00C9E4] to-[#8B5CF6] bg-clip-text text-transparent">
                    Simple
                  </span>
                  <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-[#5B7CFF]/30 to-[#00C9E4]/30 -z-10" />
                </span>
                {' & '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-[#00C9E4] via-[#8B5CF6] to-[#5B7CFF] bg-clip-text text-transparent">
                    Powerful
                  </span>
                  <div className="absolute inset-0 blur-2xl bg-gradient-to-r from-[#00C9E4]/30 to-[#8B5CF6]/30 -z-10" />
                </span>
              </h1>

              <p className="text-lg md:text-xl text-gray-400 max-w-xl leading-relaxed font-light">
                Professional stock analysis tools for retail investors. AI-powered insights,
                real-time data, and 150+ institutional metrics — without the Bloomberg price tag.
              </p>
            </div>

            {/* Value Pills Grid */}
            <div className="grid grid-cols-2 gap-4 max-w-2xl">
              {valuePills.map((pill) => (
                <div
                  key={pill.label}
                  className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-sm transition-all duration-500 hover:border-white/[0.1] hover:bg-white/[0.03]"
                >
                  <div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{ background: `linear-gradient(135deg, ${pill.color}10, transparent)` }}
                  />
                  <div className="relative flex items-start gap-4">
                    <div
                      className="h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: `linear-gradient(135deg, ${pill.color}20, ${pill.color}08)`,
                      }}
                    >
                      <pill.icon className="h-5 w-5" style={{ color: pill.color }} />
                    </div>
                    <div>
                      <div className="text-base font-semibold text-white mb-0.5">{pill.label}</div>
                      <div className="text-sm text-gray-500">{pill.sublabel}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/sign-up"
                className="group relative inline-flex items-center gap-3 overflow-hidden rounded-xl bg-gradient-to-r from-[#5B7CFF] to-[#00C9E4] px-8 py-4 text-base font-semibold text-white transition-all duration-300 hover:shadow-[0_0_40px_rgba(91,124,255,0.4)] hover:scale-[1.02]"
              >
                <span className="relative z-10">Start Free — Get 70 Credits</span>
                <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-0.5" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#00C9E4] to-[#5B7CFF] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              </Link>
              <Link
                href="#pricing"
                className="inline-flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-white/[0.15] hover:bg-white/[0.05]"
              >
                View Pricing
              </Link>
            </div>

            {/* Social Proof */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center -space-x-3">
                {[
                  { initials: 'JD', colors: 'from-[#5B7CFF] to-[#00C9E4]' },
                  { initials: 'MK', colors: 'from-[#00C9E4] to-[#8B5CF6]' },
                  { initials: 'SR', colors: 'from-[#8B5CF6] to-[#5B7CFF]' },
                  { initials: 'AL', colors: 'from-[#22C55E] to-[#00C9E4]' },
                ].map((user, i) => (
                  <div
                    key={i}
                    className={`w-10 h-10 rounded-full bg-gradient-to-br ${user.colors} border-2 border-[#030508] flex items-center justify-center text-xs font-bold text-white shadow-lg`}
                  >
                    {user.initials}
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full bg-[#0A0F18] border-2 border-[#030508] flex items-center justify-center text-xs font-medium text-gray-400">
                  +10K
                </div>
              </div>
              <div className="text-sm text-gray-400">
                <span className="text-white font-medium">10,000+</span> investors already trading smarter
              </div>
            </div>
          </div>

          {/* Right: Terminal Mockup */}
          <div className="relative hidden lg:block">
            {/* Ambient glow behind terminal */}
            <div className="absolute -inset-8 bg-gradient-to-tr from-[#5B7CFF]/15 via-[#00C9E4]/10 to-[#8B5CF6]/15 blur-3xl rounded-full opacity-60" />

            {/* Terminal Card */}
            <div className="relative rounded-2xl border border-white/[0.08] bg-[#0A0F18]/90 backdrop-blur-xl overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.5)]">
              {/* Glass reflection */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-transparent pointer-events-none" />

              {/* Header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-[#EF4444]/80" />
                  <div className="h-3 w-3 rounded-full bg-[#F59E0B]/80" />
                  <div className="h-3 w-3 rounded-full bg-[#22C55E]/80" />
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Activity className="h-3 w-3 text-[#22C55E]" />
                  <span className="text-[#22C55E] font-medium">LIVE</span>
                  <span className="text-gray-600">•</span>
                  <span>Markets Open</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {/* Market Data Cards */}
                {marketData.map((item) => (
                  <div
                    key={item.symbol}
                    className="group rounded-xl border border-white/[0.04] bg-white/[0.02] p-4 hover:border-[#5B7CFF]/20 hover:bg-[#5B7CFF]/[0.02] transition-all duration-300"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">{item.symbol}</div>
                        <div className="flex items-baseline gap-3">
                          <span className="text-xl font-semibold text-white tabular-nums">{item.value}</span>
                          <span className={`flex items-center gap-1 text-sm font-medium ${item.positive ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                            {item.positive ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                            {item.change}
                          </span>
                        </div>
                      </div>
                      <div className="w-24 h-12">
                        <Sparkline
                          data={item.data}
                          color={item.positive ? '#22C55E' : '#EF4444'}
                          positive={item.positive}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {/* AI Status Card */}
                <div className="rounded-xl border border-[#8B5CF6]/25 bg-gradient-to-br from-[#8B5CF6]/[0.08] to-[#5B7CFF]/[0.04] p-4">
                  <div className="flex items-center gap-4">
                    <div className="h-11 w-11 rounded-xl bg-[#8B5CF6]/20 flex items-center justify-center">
                      <BrainCircuit className="h-5 w-5 text-[#8B5CF6]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-[#8B5CF6] uppercase tracking-wider mb-0.5">AI Orchestrator</div>
                      <div className="text-sm text-gray-400 truncate">Analyzing 847 signals across 3 models...</div>
                    </div>
                    <div className="flex gap-1.5">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className="h-2 w-2 rounded-full bg-[#8B5CF6] animate-pulse"
                          style={{ animationDelay: `${i * 200}ms` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Stats Cards */}
            <div className="absolute -left-12 top-16 rounded-2xl border border-white/[0.08] bg-[#0A0F18]/95 backdrop-blur-xl px-5 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
              <div className="text-xs text-gray-500 mb-1.5">Session Score</div>
              <div className="text-3xl font-semibold text-white">92</div>
              <div className="text-xs text-[#22C55E] mt-1">+12 vs avg</div>
            </div>

            <div className="absolute -right-10 bottom-16 rounded-2xl border border-white/[0.08] bg-[#0A0F18]/95 backdrop-blur-xl px-5 py-4 shadow-[0_20px_50px_rgba(0,0,0,0.4)] w-48">
              <div className="flex items-center justify-between text-xs text-gray-500 mb-2.5">
                <span>AI Confidence</span>
                <span className="text-[#8B5CF6] font-medium">87%</span>
              </div>
              <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
                <div className="h-full w-[87%] rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#00C9E4]" />
              </div>
              <div className="mt-3 text-[11px] text-gray-500">Monitoring 847 signals</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
