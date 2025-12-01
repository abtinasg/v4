import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { portfolios, portfolioHoldings, portfolioTransactions, users } from '@/lib/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance({ 
  suppressNotices: ['yahooSurvey', 'ripHistorical'] 
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

// Get all holdings for a portfolio
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

    // Get holdings
    const holdings = await db.query.portfolioHoldings.findMany({
      where: eq(portfolioHoldings.portfolioId, portfolioId),
      orderBy: [desc(portfolioHoldings.createdAt)],
    });

    // Fetch current prices for all holdings
    const holdingsWithPrices = await Promise.all(
      holdings.map(async (holding) => {
        try {
          const quote = await yahooFinance.quote(holding.symbol);
          const currentPrice = quote?.regularMarketPrice || 0;
          const quantity = parseFloat(holding.quantity);
          const avgBuyPrice = parseFloat(holding.avgBuyPrice);
          const currentValue = currentPrice * quantity;
          const totalCost = avgBuyPrice * quantity;
          const gainLoss = currentValue - totalCost;
          const gainLossPercent = totalCost > 0 ? (gainLoss / totalCost) * 100 : 0;
          const dayChange = quote?.regularMarketChange || 0;
          const dayChangePercent = quote?.regularMarketChangePercent || 0;

          return {
            ...holding,
            currentPrice,
            currentValue,
            totalCost,
            gainLoss,
            gainLossPercent,
            dayChange: dayChange * quantity,
            dayChangePercent,
            companyName: quote?.shortName || quote?.longName || holding.symbol,
          };
        } catch (error) {
          console.error(`Error fetching price for ${holding.symbol}:`, error);
          const quantity = parseFloat(holding.quantity);
          const avgBuyPrice = parseFloat(holding.avgBuyPrice);
          return {
            ...holding,
            currentPrice: avgBuyPrice,
            currentValue: avgBuyPrice * quantity,
            totalCost: avgBuyPrice * quantity,
            gainLoss: 0,
            gainLossPercent: 0,
            dayChange: 0,
            dayChangePercent: 0,
            companyName: holding.symbol,
          };
        }
      })
    );

    return NextResponse.json({ holdings: holdingsWithPrices });
  } catch (error) {
    console.error('Error fetching holdings:', error);
    return NextResponse.json({ error: 'Failed to fetch holdings' }, { status: 500 });
  }
}

// Add a new holding to a portfolio
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
    const { symbol, quantity, avgBuyPrice, notes, targetPrice, stopLoss, executedAt } = body;

    if (!symbol || !quantity || !avgBuyPrice) {
      return NextResponse.json({ 
        error: 'Symbol, quantity, and average buy price are required' 
      }, { status: 400 });
    }

    const upperSymbol = symbol.toUpperCase().trim();
    const qty = parseFloat(quantity);
    const price = parseFloat(avgBuyPrice);

    if (qty <= 0 || price <= 0) {
      return NextResponse.json({ 
        error: 'Quantity and price must be positive numbers' 
      }, { status: 400 });
    }

    // Check if holding already exists for this symbol
    const existingHolding = await db.query.portfolioHoldings.findFirst({
      where: and(
        eq(portfolioHoldings.portfolioId, portfolioId),
        eq(portfolioHoldings.symbol, upperSymbol)
      ),
    });

    let holding;
    let transaction;

    if (existingHolding) {
      // Update existing holding with averaged price
      const existingQty = parseFloat(existingHolding.quantity);
      const existingPrice = parseFloat(existingHolding.avgBuyPrice);
      const newTotalQty = existingQty + qty;
      const newAvgPrice = ((existingQty * existingPrice) + (qty * price)) / newTotalQty;

      [holding] = await db.update(portfolioHoldings)
        .set({
          quantity: newTotalQty.toString(),
          avgBuyPrice: newAvgPrice.toFixed(2),
          notes: notes || existingHolding.notes,
          targetPrice: targetPrice?.toString() || existingHolding.targetPrice,
          stopLoss: stopLoss?.toString() || existingHolding.stopLoss,
          updatedAt: new Date(),
        })
        .where(eq(portfolioHoldings.id, existingHolding.id))
        .returning();
    } else {
      // Create new holding
      [holding] = await db.insert(portfolioHoldings).values({
        userId: user.id,
        portfolioId,
        symbol: upperSymbol,
        quantity: qty.toString(),
        avgBuyPrice: price.toFixed(2),
        notes: notes || null,
        targetPrice: targetPrice?.toString() || null,
        stopLoss: stopLoss?.toString() || null,
      }).returning();
    }

    // Create transaction record
    [transaction] = await db.insert(portfolioTransactions).values({
      portfolioId,
      holdingId: holding.id,
      symbol: upperSymbol,
      type: 'buy',
      quantity: qty.toString(),
      price: price.toFixed(2),
      totalAmount: (qty * price).toFixed(2),
      executedAt: executedAt ? new Date(executedAt) : new Date(),
      notes: notes || null,
    }).returning();

    return NextResponse.json({ holding, transaction }, { status: 201 });
  } catch (error) {
    console.error('Error adding holding:', error);
    return NextResponse.json({ error: 'Failed to add holding' }, { status: 500 });
  }
}
