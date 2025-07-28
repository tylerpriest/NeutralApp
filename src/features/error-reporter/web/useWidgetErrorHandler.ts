import { useState, useCallback, useRef } from 'react';
import { 
  WidgetError, 
  WidgetFallback, 
  WidgetFallbackAction, 
  SecuritySeverity, 
  ErrorRecoveryConfig,
  PluginId 
} from '../../../shared/types';

interface FallbackCallbacks {
  onRetry?: (widgetId: string) => void;
  onRemove?: (widgetId: string) => void;
  onReport?: (error: WidgetError) => void;
}

interface ErrorStatistics {
  totalErrors: number;
  widgetCount: number;
  pluginErrors: Record<string, number>;
  severityBreakdown: Record<SecuritySeverity, number>;
}

const getDefaultConfig = (): ErrorRecoveryConfig => ({
  maxRetries: 3,
  retryDelayMs: 2000,
  escalationThreshold: 2,
  autoRemoveAfterFailures: 5
});

export const useWidgetErrorHandler = (config?: ErrorRecoveryConfig) => {
  const [widgetErrors, setWidgetErrors] = useState<Map<string, WidgetError>>(new Map());
  const [fallbacks, setFallbacks] = useState<Map<string, WidgetFallback>>(new Map());
  const [fallbackCallbacks, setFallbackCallbacks] = useState<Map<string, FallbackCallbacks>>(new Map());
  
  const currentConfig = useRef<ErrorRecoveryConfig>(config || getDefaultConfig());
  const autoRemoveCallback = useRef<((widgetId: string, pluginId: PluginId) => void) | undefined>();

  const calculateSeverity = useCallback((retryCount: number): SecuritySeverity => {
    if (retryCount >= currentConfig.current.escalationThreshold) {
      return SecuritySeverity.HIGH;
    } else if (retryCount >= 1) {
      return SecuritySeverity.MEDIUM;
    } else {
      return SecuritySeverity.LOW;
    }
  }, []);

  const handleAutoRemove = useCallback((widgetId: string, pluginId: PluginId): void => {
    if (autoRemoveCallback.current) {
      try {
        autoRemoveCallback.current(widgetId, pluginId);
        console.warn(`Widget ${widgetId} auto-removed after ${currentConfig.current.autoRemoveAfterFailures} failures`);
      } catch (error) {
        console.error(`Error during auto-remove of widget ${widgetId}:`, error);
      }
    }
  }, []);

  const handleWidgetError = useCallback((widgetId: string, pluginId: PluginId, error: Error): WidgetError => {
    const existingError = widgetErrors.get(widgetId);
    const retryCount = existingError ? existingError.retryCount + 1 : 0;
    const severity = calculateSeverity(retryCount);
    
    const widgetError: WidgetError = {
      widgetId,
      pluginId,
      error,
      timestamp: new Date(),
      severity,
      retryCount
    };

    setWidgetErrors(prev => new Map(prev).set(widgetId, widgetError));

    // Check for auto-remove threshold
    if (retryCount + 1 >= currentConfig.current.autoRemoveAfterFailures) {
      handleAutoRemove(widgetId, pluginId);
    }

    console.error(`Widget ${widgetId} from plugin ${pluginId} failed (attempt ${retryCount + 1}):`, error);
    return widgetError;
  }, [widgetErrors, calculateSeverity, handleAutoRemove]);

  const clearWidgetError = useCallback((widgetId: string): void => {
    setWidgetErrors(prev => {
      const newErrors = new Map(prev);
      newErrors.delete(widgetId);
      return newErrors;
    });

    // Clean up associated fallbacks
    setFallbacks(prev => {
      const newFallbacks = new Map(prev);
      const fallbacksToRemove: string[] = [];
      
      newFallbacks.forEach((fallback, id) => {
        if (fallback.widgetId === widgetId) {
          fallbacksToRemove.push(id);
        }
      });
      
      fallbacksToRemove.forEach(id => {
        newFallbacks.delete(id);
      });
      
      return newFallbacks;
    });

    setFallbackCallbacks(prev => {
      const newCallbacks = new Map(prev);
      const callbacksToRemove: string[] = [];
      
      newCallbacks.forEach((_, id) => {
        if (fallbacks.get(id)?.widgetId === widgetId) {
          callbacksToRemove.push(id);
        }
      });
      
      callbacksToRemove.forEach(id => {
        newCallbacks.delete(id);
      });
      
      return newCallbacks;
    });
  }, [fallbacks]);

  const canRetry = useCallback((widgetId: string): boolean => {
    const error = widgetErrors.get(widgetId);
    if (!error) return true;
    return error.retryCount < currentConfig.current.maxRetries;
  }, [widgetErrors]);

  const generateFallbackContent = useCallback((widgetError: WidgetError): string => {
    const { severity } = widgetError;
    
    if (severity === SecuritySeverity.HIGH) {
      return 'This widget has encountered a critical error and cannot be displayed. Please remove it or contact support.';
    } else if (severity === SecuritySeverity.MEDIUM) {
      return 'This widget encountered an error after multiple attempts. You can try again or remove it from your dashboard.';
    } else {
      return 'This widget encountered an error while loading. You can retry or remove it from your dashboard.';
    }
  }, []);

  const createFallback = useCallback((widgetError: WidgetError, callbacks: FallbackCallbacks): WidgetFallback => {
    const fallbackId = `fallback-${widgetError.widgetId}-${Date.now()}`;
    
    const showRetry = canRetry(widgetError.widgetId) && 
                     widgetError.severity !== SecuritySeverity.HIGH;
    const showRemove = true;

    const actions: WidgetFallbackAction[] = [];

    if (showRetry && callbacks.onRetry) {
      actions.push({
        id: 'retry',
        label: 'Retry',
        action: () => callbacks.onRetry!(widgetError.widgetId),
        icon: 'refresh',
        variant: 'primary'
      });
    }

    if (showRemove && callbacks.onRemove) {
      actions.push({
        id: 'remove',
        label: 'Remove',
        action: () => callbacks.onRemove!(widgetError.widgetId),
        icon: 'close',
        variant: 'danger'
      });
    }

    if (callbacks.onReport) {
      actions.push({
        id: 'report',
        label: 'Report Issue',
        action: () => callbacks.onReport!(widgetError),
        icon: 'bug',
        variant: 'secondary'
      });
    }

    const content = generateFallbackContent(widgetError);

    const fallback: WidgetFallback = {
      id: fallbackId,
      widgetId: widgetError.widgetId,
      content,
      actions,
      showRetry,
      showRemove,
      errorMessage: widgetError.error.message
    };

    setFallbacks(prev => new Map(prev).set(fallbackId, fallback));
    setFallbackCallbacks(prev => new Map(prev).set(fallbackId, callbacks));

    return fallback;
  }, [canRetry, generateFallbackContent]);

  const executeFallbackAction = useCallback((fallbackId: string, actionId: string): void => {
    try {
      const fallback = fallbacks.get(fallbackId);
      if (!fallback) {
        console.warn(`Fallback ${fallbackId} not found`);
        return;
      }

      const action = fallback.actions.find(a => a.id === actionId);
      if (!action) {
        console.warn(`Action ${actionId} not found in fallback ${fallbackId}`);
        return;
      }

      action.action();
    } catch (error) {
      console.error(`Error executing fallback action ${actionId}:`, error);
    }
  }, [fallbacks]);

  const getErrorStatistics = useCallback((): ErrorStatistics => {
    const stats: ErrorStatistics = {
      totalErrors: widgetErrors.size,
      widgetCount: widgetErrors.size,
      pluginErrors: {},
      severityBreakdown: {
        [SecuritySeverity.LOW]: 0,
        [SecuritySeverity.MEDIUM]: 0,
        [SecuritySeverity.HIGH]: 0,
        [SecuritySeverity.CRITICAL]: 0
      }
    };

    widgetErrors.forEach(error => {
      // Count plugin errors
      const pluginId = error.pluginId;
      stats.pluginErrors[pluginId] = (stats.pluginErrors[pluginId] || 0) + 1;

      // Count severity breakdown
      stats.severityBreakdown[error.severity]++;
    });

    return stats;
  }, [widgetErrors]);

  const getFailedWidgetsByPlugin = useCallback((pluginId: PluginId): string[] => {
    const widgets: string[] = [];
    
    widgetErrors.forEach(error => {
      if (error.pluginId === pluginId) {
        widgets.push(error.widgetId);
      }
    });

    return widgets;
  }, [widgetErrors]);

  const getAllFailedWidgets = useCallback((): string[] => {
    return Array.from(widgetErrors.keys());
  }, [widgetErrors]);

  const hasErrors = useCallback((): boolean => {
    return widgetErrors.size > 0;
  }, [widgetErrors]);

  const getErrorCount = useCallback((): number => {
    return widgetErrors.size;
  }, [widgetErrors]);

  const isWidgetFailed = useCallback((widgetId: string): boolean => {
    return widgetErrors.has(widgetId);
  }, [widgetErrors]);

  const getConfig = useCallback((): ErrorRecoveryConfig => {
    return { ...currentConfig.current };
  }, []);

  const updateConfig = useCallback((newConfig: Partial<ErrorRecoveryConfig>): void => {
    currentConfig.current = {
      ...currentConfig.current,
      ...newConfig
    };
  }, []);

  const setAutoRemoveCallback = useCallback((callback: (widgetId: string, pluginId: PluginId) => void): void => {
    autoRemoveCallback.current = callback;
  }, []);

  const cleanup = useCallback((): void => {
    setWidgetErrors(new Map());
    setFallbacks(new Map());
    setFallbackCallbacks(new Map());
    autoRemoveCallback.current = undefined;
    console.log('WidgetErrorHandler cleaned up');
  }, []);

  return {
    // Configuration
    getConfig,
    updateConfig,
    setAutoRemoveCallback,
    
    // Error handling
    handleWidgetError,
    clearWidgetError,
    canRetry,
    getWidgetError: (widgetId: string) => widgetErrors.get(widgetId) || null,
    
    // Fallback management
    createFallback,
    executeFallbackAction,
    getFallback: (fallbackId: string) => fallbacks.get(fallbackId),
    
    // Statistics and monitoring
    getErrorStatistics,
    getFailedWidgetsByPlugin,
    getAllFailedWidgets,
    hasErrors,
    getErrorCount,
    isWidgetFailed,
    
    // Lifecycle
    cleanup,
    
    // State for React components
    widgetErrors: Array.from(widgetErrors.values()),
    fallbacks: Array.from(fallbacks.values()),
    errorCount: widgetErrors.size
  };
}; 