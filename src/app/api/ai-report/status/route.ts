/**
 * AI Report Status API
 * 
 * GET /api/ai-report/status?symbol=AAPL&type=pro
 * Returns the status of a report (pending, generating, completed, failed)
 * 
 * GET /api/ai-report/[id]
 * Returns a specific report by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { userQueries, aiReportQueries } from '@/lib/db/queries';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await userQueries.getByClerkId(clerkId);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get('symbol');
    const type = searchParams.get('type') as 'pro' | 'retail' | 'personalized' | null;

    if (!symbol || !type) {
      return NextResponse.json({ error: 'Missing symbol or type parameter' }, { status: 400 });
    }

    // First check for pending/generating report
    const pendingReport = await aiReportQueries.getPending(user.id, symbol, type);
    if (pendingReport) {
      return NextResponse.json({
        exists: true,
        status: pendingReport.status,
        reportId: pendingReport.id,
        content: pendingReport.content || '',
        createdAt: pendingReport.createdAt,
      });
    }

    // Then check for completed report that hasn't expired
    const activeReport = await aiReportQueries.getActive(user.id, symbol, type);
    if (activeReport) {
      return NextResponse.json({
        exists: true,
        status: activeReport.status,
        reportId: activeReport.id,
        content: activeReport.content || '',
        metadata: activeReport.metadata,
        createdAt: activeReport.createdAt,
        expiresAt: activeReport.expiresAt,
      });
    }

    // No report found
    return NextResponse.json({
      exists: false,
      status: null,
      reportId: null,
    });

  } catch (error) {
    console.error('[AI Report Status] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
