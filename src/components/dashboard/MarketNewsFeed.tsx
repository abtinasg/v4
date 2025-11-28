'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Newspaper, ExternalLink, Clock, TrendingUp, AlertCircle, RefreshCw, Loader2 } from 'lucide-react'
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
  const [isLoading, setIsLoading] = useState(true)

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
    try {
      const response = await fetch('/api/market/news?limit=5')
      if (!response.ok) throw new Error('Failed to fetch')
      const result = await response.json()

      if (result.success && result.news && result.news.length > 0) {
        const mapped: NewsItem[] = result.news.map((item: any) => ({
          id: item.id || String(Math.random()),
          headline: item.headline,
          summary: item.summary || 'No summary available',
          timeAgo: item.timeAgo || 'Recently',
          source: item.source || 'Financial News',
          sentiment: item.sentiment || 'neutral',
          category: item.category || 'Market',
          url: item.url || '#',
        }))
        setNews(mapped)
      }
    } catch (error) {
      console.error('Error fetching news:', error)
      // Keep default news on error
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
    const interval = setInterval(fetchNews, 120000) // Refresh every 2 minutes
    return () => clearInterval(interval)
  }, [])

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
            onClick={fetchNews}
            disabled={isLoading}
            className={cn(
              'p-1.5 rounded-lg bg-white/[0.03] border border-white/[0.06]',
              'hover:bg-white/[0.06] hover:border-amber-500/30',
              'text-gray-400 hover:text-amber-400 transition-all duration-300',
              'disabled:opacity-50'
            )}
          >
            {isLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <RefreshCw className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* News Items */}
        <div className="space-y-3">
          {news.map((item, index) => {
            const SentimentIcon = getSentimentIcon(item.sentiment)
            
            return (
              <motion.article
                key={item.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.15 + index * 0.08 }}
                onClick={() => item.url && window.open(item.url, '_blank')}
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
                    <span className="text-[10px] text-gray-600">{item.source}</span>
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
          })}
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
