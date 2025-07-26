import { renderHook, act } from '@testing-library/react';
import { useOptimisticUpdate, useOptimisticList } from '../useOptimisticUpdate';

describe('useOptimisticUpdate', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should initialize with initial state', () => {
    const { result } = renderHook(() => useOptimisticUpdate<string>('initial'));

    expect(result.current.data).toBe('initial');
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should update optimistically and then with real data', async () => {
    const mockAsyncOperation = jest.fn().mockResolvedValue('real data');
    
    const { result } = renderHook(() => useOptimisticUpdate<string>('initial'));

    await act(async () => {
      await result.current.updateOptimistically('optimistic data', mockAsyncOperation);
    });

    expect(result.current.data).toBe('real data');
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBe(null);
    expect(mockAsyncOperation).toHaveBeenCalledTimes(1);
  });

  it('should rollback on error', async () => {
    const mockAsyncOperation = jest.fn().mockRejectedValue(new Error('API Error'));
    
    const { result } = renderHook(() => useOptimisticUpdate<string>('initial'));

    await act(async () => {
      try {
        await result.current.updateOptimistically('optimistic data', mockAsyncOperation);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.data).toBe('initial'); // Rolled back
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('API Error');
  });

  it('should handle timeout', async () => {
    const mockAsyncOperation = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 2000))
    );
    
    const { result } = renderHook(() => 
      useOptimisticUpdate<string>('initial', { timeout: 1000 })
    );

    const promise = act(async () => {
      try {
        await result.current.updateOptimistically('optimistic data', mockAsyncOperation);
      } catch (error) {
        // Expected to throw
      }
    });

    // Fast-forward time to trigger timeout
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    await promise;

    expect(result.current.data).toBe('initial'); // Rolled back
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('Operation timed out');
  });

  it('should call success callback', async () => {
    const mockAsyncOperation = jest.fn().mockResolvedValue('real data');
    const onSuccess = jest.fn();
    
    const { result } = renderHook(() => 
      useOptimisticUpdate<string>('initial', { onSuccess })
    );

    await act(async () => {
      await result.current.updateOptimistically('optimistic data', mockAsyncOperation);
    });

    expect(onSuccess).toHaveBeenCalledWith('real data');
  });

  it('should call error callback', async () => {
    const mockAsyncOperation = jest.fn().mockRejectedValue(new Error('API Error'));
    const onError = jest.fn();
    
    const { result } = renderHook(() => 
      useOptimisticUpdate<string>('initial', { onError })
    );

    await act(async () => {
      try {
        await result.current.updateOptimistically('optimistic data', mockAsyncOperation);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(onError).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should reset state', () => {
    const { result } = renderHook(() => useOptimisticUpdate<string>('initial'));

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBe('initial');
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBe(null);
  });
});

describe('useOptimisticList', () => {
  const initialItems = ['item1', 'item2', 'item3'];

  it('should initialize with initial items', () => {
    const { result } = renderHook(() => useOptimisticList(initialItems));

    expect(result.current.items).toEqual(initialItems);
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should add item optimistically', async () => {
    const mockAsyncOperation = jest.fn().mockResolvedValue('new item with id');
    
    const { result } = renderHook(() => useOptimisticList(initialItems));

    await act(async () => {
      await result.current.addOptimistically('new item', mockAsyncOperation);
    });

    expect(result.current.items).toContain('new item with id');
    expect(result.current.isPending).toBe(false);
    expect(mockAsyncOperation).toHaveBeenCalledTimes(1);
  });

  it('should update item optimistically', async () => {
    const mockAsyncOperation = jest.fn().mockResolvedValue('updated item');
    
    const { result } = renderHook(() => useOptimisticList(initialItems));

    await act(async () => {
      await result.current.updateOptimistically(1, 'optimistic update', mockAsyncOperation);
    });

    expect(result.current.items[1]).toBe('updated item');
    expect(result.current.isPending).toBe(false);
  });

  it('should remove item optimistically', async () => {
    const mockAsyncOperation = jest.fn().mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useOptimisticList(initialItems));

    await act(async () => {
      await result.current.removeOptimistically(1, mockAsyncOperation);
    });

    expect(result.current.items).toHaveLength(2);
    expect(result.current.items).not.toContain('item2');
    expect(result.current.isPending).toBe(false);
  });

  it('should rollback list changes on error', async () => {
    const mockAsyncOperation = jest.fn().mockRejectedValue(new Error('API Error'));
    
    const { result } = renderHook(() => useOptimisticList(initialItems));

    await act(async () => {
      try {
        await result.current.addOptimistically('new item', mockAsyncOperation);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.items).toEqual(initialItems); // Rolled back
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
  });

  it('should reset list', () => {
    const { result } = renderHook(() => useOptimisticList(initialItems));

    act(() => {
      result.current.reset();
    });

    expect(result.current.items).toEqual(initialItems);
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBe(null);
  });
}); 