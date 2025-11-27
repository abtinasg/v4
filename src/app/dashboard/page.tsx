import { TopMovers, MarketOverview, EconomicIndicators } from "@/components/dashboard"

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Market Overview</h1>
        <p className="text-gray-400">Real-time market data and your portfolio performance</p>
      </div>

      {/* Market Overview with real data */}
      <MarketOverview />

      {/* Top Movers */}
      <TopMovers />

      {/* Economic Indicators */}
      <EconomicIndicators />
    </div>
  )
}
