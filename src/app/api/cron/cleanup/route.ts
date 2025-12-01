import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { 
  creditTransactions,
  rateLimitTracking,
  chatHistory
} from '@/lib/db/schema';
import { lt, sql } from 'drizzle-orm';

export const runtime = 'nodejs';
export const maxDuration = 60;

// امنیت: بررسی کلید cron
const CRON_SECRET = process.env.CRON_SECRET || 'cron-secret-key';

/**
 * GET /api/cron/cleanup
 * 
 * پاکسازی دیتاهای قدیمی:
 * - Activity logs بیشتر از 90 روز
 * - API usage logs بیشتر از 30 روز
 * - Rate limit records expired
 */
export async function GET(req: NextRequest) {
  try {
    // بررسی authorization
    const authHeader = req.headers.get('authorization');
    
    // برای Vercel Cron، از x-vercel-signature یا authorization استفاده کن
    const isVercelCron = req.headers.get('x-vercel-cron') === '1';
    const isAuthorized = authHeader === `Bearer ${CRON_SECRET}` || isVercelCron;
    
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const results = {
      chatHistory: 0,
      creditTransactions: 0,
      rateLimitTracking: 0,
    };

    // 1. پاک کردن chat history قدیمی‌تر از 90 روز
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    
    try {
      const deletedChats = await db
        .delete(chatHistory)
        .where(lt(chatHistory.createdAt, ninetyDaysAgo));
      
      results.chatHistory = deletedChats.rowCount || 0;
    } catch (error) {
      console.error('[Cleanup] Chat history error:', error);
    }

    // 2. پاک کردن credit transactions قدیمی‌تر از 180 روز (نگهداری طولانی‌تر برای حسابداری)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(sixMonthsAgo.getDate() - 180);
    
    try {
      const deletedTransactions = await db
        .delete(creditTransactions)
        .where(lt(creditTransactions.createdAt, sixMonthsAgo));
      
      results.creditTransactions = deletedTransactions.rowCount || 0;
    } catch (error) {
      console.error('[Cleanup] Credit transactions error:', error);
    }

    // 3. پاک کردن rate limit tracking قدیمی‌تر از 7 روز
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    try {
      const deletedRateLimits = await db
        .delete(rateLimitTracking)
        .where(lt(rateLimitTracking.createdAt, sevenDaysAgo));
      
      results.rateLimitTracking = deletedRateLimits.rowCount || 0;
    } catch (error) {
      console.error('[Cleanup] Rate limit tracking error:', error);
    }

    console.log('[Cron Cleanup] Results:', results);

    return NextResponse.json({
      success: true,
      message: 'Cleanup completed',
      deleted: results,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron Cleanup] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Cleanup failed',
      },
      { status: 500 }
    );
  }
}
