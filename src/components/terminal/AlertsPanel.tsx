'use client'

import { useState, useEffect } from 'react'
import { Bell, Plus, Trash2, TrendingUp, TrendingDown, Check, X, Edit2, Volume2 } from 'lucide-react'

interface PriceAlert {
  id: string
  symbol: string
  name: string
  condition: 'above' | 'below' | 'change'
  targetPrice: number
  currentPrice: number
  changePercent?: number
  status: 'active' | 'triggered' | 'expired'
  createdAt: string
  triggeredAt?: string
  notifyEmail: boolean
  notifyPush: boolean
}

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'triggered'>('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newAlert, setNewAlert] = useState({
    symbol: '',
    condition: 'above' as 'above' | 'below' | 'change',
    targetPrice: 0,
  })

  useEffect(() => {
    // Sample alerts data
    setAlerts([
      { id: '1', symbol: 'AAPL', name: 'Apple Inc', condition: 'above', targetPrice: 200, currentPrice: 182.52, status: 'active', createdAt: '2024-03-10', notifyEmail: true, notifyPush: true },
      { id: '2', symbol: 'NVDA', name: 'NVIDIA Corp', condition: 'above', targetPrice: 900, currentPrice: 878.35, status: 'active', createdAt: '2024-03-12', notifyEmail: true, notifyPush: false },
      { id: '3', symbol: 'TSLA', name: 'Tesla Inc', condition: 'below', targetPrice: 150, currentPrice: 178.25, status: 'active', createdAt: '2024-03-08', notifyEmail: false, notifyPush: true },
      { id: '4', symbol: 'MSFT', name: 'Microsoft Corp', condition: 'above', targetPrice: 400, currentPrice: 415.50, status: 'triggered', createdAt: '2024-03-01', triggeredAt: '2024-03-14', notifyEmail: true, notifyPush: true },
      { id: '5', symbol: 'META', name: 'Meta Platforms', condition: 'above', targetPrice: 480, currentPrice: 502.30, status: 'triggered', createdAt: '2024-02-28', triggeredAt: '2024-03-10', notifyEmail: true, notifyPush: true },
      { id: '6', symbol: 'GOOGL', name: 'Alphabet Inc', condition: 'change', targetPrice: 5, currentPrice: 141.80, changePercent: 2.3, status: 'active', createdAt: '2024-03-11', notifyEmail: true, notifyPush: false },
      { id: '7', symbol: 'AMD', name: 'AMD Inc', condition: 'below', targetPrice: 160, currentPrice: 178.50, status: 'active', createdAt: '2024-03-13', notifyEmail: false, notifyPush: true },
      { id: '8', symbol: 'AMZN', name: 'Amazon.com', condition: 'above', targetPrice: 175, currentPrice: 178.75, status: 'triggered', createdAt: '2024-03-05', triggeredAt: '2024-03-15', notifyEmail: true, notifyPush: true },
    ])
    setLoading(false)
  }, [])

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'all') return true
    return alert.status === filter
  })

  const handleDeleteAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id))
  }

  const handleAddAlert = () => {
    if (!newAlert.symbol || !newAlert.targetPrice) return
    
    const alert: PriceAlert = {
      id: Date.now().toString(),
      symbol: newAlert.symbol.toUpperCase(),
      name: newAlert.symbol.toUpperCase(),
      condition: newAlert.condition,
      targetPrice: newAlert.targetPrice,
      currentPrice: 0,
      status: 'active',
      createdAt: new Date().toISOString().split('T')[0],
      notifyEmail: true,
      notifyPush: true,
    }
    
    setAlerts(prev => [alert, ...prev])
    setNewAlert({ symbol: '', condition: 'above', targetPrice: 0 })
    setShowAddForm(false)
  }

  const getConditionText = (alert: PriceAlert) => {
    switch (alert.condition) {
      case 'above': return `Above $${alert.targetPrice}`
      case 'below': return `Below $${alert.targetPrice}`
      case 'change': return `±${alert.targetPrice}% change`
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400 bg-green-500/10'
      case 'triggered': return 'text-yellow-400 bg-yellow-500/10'
      case 'expired': return 'text-gray-400 bg-gray-500/10'
      default: return 'text-gray-400 bg-gray-500/10'
    }
  }

  const getProgressPercent = (alert: PriceAlert) => {
    if (alert.condition === 'change') return 0
    if (alert.condition === 'above') {
      return Math.min(100, (alert.currentPrice / alert.targetPrice) * 100)
    }
    return Math.min(100, (alert.targetPrice / alert.currentPrice) * 100)
  }

  return (
    <div className="h-full flex flex-col bg-[#0a0a0a]">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-orange-500" />
          <span className="text-sm font-bold text-orange-500">PRICE ALERTS</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(['all', 'active', 'triggered'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2 py-1 text-xs rounded ${
                  filter === f 
                    ? 'bg-orange-600 text-white' 
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="ml-2 p-1.5 rounded bg-orange-600 hover:bg-orange-500 text-white"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Add Alert Form */}
      {showAddForm && (
        <div className="p-3 border-b border-gray-800 bg-gray-900/50">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="SYMBOL"
              value={newAlert.symbol}
              onChange={(e) => setNewAlert(prev => ({ ...prev, symbol: e.target.value.toUpperCase() }))}
              className="w-24 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white font-mono"
            />
            <select
              value={newAlert.condition}
              onChange={(e) => setNewAlert(prev => ({ ...prev, condition: e.target.value as 'above' | 'below' | 'change' }))}
              className="bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white"
            >
              <option value="above">Price Above</option>
              <option value="below">Price Below</option>
              <option value="change">% Change</option>
            </select>
            <input
              type="number"
              placeholder={newAlert.condition === 'change' ? '%' : 'Price'}
              value={newAlert.targetPrice || ''}
              onChange={(e) => setNewAlert(prev => ({ ...prev, targetPrice: parseFloat(e.target.value) || 0 }))}
              className="w-24 bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-sm text-white font-mono"
            />
            <button
              onClick={handleAddAlert}
              className="p-1.5 rounded bg-green-600 hover:bg-green-500 text-white"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="p-1.5 rounded bg-gray-700 hover:bg-gray-600 text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Loading alerts...</div>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Bell className="w-12 h-12 mb-2 opacity-20" />
            <span>No alerts found</span>
          </div>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {filteredAlerts.map((alert) => (
              <div 
                key={alert.id}
                className="p-3 hover:bg-gray-900/50 cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-orange-400 font-mono font-bold">{alert.symbol}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase ${getStatusColor(alert.status)}`}>
                        {alert.status}
                      </span>
                      {alert.notifyEmail && <Volume2 className="w-3 h-3 text-gray-500" />}
                    </div>
                    <div className="text-gray-400 text-xs mb-2">{alert.name}</div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        {alert.condition === 'above' ? (
                          <TrendingUp className="w-3 h-3 text-green-500" />
                        ) : alert.condition === 'below' ? (
                          <TrendingDown className="w-3 h-3 text-red-500" />
                        ) : (
                          <TrendingUp className="w-3 h-3 text-cyan-500" />
                        )}
                        <span className="text-white">{getConditionText(alert)}</span>
                      </div>
                      <div className="text-gray-500">
                        Current: <span className="text-cyan-400">${alert.currentPrice.toFixed(2)}</span>
                      </div>
                    </div>
                    {/* Progress bar */}
                    {alert.status === 'active' && alert.condition !== 'change' && (
                      <div className="mt-2 h-1 bg-gray-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${alert.condition === 'above' ? 'bg-green-500' : 'bg-red-500'}`}
                          style={{ width: `${getProgressPercent(alert)}%` }}
                        />
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button className="p-1.5 rounded hover:bg-gray-700 text-gray-500">
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button 
                      onClick={() => handleDeleteAlert(alert.id)}
                      className="p-1.5 rounded hover:bg-red-900/50 text-gray-500 hover:text-red-400"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary Stats */}
      <div className="p-2 border-t border-gray-800 flex gap-4 text-xs">
        <div className="flex items-center gap-1">
          <Bell className="w-3 h-3 text-green-500" />
          <span className="text-gray-500">Active:</span>
          <span className="text-green-400">{alerts.filter(a => a.status === 'active').length}</span>
        </div>
        <div className="flex items-center gap-1">
          <Check className="w-3 h-3 text-yellow-500" />
          <span className="text-gray-500">Triggered:</span>
          <span className="text-yellow-400">{alerts.filter(a => a.status === 'triggered').length}</span>
        </div>
      </div>
    </div>
  )
}
