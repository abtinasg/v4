/**
 * Portfolio Table Component
 * 
 * Displays holdings in a sortable table with real-time prices
 * - Sorting by various columns
 * - Real-time price flash animations
 * - Edit/Delete actions
 */

'use client'

import React, { memo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  TrendingUp,
  TrendingDown,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { RealTimePrice } from '@/components/watchlist/RealTimePrice'
import {
  usePortfolioStore,
  useSortedHoldings,
  type PortfolioHolding,
} from '@/lib/stores/portfolio-store'
import Link from 'next/link'

// ============================================================
// TYPES
// ============================================================

type SortField = 'symbol' | 'value' | 'gainLoss' | 'gainLossPercent' | 'dayGainLoss'

interface ColumnHeader {
  field: SortField
  label: string
  align?: 'left' | 'right'
  className?: string
}

// ============================================================
// TABLE HEADERS
// ============================================================

const columns: ColumnHeader[] = [
  { field: 'symbol', label: 'Symbol', align: 'left' },
  { field: 'value', label: 'Market Value', align: 'right' },
  { field: 'gainLoss', label: 'Total P&L', align: 'right' },
  { field: 'gainLossPercent', label: 'Return %', align: 'right' },
  { field: 'dayGainLoss', label: 'Day Change', align: 'right' },
]

// ============================================================
// HOLDING ROW
// ============================================================

interface HoldingRowProps {
  holding: PortfolioHolding
  onEdit: (id: string) => void
  onDelete: (id: string) => void
}

const HoldingRow = memo(function HoldingRow({
  holding,
  onEdit,
  onDelete,
}: HoldingRowProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    const formatted = Math.abs(value).toFixed(2)
    return value >= 0 ? `+${formatted}%` : `-${formatted}%`
  }

  return (
    <>
      <motion.tr
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 20 }}
        className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
      >
        {/* Symbol & Name */}
        <td className="py-3 px-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">{holding.symbol.slice(0, 2)}</span>
            </div>
            <div className="min-w-0">
              <Link
                href={`/dashboard/stock-analysis?symbol=${holding.symbol}`}
                className="font-semibold text-white hover:text-cyan-400 transition-colors flex items-center gap-1 group"
              >
                {holding.symbol}
                <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
              <p className="text-xs text-white/40 truncate max-w-[150px]">{holding.name}</p>
            </div>
          </div>
        </td>

        {/* Shares & Price */}
        <td className="py-3 px-4 hidden sm:table-cell">
          <div className="text-right">
            <div className="text-sm text-white font-medium">{holding.quantity.toFixed(2)} shares</div>
            <div className="text-xs text-white/40">@ {formatCurrency(holding.avgBuyPrice)}</div>
          </div>
        </td>

        {/* Current Price */}
        <td className="py-3 px-4">
          <div className="flex justify-end">
            <RealTimePrice
              price={holding.currentPrice}
              previousPrice={holding.previousClose}
              change={holding.change}
              changePercent={holding.changePercent}
              showChange={false}
              showPercent={false}
              size="sm"
            />
          </div>
        </td>

        {/* Market Value */}
        <td className="py-3 px-4">
          <div className="text-right font-mono tabular-nums">
            <div className="text-sm text-white font-medium">
              {formatCurrency(holding.totalValue)}
            </div>
            <div className="text-xs text-white/40">
              Cost: {formatCurrency(holding.totalCost)}
            </div>
          </div>
        </td>

        {/* Total P&L */}
        <td className="py-3 px-4">
          <div className={cn(
            'text-right font-mono tabular-nums',
            holding.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'
          )}>
            <div className="text-sm font-medium flex items-center justify-end gap-1">
              {holding.gainLoss >= 0 ? (
                <TrendingUp className="w-3.5 h-3.5" />
              ) : (
                <TrendingDown className="w-3.5 h-3.5" />
              )}
              {formatCurrency(Math.abs(holding.gainLoss))}
            </div>
            <div className="text-xs opacity-75">
              {formatPercent(holding.gainLossPercent)}
            </div>
          </div>
        </td>

        {/* Day Change */}
        <td className="py-3 px-4 hidden md:table-cell">
          <div className={cn(
            'text-right font-mono tabular-nums',
            holding.dayGainLoss >= 0 ? 'text-green-400' : 'text-red-400'
          )}>
            <div className="text-sm font-medium">
              {holding.dayGainLoss >= 0 ? '+' : ''}{formatCurrency(holding.dayGainLoss)}
            </div>
            <div className="text-xs opacity-75">
              {formatPercent(holding.dayGainLossPercent)}
            </div>
          </div>
        </td>

        {/* Actions */}
        <td className="py-3 px-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-white/40 hover:text-white hover:bg-white/10"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40 bg-[#0f1419] border-white/10">
              <DropdownMenuItem
                onClick={() => onEdit(holding.id)}
                className="text-white/70 hover:text-white focus:text-white"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={() => setShowDeleteConfirm(true)}
                className="text-red-400 hover:text-red-300 focus:text-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </motion.tr>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="bg-[#0f1419] border-white/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete Holding</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              Are you sure you want to remove <span className="font-semibold text-white">{holding.symbol}</span> from your portfolio? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-white/5 border-white/10 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete(holding.id)
                setShowDeleteConfirm(false)
              }}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
})

