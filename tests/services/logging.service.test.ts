import { LoggingService } from '../../src/services/logging.service';
import { LogLevel, LogContext, LogEntry, LogQuery, ErrorContext, ErrorSeverity, ErrorAction } from '../../src/interfaces/logging.interface';

describe('LoggingService', () => {
  let loggingService: LoggingService;
  let mockStorage: Map<string, LogEntry>;

  beforeEach(() => {
    mockStorage = new Map();
    loggingService = new LoggingService({
      storage: mockStorage,
      maxEntries: 1000,
      enableConsoleOutput: false
    });
  });

  afterEach(() => {
    mockStorage.clear();
  });

  describe('Structured Logging', () => {
    it('should log error with full context and stack trace', async () => {
      const error = new Error('Test error');
      const context: LogContext = {
        userId: 'user123',
        pluginId: 'test-plugin',
        component: 'TestComponent',
        action: 'testAction',
        metadata: { key: 'value' }
      };

      loggingService.logError(error, context);

      const logs = await loggingService.searchLogs({ level: LogLevel.ERROR });
      expect(logs).toHaveLength(1);
      expect(logs[0]?.level).toBe(LogLevel.ERROR);
      expect(logs[0]?.message).toBe('Test error');
      expect(logs[0]?.context).toEqual(context);
      expect(logs[0]?.stackTrace).toBeDefined();
      expect(logs[0]?.timestamp).toBeInstanceOf(Date);
    });

    it('should log warning with context', async () => {
      const message = 'Test warning';
      const context: LogContext = {
        pluginId: 'test-plugin',
        component: 'TestComponent'
      };

      loggingService.logWarning(message, context);

      const logs = await loggingService.searchLogs({ level: LogLevel.WARNING });
      expect(logs).toHaveLength(1);
      expect(logs[0]?.level).toBe(LogLevel.WARNING);
      expect(logs[0]?.message).toBe(message);
      expect(logs[0]?.context).toEqual(context);
    });

    it('should log info with metadata', async () => {
      const message = 'Test info';
      const context: LogContext = {
        metadata: { action: 'user_login', duration: 150 }
      };

      loggingService.logInfo(message, context);

      const logs = await loggingService.searchLogs({ level: LogLevel.INFO });
      expect(logs).toHaveLength(1);
      expect(logs[0]?.metadata).toEqual(context.metadata);
    });

    it('should generate unique IDs for log entries', () => {
      loggingService.logError(new Error('Error 1'), {});
      loggingService.logError(new Error('Error 2'), {});

      const allLogs = Array.from(mockStorage.values());
      expect(allLogs).toHaveLength(2);
      expect(allLogs[0]?.id).not.toBe(allLogs[1]?.id);
    });

    it('should include all required fields in log entries', () => {
      const error = new Error('Test error');
      const context: LogContext = {
        userId: 'user123',
        pluginId: 'test-plugin'
      };

      loggingService.logError(error, context);

      const logEntry = Array.from(mockStorage.values())[0];
      expect(logEntry).toHaveProperty('id');
      expect(logEntry).toHaveProperty('timestamp');
      expect(logEntry).toHaveProperty('level');
      expect(logEntry).toHaveProperty('message');
      expect(logEntry).toHaveProperty('context');
      expect(logEntry).toHaveProperty('stackTrace');
      expect(logEntry).toHaveProperty('metadata');
    });
  });

  describe('Error Aggregation and Categorization', () => {
    it('should categorize errors by type', async () => {
      // Create errors with proper error type prefix in message
      loggingService.logError(new Error('TypeError: Type error'), { component: 'ComponentA' });
      loggingService.logError(new Error('ReferenceError: Reference error'), { component: 'ComponentB' });
      loggingService.logError(new Error('TypeError: Another type error'), { component: 'ComponentC' });

      const errorStats = await loggingService.getErrorStatistics();
      expect(errorStats.byType['TypeError']).toBe(2);
      expect(errorStats.byType['ReferenceError']).toBe(1);
    });

    it('should aggregate similar error messages', async () => {
      loggingService.logError(new Error('Connection failed'), { component: 'NetworkService' });
      loggingService.logError(new Error('Connection failed'), { component: 'NetworkService' });
      loggingService.logError(new Error('Connection failed'), { component: 'APIService' });

      const aggregatedErrors = await loggingService.getAggregatedErrors();
      const connectionErrors = aggregatedErrors.find(err => err.message.includes('Connection failed'));
      
      expect(connectionErrors).toBeDefined();
      expect(connectionErrors!.count).toBe(3);
      expect(connectionErrors!.affectedComponents).toContain('NetworkService');
      expect(connectionErrors!.affectedComponents).toContain('APIService');
    });

    it('should categorize errors by component', async () => {
      loggingService.logError(new Error('Plugin error'), { pluginId: 'plugin1' });
      loggingService.logError(new Error('Auth error'), { component: 'AuthService' });
      loggingService.logError(new Error('Another plugin error'), { pluginId: 'plugin2' });

      const errorStats = await loggingService.getErrorStatistics();
      expect(errorStats.byComponent['plugin1']).toBe(1);
      expect(errorStats.byComponent['plugin2']).toBe(1);
      expect(errorStats.byComponent['AuthService']).toBe(1);
    });

    it('should suggest solutions for common error patterns', async () => {
      loggingService.logError(new Error('ENOTFOUND'), { component: 'NetworkService' });
      loggingService.logError(new Error('Connection timeout'), { component: 'APIService' });

      const suggestions = await loggingService.getErrorSuggestions();
      const networkSuggestion = suggestions.find(s => s.action === 'retry_connection');
      expect(networkSuggestion).toBeDefined();
      expect(networkSuggestion?.suggestion).toBe('Check network connectivity and firewall settings');
      expect(networkSuggestion?.action).toBe('retry_connection');
    });
  });

  describe('Log Search and Querying', () => {
    beforeEach(() => {
      // Setup test data
      loggingService.logError(new Error('Error 1'), { userId: 'user1', pluginId: 'plugin1' });
      loggingService.logWarning('Warning 1', { userId: 'user1', component: 'ComponentA' });
      loggingService.logInfo('Info 1', { pluginId: 'plugin2' });
      loggingService.logError(new Error('Error 2'), { userId: 'user2', pluginId: 'plugin1' });
    });

    it('should search logs by level', async () => {
      const errorLogs = await loggingService.searchLogs({ level: LogLevel.ERROR });
      expect(errorLogs).toHaveLength(2);
      expect(errorLogs.every(log => log.level === LogLevel.ERROR)).toBe(true);
    });

    it('should search logs by user ID', async () => {
      const user1Logs = await loggingService.searchLogs({ userId: 'user1' });
      expect(user1Logs).toHaveLength(2);
      expect(user1Logs.every(log => log.context.userId === 'user1')).toBe(true);
    });

    it('should search logs by plugin ID', async () => {
      const plugin1Logs = await loggingService.searchLogs({ pluginId: 'plugin1' });
      expect(plugin1Logs).toHaveLength(2);
      expect(plugin1Logs.every(log => log.context.pluginId === 'plugin1')).toBe(true);
    });

    it('should search logs by date range', async () => {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      
      const recentLogs = await loggingService.searchLogs({
        startDate: oneHourAgo,
        endDate: now
      });
      
      expect(recentLogs).toHaveLength(4); // All logs should be recent
    });

    it('should search logs by message content', async () => {
      const errorLogs = await loggingService.searchLogs({ messageContains: 'Error' });
      expect(errorLogs).toHaveLength(2);
      expect(errorLogs.every(log => log.message.includes('Error'))).toBe(true);
    });

    it('should combine multiple search criteria', async () => {
      const specificLogs = await loggingService.searchLogs({
        level: LogLevel.ERROR,
        userId: 'user1'
      });
      
      expect(specificLogs).toHaveLength(1);
      expect(specificLogs[0]?.level).toBe(LogLevel.ERROR);
      expect(specificLogs[0]?.context.userId).toBe('user1');
    });
  });

  describe('User-Friendly Error Display', () => {
    it('should display user-friendly error with suggested actions', () => {
      const errorHandler = loggingService.getErrorHandler();
      const mockDisplayCallback = jest.fn();
      errorHandler.setUserErrorDisplayCallback(mockDisplayCallback);

      const error = new Error('Network connection failed');
      const context: ErrorContext = {
        userFacing: true,
        severity: ErrorSeverity.HIGH,
        component: 'NetworkService'
      };

      errorHandler.handleError(error, context);

      expect(mockDisplayCallback).toHaveBeenCalledWith({
        message: 'Connection problem detected. Please check your internet connection.',
        actions: [
          { label: 'Retry', action: 'retry_connection' },
          { label: 'Check Settings', action: 'open_network_settings' }
        ],
        severity: ErrorSeverity.HIGH
      });
    });

    it('should hide technical details from user-facing errors', () => {
      const errorHandler = loggingService.getErrorHandler();
      const mockDisplayCallback = jest.fn();
      errorHandler.setUserErrorDisplayCallback(mockDisplayCallback);

      const error = new Error('TypeError: Cannot read property "foo" of undefined at line 42');
      const context: ErrorContext = {
        userFacing: true,
        severity: ErrorSeverity.MEDIUM,
        component: 'UIComponent'
      };

      errorHandler.handleError(error, context);

      const displayedError = mockDisplayCallback.mock.calls[0][0];
      expect(displayedError.message).not.toContain('TypeError');
      expect(displayedError.message).not.toContain('line 42');
      expect(displayedError.message).toContain('unexpected error');
    });

    it('should provide recovery actions for common error types', () => {
      const errorHandler = loggingService.getErrorHandler();
      const mockDisplayCallback = jest.fn();
      errorHandler.setUserErrorDisplayCallback(mockDisplayCallback);

      const error = new Error('Plugin failed to load');
      const context: ErrorContext = {
        userFacing: true,
        severity: ErrorSeverity.MEDIUM,
        pluginId: 'test-plugin'
      };

      errorHandler.handleError(error, context);

      const displayedError = mockDisplayCallback.mock.calls[0][0];
      expect(displayedError.actions).toContainEqual({
        label: 'Disable Plugin',
        action: 'disable_plugin',
        data: { pluginId: 'test-plugin' }
      });
    });

    it('should escalate critical errors to admin dashboard', () => {
      const errorHandler = loggingService.getErrorHandler();
      const mockAdminNotification = jest.fn();
      errorHandler.setAdminNotificationCallback(mockAdminNotification);

      const error = new Error('Critical system failure');
      const context: ErrorContext = {
        severity: ErrorSeverity.CRITICAL,
        component: 'CoreSystem'
      };

      errorHandler.handleError(error, context);

      expect(mockAdminNotification).toHaveBeenCalledWith({
        error,
        context,
        severity: ErrorSeverity.CRITICAL,
        timestamp: expect.any(Date),
        requiresImmedateAttention: true
      });
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('should handle logging when storage is full', () => {
      const smallStorageService = new LoggingService({
        storage: new Map(),
        maxEntries: 2,
        enableConsoleOutput: false
      });

      // Fill storage to capacity
      smallStorageService.logError(new Error('Error 1'), {});
      smallStorageService.logError(new Error('Error 2'), {});
      
      // This should remove oldest entry and add new one
      smallStorageService.logError(new Error('Error 3'), {});

      const allLogs = Array.from(smallStorageService['storage'].values());
      expect(allLogs).toHaveLength(2);
      expect(allLogs.some(log => log.message === 'Error 1')).toBe(false);
      expect(allLogs.some(log => log.message === 'Error 3')).toBe(true);
    });

    it('should fallback to console when main logging fails', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const failingStorage = {
        set: jest.fn().mockImplementation(() => {
          throw new Error('Storage failed');
        }),
        values: jest.fn().mockReturnValue([])
      };

      const failingService = new LoggingService({
        storage: failingStorage as any,
        maxEntries: 1000,
        enableConsoleOutput: true
      });

      failingService.logError(new Error('Test error'), {});

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Logging system failure'),
        expect.any(Error)
      );
      
      consoleSpy.mockRestore();
    });

    it('should handle circular reference in context metadata', () => {
      const circularObj: any = { name: 'test' };
      circularObj.self = circularObj;

      expect(() => {
        loggingService.logError(new Error('Test'), { metadata: circularObj });
      }).not.toThrow();

      const logs = Array.from(mockStorage.values());
      expect(logs).toHaveLength(1);
      expect(logs[0]?.metadata).toBeDefined();
    });
  });

  describe('Performance and Memory Management', () => {
    it('should limit log storage to maxEntries', () => {
      const limitedService = new LoggingService({
        storage: new Map(),
        maxEntries: 5,
        enableConsoleOutput: false
      });

      // Add more logs than the limit
      for (let i = 0; i < 10; i++) {
        limitedService.logError(new Error(`Error ${i}`), {});
      }

      const allLogs = Array.from(limitedService['storage'].values());
      expect(allLogs).toHaveLength(5);
      
      // Should keep the most recent logs
      expect(allLogs.some(log => log.message === 'Error 9')).toBe(true);
      expect(allLogs.some(log => log.message === 'Error 0')).toBe(false);
    });

    it('should efficiently search large log volumes', async () => {
      // Add many logs
      for (let i = 0; i < 1000; i++) {
        loggingService.logError(new Error(`Error ${i}`), { 
          userId: i % 10 === 0 ? 'special-user' : `user${i}` 
        });
      }

      const startTime = Date.now();
      const specialUserLogs = await loggingService.searchLogs({ userId: 'special-user' });
      const searchTime = Date.now() - startTime;

      expect(specialUserLogs).toHaveLength(100); // Every 10th log
      expect(searchTime).toBeLessThan(100); // Should be fast
    });
  });
}); 