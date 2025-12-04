'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  PieChart, 
  Bell,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Briefcase,
  DollarSign,
  BarChart3,
  AlertCircle,
  Loader2,
  ChevronRight,
  Settings,
  Trash2,
  Edit,
  Eye,
  Upload,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { CSVImport } from '@/components/portfolio/csv-import';
import { motion } from 'framer-motion';

interface Portfolio {
  id: string;
  name: string;
  description: string | null;
  isDefault: boolean;
  currency: string;
  createdAt: string;
  metrics: {
    totalValue: number;
    totalCost: number;
    totalGainLoss: number;
    totalGainLossPercent: number;
    holdingsCount: number;
  };
}

interface Holding {
  id: string;
  symbol: string;
  quantity: string;
  avgBuyPrice: string;
  currentPrice: number;
  currentValue: number;
  totalCost: number;
  gainLoss: number;
  gainLossPercent: number;
  dayChange: number;
  dayChangePercent: number;
  companyName: string;
}

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [selectedPortfolio, setSelectedPortfolio] = useState<Portfolio | null>(null);
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);
  const [holdingsLoading, setHoldingsLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddHoldingModal, setShowAddHoldingModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch portfolios
  useEffect(() => {
    const fetchPortfolios = async () => {
      try {
        const response = await fetch('/api/portfolio');
        if (response.ok) {
          const data = await response.json();
          setPortfolios(data.portfolios || []);
          // Select default portfolio or first one
          const defaultPortfolio = data.portfolios?.find((p: Portfolio) => p.isDefault) || data.portfolios?.[0];
          if (defaultPortfolio) {
            setSelectedPortfolio(defaultPortfolio);
          }
        }
      } catch (err) {
        console.error('Error fetching portfolios:', err);
        setError('Failed to load portfolios');
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolios();
  }, []);

  // Fetch holdings when portfolio changes
  useEffect(() => {
    if (!selectedPortfolio) return;

    const fetchHoldings = async () => {
      setHoldingsLoading(true);
      try {
        const response = await fetch(`/api/portfolio/${selectedPortfolio.id}/holdings`);
        if (response.ok) {
          const data = await response.json();
          setHoldings(data.holdings || []);
        }
      } catch (err) {
        console.error('Error fetching holdings:', err);
      } finally {
        setHoldingsLoading(false);
      }
    };

    fetchHoldings();
  }, [selectedPortfolio?.id]);

  // Calculate totals from holdings
  const totalValue = holdings.reduce((sum, h) => sum + h.currentValue, 0);
  const totalCost = holdings.reduce((sum, h) => sum + h.totalCost, 0);
  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
  const dayChange = holdings.reduce((sum, h) => sum + h.dayChange, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-6 w-6 animate-spin text-white/40" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-10">
      {/* Header - Clean & Confident */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-6"
      >
        <div>
          <h1 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight">
            Portfolio
          </h1>
          <p className="text-base text-white/40 font-light mt-2 leading-relaxed">
            Track and manage your investments
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowImportModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-white/70 hover:text-white text-sm font-medium transition-all duration-200"
            disabled={!selectedPortfolio}
          >
            <Upload className="h-4 w-4" />
            Import
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500/90 hover:bg-emerald-500 rounded-xl text-white text-sm font-medium transition-all duration-200 shadow-lg shadow-emerald-500/20"
          >
            <Plus className="h-4 w-4" />
            New Portfolio
          </button>
        </div>
      </motion.header>

      {portfolios.length === 0 ? (
        <EmptyState onCreateClick={() => setShowCreateModal(true)} />
      ) : (
        <>
          {/* Portfolio Selector - Subtle Pills */}
          {portfolios.length > 1 && (
            <motion.div 
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="flex gap-2 overflow-x-auto pb-2 scrollbar-none"
            >
              {portfolios.map((portfolio) => (
                <button
                  key={portfolio.id}
                  onClick={() => setSelectedPortfolio(portfolio)}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-200',
                    selectedPortfolio?.id === portfolio.id
                      ? 'bg-white/[0.08] text-white border border-white/[0.08]'
                      : 'text-white/40 hover:text-white/60 hover:bg-white/[0.03]'
                  )}
                >
                  {portfolio.name}
                  {portfolio.isDefault && (
                    <span className="ml-2 text-xs opacity-50">Default</span>
                  )}
                </button>
              ))}
            </motion.div>
          )}

          {/* Primary Metrics - Glass Cards */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5"
          >
            {/* Total Value - Primary */}
            <SummaryCard
              label="Total Value"
              value={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subValue={`${totalGainLoss >= 0 ? '+' : ''}$${totalGainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              trend={totalGainLoss >= 0 ? 'up' : 'down'}
              isPrimary
            />
            
            {/* Total Return - Primary */}
            <SummaryCard
              label="Total Return"
              value={`${totalGainLossPercent >= 0 ? '+' : ''}${totalGainLossPercent.toFixed(2)}%`}
              subValue={`$${Math.abs(totalGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              trend={totalGainLossPercent >= 0 ? 'up' : 'down'}
              isPrimary
            />
            
            {/* Today's Change - Primary */}
            <SummaryCard
              label="Today's Change"
              value={`${dayChange >= 0 ? '+' : ''}$${dayChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subValue={`${holdings.length} Positions`}
              trend={dayChange >= 0 ? 'up' : 'down'}
              isPrimary
            />
            
            {/* Cost Basis - Secondary */}
            <SummaryCard
              label="Cost Basis"
              value={`$${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              subValue={`${holdings.length} Holdings`}
            />
          </motion.section>

          {/* Holdings Section - Clean Surface */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-10"
          >
            <div className="bg-white/[0.02] backdrop-blur-sm border border-white/[0.05] rounded-2xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
              {/* Section Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/[0.04]">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-white/[0.04] flex items-center justify-center">
                    <Briefcase className="h-5 w-5 text-white/50" />
                  </div>
                  <div>
                    <h2 className="text-lg font-medium text-white tracking-tight">Holdings</h2>
                    <p className="text-sm text-white/35 font-light">{holdings.length} positions</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowAddHoldingModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-sm text-white/70 hover:text-white transition-all duration-200"
                >
                  <Plus className="h-4 w-4" />
                  Add Holding
                </button>
              </div>

              {holdingsLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-5 w-5 animate-spin text-white/30" />
                </div>
              ) : holdings.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div className="h-14 w-14 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-5">
                    <Briefcase className="h-6 w-6 text-white/25" />
                  </div>
                  <p className="text-white/40 text-base font-light mb-5">No holdings in this portfolio</p>
                  <button
                    onClick={() => setShowAddHoldingModal(true)}
                    className="px-5 py-2.5 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] text-white/70 hover:text-white rounded-xl text-sm font-medium transition-all duration-200"
                  >
                    Add your first holding
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-xs text-white/30 uppercase tracking-wider border-b border-white/[0.03]">
                        <th className="px-6 py-4 font-medium">Asset</th>
                        <th className="px-6 py-4 text-right font-medium">Shares</th>
                        <th className="px-6 py-4 text-right font-medium">Avg Cost</th>
                        <th className="px-6 py-4 text-right font-medium">Price</th>
                        <th className="px-6 py-4 text-right font-medium">Value</th>
                        <th className="px-6 py-4 text-right font-medium">Return</th>
                        <th className="px-6 py-4 text-right font-medium">Today</th>
                        <th className="px-6 py-4 text-right font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {holdings.map((holding, idx) => (
                        <HoldingRow key={holding.id} holding={holding} portfolioId={selectedPortfolio?.id || ''} isLast={idx === holdings.length - 1} />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.section>

          {/* Tools Section - Premium Cards */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="mt-10"
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5">
              <ToolCard
                href={selectedPortfolio ? `/dashboard/portfolio/${selectedPortfolio.id}/analytics` : '#'}
                icon={PieChart}
                iconColor="text-violet-400/80"
                iconBg="bg-violet-500/[0.08]"
                title="Portfolio Analytics"
                description="Allocation & risk metrics"
              />
              
              <ToolCard
                href={selectedPortfolio ? `/dashboard/portfolio/${selectedPortfolio.id}/alerts` : '#'}
                icon={Bell}
                iconColor="text-amber-400/80"
                iconBg="bg-amber-500/[0.08]"
                title="Price Alerts"
                description="Set up notifications"
              />
              
              <ToolCard
                href={selectedPortfolio ? `/dashboard/portfolio/${selectedPortfolio.id}/transactions` : '#'}
                icon={Clock}
                iconColor="text-emerald-400/80"
                iconBg="bg-emerald-500/[0.08]"
                title="Transaction History"
                description="View all trades"
              />
            </div>
          </motion.section>
        </>
      )}

      {/* Create Portfolio Modal */}
      {showCreateModal && (
        <CreatePortfolioModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={(portfolio) => {
            setPortfolios([...portfolios, portfolio]);
            if (!selectedPortfolio) {
              setSelectedPortfolio(portfolio);
            }
            setShowCreateModal(false);
          }}
        />
      )}

      {/* Add Holding Modal */}
      {showAddHoldingModal && selectedPortfolio && (
        <AddHoldingModal
          portfolioId={selectedPortfolio.id}
          onClose={() => setShowAddHoldingModal(false)}
          onSuccess={(holding) => {
            setHoldings([holding, ...holdings]);
            setShowAddHoldingModal(false);
          }}
        />
      )}

      {/* Import Modal */}
      {showImportModal && selectedPortfolio && (
        <ImportModal
          isOpen={showImportModal}
          portfolioId={selectedPortfolio.id}
          onClose={() => setShowImportModal(false)}
          onSuccess={() => {
            // Refresh holdings after import
            const fetchHoldings = async () => {
              try {
                const response = await fetch(`/api/portfolio/${selectedPortfolio.id}/holdings`);
                if (response.ok) {
                  const data = await response.json();
                  setHoldings(data.holdings || []);
                }
              } catch (err) {
                console.error('Error refreshing holdings:', err);
              }
            };
            fetchHoldings();
          }}
        />
      )}

      {/* Full Data Button for Mobile */}
    </div>
  );
}

// Summary Card Component - Glass Style
function SummaryCard({
  label,
  value,
  subValue,
  trend,
  isPrimary = false,
}: {
  label: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down';
  isPrimary?: boolean;
}) {
  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl p-5 lg:p-6',
      'bg-white/[0.02] backdrop-blur-sm',
      'border border-white/[0.05]',
      'shadow-[0_4px_24px_rgba(0,0,0,0.08)]',
      'transition-all duration-200 hover:bg-white/[0.03]'
    )}>
      {/* Subtle surface gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] via-transparent to-transparent pointer-events-none" />
      
      <div className="relative">
        <span className="text-xs text-white/35 uppercase tracking-wider font-medium">
          {label}
        </span>
        <div className={cn(
          'mt-2 font-semibold tracking-tight',
          isPrimary ? 'text-2xl lg:text-3xl text-white' : 'text-xl lg:text-2xl text-white/90'
        )}>
          {value}
        </div>
        {subValue && (
          <div className={cn(
            'mt-2 flex items-center gap-1.5 text-sm font-light',
            trend === 'up' ? 'text-emerald-400/80' : trend === 'down' ? 'text-rose-400/80' : 'text-white/35'
          )}>
            {trend === 'up' && <ArrowUpRight className="h-3.5 w-3.5" />}
            {trend === 'down' && <ArrowDownRight className="h-3.5 w-3.5" />}
            {subValue}
          </div>
        )}
      </div>
    </div>
  );
}

// Tool Card Component
function ToolCard({
  href,
  icon: Icon,
  iconColor,
  iconBg,
  title,
  description,
}: {
  href: string;
  icon: typeof PieChart;
  iconColor: string;
  iconBg: string;
  title: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        'group flex items-center gap-4 p-5 lg:p-6',
        'bg-white/[0.02] backdrop-blur-sm',
        'border border-white/[0.05] rounded-2xl',
        'shadow-[0_4px_24px_rgba(0,0,0,0.06)]',
        'hover:bg-white/[0.04] hover:border-white/[0.08]',
        'transition-all duration-200'
      )}
    >
      <div className={cn('h-11 w-11 rounded-xl flex items-center justify-center', iconBg)}>
        <Icon className={cn('h-5 w-5', iconColor)} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-medium text-white tracking-tight">{title}</h3>
        <p className="text-sm text-white/35 font-light mt-0.5">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all duration-200" />
    </Link>
  );
}

// Holding Row Component - Cleaner
function HoldingRow({ holding, portfolioId, isLast }: { holding: Holding; portfolioId: string; isLast?: boolean }) {
  return (
    <tr className={cn(
      'hover:bg-white/[0.02] transition-colors',
      !isLast && 'border-b border-white/[0.03]'
    )}>
      <td className="px-6 py-4">
        <Link href={`/dashboard/stock-analysis/${holding.symbol}`} className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-lg bg-white/[0.04] flex items-center justify-center">
            <span className="text-xs font-semibold text-white/60">{holding.symbol.slice(0, 2)}</span>
          </div>
          <div>
            <div className="font-medium text-white group-hover:text-emerald-400 transition-colors text-sm">{holding.symbol}</div>
            <div className="text-xs text-white/30 truncate max-w-[100px]">{holding.companyName}</div>
          </div>
        </Link>
      </td>
      <td className="px-6 py-4 text-right text-sm text-white/60 font-light">{parseFloat(holding.quantity).toFixed(4)}</td>
      <td className="px-6 py-4 text-right text-sm text-white/60 font-light">${parseFloat(holding.avgBuyPrice).toFixed(2)}</td>
      <td className="px-6 py-4 text-right text-sm text-white font-medium">${holding.currentPrice.toFixed(2)}</td>
      <td className="px-6 py-4 text-right text-sm text-white font-medium">${holding.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      <td className="px-6 py-4 text-right">
        <div className={cn('text-sm font-medium', holding.gainLoss >= 0 ? 'text-emerald-400/90' : 'text-rose-400/90')}>
          {holding.gainLoss >= 0 ? '+' : ''}${holding.gainLoss.toFixed(2)}
        </div>
        <div className={cn('text-xs font-light', holding.gainLossPercent >= 0 ? 'text-emerald-400/60' : 'text-rose-400/60')}>
          {holding.gainLossPercent >= 0 ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <div className={cn('text-sm font-medium', holding.dayChange >= 0 ? 'text-emerald-400/90' : 'text-rose-400/90')}>
          {holding.dayChange >= 0 ? '+' : ''}${holding.dayChange.toFixed(2)}
        </div>
        <div className={cn('text-xs font-light', holding.dayChangePercent >= 0 ? 'text-emerald-400/60' : 'text-rose-400/60')}>
          {holding.dayChangePercent >= 0 ? '+' : ''}{holding.dayChangePercent.toFixed(2)}%
        </div>
      </td>
      <td className="px-6 py-4 text-right">
        <button className="p-2 hover:bg-white/[0.06] rounded-lg transition-colors">
          <MoreHorizontal className="h-4 w-4 text-white/30" />
        </button>
      </td>
    </tr>
  );
}

// Empty State Component - Clean & Premium
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col items-center justify-center py-24 lg:py-32"
    >
      <div className="h-16 w-16 rounded-2xl bg-white/[0.03] border border-white/[0.05] flex items-center justify-center mb-8">
        <Briefcase className="h-7 w-7 text-white/30" />
      </div>
      <h2 className="text-2xl font-semibold text-white tracking-tight mb-3">
        Create Your First Portfolio
      </h2>
      <p className="text-white/40 text-center max-w-md mb-8 font-light leading-relaxed">
        Track your investments, monitor performance, and stay informed with real-time insights about your portfolio.
      </p>
      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 px-6 py-3 bg-emerald-500/90 hover:bg-emerald-500 rounded-xl text-white font-medium transition-all duration-200 shadow-lg shadow-emerald-500/20"
      >
        <Plus className="h-5 w-5" />
        Create Portfolio
      </button>
    </motion.div>
  );
}

// Create Portfolio Modal - Premium Design
function CreatePortfolioModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: (portfolio: Portfolio) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Portfolio name is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      });

      if (response.ok) {
        const data = await response.json();
        onSuccess({
          ...data.portfolio,
          metrics: {
            totalValue: 0,
            totalCost: 0,
            totalGainLoss: 0,
            totalGainLossPercent: 0,
            holdingsCount: 0,
          },
        });
      } else {
        const data = await response.json();
        console.error('Portfolio creation error:', data);
        setError(data.details || data.error || 'Failed to create portfolio');
      }
    } catch (err) {
      console.error('Portfolio creation exception:', err);
      setError('Failed to create portfolio. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="bg-[#0c0e14] border border-white/[0.06] rounded-2xl w-full max-w-md p-6 shadow-[0_24px_64px_rgba(0,0,0,0.4)]"
      >
        <h2 className="text-xl font-semibold text-white tracking-tight mb-6">Create New Portfolio</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-white/40 mb-2 font-light">Portfolio Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-white/[0.12] transition-colors"
              placeholder="My Portfolio"
            />
          </div>
          <div>
            <label className="block text-sm text-white/40 mb-2 font-light">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-white/[0.12] resize-none transition-colors"
              rows={3}
              placeholder="Long-term investments..."
            />
          </div>
          {error && (
            <div className="text-rose-400/90 text-sm font-light">{error}</div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-white/70 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-emerald-500/90 hover:bg-emerald-500 rounded-xl text-white font-medium transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Create'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// Import Modal - Premium Design
function ImportModal({ 
  isOpen, 
  onClose, 
  portfolioId,
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  portfolioId: string;
  onSuccess: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="bg-[#0c0e14] rounded-2xl border border-white/[0.06] max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_24px_64px_rgba(0,0,0,0.4)]"
      >
        <div className="p-6 border-b border-white/[0.05]">
          <h2 className="text-xl font-semibold text-white tracking-tight">Import Holdings</h2>
          <p className="text-white/40 text-sm mt-1.5 font-light">Import from CSV or connect your broker</p>
        </div>
        <div className="p-6">
          <CSVImport 
            portfolioId={portfolioId} 
            onImportSuccess={() => {
              onSuccess();
              onClose();
            }}
          />
        </div>
        <div className="p-6 border-t border-white/[0.05]">
          <button
            onClick={onClose}
            className="w-full px-4 py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-white/70 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// Add Holding Modal - Premium Design
function AddHoldingModal({
  portfolioId,
  onClose,
  onSuccess,
}: {
  portfolioId: string;
  onClose: () => void;
  onSuccess: (holding: Holding) => void;
}) {
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [avgBuyPrice, setAvgBuyPrice] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim() || !quantity || !avgBuyPrice) {
      setError('Symbol, quantity, and price are required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/portfolio/${portfolioId}/holdings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          quantity: parseFloat(quantity),
          avgBuyPrice: parseFloat(avgBuyPrice),
          notes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Create holding object for the UI
        const qty = parseFloat(quantity);
        const price = parseFloat(avgBuyPrice);
        onSuccess({
          id: data.holding.id,
          symbol: symbol.toUpperCase(),
          quantity,
          avgBuyPrice,
          currentPrice: price,
          currentValue: qty * price,
          totalCost: qty * price,
          gainLoss: 0,
          gainLossPercent: 0,
          dayChange: 0,
          dayChangePercent: 0,
          companyName: symbol.toUpperCase(),
        });
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to add holding');
      }
    } catch (err) {
      setError('Failed to add holding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="bg-[#0c0e14] border border-white/[0.06] rounded-2xl w-full max-w-md p-6 shadow-[0_24px_64px_rgba(0,0,0,0.4)]"
      >
        <h2 className="text-xl font-semibold text-white tracking-tight mb-6">Add Holding</h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-white/40 mb-2 font-light">Stock Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-white/[0.12] transition-colors"
              placeholder="AAPL"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-white/40 mb-2 font-light">Shares</label>
              <input
                type="number"
                step="0.0001"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-white/[0.12] transition-colors"
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-sm text-white/40 mb-2 font-light">Avg Buy Price</label>
              <input
                type="number"
                step="0.01"
                value={avgBuyPrice}
                onChange={(e) => setAvgBuyPrice(e.target.value)}
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-white/[0.12] transition-colors"
                placeholder="150.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-white/40 mb-2 font-light">Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl text-white placeholder-white/25 focus:outline-none focus:border-white/[0.12] transition-colors"
              placeholder="Long-term hold..."
            />
          </div>
          {error && (
            <div className="text-rose-400/90 text-sm font-light">{error}</div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.06] rounded-xl text-white/70 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-emerald-500/90 hover:bg-emerald-500 rounded-xl text-white font-medium transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Add Holding'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
