'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Newspaper, 
  Search, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ExternalLink,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Minus,
  Filter
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/cinematic'
import { NewsContextUpdater } from '@/components/ai'
import { AIMarketReport } from '@/components/dashboard/AIMarketReport'

interface NewsItem {
  id: string
  headline: string
  summary: string
  fullText?: string
  timeAgo: string
  publishedDate: string
  source: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  category: string
  url: string
  symbol?: string | null
  image?: string | null
}

type CategoryFilter = 'all' | 'Macro' | 'Earnings' | 'Stock' | 'Market' | 'Global'
type SentimentFilter = 'all' | 'bullish' | 'bearish' | 'neutral'

// Calculate reading time based on word count (assuming 200 words per minute)
const calculateReadingTime = (text: string): string => {
  const wordsPerMinute = 200
  const wordCount = text.trim().split(/\s+/).length
  const minutes = Math.ceil(wordCount / wordsPerMinute)
  return minutes === 1 ? '1 min' : `${minutes} min`
}

export default function NewsPage() {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [sentimentFilter, setSentimentFilter] = useState<SentimentFilter>('all')
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null)
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  const fetchNews = async (pageNum: number = 0) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/market/news?limit=50&page=${pageNum}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const result = await response.json()

      if (result.success && result.news) {
        setNews(result.news)
        setTotalPages(Math.ceil((result.total || result.news.length) / 50))
        setPage(pageNum)
      }
    } catch (error) {
      console.error('Error fetching news:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNews(0)
    const interval = setInterval(() => fetchNews(page), 120000) // Refresh every 2 minutes
    return () => clearInterval(interval)
  }, [])

  const filteredNews = useMemo(() => {
    return news.filter(item => {
      const matchesSearch = searchQuery === '' || 
        item.headline.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.symbol && item.symbol.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter
      const matchesSentiment = sentimentFilter === 'all' || item.sentiment === sentimentFilter

      return matchesSearch && matchesCategory && matchesSentiment
    })
  }, [news, searchQuery, categoryFilter, sentimentFilter])

  const sentimentStats = useMemo(() => {
    const base: Record<NewsItem['sentiment'], number> = {
      bullish: 0,
      bearish: 0,
      neutral: 0,
    }
    const categoryCounts: Record<string, number> = {}

    filteredNews.forEach(item => {
      base[item.sentiment] = (base[item.sentiment] || 0) + 1
      if (item.category) {
        categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1
      }
    })

    const topCategoryEntry = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]

    return {
      total: filteredNews.length,
      sentiments: base,
      topCategory: topCategoryEntry ? topCategoryEntry[0] : null,
    }
  }, [filteredNews])

  const featuredNews = filteredNews[0] || null
  const remainingNews = featuredNews ? filteredNews.slice(1) : filteredNews

  const getSentimentColor = (sentiment: NewsItem['sentiment']) => {
    switch (sentiment) {
      case 'bullish': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
      case 'bearish': return 'text-red-400 bg-red-500/10 border-red-500/20'
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20'
    }
  }

  const getSentimentIcon = (sentiment: NewsItem['sentiment']) => {
    switch (sentiment) {
      case 'bullish': return TrendingUp
      case 'bearish': return TrendingDown
      default: return Clock
    }
  }

  const categories: CategoryFilter[] = ['all', 'Macro', 'Earnings', 'Stock', 'Market', 'Global']
  const sentiments: SentimentFilter[] = ['all', 'bullish', 'bearish', 'neutral']

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 xl:p-12">
      {/* Update AI context with news data */}
      <NewsContextUpdater news={news} />
      
      <div className="max-w-[1600px] mx-auto">
        {/* AI Market Intelligence Report */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8 lg:mb-12"
        >
          <AIMarketReport />
        </motion.div>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 sm:mb-8 lg:mb-12"
        >
          <div className="flex items-center justify-between mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-3 sm:p-4 rounded-2xl bg-white/[0.02] border border-white/[0.04]">
                <Newspaper className="w-5 h-5 sm:w-7 sm:h-7 text-white/60" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white tracking-tight">Market Intelligence</h1>
                <p className="text-xs sm:text-sm text-white/40 mt-1 font-light">Real-time financial news and market updates</p>
              </div>
            </div>
            <button
              onClick={() => fetchNews(page)}
              disabled={isLoading}
              className={cn(
                'p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]',
                'hover:bg-white/[0.04] hover:border-white/[0.08]',
                'text-white/50 hover:text-white/80 transition-all duration-300',
                'disabled:opacity-40'
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Sentiment Overview - Primary Information */}
          {filteredNews.length > 0 && (
            <div className="mb-6 sm:mb-8 lg:mb-12 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-3">
              {(['bullish', 'neutral', 'bearish'] as NewsItem['sentiment'][]).map(sent => {
                const percentage = sentimentStats.total
                  ? Math.round((sentimentStats.sentiments[sent] / sentimentStats.total) * 100)
                  : 0
                const isPositive = sent === 'bullish'

                return (
                  <GlassCard key={sent} className="p-4 sm:p-6 border border-white/[0.04] bg-white/[0.015] backdrop-blur-xl">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs uppercase tracking-wider text-white/30 font-light">
                        {sent}
                      </span>
                      <span className={cn(
                        'text-xs font-medium px-2.5 py-1 rounded-lg border',
                        sent === 'bullish'
                          ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5'
                          : sent === 'bearish'
                          ? 'text-red-400 border-red-500/20 bg-red-500/5'
                          : 'text-white/60 border-white/10 bg-white/5'
                      )}>
                        {sentimentStats.sentiments[sent]}
                      </span>
                    </div>
                    <div className="flex items-end justify-between mb-3 sm:mb-4">
                      <p className="text-3xl sm:text-4xl font-light text-white tracking-tight">{percentage}%</p>
                      {sentimentStats.topCategory && isPositive && (
                        <p className="text-[10px] text-white/30 text-right font-light hidden sm:block">
                          Leading theme
                          <span className="block text-sm text-white/80 font-normal mt-0.5">
                            {sentimentStats.topCategory}
                          </span>
                        </p>
                      )}
                    </div>
                    <div className="h-1 rounded-full bg-white/[0.03] overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-700 ease-out',
                          sent === 'bullish'
                            ? 'bg-gradient-to-r from-emerald-500/80 to-emerald-400'
                            : sent === 'bearish'
                            ? 'bg-gradient-to-r from-red-500/80 to-red-400'
                            : 'bg-gradient-to-r from-white/40 to-white/20'
                        )}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </GlassCard>
                )
              })}
            </div>
          )}

          {/* Filters - Secondary Information */}
          <div className="mb-8 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by headline, symbol, or keyword..."
                className={cn(
                  'w-full pl-11 pr-12 py-4 rounded-2xl',
                  'bg-white/[0.02] border border-white/[0.04]',
                  'text-white placeholder:text-white/30 text-sm font-light',
                  'focus:outline-none focus:border-white/[0.08] focus:bg-white/[0.03]',
                  'transition-all duration-300'
                )}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-6">
              {/* Category Filter */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-light text-white/40 tracking-wide">Category</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-xs font-light border transition-all duration-300',
                        categoryFilter === cat
                          ? 'bg-white/[0.08] border-white/[0.12] text-white shadow-lg shadow-white/5'
                          : 'bg-white/[0.02] border-white/[0.04] text-white/50 hover:bg-white/[0.04] hover:border-white/[0.06] hover:text-white/70'
                      )}
                    >
                      {cat === 'all' ? 'All' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sentiment Filter */}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xs font-light text-white/40 tracking-wide">Sentiment</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sentiments.map((sent) => (
                    <button
                      key={sent}
                      onClick={() => setSentimentFilter(sent)}
                      className={cn(
                        'px-4 py-2 rounded-xl text-xs font-light border transition-all duration-300 capitalize',
                        sentimentFilter === sent
                          ? sent === 'bullish' 
                            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 shadow-lg shadow-emerald-500/10'
                            : sent === 'bearish'
                            ? 'bg-red-500/10 border-red-500/20 text-red-400 shadow-lg shadow-red-500/10'
                            : 'bg-white/[0.08] border-white/[0.12] text-white shadow-lg shadow-white/5'
                          : 'bg-white/[0.02] border-white/[0.04] text-white/50 hover:bg-white/[0.04] hover:border-white/[0.06] hover:text-white/70'
                      )}
                    >
                      {sent === 'all' ? 'All' : sent}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-white/40 font-light">
              {filteredNews.length} {filteredNews.length === 1 ? 'article' : 'articles'}
            </p>
            {(categoryFilter !== 'all' || sentimentFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setCategoryFilter('all')
                  setSentimentFilter('all')
                  setSearchQuery('')
                }}
                className="text-xs text-white/50 hover:text-white/80 font-light transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </motion.div>

        {/* News Grid */}
        {isLoading && news.length === 0 ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
          </div>
        ) : filteredNews.length === 0 ? (
          <GlassCard className="p-16 text-center border border-white/[0.04] bg-white/[0.015]">
            <AlertCircle className="w-12 h-12 text-white/20 mx-auto mb-6" />
            <h3 className="text-xl font-light text-white mb-3">No articles found</h3>
            <p className="text-sm text-white/40 font-light">Try adjusting your filters or search query</p>
          </GlassCard>
        ) : (
          <>
            {featuredNews && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="mb-12"
              >
                <GlassCard className="p-8 lg:p-12 border border-white/[0.04] bg-white/[0.015] backdrop-blur-xl shadow-2xl shadow-black/20">
                  <div className="grid gap-12 lg:grid-cols-2">
                    <div className="space-y-8">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-light uppercase tracking-widest border',
                          featuredNews.sentiment === 'bullish'
                            ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20'
                            : featuredNews.sentiment === 'bearish'
                            ? 'text-red-400 bg-red-500/5 border-red-500/20'
                            : 'text-white/60 bg-white/5 border-white/10'
                        )}>
                          {React.createElement(getSentimentIcon(featuredNews.sentiment), { className: 'w-3 h-3' })}
                          {featuredNews.category}
                        </span>
                        {featuredNews.symbol && (
                          <span className="px-3 py-1.5 rounded-xl text-[10px] font-mono font-medium bg-white/[0.04] text-white/80 border border-white/[0.08]">
                            {featuredNews.symbol}
                          </span>
                        )}
                      </div>

                      <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-light text-white leading-[1.2] tracking-tight">
                        {featuredNews.headline}
                      </h2>

                      <p className="text-sm sm:text-base text-white/50 leading-[1.6] font-light line-clamp-3 sm:line-clamp-4">
                        {featuredNews.summary}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-white/30 font-light">
                        <span className="text-white/60">{featuredNews.source}</span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" />
                          {featuredNews.timeAgo}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-white/20" />
                        <span className="text-white/50">
                          {calculateReadingTime(featuredNews.fullText || featuredNews.summary)}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-3 pt-4">
                        <button
                          onClick={() => setSelectedNews(featuredNews)}
                          className="px-6 py-3 rounded-xl bg-white/[0.06] text-white text-sm font-light hover:bg-white/[0.09] border border-white/[0.08] hover:border-white/[0.12] transition-all duration-300"
                        >
                          Quick View
                        </button>
                        {featuredNews.url && featuredNews.url !== '#' && (
                          <a
                            href={featuredNews.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-6 py-3 rounded-xl border border-white/[0.08] text-white/80 text-sm font-light hover:bg-white/[0.04] hover:border-white/[0.12] transition-all duration-300 inline-flex items-center gap-2"
                          >
                            Read Article
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    </div>

                    <div className="lg:col-span-1">
                      <div className="relative h-48 sm:h-60 lg:h-full min-h-[200px] lg:min-h-[400px] rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.04]">
                        {featuredNews.image ? (
                          <img
                            src={featuredNews.image}
                            alt={featuredNews.headline}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none'
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-white/20 text-sm font-light">No image available</div>
                        )}
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {remainingNews.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {remainingNews.map((item, index) => {
                    const SentimentIcon = getSentimentIcon(item.sentiment)

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{ duration: 0.3, delay: index * 0.03 }}
                        layout
                      >
                        <GlassCard 
                          className="p-6 h-full cursor-pointer hover:border-white/[0.08] transition-all duration-300 group border border-white/[0.04] bg-white/[0.015] backdrop-blur-xl"
                          onClick={() => setSelectedNews(item)}
                        >
                        {/* Image if available */}
                        {item.image && (
                          <div className="relative w-full h-48 mb-6 rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.04]">
                            <img 
                              src={item.image} 
                              alt={item.headline}
                              className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          </div>
                        )}

                        {/* Header */}
                        <div className="flex items-center gap-2 mb-4 flex-wrap">
                          <span className={cn(
                            'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[9px] font-light uppercase tracking-widest border',
                            item.sentiment === 'bullish'
                              ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20'
                              : item.sentiment === 'bearish'
                              ? 'text-red-400 bg-red-500/5 border-red-500/20'
                              : 'text-white/60 bg-white/5 border-white/10'
                          )}>
                            <SentimentIcon className="w-2.5 h-2.5" />
                            {item.category}
                          </span>
                          {item.symbol && (
                            <span className="px-2.5 py-1 rounded-lg text-[9px] font-mono font-medium bg-white/[0.04] text-white/70 border border-white/[0.08]">
                              {item.symbol}
                            </span>
                          )}
                        </div>

                        {/* Headline */}
                        <h3 className="text-base font-light text-white group-hover:text-white/90 transition-colors leading-[1.4] mb-3 line-clamp-3">
                          {item.headline}
                        </h3>

                        {/* Summary */}
                        <p className="text-sm text-white/40 leading-[1.6] font-light line-clamp-2 mb-6">
                          {item.summary}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t border-white/[0.04]">
                          <div className="flex flex-col gap-1.5 text-[10px] text-white/30 font-light">
                            <span className="text-white/50">{item.source}</span>
                            <div className="flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                {item.timeAgo}
                              </span>
                              <span className="w-1 h-1 rounded-full bg-white/20" />
                              <span className="text-white/40">
                                {calculateReadingTime(item.fullText || item.summary)}
                              </span>
                            </div>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-white/30 group-hover:text-white/60 transition-colors" />
                        </div>
                        </GlassCard>
                      </motion.div>
                    )
                  })}
              </AnimatePresence>
            </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-12">
                <button
                  onClick={() => fetchNews(Math.max(0, page - 1))}
                  disabled={page === 0 || isLoading}
                  className={cn(
                    'p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]',
                    'hover:bg-white/[0.04] hover:border-white/[0.08]',
                    'text-white/40 hover:text-white/70 transition-all duration-300',
                    'disabled:opacity-30 disabled:cursor-not-allowed'
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum = Math.max(0, Math.min(page - 2 + i, totalPages - 1))
                    return (
                      <button
                        key={pageNum}
                        onClick={() => fetchNews(pageNum)}
                        disabled={isLoading}
                        className={cn(
                          'w-10 h-10 rounded-xl text-sm font-light transition-all duration-300',
                          page === pageNum
                            ? 'bg-white/[0.08] border border-white/[0.12] text-white shadow-lg shadow-white/5'
                            : 'bg-white/[0.02] border border-white/[0.04] text-white/50 hover:bg-white/[0.04] hover:text-white/70'
                        )}
                      >
                        {pageNum + 1}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => fetchNews(Math.min(totalPages - 1, page + 1))}
                  disabled={page >= totalPages - 1 || isLoading}
                  className={cn(
                    'p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]',
                    'hover:bg-white/[0.04] hover:border-white/[0.08]',
                    'text-white/40 hover:text-white/70 transition-all duration-300',
                    'disabled:opacity-30 disabled:cursor-not-allowed'
                  )}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* News Detail Modal */}
      <AnimatePresence>
        {selectedNews && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl"
            onClick={() => setSelectedNews(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
            >
              <GlassCard className="p-8 lg:p-12 border border-white/[0.06] bg-white/[0.02] backdrop-blur-2xl">
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-light uppercase tracking-widest border',
                      selectedNews.sentiment === 'bullish'
                        ? 'text-emerald-400 bg-emerald-500/5 border-emerald-500/20'
                        : selectedNews.sentiment === 'bearish'
                        ? 'text-red-400 bg-red-500/5 border-red-500/20'
                        : 'text-white/60 bg-white/5 border-white/10'
                    )}>
                      {React.createElement(getSentimentIcon(selectedNews.sentiment), { className: 'w-3 h-3' })}
                      {selectedNews.category}
                    </span>
                    {selectedNews.symbol && (
                      <span className="px-3 py-1.5 rounded-xl text-[10px] font-mono font-medium bg-white/[0.04] text-white/70 border border-white/[0.08]">
                        {selectedNews.symbol}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedNews(null)}
                    className="p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] text-white/40 hover:text-white/80 transition-all duration-300 border border-white/[0.06]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {selectedNews.image && (
                  <div className="relative w-full h-80 mb-8 rounded-2xl overflow-hidden bg-white/[0.02] border border-white/[0.04]">
                    <img 
                      src={selectedNews.image} 
                      alt={selectedNews.headline}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  </div>
                )}

                <h2 className="text-3xl lg:text-4xl font-light text-white mb-6 leading-[1.2] tracking-tight">
                  {selectedNews.headline}
                </h2>

                <div className="flex items-center gap-4 text-sm text-white/30 mb-8 pb-6 border-b border-white/[0.04] font-light">
                  <span className="text-white/60">{selectedNews.source}</span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedNews.timeAgo}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-white/20" />
                  <span className="text-white/50">
                    {calculateReadingTime(selectedNews.fullText || selectedNews.summary)}
                  </span>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-base text-white/60 leading-[1.7] font-light whitespace-pre-wrap">
                    {selectedNews.fullText || selectedNews.summary}
                  </p>
                </div>

                {selectedNews.url && selectedNews.url !== '#' && (
                  <a
                    href={selectedNews.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'mt-8 w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl',
                      'bg-white/[0.04] border border-white/[0.08] text-white/80',
                      'hover:bg-white/[0.06] hover:border-white/[0.12]',
                      'font-light text-sm transition-all duration-300 group'
                    )}
                  >
                    Read Full Article
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" />
                  </a>
                )}
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Data Button for Mobile */}
    </div>
  )
}
