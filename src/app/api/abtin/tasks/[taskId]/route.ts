/**
 * Abtin Individual Task Management
 * PATCH /api/abtin/tasks/[taskId] - Update task
 * DELETE /api/abtin/tasks/[taskId] - Delete task
 */

import { NextRequest, NextResponse } from 'next/server'
import { verifySessionToken } from '@/lib/auth/abtin-enhanced-auth'
import { updateTask, deleteTask, completeTask } from '@/lib/db/abtin-queries'
import { db } from '@/lib/db'
import { abtinDailyTasks } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

async function verifyAuth(request: NextRequest) {
  const sessionToken = request.cookies.get('abtin_session')?.value
  
  if (!sessionToken) {
    return null
  }
  
  return await verifySessionToken(sessionToken)
}

async function getTask(taskId: string) {
  const tasks = await db
    .select()
    .from(abtinDailyTasks)
    .where(eq(abtinDailyTasks.id, taskId))
    .limit(1)
  
  return tasks.length > 0 ? tasks[0] : null
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await verifyAuth(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    const task = await getTask(params.taskId)
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }
    
    // Verify task belongs to user
    if (task.abtinUserId !== session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
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
      actualMinutes,
      reminderAt,
      complete,
    } = body
    
    // Handle complete action
    if (complete === true) {
      await completeTask(params.taskId)
    } else {
      // Update task
      await updateTask(params.taskId, {
        ...(title !== undefined && { title }),
        ...(description !== undefined && { description }),
        ...(priority !== undefined && { priority }),
        ...(status !== undefined && { status }),
        ...(category !== undefined && { category }),
        ...(tags !== undefined && { tags }),
        ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
        ...(estimatedMinutes !== undefined && { estimatedMinutes }),
        ...(actualMinutes !== undefined && { actualMinutes }),
        ...(reminderAt !== undefined && { reminderAt: reminderAt ? new Date(reminderAt) : null }),
      })
    }
    
    // Get updated task
    const updatedTask = await getTask(params.taskId)
    
    return NextResponse.json({
      success: true,
      task: updatedTask,
    })
  } catch (error) {
    console.error('Update task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { taskId: string } }
) {
  try {
    const session = await verifyAuth(request)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }
    
    const task = await getTask(params.taskId)
    
    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      )
    }
    
    // Verify task belongs to user
    if (task.abtinUserId !== session.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }
    
    // Delete task
    await deleteTask(params.taskId)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete task error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
