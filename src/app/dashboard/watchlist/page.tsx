/**
 * Watchlist Page - Premium Fintech Design
 *
 * Comprehensive watchlist management with premium UI inspired by
 * Robinhood, Public.com, Finary, and Koyfin
 * 
 * Design System:
 * - Glass morphism with subtle backdrop blur
 * - 16px border radius on cards
 * - Gradient shadows and soft glows
 * - 25-35% more negative space
 * - Clean typography hierarchy
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus,
  LayoutGrid,
  List,
  Download,
  Upload,
  Bell,
  RefreshCw,
  FolderPlus,
  Trash2,
  Edit2,
  MoreHorizontal,
  Star,
  Sparkles,
  TrendingUp,
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { useWatchlistStore } from '@/lib/stores/watchlist-store'
import {
  WatchlistTable,
  WatchlistCardGrid,
  AddStockModal,
  PriceAlertModal,
} from '@/components/watchlist'

// ============================================================
// PREMIUM STAT CARD
// ============================================================

interface StatCardProps {
  label: string
  value: string | number
  subValue?: string
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
}

function StatCard({ label, value, subValue, trend, icon }: StatCardProps) {
  return (
    <div className="relative group p-4 sm:p-6 rounded-2xl bg-white/[0.03] border border-white/[0.06] hover:border-white/[0.12] transition-all duration-300">
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs sm:text-sm font-medium text-white/40 mb-1 sm:mb-2">{label}</p>
          <p className={cn(
            'text-xl sm:text-2xl font-semibold tracking-tight',
            trend === 'up' && 'text-emerald-400',
            trend === 'down' && 'text-red-400',
            (!trend || trend === 'neutral') && 'text-white'
          )}>
            {value}
          </p>
          {subValue && (
            <p className="text-xs sm:text-sm text-white/40 mt-1">{subValue}</p>
          )}
        </div>
        {icon && (
          <div className="p-2 sm:p-2.5 rounded-xl bg-white/[0.04] text-white/40 hidden sm:block">
            {icon}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// PREMIUM VIEW TOGGLE
// ============================================================

interface ViewToggleProps {
  mode: 'table' | 'card'
  onChange: (mode: 'table' | 'card') => void
}

function ViewToggle({ mode, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.06]">
      <button
        onClick={() => onChange('table')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
          mode === 'table'
            ? 'bg-white/[0.08] text-white shadow-sm'
            : 'text-white/50 hover:text-white/70'
        )}
      >
        <List className="w-4 h-4" />
        <span className="hidden sm:inline">Table</span>
      </button>
      <button
        onClick={() => onChange('card')}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200',
          mode === 'card'
            ? 'bg-white/[0.08] text-white shadow-sm'
            : 'text-white/50 hover:text-white/70'
        )}
      >
        <LayoutGrid className="w-4 h-4" />
        <span className="hidden sm:inline">Cards</span>
      </button>
    </div>
  )
}

// ============================================================
// WATCHLIST PAGE
// ============================================================

export default function WatchlistPage() {
  const [addStockModalOpen, setAddStockModalOpen] = useState(false)
  const [alertModalOpen, setAlertModalOpen] = useState(false)
  const [alertSymbol, setAlertSymbol] = useState<string | undefined>()
  const [newWatchlistOpen, setNewWatchlistOpen] = useState(false)
  const [newWatchlistName, setNewWatchlistName] = useState('')
  const [editWatchlistOpen, setEditWatchlistOpen] = useState(false)
  const [editWatchlistName, setEditWatchlistName] = useState('')
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  // Store
  const watchlists = useWatchlistStore((s) => s.watchlists)
  const activeWatchlistId = useWatchlistStore((s) => s.activeWatchlistId)
  const setActiveWatchlist = useWatchlistStore((s) => s.setActiveWatchlist)
  const settings = useWatchlistStore((s) => s.settings)
  const updateSettings = useWatchlistStore((s) => s.updateSettings)
  const createWatchlist = useWatchlistStore((s) => s.createWatchlist)
  const updateWatchlist = useWatchlistStore((s) => s.updateWatchlist)
  const deleteWatchlist = useWatchlistStore((s) => s.deleteWatchlist)
  const exportToCSV = useWatchlistStore((s) => s.exportToCSV)
  const importFromCSV = useWatchlistStore((s) => s.importFromCSV)
  const isRefreshing = useWatchlistStore((s) => s.isRefreshing)
  const setRefreshing = useWatchlistStore((s) => s.setRefreshing)
  const updateQuotes = useWatchlistStore((s) => s.updateQuotes)
  const quotes = useWatchlistStore((s) => s.quotes)

  const activeWatchlist = watchlists.find((wl) => wl.id === activeWatchlistId)

  // Calculate stats for active watchlist
  const stats = React.useMemo(() => {
    if (!activeWatchlist) return { gainers: 0, losers: 0, totalValue: 0 }
    
    let gainers = 0
    let losers = 0
    
    activeWatchlist.stocks.forEach((stock) => {
      const quote = quotes[stock.symbol]
      if (quote?.changePercent && quote.changePercent > 0) gainers++
      if (quote?.changePercent && quote.changePercent < 0) losers++
    })
    
    return { gainers, losers, total: activeWatchlist.stocks.length }
  }, [activeWatchlist, quotes])

  // Fetch quotes for active watchlist
  const fetchQuotes = useCallback(async () => {
    if (!activeWatchlist || activeWatchlist.stocks.length === 0) return

    setRefreshing(true)
    try {
      const symbols = activeWatchlist.stocks.map((s) => s.symbol).join(',')
      const response = await fetch(`/api/stocks/quote?symbols=${symbols}`)
      
      if (!response.ok) {
        console.error('API returned error:', response.status, response.statusText)
        return
      }
      
      const data = await response.json()

      if (data.quotes) {
        updateQuotes(data.quotes)
      } else {
        console.warn('No quotes data in response:', data)
      }
    } catch (error) {
      console.error('Failed to fetch quotes:', error)
    } finally {
      setRefreshing(false)
    }
  }, [activeWatchlist, setRefreshing, updateQuotes])

  // Initial fetch and polling
  useEffect(() => {
    fetchQuotes()

    // Poll for updates based on refresh interval
    const interval = setInterval(fetchQuotes, settings.refreshInterval * 1000)
    return () => clearInterval(interval)
  }, [fetchQuotes, settings.refreshInterval])

  // Handle alert modal
  const handleSetAlert = useCallback((symbol: string) => {
    setAlertSymbol(symbol)
    setAlertModalOpen(true)
  }, [])

  // Handle create watchlist
  const handleCreateWatchlist = useCallback(() => {
    if (!newWatchlistName.trim()) return
    const newWatchlist = createWatchlist(newWatchlistName.trim())
    setActiveWatchlist(newWatchlist.id)
    setNewWatchlistName('')
    setNewWatchlistOpen(false)
  }, [newWatchlistName, createWatchlist, setActiveWatchlist])

  // Handle edit watchlist
  const handleEditWatchlist = useCallback(() => {
    if (!editWatchlistName.trim() || !activeWatchlistId) return
    updateWatchlist(activeWatchlistId, { name: editWatchlistName.trim() })
    setEditWatchlistName('')
    setEditWatchlistOpen(false)
  }, [editWatchlistName, activeWatchlistId, updateWatchlist])

  // Handle delete watchlist
  const handleDeleteWatchlist = useCallback(() => {
    if (!activeWatchlistId) return
    deleteWatchlist(activeWatchlistId)
    setDeleteConfirmOpen(false)
  }, [activeWatchlistId, deleteWatchlist])

  // Handle export
  const handleExport = useCallback(() => {
    if (!activeWatchlistId) return
    const csv = exportToCSV(activeWatchlistId)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${activeWatchlist?.name || 'watchlist'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }, [activeWatchlistId, activeWatchlist?.name, exportToCSV])

  // Handle import
  const handleImport = useCallback(() => {
    if (!activeWatchlistId) return

    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.csv'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        const csv = event.target?.result as string
        const result = importFromCSV(activeWatchlistId, csv)
        alert(`Imported ${result.success} stocks. ${result.failed.length > 0 ? `Failed: ${result.failed.join(', ')}` : ''}`)
      }
      reader.readAsText(file)
    }
    input.click()
  }, [activeWatchlistId, importFromCSV])

  // Toggle view mode
  const toggleViewMode = useCallback((mode: 'table' | 'card') => {
    updateSettings({ viewMode: mode })
  }, [updateSettings])

  return (
    <div className="min-h-screen">
      {/* Premium gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0d12] via-[#080a0f] to-[#0a0d12] -z-10" />
      
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20">
                <Sparkles className="w-5 h-5 text-cyan-400" />
              </div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white tracking-tight">
                Watchlist
              </h1>
            </div>
            <p className="text-base text-white/50 max-w-lg">
              Track your favorite stocks with real-time updates and intelligent alerts
            </p>
          </div>

          {/* Actions Row */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Refresh Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={fetchQuotes}
              disabled={isRefreshing}
              className={cn(
                'h-10 px-4 rounded-xl border-white/[0.08] bg-white/[0.02]',
                'text-white/70 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.12]',
                'transition-all duration-200'
              )}
            >
              <RefreshCw className={cn('w-4 h-4 mr-2', isRefreshing && 'animate-spin')} />
              Refresh
            </Button>

            {/* View Toggle */}
            <ViewToggle
              mode={settings.viewMode as 'table' | 'card'}
              onChange={toggleViewMode}
            />

            {/* More Options */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'h-10 w-10 p-0 rounded-xl border-white/[0.08] bg-white/[0.02]',
                    'text-white/70 hover:text-white hover:bg-white/[0.06] hover:border-white/[0.12]',
                    'transition-all duration-200'
                  )}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 bg-[#0d1117]/95 backdrop-blur-xl border-white/[0.08] rounded-xl shadow-2xl p-1"
              >
                <DropdownMenuItem
                  onClick={handleExport}
                  className="px-3 py-2.5 text-white/80 hover:text-white focus:text-white focus:bg-white/[0.06] rounded-lg cursor-pointer"
                >
                  <Download className="w-4 h-4 mr-3 text-white/50" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleImport}
                  className="px-3 py-2.5 text-white/80 hover:text-white focus:text-white focus:bg-white/[0.06] rounded-lg cursor-pointer"
                >
                  <Upload className="w-4 h-4 mr-3 text-white/50" />
                  Import CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/[0.06] my-1" />
                <DropdownMenuItem
                  onClick={() => setAlertModalOpen(true)}
                  className="px-3 py-2.5 text-white/80 hover:text-white focus:text-white focus:bg-white/[0.06] rounded-lg cursor-pointer"
                >
                  <Bell className="w-4 h-4 mr-3 text-white/50" />
                  Manage Alerts
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Primary Add Button */}
            <Button
              onClick={() => setAddStockModalOpen(true)}
              className={cn(
                'h-10 px-5 rounded-xl font-medium',
                'bg-gradient-to-r from-cyan-500 to-blue-500',
                'hover:from-cyan-400 hover:to-blue-400',
                'shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30',
                'transition-all duration-300'
              )}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Stock
            </Button>
          </div>
        </div>

        {/* Stats Row */}
        {activeWatchlist && activeWatchlist.stocks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <StatCard
              label="Total Stocks"
              value={stats.total || 0}
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <StatCard
              label="Gainers Today"
              value={stats.gainers}
              trend={stats.gainers > 0 ? 'up' : 'neutral'}
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <StatCard
              label="Losers Today"
              value={stats.losers}
              trend={stats.losers > 0 ? 'down' : 'neutral'}
              icon={<TrendingUp className="w-5 h-5" />}
            />
            <StatCard
              label="Last Updated"
              value={new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              subValue="Auto-refresh on"
              icon={<RefreshCw className="w-5 h-5" />}
            />
          </motion.div>
        )}

        {/* Watchlist Selector */}
        <div className="flex items-center gap-3 overflow-x-auto py-1 -mx-1 px-1">
          {watchlists.map((watchlist) => (
            <motion.button
              key={watchlist.id}
              onClick={() => setActiveWatchlist(watchlist.id)}
              className={cn(
                'relative flex items-center gap-2.5 px-5 py-3 rounded-2xl whitespace-nowrap',
                'font-medium text-sm transition-all duration-300',
                watchlist.id === activeWatchlistId
                  ? 'bg-white/[0.08] text-white border border-white/[0.12] shadow-lg'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/[0.04] border border-transparent'
              )}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Star
                className={cn(
                  'w-4 h-4 shrink-0 transition-colors',
                  watchlist.isDefault 
                    ? 'text-amber-400 fill-amber-400' 
                    : watchlist.id === activeWatchlistId
                      ? 'text-white/50'
                      : 'text-white/30'
                )}
              />
              {watchlist.name}
              <span className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium transition-colors',
                watchlist.id === activeWatchlistId
                  ? 'bg-cyan-500/20 text-cyan-400'
                  : 'bg-white/[0.06] text-white/40'
              )}>
                {watchlist.stocks.length}
              </span>
              
              {/* Active indicator */}
              {watchlist.id === activeWatchlistId && (
                <motion.div
                  layoutId="activeWatchlist"
                  className="absolute bottom-0 left-4 right-4 h-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.button>
          ))}

          {/* New Watchlist */}
          <button
            onClick={() => setNewWatchlistOpen(true)}
            className={cn(
              'flex items-center gap-2 px-4 py-3 rounded-2xl',
              'text-sm font-medium text-white/40 hover:text-white/70',
              'hover:bg-white/[0.04] transition-all duration-200',
              'border border-dashed border-white/[0.08] hover:border-white/[0.15]'
            )}
          >
            <FolderPlus className="w-4 h-4" />
            <span className="hidden sm:inline">New List</span>
          </button>

          {/* Watchlist Options */}
          {activeWatchlist && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className={cn(
                    'p-2.5 rounded-xl text-white/40 hover:text-white/70',
                    'hover:bg-white/[0.04] transition-all duration-200'
                  )}
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="w-48 bg-[#0d1117]/95 backdrop-blur-xl border-white/[0.08] rounded-xl shadow-2xl p-1"
              >
                <DropdownMenuItem
                  onClick={() => {
                    setEditWatchlistName(activeWatchlist.name)
                    setEditWatchlistOpen(true)
                  }}
                  className="px-3 py-2.5 text-white/80 hover:text-white focus:text-white focus:bg-white/[0.06] rounded-lg cursor-pointer"
                >
                  <Edit2 className="w-4 h-4 mr-3 text-white/50" />
                  Rename
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-white/[0.06] my-1" />
                <DropdownMenuItem
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={activeWatchlist.isDefault}
                  className="px-3 py-2.5 text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/10 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Main Content Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className={cn(
            'relative rounded-2xl overflow-hidden',
            'bg-white/[0.02] border border-white/[0.06]',
            'backdrop-blur-sm'
          )}
        >
          {/* Subtle top gradient */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent" />
          
          <AnimatePresence mode="wait">
            {activeWatchlistId && activeWatchlist && activeWatchlist.stocks.length > 0 && (
              <motion.div
                key={`${activeWatchlistId}-${settings.viewMode}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {settings.viewMode === 'table' ? (
                  <WatchlistTable
                    watchlistId={activeWatchlistId}
                    onSetAlert={handleSetAlert}
                  />
                ) : (
                  <div className="p-6">
                    <WatchlistCardGrid
                      watchlistId={activeWatchlistId}
                      onSetAlert={handleSetAlert}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Empty state */}
          {activeWatchlist?.stocks.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
              <div className="p-4 rounded-2xl bg-white/[0.04] mb-6">
                <TrendingUp className="w-10 h-10 text-white/20" />
              </div>
              <h3 className="text-xl font-semibold text-white/80 mb-2">
                No stocks yet
              </h3>
              <p className="text-white/40 max-w-sm mb-8">
                Start building your watchlist by adding stocks you want to track
              </p>
              <Button
                onClick={() => setAddStockModalOpen(true)}
                className={cn(
                  'px-6 py-3 rounded-xl font-medium',
                  'bg-gradient-to-r from-cyan-500 to-blue-500',
                  'hover:from-cyan-400 hover:to-blue-400',
                  'shadow-lg shadow-cyan-500/20'
                )}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Stock
              </Button>
            </div>
          )}
        </motion.div>

        {/* Modals */}
        <AddStockModal
          open={addStockModalOpen}
          onOpenChange={setAddStockModalOpen}
          watchlistId={activeWatchlistId || undefined}
        />

        <PriceAlertModal
          open={alertModalOpen}
          onOpenChange={(open) => {
            setAlertModalOpen(open)
            if (!open) setAlertSymbol(undefined)
          }}
          symbol={alertSymbol}
        />

        {/* New Watchlist Dialog */}
        <Dialog open={newWatchlistOpen} onOpenChange={setNewWatchlistOpen}>
          <DialogContent className="sm:max-w-[420px] bg-[#0d1117]/95 backdrop-blur-xl border-white/[0.08] rounded-2xl p-0 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
            <div className="p-6">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl font-semibold text-white">Create New Watchlist</DialogTitle>
                <DialogDescription className="text-white/50 mt-1.5">
                  Give your new watchlist a memorable name
                </DialogDescription>
              </DialogHeader>
              <input
                type="text"
                value={newWatchlistName}
                onChange={(e) => setNewWatchlistName(e.target.value)}
                placeholder="e.g., Tech Giants, Growth Stocks..."
                className={cn(
                  'w-full px-4 py-3.5 rounded-xl',
                  'bg-white/[0.04] border border-white/[0.08]',
                  'text-white placeholder:text-white/30',
                  'focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/30',
                  'transition-all duration-200'
                )}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateWatchlist()
                }}
              />
            </div>
            <DialogFooter className="px-6 py-4 bg-white/[0.02] border-t border-white/[0.06]">
              <Button
                variant="outline"
                onClick={() => setNewWatchlistOpen(false)}
                className="rounded-xl border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.06]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateWatchlist}
                disabled={!newWatchlistName.trim()}
                className={cn(
                  'rounded-xl font-medium',
                  'bg-gradient-to-r from-cyan-500 to-blue-500',
                  'hover:from-cyan-400 hover:to-blue-400',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                Create Watchlist
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Watchlist Dialog */}
        <Dialog open={editWatchlistOpen} onOpenChange={setEditWatchlistOpen}>
          <DialogContent className="sm:max-w-[420px] bg-[#0d1117]/95 backdrop-blur-xl border-white/[0.08] rounded-2xl p-0 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent" />
            <div className="p-6">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl font-semibold text-white">Rename Watchlist</DialogTitle>
                <DialogDescription className="text-white/50 mt-1.5">
                  Enter a new name for this watchlist
                </DialogDescription>
              </DialogHeader>
              <input
                type="text"
                value={editWatchlistName}
                onChange={(e) => setEditWatchlistName(e.target.value)}
                placeholder="Watchlist name..."
                className={cn(
                  'w-full px-4 py-3.5 rounded-xl',
                  'bg-white/[0.04] border border-white/[0.08]',
                  'text-white placeholder:text-white/30',
                  'focus:outline-none focus:ring-2 focus:ring-cyan-500/30 focus:border-cyan-500/30',
                  'transition-all duration-200'
                )}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleEditWatchlist()
                }}
              />
            </div>
            <DialogFooter className="px-6 py-4 bg-white/[0.02] border-t border-white/[0.06]">
              <Button
                variant="outline"
                onClick={() => setEditWatchlistOpen(false)}
                className="rounded-xl border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.06]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEditWatchlist}
                disabled={!editWatchlistName.trim()}
                className={cn(
                  'rounded-xl font-medium',
                  'bg-gradient-to-r from-cyan-500 to-blue-500',
                  'hover:from-cyan-400 hover:to-blue-400',
                  'disabled:opacity-50 disabled:cursor-not-allowed'
                )}
              >
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirm Dialog */}
        <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
          <DialogContent className="sm:max-w-[420px] bg-[#0d1117]/95 backdrop-blur-xl border-white/[0.08] rounded-2xl p-0 overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
            <div className="p-6">
              <DialogHeader className="mb-6">
                <DialogTitle className="text-xl font-semibold text-white">Delete Watchlist</DialogTitle>
                <DialogDescription className="text-white/50 mt-1.5">
                  Are you sure you want to delete <span className="text-white font-medium">&quot;{activeWatchlist?.name}&quot;</span>? This action cannot be undone.
                </DialogDescription>
              </DialogHeader>
            </div>
            <DialogFooter className="px-6 py-4 bg-white/[0.02] border-t border-white/[0.06]">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirmOpen(false)}
                className="rounded-xl border-white/[0.08] text-white/70 hover:text-white hover:bg-white/[0.06]"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteWatchlist}
                className="rounded-xl font-medium bg-red-500 hover:bg-red-600 text-white"
              >
                Delete Watchlist
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Full Data Button for Mobile */}
      </div>
    </div>
  )
}
