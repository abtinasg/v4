# Deep Terminal

A modern Bloomberg Terminal alternative built with Next.js 14, TypeScript, and cutting-edge web technologies.

## Features

- 📊 Real-time market data and stock quotes
- 📈 Advanced stock analysis and charting
- 👀 Customizable watchlists
- 💼 Portfolio management
- 🔐 Secure authentication with Clerk
- 🌙 Dark mode support
- ⚡ Lightning-fast performance

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Database:** Neon PostgreSQL
- **ORM:** Drizzle ORM
- **Authentication:** Clerk
- **State Management:** Zustand
- **Data Fetching:** TanStack Query

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Neon PostgreSQL database
- Clerk account

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd deep-terminal
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Fill in your environment variables in `.env`

5. Run database migrations:
```bash
npm run db:push
```

6. Start the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── dashboard/         # Dashboard pages
│   ├── sign-in/          # Authentication pages
│   └── sign-up/
├── components/            # React components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utility functions
│   └── db/               # Database configuration
└── types/                # TypeScript type definitions
```

## Database Schema

The application uses a comprehensive PostgreSQL schema with 7 tables:
- `users` - User accounts (synced with Clerk)
- `watchlists` - User watchlists
- `watchlist_items` - Stocks in watchlists with notes
- `stock_alerts` - Price alerts with multiple conditions
- `user_preferences` - Theme, chart type, and settings
- `chat_history` - AI conversation storage
- `portfolio_holdings` - Stock positions and portfolio tracking

**📚 Detailed Documentation:**
- **[DATABASE_SCHEMA.md](./DATABASE_SCHEMA.md)** - Complete schema reference
- **[MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)** - Setup and migration instructions
- **[DATABASE_USAGE.md](./DATABASE_USAGE.md)** - Query helper examples

## API Integration

The app supports multiple financial data providers:
- Alpha Vantage
- Polygon.io
- Finnhub
- IEX Cloud

Configure your preferred provider in the environment variables.

## Development

```bash
# Run development server
npm run dev

# Type checking
npm run type-check

# Database operations
npm run db:generate   # Generate migrations
npm run db:migrate    # Run migrations
npm run db:push       # Push schema to database
npm run db:studio     # Open Drizzle Studio
```

## Deployment

The easiest way to deploy is using [Vercel](https://vercel.com):

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables
4. Deploy!

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - feel free to use this project for your own purposes.