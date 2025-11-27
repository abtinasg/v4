# Database Query Examples

This guide shows how to use the type-safe query helpers defined in `src/lib/db/queries.ts`.

## Import Queries

```typescript
import { queries } from '@/lib/db/queries'
// Or import specific query groups
import { userQueries, watchlistQueries, stockAlertQueries } from '@/lib/db/queries'
```

## User Queries

### Get User by Clerk ID
```typescript
const user = await queries.user.getByClerkId('user_2xxx')
// Returns: User with preferences
```

### Get User by Internal ID
```typescript
const user = await queries.user.getById('uuid-here')
// Returns: User object
```

### Create User
```typescript
const newUser = await queries.user.create({
  clerkId: 'user_2xxx',
  email: 'user@example.com',
  subscriptionTier: 'free',
})
```

### Update User
```typescript
const updated = await queries.user.update('user-id', {
  subscriptionTier: 'premium',
})
```

### Get User with All Relations
```typescript
const fullUser = await queries.user.getWithRelations('user-id')
// Returns: User with watchlists, alerts, preferences, holdings
```

## Watchlist Queries

### Get All Watchlists for User
```typescript
const watchlists = await queries.watchlist.getByUserId('user-id')
// Returns: Array of watchlists with items
```

### Get Specific Watchlist
```typescript
const watchlist = await queries.watchlist.getById('watchlist-id')
// Returns: Watchlist with items
```

### Create Watchlist
```typescript
const watchlist = await queries.watchlist.create({
  userId: 'user-id',
  name: 'Tech Stocks',
  isDefault: false,
})
```

### Update Watchlist
```typescript
const updated = await queries.watchlist.update('watchlist-id', {
  name: 'Updated Name',
})
```

### Add Item to Watchlist
```typescript
const item = await queries.watchlist.addItem({
  watchlistId: 'watchlist-id',
  symbol: 'AAPL',
  notes: 'Buying opportunity at $150',
})
```

### Remove Item from Watchlist
```typescript
await queries.watchlist.removeItem('item-id')
```

### Check if Symbol Exists in Watchlist
```typescript
const exists = await queries.watchlist.hasSymbol('watchlist-id', 'AAPL')
// Returns: boolean
```

### Update Item Notes
```typescript
const updated = await queries.watchlist.updateItemNotes(
  'item-id',
  'New notes here'
)
```

## Stock Alert Queries

### Get All Alerts for User
```typescript
// All alerts
const allAlerts = await queries.stockAlert.getByUserId('user-id')

// Active alerts only
const activeAlerts = await queries.stockAlert.getByUserId('user-id', true)
```

### Get Alerts by Symbol
```typescript
const alerts = await queries.stockAlert.getBySymbol('AAPL')
// Returns: All active alerts for AAPL
```

### Create Alert
```typescript
const alert = await queries.stockAlert.create({
  userId: 'user-id',
  symbol: 'AAPL',
  condition: 'above',
  targetPrice: '200.00',
  isActive: true,
})
```

### Update Alert
```typescript
const updated = await queries.stockAlert.update('alert-id', {
  targetPrice: '210.00',
})
```

### Trigger Alert
```typescript
const triggered = await queries.stockAlert.trigger('alert-id')
// Sets isActive to false and records triggeredAt timestamp
```

### Get Active Alert Count
```typescript
const count = await queries.stockAlert.getActiveCount('user-id')
// Returns: number
```

## User Preferences Queries

### Get User Preferences
```typescript
const prefs = await queries.userPreferences.getByUserId('user-id')
```

### Create or Update Preferences (Upsert)
```typescript
const prefs = await queries.userPreferences.upsert('user-id', {
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

### Update Favorite Metrics
```typescript
const updated = await queries.userPreferences.updateFavoriteMetrics(
  'user-id',
  ['PE', 'EPS', 'ROE', 'Debt-to-Equity']
)
```

## Chat History Queries

### Get Recent Chat History
```typescript
// Last 50 messages (default)
const recent = await queries.chatHistory.getRecent('user-id')

