# 📊 مستند نحوه محاسبه داده‌ها و متریک‌ها
# Deep Terminal - Data & Metrics Documentation

این مستند توضیحات کاملی از منابع داده، فرمول‌های محاسباتی و نحوه نمایش تمام متریک‌های مالی در اپلیکیشن ارائه می‌دهد.

---

## 📡 منابع داده (Data Sources)

### 1. Yahoo Finance API (`yahoo-finance2`)
**کاربرد:** داده‌های اصلی سهام، صورت‌های مالی، قیمت‌ها

| داده | توضیحات |
|------|---------|
| قیمت سهام | قیمت لحظه‌ای، باز، بسته، بالا، پایین |
| حجم معاملات | حجم روزانه و میانگین حجم |
| صورت سود و زیان | درآمد، سود ناخالص، سود عملیاتی، سود خالص |
| ترازنامه | دارایی‌ها، بدهی‌ها، حقوق صاحبان سهام |
| صورت جریان وجوه نقد | جریان نقدی عملیاتی، سرمایه‌گذاری، تأمین مالی |
| تاریخچه قیمت | داده‌های قیمتی ۱-۳ ساله برای محاسبات تکنیکال |
| اطلاعات سهام | نماد، نام شرکت، صنعت، بخش |

### 2. FRED API (Federal Reserve Economic Data)
**کاربرد:** شاخص‌های کلان اقتصادی

| شاخص | کد FRED | توضیحات |
|------|---------|---------|
| نرخ رشد GDP | A191RL1Q225SBEA | نرخ رشد سالانه تولید ناخالص داخلی |
| GDP واقعی | GDPC1 | تولید ناخالص داخلی تعدیل شده با تورم |
| GDP اسمی | GDP | تولید ناخالص داخلی به قیمت‌های جاری |
| GDP سرانه | A939RX0Q048SBEA | GDP واقعی تقسیم بر جمعیت |
| شاخص قیمت مصرف‌کننده | CPIAUCSL | میانگین تغییر قیمت‌ها (تورم) |
| شاخص قیمت تولیدکننده | PPIACO | تغییر قیمت در سطح تولید |
| تورم هسته‌ای | CPILFESL | CPI بدون غذا و انرژی |
| نرخ بهره فدرال | FEDFUNDS | نرخ بهره بانک مرکزی |
| بازده اوراق ۱۰ ساله | DGS10 | نرخ بدون ریسک (Risk-free Rate) |
| شاخص دلار | DTWEXBGS | ارزش تجاری دلار آمریکا |
| نرخ بیکاری | UNRATE | درصد نیروی کار بیکار |
| رشد دستمزد | CES0500000003 | میانگین درآمد ساعتی |
| بهره‌وری نیروی کار | OPHNFB | تولید به ازای هر ساعت کار |
| اعتماد مصرف‌کننده | UMCSENT | شاخص دانشگاه میشیگان |
| اعتماد کسب‌وکار | BSCICP03USM665S | شاخص OECD |

### 3. Financial Modeling Prep API (FMP)
**کاربرد:** داده‌های صنعت و بخش

- عملکرد بخش‌های ۱۱‌گانه بازار
- میانگین‌های صنعت برای مقایسه
- داده‌های سکتور هیت‌مپ

---

## 📈 دسته‌بندی متریک‌ها (15 دسته، 170+ متریک)

---

## 1️⃣ متریک‌های ارزش‌گذاری (Valuation Metrics)
**فایل:** `lib/metrics/valuation.ts`

### P/E Ratio (نسبت قیمت به درآمد)
```
فرمول: P/E = Price / EPS (Earnings Per Share)
```
**تفسیر:**
- کمتر از ۱۵: ارزان (احتمالاً undervalued)
- ۱۵-۲۵: معقول
- بیشتر از ۲۵: گران (احتمالاً overvalued)

### Forward P/E (نسبت قیمت به درآمد پیش‌بینی)
```
فرمول: Forward P/E = Price / Forward EPS
```
از EPS پیش‌بینی شده تحلیلگران استفاده می‌کند.

### Justified P/E (نسبت P/E توجیه شده)
```
فرمول: Justified P/E = (1 - b) × (1 + g) / (r - g)
```
- `b` = نرخ نگهداری سود (Retention Ratio)
- `g` = نرخ رشد پایدار
- `r` = نرخ بازده مورد انتظار

