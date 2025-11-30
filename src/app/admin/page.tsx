'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Users, 
  List, 
  Bell, 
  MessageSquare, 
  TrendingUp, 
  RefreshCcw,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Calendar
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AdminStats {
  overview: {
    totalUsers: number
    totalWatchlists: number
    totalWatchlistItems: number
    totalAlerts: number
    activeAlerts: number
    totalChats: number
  }
  growth: {
    usersThisMonth: number
    usersThisWeek: number
    usersToday: number
    chatsThisWeek: number
    growthRate: string
  }
  subscriptionDistribution: Record<string, number>
  recentUsers: Array<{
    id: string
    email: string
    subscriptionTier: string
    createdAt: string
  }>
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchStats = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/stats')
      if (!res.ok) throw new Error('Failed to fetch stats')
      const data = await res.json()
      setStats(data)
    } catch (err) {
      setError('Failed to load statistics')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-400">{error}</p>
        <Button onClick={fetchStats} variant="outline">
          Try Again
        </Button>
      </div>
    )
  }

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats?.overview.totalUsers || 0,
      icon: Users,
      color: 'emerald',
      subtext: `+${stats?.growth.usersThisWeek || 0} this week`,
      trend: 'up'
    },
    { 
      title: 'Watchlists', 
      value: stats?.overview.totalWatchlists || 0,
      icon: List,
      color: 'blue',
      subtext: `${stats?.overview.totalWatchlistItems || 0} items total`,
      trend: 'up'
    },
    { 
      title: 'Active Alerts', 
      value: stats?.overview.activeAlerts || 0,
      icon: Bell,
      color: 'amber',
      subtext: `${stats?.overview.totalAlerts || 0} total alerts`,
      trend: 'neutral'
    },
    { 
      title: 'AI Chats', 
      value: stats?.overview.totalChats || 0,
      icon: MessageSquare,
      color: 'purple',
      subtext: `+${stats?.growth.chatsThisWeek || 0} this week`,
      trend: 'up'
    },
    { 
      title: 'Growth Rate', 
      value: stats?.growth.growthRate || '0%',
      icon: TrendingUp,
      color: 'green',
      subtext: 'Month over month',
      trend: 'up'
    },
  ]

  const colorClasses = {
    emerald: 'from-emerald-400 to-emerald-600 shadow-emerald-500/30',
    blue: 'from-blue-400 to-blue-600 shadow-blue-500/30',
    amber: 'from-amber-400 to-amber-600 shadow-amber-500/30',
    purple: 'from-purple-400 to-purple-600 shadow-purple-500/30',
    green: 'from-green-400 to-green-600 shadow-green-500/30',
  }

  const tierColors: Record<string, string> = {
    free: 'bg-slate-500/20 text-slate-400',
    premium: 'bg-emerald-500/20 text-emerald-400',
    professional: 'bg-blue-500/20 text-blue-400',
    enterprise: 'bg-purple-500/20 text-purple-400',
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">Overview of your platform statistics</p>
        </div>
        <Button onClick={fetchStats} variant="outline" className="gap-2">
          <RefreshCcw className="w-4 h-4" />
          Refresh Data
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-slate-800/50 border-slate-700/50 hover:bg-slate-800/70 transition-colors">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[stat.color as keyof typeof colorClasses]} shadow-lg`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                {stat.trend === 'up' && (
                  <div className="flex items-center text-emerald-400 text-xs">
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                )}
                {stat.trend === 'down' && (
                  <div className="flex items-center text-red-400 text-xs">
                    <ArrowDownRight className="w-4 h-4" />
                  </div>
                )}
              </div>
              <div className="mt-4">
                <h3 className="text-3xl font-bold text-white">{stat.value.toLocaleString()}</h3>
                <p className="text-sm text-slate-400 mt-1">{stat.title}</p>
                <p className="text-xs text-slate-500 mt-2">{stat.subtext}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subscription Distribution */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Subscription Tiers</CardTitle>
            <CardDescription>Distribution of user subscriptions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(stats?.subscriptionDistribution || {}).map(([tier, count]) => {
                const total = stats?.overview.totalUsers || 1
                const percentage = ((count / total) * 100).toFixed(1)
                
                return (
                  <div key={tier} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className={tierColors[tier] || tierColors.free}>
                          {tier}
                        </Badge>
                      </div>
                      <span className="text-sm text-slate-400">{count} users ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-500 ${
                          tier === 'enterprise' ? 'bg-purple-500' :
                          tier === 'professional' ? 'bg-blue-500' :
                          tier === 'premium' ? 'bg-emerald-500' : 'bg-slate-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white">Recent Users</CardTitle>
            <CardDescription>Latest registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recentUsers?.slice(0, 6).map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-medium">
                      {user.email?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white truncate max-w-[200px]">
                        {user.email || 'Unknown'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Clock className="w-3 h-3" />
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </div>
                  <Badge className={tierColors[user.subscriptionTier] || tierColors.free}>
                    {user.subscriptionTier || 'free'}
                  </Badge>
                </div>
              ))}
              
              {(!stats?.recentUsers || stats.recentUsers.length === 0) && (
                <div className="text-center py-8 text-slate-400">
                  <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No users yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Stats */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Activity Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-slate-700/30">
              <p className="text-3xl font-bold text-white">{stats?.growth.usersToday || 0}</p>
              <p className="text-sm text-slate-400 mt-1">New Today</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-700/30">
              <p className="text-3xl font-bold text-white">{stats?.growth.usersThisWeek || 0}</p>
              <p className="text-sm text-slate-400 mt-1">This Week</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-700/30">
              <p className="text-3xl font-bold text-white">{stats?.growth.usersThisMonth || 0}</p>
              <p className="text-sm text-slate-400 mt-1">This Month</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-slate-700/30">
              <p className="text-3xl font-bold text-white">{stats?.growth.chatsThisWeek || 0}</p>
              <p className="text-sm text-slate-400 mt-1">AI Chats (Week)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
