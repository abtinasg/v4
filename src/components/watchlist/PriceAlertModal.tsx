/**
 * Price Alert Modal Component
 * 
 * Modal for creating and managing price alerts
 * - Above/below price alerts
 * - Percentage change alerts
 * - Volume spike alerts
 * - Alert history and management
 */

'use client'

import React, { useState, useCallback, useEffect, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  TrendingUp,
  TrendingDown,
  Percent,
  BarChart3,
  Trash2,
  AlertTriangle,
  Check,
  Plus,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useWatchlistStore, type PriceAlert, type AlertCondition } from '@/lib/stores/watchlist-store'

// ============================================================
// TYPES
// ============================================================

export interface PriceAlertModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  symbol?: string
  currentPrice?: number
}

type AlertType = 'above' | 'below' | 'change_percent' | 'volume_spike'

interface NewAlert {
  type: AlertType
  value: string
}

// ============================================================
// CONSTANTS
// ============================================================

const ALERT_TYPES: { value: AlertType; label: string; icon: React.ReactNode; description: string }[] = [
  {
    value: 'above',
    label: 'Price Above',
    icon: <TrendingUp className="w-4 h-4" />,
    description: 'Notify when price goes above target',
  },
  {
    value: 'below',
    label: 'Price Below',
    icon: <TrendingDown className="w-4 h-4" />,
    description: 'Notify when price drops below target',
  },
  {
    value: 'change_percent',
    label: 'Percent Change',
    icon: <Percent className="w-4 h-4" />,
    description: 'Notify on significant % move',
  },
  {
    value: 'volume_spike',
    label: 'Volume Spike',
    icon: <BarChart3 className="w-4 h-4" />,
    description: 'Notify on unusual trading volume',
  },
]

// ============================================================
// COMPONENT
// ============================================================

