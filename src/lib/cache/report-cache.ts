/**
 * Simple in-memory cache for FMP data used in report generation
 * Prevents redundant API calls when generating reports in parallel
 * 
 * Cache TTL: 5 minutes (financial data doesn't change frequently)
 */

interface CacheEntry {
  data: unknown;
  timestamp: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

// In-memory cache storage
const cache = new Map<string, CacheEntry>();

/**
 * Get data from cache if it exists and is not expired
 * Note: Type T is asserted by the caller. The cache stores unknown types.
 */
export function getCached<T = unknown>(key: string): T | null {
  const entry = cache.get(key);
  
  if (!entry) {
    return null;
  }
  
  const now = Date.now();
  const age = now - entry.timestamp;
  
  // Check if cache entry is expired
  if (age > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  
  return entry.data as T;
}

/**
 * Store data in cache with current timestamp
 * Note: Accepts any serializable data. Type safety is maintained by the caller.
 */
export function setCached<T = unknown>(key: string, data: T): void {
  cache.set(key, {
    data: data as unknown,
    timestamp: Date.now(),
  });
}

/**
 * Clear specific cache entry
 */
export function clearCache(key: string): void {
  cache.delete(key);
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  cache.clear();
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;
  
  cache.forEach((entry) => {
    const age = now - entry.timestamp;
    if (age <= CACHE_TTL_MS) {
      validEntries++;
    } else {
      expiredEntries++;
    }
  });
  
  return {
    totalEntries: cache.size,
    validEntries,
    expiredEntries,
    ttlMs: CACHE_TTL_MS,
  };
}

/**
 * Clean up expired entries (optional periodic cleanup)
 */
export function cleanupExpiredEntries(): number {
  const now = Date.now();
  let removed = 0;
  
  cache.forEach((entry, key) => {
    const age = now - entry.timestamp;
    if (age > CACHE_TTL_MS) {
      cache.delete(key);
      removed++;
    }
  });
  
  return removed;
}
