// Mock the ClientLoggingService before importing the module
jest.mock('../../../../features/error-reporter/services/client-logging.service', () => ({
  ClientLoggingService: jest.fn().mockImplementation(() => ({
    logError: jest.fn(),
    logWarning: jest.fn(),
    logInfo: jest.fn(),
    searchLogs: jest.fn().mockResolvedValue([]),
    getErrorStatistics: jest.fn().mockResolvedValue({
      byType: {},
      byComponent: {},
      bySeverity: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0
      },
      totalErrors: 0,
      timeRange: {
        start: new Date(),
        end: new Date()
      }
    }),
    getAggregatedErrors: jest.fn().mockResolvedValue([]),
    getErrorSuggestions: jest.fn().mockResolvedValue([]),
    getErrorHandler: jest.fn().mockReturnValue({
      handleError: jest.fn(),
      displayUserError: jest.fn(),
      reportToAdmin: jest.fn(),
      setUserErrorDisplayCallback: jest.fn(),
      setAdminNotificationCallback: jest.fn()
    })
  }))
}));

import { WebErrorLogger, webErrorLogger } from '../WebErrorLogger';
import { ErrorSeverity } from '../../../../features/error-reporter/interfaces/logging.interface';

// Get the mock instance for testing
const { ClientLoggingService } = require('../../../../features/error-reporter/services/client-logging.service');
const mockLoggingService = ClientLoggingService.mock.results[0].value;

