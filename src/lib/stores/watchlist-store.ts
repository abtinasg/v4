/**
 * Watchlist Store - Zustand state management
 * 
 * Features:
 * - Multiple watchlists
 * - Real-time price updates
 * - Price alerts
 * - Sorting and filtering
 * - CSV import/export
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ============================================================
// TYPES
// ============================================================

export type ViewMode = 'table' | 'card' | 'compact'
export type SortField = 'symbol' | 'name' | 'price' | 'change' | 'changePercent' | 'volume' | 'custom'
export type SortDirection = 'asc' | 'desc'
export type AlertCondition = 'above' | 'below' | 'crosses_above' | 'crosses_below' | 'percent_change' | 'volume_spike'
export type AlertDelivery = 'in_app' | 'email' | 'push'

export interface WatchlistStock {
  id: string
  symbol: string
  name: string
  order: number
  notes?: string
  addedAt: Date
}

export interface StockQuote {
  symbol: string
  name: string
  price: number
  previousClose: number
  change: number
  changePercent: number
  volume: number
  high: number
  low: number
  open: number
  marketCap?: number
  pe?: number
  sparklineData?: number[]
  lastUpdated: Date
}

export interface PriceAlert {
  id: string
  symbol: string
  condition: AlertCondition
  targetValue: number
  currentValue?: number
  isActive: boolean
  delivery: AlertDelivery[]
  createdAt: Date
  triggeredAt?: Date
  message?: string
}

export interface Watchlist {
  id: string
  name: string
  description?: string
  isDefault: boolean
  stocks: WatchlistStock[]
  createdAt: Date
  updatedAt: Date
  shareId?: string
}

export interface WatchlistSettings {
  viewMode: ViewMode
  sortField: SortField
  sortDirection: SortDirection
  showSparklines: boolean
  enableSoundNotifications: boolean
  enableBrowserNotifications: boolean
  refreshInterval: number // in seconds
  customColumns: string[]
}

export interface WatchlistState {
  // Data
  watchlists: Watchlist[]
  quotes: Record<string, StockQuote>
  alerts: PriceAlert[]
  activeWatchlistId: string | null
  
  // UI State
  settings: WatchlistSettings
  isLoading: boolean
  isRefreshing: boolean
  lastRefresh: Date | null
  error: string | null
  
  // Selected items (for bulk operations)
  selectedStocks: string[]
  
  // Actions - Watchlists
  createWatchlist: (name: string, description?: string) => Watchlist
  updateWatchlist: (id: string, updates: Partial<Omit<Watchlist, 'id' | 'stocks'>>) => void
  deleteWatchlist: (id: string) => void
  setActiveWatchlist: (id: string | null) => void
  duplicateWatchlist: (id: string) => Watchlist
  
  // Actions - Stocks
  addStock: (watchlistId: string, symbol: string, name: string) => void
  removeStock: (watchlistId: string, stockId: string) => void
  reorderStocks: (watchlistId: string, stocks: WatchlistStock[]) => void
  updateStockNotes: (watchlistId: string, stockId: string, notes: string) => void
  
  // Actions - Quotes
  updateQuotes: (quotes: StockQuote[]) => void
  updateQuote: (symbol: string, quote: Partial<StockQuote>) => void
  
  // Actions - Alerts
  createAlert: (alert: Omit<PriceAlert, 'id' | 'createdAt' | 'isActive'>) => PriceAlert
  updateAlert: (id: string, updates: Partial<PriceAlert>) => void
  deleteAlert: (id: string) => void
  triggerAlert: (id: string) => void
  
  // Actions - Settings
  updateSettings: (settings: Partial<WatchlistSettings>) => void
  
  // Actions - Selection
  selectStock: (stockId: string) => void
  deselectStock: (stockId: string) => void
  selectAllStocks: (watchlistId: string) => void
  clearSelection: () => void
  
  // Actions - Import/Export
  importFromCSV: (watchlistId: string, csvData: string) => { success: number; failed: string[] }
  exportToCSV: (watchlistId: string) => string
  
  // Actions - Share
  generateShareLink: (watchlistId: string) => string
  
  // Actions - State
  setLoading: (loading: boolean) => void
  setRefreshing: (refreshing: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

// ============================================================
// HELPERS
// ============================================================

function generateId(): string {
  return `wl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function generateStockId(): string {
  return `stk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

function generateAlertId(): string {
  return `alt_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
}

// ============================================================
// INITIAL STATE
// ============================================================

const defaultSettings: WatchlistSettings = {
  viewMode: 'table',
  sortField: 'custom',
  sortDirection: 'asc',
  showSparklines: true,
  enableSoundNotifications: false,
  enableBrowserNotifications: false,
  refreshInterval: 5,
  customColumns: ['price', 'change', 'changePercent', 'volume'],
}

const defaultWatchlist: Watchlist = {
  id: 'default',
  name: 'My Watchlist',
  isDefault: true,
  stocks: [],
  createdAt: new Date(),
  updatedAt: new Date(),
}

const initialState = {
  watchlists: [defaultWatchlist],
  quotes: {},
  alerts: [],
  activeWatchlistId: 'default',
  settings: defaultSettings,
  isLoading: false,
  isRefreshing: false,
  lastRefresh: null,
  error: null,
  selectedStocks: [],
}

// ============================================================
// STORE
// ============================================================

export const useWatchlistStore = create<WatchlistState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Watchlist Actions
      createWatchlist: (name, description) => {
        const newWatchlist: Watchlist = {
          id: generateId(),
          name,
          description,
          isDefault: false,
          stocks: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        }
        
        set((state) => ({
          watchlists: [...state.watchlists, newWatchlist],
        }))
        
        return newWatchlist
      },

      updateWatchlist: (id, updates) => {
        set((state) => ({
          watchlists: state.watchlists.map((wl) =>
            wl.id === id
              ? { ...wl, ...updates, updatedAt: new Date() }
              : wl
          ),
        }))
      },

      deleteWatchlist: (id) => {
        const { watchlists, activeWatchlistId } = get()
        
        // Don't delete if it's the only watchlist
        if (watchlists.length <= 1) return
        
        // Find default watchlist for fallback
        const defaultWl = watchlists.find((wl) => wl.isDefault && wl.id !== id)
        const firstOther = watchlists.find((wl) => wl.id !== id)
        const fallbackId = defaultWl?.id || firstOther?.id || null
        
        set((state) => ({
          watchlists: state.watchlists.filter((wl) => wl.id !== id),
          activeWatchlistId: activeWatchlistId === id ? fallbackId : activeWatchlistId,
        }))
      },

      setActiveWatchlist: (id) => {
        set({ activeWatchlistId: id })
      },

      duplicateWatchlist: (id) => {
        const { watchlists } = get()
        const original = watchlists.find((wl) => wl.id === id)
        
        if (!original) throw new Error('Watchlist not found')
        
        const duplicate: Watchlist = {
          ...original,
          id: generateId(),
          name: `${original.name} (Copy)`,
          isDefault: false,
          stocks: original.stocks.map((s) => ({
            ...s,
            id: generateStockId(),
          })),
          createdAt: new Date(),
          updatedAt: new Date(),
          shareId: undefined,
        }
        
        set((state) => ({
          watchlists: [...state.watchlists, duplicate],
        }))
        
        return duplicate
      },

      // Stock Actions
      addStock: (watchlistId, symbol, name) => {
        const upperSymbol = symbol.toUpperCase()
        
        set((state) => ({
          watchlists: state.watchlists.map((wl) => {
            if (wl.id !== watchlistId) return wl
            
            // Check if already exists
            if (wl.stocks.some((s) => s.symbol === upperSymbol)) {
              return wl
            }
            
            const newStock: WatchlistStock = {
              id: generateStockId(),
              symbol: upperSymbol,
              name,
              order: wl.stocks.length,
              addedAt: new Date(),
            }
            
            return {
              ...wl,
              stocks: [...wl.stocks, newStock],
              updatedAt: new Date(),
            }
          }),
        }))
      },

      removeStock: (watchlistId, stockId) => {
        set((state) => ({
          watchlists: state.watchlists.map((wl) => {
            if (wl.id !== watchlistId) return wl
            
            return {
              ...wl,
              stocks: wl.stocks.filter((s) => s.id !== stockId),
              updatedAt: new Date(),
            }
          }),
          selectedStocks: state.selectedStocks.filter((id) => id !== stockId),
        }))
      },

      reorderStocks: (watchlistId, stocks) => {
        set((state) => ({
          watchlists: state.watchlists.map((wl) => {
            if (wl.id !== watchlistId) return wl
            
            return {
              ...wl,
              stocks: stocks.map((s, i) => ({ ...s, order: i })),
              updatedAt: new Date(),
            }
          }),
        }))
      },

      updateStockNotes: (watchlistId, stockId, notes) => {
        set((state) => ({
          watchlists: state.watchlists.map((wl) => {
            if (wl.id !== watchlistId) return wl
            
            return {
              ...wl,
              stocks: wl.stocks.map((s) =>
                s.id === stockId ? { ...s, notes } : s
              ),
              updatedAt: new Date(),
            }
          }),
        }))
      },

      // Quote Actions
      updateQuotes: (quotes) => {
        set((state) => {
          const newQuotes = { ...state.quotes }
          for (const quote of quotes) {
            newQuotes[quote.symbol] = {
              ...newQuotes[quote.symbol],
              ...quote,
              lastUpdated: new Date(),
            }
          }
          return { quotes: newQuotes, lastRefresh: new Date() }
        })
      },

      updateQuote: (symbol, quote) => {
        set((state) => ({
          quotes: {
            ...state.quotes,
            [symbol]: {
              ...state.quotes[symbol],
              ...quote,
              lastUpdated: new Date(),
            },
          },
        }))
      },

      // Alert Actions
      createAlert: (alertData) => {
        const newAlert: PriceAlert = {
          ...alertData,
          id: generateAlertId(),
          isActive: true,
          createdAt: new Date(),
        }
        
        set((state) => ({
          alerts: [...state.alerts, newAlert],
        }))
        
        return newAlert
      },

      updateAlert: (id, updates) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id ? { ...a, ...updates } : a
          ),
        }))
      },

      deleteAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.filter((a) => a.id !== id),
        }))
      },

      triggerAlert: (id) => {
        set((state) => ({
          alerts: state.alerts.map((a) =>
            a.id === id
              ? { ...a, isActive: false, triggeredAt: new Date() }
              : a
          ),
        }))
      },

      // Settings Actions
      updateSettings: (settings) => {
        set((state) => ({
          settings: { ...state.settings, ...settings },
        }))
      },

      // Selection Actions
      selectStock: (stockId) => {
        set((state) => ({
          selectedStocks: state.selectedStocks.includes(stockId)
            ? state.selectedStocks
            : [...state.selectedStocks, stockId],
        }))
      },

      deselectStock: (stockId) => {
        set((state) => ({
          selectedStocks: state.selectedStocks.filter((id) => id !== stockId),
        }))
      },

      selectAllStocks: (watchlistId) => {
        const { watchlists } = get()
        const watchlist = watchlists.find((wl) => wl.id === watchlistId)
        
        if (watchlist) {
          set({ selectedStocks: watchlist.stocks.map((s) => s.id) })
        }
      },

      clearSelection: () => {
        set({ selectedStocks: [] })
      },

      // Import/Export Actions
      importFromCSV: (watchlistId, csvData) => {
        const lines = csvData.trim().split('\n')
        const results = { success: 0, failed: [] as string[] }
        
        // Skip header row if present
        const startIndex = lines[0].toLowerCase().includes('symbol') ? 1 : 0
        
        for (let i = startIndex; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue
          
          const [symbol, name = ''] = line.split(',').map((s) => s.trim().replace(/"/g, ''))
          
          if (symbol && /^[A-Za-z]{1,5}$/.test(symbol)) {
            get().addStock(watchlistId, symbol, name || symbol)
            results.success++
          } else {
            results.failed.push(line)
          }
        }
        
        return results
      },

      exportToCSV: (watchlistId) => {
        const { watchlists, quotes } = get()
        const watchlist = watchlists.find((wl) => wl.id === watchlistId)
        
        if (!watchlist) return ''
        
        const headers = ['Symbol', 'Name', 'Price', 'Change', 'Change %', 'Volume', 'Notes']
        const rows = watchlist.stocks.map((stock) => {
          const quote = quotes[stock.symbol]
          return [
            stock.symbol,
            stock.name,
            quote?.price?.toFixed(2) || '',
            quote?.change?.toFixed(2) || '',
            quote?.changePercent?.toFixed(2) || '',
            quote?.volume?.toString() || '',
            stock.notes || '',
          ].map((v) => `"${v}"`).join(',')
        })
        
        return [headers.join(','), ...rows].join('\n')
      },

      // Share Actions
      generateShareLink: (watchlistId) => {
        const shareId = `share_${Math.random().toString(36).substring(2, 15)}`
        
        set((state) => ({
          watchlists: state.watchlists.map((wl) =>
            wl.id === watchlistId ? { ...wl, shareId } : wl
          ),
        }))
        
        // Return shareable URL
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        return `${baseUrl}/watchlist/shared/${shareId}`
      },

      // State Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setRefreshing: (refreshing) => set({ isRefreshing: refreshing }),
      setError: (error) => set({ error }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'deepin-watchlist',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        watchlists: state.watchlists,
        alerts: state.alerts.filter((a) => a.isActive),
        activeWatchlistId: state.activeWatchlistId,
        settings: state.settings,
      }),
      onRehydrateStorage: () => (state) => {
        // Rehydrate dates
        if (state?.watchlists) {
          state.watchlists = state.watchlists.map((wl) => ({
            ...wl,
            createdAt: new Date(wl.createdAt),
            updatedAt: new Date(wl.updatedAt),
            stocks: wl.stocks.map((s) => ({
              ...s,
              addedAt: new Date(s.addedAt),
            })),
          }))
        }
        if (state?.alerts) {
          state.alerts = state.alerts.map((a) => ({
            ...a,
            createdAt: new Date(a.createdAt),
            triggeredAt: a.triggeredAt ? new Date(a.triggeredAt) : undefined,
          }))
        }
      },
    }
  )
)

// ============================================================
// SELECTORS
// ============================================================

export const selectActiveWatchlist = (state: WatchlistState) =>
  state.watchlists.find((wl) => wl.id === state.activeWatchlistId)

export const selectWatchlistSymbols = (state: WatchlistState) => {
  const active = selectActiveWatchlist(state)
  return active?.stocks.map((s) => s.symbol) || []
}

export const selectStockWithQuote = (state: WatchlistState, stockId: string) => {
  for (const wl of state.watchlists) {
    const stock = wl.stocks.find((s) => s.id === stockId)
    if (stock) {
      return {
        ...stock,
        quote: state.quotes[stock.symbol],
      }
    }
  }
  return null
}

export const selectActiveAlerts = (state: WatchlistState) =>
  state.alerts.filter((a) => a.isActive)

export const selectAlertsBySymbol = (state: WatchlistState, symbol: string) =>
  state.alerts.filter((a) => a.symbol === symbol && a.isActive)

// ============================================================
// HOOKS
// ============================================================

/**
 * Get sorted stocks for the active watchlist
 */
