import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 10;

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

// Simple in-memory cache for news articles
const newsCache = new Map<string, { article: NewsArticle; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * GET /api/market/news/[id]
 * Get a single news article by ID
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'News ID is required' },
        { status: 400 }
      );
    }

    // Check cache first
    const cached = newsCache.get(id);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json({
        success: true,
        article: cached.article,
        cached: true,
      });
    }

    // Fetch from main news API
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.deepinhq.com';
    const response = await fetch(`${baseUrl}/api/market/news?limit=100`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch news');
    }

    const data = await response.json();
    const article = data.news?.find((n: NewsArticle) => n.id === id);

    if (!article) {
      return NextResponse.json(
        { success: false, error: 'Article not found' },
        { status: 404 }
      );
    }

    // Cache the article
    newsCache.set(id, { article, timestamp: Date.now() });

    return NextResponse.json({
      success: true,
      article,
      cached: false,
    });
  } catch (error) {
    console.error('Error fetching news article:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch article',
      },
      { status: 500 }
    );
  }
}
