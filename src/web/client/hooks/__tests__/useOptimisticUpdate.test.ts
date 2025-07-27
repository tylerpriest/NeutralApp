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
  });

  it('should handle errors and rollback', async () => {
    const mockError = new Error('Operation failed');
    const mockAsyncOperation = jest.fn().mockRejectedValue(mockError);
    
    const { result } = renderHook(() => useOptimisticUpdate<string>('initial'));

    await act(async () => {
      try {
        await result.current.updateOptimistically('optimistic data', mockAsyncOperation);
      } catch (error) {
        // Expected to throw
      }
    });

    expect(result.current.data).toBe('initial'); // Should rollback
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toEqual(mockError);
  });

  it('should handle timeout', async () => {
    const mockAsyncOperation = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(() => resolve('slow data'), 100))
    );
    
    const { result } = renderHook(() => 
      useOptimisticUpdate<string>('initial', { timeout: 50 })
    );

    await act(async () => {
      try {
        await result.current.updateOptimistically('optimistic data', mockAsyncOperation);
      } catch (error) {
        // Expected to throw timeout error
      }
    });

    expect(result.current.data).toBe('initial'); // Should rollback
    expect(result.current.isPending).toBe(false);
    expect(result.current.error?.message).toBe('Operation timed out');
  });

  it('should call success callback', async () => {
    const onSuccess = jest.fn();
    const mockAsyncOperation = jest.fn().mockResolvedValue('real data');
    
    const { result } = renderHook(() => 
      useOptimisticUpdate<string>('initial', { onSuccess })
    );

    await act(async () => {
      await result.current.updateOptimistically('optimistic data', mockAsyncOperation);
    });

    expect(onSuccess).toHaveBeenCalledWith('real data');
  });

  it('should call error callback', async () => {
    const onError = jest.fn();
    const mockError = new Error('Operation failed');
    const mockAsyncOperation = jest.fn().mockRejectedValue(mockError);
    
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
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should initialize with initial items', () => {
    const initialItems = ['item1', 'item2'];
    const { result } = renderHook(() => useOptimisticList<string>(initialItems));

    expect(result.current.items).toEqual(initialItems);
    expect(result.current.isPending).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should add items optimistically', async () => {
    const mockAsyncOperation = jest.fn().mockResolvedValue('real item');
    
    const { result } = renderHook(() => useOptimisticList<string>(['item1']));

    await act(async () => {
      await result.current.addOptimistically('optimistic item', mockAsyncOperation);
    });

    expect(result.current.items).toContain('real item');
    expect(result.current.isPending).toBe(false);
  });

  it('should update items optimistically', async () => {
    const mockAsyncOperation = jest.fn().mockResolvedValue('updated item');
    
    const { result } = renderHook(() => useOptimisticList<string>(['item1', 'item2']));

    await act(async () => {
      await result.current.updateOptimistically(0, 'optimistic update', mockAsyncOperation);
    });

    expect(result.current.items[0]).toBe('updated item');
    expect(result.current.isPending).toBe(false);
  });

  it('should remove items optimistically', async () => {
    const mockAsyncOperation = jest.fn().mockResolvedValue(undefined);
    
    const { result } = renderHook(() => useOptimisticList<string>(['item1', 'item2']));

    await act(async () => {
      await result.current.removeOptimistically(0, mockAsyncOperation);
    });

    expect(result.current.items).toEqual(['item2']);
    expect(result.current.isPending).toBe(false);
  });
}); 