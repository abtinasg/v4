import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { portfolios, portfolioAlerts, users } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

interface RouteParams {
  params: Promise<{ id: string; alertId: string }>;
}

// Update an alert
export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth();
    const { id: portfolioId, alertId } = await params;
    
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

    // Check if alert exists
    const existingAlert = await db.query.portfolioAlerts.findFirst({
      where: and(
        eq(portfolioAlerts.id, alertId),
        eq(portfolioAlerts.portfolioId, portfolioId)
      ),
    });

    if (!existingAlert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    const body = await request.json();
    const { 
      isActive,
      conditionValue,
      conditionPercent,
      message,
      isEmailEnabled,
      isPushEnabled,
    } = body;

    const [updatedAlert] = await db.update(portfolioAlerts)
      .set({
        isActive: isActive !== undefined ? isActive : existingAlert.isActive,
        conditionValue: conditionValue !== undefined ? conditionValue?.toString() : existingAlert.conditionValue,
        conditionPercent: conditionPercent !== undefined ? conditionPercent?.toString() : existingAlert.conditionPercent,
        message: message !== undefined ? message : existingAlert.message,
        isEmailEnabled: isEmailEnabled !== undefined ? isEmailEnabled : existingAlert.isEmailEnabled,
        isPushEnabled: isPushEnabled !== undefined ? isPushEnabled : existingAlert.isPushEnabled,
        updatedAt: new Date(),
      })
      .where(eq(portfolioAlerts.id, alertId))
      .returning();

    return NextResponse.json({ alert: updatedAlert });
  } catch (error) {
    console.error('Error updating alert:', error);
    return NextResponse.json({ error: 'Failed to update alert' }, { status: 500 });
  }
}

// Delete an alert
export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { userId: clerkId } = await auth();
    const { id: portfolioId, alertId } = await params;
    
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

    // Check if alert exists
    const existingAlert = await db.query.portfolioAlerts.findFirst({
      where: and(
        eq(portfolioAlerts.id, alertId),
        eq(portfolioAlerts.portfolioId, portfolioId)
      ),
    });

    if (!existingAlert) {
      return NextResponse.json({ error: 'Alert not found' }, { status: 404 });
    }

    await db.delete(portfolioAlerts).where(eq(portfolioAlerts.id, alertId));

    return NextResponse.json({ success: true, message: 'Alert deleted successfully' });
  } catch (error) {
    console.error('Error deleting alert:', error);
    return NextResponse.json({ error: 'Failed to delete alert' }, { status: 500 });
  }
}
