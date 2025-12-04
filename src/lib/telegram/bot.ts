/**
 * Telegram Bot Integration
 * 
 * برای استفاده:
 * 1. از @BotFather یه بات بساز و توکن بگیر
 * 2. بات رو ادمین چنل کن
 * 3. توی .env.local اضافه کن:
 *    TELEGRAM_BOT_TOKEN=your_bot_token
 *    TELEGRAM_CHANNEL_ID=@your_channel_username یا -100xxxxxxxxxx
 */

const TELEGRAM_API_BASE = 'https://api.telegram.org/bot';

interface TelegramResponse {
  ok: boolean;
  result?: any;
  description?: string;
}

interface SendMessageOptions {
  parse_mode?: 'HTML' | 'Markdown' | 'MarkdownV2';
  disable_web_page_preview?: boolean;
  disable_notification?: boolean;
}

/**
 * ارسال پیام به چنل تلگرام
 */
export async function sendToChannel(
  message: string,
  options: SendMessageOptions = {}
): Promise<TelegramResponse> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!botToken) {
    console.error('[Telegram] TELEGRAM_BOT_TOKEN is not set');
    throw new Error('Telegram bot token not configured');
  }

  if (!channelId) {
    console.error('[Telegram] TELEGRAM_CHANNEL_ID is not set');
    throw new Error('Telegram channel ID not configured');
  }

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: channelId,
        text: message,
        parse_mode: options.parse_mode || 'HTML',
        disable_web_page_preview: options.disable_web_page_preview || false,
        disable_notification: options.disable_notification || false,
      }),
    });

    const data: TelegramResponse = await response.json();

    if (!data.ok) {
      console.error('[Telegram] API Error:', data.description);
      throw new Error(data.description || 'Failed to send message');
    }

    console.log('[Telegram] Message sent successfully');
    return data;
  } catch (error) {
    console.error('[Telegram] Error sending message:', error);
    throw error;
  }
}

/**
 * ارسال عکس به چنل تلگرام
 */
export async function sendPhotoToChannel(
  photoUrl: string,
  caption?: string,
  options: SendMessageOptions = {}
): Promise<TelegramResponse> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const channelId = process.env.TELEGRAM_CHANNEL_ID;

  if (!botToken || !channelId) {
    throw new Error('Telegram credentials not configured');
  }

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}${botToken}/sendPhoto`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: channelId,
        photo: photoUrl,
        caption: caption,
        parse_mode: options.parse_mode || 'HTML',
      }),
    });

    const data: TelegramResponse = await response.json();

    if (!data.ok) {
      throw new Error(data.description || 'Failed to send photo');
    }

    return data;
  } catch (error) {
    console.error('[Telegram] Error sending photo:', error);
    throw error;
  }
}

/**
 * فرمت کردن خبر برای تلگرام
 */
export function formatNewsForTelegram(news: {
  title: string;
  summary?: string;
  source?: string;
  url?: string;
  symbol?: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}): string {
  const sentimentEmoji = {
    positive: '🟢',
    negative: '🔴',
    neutral: '⚪',
  };

  let message = '';

  // عنوان
  message += `📰 <b>${escapeHtml(news.title)}</b>\n\n`;

  // سمبل سهام
  if (news.symbol) {
    message += `🏷 <b>Symbol:</b> $${news.symbol}\n`;
  }

  // سنتیمنت
  if (news.sentiment) {
    message += `${sentimentEmoji[news.sentiment]} <b>Sentiment:</b> ${news.sentiment}\n`;
  }

  // خلاصه
  if (news.summary) {
    message += `\n${escapeHtml(news.summary)}\n`;
  }

  // منبع و لینک
  if (news.source) {
    message += `\n📌 <i>Source: ${escapeHtml(news.source)}</i>`;
  }

  if (news.url) {
    message += `\n\n🔗 <a href="${news.url}">Read More</a>`;
  }

  // تگ چنل
  message += '\n\n━━━━━━━━━━━━━━━\n';
  message += '🚀 <b>Deepin</b> | @deepinhq';

  return message;
}

/**
 * فرمت کردن آلرت قیمت برای تلگرام
 */
export function formatPriceAlertForTelegram(alert: {
  symbol: string;
  currentPrice: number;
  targetPrice: number;
  type: 'above' | 'below';
  change?: number;
}): string {
  const emoji = alert.type === 'above' ? '📈' : '📉';
  const changeEmoji = (alert.change ?? 0) >= 0 ? '🟢' : '🔴';

  let message = `${emoji} <b>PRICE ALERT</b> ${emoji}\n\n`;
  message += `🏷 <b>$${alert.symbol}</b>\n\n`;
  message += `💰 Current Price: <b>$${alert.currentPrice.toFixed(2)}</b>\n`;
  message += `🎯 Target Price: <b>$${alert.targetPrice.toFixed(2)}</b>\n`;

  if (alert.change !== undefined) {
    message += `${changeEmoji} Change: <b>${alert.change >= 0 ? '+' : ''}${alert.change.toFixed(2)}%</b>\n`;
  }

  message += '\n━━━━━━━━━━━━━━━\n';
  message += '🚀 <b>Deepin</b> | @deepinhq';

  return message;
}

/**
 * Escape HTML characters for Telegram
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * تست اتصال بات
 */
export async function testBotConnection(): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;

  if (!botToken) {
    return false;
  }

  try {
    const response = await fetch(`${TELEGRAM_API_BASE}${botToken}/getMe`);
    const data = await response.json();
    return data.ok;
  } catch {
    return false;
  }
}
