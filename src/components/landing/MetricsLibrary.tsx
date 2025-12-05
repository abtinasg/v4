'use client'

import { BarChart3, TrendingUp, DollarSign, Activity, Gauge, PieChart, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const categories = [
  {
    title: 'Valuation',
    count: 28,
    icon: DollarSign,
    color: '#5B7CFF',
    metrics: ['P/E Ratio', 'P/B Ratio', 'EV/EBITDA', 'PEG Ratio', 'Price/Sales']
  },
  {
    title: 'Profitability',
    count: 35,
    icon: TrendingUp,
    color: '#22C55E',
    metrics: ['ROE', 'ROA', 'Net Margin', 'Gross Margin', 'Operating Margin']
  },
  {
    title: 'Growth',
    count: 30,
    icon: BarChart3,
    color: '#00C9E4',
    metrics: ['Revenue Growth', 'EPS Growth', 'FCF Growth', 'EBITDA Growth', 'Book Value Growth']
  },
  {
    title: 'Technical',
    count: 42,
    icon: Activity,
    color: '#8B5CF6',
    metrics: ['RSI', 'MACD', 'Bollinger Bands', 'Moving Averages', 'Volume Analysis']
  },
  {
    title: 'Quality',
    count: 26,
    icon: Gauge,
    color: '#F59E0B',
    metrics: ['Debt/Equity', 'Current Ratio', 'Interest Coverage', 'Altman Z-Score', 'Piotroski Score']
  },
  {
    title: 'Efficiency',
    count: 29,
    icon: PieChart,
    color: '#EF4444',
    metrics: ['Asset Turnover', 'Inventory Turnover', 'Receivables Turnover', 'Working Capital', 'Cash Conversion']
  }
]

export function MetricsLibrary() {
  const totalMetrics = categories.reduce((acc, cat) => acc + cat.count, 0)

  return (
    <section className="relative py-28 md:py-36 bg-[#030508] overflow-hidden">
      {/* Premium ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        <div className="absolute top-[30%] right-[-10%] w-[500px] h-[500px] rounded-full bg-[#00C9E4]/[0.04] blur-[150px]" />
        <div className="absolute bottom-[20%] left-[-10%] w-[400px] h-[400px] rounded-full bg-[#8B5CF6]/[0.03] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#00C9E4]/20 bg-[#00C9E4]/[0.06] px-5 py-2 text-sm font-medium text-[#00C9E4] mb-8">
            <BarChart3 className="h-4 w-4" />
            Metrics Library
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight text-white mb-6">
            <span className="bg-gradient-to-r from-[#5B7CFF] via-[#00C9E4] to-[#8B5CF6] bg-clip-text text-transparent">
              {totalMetrics}+
            </span>{' '}
            Institutional Metrics
          </h2>

          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
            From fundamental analysis to technical indicators — every metric you need to make confident investment decisions.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {categories.map((category) => (
            <div
              key={category.title}
              className="group relative rounded-2xl border border-white/[0.06] bg-gradient-to-b from-white/[0.03] to-transparent p-7 backdrop-blur-sm overflow-hidden transition-all duration-500 hover:border-white/[0.12]"
            >
              {/* Hover gradient */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{ background: `linear-gradient(135deg, ${category.color}10, transparent)` }}
              />

              <div className="relative">
                {/* Header */}
                <div className="flex items-start justify-between mb-5">
                  <div
                    className="h-12 w-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                    style={{
                      background: `linear-gradient(135deg, ${category.color}25, ${category.color}10)`,
                    }}
                  >
                    <category.icon className="h-6 w-6" style={{ color: category.color }} />
                  </div>
                  <div
                    className="text-2xl font-semibold tabular-nums"
                    style={{ color: category.color }}
                  >
                    {category.count}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-lg font-semibold text-white mb-4">{category.title}</h3>

                {/* Metrics preview */}
                <div className="flex flex-wrap gap-2">
                  {category.metrics.slice(0, 3).map((metric) => (
                    <span
                      key={metric}
                      className="text-xs px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] text-gray-400"
                    >
                      {metric}
                    </span>
                  ))}
                  <span className="text-xs px-3 py-1.5 text-gray-500">
                    +{category.count - 3} more
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/dashboard/stock-analysis"
            className="group inline-flex items-center gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:border-[#00C9E4]/30 hover:bg-[#00C9E4]/[0.05]"
          >
            Explore Full Library
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
