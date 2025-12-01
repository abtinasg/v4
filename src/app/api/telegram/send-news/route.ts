import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { sendToChannel, formatNewsForTelegram } from '@/lib/telegram/bot';

export const runtime = 'nodejs';

/**
 * POST /api/telegram/send-news
 * ارسال خبر به چنل تلگرام
 */
export async function POST(req: NextRequest) {
  try {
    // فقط ادمین می‌تونه خبر بفرسته
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: چک کن که یوزر ادمین هست
    // const isAdmin = await checkIfAdmin(userId);
    // if (!isAdmin) {
    //   return NextResponse.json(
    //     { success: false, error: 'Admin access required' },
    //     { status: 403 }
    //   );
    // }

    const body = await req.json();
    const { title, summary, source, url, symbol, sentiment } = body;

    if (!title) {
      return NextResponse.json(
        { success: false, error: 'Title is required' },
        { status: 400 }
      );
    }

    // فرمت کردن پیام
    const message = formatNewsForTelegram({
      title,
      summary,
      source,
      url,
      symbol,
      sentiment,
    });

    // ارسال به تلگرام
    const result = await sendToChannel(message);

    return NextResponse.json({
      success: true,
      message: 'News sent to Telegram channel',
      telegramMessageId: result.result?.message_id,
    });
  } catch (error) {
    console.error('[Telegram API] Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send to Telegram' 
      },
      { status: 500 }
    );
  }
}
