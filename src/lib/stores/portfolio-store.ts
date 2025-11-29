/**
 * Portfolio Store - Zustand state management
 * 
 * Features:
 * - Portfolio holdings with real-time prices
 * - Auto-refresh with configurable interval
 * - Loading and error states
 * - Optimistic updates
 */

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

// ============================================================
// TYPES
// ============================================================

export interface PortfolioHolding {
  id: string
  symbol: string
  name: string
  quantity: number
  avgBuyPrice: number
  currentPrice: number
  previousClose: number
  change: number
  changePercent: number
  totalValue: number
  totalCost: number
  gainLoss: number
  gainLossPercent: number
  dayGainLoss: number
  dayGainLossPercent: number
  marketCap?: number
  pe?: number
  lastUpdated: Date
}

export interface PortfolioSummary {
  totalValue: number
  totalCost: number
  totalGainLoss: number
  totalGainLossPercent: number
  dayGainLoss: number
  dayGainLossPercent: number
  holdingsCount: number
}

export interface PortfolioSettings {
  refreshInterval: number // in seconds
  showDayChange: boolean
  showPercent: boolean
  sortBy: 'symbol' | 'value' | 'gainLoss' | 'gainLossPercent' | 'dayGainLoss'
  sortDirection: 'asc' | 'desc'
  viewMode: 'table' | 'card'
}

export interface PortfolioState {
  // Data
  holdings: PortfolioHolding[]
  summary: PortfolioSummary
  
  // UI State
  settings: PortfolioSettings
  isLoading: boolean
  isRefreshing: boolean
  lastRefresh: Date | null
  error: string | null
  
  // Modal states
  isAddModalOpen: boolean
  isEditModalOpen: boolean
  editingHoldingId: string | null
  
  // Actions - Data
  fetchPortfolio: () => Promise<void>
  addHolding: (symbol: string, quantity: number, avgBuyPrice: number) => Promise<boolean>
  updateHolding: (id: string, quantity?: number, avgBuyPrice?: number) => Promise<boolean>
  deleteHolding: (id: string) => Promise<boolean>
  
  // Actions - UI
  setLoading: (loading: boolean) => void
  setRefreshing: (refreshing: boolean) => void
  setError: (error: string | null) => void
  updateSettings: (settings: Partial<PortfolioSettings>) => void
  
  // Actions - Modals
  openAddModal: () => void
  closeAddModal: () => void
  openEditModal: (holdingId: string) => void
  closeEditModal: () => void
  
  // Actions - Reset
  reset: () => void
}

// ============================================================
// INITIAL STATE
// ============================================================

const defaultSettings: PortfolioSettings = {
  refreshInterval: 10, // 10 seconds
  showDayChange: true,
  showPercent: true,
  sortBy: 'value',
  sortDirection: 'desc',
  viewMode: 'table',
}

const emptySummary: PortfolioSummary = {
  totalValue: 0,
  totalCost: 0,
  totalGainLoss: 0,
  totalGainLossPercent: 0,
  dayGainLoss: 0,
  dayGainLossPercent: 0,
  holdingsCount: 0,
}

const initialState = {
  holdings: [] as PortfolioHolding[],
  summary: emptySummary,
  settings: defaultSettings,
  isLoading: false,
  isRefreshing: false,
  lastRefresh: null as Date | null,
  error: null as string | null,
  isAddModalOpen: false,
  isEditModalOpen: false,
  editingHoldingId: null as string | null,
}

// ============================================================
// STORE
// ============================================================

