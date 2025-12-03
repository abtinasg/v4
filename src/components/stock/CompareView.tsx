'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  X,
  Plus,
  Search,
  Download,
  BarChart3,
  Radar,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronDown,
  Check,
  Loader2,
  Table,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Types
interface StockData {
  symbol: string;
  companyName: string;
  price: number;
  change: number;
  changePercent: number;
  marketCap: number;
  sector: string;
  metrics: {
    peRatio: number | null;
    pbRatio: number | null;
    psRatio: number | null;
    evToEbitda: number | null;
    dividendYield: number | null;
    roe: number | null;
    roa: number | null;
    roic: number | null;
    grossMargin: number | null;
    operatingMargin: number | null;
    netMargin: number | null;
    debtToEquity: number | null;
    currentRatio: number | null;
    quickRatio: number | null;
    revenueGrowth: number | null;
    epsGrowth: number | null;
    fcfGrowth: number | null;
    rsi: number | null;
    beta: number | null;
    piotroskiScore: number | null;
    altmanZ: number | null;
  };
}

// Search result type from API
interface SearchResult {
  symbol: string;
  name: string;
  type?: string;
  exchange?: string;
}

interface MetricConfig {
  key: keyof StockData['metrics'];
  label: string;
  category: 'valuation' | 'profitability' | 'growth' | 'leverage' | 'liquidity' | 'technical' | 'quality';
  format: 'number' | 'percent' | 'ratio' | 'score';
  higherIsBetter: boolean;
  description: string;
}

const METRIC_CONFIGS: MetricConfig[] = [
  // Valuation
  { key: 'peRatio', label: 'P/E Ratio', category: 'valuation', format: 'ratio', higherIsBetter: false, description: 'Price to Earnings ratio' },
  { key: 'pbRatio', label: 'P/B Ratio', category: 'valuation', format: 'ratio', higherIsBetter: false, description: 'Price to Book ratio' },
  { key: 'psRatio', label: 'P/S Ratio', category: 'valuation', format: 'ratio', higherIsBetter: false, description: 'Price to Sales ratio' },
  { key: 'evToEbitda', label: 'EV/EBITDA', category: 'valuation', format: 'ratio', higherIsBetter: false, description: 'Enterprise Value to EBITDA' },
  { key: 'dividendYield', label: 'Dividend Yield', category: 'valuation', format: 'percent', higherIsBetter: true, description: 'Annual dividend yield' },
  
  // Profitability
  { key: 'roe', label: 'ROE', category: 'profitability', format: 'percent', higherIsBetter: true, description: 'Return on Equity' },
  { key: 'roa', label: 'ROA', category: 'profitability', format: 'percent', higherIsBetter: true, description: 'Return on Assets' },
  { key: 'roic', label: 'ROIC', category: 'profitability', format: 'percent', higherIsBetter: true, description: 'Return on Invested Capital' },
  { key: 'grossMargin', label: 'Gross Margin', category: 'profitability', format: 'percent', higherIsBetter: true, description: 'Gross profit margin' },
  { key: 'operatingMargin', label: 'Operating Margin', category: 'profitability', format: 'percent', higherIsBetter: true, description: 'Operating profit margin' },
  { key: 'netMargin', label: 'Net Margin', category: 'profitability', format: 'percent', higherIsBetter: true, description: 'Net profit margin' },
  
  // Growth
  { key: 'revenueGrowth', label: 'Revenue Growth', category: 'growth', format: 'percent', higherIsBetter: true, description: 'YoY revenue growth' },
  { key: 'epsGrowth', label: 'EPS Growth', category: 'growth', format: 'percent', higherIsBetter: true, description: 'YoY EPS growth' },
  { key: 'fcfGrowth', label: 'FCF Growth', category: 'growth', format: 'percent', higherIsBetter: true, description: 'YoY free cash flow growth' },
  
  // Leverage
  { key: 'debtToEquity', label: 'Debt/Equity', category: 'leverage', format: 'ratio', higherIsBetter: false, description: 'Debt to Equity ratio' },
  
  // Liquidity
  { key: 'currentRatio', label: 'Current Ratio', category: 'liquidity', format: 'ratio', higherIsBetter: true, description: 'Current assets / current liabilities' },
  { key: 'quickRatio', label: 'Quick Ratio', category: 'liquidity', format: 'ratio', higherIsBetter: true, description: 'Quick assets / current liabilities' },
  
  // Technical
  { key: 'rsi', label: 'RSI', category: 'technical', format: 'number', higherIsBetter: true, description: 'Relative Strength Index' },
  { key: 'beta', label: 'Beta', category: 'technical', format: 'ratio', higherIsBetter: false, description: 'Market volatility measure' },
  
  // Quality
  { key: 'piotroskiScore', label: 'Piotroski F-Score', category: 'quality', format: 'score', higherIsBetter: true, description: 'Financial strength (0-9)' },
  { key: 'altmanZ', label: 'Altman Z-Score', category: 'quality', format: 'ratio', higherIsBetter: true, description: 'Bankruptcy risk indicator' },
];

