import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { sendEmail } from '@/lib/email'
import { terminalProVisitEmail } from '@/lib/email/templates'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Admin email to receive notifications
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@deepterminal.io'

export async function POST() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const userName = user.firstName 
      ? `${user.firstName} ${user.lastName || ''}`.trim()
      : user.username || 'Unknown User'
    
    const userEmail = user.emailAddresses[0]?.emailAddress || 'No email'
    
    const visitTime = new Date().toLocaleString('en-US', {
      timeZone: 'America/New_York',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })

    // Send notification email to admin
    const result = await sendEmail({
      to: ADMIN_EMAIL,
      subject: `🖥️ Terminal Pro Access: ${userName}`,
      html: terminalProVisitEmail(userName, userEmail, visitTime),
    })

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Notification sent' })
    } else {
      console.error('Failed to send email:', result.error)
      return NextResponse.json({ success: false, error: 'Failed to send notification' }, { status: 500 })
    }
  } catch (error) {
    console.error('Terminal Pro notification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
