'use client'

import Link from 'next/link'
import { ArrowRight, Play, TrendingUp, BarChart3, Shield } from 'lucide-react'

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-[#0D0F12]">
      {/* Background Grid - subtle */}
      <div className="absolute inset-0 opacity-[0.02]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), 
                              linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)`,
            backgroundSize: '80px 80px',
          }}
        />
      </div>

      {/* Gradient Orb - brand accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-gradient-to-br from-[#E67E22]/10 via-[#4ECDC4]/5 to-transparent rounded-full blur-3xl opacity-60" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-24 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full bg-[#13161A] border border-white/8 px-4 py-2 mb-8">
          <div className="h-1.5 w-1.5 rounded-full bg-[#27AE60] animate-pulse" />
          <span className="text-[13px] text-white/70 font-medium">Institutional-grade analytics</span>
        </div>

        {/* Headline - Strong hierarchy */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight text-white leading-[1.08] mb-6">
          Structured analysis.
          <br />
          <span className="text-white/50">
            Clear assumptions.
          </span>
        </h1>

        {/* Subheadline - institutional voice */}
        <p className="text-lg md:text-xl text-white/60 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          Professional fundamental analysis with 432 institutional metrics. 
          Repeatable workflows for individual investors.
        </p>

        {/* CTAs - pill buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
          <Link
            href="/sign-up"
            className="group flex items-center gap-2 px-8 py-4 text-[15px] font-semibold text-white bg-[#E67E22] hover:bg-[#D35400] rounded-full transition-all shadow-[0_0_30px_rgba(230,126,34,0.2)]"
          >
            Start free analysis
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <button
            className="flex items-center gap-2 px-8 py-4 text-[15px] font-medium text-white/70 hover:text-white border border-white/10 hover:border-white/20 rounded-full transition-all bg-white/[0.02]"
          >
            <Play className="h-4 w-4" />
            Watch demo
          </button>
        </div>

        {/* Product proof - mini metrics */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-8 text-sm text-white/50">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-[#E67E22]" />
            <span>432 metrics</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#27AE60]" />
            <span>Real-time data</span>
          </div>
          <div className="hidden sm:block w-px h-4 bg-white/10" />
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#4ECDC4]" />
            <span>Trusted sources</span>
          </div>
        </div>
      </div>
    </section>
  )
}
