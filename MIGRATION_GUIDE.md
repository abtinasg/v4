# Database Migration Guide

## Initial Setup

### 1. Install Dependencies

If not already installed:
```bash
npm install drizzle-orm @neondatabase/serverless
npm install -D drizzle-kit
```

### 2. Configure Environment Variables

Ensure your `.env.local` file has:
```env
DATABASE_URL=postgresql://user:password@host/database?sslmode=require
```

## Running Migrations

### Option 1: Push Schema Directly (Recommended for Development)

This method pushes your schema directly to the database without generating migration files:

```bash
npm run db:push
```

This will:
- Create all tables
- Add indexes
- Set up foreign keys
- Create enums

### Option 2: Generate and Run Migrations (Recommended for Production)

#### Step 1: Generate Migration Files
```bash
npm run db:generate
```

This creates SQL migration files in the `drizzle/` directory.

#### Step 2: Review Generated Migrations
Check the generated SQL files in `drizzle/` folder to ensure they're correct.

#### Step 3: Apply Migrations
```bash
npm run db:migrate
```

## Database Structure

### Tables Created

1. **users**
   - Primary table synced with Clerk
   - Stores subscription tier information
   - Indexes on: clerk_id, email, subscription_tier

2. **watchlists**
   - User's custom watchlists
   - Supports default watchlist flag
   - Indexes on: user_id, (user_id + name)

3. **watchlist_items**
   - Stocks added to watchlists
   - Includes optional notes field
   - Indexes on: watchlist_id, symbol, (watchlist_id + symbol)

4. **stock_alerts**
   - Price alerts with multiple condition types
   - Tracks active status and trigger time
   - Indexes on: user_id, symbol, is_active, (user_id + symbol)

5. **user_preferences**
   - Theme, chart type, and custom settings
   - JSONB fields for flexible configuration
   - One-to-one relationship with users

6. **chat_history**
   - AI chat conversation storage
   - JSONB context for metadata
   - Indexes on: user_id, created_at, (user_id + created_at)

7. **portfolio_holdings**
   - Track stock positions
   - High-precision decimal fields for financial data
   - Indexes on: user_id, symbol, (user_id + symbol), last_updated

### PostgreSQL Enums

The schema includes type-safe enums:
- `subscription_tier`: free, premium, professional, enterprise
- `alert_condition`: above, below, crosses_above, crosses_below, percent_change
- `theme`: light, dark, system
- `chart_type`: line, candlestick, bar, area

### Indexes Strategy

All tables include strategic indexes for:
- Fast user-specific queries
- Efficient symbol lookups
- Time-based sorting
- Composite queries (user + symbol, user + timestamp)

## Drizzle Studio

To visually manage your database:

```bash
npm run db:studio
```

This opens a web interface at `http://localhost:4983` where you can:
- View all tables and data
- Run queries
- Edit records
- View relationships

## Common Migration Commands

### Check Migration Status
```bash
npx drizzle-kit check
```

### Generate Migration from Schema Changes
```bash
npm run db:generate
```

### Push Schema Without Migrations
```bash
npm run db:push
```

### Drop Everything (DANGEROUS!)
```bash
npx drizzle-kit drop
```

## Migration Workflow

### Development
1. Make changes to `src/lib/db/schema.ts`
2. Run `npm run db:push` to apply immediately
3. Test your changes

### Production
1. Make changes to `src/lib/db/schema.ts`
2. Run `npm run db:generate` to create migration files
3. Review the generated SQL
4. Commit migration files to version control
5. Deploy and run `npm run db:migrate` on production

## Schema Changes Tracking

When you modify the schema:
- Add new tables
- Add/remove columns
- Change column types
- Add/remove indexes
- Modify constraints

Always generate a new migration to track the change:
```bash
npm run db:generate
```

## Seeding Data (Optional)

Create a seed script to populate initial data:

```typescript
// scripts/seed.ts
import { db } from '@/lib/db'
import { users, userPreferences } from '@/lib/db/schema'

async function seed() {
  // Add seed data here
  console.log('Seeding complete!')
}

seed()
```

Run with:
```bash
npx tsx scripts/seed.ts
```

## Backup and Restore

### Backup
```bash
pg_dump $DATABASE_URL > backup.sql
```

### Restore
```bash
psql $DATABASE_URL < backup.sql
```

## Troubleshooting

### "relation already exists" Error
This means tables already exist. Options:
1. Drop tables manually in Drizzle Studio
2. Use `npx drizzle-kit drop` (deletes all data!)
3. Generate migrations to handle changes

### Type Errors
After schema changes, restart your TypeScript server:
- VS Code: Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"

### Connection Issues
- Verify DATABASE_URL is correct
- Ensure SSL mode is set: `?sslmode=require`
- Check Neon dashboard for connection details
- Verify IP whitelist in Neon settings

## Best Practices

1. **Always backup before migrations in production**
2. **Test migrations in staging first**
3. **Use transactions for complex migrations**
4. **Keep migration files in version control**
5. **Document breaking changes**
6. **Use descriptive migration names**
7. **Review generated SQL before applying**

## Performance Optimization

### Add Indexes for Common Queries
```typescript
// Add to schema.ts
(table) => ({
  customIdx: index('custom_idx').on(table.column1, table.column2),
})
```

### Use Partial Indexes
```typescript
(table) => ({
  activeAlertsIdx: index('active_alerts_idx')
    .on(table.userId)
    .where(sql`is_active = true`),
})
```

### Analyze Query Performance
```sql
EXPLAIN ANALYZE SELECT * FROM watchlist_items WHERE user_id = 'xxx';
```

## Next Steps

After successful migration:
1. ✅ Verify all tables exist in Drizzle Studio
2. ✅ Test query helpers in `src/lib/db/queries.ts`
3. ✅ Update Clerk webhook to sync users
4. ✅ Implement data access layer in API routes
5. ✅ Add data validation with Zod
6. ✅ Set up monitoring and logging
