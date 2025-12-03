# 🔔 راهنمای کامل Push Notifications

## ✅ چه چیزهایی اضافه شد؟

### 1. Database Schema
- ✅ جدول `push_subscriptions` برای ذخیره subscriptions کاربران
- ✅ فیلدها: endpoint, p256dh, auth, user_agent, is_active

### 2. Backend APIs
- ✅ `/api/notifications/subscribe` - Subscribe & Unsubscribe
- ✅ `/api/notifications/test` - تست push notification
- ✅ Helper function `sendPushNotification()` در `/lib/notifications/push.ts`

### 3. Frontend Component
- ✅ `PushNotificationManager` - کامپوننت React برای enable/disable notifications

### 4. Cron Integration
- ✅ cron job `/api/cron/check-alerts` حالا push notification هم می‌فرستد
- ✅ هم برای stock alerts و هم portfolio alerts

## 🔧 تنظیمات اولیه

### گام 1: نصب پکیج web-push

```bash
npm install web-push
```

### گام 2: Generate VAPID Keys

```bash
npx web-push generate-vapid-keys
```

خروجی شبیه این خواهد بود:
```
=======================================
Public Key:
BEl62iUYgUivxIkv69yViEuiBIa-Ib27SRuu2kFi...

Private Key:
p2flAcbzj31Lz7WwFPxJ7qOxT_7lQYKb5r...
=======================================
```

### گام 3: اضافه کردن به Environment Variables

در فایل `.env.local`:
```bash
# VAPID Keys for Web Push Notifications
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BEl62iUYgUivxIkv69yViEuiBIa-Ib27SRuu2kFi..."
VAPID_PRIVATE_KEY="p2flAcbzj31Lz7WwFPxJ7qOxT_7lQYKb5r..."
VAPID_EMAIL="admin@yourdomain.com"
```

⚠️ **مهم**: فقط `NEXT_PUBLIC_VAPID_PUBLIC_KEY` را public کنید، `VAPID_PRIVATE_KEY` را هرگز در client expose نکنید!

### گام 4: اجرای Migration

```bash
# اجرای migration برای ساخت جدول push_subscriptions
npm run db:push
# یا
npx drizzle-kit push:pg
```

## 🧪 نحوه تست

### روش 1: تست در داشبورد

1. **اضافه کردن کامپوننت به صفحه Settings**

```tsx
// src/app/dashboard/settings/page.tsx
import { PushNotificationManager } from '@/components/notifications/PushNotificationManager'

export default function SettingsPage() {
  return (
    <div>
      {/* ... other settings ... */}
      
      <PushNotificationManager />
    </div>
  )
}
```

2. **باز کردن صفحه settings در مرورگر**
   - برو به `/dashboard/settings`

3. **کلیک روی "Enable Notifications"**
   - مرورگر permission می‌خواهد → Allow بزن
   - subscription در database ذخیره می‌شود

4. **تست با Test API**
   ```bash
   curl -X POST http://localhost:3000/api/notifications/test \
     -H "Authorization: Bearer YOUR_SESSION_TOKEN"
   ```

### روش 2: تست با DevTools Console

1. باز کردن Chrome DevTools (F12)
2. رفتن به Console tab
3. اجرای این کد:

```javascript
// درخواست permission
Notification.requestPermission().then(permission => {
  console.log('Permission:', permission)
  
  if (permission === 'granted') {
    // Get service worker registration
    navigator.serviceWorker.ready.then(registration => {
      // Subscribe
      const vapidPublicKey = 'YOUR_VAPID_PUBLIC_KEY'
      
      function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4)
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
        const rawData = window.atob(base64)
        const outputArray = new Uint8Array(rawData.length)
        for (let i = 0; i < rawData.length; ++i) {
          outputArray[i] = rawData.charCodeAt(i)
        }
        return outputArray
      }
      
      registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      }).then(subscription => {
        console.log('Subscribed:', subscription)
        
        // Save to server
        fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subscription })
        }).then(res => res.json()).then(data => {
          console.log('Server response:', data)
        })
      })
    })
  }
})
```

### روش 3: تست Push Notification به صورت دستی

```bash
# ارسال تست notification
curl -X POST http://localhost:3000/api/notifications/test \
  -H "Content-Type: application/json" \
  -H "Cookie: __session=YOUR_SESSION_COOKIE"
```

### روش 4: تست Cron Job کامل

1. **ساخت یک alert در portfolio**
   ```bash
   curl -X POST http://localhost:3000/api/portfolio/YOUR_PORTFOLIO_ID/alerts \
     -H "Content-Type: application/json" \
     -H "Cookie: __session=YOUR_SESSION" \
     -d '{
       "symbol": "AAPL",
       "alertType": "price_above",
       "conditionValue": "180.00",
       "isEmailEnabled": true,
       "isPushEnabled": true
     }'
   ```