export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      ...initialState,

      // Fetch portfolio from API
      fetchPortfolio: async () => {
        const { isLoading } = get()
        
        // Prevent concurrent fetches
        if (isLoading) return
        
        set({ isRefreshing: true, error: null })
        
        try {
          const response = await fetch('/api/portfolio')
          
          if (!response.ok) {
            const data = await response.json().catch(() => ({}))
            throw new Error(data.error || 'Failed to fetch portfolio')
          }
          
          const data = await response.json()
          
          set({
            holdings: data.holdings || [],
            summary: data.summary || emptySummary,
            lastRefresh: new Date(),
            isRefreshing: false,
            error: null,
          })
        } catch (error) {
          set({
            isRefreshing: false,
            error: (error as Error).message || 'Failed to fetch portfolio',
          })
        }
      },

      // Add new holding
      addHolding: async (symbol, quantity, avgBuyPrice) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch('/api/portfolio', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ symbol, quantity, avgBuyPrice }),
          })
          
          if (!response.ok) {
            const data = await response.json().catch(() => ({}))
            throw new Error(data.error || 'Failed to add holding')
          }
          
          set({ isLoading: false })
          
          // Refresh portfolio to get updated data
          await get().fetchPortfolio()
          
          return true
        } catch (error) {
          set({
            isLoading: false,
            error: (error as Error).message || 'Failed to add holding',
          })
          return false
        }
      },

      // Update holding
      updateHolding: async (id, quantity, avgBuyPrice) => {
        set({ isLoading: true, error: null })
        
        try {
          const body: Record<string, number> = {}
          if (quantity !== undefined) body.quantity = quantity
          if (avgBuyPrice !== undefined) body.avgBuyPrice = avgBuyPrice
          
          const response = await fetch(`/api/portfolio/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          })
          
          if (!response.ok) {
            const data = await response.json().catch(() => ({}))
            throw new Error(data.error || 'Failed to update holding')
          }
          
          set({ isLoading: false })
          
          // Refresh portfolio
          await get().fetchPortfolio()
          
          return true
        } catch (error) {
          set({
            isLoading: false,
            error: (error as Error).message || 'Failed to update holding',
          })
          return false
        }
      },

      // Delete holding
      deleteHolding: async (id) => {
        set({ isLoading: true, error: null })
        
        try {
          const response = await fetch(`/api/portfolio/${id}`, {
            method: 'DELETE',
          })
          
          if (!response.ok) {
            const data = await response.json().catch(() => ({}))
            throw new Error(data.error || 'Failed to delete holding')
          }
          
          // Optimistically remove from state
          set((state) => ({
            holdings: state.holdings.filter((h) => h.id !== id),
            isLoading: false,
          }))
          
          // Refresh to get updated summary
          await get().fetchPortfolio()
          
          return true
        } catch (error) {
          set({
            isLoading: false,
            error: (error as Error).message || 'Failed to delete holding',
          })
          return false
        }
      },

      // UI Actions
      setLoading: (loading) => set({ isLoading: loading }),
      setRefreshing: (refreshing) => set({ isRefreshing: refreshing }),
      setError: (error) => set({ error }),
      
      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }))
      },

      // Modal Actions
      openAddModal: () => set({ isAddModalOpen: true }),
      closeAddModal: () => set({ isAddModalOpen: false }),
      
      openEditModal: (holdingId) => set({ 
        isEditModalOpen: true, 
        editingHoldingId: holdingId 
      }),
      closeEditModal: () => set({ 
        isEditModalOpen: false, 
        editingHoldingId: null 
      }),

      // Reset
      reset: () => set(initialState),
    }),
    {
      name: 'portfolio-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        settings: state.settings,
      }),
    }
  )
)

// ============================================================
// HOOKS
// ============================================================

// Hook to get sorted holdings
export function useSortedHoldings() {
  const holdings = usePortfolioStore((state) => state.holdings)
  const { sortBy, sortDirection } = usePortfolioStore((state) => state.settings)
  
  return [...holdings].sort((a, b) => {
    let comparison = 0
    
    switch (sortBy) {
      case 'symbol':
        comparison = a.symbol.localeCompare(b.symbol)
        break
      case 'value':
        comparison = a.totalValue - b.totalValue
        break
      case 'gainLoss':
        comparison = a.gainLoss - b.gainLoss
        break
      case 'gainLossPercent':
        comparison = a.gainLossPercent - b.gainLossPercent
        break
      case 'dayGainLoss':
        comparison = a.dayGainLoss - b.dayGainLoss
        break
      default:
        comparison = 0
    }
    
    return sortDirection === 'asc' ? comparison : -comparison
  })
}

// Hook to get allocation data for chart
export function useAllocationData() {
  const holdings = usePortfolioStore((state) => state.holdings)
  const summary = usePortfolioStore((state) => state.summary)
  
  if (summary.totalValue === 0) return []
  
  return holdings.map((holding) => ({
    symbol: holding.symbol,
    name: holding.name,
    value: holding.totalValue,
    percentage: (holding.totalValue / summary.totalValue) * 100,
    color: getColorForSymbol(holding.symbol),
  }))
}

// Helper to generate consistent colors for symbols
function getColorForSymbol(symbol: string): string {
  const colors = [
    '#06b6d4', // cyan
    '#8b5cf6', // violet
    '#10b981', // emerald
    '#f59e0b', // amber
    '#ef4444', // red
    '#ec4899', // pink
    '#6366f1', // indigo
    '#14b8a6', // teal
    '#f97316', // orange
    '#84cc16', // lime
  ]
  
  // Use symbol hash to get consistent color
  let hash = 0
  for (let i = 0; i < symbol.length; i++) {
    hash = ((hash << 5) - hash) + symbol.charCodeAt(i)
    hash = hash & hash
  }
  
  return colors[Math.abs(hash) % colors.length]
}
