import { useState, useEffect, useCallback, useRef } from 'react';
import { useApiPerformanceMonitor } from './usePerformanceMonitor';

interface FetchOptions {
  immediate?: boolean;
  cacheTime?: number; // Cache duration in milliseconds
  retryCount?: number;
  retryDelay?: number;
  timeout?: number;
}

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  lastFetched: number | null;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

class DataCache {
  private cache = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, cacheTime: number): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + cacheTime
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  clear(): void {
    this.cache.clear();
  }

  remove(key: string): void {
    this.cache.delete(key);
  }
}

// Global cache instance
const globalCache = new DataCache();

export function useDataFetching<T>(
  key: string,
  fetcher: () => Promise<T>,
  options: FetchOptions = {}
) {
  const {
    immediate = true,
    cacheTime = 5 * 60 * 1000, // 5 minutes default
    retryCount = 3,
    retryDelay = 1000,
    timeout = 10000
  } = options;

  const [state, setState] = useState<FetchState<T>>({
    data: null,
    loading: false,
    error: null,
    lastFetched: null
  });

  const { monitorApiCall } = useApiPerformanceMonitor();
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const fetchData = useCallback(async (forceRefresh = false): Promise<T> => {
    // Check cache first (unless force refresh)
    if (!forceRefresh) {
      const cachedData = globalCache.get<T>(key);
      if (cachedData) {
        setState(prev => ({
          ...prev,
          data: cachedData,
          lastFetched: Date.now()
        }));
        return cachedData;
      }
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setState(prev => ({
      ...prev,
      loading: true,
      error: null
    }));

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        // Clear retry timeout
        if (retryTimeoutRef.current) {
          clearTimeout(retryTimeoutRef.current);
        }

        // Perform the fetch with monitoring
        const result = await monitorApiCall(
          async () => {
            const timeoutPromise = new Promise<never>((_, reject) => {
              setTimeout(() => reject(new Error('Request timeout')), timeout);
            });

            const fetchPromise = fetcher();
            
            return Promise.race([fetchPromise, timeoutPromise]);
          },
          key,
          'GET'
        );

        // Cache the result
        globalCache.set(key, result, cacheTime);

        setState(prev => ({
          ...prev,
          data: result,
          loading: false,
          lastFetched: Date.now()
        }));

        return result;

      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry if aborted
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }

        // Don't retry on last attempt
        if (attempt === retryCount) {
          break;
        }

        // Wait before retry
        await new Promise(resolve => {
          retryTimeoutRef.current = setTimeout(resolve, retryDelay * Math.pow(2, attempt));
        });
      }
    }

    // All retries failed
    setState(prev => ({
      ...prev,
      loading: false,
      error: lastError
    }));

    throw lastError;
  }, [key, cacheTime, retryCount, retryDelay, timeout]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  const clearCache = useCallback(() => {
    globalCache.remove(key);
  }, [key]);

  // Initial fetch
  useEffect(() => {
    if (immediate) {
      fetchData().catch(error => {
        // Error is already handled in fetchData, just ensure it's logged
        console.error('Error in initial fetch:', error);
      });
    }

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [immediate, fetchData]);

  return {
    ...state,
    fetchData,
    refetch,
    clearCache
  };
}

// Hook for paginated data fetching
export function usePaginatedFetching<T>(
  key: string,
  fetcher: (page: number, limit: number) => Promise<{ data: T[]; total: number; hasMore: boolean }>,
  options: FetchOptions & { pageSize?: number } = {}
) {
  const { pageSize = 20, immediate = true, ...fetchOptions } = options;
  
  const [page, setPage] = useState(1);
  const [allData, setAllData] = useState<T[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchPage = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await fetcher(pageNum, pageSize);
      
      if (pageNum === 1) {
        setAllData(result.data);
      } else {
        setAllData(prev => [...prev, ...result.data]);
      }
      
      setHasMore(result.hasMore);
      setTotal(result.total);
      setPage(pageNum);
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetcher, pageSize]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    const nextPage = page + 1;
    
    try {
      await fetchPage(nextPage);
    } catch (error) {
      // Error is already set in fetchPage
      throw error;
    }
  }, [hasMore, loading, page, fetchPage]);

  const reset = useCallback(() => {
    setPage(1);
    setAllData([]);
    setHasMore(true);
    setTotal(0);
    setError(null);
  }, []);

  const refetch = useCallback(async () => {
    await fetchPage(1);
  }, [fetchPage]);

  // Initial fetch
  useEffect(() => {
    if (immediate) {
      fetchPage(1);
    }
  }, [immediate, fetchPage]);

  return {
    data: allData,
    loading,
    error,
    hasMore,
    total,
    page,
    loadMore,
    reset,
    refetch
  };
} 