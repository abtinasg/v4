import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Calendar, Tag, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NewsArticle {
  id: string;
  headline: string;
  summary: string;
  fullText?: string;
  source: string;
  url: string;
  symbol: string | null;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  publishedDate: string;
  image: string | null;
  category: string;
  timeAgo: string;
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const article = await getNewsArticle(params.id);
  
  if (!article) {
    return {
      title: 'خبر یافت نشد | Deep Terminal',
    };
  }

  return {
    title: `${article.headline} | Deep Terminal`,
    description: article.summary,
    openGraph: {
      title: article.headline,
      description: article.summary,
      images: article.image ? [article.image] : [],
    },
  };
}

async function getNewsArticle(id: string): Promise<NewsArticle | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.deepinhq.com';
    const response = await fetch(`${baseUrl}/api/market/news/${id}`, {
      next: { revalidate: 300 }, // 5 minutes cache
    });

    if (!response.ok) {
      console.error(`Failed to fetch article ${id}:`, response.status);
      return null;
    }

    const data = await response.json();
    
    if (!data.success || !data.article) {
      console.error(`Article ${id} not found in response`);
      return null;
    }

    return data.article;
  } catch (error) {
    console.error('Error fetching article:', error);
    return null;
  }
}

function getSentimentColor(sentiment?: string) {
  switch (sentiment) {
    case 'bullish':
      return 'bg-green-500/10 text-green-600 dark:text-green-400';
    case 'bearish':
      return 'bg-red-500/10 text-red-600 dark:text-red-400';
    default:
      return 'bg-gray-500/10 text-gray-600 dark:text-gray-400';
  }
}

function getSentimentIcon(sentiment?: string) {
  switch (sentiment) {
    case 'bullish':
      return <TrendingUp className="ml-1 h-4 w-4" />;
    case 'bearish':
      return <TrendingDown className="ml-1 h-4 w-4" />;
    default:
      return <Minus className="ml-1 h-4 w-4" />;
  }
}

function getSentimentLabel(sentiment?: string) {
  switch (sentiment) {
    case 'bullish':
      return 'صعودی';
    case 'bearish':
      return 'نزولی';
    default:
      return 'خنثی';
  }
}

export default async function NewsArticlePage({ params }: { params: { id: string } }) {
  const article = await getNewsArticle(params.id);

  if (!article) {
    notFound();
  }

  const publishedDate = new Date(article.publishedDate);
  const formattedDate = new Intl.DateTimeFormat('fa-IR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(publishedDate);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header با دکمه برگشت */}
        <div className="mb-8">
          <Link href="/dashboard/news">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="ml-2 h-4 w-4" />
              بازگشت به خبرها
            </Button>
          </Link>
        </div>

        {/* Article Card */}
        <article className="bg-card rounded-xl shadow-lg border border-border overflow-hidden">
          {/* Image Header */}
          {article.image && (
            <div className="relative h-64 md:h-96 w-full overflow-hidden bg-muted">
              <img
                src={article.image}
                alt={article.headline}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div className="p-6 md:p-8">
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              {article.symbol && (
                <Link href={`/dashboard/stock-analysis/${article.symbol}`}>
                  <Badge variant="outline" className="hover:bg-primary/10 cursor-pointer">
                    <Tag className="ml-1 h-3 w-3" />
                    {article.symbol}
                  </Badge>
                </Link>
              )}
              
              {article.sentiment && (
                <Badge className={getSentimentColor(article.sentiment)}>
                  {getSentimentIcon(article.sentiment)}
                  {getSentimentLabel(article.sentiment)}
                </Badge>
              )}

              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="ml-2 h-4 w-4" />
                {formattedDate}
              </div>

              <Badge variant="secondary">
                {article.source}
              </Badge>

              <Badge variant="outline">
                {article.category}
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">
              {article.headline}
            </h1>

            {/* Summary */}
            <div className="bg-muted/50 rounded-lg p-6 mb-8 border-r-4 border-primary">
              <p className="text-lg leading-relaxed text-foreground/90">
                {article.summary}
              </p>
            </div>

            {/* Full Content */}
            {article.fullText && (
              <div className="prose prose-lg dark:prose-invert max-w-none mb-8">
                <div className="text-foreground/80 leading-relaxed space-y-4">
                  {article.fullText.split('\n\n').map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-border">
              <Button
                asChild
                size="lg"
                className="flex-1"
              >
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  مشاهده در منبع اصلی
                  <ExternalLink className="mr-2 h-5 w-5" />
                </a>
              </Button>

              {article.symbol && (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="flex-1"
                >
                  <Link
                    href={`/dashboard/stock-analysis/${article.symbol}`}
                    className="flex items-center justify-center"
                  >
                    تحلیل {article.symbol}
                    <Tag className="mr-2 h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </article>

        {/* Source Credit */}
        <div className="mt-6 text-center text-sm text-muted-foreground">
          منبع: {article.source} | این خبر از منابع معتبر جمع‌آوری شده است
        </div>
      </div>
    </div>
  );
}
