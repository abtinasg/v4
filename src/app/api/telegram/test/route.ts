import { NextRequest, NextResponse } from 'next/server';
import { testBotConnection, sendToChannel } from '@/lib/telegram/bot';

export const runtime = 'nodejs';

/**
 * GET /api/telegram/test
 * تست اتصال بات تلگرام
 */
export async function GET() {
  try {
    const isConnected = await testBotConnection();

    if (!isConnected) {
      return NextResponse.json({
        success: false,
        error: 'Bot is not connected. Check TELEGRAM_BOT_TOKEN in .env.local',
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Telegram bot is connected and working!',
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Connection test failed',
    });
  }
}

/**
 * POST /api/telegram/test
 * ارسال پیام تست به چنل
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const message = body.message || '🧪 <b>Test Message</b>\n\nThis is a test message from Deep Terminal!\n\n✅ Bot is working correctly.';

    const result = await sendToChannel(message);

    return NextResponse.json({
      success: true,
      message: 'Test message sent successfully!',
      telegramMessageId: result.result?.message_id,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to send test message',
      },
      { status: 500 }
    );
  }
}
