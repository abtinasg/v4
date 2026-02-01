'use client'

import { Globe, Cog, Building2, TrendingUp, BarChart3, Shield, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const categories = [
  {
    icon: Globe,
    title: 'Macro & Market',
    description: 'Economic indicators, rates, and market sentiment.',
    metrics: 106,
    examples: ['GDP Growth', 'Inflation', 'Fed Funds', 'VIX'],
  },
  {
    icon: Cog,
    title: 'Operations',
    description: 'Asset utilization and efficiency ratios.',
    metrics: 32,
    examples: ['Asset Turnover', 'Inventory Days', 'Op. Cycle'],
  },
  {
    icon: Building2,
    title: 'Balance Sheet',
    description: 'Liquidity, debt metrics, and capital structure.',
    metrics: 117,
    examples: ['Current Ratio', 'Debt/Equity', 'Coverage'],
  },
  {
    icon: TrendingUp,
    title: 'Profitability',
    description: 'Margin analysis and earnings sustainability.',
    metrics: 64,
    examples: ['Gross Margin', 'FCF Yield', 'ROIC'],
  },
  {
    icon: BarChart3,
    title: 'Valuation',
    description: 'Multiples, growth rates, and returns.',
    metrics: 98,
    examples: ['P/E', 'EV/EBITDA', 'Rev Growth'],
  },
  {
    icon: Shield,
    title: 'Risk Scores',
    description: 'Volatility measures and composite scoring.',
    metrics: 15,
    examples: ['Beta', 'Z-Score', 'F-Score'],
  },
]

export function MetricsLibrary() {
  const totalMetrics = categories.reduce((sum, cat) => sum + cat.metrics, 0)

  return (
    <section id="metrics" className="relative py-28 bg-[#0D0F12]">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[500px] bg-[#E67E22]/[0.02] rounded-full blur-[100px]" />
      </div>

      {/* Top border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center mb-16">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-[#13161A] border border-white/8 px-4 py-2 mb-8">
            <div className="h-1.5 w-1.5 rounded-full bg-[#E67E22]" />
            <span className="text-[11px] font-medium text-white/50 tracking-wide uppercase">
              Metrics Library
            </span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-[52px] font-semibold text-white tracking-tight leading-[1.1] mb-6">
            {totalMetrics}+ institutional metrics
          </h2>

          {/* Subheadline */}
          <p className="text-lg text-white/50 font-light max-w-2xl mx-auto leading-relaxed">
            The same fundamental analysis framework used by institutional investors.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {categories.map((category) => (
            <div
              key={category.title}
              className="group relative rounded-2xl p-6 bg-[#13161A] border border-white/[0.06] hover:border-[#E67E22]/30 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-[#E67E22]/[0.02] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative">
                {/* Icon + Count Row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="h-11 w-11 rounded-xl bg-[#E67E22]/10 border border-[#E67E22]/20 flex items-center justify-center">
                    <category.icon className="h-5 w-5 text-[#E67E22]" strokeWidth={1.5} />
                  </div>
                  <span className="text-[12px] font-semibold text-[#E67E22] bg-[#E67E22]/10 px-2.5 py-1 rounded-full">
                    {category.metrics}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-[16px] font-semibold text-white mb-2">
                  {category.title}
                </h3>

                {/* Description */}
                <p className="text-[13px] text-white/45 leading-relaxed mb-4">
                  {category.description}
                </p>

                {/* Example Metrics */}
                <div className="flex flex-wrap gap-1.5">
                  {category.examples.map((example) => (
                    <span
                      key={example}
                      className="text-[11px] text-white/40 bg-white/[0.04] border border-white/[0.06] px-2 py-0.5 rounded-md"
                    >
                      {example}
                    </span>
                  ))}
                  <span className="text-[11px] text-white/30 px-1.5 py-0.5">
                    +{category.metrics - category.examples.length}
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
            className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-[14px] font-medium text-white bg-[#E67E22] hover:bg-[#D35400] transition-all duration-300"
          >
            <span>Explore Full Library</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
          
          {/* Data sources */}
          <p className="mt-8 text-[12px] text-white/30">
            Data from Alpha Vantage · Polygon.io · Finnhub · Yahoo Finance
          </p>
        </div>
      </div>
    </section>
  )
}