const CATEGORIES = [
  { key: 'valuation', label: 'Valuation', color: 'rgba(255, 255, 255, 0.7)' },
  { key: 'profitability', label: 'Profitability', color: 'rgba(34, 197, 94, 0.8)' },
  { key: 'growth', label: 'Growth', color: 'rgba(59, 130, 246, 0.8)' },
  { key: 'leverage', label: 'Leverage', color: 'rgba(245, 158, 11, 0.8)' },
  { key: 'liquidity', label: 'Liquidity', color: 'rgba(139, 92, 246, 0.8)' },
  { key: 'technical', label: 'Technical', color: 'rgba(236, 72, 153, 0.8)' },
  { key: 'quality', label: 'Quality', color: 'rgba(45, 212, 191, 0.8)' },
] as const;

const STOCK_COLORS = ['rgba(255, 255, 255, 0.9)', 'rgba(34, 197, 94, 0.9)', 'rgba(59, 130, 246, 0.9)', 'rgba(236, 72, 153, 0.9)', 'rgba(139, 92, 246, 0.9)'];

// Default stocks for quick access
const DEFAULT_STOCKS = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corporation' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corporation' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
];

// Fetch stock metrics from API
async function fetchStockData(symbol: string): Promise<StockData | null> {
  try {
    const response = await fetch(`/api/stock/${symbol}/metrics`);
    if (!response.ok) {
      throw new Error(`Failed to fetch ${symbol}`);
    }
    const data = await response.json();
    
    // Map API response to StockData interface
    return {
      symbol: data.symbol,
      companyName: data.companyName || `${symbol} Inc.`,
      price: data.currentPrice || 0,
      change: 0, // Will be calculated from price history if available
      changePercent: 0,
      marketCap: data.marketCap ? data.marketCap / 1e9 : 0, // Convert to billions
      sector: data.sector || 'Unknown',
      metrics: {
        // Valuation
        peRatio: data.metrics?.valuation?.peRatio ?? null,
        pbRatio: data.metrics?.valuation?.pbRatio ?? null,
        psRatio: data.metrics?.valuation?.psRatio ?? null,
        evToEbitda: data.metrics?.valuation?.evToEBITDA ?? null,
        dividendYield: data.metrics?.valuation?.dividendYield != null 
          ? data.metrics.valuation.dividendYield * 100 
          : null,
        // Profitability
        roe: data.metrics?.profitability?.roe != null 
          ? data.metrics.profitability.roe * 100 
          : null,
        roa: data.metrics?.profitability?.roa != null 
          ? data.metrics.profitability.roa * 100 
          : null,
        roic: data.metrics?.profitability?.roic != null 
          ? data.metrics.profitability.roic * 100 
          : null,
        grossMargin: data.metrics?.profitability?.grossProfitMargin != null 
          ? data.metrics.profitability.grossProfitMargin * 100 
          : null,
        operatingMargin: data.metrics?.profitability?.operatingProfitMargin != null 
          ? data.metrics.profitability.operatingProfitMargin * 100 
          : null,
        netMargin: data.metrics?.profitability?.netProfitMargin != null 
          ? data.metrics.profitability.netProfitMargin * 100 
          : null,
        // Leverage
        debtToEquity: data.metrics?.leverage?.debtToEquity ?? null,
        // Liquidity
        currentRatio: data.metrics?.liquidity?.currentRatio ?? null,
        quickRatio: data.metrics?.liquidity?.quickRatio ?? null,
        // Growth
        revenueGrowth: data.metrics?.growth?.revenueGrowthYoY != null 
          ? data.metrics.growth.revenueGrowthYoY * 100 
          : null,
        epsGrowth: data.metrics?.growth?.epsGrowthYoY != null 
          ? data.metrics.growth.epsGrowthYoY * 100 
          : null,
        fcfGrowth: data.metrics?.growth?.fcfGrowth != null 
          ? data.metrics.growth.fcfGrowth * 100 
          : null,
        // Technical
        rsi: data.metrics?.technical?.rsi ?? null,
        beta: data.metrics?.risk?.beta ?? data.metrics?.dcf?.beta ?? null,
        // Quality Scores (from 'other' metrics)
        piotroskiScore: data.metrics?.other?.piotroskiFScore ?? null,
        altmanZ: data.metrics?.other?.altmanZScore ?? null,
      },
    };
  } catch (error) {
    console.error(`Error fetching stock data for ${symbol}:`, error);
    return null;
  }
}

