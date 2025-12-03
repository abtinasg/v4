'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  PieChart,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Shield,
  Target,
  AlertTriangle,
  ArrowLeft,
  Loader2,
  Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { FullDataButton } from '@/components/mobile';

interface SectorAllocation {
  sector: string;
  value: number;
  percentage: number;
  holdings: string[];
}

interface TopHolding {
  symbol: string;
  value: number;
  percentage: number;
  gainLoss: number;
  gainLossPercent: number;
}

interface RiskMetrics {
  beta: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  diversificationScore: number;
}

interface Analytics {
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  holdingsCount: number;
  sectorAllocation: SectorAllocation[];
  topHoldings: TopHolding[];
  riskMetrics: RiskMetrics;
  performanceHistory: {
    date: string;
    totalValue: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    dayChange: number;
  }[];
}

// Sector colors
const SECTOR_COLORS: Record<string, string> = {
  'Technology': 'from-blue-500 to-cyan-500',
  'Healthcare': 'from-green-500 to-emerald-500',
  'Financial Services': 'from-amber-500 to-yellow-500',
  'Consumer Cyclical': 'from-purple-500 to-pink-500',
  'Communication Services': 'from-red-500 to-orange-500',
  'Industrials': 'from-gray-500 to-slate-500',
  'Consumer Defensive': 'from-teal-500 to-cyan-500',
  'Energy': 'from-orange-500 to-red-500',
  'Utilities': 'from-indigo-500 to-purple-500',
  'Real Estate': 'from-emerald-500 to-green-500',
  'Basic Materials': 'from-yellow-500 to-amber-500',
  'Unknown': 'from-gray-500 to-gray-600',
};