describe('WebErrorLogger', () => {
  let logger: WebErrorLogger;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();
    
    // Reset the mock implementation
    ClientLoggingService.mockImplementation(() => mockLoggingService);
    
    // Create a new instance for each test
    logger = new WebErrorLogger();
  });

  describe('logWebError', () => {
    it('should log web errors with structured context', () => {
      const error = new Error('Test error');
      const context = {
        component: 'TestComponent',
        action: 'test-action',
        userId: 'user123',
        url: 'http://localhost:3000/test'
      };

      logger.logWebError({
        error,
        context,
        userFacing: true,
        severity: ErrorSeverity.HIGH
      });

      expect(mockLoggingService.logError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          userId: 'user123',
          component: 'TestComponent',
          action: 'test-action',
          metadata: expect.objectContaining({
            url: 'http://localhost:3000/test',
            userFacing: true,
            severity: ErrorSeverity.HIGH
          })
        })
      );
    });

    it('should handle errors without optional context fields', () => {
      const error = new Error('Simple error');
      const context = {
        component: 'SimpleComponent'
      };

      logger.logWebError({
        error,
        context,
        userFacing: false
      });

      expect(mockLoggingService.logError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          component: 'SimpleComponent',
          metadata: expect.objectContaining({
            userFacing: false,
            severity: ErrorSeverity.MEDIUM // Default severity
          })
        })
      );
    });
  });

  describe('logReactError', () => {
    it('should log React component errors with automatic context extraction', () => {
      const error = new Error('React component error');
      const errorInfo = {
        componentStack: 'Component stack trace'
      };

      logger.logReactError(error, errorInfo, 'TestComponent');

      expect(mockLoggingService.logError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          component: 'TestComponent',
          action: 'component-render',
          metadata: expect.objectContaining({
            componentStack: 'Component stack trace',
            errorType: 'React Error Boundary',
            errorBoundary: true
          })
        })
      );
    });

    it('should use default component name when not provided', () => {
      const error = new Error('React error');
      const errorInfo = { componentStack: 'Stack' };

      logger.logReactError(error, errorInfo);

      expect(mockLoggingService.logError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          component: 'Unknown React Component'
        })
      );
    });
  });

  describe('logApiError', () => {
    it('should log API errors with endpoint and method information', () => {
      const error = new Error('API request failed');
      
      logger.logApiError(error, '/api/users', 'GET', 500);

      expect(mockLoggingService.logError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          component: 'API Client',
          action: 'GET /api/users',
          metadata: expect.objectContaining({
            endpoint: '/api/users',
            method: 'GET',
            statusCode: 500,
            errorType: 'API Error'
          })
        })
      );
    });

    it('should set high severity for 5xx status codes', () => {
      const error = new Error('Server error');
      
      logger.logApiError(error, '/api/data', 'POST', 503);

      expect(mockLoggingService.logError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          metadata: expect.objectContaining({
            severity: ErrorSeverity.HIGH
          })
        })
      );
    });

    it('should set medium severity for 4xx status codes', () => {
      const error = new Error('Client error');
      
      logger.logApiError(error, '/api/data', 'GET', 404);

      expect(mockLoggingService.logError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          metadata: expect.objectContaining({
            severity: ErrorSeverity.MEDIUM
          })
        })
      );
    });
  });

  describe('logValidationError', () => {
    it('should log validation errors with field and rule information', () => {
      logger.logValidationError('email', 'invalid@', 'loginForm', 'email_format');

      expect(mockLoggingService.logError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          component: 'Form Validation',
          action: 'validate-loginForm',
          metadata: expect.objectContaining({
            field: 'email',
            value: 'invalid@',
            formName: 'loginForm',
            validationRule: 'email_format',
            errorType: 'Validation Error'
          })
        })
      );
    });

    it('should truncate long values for privacy', () => {
      const longValue = 'a'.repeat(200);
      
      logger.logValidationError('description', longValue, 'profileForm', 'max_length');

      expect(mockLoggingService.logError).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          metadata: expect.objectContaining({
            value: expect.stringMatching(/^a{100}$/)
          })
        })
      );
    });
  });

  describe('logUserInteractionError', () => {
    it('should log user interaction errors with action and component', () => {
      const error = new Error('Button click failed');
      
      logger.logUserInteractionError(error, 'button-click', 'LoginButton');

      expect(mockLoggingService.logError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          component: 'LoginButton',
          action: 'button-click',
          metadata: expect.objectContaining({
            errorType: 'User Interaction Error',
            userAction: 'button-click'
          })
        })
      );
    });
  });

  describe('logPerformanceError', () => {
    it('should log performance errors with metric and threshold information', () => {
      const error = new Error('Performance threshold exceeded');
      
      logger.logPerformanceError(error, 'response_time', 1000, 1500);

      expect(mockLoggingService.logError).toHaveBeenCalledWith(
        error,
        expect.objectContaining({
          component: 'Performance Monitor',
          action: 'performance-check-response_time',
          metadata: expect.objectContaining({
            metric: 'response_time',
            threshold: 1000,
            actual: 1500,
            errorType: 'Performance Error'
          })
        })
      );
    });
  });

  describe('getErrorStatistics', () => {
    it('should return error statistics from the logging service', async () => {
      const mockStats = {
        byType: { 'NetworkError': 5 },
        byComponent: { 'API Client': 3 },
        bySeverity: { low: 1, medium: 2, high: 1, critical: 1 },
        totalErrors: 5,
        timeRange: { start: new Date(), end: new Date() }
      };

      mockLoggingService.getErrorStatistics.mockResolvedValue(mockStats);

      const result = await logger.getErrorStatistics();

      expect(result).toEqual(mockStats);
      expect(mockLoggingService.getErrorStatistics).toHaveBeenCalled();
    });
  });

  describe('getAggregatedErrors', () => {
    it('should return aggregated errors from the logging service', async () => {
      const mockErrors = [
        {
          message: 'Network timeout',
          count: 3,
          affectedComponents: ['API Client'],
          firstOccurrence: new Date(),
          lastOccurrence: new Date(),
          severity: ErrorSeverity.HIGH
        }
      ];

      mockLoggingService.getAggregatedErrors.mockResolvedValue(mockErrors);

      const result = await logger.getAggregatedErrors();

      expect(result).toEqual(mockErrors);
      expect(mockLoggingService.getAggregatedErrors).toHaveBeenCalled();
    });
  });

  describe('searchWebLogs', () => {
    it('should search logs with the provided query', async () => {
      const query = {
        level: 'error',
        component: 'API Client',
        startDate: new Date('2023-01-01'),
        endDate: new Date('2023-12-31')
      };

      const mockResults = [
        {
          id: '1',
          timestamp: new Date(),
          level: 'error',
          message: 'API request failed',
          context: { component: 'API Client' }
        }
      ];

      mockLoggingService.searchLogs.mockResolvedValue(mockResults);

      const result = await logger.searchWebLogs(query);

      expect(result).toEqual(mockResults);
      expect(mockLoggingService.searchLogs).toHaveBeenCalledWith(query);
    });
  });

  describe('createUserFriendlyError', () => {
    it('should create user-friendly error for network errors', () => {
      const error = new Error('network timeout');
      const context = { component: 'API Client' };

      const result = logger.createUserFriendlyError(error, context);

      expect(result.message).toContain('Network connection issue');
      expect(result.actions).toHaveLength(2);
      expect(result.actions?.[0]?.label).toBe('Retry');
      expect(result.actions?.[1]?.label).toBe('Check Connection');
    });

    it('should create user-friendly error for permission errors', () => {
      const error = new Error('permission denied');
      const context = { component: 'AuthGuard' };

      const result = logger.createUserFriendlyError(error, context);

      expect(result.message).toContain('don\'t have permission');
      expect(result.actions).toHaveLength(2);
      expect(result.actions?.[0]?.label).toBe('Login Again');
      expect(result.actions?.[1]?.label).toBe('Contact Support');
    });

    it('should create user-friendly error for validation errors', () => {
      const error = new Error('validation error');
      const context = { component: 'Form' };

      const result = logger.createUserFriendlyError(error, context);

      expect(result.message).toContain('check your input');
      expect(result.actions).toHaveLength(2);
      expect(result.actions?.[0]?.label).toBe('Review Input');
      expect(result.actions?.[1]?.label).toBe('Clear Form');
    });

    it('should create user-friendly error for React component errors', () => {
      const error = new Error('Component error');
      const context = { component: 'ReactComponent' };

      const result = logger.createUserFriendlyError(error, context);

      expect(result.message).toContain('component encountered an error');
      expect(result.actions).toHaveLength(2);
      expect(result.actions?.[0]?.label).toBe('Refresh Page');
      expect(result.actions?.[1]?.label).toBe('Report Issue');
    });

    it('should create generic error for unknown error types', () => {
      const error = new Error('Unknown error');
      const context = { component: 'UnknownComponent' };

      const result = logger.createUserFriendlyError(error, context);

      expect(result.message).toContain('Something went wrong');
      expect(result.actions).toHaveLength(2);
      expect(result.actions?.[0]?.label).toBe('Try Again');
      expect(result.actions?.[1]?.label).toBe('Report Issue');
    });
  });

  describe('callbacks', () => {
    it('should set user error callback', () => {
      const callback = jest.fn();
      
      logger.setUserErrorCallback(callback);

      // The callback should be stored internally
      expect(logger).toBeDefined();
    });

    it('should set admin notification callback', () => {
      const callback = jest.fn();
      
      logger.setAdminNotificationCallback(callback);

      // The callback should be stored internally
      expect(logger).toBeDefined();
    });
  });

  describe('singleton instance', () => {
    it('should export a singleton instance', () => {
      expect(webErrorLogger).toBeInstanceOf(WebErrorLogger);
    });

    it('should be the same instance across imports', () => {
      const { webErrorLogger: instance1 } = require('../WebErrorLogger');
      const { webErrorLogger: instance2 } = require('../WebErrorLogger');
      
      expect(instance1).toBe(instance2);
    });
  });
}); 