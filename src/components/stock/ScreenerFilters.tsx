'use client';

import React from 'react';
import { X, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { ScreenerFilters } from './Screener';

// Market cap presets (in billions)
const MARKET_CAP_PRESETS = {
  micro: { min: 0, max: 0.3, label: 'Micro (<$300M)' },
  small: { min: 0.3, max: 2, label: 'Small ($300M-$2B)' },
  mid: { min: 2, max: 10, label: 'Mid ($2B-$10B)' },
  large: { min: 10, max: 200, label: 'Large ($10B-$200B)' },
  mega: { min: 200, max: null, label: 'Mega (>$200B)' },
};

// Sectors
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

interface ScreenerFiltersProps {
  filters: ScreenerFilters;
  onChange: (filters: ScreenerFilters) => void;
  onReset: () => void;
  className?: string;
}

export function ScreenerFilters({
  filters,
  onChange,
  onReset,
  className,
}: ScreenerFiltersProps) {
  const updateFilter = <K extends keyof ScreenerFilters>(
    key: K,
    value: ScreenerFilters[K]
  ) => {
    onChange({ ...filters, [key]: value });
  };

  const clearFilter = <K extends keyof ScreenerFilters>(key: K, defaultValue: ScreenerFilters[K]) => {
    onChange({ ...filters, [key]: defaultValue });
  };

  // Count active filters
  const activeFilters: string[] = [];
  if (filters.marketCap.preset && filters.marketCap.preset !== 'any') {
    activeFilters.push(`Market Cap: ${MARKET_CAP_PRESETS[filters.marketCap.preset]?.label}`);
  }
  if (filters.sector.length > 0) {
    activeFilters.push(`Sectors: ${filters.sector.length}`);
  }
  if (filters.peRatio.min !== null || filters.peRatio.max !== null) {
    activeFilters.push(`P/E: ${filters.peRatio.min ?? '0'} - ${filters.peRatio.max ?? '∞'}`);
  }
  if (filters.dividendYield.min !== null || filters.dividendYield.max !== null) {
    activeFilters.push(`Div Yield: ${filters.dividendYield.min ?? '0'}% - ${filters.dividendYield.max ?? '∞'}%`);
  }
  if (filters.roe.min !== null || filters.roe.max !== null) {
    activeFilters.push(`ROE: ${filters.roe.min ?? '0'}% - ${filters.roe.max ?? '∞'}%`);
  }
  if (filters.roa.min !== null || filters.roa.max !== null) {
    activeFilters.push(`ROA: ${filters.roa.min ?? '0'}% - ${filters.roa.max ?? '∞'}%`);
  }
  if (filters.revenueGrowth.min !== null || filters.revenueGrowth.max !== null) {
    activeFilters.push(`Rev Growth: ${filters.revenueGrowth.min ?? '-∞'}% - ${filters.revenueGrowth.max ?? '∞'}%`);
  }
  if (filters.rsi.min !== null || filters.rsi.max !== null) {
    activeFilters.push(`RSI: ${filters.rsi.min ?? '0'} - ${filters.rsi.max ?? '100'}`);
  }
  if (filters.macdSignal && filters.macdSignal !== 'any') {
    activeFilters.push(`MACD: ${filters.macdSignal}`);
  }
  if (filters.piotroskiScore.min !== null || filters.piotroskiScore.max !== null) {
    activeFilters.push(`F-Score: ${filters.piotroskiScore.min ?? '0'} - ${filters.piotroskiScore.max ?? '9'}`);
  }

  return (
    <Card className={cn("border-white/[0.05] bg-[#0A0D12]/60 backdrop-blur-sm", className)}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-lg text-white">Filters</CardTitle>
          {activeFilters.length > 0 && (
            <p className="text-sm text-gray-400 mt-1">
              {activeFilters.length} active filter{activeFilters.length !== 1 ? 's' : ''}
            </p>
          )}
        </div>
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
        {/* Active Filter Pills */}
        {activeFilters.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6 pb-4 border-b border-white/10">
            {activeFilters.map((filter, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[#00D4FF]/10 text-[#00D4FF] text-xs"
              >
                {filter}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Market Cap */}
          <FilterGroup title="Market Cap" collapsible>
            <select
              value={filters.marketCap.preset || 'any'}
              onChange={(e) => updateFilter('marketCap', {
                ...filters.marketCap,
                preset: e.target.value as ScreenerFilters['marketCap']['preset'],
              })}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00D4FF]/50"
            >
              <option value="any">Any Market Cap</option>
              {Object.entries(MARKET_CAP_PRESETS).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </FilterGroup>

          {/* Sector */}
          <FilterGroup title="Sector" collapsible>
            <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
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
            {filters.sector.length > 0 && (
              <button
                onClick={() => updateFilter('sector', [])}
                className="mt-2 text-xs text-gray-500 hover:text-gray-300"
              >
                Clear all sectors
              </button>
            )}
          </FilterGroup>

          {/* Valuation Metrics */}
          <FilterGroup title="P/E Ratio">
            <RangeInput
              min={filters.peRatio.min}
              max={filters.peRatio.max}
              onChange={(min, max) => updateFilter('peRatio', { min, max })}
              placeholder={{ min: 'Min', max: 'Max' }}
            />
          </FilterGroup>

          <FilterGroup title="P/B Ratio">
            <RangeInput
              min={filters.pbRatio.min}
              max={filters.pbRatio.max}
              onChange={(min, max) => updateFilter('pbRatio', { min, max })}
              placeholder={{ min: 'Min', max: 'Max' }}
              step={0.1}
            />
          </FilterGroup>

          <FilterGroup title="Dividend Yield (%)">
            <RangeInput
              min={filters.dividendYield.min}
              max={filters.dividendYield.max}
              onChange={(min, max) => updateFilter('dividendYield', { min, max })}
              placeholder={{ min: 'Min %', max: 'Max %' }}
              step={0.1}
            />
          </FilterGroup>

          {/* Profitability Metrics */}
          <FilterGroup title="ROE (%)">
            <RangeInput
              min={filters.roe.min}
              max={filters.roe.max}
              onChange={(min, max) => updateFilter('roe', { min, max })}
              placeholder={{ min: 'Min %', max: 'Max %' }}
            />
          </FilterGroup>

          <FilterGroup title="ROA (%)">
            <RangeInput
              min={filters.roa.min}
              max={filters.roa.max}
              onChange={(min, max) => updateFilter('roa', { min, max })}
              placeholder={{ min: 'Min %', max: 'Max %' }}
            />
          </FilterGroup>

          {/* Growth Metrics */}
          <FilterGroup title="Revenue Growth (%)">
            <RangeInput
              min={filters.revenueGrowth.min}
              max={filters.revenueGrowth.max}
              onChange={(min, max) => updateFilter('revenueGrowth', { min, max })}
              placeholder={{ min: 'Min %', max: 'Max %' }}
              allowNegative
            />
          </FilterGroup>

          <FilterGroup title="EPS Growth (%)">
            <RangeInput
              min={filters.epsGrowth.min}
              max={filters.epsGrowth.max}
              onChange={(min, max) => updateFilter('epsGrowth', { min, max })}
              placeholder={{ min: 'Min %', max: 'Max %' }}
              allowNegative
            />
          </FilterGroup>

          {/* Leverage & Liquidity */}
          <FilterGroup title="Debt/Equity">
            <RangeInput
              min={filters.debtToEquity.min}
              max={filters.debtToEquity.max}
              onChange={(min, max) => updateFilter('debtToEquity', { min, max })}
              placeholder={{ min: 'Min', max: 'Max' }}
              step={0.1}
            />
          </FilterGroup>

          <FilterGroup title="Current Ratio">
            <RangeInput
              min={filters.currentRatio.min}
              max={filters.currentRatio.max}
              onChange={(min, max) => updateFilter('currentRatio', { min, max })}
              placeholder={{ min: 'Min', max: 'Max' }}
              step={0.1}
            />
          </FilterGroup>

          {/* Technical Indicators */}
          <FilterGroup title="RSI">
            <RangeInput
              min={filters.rsi.min}
              max={filters.rsi.max}
              onChange={(min, max) => updateFilter('rsi', { min, max })}
              placeholder={{ min: '0', max: '100' }}
              minValue={0}
              maxValue={100}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => updateFilter('rsi', { min: null, max: 30 })}
                className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20"
              >
                Oversold (&lt;30)
              </button>
              <button
                onClick={() => updateFilter('rsi', { min: 70, max: null })}
                className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
              >
                Overbought (&gt;70)
              </button>
            </div>
          </FilterGroup>

          <FilterGroup title="MACD Signal">
            <select
              value={filters.macdSignal || 'any'}
              onChange={(e) => updateFilter('macdSignal', e.target.value as ScreenerFilters['macdSignal'])}
              className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-[#00D4FF]/50"
            >
              <option value="any">Any Signal</option>
              <option value="bullish">Bullish (Buy)</option>
              <option value="bearish">Bearish (Sell)</option>
            </select>
          </FilterGroup>

          {/* Quality Scores */}
          <FilterGroup title="Piotroski F-Score">
            <RangeInput
              min={filters.piotroskiScore.min}
              max={filters.piotroskiScore.max}
              onChange={(min, max) => updateFilter('piotroskiScore', { min, max })}
              placeholder={{ min: '0', max: '9' }}
              minValue={0}
              maxValue={9}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => updateFilter('piotroskiScore', { min: 7, max: null })}
                className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20"
              >
                Strong (7-9)
              </button>
              <button
                onClick={() => updateFilter('piotroskiScore', { min: null, max: 3 })}
                className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
              >
                Weak (0-3)
              </button>
            </div>
          </FilterGroup>

          <FilterGroup title="Altman Z-Score">
            <RangeInput
              min={filters.altmanZ.min}
              max={filters.altmanZ.max}
              onChange={(min, max) => updateFilter('altmanZ', { min, max })}
              placeholder={{ min: 'Min', max: 'Max' }}
              step={0.1}
            />
            <div className="flex gap-2 mt-2">
              <button
                onClick={() => updateFilter('altmanZ', { min: 3, max: null })}
                className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400 hover:bg-green-500/20"
              >
                Safe (&gt;3)
              </button>
              <button
                onClick={() => updateFilter('altmanZ', { min: null, max: 1.8 })}
                className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-400 hover:bg-red-500/20"
              >
                Distress (&lt;1.8)
              </button>
            </div>
          </FilterGroup>
        </div>
      </CardContent>
    </Card>
  );
}

// Filter Group Component
function FilterGroup({
  title,
  children,
  collapsible = false,
}: {
  title: string;
  children: React.ReactNode;
  collapsible?: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(true);

  return (
    <div>
      <button
        className={cn(
          "flex items-center justify-between w-full text-sm font-medium text-gray-400 mb-2",
          collapsible && "cursor-pointer hover:text-gray-300"
        )}
        onClick={collapsible ? () => setIsOpen(!isOpen) : undefined}
      >
        {title}
        {collapsible && (
          <ChevronDown className={cn("h-4 w-4 transition-transform", !isOpen && "-rotate-90")} />
        )}
      </button>
      {isOpen && children}
    </div>
  );
}

// Range Input Component
function RangeInput({
  min,
  max,
  onChange,
  placeholder = { min: 'Min', max: 'Max' },
  step = 1,
  minValue,
  maxValue,
  allowNegative = false,
}: {
  min: number | null;
  max: number | null;
  onChange: (min: number | null, max: number | null) => void;
  placeholder?: { min: string; max: string };
  step?: number;
  minValue?: number;
  maxValue?: number;
  allowNegative?: boolean;
}) {
  return (
    <div className="flex gap-2">
      <input
        type="number"
        placeholder={placeholder.min}
        value={min ?? ''}
        onChange={(e) => onChange(
          e.target.value ? parseFloat(e.target.value) : null,
          max
        )}
        min={allowNegative ? undefined : minValue ?? 0}
        max={maxValue}
        step={step}
        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50 text-sm"
      />
      <input
        type="number"
        placeholder={placeholder.max}
        value={max ?? ''}
        onChange={(e) => onChange(
          min,
          e.target.value ? parseFloat(e.target.value) : null
        )}
        min={allowNegative ? undefined : minValue ?? 0}
        max={maxValue}
        step={step}
        className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#00D4FF]/50 text-sm"
      />
    </div>
  );
}

export default ScreenerFilters;