// Last 100 messages
const recent = await queries.chatHistory.getRecent('user-id', 100)
```

### Get Chat by Date Range
```typescript
const chats = await queries.chatHistory.getByDateRange(
  'user-id',
  new Date('2024-01-01'),
  new Date('2024-01-31')
)
```

### Create Chat Entry
```typescript
const chat = await queries.chatHistory.create({
  userId: 'user-id',
  message: 'What is AAPL stock price?',
  response: 'Apple stock (AAPL) is currently trading at $175.50...',
  context: {
    symbols: ['AAPL'],
    metrics: ['price', 'volume'],
    sentiment: 'neutral',
  },
})
```

### Search Chat History
```typescript
const results = await queries.chatHistory.search(
  'user-id',
  'AAPL stock',
  20 // limit
)
```

### Delete All Chat History for User
```typescript
await queries.chatHistory.deleteAllByUser('user-id')
```

### Get Chat Count
```typescript
const count = await queries.chatHistory.getCount('user-id')
```

## Portfolio Holdings Queries

### Get All Holdings for User
```typescript
const holdings = await queries.portfolioHoldings.getByUserId('user-id')
```

### Get Specific Holding
```typescript
const holding = await queries.portfolioHoldings.getByUserAndSymbol(
  'user-id',
  'AAPL'
)
```

### Create or Update Holding (Upsert)
```typescript
const holding = await queries.portfolioHoldings.upsert(
  'user-id',
  'AAPL',
  {
    quantity: '100',
    avgBuyPrice: '150.00',
    currentValue: '17500.00',
  }
)
```

### Update Current Value
```typescript
const updated = await queries.portfolioHoldings.updateCurrentValue(
  'holding-id',
  '18000.00'
)
```

### Get Total Portfolio Value
```typescript
const total = await queries.portfolioHoldings.getTotalValue('user-id')
// Returns: number
```

### Get Holdings Count
```typescript
const count = await queries.portfolioHoldings.getCount('user-id')
```

## Analytics Queries

### Get User Activity Summary
```typescript
const summary = await queries.analytics.getUserSummary('user-id')
// Returns: {
//   watchlistCount: 5,
//   activeAlertCount: 12,
//   chatHistoryCount: 150,
//   portfolioHoldingCount: 8,
//   totalPortfolioValue: 125000,
// }
```

### Get Most Watched Symbols
```typescript
const topSymbols = await queries.analytics.getMostWatchedSymbols(10)
// Returns: Array of { symbol, count }
```

### Get Recent User Activity
```typescript
const activity = await queries.analytics.getRecentActivity('user-id')
// Returns: {
//   recentChats: [...],
//   recentAlerts: [...],
//   recentWatchlistItems: [...],
// }
```

## Usage in API Routes

### Example: Get Watchlists API
```typescript
// src/app/api/watchlists/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { queries } from '@/lib/db/queries'

export async function GET() {
  const { userId } = auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const user = await queries.user.getByClerkId(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const watchlists = await queries.watchlist.getByUserId(user.id)
    return NextResponse.json({ watchlists })
  } catch (error) {
    console.error('Error fetching watchlists:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

### Example: Create Alert API
```typescript
// src/app/api/alerts/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { queries } from '@/lib/db/queries'
import { z } from 'zod'

const alertSchema = z.object({
  symbol: z.string().min(1).max(10),
  condition: z.enum(['above', 'below', 'crosses_above', 'crosses_below', 'percent_change']),
  targetPrice: z.string().regex(/^\d+(\.\d{1,2})?$/),
})

export async function POST(req: Request) {
  const { userId } = auth()
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const validated = alertSchema.parse(body)

    const user = await queries.user.getByClerkId(userId)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const alert = await queries.stockAlert.create({
      userId: user.id,
      ...validated,
      isActive: true,
    })

    return NextResponse.json({ alert }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    console.error('Error creating alert:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

## Usage in Server Components

```typescript
// app/dashboard/watchlists/page.tsx
import { auth } from '@clerk/nextjs/server'
import { queries } from '@/lib/db/queries'
import { redirect } from 'next/navigation'

export default async function WatchlistsPage() {
  const { userId } = auth()
  
  if (!userId) {
    redirect('/sign-in')
  }

  const user = await queries.user.getByClerkId(userId)
  if (!user) {
    redirect('/sign-in')
  }

  const watchlists = await queries.watchlist.getByUserId(user.id)

  return (
    <div>
      <h1>My Watchlists</h1>
      {watchlists.map(watchlist => (
        <div key={watchlist.id}>
          <h2>{watchlist.name}</h2>
          <p>{watchlist.items.length} stocks</p>
        </div>
      ))}
    </div>
  )
}
```

## Transaction Example

For complex operations requiring multiple queries:

```typescript
import { db } from '@/lib/db'
import { users, watchlists, watchlistItems } from '@/lib/db/schema'

async function createUserWithDefaultWatchlist(clerkId: string, email: string) {
  return await db.transaction(async (tx) => {
    // Create user
    const [user] = await tx.insert(users).values({
      clerkId,
      email,
      subscriptionTier: 'free',
    }).returning()

    // Create default watchlist
    const [watchlist] = await tx.insert(watchlists).values({
      userId: user.id,
      name: 'My Stocks',
      isDefault: true,
    }).returning()

    // Add default items
    await tx.insert(watchlistItems).values([
      { watchlistId: watchlist.id, symbol: 'AAPL' },
      { watchlistId: watchlist.id, symbol: 'MSFT' },
      { watchlistId: watchlist.id, symbol: 'GOOGL' },
    ])

    return user
  })
}
```

## Best Practices

1. **Always validate user authentication before queries**
2. **Use try-catch blocks for error handling**
3. **Return appropriate HTTP status codes**
4. **Log errors for debugging**
5. **Use TypeScript types for type safety**
6. **Validate input data with Zod or similar**
7. **Use transactions for multi-step operations**
8. **Index frequently queried fields**
9. **Avoid N+1 queries - use relations**
10. **Cache expensive queries when appropriate**
