/**
 * SummaryCard Component
 * 
 * Displays AI-generated stock summary with collapsible sections
 */

'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ChevronDown, ChevronUp, Sparkles, RefreshCw } from 'lucide-react'
import type { StockSummary } from '@/lib/ai/stock-summary'
import { cn } from '@/lib/utils'

interface SummaryCardProps {
  summary: StockSummary
  symbol: string
  onRefresh?: () => void
  isRefreshing?: boolean
  className?: string
}

export function SummaryCard({
  summary,
  symbol,
  onRefresh,
  isRefreshing = false,
  className,
}: SummaryCardProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['businessOverview']) // Expand first section by default
  )

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(section)) {
      newExpanded.delete(section)
    } else {
      newExpanded.add(section)
    }
    setExpandedSections(newExpanded)
  }

  const sections = [
    {
      key: 'businessOverview',
      title: 'Business Overview',
      content: summary.sections.businessOverview,
      icon: '🏢',
    },
    {
      key: 'recentPerformance',
      title: 'Recent Performance',
      content: summary.sections.recentPerformance,
      icon: '📈',
    },
    {
      key: 'valuationAssessment',
      title: 'Valuation Assessment',
      content: summary.sections.valuationAssessment,
      icon: '💰',
    },
    {
      key: 'risksAndOpportunities',
      title: 'Risks & Opportunities',
      content: summary.sections.risksAndOpportunities,
      icon: '⚠️',
    },
    {
      key: 'technicalSetup',
      title: 'Technical Setup',
      content: summary.sections.technicalSetup,
      icon: '📊',
    },
  ]

  const expandAll = () => {
    setExpandedSections(new Set(sections.map(s => s.key)))
  }

  const collapseAll = () => {
    setExpandedSections(new Set())
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className="border-b border-border bg-muted/30 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <h3 className="text-lg font-semibold">AI Stock Analysis</h3>
            <span className="text-sm text-muted-foreground">for {symbol}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={expandedSections.size === sections.length ? collapseAll : expandAll}
              className="text-xs"
            >
              {expandedSections.size === sections.length ? 'Collapse All' : 'Expand All'}
            </Button>
            
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn(
                  'h-4 w-4',
                  isRefreshing && 'animate-spin'
                )} />
              </Button>
            )}
          </div>
        </div>

        {/* Key Takeaways */}
        {summary.keyTakeaways && summary.keyTakeaways.length > 0 && (
          <div className="mt-3 rounded-lg bg-purple-500/10 p-3">
            <p className="text-xs font-medium text-purple-600 dark:text-purple-400 mb-2">
              Key Takeaways
            </p>
            <ul className="space-y-1">
              {summary.keyTakeaways.map((takeaway: string, idx: number) => (
                <li key={idx} className="text-sm flex items-start gap-2">
                  <span className="text-purple-500 mt-0.5">•</span>
                  <span>{takeaway}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Sections */}
      <div className="divide-y divide-border">
        {sections.map((section) => {
          const isExpanded = expandedSections.has(section.key)
          
          return (
            <div key={section.key}>
              <button
                onClick={() => toggleSection(section.key)}
                className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{section.icon}</span>
                  <span className="font-medium">{section.title}</span>
                </div>
                
                {isExpanded ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>

              {isExpanded && (
                <div className="px-4 pb-4">
                  <div className="rounded-lg bg-muted/30 p-4">
                    <p className="text-sm leading-relaxed whitespace-pre-line">
                      {section.content}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Footer */}
      <div className="border-t border-border bg-muted/20 p-3 text-center">
        <p className="text-xs text-muted-foreground">
          Generated {new Date(summary.generatedAt).toLocaleString()} • AI analysis based on available data
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          ⚠️ Not financial advice • Always do your own research
        </p>
      </div>
    </Card>
  )
}

// Loading skeleton
export function SummaryCardSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="border-b border-border bg-muted/30 p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-5 w-5 bg-muted animate-pulse rounded" />
          <div className="h-5 w-40 bg-muted animate-pulse rounded" />
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="h-3 w-24 bg-muted animate-pulse rounded mb-2" />
          <div className="space-y-2">
            <div className="h-3 w-full bg-muted animate-pulse rounded" />
            <div className="h-3 w-4/5 bg-muted animate-pulse rounded" />
            <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
          </div>
        </div>
      </div>

      <div className="divide-y divide-border">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-6 w-6 bg-muted animate-pulse rounded" />
              <div className="h-5 w-32 bg-muted animate-pulse rounded" />
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
