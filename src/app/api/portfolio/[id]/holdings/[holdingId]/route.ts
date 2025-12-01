import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { portfolios, portfolioHoldings, portfolioTransactions, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ id: string; holdingId: string }>;
}

// Update a holding
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth();
    const { id: portfolioId, holdingId } = await params;
    
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

    // Check if holding exists
    const existingHolding = await db.query.portfolioHoldings.findFirst({
      where: and(
        eq(portfolioHoldings.id, holdingId),
        eq(portfolioHoldings.portfolioId, portfolioId)
      ),
    });

    if (!existingHolding) {
      return NextResponse.json({ error: 'Holding not found' }, { status: 404 });
    }

    const body = await request.json();
    const { quantity, avgBuyPrice, notes, targetPrice, stopLoss } = body;

    const [updatedHolding] = await db.update(portfolioHoldings)
      .set({
        quantity: quantity !== undefined ? quantity.toString() : existingHolding.quantity,
        avgBuyPrice: avgBuyPrice !== undefined ? avgBuyPrice.toString() : existingHolding.avgBuyPrice,
        notes: notes !== undefined ? notes : existingHolding.notes,
        targetPrice: targetPrice !== undefined ? targetPrice?.toString() : existingHolding.targetPrice,
        stopLoss: stopLoss !== undefined ? stopLoss?.toString() : existingHolding.stopLoss,
        updatedAt: new Date(),
      })
      .where(eq(portfolioHoldings.id, holdingId))
      .returning();

    return NextResponse.json({ holding: updatedHolding });
  } catch (error) {
    console.error('Error updating holding:', error);
    return NextResponse.json({ error: 'Failed to update holding' }, { status: 500 });
  }
}

// Sell/Remove a holding
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth();
    const { id: portfolioId, holdingId } = await params;
    
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

    // Check if holding exists
    const existingHolding = await db.query.portfolioHoldings.findFirst({
      where: and(
        eq(portfolioHoldings.id, holdingId),
        eq(portfolioHoldings.portfolioId, portfolioId)
      ),
    });

    if (!existingHolding) {
      return NextResponse.json({ error: 'Holding not found' }, { status: 404 });
    }

    // Get sell details from request body if provided
    const url = new URL(request.url);
    const sellPrice = url.searchParams.get('sellPrice');
    const sellQuantity = url.searchParams.get('quantity');

    const qty = parseFloat(existingHolding.quantity);
    const sellQty = sellQuantity ? parseFloat(sellQuantity) : qty;
    const price = sellPrice ? parseFloat(sellPrice) : parseFloat(existingHolding.avgBuyPrice);

    // Create sell transaction
    await db.insert(portfolioTransactions).values({
      portfolioId,
      holdingId,
      symbol: existingHolding.symbol,
      type: 'sell',
      quantity: sellQty.toString(),
      price: price.toFixed(2),
      totalAmount: (sellQty * price).toFixed(2),
      executedAt: new Date(),
    });

    // If selling all shares, delete the holding
    if (sellQty >= qty) {
      await db.delete(portfolioHoldings).where(eq(portfolioHoldings.id, holdingId));
      return NextResponse.json({ success: true, message: 'Holding sold and removed' });
    }

    // Otherwise, reduce the quantity
    const [updatedHolding] = await db.update(portfolioHoldings)
      .set({
        quantity: (qty - sellQty).toString(),
        updatedAt: new Date(),
      })
      .where(eq(portfolioHoldings.id, holdingId))
      .returning();

    return NextResponse.json({ success: true, holding: updatedHolding });
  } catch (error) {
    console.error('Error selling holding:', error);
    return NextResponse.json({ error: 'Failed to sell holding' }, { status: 500 });
  }
}
