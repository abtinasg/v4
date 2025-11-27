# Database Schema Summary

## Overview

Complete PostgreSQL database schema for Deep Terminal financial analysis platform using Drizzle ORM.

## ✅ What's Included

### 1. **Enhanced Database Schema** (`src/lib/db/schema.ts`)
- ✅ 7 production-ready tables
- ✅ PostgreSQL enums for type safety
- ✅ Comprehensive indexes for performance
- ✅ Proper foreign key relationships
- ✅ Cascade deletes configured
- ✅ JSONB fields for flexible data
- ✅ High-precision decimal types for financial data
- ✅ Relations defined for easy querying
- ✅ TypeScript type exports

### 2. **Database Connection** (`src/lib/db/index.ts`)
- ✅ Neon serverless PostgreSQL connection
- ✅ Schema export for queries
- ✅ Environment variable validation

### 3. **Type-Safe Query Helpers** (`src/lib/db/queries.ts`)
- ✅ Complete CRUD operations for all tables
- ✅ User management queries
- ✅ Watchlist operations
- ✅ Stock alert management
- ✅ User preferences handling
- ✅ Chat history queries
- ✅ Portfolio holdings management
- ✅ Analytics and summary queries
- ✅ Search and filter capabilities
- ✅ Upsert operations

### 4. **Updated Webhook Handler** (`src/app/api/webhooks/clerk/route.ts`)
- ✅ Syncs Clerk users to database
- ✅ Creates default preferences on signup
- ✅ Handles user updates and deletions
- ✅ Error handling and logging

### 5. **Comprehensive Documentation**
- ✅ `MIGRATION_GUIDE.md` - Database setup and migration instructions
- ✅ `DATABASE_USAGE.md` - Query helper usage examples
- ✅ `DATABASE_SCHEMA.md` - This file

## Database Tables

### 1. **users**
Primary user table synced with Clerk authentication.

**Columns:**
- `id` - UUID primary key
- `clerk_id` - Unique Clerk user identifier
- `email` - User email (unique)
- `subscription_tier` - Enum: free, premium, professional, enterprise
- `created_at` - Timestamp with timezone
- `updated_at` - Timestamp with timezone

**Indexes:**
- `clerk_id` (unique)
- `email`
- `subscription_tier`

**Relations:**
- One-to-many: watchlists, stockAlerts, chatHistory, portfolioHoldings
- One-to-one: userPreferences

---

### 2. **watchlists**
User-created stock watchlists.

**Columns:**
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `name` - Watchlist name (max 100 chars)
- `is_default` - Boolean flag for default watchlist
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Indexes:**
- `user_id`
- `user_id + name` (composite)

**Relations:**
- Belongs to: user
- One-to-many: watchlistItems

---

### 3. **watchlist_items**
Individual stocks in watchlists.

**Columns:**
- `id` - UUID primary key
- `watchlist_id` - Foreign key to watchlists
- `symbol` - Stock symbol (max 10 chars)
- `notes` - Optional text notes
- `added_at` - Timestamp

**Indexes:**
- `watchlist_id`
- `symbol`
- `watchlist_id + symbol` (composite)

**Relations:**
- Belongs to: watchlist

---

### 4. **stock_alerts**
Price alerts and notifications.

**Columns:**
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `symbol` - Stock symbol
- `condition` - Enum: above, below, crosses_above, crosses_below, percent_change
- `target_price` - Decimal(15,2) - precise price target
- `is_active` - Boolean
- `triggered_at` - Nullable timestamp
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Indexes:**
- `user_id`
- `symbol`
- `is_active`
- `user_id + symbol` (composite)

**Relations:**
- Belongs to: user

---

### 5. **user_preferences**
User settings and preferences.

**Columns:**
- `id` - UUID primary key
- `user_id` - Foreign key to users (unique)
- `theme` - Enum: light, dark, system
- `default_chart_type` - Enum: line, candlestick, bar, area
- `favorite_metrics` - JSONB array of strings
- `settings` - JSONB object for flexible settings
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Indexes:**
- `user_id` (unique)

**Relations:**
- Belongs to: user

**JSONB Structure:**
```typescript
favoriteMetrics: string[] // e.g., ['PE', 'EPS', 'ROE']

settings: {
  notifications?: boolean
  emailAlerts?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
  displayCurrency?: string
  timezone?: string
}
```

---

### 6. **chat_history**
AI chat conversation storage.

**Columns:**
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `message` - Text - user message
- `response` - Text - AI response
- `context` - JSONB - conversation context
- `created_at` - Timestamp

**Indexes:**
- `user_id`
- `created_at`
- `user_id + created_at` (composite)

**Relations:**
- Belongs to: user

**JSONB Structure:**
```typescript
context: {
  symbols?: string[]
  metrics?: string[]
  timeframe?: string
  sentiment?: 'positive' | 'negative' | 'neutral'
  sources?: string[]
}
```

---

### 7. **portfolio_holdings**
Stock positions and portfolio tracking.