### P/B Ratio (نسبت قیمت به ارزش دفتری)
```
فرمول: P/B = Price / Book Value per Share
Book Value per Share = Total Equity / Shares Outstanding
```

### P/S Ratio (نسبت قیمت به فروش)
```
فرمول: P/S = Market Cap / Revenue
```

### P/CF Ratio (نسبت قیمت به جریان نقدی)
```
فرمول: P/CF = Price / Operating Cash Flow per Share
```

### Enterprise Value (ارزش شرکت)
```
فرمول: EV = Market Cap + Total Debt - Cash
```

### EV/EBITDA
```
فرمول: EV/EBITDA = Enterprise Value / EBITDA
```
**تفسیر:**
- کمتر از ۱۰: ارزان
- ۱۰-۱۵: معقول
- بیشتر از ۱۵: گران

### EV/Sales
```
فرمول: EV/Sales = Enterprise Value / Revenue
```

### EV/EBIT
```
فرمول: EV/EBIT = Enterprise Value / EBIT
```

### Dividend Yield (بازده سود تقسیمی)
```
فرمول: Dividend Yield = Annual Dividends per Share / Price
```

### PEG Ratio
```
فرمول: PEG = P/E / EPS Growth Rate
```
**تفسیر:**
- کمتر از ۱: ارزان نسبت به رشد
- برابر ۱: قیمت‌گذاری منصفانه
- بیشتر از ۱: گران نسبت به رشد

### Earnings Yield (بازده سود)
```
فرمول: Earnings Yield = EPS / Price (معکوس P/E)
```

---

## 2️⃣ متریک‌های سودآوری (Profitability Metrics)
**فایل:** `lib/metrics/profitability.ts`

### Gross Profit Margin (حاشیه سود ناخالص)
```
فرمول: Gross Profit Margin = Gross Profit / Revenue
Gross Profit = Revenue - COGS
```
**تفسیر:**
- بالای ۴۰%: عالی ✅
- ۲۰-۴۰%: متوسط
- زیر ۲۰%: ضعیف ❌

### Operating Profit Margin (حاشیه سود عملیاتی)
```
فرمول: Operating Margin = Operating Income / Revenue
```
**تفسیر:**
- بالای ۱۵%: عالی ✅
- ۵-۱۵%: متوسط
- زیر ۵%: ضعیف ❌

### EBITDA Margin
```
فرمول: EBITDA Margin = EBITDA / Revenue
EBITDA = Earnings Before Interest, Taxes, Depreciation, Amortization
```

### Net Profit Margin (حاشیه سود خالص)
```
فرمول: Net Profit Margin = Net Income / Revenue
```

### ROA (بازده دارایی‌ها)
```
فرمول: ROA = Net Income / Total Assets
```

### ROE (بازده حقوق صاحبان سهام)
```
فرمول: ROE = Net Income / Total Equity
```
**تفسیر:**
- بالای ۱۵%: عالی ✅
- ۱۰-۱۵%: خوب
- زیر ۱۰%: ضعیف ❌

### ROIC (بازده سرمایه سرمایه‌گذاری شده)
```
فرمول: ROIC = NOPLAT / Invested Capital
Invested Capital = Total Debt + Total Equity - Cash
```

### NOPLAT
```
فرمول: NOPLAT = EBIT × (1 - Tax Rate)
```
سود عملیاتی خالص پس از مالیات

---

## 3️⃣ متریک‌های رشد (Growth Metrics)
**فایل:** `lib/metrics/growth.ts`

### Revenue Growth YoY (رشد درآمد سالانه)
```
فرمول: Revenue Growth = (Revenue₁ - Revenue₀) / Revenue₀
```

### EPS Growth YoY (رشد EPS سالانه)
```
فرمول: EPS Growth = (EPS₁ - EPS₀) / EPS₀
```

### DPS Growth (رشد سود تقسیمی)
```
فرمول: DPS Growth = (DPS₁ - DPS₀) / DPS₀
```

### FCF Growth (رشد جریان نقدی آزاد)
```
فرمول: FCF Growth = (FCF₁ - FCF₀) / FCF₀
```

### 3-Year Revenue CAGR
```
فرمول: CAGR = (End Value / Start Value)^(1/3) - 1
```
نرخ رشد مرکب سالانه درآمد در ۳ سال

