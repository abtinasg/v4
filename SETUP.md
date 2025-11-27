# Setup Instructions for Deep Terminal

## Quick Start Guide

### 1. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- TypeScript
- Tailwind CSS
- Clerk (Authentication)
- Drizzle ORM
- shadcn/ui components
- And more...

### 2. Setup Environment Variables

Create a `.env.local` file in the root directory:

```bash
cp .env.example .env.local
```

Then fill in the following required values:

#### Clerk Authentication Setup

1. Go to [https://clerk.com](https://clerk.com) and create an account
2. Create a new application
3. Copy your API keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
4. Setup webhook (for database sync):
   - In Clerk Dashboard, go to Webhooks
   - Add endpoint: `https://yourdomain.com/api/webhooks/clerk`
   - Select events: `user.created`, `user.updated`, `user.deleted`
   - Copy the signing secret to `CLERK_WEBHOOK_SECRET`

#### Neon Database Setup

1. Go to [https://neon.tech](https://neon.tech) and create an account
2. Create a new project
3. Copy the connection string to `DATABASE_URL`
4. Make sure it includes `?sslmode=require`

#### Financial Data API Keys (Choose at least one)

**Option 1: Alpha Vantage (Free tier available)**
- Sign up at [https://www.alphavantage.co](https://www.alphavantage.co)
- Get your API key
- Add to `ALPHA_VANTAGE_API_KEY`

**Option 2: Polygon.io**
- Sign up at [https://polygon.io](https://polygon.io)
- Get your API key
- Add to `POLYGON_API_KEY`

**Option 3: Finnhub**
- Sign up at [https://finnhub.io](https://finnhub.io)
- Get your API key
- Add to `FINNHUB_API_KEY`

**Option 4: IEX Cloud**
- Sign up at [https://iexcloud.io](https://iexcloud.io)
- Get your API keys
- Add to `IEX_CLOUD_API_KEY` and `IEX_CLOUD_SECRET_KEY`

### 3. Initialize Database

Push the database schema to your Neon database:

```bash
npm run db:push
```

Or generate migrations:

```bash
npm run db:generate
npm run db:migrate
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your application.

### 5. (Optional) Open Drizzle Studio

To manage your database visually:

```bash
npm run db:studio
```

This opens a database GUI at [http://localhost:4983](http://localhost:4983)

## Project Structure Overview

```
src/
├── app/                   # Next.js App Router
│   ├── api/              # API endpoints
│   ├── dashboard/        # Protected dashboard pages
│   ├── sign-in/         # Auth pages
│   └── sign-up/
├── components/           # React components
│   └── ui/              # shadcn/ui components
├── lib/                  # Utility functions
│   ├── db/              # Database config & schema
│   └── utils.ts         # Helper functions
└── types/               # TypeScript types
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Check TypeScript types
npm run db:generate  # Generate database migrations
npm run db:migrate   # Run database migrations
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio
```

## Adding More shadcn/ui Components

The project uses shadcn/ui for UI components. To add more components:

```bash
npx shadcn-ui@latest add [component-name]
```

Examples:
```bash
npx shadcn-ui@latest add table
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add dropdown-menu
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
```

## Customizing the Theme

Edit `tailwind.config.ts` to customize colors, especially the financial colors:

```typescript
colors: {
  bull: {
    DEFAULT: "#10b981",  // Green for positive
    light: "#34d399",
    dark: "#059669",
  },
  bear: {
    DEFAULT: "#ef4444",  // Red for negative
    light: "#f87171",
    dark: "#dc2626",
  },
  // ... more colors
}
```

## Integration with Real Financial APIs

Currently, the API routes return mock data. To integrate real data:

1. Choose your financial data provider
2. Add API key to `.env.local`
3. Update the API routes in `src/app/api/`:
   - `stocks/quote/route.ts`
   - `stocks/search/route.ts`
   - `market/overview/route.ts`

Example for Alpha Vantage:

```typescript
const response = await fetch(
  `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${process.env.ALPHA_VANTAGE_API_KEY}`
)
const data = await response.json()
```

## Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add all environment variables from `.env.local`
4. Deploy!

Vercel will automatically:
- Build your Next.js application
- Set up HTTPS
- Configure CDN
- Enable automatic deployments

### Environment Variables for Production

Make sure to add these in your production environment:
- All Clerk keys
- Database URL
- Financial API keys
- Set `NODE_ENV=production`

## Troubleshooting

### Type Errors
- Run `npm install` to install all dependencies
- Type errors are expected before installation

### Database Connection Issues
- Verify your `DATABASE_URL` is correct
- Ensure it includes `?sslmode=require` for Neon
- Check that your IP is allowed in Neon dashboard

### Authentication Issues
- Verify Clerk keys are correct
- Check that redirect URLs match your domain
- Ensure webhook is properly configured

### API Rate Limits
- Most free tier APIs have rate limits
- Consider implementing caching
- Use Redis for production (optional `REDIS_URL` in .env)

## Support

For issues or questions:
- Check the documentation in `README.md`
- Review `PROJECT_STRUCTURE.md` for file organization
- Open an issue on GitHub

## Next Steps After Setup

1. Customize the landing page (`src/app/page.tsx`)
2. Implement real financial data fetching
3. Add more dashboard features
4. Customize the theme and branding
5. Add user preferences and settings
6. Implement portfolio tracking
7. Add real-time data with WebSockets
8. Create advanced charting components
9. Add email notifications for alerts
10. Implement social features (if desired)

Happy coding! 🚀