**Columns:**
- `id` - UUID primary key
- `user_id` - Foreign key to users
- `symbol` - Stock symbol
- `quantity` - Decimal(15,4) - precise quantity
- `avg_buy_price` - Decimal(15,2) - average purchase price
- `current_value` - Decimal(15,2) - current market value
- `last_updated` - Timestamp
- `created_at` - Timestamp
- `updated_at` - Timestamp

**Indexes:**
- `user_id`
- `symbol`
- `user_id + symbol` (composite)
- `last_updated`

**Relations:**
- Belongs to: user

---

## PostgreSQL Enums

### subscription_tier
- `free`
- `premium`
- `professional`
- `enterprise`

### alert_condition
- `above` - Price above target
- `below` - Price below target
- `crosses_above` - Price crosses above (from below)
- `crosses_below` - Price crosses below (from above)
- `percent_change` - Percentage change threshold

### theme
- `light`
- `dark`
- `system` - Follow system preference

### chart_type
- `line`
- `candlestick`
- `bar`
- `area`

---

## Cascade Delete Behavior

All foreign key relationships use `ON DELETE CASCADE`:
- Deleting a user removes all their watchlists, alerts, preferences, chat history, and holdings
- Deleting a watchlist removes all its items

---

## Performance Optimizations

### Strategic Indexing
- Single-column indexes on frequently queried fields
- Composite indexes for common query patterns (user_id + other field)
- Indexes on foreign keys for join performance
- Indexes on timestamp fields for sorting/filtering

### Data Types
- UUID for primary keys (random, not sequential)
- `DECIMAL` for precise financial calculations
- `JSONB` for flexible, queryable JSON data
- Enums for type safety and storage efficiency
- Timestamps with timezone for global consistency

### Query Optimization
- Relations defined for efficient joins
- Prepared statements via Drizzle ORM
- Connection pooling with Neon serverless

---

## Migration Commands

```bash
# Push schema to database (development)
npm run db:push

# Generate migration files (production)
npm run db:generate

# Run migrations (production)
npm run db:migrate

# Open Drizzle Studio
npm run db:studio
```

---

## Type Safety

All tables have TypeScript types exported:

```typescript
import type {
  User,
  NewUser,
  Watchlist,
  NewWatchlist,
  WatchlistItem,
  NewWatchlistItem,
  StockAlert,
  NewStockAlert,
  UserPreferences,
  NewUserPreferences,
  ChatHistory,
  NewChatHistory,
  PortfolioHolding,
  NewPortfolioHolding,
} from '@/lib/db/schema'
```

- `Type` - Selected row from database
- `NewType` - Insert data (omits auto-generated fields)

---

## Query Helper Organization

```typescript
import { queries } from '@/lib/db/queries'

queries.user.*                    // User operations
queries.watchlist.*               // Watchlist operations
queries.stockAlert.*              // Alert operations
queries.userPreferences.*         // Preferences operations
queries.chatHistory.*             // Chat operations
queries.portfolioHoldings.*       // Portfolio operations
queries.analytics.*               // Analytics and summaries
```

---

## Best Practices

1. **Always use query helpers** - Don't write raw SQL
2. **Validate input** - Use Zod schemas for API endpoints
3. **Handle errors** - Wrap database calls in try-catch
4. **Use transactions** - For multi-step operations
5. **Index wisely** - Monitor query performance
6. **Type everything** - Leverage TypeScript
7. **Test queries** - Use Drizzle Studio for testing
8. **Log errors** - For debugging production issues
9. **Cache when appropriate** - For expensive queries
10. **Monitor performance** - Use EXPLAIN ANALYZE

---

## Example Usage

### Create a complete user setup
```typescript
import { queries } from '@/lib/db/queries'

async function setupNewUser(clerkId: string, email: string) {
  // Create user
  const user = await queries.user.create({
    clerkId,
    email,
    subscriptionTier: 'free',
  })

  // Create preferences
  await queries.userPreferences.upsert(user.id, {
    theme: 'dark',
    defaultChartType: 'line',
    favoriteMetrics: [],
  })

  // Create default watchlist
  const watchlist = await queries.watchlist.create({
    userId: user.id,
    name: 'My Stocks',
    isDefault: true,
  })

  // Add popular stocks
  const symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN']
  for (const symbol of symbols) {
    await queries.watchlist.addItem({
      watchlistId: watchlist.id,
      symbol,
    })
  }

  return user
}
```

---

## Next Steps

1. ✅ Run migrations: `npm run db:push`
2. ✅ Test with Drizzle Studio: `npm run db:studio`
3. ✅ Update Clerk webhook URL
4. ✅ Create API routes using query helpers
5. ✅ Implement data validation with Zod
6. ✅ Add monitoring and logging
7. ✅ Set up automated backups

---

## Support

- Review `MIGRATION_GUIDE.md` for setup instructions
- Check `DATABASE_USAGE.md` for query examples
- Use Drizzle Studio for visual database management
- Consult Drizzle ORM docs: https://orm.drizzle.team/docs/overview
