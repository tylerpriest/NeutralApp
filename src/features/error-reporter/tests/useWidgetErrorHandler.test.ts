import { renderHook, act } from '@testing-library/react';
import { useWidgetErrorHandler } from '../web/useWidgetErrorHandler';
import { SecuritySeverity, ErrorRecoveryConfig } from '../../../shared/types';

describe('useWidgetErrorHandler', () => {
  const mockRetryCallback = jest.fn();
  const mockRemoveCallback = jest.fn();
  const mockReportCallback = jest.fn();
  const mockAutoRemoveCallback = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default configuration', () => {
      const { result } = renderHook(() => useWidgetErrorHandler());
      
      const config = result.current.getConfig();
      expect(config.maxRetries).toBe(3);
      expect(config.retryDelayMs).toBe(2000);
      expect(config.escalationThreshold).toBe(2);
      expect(config.autoRemoveAfterFailures).toBe(5);
    });

    it('should initialize with custom configuration', () => {
      const customConfig: ErrorRecoveryConfig = {
        maxRetries: 5,
        retryDelayMs: 3000,
        escalationThreshold: 3,
        autoRemoveAfterFailures: 10
      };

      const { result } = renderHook(() => useWidgetErrorHandler(customConfig));
      
      const config = result.current.getConfig();
      expect(config).toEqual(customConfig);
    });

    it('should have no errors initially', () => {
      const { result } = renderHook(() => useWidgetErrorHandler());
      
      expect(result.current.hasErrors()).toBe(false);
      expect(result.current.getErrorCount()).toBe(0);
      expect(result.current.widgetErrors).toHaveLength(0);
    });
  });

  describe('error handling', () => {
    it('should handle widget errors', () => {
      const { result } = renderHook(() => useWidgetErrorHandler());
      const error = new Error('Widget failed to render');
      
      act(() => {
        const widgetError = result.current.handleWidgetError('widget-1', 'plugin-1', error);
        
        expect(widgetError.widgetId).toBe('widget-1');
        expect(widgetError.pluginId).toBe('plugin-1');
        expect(widgetError.error).toBe(error);
        expect(widgetError.severity).toBe(SecuritySeverity.LOW);
        expect(widgetError.retryCount).toBe(0);
        expect(widgetError.timestamp).toBeInstanceOf(Date);
      });

      expect(result.current.hasErrors()).toBe(true);
      expect(result.current.getErrorCount()).toBe(1);
      expect(result.current.widgetErrors).toHaveLength(1);
    });

    it('should increment retry count for repeated errors', () => {
      const { result } = renderHook(() => useWidgetErrorHandler());
      const error = new Error('Widget failed');
      
      act(() => {
        const firstError = result.current.handleWidgetError('widget-1', 'plugin-1', error);
        expect(firstError.retryCount).toBe(0);
        
        const secondError = result.current.handleWidgetError('widget-1', 'plugin-1', error);
        expect(secondError.retryCount).toBe(1);
      });
    });

    it('should escalate error severity based on retry count', () => {
      const { result } = renderHook(() => useWidgetErrorHandler());
      const error = new Error('Widget failed');
      
      act(() => {
        // First error - LOW severity
        const firstError = result.current.handleWidgetError('widget-1', 'plugin-1', error);
        expect(firstError.severity).toBe(SecuritySeverity.LOW);
        
        // Second error - MEDIUM severity (escalation threshold = 2)
        const secondError = result.current.handleWidgetError('widget-1', 'plugin-1', error);
        expect(secondError.severity).toBe(SecuritySeverity.MEDIUM);
        
        // Third error - HIGH severity (escalation threshold = 2)
        const thirdError = result.current.handleWidgetError('widget-1', 'plugin-1', error);
        expect(thirdError.severity).toBe(SecuritySeverity.HIGH);
      });
    });

    it('should clear widget errors', () => {
      const { result } = renderHook(() => useWidgetErrorHandler());
      const error = new Error('Widget failed');
      
      act(() => {
        result.current.handleWidgetError('widget-1', 'plugin-1', error);
        expect(result.current.hasErrors()).toBe(true);
        
        result.current.clearWidgetError('widget-1');
        expect(result.current.hasErrors()).toBe(false);
        expect(result.current.getErrorCount()).toBe(0);
      });
    });

    it('should check if widget can retry', () => {
      const { result } = renderHook(() => useWidgetErrorHandler());
      const error = new Error('Widget failed');
      
      act(() => {
        // Initially can retry
        expect(result.current.canRetry('widget-1')).toBe(true);
        
        // After max retries, cannot retry
        for (let i = 0; i <= 3; i++) {
          result.current.handleWidgetError('widget-1', 'plugin-1', error);
        }
        
        expect(result.current.canRetry('widget-1')).toBe(false);
      });
    });
  });

  describe('fallback management', () => {
    it('should create fallbacks with correct actions', () => {
      const { result } = renderHook(() => useWidgetErrorHandler());
      const error = new Error('Widget failed');
      
      act(() => {
        const widgetError = result.current.handleWidgetError('widget-1', 'plugin-1', error);
        
        const callbacks = {
          onRetry: mockRetryCallback,
          onRemove: mockRemoveCallback,
          onReport: mockReportCallback
        };
        
        const fallback = result.current.createFallback(widgetError, callbacks);
        
        expect(fallback.widgetId).toBe('widget-1');
        expect(fallback.showRetry).toBe(true);
        expect(fallback.showRemove).toBe(true);
        expect(fallback.actions).toHaveLength(3);
        expect(fallback.actions[0]?.id).toBe('retry');
        expect(fallback.actions[1]?.id).toBe('remove');
        expect(fallback.actions[2]?.id).toBe('report');
      });
    });

    it('should execute fallback actions', () => {
      const { result } = renderHook(() => useWidgetErrorHandler());
      const error = new Error('Widget failed');
      
      act(() => {
        const widgetError = result.current.handleWidgetError('widget-1', 'plugin-1', error);
        
        const callbacks = {
          onRetry: mockRetryCallback,
          onRemove: mockRemoveCallback,
          onReport: mockReportCallback
        };
        
        const fallback = result.current.createFallback(widgetError, callbacks);
        
        result.current.executeFallbackAction(fallback.id, 'retry');
        expect(mockRetryCallback).toHaveBeenCalledWith('widget-1');
        
        result.current.executeFallbackAction(fallback.id, 'remove');
        expect(mockRemoveCallback).toHaveBeenCalledWith('widget-1');
        
        result.current.executeFallbackAction(fallback.id, 'report');
        expect(mockReportCallback).toHaveBeenCalledWith(widgetError);
      });
    });

    it('should not show retry for high severity errors', () => {
      const { result } = renderHook(() => useWidgetErrorHandler());
      const error = new Error('Widget failed');
      
      act(() => {
        // Create multiple errors to escalate to HIGH severity
        for (let i = 0; i <= 2; i++) {
          result.current.handleWidgetError('widget-1', 'plugin-1', error);
        }
        
        const widgetError = result.current.getWidgetError('widget-1')!;
        expect(widgetError.severity).toBe(SecuritySeverity.HIGH);
        
        const callbacks = {
          onRetry: mockRetryCallback,
          onRemove: mockRemoveCallback,
          onReport: mockReportCallback
        };
        
        const fallback = result.current.createFallback(widgetError, callbacks);
        expect(fallback.showRetry).toBe(false);
        expect(fallback.actions.find(a => a.id === 'retry')).toBeUndefined();
      });
    });
  });

  describe('statistics and monitoring', () => {
    it('should provide error statistics', () => {
      const { result } = renderHook(() => useWidgetErrorHandler());
      const error = new Error('Widget failed');
      
      act(() => {
        result.current.handleWidgetError('widget-1', 'plugin-1', error);
        result.current.handleWidgetError('widget-2', 'plugin-1', error);
        result.current.handleWidgetError('widget-3', 'plugin-2', error);
        
        const stats = result.current.getErrorStatistics();
        
        expect(stats.totalErrors).toBe(3);
        expect(stats.widgetCount).toBe(3);
        expect(stats.pluginErrors['plugin-1']).toBe(2);
        expect(stats.pluginErrors['plugin-2']).toBe(1);
        expect(stats.severityBreakdown[SecuritySeverity.LOW]).toBe(3);
      });
    });

    it('should get failed widgets by plugin', () => {
      const { result } = renderHook(() => useWidgetErrorHandler());
      const error = new Error('Widget failed');
      
      act(() => {
        result.current.handleWidgetError('widget-1', 'plugin-1', error);
        result.current.handleWidgetError('widget-2', 'plugin-1', error);
        result.current.handleWidgetError('widget-3', 'plugin-2', error);
        
        const plugin1Widgets = result.current.getFailedWidgetsByPlugin('plugin-1');
        expect(plugin1Widgets).toHaveLength(2);
        expect(plugin1Widgets).toContain('widget-1');
        expect(plugin1Widgets).toContain('widget-2');
        
        const plugin2Widgets = result.current.getFailedWidgetsByPlugin('plugin-2');
        expect(plugin2Widgets).toHaveLength(1);
        expect(plugin2Widgets).toContain('widget-3');
      });
    });

    it('should get all failed widgets', () => {
      const { result } = renderHook(() => useWidgetErrorHandler());
      const error = new Error('Widget failed');
      
      act(() => {
        result.current.handleWidgetError('widget-1', 'plugin-1', error);
        result.current.handleWidgetError('widget-2', 'plugin-2', error);
        
        const allWidgets = result.current.getAllFailedWidgets();
        expect(allWidgets).toHaveLength(2);
        expect(allWidgets).toContain('widget-1');
        expect(allWidgets).toContain('widget-2');
      });
    });

    it('should check if specific widget has failed', () => {
      const { result } = renderHook(() => useWidgetErrorHandler());
      const error = new Error('Widget failed');
      
      act(() => {
        expect(result.current.isWidgetFailed('widget-1')).toBe(false);
        
        result.current.handleWidgetError('widget-1', 'plugin-1', error);
        expect(result.current.isWidgetFailed('widget-1')).toBe(true);
      });
    });
  });

  describe('configuration management', () => {
    it('should update configuration', () => {
      const { result } = renderHook(() => useWidgetErrorHandler());
      
      act(() => {
        const originalConfig = result.current.getConfig();
        expect(originalConfig.maxRetries).toBe(3);
        
        result.current.updateConfig({ maxRetries: 10 });
        
        const updatedConfig = result.current.getConfig();
        expect(updatedConfig.maxRetries).toBe(10);
        expect(updatedConfig.retryDelayMs).toBe(2000); // Other values unchanged
      });
    });

    it('should set auto-remove callback', () => {
      const { result } = renderHook(() => useWidgetErrorHandler());
      
      act(() => {
        result.current.setAutoRemoveCallback(mockAutoRemoveCallback);
        // The callback is stored internally, so we test it by triggering auto-remove
        const error = new Error('Widget failed');
        
        // Create enough errors to trigger auto-remove
        for (let i = 0; i < 5; i++) {
          result.current.handleWidgetError('widget-1', 'plugin-1', error);
        }
        
        expect(mockAutoRemoveCallback).toHaveBeenCalledWith('widget-1', 'plugin-1');
      });
    });
  });

  describe('lifecycle management', () => {
    it('should cleanup all state', () => {
      const { result } = renderHook(() => useWidgetErrorHandler());
      const error = new Error('Widget failed');
      
      act(() => {
        result.current.handleWidgetError('widget-1', 'plugin-1', error);
        expect(result.current.hasErrors()).toBe(true);
        
        result.current.cleanup();
        expect(result.current.hasErrors()).toBe(false);
        expect(result.current.getErrorCount()).toBe(0);
        expect(result.current.widgetErrors).toHaveLength(0);
        expect(result.current.fallbacks).toHaveLength(0);
      });
    });
  });

  describe('React state integration', () => {
    it('should provide reactive state for components', () => {
      const { result } = renderHook(() => useWidgetErrorHandler());
      const error = new Error('Widget failed');
      
      act(() => {
        result.current.handleWidgetError('widget-1', 'plugin-1', error);
        result.current.handleWidgetError('widget-2', 'plugin-2', error);
      });

      expect(result.current.errorCount).toBe(2);
      expect(result.current.widgetErrors).toHaveLength(2);
      expect(result.current.fallbacks).toHaveLength(0); // No fallbacks created yet
    });
  });
}); 