### 5-Year Revenue CAGR
```
فرمول: CAGR = (End Value / Start Value)^(1/5) - 1
```

### Sustainable Growth Rate (نرخ رشد پایدار)
```
فرمول: SGR = ROE × Retention Ratio
Retention Ratio = 1 - Payout Ratio
```
حداکثر رشدی که شرکت بدون تأمین مالی خارجی می‌تواند داشته باشد.

### Retention Ratio (نرخ نگهداری سود)
```
فرمول: Retention Ratio = 1 - Payout Ratio
```

### Payout Ratio (نرخ توزیع سود)
```
فرمول: Payout Ratio = Dividends / Net Income
```

---

## 4️⃣ متریک‌های نقدینگی (Liquidity Metrics)
**فایل:** `lib/metrics/liquidity.ts`

### Current Ratio (نسبت جاری)
```
فرمول: Current Ratio = Current Assets / Current Liabilities
```
**تفسیر:**
- بالای ۲: عالی ✅
- ۱-۲: قابل قبول
- زیر ۱: ریسک نقدینگی ❌

### Quick Ratio (نسبت آنی)
```
فرمول: Quick Ratio = (Current Assets - Inventory) / Current Liabilities
```
محافظه‌کارانه‌تر از Current Ratio

### Cash Ratio (نسبت نقدی)
```
فرمول: Cash Ratio = Cash / Current Liabilities
```
محافظه‌کارانه‌ترین نسبت نقدینگی

### Days Sales Outstanding - DSO (دوره وصول مطالبات)
```
فرمول: DSO = (Receivables / Revenue) × 365
```
میانگین روزهای لازم برای وصول مطالبات

### Days Inventory Outstanding - DIO (دوره نگهداری موجودی)
```
فرمول: DIO = (Inventory / COGS) × 365
```

### Days Payables Outstanding - DPO (دوره پرداخت بدهی)
```
فرمول: DPO = (Payables / COGS) × 365
```

### Cash Conversion Cycle - CCC (چرخه تبدیل نقد)
```
فرمول: CCC = DSO + DIO - DPO
```
**تفسیر:** کمتر بهتر است - نشان‌دهنده سرعت تبدیل موجودی به نقد

---

## 5️⃣ متریک‌های اهرم/توان پرداخت (Leverage Metrics)
**فایل:** `lib/metrics/leverage.ts`

### Debt-to-Assets (نسبت بدهی به دارایی)
```
فرمول: D/A = Total Debt / Total Assets
```
**تفسیر:**
- زیر ۰.۳: کم‌ریسک ✅
- ۰.۳-۰.۶: متوسط
- بالای ۰.۶: پرریسک ❌

### Debt-to-Equity (نسبت بدهی به حقوق صاحبان سهام)
```
فرمول: D/E = Total Debt / Total Equity
```
**تفسیر:**
- زیر ۱: محافظه‌کارانه ✅
- ۱-۲: متوسط
- بالای ۲: اهرم بالا ❌

### Financial Debt-to-Equity
```
فرمول: (Short-term Debt + Long-term Debt) / Total Equity
```

### Interest Coverage (پوشش بهره)
```
فرمول: Interest Coverage = EBIT / Interest Expense
```
**تفسیر:**
- بالای ۵: عالی ✅
- ۲-۵: قابل قبول
- زیر ۱.۵: ریسک‌دار ❌

### Debt Service Coverage Ratio - DSCR
```
فرمول: DSCR = Operating Income / (Interest + Short-term Debt)
```

### Equity Multiplier (ضریب حقوق صاحبان سهام)
```
فرمول: Equity Multiplier = Total Assets / Total Equity
```
جزء تحلیل دوپان: ROE = ROA × Equity Multiplier

### Debt-to-EBITDA
```
فرمول: Debt/EBITDA = Total Debt / EBITDA
```
**تفسیر:**
- زیر ۳: سالم ✅
- ۳-۴: متوسط
- بالای ۴: اهرم بالا ❌

---

## 6️⃣ متریک‌های کارایی (Efficiency Metrics)
**فایل:** `lib/metrics/efficiency.ts`

### Total Asset Turnover (گردش کل دارایی‌ها)
```
فرمول: Asset Turnover = Revenue / Total Assets
```

