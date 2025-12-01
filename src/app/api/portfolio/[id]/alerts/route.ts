import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { portfolios, portfolioAlerts, portfolioHoldings, users } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Get all alerts for a portfolio
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth();
    const { id: portfolioId } = await params;
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify portfolio belongs to user
    const portfolio = await db.query.portfolios.findFirst({
      where: and(eq(portfolios.id, portfolioId), eq(portfolios.userId, user.id)),
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Get alerts for this portfolio
    const alerts = await db.query.portfolioAlerts.findMany({
      where: eq(portfolioAlerts.portfolioId, portfolioId),
      with: {
        holding: true,
      },
      orderBy: [desc(portfolioAlerts.createdAt)],
    });

    return NextResponse.json({ alerts });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    return NextResponse.json({ error: 'Failed to fetch alerts' }, { status: 500 });
  }
}

// Create a new alert
export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth();
    const { id: portfolioId } = await params;
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify portfolio belongs to user
    const portfolio = await db.query.portfolios.findFirst({
      where: and(eq(portfolios.id, portfolioId), eq(portfolios.userId, user.id)),
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      holdingId, 
      symbol, 
      alertType, 
      conditionValue, 
      conditionPercent,
      message,
      isEmailEnabled = true,
      isPushEnabled = true,
    } = body;

    if (!alertType) {
      return NextResponse.json({ error: 'Alert type is required' }, { status: 400 });
    }

    // Validate alert type specific requirements
    if (['price_above', 'price_below', 'portfolio_value'].includes(alertType) && !conditionValue) {
      return NextResponse.json({ error: 'Condition value is required for this alert type' }, { status: 400 });
    }

    if (['percent_change', 'daily_gain_loss'].includes(alertType) && !conditionPercent) {
      return NextResponse.json({ error: 'Condition percent is required for this alert type' }, { status: 400 });
    }

    // If holdingId is provided, verify it belongs to this portfolio
    if (holdingId) {
      const holding = await db.query.portfolioHoldings.findFirst({
        where: and(
          eq(portfolioHoldings.id, holdingId),
          eq(portfolioHoldings.portfolioId, portfolioId)
        ),
      });

      if (!holding) {
        return NextResponse.json({ error: 'Holding not found in this portfolio' }, { status: 404 });
      }
    }

    const [alert] = await db.insert(portfolioAlerts).values({
      userId: user.id,
      portfolioId,
      holdingId: holdingId || null,
      symbol: symbol?.toUpperCase() || null,
      alertType,
      conditionValue: conditionValue?.toString() || null,
      conditionPercent: conditionPercent?.toString() || null,
      message: message || null,
      isEmailEnabled,
      isPushEnabled,
    }).returning();

    return NextResponse.json({ alert }, { status: 201 });
  } catch (error) {
    console.error('Error creating alert:', error);
    return NextResponse.json({ error: 'Failed to create alert' }, { status: 500 });
  }
}
