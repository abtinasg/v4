import { ArrowRight, Zap } from 'lucide-react'

export function TerminalPro() {
  return (
    <section className="py-32 px-4 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative">
        {/* Badge */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20">
            <Zap className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-blue-400 font-medium">Professional Trading Terminal</span>
          </div>
        </div>

        {/* Heading */}
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent">
            Meet our Terminal Pro
          </h2>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
            Real-time market data, advanced charting, and institutional-grade analytics in one powerful platform
          </p>
        </div>

        {/* Terminal Mock UI */}
        <div className="relative group">
          {/* Glow effect behind */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-blue-400/20 to-blue-500/20 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Terminal Container */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-zinc-950 backdrop-blur-sm">
            {/* Terminal Header */}
            <div className="bg-zinc-900 border-b border-white/5 px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-sm text-zinc-400 ml-4">Terminal Pro</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-xs px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE
                </div>
                <div className="text-xs text-zinc-500">NYSE: AAPL</div>
              </div>
            </div>

            {/* Terminal Body */}
            <div className="p-6 space-y-6">
              {/* Top Stats Bar */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
                  <div className="text-xs text-zinc-500 mb-1">Price</div>
                  <div className="text-2xl font-bold text-white">$185.92</div>
                  <div className="text-xs text-emerald-400">+2.34%</div>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
                  <div className="text-xs text-zinc-500 mb-1">Market Cap</div>
                  <div className="text-2xl font-bold text-white">$2.89T</div>
                  <div className="text-xs text-zinc-500">Trillion</div>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
                  <div className="text-xs text-zinc-500 mb-1">P/E Ratio</div>
                  <div className="text-2xl font-bold text-white">29.4</div>
                  <div className="text-xs text-blue-400">Above avg</div>
                </div>
                <div className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
                  <div className="text-xs text-zinc-500 mb-1">Volume</div>
                  <div className="text-2xl font-bold text-white">58.2M</div>
                  <div className="text-xs text-zinc-500">Average</div>
                </div>
              </div>

              {/* Chart Area */}
              <div className="bg-white/[0.02] rounded-lg p-6 border border-white/5 relative h-64">
                <div className="absolute inset-0 flex items-end justify-between px-6 pb-6">
                  {[65, 45, 70, 55, 80, 60, 85, 75, 90, 70, 95, 85, 100].map((height, i) => (
                    <div key={i} className="flex-1 flex flex-col justify-end px-1">
                      <div 
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                        style={{ height: `${height}%` }}
                      />
                    </div>
                  ))}
                </div>
                <div className="absolute top-4 right-4 flex gap-2">
                  <button className="px-3 py-1 text-xs rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">1D</button>
                  <button className="px-3 py-1 text-xs rounded bg-white/5 text-zinc-500 border border-white/5">1W</button>
                  <button className="px-3 py-1 text-xs rounded bg-white/5 text-zinc-500 border border-white/5">1M</button>
                  <button className="px-3 py-1 text-xs rounded bg-white/5 text-zinc-500 border border-white/5">1Y</button>
                </div>
              </div>

              {/* Bottom Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* AI Insights */}
                <div className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded bg-purple-500/20 flex items-center justify-center">
                      <span className="text-xs">🤖</span>
                    </div>
                    <span className="text-sm font-medium text-white">AI Insights</span>
                  </div>
                  <div className="space-y-2 text-xs text-zinc-400">
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-emerald-400 mt-1.5" />
                      <span>Strong revenue growth (+12% YoY)</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-blue-400 mt-1.5" />
                      <span>Healthy balance sheet metrics</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-yellow-400 mt-1.5" />
                      <span>Valuation slightly above sector avg</span>
                    </div>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="bg-white/[0.02] rounded-lg p-4 border border-white/5">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded bg-blue-500/20 flex items-center justify-center">
                      <span className="text-xs">📊</span>
                    </div>
                    <span className="text-sm font-medium text-white">Key Metrics</span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">ROE</span>
                      <span className="text-white font-medium">147.4%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Debt/Equity</span>
                      <span className="text-white font-medium">1.57</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Free Cash Flow</span>
                      <span className="text-white font-medium">$99.6B</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature badges */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex flex-wrap justify-center gap-3">
            {[
              'Real-time Data',
              'Advanced Charts',
              'News Terminal',
              'Portfolio Tracking',
              'AI Insights'
            ].map((feature) => (
              <div
                key={feature}
                className="px-4 py-2 rounded-lg bg-zinc-900 backdrop-blur-md border border-white/20 text-sm font-medium"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-blue-500 hover:bg-blue-600 transition-colors text-white font-semibold text-lg group"
          >
            Try Terminal Pro Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <p className="text-sm text-zinc-500 mt-4">
            No credit card required · Start with 70 free credits
          </p>
        </div>
      </div>
    </section>
  )
}
