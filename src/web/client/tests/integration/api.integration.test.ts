import { renderHook, waitFor, act } from '@testing-library/react';
import { useDataFetching, usePaginatedFetching } from '../../hooks/useDataFetching';

// Mock the API performance monitor
jest.mock('../../hooks/usePerformanceMonitor', () => ({
  useApiPerformanceMonitor: () => ({
    monitorApiCall: jest.fn((apiCall) => apiCall())
  })
}));

describe('API Integration Tests', () => {
  beforeEach(() => {
    // Reset fetch mock
    (global.fetch as jest.Mock).mockClear();
  });

  describe('useDataFetching Integration', () => {
    it('should fetch data from API and cache it', async () => {
      const mockData = { id: 1, name: 'Test Item' };
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      });

      const fetcher = jest.fn().mockResolvedValue(mockData);
      
      const { result } = renderHook(() => 
        useDataFetching('test-key', fetcher, { cacheTime: 5000 })
      );

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('API Error');
      const fetcher = jest.fn().mockRejectedValue(error);
      
      const { result } = renderHook(() => 
        useDataFetching('error-key', fetcher)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(error);
      expect(result.current.data).toBe(null);
    });

    it('should retry failed requests', async () => {
      const mockData = { id: 1, name: 'Test Item' };
      const fetcher = jest.fn()
        .mockRejectedValueOnce(new Error('Network Error'))
        .mockResolvedValueOnce(mockData);
      
      const { result } = renderHook(() => 
        useDataFetching('retry-key', fetcher, { retryCount: 2, retryDelay: 100 })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(fetcher).toHaveBeenCalledTimes(2);
    });

    it('should respect cache and not refetch cached data', async () => {
      const mockData = { id: 1, name: 'Test Item' };
      const fetcher = jest.fn().mockResolvedValue(mockData);
      
      const { result, rerender } = renderHook(() => 
        useDataFetching('cache-key', fetcher, { cacheTime: 10000 })
      );

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Rerender with same key
      rerender();

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should only call fetcher once due to caching
      expect(fetcher).toHaveBeenCalledTimes(1);
    });

    it('should force refresh when requested', async () => {
      const mockData1 = { id: 1, name: 'Test Item 1' };
      const mockData2 = { id: 1, name: 'Test Item 2' };
      const fetcher = jest.fn()
        .mockResolvedValueOnce(mockData1)
        .mockResolvedValueOnce(mockData2);
      
      const { result } = renderHook(() => 
        useDataFetching('refresh-key', fetcher)
      );

      // Wait for initial fetch
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData1);

      // Force refresh
      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.data).toEqual(mockData2);
      expect(fetcher).toHaveBeenCalledTimes(2);
    });
  });

  describe('usePaginatedFetching Integration', () => {
    it('should load initial page of data', async () => {
      const mockPageData = {
        data: [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }],
        total: 10,
        hasMore: true
      };
      
      const fetcher = jest.fn().mockResolvedValue(mockPageData);
      
      const { result } = renderHook(() => 
        usePaginatedFetching('paginated-key', fetcher, { pageSize: 2 })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockPageData.data);
      expect(result.current.hasMore).toBe(true);
      expect(result.current.total).toBe(10);
      expect(result.current.page).toBe(1);
    });

    it('should load more data when requested', async () => {
      const mockPage1Data = {
        data: [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }],
        total: 10,
        hasMore: true
      };
      
      const mockPage2Data = {
        data: [{ id: 3, name: 'Item 3' }, { id: 4, name: 'Item 4' }],
        total: 10,
        hasMore: false
      };
      
      const fetcher = jest.fn()
        .mockResolvedValueOnce(mockPage1Data)
        .mockResolvedValueOnce(mockPage2Data);
      
      const { result } = renderHook(() => 
        usePaginatedFetching('load-more-key', fetcher, { pageSize: 2 })
      );

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Load more
      await act(async () => {
        await result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toHaveLength(4);
      expect(result.current.hasMore).toBe(false);
      expect(result.current.page).toBe(2);
    });

    it('should handle errors during pagination', async () => {
      const mockPage1Data = {
        data: [{ id: 1, name: 'Item 1' }],
        total: 10,
        hasMore: true
      };
      
      const error = new Error('Page load failed');
      const fetcher = jest.fn()
        .mockResolvedValueOnce(mockPage1Data)
        .mockRejectedValueOnce(error);
      
      const { result } = renderHook(() => 
        usePaginatedFetching('error-pagination-key', fetcher)
      );

      // Wait for initial load
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Try to load more (should fail)
      await act(async () => {
        try {
          await result.current.loadMore();
        } catch (e) {
          // Expected to throw
        }
      });

      expect(result.current.error).toBe(error);
      expect(result.current.data).toEqual(mockPage1Data.data); // Should keep original data
    });

    it('should reset pagination state', async () => {
      const mockData = {
        data: [{ id: 1, name: 'Item 1' }],
        total: 10,
        hasMore: true
      };
      
      const fetcher = jest.fn().mockResolvedValue(mockData);
      
      const { result } = renderHook(() => 
        usePaginatedFetching('reset-key', fetcher)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.data).toEqual([]);
      expect(result.current.hasMore).toBe(true);
      expect(result.current.total).toBe(0);
      expect(result.current.page).toBe(1);
    });
  });

  describe('API Error Handling Integration', () => {
    it('should handle network errors', async () => {
      const networkError = new Error('Network request failed');
      const fetcher = jest.fn().mockRejectedValue(networkError);
      
      const { result } = renderHook(() => 
        useDataFetching('network-error-key', fetcher)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(networkError);
    });

    it('should handle timeout errors', async () => {
      const fetcher = jest.fn().mockImplementation(() => 
        new Promise(resolve => setTimeout(resolve, 2000))
      );
      
      const { result } = renderHook(() => 
        useDataFetching('timeout-key', fetcher, { timeout: 1000 })
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
      expect(result.current.error?.message).toContain('timeout');
    });

    it('should handle malformed JSON responses', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      const fetcher = jest.fn().mockRejectedValue(new Error('Invalid JSON'));
      
      const { result } = renderHook(() => 
        useDataFetching('json-error-key', fetcher)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBeInstanceOf(Error);
    });
  });

  describe('API Performance Integration', () => {
    it('should measure API call performance', async () => {
      const mockData = { id: 1, name: 'Test Item' };
      const fetcher = jest.fn().mockResolvedValue(mockData);
      
      const { result } = renderHook(() => 
        useDataFetching('performance-key', fetcher)
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.data).toEqual(mockData);
      expect(result.current.lastFetched).toBeDefined();
    });

    it('should handle concurrent API calls', async () => {
      const mockData = { id: 1, name: 'Test Item' };
      const fetcher = jest.fn().mockResolvedValue(mockData);
      
      const { result } = renderHook(() => 
        useDataFetching('concurrent-key', fetcher)
      );

      // Make multiple concurrent calls
      const promises = [
        result.current.refetch(),
        result.current.refetch(),
        result.current.refetch()
      ];

      await Promise.all(promises);

      expect(result.current.data).toEqual(mockData);
      // Should handle concurrent calls gracefully
    });
  });
}); 