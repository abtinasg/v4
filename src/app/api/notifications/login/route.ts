import { NextRequest, NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { loginNotificationEmail } from '@/lib/email/templates'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, userName, userEmail, device, location, ipAddress } = body

    if (!userId || !userEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const loginTime = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const result = await sendEmail({
      to: userEmail,
      subject: '🔐 New Login to Your Deep Terminal Account',
      html: loginNotificationEmail(
        userName || 'User',
        loginTime,
        device || 'Unknown Device',
        location || 'Unknown Location',
        ipAddress || 'Unknown IP'
      ),
    })

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Login notification sent' })
    } else {
      console.error('Failed to send login notification:', result.error)
      return NextResponse.json({ success: false, error: 'Failed to send notification' }, { status: 500 })
    }
  } catch (error) {
    console.error('Login notification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
