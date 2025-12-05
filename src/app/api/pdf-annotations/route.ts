/**
 * PDF Annotations API
 * Handles saving and loading PDF highlights and annotations
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { db } from '@/lib/db'
import { users, pdfAnnotations } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

// GET /api/pdf-annotations?symbol=AAPL
export async function GET(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')

    if (!symbol) {
      return NextResponse.json({ error: 'Symbol is required' }, { status: 400 })
    }

    // Get all annotations for this user and symbol
    const annotations = await db.query.pdfAnnotations.findMany({
      where: and(
        eq(pdfAnnotations.userId, user.id),
        eq(pdfAnnotations.symbol, symbol.toUpperCase())
      ),
    })

    return NextResponse.json({
      success: true,
      annotations,
    })
  } catch (error) {
    console.error('Get annotations error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/pdf-annotations
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const body = await request.json()
    const { symbol, text, color, position, note, reportType } = body

    if (!symbol || !text || !color || !position) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create annotation
    const [annotation] = await db.insert(pdfAnnotations).values({
      userId: user.id,
      symbol: symbol.toUpperCase(),
      text,
      color,
      position,
      note: note || null,
      reportType: reportType || 'standard',
    }).returning()

    return NextResponse.json({
      success: true,
      annotation,
    })
  } catch (error) {
    console.error('Create annotation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/pdf-annotations?id=xxx
export async function DELETE(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const user = await db.query.users.findFirst({
      where: eq(users.clerkId, clerkUserId),
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { searchParams } = new URL(request.url)
    const annotationId = searchParams.get('id')

    if (!annotationId) {
      return NextResponse.json({ error: 'Annotation ID is required' }, { status: 400 })
    }

    // Delete annotation (only if it belongs to this user)
    await db.delete(pdfAnnotations).where(
      and(
        eq(pdfAnnotations.id, annotationId),
        eq(pdfAnnotations.userId, user.id)
      )
    )

    return NextResponse.json({
      success: true,
      message: 'Annotation deleted',
    })
  } catch (error) {
    console.error('Delete annotation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
