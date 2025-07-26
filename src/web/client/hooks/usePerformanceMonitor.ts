import { useEffect, useRef, useCallback } from 'react';
import { webErrorLogger } from '../services/WebErrorLogger';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  timestamp: number;
  componentName: string;
}

interface UsePerformanceMonitorOptions {
  componentName: string;
  enabled?: boolean;
  threshold?: number; // Render time threshold in ms
  onThresholdExceeded?: (metrics: PerformanceMetrics) => void;
}

export const usePerformanceMonitor = ({
  componentName,
  enabled = true,
  threshold = 16, // 60fps = ~16ms per frame
  onThresholdExceeded
}: UsePerformanceMonitorOptions) => {
  const renderStartTime = useRef<number>(0);
  const renderCount = useRef<number>(0);

  // Start measuring render time
  const startRender = useCallback(() => {
    if (!enabled) return;
    renderStartTime.current = performance.now();
  }, [enabled]);

  // End measuring render time and log metrics
  const endRender = useCallback(() => {
    if (!enabled) return;
    
    const renderTime = performance.now() - renderStartTime.current;
    renderCount.current++;
    
    const metrics: PerformanceMetrics = {
      renderTime,
      timestamp: Date.now(),
      componentName,
      memoryUsage: (performance as any).memory?.usedJSHeapSize
    };

    // Log performance data
    if (renderTime > threshold) {
      const error = new Error(`Performance threshold exceeded: ${renderTime.toFixed(2)}ms`);
      webErrorLogger.logPerformanceError(
        error,
        'render_time',
        threshold,
        renderTime
      );
      
      onThresholdExceeded?.(metrics);
    }

    // Log every 100th render for monitoring
    if (renderCount.current % 100 === 0) {
      console.log(`[Performance] ${componentName}: ${renderTime.toFixed(2)}ms (render #${renderCount.current})`);
    }
  }, [enabled, threshold, componentName, onThresholdExceeded]);

  // Monitor memory usage
  useEffect(() => {
    if (!enabled) return;

    const memoryThreshold = 50 * 1024 * 1024; // 50MB
    const checkMemory = () => {
      if ((performance as any).memory) {
        const usedMemory = (performance as any).memory.usedJSHeapSize;
        const totalMemory = (performance as any).memory.totalJSHeapSize;
        
        if (usedMemory > memoryThreshold) {
          const error = new Error(`High memory usage: ${(usedMemory / 1024 / 1024).toFixed(2)}MB`);
          webErrorLogger.logPerformanceError(
            error,
            'memory_usage',
            memoryThreshold,
            usedMemory
          );
        }
      }
    };

    const interval = setInterval(checkMemory, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [enabled]);

  // Monitor long tasks
  useEffect(() => {
    if (!enabled || !('PerformanceObserver' in window)) return;

    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.duration > 50) { // Long task threshold: 50ms
          const error = new Error(`Long task detected: ${entry.duration.toFixed(2)}ms`);
          webErrorLogger.logPerformanceError(
            error,
            'long_task',
            50,
            entry.duration
          );
        }
      }
    });

    observer.observe({ entryTypes: ['longtask'] });
    return () => observer.disconnect();
  }, [enabled]);

  return {
    startRender,
    endRender,
    renderCount: renderCount.current
  };
};

// Hook for measuring specific operations
export const useOperationTimer = (operationName: string) => {
  const startTime = useRef<number>(0);

  const startOperation = useCallback(() => {
    startTime.current = performance.now();
  }, []);

  const endOperation = useCallback(() => {
    const duration = performance.now() - startTime.current;
    console.log(`[Operation] ${operationName}: ${duration.toFixed(2)}ms`);
    return duration;
  }, [operationName]);

  return { startOperation, endOperation };
};

// Hook for measuring API call performance
export const useApiPerformanceMonitor = () => {
  const monitorApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    endpoint: string,
    method: string = 'GET'
  ): Promise<T> => {
    const startTime = performance.now();
    
    try {
      const result = await apiCall();
      const duration = performance.now() - startTime;
      
      // Log slow API calls
      if (duration > 1000) { // 1 second threshold
        const error = new Error(`Slow API call: ${duration.toFixed(2)}ms`);
        webErrorLogger.logPerformanceError(
          error,
          'api_response_time',
          1000,
          duration
        );
      }
      
      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      webErrorLogger.logApiError(
        error as Error,
        endpoint,
        method
      );
      throw error;
    }
  }, []);

  return { monitorApiCall };
}; 