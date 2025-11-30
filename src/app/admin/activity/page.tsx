'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Activity,
  RefreshCcw, 
  MessageSquare,
  Bell,
  Star,
  TrendingUp,
  Loader2,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  Search,
  Calendar
} from 'lucide-react'

interface ActivityItem {
  id: string
  type: 'chat' | 'alert' | 'watchlist'
  userId: string
  userEmail: string | null
  action: string
  symbol?: string
  details?: string
  timestamp: string
}

interface ActivityData {
  activities: ActivityItem[]
  counts: {
    all: number
    chats: number
    alerts: number
    watchlists: number
  }
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export default function AdminActivityPage() {
  const [data, setData] = useState<ActivityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [type, setType] = useState('all')
  const [searchUserId, setSearchUserId] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const fetchActivity = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        type,
      })
      if (searchUserId) params.set('userId', searchUserId)
      if (startDate) params.set('startDate', startDate)
      if (endDate) params.set('endDate', endDate)

      const res = await fetch(`/api/admin/activity?${params}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const result = await res.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching activity:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchActivity()
  }, [page, type])

  const handleSearch = () => {
    setPage(1)
    fetchActivity()
  }

  const getTypeIcon = (activityType: string) => {
    switch (activityType) {
      case 'chat':
        return <MessageSquare className="w-4 h-4 text-purple-400" />
      case 'alert':
        return <Bell className="w-4 h-4 text-amber-400" />
      case 'watchlist':
        return <Star className="w-4 h-4 text-emerald-400" />
      default:
        return <Activity className="w-4 h-4 text-slate-400" />
    }
  }

  const getTypeBgColor = (activityType: string) => {
    switch (activityType) {
      case 'chat':
        return 'bg-purple-500/20'
      case 'alert':
        return 'bg-amber-500/20'
      case 'watchlist':
        return 'bg-emerald-500/20'
      default:
        return 'bg-slate-500/20'
    }
  }

  const getTypeBadgeColor = (activityType: string) => {
    switch (activityType) {
      case 'chat':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      case 'alert':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'watchlist':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Activity Logs</h1>
          <p className="text-slate-400 mt-1">Real-time user activity feed</p>
        </div>
        <Button onClick={fetchActivity} variant="outline" className="gap-2">
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            {/* Type Filter */}
            <div className="flex flex-wrap gap-2">
              {['all', 'chats', 'alerts', 'watchlists'].map((t) => (
                <Button
                  key={t}
                  variant={type === t ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setType(t); setPage(1); }}
                  className="capitalize"
                >
                  {t}
                  {data?.counts && (
                    <span className="ml-1 text-xs opacity-70">
                      ({data.counts[t as keyof typeof data.counts]})
                    </span>
                  )}
                </Button>
              ))}
            </div>

            {/* User Search */}
            <div className="flex gap-2 flex-1 min-w-[200px]">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Filter by User ID..."
                  value={searchUserId}
                  onChange={(e) => setSearchUserId(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600"
                />
              </div>
            </div>

            {/* Date Filters */}
            <div className="flex gap-2">
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 w-40"
                  placeholder="Start Date"
                />
              </div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="pl-10 bg-slate-700/50 border-slate-600 w-40"
                  placeholder="End Date"
                />
              </div>
              <Button onClick={handleSearch} variant="secondary">
                Apply
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activity Feed
          </CardTitle>
          <CardDescription>
            {data?.pagination.total || 0} total activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {data?.activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-4 p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors"
                  >
                    {/* Icon */}
                    <div className={`p-3 rounded-xl ${getTypeBgColor(activity.type)}`}>
                      {getTypeIcon(activity.type)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-white font-medium">
                          {activity.userEmail || activity.userId.slice(0, 12) + '...'}
                        </span>
                        <Badge 
                          variant="outline" 
                          className={`capitalize text-xs ${getTypeBadgeColor(activity.type)}`}
                        >
                          {activity.type}
                        </Badge>
                        {activity.symbol && (
                          <Badge variant="outline" className="font-mono text-xs">
                            {activity.symbol}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-slate-400 mt-1">{activity.action}</p>
                      {activity.details && (
                        <p className="text-xs text-slate-500 mt-1 truncate">
                          {activity.details}
                        </p>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(activity.timestamp)}
                      </div>
                      <p className="text-xs text-slate-600 mt-1">
                        {new Date(activity.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}

                {(!data?.activities || data.activities.length === 0) && (
                  <div className="text-center py-12">
                    <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-slate-400">No activity found</p>
                    <p className="text-slate-500 text-sm mt-1">
                      Try adjusting your filters
                    </p>
                  </div>
                )}
              </div>

              {/* Pagination */}
              {data && data.pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t border-slate-700">
                  <p className="text-sm text-slate-400">
                    Page {data.pagination.page} of {data.pagination.totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                      disabled={page >= data.pagination.totalPages}
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
