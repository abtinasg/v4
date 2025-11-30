'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Activity,
  RefreshCcw, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Clock,
  Server,
  Database,
  Shield,
  Zap,
  HardDrive,
  Cpu,
  Settings
} from 'lucide-react'

interface HealthCheck {
  name: string
  status: 'healthy' | 'degraded' | 'down'
  responseTime?: number
  message?: string
  lastChecked: string
}

interface EnvVar {
  name: string
  configured: boolean
}

interface HealthData {
  status: 'healthy' | 'degraded' | 'down'
  timestamp: string
  totalTime: number
  checks: HealthCheck[]
  summary: {
    healthy: number
    degraded: number
    down: number
    total: number
  }
  system: {
    nodeVersion: string
    platform: string
    uptime: number
    memoryUsage: {
      heapUsed: number
      heapTotal: number
      external: number
      rss: number
    }
    env: string
  }
  environment: EnvVar[]
}

export default function AdminHealthPage() {
  const [data, setData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const fetchHealth = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/health')
      if (!res.ok) throw new Error('Failed to fetch')
      const result = await res.json()
      setData(result)
    } catch (error) {
      console.error('Error fetching health:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchHealth()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(fetchHealth, 30000) // Refresh every 30 seconds
      return () => clearInterval(interval)
    }
  }, [autoRefresh])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-emerald-400" />
      case 'degraded':
        return <AlertTriangle className="w-5 h-5 text-amber-400" />
      case 'down':
        return <XCircle className="w-5 h-5 text-red-400" />
      default:
        return <Activity className="w-5 h-5 text-slate-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
      case 'degraded':
        return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
      case 'down':
        return 'bg-red-500/20 text-red-400 border-red-500/30'
      default:
        return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
  }

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">System Health</h1>
          <p className="text-slate-400 mt-1">Monitor services and infrastructure</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="gap-2"
          >
            <Clock className="w-4 h-4" />
            {autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF'}
          </Button>
          <Button onClick={fetchHealth} variant="outline" className="gap-2" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCcw className="w-4 h-4" />
            )}
            Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status */}
      <Card className={`border-2 ${
        data?.status === 'healthy' ? 'border-emerald-500/50 bg-emerald-500/10' :
        data?.status === 'degraded' ? 'border-amber-500/50 bg-amber-500/10' :
        'border-red-500/50 bg-red-500/10'
      }`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-4 rounded-2xl ${
                data?.status === 'healthy' ? 'bg-emerald-500/20' :
                data?.status === 'degraded' ? 'bg-amber-500/20' :
                'bg-red-500/20'
              }`}>
                {getStatusIcon(data?.status || 'down')}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white capitalize">
                  System {data?.status}
                </h2>
                <p className="text-slate-400">
                  {data?.summary.healthy}/{data?.summary.total} services healthy
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-400">Last checked</p>
              <p className="text-white">
                {data?.timestamp ? new Date(data.timestamp).toLocaleString() : '-'}
              </p>
              <p className="text-xs text-slate-500">
                Check took {data?.totalTime}ms
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/20">
                <CheckCircle className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Healthy</p>
                <p className="text-3xl font-bold text-emerald-400">{data?.summary.healthy || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-amber-500/20">
                <AlertTriangle className="w-6 h-6 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Degraded</p>
                <p className="text-3xl font-bold text-amber-400">{data?.summary.degraded || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-red-500/20">
                <XCircle className="w-6 h-6 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-slate-400">Down</p>
                <p className="text-3xl font-bold text-red-400">{data?.summary.down || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Service Checks */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Server className="w-5 h-5" />
            Service Status
          </CardTitle>
          <CardDescription>Individual service health checks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data?.checks.map((check, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 rounded-xl bg-slate-700/30"
              >
                <div className="flex items-center gap-4">
                  {getStatusIcon(check.status)}
                  <div>
                    <p className="text-white font-medium">{check.name}</p>
                    <p className="text-sm text-slate-400">{check.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {check.responseTime !== undefined && (
                    <div className="text-right">
                      <p className="text-sm text-slate-400">Response</p>
                      <p className={`font-mono ${
                        check.responseTime < 100 ? 'text-emerald-400' :
                        check.responseTime < 500 ? 'text-amber-400' :
                        'text-red-400'
                      }`}>
                        {check.responseTime}ms
                      </p>
                    </div>
                  )}
                  <Badge variant="outline" className={getStatusColor(check.status)}>
                    {check.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Info */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              System Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                <span className="text-slate-400">Node Version</span>
                <span className="text-white font-mono">{data?.system.nodeVersion}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                <span className="text-slate-400">Platform</span>
                <span className="text-white font-mono">{data?.system.platform}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                <span className="text-slate-400">Environment</span>
                <Badge variant="outline" className={
                  data?.system.env === 'production' 
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                }>
                  {data?.system.env}
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                <span className="text-slate-400">Uptime</span>
                <span className="text-white font-mono">
                  {data?.system.uptime ? formatUptime(data.system.uptime) : '-'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Memory Usage */}
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <HardDrive className="w-5 h-5" />
              Memory Usage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data?.system.memoryUsage && (
                <>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Heap Used</span>
                      <span className="text-white">{formatBytes(data.system.memoryUsage.heapUsed)}</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ 
                          width: `${(data.system.memoryUsage.heapUsed / data.system.memoryUsage.heapTotal) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                    <span className="text-slate-400">Heap Total</span>
                    <span className="text-white font-mono">{formatBytes(data.system.memoryUsage.heapTotal)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                    <span className="text-slate-400">External</span>
                    <span className="text-white font-mono">{formatBytes(data.system.memoryUsage.external)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                    <span className="text-slate-400">RSS</span>
                    <span className="text-white font-mono">{formatBytes(data.system.memoryUsage.rss)}</span>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Environment Variables */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Environment Configuration
          </CardTitle>
          <CardDescription>Required environment variables status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {data?.environment.map((env, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-3 rounded-lg ${
                  env.configured ? 'bg-emerald-500/10' : 'bg-red-500/10'
                }`}
              >
                <span className="text-sm text-white font-mono truncate">{env.name}</span>
                {env.configured ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
