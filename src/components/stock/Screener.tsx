'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Search,
  SlidersHorizontal,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Save,
  Bookmark,
  Star,
  TrendingUp,
  TrendingDown,
  BarChart2,
  Zap,
  Award,
  Target,
  X,
  Loader2,
  RefreshCw,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// Types
export interface ScreenerFilters {
  marketCap: {
    min: number | null;
    max: number | null;
    preset: 'any' | 'micro' | 'small' | 'mid' | 'large' | 'mega' | null;
  };
  sector: string[];
  industry: string[];
  peRatio: { min: number | null; max: number | null };
  pbRatio: { min: number | null; max: number | null };
  dividendYield: { min: number | null; max: number | null };
  roe: { min: number | null; max: number | null };
  roa: { min: number | null; max: number | null };
  revenueGrowth: { min: number | null; max: number | null };
  epsGrowth: { min: number | null; max: number | null };
  debtToEquity: { min: number | null; max: number | null };
  currentRatio: { min: number | null; max: number | null };
  rsi: { min: number | null; max: number | null };
  macdSignal: 'any' | 'bullish' | 'bearish' | null;
  piotroskiScore: { min: number | null; max: number | null };
  altmanZ: { min: number | null; max: number | null };
}

export interface ScreenerPreset {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  filters: Partial<ScreenerFilters>;
  color: string;
}

interface ScreenedStock {
  symbol: string;
  companyName: string;
  sector: string;
  industry: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  peRatio: number | null;
  forwardPE: number | null;
  pbRatio: number | null;
  psRatio: number | null;
  dividendYield: number | null;
  roe: number | null;
  roa: number | null;
  profitMargin: number | null;
  revenueGrowth: number | null;
  earningsGrowth: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  beta: number | null;
  fiftyTwoWeekHigh: number | null;
  fiftyTwoWeekLow: number | null;
  fiftyDayMA: number | null;
  twoHundredDayMA: number | null;
}

type SortField = keyof ScreenedStock;
type SortDirection = 'asc' | 'desc';

// Default filters
const DEFAULT_FILTERS: ScreenerFilters = {
  marketCap: { min: null, max: null, preset: null },
  sector: [],
  industry: [],
  peRatio: { min: null, max: null },
  pbRatio: { min: null, max: null },
  dividendYield: { min: null, max: null },
  roe: { min: null, max: null },
  roa: { min: null, max: null },
  revenueGrowth: { min: null, max: null },
  epsGrowth: { min: null, max: null },
  debtToEquity: { min: null, max: null },
  currentRatio: { min: null, max: null },
  rsi: { min: null, max: null },
  macdSignal: null,
  piotroskiScore: { min: null, max: null },
  altmanZ: { min: null, max: null },
};

// Preset screens
const PRESET_SCREENS: ScreenerPreset[] = [
  {
    id: 'value',
    name: 'Value',
    description: 'Low P/E, high dividends',
    icon: <Target className="h-4 w-4" />,
    color: '#10B981',
    filters: {
      peRatio: { min: null, max: 15 },
      dividendYield: { min: 2, max: null },
      pbRatio: { min: null, max: 2 },
    },
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'High growth, momentum',
    icon: <TrendingUp className="h-4 w-4" />,
    color: '#3B82F6',
    filters: {
      revenueGrowth: { min: 15, max: null },
      epsGrowth: { min: 20, max: null },
      rsi: { min: 50, max: 70 },
    },
  },
  {
    id: 'quality',
    name: 'Quality',
    description: 'Strong fundamentals',
    icon: <Award className="h-4 w-4" />,
    color: '#F59E0B',
    filters: {
      piotroskiScore: { min: 7, max: null },
      roe: { min: 15, max: null },
      currentRatio: { min: 1.5, max: null },
    },
  },
  {
    id: 'momentum',
    name: 'Momentum',
    description: 'Bullish signals',
    icon: <Zap className="h-4 w-4" />,
    color: '#EC4899',
    filters: {
      rsi: { min: 55, max: 75 },
      macdSignal: 'bullish',
      revenueGrowth: { min: 10, max: null },
    },
  },
];

