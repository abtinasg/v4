# 🎯 خلاصه تغییرات - Push Notifications & Portfolio Alerts

## ✅ مشکل اصلی که رفع شد

### قبل:
- ❌ Cron job فقط `stockAlerts` را چک می‌کرد
- ❌ `portfolioAlerts` نادیده گرفته می‌شد
- ❌ Push notification اصلا کار نمی‌کرد

### بعد:
- ✅ Cron job هر دو نوع alert را چک می‌کند
- ✅ Portfolio alerts کامل پشتیبانی می‌شود
- ✅ سیستم کامل push notification اضافه شد

---

## 📦 فایل‌های جدید

### Database
- `drizzle/0005_push_subscriptions.sql` - Migration جدید
- `src/lib/db/schema.ts` - اضافه شدن `pushSubscriptions` table

### API Endpoints
- `src/app/api/notifications/subscribe/route.ts` - Subscribe/Unsubscribe
- `src/app/api/notifications/test/route.ts` - تست push notification

### Libraries
- `src/lib/notifications/push.ts` - Helper برای ارسال push notifications

### Components
- `src/components/notifications/PushNotificationManager.tsx` - کامپوننت React

### Documentation
- `TEST_CRON_ALERTS.md` - راهنمای تست cron alerts
- `PUSH_NOTIFICATIONS_GUIDE.md` - راهنمای کامل push notifications

---

## 🔄 فایل‌های ویرایش شده

### 1. `src/app/api/cron/check-alerts/route.ts`
**تغییرات:**
- ✅ Import `portfolioAlerts` از schema
- ✅ Import `sendPushNotification` از helper
- ✅ تابع `checkPortfolioAlertCondition()` اضافه شد
- ✅ تابع `formatPortfolioCondition()` اضافه شد
- ✅ بخش جدید برای پردازش portfolio alerts
- ✅ ارسال push notification در کنار email

### 2. `src/lib/db/schema.ts`
**تغییرات:**
- ✅ جدول `pushSubscriptions` اضافه شد
- ✅ Relations برای users اضافه شد
- ✅ Type exports برای `PushSubscription`

### 3. `CRON_JOBS.md`
**تغییرات:**
- ✅ مستندات به‌روزرسانی شد برای portfolio alerts
- ✅ توضیح تفاوت stock alerts vs portfolio alerts

---

## 🚀 مراحل راه‌اندازی

### گام 1: نصب Dependencies
```bash
npm install web-push
```

### گام 2: Generate VAPID Keys
```bash
npx web-push generate-vapid-keys
```

### گام 3: اضافه کردن به `.env.local`
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BEl62iUYgUivxIkv..."
VAPID_PRIVATE_KEY="p2flAcbzj31Lz7W..."
VAPID_EMAIL="admin@yourdomain.com"
```

### گام 4: اجرای Migration
```bash
npm run db:push
```

### گام 5: اضافه کردن کامپوننت به UI
```tsx
// در هر صفحه که می‌خواهید (مثلا settings)
import { PushNotificationManager } from '@/components/notifications/PushNotificationManager'

<PushNotificationManager />
```

---

## 🧪 نحوه تست سریع

### 1. تست Cron Alerts (هر دو نوع)
```bash
curl http://localhost:3000/api/cron/check-alerts
```

**پاسخ مورد انتظار:**
```json
{
  "success": true,
  "results": {
    "stockAlerts": { "checked": 5, "triggered": 2, "emailsSent": 2 },
    "portfolioAlerts": { "checked": 3, "triggered": 1, "emailsSent": 1 },
    "errors": []
  },
  "duration": 2450
}
```

### 2. تست Push Notification
```bash
curl -X POST http://localhost:3000/api/notifications/test
```

**پاسخ مورد انتظار:**
```json
{
  "success": true,
  "message": "Test notification sent successfully!",
  "sent": 1,
  "failed": 0
}
```

---

## 📊 تفاوت Stock Alerts vs Portfolio Alerts

| ویژگی | Stock Alerts | Portfolio Alerts |
|------|-------------|------------------|
| جدول | `stock_alerts` | `portfolio_alerts` |
| شرایط | above, below, crosses_above, crosses_below | price_above, price_below, percent_change, portfolio_value, daily_gain_loss, news |
| بعد از trigger | غیرفعال می‌شود (`isActive = false`) | فعال می‌ماند (recurring) |
| تاریخ trigger | `triggeredAt` | `lastTriggeredAt` + `triggerCount` |
| کنترل email | همیشه ارسال می‌شود | `isEmailEnabled` |
| کنترل push | همیشه ارسال می‌شود | `isPushEnabled` |

---

## 🔔 جریان کامل Push Notification

### Client Side:
1. کاربر روی "Enable Notifications" کلیک می‌کند
2. مرورگر permission می‌خواهد
3. Service Worker subscribe می‌شود
4. Subscription به سرور ارسال می‌شود
5. ذخیره در جدول `push_subscriptions`

### Server Side (Cron):
1. هر 5 دقیقه cron اجرا می‌شود
2. قیمت فعلی سهام fetch می‌شود
3. شرایط alerts چک می‌شود
4. اگر trigger شد:
   - ✉️ Email ارسال می‌شود (اگر فعال باشد)
   - 🔔 Push notification ارسال می‌شود (اگر فعال باشد)
   - 💾 Database به‌روزرسانی می‌شود

---

## ⚠️ نکات مهم

### 1. HTTPS الزامی است
Push notifications فقط روی HTTPS کار می‌کند (به جز localhost).

### 2. Browser Support
- ✅ Chrome/Edge: کامل
- ✅ Firefox: کامل
- ⚠️ Safari: محدود (macOS 13+)
- ❌ iOS Safari: پشتیبانی نمی‌کند

### 3. Service Worker
Service Worker باید ثبت باشد (در `layout.tsx` انجام شده).

### 4. VAPID Keys
- Public key: در client استفاده می‌شود
- Private key: فقط در server (هرگز در client expose نکنید)

---

## 🎯 چک‌لیست نهایی

برای اطمینان از کار کردن کامل سیستم:

- [ ] `npm install web-push` اجرا شده
- [ ] VAPID keys generate شده
- [ ] Environment variables تنظیم شده
- [ ] Migration اجرا شده (`npm run db:push`)
- [ ] Dev server restart شده
- [ ] کامپوننت به UI اضافه شده
- [ ] در مرورگر permission داده شده
- [ ] Test API موفق بوده (`/api/notifications/test`)
- [ ] Portfolio alert ساخته شده
- [ ] Cron job test شده (`/api/cron/check-alerts`)

---

## 📖 مستندات بیشتر

برای جزئیات کامل، به این فایل‌ها مراجعه کنید:
- `PUSH_NOTIFICATIONS_GUIDE.md` - راهنمای کامل push notifications
- `TEST_CRON_ALERTS.md` - راهنمای تست alerts
- `CRON_JOBS.md` - مستندات cron jobs

---

## 🎉 تبریک!

سیستم شما حالا:
- ✅ Stock alerts را چک می‌کند
- ✅ Portfolio alerts را چک می‌کند
- ✅ Email notifications ارسال می‌کند
- ✅ Push notifications ارسال می‌کند
- ✅ سرویس خارجی cron پشتیبانی می‌کند
- ✅ کاملا قابل تست است
