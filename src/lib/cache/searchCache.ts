import { Business } from '@/types';

interface CachedSearchResult {
  searchId: string;
  query: string;
  leadsRequested: number;
  leadsFound: number;
  businesses: Business[];
  timestamp: number;
}

// In-memory LRU-style cache
const searchCache = new Map<string, CachedSearchResult>();
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minutes TTL
const MAX_CACHE_ENTRIES = 50;

function createCacheKey(country: string, city: string, niche: string, limit: number): string {
  return `${country.trim().toLowerCase()}::${city.trim().toLowerCase()}::${niche.trim().toLowerCase()}::${limit}`;
}

export const SearchCache = {
  get(country: string, city: string, niche: string, limit: number): CachedSearchResult | null {
    const key = createCacheKey(country, city, niche, limit);
    const item = searchCache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > CACHE_TTL_MS) {
      searchCache.delete(key);
      return null;
    }

    return item;
  },

  set(
    country: string,
    city: string,
    niche: string,
    limit: number,
    data: Omit<CachedSearchResult, 'timestamp'>
  ): void {
    const key = createCacheKey(country, city, niche, limit);

    // Prune oldest if cache exceeds max size
    if (searchCache.size >= MAX_CACHE_ENTRIES) {
      const firstKey = searchCache.keys().next().value;
      if (firstKey) searchCache.delete(firstKey);
    }

    searchCache.set(key, {
      ...data,
      timestamp: Date.now(),
    });
  },

  invalidate(): void {
    searchCache.clear();
  },
};
