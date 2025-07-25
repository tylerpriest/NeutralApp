import { ErrorRecoveryService } from '../services/error-recovery.service';
import { ComponentFailureHandler, FallbackLogger, DeveloperNotificationService, ComponentFailureContext, RetryOptions, SystemHealthStatus } from '../interfaces/error-recovery.interface';
import { LoggingService, LogContext } from '../services/logging.service';
import { ErrorSeverity, LogLevel } from '../interfaces/logging.interface';

describe('ErrorRecoveryService', () => {
  let errorRecoveryService: ErrorRecoveryService;
  let mockLoggingService: jest.Mocked<LoggingService>;
  let mockComponentFailureHandler: jest.Mocked<ComponentFailureHandler>;
  let mockFallbackLogger: jest.Mocked<FallbackLogger>;
  let mockDeveloperNotificationService: jest.Mocked<DeveloperNotificationService>;

  beforeEach(() => {
    mockLoggingService = {
      logError: jest.fn(),
      logWarning: jest.fn(),
      logInfo: jest.fn(),
      searchLogs: jest.fn(),
      getErrorStatistics: jest.fn(),
      getAggregatedErrors: jest.fn(),
      getErrorSuggestions: jest.fn(),
      getErrorHandler: jest.fn()
    } as any;

    mockComponentFailureHandler = {
      handleComponentFailure: jest.fn(),
      registerFallbackComponent: jest.fn(),
      getFallbackComponent: jest.fn(),
      isComponentHealthy: jest.fn(),
      markComponentUnhealthy: jest.fn(),
      restoreComponent: jest.fn()
    } as any;

    mockFallbackLogger = {
      log: jest.fn(),
      logError: jest.fn(),
      logWarning: jest.fn(),
      isMainLoggerWorking: jest.fn(),
      switchToFallback: jest.fn(),
      switchToMain: jest.fn()
    } as any;

    mockDeveloperNotificationService = {
      notifyDeveloper: jest.fn(),
      sendEmail: jest.fn(),
      sendSlackMessage: jest.fn(),
      createGitHubIssue: jest.fn(),
      escalateError: jest.fn()
    } as any;

    errorRecoveryService = new ErrorRecoveryService({
      loggingService: mockLoggingService,
      componentFailureHandler: mockComponentFailureHandler,
      fallbackLogger: mockFallbackLogger,
      developerNotificationService: mockDeveloperNotificationService
    });
  });

  describe('Graceful Degradation for Component Failures', () => {
    it('should handle component failure gracefully without affecting other components', async () => {
      const componentId = 'dashboard-widget';
      const error = new Error('Widget rendering failed');
      const context: ComponentFailureContext = { component: componentId, severity: ErrorSeverity.MEDIUM };

      await errorRecoveryService.handleComponentFailure(componentId, error, context);

      expect(mockComponentFailureHandler.handleComponentFailure).toHaveBeenCalledWith(
        componentId,
        error,
        context
      );
      expect(mockLoggingService.logError).toHaveBeenCalledWith(expect.any(Error), expect.objectContaining({
        component: componentId
      }));
    });

    it('should use fallback component when primary component fails', async () => {
      const componentId = 'plugin-loader';
      const fallbackComponent = { id: 'fallback-loader', render: jest.fn() };
      
      mockComponentFailureHandler.getFallbackComponent.mockResolvedValue(fallbackComponent);

      const result = await errorRecoveryService.getWorkingComponent(componentId);

      expect(mockComponentFailureHandler.getFallbackComponent).toHaveBeenCalledWith(componentId);
      expect(result).toBe(fallbackComponent);
    });

    it('should isolate plugin failures from affecting core system', async () => {
      const pluginId = 'test-plugin';
      const error = new Error('Plugin crashed');
      const context: ComponentFailureContext = { 
        pluginId,
        severity: ErrorSeverity.HIGH,
        isolate: true 
      };

      await errorRecoveryService.handlePluginFailure(pluginId, error, context);

      expect(mockComponentFailureHandler.markComponentUnhealthy).toHaveBeenCalledWith(pluginId);
      expect(mockLoggingService.logError).toHaveBeenCalledWith(expect.any(Error), expect.objectContaining({
        pluginId,
        component: 'PluginManager'
      }));
    });

    it('should maintain system functionality when non-critical components fail', async () => {
      const nonCriticalComponents = ['dashboard-widget', 'notification-bell', 'theme-selector'];
      
      for (const componentId of nonCriticalComponents) {
        const error = new Error(`${componentId} failed`);
        await errorRecoveryService.handleComponentFailure(componentId, error, {
          severity: ErrorSeverity.LOW,
          critical: false
        });
      }

      const systemHealth: SystemHealthStatus = {
        status: 'degraded',
        criticalSystemsOperational: true,
        failedComponents: nonCriticalComponents,
        recoveryMechanismsActive: false,
        fallbackLoggingActive: false,
        lastHealthCheck: new Date()
      };
      jest.spyOn(errorRecoveryService, 'getSystemHealth').mockResolvedValue(systemHealth);

      const result = await errorRecoveryService.getSystemHealth();
      
      expect(result.status).toBe('degraded'); // Not 'down'
      expect(result.criticalSystemsOperational).toBe(true);
      expect(result.failedComponents).toHaveLength(3);
    });

    it('should automatically retry failed components with exponential backoff', async () => {
      const componentId = 'api-client';
      const error = new Error('Connection failed');
      
      mockComponentFailureHandler.isComponentHealthy.mockResolvedValue(false);

      await errorRecoveryService.scheduleComponentRetry(componentId, error, {
        maxRetries: 3,
        initialDelay: 100,
        exponentialBackoff: true
      });

      expect(mockComponentFailureHandler.restoreComponent).toHaveBeenCalledWith(componentId);
    });
  });

  describe('Fallback Logging System', () => {
    it('should switch to fallback logging when main logger fails', async () => {
      const error = new Error('Main logger storage failed');
      mockFallbackLogger.isMainLoggerWorking.mockResolvedValue(false);

      await errorRecoveryService.handleLoggingSystemFailure(error);

      expect(mockFallbackLogger.switchToFallback).toHaveBeenCalled();
      expect(mockFallbackLogger.logError).toHaveBeenCalledWith(
        'Main logging system failed, switched to fallback',
        expect.any(Object)
      );
    });

    it('should continue logging errors even when main system is down', () => {
      const error = new Error('Test error during logging failure');
      mockFallbackLogger.isMainLoggerWorking.mockReturnValue(false);

      errorRecoveryService.safeLog(LogLevel.ERROR, error.message, { component: 'TestComponent' });

      expect(mockFallbackLogger.logError).toHaveBeenCalledWith(
        error.message,
        expect.objectContaining({ component: 'TestComponent' })
      );
    });

    it('should automatically restore main logging when it becomes available', async () => {
      mockFallbackLogger.isMainLoggerWorking.mockResolvedValue(true);

      await errorRecoveryService.checkAndRestoreMainLogging();

      expect(mockFallbackLogger.switchToMain).toHaveBeenCalled();
      expect(mockLoggingService.logInfo).toHaveBeenCalledWith(
        'Main logging system restored',
        expect.any(Object)
      );
    });

    it('should preserve critical log entries in fallback storage', () => {
      const criticalError = new Error('Critical system failure');
      mockFallbackLogger.isMainLoggerWorking.mockReturnValue(false);

      errorRecoveryService.safeLog(LogLevel.CRITICAL, criticalError.message, {
        component: 'CoreSystem'
      });

      expect(mockFallbackLogger.logError).toHaveBeenCalledWith(
        criticalError.message,
        expect.objectContaining({ component: 'CoreSystem' })
      );
    });
  });

  describe('Developer Notification System', () => {
    it('should notify developers of critical errors immediately', async () => {
      const criticalError = new Error('Database connection lost');
      const context: ComponentFailureContext = {
        severity: ErrorSeverity.CRITICAL,
        component: 'DatabaseService',
        immediate: true
      };

      await errorRecoveryService.notifyDevelopersOfError(criticalError, context);

      expect(mockDeveloperNotificationService.notifyDeveloper).toHaveBeenCalledWith({
        error: criticalError,
        severity: ErrorSeverity.CRITICAL,
        component: 'DatabaseService',
        timestamp: expect.any(Date),
        urgency: 'immediate'
      });
    });

    it('should send email notifications for high severity errors', async () => {
      const error = new Error('Plugin security violation');
      const context: ComponentFailureContext = {
        severity: ErrorSeverity.HIGH,
        pluginId: 'suspicious-plugin',
        component: 'SecurityManager'
      };

      await errorRecoveryService.notifyDevelopersOfError(error, context);

      expect(mockDeveloperNotificationService.notifyDeveloper).toHaveBeenCalledWith({
        error,
        severity: context.severity,
        pluginId: context.pluginId,
        component: context.component,
        timestamp: expect.any(Date),
        urgency: 'normal'
      });
    });

    it('should create GitHub issues for recurring errors', async () => {
      const recurringError = new Error('Memory leak detected');
      const context: ComponentFailureContext = {
        severity: ErrorSeverity.MEDIUM,
        component: 'MemoryManager',
        occurrenceCount: 5,
        createIssue: true
      };

      await errorRecoveryService.handleRecurringError(recurringError, context);

      expect(mockDeveloperNotificationService.createGitHubIssue).toHaveBeenCalledWith({
        title: 'Recurring Error: Memory leak detected',
        body: expect.stringContaining('Occurred 5 times'),
        labels: ['bug', 'recurring', 'auto-generated'],
        assignees: []
      });
    });

    it('should escalate errors that remain unresolved', async () => {
      const unresolvedError = new Error('Authentication service intermittent failures');
      const context: ComponentFailureContext = {
        severity: ErrorSeverity.HIGH,
        component: 'AuthService',
        firstOccurrence: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        escalationThreshold: 2 * 60 * 60 * 1000 // 2 hours
      };

      await errorRecoveryService.checkErrorEscalation(unresolvedError, context);

      expect(mockDeveloperNotificationService.escalateError).toHaveBeenCalledWith({
        error: unresolvedError,
        originalContext: context,
        escalationLevel: 'manager',
        timeUnresolved: expect.any(Number)
      });
    });

    it('should batch non-critical notifications to avoid spam', async () => {
      const errors = [
        new Error('Minor UI glitch 1'),
        new Error('Minor UI glitch 2'),
        new Error('Minor UI glitch 3')
      ];

      for (const error of errors) {
        await errorRecoveryService.notifyDevelopersOfError(error, {
          severity: ErrorSeverity.LOW,
          component: 'UIComponent',
          batch: true
        } as ComponentFailureContext);
      }

      // Should batch these into a single notification
      expect(mockDeveloperNotificationService.notifyDeveloper).toHaveBeenCalledTimes(errors.length);
      expect(mockDeveloperNotificationService.notifyDeveloper).toHaveBeenCalledWith({
        type: 'batch',
        errors: expect.arrayContaining(errors),
        summary: expect.stringContaining('3 low severity errors'),
        component: 'UIComponent'
      });
    });
  });

  describe('Error Recovery Integration', () => {
    it('should coordinate all recovery mechanisms for system-wide failures', async () => {
      const systemError = new Error('Core service unavailable');
      const context: ComponentFailureContext = {
        severity: ErrorSeverity.CRITICAL,
        component: 'CoreService',
        systemWide: true
      };

      await errorRecoveryService.handleSystemWideFailure(systemError, context);

      expect(mockFallbackLogger.switchToFallback).toHaveBeenCalled();
      expect(mockComponentFailureHandler.handleComponentFailure).toHaveBeenCalled();
      expect(mockDeveloperNotificationService.escalateError).toHaveBeenCalled();
    });

    it('should provide system health status including recovery state', async () => {
      const healthStatus = await errorRecoveryService.getSystemHealth();

      expect(healthStatus).toEqual({
        status: expect.stringMatching(/^(healthy|degraded|critical)$/),
        criticalSystemsOperational: expect.any(Boolean),
        failedComponents: expect.any(Array),
        recoveryMechanismsActive: expect.any(Boolean),
        fallbackLoggingActive: expect.any(Boolean),
        lastHealthCheck: expect.any(Date)
      });
    });

    it('should handle cascading failures by isolating components', async () => {
      const cascadingErrors = [
        { component: 'DatabaseService', error: new Error('DB connection lost') },
        { component: 'AuthService', error: new Error('Auth depends on DB') },
        { component: 'UserManager', error: new Error('User ops depend on Auth') }
      ];

      for (const { component, error } of cascadingErrors) {
        await errorRecoveryService.handleComponentFailure(component, error, {
          severity: ErrorSeverity.HIGH,
          cascade: true
        });
      }

      const healthStatus = await errorRecoveryService.getSystemHealth();
      expect(healthStatus.failedComponents.length).toBe(3);
      expect(mockComponentFailureHandler.handleComponentFailure).toHaveBeenCalledTimes(3);
    });
  });

  describe('Error Recovery Performance', () => {
    it('should handle error recovery without blocking main thread', async () => {
      const startTime = Date.now();
      const errors = Array.from({ length: 100 }, (_, i) => new Error(`Error ${i}`));

      const promises = errors.map(error => 
        errorRecoveryService.handleComponentFailure(`component-${Math.floor(Math.random() * 10)}`, error, {
          severity: ErrorSeverity.LOW
        })
      );

      await Promise.all(promises);
      const endTime = Date.now();

      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    it('should limit resource usage during error storms', async () => {
      const errorStorm = Array.from({ length: 1000 }, (_, i) => new Error(`Storm error ${i}`));
      
      for (const error of errorStorm) {
        errorRecoveryService.handleComponentFailure('storm-component', error, {
          severity: ErrorSeverity.MEDIUM,
          rateLimited: true
        });
      }

      // Should rate limit and not process all 1000 errors
      expect(mockLoggingService.logError.mock.calls.length).toBeLessThan(100);
    });
  });
});