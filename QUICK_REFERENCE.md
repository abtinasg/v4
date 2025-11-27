# Quick Reference - Database Schema

## Tables at a Glance

| Table | Primary Use | Key Fields | Relations |
|-------|-------------|------------|-----------|
| **users** | User accounts | clerk_id, email, subscription_tier | → watchlists, alerts, preferences, holdings, chats |
| **watchlists** | Stock lists | user_id, name, is_default | ← user, → items |
| **watchlist_items** | Stocks in lists | watchlist_id, symbol, notes | ← watchlist |
| **stock_alerts** | Price alerts | user_id, symbol, condition, target_price | ← user |
| **user_preferences** | User settings | user_id, theme, chart_type, settings | ← user |
| **chat_history** | AI conversations | user_id, message, response, context | ← user |
| **portfolio_holdings** | Stock positions | user_id, symbol, quantity, avg_buy_price | ← user |

## Common Operations - Copy & Paste Ready

### Get User from Clerk Auth
```typescript
import { auth } from '@clerk/nextjs/server'
import { queries } from '@/lib/db/queries'

const { userId } = auth()
const user = await queries.user.getByClerkId(userId!)
```

### Create Watchlist
```typescript
const watchlist = await queries.watchlist.create({
  userId: user.id,
  name: 'My Stocks',
  isDefault: true,
})
```

### Add Stock to Watchlist
```typescript
await queries.watchlist.addItem({
  watchlistId: watchlist.id,
  symbol: 'AAPL',
  notes: 'Optional note',
})
```

### Create Price Alert
```typescript
await queries.stockAlert.create({
  userId: user.id,
  symbol: 'AAPL',
  condition: 'above',
  targetPrice: '200.00',
  isActive: true,
})
```

### Save User Preferences
```typescript
await queries.userPreferences.upsert(user.id, {
  theme: 'dark',
  defaultChartType: 'candlestick',
  favoriteMetrics: ['PE', 'EPS', 'ROE'],
  settings: {
    notifications: true,
    autoRefresh: true,
    refreshInterval: 60000,
  },
})
```

### Save Chat Message
```typescript
await queries.chatHistory.create({
  userId: user.id,
  message: 'User message',
  response: 'AI response',
  context: {
    symbols: ['AAPL'],
    sentiment: 'neutral',
  },
})
```

### Track Portfolio Position
```typescript
await queries.portfolioHoldings.upsert(user.id, 'AAPL', {
  quantity: '100',
  avgBuyPrice: '150.00',
  currentValue: '17500.00',
})
```

### Get User Summary
```typescript
const summary = await queries.analytics.getUserSummary(user.id)
// Returns: watchlistCount, activeAlertCount, chatHistoryCount, 
//          portfolioHoldingCount, totalPortfolioValue
```

## API Route Template

```typescript
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { queries } from '@/lib/db/queries'

export async function GET() {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await queries.user.getByClerkId(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Your query here
    const data = await queries.watchlist.getByUserId(user.id)

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Server Component Template

```typescript
import { auth } from '@clerk/nextjs/server'
import { queries } from '@/lib/db/queries'
import { redirect } from 'next/navigation'

export default async function Page() {
  const { userId } = auth()
  if (!userId) redirect('/sign-in')

  const user = await queries.user.getByClerkId(userId)
  if (!user) redirect('/sign-in')

  const data = await queries.watchlist.getByUserId(user.id)

  return <div>{/* Render data */}</div>
}
```

## Migration Commands

```bash
# Development - Push schema directly
npm run db:push

# Production - Generate migrations
npm run db:generate

# Production - Run migrations
npm run db:migrate

# Visual database management
npm run db:studio
```

## Enums Reference

```typescript
// Subscription Tiers
'free' | 'premium' | 'professional' | 'enterprise'

// Alert Conditions
'above' | 'below' | 'crosses_above' | 'crosses_below' | 'percent_change'

// Themes
'light' | 'dark' | 'system'

// Chart Types
'line' | 'candlestick' | 'bar' | 'area'
```

## Type Imports

```typescript
import type {
  User, NewUser,
  Watchlist, NewWatchlist,
  WatchlistItem, NewWatchlistItem,
  StockAlert, NewStockAlert,
  UserPreferences, NewUserPreferences,
  ChatHistory, NewChatHistory,
  PortfolioHolding, NewPortfolioHolding,
} from '@/lib/db/schema'
```

## Query Import

```typescript
// Import all queries
import { queries } from '@/lib/db/queries'

// Or import specific
import { userQueries, watchlistQueries } from '@/lib/db/queries'
```

## Useful Queries

### Check if symbol in watchlist
```typescript
const exists = await queries.watchlist.hasSymbol(watchlistId, 'AAPL')
```

### Get active alerts count
```typescript
const count = await queries.stockAlert.getActiveCount(userId)
```

### Get total portfolio value
```typescript
const total = await queries.portfolioHoldings.getTotalValue(userId)
```

### Search chat history
```typescript
const results = await queries.chatHistory.search(userId, 'AAPL', 20)
```

### Get most watched stocks
```typescript
const popular = await queries.analytics.getMostWatchedSymbols(10)
```

## Documentation Files

- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Complete schema reference
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Setup instructions
- **[DATABASE_USAGE.md](./DATABASE_USAGE.md)** - Detailed examples
- **[DATABASE_COMPLETE.md](./DATABASE_COMPLETE.md)** - Implementation summary

## Environment Variables

```env
DATABASE_URL=postgresql://user:password@host/db?sslmode=require
CLERK_WEBHOOK_SECRET=whsec_xxxxx
```

## Connection Test

```typescript
import { db } from '@/lib/db'
import { users } from '@/lib/db/schema'

const allUsers = await db.select().from(users)
console.log('Users:', allUsers.length)
```

---

**Need help?** Check the full documentation files above! 🚀
