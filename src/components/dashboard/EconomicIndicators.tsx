'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Activity,
  DollarSign,
  Percent,
  Building2,
  BarChart3,
  RefreshCw,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  LineChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts'
import { DataTile, Sparkline } from '@/components/ui/cinematic'

interface EconomicIndicator {
  seriesId: string
  name: string
  value: number | null
  previousValue: number | null
  change: number | null
  changePercent: number | null
  date: string
  unit: string
  frequency: string
}

interface IndicatorConfig {
  key: string
  name: string
  shortName: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
  format: (value: number | null) => string
  changeFormat?: (change: number | null) => string
  mockTrend: number[]
  description: string
}

const indicatorConfigs: IndicatorConfig[] = [
  {
    key: 'gdp',
    name: 'GDP Growth',
    shortName: 'GDP',
    icon: BarChart3,
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
    format: (v) => (v !== null ? `${v.toFixed(1)}%` : '—'),
    mockTrend: [2.4, 2.6, 2.5, 2.7, 2.8],
    description: 'Real GDP Growth Rate (Quarterly)',
  },
  {
    key: 'unemployment',
    name: 'Unemployment',
    shortName: 'UNRATE',
    icon: Activity,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
    format: (v) => (v !== null ? `${v.toFixed(1)}%` : '—'),
    mockTrend: [4.3, 4.2, 4.2, 4.1, 4.1],
    description: 'U.S. Unemployment Rate',
  },
  {
    key: 'inflation',
    name: 'Inflation (CPI)',
    shortName: 'CPI',
    icon: Percent,
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    format: (v) => (v !== null ? `${v.toFixed(1)}%` : '—'),
    mockTrend: [2.9, 3.0, 3.1, 3.1, 3.2],
    description: 'Consumer Price Index YoY Change',
  },
  {
    key: 'federalFundsRate',
    name: 'Fed Rate',
    shortName: 'FEDFUNDS',
    icon: Building2,
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
    format: (v) => (v !== null ? `${v.toFixed(2)}%` : '—'),
    changeFormat: () => '5.25-5.50%',
    mockTrend: [5.33, 5.33, 5.33, 5.33, 5.33],
    description: 'Federal Funds Effective Rate',
  },
  {
    key: 'treasuryYield10Y',
    name: '10Y Treasury',
    shortName: '10Y',
    icon: DollarSign,
    color: 'text-rose-500',
    bgColor: 'bg-rose-500/10',
    format: (v) => (v !== null ? `${v.toFixed(2)}%` : '—'),
    mockTrend: [4.25, 4.30, 4.35, 4.40, 4.45],
    description: '10-Year Treasury Yield',
  },
]

interface IndicatorData {
  gdp: EconomicIndicator | null
  unemployment: EconomicIndicator | null
  inflation: EconomicIndicator | null
  federalFundsRate: EconomicIndicator | null
  treasuryYield10Y: EconomicIndicator | null
  consumerConfidence: EconomicIndicator | null
  lastUpdated: string
}

