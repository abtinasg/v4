/**
 * Abtin Daily Tasks Management
 * GET /api/abtin/tasks - List tasks
 * POST /api/abtin/tasks - Create task
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/auth/abtin-enhanced-auth'
import {
  getUserTasks,
  getTodaysTasks,
  getPendingTasks,
  getTasksByDateRange,
  createTask,
  getTaskStatistics,
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
    
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    
    let tasks
    
    if (filter === 'today') {
      tasks = await getTodaysTasks(session.userId)
    } else if (filter === 'pending') {
      tasks = await getPendingTasks(session.userId)
    } else if (startDate && endDate) {
      tasks = await getTasksByDateRange(
        session.userId,
        new Date(startDate),
        new Date(endDate)
      )
    } else {
      tasks = await getUserTasks(session.userId)
    }
    
    // Get statistics
    const statistics = await getTaskStatistics(session.userId)
    
    return NextResponse.json({
      tasks,
      statistics,
    })
  } catch (error) {
    console.error('Get tasks error:', error)
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
    const {
      title,
      description,
      priority,
      status,
      category,
      tags,
      dueDate,
      estimatedMinutes,
      reminderAt,
    } = body
    
    if (!title) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      )
    }
    
    // Create task
    const task = await createTask({
      abtinUserId: session.userId,
      title,
      description: description || null,
      priority: priority || 'medium',
      status: status || 'pending',
      category: category || null,
      tags: tags || [],
      dueDate: dueDate ? new Date(dueDate) : null,
      estimatedMinutes: estimatedMinutes || null,
      reminderAt: reminderAt ? new Date(reminderAt) : null,
    })
    
    return NextResponse.json({
      success: true,
      task,
    })
  } catch (error) {
    console.error('Create task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
