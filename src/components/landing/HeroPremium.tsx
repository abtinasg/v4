'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

export function HeroPremium() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#030407]">
      {/* Premium Ambient Background */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Primary gradient orb - top center */}
        <div 
          className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] rounded-full opacity-40"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          }}
        />
        
        {/* Secondary accent - subtle cyan */}
        <div 
          className="absolute top-[20%] right-[10%] w-[400px] h-[400px] rounded-full opacity-30"
          style={{
            background: 'radial-gradient(circle at center, rgba(34, 211, 238, 0.08) 0%, transparent 60%)',
          }}
        />
        
        {/* Soft vignette */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 50%, transparent 0%, #030407 100%)',
          }}
        />
        
        {/* Subtle noise texture */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-24 pb-32">
        <div className="text-center space-y-8">
          
          {/* Subtle Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-white/[0.02] px-4 py-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-[#34D399] animate-pulse" />
            <span className="text-xs text-[#94A3B8] font-medium tracking-wide">
              Trusted by 10,000+ investors
            </span>
          </div>

          {/* Main Headline - Large, Confident */}
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.08] text-white">
              Your AI Financial
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6366F1] via-[#8B5CF6] to-[#22D3EE]">
                Intelligence Edge
              </span>
            </h1>
          </div>

          {/* Subheadline - Light, Calm */}
          <p className="text-lg sm:text-xl text-[#64748B] font-light leading-relaxed max-w-2xl mx-auto">
            Professional stock analysis, real-time market data, and AI-powered insights—
            <br className="hidden sm:block" />
            without the complexity or cost.
          </p>

          {/* CTA Buttons - Premium, High-end */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/sign-up"
              className="
                group inline-flex items-center gap-2.5
                px-7 py-3.5 rounded-xl
                bg-[#6366F1] text-white
                text-[15px] font-medium
                transition-all duration-300
                hover:bg-[#5457E5]
                hover:shadow-[0_0_32px_rgba(99,102,241,0.3)]
                hover:scale-[1.02]
              "
            >
              Start Free
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            
            <Link
              href="#features"
              className="
                inline-flex items-center gap-2.5
                px-7 py-3.5 rounded-xl
                bg-white/[0.03] border border-white/[0.06]
                text-white text-[15px] font-medium
                transition-all duration-200
                hover:bg-white/[0.05] hover:border-white/[0.10]
              "
            >
              See How It Works
            </Link>
          </div>

          {/* Trust Metrics - Minimal */}
          <div className="flex items-center justify-center gap-12 pt-12">
            {[
              { value: '150+', label: 'Metrics' },
              { value: 'AI', label: 'Powered' },
              { value: '$0', label: 'To Start' },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div className="text-xl font-semibold text-white">{item.value}</div>
                <div className="text-xs text-[#475569] mt-1">{item.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Visual - Premium Terminal Preview */}
        <div className="relative mt-20">
          {/* Glow behind card */}
          <div 
            className="absolute inset-0 -inset-x-20 opacity-50"
            style={{
              background: 'radial-gradient(ellipse 60% 40% at 50% 40%, rgba(99, 102, 241, 0.12) 0%, transparent 60%)',
            }}
          />
          
          {/* Terminal Card */}
          <div className="
            relative rounded-2xl
            bg-gradient-to-b from-white/[0.04] to-white/[0.01]
            border border-white/[0.06]
            backdrop-blur-xl
            shadow-[0_20px_60px_-12px_rgba(0,0,0,0.5)]
            overflow-hidden
          ">
            {/* Window Controls */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.04]">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-[#EF4444]/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#F59E0B]/60" />
                <div className="h-2.5 w-2.5 rounded-full bg-[#22C55E]/60" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="text-[11px] text-[#475569] font-medium tracking-wide">
                  DeepIn Terminal
                </div>
              </div>
            </div>

            {/* Terminal Content */}
            <div className="p-6 space-y-5">
              {/* Market Indices */}
              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: 'S&P 500', value: '5,892.34', change: '+1.24%', positive: true },
                  { name: 'NASDAQ', value: '18,724.18', change: '+1.89%', positive: true },
                  { name: 'VIX', value: '14.23', change: '-8.2%', positive: false },
                ].map((index) => (
                  <div 
                    key={index.name}
                    className="
                      rounded-xl p-4
                      bg-white/[0.02] border border-white/[0.04]
                    "
                  >
                    <div className="text-[11px] text-[#64748B] font-medium uppercase tracking-wider mb-2">
                      {index.name}
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-lg font-semibold text-white tabular-nums">
                        {index.value}
                      </span>
                      <span className={`text-sm font-medium ${index.positive ? 'text-[#34D399]' : 'text-[#F87171]'}`}>
                        {index.change}
                      </span>
                    </div>
                    {/* Mini chart placeholder */}
                    <div className="mt-3 h-8">
                      <svg viewBox="0 0 100 32" className="w-full h-full" preserveAspectRatio="none">
                        <path
                          d={index.positive 
                            ? "M0,24 Q15,22 30,18 T60,12 T100,8"
                            : "M0,8 Q15,12 30,16 T60,20 T100,24"
                          }
                          fill="none"
                          stroke={index.positive ? '#34D399' : '#F87171'}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          opacity="0.6"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>

              {/* AI Insight Preview */}
              <div className="
                rounded-xl p-5
                bg-gradient-to-r from-[#6366F1]/[0.08] to-[#8B5CF6]/[0.04]
                border border-[#6366F1]/20
              ">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-lg bg-[#6366F1]/20 flex items-center justify-center flex-shrink-0">
                    <svg className="h-4 w-4 text-[#6366F1]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white mb-1">AI Analysis</div>
                    <p className="text-sm text-[#94A3B8] leading-relaxed">
                      AAPL shows strong momentum with RSI at 62. Consider the upcoming earnings catalyst on Jan 30th for potential volatility.
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