export const PriceAlertModal = memo(function PriceAlertModal({
  open,
  onOpenChange,
  symbol,
  currentPrice,
}: PriceAlertModalProps) {
  const [newAlert, setNewAlert] = useState<NewAlert>({
    type: 'above',
    value: '',
  })
  const [error, setError] = useState('')

  const alerts = useWatchlistStore((s) => s.alerts)
  const createAlert = useWatchlistStore((s) => s.createAlert)
  const deleteAlert = useWatchlistStore((s) => s.deleteAlert)
  const quotes = useWatchlistStore((s) => s.quotes)

  // Get current price from quotes if not provided
  const price = currentPrice ?? (symbol ? quotes[symbol]?.price : undefined)

  // Filter alerts for this symbol
  const symbolAlerts = symbol
    ? alerts.filter((alert) => alert.symbol === symbol)
    : alerts

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setNewAlert({ type: 'above', value: '' })
      setError('')
    }
  }, [open])

  // Pre-fill value based on alert type
  useEffect(() => {
    if (price && newAlert.type === 'above' && !newAlert.value) {
      setNewAlert((prev) => ({
        ...prev,
        value: (price * 1.1).toFixed(2), // 10% above
      }))
    } else if (price && newAlert.type === 'below' && !newAlert.value) {
      setNewAlert((prev) => ({
        ...prev,
        value: (price * 0.9).toFixed(2), // 10% below
      }))
    } else if (newAlert.type === 'change_percent' && !newAlert.value) {
      setNewAlert((prev) => ({ ...prev, value: '5' })) // 5% change
    } else if (newAlert.type === 'volume_spike' && !newAlert.value) {
      setNewAlert((prev) => ({ ...prev, value: '200' })) // 200% of average
    }
  }, [newAlert.type, price])

  // Create alert handler
  const handleCreateAlert = useCallback(() => {
    if (!symbol) {
      setError('Please select a stock')
      return
    }

    const value = parseFloat(newAlert.value)
    if (isNaN(value) || value <= 0) {
      setError('Please enter a valid value')
      return
    }

    // Map alert type to AlertCondition
    const conditionMap: Record<AlertType, AlertCondition> = {
      above: 'above',
      below: 'below',
      change_percent: 'percent_change',
      volume_spike: 'volume_spike',
    }

    createAlert({
      symbol,
      condition: conditionMap[newAlert.type],
      targetValue: value,
      delivery: ['in_app'],
    })

    setNewAlert({ type: 'above', value: '' })
    setError('')
  }, [symbol, newAlert, createAlert])

  // Format alert condition text
  const formatAlertCondition = (alert: PriceAlert) => {
    switch (alert.condition) {
      case 'above':
        return `Price > $${alert.targetValue.toLocaleString()}`
      case 'below':
        return `Price < $${alert.targetValue.toLocaleString()}`
      case 'percent_change':
        return `±${alert.targetValue}% change`
      case 'volume_spike':
        return `Volume > ${alert.targetValue}% avg`
      default:
        return alert.targetValue.toString()
    }
  }

  // Get alert type color
  const getAlertTypeColor = (condition: AlertCondition) => {
    switch (condition) {
      case 'above':
      case 'crosses_above':
        return 'text-green-400 bg-green-500/10'
      case 'below':
      case 'crosses_below':
        return 'text-red-400 bg-red-500/10'
      case 'percent_change':
        return 'text-cyan-400 bg-cyan-500/10'
      case 'volume_spike':
        return 'text-violet-400 bg-violet-500/10'
      default:
        return 'text-white/60 bg-white/10'
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-[#0a0d12] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-cyan-400" />
            Price Alerts
            {symbol && (
              <span className="ml-2 px-2 py-0.5 rounded bg-white/10 text-sm font-normal">
                {symbol}
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="text-white/50">
            {symbol
              ? `Create alerts for ${symbol} at $${price?.toFixed(2) || 'N/A'}`
              : 'Manage all your price alerts'}
          </DialogDescription>
        </DialogHeader>

        {/* Create Alert Form (only show if symbol is provided) */}
        {symbol && (
          <div className="space-y-4 p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="text-sm font-medium text-white">New Alert</div>

            {/* Alert Type Selection */}
            <div className="grid grid-cols-2 gap-2">
              {ALERT_TYPES.map((alertType) => (
                <button
                  key={alertType.value}
                  onClick={() => setNewAlert({ type: alertType.value, value: '' })}
                  className={cn(
                    'flex items-center gap-2 p-3 rounded-lg border transition-all',
                    newAlert.type === alertType.value
                      ? 'bg-cyan-500/10 border-cyan-500/50 text-cyan-400'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  )}
                >
                  {alertType.icon}
                  <span className="text-sm">{alertType.label}</span>
                </button>
              ))}
            </div>

            {/* Value Input */}
            <div className="space-y-2">
              <label className="text-xs text-white/40">
                {newAlert.type === 'above' || newAlert.type === 'below'
                  ? 'Target Price ($)'
                  : newAlert.type === 'change_percent'
                  ? 'Percentage (%)'
                  : 'Volume Threshold (%)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40">
                  {newAlert.type === 'above' || newAlert.type === 'below' ? '$' : ''}
                </span>
                <input
                  type="number"
                  value={newAlert.value}
                  onChange={(e) => {
                    setNewAlert((prev) => ({ ...prev, value: e.target.value }))
                    setError('')
                  }}
                  placeholder={
                    newAlert.type === 'above' || newAlert.type === 'below'
                      ? '0.00'
                      : newAlert.type === 'change_percent'
                      ? '5'
                      : '200'
                  }
                  className={cn(
                    'w-full py-2 pr-4 rounded-lg',
                    newAlert.type === 'above' || newAlert.type === 'below' ? 'pl-8' : 'pl-4',
                    'bg-white/5 border border-white/10',
                    'text-white placeholder:text-white/30',
                    'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50',
                    error && 'border-red-500/50 focus:ring-red-500/50'
                  )}
                  step={newAlert.type === 'above' || newAlert.type === 'below' ? '0.01' : '1'}
                  min="0"
                />
                {(newAlert.type === 'change_percent' || newAlert.type === 'volume_spike') && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                    %
                  </span>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div className="flex items-center gap-1.5 text-xs text-red-400">
                  <AlertTriangle className="w-3 h-3" />
                  {error}
                </div>
              )}

              {/* Helper text */}
              <div className="text-xs text-white/40">
                {ALERT_TYPES.find((t) => t.value === newAlert.type)?.description}
              </div>
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateAlert}
              className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Alert
            </Button>
          </div>
        )}

        {/* Existing Alerts */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-white/60">
              {symbol ? 'Active Alerts' : 'All Alerts'}
            </span>
            <span className="text-xs text-white/40">
              {symbolAlerts.length} alert{symbolAlerts.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div className="max-h-[200px] overflow-y-auto space-y-2">
            <AnimatePresence mode="popLayout">
              {symbolAlerts.length > 0 ? (
                symbolAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg',
                      'bg-white/5 border border-white/10',
                      alert.triggeredAt && 'border-yellow-500/50 bg-yellow-500/5'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Alert type badge */}
                      <div
                        className={cn(
                          'p-2 rounded-lg',
                          getAlertTypeColor(alert.condition)
                        )}
                      >
                        {ALERT_TYPES.find((t) => {
                          const conditionMap: Record<string, AlertType> = {
                            above: 'above',
                            below: 'below',
                            percent_change: 'change_percent',
                            volume_spike: 'volume_spike',
                          }
                          return t.value === conditionMap[alert.condition]
                        })?.icon}
                      </div>

                      {/* Alert info */}
                      <div>
                        <div className="flex items-center gap-2">
                          {!symbol && (
                            <span className="font-medium text-white">
                              {alert.symbol}
                            </span>
                          )}
                          <span className="text-sm text-white/80">
                            {formatAlertCondition(alert)}
                          </span>
                          {alert.triggeredAt && (
                            <span className="flex items-center gap-1 text-xs text-yellow-400">
                              <Check className="w-3 h-3" />
                              Triggered
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-white/40">
                          Created {new Date(alert.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="p-2 rounded-lg text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-white/40">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No active alerts</p>
                  {!symbol && (
                    <p className="text-xs mt-1">
                      Create alerts from a stock's watchlist
                    </p>
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end pt-4 border-t border-white/10">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
})

export default PriceAlertModal
