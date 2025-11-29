/**
 * Edit Holding Modal Component
 * 
 * Modal for editing existing holdings
 * - Update quantity
 * - Update average buy price
 */

'use client'

import React, { useState, useEffect, memo } from 'react'
import { motion } from 'framer-motion'
import {
  Loader2,
  Check,
  DollarSign,
  Hash,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { usePortfolioStore } from '@/lib/stores/portfolio-store'

// ============================================================
// COMPONENT
// ============================================================

export const EditHoldingModal = memo(function EditHoldingModal() {
  const isOpen = usePortfolioStore((state) => state.isEditModalOpen)
  const editingHoldingId = usePortfolioStore((state) => state.editingHoldingId)
  const holdings = usePortfolioStore((state) => state.holdings)
  const closeModal = usePortfolioStore((state) => state.closeEditModal)
  const updateHolding = usePortfolioStore((state) => state.updateHolding)
  const isLoading = usePortfolioStore((state) => state.isLoading)

  // Prevent hydration mismatch
  const [isMounted, setIsMounted] = useState(false)

  // Find the holding being edited
  const holding = holdings.find((h) => h.id === editingHoldingId)

  // Form state
  const [quantity, setQuantity] = useState('')
  const [avgPrice, setAvgPrice] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Set mounted on client
  useEffect(() => {
    setIsMounted(true)
  }, [])

  // Initialize form when holding changes
  useEffect(() => {
    if (holding) {
      setQuantity(holding.quantity.toString())
      setAvgPrice(holding.avgBuyPrice.toString())
      setError(null)
    }
  }, [holding])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setQuantity('')
      setAvgPrice('')
      setError(null)
    }
  }, [isOpen])

  // Submit changes
  const handleSubmit = async () => {
    if (!editingHoldingId) return

    const qty = parseFloat(quantity)
    const price = parseFloat(avgPrice)

    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid quantity')
      return
    }

    if (isNaN(price) || price <= 0) {
      setError('Please enter a valid price')
      return
    }

    setError(null)

    const success = await updateHolding(editingHoldingId, qty, price)
    if (success) {
      closeModal()
    }
  }

  // Calculate preview values
  const previewTotal = () => {
    const qty = parseFloat(quantity) || 0
    const price = parseFloat(avgPrice) || 0
    return qty * price
  }

  // Prevent hydration mismatch
  if (!isMounted || !holding) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-md bg-[#0a0d12] border-white/10">
        <DialogHeader>
          <DialogTitle className="text-white">
            Edit {holding.symbol}
          </DialogTitle>
          <DialogDescription className="text-white/50">
            Update the quantity and average buy price
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          {/* Stock Info */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-white/5">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-white">
                {holding.symbol.slice(0, 2)}
              </span>
            </div>
            <div>
              <div className="font-semibold text-white">{holding.symbol}</div>
              <div className="text-xs text-white/50">{holding.name}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-sm font-medium text-white font-mono">
                ${holding.currentPrice.toFixed(2)}
              </div>
              <div className={cn(
                'text-xs font-mono',
                holding.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
              )}>
                {holding.changePercent >= 0 ? '+' : ''}{holding.changePercent.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Quantity Input */}
          <div className="space-y-2">
            <Label className="text-white/70">Number of Shares</Label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                type="number"
                value={quantity}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuantity(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 font-mono"
              />
            </div>
          </div>

          {/* Average Price Input */}
          <div className="space-y-2">
            <Label className="text-white/70">Average Buy Price</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
              <Input
                type="number"
                value={avgPrice}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAvgPrice(e.target.value)}
                placeholder="0.00"
                step="0.01"
                min="0"
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30 font-mono"
              />
            </div>
          </div>

          {/* Total Preview */}
          {previewTotal() > 0 && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
              <span className="text-sm text-white/70">Total Cost Basis</span>
              <span className="font-semibold text-white font-mono">
                ${previewTotal().toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          )}

          {/* Current Value */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
            <span className="text-sm text-white/70">Current Value</span>
            <span className="font-semibold text-white font-mono">
              ${((parseFloat(quantity) || 0) * holding.currentPrice).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Error */}
          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}
        </motion.div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="ghost"
            onClick={closeModal}
            className="text-white/50 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !quantity || !avgPrice}
            className="bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-400 hover:to-violet-400 text-white"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
})

export default EditHoldingModal
