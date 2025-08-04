import { useState, useCallback, useRef, useEffect } from 'react';
import { apiClient, ApiError, ApiResponse } from '../services/api-client';
import { AxiosRequestConfig } from 'axios';

/**
 * API Request State
 */
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiError | null;
  lastUpdated: Date | null;
}

/**
 * API Request Options
 */
export interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: ApiError) => void;
  retryOnMount?: boolean;
  cacheTime?: number;
}

/**
 * Cache Entry
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

/**
 * Simple in-memory cache for API responses
 */
class ApiCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes

  set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const expiration = ttl || this.defaultTTL;
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiresAt: now + expiration
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

  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && Date.now() <= entry.expiresAt;
  }
}

const cache = new ApiCache();

/**
 * Generate cache key from URL and config
 */
function generateCacheKey(url: string, config?: AxiosRequestConfig): string {
  const configStr = config ? JSON.stringify({
    params: config.params,
    data: config.data,
    method: config.method
  }) : '';
  
  return `${url}:${configStr}`;
}

/**
 * Main useApiClient Hook
 */
export function useApiClient<T = any>(
  url?: string,
  options: UseApiOptions = {}
) {
  const {
    immediate = false,
    onSuccess,
    onError,
    retryOnMount = false,
    cacheTime = 5 * 60 * 1000 // 5 minutes default
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    lastUpdated: null
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const lastRequestRef = useRef<string | null>(null);

  // Abort any ongoing request when component unmounts
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  /**
   * Update state helper
   */
  const updateState = useCallback((updates: Partial<ApiState<T>>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  /**
   * Generic request executor
   */
  const executeRequest = useCallback(async <R = T>(
    requestFn: () => Promise<ApiResponse<R>>,
    cacheKey?: string
  ): Promise<R | null> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check cache first
    if (cacheKey && cache.has(cacheKey)) {
      const cachedData = cache.get<R>(cacheKey);
      if (cachedData) {
        updateState({
          data: cachedData as any,
          loading: false,
          error: null,
          lastUpdated: new Date()
        });
        return cachedData;
      }
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    const requestId = Math.random().toString(36);
    lastRequestRef.current = requestId;

    updateState({ loading: true, error: null });

    try {
      const response = await requestFn();
      
      // Check if this is still the latest request
      if (lastRequestRef.current !== requestId) {
        return null; // Ignore outdated response
      }

      const responseData = response.data;

      // Cache the response
      if (cacheKey && responseData) {
        cache.set(cacheKey, responseData, cacheTime);
      }

      updateState({
        data: responseData as any,
        loading: false,
        error: null,
        lastUpdated: new Date()
      });

      onSuccess?.(responseData);
      return responseData;

    } catch (error) {
      // Check if this is still the latest request
      if (lastRequestRef.current !== requestId) {
        return null; // Ignore outdated error
      }

      const apiError = error as ApiError;
      
      updateState({
        loading: false,
        error: apiError,
        lastUpdated: new Date()
      });

      onError?.(apiError);
      throw apiError;
    }
  }, [updateState, onSuccess, onError, cacheTime]);

  /**
   * HTTP Method Wrappers
   */
  const get = useCallback(async (
    requestUrl?: string,
    config?: AxiosRequestConfig
  ): Promise<T | null> => {
    const targetUrl = requestUrl || url;
    if (!targetUrl) throw new Error('URL is required for GET request');

    const cacheKey = generateCacheKey(targetUrl, { ...config, method: 'GET' });
    
    return executeRequest(
      () => apiClient.get<T>(targetUrl, config),
      cacheKey
    );
  }, [url, executeRequest]);

  const post = useCallback(async (
    requestUrl?: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T | null> => {
    const targetUrl = requestUrl || url;
    if (!targetUrl) throw new Error('URL is required for POST request');

    return executeRequest(
      () => apiClient.post<T>(targetUrl, data, config)
    );
  }, [url, executeRequest]);

  const put = useCallback(async (
    requestUrl?: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T | null> => {
    const targetUrl = requestUrl || url;
    if (!targetUrl) throw new Error('URL is required for PUT request');

    return executeRequest(
      () => apiClient.put<T>(targetUrl, data, config)
    );
  }, [url, executeRequest]);

  const patch = useCallback(async (
    requestUrl?: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T | null> => {
    const targetUrl = requestUrl || url;
    if (!targetUrl) throw new Error('URL is required for PATCH request');

    return executeRequest(
      () => apiClient.patch<T>(targetUrl, data, config)
    );
  }, [url, executeRequest]);

  const del = useCallback(async (
    requestUrl?: string,
    config?: AxiosRequestConfig
  ): Promise<T | null> => {
    const targetUrl = requestUrl || url;
    if (!targetUrl) throw new Error('URL is required for DELETE request');

    return executeRequest(
      () => apiClient.delete<T>(targetUrl, config)
    );
  }, [url, executeRequest]);

  /**
   * Utility methods
   */
  const refetch = useCallback(async (): Promise<T | null> => {
    if (!url) throw new Error('URL is required for refetch');
    return get();
  }, [url, get]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      lastUpdated: null
    });
  }, []);

  const clearCache = useCallback((cacheKey?: string) => {
    if (cacheKey) {
      const key = generateCacheKey(cacheKey);
      cache.cache.delete(key);
    } else {
      cache.clear();
    }
  }, []);

  // Immediate request on mount
  useEffect(() => {
    if (immediate && url) {
      get().catch(() => {
        // Error already handled in executeRequest
      });
    }
  }, [immediate, url, get]);

  // Retry on mount if specified
  useEffect(() => {
    if (retryOnMount && state.error && url) {
      const timer = setTimeout(() => {
        get().catch(() => {
          // Error already handled in executeRequest
        });
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [retryOnMount, state.error, url, get]);

  return {
    // State
    ...state,
    
    // HTTP Methods
    get,
    post,
    put,
    patch,
    delete: del,
    
    // Utilities
    refetch,
    reset,
    clearCache,
    
    // Status helpers
    isLoading: state.loading,
    hasError: !!state.error,
    hasData: !!state.data,
    isEmpty: !state.loading && !state.error && !state.data,
  };
}

/**
 * Specialized hooks for common patterns
 */

/**
 * Hook for authentication operations
 */
export function useAuth() {
  const [authState, setAuthState] = useState({
    isAuthenticated: apiClient.isAuthenticated(),
    loading: false,
    error: null as ApiError | null
  });

  const login = useCallback(async (credentials: { email: string; password: string }) => {
    setAuthState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const response = await apiClient.login(credentials);
      setAuthState({
        isAuthenticated: true,
        loading: false,
        error: null
      });
      return response.data;
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        loading: false,
        error: error as ApiError
      });
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      await apiClient.logout();
      setAuthState({
        isAuthenticated: false,
        loading: false,
        error: null
      });
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: error as ApiError }));
    }
  }, []);

  const checkAuth = useCallback(() => {
    const isAuth = apiClient.isAuthenticated();
    setAuthState(prev => ({ ...prev, isAuthenticated: isAuth }));
    return isAuth;
  }, []);

  return {
    ...authState,
    login,
    logout,
    checkAuth,
  };
}

/**
 * Hook for paginated data
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function usePagination<T>(
  baseUrl: string,
  initialPage = 1,
  initialLimit = 10
) {
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);

  const { get, ...rest } = useApiClient<PaginatedResponse<T>>();

  const fetchPage = useCallback(async (pageNum?: number, pageLimit?: number) => {
    const targetPage = pageNum ?? page;
    const targetLimit = pageLimit ?? limit;
    
    return get(`${baseUrl}?page=${targetPage}&limit=${targetLimit}`);
  }, [baseUrl, page, limit, get]);

  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const prevPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1));
  }, []);

  const goToPage = useCallback((pageNum: number) => {
    setPage(Math.max(1, pageNum));
  }, []);

  const changeLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  // Auto-fetch when page or limit changes
  useEffect(() => {
    fetchPage().catch(() => {
      // Error handled by useApiClient
    });
  }, [fetchPage]);

  return {
    ...rest,
    page,
    limit,
    fetchPage,
    nextPage,
    prevPage,
    goToPage,
    changeLimit,
    hasNextPage: rest.data ? page < rest.data.pagination.totalPages : false,
    hasPrevPage: page > 1,
  };
}