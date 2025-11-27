'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, TrendingUp, Star, ChevronRight, BarChart3, SlidersHorizontal, GitCompareArrows } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const popularStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.', sector: 'Technology' },
  { symbol: 'MSFT', name: 'Microsoft Corporation', sector: 'Technology' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.', sector: 'Technology' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation', sector: 'Technology' },
  { symbol: 'META', name: 'Meta Platforms Inc.', sector: 'Technology' },
  { symbol: 'TSLA', name: 'Tesla Inc.', sector: 'Consumer Cyclical' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.', sector: 'Financial Services' },
]

const metricCategories = [
  { name: 'Valuation', count: 25, color: '#00D4FF' },
  { name: 'Profitability', count: 32, color: '#22C55E' },
  { name: 'Growth', count: 28, color: '#3B82F6' },
  { name: 'Technical', count: 35, color: '#8B5CF6' },
  { name: 'Quality', count: 20, color: '#F59E0B' },
  { name: 'Efficiency', count: 18, color: '#2DD4BF' },
]

export default function StockAnalysisPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/dashboard/stock-analysis/${searchQuery.trim().toUpperCase()}`)
    }
  }

  const handleStockClick = (symbol: string) => {
    router.push(`/dashboard/stock-analysis/${symbol}`)
  }

  return (
    <div className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8 p-2 sm:p-3 md:p-4 lg:p-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">Stock Analysis</h1>
        <p className="text-gray-400 mt-0.5 sm:mt-1 text-xs sm:text-sm md:text-base">Deep dive into individual stocks with 150+ institutional-grade metrics</p>
      </div>

      {/* Search Section */}
      <Card className="border-white/[0.05] bg-[#0A0D12]/60 backdrop-blur-sm">
        <CardContent className="pt-3 sm:pt-4 md:pt-6">
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-2.5 sm:left-3 md:left-4 top-1/2 -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 md:h-5 md:w-5 text-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search for any stock symbol (e.g., AAPL, MSFT, TSLA)"
              className="w-full pl-8 sm:pl-10 md:pl-12 pr-20 sm:pr-24 md:pr-28 py-2.5 sm:py-3 md:py-4 bg-white/[0.03] border border-white/[0.08] rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50 focus:ring-1 focus:ring-[#00D4FF]/30 transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 sm:right-2 top-1/2 -translate-y-1/2 px-2.5 sm:px-3 md:px-5 py-1.5 sm:py-1.5 md:py-2 bg-gradient-to-r from-[#00D4FF] to-[#3B82F6] rounded-lg text-[10px] sm:text-xs md:text-sm font-medium text-[#05070B] hover:shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all"
            >
              Analyze
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Popular Stocks */}
      <div>
        <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-[#00D4FF]" />
          <h2 className="text-base sm:text-lg font-semibold text-white">Popular Stocks</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
          {popularStocks.map((stock) => (
            <button
              key={stock.symbol}
              onClick={() => handleStockClick(stock.symbol)}
              className="group p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-white/[0.05] bg-[#0A0D12]/40 hover:border-[#00D4FF]/30 hover:bg-[#00D4FF]/[0.03] transition-all duration-300 text-left"
            >
              <div className="flex items-center justify-between mb-1 sm:mb-1.5">
                <span className="text-base sm:text-lg font-semibold text-white">{stock.symbol}</span>
                <ChevronRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600 group-hover:text-[#00D4FF] transition-colors" />
              </div>
              <p className="text-xs sm:text-sm text-gray-500 truncate">{stock.name}</p>
              <span className="inline-block mt-1.5 sm:mt-2 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full bg-white/[0.03] text-gray-400">
                {stock.sector}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Tools Section */}
      <div>
        <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          <SlidersHorizontal className="h-4 w-4 sm:h-5 sm:w-5 text-[#22C55E]" />
          <h2 className="text-base sm:text-lg font-semibold text-white">Analysis Tools</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <button
            onClick={() => router.push('/dashboard/stock-analysis/compare')}
            className="group p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-white/[0.05] bg-[#0A0D12]/40 hover:border-[#00D4FF]/30 hover:bg-[#00D4FF]/[0.03] transition-all duration-300 text-left"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4">
              <div className="p-2 sm:p-2.5 md:p-3 rounded-lg bg-[#00D4FF]/10">
                <GitCompareArrows className="h-5 w-5 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 text-[#00D4FF]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base md:text-lg font-semibold text-white">Compare Stocks</span>
                  <ChevronRight className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-gray-600 group-hover:text-[#00D4FF] transition-colors" />
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Compare up to 5 stocks side-by-side with visual charts</p>
              </div>
            </div>
          </button>
          <button
            onClick={() => router.push('/dashboard/stock-analysis/screener')}
            className="group p-3 sm:p-4 md:p-6 rounded-lg sm:rounded-xl border border-white/[0.05] bg-[#0A0D12]/40 hover:border-[#22C55E]/30 hover:bg-[#22C55E]/[0.03] transition-all duration-300 text-left"
          >
            <div className="flex items-center gap-2.5 sm:gap-3 md:gap-4">
              <div className="p-2 sm:p-2.5 md:p-3 rounded-lg bg-[#22C55E]/10">
                <SlidersHorizontal className="h-5 w-5 sm:h-5.5 sm:w-5.5 md:h-6 md:w-6 text-[#22C55E]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm sm:text-base md:text-lg font-semibold text-white">Stock Screener</span>
                  <ChevronRight className="h-4 w-4 sm:h-4.5 sm:w-4.5 md:h-5 md:w-5 text-gray-600 group-hover:text-[#22C55E] transition-colors" />
                </div>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5 sm:mt-1">Filter stocks by metrics, sectors, and quality scores</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Metrics Library Preview */}
      <div>
        <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-[#8B5CF6]" />
          <h2 className="text-base sm:text-lg font-semibold text-white">Available Metrics</h2>
          <span className="text-xs sm:text-sm text-gray-500">({metricCategories.reduce((acc, cat) => acc + cat.count, 0)}+ total)</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-2.5 sm:gap-3 md:gap-4">
          {metricCategories.map((category) => (
            <div
              key={category.name}
              className="p-2.5 sm:p-3 md:p-4 rounded-lg sm:rounded-xl border border-white/[0.05] bg-[#0A0D12]/40"
            >
              <div className="text-xl sm:text-2xl font-semibold tabular-nums" style={{ color: category.color }}>
                {category.count}
              </div>
              <div className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">{category.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Guide */}
      <Card className="border-white/[0.05] bg-[#0A0D12]/60 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Star className="h-5 w-5 text-[#F59E0B]" />
            How to Use
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-[#00D4FF]/20 flex items-center justify-center text-xs text-[#00D4FF] font-medium">1</div>
            <p className="text-gray-400 text-sm">Search for any stock symbol using the search bar above</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-[#3B82F6]/20 flex items-center justify-center text-xs text-[#3B82F6] font-medium">2</div>
            <p className="text-gray-400 text-sm">View comprehensive financial metrics across valuation, profitability, growth, and more</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center text-xs text-[#8B5CF6] font-medium">3</div>
            <p className="text-gray-400 text-sm">Analyze price charts, technical indicators, and AI-powered insights</p>
          </div>
          <div className="flex items-start gap-3">
            <div className="h-6 w-6 rounded-full bg-[#22C55E]/20 flex items-center justify-center text-xs text-[#22C55E] font-medium">4</div>
            <p className="text-gray-400 text-sm">Use the screener to find stocks matching your criteria or compare multiple stocks</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
