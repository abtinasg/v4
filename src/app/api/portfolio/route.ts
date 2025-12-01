import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { portfolios, portfolioHoldings, users } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

// Get all portfolios for the current user
export async function GET() {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get all portfolios with their holdings
    const userPortfolios = await db.query.portfolios.findMany({
      where: eq(portfolios.userId, user.id),
      with: {
        holdings: true,
      },
      orderBy: [desc(portfolios.isDefault), desc(portfolios.createdAt)],
    });

    // Calculate portfolio metrics for each portfolio
    const portfoliosWithMetrics = userPortfolios.map(portfolio => {
      const holdings = portfolio.holdings || [];
      const totalValue = holdings.reduce((sum, h) => {
        return sum + (parseFloat(h.currentValue || '0') || parseFloat(h.quantity) * parseFloat(h.avgBuyPrice));
      }, 0);
      const totalCost = holdings.reduce((sum, h) => {
        return sum + (parseFloat(h.quantity) * parseFloat(h.avgBuyPrice));
      }, 0);
      const totalGainLoss = totalValue - totalCost;
      const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

      return {
        ...portfolio,
        metrics: {
          totalValue,
          totalCost,
          totalGainLoss,
          totalGainLossPercent,
          holdingsCount: holdings.length,
        },
      };
    });

    return NextResponse.json({ portfolios: portfoliosWithMetrics });
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolios' }, { status: 500 });
  }
}

// Create a new portfolio
export async function POST(request: Request) {
  try {
    const { userId: clerkId } = await auth();
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const body = await request.json();
    const { name, description, currency = 'USD', isDefault = false } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: 'Portfolio name is required' }, { status: 400 });
    }

    // If this is set as default, unset any existing default
    if (isDefault) {
      await db.update(portfolios)
        .set({ isDefault: false })
        .where(eq(portfolios.userId, user.id));
    }

    // Check if user has no portfolios, make this the default
    const existingPortfolios = await db.query.portfolios.findMany({
      where: eq(portfolios.userId, user.id),
    });

    const [newPortfolio] = await db.insert(portfolios).values({
      userId: user.id,
      name: name.trim(),
      description: description?.trim() || null,
      currency,
      isDefault: isDefault || existingPortfolios.length === 0,
    }).returning();

    return NextResponse.json({ portfolio: newPortfolio }, { status: 201 });
  } catch (error) {
    console.error('Error creating portfolio:', error);
    return NextResponse.json({ error: 'Failed to create portfolio' }, { status: 500 });
  }
}
