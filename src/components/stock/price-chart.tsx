'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';
import { LineChart as LineChartIcon, BarChart3, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChartTimeframe, ChartType, ChartDataPoint, PriceChartProps } from './types';

const TIMEFRAMES: { value: ChartTimeframe; label: string }[] = [
  { value: '1D', label: '1D' },
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '6M', label: '6M' },
  { value: '1Y', label: '1Y' },
  { value: '5Y', label: '5Y' },
];

const CHART_TYPES: { value: ChartType; icon: typeof LineChartIcon }[] = [
  { value: 'line', icon: LineChartIcon },
  { value: 'area', icon: TrendingUp },
  { value: 'candlestick', icon: BarChart3 },
];

function formatDate(timestamp: number, timeframe: ChartTimeframe): string {
  const date = new Date(timestamp);
  if (timeframe === '1D') {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }
  if (timeframe === '1W' || timeframe === '1M') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
}

function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

function formatVolume(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(0)}K`;
  return value.toString();
}

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ payload: ChartDataPoint; value: number }>;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  return (
    <div className="bg-[#0C1017]/95 backdrop-blur-xl rounded-xl p-4 border border-white/[0.06] shadow-xl">
      <p className="text-xs text-white/40 mb-3">
        {new Date(data.timestamp).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
        })}
      </p>
      <div className="space-y-1.5">
        <div className="flex justify-between gap-8">
          <span className="text-white/40 text-sm">Open</span>
          <span className="text-white font-medium">{formatPrice(data.open)}</span>
        </div>
        <div className="flex justify-between gap-8">
          <span className="text-white/40 text-sm">High</span>
          <span className="text-emerald-400 font-medium">{formatPrice(data.high)}</span>
        </div>
        <div className="flex justify-between gap-8">
          <span className="text-white/40 text-sm">Low</span>
          <span className="text-rose-400 font-medium">{formatPrice(data.low)}</span>
        </div>
        <div className="flex justify-between gap-8">
          <span className="text-white/40 text-sm">Close</span>
          <span className="text-white font-medium">{formatPrice(data.close)}</span>
        </div>
        <div className="flex justify-between gap-8 pt-2 mt-2 border-t border-white/[0.06]">
          <span className="text-white/40 text-sm">Volume</span>
          <span className="text-white/60">{formatVolume(data.volume)}</span>
        </div>
      </div>
    </div>
  );
}

function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9999) * 10000;
  return x - Math.floor(x);
}

function generateMockData(days: number, basePrice: number = 180): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  let price = basePrice;
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const seed = i + days * 1000;
    const change = (seededRandom(seed) - 0.48) * 5;
    price = Math.max(price + change, basePrice * 0.8);
    data.push({
      date: date.toISOString().split('T')[0],
      timestamp: date.getTime(),
      open: price - seededRandom(seed + 3) * 2,
      high: price + seededRandom(seed + 1) * 3,
      low: price - seededRandom(seed + 2) * 3,
      close: price,
      volume: Math.floor(seededRandom(seed + 4) * 100000000) + 50000000,
    });
  }
  return data;
}

function getDaysForTimeframe(timeframe: ChartTimeframe): number {
  const map: Record<ChartTimeframe, number> = {
    '1D': 1, '1W': 7, '1M': 30, '3M': 90, '6M': 180, '1Y': 365, '5Y': 1825, 'ALL': 3650,
  };
  return map[timeframe] || 30;
}

export function PriceChart({ symbol, initialData }: PriceChartProps) {
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('1M');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const fetchHistoricalData = useCallback(async (tf: ChartTimeframe) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/stock/${symbol}/historical?timeframe=${tf}`);
      if (!response.ok) throw new Error('Failed to fetch');
      const result = await response.json();
      if (result.data?.length > 0) {
        setChartData(result.data);
      } else {
        setChartData(generateMockData(getDaysForTimeframe(tf)));
      }
    } catch {
      setChartData(generateMockData(getDaysForTimeframe(tf)));
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    if (initialData?.length > 0) {
      setChartData(initialData);
      setIsLoading(false);
    } else {
      fetchHistoricalData(timeframe);
    }
  }, [timeframe, initialData, fetchHistoricalData]);

  const handleTimeframeChange = useCallback((tf: ChartTimeframe) => {
    setTimeframe(tf);
    fetchHistoricalData(tf);
  }, [fetchHistoricalData]);

  const priceChange = useMemo(() => {
    if (chartData.length < 2) return { percent: 0, isPositive: true };
    const first = chartData[0].close;
    const last = chartData[chartData.length - 1].close;
    const change = last - first;
    return { percent: (change / first) * 100, isPositive: change >= 0 };
  }, [chartData]);

  const priceDomain = useMemo(() => {
    const prices = chartData.flatMap((d) => [d.high, d.low]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  }, [chartData]);

  const chartColor = priceChange.isPositive ? '#10B981' : '#F43F5E';

  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl',
      'bg-white/[0.02] border border-white/[0.04]'
    )}>
      {/* Chart Header */}
      <div className="px-6 sm:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Timeframe Pills */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.02]">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => handleTimeframeChange(tf.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                timeframe === tf.value
                  ? 'bg-white/[0.08] text-white'
                  : 'text-white/40 hover:text-white/60'
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Right Side: Change Badge + Chart Type */}
        <div className="flex items-center gap-3">
          <div className={cn(
            'px-3 py-1.5 rounded-lg text-sm font-medium',
            priceChange.isPositive 
              ? 'bg-emerald-500/10 text-emerald-400' 
              : 'bg-rose-500/10 text-rose-400'
          )}>
            {priceChange.isPositive ? '+' : ''}{priceChange.percent.toFixed(2)}%
          </div>
          
          <div className="flex items-center gap-1 p-1 rounded-lg bg-white/[0.02]">
            {CHART_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setChartType(type.value)}
                className={cn(
                  'p-2 rounded-md transition-all duration-200',
                  chartType === type.value
                    ? 'bg-white/[0.08] text-white'
                    : 'text-white/30 hover:text-white/50'
                )}
              >
                <type.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className={cn('px-4 sm:px-6 h-[380px] relative', isLoading && 'opacity-50')}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={chartColor} stopOpacity={0.2} />
                <stop offset="100%" stopColor={chartColor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="timestamp"
              tickFormatter={(ts) => formatDate(ts, timeframe)}
              stroke="transparent"
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              minTickGap={60}
            />
            <YAxis
              domain={priceDomain}
              tickFormatter={(v) => `$${v.toFixed(0)}`}
              stroke="transparent"
              tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="close"
              stroke={chartColor}
              strokeWidth={2}
              fill="url(#chartGradient)"
              activeDot={{ r: 5, fill: chartColor, strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Volume Chart */}
      <div className="px-6 sm:px-8 pb-6 pt-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-widest text-white/30">Volume</span>
        </div>
        <div className="h-16">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 0, right: 8, left: 0, bottom: 0 }}>
              <XAxis dataKey="timestamp" hide />
              <YAxis hide />
              <Bar
                dataKey="volume"
                fill={chartColor}
                fillOpacity={0.2}
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
