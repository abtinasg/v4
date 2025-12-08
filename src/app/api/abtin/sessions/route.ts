/**
 * Abtin Chat Sessions Management
 * GET /api/abtin/sessions - List all sessions
 * POST /api/abtin/sessions - Create new session
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/auth/abtin-enhanced-auth'
import {
  getChatSessions,
  createChatSession,
  getChatMessageCount,
} from '@/lib/db/abtin-queries'

async function verifyAuth(request: NextRequest) {
  const sessionToken = request.cookies.get('abtin_session')?.value
  
  if (!sessionToken) {
    return null
  }
  
  return await verifySessionToken(sessionToken)
}

export async function GET(request: NextRequest) {
  try {
    const session = await verifyAuth(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    // Get all chat sessions for the user
    const sessions = await getChatSessions(session.userId)
    
    // Add message count to each session
    const sessionsWithCount = await Promise.all(
      sessions.map(async (s) => ({
        ...s,
        messageCount: await getChatMessageCount(s.id),
      }))
    )
    
    return NextResponse.json({ sessions: sessionsWithCount })
  } catch (error) {
    console.error('Get sessions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifyAuth(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    const { title, mode, model } = body
    
    // Create new chat session
    const newSession = await createChatSession({
      abtinUserId: session.userId,
      title: title || 'New Chat',
      mode: mode || 'brainstorm',
      model: model || 'openai/gpt-5.1',
    })
    
    return NextResponse.json({
      success: true,
      session: {
        ...newSession,
        messageCount: 0,
      },
    })
  } catch (error) {
    console.error('Create session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
