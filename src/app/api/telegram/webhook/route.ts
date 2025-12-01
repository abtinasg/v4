import { NextRequest, NextResponse } from 'next/server';
import { sendToChannel, formatNewsForTelegram, formatPriceAlertForTelegram } from '@/lib/telegram/bot';

export const runtime = 'nodejs';

// Secret key برای امنیت webhook
const WEBHOOK_SECRET = process.env.TELEGRAM_WEBHOOK_SECRET || 'your-secret-key';

/**
 * POST /api/telegram/webhook
 * 
 * این endpoint برای دریافت خبرها و ارسال اتوماتیک به تلگرام استفاده میشه
 * می‌تونی از cron job یا سرویس‌های دیگه صداش بزنی
 */
export async function POST(req: NextRequest) {
  try {
    // بررسی secret key
    const authHeader = req.headers.get('x-webhook-secret');
    if (authHeader !== WEBHOOK_SECRET) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { type, data } = body;

    switch (type) {
      case 'news': {
        // ارسال خبر
        const message = formatNewsForTelegram({
          title: data.title,
          summary: data.summary,
          source: data.source,
          url: data.url,
          symbol: data.symbol,
          sentiment: data.sentiment,
        });

        await sendToChannel(message);
        break;
      }

      case 'price_alert': {
        // ارسال آلرت قیمت
        const message = formatPriceAlertForTelegram({
          symbol: data.symbol,
          currentPrice: data.currentPrice,
          targetPrice: data.targetPrice,
          type: data.type,
          change: data.change,
        });

        await sendToChannel(message);
        break;
      }

      case 'market_update': {
        // آپدیت بازار
        let message = `📊 <b>MARKET UPDATE</b>\n\n`;
        message += `🕐 ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })} ET\n\n`;
        
        if (data.indices) {
          message += `<b>Major Indices:</b>\n`;
          for (const index of data.indices) {
            const emoji = index.change >= 0 ? '🟢' : '🔴';
            message += `${emoji} ${index.name}: ${index.value.toLocaleString()} (${index.change >= 0 ? '+' : ''}${index.change.toFixed(2)}%)\n`;
          }
        }

        message += '\n━━━━━━━━━━━━━━━\n';
        message += '🚀 <b>Deep Terminal</b> | @DeepTerminal';

        await sendToChannel(message);
        break;
      }

      case 'custom': {
        // پیام سفارشی
        await sendToChannel(data.message);
        break;
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Unknown message type' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: 'Message sent to Telegram',
    });
  } catch (error) {
    console.error('[Telegram Webhook] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to process webhook',
      },
      { status: 500 }
    );
  }
}