function MiniTrendChart({
  data,
  color,
}: {
  data: number[]
  color: string
}) {
  const chartData = data.map((value, index) => ({ value, index }))
  const colorMap: Record<string, string> = {
    'text-emerald-500': '#10b981',
    'text-blue-500': '#3b82f6',
    'text-amber-500': '#f59e0b',
    'text-purple-500': '#a855f7',
    'text-rose-500': '#f43f5e',
  }

  return (
    <div className="h-8 w-16">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={colorMap[color] || '#6b7280'}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function ChangeIndicator({
  change,
  inverse = false,
}: {
  change: number | null
  inverse?: boolean
}) {
  if (change === null) {
    return (
      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        <span>—</span>
      </span>
    )
  }

  const isPositive = change > 0
  const isNeutral = change === 0
  // For unemployment, positive change is bad (inverse)
  const isGood = inverse ? !isPositive : isPositive

  if (isNeutral) {
    return (
      <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
        <Minus className="h-3 w-3" />
        <span>0.0%</span>
      </span>
    )
  }

  return (
    <span
      className={cn(
        'flex items-center gap-0.5 text-xs font-medium',
        isGood ? 'text-emerald-500' : 'text-rose-500'
      )}
    >
      {isPositive ? (
        <TrendingUp className="h-3 w-3" />
      ) : (
        <TrendingDown className="h-3 w-3" />
      )}
      <span>
        {isPositive ? '+' : ''}
        {change.toFixed(2)}%
      </span>
    </span>
  )
}

function IndicatorCard({
  config,
  data,
  onClick,
}: {
  config: IndicatorConfig
  data: EconomicIndicator | null
  onClick: () => void
}) {
  const Icon = config.icon
  const value = data?.value ?? null
  const change = data?.change ?? null
  const isInverse = config.key === 'unemployment'

  // Map config color to DataTile color
  const colorMap: Record<string, 'emerald' | 'blue' | 'amber' | 'purple' | 'rose'> = {
    'text-emerald-500': 'emerald',
    'text-blue-500': 'blue',
    'text-amber-500': 'amber',
    'text-purple-500': 'purple',
    'text-rose-500': 'rose',
  }

  return (
    <DataTile
      label={config.name}
      value={config.format(value)}
      change={change ?? undefined}
      icon={<Icon className="w-5 h-5" />}
      color={colorMap[config.color] || 'blue'}
      trend={config.mockTrend}
      onClick={onClick}
      className="cursor-pointer hover:scale-[1.02] transition-transform"
    />
  )
}

function ExpandedIndicatorView({
  config,
  data,
  onClose,
}: {
  config: IndicatorConfig
  data: EconomicIndicator | null
  onClose: () => void
}) {
  const Icon = config.icon
  const value = data?.value ?? null
  const change = data?.change ?? null
  const isInverse = config.key === 'unemployment'

  // Generate mock historical data for the expanded chart
  const historicalData = config.mockTrend.map((value, index) => ({
    month: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov'][index],
    value,
  }))

  const colorMap: Record<string, string> = {
    'text-emerald-500': '#10b981',
    'text-blue-500': '#3b82f6',
    'text-amber-500': '#f59e0b',
    'text-purple-500': '#a855f7',
    'text-rose-500': '#f43f5e',
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="relative w-full max-w-lg rounded-xl border bg-card p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className={cn('rounded-xl p-3', config.bgColor)}>
            <Icon className={cn('h-6 w-6', config.color)} />
          </div>
          <div>
            <h3 className="text-lg font-semibold">{config.name}</h3>
            <p className="text-sm text-muted-foreground">{config.description}</p>
          </div>
        </div>

        <div className="mb-6 flex items-end justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Current Value</p>
            <p className="text-3xl font-bold tabular-nums">
              {config.format(value)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Change</p>
            <div className="mt-1">
              <ChangeIndicator change={change} inverse={isInverse} />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="mb-2 text-sm font-medium text-muted-foreground">
            3-Month Trend
          </p>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={historicalData}>
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                  formatter={(value: number) => [
                    config.format(value),
                    config.name,
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={colorMap[config.color] || '#6b7280'}
                  strokeWidth={2}
                  dot={{ fill: colorMap[config.color] || '#6b7280', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {data && (
          <div className="grid grid-cols-2 gap-4 border-t pt-4 text-sm">
            <div>
              <p className="text-muted-foreground">Frequency</p>
              <p className="font-medium">{data.frequency}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Last Updated</p>
              <p className="font-medium">
                {data.date
                  ? new Date(data.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground">Series ID</p>
              <p className="font-mono text-xs">{data.seriesId}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Previous</p>
              <p className="font-medium tabular-nums">
                {data.previousValue !== null
                  ? config.format(data.previousValue)
                  : '—'}
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}

export function EconomicIndicators() {
  const [data, setData] = useState<IndicatorData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedIndicator, setExpandedIndicator] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchData = async () => {
    try {
      const response = await fetch('/api/economic/indicators')
      const result = await response.json()

      if (result.success) {
        setData(result.data)
        setError(null)
      } else {
        setError(result.message || 'Failed to fetch indicators')
      }
    } catch (err) {
      setError('Failed to fetch economic indicators')
      console.error('Error fetching economic indicators:', err)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
    // Refresh data every hour
    const interval = setInterval(fetchData, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    setIsRefreshing(true)
    fetchData()
  }

  const selectedConfig = expandedIndicator
    ? indicatorConfigs.find((c) => c.key === expandedIndicator)
    : null

  const getIndicatorData = (key: string): EconomicIndicator | null => {
    if (!data) return null
    switch (key) {
      case 'gdp': return data.gdp
      case 'unemployment': return data.unemployment
      case 'inflation': return data.inflation
      case 'federalFundsRate': return data.federalFundsRate
      case 'treasuryYield10Y': return data.treasuryYield10Y
      default: return null
    }
  }

  const selectedData = expandedIndicator ? getIndicatorData(expandedIndicator) : null

  if (loading) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Economic Indicators</h2>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-[72px] animate-pulse rounded-lg bg-muted"
            />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Economic Indicators</h2>
          <button
            onClick={handleRefresh}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
          </button>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <p className="text-sm text-muted-foreground">{error}</p>
          <button
            onClick={handleRefresh}
            className="mt-2 text-sm text-primary hover:underline"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-xl border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Economic Indicators</h2>
          <div className="flex items-center gap-2">
            {data?.lastUpdated && (
              <span className="text-xs text-muted-foreground">
                {new Date(data.lastUpdated).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <RefreshCw
                className={cn('h-4 w-4', isRefreshing && 'animate-spin')}
              />
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {indicatorConfigs.map((config) => (
            <IndicatorCard
              key={config.key}
              config={config}
              data={getIndicatorData(config.key)}
              onClick={() => setExpandedIndicator(config.key)}
            />
          ))}
        </div>
      </div>

      <AnimatePresence>
        {expandedIndicator && selectedConfig && (
          <ExpandedIndicatorView
            config={selectedConfig}
            data={selectedData}
            onClose={() => setExpandedIndicator(null)}
          />
        )}
      </AnimatePresence>
    </>
  )
}
