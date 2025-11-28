'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Newspaper, 
  Search, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  ExternalLink,
  RefreshCw,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/cinematic'
import { NewsContextUpdater } from '@/components/ai'

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
      const response = await fetch(`/api/market/news?limit=20&page=${pageNum}`)
      if (!response.ok) throw new Error('Failed to fetch')
      const result = await response.json()

      if (result.success && result.news) {
        setNews(result.news)
        setTotalPages(Math.ceil((result.total || result.news.length) / 20))
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
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      {/* Update AI context with news data */}
      <NewsContextUpdater news={news} />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
                <Newspaper className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Market News</h1>
                <p className="text-sm text-gray-400">Real-time financial news and updates</p>
              </div>
            </div>
            <button
              onClick={() => fetchNews(page)}
              disabled={isLoading}
              className={cn(
                'p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]',
                'hover:bg-white/[0.06] hover:border-amber-500/30',
                'text-gray-400 hover:text-amber-400 transition-all duration-300',
                'disabled:opacity-50'
              )}
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <RefreshCw className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Search and Filters */}
          <GlassCard className="p-4">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search news by headline, symbol, or keyword..."
                  className={cn(
                    'w-full pl-10 pr-4 py-2.5 rounded-lg',
                    'bg-white/[0.03] border border-white/[0.06]',
                    'text-white placeholder:text-gray-500',
                    'focus:outline-none focus:border-cyan-500/30 focus:bg-white/[0.05]',
                    'transition-all duration-300'
                  )}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Filter className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs font-medium text-gray-400">Category</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategoryFilter(cat)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                        categoryFilter === cat
                          ? 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
                          : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:bg-white/[0.06] hover:text-white'
                      )}
                    >
                      {cat === 'all' ? 'All Categories' : cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sentiment Filter */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-3.5 h-3.5 text-gray-500" />
                  <span className="text-xs font-medium text-gray-400">Sentiment</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {sentiments.map((sent) => (
                    <button
                      key={sent}
                      onClick={() => setSentimentFilter(sent)}
                      className={cn(
                        'px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize',
                        sentimentFilter === sent
                          ? sent === 'bullish' 
                            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                            : sent === 'bearish'
                            ? 'bg-red-500/20 border-red-500/30 text-red-400'
                            : 'bg-gray-500/20 border-gray-500/30 text-gray-400'
                          : 'bg-white/[0.03] border-white/[0.06] text-gray-400 hover:bg-white/[0.06] hover:text-white'
                      )}
                    >
                      {sent === 'all' ? 'All Sentiments' : sent}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Results count */}
          <div className="mt-3 text-sm text-gray-500">
            Showing {filteredNews.length} {filteredNews.length === 1 ? 'article' : 'articles'}
            {(categoryFilter !== 'all' || sentimentFilter !== 'all' || searchQuery) && (
              <button
                onClick={() => {
                  setCategoryFilter('all')
                  setSentimentFilter('all')
                  setSearchQuery('')
                }}
                className="ml-2 text-cyan-400 hover:text-cyan-300"
              >
                Clear filters
              </button>
            )}
          </div>
        </motion.div>

        {/* News Grid */}
        {isLoading && news.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
        ) : filteredNews.length === 0 ? (
          <GlassCard className="p-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No news found</h3>
            <p className="text-sm text-gray-500">Try adjusting your filters or search query</p>
          </GlassCard>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredNews.map((item, index) => {
                  const SentimentIcon = getSentimentIcon(item.sentiment)
                  
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2, delay: index * 0.02 }}
                      layout
                    >
                      <GlassCard 
                        className="p-4 h-full cursor-pointer hover:border-cyan-500/30 transition-all group"
                        onClick={() => setSelectedNews(item)}
                      >
                        {/* Image if available */}
                        {item.image && (
                          <div className="relative w-full h-40 mb-3 rounded-lg overflow-hidden bg-white/[0.02]">
                            <img 
                              src={item.image} 
                              alt={item.headline}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          </div>
                        )}

                        {/* Header */}
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider border',
                              getSentimentColor(item.sentiment)
                            )}>
                              <SentimentIcon className="w-2.5 h-2.5" />
                              {item.category}
                            </span>
                            {item.symbol && (
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                {item.symbol}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Headline */}
                        <h3 className="text-sm font-semibold text-white group-hover:text-cyan-400 transition-colors leading-snug mb-2 line-clamp-2">
                          {item.headline}
                        </h3>

                        {/* Summary */}
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 mb-3">
                          {item.summary}
                        </p>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-white/[0.06]">
                          <div className="flex items-center gap-2 text-[10px] text-gray-600">
                            <span>{item.source}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5" />
                              {item.timeAgo}
                            </span>
                          </div>
                          <ExternalLink className="w-3 h-3 text-gray-600 group-hover:text-cyan-400 transition-colors" />
                        </div>
                      </GlassCard>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => fetchNews(Math.max(0, page - 1))}
                  disabled={page === 0 || isLoading}
                  className={cn(
                    'p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]',
                    'hover:bg-white/[0.06] hover:border-cyan-500/30',
                    'text-gray-400 hover:text-cyan-400 transition-all',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  <ChevronLeft className="w-5 h-5" />
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
                          'w-8 h-8 rounded-lg text-sm font-medium transition-all',
                          page === pageNum
                            ? 'bg-cyan-500/20 border border-cyan-500/30 text-cyan-400'
                            : 'bg-white/[0.03] border border-white/[0.06] text-gray-400 hover:bg-white/[0.06] hover:text-white'
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
                    'p-2 rounded-lg bg-white/[0.03] border border-white/[0.06]',
                    'hover:bg-white/[0.06] hover:border-cyan-500/30',
                    'text-gray-400 hover:text-cyan-400 transition-all',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  <ChevronRight className="w-5 h-5" />
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
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedNews(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            >
              <GlassCard className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-semibold uppercase tracking-wider border',
                      getSentimentColor(selectedNews.sentiment)
                    )}>
                      {React.createElement(getSentimentIcon(selectedNews.sentiment), { className: 'w-3 h-3' })}
                      {selectedNews.category}
                    </span>
                    {selectedNews.symbol && (
                      <span className="px-2 py-1 rounded text-[10px] font-mono font-bold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                        {selectedNews.symbol}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedNews(null)}
                    className="p-1.5 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] text-gray-400 hover:text-white transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {selectedNews.image && (
                  <div className="relative w-full h-64 mb-4 rounded-lg overflow-hidden bg-white/[0.02]">
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

                <h2 className="text-2xl font-bold text-white mb-3 leading-tight">
                  {selectedNews.headline}
                </h2>

                <div className="flex items-center gap-3 text-sm text-gray-500 mb-4 pb-4 border-b border-white/[0.06]">
                  <span className="font-medium">{selectedNews.source}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {selectedNews.timeAgo}
                  </span>
                </div>

                <div className="prose prose-invert max-w-none">
                  <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedNews.fullText || selectedNews.summary}
                  </p>
                </div>

                {selectedNews.url && selectedNews.url !== '#' && (
                  <a
                    href={selectedNews.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'mt-6 w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg',
                      'bg-cyan-500/10 border border-cyan-500/20 text-cyan-400',
                      'hover:bg-cyan-500/20 hover:border-cyan-500/30',
                      'font-medium text-sm transition-all group'
                    )}
                  >
                    Read Full Article
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </a>
                )}
              </GlassCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
