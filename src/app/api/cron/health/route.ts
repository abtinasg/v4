import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const maxDuration = 10;

/**
 * Health check endpoint برای تست cron jobs
 * GET /api/cron/health
 */
export async function GET(req: NextRequest) {
  const checks = {
    timestamp: new Date().toISOString(),
    cronSecret: !!process.env.CRON_SECRET,
    telegramBotToken: !!process.env.TELEGRAM_BOT_TOKEN,
    telegramChannelId: !!process.env.TELEGRAM_CHANNEL_ID,
    fmpApiKey: !!process.env.FMP_API_KEY,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'not set',
    authHeader: req.headers.get('authorization') ? 'present' : 'missing',
    isVercelCron: req.headers.get('x-vercel-cron') === '1',
  };

  return NextResponse.json({
    success: true,
    message: 'Cron health check',
    checks,
    endpoints: [
      '/api/cron/telegram-news',
      '/api/cron/cache-warm',
    ],
  });
}
