import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { portfolios, portfolioHoldings, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const runtime = 'nodejs';

interface CSVRow {
  symbol: string;
  quantity: number;
  avgBuyPrice: number;
  purchaseDate?: string;
}

/**
 * POST /api/portfolio/[id]/import-csv
 * Import holdings from CSV file
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get internal user ID from Clerk ID
    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkId),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    const { id: portfolioId } = await params;

    // Verify portfolio ownership
    const portfolio = await db
      .select()
      .from(portfolios)
      .where(
        and(
          eq(portfolios.id, portfolioId),
          eq(portfolios.userId, user.id)
        )
      )
      .limit(1);

    if (!portfolio.length) {
      return NextResponse.json(
        { success: false, error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    const body = await req.json();
    const { data, clearExisting } = body;

    if (!data || !Array.isArray(data)) {
      return NextResponse.json(
        { success: false, error: 'Invalid CSV data' },
        { status: 400 }
      );
    }

    // Clear existing holdings if requested
    if (clearExisting) {
      await db
        .delete(portfolioHoldings)
        .where(eq(portfolioHoldings.portfolioId, portfolioId));
    }

    // Insert new holdings
    let successCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    for (const row of data as CSVRow[]) {
      try {
        if (!row.symbol || !row.quantity || !row.avgBuyPrice) {
          errors.push(`Invalid row: ${JSON.stringify(row)}`);
          failedCount++;
          continue;
        }

        await db.insert(portfolioHoldings).values({
          userId: user.id,
          portfolioId,
          symbol: row.symbol.toUpperCase(),
          quantity: row.quantity.toString(),
          avgBuyPrice: row.avgBuyPrice.toString(),
        });

        successCount++;
      } catch (error) {
        console.error(`Error importing holding ${row.symbol}:`, error);
        errors.push(`Failed to import ${row.symbol}`);
        failedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      imported: successCount,
      failed: failedCount,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error('[Portfolio CSV Import] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to import CSV',
      },
      { status: 500 }
    );
  }
}
