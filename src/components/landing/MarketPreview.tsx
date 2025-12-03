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
    <section className="relative py-16 bg-[#030407] overflow-hidden">
      {/* Fade divider top */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
      
      <div className="relative z-10 mx-auto max-w-5xl px-6">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-6">
          <div>
            <h3 className="text-lg font-bold text-white mb-0.5">Live Market</h3>
            <p className="text-xs text-[#64748B]">Real-time data at your fingertips</p>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-[#34D399] shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
            <span className="text-[10px] text-[#64748B] font-medium">Market Open</span>
          </div>
        </div>

        {/* Market Indices - Horizontal scroll on mobile */}
        <div className="relative">
          <div className="flex gap-2 overflow-x-auto pb-3 scrollbar-hide">
            {marketData.map((item) => (
              <div
                key={item.symbol}
                className="
                  flex-shrink-0 w-[140px]
                  rounded-lg p-3
                  bg-[#0A0D12]/80 border border-white/[0.06]
                  hover:bg-[#0C1017] hover:border-white/[0.08]
                  transition-all duration-200
                  backdrop-blur-[4px]
                "
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider">
                    {item.symbol}
                  </span>
                  <span className={`text-[10px] font-bold ${item.positive ? 'text-[#34D399]' : 'text-[#F87171]'}`}>
                    {item.change}
                  </span>
                </div>
                <div className="text-base font-bold text-white tabular-nums">
                  ${item.price}
                </div>
                <div className="text-[10px] text-[#475569] mt-0.5">
                  {item.name}
                </div>
              </div>
            ))}
          </div>
          
          {/* Fade edges */}
          <div className="absolute top-0 right-0 bottom-3 w-12 bg-gradient-to-l from-[#030407] to-transparent pointer-events-none" />
        </div>

        {/* Top Movers */}
        <div className="mt-8">
          <h4 className="text-xs font-bold text-[#94A3B8] mb-3 uppercase tracking-wider">Top Movers</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {topMovers.map((stock) => (
              <div
                key={stock.symbol}
                className="
                  rounded-lg p-3
                  bg-[#0A0D12]/60 border border-white/[0.04]
                  hover:bg-[#0C1017]/80 hover:border-white/[0.06]
                  transition-all duration-200
                  cursor-pointer
                "
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-white">{stock.symbol}</div>
                    <div className="text-[10px] text-[#475569]">{stock.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-white tabular-nums">${stock.price}</div>
                    <div className={`text-[10px] font-bold ${stock.positive ? 'text-[#34D399]' : 'text-[#F87171]'}`}>
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
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </section>
  )
}
