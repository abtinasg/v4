'use client'

import Link from 'next/link'
import { ArrowRight, TrendingUp, BarChart2, Zap } from 'lucide-react'

export function HeroPremium() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#030407]">
      {/* Blurred Terminal Mockup Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div 
          className="absolute w-[900px] h-[600px] rounded-3xl opacity-[0.08] blur-[2px]"
          style={{
            background: `
              linear-gradient(180deg, 
                rgba(99, 102, 241, 0.15) 0%, 
                rgba(139, 92, 246, 0.08) 50%,
                transparent 100%
              )
            `,
            border: '1px solid rgba(255,255,255,0.05)',
          }}
        >
          {/* Fake terminal grid lines */}
          <div className="absolute inset-8 grid grid-cols-3 gap-4 opacity-30">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl bg-white/[0.02] border border-white/[0.03]" />
            ))}
          </div>
        </div>
      </div>

      {/* Premium Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary gradient orb - centered, more intense */}
        <div 
          className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[700px] rounded-full opacity-50"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.2) 0%, rgba(139, 92, 246, 0.1) 40%, transparent 70%)',
          }}
        />
        
        {/* Secondary accent - cyan flash */}
        <div 
          className="absolute top-[30%] right-[5%] w-[300px] h-[300px] rounded-full opacity-40"
          style={{
            background: 'radial-gradient(circle at center, rgba(34, 211, 238, 0.12) 0%, transparent 60%)',
          }}
        />

        {/* Left accent */}
        <div 
          className="absolute top-[40%] left-[5%] w-[200px] h-[200px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle at center, rgba(52, 211, 153, 0.1) 0%, transparent 60%)',
          }}
        />
        
        {/* Soft vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 70% 50% at 50% 50%, transparent 0%, #030407 100%)',
          }}
        />
        
        {/* Subtle noise texture */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-6 pt-16 pb-24">
        <div className="text-center space-y-6">
          
          {/* Subtle Badge - Compact */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] backdrop-blur-sm px-3 py-1">
            <div className="h-1.5 w-1.5 rounded-full bg-[#34D399] shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span className="text-[11px] text-[#94A3B8] font-medium tracking-wide uppercase">
              Trusted by 10K+ investors
            </span>
          </div>

          {/* Main Headline - Larger, Stronger Gradient */}
          <div className="space-y-2">
            <h1 className="text-5xl sm:text-6xl lg:text-[5rem] font-bold tracking-tight leading-[1.05] text-white">
              Your AI Financial
              <br />
              <span 
                className="text-transparent bg-clip-text"
                style={{
                  backgroundImage: 'linear-gradient(135deg, #818CF8 0%, #6366F1 25%, #A78BFA 50%, #22D3EE 75%, #34D399 100%)',
                  backgroundSize: '200% auto',
                }}
              >
                Intelligence Edge
              </span>
            </h1>
          </div>

          {/* Subheadline - Tighter */}
          <p className="text-base sm:text-lg text-[#64748B] font-normal leading-relaxed max-w-xl mx-auto">
            Professional stock analysis, real-time market data, and AI insights.
            <span className="text-[#94A3B8]"> No Bloomberg required.</span>
          </p>

          {/* CTA Buttons - Sharper, More Confident */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/sign-up"
              className="
                group inline-flex items-center gap-2
                px-6 py-3 rounded-lg
                bg-gradient-to-r from-[#6366F1] to-[#818CF8]
                text-white text-sm font-semibold
                transition-all duration-200
                hover:shadow-[0_0_28px_rgba(99,102,241,0.4)]
                hover:scale-[1.02]
                active:scale-[0.98]
              "
            >
              Start Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            
            <Link
              href="#features"
              className="
                inline-flex items-center gap-2
                px-6 py-3 rounded-lg
                bg-white/[0.04] border border-white/[0.08]
                text-white text-sm font-medium
                backdrop-blur-sm
                transition-all duration-200
                hover:bg-white/[0.06] hover:border-white/[0.12]
              "
            >
              See How It Works
            </Link>
          </div>

          {/* Trust Metrics - Compact, Inline */}
          <div className="flex items-center justify-center gap-8 pt-8">
            {[
              { icon: BarChart2, value: '150+', label: 'Metrics' },
              { icon: Zap, value: 'AI', label: 'Powered' },
              { icon: TrendingUp, value: '$0', label: 'To Start' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <item.icon className="h-4 w-4 text-[#6366F1]/60" />
                <span className="text-sm font-semibold text-white">{item.value}</span>
                <span className="text-xs text-[#475569]">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Visual - Premium Terminal Preview */}
        <div className="relative mt-12">
          {/* Intense glow behind card */}
          <div 
            className="absolute inset-0 -inset-x-12 -inset-y-8 opacity-60"
            style={{
              background: 'radial-gradient(ellipse 50% 35% at 50% 40%, rgba(99, 102, 241, 0.15) 0%, transparent 60%)',
            }}
          />
          
          {/* Terminal Card - More Depth */}
          <div className="
            relative rounded-xl
            bg-[#0A0D12]/90
            border border-white/[0.08]
            backdrop-blur-md
            shadow-[0_24px_80px_-12px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.03)_inset]
            overflow-hidden
          ">
            {/* Gradient ring glow effect */}
            <div 
              className="absolute -inset-[1px] rounded-xl opacity-40 pointer-events-none"
              style={{
                background: 'linear-gradient(135deg, rgba(99,102,241,0.3) 0%, transparent 50%, rgba(34,211,238,0.2) 100%)',
              }}
            />
            
            {/* Window Controls */}
            <div className="relative flex items-center gap-2 px-4 py-3 border-b border-white/[0.06] bg-white/[0.01]">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-[#EF4444]/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#22C55E]/70" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="text-[11px] text-[#64748B] font-medium tracking-wide">
                  DeepIn Terminal Pro
                </div>
              </div>
            </div>

            {/* Terminal Content */}
            <div className="relative p-5 space-y-4">
              {/* Market Indices - Compact */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { name: 'S&P 500', value: '5,892.34', change: '+1.24%', positive: true },
                  { name: 'NASDAQ', value: '18,724.18', change: '+1.89%', positive: true },
                  { name: 'VIX', value: '14.23', change: '-8.2%', positive: false },
                ].map((index) => (
                  <div 
                    key={index.name}
                    className="
                      rounded-lg p-3
                      bg-white/[0.02] border border-white/[0.05]
                      backdrop-blur-sm
                    "
                  >
                    <div className="text-[10px] text-[#64748B] font-semibold uppercase tracking-wider mb-1.5">
                      {index.name}
                    </div>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-base font-bold text-white tabular-nums">
                        {index.value}
                      </span>
                      <span className={`text-xs font-semibold ${index.positive ? 'text-[#34D399]' : 'text-[#F87171]'}`}>
                        {index.change}
                      </span>
                    </div>
                    {/* Mini chart */}
                    <div className="mt-2 h-6">
                      <svg viewBox="0 0 100 24" className="w-full h-full" preserveAspectRatio="none">
                        <path
                          d={index.positive 
                            ? "M0,18 Q15,16 30,12 T60,8 T100,4"
                            : "M0,6 Q15,10 30,14 T60,18 T100,20"
                          }
                          fill="none"
                          stroke={index.positive ? '#34D399' : '#F87171'}
                          strokeWidth="2"
                          strokeLinecap="round"
                          opacity="0.7"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Insight Preview - Tighter */}
              <div className="
                rounded-lg p-4
                bg-gradient-to-r from-[#6366F1]/[0.1] to-[#8B5CF6]/[0.05]
                border border-[#6366F1]/25
                shadow-[0_0_20px_rgba(99,102,241,0.08)_inset]
              ">
                <div className="flex items-start gap-3">
                  <div className="h-7 w-7 rounded-lg bg-[#6366F1]/25 flex items-center justify-center flex-shrink-0">
                    <svg className="h-3.5 w-3.5 text-[#818CF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-[#818CF8] mb-1">AI Analysis</div>
                    <p className="text-sm text-[#94A3B8] leading-snug">
                      AAPL shows strong momentum with RSI at 62. Upcoming earnings catalyst on Jan 30th.
                    </p>
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
