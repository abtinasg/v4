'use client';

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

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
  pbRatio: number | null;
  dividendYield: number | null;
  roe: number | null;
  roa: number | null;
  revenueGrowth: number | null;
  epsGrowth: number | null;
  debtToEquity: number | null;
  currentRatio: number | null;
  rsi: number | null;
  macdSignal: 'bullish' | 'bearish' | 'neutral';
  piotroskiScore: number;
  altmanZ: number;
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
    name: 'Value Stocks',
    description: 'Low P/E, high dividend yield stocks',
    icon: <Target className="h-5 w-5" />,
    color: '#22C55E',
    filters: {
      peRatio: { min: null, max: 15 },
      dividendYield: { min: 2, max: null },
      pbRatio: { min: null, max: 2 },
    },
  },
  {
    id: 'growth',
    name: 'Growth Stocks',
    description: 'High growth, strong momentum',
    icon: <TrendingUp className="h-5 w-5" />,
    color: '#3B82F6',
    filters: {
      revenueGrowth: { min: 15, max: null },
      epsGrowth: { min: 20, max: null },
      rsi: { min: 50, max: 70 },
    },
  },
  {
    id: 'quality',
    name: 'Quality Stocks',
    description: 'High Piotroski score, strong fundamentals',
    icon: <Award className="h-5 w-5" />,
    color: '#F59E0B',
    filters: {
      piotroskiScore: { min: 7, max: null },
      roe: { min: 15, max: null },
      currentRatio: { min: 1.5, max: null },
    },
  },
  {
    id: 'momentum',
    name: 'Momentum Stocks',
    description: 'Strong RSI, bullish MACD',
    icon: <Zap className="h-5 w-5" />,
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

// Mock data generation
function generateMockStocks(count: number): ScreenedStock[] {
  const stocks: ScreenedStock[] = [];
  const symbols = [
    'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'TSLA', 'JPM', 'V', 'JNJ',
    'WMT', 'PG', 'UNH', 'HD', 'MA', 'BAC', 'XOM', 'PFE', 'CVX', 'ABBV',
    'KO', 'PEP', 'MRK', 'TMO', 'COST', 'AVGO', 'MCD', 'DHR', 'ACN', 'CSCO',
    'ABT', 'LLY', 'NKE', 'ADBE', 'CRM', 'TXN', 'NEE', 'QCOM', 'PM', 'BMY',
  ];
  
  const names: Record<string, string> = {
    AAPL: 'Apple Inc.', MSFT: 'Microsoft Corp', GOOGL: 'Alphabet Inc.', AMZN: 'Amazon.com Inc.',
    NVDA: 'NVIDIA Corp', META: 'Meta Platforms', TSLA: 'Tesla Inc.', JPM: 'JPMorgan Chase',
    V: 'Visa Inc.', JNJ: 'Johnson & Johnson', WMT: 'Walmart Inc.', PG: 'Procter & Gamble',
    UNH: 'UnitedHealth Group', HD: 'Home Depot', MA: 'Mastercard Inc.', BAC: 'Bank of America',
    XOM: 'Exxon Mobil', PFE: 'Pfizer Inc.', CVX: 'Chevron Corp', ABBV: 'AbbVie Inc.',
    KO: 'Coca-Cola Co', PEP: 'PepsiCo Inc.', MRK: 'Merck & Co', TMO: 'Thermo Fisher',
    COST: 'Costco Wholesale', AVGO: 'Broadcom Inc.', MCD: "McDonald's Corp", DHR: 'Danaher Corp',
    ACN: 'Accenture plc', CSCO: 'Cisco Systems', ABT: 'Abbott Labs', LLY: 'Eli Lilly',
    NKE: 'Nike Inc.', ADBE: 'Adobe Inc.', CRM: 'Salesforce Inc.', TXN: 'Texas Instruments',
    NEE: 'NextEra Energy', QCOM: 'Qualcomm Inc.', PM: 'Philip Morris', BMY: 'Bristol-Myers',
  };

  for (let i = 0; i < Math.min(count, symbols.length); i++) {
    const symbol = symbols[i];
    const basePrice = Math.random() * 400 + 50;
    const change = (Math.random() - 0.5) * 20;
    
    stocks.push({
      symbol,
      companyName: names[symbol] || `${symbol} Inc.`,
      sector: SECTORS[Math.floor(Math.random() * SECTORS.length)],
      industry: ['Software', 'Hardware', 'Banking', 'Retail', 'Pharma'][Math.floor(Math.random() * 5)],
      price: basePrice,
      change,
      changePercent: (change / basePrice) * 100,
      marketCap: Math.random() * 2500 + 10,
      peRatio: Math.random() * 50 + 5,
      pbRatio: Math.random() * 10 + 0.5,
      dividendYield: Math.random() * 5,
      roe: Math.random() * 40 + 5,
      roa: Math.random() * 20 + 2,
      revenueGrowth: (Math.random() - 0.2) * 50,
      epsGrowth: (Math.random() - 0.2) * 60,
      debtToEquity: Math.random() * 2.5,
      currentRatio: Math.random() * 3 + 0.5,
      rsi: Math.random() * 50 + 25,
      macdSignal: ['bullish', 'bearish', 'neutral'][Math.floor(Math.random() * 3)] as 'bullish' | 'bearish' | 'neutral',
      piotroskiScore: Math.floor(Math.random() * 9) + 1,
      altmanZ: Math.random() * 5 + 0.5,
    });
  }
  
  return stocks;
}

interface ScreenerProps {
  initialFilters?: Partial<ScreenerFilters>;
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

  // Generate and filter mock data
  const allStocks = useMemo(() => generateMockStocks(40), []);

  const filteredStocks = useMemo(() => {
    return allStocks.filter(stock => {
      // Market cap filter
      if (filters.marketCap.preset && filters.marketCap.preset !== 'any') {
        const preset = MARKET_CAP_PRESETS[filters.marketCap.preset];
        if (preset.min !== null && stock.marketCap < preset.min) return false;
        if (preset.max !== null && stock.marketCap > preset.max) return false;
      } else {
        if (filters.marketCap.min !== null && stock.marketCap < filters.marketCap.min) return false;
        if (filters.marketCap.max !== null && stock.marketCap > filters.marketCap.max) return false;
      }

      // Sector filter
      if (filters.sector.length > 0 && !filters.sector.includes(stock.sector)) return false;

      // P/E Ratio filter
      if (filters.peRatio.min !== null && (stock.peRatio === null || stock.peRatio < filters.peRatio.min)) return false;
      if (filters.peRatio.max !== null && (stock.peRatio === null || stock.peRatio > filters.peRatio.max)) return false;

      // P/B Ratio filter
      if (filters.pbRatio.min !== null && (stock.pbRatio === null || stock.pbRatio < filters.pbRatio.min)) return false;
      if (filters.pbRatio.max !== null && (stock.pbRatio === null || stock.pbRatio > filters.pbRatio.max)) return false;

      // Dividend Yield filter
      if (filters.dividendYield.min !== null && (stock.dividendYield === null || stock.dividendYield < filters.dividendYield.min)) return false;
      if (filters.dividendYield.max !== null && (stock.dividendYield === null || stock.dividendYield > filters.dividendYield.max)) return false;

      // ROE filter
      if (filters.roe.min !== null && (stock.roe === null || stock.roe < filters.roe.min)) return false;
      if (filters.roe.max !== null && (stock.roe === null || stock.roe > filters.roe.max)) return false;

      // ROA filter
      if (filters.roa.min !== null && (stock.roa === null || stock.roa < filters.roa.min)) return false;
      if (filters.roa.max !== null && (stock.roa === null || stock.roa > filters.roa.max)) return false;

      // Revenue Growth filter
      if (filters.revenueGrowth.min !== null && (stock.revenueGrowth === null || stock.revenueGrowth < filters.revenueGrowth.min)) return false;
      if (filters.revenueGrowth.max !== null && (stock.revenueGrowth === null || stock.revenueGrowth > filters.revenueGrowth.max)) return false;

      // EPS Growth filter
      if (filters.epsGrowth.min !== null && (stock.epsGrowth === null || stock.epsGrowth < filters.epsGrowth.min)) return false;
      if (filters.epsGrowth.max !== null && (stock.epsGrowth === null || stock.epsGrowth > filters.epsGrowth.max)) return false;

      // Debt to Equity filter
      if (filters.debtToEquity.min !== null && (stock.debtToEquity === null || stock.debtToEquity < filters.debtToEquity.min)) return false;
      if (filters.debtToEquity.max !== null && (stock.debtToEquity === null || stock.debtToEquity > filters.debtToEquity.max)) return false;

      // Current Ratio filter
      if (filters.currentRatio.min !== null && (stock.currentRatio === null || stock.currentRatio < filters.currentRatio.min)) return false;
      if (filters.currentRatio.max !== null && (stock.currentRatio === null || stock.currentRatio > filters.currentRatio.max)) return false;

      // RSI filter
      if (filters.rsi.min !== null && (stock.rsi === null || stock.rsi < filters.rsi.min)) return false;
      if (filters.rsi.max !== null && (stock.rsi === null || stock.rsi > filters.rsi.max)) return false;

      // MACD Signal filter
      if (filters.macdSignal && filters.macdSignal !== 'any' && stock.macdSignal !== filters.macdSignal) return false;

      // Piotroski Score filter
      if (filters.piotroskiScore.min !== null && stock.piotroskiScore < filters.piotroskiScore.min) return false;
      if (filters.piotroskiScore.max !== null && stock.piotroskiScore > filters.piotroskiScore.max) return false;

      // Altman Z filter
      if (filters.altmanZ.min !== null && stock.altmanZ < filters.altmanZ.min) return false;
      if (filters.altmanZ.max !== null && stock.altmanZ > filters.altmanZ.max) return false;

      return true;
    });
  }, [allStocks, filters]);

  const sortedStocks = useMemo(() => {
    return [...filteredStocks].sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      
      if (aVal === null) return 1;
      if (bVal === null) return -1;
      
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Stock Screener</h1>
          <p className="text-gray-400 text-sm mt-1">
            Find stocks matching your criteria • {filteredStocks.length} results
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSavingScreen(true)}
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            <Save className="h-4 w-4 mr-2" />
            Save Screen
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-2 px-1.5 py-0.5 text-xs bg-[#00D4FF]/20 text-[#00D4FF] rounded">
                {activeFilterCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Save Screen Modal */}
      {savingScreen && (
        <Card className="border-white/[0.05] bg-[#0A0D12]/60 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <input
                type="text"
                value={screenName}
                onChange={(e) => setScreenName(e.target.value)}
                placeholder="Enter screen name..."
                className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
              />
              <Button
                onClick={saveScreen}
                className="bg-gradient-to-r from-[#00D4FF] to-[#3B82F6] text-[#05070B]"
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setSavingScreen(false)}
                className="border-white/10 text-gray-400"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Preset Screens */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {PRESET_SCREENS.map(preset => (
          <button
            key={preset.id}
            onClick={() => applyPreset(preset)}
            className="group p-4 rounded-xl border border-white/[0.05] bg-[#0A0D12]/40 hover:border-white/20 transition-all text-left"
          >
            <div className="flex items-center gap-3 mb-2">
              <div
                className="p-2 rounded-lg"
                style={{ backgroundColor: `${preset.color}20`, color: preset.color }}
              >
                {preset.icon}
              </div>
              <span className="font-medium text-white">{preset.name}</span>
            </div>
            <p className="text-sm text-gray-500">{preset.description}</p>
          </button>
        ))}
      </div>

      {/* Saved Screens */}
      {savedScreens.length > 0 && (
        <Card className="border-white/[0.05] bg-[#0A0D12]/60 backdrop-blur-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
              <Bookmark className="h-4 w-4" />
              Saved Screens
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {savedScreens.map((saved, i) => (
                <button
                  key={i}
                  onClick={() => loadSavedScreen(saved)}
                  className="px-3 py-1.5 rounded-lg bg-white/5 text-white text-sm hover:bg-white/10 transition-colors"
                >
                  {saved.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters Panel */}
      {showFilters && (
        <ScreenerFiltersPanel
          filters={filters}
          onChange={setFilters}
          onReset={resetFilters}
        />
      )}

      {/* Results Table */}
      <Card className="border-white/[0.05] bg-[#0A0D12]/60 backdrop-blur-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <SortableHeader field="symbol" label="Symbol" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                <SortableHeader field="price" label="Price" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                <SortableHeader field="changePercent" label="Change" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                <SortableHeader field="marketCap" label="Market Cap" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                <SortableHeader field="peRatio" label="P/E" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                <SortableHeader field="dividendYield" label="Div Yield" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                <SortableHeader field="roe" label="ROE" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                <SortableHeader field="revenueGrowth" label="Rev Growth" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                <SortableHeader field="rsi" label="RSI" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
                <SortableHeader field="piotroskiScore" label="F-Score" sortField={sortField} sortDirection={sortDirection} onSort={handleSort} />
              </tr>
            </thead>
            <tbody>
              {sortedStocks.map(stock => (
                <tr
                  key={stock.symbol}
                  onClick={() => router.push(`/dashboard/stock-analysis/${stock.symbol}`)}
                  className="border-b border-white/5 hover:bg-white/[0.02] cursor-pointer transition-colors"
                >
                  <td className="p-4">
                    <div>
                      <div className="font-medium text-white">{stock.symbol}</div>
                      <div className="text-sm text-gray-500 truncate max-w-[150px]">{stock.companyName}</div>
                    </div>
                  </td>
                  <td className="p-4 text-white">${stock.price.toFixed(2)}</td>
                  <td className="p-4">
                    <span className={cn(
                      "flex items-center gap-1",
                      stock.change >= 0 ? "text-green-400" : "text-red-400"
                    )}>
                      {stock.change >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </td>
                  <td className="p-4 text-white">
                    {stock.marketCap >= 1000 ? `$${(stock.marketCap / 1000).toFixed(1)}T` : `$${stock.marketCap.toFixed(1)}B`}
                  </td>
                  <td className="p-4 text-white">{stock.peRatio?.toFixed(1) || 'N/A'}</td>
                  <td className="p-4 text-white">{stock.dividendYield?.toFixed(2)}%</td>
                  <td className="p-4 text-white">{stock.roe?.toFixed(1)}%</td>
                  <td className="p-4">
                    <span className={cn(
                      stock.revenueGrowth && stock.revenueGrowth >= 0 ? "text-green-400" : "text-red-400"
                    )}>
                      {stock.revenueGrowth?.toFixed(1)}%
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs",
                      stock.rsi && stock.rsi > 70 ? "bg-red-500/20 text-red-400" :
                      stock.rsi && stock.rsi < 30 ? "bg-green-500/20 text-green-400" :
                      "text-white"
                    )}>
                      {stock.rsi?.toFixed(0)}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      stock.piotroskiScore >= 7 ? "bg-green-500/20 text-green-400" :
                      stock.piotroskiScore <= 3 ? "bg-red-500/20 text-red-400" :
                      "bg-yellow-500/20 text-yellow-400"
                    )}>
                      {stock.piotroskiScore}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {sortedStocks.length === 0 && (
          <div className="p-12 text-center">
            <Search className="h-12 w-12 text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No stocks match your criteria</h3>
            <p className="text-gray-400 mb-4">Try adjusting your filters or use a preset screen</p>
            <Button
              variant="outline"
              onClick={resetFilters}
              className="border-white/10 text-white"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
}

// Sortable Header Component
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
      className="p-4 text-left cursor-pointer hover:bg-white/5 transition-colors"
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1 text-gray-400 font-medium">
        {label}
        <div className="flex flex-col">
          {isActive ? (
            sortDirection === 'asc' ? (
              <ChevronUp className="h-4 w-4 text-[#00D4FF]" />
            ) : (
              <ChevronDown className="h-4 w-4 text-[#00D4FF]" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 text-gray-600" />
          )}
        </div>
      </div>
    </th>
  );
}

// Filters Panel Component
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
    <Card className="border-white/[0.05] bg-[#0A0D12]/60 backdrop-blur-sm">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-lg text-white">Filters</CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="text-gray-400 hover:text-white"
        >
          Reset All
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Market Cap */}
          <FilterSection title="Market Cap">
            <select
              value={filters.marketCap.preset || 'any'}
              onChange={(e) => updateFilter('marketCap', {
                ...filters.marketCap,
                preset: e.target.value as ScreenerFilters['marketCap']['preset'],
              })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00D4FF]/50"
            >
              <option value="any">Any</option>
              {Object.entries(MARKET_CAP_PRESETS).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </FilterSection>

          {/* Sector */}
          <FilterSection title="Sector">
            <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
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
                    "px-2 py-1 rounded text-xs transition-colors",
                    filters.sector.includes(sector)
                      ? "bg-[#00D4FF]/20 text-[#00D4FF]"
                      : "bg-white/5 text-gray-400 hover:bg-white/10"
                  )}
                >
                  {sector}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* P/E Ratio */}
          <FilterSection title="P/E Ratio">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.peRatio.min ?? ''}
                onChange={(e) => updateFilter('peRatio', {
                  ...filters.peRatio,
                  min: e.target.value ? parseFloat(e.target.value) : null,
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.peRatio.max ?? ''}
                onChange={(e) => updateFilter('peRatio', {
                  ...filters.peRatio,
                  max: e.target.value ? parseFloat(e.target.value) : null,
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
              />
            </div>
          </FilterSection>

          {/* Dividend Yield */}
          <FilterSection title="Dividend Yield (%)">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.dividendYield.min ?? ''}
                onChange={(e) => updateFilter('dividendYield', {
                  ...filters.dividendYield,
                  min: e.target.value ? parseFloat(e.target.value) : null,
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.dividendYield.max ?? ''}
                onChange={(e) => updateFilter('dividendYield', {
                  ...filters.dividendYield,
                  max: e.target.value ? parseFloat(e.target.value) : null,
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
              />
            </div>
          </FilterSection>

          {/* ROE */}
          <FilterSection title="ROE (%)">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.roe.min ?? ''}
                onChange={(e) => updateFilter('roe', {
                  ...filters.roe,
                  min: e.target.value ? parseFloat(e.target.value) : null,
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.roe.max ?? ''}
                onChange={(e) => updateFilter('roe', {
                  ...filters.roe,
                  max: e.target.value ? parseFloat(e.target.value) : null,
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
              />
            </div>
          </FilterSection>

          {/* ROA */}
          <FilterSection title="ROA (%)">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.roa.min ?? ''}
                onChange={(e) => updateFilter('roa', {
                  ...filters.roa,
                  min: e.target.value ? parseFloat(e.target.value) : null,
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.roa.max ?? ''}
                onChange={(e) => updateFilter('roa', {
                  ...filters.roa,
                  max: e.target.value ? parseFloat(e.target.value) : null,
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
              />
            </div>
          </FilterSection>

          {/* Revenue Growth */}
          <FilterSection title="Revenue Growth (%)">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.revenueGrowth.min ?? ''}
                onChange={(e) => updateFilter('revenueGrowth', {
                  ...filters.revenueGrowth,
                  min: e.target.value ? parseFloat(e.target.value) : null,
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.revenueGrowth.max ?? ''}
                onChange={(e) => updateFilter('revenueGrowth', {
                  ...filters.revenueGrowth,
                  max: e.target.value ? parseFloat(e.target.value) : null,
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
              />
            </div>
          </FilterSection>

          {/* EPS Growth */}
          <FilterSection title="EPS Growth (%)">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.epsGrowth.min ?? ''}
                onChange={(e) => updateFilter('epsGrowth', {
                  ...filters.epsGrowth,
                  min: e.target.value ? parseFloat(e.target.value) : null,
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.epsGrowth.max ?? ''}
                onChange={(e) => updateFilter('epsGrowth', {
                  ...filters.epsGrowth,
                  max: e.target.value ? parseFloat(e.target.value) : null,
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
              />
            </div>
          </FilterSection>

          {/* Debt to Equity */}
          <FilterSection title="Debt/Equity">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                step="0.1"
                value={filters.debtToEquity.min ?? ''}
                onChange={(e) => updateFilter('debtToEquity', {
                  ...filters.debtToEquity,
                  min: e.target.value ? parseFloat(e.target.value) : null,
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
              />
              <input
                type="number"
                placeholder="Max"
                step="0.1"
                value={filters.debtToEquity.max ?? ''}
                onChange={(e) => updateFilter('debtToEquity', {
                  ...filters.debtToEquity,
                  max: e.target.value ? parseFloat(e.target.value) : null,
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
              />
            </div>
          </FilterSection>

          {/* Current Ratio */}
          <FilterSection title="Current Ratio">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                step="0.1"
                value={filters.currentRatio.min ?? ''}
                onChange={(e) => updateFilter('currentRatio', {
                  ...filters.currentRatio,
                  min: e.target.value ? parseFloat(e.target.value) : null,
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
              />
              <input
                type="number"
                placeholder="Max"
                step="0.1"
                value={filters.currentRatio.max ?? ''}
                onChange={(e) => updateFilter('currentRatio', {
                  ...filters.currentRatio,
                  max: e.target.value ? parseFloat(e.target.value) : null,
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
              />
            </div>
          </FilterSection>

          {/* RSI */}
          <FilterSection title="RSI">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                min="0"
                max="100"
                value={filters.rsi.min ?? ''}
                onChange={(e) => updateFilter('rsi', {
                  ...filters.rsi,
                  min: e.target.value ? parseFloat(e.target.value) : null,
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
              />
              <input
                type="number"
                placeholder="Max"
                min="0"
                max="100"
                value={filters.rsi.max ?? ''}
                onChange={(e) => updateFilter('rsi', {
                  ...filters.rsi,
                  max: e.target.value ? parseFloat(e.target.value) : null,
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
              />
            </div>
          </FilterSection>

          {/* MACD Signal */}
          <FilterSection title="MACD Signal">
            <select
              value={filters.macdSignal || 'any'}
              onChange={(e) => updateFilter('macdSignal', e.target.value as ScreenerFilters['macdSignal'])}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00D4FF]/50"
            >
              <option value="any">Any</option>
              <option value="bullish">Bullish</option>
              <option value="bearish">Bearish</option>
            </select>
          </FilterSection>

          {/* Piotroski F-Score */}
          <FilterSection title="Piotroski F-Score">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                min="0"
                max="9"
                value={filters.piotroskiScore.min ?? ''}
                onChange={(e) => updateFilter('piotroskiScore', {
                  ...filters.piotroskiScore,
                  min: e.target.value ? parseFloat(e.target.value) : null,
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
              />
              <input
                type="number"
                placeholder="Max"
                min="0"
                max="9"
                value={filters.piotroskiScore.max ?? ''}
                onChange={(e) => updateFilter('piotroskiScore', {
                  ...filters.piotroskiScore,
                  max: e.target.value ? parseFloat(e.target.value) : null,
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
              />
            </div>
          </FilterSection>

          {/* Altman Z-Score */}
          <FilterSection title="Altman Z-Score">
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                step="0.1"
                value={filters.altmanZ.min ?? ''}
                onChange={(e) => updateFilter('altmanZ', {
                  ...filters.altmanZ,
                  min: e.target.value ? parseFloat(e.target.value) : null,
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
              />
              <input
                type="number"
                placeholder="Max"
                step="0.1"
                value={filters.altmanZ.max ?? ''}
                onChange={(e) => updateFilter('altmanZ', {
                  ...filters.altmanZ,
                  max: e.target.value ? parseFloat(e.target.value) : null,
                })}
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
              />
            </div>
          </FilterSection>
        </div>
      </CardContent>
    </Card>
  );
}

// Filter Section Component
function FilterSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-400 mb-2">
        {title}
      </label>
      {children}
    </div>
  );
}

export default Screener;
