'use client'

import { useState, useEffect } from 'react'
import { 
  Shield, 
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Clock,
  Zap,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RateLimitConfig {
  id: string
  endpoint: string
  subscriptionTier: string | null
  requestsPerMinute: string
  requestsPerHour: string
  requestsPerDay: string
  burstLimit: string
  description: string | null
  isEnabled: boolean
  isDefault?: boolean
}

export default function RateLimitsPage() {
  const [configs, setConfigs] = useState<RateLimitConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [isUsingDefaults, setIsUsingDefaults] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingConfig, setEditingConfig] = useState<Partial<RateLimitConfig> | null>(null)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/rate-limits')
      const data = await res.json()
      setConfigs(data.configs || [])
      setIsUsingDefaults(data.isUsingDefaults || false)
    } catch (error) {
      console.error('Failed to fetch rate limits:', error)
    }
    setLoading(false)
  }

  const handleInitializeDefaults = async () => {
    try {
      const res = await fetch('/api/admin/rate-limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize_defaults' }),
      })
      if (res.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Failed to initialize defaults:', error)
    }
  }

  const handleToggle = async (id: string, isEnabled: boolean) => {
    try {
      await fetch('/api/admin/rate-limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle', id, isEnabled }),
      })
      setConfigs(configs.map(c => c.id === id ? {...c, isEnabled} : c))
    } catch (error) {
      console.error('Failed to toggle:', error)
    }
  }

  const handleSave = async () => {
    if (!editingConfig) return

    try {
      const res = await fetch('/api/admin/rate-limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: editingConfig.id ? 'update' : 'create',
          ...editingConfig,
        }),
      })
      if (res.ok) {
        fetchData()
        setShowModal(false)
        setEditingConfig(null)
      }
    } catch (error) {
      console.error('Failed to save:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this rate limit config?')) return

    try {
      await fetch(`/api/admin/rate-limits?id=${id}`, { method: 'DELETE' })
      fetchData()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }

  const filteredConfigs = configs.filter(c => {
    if (filter === 'all') return true
    if (filter === 'global') return !c.subscriptionTier
    return c.subscriptionTier === filter
  })

  // Group by endpoint
  const groupedConfigs = filteredConfigs.reduce((acc, config) => {
    const key = config.endpoint
    if (!acc[key]) acc[key] = []
    acc[key].push(config)
    return acc
  }, {} as Record<string, RateLimitConfig[]>)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Rate Limits</h1>
          <p className="text-gray-400 text-sm mt-1">Configure API rate limiting per endpoint and tier</p>
        </div>
        <div className="flex gap-2">
          {isUsingDefaults && (
            <Button onClick={handleInitializeDefaults} variant="outline" size="sm">
              <Zap className="w-4 h-4 mr-2" />
              Save to Database
            </Button>
          )}
          <Button 
            size="sm"
            onClick={() => {
              setEditingConfig({
                endpoint: '/api/',
                subscriptionTier: null,
                requestsPerMinute: '60',
                requestsPerHour: '1000',
                requestsPerDay: '10000',
                burstLimit: '10',
                description: '',
                isEnabled: true,
              })
              setShowModal(true)
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Rule
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'global', 'free', 'premium', 'professional', 'enterprise'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
              filter === f 
                ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" 
                : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
            )}
          >
            {f === 'global' ? 'Global (Default)' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Info Banner */}
      {isUsingDefaults && (
        <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
          <p className="text-sm text-yellow-400">
            📌 Using default configuration. Click "Save to Database" to customize.
          </p>
        </div>
      )}

      {/* Rate Limit Cards */}
      <div className="space-y-4">
        {Object.entries(groupedConfigs).map(([endpoint, endpointConfigs]) => (
          <div 
            key={endpoint}
            className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden"
          >
            <div className="p-4 border-b border-white/10 bg-white/[0.02]">
              <code className="text-cyan-400 font-mono text-sm">{endpoint}</code>
            </div>
            <div className="p-4">
              <div className="grid gap-3">
                {endpointConfigs.map((config) => (
                  <div
                    key={config.id}
                    className={cn(
                      "p-4 rounded-lg border transition-all",
                      config.isEnabled 
                        ? "border-white/10 bg-white/[0.02]" 
                        : "border-white/5 bg-white/[0.01] opacity-50"
                    )}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {config.subscriptionTier ? (
                          <span className={cn(
                            "px-2 py-0.5 rounded text-xs font-medium",
                            config.subscriptionTier === 'professional' && "bg-violet-500/20 text-violet-400",
                            config.subscriptionTier === 'premium' && "bg-cyan-500/20 text-cyan-400",
                            config.subscriptionTier === 'free' && "bg-gray-500/20 text-gray-400",
                            config.subscriptionTier === 'enterprise' && "bg-amber-500/20 text-amber-400",
                          )}>
                            {config.subscriptionTier}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded text-xs font-medium bg-blue-500/20 text-blue-400">
                            Global Default
                          </span>
                        )}
                        {config.description && (
                          <span className="text-xs text-gray-500">{config.description}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleToggle(config.id, !config.isEnabled)}
                          className="p-1 hover:bg-white/10 rounded"
                          disabled={config.isDefault}
                        >
                          {config.isEnabled ? (
                            <ToggleRight className="w-5 h-5 text-green-400" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-gray-500" />
                          )}
                        </button>
                        {!config.isDefault && (
                          <>
                            <button
                              onClick={() => {
                                setEditingConfig(config)
                                setShowModal(true)
                              }}
                              className="p-1 hover:bg-white/10 rounded"
                            >
                              <Edit className="w-4 h-4 text-gray-400" />
                            </button>
                            <button
                              onClick={() => handleDelete(config.id)}
                              className="p-1 hover:bg-red-500/20 rounded"
                            >
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-gray-500">Per Minute</p>
                        <p className="text-white font-medium">{Number(config.requestsPerMinute).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Per Hour</p>
                        <p className="text-white font-medium">{Number(config.requestsPerHour).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Per Day</p>
                        <p className="text-white font-medium">{Number(config.requestsPerDay).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Burst</p>
                        <p className="text-white font-medium">{config.burstLimit}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Modal */}
      {showModal && editingConfig && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-xl bg-[#0a0d12] border border-white/10 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              {editingConfig.id ? 'Edit Rate Limit' : 'Create Rate Limit'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 block mb-1">Endpoint</label>
                <input
                  type="text"
                  value={editingConfig.endpoint || ''}
                  onChange={(e) => setEditingConfig({...editingConfig, endpoint: e.target.value})}
                  placeholder="/api/..."
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono text-sm focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Subscription Tier</label>
                <select
                  value={editingConfig.subscriptionTier || ''}
                  onChange={(e) => setEditingConfig({...editingConfig, subscriptionTier: e.target.value || null})}
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                >
                  <option value="">Global (All Users)</option>
                  <option value="free">Free</option>
                  <option value="premium">Premium</option>
                  <option value="professional">Professional</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Requests/Minute</label>
                  <input
                    type="number"
                    value={editingConfig.requestsPerMinute || ''}
                    onChange={(e) => setEditingConfig({...editingConfig, requestsPerMinute: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Requests/Hour</label>
                  <input
                    type="number"
                    value={editingConfig.requestsPerHour || ''}
                    onChange={(e) => setEditingConfig({...editingConfig, requestsPerHour: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Requests/Day</label>
                  <input
                    type="number"
                    value={editingConfig.requestsPerDay || ''}
                    onChange={(e) => setEditingConfig({...editingConfig, requestsPerDay: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Burst Limit</label>
                  <input
                    type="number"
                    value={editingConfig.burstLimit || ''}
                    onChange={(e) => setEditingConfig({...editingConfig, burstLimit: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm text-gray-400 block mb-1">Description</label>
                <input
                  type="text"
                  value={editingConfig.description || ''}
                  onChange={(e) => setEditingConfig({...editingConfig, description: e.target.value})}
                  placeholder="Optional description"
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => {
                  setShowModal(false)
                  setEditingConfig(null)
                }}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1"
                onClick={handleSave}
                disabled={!editingConfig.endpoint}
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
