'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Newspaper, ExternalLink, Clock, TrendingUp, AlertCircle, RefreshCw, Loader2, TrendingDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/cinematic'

interface NewsItem {
  id: string
  headline: string
  summary: string
  timeAgo: string
  source: string
  sentiment: 'bullish' | 'bearish' | 'neutral'
  category: string
  url?: string
}

interface MarketIndex {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
}

const defaultNews: NewsItem[] = [
  {
    id: '1',
    headline: 'Fed Signals Potential Rate Cut in Early 2025',
    summary: 'Federal Reserve officials hint at possible interest rate reductions as inflation continues to cool toward target levels.',
    timeAgo: '32m ago',
    source: 'Bloomberg',
    sentiment: 'bullish',
    category: 'Macro',
  },
  {
    id: '2',
    headline: 'NVIDIA Reports Record Q4 Revenue',
    summary: 'AI chip demand drives quarterly revenue to $35.1 billion, exceeding analyst expectations by 12%.',
    timeAgo: '1h ago',
    source: 'Reuters',
    sentiment: 'bullish',
    category: 'Earnings',
  },
  {
    id: '3',
    headline: 'European Markets Face Headwinds Amid Economic Uncertainty',
    summary: 'DAX and FTSE indices decline as geopolitical tensions and weak manufacturing data weigh on sentiment.',
    timeAgo: '2h ago',
    source: 'FT',
    sentiment: 'bearish',
    category: 'Global',
  },
]

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
    case 'bearish': return AlertCircle
    default: return Clock
  }
}

interface MarketNewsFeedProps {
  className?: string
}

