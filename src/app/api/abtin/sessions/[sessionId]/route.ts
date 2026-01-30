/**
 * Abtin Individual Chat Session Management
 * GET /api/abtin/sessions/[sessionId] - Get session details and messages
 * PATCH /api/abtin/sessions/[sessionId] - Update session
 * DELETE /api/abtin/sessions/[sessionId] - Delete session
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/auth/abtin-enhanced-auth'
import {
  getChatSession,
  getChatMessages,
  updateChatSession,
  deleteChatSession,
} from '@/lib/db/abtin-queries'

async function verifyAuth(request: NextRequest) {
  const sessionToken = request.cookies.get('abtin_session')?.value
  
  if (!sessionToken) {
    return null
  }
  
  return await verifySessionToken(sessionToken)
}

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await verifyAuth(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    const chatSession = await getChatSession(params.sessionId)
    
    if (!chatSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }
    
    // Verify session belongs to user
    if (chatSession.abtinUserId !== session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    // Get messages for this session
    const messages = await getChatMessages(params.sessionId)
    
    return NextResponse.json({
      session: chatSession,
      messages,
    })
  } catch (error) {
    console.error('Get session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await verifyAuth(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    const chatSession = await getChatSession(params.sessionId)
    
    if (!chatSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }
    
    // Verify session belongs to user
    if (chatSession.abtinUserId !== session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    const { title, mode, model, isPinned } = body
    
    // Update session
    await updateChatSession(params.sessionId, {
      ...(title !== undefined && { title }),
      ...(mode !== undefined && { mode }),
      ...(model !== undefined && { model }),
      ...(isPinned !== undefined && { isPinned }),
    })
    
    // Get updated session
    const updatedSession = await getChatSession(params.sessionId)
    
    return NextResponse.json({
      success: true,
      session: updatedSession,
    })
  } catch (error) {
    console.error('Update session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const session = await verifyAuth(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    const chatSession = await getChatSession(params.sessionId)
    
    if (!chatSession) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      )
    }
    
    // Verify session belongs to user
    if (chatSession.abtinUserId !== session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    // Delete session (messages will cascade)
    await deleteChatSession(params.sessionId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
