import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { portfolios, holdings } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

export const runtime = 'nodejs';

const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';
const PLAID_BASE_URL = PLAID_ENV === 'production' 
  ? 'https://production.plaid.com'
  : PLAID_ENV === 'development'
  ? 'https://development.plaid.com'
  : 'https://sandbox.plaid.com';

/**
 * POST /api/portfolio/broker/exchange-token
 * Exchange public token for access token and sync holdings
 */
export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const clientId = process.env.PLAID_CLIENT_ID;
    const secret = process.env.PLAID_SECRET;

    if (!clientId || !secret) {
      return NextResponse.json({
        success: false,
        error: 'Plaid is not configured',
      }, { status: 400 });
    }

    const body = await req.json();
    const { publicToken, portfolioId, institutionName } = body;

    if (!publicToken || !portfolioId) {
      return NextResponse.json({
        success: false,
        error: 'Missing required fields',
      }, { status: 400 });
    }

    // Verify portfolio ownership
    const portfolio = await db
      .select()
      .from(portfolios)
      .where(
        and(
          eq(portfolios.id, portfolioId),
          eq(portfolios.userId, userId)
        )
      )
      .limit(1);

    if (!portfolio.length) {
      return NextResponse.json(
        { success: false, error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Exchange public token for access token
    const tokenResponse = await fetch(`${PLAID_BASE_URL}/item/public_token/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        secret: secret,
        public_token: publicToken,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('[Plaid] Token exchange error:', tokenData);
      return NextResponse.json({
        success: false,
        error: tokenData.error_message || 'Failed to exchange token',
      }, { status: 500 });
    }

    const accessToken = tokenData.access_token;
    const itemId = tokenData.item_id;

    // Get investment holdings
    const holdingsResponse = await fetch(`${PLAID_BASE_URL}/investments/holdings/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        secret: secret,
        access_token: accessToken,
      }),
    });

    const holdingsData = await holdingsResponse.json();

    if (!holdingsResponse.ok) {
      console.error('[Plaid] Holdings error:', holdingsData);
      return NextResponse.json({
        success: false,
        error: holdingsData.error_message || 'Failed to fetch holdings',
      }, { status: 500 });
    }

    // Map securities for easy lookup
    const securitiesMap = new Map();
    for (const security of holdingsData.securities || []) {
      securitiesMap.set(security.security_id, security);
    }

    // Import holdings into portfolio
    let importedCount = 0;
    for (const holding of holdingsData.holdings || []) {
      const security = securitiesMap.get(holding.security_id);
      
      // Only import stocks/ETFs with ticker symbols
      if (!security?.ticker_symbol) continue;
      if (!['equity', 'etf', 'mutual fund'].includes(security.type?.toLowerCase())) continue;

      try {
        const avgPrice = holding.cost_basis 
          ? holding.cost_basis / holding.quantity 
          : holding.institution_price;

        await db.insert(holdings).values({
          id: crypto.randomUUID(),
          portfolioId,
          symbol: security.ticker_symbol.toUpperCase(),
          quantity: holding.quantity.toString(),
          avgBuyPrice: avgPrice.toString(),
          purchaseDate: new Date().toISOString(),
          notes: `Synced from ${institutionName || 'broker'}`,
        });

        importedCount++;
      } catch (error) {
        console.error(`Error importing ${security.ticker_symbol}:`, error);
      }
    }

    // TODO: Store access token for future syncs
    // This should be encrypted and stored in a broker_connections table

    return NextResponse.json({
      success: true,
      imported: importedCount,
      total: holdingsData.holdings?.length || 0,
      accounts: holdingsData.accounts?.length || 0,
      message: `Successfully imported ${importedCount} holdings from ${institutionName || 'broker'}`,
    });
  } catch (error) {
    console.error('[Broker Exchange Token] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to sync broker',
      },
      { status: 500 }
    );
  }
}
