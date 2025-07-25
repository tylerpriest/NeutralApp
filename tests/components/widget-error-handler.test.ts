import { WidgetErrorHandler } from '../../src/components/widget-error-handler';
import { 
  WidgetError, 
  WidgetFallback, 
  WidgetFallbackAction, 
  SecuritySeverity, 
  ErrorRecoveryConfig 
} from '../../src/types';

describe('WidgetErrorHandler', () => {
  let errorHandler: WidgetErrorHandler;
  let mockRetryCallback: jest.Mock;
  let mockRemoveCallback: jest.Mock;
  let mockReportCallback: jest.Mock;

  beforeEach(() => {
    mockRetryCallback = jest.fn();
    mockRemoveCallback = jest.fn();
    mockReportCallback = jest.fn();
    
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (errorHandler) {
      errorHandler.cleanup();
    }
  });

  describe('initialization', () => {
    it('should create WidgetErrorHandler with default configuration', () => {
      errorHandler = new WidgetErrorHandler();
      
      expect(errorHandler).toBeDefined();
      expect(errorHandler.getConfig()).toHaveProperty('maxRetries');
      expect(errorHandler.getConfig()).toHaveProperty('retryDelayMs');
      expect(errorHandler.getConfig()).toHaveProperty('escalationThreshold');
      expect(errorHandler.getConfig()).toHaveProperty('autoRemoveAfterFailures');
    });

    it('should create WidgetErrorHandler with custom configuration', () => {
      const customConfig: ErrorRecoveryConfig = {
        maxRetries: 5,
        retryDelayMs: 3000,
        escalationThreshold: 3,
        autoRemoveAfterFailures: 10
      };

      errorHandler = new WidgetErrorHandler(customConfig);
      
      expect(errorHandler.getConfig()).toEqual(customConfig);
    });

    it('should set default configuration values', () => {
      errorHandler = new WidgetErrorHandler();
      const config = errorHandler.getConfig();
      
      expect(config.maxRetries).toBe(3);
      expect(config.retryDelayMs).toBe(2000);
      expect(config.escalationThreshold).toBe(2);
      expect(config.autoRemoveAfterFailures).toBe(5);
    });
  });

  describe('error tracking', () => {
    beforeEach(() => {
      errorHandler = new WidgetErrorHandler();
    });

    it('should track widget errors', () => {
      const error = new Error('Widget failed to render');
      const widgetError = errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      
      expect(widgetError.widgetId).toBe('widget-1');
      expect(widgetError.pluginId).toBe('plugin-1');
      expect(widgetError.error).toBe(error);
      expect(widgetError.severity).toBe(SecuritySeverity.LOW);
      expect(widgetError.retryCount).toBe(0);
      expect(widgetError.timestamp).toBeInstanceOf(Date);
    });

    it('should increment retry count for repeated errors', () => {
      const error = new Error('Widget failed');
      
      const firstError = errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      const secondError = errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      
      expect(firstError.retryCount).toBe(0);
      expect(secondError.retryCount).toBe(1);
    });

    it('should escalate error severity based on retry count', () => {
      const error = new Error('Widget failed');
      
      // First error - LOW severity
      const firstError = errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      expect(firstError.severity).toBe(SecuritySeverity.LOW);
      
      // Second error - MEDIUM severity (escalation threshold = 2)
      const secondError = errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      expect(secondError.severity).toBe(SecuritySeverity.MEDIUM);
      
      // Third error - HIGH severity
      const thirdError = errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      expect(thirdError.severity).toBe(SecuritySeverity.HIGH);
    });

    it('should track errors for different widgets separately', () => {
      const error = new Error('Widget failed');
      
      const widget1Error = errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      const widget2Error = errorHandler.handleWidgetError('widget-2', 'plugin-1', error);
      
      expect(widget1Error.retryCount).toBe(0);
      expect(widget2Error.retryCount).toBe(0);
    });
  });

  describe('fallback creation', () => {
    beforeEach(() => {
      errorHandler = new WidgetErrorHandler();
    });

    it('should create fallback for widget error', () => {
      const error = new Error('Widget rendering failed');
      const widgetError = errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      
      const fallback = errorHandler.createFallback(widgetError, {
        onRetry: mockRetryCallback,
        onRemove: mockRemoveCallback,
        onReport: mockReportCallback
      });
      
      expect(fallback.id).toBeDefined();
      expect(fallback.widgetId).toBe('widget-1');
      expect(fallback.content).toContain('widget encountered an error');
      expect(fallback.showRetry).toBe(true);
      expect(fallback.showRemove).toBe(true);
      expect(fallback.actions).toHaveLength(3); // Retry, Remove, Report
    });

    it('should customize fallback content based on error severity', () => {
      const error = new Error('Critical widget failure');
      
      // Create multiple errors to escalate severity to HIGH
      errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      const highSeverityError = errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      
      const fallback = errorHandler.createFallback(highSeverityError, {
        onRetry: mockRetryCallback,
        onRemove: mockRemoveCallback
      });
      
      expect(fallback.content).toContain('critical error');
      expect(fallback.showRetry).toBe(false); // No retry for high severity
    });

    it('should disable retry for widgets exceeding max retry count', () => {
      const error = new Error('Widget failed');
      
      // Exceed max retries (default is 3)
      for (let i = 0; i <= 3; i++) {
        errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      }
      
      const finalError = errorHandler.getWidgetError('widget-1');
      const fallback = errorHandler.createFallback(finalError!, {
        onRetry: mockRetryCallback,
        onRemove: mockRemoveCallback
      });
      
      expect(fallback.showRetry).toBe(false);
    });

    it('should include error message in fallback when available', () => {
      const error = new Error('Specific error message');
      const widgetError = errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      
      const fallback = errorHandler.createFallback(widgetError, {
        onRetry: mockRetryCallback,
        onRemove: mockRemoveCallback
      });
      
      expect(fallback.errorMessage).toBe('Specific error message');
    });
  });

  describe('fallback actions', () => {
    beforeEach(() => {
      errorHandler = new WidgetErrorHandler();
    });

    it('should execute retry action', () => {
      const error = new Error('Widget failed');
      const widgetError = errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      
      const fallback = errorHandler.createFallback(widgetError, {
        onRetry: mockRetryCallback,
        onRemove: mockRemoveCallback
      });
      
      errorHandler.executeFallbackAction(fallback.id, 'retry');
      
      expect(mockRetryCallback).toHaveBeenCalledTimes(1);
      expect(mockRetryCallback).toHaveBeenCalledWith('widget-1');
    });

    it('should execute remove action', () => {
      const error = new Error('Widget failed');
      const widgetError = errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      
      const fallback = errorHandler.createFallback(widgetError, {
        onRetry: mockRetryCallback,
        onRemove: mockRemoveCallback
      });
      
      errorHandler.executeFallbackAction(fallback.id, 'remove');
      
      expect(mockRemoveCallback).toHaveBeenCalledTimes(1);
      expect(mockRemoveCallback).toHaveBeenCalledWith('widget-1');
    });

    it('should execute report action', () => {
      const error = new Error('Widget failed');
      const widgetError = errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      
      const fallback = errorHandler.createFallback(widgetError, {
        onRetry: mockRetryCallback,
        onRemove: mockRemoveCallback,
        onReport: mockReportCallback
      });
      
      errorHandler.executeFallbackAction(fallback.id, 'report');
      
      expect(mockReportCallback).toHaveBeenCalledTimes(1);
      expect(mockReportCallback).toHaveBeenCalledWith(widgetError);
    });

    it('should handle unknown action gracefully', () => {
      const error = new Error('Widget failed');
      const widgetError = errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      
      const fallback = errorHandler.createFallback(widgetError, {
        onRetry: mockRetryCallback
      });
      
      expect(() => {
        errorHandler.executeFallbackAction(fallback.id, 'unknown-action');
      }).not.toThrow();
    });
  });

  describe('error recovery', () => {
    beforeEach(() => {
      errorHandler = new WidgetErrorHandler();
    });

    it('should allow retry within max retry limit', () => {
      const error = new Error('Widget failed');
      
      // First error
      errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      expect(errorHandler.canRetry('widget-1')).toBe(true);
      
      // Second error
      errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      expect(errorHandler.canRetry('widget-1')).toBe(true);
      
      // Third error
      errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      expect(errorHandler.canRetry('widget-1')).toBe(true);
      
      // Fourth error (exceeds max retries of 3)
      errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      expect(errorHandler.canRetry('widget-1')).toBe(false);
    });

    it('should clear widget error history on successful retry', () => {
      const error = new Error('Widget failed');
      
      errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      expect(errorHandler.getWidgetError('widget-1')).toBeDefined();
      
      errorHandler.clearWidgetError('widget-1');
      expect(errorHandler.getWidgetError('widget-1')).toBeNull();
    });

    it('should auto-remove widget after configured failure threshold', () => {
      const error = new Error('Widget failed');
      const onAutoRemove = jest.fn();
      errorHandler.setAutoRemoveCallback(onAutoRemove);
      
      // Create errors up to auto-remove threshold (default is 5)
      for (let i = 0; i < 5; i++) {
        errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      }
      
      expect(onAutoRemove).toHaveBeenCalledTimes(1);
      expect(onAutoRemove).toHaveBeenCalledWith('widget-1', 'plugin-1');
    });
  });

  describe('fallback rendering', () => {
    beforeEach(() => {
      errorHandler = new WidgetErrorHandler();
    });

    it('should render fallback HTML content', () => {
      const error = new Error('Widget rendering failed');
      const widgetError = errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      
      const fallback = errorHandler.createFallback(widgetError, {
        onRetry: mockRetryCallback,
        onRemove: mockRemoveCallback
      });
      
      const html = errorHandler.renderFallback(fallback.id);
      
      expect(html).toContain('widget-error-fallback');
      expect(html).toContain('widget encountered an error');
      expect(html).toContain('data-action="retry"');
      expect(html).toContain('data-action="remove"');
    });

    it('should render minimal fallback for missing fallback data', () => {
      const html = errorHandler.renderFallback('non-existent-fallback');
      
      expect(html).toContain('widget-error-fallback');
      expect(html).toContain('error occurred');
    });

    it('should include error message when available', () => {
      const error = new Error('Specific error details');
      const widgetError = errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      
      const fallback = errorHandler.createFallback(widgetError, {
        onRetry: mockRetryCallback
      });
      
      const html = errorHandler.renderFallback(fallback.id);
      
      expect(html).toContain('Specific error details');
    });
  });

  describe('statistics and monitoring', () => {
    beforeEach(() => {
      errorHandler = new WidgetErrorHandler();
    });

    it('should provide error statistics', () => {
      const error = new Error('Widget failed');
      
      errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      errorHandler.handleWidgetError('widget-2', 'plugin-1', error);
      errorHandler.handleWidgetError('widget-3', 'plugin-2', error);
      
      const stats = errorHandler.getErrorStatistics();
      
      expect(stats.totalErrors).toBe(3);
      expect(stats.widgetCount).toBe(3);
      expect(stats.pluginErrors).toHaveProperty('plugin-1', 2);
      expect(stats.pluginErrors).toHaveProperty('plugin-2', 1);
      expect(stats.severityBreakdown).toHaveProperty(SecuritySeverity.LOW, 3);
    });

    it('should list widgets by plugin for error monitoring', () => {
      const error = new Error('Widget failed');
      
      errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      errorHandler.handleWidgetError('widget-2', 'plugin-1', error);
      errorHandler.handleWidgetError('widget-3', 'plugin-2', error);
      
      const plugin1Widgets = errorHandler.getFailedWidgetsByPlugin('plugin-1');
      const plugin2Widgets = errorHandler.getFailedWidgetsByPlugin('plugin-2');
      
      expect(plugin1Widgets).toHaveLength(2);
      expect(plugin1Widgets).toContain('widget-1');
      expect(plugin1Widgets).toContain('widget-2');
      expect(plugin2Widgets).toHaveLength(1);
      expect(plugin2Widgets).toContain('widget-3');
    });
  });

  describe('cleanup and lifecycle', () => {
    beforeEach(() => {
      errorHandler = new WidgetErrorHandler();
    });

    it('should cleanup all data on cleanup call', () => {
      const error = new Error('Widget failed');
      
      errorHandler.handleWidgetError('widget-1', 'plugin-1', error);
      const fallback = errorHandler.createFallback(
        errorHandler.getWidgetError('widget-1')!,
        { onRetry: mockRetryCallback }
      );
      
      expect(errorHandler.getWidgetError('widget-1')).toBeDefined();
      expect(errorHandler.renderFallback(fallback.id)).toContain('widget-error-fallback');
      
      errorHandler.cleanup();
      
      expect(errorHandler.getWidgetError('widget-1')).toBeNull();
      expect(errorHandler.renderFallback(fallback.id)).toContain('error occurred'); // minimal fallback
    });

    it('should handle cleanup when no data exists', () => {
      expect(() => {
        errorHandler.cleanup();
      }).not.toThrow();
    });
  });
}); 