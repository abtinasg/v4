'use client'

import { useState, useEffect } from 'react'
import { Newspaper, ExternalLink, Clock, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react'
import { TerminalPanel } from './TerminalPanel'
import { cn } from '@/lib/utils'

interface NewsItem {
  id: string
  headline: string
  source: string
  time: string
  timestamp: Date
  sentiment?: 'positive' | 'negative' | 'neutral'
  category: 'market' | 'economy' | 'earnings' | 'fed' | 'breaking'
  symbols?: string[]
}

const defaultNews: NewsItem[] = [
  {
    id: '1',
    headline: 'Fed Officials Signal Cautious Approach to Further Rate Cuts',
    source: 'Reuters',
    time: '2m ago',
    timestamp: new Date(Date.now() - 2 * 60 * 1000),
    sentiment: 'neutral',
    category: 'fed',
    symbols: ['SPY', 'TLT']
  },
  {
    id: '2',
    headline: 'NVIDIA Surges on Strong Data Center Revenue, AI Demand',
    source: 'Bloomberg',
    time: '8m ago',
    timestamp: new Date(Date.now() - 8 * 60 * 1000),
    sentiment: 'positive',
    category: 'earnings',
    symbols: ['NVDA', 'AMD']
  },
  {
    id: '3',
    headline: 'Oil Prices Fall on Demand Concerns; WTI Below $69',
    source: 'CNBC',
    time: '15m ago',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    sentiment: 'negative',
    category: 'market',
    symbols: ['USO', 'XLE']
  },
  {
    id: '4',
    headline: 'US Jobless Claims Rise Slightly, Labor Market Remains Solid',
    source: 'WSJ',
    time: '22m ago',
    timestamp: new Date(Date.now() - 22 * 60 * 1000),
    sentiment: 'neutral',
    category: 'economy'
  },
  {
    id: '5',
    headline: 'Apple Announces Record Services Revenue in Q4',
    source: 'MarketWatch',
    time: '34m ago',
    timestamp: new Date(Date.now() - 34 * 60 * 1000),
    sentiment: 'positive',
    category: 'earnings',
    symbols: ['AAPL']
  },
  {
    id: '6',
    headline: 'Treasury Yields Edge Lower After Bond Auction',
    source: 'FT',
    time: '45m ago',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    sentiment: 'positive',
    category: 'market',
    symbols: ['TLT', 'IEF']
  },
  {
    id: '7',
    headline: 'China Manufacturing PMI Beats Expectations',
    source: 'Reuters',
    time: '52m ago',
    timestamp: new Date(Date.now() - 52 * 60 * 1000),
    sentiment: 'positive',
    category: 'economy',
    symbols: ['FXI', 'EEM']
  },
  {
    id: '8',
    headline: 'Bitcoin Holds Above $95,000 Amid ETF Inflows',
    source: 'CoinDesk',
    time: '1h ago',
    timestamp: new Date(Date.now() - 60 * 60 * 1000),
    sentiment: 'positive',
    category: 'market',
    symbols: ['BTC-USD', 'IBIT']
  },
]

interface NewsPanelProps {
  className?: string
}

export function NewsPanel({ className }: NewsPanelProps) {
  const [news, setNews] = useState<NewsItem[]>(defaultNews)
  const [isLoading, setIsLoading] = useState(false)
  const [activeCategory, setActiveCategory] = useState<'all' | NewsItem['category']>('all')

  const fetchData = async () => {
    setIsLoading(true)
    // In production, fetch real news
    setTimeout(() => setIsLoading(false), 500)
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 60000)
    return () => clearInterval(interval)
  }, [])

  const filteredNews = activeCategory === 'all'
    ? news
    : news.filter(n => n.category === activeCategory)

  const categoryColors: Record<NewsItem['category'], string> = {
    breaking: 'text-red-400 bg-red-500/10',
    fed: 'text-violet-400 bg-violet-500/10',
    earnings: 'text-cyan-400 bg-cyan-500/10',
    economy: 'text-amber-400 bg-amber-500/10',
    market: 'text-gray-400 bg-gray-500/10',
  }

  const sentimentIcons = {
    positive: <TrendingUp className="w-3 h-3 text-emerald-400" />,
    negative: <TrendingDown className="w-3 h-3 text-red-400" />,
    neutral: <div className="w-3 h-3 flex items-center justify-center"><span className="w-1.5 h-0.5 bg-gray-500 rounded-full" /></div>,
  }

  return (
    <TerminalPanel
      title="Market News"
      icon={<Newspaper className="w-3 h-3" />}
      badge="NEWS"
      badgeColor="violet"
      isLoading={isLoading}
      onRefresh={fetchData}
      className={className}
      noPadding
      headerRight={
        <div className="flex items-center gap-1 mr-2">
          {(['all', 'breaking', 'fed', 'earnings', 'economy', 'market'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-1.5 py-0.5 text-[9px] font-bold uppercase rounded transition-colors',
                activeCategory === cat
                  ? 'bg-violet-500/20 text-violet-400'
                  : 'text-gray-500 hover:text-gray-300'
              )}
            >
              {cat === 'all' ? 'All' : cat.substring(0, 3)}
            </button>
          ))}
        </div>
      }
    >
      <div className="divide-y divide-white/[0.04]">
        {filteredNews.map((item) => (
          <div
            key={item.id}
            className="px-3 py-2.5 hover:bg-white/[0.02] transition-colors cursor-pointer group"
          >
            <div className="flex items-start gap-2">
              {item.sentiment && sentimentIcons[item.sentiment]}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-white leading-relaxed group-hover:text-cyan-300 transition-colors line-clamp-2">
                  {item.headline}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className={cn(
                    'text-[9px] font-bold uppercase px-1 py-0.5 rounded',
                    categoryColors[item.category]
                  )}>
                    {item.category}
                  </span>
                  <span className="text-[10px] text-gray-500">{item.source}</span>
                  <span className="text-[10px] text-gray-600 flex items-center gap-0.5">
                    <Clock className="w-2.5 h-2.5" />
                    {item.time}
                  </span>
                  {item.symbols && item.symbols.length > 0 && (
                    <div className="flex items-center gap-1">
                      {item.symbols.slice(0, 2).map(sym => (
                        <span key={sym} className="text-[9px] font-mono text-cyan-400/70 bg-cyan-500/10 px-1 rounded">
                          {sym}
                        </span>
                      ))}
                      {item.symbols.length > 2 && (
                        <span className="text-[9px] text-gray-500">+{item.symbols.length - 2}</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
            </div>
          </div>
        ))}
      </div>
      
      {/* Footer */}
      <div className="px-3 py-2 border-t border-white/[0.04] bg-black/20">
        <div className="flex items-center justify-between text-[10px] text-gray-500">
          <span>Showing {filteredNews.length} headlines</span>
          <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
            View All News →
          </button>
        </div>
      </div>
    </TerminalPanel>
  )
}
