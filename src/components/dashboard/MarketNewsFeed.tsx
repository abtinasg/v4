'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { GlassCard } from '@/components/ui/cinematic'
import { RefreshCw, ExternalLink, Clock } from 'lucide-react'

interface NewsItem {
  id: string
  headline: string
  summary: string
  url: string
  source: string
  publishedDate: string
  image?: string
  sentiment?: string
  timeAgo?: string
}

interface MarketNewsFeedProps {
  className?: string
}

export function MarketNewsFeed({ className }: MarketNewsFeedProps) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchNews = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/market/news?limit=4')
      if (!response.ok) throw new Error('Failed to fetch news')
      const result = await response.json()
      
      if (result.success && result.news) {
        setNews(result.news.slice(0, 4))
      }
    } catch (err) {
      console.error('Error fetching news:', err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchNews()
    const interval = setInterval(fetchNews, 120000)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className={cn('h-full', className)}
    >
      <GlassCard className="h-full p-6 sm:p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-medium text-white">Market News</h3>
            <p className="text-xs text-white/35 mt-0.5">Latest headlines</p>
          </div>
          <button
            onClick={fetchNews}
            disabled={isLoading}
            className={cn(
              'p-2 rounded-xl bg-white/[0.03] border border-white/[0.06]',
              'hover:bg-white/[0.06] transition-all duration-200',
              'disabled:opacity-40'
            )}
          >
            <RefreshCw className={cn('w-3.5 h-3.5 text-white/40', isLoading && 'animate-spin')} />
          </button>
        </div>

        {/* News Grid - 4 Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {news.map((item, index) => (
            <motion.a
              key={item.id || index}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className={cn(
                'group relative rounded-xl overflow-hidden',
                'bg-white/[0.02] border border-white/[0.04]',
                'hover:bg-white/[0.04] hover:border-white/[0.08]',
                'transition-all duration-300'
              )}
            >
              {/* Image */}
              {item.image && (
                <div className="relative h-32 overflow-hidden">
                  <img
                    src={item.image}
                    alt=""
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#04060A] via-[#04060A]/50 to-transparent" />
                </div>
              )}
              
              {/* Content */}
              <div className="p-4">
                <h4 className="text-sm font-medium text-white/90 line-clamp-2 mb-3 group-hover:text-white transition-colors leading-relaxed">
                  {item.headline}
                </h4>
                
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-white/40 uppercase tracking-wide truncate max-w-[60%]">
                    {item.source}
                  </span>
                  <div className="flex items-center gap-1 text-white/30">
                    <Clock className="w-3 h-3" />
                    <span className="text-[10px]">{item.timeAgo || 'Now'}</span>
                  </div>
                </div>
              </div>

              {/* Hover indicator */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="w-3.5 h-3.5 text-white/40" />
              </div>
            </motion.a>
          ))}
        </div>

        {/* Empty State */}
        {news.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <p className="text-sm text-white/40">No news available</p>
          </div>
        )}
      </GlassCard>
    </motion.div>
  )
}
