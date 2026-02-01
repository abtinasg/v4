'use client'

import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react'

// Mock metrics data
const keyMetrics = [
  { label: 'Revenue TTM', value: '$394.3B', change: '+2.8%', positive: true },
  { label: 'Net Income', value: '$96.9B', change: '+5.1%', positive: true },
  { label: 'FCF Yield', value: '3.4%', change: '-0.2%', positive: false },
  { label: 'ROIC', value: '56.2%', change: '+1.3%', positive: true },
]

const tableData = [
  { metric: 'P/E Ratio', current: '28.4', '5YAvg': '25.2', industry: '22.1', badge: 'TTM' },
  { metric: 'EV/EBITDA', current: '21.7', '5YAvg': '19.8', industry: '18.5', badge: null },
  { metric: 'Debt/Equity', current: '1.81', '5YAvg': '1.45', industry: '1.23', badge: null },
  { metric: 'Gross Margin', current: '45.9%', '5YAvg': '43.2%', industry: '41.5%', badge: '5Y Avg' },
]

export function ProductPreview() {
  return (
    <section className="relative py-24 bg-[#111418]">
      {/* Section border */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />

      <div className="mx-auto max-w-6xl px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[12px] font-medium text-[#4ECDC4] uppercase tracking-wider mb-4">
            Product Preview
          </p>
          <h2 className="text-3xl md:text-4xl font-semibold text-white tracking-tight mb-4">
            Data-first analysis interface
          </h2>
          <p className="text-lg text-white/50 max-w-xl mx-auto font-light">
            Clean, dense information design for professional workflows.
          </p>
        </div>

        {/* Dashboard Mock */}
        <div className="rounded-2xl border border-white/8 bg-[#0D0F12] overflow-hidden shadow-2xl">
          {/* Header bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/6 bg-[#13161A]">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-[#E67E22]/10 flex items-center justify-center">
                  <span className="text-[11px] font-bold text-[#E67E22]">AAPL</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Apple Inc.</div>
                  <div className="text-xs text-white/40">NASDAQ · Technology</div>
                </div>
              </div>
              <div className="flex items-center gap-1.5 ml-4">
                <span className="text-lg font-semibold text-white">$178.32</span>
                <span className="flex items-center text-xs font-medium text-[#27AE60]">
                  <ArrowUpRight className="h-3 w-3" />
                  +1.24%
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-full bg-[#9B87F5]/10 text-[#9B87F5] border border-[#9B87F5]/20">
                AI Insight
              </span>
              <span className="px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider rounded-full bg-[#27AE60]/10 text-[#27AE60] border border-[#27AE60]/20">
                Strong Buy
              </span>
            </div>
          </div>

          {/* Content grid */}
          <div className="grid lg:grid-cols-3 gap-px bg-white/4">
            {/* Key Metrics Panel */}
            <div className="lg:col-span-1 p-5 bg-[#0D0F12]">
              <h4 className="text-[11px] font-medium text-white/40 uppercase tracking-wider mb-4">Key Metrics</h4>
              <div className="space-y-3">
                {keyMetrics.map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between p-3 rounded-lg bg-[#13161A] border border-white/4">
                    <div>
                      <div className="text-xs text-white/50 mb-0.5">{metric.label}</div>
                      <div className="text-sm font-semibold text-white">{metric.value}</div>
                    </div>
                    <div className={`flex items-center text-xs font-medium ${metric.positive ? 'text-[#27AE60]' : 'text-[#E74C3C]'}`}>
                      {metric.positive ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                      {metric.change}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chart Area */}
            <div className="lg:col-span-1 p-5 bg-[#0D0F12] border-x border-white/4">
              <h4 className="text-[11px] font-medium text-white/40 uppercase tracking-wider mb-4">Revenue Trend (5Y)</h4>
              <div className="h-48 flex items-end justify-between gap-2 px-2">
                {/* Simple bar chart mock */}
                {[65, 72, 78, 85, 92, 100].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div 
                      className="w-full bg-gradient-to-t from-[#E67E22]/30 to-[#E67E22]/60 rounded-t"
                      style={{ height: `${height}%` }}
                    />
                    <span className="text-[9px] text-white/30">{2019 + i}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center justify-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded bg-[#E67E22]" />
                  <span className="text-[10px] text-white/40">Revenue</span>
                </div>
                <div className="text-[10px] text-white/30">CAGR: 8.2%</div>
              </div>
            </div>

            {/* Valuation Table */}
            <div className="lg:col-span-1 p-5 bg-[#0D0F12]">
              <h4 className="text-[11px] font-medium text-white/40 uppercase tracking-wider mb-4">Valuation Metrics</h4>
              <div className="overflow-hidden rounded-lg border border-white/4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#13161A]">
                      <th className="text-left py-2 px-3 text-white/40 font-medium">Metric</th>
                      <th className="text-right py-2 px-3 text-white/40 font-medium">Current</th>
                      <th className="text-right py-2 px-3 text-white/40 font-medium">5Y Avg</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/4">
                    {tableData.map((row) => (
                      <tr key={row.metric} className="hover:bg-white/[0.02]">
                        <td className="py-2 px-3 text-white/70 font-medium">
                          <div className="flex items-center gap-1.5">
                            {row.metric}
                            {row.badge && (
                              <span className="px-1.5 py-0.5 text-[8px] font-medium rounded bg-white/5 text-white/40">
                                {row.badge}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2 px-3 text-right text-white font-medium">{row.current}</td>
                        <td className="py-2 px-3 text-right text-white/50">{row['5YAvg']}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Footer bar */}
          <div className="px-6 py-3 border-t border-white/6 bg-[#13161A] flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-white/30">Data sources: Alpha Vantage · Polygon.io · SEC Filings</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-white/40">Last updated: 2 min ago</span>
              <div className="h-1.5 w-1.5 rounded-full bg-[#27AE60] animate-pulse" />
            </div>
          </div>
        </div>

        {/* Caption */}
        <p className="text-center text-sm text-white/40 mt-6">
          Institutional metrics, clear assumptions, repeatable workflows.
        </p>
      </div>
    </section>
  )
}
