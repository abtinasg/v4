'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Database, 
  RefreshCcw, 
  Table,
  Loader2,
  HardDrive,
  Layers,
  Key,
  CheckCircle2
} from 'lucide-react'

interface DatabaseInfo {
  tables: Array<{
    name: string
    rowCount: number
    columns: number
  }>
  totalRows: number
  connectionStatus: 'connected' | 'disconnected'
}

export default function AdminDatabasePage() {
  const [loading, setLoading] = useState(true)
  const [dbInfo, setDbInfo] = useState<DatabaseInfo | null>(null)

  const fetchDbInfo = async () => {
    setLoading(true)
    try {
      // Simulate database info - in production you'd have an API endpoint
      await new Promise(resolve => setTimeout(resolve, 500))
      
      setDbInfo({
        tables: [
          { name: 'users', rowCount: 0, columns: 6 },
          { name: 'watchlists', rowCount: 0, columns: 6 },
          { name: 'watchlist_items', rowCount: 0, columns: 5 },
          { name: 'stock_alerts', rowCount: 0, columns: 9 },
          { name: 'user_preferences', rowCount: 0, columns: 7 },
          { name: 'chat_history', rowCount: 0, columns: 5 },
          { name: 'risk_profiles', rowCount: 0, columns: 10 },
        ],
        totalRows: 0,
        connectionStatus: 'connected'
      })
    } catch (error) {
      console.error('Error fetching database info:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDbInfo()
  }, [])

  if (loading) {
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
          <h1 className="text-3xl font-bold text-white">Database</h1>
          <p className="text-slate-400 mt-1">Database schema information</p>
        </div>
        <Button onClick={fetchDbInfo} variant="outline" className="gap-2">
          <RefreshCcw className="w-4 h-4" />
          Refresh
        </Button>
      </div>

      {/* Connection Status */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${dbInfo?.connectionStatus === 'connected' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                <Database className={`w-6 h-6 ${dbInfo?.connectionStatus === 'connected' ? 'text-emerald-400' : 'text-red-400'}`} />
              </div>
              <div>
                <h3 className="text-lg font-medium text-white">PostgreSQL (Neon)</h3>
                <p className="text-sm text-slate-400">Serverless PostgreSQL Database</p>
              </div>
            </div>
            <Badge className={dbInfo?.connectionStatus === 'connected' 
              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
              : 'bg-red-500/20 text-red-400 border-red-500/30'
            }>
              <CheckCircle2 className="w-3 h-3 mr-1" />
              {dbInfo?.connectionStatus === 'connected' ? 'Connected' : 'Disconnected'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Database Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/20">
              <Table className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{dbInfo?.tables.length || 0}</p>
              <p className="text-sm text-slate-400">Tables</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-purple-500/20">
              <Layers className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {dbInfo?.tables.reduce((acc, t) => acc + t.columns, 0) || 0}
              </p>
              <p className="text-sm text-slate-400">Total Columns</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/20">
              <Key className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">7</p>
              <p className="text-sm text-slate-400">Enums</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tables */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <HardDrive className="w-5 h-5" />
            Database Tables
          </CardTitle>
          <CardDescription>All tables in the database schema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dbInfo?.tables.map((table) => (
              <div key={table.name} className="p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-600/50 flex items-center justify-center">
                      <Table className="w-5 h-5 text-slate-300" />
                    </div>
                    <div>
                      <h4 className="font-medium text-white">{table.name}</h4>
                      <p className="text-xs text-slate-400">{table.columns} columns</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schema Info */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white">Schema Enums</CardTitle>
          <CardDescription>Custom PostgreSQL enums used in the schema</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              'subscription_tier',
              'alert_condition',
              'theme',
              'chart_type',
              'risk_tolerance',
              'investment_horizon',
              'investment_experience'
            ].map((enumName) => (
              <Badge key={enumName} variant="outline" className="text-slate-300 bg-slate-700/30">
                {enumName}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
