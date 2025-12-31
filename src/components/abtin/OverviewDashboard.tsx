'use client'

import { useEffect, useState } from 'react'
import { Calendar, MessageSquare, CheckCircle2, TrendingUp, Clock, Target } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface DashboardStats {
  tasks: {
    total: number
    pending: number
    completed: number
    todayCount: number
  }
  chat: {
    totalSessions: number
    totalMessages: number
  }
}

interface Task {
  id: string
  title: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  dueDate: string | null
  status: string
}

export default function OverviewDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    tasks: {
      total: 0,
      pending: 0,
      completed: 0,
      todayCount: 0,
    },
    chat: {
      totalSessions: 0,
      totalMessages: 0,
    },
  })
  const [recentTasks, setRecentTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch tasks
      const tasksRes = await fetch('/api/abtin/tasks?filter=today')
      if (tasksRes.ok) {
        const tasksData = await tasksRes.json()
        setRecentTasks(tasksData.tasks.slice(0, 5))
        setStats(prev => ({
          ...prev,
          tasks: {
            total: tasksData.statistics.total,
            pending: tasksData.statistics.pending,
            completed: tasksData.statistics.completed,
            todayCount: tasksData.tasks.length,
          },
        }))
      }

      // Fetch chat sessions
      const sessionsRes = await fetch('/api/abtin/sessions')
      if (sessionsRes.ok) {
        const sessionsData = await sessionsRes.json()
        const totalMessages = sessionsData.sessions.reduce(
          (sum: number, s: { messageCount: number }) => sum + s.messageCount,
          0
        )
        setStats(prev => ({
          ...prev,
          chat: {
            totalSessions: sessionsData.sessions.length,
            totalMessages,
          },
        }))
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const priorityColors = {
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    urgent: 'bg-red-500/20 text-red-400 border-red-500/30',
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-3 h-3 bg-cyan-500 rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce [animation-delay:0.1s]" />
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce [animation-delay:0.2s]" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome Back! 👋
        </h1>
        <p className="text-white/60">
          Here's what's happening with your personal dashboard today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Today's Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-blue-400" />
            </div>
            <Link
              href="/abtin/planning"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              View all →
            </Link>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {stats.tasks.todayCount}
          </h3>
          <p className="text-sm text-white/60">Today's Tasks</p>
          <div className="mt-4 flex gap-2 text-xs">
            <span className="text-yellow-400">{stats.tasks.pending} pending</span>
            <span className="text-white/40">•</span>
            <span className="text-green-400">{stats.tasks.completed} completed</span>
          </div>
        </motion.div>

        {/* Chat Sessions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
              <MessageSquare className="w-6 h-6 text-purple-400" />
            </div>
            <Link
              href="/abtin/chat"
              className="text-sm text-white/60 hover:text-white transition-colors"
            >
              View all →
            </Link>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {stats.chat.totalSessions}
          </h3>
          <p className="text-sm text-white/60">Chat Conversations</p>
          <div className="mt-4 flex gap-2 text-xs">
            <span className="text-purple-400">{stats.chat.totalMessages} total messages</span>
          </div>
        </motion.div>

        {/* Completion Rate */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
              <Target className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white mb-1">
            {stats.tasks.total
              ? Math.round((stats.tasks.completed / stats.tasks.total) * 100)
              : 0}%
          </h3>
          <p className="text-sm text-white/60">Completion Rate</p>
          <div className="mt-4 w-full bg-white/[0.05] rounded-full h-2">
            <div
              className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full transition-all"
              style={{
                width: `${
                  stats.tasks.total
                    ? (stats.tasks.completed / stats.tasks.total) * 100
                    : 0
                }%`,
              }}
            />
          </div>
        </motion.div>
      </div>

      {/* Recent Tasks */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Today's Tasks
          </h2>
          <Link
            href="/abtin/planning"
            className="text-sm text-violet-400 hover:text-violet-300 transition-colors"
          >
            View all →
          </Link>
        </div>

        {recentTasks.length === 0 ? (
          <div className="text-center py-12 text-white/40">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No tasks scheduled for today</p>
            <Link
              href="/abtin/planning"
              className="text-sm text-violet-400 hover:text-violet-300 transition-colors mt-2 inline-block"
            >
              Create your first task
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {recentTasks.map((task, index) => (
              <motion.div
                key={task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.04] transition-colors"
              >
                <CheckCircle2
                  className={`w-5 h-5 flex-shrink-0 ${
                    task.status === 'completed' ? 'text-green-400' : 'text-white/20'
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{task.title}</p>
                  {task.dueDate && (
                    <p className="text-sm text-white/40 mt-1">
                      Due: {new Date(task.dueDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  )}
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    priorityColors[task.priority]
                  }`}
                >
                  {task.priority}
                </span>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Link
          href="/abtin/planning"
          className="p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20 rounded-2xl hover:border-blue-500/40 transition-all group"
        >
          <Calendar className="w-8 h-8 text-blue-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-semibold text-white mb-1">Plan Your Day</h3>
          <p className="text-sm text-white/60">Organize tasks and schedule</p>
        </Link>

        <Link
          href="/abtin/chat"
          className="p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 rounded-2xl hover:border-purple-500/40 transition-all group"
        >
          <MessageSquare className="w-8 h-8 text-purple-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-semibold text-white mb-1">Start Chat</h3>
          <p className="text-sm text-white/60">AI psychology sessions</p>
        </Link>

        <Link
          href="/abtin/portfolio"
          className="p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-2xl hover:border-green-500/40 transition-all group"
        >
          <TrendingUp className="w-8 h-8 text-green-400 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="text-lg font-semibold text-white mb-1">View Portfolio</h3>
          <p className="text-sm text-white/60">Financial overview</p>
        </Link>
      </motion.div>
    </div>
  )
}
