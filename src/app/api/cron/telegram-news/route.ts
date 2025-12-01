import { NextRequest, NextResponse } from 'next/server';
import { sendToChannel, formatNewsForTelegram } from '@/lib/telegram/bot';

export const runtime = 'nodejs';
export const maxDuration = 60;

// کلید امنیتی برای cron job - از Vercel Cron یا سرویس‌های دیگه استفاده کن
const CRON_SECRET = process.env.CRON_SECRET || 'cron-secret-key';

interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  source: string;
  url: string;
  symbol?: string;
  sentiment?: 'bullish' | 'bearish' | 'neutral';
  publishedDate: string;
}

// ذخیره آخرین خبرهای ارسال شده (در memory - برای production از Redis استفاده کن)
const sentNewsIds = new Set<string>();

/**
 * GET /api/cron/telegram-news
 * 
 * این endpoint توسط Vercel Cron یا سرویس‌های مشابه صدا زده میشه
 * خبرهای جدید رو fetch میکنه و به تلگرام میفرسته
 */
export async function GET(req: NextRequest) {
  try {
    // بررسی authorization
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // چک کن که تلگرام configure شده
    if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHANNEL_ID) {
      return NextResponse.json({
        success: false,
        error: 'Telegram not configured',
      });
    }

    // Fetch خبرهای جدید از API داخلی
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const newsResponse = await fetch(`${baseUrl}/api/market/news?limit=10`, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!newsResponse.ok) {
      throw new Error('Failed to fetch news');
    }

    const newsData = await newsResponse.json();
    const news: NewsItem[] = newsData.news || [];

    // فیلتر خبرهایی که قبلاً ارسال نشدن
    const newNews = news.filter((item) => !sentNewsIds.has(item.id));

    if (newNews.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No new news to send',
        checked: news.length,
      });
    }

    // فقط ۳ تا خبر جدید بفرست (برای جلوگیری از spam)
    const newsToSend = newNews.slice(0, 3);
    let sentCount = 0;

    for (const item of newsToSend) {
      try {
        // لینک به صفحه خبر در سایت خودمون
        const newsUrl = `${baseUrl}/news/${item.id}`;
        
        const message = formatNewsForTelegram({
          title: item.headline,
          summary: item.summary,
          source: item.source,
          url: newsUrl, // لینک به سایت خودمون به جای منبع اصلی
          symbol: item.symbol || undefined,
          sentiment: item.sentiment === 'bullish' ? 'positive' : 
                     item.sentiment === 'bearish' ? 'negative' : 'neutral',
        });

        await sendToChannel(message);
        sentNewsIds.add(item.id);
        sentCount++;

        // یکم صبر کن بین هر پیام (rate limit تلگرام)
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`[Cron] Failed to send news ${item.id}:`, error);
      }
    }

    // پاک کردن خبرهای قدیمی از حافظه (نگه داشتن فقط ۱۰۰ تا آخری)
    if (sentNewsIds.size > 100) {
      const idsArray = Array.from(sentNewsIds);
      const toRemove = idsArray.slice(0, idsArray.length - 100);
      toRemove.forEach((id) => sentNewsIds.delete(id));
    }

    return NextResponse.json({
      success: true,
      message: `Sent ${sentCount} news to Telegram`,
      checked: news.length,
      newFound: newNews.length,
      sent: sentCount,
    });
  } catch (error) {
    console.error('[Cron Telegram News] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Cron job failed',
      },
      { status: 500 }
    );
  }
}
