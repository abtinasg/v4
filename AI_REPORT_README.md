# AI Stock Report Generator - راهنمای نصب و استفاده

## ویژگی‌های اصلی

این قابلیت به کاربران Pro اجازه می‌دهد گزارش‌های سرمایه‌گذاری حرفه‌ای و جامع برای هر سهام دریافت کنند.

### قابلیت‌ها:

✅ **تحلیل AI توسط Claude Sonnet 4.5**: استفاده از پیشرفته‌ترین مدل AI برای تولید گزارش  
✅ **تحلیل سطح CFA**: گزارش‌ها با استانداردهای CFA Institute تهیه می‌شوند  
✅ **استفاده از 190+ متریک سطح نهادی**: تحلیل کامل با تمام داده‌های مالی موجود  
✅ **خروجی PDF حرفه‌ای**: فرمت استاندارد برای ارائه در کمیته‌های سرمایه‌گذاری  
✅ **بدون نیاز به تنظیمات پیچیده**: رابط کاربری ساده و سریع  

---

## نصب و راه‌اندازی

### 1. نصب پکیج‌ها

پکیج‌های زیر قبلاً نصب شده‌اند:

```bash
npm install jspdf marked @types/marked
```

### 2. تنظیم OpenRouter API

برای استفاده از این قابلیت، نیاز به کلید API از OpenRouter دارید:

#### مرحله 1: دریافت کلید API