export function useSortedStocks() {
  const activeWatchlist = useWatchlistStore(selectActiveWatchlist)
  const quotes = useWatchlistStore((s) => s.quotes)
  const { sortField, sortDirection } = useWatchlistStore((s) => s.settings)
  
  if (!activeWatchlist) return []
  
  const stocks = activeWatchlist.stocks.map((stock) => ({
    ...stock,
    quote: quotes[stock.symbol],
  }))
  
  if (sortField === 'custom') {
    return stocks.sort((a, b) => a.order - b.order)
  }
  
  return stocks.sort((a, b) => {
    let aVal: number | string = 0
    let bVal: number | string = 0
    
    switch (sortField) {
      case 'symbol':
        aVal = a.symbol
        bVal = b.symbol
        break
      case 'name':
        aVal = a.name
        bVal = b.name
        break
      case 'price':
        aVal = a.quote?.price || 0
        bVal = b.quote?.price || 0
        break
      case 'change':
        aVal = a.quote?.change || 0
        bVal = b.quote?.change || 0
        break
      case 'changePercent':
        aVal = a.quote?.changePercent || 0
        bVal = b.quote?.changePercent || 0
        break
      case 'volume':
        aVal = a.quote?.volume || 0
        bVal = b.quote?.volume || 0
        break
    }
    
    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return sortDirection === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal)
    }
    
    return sortDirection === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number)
  })
}
