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
    <section className="relative py-32 md:py-48 bg-[#030508] overflow-hidden">
      {/* 1. Ambient Background - Calm & Premium */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
        {/* Soft, large blurs for atmosphere */}
        <div className="absolute top-[20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-[#00C9E4]/[0.02] blur-[180px]" />
        <div className="absolute bottom-[10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-[#8B5CF6]/[0.02] blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        
        {/* 2. Information Hierarchy - Header */}
        <div className="max-w-3xl mx-auto text-center mb-24">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.08] backdrop-blur-md mb-8">
            <BarChart3 className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs font-medium tracking-widest text-gray-400 uppercase">Metrics Library</span>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white mb-8 leading-[1.1]">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5B7CFF] via-[#00C9E4] to-[#8B5CF6]">
              {totalMetrics}+
            </span>{' '}
            Institutional Metrics
          </h2>

          {/* Subheadline */}
          <p className="text-xl text-gray-400 font-light leading-relaxed">
            From fundamental analysis to technical indicators — every metric you need to make confident investment decisions.
          </p>
        </div>

        {/* 3. Premium Card Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 mb-20">
          {categories.map((category) => (
            <div
              key={category.title}
              className="group relative p-8 rounded-3xl border border-white/[0.08] bg-[#0A0F18]/60 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.5)] hover:border-white/[0.15]"
            >
              {/* Soft Gradient Glow on Hover */}
              <div 
                className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{ background: `linear-gradient(to bottom, ${category.color}05, transparent)` }}
              />

              <div className="relative flex flex-col h-full">
                {/* Header */}
                <div className="flex items-start justify-between mb-6">
                  <div 
                    className="h-12 w-12 rounded-2xl flex items-center justify-center border border-white/[0.08] bg-white/[0.02] group-hover:scale-110 transition-transform duration-500"
                    style={{ boxShadow: `0 0 20px ${category.color}10` }}
                  >
                    <category.icon className="h-5 w-5" style={{ color: category.color }} />
                  </div>
                  <div 
                    className="text-2xl font-medium tabular-nums tracking-tight"
                    style={{ color: category.color }}
                  >
                    {category.count}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-xl font-medium text-white mb-6">{category.title}</h3>

                {/* Metrics Chips */}
                <div className="flex flex-wrap gap-2 mt-auto">
                  {category.metrics.slice(0, 3).map((metric) => (
                    <span
                      key={metric}
                      className="text-xs px-3 py-1.5 rounded-full border border-white/[0.06] bg-white/[0.02] text-gray-400 font-light transition-colors group-hover:border-white/[0.1] group-hover:text-gray-300"
                    >
                      {metric}
                    </span>
                  ))}
                  <span className="text-xs px-3 py-1.5 text-gray-500 font-light">
                    +{category.count - 3} more
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* 5. CTA */}
        <div className="text-center">
          <Link
            href="/dashboard/stock-analysis"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-gradient-to-r from-[#5B7CFF] to-[#00C9E4] text-white font-medium transition-all hover:shadow-[0_0_30px_-5px_rgba(91,124,255,0.4)] hover:scale-[1.02]"
          >
            <span>Explore Full Library</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}
