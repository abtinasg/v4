import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';

export const runtime = 'nodejs';

const PLAID_ENV = process.env.PLAID_ENV || 'sandbox';
const PLAID_BASE_URL = PLAID_ENV === 'production' 
  ? 'https://production.plaid.com'
  : PLAID_ENV === 'development'
  ? 'https://development.plaid.com'
  : 'https://sandbox.plaid.com';

/**
 * POST /api/portfolio/broker/link-token
 * Create a Plaid Link token for connecting a broker
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
        error: 'Plaid is not configured. Please add PLAID_CLIENT_ID and PLAID_SECRET to environment variables.',
        configured: false,
      });
    }

    const body = await req.json().catch(() => ({}));
    const { portfolioId } = body;

    // Create Link token
    const response = await fetch(`${PLAID_BASE_URL}/link/token/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        secret: secret,
        user: {
          client_user_id: userId,
        },
        client_name: 'Deep Terminal',
        products: ['investments'],
        country_codes: ['US'],
        language: 'en',
        webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/portfolio/broker/webhook`,
        redirect_uri: process.env.PLAID_REDIRECT_URI,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('[Plaid] Link token error:', data);
      return NextResponse.json({
        success: false,
        error: data.error_message || 'Failed to create link token',
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      linkToken: data.link_token,
      expiration: data.expiration,
    });
  } catch (error) {
    console.error('[Broker Link Token] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create link token',
      },
      { status: 500 }
    );
  }
}
