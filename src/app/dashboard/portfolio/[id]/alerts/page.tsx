'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Bell,
  Plus,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Newspaper,
  Trash2,
  Edit,
  ToggleLeft,
  ToggleRight,
  Mail,
  Smartphone,
  Check,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Alert {
  id: string;
  portfolioId: string;
  holdingId: string | null;
  symbol: string | null;
  alertType: string;
  conditionValue: string | null;
  conditionPercent: string | null;
  message: string | null;
  isActive: boolean;
  isEmailEnabled: boolean;
  isPushEnabled: boolean;
  lastTriggeredAt: string | null;
  triggerCount: number;
  createdAt: string;
  holding?: {
    symbol: string;
  };
}

const ALERT_TYPES = [
  { value: 'price_above', label: 'Price Above', icon: TrendingUp, description: 'Notify when price goes above target' },
  { value: 'price_below', label: 'Price Below', icon: TrendingDown, description: 'Notify when price falls below target' },
  { value: 'percent_change', label: 'Percent Change', icon: Percent, description: 'Notify on significant price movement' },
  { value: 'portfolio_value', label: 'Portfolio Value', icon: DollarSign, description: 'Notify when portfolio value reaches target' },
  { value: 'daily_gain_loss', label: 'Daily Change', icon: TrendingUp, description: 'Notify on daily gain/loss threshold' },
  { value: 'news', label: 'News Alert', icon: Newspaper, description: 'Notify on relevant news' },
];

