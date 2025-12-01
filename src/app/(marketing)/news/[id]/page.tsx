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
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(publishedDate);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        {/* Header with back button */}
        <div className="mb-8">
          <Link href="/dashboard/news">
            <Button variant="ghost" size="sm" className="mb-6 hover:bg-muted/50 transition-colors">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to News
            </Button>
          </Link>
        </div>

        {/* Article Card */}
        <article className="bg-card rounded-2xl shadow-xl border border-border/50 overflow-hidden backdrop-blur-sm">
          {/* Image Header */}
          {article.image && (
            <div className="relative h-72 md:h-[32rem] w-full overflow-hidden bg-gradient-to-b from-muted/50 to-muted">
              <img
                src={article.image}
                alt={article.headline}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
            </div>
          )}

          <div className="p-8 md:p-12">
            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              {article.symbol && (
                <Link href={`/dashboard/stock-analysis/${article.symbol}`}>
                  <Badge variant="outline" className="hover:bg-primary/10 cursor-pointer transition-colors text-base px-3 py-1">
                    <Tag className="mr-1.5 h-3.5 w-3.5" />
                    {article.symbol}
                  </Badge>
                </Link>
              )}
              
              {article.sentiment && (
                <Badge className={`${getSentimentColor(article.sentiment)} text-base px-3 py-1`}>
                  {getSentimentIcon(article.sentiment)}
                  {getSentimentLabel(article.sentiment)}
                </Badge>
              )}

              <div className="flex items-center text-sm text-muted-foreground gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formattedDate}</span>
              </div>

              <Badge variant="secondary" className="text-base px-3 py-1">
                {article.source}
              </Badge>

              <Badge variant="outline" className="text-base px-3 py-1">
                {article.category}
              </Badge>
            </div>

            {/* Headline */}
            <h1 className="text-4xl md:text-5xl font-bold mb-8 leading-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {article.headline}
            </h1>

            {/* Summary */}
            <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-8 mb-10 border-l-4 border-primary shadow-sm">
              <p className="text-xl leading-relaxed text-foreground/90 font-medium">
                {article.summary}
              </p>
            </div>

            {/* Full Content */}
            {article.fullText && (
              <div className="prose prose-xl dark:prose-invert max-w-none mb-12">
                <div className="text-foreground/85 leading-relaxed space-y-6">
                  {article.fullText.split('\n\n').map((paragraph, index) => (
                    <p key={index} className="text-lg">{paragraph}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-border/50">
              <Button
                asChild
                size="lg"
                className="flex-1 h-14 text-base font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2"
                >
                  <ExternalLink className="h-5 w-5" />
                  Read Full Article
                </a>
              </Button>

              {article.symbol && (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="flex-1 h-14 text-base font-semibold border-2 hover:bg-muted/50 transition-all"
                >
                  <Link
                    href={`/dashboard/stock-analysis/${article.symbol}`}
                    className="flex items-center justify-center gap-2"
                  >
                    <Tag className="h-5 w-5" />
                    Analyze {article.symbol}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </article>

        {/* Source Credit */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Source: <span className="font-medium text-foreground/70">{article.source}</span>
          </p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Aggregated from trusted financial news sources
          </p>
        </div>
      </div>
    </div>
  );
}
