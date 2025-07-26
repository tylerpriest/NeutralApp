import { renderHook, act, waitFor } from '@testing-library/react';
import { useDataFetching } from '../useDataFetching';

// Mock the useApiPerformanceMonitor hook
const mockMonitorApiCall = jest.fn();
jest.mock('../usePerformanceMonitor', () => ({
  useApiPerformanceMonitor: () => ({
    monitorApiCall: mockMonitorApiCall
  })
}));

describe('useDataFetching', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockMonitorApiCall.mockImplementation(async (fn) => {
      return await fn();
    });
  });

  it('should fetch data successfully without infinite loops', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({ test: 'data' });
    
    const { result } = renderHook(() => 
      useDataFetching('test-key', mockFetcher, { immediate: true })
    );

    // Should start in loading state
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);

    // Wait for fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Should have data and not be in infinite loop
    expect(result.current.data).toEqual({ test: 'data' });
    expect(result.current.error).toBe(null);
    expect(mockFetcher).toHaveBeenCalledTimes(1);
  });

  it('should handle fetch errors gracefully', async () => {
    const mockError = new Error('Fetch failed');
    const mockFetcher = jest.fn().mockRejectedValue(mockError);
    
    const { result } = renderHook(() => 
      useDataFetching('test-key', mockFetcher, { immediate: true })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBe(null);
  });

  it('should support manual refetch without infinite loops', async () => {
    const mockFetcher = jest.fn()
      .mockResolvedValueOnce({ test: 'data1' })
      .mockResolvedValueOnce({ test: 'data2' });
    
    const { result } = renderHook(() => 
      useDataFetching('test-key', mockFetcher, { immediate: false })
    );

    // Should not fetch immediately
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);

    // Manual fetch
    await act(async () => {
      await result.current.fetchData();
    });

    expect(result.current.data).toEqual({ test: 'data1' });

    // Refetch
    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toEqual({ test: 'data2' });
    expect(mockFetcher).toHaveBeenCalledTimes(2);
  });

  it('should cache data correctly', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({ test: 'cached' });
    
    const { result: result1 } = renderHook(() => 
      useDataFetching('cache-key', mockFetcher, { immediate: true, cacheTime: 5000 })
    );

    await waitFor(() => {
      expect(result1.current.loading).toBe(false);
    });

    // Second hook with same key should use cache
    const { result: result2 } = renderHook(() => 
      useDataFetching('cache-key', mockFetcher, { immediate: true })
    );

    await waitFor(() => {
      expect(result2.current.loading).toBe(false);
    });

    expect(result2.current.data).toEqual({ test: 'cached' });
    // Should only call fetcher once due to caching
    expect(mockFetcher).toHaveBeenCalledTimes(1);
  });

  it('should handle retries correctly', async () => {
    const mockFetcher = jest.fn()
      .mockRejectedValueOnce(new Error('First attempt'))
      .mockRejectedValueOnce(new Error('Second attempt'))
      .mockResolvedValue({ test: 'success' });
    
    const { result } = renderHook(() => 
      useDataFetching('retry-key', mockFetcher, { 
        immediate: true, 
        retryCount: 2, 
        retryDelay: 10 
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ test: 'success' });
    expect(result.current.error).toBe(null);
    expect(mockFetcher).toHaveBeenCalledTimes(3);
  });

  it('should handle timeout correctly', async () => {
    jest.useFakeTimers();
    
    const mockFetcher = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve({ test: 'slow' }), 100))
    );
    
    const { result } = renderHook(() => 
      useDataFetching('timeout-key', mockFetcher, { 
        immediate: true, 
        timeout: 50 
      })
    );

    // Fast-forward time to trigger timeout
    act(() => {
      jest.advanceTimersByTime(60);
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Request timeout');
    
    jest.useRealTimers();
  });

  it('should not cause infinite re-renders when dependencies change', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({ test: 'stable' });
    
    // This test ensures the hook doesn't cause infinite loops
    // by checking that the effect doesn't run continuously
    const { result, rerender } = renderHook(() => 
      useDataFetching('stable-key', mockFetcher, { immediate: true })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Rerender with same props - should not trigger new fetch
    rerender();
    
    await waitFor(() => {
      expect(mockFetcher).toHaveBeenCalledTimes(1);
    });

    expect(result.current.data).toEqual({ test: 'stable' });
  });

  it('should clear cache correctly', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({ test: 'clear' });
    
    const { result } = renderHook(() => 
      useDataFetching('clear-key', mockFetcher, { immediate: true })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ test: 'clear' });

    // Clear cache
    act(() => {
      result.current.clearCache();
    });

    // Refetch should call fetcher again
    await act(async () => {
      await result.current.refetch();
    });

    expect(mockFetcher).toHaveBeenCalledTimes(2);
  });
}); 