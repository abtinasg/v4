/**
 * Watchlist Page
 * 
 * Comprehensive watchlist management with:
 * - Multiple watchlists support
 * - Table and card views
 * - Real-time price updates
 * - Price alerts
 * - CSV import/export
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
  Share2,
  Settings,
  MoreHorizontal,
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

  const activeWatchlist = watchlists.find((wl) => wl.id === activeWatchlistId)

  // Fetch quotes for active watchlist
  const fetchQuotes = useCallback(async () => {
    if (!activeWatchlist || activeWatchlist.stocks.length === 0) return

    setRefreshing(true)
    try {
      const symbols = activeWatchlist.stocks.map((s) => s.symbol).join(',')
      const response = await fetch(`/api/stocks/quote?symbols=${symbols}`)
      const data = await response.json()

      if (data.quotes) {
        updateQuotes(data.quotes)
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
  const toggleViewMode = useCallback(() => {
    updateSettings({
      viewMode: settings.viewMode === 'table' ? 'card' : 'table',
    })
  }, [settings.viewMode, updateSettings])

  return (
    <div className="min-h-screen p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">Watchlist</h1>
          <p className="text-white/50 mt-1 text-sm sm:text-base">
            Track your favorite stocks and monitor real-time changes
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2\">
          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={fetchQuotes}
            disabled={isRefreshing}
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={cn('w-4 h-4 mr-2', isRefreshing && 'animate-spin')} />
            Refresh
          </Button>

          {/* View Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={toggleViewMode}
            className="border-white/20 text-white hover:bg-white/10"
          >
            {settings.viewMode === 'table' ? (
              <>
                <LayoutGrid className="w-4 h-4 mr-2" />
                Cards
              </>
            ) : (
              <>
                <List className="w-4 h-4 mr-2" />
                Table
              </>
            )}
          </Button>

          {/* Import/Export */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-white/20 text-white hover:bg-white/10"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0a0d12] border-white/10">
              <DropdownMenuItem
                onClick={handleExport}
                className="text-white/80 hover:text-white focus:text-white"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleImport}
                className="text-white/80 hover:text-white focus:text-white"
              >
                <Upload className="w-4 h-4 mr-2" />
                Import CSV
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={() => setAlertModalOpen(true)}
                className="text-white/80 hover:text-white focus:text-white"
              >
                <Bell className="w-4 h-4 mr-2" />
                Manage Alerts
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Add Stock */}
          <Button
            onClick={() => setAddStockModalOpen(true)}
            className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Stock
          </Button>
        </div>
      </div>

      {/* Watchlist Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {watchlists.map((watchlist) => (
          <button
            key={watchlist.id}
            onClick={() => setActiveWatchlist(watchlist.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
              watchlist.id === activeWatchlistId
                ? 'bg-gradient-to-r from-cyan-500/20 to-violet-500/20 text-white border border-cyan-500/30'
                : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white border border-transparent'
            )}
          >
            {watchlist.name}
            <span className="ml-2 text-xs opacity-60">
              ({watchlist.stocks.length})
            </span>
          </button>
        ))}

        {/* New Watchlist Button */}
        <button
          onClick={() => setNewWatchlistOpen(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors flex items-center gap-2"
        >
          <FolderPlus className="w-4 h-4" />
          New
        </button>

        {/* Watchlist Options */}
        {activeWatchlist && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="px-2 py-2 rounded-lg text-white/40 hover:text-white/80 hover:bg-white/5 transition-colors">
                <Settings className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-[#0a0d12] border-white/10">
              <DropdownMenuItem
                onClick={() => {
                  setEditWatchlistName(activeWatchlist.name)
                  setEditWatchlistOpen(true)
                }}
                className="text-white/80 hover:text-white focus:text-white"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-white/80 hover:text-white focus:text-white"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem
                onClick={() => setDeleteConfirmOpen(true)}
                disabled={activeWatchlist.isDefault}
                className="text-red-400 hover:text-red-300 focus:text-red-300"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Watchlist Content */}
      <div className="rounded-xl bg-white/[0.02] border border-white/10 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeWatchlistId && (
            <motion.div
              key={`${activeWatchlistId}-${settings.viewMode}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {settings.viewMode === 'table' ? (
                <WatchlistTable
                  watchlistId={activeWatchlistId}
                  onSetAlert={handleSetAlert}
                />
              ) : (
                <div className="p-4">
                  <WatchlistCardGrid
                    watchlistId={activeWatchlistId}
                    onSetAlert={handleSetAlert}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

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
        <DialogContent className="sm:max-w-[400px] bg-[#0a0d12] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Create New Watchlist</DialogTitle>
            <DialogDescription className="text-white/50">
              Give your new watchlist a name
            </DialogDescription>
          </DialogHeader>
          <input
            type="text"
            value={newWatchlistName}
            onChange={(e) => setNewWatchlistName(e.target.value)}
            placeholder="Watchlist name..."
            className={cn(
              'w-full px-4 py-3 rounded-lg',
              'bg-white/5 border border-white/10',
              'text-white placeholder:text-white/40',
              'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50'
            )}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreateWatchlist()
            }}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setNewWatchlistOpen(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateWatchlist}
              disabled={!newWatchlistName.trim()}
              className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Watchlist Dialog */}
      <Dialog open={editWatchlistOpen} onOpenChange={setEditWatchlistOpen}>
        <DialogContent className="sm:max-w-[400px] bg-[#0a0d12] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Rename Watchlist</DialogTitle>
            <DialogDescription className="text-white/50">
              Enter a new name for this watchlist
            </DialogDescription>
          </DialogHeader>
          <input
            type="text"
            value={editWatchlistName}
            onChange={(e) => setEditWatchlistName(e.target.value)}
            placeholder="Watchlist name..."
            className={cn(
              'w-full px-4 py-3 rounded-lg',
              'bg-white/5 border border-white/10',
              'text-white placeholder:text-white/40',
              'focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50'
            )}
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleEditWatchlist()
            }}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditWatchlistOpen(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleEditWatchlist}
              disabled={!editWatchlistName.trim()}
              className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600 text-white"
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[400px] bg-[#0a0d12] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Delete Watchlist</DialogTitle>
            <DialogDescription className="text-white/50">
              Are you sure you want to delete &quot;{activeWatchlist?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteConfirmOpen(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteWatchlist}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