// Market cap presets (in billions)
const MARKET_CAP_PRESETS = {
  micro: { min: 0, max: 0.3, label: 'Micro (<$300M)' },
  small: { min: 0.3, max: 2, label: 'Small ($300M-$2B)' },
  mid: { min: 2, max: 10, label: 'Mid ($2B-$10B)' },
  large: { min: 10, max: 200, label: 'Large ($10B-$200B)' },
  mega: { min: 200, max: null, label: 'Mega (>$200B)' },
};

// Sectors and industries
const SECTORS = [
  'Technology',
  'Healthcare',
  'Financial Services',
  'Consumer Cyclical',
  'Consumer Defensive',
  'Industrials',
  'Energy',
  'Utilities',
  'Real Estate',
  'Communication Services',
  'Basic Materials',
];

interface ScreenerProps {
  initialFilters?: Partial<ScreenerFilters>;
}

// API Response types
interface ScreenerAPIResponse {
  success: boolean;
  data: ScreenedStock[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  meta: {
    sectors: string[];
    industries: string[];
    lastUpdated: number;
  };
  error?: string;
}

export function Screener({ initialFilters }: ScreenerProps) {
  const router = useRouter();
  const [filters, setFilters] = useState<ScreenerFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });
  const [sortField, setSortField] = useState<SortField>('marketCap');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [showFilters, setShowFilters] = useState(true);
  const [savedScreens, setSavedScreens] = useState<{ name: string; filters: ScreenerFilters }[]>([]);
  const [savingScreen, setSavingScreen] = useState(false);
  const [screenName, setScreenName] = useState('');
  
  // API state
  const [allStocks, setAllStocks] = useState<ScreenedStock[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number | null>(null);
  const [totalStocks, setTotalStocks] = useState(0);
  const [availableSectors, setAvailableSectors] = useState<string[]>(SECTORS);

  // Fetch stocks from API
  const fetchStocks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Build query params based on filters
      const params = new URLSearchParams();
      params.set('limit', '500'); // Get all stocks
      params.set('sortBy', sortField);
      params.set('sortOrder', sortDirection);
      
      if (filters.sector.length > 0) {
        params.set('sector', filters.sector.join(','));
      }
      
      if (filters.marketCap.preset && filters.marketCap.preset !== 'any') {
        const preset = MARKET_CAP_PRESETS[filters.marketCap.preset];
        if (preset.min !== null) params.set('minMarketCap', preset.min.toString());
        if (preset.max !== null) params.set('maxMarketCap', preset.max.toString());
      }
      
      if (filters.peRatio.min !== null) params.set('minPE', filters.peRatio.min.toString());
      if (filters.peRatio.max !== null) params.set('maxPE', filters.peRatio.max.toString());
      
      if (filters.dividendYield.min !== null) params.set('minDividend', filters.dividendYield.min.toString());
      if (filters.dividendYield.max !== null) params.set('maxDividend', filters.dividendYield.max.toString());
      
      const response = await fetch(`/api/stocks/screener?${params.toString()}`);
      const data: ScreenerAPIResponse = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to fetch stocks');
      }
      
      setAllStocks(data.data);
      setTotalStocks(data.pagination.total);
      setLastUpdated(data.meta.lastUpdated);
      if (data.meta.sectors.length > 0) {
        setAvailableSectors(data.meta.sectors);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load stocks');
      console.error('Screener fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [filters.sector, filters.marketCap.preset, filters.peRatio, filters.dividendYield, sortField, sortDirection]);

  // Initial fetch
  useEffect(() => {
    fetchStocks();
  }, [fetchStocks]);

  // Client-side filtering for filters not in API
  const filteredStocks = useMemo(() => {
    return allStocks.filter(stock => {
      // P/B Ratio filter
      if (filters.pbRatio.min !== null && (stock.pbRatio === null || stock.pbRatio < filters.pbRatio.min)) return false;
      if (filters.pbRatio.max !== null && (stock.pbRatio === null || stock.pbRatio > filters.pbRatio.max)) return false;

      // ROE filter
      if (filters.roe.min !== null && (stock.roe === null || stock.roe < filters.roe.min)) return false;
      if (filters.roe.max !== null && (stock.roe === null || stock.roe > filters.roe.max)) return false;

      // ROA filter
      if (filters.roa.min !== null && (stock.roa === null || stock.roa < filters.roa.min)) return false;
      if (filters.roa.max !== null && (stock.roa === null || stock.roa > filters.roa.max)) return false;

      // Revenue Growth filter
      if (filters.revenueGrowth.min !== null && (stock.revenueGrowth === null || stock.revenueGrowth < filters.revenueGrowth.min)) return false;
      if (filters.revenueGrowth.max !== null && (stock.revenueGrowth === null || stock.revenueGrowth > filters.revenueGrowth.max)) return false;

      // Earnings Growth filter (using earningsGrowth instead of epsGrowth)
      const stockEarningsGrowth = stock.earningsGrowth;
      if (filters.epsGrowth.min !== null && (stockEarningsGrowth === null || stockEarningsGrowth < filters.epsGrowth.min)) return false;
      if (filters.epsGrowth.max !== null && (stockEarningsGrowth === null || stockEarningsGrowth > filters.epsGrowth.max)) return false;

      // Debt to Equity filter
      if (filters.debtToEquity.min !== null && (stock.debtToEquity === null || stock.debtToEquity < filters.debtToEquity.min)) return false;
      if (filters.debtToEquity.max !== null && (stock.debtToEquity === null || stock.debtToEquity > filters.debtToEquity.max)) return false;

      // Current Ratio filter
      if (filters.currentRatio.min !== null && (stock.currentRatio === null || stock.currentRatio < filters.currentRatio.min)) return false;
      if (filters.currentRatio.max !== null && (stock.currentRatio === null || stock.currentRatio > filters.currentRatio.max)) return false;

      return true;
    });
  }, [allStocks, filters]);

  const sortedStocks = useMemo(() => {
    return [...filteredStocks].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;
      
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filteredStocks, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const applyPreset = (preset: ScreenerPreset) => {
    setFilters({
      ...DEFAULT_FILTERS,
      ...preset.filters,
    });
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  const saveScreen = () => {
    if (screenName.trim()) {
      setSavedScreens([...savedScreens, { name: screenName, filters }]);
      setScreenName('');
      setSavingScreen(false);
    }
  };

  const loadSavedScreen = (saved: { name: string; filters: ScreenerFilters }) => {
    setFilters(saved.filters);
  };

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.marketCap.preset && filters.marketCap.preset !== 'any') count++;
    if (filters.sector.length > 0) count++;
    if (filters.peRatio.min !== null || filters.peRatio.max !== null) count++;
    if (filters.pbRatio.min !== null || filters.pbRatio.max !== null) count++;
    if (filters.dividendYield.min !== null || filters.dividendYield.max !== null) count++;
    if (filters.roe.min !== null || filters.roe.max !== null) count++;
    if (filters.roa.min !== null || filters.roa.max !== null) count++;
    if (filters.revenueGrowth.min !== null || filters.revenueGrowth.max !== null) count++;
    if (filters.epsGrowth.min !== null || filters.epsGrowth.max !== null) count++;
    if (filters.debtToEquity.min !== null || filters.debtToEquity.max !== null) count++;
    if (filters.currentRatio.min !== null || filters.currentRatio.max !== null) count++;
    if (filters.rsi.min !== null || filters.rsi.max !== null) count++;
    if (filters.macdSignal && filters.macdSignal !== 'any') count++;
    if (filters.piotroskiScore.min !== null || filters.piotroskiScore.max !== null) count++;
    if (filters.altmanZ.min !== null || filters.altmanZ.max !== null) count++;
    return count;
  }, [filters]);

  return (
    <div className="space-y-10">
      {/* Header - Premium & Clean */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            Stock Screener
          </h1>
          <p className="text-base text-white/40 font-light mt-2 leading-relaxed">
            {isLoading ? 'Loading stocks...' : `${filteredStocks.length.toLocaleString()} of ${totalStocks.toLocaleString()} stocks`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchStocks()}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl transition-all duration-200"
          >
            <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            onClick={() => setSavingScreen(true)}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06] rounded-xl transition-all duration-200"
          >
            <Save className="w-4 h-4" />
            <span className="hidden sm:inline">Save</span>
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl transition-all duration-200",
              showFilters 
                ? "bg-white/[0.08] text-white border border-white/[0.08]" 
                : "text-white/60 hover:text-white bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.06]"
            )}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilterCount > 0 && (
              <span className="px-1.5 py-0.5 text-xs bg-emerald-500/20 text-emerald-400 rounded-md">
                {activeFilterCount}
              </span>
            )}
          </button>
        </div>
      </motion.header>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20"
        >
          <p className="text-rose-400 text-sm font-light">{error}</p>
          <button
            onClick={() => fetchStocks()}
            className="mt-3 px-4 py-2 text-sm bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-rose-400 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </motion.div>
      )}

      {/* Save Screen Modal */}
      <AnimatePresence>
        {savingScreen && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="p-5 rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
          >
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={screenName}
                onChange={(e) => setScreenName(e.target.value)}
                placeholder="Screen name..."
                className="flex-1 px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/[0.12] transition-colors"
              />
              <button
                onClick={saveScreen}
                className="px-5 py-3 bg-emerald-500/90 hover:bg-emerald-500 text-white rounded-xl font-medium transition-all"
              >
                Save
              </button>
              <button
                onClick={() => setSavingScreen(false)}
                className="px-4 py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/60 rounded-xl transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Smart Presets - Primary */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <div className="flex items-center gap-3 mb-5">
          <h2 className="text-sm font-medium text-white/40 uppercase tracking-wider">Smart Presets</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {PRESET_SCREENS.map(preset => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="group p-5 rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.08] hover:-translate-y-0.5 transition-all duration-200 text-left shadow-[0_4px_20px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="p-2.5 rounded-xl"
                  style={{ backgroundColor: `${preset.color}15`, color: preset.color }}
                >
                  {preset.icon}
                </div>
                <span className="font-medium text-white tracking-tight">{preset.name}</span>
              </div>
              <p className="text-sm text-white/35 font-light leading-relaxed">{preset.description}</p>
            </button>
          ))}
        </div>
      </motion.section>

      {/* Saved Screens */}
      <AnimatePresence>
        {savedScreens.length > 0 && (
          <motion.section
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 mb-4">
              <Bookmark className="h-4 w-4 text-white/30" />
              <span className="text-sm font-medium text-white/40">Saved Screens</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {savedScreens.map((saved, i) => (
                <button
                  key={i}
                  onClick={() => loadSavedScreen(saved)}
                  className="px-4 py-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/[0.05] text-white/70 hover:text-white text-sm transition-all duration-200"
                >
                  {saved.name}
                </button>
              ))}
            </div>
          </motion.section>
        )}
      </AnimatePresence>

      {/* Filters Panel - Secondary */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <ScreenerFiltersPanel
              filters={filters}
              onChange={setFilters}
              onReset={resetFilters}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Table - Tertiary */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
        className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
      >
        {isLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="h-8 w-8 text-white/30 mx-auto mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-white tracking-tight mb-2">Loading stocks...</h3>
            <p className="text-white/40 font-light">Fetching data for {totalStocks || '500+'} stocks</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/[0.05]">
                    <SortableHeader field="symbol" label="Symbol" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                    <SortableHeader field="sector" label="Sector" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                    <SortableHeader field="price" label="Price" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                    <SortableHeader field="changePercent" label="Change" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                    <SortableHeader field="marketCap" label="Market Cap" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                    <SortableHeader field="peRatio" label="P/E" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                    <SortableHeader field="forwardPE" label="Fwd P/E" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                    <SortableHeader field="pbRatio" label="P/B" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                    <SortableHeader field="dividendYield" label="Div Yield" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                    <SortableHeader field="beta" label="Beta" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                  </tr>
                </thead>
                <tbody>
                  {sortedStocks.map((stock, idx) => (
                    <tr
                      key={stock.symbol}
                      onClick={() => router.push(`/dashboard/stock-analysis/${stock.symbol}`)}
                      className={cn(
                        "hover:bg-white/[0.03] cursor-pointer transition-colors",
                        idx !== sortedStocks.length - 1 && "border-b border-white/[0.03]"
                      )}
                    >
                      <td className="px-5 py-4">
                        <div>
                          <div className="font-medium text-white text-sm">{stock.symbol}</div>
                          <div className="text-xs text-white/30 font-light truncate max-w-[140px]">{stock.companyName}</div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.04] text-white/50 font-light">
                          {stock.sector}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-white font-medium text-sm">${stock.price?.toFixed(2) || 'N/A'}</td>
                      <td className="px-5 py-4">
                        <span className={cn(
                          "flex items-center gap-1 text-sm font-light",
                          stock.changePercent >= 0 ? "text-emerald-400" : "text-rose-400"
                        )}>
                          {stock.changePercent >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                          {stock.changePercent?.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-5 py-4 text-white/70 text-sm font-light">
                        {stock.marketCap >= 1000 ? `$${(stock.marketCap / 1000).toFixed(1)}T` : 
                         stock.marketCap >= 1 ? `$${stock.marketCap.toFixed(1)}B` : 
                         `$${(stock.marketCap * 1000).toFixed(0)}M`}
                      </td>
                      <td className="px-5 py-4 text-white/70 text-sm font-light">{stock.peRatio?.toFixed(1) || '—'}</td>
                      <td className="px-5 py-4 text-white/70 text-sm font-light">{stock.forwardPE?.toFixed(1) || '—'}</td>
                      <td className="px-5 py-4 text-white/70 text-sm font-light">{stock.pbRatio?.toFixed(2) || '—'}</td>
                      <td className="px-5 py-4 text-white/70 text-sm font-light">
                        {stock.dividendYield ? `${stock.dividendYield.toFixed(2)}%` : '—'}
                      </td>
                      <td className="px-5 py-4">
                        <span className={cn(
                          "text-sm font-light",
                          stock.beta && stock.beta > 1.5 ? "text-rose-400/80" :
                          stock.beta && stock.beta < 0.8 ? "text-emerald-400/80" :
                          "text-white/70"
                        )}>
                          {stock.beta?.toFixed(2) || '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {sortedStocks.length === 0 && !isLoading && (
              <div className="py-20 text-center">
                <div className="h-14 w-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-5">
                  <Search className="h-6 w-6 text-white/25" />
                </div>
                <h3 className="text-lg font-medium text-white tracking-tight mb-2">No stocks match your criteria</h3>
                <p className="text-white/40 font-light mb-6">Try adjusting your filters or use a preset</p>
                <button
                  onClick={resetFilters}
                  className="px-5 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/70 hover:text-white rounded-xl text-sm transition-all"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </>
        )}
      </motion.section>
    </div>
  );
}

// Sortable Header Component - Premium
function SortableHeader({
  field,
  label,
  sortField,
  sortDirection,
  onSort,
}: {
  field: SortField;
  label: string;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
}) {
  const isActive = sortField === field;
  
  return (
    <th
      className="px-5 py-4 text-left cursor-pointer hover:bg-white/[0.02] transition-colors"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1.5 text-xs text-white/40 font-medium uppercase tracking-wider">
        {label}
        <div className="flex flex-col">
          {isActive ? (
            sortDirection === 'asc' ? (
              <ChevronUp className="h-3.5 w-3.5 text-white/70" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5 text-white/70" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 text-white/20" />
          )}
        </div>
      </div>
    </th>
  );
}

// Filters Panel Component - Premium Redesign
function ScreenerFiltersPanel({
  filters,
  onChange,
  onReset,
}: {
  filters: ScreenerFilters;
  onChange: (filters: ScreenerFilters) => void;
  onReset: () => void;
}) {
  const updateFilter = <K extends keyof ScreenerFilters>(
    key: K,
    value: ScreenerFilters[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6 lg:p-8 rounded-2xl bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-lg font-medium text-white tracking-tight">Filters</h2>
        <button
          onClick={onReset}
          className="text-sm text-white/40 hover:text-white transition-colors"
        >
          Reset All
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-8">
        {/* Market Cap */}
        <FilterField label="Market Cap">
          <select
            value={filters.marketCap.preset || 'any'}
            onChange={(e) => updateFilter('marketCap', {
              ...filters.marketCap,
              preset: e.target.value as ScreenerFilters['marketCap']['preset'],
            })}
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-white/[0.12] transition-all appearance-none cursor-pointer"
          >
            <option value="any">Any</option>
            {Object.entries(MARKET_CAP_PRESETS).map(([key, value]) => (
              <option key={key} value={key}>{value.label}</option>
            ))}
          </select>
        </FilterField>

        {/* Sector */}
        <FilterField label="Sector">
          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
            {SECTORS.map(sector => (
              <button
                key={sector}
                onClick={() => {
                  const newSectors = filters.sector.includes(sector)
                    ? filters.sector.filter(s => s !== sector)
                    : [...filters.sector, sector];
                  updateFilter('sector', newSectors);
                }}
                className={cn(
                  "px-2.5 py-1.5 rounded-lg text-xs transition-all duration-200",
                  filters.sector.includes(sector)
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"
                    : "bg-white/[0.03] text-white/50 hover:bg-white/[0.06] hover:text-white/70 border border-transparent"
                )}
              >
                {sector}
              </button>
            ))}
          </div>
        </FilterField>

        {/* P/E Ratio */}
        <FilterField label="P/E Ratio">
          <RangeInput
            minValue={filters.peRatio.min}
            maxValue={filters.peRatio.max}
            onMinChange={(val) => updateFilter('peRatio', { ...filters.peRatio, min: val })}
            onMaxChange={(val) => updateFilter('peRatio', { ...filters.peRatio, max: val })}
          />
        </FilterField>

        {/* Dividend Yield */}
        <FilterField label="Dividend Yield (%)">
          <RangeInput
            minValue={filters.dividendYield.min}
            maxValue={filters.dividendYield.max}
            onMinChange={(val) => updateFilter('dividendYield', { ...filters.dividendYield, min: val })}
            onMaxChange={(val) => updateFilter('dividendYield', { ...filters.dividendYield, max: val })}
          />
        </FilterField>

        {/* ROE */}
        <FilterField label="ROE (%)">
          <RangeInput
            minValue={filters.roe.min}
            maxValue={filters.roe.max}
            onMinChange={(val) => updateFilter('roe', { ...filters.roe, min: val })}
            onMaxChange={(val) => updateFilter('roe', { ...filters.roe, max: val })}
          />
        </FilterField>

        {/* ROA */}
        <FilterField label="ROA (%)">
          <RangeInput
            minValue={filters.roa.min}
            maxValue={filters.roa.max}
            onMinChange={(val) => updateFilter('roa', { ...filters.roa, min: val })}
            onMaxChange={(val) => updateFilter('roa', { ...filters.roa, max: val })}
          />
        </FilterField>

        {/* Revenue Growth */}
        <FilterField label="Revenue Growth (%)">
          <RangeInput
            minValue={filters.revenueGrowth.min}
            maxValue={filters.revenueGrowth.max}
            onMinChange={(val) => updateFilter('revenueGrowth', { ...filters.revenueGrowth, min: val })}
            onMaxChange={(val) => updateFilter('revenueGrowth', { ...filters.revenueGrowth, max: val })}
          />
        </FilterField>

        {/* EPS Growth */}
        <FilterField label="EPS Growth (%)">
          <RangeInput
            minValue={filters.epsGrowth.min}
            maxValue={filters.epsGrowth.max}
            onMinChange={(val) => updateFilter('epsGrowth', { ...filters.epsGrowth, min: val })}
            onMaxChange={(val) => updateFilter('epsGrowth', { ...filters.epsGrowth, max: val })}
          />
        </FilterField>

        {/* Debt to Equity */}
        <FilterField label="Debt/Equity">
          <RangeInput
            minValue={filters.debtToEquity.min}
            maxValue={filters.debtToEquity.max}
            step={0.1}
            onMinChange={(val) => updateFilter('debtToEquity', { ...filters.debtToEquity, min: val })}
            onMaxChange={(val) => updateFilter('debtToEquity', { ...filters.debtToEquity, max: val })}
          />
        </FilterField>

        {/* Current Ratio */}
        <FilterField label="Current Ratio">
          <RangeInput
            minValue={filters.currentRatio.min}
            maxValue={filters.currentRatio.max}
            step={0.1}
            onMinChange={(val) => updateFilter('currentRatio', { ...filters.currentRatio, min: val })}
            onMaxChange={(val) => updateFilter('currentRatio', { ...filters.currentRatio, max: val })}
          />
        </FilterField>

        {/* RSI */}
        <FilterField label="RSI">
          <RangeInput
            minValue={filters.rsi.min}
            maxValue={filters.rsi.max}
            min={0}
            max={100}
            onMinChange={(val) => updateFilter('rsi', { ...filters.rsi, min: val })}
            onMaxChange={(val) => updateFilter('rsi', { ...filters.rsi, max: val })}
          />
        </FilterField>

        {/* MACD Signal */}
        <FilterField label="MACD Signal">
          <select
            value={filters.macdSignal || 'any'}
            onChange={(e) => updateFilter('macdSignal', e.target.value as ScreenerFilters['macdSignal'])}
            className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm focus:outline-none focus:border-white/[0.12] transition-all appearance-none cursor-pointer"
          >
            <option value="any">Any</option>
            <option value="bullish">Bullish</option>
            <option value="bearish">Bearish</option>
          </select>
        </FilterField>

        {/* Piotroski F-Score */}
        <FilterField label="Piotroski Score">
          <RangeInput
            minValue={filters.piotroskiScore.min}
            maxValue={filters.piotroskiScore.max}
            min={0}
            max={9}
            onMinChange={(val) => updateFilter('piotroskiScore', { ...filters.piotroskiScore, min: val })}
            onMaxChange={(val) => updateFilter('piotroskiScore', { ...filters.piotroskiScore, max: val })}
          />
        </FilterField>

        {/* Altman Z-Score */}
        <FilterField label="Altman Z-Score">
          <RangeInput
            minValue={filters.altmanZ.min}
            maxValue={filters.altmanZ.max}
            step={0.1}
            onMinChange={(val) => updateFilter('altmanZ', { ...filters.altmanZ, min: val })}
            onMaxChange={(val) => updateFilter('altmanZ', { ...filters.altmanZ, max: val })}
          />
        </FilterField>
      </div>
    </motion.div>
  );
}

// Filter Field Wrapper
function FilterField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-white/35 uppercase tracking-wider mb-3">
        {label}
      </label>
      {children}
    </div>
  );
}

// Range Input Component - Premium unified design
function RangeInput({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  step = 1,
  min,
  max,
}: {
  minValue: number | null;
  maxValue: number | null;
  onMinChange: (val: number | null) => void;
  onMaxChange: (val: number | null) => void;
  step?: number;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="number"
        placeholder="Min"
        step={step}
        min={min}
        max={max}
        value={minValue ?? ''}
        onChange={(e) => onMinChange(e.target.value ? parseFloat(e.target.value) : null)}
        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/[0.12] hover:bg-white/[0.04] transition-all"
      />
      <span className="text-white/20 text-sm">—</span>
      <input
        type="number"
        placeholder="Max"
        step={step}
        min={min}
        max={max}
        value={maxValue ?? ''}
        onChange={(e) => onMaxChange(e.target.value ? parseFloat(e.target.value) : null)}
        className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white text-sm placeholder-white/25 focus:outline-none focus:border-white/[0.12] hover:bg-white/[0.04] transition-all"
      />
    </div>
  );
}

export default Screener;