1. به [OpenRouter.ai](https://openrouter.ai/) بروید
2. ثبت نام کنید یا وارد شوید
3. به بخش [Keys](https://openrouter.ai/keys) بروید
4. یک کلید API جدید ایجاد کنید
5. کلید را کپی کنید (با پیشوند `sk-or-v1-...`)

#### مرحله 2: افزودن به متغیرهای محیطی

فایل `.env.local` را ویرایش کنید و خط زیر را اضافه کنید:

```bash
# AI Services
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here
```

⚠️ **مهم**: هرگز کلید API خود را در گیت commit نکنید!

#### مرحله 3: راه‌اندازی مجدد سرور

```bash
npm run dev
```

---

## نحوه استفاده

### برای کاربران:

1. به صفحه تحلیل سهام بروید: `/dashboard/stock-analysis/[SYMBOL]`
2. پایین چارت قیمت، بخش "AI Investment Report" را خواهید دید
3. روی دکمه **"Generate Investment Report"** کلیک کنید
4. منتظر بمانید (30-60 ثانیه)
5. فایل PDF به صورت خودکار دانلود می‌شود

### برای توسعه‌دهندگان:

#### API Endpoint

```typescript
POST /api/stock/[symbol]/report

// Request Body (اختیاری)
{
  "reportType": "full" | "summary" | "deep-dive",
  "includeCharts": true
}

// Response
{
  "success": true,
  "symbol": "AAPL",
  "companyName": "Apple Inc.",
  "generatedAt": "2025-11-29T12:00:00Z",
  "report": "# INVESTMENT RESEARCH REPORT\n\n...",
  "metadata": {
    "reportType": "full",
    "includeCharts": true
  }
}
```

#### استفاده از کامپوننت

```tsx
import { StockReportGenerator } from '@/components/stock';

<StockReportGenerator 
  symbol="AAPL" 
  companyName="Apple Inc." 
/>
```

---

## ساختار گزارش

گزارش‌های تولید شده شامل بخش‌های زیر هستند:

### 1. **Executive Summary**
- خلاصه کسب‌وکار
- نقاط قوت و ضعف (Bull & Bear Case)
- متریک‌های کلیدی
- سطح ریسک

### 2. **Business Analysis**
- تحلیل رقابتی
- موقعیت در صنعت
- کیفیت کسب‌وکار
- ارزیابی مدیریت

### 3. **Financial Performance**
- تحلیل سودآوری
- رشد تاریخی
- کارایی عملیاتی
- تولید جریان نقدی

### 4. **Valuation Analysis**
- ارزش‌گذاری مبتنی بر مضرب‌ها (P/E, P/B, EV/EBITDA)
- تحلیل DCF
- مقایسه نسبی با صنعت
- برآورد ارزش منصفانه

### 5. **Risk Assessment**
- ریسک‌های مالی (اهرم، نقدینگی)
- ریسک‌های کسب‌وکار
- ریسک‌های بازار (بتا، نوسان)
- ملاحظات ESG

### 6. **Technical & Momentum**
- روندهای قیمت
- تحلیل حجم معاملات
- سطوح حمایت/مقاومت
- اندیکاتورهای تکنیکال

### 7. **Macro & Sector Context**
- تأثیر اقتصاد کلان
- چشم‌انداز صنعت
- مقایسه با رقبا

### 8. **Investment Conclusion**
- جمع‌بندی تحلیل
- کاتالیست‌ها و ریسک‌های کلیدی
- تحلیل سناریو
- مناسبت برای پورتفولیو

---

## هزینه‌ها و محدودیت‌ها

### هزینه OpenRouter:

- **Claude Sonnet 4.5**: حدود $3 per million input tokens
- هر گزارش: تقریباً 30,000-50,000 tokens
- **هزینه تقریبی هر گزارش**: $0.09 - $0.15

### محدودیت‌های پیشنهادی:

```typescript
// برای کاربران Free: 0 گزارش در ماه
// برای کاربران Pro: 10 گزارش در ماه
// برای کاربران Enterprise: Unlimited

// می‌توانید rate limiting اضافه کنید:
const DAILY_LIMIT = {
  free: 0,
  pro: 2,
  enterprise: 50
};
```

---

## عیب‌یابی

### خطای "OpenRouter API key not configured"

```bash
# بررسی کنید که کلید API را اضافه کرده‌اید:
grep OPENROUTER_API_KEY .env.local

# اگر خالی است، اضافه کنید:
echo "OPENROUTER_API_KEY=sk-or-v1-your-key" >> .env.local

# سرور را راه‌اندازی مجدد کنید
npm run dev
```

### خطای "Failed to generate report"

1. لاگ‌های سرور را بررسی کنید
2. اطمینان حاصل کنید که endpoint `/api/stock/[symbol]/metrics` کار می‌کند
3. بررسی کنید که سهام معتبر است
4. Balance API خود را در OpenRouter چک کنید

### PDF خالی یا ناقص

این معمولاً به دلیل مشکل در پاسخ AI است:
- بررسی کنید response حاوی markdown است
- لاگ کنسول مرورگر را چک کنید
- از browser developer tools استفاده کنید

---

## بهبودهای آینده

### پیشنهادات برای توسعه:

1. **چارت‌ها در PDF**: افزودن نمودارهای واقعی به PDF
2. **قالب‌های مختلف**: HTML, Word, Excel
3. **سفارشی‌سازی گزارش**: انتخاب بخش‌های مورد نظر
4. **زبان‌های مختلف**: پشتیبانی از فارسی، عربی، و...
5. **Bulk Generation**: تولید گزارش برای چندین سهام همزمان
6. **Historical Reports**: ذخیره و مقایسه گزارش‌های قبلی

---

## امنیت

### نکات امنیتی مهم:

✅ کلید API فقط در server-side استفاده می‌شود  
✅ هرگز در client-side expose نمی‌شود  
✅ Rate limiting برای جلوگیری از abuse  
✅ Authentication check (فقط کاربران Pro)  
✅ Input validation برای symbol  

---

## پشتیبانی

در صورت بروز مشکل:

1. Issue در GitHub باز کنید
2. لاگ‌های خطا را ضمیمه کنید
3. اطلاعات محیط را ذکر کنید (OS, browser, Node version)

---

## مجوز

این feature بخشی از پروژه Deep Terminal است و تحت همان مجوز قرار دارد.

**توسعه‌دهنده**: Deep Terminal Team  
**تاریخ ایجاد**: نوامبر 2025  
**آخرین بروزرسانی**: نوامبر 2025
