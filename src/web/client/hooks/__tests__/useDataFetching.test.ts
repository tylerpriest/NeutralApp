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
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should fetch data successfully without infinite loops', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({ test: 'data' });
    
    const { result } = renderHook(() => 
      useDataFetching('test-key', mockFetcher, { immediate: true })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ test: 'data' });
    expect(result.current.error).toBe(null);
  });

  it('should handle fetch errors gracefully', async () => {
    const mockError = new Error('Fetch failed');
    const mockFetcher = jest.fn().mockRejectedValue(mockError);
    
    const { result } = renderHook(() => 
      useDataFetching('error-key', mockFetcher, { immediate: true })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBe(null);
  });

  it('should support manual refetch without infinite loops', async () => {
    const mockFetcher = jest.fn()
      .mockResolvedValueOnce({ test: 'data' })
      .mockResolvedValueOnce({ test: 'data2' });
    
    const { result } = renderHook(() => 
      useDataFetching('test-key', mockFetcher, { immediate: false })
    );

    // Initial state
    expect(result.current.loading).toBe(false);
    expect(result.current.data).toBe(null);

    // Manual fetch
    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ test: 'data' });

    // Second fetch
    await act(async () => {
      await result.current.refetch();
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ test: 'data2' });
  });

  it('should cache data correctly', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({ test: 'cached data' });
    
    const { result } = renderHook(() => 
      useDataFetching('cache-key', mockFetcher, { immediate: true })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ test: 'cached data' });
    expect(mockFetcher).toHaveBeenCalledTimes(1);

    // Second render with same key should use cache
    const { result: result2 } = renderHook(() => 
      useDataFetching('cache-key', mockFetcher, { immediate: true })
    );

    expect(result2.current.data).toEqual({ test: 'cached data' });
    expect(mockFetcher).toHaveBeenCalledTimes(1); // Should not call again
  });

  it('should handle retries correctly', async () => {
    const mockFetcher = jest.fn()
      .mockRejectedValueOnce(new Error('First attempt'))
      .mockResolvedValueOnce({ test: 'success' });
    
    const { result } = renderHook(() => 
      useDataFetching('retry-key', mockFetcher, { 
        immediate: true, 
        retryCount: 1,
        retryDelay: 100
      })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ test: 'success' });
    expect(mockFetcher).toHaveBeenCalledTimes(2);
  });

  it('should handle timeout correctly', async () => {
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
    await act(async () => {
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
    const mockFetcher = jest.fn().mockResolvedValue({ test: 'data' });
    
    const { result, rerender } = renderHook(
      ({ key }) => useDataFetching(key, mockFetcher, { immediate: true }),
      { initialProps: { key: 'key1' } }
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Change key
    rerender({ key: 'key2' });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockFetcher).toHaveBeenCalledTimes(2); // Once for each key
  });

  it('should clear cache correctly', async () => {
    const mockFetcher = jest.fn().mockResolvedValue({ test: 'data' });
    
    const { result } = renderHook(() => 
      useDataFetching('clear-key', mockFetcher, { immediate: true })
    );

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual({ test: 'data' });

    // Clear cache
    act(() => {
      result.current.clearCache();
    });

    expect(result.current.data).toBe(null);
  });
}); 