'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Send, RefreshCw, CheckCircle, XCircle, Loader2, Newspaper, Zap } from 'lucide-react';

interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  symbol?: string;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
}

export default function TelegramAdminPage() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Custom news form
  const [newsTitle, setNewsTitle] = useState('');
  const [newsSummary, setNewsSummary] = useState('');
  const [newsSource, setNewsSource] = useState('');
  const [newsUrl, setNewsUrl] = useState('');
  const [newsSymbol, setNewsSymbol] = useState('');
  const [newsSentiment, setNewsSentiment] = useState<'positive' | 'negative' | 'neutral'>('neutral');

  // Recent news
  const [recentNews, setRecentNews] = useState<NewsItem[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);

  // Check bot connection on mount
  useEffect(() => {
    checkConnection();
    fetchRecentNews();
  }, []);

  const checkConnection = async () => {
    try {
      const res = await fetch('/api/telegram/test');
      const data = await res.json();
      setIsConnected(data.success);
    } catch {
      setIsConnected(false);
    }
  };

  const fetchRecentNews = async () => {
    setLoadingNews(true);
    try {
      const res = await fetch('/api/market/news?limit=10');
      const data = await res.json();
      setRecentNews(data.news || []);
    } catch (error) {
      console.error('Failed to fetch news:', error);
    }
    setLoadingNews(false);
  };

  const sendTestMessage = async () => {
    setIsLoading(true);
    setStatus(null);
    try {
      const res = await fetch('/api/telegram/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', text: 'پیام تست ارسال شد!' });
        setMessage('');
      } else {
        setStatus({ type: 'error', text: data.error || 'خطا در ارسال' });
      }
    } catch (error) {
      setStatus({ type: 'error', text: 'خطا در ارتباط با سرور' });
    }
    setIsLoading(false);
  };

  const sendCustomNews = async () => {
    if (!newsTitle) {
      setStatus({ type: 'error', text: 'عنوان خبر الزامی است' });
      return;
    }
    
    setIsSending(true);
    setStatus(null);
    try {
      const res = await fetch('/api/telegram/send-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newsTitle,
          summary: newsSummary,
          source: newsSource,
          url: newsUrl,
          symbol: newsSymbol || undefined,
          sentiment: newsSentiment,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', text: 'خبر به تلگرام ارسال شد!' });
        // Clear form
        setNewsTitle('');
        setNewsSummary('');
        setNewsSource('');
        setNewsUrl('');
        setNewsSymbol('');
        setNewsSentiment('neutral');
      } else {
        setStatus({ type: 'error', text: data.error || 'خطا در ارسال خبر' });
      }
    } catch (error) {
      setStatus({ type: 'error', text: 'خطا در ارتباط با سرور' });
    }
    setIsSending(false);
  };

  const sendNewsToTelegram = async (news: NewsItem) => {
    setIsSending(true);
    setStatus(null);
    try {
      const res = await fetch('/api/telegram/send-news', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: news.headline,
          summary: news.summary,
          source: news.source,
          url: news.url,
          symbol: news.symbol,
          sentiment: news.sentiment === 'bullish' ? 'positive' : 
                     news.sentiment === 'bearish' ? 'negative' : 'neutral',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', text: `خبر "${news.headline.slice(0, 30)}..." ارسال شد!` });
      } else {
        setStatus({ type: 'error', text: data.error || 'خطا در ارسال' });
      }
    } catch (error) {
      setStatus({ type: 'error', text: 'خطا در ارتباط با سرور' });
    }
    setIsSending(false);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Telegram Channel</h1>
          <p className="text-muted-foreground">مدیریت چنل تلگرام و ارسال خبر</p>
        </div>
        <div className="flex items-center gap-2">
          {isConnected === null ? (
            <Badge variant="secondary">در حال بررسی...</Badge>
          ) : isConnected ? (
            <Badge variant="default" className="bg-green-500">
              <CheckCircle className="w-4 h-4 mr-1" />
              متصل
            </Badge>
          ) : (
            <Badge variant="destructive">
              <XCircle className="w-4 h-4 mr-1" />
              قطع
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={checkConnection}>
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Status Message */}
      {status && (
        <div className={`p-4 rounded-lg ${status.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
          {status.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Send Custom News */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="w-5 h-5" />
              ارسال خبر سفارشی
            </CardTitle>
            <CardDescription>خبر جدید به چنل تلگرام بفرست</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>عنوان خبر *</Label>
              <Input
                value={newsTitle}
                onChange={(e) => setNewsTitle(e.target.value)}
                placeholder="Apple Stock Surges 5% After Earnings..."
              />
            </div>
            <div>
              <Label>خلاصه</Label>
              <Textarea
                value={newsSummary}
                onChange={(e) => setNewsSummary(e.target.value)}
                placeholder="خلاصه خبر..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>سمبل سهام</Label>
                <Input
                  value={newsSymbol}
                  onChange={(e) => setNewsSymbol(e.target.value.toUpperCase())}
                  placeholder="AAPL"
                />
              </div>
              <div>
                <Label>سنتیمنت</Label>
                <Select value={newsSentiment} onValueChange={(v: any) => setNewsSentiment(v)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="positive">🟢 Positive</SelectItem>
                    <SelectItem value="neutral">⚪ Neutral</SelectItem>
                    <SelectItem value="negative">🔴 Negative</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>منبع</Label>
              <Input
                value={newsSource}
                onChange={(e) => setNewsSource(e.target.value)}
                placeholder="Reuters, Bloomberg..."
              />
            </div>
            <div>
              <Label>لینک خبر</Label>
              <Input
                value={newsUrl}
                onChange={(e) => setNewsUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>
            <Button onClick={sendCustomNews} disabled={isSending || !newsTitle} className="w-full">
              {isSending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              ارسال به تلگرام
            </Button>
          </CardContent>
        </Card>

        {/* Test Message */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="w-5 h-5" />
              پیام تست
            </CardTitle>
            <CardDescription>پیام سفارشی به چنل بفرست</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>متن پیام (HTML)</Label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="<b>Bold</b> <i>Italic</i> <a href='url'>Link</a>"
                rows={5}
              />
            </div>
            <Button onClick={sendTestMessage} disabled={isLoading} className="w-full">
              {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              ارسال پیام تست
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent News */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>آخرین اخبار</CardTitle>
              <CardDescription>خبرهای اخیر رو به تلگرام بفرست</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchRecentNews} disabled={loadingNews}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loadingNews ? 'animate-spin' : ''}`} />
              بروزرسانی
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentNews.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">خبری یافت نشد</p>
            ) : (
              recentNews.map((news) => (
                <div key={news.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1 min-w-0 pr-4">
                    <p className="font-medium truncate">{news.headline}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{news.source}</span>
                      {news.symbol && <Badge variant="outline">${news.symbol}</Badge>}
                      {news.sentiment && (
                        <Badge variant={news.sentiment === 'bullish' ? 'default' : news.sentiment === 'bearish' ? 'destructive' : 'secondary'}>
                          {news.sentiment}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => sendNewsToTelegram(news)}
                    disabled={isSending}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