// Search stocks API
async function searchStocksAPI(query: string): Promise<SearchResult[]> {
  try {
    const response = await fetch(`/api/stocks/search?q=${encodeURIComponent(query)}&limit=50`);
    if (!response.ok) {
      throw new Error('Search failed');
    }
    const data = await response.json();
    if (data.success && data.data) {
      return data.data.map((item: { symbol: string; shortName?: string; longName?: string; type?: string; exchange?: string }) => ({
        symbol: item.symbol,
        name: item.longName || item.shortName || item.symbol,
        type: item.type,
        exchange: item.exchange,
      }));
    }
    return [];
  } catch (error) {
    console.error('Search error:', error);
    return [];
  }
}

function formatValue(value: number | null, format: MetricConfig['format']): string {
  if (value === null) return 'N/A';
  
  switch (format) {
    case 'percent':
      return `${value.toFixed(2)}%`;
    case 'ratio':
      return value.toFixed(2);
    case 'score':
      return value.toFixed(0);
    default:
      return value.toFixed(2);
  }
}

function formatMarketCap(value: number): string {
  if (value >= 1000) return `$${(value / 1000).toFixed(1)}T`;
  return `$${value.toFixed(1)}B`;
}

interface CompareViewProps {
  initialSymbols?: string[];
}