export default function PortfolioAnalyticsPage() {
  const params = useParams();
  const portfolioId = params.id as string;
  
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(`/api/portfolio/${portfolioId}/analytics`);
        if (response.ok) {
          const data = await response.json();
          setAnalytics(data.analytics);
        } else {
          setError('Failed to load analytics');
        }
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [portfolioId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
        <p className="text-gray-400">{error || 'Failed to load analytics'}</p>
        <Link
          href="/dashboard/portfolio"
          className="mt-4 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors"
        >
          Back to Portfolio
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/portfolio"
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio Analytics</h1>
          <p className="text-gray-400">Comprehensive analysis of your portfolio</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
          <div className="text-sm text-gray-500 mb-1">Total Value</div>
          <div className="text-2xl font-bold text-white">
            ${analytics.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
          <div className="text-sm text-gray-500 mb-1">Total Return</div>
          <div className={cn(
            'text-2xl font-bold',
            analytics.totalGainLoss >= 0 ? 'text-green-400' : 'text-red-400'
          )}>
            {analytics.totalGainLossPercent >= 0 ? '+' : ''}{analytics.totalGainLossPercent.toFixed(2)}%
          </div>
          <div className={cn(
            'text-sm',
            analytics.totalGainLoss >= 0 ? 'text-green-400/70' : 'text-red-400/70'
          )}>
            {analytics.totalGainLoss >= 0 ? '+' : ''}${analytics.totalGainLoss.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
          <div className="text-sm text-gray-500 mb-1">Portfolio Beta</div>
          <div className="text-2xl font-bold text-white">{analytics.riskMetrics.beta.toFixed(2)}</div>
          <div className="text-sm text-gray-500">vs S&P 500</div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
          <div className="text-sm text-gray-500 mb-1">Diversification</div>
          <div className="text-2xl font-bold text-white">{analytics.riskMetrics.diversificationScore.toFixed(0)}/100</div>
          <div className={cn(
            'text-sm',
            analytics.riskMetrics.diversificationScore >= 70 ? 'text-green-400' :
            analytics.riskMetrics.diversificationScore >= 40 ? 'text-amber-400' : 'text-red-400'
          )}>
            {analytics.riskMetrics.diversificationScore >= 70 ? 'Well Diversified' :
             analytics.riskMetrics.diversificationScore >= 40 ? 'Moderate' : 'Low Diversification'}
          </div>
        </div>
      </div>

      {/* Sector Allocation */}
      <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
            <PieChart className="h-5 w-5 text-purple-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Sector Allocation</h2>
            <p className="text-sm text-gray-500">Distribution across market sectors</p>
          </div>
        </div>

        {analytics.sectorAllocation.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No holdings to analyze
          </div>
        ) : (
          <div className="space-y-4">
            {analytics.sectorAllocation.map((sector) => (
              <div key={sector.sector}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white">{sector.sector}</span>
                    <span className="text-xs text-gray-500">({sector.holdings.join(', ')})</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-400">
                      ${sector.value.toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </span>
                    <span className="text-sm font-medium text-white">
                      {sector.percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full bg-gradient-to-r rounded-full transition-all duration-500',
                      SECTOR_COLORS[sector.sector] || SECTOR_COLORS['Unknown']
                    )}
                    style={{ width: `${sector.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Top Holdings & Risk Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Holdings */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Top Holdings</h2>
              <p className="text-sm text-gray-500">Largest positions by value</p>
            </div>
          </div>

          {analytics.topHoldings.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No holdings to display
            </div>
          ) : (
            <div className="space-y-3">
              {analytics.topHoldings.map((holding, index) => (
                <Link
                  key={holding.symbol}
                  href={`/dashboard/stock-analysis/${holding.symbol}`}
                  className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl hover:bg-white/[0.04] transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-gray-500 w-5">{index + 1}</span>
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-cyan-400">{holding.symbol.slice(0, 2)}</span>
                    </div>
                    <div>
                      <div className="font-medium text-white">{holding.symbol}</div>
                      <div className="text-xs text-gray-500">{holding.percentage.toFixed(1)}% of portfolio</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium text-white">
                      ${holding.value.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                    <div className={cn(
                      'text-xs',
                      holding.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'
                    )}>
                      {holding.gainLossPercent >= 0 ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Risk Analysis */}
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/30 flex items-center justify-center">
              <Shield className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Risk Analysis</h2>
              <p className="text-sm text-gray-500">Portfolio risk metrics</p>
            </div>
          </div>

          <div className="space-y-4">
            <RiskMetricCard
              label="Portfolio Beta"
              value={analytics.riskMetrics.beta.toFixed(2)}
              description="Volatility relative to S&P 500"
              status={
                analytics.riskMetrics.beta <= 0.8 ? 'low' :
                analytics.riskMetrics.beta <= 1.2 ? 'medium' : 'high'
              }
            />
            <RiskMetricCard
              label="Diversification Score"
              value={`${analytics.riskMetrics.diversificationScore.toFixed(0)}/100`}
              description="Based on holdings and sector spread"
              status={
                analytics.riskMetrics.diversificationScore >= 70 ? 'low' :
                analytics.riskMetrics.diversificationScore >= 40 ? 'medium' : 'high'
              }
            />
            <RiskMetricCard
              label="Holdings Count"
              value={analytics.holdingsCount.toString()}
              description="Number of unique positions"
              status={
                analytics.holdingsCount >= 10 ? 'low' :
                analytics.holdingsCount >= 5 ? 'medium' : 'high'
              }
            />
          </div>

          {/* Risk Tips */}
          <div className="mt-6 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-amber-400 mb-1">Risk Tips</h4>
                <ul className="text-xs text-gray-400 space-y-1">
                  {analytics.riskMetrics.beta > 1.2 && (
                    <li>• Your portfolio is more volatile than the market average</li>
                  )}
                  {analytics.riskMetrics.diversificationScore < 50 && (
                    <li>• Consider diversifying across more sectors</li>
                  )}
                  {analytics.holdingsCount < 5 && (
                    <li>• Adding more holdings can reduce individual stock risk</li>
                  )}
                  {analytics.sectorAllocation.length > 0 && analytics.sectorAllocation[0].percentage > 40 && (
                    <li>• {analytics.sectorAllocation[0].sector} sector is heavily weighted</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RiskMetricCard({
  label,
  value,
  description,
  status,
}: {
  label: string;
  value: string;
  description: string;
  status: 'low' | 'medium' | 'high';
}) {
  const statusColors = {
    low: 'bg-green-500/20 text-green-400 border-green-500/30',
    medium: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    high: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  const statusLabels = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
  };

  return (
    <div className="flex items-center justify-between p-3 bg-white/[0.02] rounded-xl">
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-lg font-bold text-white">{value}</span>
        <span className={cn('px-2 py-1 rounded-lg text-xs border', statusColors[status])}>
          {statusLabels[status]}
        </span>
      </div>
    </div>
  );
}
