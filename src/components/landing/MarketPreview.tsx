'use client'

const marketData = [
  { symbol: 'SPY', name: 'S&P 500', price: '589.24', change: '+1.24%', positive: true },
  { symbol: 'QQQ', name: 'NASDAQ', price: '505.18', change: '+1.89%', positive: true },
  { symbol: 'DIA', name: 'Dow Jones', price: '428.45', change: '+0.87%', positive: true },
  { symbol: 'IWM', name: 'Russell 2000', price: '223.67', change: '+2.14%', positive: true },
  { symbol: 'GLD', name: 'Gold', price: '242.89', change: '-0.32%', positive: false },
  { symbol: 'TLT', name: '20Y Treasury', price: '92.45', change: '+0.18%', positive: true },
]

const topMovers = [
  { symbol: 'NVDA', name: 'NVIDIA', price: '875.42', change: '+4.2%', positive: true },
  { symbol: 'TSLA', name: 'Tesla', price: '312.89', change: '+3.8%', positive: true },
  { symbol: 'AMD', name: 'AMD', price: '142.56', change: '+2.9%', positive: true },
  { symbol: 'NFLX', name: 'Netflix', price: '478.23', change: '-2.1%', positive: false },
]

export function MarketPreview() {
  return (
    <section className="relative py-24 bg-[#030407] overflow-hidden">
      {/* Fade divider top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
      
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <h3 className="text-xl font-semibold text-white mb-1">Live Market</h3>
            <p className="text-sm text-[#64748B]">Real-time data at your fingertips</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-[#34D399] animate-pulse" />
            <span className="text-xs text-[#64748B]">Market Open</span>
          </div>
        </div>

        {/* Market Indices - Horizontal scroll on mobile */}
        <div className="relative">
          <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
            {marketData.map((item) => (
              <div
                key={item.symbol}
                className="
                  flex-shrink-0 w-[160px]
                  rounded-xl p-4
                  bg-white/[0.02] border border-white/[0.04]
                  hover:bg-white/[0.03] hover:border-white/[0.06]
                  transition-all duration-200
                "
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-[#64748B] font-medium uppercase tracking-wider">
                    {item.symbol}
                  </span>
                  <span className={`text-xs font-medium ${item.positive ? 'text-[#34D399]' : 'text-[#F87171]'}`}>
                    {item.change}
                  </span>
                </div>
                <div className="text-lg font-semibold text-white tabular-nums">
                  ${item.price}
                </div>
                <div className="text-[11px] text-[#475569] mt-1">
                  {item.name}
                </div>
              </div>
            ))}
          </div>
          
          {/* Fade edges */}
          <div className="absolute top-0 right-0 bottom-4 w-16 bg-gradient-to-l from-[#030407] to-transparent pointer-events-none" />
        </div>

        {/* Top Movers */}
        <div className="mt-12">
          <h4 className="text-sm font-medium text-[#94A3B8] mb-4">Top Movers</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {topMovers.map((stock) => (
              <div
                key={stock.symbol}
                className="
                  rounded-xl p-4
                  bg-white/[0.01] border border-white/[0.03]
                  hover:bg-white/[0.02] hover:border-white/[0.05]
                  transition-all duration-200
                  cursor-pointer
                "
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-white">{stock.symbol}</div>
                    <div className="text-xs text-[#475569] mt-0.5">{stock.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white tabular-nums">${stock.price}</div>
                    <div className={`text-xs font-medium ${stock.positive ? 'text-[#34D399]' : 'text-[#F87171]'}`}>
                      {stock.change}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Fade divider bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.04] to-transparent" />
    </section>
  )
}
