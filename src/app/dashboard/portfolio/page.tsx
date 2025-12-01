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
  Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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
        <Loader2 className="h-8 w-8 animate-spin text-cyan-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Portfolio</h1>
          <p className="text-gray-400 mt-1">Track and manage your investments</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="h-4 w-4" />
          New Portfolio
        </button>
      </div>

      {portfolios.length === 0 ? (
        <EmptyState onCreateClick={() => setShowCreateModal(true)} />
      ) : (
        <>
          {/* Portfolio Selector */}
          {portfolios.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {portfolios.map((portfolio) => (
                <button
                  key={portfolio.id}
                  onClick={() => setSelectedPortfolio(portfolio)}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
                    selectedPortfolio?.id === portfolio.id
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                  )}
                >
                  {portfolio.name}
                  {portfolio.isDefault && (
                    <span className="ml-2 text-xs opacity-60">(Default)</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Portfolio Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <OverviewCard
              title="Total Value"
              value={`$${totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={Wallet}
              trend={totalGainLoss >= 0 ? 'up' : 'down'}
              trendValue={`${totalGainLoss >= 0 ? '+' : ''}$${totalGainLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
            <OverviewCard
              title="Total Return"
              value={`${totalGainLossPercent >= 0 ? '+' : ''}${totalGainLossPercent.toFixed(2)}%`}
              icon={TrendingUp}
              trend={totalGainLossPercent >= 0 ? 'up' : 'down'}
              trendValue={`$${Math.abs(totalGainLoss).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
            />
            <OverviewCard
              title="Today's Change"
              value={`${dayChange >= 0 ? '+' : ''}$${dayChange.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={BarChart3}
              trend={dayChange >= 0 ? 'up' : 'down'}
              trendValue={`${holdings.length} Holdings`}
            />
            <OverviewCard
              title="Cost Basis"
              value={`$${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
              icon={DollarSign}
              trendValue={`${holdings.length} Positions`}
            />
          </div>

          {/* Holdings Section */}
          <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-white/[0.05]">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center">
                  <Briefcase className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Holdings</h2>
                  <p className="text-sm text-gray-500">{holdings.length} positions</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddHoldingModal(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-gray-300 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Add Holding
              </button>
            </div>

            {holdingsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-6 w-6 animate-spin text-cyan-500" />
              </div>
            ) : holdings.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No holdings in this portfolio</p>
                <button
                  onClick={() => setShowAddHoldingModal(true)}
                  className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg text-sm hover:bg-cyan-500/30 transition-colors"
                >
                  Add your first holding
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-white/[0.02]">
                    <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                      <th className="px-4 py-3">Symbol</th>
                      <th className="px-4 py-3 text-right">Shares</th>
                      <th className="px-4 py-3 text-right">Avg Cost</th>
                      <th className="px-4 py-3 text-right">Current Price</th>
                      <th className="px-4 py-3 text-right">Market Value</th>
                      <th className="px-4 py-3 text-right">Total Return</th>
                      <th className="px-4 py-3 text-right">Day Change</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.05]">
                    {holdings.map((holding) => (
                      <HoldingRow key={holding.id} holding={holding} portfolioId={selectedPortfolio?.id || ''} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href={selectedPortfolio ? `/dashboard/portfolio/${selectedPortfolio.id}/analytics` : '#'}
              className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.04] transition-colors group"
            >
              <div className="h-12 w-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <PieChart className="h-6 w-6 text-purple-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">Portfolio Analytics</h3>
                <p className="text-sm text-gray-500">View allocation & risk metrics</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
            </Link>

            <Link
              href={selectedPortfolio ? `/dashboard/portfolio/${selectedPortfolio.id}/alerts` : '#'}
              className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.04] transition-colors group"
            >
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <Bell className="h-6 w-6 text-amber-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">Price Alerts</h3>
                <p className="text-sm text-gray-500">Set up notifications</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
            </Link>

            <Link
              href={selectedPortfolio ? `/dashboard/portfolio/${selectedPortfolio.id}/transactions` : '#'}
              className="flex items-center gap-4 p-4 bg-white/[0.02] border border-white/[0.05] rounded-xl hover:bg-white/[0.04] transition-colors group"
            >
              <div className="h-12 w-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <ArrowUpRight className="h-6 w-6 text-green-400" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-white">Transaction History</h3>
                <p className="text-sm text-gray-500">View all trades</p>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-600 group-hover:text-white transition-colors" />
            </Link>
          </div>
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
    </div>
  );
}

// Overview Card Component
function OverviewCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
}: {
  title: string;
  value: string;
  icon: typeof Wallet;
  trend?: 'up' | 'down';
  trendValue?: string;
}) {
  return (
    <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-gray-500">{title}</span>
        <Icon className="h-5 w-5 text-gray-600" />
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {trendValue && (
        <div className={cn(
          'flex items-center gap-1 text-sm',
          trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-gray-500'
        )}>
          {trend === 'up' && <ArrowUpRight className="h-4 w-4" />}
          {trend === 'down' && <ArrowDownRight className="h-4 w-4" />}
          {trendValue}
        </div>
      )}
    </div>
  );
}

// Holding Row Component
function HoldingRow({ holding, portfolioId }: { holding: Holding; portfolioId: string }) {
  return (
    <tr className="hover:bg-white/[0.02] transition-colors">
      <td className="px-4 py-3">
        <Link href={`/dashboard/stock-analysis/${holding.symbol}`} className="flex items-center gap-2 group">
          <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
            <span className="text-xs font-bold text-cyan-400">{holding.symbol.slice(0, 2)}</span>
          </div>
          <div>
            <div className="font-medium text-white group-hover:text-cyan-400 transition-colors">{holding.symbol}</div>
            <div className="text-xs text-gray-500 truncate max-w-[120px]">{holding.companyName}</div>
          </div>
        </Link>
      </td>
      <td className="px-4 py-3 text-right text-sm text-gray-300">{parseFloat(holding.quantity).toFixed(4)}</td>
      <td className="px-4 py-3 text-right text-sm text-gray-300">${parseFloat(holding.avgBuyPrice).toFixed(2)}</td>
      <td className="px-4 py-3 text-right text-sm text-white font-medium">${holding.currentPrice.toFixed(2)}</td>
      <td className="px-4 py-3 text-right text-sm text-white font-medium">${holding.currentValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
      <td className="px-4 py-3 text-right">
        <div className={cn('text-sm font-medium', holding.gainLoss >= 0 ? 'text-green-400' : 'text-red-400')}>
          {holding.gainLoss >= 0 ? '+' : ''}${holding.gainLoss.toFixed(2)}
        </div>
        <div className={cn('text-xs', holding.gainLossPercent >= 0 ? 'text-green-400/70' : 'text-red-400/70')}>
          {holding.gainLossPercent >= 0 ? '+' : ''}{holding.gainLossPercent.toFixed(2)}%
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <div className={cn('text-sm font-medium', holding.dayChange >= 0 ? 'text-green-400' : 'text-red-400')}>
          {holding.dayChange >= 0 ? '+' : ''}${holding.dayChange.toFixed(2)}
        </div>
        <div className={cn('text-xs', holding.dayChangePercent >= 0 ? 'text-green-400/70' : 'text-red-400/70')}>
          {holding.dayChangePercent >= 0 ? '+' : ''}{holding.dayChangePercent.toFixed(2)}%
        </div>
      </td>
      <td className="px-4 py-3 text-right">
        <button className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
          <MoreHorizontal className="h-4 w-4 text-gray-500" />
        </button>
      </td>
    </tr>
  );
}

// Empty State Component
function EmptyState({ onCreateClick }: { onCreateClick: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
      <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center mb-6">
        <Briefcase className="h-10 w-10 text-cyan-400" />
      </div>
      <h2 className="text-xl font-semibold text-white mb-2">Create Your First Portfolio</h2>
      <p className="text-gray-500 text-center max-w-md mb-6">
        Track your investments, monitor performance, and stay informed with email alerts and at-a-glance data about your portfolio's health.
      </p>
      <button
        onClick={onCreateClick}
        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity"
      >
        <Plus className="h-5 w-5" />
        Create Portfolio
      </button>
    </div>
  );
}

// Create Portfolio Modal
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
      <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Create New Portfolio</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Portfolio Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              placeholder="My Portfolio"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Description (Optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 resize-none"
              rows={3}
              placeholder="Long-term investments..."
            />
          </div>
          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Add Holding Modal
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
      <div className="bg-[#0a0a0f] border border-white/10 rounded-2xl w-full max-w-md p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Add Holding</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Stock Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              placeholder="AAPL"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Shares</label>
              <input
                type="number"
                step="0.0001"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                placeholder="10"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Avg Buy Price</label>
              <input
                type="number"
                step="0.01"
                value={avgBuyPrice}
                onChange={(e) => setAvgBuyPrice(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                placeholder="150.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Notes (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500"
              placeholder="Long-term hold..."
            />
          </div>
          {error && (
            <div className="text-red-400 text-sm">{error}</div>
          )}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Add Holding'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