2. **اجرای manual cron**
   ```bash
   curl http://localhost:3000/api/cron/check-alerts
   ```

3. **چک کردن نتیجه**
   - اگر شرط برقرار باشد، هم email و هم push notification ارسال می‌شود

## 📱 تست در مرورگرهای مختلف

### Chrome/Edge
✅ پشتیبانی کامل
- Desktop: ✅
- Mobile: ✅

### Firefox
✅ پشتیبانی کامل
- Desktop: ✅
- Mobile: ⚠️ نیاز به تنظیمات خاص

### Safari
⚠️ پشتیبانی محدود
- Desktop (macOS 13+): ✅ (نیاز به Apple Push Notification service)
- Mobile: ❌ فعلا پشتیبانی نمی‌کند

### تست در Mobile

1. **Android (Chrome/Firefox)**
   - باز کردن سایت در mobile browser
   - Add to Home Screen
   - باز کردن به عنوان PWA
   - Enable notifications

2. **iOS (Safari)**
   - فعلا web push در iOS Safari پشتیبانی نمی‌شود
   - می‌توانید از native app استفاده کنید

## 🔍 دیباگ مشکلات

### مشکل 1: VAPID keys کار نمی‌کند
```bash
# چک کردن environment variables
echo $NEXT_PUBLIC_VAPID_PUBLIC_KEY
echo $VAPID_PRIVATE_KEY

# Restart dev server
npm run dev
```

### مشکل 2: Notification نمیاد
1. چک کردن browser permissions:
   - Chrome: `chrome://settings/content/notifications`
   - Firefox: `about:preferences#privacy`

2. چک کردن service worker:
   ```javascript
   // در console
   navigator.serviceWorker.getRegistrations().then(regs => {
     console.log('SW Registrations:', regs)
   })
   ```

3. چک کردن subscription در database:
   ```sql
   SELECT * FROM push_subscriptions 
   WHERE user_id = 'YOUR_USER_ID' 
   AND is_active = true;
   ```

### مشکل 3: Error 410 (Gone)
این یعنی subscription منقضی شده. کد ما خودکار آن را deactivate می‌کند.  
کاربر باید دوباره subscribe کند.

## 📊 مثال Response از Test API

### موفق:
```json
{
  "success": true,
  "message": "Test notification sent successfully!",
  "sent": 2,
  "failed": 0
}
```

### بدون subscription:
```json
{
  "success": false,
  "message": "No active push subscriptions found. Please subscribe to push notifications first."
}
```

## 🚀 Deploy به Production

### Vercel

1. اضافه کردن environment variables در Vercel Dashboard:
   ```
   NEXT_PUBLIC_VAPID_PUBLIC_KEY
   VAPID_PRIVATE_KEY
   VAPID_EMAIL
   ```

2. Redeploy:
   ```bash
   git push origin main
   ```

### توجه: HTTPS الزامی است!
Push notifications فقط روی HTTPS کار می‌کند (به جز localhost).

## 🎯 بهترین شیوه‌ها (Best Practices)

### 1. Rate Limiting
```typescript
// محدود کردن تعداد notifications در روز
// TODO: اضافه کردن rate limit به sendPushNotification
```

### 2. Batch Notifications
```typescript
// برای ارسال به کاربران متعدد از batch استفاده کنید
sendPushNotificationToUsers(['user1', 'user2'], payload)
```

### 3. Error Handling
کد ما خودکار subscriptions منقضی را deactivate می‌کند.

### 4. User Preferences
کاربر می‌تواند برای هر alert مشخص کند:
- `isEmailEnabled`: دریافت email
- `isPushEnabled`: دریافت push notification

## 📝 Checklist تست نهایی

- [ ] VAPID keys generate شده
- [ ] Environment variables تنظیم شده
- [ ] Migration اجرا شده
- [ ] `npm install web-push` اجرا شده
- [ ] کامپوننت `PushNotificationManager` به UI اضافه شده
- [ ] در مرورگر permission داده شده
- [ ] Test API موفق (`/api/notifications/test`)
- [ ] Alert ساخته شده با `isPushEnabled: true`
- [ ] Cron job اجرا شده و notification ارسال شده
- [ ] Notification در مرورگر نمایش داده شده

## 🎉 موفق شدید!

حالا سیستم push notification شما کامل کار می‌کند:
- ✅ Stock alerts → Push + Email
- ✅ Portfolio alerts → Push + Email (قابل تنظیم)
- ✅ Test endpoint برای تست سریع
- ✅ Auto cleanup برای expired subscriptions
