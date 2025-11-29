/**
 * News Context Updater
 * 
 * Client component that fetches news data and updates AI context.
 * Use this on News page to give AI access to news data.
 */

'use client'

import { useEffect, useCallback } from 'react'
import { useChatStore, type NewsContextItem } from '@/lib/stores/chat-store'

interface NewsContextUpdaterProps {
  /** News items to provide to AI context */
  news: Array<{
    id: string
    headline: string
    summary: string
    category: string
    sentiment: 'bullish' | 'bearish' | 'neutral'
    source: string
    timeAgo: string
    symbol?: string | null
  }>
}

export function NewsContextUpdater({ news }: NewsContextUpdaterProps) {
  const setContext = useChatStore((s) => s.setContext)

  const updateContext = useCallback(() => {
    if (!news || news.length === 0) {
      console.log('⚠️ NewsContextUpdater: No news data available yet')
      // Still set the context type to 'news' even if no data yet
      setContext({
        type: 'news',
        newsContext: {
          recentNews: [],
          newsCount: 0,
          sentimentBreakdown: { bullish: 0, bearish: 0, neutral: 0 },
        },
        pageContext: {
          currentPage: 'Market News',
        },
      })
      return
    }

    // Transform news items for AI context (limit to most recent 15 for better context)
    const recentNews: NewsContextItem[] = news.slice(0, 15).map((item) => ({
      headline: item.headline,
      summary: item.summary,
      category: item.category,
      sentiment: item.sentiment,
      source: item.source,
      timeAgo: item.timeAgo,
      symbol: item.symbol || undefined,
    }))

    // Calculate sentiment breakdown
    const sentimentBreakdown = {
      bullish: news.filter((n) => n.sentiment === 'bullish').length,
      bearish: news.filter((n) => n.sentiment === 'bearish').length,
      neutral: news.filter((n) => n.sentiment === 'neutral').length,
    }

    console.log('✅ NewsContextUpdater: News context updated for AI:', {
      newsCount: recentNews.length,
      totalNews: news.length,
      sentimentBreakdown,
      sampleHeadline: recentNews[0]?.headline,
      categories: [...new Set(recentNews.map(n => n.category))]
    })

    // Update the chat context
    setContext({
      type: 'news',
      newsContext: {
        recentNews,
        newsCount: news.length,
        sentimentBreakdown,
      },
      pageContext: {
        currentPage: 'Market News',
      },
    })
  }, [news, setContext])

  useEffect(() => {
    updateContext()

    // Cleanup: Reset context when leaving the page
    return () => {
      console.log('🔄 NewsContextUpdater: Cleaning up news context')
      setContext({
        type: 'general',
        newsContext: undefined,
        pageContext: undefined,
      })
    }
  }, [updateContext, setContext])

  // This component doesn't render anything
  return null
}

export default NewsContextUpdater
