'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  RefreshCcw, 
  Users, 
  MessageSquare,
  TrendingUp,
  Calendar,
  Loader2,
  Activity,
  Bell,
  Star,
  Download,
  Clock,
  Eye,
  PieChart,
  ArrowUp,
  ArrowDown
} from 'lucide-react'

interface DailyData {
  date: string
  users: number
  chats: number
  alerts: number
  watchlistItems: number
}

interface TopStock {
  symbol: string
  count: number
}

interface RecentActivity {
  type: 'chat' | 'alert'
  userId: string
  userEmail: string | null
  symbol?: string | null
  message?: string
  time: string
}

interface AnalyticsData {
  dailyTrends: DailyData[]
  topStocks: {
    watchlists: TopStock[]
    alerts: TopStock[]
  }
  engagement: {
    usersWithWatchlists: number
    usersWithAlerts: number
    usersWithChats: number
    totalUsers: number
  }
  recentActivity: RecentActivity[]
}

interface BasicStats {
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
}

export default function AdminAnalyticsPage() {
  const [basicStats, setBasicStats] = useState<BasicStats | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [days, setDays] = useState(7)
  const [exporting, setExporting] = useState<string | null>(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const [statsRes, analyticsRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch(`/api/admin/analytics?days=${days}`)
      ])
      
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setBasicStats(statsData)
      }
      
      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json()
        setAnalytics(analyticsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [days])

  const handleExport = async (type: string, format: string = 'csv') => {
    setExporting(type)
    try {
      const res = await fetch(`/api/admin/export?type=${type}&format=${format}`)
      if (res.ok) {
        if (format === 'csv') {
          const blob = await res.blob()
          const url = window.URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url
          a.download = `${type}_${new Date().toISOString().split('T')[0]}.csv`
          document.body.appendChild(a)
          a.click()
          window.URL.revokeObjectURL(url)
          a.remove()
        }
      }
    } catch (error) {
      console.error('Export error:', error)
    } finally {
      setExporting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  const maxChartValue = analytics?.dailyTrends 
    ? Math.max(...analytics.dailyTrends.map(d => d.users + d.chats))
    : 100

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Analytics Dashboard</h1>
          <p className="text-slate-400 mt-1">Deep insights into platform usage and trends</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm"
          >
            <option value={7}>Last 7 days</option>
            <option value={14}>Last 14 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
          <Button onClick={fetchData} variant="outline" className="gap-2">
            <RefreshCcw className="w-4 h-4" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <Users className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Total Users</p>
                <p className="text-2xl font-bold text-white">{basicStats?.overview.totalUsers || 0}</p>
                <p className="text-xs text-emerald-400 mt-1">
                  <ArrowUp className="w-3 h-3 inline" /> +{basicStats?.growth.usersThisWeek || 0} this week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Growth Rate</p>
                <p className="text-2xl font-bold text-white">{basicStats?.growth.growthRate || '0%'}</p>
                <p className="text-xs text-slate-400 mt-1">Month over month</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/20">
                <MessageSquare className="w-6 h-6 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">AI Chats</p>
                <p className="text-2xl font-bold text-white">{basicStats?.overview.totalChats || 0}</p>
                <p className="text-xs text-purple-400 mt-1">
                  +{basicStats?.growth.chatsThisWeek || 0} this week
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/20">
                <Bell className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Active Alerts</p>
                <p className="text-2xl font-bold text-white">{basicStats?.overview.activeAlerts || 0}</p>
                <p className="text-xs text-slate-400 mt-1">
                  of {basicStats?.overview.totalAlerts || 0} total
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Trends Chart */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Daily Activity Trends
          </CardTitle>
          <CardDescription>User registrations, chats, and alerts over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-72 flex items-end gap-1 overflow-x-auto pb-8">
            {analytics?.dailyTrends.map((day, index) => {
              const total = day.users + day.chats
              const height = maxChartValue > 0 ? (total / maxChartValue) * 100 : 0
              const date = new Date(day.date)
              const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' })
              const dateLabel = date.getDate()
              
              return (
                <div key={day.date} className="flex-1 min-w-[40px] flex flex-col items-center gap-1 group relative">
                  {/* Tooltip */}
                  <div className="absolute bottom-full mb-2 hidden group-hover:block bg-slate-700 rounded-lg p-2 text-xs z-10 whitespace-nowrap">
                    <p className="text-white font-medium">{date.toLocaleDateString()}</p>
                    <p className="text-emerald-400">Users: {day.users}</p>
                    <p className="text-purple-400">Chats: {day.chats}</p>
                    <p className="text-amber-400">Alerts: {day.alerts}</p>
                    <p className="text-blue-400">Watchlist: {day.watchlistItems}</p>
                  </div>
                  
                  {/* Stacked Bar */}
                  <div 
                    className="w-full flex flex-col-reverse rounded-t-lg overflow-hidden transition-all duration-300"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  >
                    <div 
                      className="bg-emerald-500 w-full"
                      style={{ height: day.users > 0 ? `${(day.users / (total || 1)) * 100}%` : '0%' }}
                    />
                    <div 
                      className="bg-purple-500 w-full"
                      style={{ height: day.chats > 0 ? `${(day.chats / (total || 1)) * 100}%` : '0%' }}
                    />
                  </div>
                  
                  <div className="text-center">
                    <span className="text-xs text-slate-500">{dayLabel}</span>
                    <span className="text-xs text-slate-400 block">{dateLabel}</span>
                  </div>
                </div>
              )
            })}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-emerald-500 rounded" />
              <span className="text-xs text-slate-400">New Users</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded" />
              <span className="text-xs text-slate-400">Chats</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Engagement */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PieChart className="w-5 h-5" />
              User Engagement
            </CardTitle>
            <CardDescription>Feature usage among users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { 
                  label: 'Using Watchlists', 
                  value: analytics?.engagement.usersWithWatchlists || 0, 
                  total: analytics?.engagement.totalUsers || 1,
                  color: 'bg-emerald-500',
                  icon: Star
                },
                { 
                  label: 'Set Alerts', 
                  value: analytics?.engagement.usersWithAlerts || 0, 
                  total: analytics?.engagement.totalUsers || 1,
                  color: 'bg-amber-500',
                  icon: Bell
                },
                { 
                  label: 'Used AI Chat', 
                  value: analytics?.engagement.usersWithChats || 0, 
                  total: analytics?.engagement.totalUsers || 1,
                  color: 'bg-purple-500',
                  icon: MessageSquare
                },
              ].map((item) => {
                const percentage = ((item.value / item.total) * 100).toFixed(1)
                const Icon = item.icon
                
                return (
                  <div key={item.label} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-white">
                        <Icon className="w-4 h-4 text-slate-400" />
                        {item.label}
                      </span>
                      <span className="text-slate-400">{item.value} users ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${item.color} rounded-full transition-all duration-700`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Subscription Distribution */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5" />
              Subscription Breakdown
            </CardTitle>
            <CardDescription>Distribution of user tiers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(basicStats?.subscriptionDistribution || {}).map(([tier, count]) => {
                const total = basicStats?.overview.totalUsers || 1
                const percentage = ((count / total) * 100).toFixed(1)
                const colors: Record<string, string> = {
                  free: 'bg-slate-500',
                  premium: 'bg-emerald-500',
                  professional: 'bg-blue-500',
                  enterprise: 'bg-purple-500',
                }
                
                return (
                  <div key={tier} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize text-white">{tier}</span>
                      <span className="text-slate-400">{count} ({percentage}%)</span>
                    </div>
                    <div className="h-3 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${colors[tier] || colors.free} rounded-full transition-all duration-700`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top Stocks */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-emerald-400" />
              Top Watchlist Stocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.topStocks.watchlists.slice(0, 5).map((stock, index) => (
                <div key={stock.symbol} className="flex items-center justify-between p-2 rounded-lg bg-slate-700/30">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-mono text-sm w-4">{index + 1}</span>
                    <Badge variant="outline" className="font-mono">{stock.symbol}</Badge>
                  </div>
                  <span className="text-slate-400">{stock.count} users</span>
                </div>
              ))}
              {(!analytics?.topStocks.watchlists || analytics.topStocks.watchlists.length === 0) && (
                <p className="text-slate-500 text-center py-4">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-amber-400" />
              Top Alert Stocks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analytics?.topStocks.alerts.slice(0, 5).map((stock, index) => (
                <div key={stock.symbol} className="flex items-center justify-between p-2 rounded-lg bg-slate-700/30">
                  <div className="flex items-center gap-3">
                    <span className="text-slate-500 font-mono text-sm w-4">{index + 1}</span>
                    <Badge variant="outline" className="font-mono">{stock.symbol}</Badge>
                  </div>
                  <span className="text-slate-400">{stock.count} alerts</span>
                </div>
              ))}
              {(!analytics?.topStocks.alerts || analytics.topStocks.alerts.length === 0) && (
                <p className="text-slate-500 text-center py-4">No data yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest user actions on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {analytics?.recentActivity.map((activity, index) => (
              <div 
                key={index} 
                className="flex items-start gap-3 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
              >
                <div className={`p-2 rounded-lg ${activity.type === 'chat' ? 'bg-purple-500/20' : 'bg-amber-500/20'}`}>
                  {activity.type === 'chat' ? (
                    <MessageSquare className="w-4 h-4 text-purple-400" />
                  ) : (
                    <Bell className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-white truncate">
                      {activity.userEmail || activity.userId.slice(0, 8)}
                    </span>
                    {activity.symbol && (
                      <Badge variant="outline" className="font-mono text-xs">
                        {activity.symbol}
                      </Badge>
                    )}
                  </div>
                  {activity.message && (
                    <p className="text-xs text-slate-400 truncate mt-1">{activity.message}</p>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Clock className="w-3 h-3" />
                  {new Date(activity.time).toLocaleTimeString()}
                </div>
              </div>
            ))}
            {(!analytics?.recentActivity || analytics.recentActivity.length === 0) && (
              <p className="text-slate-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Export Section */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Download className="w-5 h-5" />
            Export Data
          </CardTitle>
          <CardDescription>Download data as CSV files</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { type: 'users', label: 'Users', icon: Users },
              { type: 'watchlists', label: 'Watchlists', icon: Star },
              { type: 'watchlist_items', label: 'Watchlist Items', icon: Eye },
              { type: 'alerts', label: 'Alerts', icon: Bell },
              { type: 'chats', label: 'Chat History', icon: MessageSquare },
            ].map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.type}
                  variant="outline"
                  className="flex-col h-auto py-4 gap-2"
                  onClick={() => handleExport(item.type)}
                  disabled={exporting === item.type}
                >
                  {exporting === item.type ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                  <span className="text-xs">{item.label}</span>
                </Button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Growth Summary */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Growth Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-xl bg-slate-700/30 text-center">
              <p className="text-3xl font-bold text-emerald-400">{basicStats?.growth.usersToday || 0}</p>
              <p className="text-sm text-slate-400 mt-1">Today</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-700/30 text-center">
              <p className="text-3xl font-bold text-blue-400">{basicStats?.growth.usersThisWeek || 0}</p>
              <p className="text-sm text-slate-400 mt-1">This Week</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-700/30 text-center">
              <p className="text-3xl font-bold text-purple-400">{basicStats?.growth.usersThisMonth || 0}</p>
              <p className="text-sm text-slate-400 mt-1">This Month</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-700/30 text-center">
              <p className="text-3xl font-bold text-amber-400">{basicStats?.growth.chatsThisWeek || 0}</p>
              <p className="text-sm text-slate-400 mt-1">AI Chats (Week)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
