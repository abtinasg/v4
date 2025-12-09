/**
 * Database queries for Abtin Personal Dashboard
 */

import { db } from '@/lib/db'
import {
  abtinChatSessions,
  abtinChatMessages,
  abtinDailyTasks,
  abtinUserSettings,
  type AbtinChatSession,
  type AbtinChatMessage,
  type AbtinDailyTask,
  type AbtinUserSettings,
  type NewAbtinChatSession,
  type NewAbtinChatMessage,
  type NewAbtinDailyTask,
} from '@/lib/db/schema'
import { eq, desc, and, gte, lte, sql } from 'drizzle-orm'

// ==================== CHAT SESSIONS ====================

/**
 * Get all chat sessions for a user
 */
export async function getChatSessions(userId: string): Promise<AbtinChatSession[]> {
  return await db
    .select()
    .from(abtinChatSessions)
    .where(eq(abtinChatSessions.abtinUserId, userId))
    .orderBy(desc(abtinChatSessions.lastMessageAt), desc(abtinChatSessions.createdAt))
}

/**
 * Get a specific chat session
 */
export async function getChatSession(sessionId: string): Promise<AbtinChatSession | null> {
  const sessions = await db
    .select()
    .from(abtinChatSessions)
    .where(eq(abtinChatSessions.id, sessionId))
    .limit(1)
  
  return sessions.length > 0 ? sessions[0] : null
}

/**
 * Create a new chat session
 */
export async function createChatSession(
  data: NewAbtinChatSession
): Promise<AbtinChatSession> {
  const result = await db
    .insert(abtinChatSessions)
    .values(data)
    .returning()
  
  return result[0]
}

/**
 * Update chat session
 */
export async function updateChatSession(
  sessionId: string,
  data: Partial<AbtinChatSession>
): Promise<void> {
  await db
    .update(abtinChatSessions)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(abtinChatSessions.id, sessionId))
}

/**
 * Delete chat session (and all messages cascade)
 */
export async function deleteChatSession(sessionId: string): Promise<void> {
  await db
    .delete(abtinChatSessions)
    .where(eq(abtinChatSessions.id, sessionId))
}

// ==================== CHAT MESSAGES ====================

/**
 * Get messages for a chat session
 */
export async function getChatMessages(sessionId: string): Promise<AbtinChatMessage[]> {
  return await db
    .select()
    .from(abtinChatMessages)
    .where(eq(abtinChatMessages.sessionId, sessionId))
    .orderBy(abtinChatMessages.createdAt)
}

/**
 * Get recent messages for context (last N messages)
 */
export async function getRecentChatMessages(
  sessionId: string,
  limit: number = 20
): Promise<AbtinChatMessage[]> {
  return await db
    .select()
    .from(abtinChatMessages)
    .where(eq(abtinChatMessages.sessionId, sessionId))
    .orderBy(desc(abtinChatMessages.createdAt))
    .limit(limit)
    .then(messages => messages.reverse()) // Return in chronological order
}

/**
 * Add message to chat session
 */
export async function addChatMessage(
  data: NewAbtinChatMessage
): Promise<AbtinChatMessage> {
  const result = await db
    .insert(abtinChatMessages)
    .values(data)
    .returning()
  
  // Update session's lastMessageAt
  await db
    .update(abtinChatSessions)
    .set({ lastMessageAt: new Date() })
    .where(eq(abtinChatSessions.id, data.sessionId))
  
  return result[0]
}

/**
 * Get message count for a session
 */
export async function getChatMessageCount(sessionId: string): Promise<number> {
  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(abtinChatMessages)
    .where(eq(abtinChatMessages.sessionId, sessionId))
  
  return result[0]?.count || 0
}

// ==================== DAILY TASKS ====================

/**
 * Get all tasks for a user
 */
export async function getUserTasks(userId: string): Promise<AbtinDailyTask[]> {
  return await db
    .select()
    .from(abtinDailyTasks)
    .where(eq(abtinDailyTasks.abtinUserId, userId))
    .orderBy(desc(abtinDailyTasks.dueDate), desc(abtinDailyTasks.priority))
}

/**
 * Get tasks for a specific date range
 */
export async function getTasksByDateRange(
  userId: string,
  startDate: Date,
  endDate: Date
): Promise<AbtinDailyTask[]> {
  return await db
    .select()
    .from(abtinDailyTasks)
    .where(
      and(
        eq(abtinDailyTasks.abtinUserId, userId),
        gte(abtinDailyTasks.dueDate, startDate),
        lte(abtinDailyTasks.dueDate, endDate)
      )
    )
    .orderBy(abtinDailyTasks.dueDate, abtinDailyTasks.priority)
}

/**
 * Get today's tasks
 */
export async function getTodaysTasks(userId: string): Promise<AbtinDailyTask[]> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)
  
  return await getTasksByDateRange(userId, today, tomorrow)
}

/**
 * Get pending tasks
 */
export async function getPendingTasks(userId: string): Promise<AbtinDailyTask[]> {
  return await db
    .select()
    .from(abtinDailyTasks)
    .where(
      and(
        eq(abtinDailyTasks.abtinUserId, userId),
        eq(abtinDailyTasks.status, 'pending')
      )
    )
    .orderBy(abtinDailyTasks.dueDate, desc(abtinDailyTasks.priority))
}

/**
 * Create a new task
 */
export async function createTask(data: NewAbtinDailyTask): Promise<AbtinDailyTask> {
  const result = await db
    .insert(abtinDailyTasks)
    .values(data)
    .returning()
  
  return result[0]
}

/**
 * Update a task
 */
export async function updateTask(
  taskId: string,
  data: Partial<AbtinDailyTask>
): Promise<void> {
  await db
    .update(abtinDailyTasks)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(abtinDailyTasks.id, taskId))
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<void> {
  await db
    .delete(abtinDailyTasks)
    .where(eq(abtinDailyTasks.id, taskId))
}

/**
 * Mark task as completed
 */
export async function completeTask(taskId: string): Promise<void> {
  await db
    .update(abtinDailyTasks)
    .set({
      status: 'completed',
      completedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(abtinDailyTasks.id, taskId))
}

// ==================== USER SETTINGS ====================

/**
 * Get user settings
 */
export async function getUserSettings(userId: string): Promise<AbtinUserSettings | null> {
  const settings = await db
    .select()
    .from(abtinUserSettings)
    .where(eq(abtinUserSettings.abtinUserId, userId))
    .limit(1)
  
  return settings.length > 0 ? settings[0] : null
}

/**
 * Create or update user settings
 */
export async function upsertUserSettings(
  userId: string,
  data: Partial<AbtinUserSettings>
): Promise<AbtinUserSettings> {
  const existing = await getUserSettings(userId)
  
  if (existing) {
    const result = await db
      .update(abtinUserSettings)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(abtinUserSettings.abtinUserId, userId))
      .returning()
    
    return result[0]
  } else {
    const result = await db
      .insert(abtinUserSettings)
      .values({ abtinUserId: userId, ...data })
      .returning()
    
    return result[0]
  }
}

/**
 * Get task statistics for a user
 */
export async function getTaskStatistics(userId: string): Promise<{
  total: number
  pending: number
  inProgress: number
  completed: number
  cancelled: number
}> {
  const tasks = await getUserTasks(userId)
  
  return {
    total: tasks.length,
    pending: tasks.filter(t => t.status === 'pending').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    cancelled: tasks.filter(t => t.status === 'cancelled').length,
  }
}
