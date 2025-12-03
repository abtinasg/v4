# Cron Jobs Documentation

این سایت از Vercel Cron Jobs برای اجرای وظایف دوره‌ای استفاده می‌کند.

## 📋 لیست Cron Jobs

### 1. Check Price Alerts (`/api/cron/check-alerts`) ⭐ NEW
- **زمان‌بندی**: هر 5 دقیقه یکبار (`*/5 * * * *`)
- **وظیفه**: چک کردن price alerts و ارسال ایمیل
  - دریافت قیمت فعلی سهام
  - مقایسه با target price
  - ارسال ایمیل به کاربر اگر شرط برقرار شد
  - غیرفعال کردن alert بعد از trigger
- **مدت زمان**: تا 60 ثانیه

### 2. Telegram News (`/api/cron/telegram-news`)
- **زمان‌بندی**: هر 4 ساعت یکبار (`0 */4 * * *`)
- **وظیفه**: ارسال خبرهای جدید به کانال تلگرام
- **مدت زمان**: تا 60 ثانیه

### 3. Database Cleanup (`/api/cron/cleanup`)
- **زمان‌بندی**: هر روز ساعت 2 صبح UTC (`0 2 * * *`)
- **وظیفه**: پاکسازی دیتاهای قدیمی
  - Activity logs بیشتر از 90 روز
  - API usage logs بیشتر از 30 روز
  - Rate limit records منقضی شده
- **مدت زمان**: تا 60 ثانیه

### 4. Cache Warming (`/api/cron/cache-warm`)
- **زمان‌بندی**: هر 15 دقیقه یکبار (`*/15 * * * *`)
- **وظیفه**: Pre-warm cache برای دیتاهای پرکاربرد
  - Market indices (S&P 500, DOW, NASDAQ, etc.)
  - 10 سهام محبوب (AAPL, MSFT, GOOGL, etc.)
- **مدت زمان**: تا 60 ثانیه

## 🔔 استفاده از سرویس خارجی Cron (مثل cron-job.org)

اگه از Vercel Free Tier استفاده می‌کنی یا می‌خوای کنترل بیشتری داشته باشی:

### تنظیم در cron-job.org:
1. ثبت‌نام در https://cron-job.org
2. Create New Cron Job
3. تنظیمات:
   - **URL**: `https://your-domain.com/api/cron/check-alerts`
   - **Schedule**: Every 5 minutes
   - **Request Method**: GET
   - **Headers**: 
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```
4. Enable و Save

### تست manual:
```bash
curl -X GET "https://your-domain.com/api/cron/check-alerts" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 🔒 امنیت

همه cron endpoints با دو روش احراز هویت محافظت می‌شوند:

### روش 1: Vercel Cron Header (خودکار)
```
x-vercel-cron: 1
```

### روش 2: Bearer Token
```bash
Authorization: Bearer YOUR_CRON_SECRET
```

**تنظیم `CRON_SECRET` در Environment Variables:**
```bash
CRON_SECRET=your-secure-random-string
```

## 📊 Cron Schedule Format

فرمت: `minute hour day month weekday`

مثال‌ها:
- `*/5 * * * *` - هر 5 دقیقه
- `0 */4 * * *` - هر 4 ساعت یکبار
- `0 2 * * *` - هر روز ساعت 2 صبح
- `*/15 * * * *` - هر 15 دقیقه
- `0 0 * * 0` - هر یکشنبه نیمه شب
- `30 9 * * 1-5` - هر روز کاری ساعت 9:30 صبح

ابزار کمکی: https://crontab.guru

## 🚀 تنظیمات Vercel

### مرحله 1: Push کردن تغییرات
```bash
git add vercel.json src/app/api/cron/
git commit -m "Add cron jobs"
git push
```

### مرحله 2: Deploy در Vercel
- Vercel به صورت خودکار `vercel.json` را می‌خواند
- Cron jobs بعد از deploy فعال می‌شوند

### مرحله 3: تنظیم Environment Variables
در Vercel Dashboard:
1. Settings → Environment Variables
2. اضافه کردن:
   - `CRON_SECRET`: یک رشته تصادفی امن
   - `TELEGRAM_BOT_TOKEN`: توکن ربات تلگرام
   - `TELEGRAM_CHANNEL_ID`: شناسه کانال تلگرام

### مرحله 4: تست Manual
می‌توانید از Vercel Dashboard یا curl تست کنید:

```bash
# تست Check Alerts
curl -X GET "https://your-domain.com/api/cron/check-alerts" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# تست Telegram News
curl -X GET "https://your-domain.com/api/cron/telegram-news" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# تست Cleanup
curl -X GET "https://your-domain.com/api/cron/cleanup" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# تست Cache Warm
curl -X GET "https://your-domain.com/api/cron/cache-warm" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 📈 مانیتورینگ

### دیدن Logs در Vercel:
1. Dashboard → Project → Logs
2. فیلتر کردن با `/api/cron`

### دیدن اجراهای Cron:
1. Dashboard → Project → Cron
2. مشاهده آخرین اجراها و نتایج

## 🔄 محدودیت‌های Vercel Cron

### Hobby Plan:
- ✅ تعداد نامحدود cron jobs
- ⏱️ حداکثر زمان اجرا: 60 ثانیه (serverless function)
- 📊 محدودیت invocations: 100 هزار در ماه

### Pro Plan:
- ✅ همه محدودیت‌ها بالاتر
- ⏱️ حداکثر زمان اجرا: 300 ثانیه

### Enterprise:
- ✅ Custom limits

## 🛠️ جایگزین‌های Vercel Cron

اگر به cron jobs پیچیده‌تری نیاز داری:

### 1. GitHub Actions (رایگان)
```yaml
# .github/workflows/cron.yml
name: Cron Jobs
on:
  schedule:
    - cron: '0 */4 * * *'
jobs:
  telegram-news:
    runs-on: ubuntu-latest
    steps:
      - run: |
          curl -X GET "https://your-domain.com/api/cron/telegram-news" \
            -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}"
```

### 2. Cron-job.org (رایگان)
- ثبت نام در https://cron-job.org
- اضافه کردن URL: `https://your-domain.com/api/cron/telegram-news`
- تنظیم schedule

### 3. EasyCron (رایگان تا حد محدود)
- https://www.easycron.com

### 4. Uptime Robot (برای monitoring + cron)
- https://uptimerobot.com

## 📝 نکات مهم

1. **Timezone**: همه cron jobs در UTC اجرا می‌شوند
2. **Retry**: Vercel به صورت خودکار retry نمی‌کنه - باید خودت handle کنی
3. **Idempotency**: مطمئن شو cron jobs idempotent هستند (اجرای چند باره مشکلی ایجاد نکنه)
4. **Monitoring**: حتماً logs رو چک کن و alerting بذار
5. **Rate Limiting**: مراقب rate limits API های خارجی باش

## 🐛 Troubleshooting

### Cron اجرا نمیشه:
- چک کن که deploy موفق بوده
- `vercel.json` رو بررسی کن (syntax صحیح باشه)
- Environment variables رو چک کن

### خطای 401 Unauthorized:
- `CRON_SECRET` رو چک کن
- Header های request رو بررسی کن

### Timeout:
- مدت زمان اجرا رو کم کن
- عملیات سنگین رو به batch های کوچکتر تقسیم کن
- از `maxDuration` بیشتر استفاده کن (تا 60s در Hobby)

## 📚 منابع

- [Vercel Cron Jobs Docs](https://vercel.com/docs/cron-jobs)
- [Cron Expression Generator](https://crontab.guru)
- [Vercel Function Limits](https://vercel.com/docs/concepts/limits/overview)
