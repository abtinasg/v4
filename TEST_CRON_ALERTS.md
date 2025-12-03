# تست Cron Job برای Alerts

## ✅ مشکل رفع شد!

کد قبلی فقط `stockAlerts` را چک می‌کرد اما `portfolioAlerts` را نادیده می‌گرفت.  
حالا هر دو نوع alert پشتیبانی می‌شوند.

## 🧪 نحوه تست

### روش 1: تست محلی با curl

```bash
# تست در محیط development (بدون نیاز به token)
curl http://localhost:3000/api/cron/check-alerts

# تست در production با CRON_SECRET
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  https://your-domain.com/api/cron/check-alerts
```

### روش 2: تست از طریق مرورگر (فقط development)

```
http://localhost:3000/api/cron/check-alerts
```

### روش 3: تنظیم در سرویس خارجی (مثل cron-job.org)

1. **ثبت نام در cron-job.org**
2. **Create New Cron Job:**
   - URL: `https://your-domain.vercel.app/api/cron/check-alerts`
   - Schedule: `*/5 * * * *` (هر 5 دقیقه)
   - Method: `GET`
   - Headers:
     ```
     Authorization: Bearer YOUR_CRON_SECRET
     ```

3. **تنظیم CRON_SECRET در Vercel:**
   ```bash
   # از terminal یا از Vercel Dashboard
   vercel env add CRON_SECRET
   ```

## 📊 پاسخ API

### موفق:
```json
{
  "success": true,
  "results": {
    "stockAlerts": {
      "checked": 5,
      "triggered": 2,
      "emailsSent": 2
    },
    "portfolioAlerts": {
      "checked": 3,
      "triggered": 1,
      "emailsSent": 1
    },
    "errors": []
  },
  "duration": 2450
}
```

### خطا:
```json
{
  "error": "Failed to check alerts",
  "details": "Database connection error",
  "results": {
    "stockAlerts": { "checked": 0, "triggered": 0, "emailsSent": 0 },
    "portfolioAlerts": { "checked": 0, "triggered": 0, "emailsSent": 0 },
    "errors": ["Failed to fetch price for AAPL"]
  },
  "duration": 1200
}
```

## 🎯 تفاوت‌های Stock vs Portfolio Alerts

### Stock Alerts (Watchlist):
- ✅ چک شرایط: `above`, `below`, `crosses_above`, `crosses_below`
- ✅ بعد از trigger: alert غیرفعال می‌شود (`isActive = false`)
- ✅ تاریخ trigger: `triggeredAt` ست می‌شود
- ✅ استفاده: برای watchlist

### Portfolio Alerts:
- ✅ چک شرایط: `price_above`, `price_below`, `percent_change`, `portfolio_value`, `daily_gain_loss`, `news`
- ✅ بعد از trigger: alert فعال می‌ماند (برای recurring alerts)
- ✅ تاریخ trigger: `lastTriggeredAt` و `triggerCount` بروز می‌شود
- ✅ کنترل ایمیل: فقط اگر `isEmailEnabled = true` ایمیل ارسال می‌شود
- ✅ استفاده: برای portfolio holdings

## 🔧 دیباگ

اگر alert کار نمی‌کند:

### 1. چک کنید alert ساخته شده:
```sql
-- Portfolio alerts
SELECT * FROM portfolio_alerts 
WHERE is_active = true 
ORDER BY created_at DESC;

-- Stock alerts
SELECT * FROM stock_alerts 
WHERE is_active = true 
ORDER BY created_at DESC;
```

### 2. چک کنید symbol درست است:
```bash
# باید uppercase باشد (مثلا AAPL نه aapl)
```

### 3. چک کنید price source کار می‌کند:
```bash
curl "https://financialmodelingprep.com/api/v3/quote-short/AAPL?apikey=YOUR_FMP_KEY"
```

### 4. چک کنید ایمیل config درست است:
```bash
# در .env.local:
RESEND_API_KEY=re_...
EMAIL_FROM=noreply@yourdomain.com
```

### 5. چک کنید cron log:
```bash
# در Vercel Dashboard > Logs
# یا در terminal:
vercel logs --since 1h
```

## ✨ مثال ساخت Portfolio Alert

```typescript
// POST /api/portfolio/{portfolioId}/alerts
{
  "symbol": "AAPL",
  "alertType": "price_above",
  "conditionValue": "180.00",
  "message": "AAPL reached target price",
  "isEmailEnabled": true,
  "isPushEnabled": false
}
```

## 🚀 بعد از تست

- ✅ Alert در database ساخته شد
- ✅ Cron job هر 5 دقیقه اجرا می‌شود
- ✅ قیمت فعلی fetch می‌شود
- ✅ شرط alert چک می‌شود
- ✅ اگر trigger شد، ایمیل ارسال می‌شود
- ✅ alert بروز می‌شود
