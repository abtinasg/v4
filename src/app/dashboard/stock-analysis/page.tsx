'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, ArrowRight, GitCompareArrows, SlidersHorizontal, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import { FullDataButton } from '@/components/mobile'

const popularStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft' },
  { symbol: 'GOOGL', name: 'Alphabet' },
  { symbol: 'AMZN', name: 'Amazon' },
  { symbol: 'NVDA', name: 'NVIDIA' },
  { symbol: 'META', name: 'Meta' },
  { symbol: 'TSLA', name: 'Tesla' },
  { symbol: 'JPM', name: 'JPMorgan' },
]

export default function StockAnalysisPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
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
    <div className="min-h-screen bg-[#04060A]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        
        {/* Hero Section - Primary */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 lg:mb-20"
        >
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-white tracking-tight mb-3">
              Stock Analysis
            </h1>
            <p className="text-base sm:text-lg text-white/40 font-light max-w-xl mx-auto leading-relaxed">
              Institutional-grade insights powered by AI
            </p>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative max-w-2xl mx-auto">
            <div 
              className={cn(
                'relative rounded-2xl transition-all duration-300',
                'bg-white/[0.02] border',
                isFocused 
                  ? 'border-[#00C9E4]/30 shadow-[0_0_40px_rgba(0,201,228,0.08)]' 
                  : 'border-white/[0.06]'
              )}
            >
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder="Search any stock (AAPL, MSFT, TSLA...)"
                className={cn(
                  'w-full bg-transparent pl-14 pr-36 py-5',
                  'text-lg text-white placeholder:text-white/40',
                  'focus:outline-none'
                )}
              />
              <button
                type="submit"
                className={cn(
                  'absolute right-3 top-1/2 -translate-y-1/2',
                  'flex items-center gap-2 px-6 py-3 rounded-xl',
                  'bg-gradient-to-r from-[#00C9E4] to-[#00C9E4]/80',
                  'text-sm font-semibold text-[#04060A]',
                  'hover:shadow-[0_0_24px_rgba(0,201,228,0.3)]',
                  'transition-all duration-200'
                )}
              >
                <Sparkles className="w-4 h-4" />
                <span>Analyze</span>
              </button>
            </div>
          </form>
        </motion.section>

        {/* Popular Stocks - Secondary */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="mb-16 lg:mb-20"
        >
          <div className="mb-6">
            <h2 className="text-lg font-medium text-white/90">Popular Stocks</h2>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {popularStocks.map((stock, index) => (
              <motion.button
                key={stock.symbol}
                onClick={() => handleStockClick(stock.symbol)}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className={cn(
                  'group relative p-4 rounded-xl text-left',
                  'bg-white/[0.02] border border-white/[0.04]',
                  'hover:bg-white/[0.05] hover:border-white/[0.1]',
                  'hover:shadow-[0_4px_20px_rgba(255,255,255,0.03)]',
                  'transition-all duration-200 backdrop-blur-sm'
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-lg font-semibold text-white tracking-tight">
                    {stock.symbol}
                  </span>
                  <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white/50 group-hover:translate-x-0.5 transition-all" />
                </div>
                <span className="text-sm text-white/45 font-light">
                  {stock.name}
                </span>
              </motion.button>
            ))}
          </div>
        </motion.section>

        {/* Analysis Tools - Tertiary */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-6">
            <h2 className="text-lg font-medium text-white/90">Tools</h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Compare Tool */}
            <button
              onClick={() => router.push('/dashboard/stock-analysis/compare')}
              className={cn(
                'group relative p-5 rounded-xl text-left',
                'bg-white/[0.02] border border-white/[0.04]',
                'hover:bg-white/[0.04] hover:border-white/[0.08]',
                'transition-all duration-200'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-[#00C9E4]/[0.08] border border-[#00C9E4]/[0.12]">
                  <GitCompareArrows className="w-5 h-5 text-[#00C9E4]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base font-medium text-white">Compare Stocks</span>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-sm text-white/45 font-light leading-relaxed">
                    Side-by-side comparison of up to 5 stocks
                  </p>
                </div>
              </div>
            </button>

            {/* Screener Tool */}
            <button
              onClick={() => router.push('/dashboard/stock-analysis/screener')}
              className={cn(
                'group relative p-5 rounded-xl text-left',
                'bg-white/[0.02] border border-white/[0.04]',
                'hover:bg-white/[0.04] hover:border-white/[0.08]',
                'transition-all duration-200'
              )}
            >
              <div className="flex items-start gap-4">
                <div className="p-2.5 rounded-xl bg-[#10B981]/[0.08] border border-[#10B981]/[0.12]">
                  <SlidersHorizontal className="w-5 h-5 text-[#10B981]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-base font-medium text-white">Stock Screener</span>
                    <ArrowRight className="w-4 h-4 text-white/20 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-sm text-white/45 font-light leading-relaxed">
                    Filter by metrics, sectors, and quality scores
                  </p>
                </div>
              </div>
            </button>
          </div>
        </motion.section>

      </div>

      {/* Full Data Button for Mobile */}
      <FullDataButton />
    </div>
  )
}
