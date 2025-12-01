'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Loader2,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  DollarSign,
  FileText,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Transaction {
  id: string;
  portfolioId: string;
  holdingId: string | null;
  symbol: string;
  type: 'buy' | 'sell' | 'dividend' | 'split' | 'transfer_in' | 'transfer_out';
  quantity: string;
  price: string;
  totalAmount: string;
  fees: string | null;
  notes: string | null;
  executedAt: string;
  createdAt: string;
}

const TYPE_CONFIG = {
  buy: { label: 'Buy', icon: ArrowUpRight, color: 'text-green-400', bgColor: 'bg-green-500/10' },
  sell: { label: 'Sell', icon: ArrowDownRight, color: 'text-red-400', bgColor: 'bg-red-500/10' },
  dividend: { label: 'Dividend', icon: DollarSign, color: 'text-cyan-400', bgColor: 'bg-cyan-500/10' },
  split: { label: 'Split', icon: TrendingUp, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
  transfer_in: { label: 'Transfer In', icon: ArrowUpRight, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  transfer_out: { label: 'Transfer Out', icon: ArrowDownRight, color: 'text-amber-400', bgColor: 'bg-amber-500/10' },
};

export default function PortfolioTransactionsPage() {
  const params = useParams();
  const portfolioId = params.id as string;

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch(`/api/portfolio/${portfolioId}/transactions`);
        if (response.ok) {
          const data = await response.json();
          setTransactions(data.transactions || []);
        } else {
          setError('Failed to load transactions');
        }
      } catch (err) {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [portfolioId]);

  const filteredTransactions = filterType === 'all' 
    ? transactions 
    : transactions.filter(t => t.type === filterType);

  // Calculate summary
  const totalBought = transactions
    .filter(t => t.type === 'buy')
    .reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
  const totalSold = transactions
    .filter(t => t.type === 'sell')
    .reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);
  const totalDividends = transactions
    .filter(t => t.type === 'dividend')
    .reduce((sum, t) => sum + parseFloat(t.totalAmount), 0);

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
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/portfolio"
          className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-400" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-white">Transaction History</h1>
          <p className="text-gray-400">All your portfolio transactions</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <ArrowUpRight className="h-4 w-4 text-green-400" />
            Total Bought
          </div>
          <div className="text-xl font-bold text-white">
            ${totalBought.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <ArrowDownRight className="h-4 w-4 text-red-400" />
            Total Sold
          </div>
          <div className="text-xl font-bold text-white">
            ${totalSold.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-xl p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <DollarSign className="h-4 w-4 text-cyan-400" />
            Total Dividends
          </div>
          <div className="text-xl font-bold text-white">
            ${totalDividends.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-4 w-4 text-gray-500" />
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-cyan-500"
        >
          <option value="all">All Transactions</option>
          <option value="buy">Buys</option>
          <option value="sell">Sells</option>
          <option value="dividend">Dividends</option>
          <option value="split">Splits</option>
          <option value="transfer_in">Transfers In</option>
          <option value="transfer_out">Transfers Out</option>
        </select>
        <span className="text-sm text-gray-500">
          {filteredTransactions.length} transactions
        </span>
      </div>

      {/* Transactions List */}
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white/[0.02] border border-white/[0.05] rounded-2xl">
          <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center mb-6">
            <FileText className="h-10 w-10 text-green-400" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">No Transactions Yet</h2>
          <p className="text-gray-500 text-center max-w-md">
            Your transaction history will appear here once you add holdings to your portfolio.
          </p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.05] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/[0.02]">
                <tr className="text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Symbol</th>
                  <th className="px-4 py-3 text-right">Shares</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.05]">
                {filteredTransactions.map((transaction) => {
                  const config = TYPE_CONFIG[transaction.type];
                  const Icon = config.icon;
                  const date = new Date(transaction.executedAt);

                  return (
                    <tr key={transaction.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                          <div>
                            <div className="text-sm text-white">
                              {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center', config.bgColor)}>
                            <Icon className={cn('h-4 w-4', config.color)} />
                          </div>
                          <span className={cn('text-sm font-medium', config.color)}>{config.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Link 
                          href={`/dashboard/stock-analysis/${transaction.symbol}`}
                          className="font-medium text-white hover:text-cyan-400 transition-colors"
                        >
                          {transaction.symbol}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-300">
                        {parseFloat(transaction.quantity).toFixed(4)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-300">
                        ${parseFloat(transaction.price).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={cn('text-sm font-medium', config.color)}>
                          {transaction.type === 'sell' ? '-' : '+'}${parseFloat(transaction.totalAmount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {transaction.notes ? (
                          <span className="text-sm text-gray-500 truncate max-w-[150px] block">
                            {transaction.notes}
                          </span>
                        ) : (
                          <span className="text-sm text-gray-600">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