### Fixed Asset Turnover (گردش دارایی‌های ثابت)
```
فرمول: Fixed Asset Turnover = Revenue / Fixed Assets
```

### Inventory Turnover (گردش موجودی)
```
فرمول: Inventory Turnover = COGS / Inventory
```
بالاتر بهتر - نشان‌دهنده فروش سریع‌تر

### Receivables Turnover (گردش مطالبات)
```
فرمول: Receivables Turnover = Revenue / Receivables
```

### Payables Turnover (گردش پرداختنی‌ها)
```
فرمول: Payables Turnover = COGS / Payables
```

### Working Capital Turnover (گردش سرمایه در گردش)
```
فرمول: WC Turnover = Revenue / Working Capital
Working Capital = Current Assets - Current Liabilities
```

---

## 7️⃣ متریک‌های جریان نقدی (Cash Flow Metrics)
**فایل:** `lib/metrics/cashflow.ts`

### Operating Cash Flow - OCF (جریان نقدی عملیاتی)
نقدی حاصل از فعالیت‌های اصلی کسب‌وکار

### Investing Cash Flow (جریان نقدی سرمایه‌گذاری)
نقدی مصرف شده برای سرمایه‌گذاری (معمولاً منفی)

### Financing Cash Flow (جریان نقدی تأمین مالی)
نقدی از/به فعالیت‌های تأمین مالی

### Free Cash Flow - FCF (جریان نقدی آزاد)
```
فرمول: FCF = Operating Cash Flow - CapEx
```
مهم‌ترین متریک نقدی برای ارزش‌گذاری

### FCFF (جریان نقدی آزاد به شرکت)
```
فرمول: FCFF = EBIT(1-t) + D&A - CapEx - ΔNWC
ساده شده: FCFF ≈ FCF + Interest(1-t)
```
نقدی در دسترس همه سرمایه‌گذاران (بدهی + سهام)

### FCFE (جریان نقدی آزاد به سهامداران)
```
فرمول: FCFE = FCFF - Interest(1-t) + Net Borrowing
```
نقدی در دسترس فقط سهامداران

### Cash Flow Adequacy (کفایت جریان نقدی)
```
فرمول: CFA = OCF / (CapEx + Debt Repayments + Dividends)
```

### Cash Reinvestment Ratio
```
فرمول: (CapEx + ΔWorking Capital) / OCF
```

---

## 8️⃣ مدل DCF (Discounted Cash Flow)
**فایل:** `lib/metrics/dcf.ts`

### Risk-Free Rate (نرخ بدون ریسک)
```
منبع: FRED API - DGS10 (بازده اوراق ۱۰ ساله)
```

### Market Risk Premium (صرف ریسک بازار)
```
فرمول: MRP = E(Rm) - Rf
پیش‌فرض: 5.5%
```

### Beta (بتا)
```
فرمول: β = Cov(Stock Returns, Market Returns) / Var(Market Returns)
```

### Cost of Equity - CAPM (هزینه حقوق صاحبان سهام)
```
فرمول: Re = Rf + β(Rm - Rf)
```

### Cost of Debt (هزینه بدهی)
```
فرمول: Rd = Interest Expense / Total Debt
```

### WACC (میانگین موزون هزینه سرمایه)
```
فرمول: WACC = (E/V) × Re + (D/V) × Rd × (1-t)
```
- E = ارزش بازار سهام
- D = ارزش بدهی
- V = E + D
- t = نرخ مالیات

### Terminal Value (ارزش پایانی)
```
فرمول: TV = FCF × (1 + g) / (WACC - g)
```
- g = نرخ رشد پایدار (پیش‌فرض: 2.5%)

### Intrinsic Value (ارزش ذاتی)
```
فرمول: IV = Σ PV(FCFs) + PV(Terminal Value) - Net Debt
```
مدل کامل DCF برای محاسبه ارزش ذاتی هر سهم

### Upside/Downside
```
فرمول: (Target Price - Current Price) / Current Price
```

### Margin of Safety (حاشیه امنیت)
```
فرمول: (Intrinsic Value - Current Price) / Intrinsic Value
```

---

## 9️⃣ متریک‌های ریسک (Risk Metrics)
**فایل:** `lib/metrics/risk.ts`