export default function PortfolioAlertsPage() {
  const params = useParams();
  const portfolioId = params.id as string;

  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchAlerts = async () => {
      try {
        const response = await fetch(`/api/portfolio/${portfolioId}/alerts`);
        if (response.ok) {
          const data = await response.json();
          setAlerts(data.alerts || []);
        } else {
          setError('Failed to load alerts');
        }
      } catch (err) {
        console.error('Error fetching alerts:', err);
        setError('Failed to load alerts');
      } finally {
        setLoading(false);
      }
    };

    fetchAlerts();
  }, [portfolioId]);

  const toggleAlert = async (alertId: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/portfolio/${portfolioId}/alerts/${alertId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive }),
      });

      if (response.ok) {
        setAlerts(alerts.map(a => 
          a.id === alertId ? { ...a, isActive: !isActive } : a
        ));
      }
    } catch (err) {
      console.error('Error toggling alert:', err);
    }
  };

  const deleteAlert = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;

    try {
      const response = await fetch(`/api/portfolio/${portfolioId}/alerts/${alertId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setAlerts(alerts.filter(a => a.id !== alertId));
      }
    } catch (err) {
      console.error('Error deleting alert:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/portfolio"
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-400" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Price Alerts</h1>
            <p className="text-gray-400">Get notified when conditions are met</p>
          </div>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          New Alert
        </button>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center mb-6">
            <Bell className="h-10 w-10 text-amber-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No Alerts Set</h2>
          <p className="text-gray-500 text-center max-w-md mb-6">
            Create alerts to get notified about price changes, portfolio milestones, and news updates.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="h-5 w-5" />
            Create Alert
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {alerts.map((alert) => {
            const alertType = ALERT_TYPES.find(t => t.value === alert.alertType);
            const Icon = alertType?.icon || Bell;

            return (
              <div
                key={alert.id}
                className={cn(
                  'p-4 rounded-xl border transition-all',
                  alert.isActive
                    ? 'bg-white/[0.02] border-white/[0.05]'
                    : 'bg-white/[0.01] border-white/[0.03] opacity-60'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      'h-12 w-12 rounded-xl flex items-center justify-center',
                      alert.isActive ? 'bg-amber-500/10' : 'bg-gray-500/10'
                    )}>
                      <Icon className={cn(
                        'h-6 w-6',
                        alert.isActive ? 'text-amber-400' : 'text-gray-500'
                      )} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-white">
                          {alert.symbol || alertType?.label || 'Alert'}
                        </h3>
                        {!alert.isActive && (
                          <span className="px-2 py-0.5 bg-gray-500/20 text-gray-400 rounded text-xs">
                            Paused
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {alertType?.label}: {alert.conditionValue ? `$${alert.conditionValue}` : ''}
                        {alert.conditionPercent ? `${alert.conditionPercent}%` : ''}
                      </p>
                      {alert.message && (
                        <p className="text-sm text-gray-400 mt-1">{alert.message}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Mail className={cn('h-3 w-3', alert.isEmailEnabled ? 'text-green-400' : 'text-gray-500')} />
                          Email {alert.isEmailEnabled ? 'On' : 'Off'}
                        </span>
                        <span className="flex items-center gap-1">
                          <Smartphone className={cn('h-3 w-3', alert.isPushEnabled ? 'text-green-400' : 'text-gray-500')} />
                          Push {alert.isPushEnabled ? 'On' : 'Off'}
                        </span>
                        {alert.triggerCount > 0 && (
                          <span>Triggered {alert.triggerCount} times</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleAlert(alert.id, alert.isActive)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                      title={alert.isActive ? 'Pause alert' : 'Activate alert'}
                    >
                      {alert.isActive ? (
                        <ToggleRight className="h-5 w-5 text-green-400" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-500" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteAlert(alert.id)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Delete alert"
                    >
                      <Trash2 className="h-5 w-5 text-gray-500 hover:text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Alert Modal */}
      {showCreateModal && (
        <CreateAlertModal
          portfolioId={portfolioId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={(alert) => {
            setAlerts([alert, ...alerts]);
            setShowCreateModal(false);
          }}
        />
      )}
    </div>
  );
}

function CreateAlertModal({
  portfolioId,
  onClose,
  onSuccess,
}: {
  portfolioId: string;
  onClose: () => void;
  onSuccess: (alert: Alert) => void;
}) {
  const [alertType, setAlertType] = useState('price_above');
  const [symbol, setSymbol] = useState('');
  const [conditionValue, setConditionValue] = useState('');
  const [conditionPercent, setConditionPercent] = useState('');
  const [message, setMessage] = useState('');
  const [isEmailEnabled, setIsEmailEnabled] = useState(true);
  const [isPushEnabled, setIsPushEnabled] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const selectedType = ALERT_TYPES.find(t => t.value === alertType);
  const needsValue = ['price_above', 'price_below', 'portfolio_value'].includes(alertType);
  const needsPercent = ['percent_change', 'daily_gain_loss'].includes(alertType);
  const needsSymbol = ['price_above', 'price_below', 'percent_change', 'news'].includes(alertType);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (needsValue && !conditionValue) {
      setError('Target value is required');
      return;
    }
    if (needsPercent && !conditionPercent) {
      setError('Percent threshold is required');
      return;
    }
    if (needsSymbol && !symbol) {
      setError('Stock symbol is required');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/portfolio/${portfolioId}/alerts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          alertType,
          symbol: needsSymbol ? symbol.toUpperCase() : null,
          conditionValue: needsValue ? parseFloat(conditionValue) : null,
          conditionPercent: needsPercent ? parseFloat(conditionPercent) : null,
          message: message || null,
          isEmailEnabled,
          isPushEnabled,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        onSuccess(data.alert);
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to create alert');
      }
    } catch (err) {
      setError('Failed to create alert');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-semibold text-white mb-4">Create Alert</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Alert Type */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Alert Type</label>
            <div className="grid grid-cols-2 gap-2">
              {ALERT_TYPES.map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setAlertType(type.value)}
                    className={cn(
                      'flex items-center gap-2 p-3 rounded-lg border text-left transition-all',
                      alertType === type.value
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{type.label}</span>
                  </button>
                );
              })}
            </div>
            {selectedType && (
              <p className="text-xs text-gray-500 mt-2">{selectedType.description}</p>
            )}
          </div>

          {/* Symbol */}
          {needsSymbol && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Stock Symbol</label>
              <input
                type="text"
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                placeholder="AAPL"
              />
            </div>
          )}

          {/* Condition Value */}
          {needsValue && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Target Price ($)</label>
              <input
                type="number"
                step="0.01"
                value={conditionValue}
                onChange={(e) => setConditionValue(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                placeholder="150.00"
              />
            </div>
          )}

          {/* Condition Percent */}
          {needsPercent && (
            <div>
              <label className="block text-sm text-gray-400 mb-1">Percent Threshold (%)</label>
              <input
                type="number"
                step="0.1"
                value={conditionPercent}
                onChange={(e) => setConditionPercent(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                placeholder="5.0"
              />
            </div>
          )}

          {/* Message */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Custom Message (Optional)</label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              placeholder="Time to buy more..."
            />
          </div>

          {/* Notification Preferences */}
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isEmailEnabled}
                onChange={(e) => setIsEmailEnabled(e.target.checked)}
                className="sr-only"
              />
              <div className={cn(
                'w-5 h-5 rounded border flex items-center justify-center',
                isEmailEnabled ? 'bg-cyan-500 border-cyan-500' : 'border-gray-500'
              )}>
                {isEmailEnabled && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className="text-sm text-gray-300">Email</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPushEnabled}
                onChange={(e) => setIsPushEnabled(e.target.checked)}
                className="sr-only"
              />
              <div className={cn(
                'w-5 h-5 rounded border flex items-center justify-center',
                isPushEnabled ? 'bg-cyan-500 border-cyan-500' : 'border-gray-500'
              )}>
                {isPushEnabled && <Check className="h-3 w-3 text-white" />}
              </div>
              <span className="text-sm text-gray-300">Push Notification</span>
            </label>
          </div>

          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Create Alert'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
