'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  ArrowLeft, 
  Mail, 
  Calendar, 
  Clock,
  List,
  Bell,
  MessageSquare,
  User,
  Shield,
  Settings,
  TrendingUp,
  TrendingDown,
  Loader2
} from 'lucide-react'

interface UserDetail {
  id: string
  clerkId: string
  email: string
  subscriptionTier: string
  createdAt: string
  updatedAt: string
  watchlists: Array<{
    id: string
    name: string
    isDefault: boolean
    createdAt: string
    items: Array<{
      id: string
      symbol: string
      notes: string | null
      addedAt: string
    }>
  }>
  stockAlerts: Array<{
    id: string
    symbol: string
    condition: string
    targetPrice: string
    isActive: boolean
    triggeredAt: string | null
    createdAt: string
  }>
  preferences: {
    theme: string
    defaultChartType: string
    favoriteMetrics: string[]
    settings: Record<string, any>
  } | null
  chatHistory: Array<{
    id: string
    message: string
    response: string
    context: Record<string, any> | null
    createdAt: string
  }>
}

// tierColors removed - credit-based system

export default function UserDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [user, setUser] = useState<UserDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`/api/admin/users/${params.id}`)
        if (!res.ok) throw new Error('Failed to fetch')
        const data = await res.json()
        setUser(data.user)
      } catch (error) {
        console.error('Error fetching user:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchUser()
    }
  }, [params.id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-slate-400">User not found</p>
        <Button onClick={() => router.push('/admin/users')} variant="outline">
          Back to Users
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.push('/admin/users')}
          className="text-slate-400 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-white">User Details</h1>
          <p className="text-slate-400 mt-1">{user.email}</p>
        </div>
      </div>

      {/* User Info Card */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-emerald-500/30">
              {user.email?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="bg-cyan-500/20 text-cyan-400 text-sm px-3 py-1">
                  <Shield className="w-3 h-3 mr-1" />
                  Credit User
                </Badge>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="flex items-center gap-2 text-slate-400">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <User className="w-4 h-4" />
                  <span className="truncate text-xs">{user.clerkId}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>Updated {new Date(user.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/20">
              <List className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{user.watchlists.length}</p>
              <p className="text-xs text-slate-400">Watchlists</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/20">
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{user.stockAlerts.length}</p>
              <p className="text-xs text-slate-400">Alerts</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <MessageSquare className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{user.chatHistory.length}</p>
              <p className="text-xs text-slate-400">AI Chats</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="watchlists" className="space-y-4">
        <TabsList className="bg-slate-800/50 border border-slate-700/50">
          <TabsTrigger value="watchlists">Watchlists</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="chats">AI Chats</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        {/* Watchlists Tab */}
        <TabsContent value="watchlists">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <List className="w-5 h-5" />
                Watchlists
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.watchlists.length === 0 ? (
                <p className="text-center py-8 text-slate-400">No watchlists</p>
              ) : (
                <div className="space-y-4">
                  {user.watchlists.map((watchlist) => (
                    <div key={watchlist.id} className="p-4 rounded-lg bg-slate-700/30">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-white">{watchlist.name}</h3>
                          {watchlist.isDefault && (
                            <Badge variant="outline" className="text-xs">Default</Badge>
                          )}
                        </div>
                        <span className="text-xs text-slate-400">
                          {watchlist.items.length} items
                        </span>
                      </div>
                      {watchlist.items.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {watchlist.items.map((item) => (
                            <Badge key={item.id} variant="outline" className="text-slate-300">
                              {item.symbol}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alerts Tab */}
        <TabsContent value="alerts">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Stock Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {user.stockAlerts.length === 0 ? (
                <p className="text-center py-8 text-slate-400">No alerts</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-slate-400">Symbol</TableHead>
                      <TableHead className="text-slate-400">Condition</TableHead>
                      <TableHead className="text-slate-400">Target</TableHead>
                      <TableHead className="text-slate-400">Status</TableHead>
                      <TableHead className="text-slate-400">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {user.stockAlerts.map((alert) => (
                      <TableRow key={alert.id} className="border-slate-700/50">
                        <TableCell className="font-medium text-white">{alert.symbol}</TableCell>
                        <TableCell className="text-slate-300">{alert.condition}</TableCell>
                        <TableCell className="text-slate-300">${parseFloat(alert.targetPrice).toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={alert.isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}>
                            {alert.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-400">
                          {new Date(alert.createdAt).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chats Tab */}
        <TabsContent value="chats">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                AI Chat History
              </CardTitle>
              <CardDescription>Recent conversations with AI assistant</CardDescription>
            </CardHeader>
            <CardContent>
              {user.chatHistory.length === 0 ? (
                <p className="text-center py-8 text-slate-400">No chat history</p>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {user.chatHistory.slice(0, 20).map((chat) => (
                    <div key={chat.id} className="p-4 rounded-lg bg-slate-700/30 space-y-3">
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                          <User className="w-3 h-3 text-blue-400" />
                        </div>
                        <p className="text-sm text-slate-300">{chat.message}</p>
                      </div>
                      <div className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                          <MessageSquare className="w-3 h-3 text-emerald-400" />
                        </div>
                        <p className="text-sm text-slate-400 line-clamp-3">{chat.response}</p>
                      </div>
                      <p className="text-xs text-slate-500 text-right">
                        {new Date(chat.createdAt).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Settings className="w-5 h-5" />
                User Preferences
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!user.preferences ? (
                <p className="text-center py-8 text-slate-400">No preferences set</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-slate-700/30">
                    <p className="text-xs text-slate-400 mb-1">Theme</p>
                    <p className="text-white font-medium capitalize">{user.preferences.theme}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-700/30">
                    <p className="text-xs text-slate-400 mb-1">Default Chart Type</p>
                    <p className="text-white font-medium capitalize">{user.preferences.defaultChartType}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-slate-700/30 md:col-span-2">
                    <p className="text-xs text-slate-400 mb-2">Favorite Metrics</p>
                    {user.preferences.favoriteMetrics && user.preferences.favoriteMetrics.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {user.preferences.favoriteMetrics.map((metric, i) => (
                          <Badge key={i} variant="outline" className="text-slate-300">
                            {metric}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-500">None set</p>
                    )}
                  </div>
                  <div className="p-4 rounded-lg bg-slate-700/30 md:col-span-2">
                    <p className="text-xs text-slate-400 mb-2">Settings</p>
                    <pre className="text-xs text-slate-300 bg-slate-800 p-3 rounded-lg overflow-x-auto">
                      {JSON.stringify(user.preferences.settings, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
