'use client';

import React, { useState, useMemo } from 'react';
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
  { key: 'valuation', label: 'Valuation', color: '#00D4FF' },
  { key: 'profitability', label: 'Profitability', color: '#22C55E' },
  { key: 'growth', label: 'Growth', color: '#3B82F6' },
  { key: 'leverage', label: 'Leverage', color: '#F59E0B' },
  { key: 'liquidity', label: 'Liquidity', color: '#8B5CF6' },
  { key: 'technical', label: 'Technical', color: '#EC4899' },
  { key: 'quality', label: 'Quality', color: '#2DD4BF' },
] as const;

const STOCK_COLORS = ['#00D4FF', '#22C55E', '#F59E0B', '#EC4899', '#8B5CF6'];

// Sample stocks for search
const SAMPLE_STOCKS = [
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

// Mock function to generate stock data
function generateMockStockData(symbol: string): StockData {
  const stock = SAMPLE_STOCKS.find(s => s.symbol === symbol);
  const basePrice = Math.random() * 400 + 100;
  const change = (Math.random() - 0.5) * 10;
  
  return {
    symbol,
    companyName: stock?.name || `${symbol} Inc.`,
    price: basePrice,
    change,
    changePercent: (change / basePrice) * 100,
    marketCap: Math.random() * 2000 + 100, // in billions
    sector: ['Technology', 'Healthcare', 'Financial', 'Consumer'][Math.floor(Math.random() * 4)],
    metrics: {
      peRatio: Math.random() * 40 + 10,
      pbRatio: Math.random() * 10 + 1,
      psRatio: Math.random() * 8 + 1,
      evToEbitda: Math.random() * 20 + 5,
      dividendYield: Math.random() * 4,
      roe: Math.random() * 30 + 5,
      roa: Math.random() * 15 + 2,
      roic: Math.random() * 25 + 5,
      grossMargin: Math.random() * 40 + 20,
      operatingMargin: Math.random() * 25 + 5,
      netMargin: Math.random() * 20 + 3,
      debtToEquity: Math.random() * 2,
      currentRatio: Math.random() * 2 + 0.5,
      quickRatio: Math.random() * 1.5 + 0.3,
      revenueGrowth: (Math.random() - 0.3) * 40,
      epsGrowth: (Math.random() - 0.3) * 50,
      fcfGrowth: (Math.random() - 0.3) * 45,
      rsi: Math.random() * 40 + 30,
      beta: Math.random() * 1.5 + 0.5,
      piotroskiScore: Math.floor(Math.random() * 9) + 1,
      altmanZ: Math.random() * 4 + 1,
    },
  };
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
  const [stocks, setStocks] = useState<StockData[]>(() =>
    initialSymbols.map(s => generateMockStockData(s))
  );
  const [selectedMetrics, setSelectedMetrics] = useState<Set<keyof StockData['metrics']>>(
    new Set(['peRatio', 'roe', 'revenueGrowth', 'debtToEquity', 'currentRatio', 'piotroskiScore'])
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'table' | 'bar' | 'radar'>('table');

  const filteredSearchResults = useMemo(() => {
    if (!searchQuery) return SAMPLE_STOCKS;
    const query = searchQuery.toLowerCase();
    return SAMPLE_STOCKS.filter(
      s => s.symbol.toLowerCase().includes(query) || s.name.toLowerCase().includes(query)
    ).filter(s => !stocks.find(stock => stock.symbol === s.symbol));
  }, [searchQuery, stocks]);

  const addStock = (symbol: string) => {
    if (stocks.length >= 5) return;
    if (stocks.find(s => s.symbol === symbol)) return;
    setStocks([...stocks, generateMockStockData(symbol)]);
    setSearchQuery('');
    setIsSearchOpen(false);
  };

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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Compare Stocks</h1>
          <p className="text-gray-400 text-sm mt-1">Compare up to 5 stocks side-by-side</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportComparison}
            disabled={stocks.length === 0}
            className="border-white/10 bg-white/5 text-white hover:bg-white/10"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stock Selection */}
      <Card className="border-white/[0.05] bg-[#0A0D12]/60 backdrop-blur-sm">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-3 items-center">
            {stocks.map((stock, index) => (
              <div
                key={stock.symbol}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border border-white/10 bg-white/5"
                style={{ borderColor: `${STOCK_COLORS[index]}40` }}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: STOCK_COLORS[index] }}
                />
                <span className="font-medium text-white">{stock.symbol}</span>
                <span className="text-sm text-gray-400">{stock.companyName}</span>
                <button
                  onClick={() => removeStock(stock.symbol)}
                  className="ml-1 p-0.5 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
            
            {stocks.length < 5 && (
              <div className="relative">
                <button
                  onClick={() => setIsSearchOpen(!isSearchOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed border-white/20 text-gray-400 hover:border-[#00D4FF]/50 hover:text-[#00D4FF] transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Stock</span>
                </button>
                
                {isSearchOpen && (
                  <div className="absolute top-full left-0 mt-2 w-80 bg-[#0A0D12] border border-white/10 rounded-lg shadow-xl z-50">
                    <div className="p-2 border-b border-white/10">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search stocks..."
                          className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-60 overflow-y-auto">
                      {filteredSearchResults.map(stock => (
                        <button
                          key={stock.symbol}
                          onClick={() => addStock(stock.symbol)}
                          className="w-full px-4 py-2 text-left hover:bg-white/5 flex items-center justify-between transition-colors"
                        >
                          <div>
                            <span className="font-medium text-white">{stock.symbol}</span>
                            <span className="text-sm text-gray-400 ml-2">{stock.name}</span>
                          </div>
                          <Plus className="h-4 w-4 text-gray-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {stocks.length > 0 && (
        <>
          {/* Metric Selection */}
          <Card className="border-white/[0.05] bg-[#0A0D12]/60 backdrop-blur-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-white flex items-center justify-between">
                <span>Select Metrics to Compare</span>
                <span className="text-sm font-normal text-gray-400">
                  {selectedMetrics.size} selected
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Category Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                {CATEGORIES.map(cat => {
                  const categoryMetrics = METRIC_CONFIGS.filter(m => m.category === cat.key);
                  const selectedCount = categoryMetrics.filter(m => selectedMetrics.has(m.key)).length;
                  const allSelected = selectedCount === categoryMetrics.length;
                  
                  return (
                    <button
                      key={cat.key}
                      onClick={() => selectCategory(cat.key)}
                      className={cn(
                        "px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
                        allSelected
                          ? "bg-white/10 text-white"
                          : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                      )}
                      style={allSelected ? { borderColor: cat.color, borderWidth: 1 } : {}}
                    >
                      {cat.label}
                      {selectedCount > 0 && (
                        <span className="ml-1.5 text-xs text-gray-500">({selectedCount})</span>
                      )}
                    </button>
                  );
                })}
              </div>
              
              {/* Individual Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {METRIC_CONFIGS.map(metric => {
                  const isSelected = selectedMetrics.has(metric.key);
                  const category = CATEGORIES.find(c => c.key === metric.category);
                  
                  return (
                    <button
                      key={metric.key}
                      onClick={() => toggleMetric(metric.key)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all text-left",
                        isSelected
                          ? "bg-white/10 text-white"
                          : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <div
                        className={cn(
                          "w-4 h-4 rounded border flex items-center justify-center",
                          isSelected ? "border-[#00D4FF] bg-[#00D4FF]/20" : "border-white/20"
                        )}
                      >
                        {isSelected && <Check className="h-3 w-3 text-[#00D4FF]" />}
                      </div>
                      <span>{metric.label}</span>
                      <div
                        className="w-2 h-2 rounded-full ml-auto"
                        style={{ backgroundColor: category?.color }}
                      />
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as typeof viewMode)}>
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-white/5 border border-white/10">
                <TabsTrigger value="table" className="data-[state=active]:bg-white/10">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Table
                </TabsTrigger>
                <TabsTrigger value="bar" className="data-[state=active]:bg-white/10">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Bar Chart
                </TabsTrigger>
                <TabsTrigger value="radar" className="data-[state=active]:bg-white/10">
                  <Radar className="h-4 w-4 mr-2" />
                  Radar
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Table View */}
            <TabsContent value="table">
              <Card className="border-white/[0.05] bg-[#0A0D12]/60 backdrop-blur-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-4 text-gray-400 font-medium sticky left-0 bg-[#0A0D12]">
                          Metric
                        </th>
                        {stocks.map((stock, index) => (
                          <th key={stock.symbol} className="text-center p-4 min-w-[150px]">
                            <div className="flex items-center justify-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: STOCK_COLORS[index] }}
                              />
                              <span className="font-semibold text-white">{stock.symbol}</span>
                            </div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {/* Basic Info */}
                      <tr className="border-b border-white/5">
                        <td className="p-4 text-gray-400 sticky left-0 bg-[#0A0D12]">Price</td>
                        {stocks.map(stock => (
                          <td key={stock.symbol} className="text-center p-4">
                            <div className="text-white font-medium">${stock.price.toFixed(2)}</div>
                            <div className={cn(
                              "text-sm flex items-center justify-center gap-1",
                              stock.change >= 0 ? "text-green-400" : "text-red-400"
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
                      <tr className="border-b border-white/5">
                        <td className="p-4 text-gray-400 sticky left-0 bg-[#0A0D12]">Market Cap</td>
                        {stocks.map(stock => (
                          <td key={stock.symbol} className="text-center p-4 text-white">
                            {formatMarketCap(stock.marketCap)}
                          </td>
                        ))}
                      </tr>
                      <tr className="border-b border-white/5">
                        <td className="p-4 text-gray-400 sticky left-0 bg-[#0A0D12]">Sector</td>
                        {stocks.map(stock => (
                          <td key={stock.symbol} className="text-center p-4 text-gray-300">
                            {stock.sector}
                          </td>
                        ))}
                      </tr>
                      
                      {/* Selected Metrics */}
                      {selectedMetricConfigs.map(metric => {
                        const { best, worst } = getBestWorstValues(metric.key);
                        
                        return (
                          <tr key={metric.key} className="border-b border-white/5">
                            <td className="p-4 sticky left-0 bg-[#0A0D12]">
                              <div className="text-gray-400">{metric.label}</div>
                              <div className="text-xs text-gray-600">{metric.description}</div>
                            </td>
                            {stocks.map(stock => {
                              const value = stock.metrics[metric.key];
                              const isBest = stock.symbol === best;
                              const isWorst = stock.symbol === worst && stocks.length > 1;
                              
                              return (
                                <td key={stock.symbol} className="text-center p-4">
                                  <div className={cn(
                                    "inline-flex items-center gap-2 px-2 py-1 rounded",
                                    isBest && "bg-green-500/20 text-green-400",
                                    isWorst && "bg-red-500/20 text-red-400",
                                    !isBest && !isWorst && "text-white"
                                  )}>
                                    {formatValue(value, metric.format)}
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
              </Card>
            </TabsContent>

            {/* Bar Chart View */}
            <TabsContent value="bar">
              <div className="grid gap-4">
                {selectedMetricConfigs.map(metric => {
                  const maxValue = Math.max(
                    ...stocks.map(s => s.metrics[metric.key] || 0)
                  );
                  const { best, worst } = getBestWorstValues(metric.key);
                  
                  return (
                    <Card key={metric.key} className="border-white/[0.05] bg-[#0A0D12]/60 backdrop-blur-sm">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-gray-300">
                          {metric.label}
                          <span className="text-xs text-gray-500 ml-2">({metric.description})</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {stocks.map((stock, index) => {
                            const value = stock.metrics[metric.key];
                            const percentage = value !== null ? (value / maxValue) * 100 : 0;
                            const isBest = stock.symbol === best;
                            const isWorst = stock.symbol === worst && stocks.length > 1;
                            
                            return (
                              <div key={stock.symbol} className="flex items-center gap-4">
                                <div className="w-16 text-sm font-medium text-white">{stock.symbol}</div>
                                <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden relative">
                                  <div
                                    className="h-full rounded-lg transition-all duration-500"
                                    style={{
                                      width: `${Math.min(percentage, 100)}%`,
                                      backgroundColor: STOCK_COLORS[index],
                                    }}
                                  />
                                </div>
                                <div className={cn(
                                  "w-24 text-right text-sm font-medium",
                                  isBest && "text-green-400",
                                  isWorst && "text-red-400",
                                  !isBest && !isWorst && "text-white"
                                )}>
                                  {formatValue(value, metric.format)}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            {/* Radar Chart View */}
            <TabsContent value="radar">
              <Card className="border-white/[0.05] bg-[#0A0D12]/60 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center">
                    <RadarChart stocks={stocks} metrics={selectedMetricConfigs} />
                    {/* Legend */}
                    <div className="flex flex-wrap gap-4 mt-6 justify-center">
                      {stocks.map((stock, index) => (
                        <div key={stock.symbol} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: STOCK_COLORS[index] }}
                          />
                          <span className="text-sm text-white">{stock.symbol}</span>
                          <span className="text-sm text-gray-400">{stock.companyName}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}

      {stocks.length === 0 && (
        <Card className="border-white/[0.05] bg-[#0A0D12]/60 backdrop-blur-sm">
          <CardContent className="py-16">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No stocks to compare</h3>
              <p className="text-gray-400 mb-4">Add up to 5 stocks to start comparing</p>
              <Button
                onClick={() => setIsSearchOpen(true)}
                className="bg-gradient-to-r from-[#00D4FF] to-[#3B82F6] text-[#05070B]"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Stock
              </Button>
            </div>
          </CardContent>
        </Card>
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
  const size = 400;
  const center = size / 2;
  const radius = (size / 2) - 60;
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
            stroke="rgba(255,255,255,0.1)"
            strokeWidth={1}
          />
        );
      })}

      {/* Axis lines and labels */}
      {metrics.map((metric, i) => {
        const point = getPoint(i, 1);
        const labelPoint = getPoint(i, 1.2);
        return (
          <g key={metric.key}>
            <line
              x1={center}
              y1={center}
              x2={point.x}
              y2={point.y}
              stroke="rgba(255,255,255,0.2)"
              strokeWidth={1}
            />
            <text
              x={labelPoint.x}
              y={labelPoint.y}
              fill="#9CA3AF"
              fontSize={10}
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
              fill={`${STOCK_COLORS[stockIndex]}20`}
              stroke={STOCK_COLORS[stockIndex]}
              strokeWidth={2}
            />
            {data.map((value, i) => {
              const p = getPoint(i, value);
              return (
                <circle
                  key={i}
                  cx={p.x}
                  cy={p.y}
                  r={4}
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
