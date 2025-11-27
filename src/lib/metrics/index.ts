import type {
  MetricCalculator,
  StockData,
  MetricResult,
  BatchMetricResult,
  MetricCategory,
  CacheEntry,
} from './types'

// Import all metric modules
import { fundamentalMetrics } from './fundamental'
import { valuationMetrics } from './valuation'
import { qualityMetrics } from './quality'
import { growthMetrics } from './growth'
import { efficiencyMetrics } from './efficiency'
import { technicalMetrics } from './technical'
import { dupontMetrics } from './dupont'

// Re-export types
export * from './types'

// Re-export individual metrics for direct access
export * from './fundamental'
export * from './valuation'
export * from './quality'
export * from './growth'
export * from './efficiency'
export * from './technical'
export * from './dupont'

/**
 * Metrics Registry
 * Central registry of all available metrics with lookup capabilities
 */
class MetricsRegistry {
  private metrics: Map<string, MetricCalculator> = new Map()
  private metricsByCategory: Map<MetricCategory, MetricCalculator[]> = new Map()
  private cache: Map<string, CacheEntry<MetricResult>> = new Map()
  private batchCache: Map<string, CacheEntry<BatchMetricResult>> = new Map()
  
  // Cache configuration
  private readonly CACHE_TTL = 5 * 60 * 1000 // 5 minutes
  private readonly MAX_CACHE_SIZE = 1000

  constructor() {
    // Register all metrics
    this.registerMetrics(fundamentalMetrics)
    this.registerMetrics(valuationMetrics)
    this.registerMetrics(qualityMetrics)
    this.registerMetrics(growthMetrics)
    this.registerMetrics(efficiencyMetrics)
    this.registerMetrics(technicalMetrics)
    this.registerMetrics(dupontMetrics)
  }

  /**
   * Register multiple metrics
   */
  private registerMetrics(metrics: MetricCalculator[]): void {
    for (const metric of metrics) {
      this.register(metric)
    }
  }

  /**
   * Register a single metric
   */
  register(metric: MetricCalculator): void {
    this.metrics.set(metric.id, metric)
    
    // Add to category map
    const categoryMetrics = this.metricsByCategory.get(metric.category) || []
    categoryMetrics.push(metric)
    this.metricsByCategory.set(metric.category, categoryMetrics)
  }

  /**
   * Get a metric by ID
   */
  get(id: string): MetricCalculator | undefined {
    return this.metrics.get(id)
  }

  /**
   * Get all metrics
   */
  getAll(): MetricCalculator[] {
    return Array.from(this.metrics.values())
  }

  /**
   * Get metrics by category
   */
  getByCategory(category: MetricCategory): MetricCalculator[] {
    return this.metricsByCategory.get(category) || []
  }

  /**
   * Get all available categories
   */
  getCategories(): MetricCategory[] {
    return Array.from(this.metricsByCategory.keys())
  }

  /**
   * Get total number of registered metrics
   */
  getCount(): number {
    return this.metrics.size
  }

  /**
   * Search metrics by name or description
   */
  search(query: string): MetricCalculator[] {
    const lowerQuery = query.toLowerCase()
    return this.getAll().filter(
      (m) =>
        m.name.toLowerCase().includes(lowerQuery) ||
        m.description.toLowerCase().includes(lowerQuery) ||
        m.id.toLowerCase().includes(lowerQuery)
    )
  }

  // ==================== Calculation Methods ====================

  /**
   * Calculate a single metric
   */
  calculateMetric(metricId: string, data: StockData): MetricResult {
    const metric = this.get(metricId)
    
    if (!metric) {
      return {
        id: metricId,
        name: 'Unknown Metric',
        value: null,
        formatted: 'N/A',
        interpretation: 'neutral',
        error: `Metric "${metricId}" not found`,
      }
    }

    // Check cache
    const cacheKey = `${metricId}:${data.symbol}`
    const cached = this.getFromCache(cacheKey)
    if (cached) return cached

    try {
      const value = metric.calculate(data)
      
      const result: MetricResult = {
        id: metric.id,
        name: metric.name,
        shortName: metric.shortName,
        category: metric.category,
        value,
        formatted: value !== null ? metric.format(value) : 'N/A',
        interpretation: value !== null 
          ? metric.interpretation(value, data) 
          : 'neutral',
        description: metric.description,
        benchmark: metric.benchmark,
      }

      // Cache result
      this.setCache(cacheKey, result)
      return result
    } catch (error) {
      return {
        id: metric.id,
        name: metric.name,
        shortName: metric.shortName,
        category: metric.category,
        value: null,
        formatted: 'Error',
        interpretation: 'neutral',
        error: error instanceof Error ? error.message : 'Calculation error',
      }
    }
  }

  /**
   * Calculate multiple metrics at once
   */
  calculateMetrics(metricIds: string[], data: StockData): BatchMetricResult {
    const startTime = performance.now()
    const results: Record<string, MetricResult> = {}
    const errors: Record<string, string> = {}
    let calculated = 0
    let failed = 0

    for (const id of metricIds) {
      const result = this.calculateMetric(id, data)
      results[id] = result
      
      if (result.error) {
        errors[id] = result.error
        failed++
      } else {
        calculated++
      }
    }

    return {
      symbol: data.symbol,
      timestamp: Date.now(),
      metrics: results,
      calculatedAt: new Date().toISOString(),
      meta: {
        totalMetrics: metricIds.length,
        calculated,
        failed,
        errors: Object.keys(errors).length > 0 ? errors : undefined,
        calculationTimeMs: Math.round(performance.now() - startTime),
      },
    }
  }

