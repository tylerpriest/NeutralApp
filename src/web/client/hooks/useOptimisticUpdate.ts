import { useState, useCallback, useRef } from 'react';

interface OptimisticUpdateOptions<T> {
  onSuccess?: (result: T) => void;
  onError?: (error: Error) => void;
  rollbackOnError?: boolean;
  timeout?: number; // Timeout for the operation
}

interface OptimisticUpdateState<T> {
  isPending: boolean;
  error: Error | null;
  data: T | null;
}

export function useOptimisticUpdate<T>(
  initialState: T,
  options: OptimisticUpdateOptions<T> = {}
) {
  const [state, setState] = useState<OptimisticUpdateState<T>>({
    isPending: false,
    error: null,
    data: initialState
  });

  const originalDataRef = useRef<T>(initialState);
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const updateOptimistically = useCallback(async (
    optimisticData: T,
    asyncOperation: () => Promise<T>
  ) => {
    // Store original data for potential rollback
    originalDataRef.current = state.data || initialState;
    
    // Immediately update UI with optimistic data
    setState(prev => ({
      ...prev,
      isPending: true,
      error: null,
      data: optimisticData
    }));

    try {
      // Set timeout if specified
      if (options.timeout) {
        timeoutRef.current = setTimeout(() => {
          throw new Error('Operation timed out');
        }, options.timeout);
      }

      // Perform actual operation
      const result = await asyncOperation();

      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }

      // Update with actual result
      setState(prev => ({
        ...prev,
        isPending: false,
        data: result
      }));

      options.onSuccess?.(result);
      return result;

    } catch (error) {
      // Clear timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = undefined;
      }

      const errorObj = error instanceof Error ? error : new Error(String(error));

      // Rollback to original data if specified
      if (options.rollbackOnError !== false) {
        setState(prev => ({
          ...prev,
          isPending: false,
          error: errorObj,
          data: originalDataRef.current
        }));
      } else {
        setState(prev => ({
          ...prev,
          isPending: false,
          error: errorObj
        }));
      }

      options.onError?.(errorObj);
      throw errorObj;
    }
  }, [state.data, initialState, options]);

  const reset = useCallback(() => {
    setState({
      isPending: false,
      error: null,
      data: initialState
    });
    originalDataRef.current = initialState;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, [initialState]);

  // Ensure we always return a valid object
  return {
    isPending: state.isPending,
    error: state.error,
    data: state.data,
    updateOptimistically,
    reset
  };
}

// Hook for optimistic list updates
export function useOptimisticList<T>(
  initialItems: T[] = [],
  options: OptimisticUpdateOptions<T[]> = {}
) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const originalItemsRef = useRef<T[]>(initialItems);

  const addOptimistically = useCallback(async (
    newItem: T,
    asyncOperation: () => Promise<T>
  ) => {
    originalItemsRef.current = [...items];
    
    // Add item immediately
    setItems(prev => [...prev, newItem]);
    setIsPending(true);
    setError(null);

    try {
      const result = await asyncOperation();
      
      // Replace optimistic item with real result
      setItems(prev => prev.map(item => 
        item === newItem ? result : item
      ));
      
      setIsPending(false);
      options.onSuccess?.([...items, result]);
      return result;

    } catch (error) {
      // Rollback
      setItems(originalItemsRef.current);
      setIsPending(false);
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setError(errorObj);
      options.onError?.(errorObj);
      throw errorObj;
    }
  }, [items, options]);

  const updateOptimistically = useCallback(async (
    index: number,
    updatedItem: T,
    asyncOperation: () => Promise<T>
  ) => {
    originalItemsRef.current = [...items];
    
    // Update item immediately
    setItems(prev => prev.map((item, i) => 
      i === index ? updatedItem : item
    ));
    setIsPending(true);
    setError(null);

    try {
      const result = await asyncOperation();
      
      // Replace with real result
      setItems(prev => prev.map((item, i) => 
        i === index ? result : item
      ));
      
      setIsPending(false);
      options.onSuccess?.(items.map((item, i) => i === index ? result : item));
      return result;

    } catch (error) {
      // Rollback
      setItems(originalItemsRef.current);
      setIsPending(false);
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setError(errorObj);
      options.onError?.(errorObj);
      throw errorObj;
    }
  }, [items, options]);

  const removeOptimistically = useCallback(async (
    index: number,
    asyncOperation: () => Promise<void>
  ) => {
    originalItemsRef.current = [...items];
    const removedItem = items[index];
    
    // Remove item immediately
    setItems(prev => prev.filter((_, i) => i !== index));
    setIsPending(true);
    setError(null);

    try {
      await asyncOperation();
      setIsPending(false);
      options.onSuccess?.(items.filter((_, i) => i !== index));

    } catch (error) {
      // Rollback
      setItems(originalItemsRef.current);
      setIsPending(false);
      const errorObj = error instanceof Error ? error : new Error(String(error));
      setError(errorObj);
      options.onError?.(errorObj);
      throw errorObj;
    }
  }, [items, options]);

  const reset = useCallback(() => {
    setItems(initialItems);
    setIsPending(false);
    setError(null);
    originalItemsRef.current = initialItems;
  }, [initialItems]);

  // Ensure we always return a valid object
  return {
    items,
    isPending,
    error,
    addOptimistically,
    updateOptimistically,
    removeOptimistically,
    reset
  };
} 