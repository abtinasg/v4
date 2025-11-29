'use client'

import { BarChart3, TrendingUp, DollarSign, Activity, Gauge, PieChart, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const categories = [
  {
    title: 'Valuation',
    count: 25,
    icon: DollarSign,
    color: '#00D4FF',
    metrics: ['P/E Ratio', 'P/B Ratio', 'EV/EBITDA', 'PEG Ratio', 'Price/Sales']
  },
  {
    title: 'Profitability',
    count: 32,
    icon: TrendingUp,
    color: '#22C55E',
    metrics: ['ROE', 'ROA', 'Net Margin', 'Gross Margin', 'Operating Margin']
  },
  {
    title: 'Growth',
    count: 28,
    icon: BarChart3,
    color: '#3B82F6',
    metrics: ['Revenue Growth', 'EPS Growth', 'FCF Growth', 'EBITDA Growth', 'Book Value Growth']
  },
  {
    title: 'Technical',
    count: 35,
    icon: Activity,
    color: '#8B5CF6',
    metrics: ['RSI', 'MACD', 'Bollinger Bands', 'Moving Averages', 'Volume Analysis']
  },
  {
    title: 'Quality',
    count: 20,
    icon: Gauge,
    color: '#F59E0B',
    metrics: ['Debt/Equity', 'Current Ratio', 'Interest Coverage', 'Altman Z-Score', 'Piotroski Score']
  },
  {
    title: 'Efficiency',
    count: 18,
    icon: PieChart,
    color: '#2DD4BF',
    metrics: ['Asset Turnover', 'Inventory Turnover', 'Receivables Turnover', 'Working Capital', 'Cash Conversion']
  }
]

export function MetricsLibrary() {
  const totalMetrics = categories.reduce((acc, cat) => acc + cat.count, 0)

  return (
    <section className="relative py-24 md:py-32 bg-[#05070B] overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
        <div className="absolute top-1/4 right-0 w-[500px] h-[500px] rounded-full bg-[#00D4FF]/[0.03] blur-[150px]" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] rounded-full bg-[#8B5CF6]/[0.02] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* Header */}
        <div
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-[#2DD4BF]/20 bg-[#2DD4BF]/[0.06] px-4 py-1.5 text-xs font-medium text-[#2DD4BF] mb-6">
            <BarChart3 className="h-3.5 w-3.5" />
            Metrics Library
          </div>

          <h2 className="text-display text-3xl md:text-4xl lg:text-5xl text-white mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00D4FF] to-[#2DD4BF]">
              {totalMetrics}+
            </span>{' '}
            Institutional Metrics
          </h2>

          <p className="text-subhead text-gray-400 max-w-2xl mx-auto">
            From fundamental analysis to technical indicators—every metric you need to trade with conviction.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {categories.map((category, i) => (
            <div
              key={category.title}
              className="group relative rounded-2xl border border-white/[0.05] bg-[#0A0D12]/60 p-6 backdrop-blur-sm overflow-hidden hover:border-white/[0.1] transition-all duration-500"
            >
              {/* Hover gradient */}
              <div 
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `linear-gradient(135deg, ${category.color}08, transparent)` }}
              />

              <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="h-11 w-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{ 
                      background: `linear-gradient(135deg, ${category.color}20, ${category.color}08)`,
                    }}
                  >
                    <category.icon className="h-5 w-5" style={{ color: category.color }} />
                  </div>
                  <div 
                    className="text-2xl font-semibold tabular-nums"
                    style={{ color: category.color }}
                  >
                    {category.count}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-3">{category.title}</h3>

                {/* Metrics preview */}
                <div className="flex flex-wrap gap-2">
                  {category.metrics.slice(0, 3).map((metric) => (
                    <span 
                      key={metric} 
                      className="text-xs px-2.5 py-1 rounded-full border border-white/[0.05] bg-white/[0.02] text-gray-400"
                    >
                      {metric}
                    </span>
                  ))}
                  <span className="text-xs px-2.5 py-1 text-gray-500">
                    +{category.count - 3} more
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div
          className="text-center"
        >
          <Link
            href="/dashboard/stock-analysis"
            className="group inline-flex items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.02] px-6 py-3 text-sm font-medium text-white backdrop-blur-sm hover:border-[#00D4FF]/30 hover:bg-[#00D4FF]/[0.05] transition-all duration-300"
          >
            Explore Full Library
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