  /**
   * Calculate all metrics for a stock
   */
  calculateAllMetrics(data: StockData): BatchMetricResult {
    // Check batch cache
    const cacheKey = `batch:all:${data.symbol}`
    const cached = this.getFromBatchCache(cacheKey)
    if (cached) return cached

    const allMetricIds = this.getAll().map((m) => m.id)
    const result = this.calculateMetrics(allMetricIds, data)

    // Cache batch result
    this.setBatchCache(cacheKey, result)
    return result
  }

  /**
   * Calculate metrics by category
   */
  calculateByCategory(
    category: MetricCategory,
    data: StockData
  ): BatchMetricResult {
    const cacheKey = `batch:${category}:${data.symbol}`
    const cached = this.getFromBatchCache(cacheKey)
    if (cached) return cached

    const categoryMetricIds = this.getByCategory(category).map((m) => m.id)
    const result = this.calculateMetrics(categoryMetricIds, data)

    this.setBatchCache(cacheKey, result)
    return result
  }

  // ==================== Cache Methods ====================

  private getFromCache(key: string): MetricResult | null {
    const entry = this.cache.get(key)
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data
  }

  private setCache(key: string, data: MetricResult): void {
    // Evict old entries if cache is full
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.cache.keys().next().value
      if (oldestKey) this.cache.delete(oldestKey)
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL,
    })
  }

  private getFromBatchCache(key: string): BatchMetricResult | null {
    const entry = this.batchCache.get(key)
    if (!entry) return null
    
    if (Date.now() - entry.timestamp > this.CACHE_TTL) {
      this.batchCache.delete(key)
      return null
    }
    
    return entry.data
  }

  private setBatchCache(key: string, data: BatchMetricResult): void {
    if (this.batchCache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = this.batchCache.keys().next().value
      if (oldestKey) this.batchCache.delete(oldestKey)
    }
    
    this.batchCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: this.CACHE_TTL,
    })
  }

  /**
   * Clear all caches
   */
  clearCache(): void {
    this.cache.clear()
    this.batchCache.clear()
  }

  /**
   * Clear cache for a specific symbol
   */
  clearSymbolCache(symbol: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(`:${symbol}`)) {
        this.cache.delete(key)
      }
    }
    for (const key of this.batchCache.keys()) {
      if (key.includes(`:${symbol}`)) {
        this.batchCache.delete(key)
      }
    }
  }
}

// Export singleton instance
export const metricsRegistry = new MetricsRegistry()

// ==================== Convenience Functions ====================

/**
 * Calculate a single metric for stock data
 */
export function calculateMetric(metricId: string, data: StockData): MetricResult {
  return metricsRegistry.calculateMetric(metricId, data)
}

/**
 * Calculate multiple metrics for stock data
 */
export function calculateMetrics(
  metricIds: string[],
  data: StockData
): BatchMetricResult {
  return metricsRegistry.calculateMetrics(metricIds, data)
}

/**
 * Calculate all available metrics for stock data
 */
export function calculateAllMetrics(data: StockData): BatchMetricResult {
  return metricsRegistry.calculateAllMetrics(data)
}

/**
 * Calculate metrics by category
 */
export function calculateMetricsByCategory(
  category: MetricCategory,
  data: StockData
): BatchMetricResult {
  return metricsRegistry.calculateByCategory(category, data)
}

/**
 * Get metric information without calculation
 */
export function getMetricInfo(metricId: string): MetricCalculator | undefined {
  return metricsRegistry.get(metricId)
}

/**
 * Get all available metrics
 */
export function getAllMetrics(): MetricCalculator[] {
  return metricsRegistry.getAll()
}

/**
 * Get metrics by category
 */
export function getMetricsByCategory(
  category: MetricCategory
): MetricCalculator[] {
  return metricsRegistry.getByCategory(category)
}

/**
 * Search metrics by name or description
 */
export function searchMetrics(query: string): MetricCalculator[] {
  return metricsRegistry.search(query)
}

/**
 * Get total count of registered metrics
 */
export function getMetricsCount(): number {
  return metricsRegistry.getCount()
}

/**
 * Clear the metrics cache
 */
export function clearMetricsCache(): void {
  metricsRegistry.clearCache()
}

// ==================== Category Summaries ====================

/**
 * Get a summary of metrics by category
 */
export function getMetricsSummary(): Record<MetricCategory, number> {
  const categories: MetricCategory[] = [
    'fundamental',
    'technical',
    'valuation',
    'quality',
    'growth',
    'efficiency',
  ]
  
  return categories.reduce(
    (acc, category) => {
      acc[category] = metricsRegistry.getByCategory(category).length
      return acc
    },
    {} as Record<MetricCategory, number>
  )
}

// ==================== Score Calculation ====================

/**
 * Calculate an overall score based on metric interpretations
 */
export function calculateOverallScore(
  batchResult: BatchMetricResult
): { score: number; breakdown: Record<string, number> } {
  const interpretationScores = {
    good: 1,
    neutral: 0.5,
    bad: 0,
  }
  
  const breakdown: Record<string, number> = {}
  let totalScore = 0
  let count = 0
  
  for (const [id, result] of Object.entries(batchResult.metrics)) {
    if (result.value !== null && !result.error) {
      const score = interpretationScores[result.interpretation]
      breakdown[id] = score
      totalScore += score
      count++
    }
  }
  
  const overallScore = count > 0 ? (totalScore / count) * 100 : 0
  
  return {
    score: Math.round(overallScore),
    breakdown,
  }
}

// ==================== Type Guards ====================

/**
 * Check if a metric exists
 */
export function isValidMetricId(id: string): boolean {
  return metricsRegistry.get(id) !== undefined
}

/**
 * Check if a category is valid
 */
export function isValidCategory(category: string): category is MetricCategory {
  return ['fundamental', 'technical', 'valuation', 'quality', 'growth', 'efficiency'].includes(
    category
  )
}
