/**
 * ExplainerPopover Component
 * 
 * Info icon with popover that shows AI-powered metric explanations
 */

'use client'

import { useState } from 'react'
import { Info, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { explainMetric, getQuickExplanation } from '@/lib/ai/metric-explainer'
import type { MetricExplanation } from '@/lib/ai/metric-explainer'
import type { StockContext } from '@/lib/ai/context-builder'

interface ExplainerPopoverProps {
  metricName: string
  metricKey: string
  currentValue?: number | null
  stock?: StockContext
  className?: string
  iconSize?: 'sm' | 'md' | 'lg'
  showQuickTip?: boolean
}

export function ExplainerPopover({
  metricName,
  metricKey,
  currentValue,
  stock,
  className,
  iconSize = 'sm',
  showQuickTip = true,
}: ExplainerPopoverProps) {
  const [explanation, setExplanation] = useState<MetricExplanation | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isOpen, setIsOpen] = useState(false)

  const quickTip = getQuickExplanation(metricKey)

  const loadExplanation = async () => {
    if (explanation) return // Already loaded
    
    setIsLoading(true)
    setError(null)
    
    try {
      const result = await explainMetric(metricName, {
        currentValue,
        stock,
        useCache: true,
      })
      setExplanation(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load explanation')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (open && !explanation && !isLoading) {
      loadExplanation()
    }
  }

  const iconSizeClass = {
    sm: 'h-3.5 w-3.5',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  }[iconSize]

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'h-auto w-auto p-0.5 text-muted-foreground hover:text-foreground',
            className
          )}
        >
          <Info className={iconSizeClass} />
        </Button>
      </PopoverTrigger>
      
      <PopoverContent className="w-96" align="start">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            <span className="ml-2 text-sm text-muted-foreground">Loading explanation...</span>
          </div>
        ) : error ? (
          <div className="py-4">
            <p className="text-sm text-red-500 mb-2">{error}</p>
            {showQuickTip && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-sm text-muted-foreground">{quickTip}</p>
              </div>
            )}
          </div>
        ) : explanation ? (
          <div className="space-y-4">
            {/* Header */}
            <div>
              <h4 className="font-semibold text-base mb-1">{explanation.metricName}</h4>
              {currentValue !== undefined && currentValue !== null && (
                <p className="text-2xl font-bold text-primary">{currentValue}</p>
              )}
            </div>

            {/* Definition */}
            <div>
              <h5 className="text-xs font-medium text-muted-foreground uppercase mb-1">
                What it is
              </h5>
              <p className="text-sm leading-relaxed">{explanation.definition}</p>
            </div>

            {/* Calculation */}
            {explanation.calculation && (
              <div>
                <h5 className="text-xs font-medium text-muted-foreground uppercase mb-1">
                  How it's calculated
                </h5>
                <p className="text-sm leading-relaxed">{explanation.calculation}</p>
              </div>
            )}

            {/* Why it matters */}
            <div className="bg-blue-500/10 rounded-lg p-3">
              <h5 className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase mb-1">
                Why it matters
              </h5>
              <p className="text-sm leading-relaxed">{explanation.whyItMatters}</p>
            </div>

            {/* Good range */}
            {explanation.goodRange && (
              <div className="bg-green-500/10 rounded-lg p-3">
                <h5 className="text-xs font-medium text-green-600 dark:text-green-400 uppercase mb-1">
                  Good range
                </h5>
                <p className="text-sm leading-relaxed">{explanation.goodRange}</p>
              </div>
            )}

            {/* Interpretation */}
            <div>
              <h5 className="text-xs font-medium text-muted-foreground uppercase mb-1">
                How to read it
              </h5>
              <p className="text-sm leading-relaxed">{explanation.interpretation}</p>
            </div>

            {/* Example */}
            <div className="bg-purple-500/10 rounded-lg p-3">
              <h5 className="text-xs font-medium text-purple-600 dark:text-purple-400 uppercase mb-1">
                Example
              </h5>
              <p className="text-sm leading-relaxed">{explanation.example}</p>
            </div>

            {/* Limitations */}
            <div className="bg-amber-500/10 rounded-lg p-3">
              <h5 className="text-xs font-medium text-amber-600 dark:text-amber-400 uppercase mb-1">
                Limitations
              </h5>
              <p className="text-sm leading-relaxed">{explanation.limitations}</p>
            </div>

            {/* Footer */}
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground text-center">
                AI-generated explanation • Not financial advice
              </p>
            </div>
          </div>
        ) : showQuickTip ? (
          <div className="py-2">
            <p className="text-sm">{quickTip}</p>
            <Button
              variant="link"
              size="sm"
              className="mt-2 p-0 h-auto"
              onClick={loadExplanation}
            >
              Load detailed explanation
            </Button>
          </div>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

// Inline version for use inside tables/cards
export function InlineExplainer({
  metricName,
  metricKey,
  currentValue,
  stock,
}: Omit<ExplainerPopoverProps, 'className' | 'iconSize' | 'showQuickTip'>) {
  return (
    <ExplainerPopover
      metricName={metricName}
      metricKey={metricKey}
      currentValue={currentValue}
      stock={stock}
      iconSize="sm"
      showQuickTip={true}
      className="ml-1"
    />
  )
}