export function CompareView({ initialSymbols = [] }: CompareViewProps) {
  const [stocks, setStocks] = useState<StockData[]>([]);
  const [loadingSymbols, setLoadingSymbols] = useState<Set<string>>(new Set());
  const [selectedMetrics, setSelectedMetrics] = useState<Set<keyof StockData['metrics']>>(
    new Set(['peRatio', 'roe', 'revenueGrowth', 'debtToEquity', 'currentRatio', 'piotroskiScore'])
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'bar' | 'radar'>('table');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Load initial symbols
  useEffect(() => {
    if (initialSymbols.length > 0) {
      initialSymbols.forEach(symbol => {
        addStock(symbol);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounced search
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 1) {
      setSearchResults(DEFAULT_STOCKS);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results = await searchStocksAPI(searchQuery);
      setSearchResults(results.length > 0 ? results : DEFAULT_STOCKS.filter(s => 
        s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      ));
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filteredSearchResults = useMemo(() => {
    return searchResults.filter(s => !stocks.find(stock => stock.symbol === s.symbol));
  }, [searchResults, stocks]);

  const addStock = useCallback(async (symbol: string) => {
    if (stocks.length >= 5) return;
    if (stocks.find(s => s.symbol === symbol)) return;
    if (loadingSymbols.has(symbol)) return;

    setLoadingSymbols(prev => new Set(prev).add(symbol));
    setSearchQuery('');
    setIsSearchOpen(false);

    const stockData = await fetchStockData(symbol);
    
    setLoadingSymbols(prev => {
      const next = new Set(prev);
      next.delete(symbol);
      return next;
    });

    if (stockData) {
      setStocks(prev => [...prev, stockData]);
    }
  }, [stocks, loadingSymbols]);

  const removeStock = (symbol: string) => {
    setStocks(stocks.filter(s => s.symbol !== symbol));
  };

  const toggleMetric = (key: keyof StockData['metrics']) => {
    const newSelected = new Set(selectedMetrics);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedMetrics(newSelected);
  };

  const selectCategory = (category: string) => {
    const categoryMetrics = METRIC_CONFIGS.filter(m => m.category === category);
    const newSelected = new Set(selectedMetrics);
    
    const allSelected = categoryMetrics.every(m => newSelected.has(m.key));
    
    if (allSelected) {
      categoryMetrics.forEach(m => newSelected.delete(m.key));
    } else {
      categoryMetrics.forEach(m => newSelected.add(m.key));
    }
    
    setSelectedMetrics(newSelected);
  };

  const getBestWorstValues = (metricKey: keyof StockData['metrics']): { best: string | null; worst: string | null } => {
    const config = METRIC_CONFIGS.find(m => m.key === metricKey);
    if (!config) return { best: null, worst: null };
    
    const values = stocks
      .map(s => ({ symbol: s.symbol, value: s.metrics[metricKey] }))
      .filter(v => v.value !== null);
    
    if (values.length === 0) return { best: null, worst: null };
    
    const sorted = values.sort((a, b) => (a.value! - b.value!) * (config.higherIsBetter ? -1 : 1));
    return {
      best: sorted[0]?.symbol || null,
      worst: sorted[sorted.length - 1]?.symbol || null,
    };
  };

  const exportComparison = () => {
    const data = {
      generatedAt: new Date().toISOString(),
      stocks: stocks.map(s => ({
        symbol: s.symbol,
        companyName: s.companyName,
        price: s.price,
        marketCap: s.marketCap,
        metrics: Object.fromEntries(
          Array.from(selectedMetrics).map(key => [key, s.metrics[key]])
        ),
      })),
      selectedMetrics: Array.from(selectedMetrics),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock-comparison-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const selectedMetricConfigs = METRIC_CONFIGS.filter(m => selectedMetrics.has(m.key));

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl sm:text-4xl font-light text-white tracking-tight">Compare Stocks</h1>
          <p className="text-white/40 text-sm mt-2 font-light">Side-by-side analysis of up to 5 securities</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={exportComparison}
            disabled={stocks.length === 0}
            className="border-white/[0.08] bg-white/[0.02] text-white/70 hover:bg-white/[0.04] hover:text-white hover:border-white/[0.12] rounded-xl px-5 py-2.5 font-light transition-all duration-300"
          >
            <Download className="h-4 w-4 mr-2 opacity-60" />
            Export
          </Button>
        </div>
      </div>

      {/* Stock Selection - Primary Area */}
      <div className="p-6 rounded-2xl border border-white/[0.04] bg-white/[0.015] backdrop-blur-xl">
        <div className="flex flex-wrap gap-4 items-center">
          {stocks.map((stock, index) => (
            <div
              key={stock.symbol}
              className="group flex items-center gap-4 px-5 py-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300"
            >
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: STOCK_COLORS[index] }}
              />
              <div className="flex flex-col">
                <span className="font-medium text-white text-base">{stock.symbol}</span>
                <span className="text-xs text-white/40 font-light">{stock.companyName}</span>
              </div>
              <div className="flex flex-col items-end ml-4">
                <span className="text-sm text-white font-light">${stock.price.toFixed(2)}</span>
                <span className="text-xs text-white/30 font-light">{formatMarketCap(stock.marketCap)}</span>
              </div>
              <button
                onClick={() => removeStock(stock.symbol)}
                className="ml-2 p-1.5 rounded-lg hover:bg-white/[0.08] text-white/30 hover:text-white/70 transition-all duration-300"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          
          {stocks.length < 5 && (
            <div className="relative">
              <button
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="flex items-center gap-3 px-5 py-4 rounded-xl border border-dashed border-white/[0.1] text-white/40 hover:border-white/[0.2] hover:text-white/60 hover:bg-white/[0.02] transition-all duration-300"
              >
                <Plus className="h-4 w-4" />
                <span className="font-light">Add Stock</span>
              </button>
              
              {isSearchOpen && (
                <div className="absolute top-full left-0 mt-3 w-96 bg-[#0A0D12]/95 border border-white/[0.08] rounded-2xl shadow-2xl shadow-black/40 z-50 backdrop-blur-2xl overflow-hidden">
                  <div className="p-4 border-b border-white/[0.06]">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search by symbol or name..."
                        className="w-full pl-11 pr-4 py-3 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-white/[0.12] focus:bg-white/[0.06] transition-all duration-300 text-sm font-light"
                        autoFocus
                      />
                      {isSearching && (
                        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40 animate-spin" />
                      )}
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {filteredSearchResults.length === 0 ? (
                      <div className="px-6 py-8 text-center text-white/40 text-sm font-light">
                        No stocks found
                      </div>
                    ) : (
                      filteredSearchResults.map(stock => (
                        <button
                          key={stock.symbol}
                          onClick={() => addStock(stock.symbol)}
                          disabled={loadingSymbols.has(stock.symbol)}
                          className="w-full px-6 py-4 text-left hover:bg-white/[0.04] flex items-center justify-between transition-all duration-300 disabled:opacity-40 border-b border-white/[0.03] last:border-b-0"
                        >
                          <div className="flex flex-col gap-0.5">
                            <span className="font-medium text-white">{stock.symbol}</span>
                            <span className="text-xs text-white/40 font-light">{stock.name}</span>
                          </div>
                          {loadingSymbols.has(stock.symbol) ? (
                            <Loader2 className="h-4 w-4 text-white/40 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4 text-white/30" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Loading indicators for stocks being added */}
          {Array.from(loadingSymbols).map((symbol) => (
            <div
              key={symbol}
              className="flex items-center gap-3 px-5 py-4 rounded-xl border border-white/[0.06] bg-white/[0.02] opacity-50"
            >
              <Loader2 className="h-4 w-4 animate-spin text-white/40" />
              <span className="font-medium text-white">{symbol}</span>
              <span className="text-xs text-white/40 font-light">Loading...</span>
            </div>
          ))}
        </div>
      </div>

      {stocks.length > 0 && (
        <>
          {/* Metric Selection - Secondary Area */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-light text-white tracking-tight">Metrics</h2>
                <p className="text-white/30 text-sm mt-1 font-light">Select categories and individual metrics to compare</p>
              </div>
              <span className="text-sm font-light text-white/40 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                {selectedMetrics.size} selected
              </span>
            </div>
            
            {/* Category Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-4">
              {CATEGORIES.map(cat => {
                const categoryMetrics = METRIC_CONFIGS.filter(m => m.category === cat.key);
                const selectedCount = categoryMetrics.filter(m => selectedMetrics.has(m.key)).length;
                const allSelected = selectedCount === categoryMetrics.length;
                
                return (
                  <button
                    key={cat.key}
                    onClick={() => selectCategory(cat.key)}
                    className={cn(
                      "p-5 rounded-2xl text-left transition-all duration-300 border",
                      allSelected
                        ? "bg-white/[0.06] border-white/[0.12] shadow-lg shadow-white/5"
                        : "bg-white/[0.015] border-white/[0.04] hover:bg-white/[0.03] hover:border-white/[0.08]"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className={cn(
                        "text-sm font-light transition-colors",
                        allSelected ? "text-white" : "text-white/60"
                      )}>
                        {cat.label}
                      </span>
                      {allSelected && (
                        <Check className="h-3.5 w-3.5 text-white/60" />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "text-2xl font-light",
                        allSelected ? "text-white" : "text-white/40"
                      )}>
                        {selectedCount}
                      </span>
                      <span className="text-xs text-white/30 font-light">/ {categoryMetrics.length}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            
            {/* Individual Metrics Grid */}
            <div className="p-6 rounded-2xl border border-white/[0.04] bg-white/[0.015] backdrop-blur-xl">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {METRIC_CONFIGS.map(metric => {
                  const isSelected = selectedMetrics.has(metric.key);
                  const category = CATEGORIES.find(c => c.key === metric.category);
                  
                  return (
                    <button
                      key={metric.key}
                      onClick={() => toggleMetric(metric.key)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm transition-all duration-300 text-left group",
                        isSelected
                          ? "bg-white/[0.06] border border-white/[0.1]"
                          : "bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.08]"
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded-md border flex items-center justify-center transition-all duration-300",
                          isSelected 
                            ? "border-white/40 bg-white/10" 
                            : "border-white/20 group-hover:border-white/30"
                        )}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5 text-white/80" />}
                      </div>
                      <span className={cn(
                        "font-light transition-colors flex-1",
                        isSelected ? "text-white" : "text-white/50 group-hover:text-white/70"
                      )}>
                        {metric.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* View Mode - Tertiary Area */}
          <div className="flex items-center justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
              {[
                { value: 'table', label: 'Table', icon: Table },
                { value: 'bar', label: 'Bar Chart', icon: BarChart3 },
                { value: 'radar', label: 'Radar', icon: Radar },
              ].map((mode) => (
                <button
                  key={mode.value}
                  onClick={() => setViewMode(mode.value as typeof viewMode)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-light transition-all duration-300",
                    viewMode === mode.value
                      ? "bg-white/[0.08] text-white shadow-lg shadow-white/5"
                      : "text-white/40 hover:text-white/60 hover:bg-white/[0.03]"
                  )}
                >
                  <mode.icon className="h-4 w-4" />
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* Results Section */}
          <div className="space-y-6">
            {viewMode === 'table' && (
              <div className="rounded-2xl border border-white/[0.04] bg-white/[0.015] backdrop-blur-xl overflow-hidden shadow-2xl shadow-black/20">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/[0.06]">
                        <th className="text-left px-8 py-6 text-white/40 font-light text-sm sticky left-0 bg-[#0A0D12]/95 backdrop-blur-xl">
                          Metric
                        </th>
                        {stocks.map((stock, index) => (
                          <th key={stock.symbol} className="text-center px-6 py-6 min-w-[160px]">
                            <div className="flex items-center justify-center gap-3">
                              <div
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: STOCK_COLORS[index] }}
                              />
                              <span className="font-medium text-white text-base">{stock.symbol}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Basic Info */}
                      <tr className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-5 text-white/50 font-light sticky left-0 bg-[#0A0D12]/95 backdrop-blur-xl">Price</td>
                        {stocks.map(stock => (
                          <td key={stock.symbol} className="text-center px-6 py-5">
                            <div className="text-white font-light text-base">${stock.price.toFixed(2)}</div>
                            <div className={cn(
                              "text-xs flex items-center justify-center gap-1 mt-1 font-light",
                              stock.change >= 0 ? "text-emerald-400/80" : "text-red-400/80"
                            )}>
                              {stock.change >= 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {stock.changePercent.toFixed(2)}%
                            </div>
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-5 text-white/50 font-light sticky left-0 bg-[#0A0D12]/95 backdrop-blur-xl">Market Cap</td>
                        {stocks.map(stock => (
                          <td key={stock.symbol} className="text-center px-6 py-5 text-white font-light">
                            {formatMarketCap(stock.marketCap)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                        <td className="px-8 py-5 text-white/50 font-light sticky left-0 bg-[#0A0D12]/95 backdrop-blur-xl">Sector</td>
                        {stocks.map(stock => (
                          <td key={stock.symbol} className="text-center px-6 py-5 text-white/60 font-light">
                            {stock.sector}
                          </td>
                        ))}
                      </tr>
                      
                      {/* Selected Metrics */}
                      {selectedMetricConfigs.map(metric => {
                        const { best, worst } = getBestWorstValues(metric.key);
                        
                        return (
                          <tr key={metric.key} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                            <td className="px-8 py-5 sticky left-0 bg-[#0A0D12]/95 backdrop-blur-xl">
                              <div className="text-white/60 font-light">{metric.label}</div>
                              <div className="text-[11px] text-white/30 font-light mt-0.5">{metric.description}</div>
                            </td>
                            {stocks.map(stock => {
                              const value = stock.metrics[metric.key];
                              const isBest = stock.symbol === best;
                              const isWorst = stock.symbol === worst && stocks.length > 1;
                              
                              return (
                                <td key={stock.symbol} className="text-center px-6 py-5">
                                  <div className={cn(
                                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-light",
                                    isBest && "bg-emerald-500/10 text-emerald-400",
                                    isWorst && "bg-red-500/10 text-red-400",
                                    !isBest && !isWorst && "text-white"
                                  )}>
                                    <span className="font-mono text-sm">{formatValue(value, metric.format)}</span>
                                    {isBest && <TrendingUp className="h-3 w-3" />}
                                    {isWorst && <TrendingDown className="h-3 w-3" />}
                                  </div>
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {viewMode === 'bar' && (
              <div className="grid gap-6">
                {selectedMetricConfigs.map(metric => {
                  const maxValue = Math.max(
                    ...stocks.map(s => s.metrics[metric.key] || 0)
                  );
                  const { best, worst } = getBestWorstValues(metric.key);
                  
                  return (
                    <div key={metric.key} className="p-6 rounded-2xl border border-white/[0.04] bg-white/[0.015] backdrop-blur-xl">
                      <div className="mb-6">
                        <h3 className="text-base font-light text-white">
                          {metric.label}
                        </h3>
                        <span className="text-xs text-white/30 font-light">{metric.description}</span>
                      </div>
                      <div className="space-y-4">
                        {stocks.map((stock, index) => {
                          const value = stock.metrics[metric.key];
                          const percentage = value !== null ? (value / maxValue) * 100 : 0;
                          const isBest = stock.symbol === best;
                          const isWorst = stock.symbol === worst && stocks.length > 1;
                          
                          return (
                            <div key={stock.symbol} className="flex items-center gap-5">
                              <div className="w-20 flex items-center gap-2">
                                <div
                                  className="w-2 h-2 rounded-full"
                                  style={{ backgroundColor: STOCK_COLORS[index] }}
                                />
                                <span className="text-sm font-light text-white">{stock.symbol}</span>
                              </div>
                              <div className="flex-1 h-10 bg-white/[0.03] rounded-xl overflow-hidden relative">
                                <div
                                  className="h-full rounded-xl transition-all duration-700 ease-out"
                                  style={{
                                    width: `${Math.min(percentage, 100)}%`,
                                    backgroundColor: STOCK_COLORS[index],
                                    opacity: 0.6,
                                  }}
                                />
                              </div>
                              <div className={cn(
                                "w-28 text-right text-sm font-mono font-light",
                                isBest && "text-emerald-400",
                                isWorst && "text-red-400",
                                !isBest && !isWorst && "text-white"
                              )}>
                                {formatValue(value, metric.format)}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {viewMode === 'radar' && (
              <div className="p-8 rounded-2xl border border-white/[0.04] bg-white/[0.015] backdrop-blur-xl">
                <div className="flex flex-col items-center">
                  <RadarChart stocks={stocks} metrics={selectedMetricConfigs} />
                  {/* Legend */}
                  <div className="flex flex-wrap gap-6 mt-10 justify-center">
                    {stocks.map((stock, index) => (
                      <div key={stock.symbol} className="flex items-center gap-3">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: STOCK_COLORS[index] }}
                        />
                        <span className="text-sm font-light text-white">{stock.symbol}</span>
                        <span className="text-sm text-white/40 font-light">{stock.companyName}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {stocks.length === 0 && (
        <div className="p-16 rounded-2xl border border-white/[0.04] bg-white/[0.015] backdrop-blur-xl">
          <div className="text-center">
            <div className="w-16 h-16 rounded-2xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-6">
              <BarChart3 className="h-8 w-8 text-white/30" />
            </div>
            <h3 className="text-xl font-light text-white mb-3">No stocks selected</h3>
            <p className="text-white/40 font-light mb-8">Add up to 5 securities to begin comparing</p>
            <Button
              onClick={() => setIsSearchOpen(true)}
              className="bg-white/[0.08] hover:bg-white/[0.12] text-white border border-white/[0.1] hover:border-white/[0.15] rounded-xl px-6 py-3 font-light transition-all duration-300"
            >
              <Plus className="h-4 w-4 mr-2 opacity-60" />
              Add Stock
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple Radar Chart Component
function RadarChart({
  stocks,
  metrics,
}: {
  stocks: StockData[];
  metrics: MetricConfig[];
}) {
  const size = 450;
  const center = size / 2;
  const radius = (size / 2) - 80;
  const levels = 5;

  // Normalize values to 0-1 scale
  const normalizedData = useMemo(() => {
    return stocks.map(stock => {
      return metrics.map(metric => {
        const values = stocks.map(s => s.metrics[metric.key] || 0);
        const min = Math.min(...values);
        const max = Math.max(...values);
        const value = stock.metrics[metric.key] || 0;
        
        if (max === min) return 0.5;
        
        let normalized = (value - min) / (max - min);
        // Invert if lower is better
        if (!metric.higherIsBetter) {
          normalized = 1 - normalized;
        }
        return normalized;
      });
    });
  }, [stocks, metrics]);

  const angleStep = (2 * Math.PI) / metrics.length;

  const getPoint = (index: number, value: number) => {
    const angle = angleStep * index - Math.PI / 2;
    const r = radius * value;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  return (
    <svg width={size} height={size} className="overflow-visible">
      {/* Grid circles */}
      {Array.from({ length: levels }).map((_, i) => {
        const r = (radius / levels) * (i + 1);
        return (
          <circle
            key={i}
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.04)"
            strokeWidth={1}
          />
        );
      })}

      {/* Axis lines and labels */}
      {metrics.map((metric, i) => {
        const point = getPoint(i, 1);
        const labelPoint = getPoint(i, 1.25);
        return (
          <g key={metric.key}>
            <line
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={1}
            />
            <text
              x={labelPoint.x}
              y={labelPoint.y}
              fill="rgba(255,255,255,0.4)"
              fontSize={11}
              fontWeight={300}
              textAnchor="middle"
              dominantBaseline="middle"
            >
              {metric.label}
            </text>
          </g>
        );
      })}

      {/* Data polygons */}
      {normalizedData.map((data, stockIndex) => {
        const points = data
          .map((value, i) => {
            const p = getPoint(i, value);
            return `${p.x},${p.y}`;
          })
          .join(' ');

        return (
          <g key={stocks[stockIndex].symbol}>
            <polygon
              points={points}
              fill={`${STOCK_COLORS[stockIndex].replace('0.9', '0.1')}`}
              stroke={STOCK_COLORS[stockIndex]}
              strokeWidth={1.5}
            />
            {data.map((value, i) => {
              const p = getPoint(i, value);
              return (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={3}
                  fill={STOCK_COLORS[stockIndex]}
                />
              );
            })}
          </g>
        );
      })}
    </svg>
  );
}

export default CompareView;