### Beta (بتا)
```
فرمول: β = Cov(Stock, Market) / Var(Market)
```
**تفسیر:**
- β < 1: کم‌ریسک‌تر از بازار
- β = 1: همسو با بازار
- β > 1: پرریسک‌تر از بازار

### Standard Deviation (انحراف معیار)
```
فرمول: σ = √(Σ(xi - μ)² / n)
```
نوسان بازده‌ها

### Annualized Volatility (نوسان سالانه)
```
فرمول: Annual Vol = Daily σ × √252
```

### Alpha (آلفا)
```
فرمول: α = Actual Return - Expected Return (CAPM)
```
بازده مازاد نسبت به CAPM

### Sharpe Ratio (نسبت شارپ)
```
فرمول: Sharpe = (Return - Rf) / σ
```
**تفسیر:**
- بالای ۱: خوب ✅
- بالای ۲: عالی ✅✅
- منفی: بد ❌

### Sortino Ratio (نسبت سورتینو)
```
فرمول: Sortino = (Return - Rf) / Downside σ
```
فقط بازده‌های منفی را در نظر می‌گیرد

### Max Drawdown (حداکثر افت)
```
فرمول: Max DD = (Trough - Peak) / Peak
```
بیشترین افت از اوج تا کف

### VaR 95% (ارزش در معرض ریسک)
```
فرمول: VaR = Value at 5th percentile of returns
```
حداکثر زیان با ۹۵% اطمینان

### CVaR / Expected Shortfall
میانگین زیان در بدترین ۵% سناریوها

---

## 🔟 شاخص‌های تکنیکال (Technical Indicators)
**فایل:** `lib/metrics/technical.ts`

### RSI - Relative Strength Index
```
فرمول: RSI = 100 - (100 / (1 + RS))
RS = Average Gain / Average Loss (14 دوره)
```
**تفسیر:**
- بالای ۷۰: اشباع خرید (Overbought)
- زیر ۳۰: اشباع فروش (Oversold)

### MACD
```
فرمول: MACD = EMA(12) - EMA(26)
Signal Line = EMA(9) of MACD
Histogram = MACD - Signal
```
**تفسیر:**
- MACD > Signal: صعودی
- MACD < Signal: نزولی

### 50-Day Moving Average
```
فرمول: SMA(50) = Σ(Close prices for 50 days) / 50
```

### 200-Day Moving Average
```
فرمول: SMA(200) = Σ(Close prices for 200 days) / 200
```
**سیگنال‌ها:**
- قیمت بالای SMA200: روند صعودی
- Golden Cross: SMA50 از SMA200 عبور به بالا
- Death Cross: SMA50 از SMA200 عبور به پایین

### Bollinger Bands
```
فرمول:
Middle Band = SMA(20)
Upper Band = SMA(20) + 2σ
Lower Band = SMA(20) - 2σ
```

### Relative Volume
```
فرمول: Relative Volume = Current Volume / Average Volume
```

---

## 1️⃣1️⃣ امتیازات ترکیبی (Composite Scores)
**فایل:** `lib/metrics/scores.ts`

همه امتیازات در مقیاس ۰-۱۰۰ نرمال‌سازی می‌شوند.

### Profitability Score (امتیاز سودآوری)
```
وزن‌ها:
- Gross Margin: 20%
- Operating Margin: 20%
- Net Margin: 20%
- ROE: 20%
- ROIC: 20%
```

### Growth Score (امتیاز رشد)
```
وزن‌ها:
- Revenue Growth YoY: 30%
- EPS Growth YoY: 30%
- FCF Growth: 20%
- 3Y Revenue CAGR: 20%
```

### Valuation Score (امتیاز ارزش‌گذاری)
```
وزن‌ها (معکوس - کمتر بهتر):
- P/E: 30%
- P/B: 25%
- PEG: 25%
- EV/EBITDA: 20%
```

### Risk Score (امتیاز ریسک)
```
وزن‌ها:
- Beta: 35% (معکوس)
- Volatility: 35% (معکوس)
- Sharpe Ratio: 30%
```

### Health Score (امتیاز سلامت مالی)
```
وزن‌ها:
- Current Ratio: 25%
- Quick Ratio: 25%
- D/E: 25% (معکوس)
- Interest Coverage: 25%
```

### Total Score (امتیاز کل)
```
فرمول: میانگین وزنی همه امتیازات
- Profitability: 25%
- Growth: 20%
- Valuation: 20%
- Risk: 15%
- Health: 20%
```

