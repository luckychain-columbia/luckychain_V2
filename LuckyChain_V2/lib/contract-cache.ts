/**
 * Contract Call Cache
 *
 * Caches RPC call results to reduce network requests and improve performance.
 * Different cache strategies based on data type and raffle state.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  key: string;
}

class ContractCache {
  private cache = new Map<string, CacheEntry<any>>();
  private readonly DEFAULT_TTL = 10000; // 10 seconds for active data
  private readonly COMPLETED_TTL = Infinity; // Never expires for completed raffles
  private readonly PARTICIPANTS_TTL = 5000; // 5 seconds for participants (change frequently)
  private readonly RAFFLE_COUNT_TTL = 30000; // 30 seconds for raffle count
  private readonly RAFFLES_LIST_TTL = 10000; // 10 seconds for raffles list

  /**
   * Get cached data or fetch if not cached or expired
   */
  async getOrFetch<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl?: number
  ): Promise<T> {
    const cached = this.cache.get(key);

    // Check if cache exists and is still valid
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data;
    }

    // Cache miss or expired - fetch fresh data
    const data = await fetchFn();

    // Store in cache
    this.set(key, data, ttl);

    return data;
  }

  /**
   * Set cache entry
   */
  set<T>(key: string, data: T, ttl?: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl ?? this.DEFAULT_TTL,
      key,
    });
  }

  /**
   * Get cached data without fetching
   */
  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    // Check if expired
    if (Date.now() - cached.timestamp >= cached.ttl) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  /**
   * Check if cache is valid
   */
  isValid(key: string): boolean {
    const cached = this.cache.get(key);
    if (!cached) {
      return false;
    }

    return Date.now() - cached.timestamp < cached.ttl;
  }

  /**
   * Invalidate specific cache entry
   */
  invalidate(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Invalidate all cache entries matching a pattern
   */
  invalidatePattern(pattern: string | RegExp): void {
    const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Invalidate cache for a specific raffle
   */
  invalidateRaffle(raffleId: number): void {
    this.invalidatePattern(`raffle:${raffleId}:.*`);
    // Invalidate list cache since raffle state changed
    this.invalidate("raffles:list");
  }

  /**
   * Invalidate all cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; keys: string[] } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Clean up expired cache entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp >= entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get TTL for raffle data based on state
   */
  getRaffleTTL(isCompleted: boolean): number {
    return isCompleted ? this.COMPLETED_TTL : this.DEFAULT_TTL;
  }

  /**
   * Get TTL for participants
   */
  getParticipantsTTL(): number {
    return this.PARTICIPANTS_TTL;
  }

  /**
   * Get TTL for raffle count
   */
  getRaffleCountTTL(): number {
    return this.RAFFLE_COUNT_TTL;
  }

  /**
   * Get TTL for raffles list
   */
  getRafflesListTTL(): number {
    return this.RAFFLES_LIST_TTL;
  }
}

// Singleton instance
export const contractCache = new ContractCache();

// Cleanup expired entries every 30 seconds
if (typeof window !== "undefined") {
  setInterval(() => {
    contractCache.cleanup();
  }, 30000);
}

/**
 * Cache key generators
 */
export const cacheKeys = {
  rafflesList: () => "raffles:list",
  raffleInfo: (id: number) => `raffle:${id}:info`,
  raffleConfig: (id: number) => `raffle:${id}:config`,
  raffleWinners: (id: number) => `raffle:${id}:winners`,
  raffleCount: () => "raffle:count",
};
