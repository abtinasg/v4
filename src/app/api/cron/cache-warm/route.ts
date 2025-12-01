import { NextRequest, NextResponse } from 'next/server';
import { getMarketIndices } from '@/lib/api/yahoo-finance';

export const runtime = 'nodejs';
export const maxDuration = 60;

const CRON_SECRET = process.env.CRON_SECRET || 'cron-secret-key';

// سهام‌های پربازدید برای pre-warming cache
const POPULAR_SYMBOLS = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA',
  'TSLA', 'META', 'BRK.B', 'JPM', 'V'
];

/**
 * GET /api/cron/cache-warm
 * 
 * Pre-warm cache برای دیتاهای پرکاربرد:
 * - Market indices (S&P 500, DOW, NASDAQ, etc.)
 * - Popular stock quotes
 */
export async function GET(req: NextRequest) {
  try {
    // بررسی authorization
    const authHeader = req.headers.get('authorization');
    const isVercelCron = req.headers.get('x-vercel-cron') === '1';
    const isAuthorized = authHeader === `Bearer ${CRON_SECRET}` || isVercelCron;
    
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const results = {
      indices: false,
      quotes: 0,
      errors: [] as string[],
    };

    // 1. Refresh market indices
    try {
      const indicesResult = await getMarketIndices();
      results.indices = indicesResult.success;
      
      if (!indicesResult.success) {
        results.errors.push('Failed to fetch market indices');
      }
    } catch (error) {
      results.errors.push(`Market indices error: ${error instanceof Error ? error.message : 'Unknown'}`);
    }

    // 2. Warm cache for popular stocks (parallel requests)
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.deepinhq.com';
    
    const quotePromises = POPULAR_SYMBOLS.map(async (symbol) => {
      try {
        const response = await fetch(`${baseUrl}/api/stock/${symbol}/metrics`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          results.quotes++;
        } else {
          results.errors.push(`${symbol}: ${response.status}`);
        }
      } catch (error) {
        results.errors.push(`${symbol}: ${error instanceof Error ? error.message : 'Failed'}`);
      }
    });

    // اجرا با محدودیت همزمانی (3 تا همزمان)
    for (let i = 0; i < quotePromises.length; i += 3) {
      await Promise.all(quotePromises.slice(i, i + 3));
      // کمی صبر بین batch ها
      if (i + 3 < quotePromises.length) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    console.log('[Cron Cache Warm] Results:', results);

    return NextResponse.json({
      success: true,
      message: 'Cache warming completed',
      results: {
        indicesUpdated: results.indices,
        quotesWarmed: results.quotes,
        totalSymbols: POPULAR_SYMBOLS.length,
        errors: results.errors.length,
      },
      errors: results.errors.length > 0 ? results.errors : undefined,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron Cache Warm] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Cache warm failed',
      },
      { status: 500 }
    );
  }
}
