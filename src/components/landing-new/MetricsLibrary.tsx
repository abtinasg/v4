'use client'

import { Globe, Cog, Building2, TrendingUp, BarChart3, Shield, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const categories = [
  {
    icon: Globe,
    title: 'Macro & Market Environment',
    description: 'Economic indicators, interest rates, and market sentiment.',
    metrics: 106,
    examples: ['GDP Growth', 'Inflation Rate', 'Fed Funds', 'VIX'],
  },
  {
    icon: Cog,
    title: 'Operating Performance',
    description: 'Asset utilization and operational efficiency ratios.',
    metrics: 32,
    examples: ['Asset Turnover', 'Inventory Days', 'Op. Cycle'],
  },
  {
    icon: Building2,
    title: 'Balance Sheet Strength',
    description: 'Liquidity, debt metrics, and capital structure.',
    metrics: 117,
    examples: ['Current Ratio', 'Debt/Equity', 'Coverage'],
  },
  {
    icon: TrendingUp,
    title: 'Profitability & Cash Flow',
    description: 'Margin analysis and earnings sustainability.',
    metrics: 64,
    examples: ['Gross Margin', 'FCF Yield', 'ROIC'],
  },
  {
    icon: BarChart3,
    title: 'Valuation & Growth',
    description: 'Multiples, growth rates, and shareholder returns.',
    metrics: 98,
    examples: ['P/E', 'EV/EBITDA', 'Rev Growth'],
  },
  {
    icon: Shield,
    title: 'Risk & Composite Scores',
    description: 'Volatility measures and proprietary scoring.',
    metrics: 15,
    examples: ['Beta', 'Z-Score', 'F-Score'],
  },
]

export function MetricsLibrary() {
  const totalMetrics = categories.reduce((sum, cat) => sum + cat.metrics, 0)

  return (
    <section id="metrics" className="relative py-28 md:py-36 bg-[#08090C]">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-blue-500/[0.03] rounded-full blur-[120px]" />
      </div>

      {/* Top border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center mb-20">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/[0.04] border border-white/[0.06] px-4 py-1.5 mb-8">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            <span className="text-[12px] font-medium text-zinc-400 tracking-wide uppercase">
              Metrics Library
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-[56px] font-semibold text-white tracking-tight leading-[1.1] mb-6">
            {totalMetrics}+ institutional metrics
          </h2>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-zinc-400 font-light max-w-2xl mx-auto leading-relaxed">
            The same fundamental analysis tools used by hedge funds, 
            now accessible to every investor.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6 mb-16">
          {categories.map((category) => (
            <div
              key={category.title}
              className="group relative rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(to bottom, rgba(255,255,255,0.03), rgba(255,255,255,0.01))',
                boxShadow: '0 8px 32px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
              }}
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-blue-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                {/* Icon + Count Row */}
                <div className="flex items-start justify-between mb-5">
                  <div 
                    className="h-12 w-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: 'linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.04))',
                      boxShadow: '0 0 20px rgba(59,130,246,0.08)',
                    }}
                  >
                    <category.icon className="h-5 w-5 text-blue-400" strokeWidth={1.5} />
                  </div>
                  <span className="text-[13px] font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
                    {category.metrics}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-[17px] font-medium text-white mb-2 leading-snug">
                  {category.title}
                </h3>

                {/* Description */}
                <p className="text-[14px] text-zinc-500 leading-relaxed mb-5">
                  {category.description}
                </p>

                {/* Example Metrics */}
                <div className="flex flex-wrap gap-2">
                  {category.examples.map((example) => (
                    <span
                      key={example}
                      className="text-[12px] text-zinc-500 bg-white/[0.03] border border-white/[0.04] px-2.5 py-1 rounded-md"
                    >
                      {example}
                    </span>
                  ))}
                  <span className="text-[12px] text-zinc-600 px-2 py-1">
                    +{category.metrics - category.examples.length} more
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/metrics"
            className="group inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-[15px] font-medium text-white transition-all duration-300 hover:scale-[1.02]"
            style={{
              background: 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(59,130,246,0.05))',
              border: '1px solid rgba(59,130,246,0.2)',
              boxShadow: '0 0 30px rgba(59,130,246,0.1)',
            }}
          >
            <span>Explore Full Library</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          
          {/* Data sources */}
          <p className="mt-8 text-[13px] text-zinc-600">
            Real-time data from Alpha Vantage · Polygon.io · Finnhub · Yahoo Finance
          </p>
        </div>
      </div>
    </section>
  )
}
