import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contactMessages } from '@/lib/db/schema'
import { headers } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, subject, message } = body

    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Name, email, and message are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Get IP and User Agent for spam prevention
    const headersList = await headers()
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0] || 
                      headersList.get('x-real-ip') || 
                      'unknown'
    const userAgent = headersList.get('user-agent') || 'unknown'

    // Create the contact message
    const [newMessage] = await db.insert(contactMessages).values({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      subject: subject?.trim() || null,
      message: message.trim(),
      ipAddress,
      userAgent,
    }).returning()

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      id: newMessage.id,
    })
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    )
  }
}
