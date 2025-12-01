'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  BarChart,
  Bar,
} from 'recharts';
import { LineChart as LineChartIcon, BarChart3, TrendingUp, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChartTimeframe, ChartType, ChartDataPoint, PriceChartProps } from './types';

// Timeframe options
const TIMEFRAMES: { value: ChartTimeframe; label: string }[] = [
  { value: '1D', label: '1D' },
  { value: '1W', label: '1W' },
  { value: '1M', label: '1M' },
  { value: '3M', label: '3M' },
  { value: '6M', label: '6M' },
  { value: '1Y', label: '1Y' },
  { value: '5Y', label: '5Y' },
  { value: 'ALL', label: 'ALL' },
];

// Chart type options
const CHART_TYPES: { value: ChartType; label: string; icon: typeof LineChartIcon }[] = [
  { value: 'line', label: 'Line', icon: LineChartIcon },
  { value: 'area', label: 'Area', icon: TrendingUp },
  { value: 'candlestick', label: 'OHLC', icon: BarChart3 },
];

// Format date for display
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

// Format price for tooltip
function formatPrice(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(value);
}

// Format volume
function formatVolume(value: number): string {
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
  return value.toString();
}

// Custom Tooltip
interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataPoint;
    value: number;
  }>;
  label?: string;
}

function CustomTooltip({ active, payload }: TooltipProps) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  return (
    <div className="glass-premium rounded-xl p-4 shadow-2xl animate-fade-up">
      <p className="text-xs text-gray-400 mb-2">
        {new Date(data.timestamp).toLocaleDateString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })}
      </p>
      <div className="space-y-1">
        <div className="flex justify-between gap-6">
          <span className="text-gray-400 text-sm">Open</span>
          <span className="text-white font-medium">{formatPrice(data.open)}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-gray-400 text-sm">High</span>
          <span className="text-[#3FE3C2] font-medium">{formatPrice(data.high)}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-gray-400 text-sm">Low</span>
          <span className="text-red-400 font-medium">{formatPrice(data.low)}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span className="text-gray-400 text-sm">Close</span>
          <span className="text-white font-medium">{formatPrice(data.close)}</span>
        </div>
        <div className="flex justify-between gap-6 pt-1 border-t border-white/10">
          <span className="text-gray-400 text-sm">Volume</span>
          <span className="text-gray-300">{formatVolume(data.volume)}</span>
        </div>
      </div>
    </div>
  );
}

// Generate mock data for demo (replace with actual API call)
// Seeded random number generator for consistent SSR/CSR
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
    
    // Use deterministic seed based on day index
    const seed = i + days * 1000;

    const change = (seededRandom(seed) - 0.48) * 5;
    price = Math.max(price + change, basePrice * 0.8);

    const dayHigh = price + seededRandom(seed + 1) * 3;
    const dayLow = price - seededRandom(seed + 2) * 3;

    data.push({
      date: date.toISOString().split('T')[0],
      timestamp: date.getTime(),
      open: price - seededRandom(seed + 3) * 2,
      high: dayHigh,
      low: dayLow,
      close: price,
      volume: Math.floor(seededRandom(seed + 4) * 100000000) + 50000000,
    });
  }

  return data;
}

// Get days for timeframe
function getDaysForTimeframe(timeframe: ChartTimeframe): number {
  switch (timeframe) {
    case '1D': return 1;
    case '1W': return 7;
    case '1M': return 30;
    case '3M': return 90;
    case '6M': return 180;
    case '1Y': return 365;
    case '5Y': return 1825;
    case 'ALL': return 3650;
    default: return 30;
  }
}