export function MarketNewsFeed({ className }: MarketNewsFeedProps) {
  const [news, setNews] = useState<NewsItem[]>(defaultNews)
  const [indices, setIndices] = useState<MarketIndex[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingIndices, setIsLoadingIndices] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')

  const formatTimeAgo = (publishedDate: string): string => {
    const now = new Date()
    const published = new Date(publishedDate)
    const diffMs = now.getTime() - published.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const detectSentiment = (title: string, text: string): 'bullish' | 'bearish' | 'neutral' => {
    const content = (title + ' ' + text).toLowerCase()
    const bullishWords = ['surge', 'rally', 'gain', 'rise', 'beat', 'record', 'growth', 'upgrade', 'bullish', 'soar', 'jump', 'profit']
    const bearishWords = ['fall', 'drop', 'decline', 'loss', 'cut', 'crash', 'bearish', 'plunge', 'tumble', 'sink', 'down', 'risk', 'concern']
    
    const bullishScore = bullishWords.filter(w => content.includes(w)).length
    const bearishScore = bearishWords.filter(w => content.includes(w)).length
    
    if (bullishScore > bearishScore) return 'bullish'
    if (bearishScore > bullishScore) return 'bearish'
    return 'neutral'
  }

  const detectCategory = (title: string, symbol?: string): string => {
    const text = title.toLowerCase()
    if (text.includes('earnings') || text.includes('revenue') || text.includes('profit')) return 'Earnings'
    if (text.includes('fed') || text.includes('rate') || text.includes('inflation') || text.includes('economy')) return 'Macro'
    if (text.includes('europe') || text.includes('china') || text.includes('global')) return 'Global'
    if (symbol) return 'Stock'
    return 'Market'
  }

  const fetchNews = async () => {
    setIsLoading(true)
    setFetchError(null)
    try {
      const response = await fetch('/api/market/news?limit=5')
      if (!response.ok) throw new Error('Failed to fetch')
      const result = await response.json()

      if (result.success && result.news && result.news.length > 0) {
        const mapped: NewsItem[] = result.news.map((item: any) => ({
          id: item.id || String(Math.random()),
          headline: item.headline,
          summary: item.summary || item.description || 'No summary available',
          timeAgo: item.timeAgo || (item.publishedAt ? formatTimeAgo(item.publishedAt) : 'Recently'),
          source: item.source || item.provider || 'Financial News',
          sentiment: item.sentiment || detectSentiment(item.headline, item.summary || ''),
          category: item.category || detectCategory(item.headline, item.symbol),
          url: item.url || '#',
        }))
        setNews(mapped)
      } else {
        setNews(defaultNews)
      }
    } catch (error) {
      console.error('Error fetching news:', error)
      setFetchError('مشکل در دریافت اخبار بازار رخ داده است. لطفاً دوباره تلاش کنید.')
      setNews(defaultNews)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchIndices = async () => {
    setIsLoadingIndices(true)
    try {
      const response = await fetch('/api/market/overview')
      if (!response.ok) throw new Error('Failed to fetch')
      const result = await response.json()
      
      if (result.indices) {
        // Filter to only show TLT, HYG, and VIX - in specific order
        const symbolOrder = ['^VIX', 'TLT', 'HYG']
        const filtered = symbolOrder
          .map(sym => result.indices.find((idx: MarketIndex) => idx.symbol === sym))
          .filter(Boolean) as MarketIndex[]
        setIndices(filtered)
      }
    } catch (error) {
      console.error('Error fetching indices:', error)
    } finally {
      setIsLoadingIndices(false)
    }
  }

  useEffect(() => {
    fetchNews()
    fetchIndices()
    const newsInterval = setInterval(fetchNews, 120000) // Refresh every 2 minutes
    const indicesInterval = setInterval(fetchIndices, 60000) // Refresh every 1 minute
    return () => {
      clearInterval(newsInterval)
      clearInterval(indicesInterval)
    }
  }, [])

  const categories = useMemo(() => {
    const unique = Array.from(new Set(news.map(item => item.category || 'Market')))
    return ['All', ...unique]
  }, [news])

  const filteredNews = useMemo(() => {
    if (selectedCategory === 'All') return news
    return news.filter(item => item.category === selectedCategory)
  }, [news, selectedCategory])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.7 }}
      className={className}
    >
      <GlassCard className="h-full p-3 sm:p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Newspaper className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-white">Market News</h3>
              <p className="text-[10px] text-gray-500">Latest updates</p>
            </div>
          </div>
          <button
            onClick={() => {
              fetchNews()
              fetchIndices()
            }}
            disabled={isLoading || isLoadingIndices}
            className={cn(
              'p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]',
              'hover:bg-white/[0.06] hover:border-amber-500/30',
              'text-gray-400 hover:text-amber-400 transition-all duration-300',
              'disabled:opacity-50'
            )}
          >
            {(isLoading || isLoadingIndices) ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Key Market Indices */}
        <div className="mb-4 pb-4 border-b border-white/[0.06]">
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {isLoadingIndices ? (
              // Loading skeletons
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="p-2.5 sm:p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]"
                >
                  <div className="h-3 w-12 bg-white/[0.05] rounded animate-pulse mb-2" />
                  <div className="h-5 w-16 bg-white/[0.05] rounded animate-pulse mb-1" />
                  <div className="h-3 w-14 bg-white/[0.05] rounded animate-pulse" />
                </div>
              ))
            ) : (
              indices.map((index, i) => {
                const isPositive = index.changePercent >= 0
                return (
                  <motion.div
                    key={index.symbol}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className={cn(
                      'p-2.5 sm:p-3 rounded-lg',
                      'bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08]',
                      'transition-all duration-300 cursor-pointer group'
                    )}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {index.name}
                      </p>
                      {isPositive ? (
                        <TrendingUp className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-400" />
                      )}
                    </div>
                    <p className="text-sm sm:text-base font-bold text-white font-mono mb-1">
                      {index.price.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </p>
                    <div className="flex items-center gap-1.5">
                      <span
                        className={cn(
                          'text-[10px] sm:text-xs font-semibold px-1.5 py-0.5 rounded border',
                          isPositive 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        )}
                      >
                        {isPositive ? '+' : ''}
                        {index.changePercent.toFixed(2)}%
                      </span>
                    </div>
                  </motion.div>
                )
              })
            )}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-3 border-b border-white/[0.04]">
          {categories.map(category => {
            const isActive = category === selectedCategory
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'text-[10px] sm:text-xs font-semibold px-2.5 py-1 rounded-full border transition-colors duration-200 whitespace-nowrap',
                  isActive
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-[0_0_8px_rgba(251,191,36,0.25)]'
                    : 'text-gray-500 border-white/[0.04] hover:text-white hover:border-amber-500/30'
                )}
              >
                {category}
              </button>
            )
          })}
        </div>

        {fetchError && (
          <div className="mb-3 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-200">
            {fetchError}
          </div>
        )}

        {/* News Items */}
        <div className="space-y-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div
                key={`skeleton-${idx}`}
                className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.03] animate-pulse space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-20 bg-white/[0.05] rounded" />
                  <div className="h-3 w-16 bg-white/[0.05] rounded" />
                </div>
                <div className="h-4 w-3/4 bg-white/[0.05] rounded" />
                <div className="h-3 w-full bg-white/[0.05] rounded" />
              </div>
            ))
          ) : filteredNews.length > 0 ? (
            filteredNews.map((item, index) => {
              const SentimentIcon = getSentimentIcon(item.sentiment)

              return (
                <motion.article
                  key={item.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.06 }}
                  onClick={() => item.url && item.url !== '#' && window.open(item.url, '_blank', 'noopener,noreferrer')}
                  className={cn(
                    'p-3 rounded-xl',
                    'bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.04] hover:border-white/[0.08]',
                    'transition-all duration-300 cursor-pointer group'
                  )}
                >
                  {/* Top row: Category + Time */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-semibold uppercase tracking-wider border',
                        getSentimentColor(item.sentiment)
                      )}>
                        <SentimentIcon className="w-2.5 h-2.5" />
                        {item.category}
                      </span>
                      <span className="text-[10px] text-gray-500">{item.source}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" />
                      {item.timeAgo}
                    </span>
                  </div>

                  {/* Headline */}
                  <h4 className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors leading-snug mb-1.5">
                    {item.headline}
                  </h4>

                  {/* Summary */}
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">
                    {item.summary}
                  </p>
                </motion.article>
              )
            })
          ) : (
            <div className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01] text-center text-sm text-gray-500">
              خبری مطابق این دسته‌بندی یافت نشد.
            </div>
          )}
        </div>

        {/* View All Link */}
        <div className="mt-4 pt-4 border-t border-white/[0.06]">
          <a 
            href="/dashboard/news"
            className="w-full flex items-center justify-center gap-2 py-2 text-xs font-medium text-gray-400 hover:text-cyan-400 transition-colors group"
          >
            View All News
            <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </div>
      </GlassCard>
    </motion.div>
  )
}
