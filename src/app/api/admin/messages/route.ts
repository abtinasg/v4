import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { contactMessages } from '@/lib/db/schema'
import { eq, desc, asc, like, count, or, sql } from 'drizzle-orm'
import { getAdminSession } from '@/lib/admin/auth'

// GET - Fetch all contact messages
export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const offset = (page - 1) * limit

    // Build query
    let query = db.select().from(contactMessages)

    // Apply filters
    const conditions = []
    if (search) {
      conditions.push(
        or(
          like(contactMessages.email, `%${search}%`),
          like(contactMessages.name, `%${search}%`),
          like(contactMessages.subject, `%${search}%`)
        )
      )
    }
    if (status && ['new', 'read', 'replied', 'archived'].includes(status)) {
      conditions.push(eq(contactMessages.status, status as any))
    }

    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : sql`${conditions[0]} AND ${conditions[1]}`) as typeof query
    }

    // Apply sorting
    const orderBy = sortOrder === 'asc' ? asc(contactMessages.createdAt) : desc(contactMessages.createdAt)
    query = query.orderBy(orderBy).limit(limit).offset(offset) as typeof query

    // Get total count
    let countQuery = db.select({ count: count() }).from(contactMessages)
    if (conditions.length > 0) {
      countQuery = countQuery.where(conditions.length === 1 ? conditions[0] : sql`${conditions[0]} AND ${conditions[1]}`) as typeof countQuery
    }
    const totalResult = await countQuery
    const total = totalResult[0]?.count || 0

    // Get stats
    const statsResult = await db.select({
      status: contactMessages.status,
      count: count(),
    }).from(contactMessages).groupBy(contactMessages.status)

    const stats = {
      new: 0,
      read: 0,
      replied: 0,
      archived: 0,
    }
    statsResult.forEach(s => {
      stats[s.status as keyof typeof stats] = s.count
    })

    const messages = await query

    return NextResponse.json({
      messages,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      stats,
    })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 })
  }
}

// PATCH - Update message status or add reply
export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, status, adminReply } = body

    if (!id) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 })
    }

    const updateData: any = {
      updatedAt: new Date(),
    }

    if (status && ['new', 'read', 'replied', 'archived'].includes(status)) {
      updateData.status = status
    }

    if (adminReply !== undefined) {
      updateData.adminReply = adminReply
      updateData.repliedAt = new Date()
      updateData.status = 'replied'
    }

    const [updated] = await db.update(contactMessages)
      .set(updateData)
      .where(eq(contactMessages.id, id))
      .returning()

    return NextResponse.json({ success: true, message: updated })
  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json({ error: 'Failed to update message' }, { status: 500 })
  }
}

// DELETE - Delete a message
export async function DELETE(request: NextRequest) {
  try {
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Message ID required' }, { status: 400 })
    }

    await db.delete(contactMessages).where(eq(contactMessages.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting message:', error)
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 })
  }
}