export function PriceChart({ symbol, initialData }: PriceChartProps) {
  const [timeframe, setTimeframe] = useState<ChartTimeframe>('1M');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [isLoading, setIsLoading] = useState(true);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch historical data from API
  const fetchHistoricalData = useCallback(async (tf: ChartTimeframe) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/stock/${symbol}/historical?timeframe=${tf}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch historical data');
      }
      
      const result = await response.json();
      
      if (result.data && result.data.length > 0) {
        setChartData(result.data);
      } else {
        // Fallback to mock data if no real data
        setChartData(generateMockData(getDaysForTimeframe(tf)));
      }
    } catch (err) {
      console.error('Error fetching chart data:', err);
      setError('Failed to load chart data');
      // Fallback to mock data on error
      setChartData(generateMockData(getDaysForTimeframe(tf)));
    } finally {
      setIsLoading(false);
    }
  }, [symbol]);

  // Fetch data on mount and when timeframe changes
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setChartData(initialData);
      setIsLoading(false);
    } else {
      fetchHistoricalData(timeframe);
    }
  }, [timeframe, initialData, fetchHistoricalData]);

  // Handle timeframe change
  const handleTimeframeChange = useCallback(async (tf: ChartTimeframe) => {
    setTimeframe(tf);
    fetchHistoricalData(tf);
  }, [fetchHistoricalData]);

  // Calculate price change
  const priceChange = useMemo(() => {
    if (chartData.length < 2) return { value: 0, percent: 0, isPositive: true };
    const first = chartData[0].close;
    const last = chartData[chartData.length - 1].close;
    const change = last - first;
    const percent = (change / first) * 100;
    return { value: change, percent, isPositive: change >= 0 };
  }, [chartData]);

  // Price domain for Y axis
  const priceDomain = useMemo(() => {
    const prices = chartData.flatMap((d) => [d.high, d.low]);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const padding = (max - min) * 0.1;
    return [min - padding, max + padding];
  }, [chartData]);

  // Handle timeframe change
  const handleTimeframeChange = useCallback(async (tf: ChartTimeframe) => {
    setIsLoading(true);
    setTimeframe(tf);
    // TODO: Fetch data from API
    // const data = await fetchHistoricalData(symbol, tf);
    setTimeout(() => setIsLoading(false), 300); // Simulate loading
  }, []);

  // Get color based on price change
  const chartColor = priceChange.isPositive ? '#3FE3C2' : '#f87171';
  const chartColorLight = priceChange.isPositive ? 'rgba(63, 227, 194, 0.1)' : 'rgba(248, 113, 113, 0.1)';

  return (
    <div className="glass-premium rounded-2xl overflow-hidden animate-fade-up">
      {/* Chart Header */}
      <div className="p-6 border-b border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Timeframe Selector */}
        <div className="flex items-center gap-1 glass-premium rounded-xl p-1">
          {TIMEFRAMES.map((tf) => (
            <button
              key={tf.value}
              onClick={() => handleTimeframeChange(tf.value)}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                timeframe === tf.value
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              {tf.label}
            </button>
          ))}
        </div>

        {/* Chart Type & Stats */}
        <div className="flex items-center gap-4">
          {/* Price Change Badge */}
          <div
            className={cn(
              'px-4 py-2 rounded-xl text-sm font-medium glass-premium',
              priceChange.isPositive ? 'text-[#3FE3C2] border-[#3FE3C2]/30' : 'text-red-400 border-red-500/30'
            )}
          >
            {priceChange.isPositive ? '+' : ''}{priceChange.percent.toFixed(2)}% ({timeframe})
          </div>

          {/* Chart Type Selector */}
          <div className="flex items-center gap-1 glass-premium rounded-lg p-1">
            {CHART_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setChartType(type.value)}
                className={cn(
                  'p-2 rounded-lg transition-all duration-200',
                  chartType === type.value
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                )}
                title={type.label}
              >
                <type.icon className="h-4 w-4" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className={cn('p-6 h-[400px] relative', isLoading && 'opacity-50')}>
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'line' ? (
            <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(ts) => formatDate(ts, timeframe)}
                stroke="#4B5563"
                tick={{ fill: '#6B7280', fontSize: 11 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={false}
                minTickGap={50}
              />
              <YAxis
                domain={priceDomain}
                tickFormatter={(v) => `$${v.toFixed(0)}`}
                stroke="#4B5563"
                tick={{ fill: '#6B7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={chartData[0]?.close} stroke="#4B5563" strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="close"
                stroke={chartColor}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, fill: chartColor, strokeWidth: 2, stroke: '#0a0a0a' }}
              />
            </LineChart>
          ) : chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(ts) => formatDate(ts, timeframe)}
                stroke="#4B5563"
                tick={{ fill: '#6B7280', fontSize: 11 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={false}
                minTickGap={50}
              />
              <YAxis
                domain={priceDomain}
                tickFormatter={(v) => `$${v.toFixed(0)}`}
                stroke="#4B5563"
                tick={{ fill: '#6B7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine y={chartData[0]?.close} stroke="#4B5563" strokeDasharray="3 3" />
              <Area
                type="monotone"
                dataKey="close"
                stroke={chartColor}
                strokeWidth={2}
                fill="url(#colorPrice)"
                activeDot={{ r: 6, fill: chartColor, strokeWidth: 2, stroke: '#0a0a0a' }}
              />
            </AreaChart>
          ) : (
            // Candlestick-style OHLC (simplified as bar chart showing range)
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorOHLC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="timestamp"
                tickFormatter={(ts) => formatDate(ts, timeframe)}
                stroke="#4B5563"
                tick={{ fill: '#6B7280', fontSize: 11 }}
                axisLine={{ stroke: '#374151' }}
                tickLine={false}
                minTickGap={50}
              />
              <YAxis
                domain={priceDomain}
                tickFormatter={(v) => `$${v.toFixed(0)}`}
                stroke="#4B5563"
                tick={{ fill: '#6B7280', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={60}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="stepAfter"
                dataKey="high"
                stroke="transparent"
                fill={chartColorLight}
              />
              <Area
                type="stepAfter"
                dataKey="close"
                stroke={chartColor}
                strokeWidth={2}
                fill="none"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Volume Chart */}
      <div className="px-4 pb-4 h-24">
        <p className="label-caps text-gray-500 mb-2">Volume</p>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
            <XAxis dataKey="timestamp" hide />
            <YAxis hide />
            <Tooltip
              formatter={(value: number) => [formatVolume(value), 'Volume']}
              contentStyle={{
                backgroundColor: 'rgba(10, 10, 10, 0.95)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
              }}
              labelFormatter={(ts) =>
                new Date(ts).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })
              }
            />
            <Bar
              dataKey="volume"
              fill={chartColor}
              fillOpacity={0.3}
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