---

## 1️⃣2️⃣ شاخص‌های کلان اقتصادی (Macro Indicators)
**فایل:** `lib/metrics/macro.ts`

### GDP Metrics
| متریک | فرمول/منبع |
|--------|-------------|
| نرخ رشد GDP | داده مستقیم از FRED |
| تغییر GDP | (GDP₁ - GDP₀) / GDP₀ |

### Inflation Metrics
| متریک | فرمول |
|--------|--------|
| نرخ تورم | (CPI₁ - CPI₀) / CPI₀ × 100 |
| تورم هسته‌ای | تغییر Core CPI |

### Interest Rates
- Federal Funds Rate: نرخ سیاستی فدرال رزرو
- 10Y Treasury: نرخ بدون ریسک

### Employment
- Unemployment Rate: درصد بیکاری
- Wage Growth: رشد دستمزد

---

## 🔧 توابع کمکی (Helper Functions)
**فایل:** `lib/metrics/helpers.ts`

### Safe Math Operations
```typescript
safeDivide(a, b)      // تقسیم امن (جلوگیری از تقسیم بر صفر)
safeMultiply(...vals) // ضرب امن
safeAdd(...vals)      // جمع امن
safeSubtract(a, b)    // تفریق امن
```

### Statistical Functions
```typescript
mean(values)              // میانگین
standardDeviation(values) // انحراف معیار
variance(values)          // واریانس
covariance(x, y)          // کوواریانس
correlation(x, y)         // ضریب همبستگی
```

### Growth Calculations
```typescript
calculateCAGR(end, start, years)  // نرخ رشد مرکب
percentageChange(current, prev)   // درصد تغییر
```

### Technical Helpers
```typescript
calculateRSI(prices, period)      // محاسبه RSI
calculateEMA(prices, period)      // میانگین متحرک نمایی
calculateSMA(prices, period)      // میانگین متحرک ساده
calculateMaxDrawdown(prices)      // حداکثر افت
```

---

## 📊 نحوه نمایش در داشبورد

### صفحه اصلی داشبورد
- **Market Overview:** قیمت شاخص‌های اصلی (S&P 500, Dow, Nasdaq)
- **Top Movers:** سهام با بیشترین تغییر روزانه
- **Sector Heatmap:** عملکرد ۱۱ بخش بازار
- **Economic Indicators:** شاخص‌های کلان اقتصادی

### صفحه تحلیل سهام
- **Overview:** قیمت، تغییر، حجم، ارزش بازار
- **Valuation:** تمام نسبت‌های ارزش‌گذاری
- **Profitability:** حاشیه‌های سود و بازده‌ها
- **Growth:** نرخ‌های رشد
- **Risk:** متریک‌های ریسک
- **Technical:** نمودار و شاخص‌های تکنیکال
- **DCF Model:** ارزش‌گذاری ذاتی

### Terminal Pro
- **Real-time Panels:** داده‌های لحظه‌ای
- **Multi-panel Layout:** نمایش همزمان چندین داده
- **Bloomberg-style UI:** رابط کاربری حرفه‌ای

---

## 🔄 به‌روزرسانی داده‌ها

| منبع | فرکانس به‌روزرسانی | Cache TTL |
|------|---------------------|-----------|
| قیمت سهام | Real-time | 1 دقیقه |
| صورت‌های مالی | فصلی | 24 ساعت |
| نرخ بهره | روزانه | 1 ساعت |
| GDP/CPI | ماهانه/فصلی | 24 ساعت |
| شاخص‌های تکنیکال | Real-time | 5 دقیقه |

---

## 📝 نکات مهم

1. **Null Handling:** تمام توابع در صورت عدم وجود داده، `null` برمی‌گردانند
2. **Safe Math:** از تقسیم بر صفر و اعداد نامتناهی جلوگیری می‌شود
3. **Industry Comparison:** برخی متریک‌ها باید با میانگین صنعت مقایسه شوند
4. **Time Period:** متریک‌های رشد نیاز به داده‌های تاریخی دارند
5. **TTM (Trailing Twelve Months):** بیشتر متریک‌ها از داده‌های ۱۲ ماه گذشته استفاده می‌کنند

---

*آخرین به‌روزرسانی: آذر ۱۴۰۴*
