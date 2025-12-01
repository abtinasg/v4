import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { sendEmail } from '@/lib/email'
import { lowCreditsEmail } from '@/lib/email/templates'
import { db } from '@/lib/db'
import { userCredits, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Default threshold for low credits warning
const DEFAULT_LOW_CREDIT_THRESHOLD = 10

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const threshold = body.threshold || DEFAULT_LOW_CREDIT_THRESHOLD

    // Get user credits
    const credits = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1)

    if (!credits.length) {
      return NextResponse.json({ error: 'User credits not found' }, { status: 404 })
    }

    const currentCredits = Number(credits[0].balance)

    // Only send if credits are actually low
    if (currentCredits > threshold) {
      return NextResponse.json({ 
        success: false, 
        message: 'Credits are above threshold',
        currentCredits,
        threshold 
      })
    }

    // Get user info
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1)

    if (!user.length || !user[0].email) {
      return NextResponse.json({ error: 'User email not found' }, { status: 404 })
    }

    // Get name from email (before @)
    const userName = user[0].email.split('@')[0] || 'User'
    const userEmail = user[0].email

    const result = await sendEmail({
      to: userEmail,
      subject: '⚠️ Your Deep Terminal Credits Are Running Low',
      html: lowCreditsEmail(userName, currentCredits, threshold),
    })

    if (result.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Low credits notification sent',
        currentCredits,
        threshold 
      })
    } else {
      console.error('Failed to send low credits notification:', result.error)
      return NextResponse.json({ success: false, error: 'Failed to send notification' }, { status: 500 })
    }
  } catch (error) {
    console.error('Low credits notification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET endpoint to check credits without sending email
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const credits = await db
      .select()
      .from(userCredits)
      .where(eq(userCredits.userId, userId))
      .limit(1)

    if (!credits.length) {
      return NextResponse.json({ error: 'User credits not found' }, { status: 404 })
    }

    const currentCredits = Number(credits[0].balance)
    const isLow = currentCredits <= DEFAULT_LOW_CREDIT_THRESHOLD

    return NextResponse.json({
      currentCredits,
      threshold: DEFAULT_LOW_CREDIT_THRESHOLD,
      isLow
    })
  } catch (error) {
    console.error('Credits check error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
