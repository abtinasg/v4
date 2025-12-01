import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, watchlists, watchlistItems, stockAlerts, chatHistory, userPreferences } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { getAdminSession } from '@/lib/admin/auth'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Get user with all related data
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
      with: {
        watchlists: {
          with: {
            items: true,
          },
          orderBy: [desc(watchlists.createdAt)],
        },
        stockAlerts: {
          orderBy: [desc(stockAlerts.createdAt)],
        },
        preferences: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get chat history separately with limit
    const chats = await db.select()
      .from(chatHistory)
      .where(eq(chatHistory.userId, id))
      .orderBy(desc(chatHistory.createdAt))
      .limit(50)

    return NextResponse.json({
      user: {
        ...user,
        chatHistory: chats,
      }
    })
  } catch (error) {
    console.error('Admin get user error:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { email } = body

    // Build update object (credit-based system - no tier updates)
    const updateData: Record<string, any> = {
      updatedAt: new Date(),
    }

    if (email) updateData.email = email

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning()

    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ user: updatedUser })
  } catch (error) {
    console.error('Admin update user error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check admin authentication
    const session = await getAdminSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    // Check if user exists
    const existingUser = await db.query.users.findFirst({
      where: eq(users.id, id),
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Delete user (cascades will handle related data)
    await db.delete(users).where(eq(users.id, id))

    return NextResponse.json({ success: true, message: 'User deleted successfully' })
  } catch (error) {
    console.error('Admin delete user error:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
