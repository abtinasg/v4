import { ArrowRight, Zap, BarChart3, TrendingUp, DollarSign, Newspaper, Search, Fuel } from 'lucide-react'

export function TerminalPro() {
  return (
    <section className="py-32 px-4 relative overflow-hidden hidden md:block">
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

        {/* Terminal UI Mock */}
        <div className="relative group">
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-orange-400/10 to-orange-500/10 rounded-2xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {/* Terminal Container */}
          <div className="relative rounded-2xl overflow-hidden border border-white/10 bg-black shadow-[0_20px_60px_rgba(0,0,0,0.6)]">
            {/* Terminal Header */}
            <div className="h-8 bg-[#1a1a1a] border-b border-[#333] flex items-center px-3 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-[#FF6600] font-bold text-sm font-mono">DEEPIN</span>
                <span className="text-[#FF6600] text-xs font-mono">PRO</span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="text-gray-400">
                  NYSE: <span className="text-green-400">OPEN</span>
                </span>
                <span className="text-gray-400">
                  NASDAQ: <span className="text-green-400">OPEN</span>
                </span>
                <span className="text-gray-400">
                  LSE: <span className="text-red-400">CLOSED</span>
                </span>
              </div>
              <div className="text-[#FF6600] text-xs font-bold font-mono">
                THU DEC 05 2024 14:32:18 ET
              </div>
            </div>

            {/* Function Keys Bar */}
            <div className="h-6 bg-[#0a0a0a] border-b border-[#222] flex items-center px-1 gap-1">
              {['F1 HELP', 'F2 NEWS', 'F3 QUOTE', 'F4 CHART', 'F5 ANLY', 'F6 PORT', 'F7 SRCH'].map((key) => (
                <div
                  key={key}
                  className="px-2 py-0.5 text-[10px] bg-[#1a1a1a] text-gray-300 rounded font-mono"
                >
                  {key}
                </div>
              ))}
            </div>

            {/* Main Content */}
            <div className="flex">
              {/* Sidebar */}
              <div className="w-12 bg-[#0a0a0a] border-r border-[#222] flex flex-col items-center py-2 gap-1">
                {[
                  { icon: BarChart3, label: 'MRKT', active: true },
                  { icon: TrendingUp, label: 'EQ', active: false },
                  { icon: DollarSign, label: 'FX', active: false },
                  { icon: Fuel, label: 'CMDTY', active: false },
                  { icon: Newspaper, label: 'NEWS', active: false },
                  { icon: Search, label: 'SRCH', active: false },
                ].map((item) => (
                  <div
                    key={item.label}
                    className={`w-10 h-10 flex flex-col items-center justify-center rounded text-[8px] font-mono ${
                      item.active
                        ? 'bg-[#FF6600]/20 text-[#FF6600] border border-[#FF6600]/50'
                        : 'text-gray-500'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              {/* Main Panels Grid */}
              <div className="flex-1 p-2 grid grid-cols-4 gap-2">
                {/* Market Indices Panel */}
                <div className="bg-[#0d0d0d] border border-[#222] rounded">
                  <div className="px-2 py-1 border-b border-[#222] flex items-center justify-between">
                    <span className="text-[#FF6600] text-[10px] font-mono font-bold">MARKET INDICES</span>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-yellow-500/60" />
                      <div className="w-2 h-2 rounded-full bg-green-500/60" />
                    </div>
                  </div>
                  <div className="p-2 space-y-1 text-[10px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-400">S&P 500</span>
                      <span className="text-green-400">+1.24%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">NASDAQ</span>
                      <span className="text-green-400">+1.87%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">DOW</span>
                      <span className="text-green-400">+0.92%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">RUSSELL</span>
                      <span className="text-red-400">-0.34%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">VIX</span>
                      <span className="text-red-400">-2.15%</span>
                    </div>
                  </div>
                </div>

                {/* Sector Heatmap Panel */}
                <div className="bg-[#0d0d0d] border border-[#222] rounded">
                  <div className="px-2 py-1 border-b border-[#222]">
                    <span className="text-[#FF6600] text-[10px] font-mono font-bold">SECTOR HEATMAP</span>
                  </div>
                  <div className="p-2 grid grid-cols-3 gap-1">
                    {[
                      { name: 'TECH', change: '+2.1%', color: 'bg-green-600' },
                      { name: 'HLTH', change: '+1.2%', color: 'bg-green-500' },
                      { name: 'FINL', change: '+0.8%', color: 'bg-green-400/80' },
                      { name: 'ENGY', change: '-0.5%', color: 'bg-red-400/80' },
                      { name: 'UTIL', change: '-0.2%', color: 'bg-red-400/60' },
                      { name: 'CONS', change: '+1.5%', color: 'bg-green-500' },
                    ].map((sector) => (
                      <div
                        key={sector.name}
                        className={`${sector.color} rounded p-1 text-center`}
                      >
                        <div className="text-[8px] font-mono text-white font-bold">{sector.name}</div>
                        <div className="text-[9px] font-mono text-white">{sector.change}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Movers Panel */}
                <div className="bg-[#0d0d0d] border border-[#222] rounded">
                  <div className="px-2 py-1 border-b border-[#222]">
                    <span className="text-[#FF6600] text-[10px] font-mono font-bold">TOP MOVERS</span>
                  </div>
                  <div className="p-2 space-y-1 text-[10px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-white">NVDA</span>
                      <span className="text-green-400">+8.42%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white">TSLA</span>
                      <span className="text-green-400">+5.21%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white">AAPL</span>
                      <span className="text-green-400">+2.34%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white">META</span>
                      <span className="text-red-400">-1.87%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white">AMZN</span>
                      <span className="text-green-400">+1.56%</span>
                    </div>
                  </div>
                </div>

                {/* News Panel */}
                <div className="bg-[#0d0d0d] border border-[#222] rounded">
                  <div className="px-2 py-1 border-b border-[#222]">
                    <span className="text-[#FF6600] text-[10px] font-mono font-bold">NEWS FEED</span>
                  </div>
                  <div className="p-2 space-y-2 text-[9px] font-mono">
                    <div className="border-l-2 border-blue-500 pl-2">
                      <div className="text-gray-300">Fed signals rate cuts ahead as inflation cools</div>
                      <div className="text-gray-500">2m ago</div>
                    </div>
                    <div className="border-l-2 border-green-500 pl-2">
                      <div className="text-gray-300">NVDA surges on AI chip demand forecast</div>
                      <div className="text-gray-500">15m ago</div>
                    </div>
                    <div className="border-l-2 border-yellow-500 pl-2">
                      <div className="text-gray-300">Oil prices stabilize amid supply concerns</div>
                      <div className="text-gray-500">32m ago</div>
                    </div>
                  </div>
                </div>

                {/* Currencies Panel */}
                <div className="bg-[#0d0d0d] border border-[#222] rounded">
                  <div className="px-2 py-1 border-b border-[#222]">
                    <span className="text-cyan-400 text-[10px] font-mono font-bold">CURRENCIES</span>
                  </div>
                  <div className="p-2 space-y-1 text-[10px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-400">EUR/USD</span>
                      <span className="text-white">1.0892</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">GBP/USD</span>
                      <span className="text-white">1.2734</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">USD/JPY</span>
                      <span className="text-white">149.52</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">BTC/USD</span>
                      <span className="text-green-400">$98,420</span>
                    </div>
                  </div>
                </div>

                {/* Commodities Panel */}
                <div className="bg-[#0d0d0d] border border-[#222] rounded">
                  <div className="px-2 py-1 border-b border-[#222]">
                    <span className="text-yellow-400 text-[10px] font-mono font-bold">COMMODITIES</span>
                  </div>
                  <div className="p-2 space-y-1 text-[10px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-400">GOLD</span>
                      <span className="text-green-400">$2,042</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">SILVER</span>
                      <span className="text-green-400">$24.18</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">OIL WTI</span>
                      <span className="text-red-400">$71.24</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">NAT GAS</span>
                      <span className="text-red-400">$2.84</span>
                    </div>
                  </div>
                </div>

                {/* Crypto Panel */}
                <div className="bg-[#0d0d0d] border border-[#222] rounded">
                  <div className="px-2 py-1 border-b border-[#222]">
                    <span className="text-purple-400 text-[10px] font-mono font-bold">CRYPTO</span>
                  </div>
                  <div className="p-2 space-y-1 text-[10px] font-mono">
                    <div className="flex justify-between">
                      <span className="text-gray-400">BTC</span>
                      <span className="text-green-400">+4.21%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">ETH</span>
                      <span className="text-green-400">+3.87%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">SOL</span>
                      <span className="text-green-400">+6.54%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">XRP</span>
                      <span className="text-green-400">+2.12%</span>
                    </div>
                  </div>
                </div>

                {/* Market Breadth Panel */}
                <div className="bg-[#0d0d0d] border border-[#222] rounded">
                  <div className="px-2 py-1 border-b border-[#222]">
                    <span className="text-emerald-400 text-[10px] font-mono font-bold">MARKET BREADTH</span>
                  </div>
                  <div className="p-2 space-y-2">
                    <div>
                      <div className="text-[9px] font-mono text-gray-400 mb-1">NYSE A/D</div>
                      <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden flex">
                        <div className="bg-green-500 h-full" style={{ width: '65%' }} />
                        <div className="bg-red-500 h-full" style={{ width: '35%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-mono text-gray-400 mb-1">NASDAQ A/D</div>
                      <div className="h-2 bg-[#1a1a1a] rounded-full overflow-hidden flex">
                        <div className="bg-green-500 h-full" style={{ width: '58%' }} />
                        <div className="bg-red-500 h-full" style={{ width: '42%' }} />
                      </div>
                    </div>
                    <div className="flex justify-between text-[9px] font-mono">
                      <span className="text-green-400">2,145 ↑</span>
                      <span className="text-red-400">1,234 ↓</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Command Input */}
            <div className="h-8 bg-[#1a1a1a] border-t border-[#333] flex items-center px-3">
              <span className="text-[#FF6600] mr-2 text-sm font-mono">&gt;</span>
              <span className="text-green-400 text-sm font-mono">AAPL GO</span>
              <span className="w-2 h-4 bg-green-400 ml-1 animate-pulse" />
              <div className="flex-1" />
              <div className="flex items-center gap-2 text-[10px] text-gray-500 font-mono">
                <span>ESC: Clear</span>
                <span>|</span>
                <span>↑↓: History</span>
                <span>|</span>
                <span>ENTER: Execute</span>
              </div>
            </div>

            {/* Footer Status */}
            <div className="h-5 bg-[#0a0a0a] border-t border-[#222] flex items-center px-3 text-[10px] font-mono">
              <div className="flex items-center gap-4 text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  CONNECTED
                </span>
                <span>DEEPIN PRO v2.0</span>
                <span>|</span>
                <span>DATA: REAL-TIME</span>
                <span>|</span>
                <span>VIEW: MRKT</span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-4 text-gray-500">
                <span>LATENCY: 24ms</span>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-12">
          <a
            href="/dashboard/terminal-pro"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#FF6600] hover:bg-[#FF6600]/90 transition-colors text-white font-semibold text-lg group"
          >
            Try Terminal Pro Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </a>
          <p className="text-sm text-zinc-500 mt-4">
            No credit card required · Start with 50 free credits
          </p>
        </div>
      </div>
    </section>
  )
}