// ============================================================
// PORTFOLIO TABLE COMPONENT
// ============================================================

export const PortfolioTable = memo(function PortfolioTable() {
  const holdings = useSortedHoldings()
  const settings = usePortfolioStore((state) => state.settings)
  const updateSettings = usePortfolioStore((state) => state.updateSettings)
  const openEditModal = usePortfolioStore((state) => state.openEditModal)
  const deleteHolding = usePortfolioStore((state) => state.deleteHolding)
  const isLoading = usePortfolioStore((state) => state.isLoading)

  const handleSort = (field: SortField) => {
    if (settings.sortBy === field) {
      updateSettings({ sortDirection: settings.sortDirection === 'asc' ? 'desc' : 'asc' })
    } else {
      updateSettings({ sortBy: field, sortDirection: 'desc' })
    }
  }

  const SortIcon = ({ field }: { field: SortField }) => {
    if (settings.sortBy !== field) {
      return <ArrowUpDown className="w-3.5 h-3.5 opacity-30" />
    }
    return settings.sortDirection === 'asc' ? (
      <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
    ) : (
      <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
    )
  }

  if (holdings.length === 0 && !isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
          <TrendingUp className="w-8 h-8 text-white/20" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No Holdings Yet</h3>
        <p className="text-sm text-white/50 max-w-xs">
          Start building your portfolio by adding your first stock holding.
        </p>
      </motion.div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-white/10">
            <th className="py-3 px-4 text-left">
              <button
                onClick={() => handleSort('symbol')}
                className="flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white transition-colors"
              >
                Asset
                <SortIcon field="symbol" />
              </button>
            </th>
            <th className="py-3 px-4 text-right hidden sm:table-cell">
              <span className="text-xs font-medium text-white/50">Shares</span>
            </th>
            <th className="py-3 px-4 text-right">
              <span className="text-xs font-medium text-white/50">Price</span>
            </th>
            <th className="py-3 px-4 text-right">
              <button
                onClick={() => handleSort('value')}
                className="flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white transition-colors ml-auto"
              >
                Value
                <SortIcon field="value" />
              </button>
            </th>
            <th className="py-3 px-4 text-right">
              <button
                onClick={() => handleSort('gainLoss')}
                className="flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white transition-colors ml-auto"
              >
                P&L
                <SortIcon field="gainLoss" />
              </button>
            </th>
            <th className="py-3 px-4 text-right hidden md:table-cell">
              <button
                onClick={() => handleSort('dayGainLoss')}
                className="flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white transition-colors ml-auto"
              >
                Day
                <SortIcon field="dayGainLoss" />
              </button>
            </th>
            <th className="py-3 px-4 w-10"></th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence mode="popLayout">
            {holdings.map((holding) => (
              <HoldingRow
                key={holding.id}
                holding={holding}
                onEdit={openEditModal}
                onDelete={deleteHolding}
              />
            ))}
          </AnimatePresence>
        </tbody>
      </table>
    </div>
  )
})

export default PortfolioTable
