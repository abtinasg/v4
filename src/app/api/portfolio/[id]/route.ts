import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { portfolios, portfolioHoldings, portfolioTransactions, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Get a single portfolio with all details
export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth();
    const { id } = await params;
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const portfolio = await db.query.portfolios.findFirst({
      where: and(eq(portfolios.id, id), eq(portfolios.userId, user.id)),
      with: {
        holdings: true,
        transactions: {
          orderBy: (transactions, { desc }) => [desc(transactions.executedAt)],
          limit: 50,
        },
        snapshots: {
          orderBy: (snapshots, { desc }) => [desc(snapshots.snapshotDate)],
          limit: 30,
        },
      },
    });

    if (!portfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Calculate portfolio metrics
    const holdings = portfolio.holdings || [];
    const totalValue = holdings.reduce((sum, h) => {
      return sum + (parseFloat(h.currentValue || '0') || parseFloat(h.quantity) * parseFloat(h.avgBuyPrice));
    }, 0);
    const totalCost = holdings.reduce((sum, h) => {
      return sum + (parseFloat(h.quantity) * parseFloat(h.avgBuyPrice));
    }, 0);
    const totalGainLoss = totalValue - totalCost;
    const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;

    return NextResponse.json({
      portfolio: {
        ...portfolio,
        metrics: {
          totalValue,
          totalCost,
          totalGainLoss,
          totalGainLossPercent,
          holdingsCount: holdings.length,
        },
      },
    });
  } catch (error) {
    console.error('Error fetching portfolio:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}

// Update a portfolio
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth();
    const { id } = await params;
    
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
    const { name, description, isDefault, isPublic } = body;

    // Check if portfolio exists and belongs to user
    const existingPortfolio = await db.query.portfolios.findFirst({
      where: and(eq(portfolios.id, id), eq(portfolios.userId, user.id)),
    });

    if (!existingPortfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // If setting as default, unset any existing default
    if (isDefault) {
      await db.update(portfolios)
        .set({ isDefault: false })
        .where(eq(portfolios.userId, user.id));
    }

    const [updatedPortfolio] = await db.update(portfolios)
      .set({
        name: name?.trim() || existingPortfolio.name,
        description: description !== undefined ? description?.trim() || null : existingPortfolio.description,
        isDefault: isDefault !== undefined ? isDefault : existingPortfolio.isDefault,
        isPublic: isPublic !== undefined ? isPublic : existingPortfolio.isPublic,
        updatedAt: new Date(),
      })
      .where(eq(portfolios.id, id))
      .returning();

    return NextResponse.json({ portfolio: updatedPortfolio });
  } catch (error) {
    console.error('Error updating portfolio:', error);
    return NextResponse.json({ error: 'Failed to update portfolio' }, { status: 500 });
  }
}

// Delete a portfolio
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth();
    const { id } = await params;
    
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if portfolio exists and belongs to user
    const existingPortfolio = await db.query.portfolios.findFirst({
      where: and(eq(portfolios.id, id), eq(portfolios.userId, user.id)),
    });

    if (!existingPortfolio) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    // Delete the portfolio (cascades to holdings, transactions, etc.)
    await db.delete(portfolios).where(eq(portfolios.id, id));

    return NextResponse.json({ success: true, message: 'Portfolio deleted successfully' });
  } catch (error) {
    console.error('Error deleting portfolio:', error);
    return NextResponse.json({ error: 'Failed to delete portfolio' }, { status: 500 });
  }
}
