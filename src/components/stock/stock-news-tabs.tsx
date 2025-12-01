'use client';

import { useState, useEffect } from 'react';
import { 
  Newspaper, 
  Mic, 
  FileText, 
  FileCheck, 
  ExternalLink,
  Calendar,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Building2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface StockNewsTabsProps {
  symbol: string;
  companyName?: string;
}

type TabValue = 'all' | 'news' | 'earnings' | 'press' | 'sec';

interface NewsItem {
  id: string;
  title: string;
  summary?: string;
  source: string;
  url: string;
  publishedAt: string;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  type: 'news' | 'earnings' | 'press' | 'sec';
  ticker?: string;
}

interface EarningsCall {
  id: string;
  title: string;
  date: string;
  quarter: string;
  year: number;
  transcriptUrl?: string;
  audioUrl?: string;
  type: 'upcoming' | 'past';
}

interface SECFiling {
  id: string;
  formType: string;
  filingDate: string;
  acceptedDate: string;
  description: string;
  url: string;
}

const TABS: { value: TabValue; label: string; icon: typeof Newspaper }[] = [
  { value: 'all', label: 'All', icon: FileText },
  { value: 'news', label: 'News', icon: Newspaper },
  { value: 'earnings', label: 'Earnings Calls', icon: Mic },
  { value: 'press', label: 'Press Releases', icon: FileCheck },
  { value: 'sec', label: 'SEC Filings', icon: Building2 },
];

// Sentiment badge component
function SentimentBadge({ sentiment }: { sentiment?: 'bullish' | 'bearish' | 'neutral' }) {
  if (!sentiment) return null;
  
  return (
    <span className={cn(
      'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
      sentiment === 'bullish' && 'bg-green-500/10 text-green-400 border border-green-500/20',
      sentiment === 'bearish' && 'bg-red-500/10 text-red-400 border border-red-500/20',
      sentiment === 'neutral' && 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
    )}>
      {sentiment === 'bullish' && <TrendingUp className="h-3 w-3" />}
      {sentiment === 'bearish' && <TrendingDown className="h-3 w-3" />}
      {sentiment === 'neutral' && <Minus className="h-3 w-3" />}
      {sentiment.charAt(0).toUpperCase() + sentiment.slice(1)}
    </span>
  );
}

// Format relative time
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// News Card component
function NewsCard({ item }: { item: NewsItem }) {
  return (
    <a 
      href={item.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-gray-500">{item.source}</span>
            <span className="text-gray-600">•</span>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatRelativeTime(item.publishedAt)}
            </span>
            <SentimentBadge sentiment={item.sentiment} />
          </div>
          <h3 className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
            {item.title}
          </h3>
          {item.summary && (
            <p className="text-xs text-gray-500 mt-2 line-clamp-2">{item.summary}</p>
          )}
        </div>
        <ExternalLink className="h-4 w-4 text-gray-600 group-hover:text-cyan-400 transition-colors flex-shrink-0 mt-1" />
      </div>
    </a>
  );
}

// Earnings Call Card component
function EarningsCallCard({ call }: { call: EarningsCall }) {
  const isUpcoming = call.type === 'upcoming';
  
  return (
    <div className={cn(
      'p-4 rounded-xl border transition-all duration-200',
      isUpcoming 
        ? 'bg-cyan-500/5 border-cyan-500/20' 
        : 'bg-white/[0.02] border-white/[0.05]'
    )}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={cn(
              'px-2 py-0.5 rounded-full text-xs font-medium',
              isUpcoming 
                ? 'bg-cyan-500/20 text-cyan-400' 
                : 'bg-gray-500/20 text-gray-400'
            )}>
              {isUpcoming ? 'Upcoming' : 'Past'}
            </span>
            <span className="text-xs text-gray-500">{call.quarter} {call.year}</span>
          </div>
          <h3 className="text-sm font-medium text-white">{call.title}</h3>
          <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
            <Calendar className="h-3 w-3" />
            {new Date(call.date).toLocaleDateString('en-US', { 
              weekday: 'short', 
              month: 'short', 
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {call.transcriptUrl && (
            <a 
              href={call.transcriptUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <FileText className="h-3 w-3" />
              Transcript
            </a>
          )}
          {call.audioUrl && (
            <a 
              href={call.audioUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <Mic className="h-3 w-3" />
              Audio
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

// SEC Filing Card component
function SECFilingCard({ filing }: { filing: SECFiling }) {
  const getFormColor = (formType: string) => {
    if (formType.includes('10-K') || formType.includes('10-Q')) return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    if (formType.includes('8-K')) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    if (formType.includes('DEF')) return 'text-purple-400 bg-purple-500/10 border-purple-500/20';
    if (formType.includes('4') || formType.includes('13')) return 'text-green-400 bg-green-500/10 border-green-500/20';
    return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
  };

  return (
    <a 
      href={filing.url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="block p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-200 group"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className={cn(
            'px-2 py-1 rounded-lg text-xs font-bold border',
            getFormColor(filing.formType)
          )}>
            {filing.formType}
          </span>
          <div>
            <h3 className="text-sm font-medium text-white group-hover:text-cyan-400 transition-colors">
              {filing.description}
            </h3>
            <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
              <span>Filed: {new Date(filing.filingDate).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <ExternalLink className="h-4 w-4 text-gray-600 group-hover:text-cyan-400 transition-colors flex-shrink-0" />
      </div>
    </a>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] animate-pulse">
          <div className="h-3 bg-white/10 rounded w-1/4 mb-2" />
          <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
}

// Empty state
function EmptyState({ message }: { message: string }) {
  return (
    <div className="text-center py-12">
      <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-4" />
      <p className="text-gray-500">{message}</p>
    </div>
  );
}

export function StockNewsTabs({ symbol, companyName }: StockNewsTabsProps) {
  const [activeTab, setActiveTab] = useState<TabValue>('all');
  const [news, setNews] = useState<NewsItem[]>([]);
  const [earningsCalls, setEarningsCalls] = useState<EarningsCall[]>([]);
  const [secFilings, setSecFilings] = useState<SECFiling[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch news for this stock
        const newsResponse = await fetch(`/api/stock/${symbol}/news`);
        if (newsResponse.ok) {
          const newsData = await newsResponse.json();
          setNews(newsData.news || []);
          setEarningsCalls(newsData.earningsCalls || []);
          setSecFilings(newsData.secFilings || []);
        }
      } catch (err) {
        console.error('Error fetching stock news:', err);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [symbol]);

  // Filter items by type
  const getFilteredNews = () => {
    if (activeTab === 'all') return news;
    if (activeTab === 'news') return news.filter(n => n.type === 'news');
    if (activeTab === 'press') return news.filter(n => n.type === 'press');
    return [];
  };

  const filteredNews = getFilteredNews();

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 flex items-center justify-center">
          <Newspaper className="h-5 w-5 text-blue-400" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-white">News & Filings</h2>
          <p className="text-sm text-gray-500">Latest updates for {companyName || symbol}</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as TabValue)} className="w-full">
        <TabsList className="w-full justify-start bg-white/[0.02] border border-white/[0.05] rounded-xl p-1 h-auto flex-wrap gap-1">
          {TABS.map((tab) => (
            <TabsTrigger
              key={tab.value}
              value={tab.value}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                'data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-cyan-500',
                'data-[state=active]:text-white data-[state=active]:shadow-lg',
                'data-[state=inactive]:text-gray-400 data-[state=inactive]:hover:text-white',
                'data-[state=inactive]:hover:bg-white/5'
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {loading ? (
          <div className="mt-6">
            <LoadingSkeleton />
          </div>
        ) : error ? (
          <div className="mt-6">
            <EmptyState message={error} />
          </div>
        ) : (
          <>
            {/* All Tab */}
            <TabsContent value="all" className="mt-6 space-y-4">
              {filteredNews.length > 0 ? (
                filteredNews.slice(0, 10).map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))
              ) : (
                <EmptyState message="No news available" />
              )}
            </TabsContent>

            {/* News Tab */}
            <TabsContent value="news" className="mt-6 space-y-4">
              {filteredNews.length > 0 ? (
                filteredNews.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))
              ) : (
                <EmptyState message="No news articles available" />
              )}
            </TabsContent>

            {/* Earnings Calls Tab */}
            <TabsContent value="earnings" className="mt-6 space-y-4">
              {earningsCalls.length > 0 ? (
                earningsCalls.map((call) => (
                  <EarningsCallCard key={call.id} call={call} />
                ))
              ) : (
                <EmptyState message="No earnings calls available" />
              )}
            </TabsContent>

            {/* Press Releases Tab */}
            <TabsContent value="press" className="mt-6 space-y-4">
              {filteredNews.length > 0 ? (
                filteredNews.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))
              ) : (
                <EmptyState message="No press releases available" />
              )}
            </TabsContent>

            {/* SEC Filings Tab */}
            <TabsContent value="sec" className="mt-6 space-y-4">
              {secFilings.length > 0 ? (
                secFilings.map((filing) => (
                  <SECFilingCard key={filing.id} filing={filing} />
                ))
              ) : (
                <EmptyState message="No SEC filings available" />
              )}
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}
