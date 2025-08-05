import { 
  LoggingService as ILoggingService,
  LogLevel, 
  LogEntry, 
  LogQuery,
  ErrorContext,
  ErrorSeverity,
  ErrorAction,
  UserFriendlyError,
  AdminNotification,
  ErrorStatistics,
  AggregatedError,
  ErrorSuggestion,
  LoggingConfiguration,
  ErrorHandler
} from '../interfaces/logging.interface';
import { ClientMonitoringService, MonitoringConfig, MonitoringProvider } from './client-monitoring.service';

export interface LogContext {
  userId?: string;
  pluginId?: string;
  component?: string;
  metadata?: any;
}

export class ClientLoggingService implements ILoggingService {
  private storage: Map<string, LogEntry>;
  private maxEntries: number;
  private enableConsoleOutput: boolean;
  private errorHandler: ErrorHandlerImpl;
  private externalMonitoring?: ClientMonitoringService;

  constructor(config: LoggingConfiguration) {
    this.storage = config.storage;
    this.maxEntries = config.maxEntries;
    this.enableConsoleOutput = config.enableConsoleOutput;
    this.errorHandler = new ErrorHandlerImpl(this);
    
    // Initialize external monitoring if configured
    this.initializeExternalMonitoring();
  }

  logError(error: Error, context: LogContext): void {
    try {
      const logEntry = this.createLogEntry(LogLevel.ERROR, error.message, context, error.stack);
      this.storeLogEntry(logEntry);
      
      // Send to external monitoring
      if (this.externalMonitoring) {
        this.externalMonitoring.captureException(error, {
          user: context.userId ? { id: context.userId } : undefined,
          tags: {
            ...(context.component && { component: context.component }),
            ...(context.pluginId && { pluginId: context.pluginId }),
            level: LogLevel.ERROR
          },
          extra: context.metadata
        });
      }
      
      if (this.enableConsoleOutput) {
        console.error('[LoggingService]', error.message, { context, stack: error.stack });
      }
    } catch (storageError) {
      this.fallbackToConsole(error, storageError as Error);
    }
  }

  logWarning(message: string, context: LogContext): void {
    try {
      const logEntry = this.createLogEntry(LogLevel.WARNING, message, context);
      this.storeLogEntry(logEntry);
      
      if (this.enableConsoleOutput) {
        console.warn('[LoggingService]', message, { context });
      }
    } catch (storageError) {
      this.fallbackToConsole(new Error(message), storageError as Error);
    }
  }

  logInfo(message: string, context: LogContext): void {
    try {
      const logEntry = this.createLogEntry(LogLevel.INFO, message, context);
      this.storeLogEntry(logEntry);
      
      if (this.enableConsoleOutput) {
        console.info('[LoggingService]', message, { context });
      }
    } catch (storageError) {
      this.fallbackToConsole(new Error(message), storageError as Error);
    }
  }

  async searchLogs(query: LogQuery): Promise<LogEntry[]> {
    const allLogs = Array.from(this.storage.values());
    
    let filteredLogs = allLogs.filter(log => {
      // Filter by level
      if (query.level && log.level !== query.level) {
        return false;
      }
      
      // Filter by user ID
      if (query.userId && log.context.userId !== query.userId) {
        return false;
      }
      
      // Filter by plugin ID
      if (query.pluginId && log.context.pluginId !== query.pluginId) {
        return false;
      }
      
      // Filter by component
      if (query.component && log.context.component !== query.component) {
        return false;
      }
      
      // Filter by date range
      if (query.startDate && log.timestamp < query.startDate) {
        return false;
      }
      
      if (query.endDate && log.timestamp > query.endDate) {
        return false;
      }
      
      // Filter by message content
      if (query.messageContains && !log.message.includes(query.messageContains)) {
        return false;
      }
      
      return true;
    });
    
    // Sort by timestamp (newest first)
    filteredLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    // Apply pagination
    if (query.offset) {
      filteredLogs = filteredLogs.slice(query.offset);
    }
    
    if (query.limit) {
      filteredLogs = filteredLogs.slice(0, query.limit);
    }
    
    return filteredLogs;
  }

  async getErrorStatistics(): Promise<ErrorStatistics> {
    const errorLogs = await this.searchLogs({ level: LogLevel.ERROR });
    const criticalLogs = await this.searchLogs({ level: LogLevel.CRITICAL });
    const allErrorLogs = [...errorLogs, ...criticalLogs];
    
    const byType: Record<string, number> = {};
    const byComponent: Record<string, number> = {};
    const bySeverity: Record<ErrorSeverity, number> = {
      [ErrorSeverity.LOW]: 0,
      [ErrorSeverity.MEDIUM]: 0,
      [ErrorSeverity.HIGH]: 0,
      [ErrorSeverity.CRITICAL]: 0
    };
    
    let earliestDate = new Date();
    let latestDate = new Date(0);
    
    allErrorLogs.forEach(log => {
      // Count by error type (try to extract from message)
      const errorType = this.extractErrorType(log.message);
      byType[errorType] = (byType[errorType] || 0) + 1;
      
      // Count by component
      const component = log.context.component ?? log.context.pluginId ?? 'Unknown';
      byComponent[component] = (byComponent[component] || 0) + 1;
      
      // Count by severity
      const severity = log.level === LogLevel.CRITICAL ? ErrorSeverity.CRITICAL : ErrorSeverity.HIGH;
      bySeverity[severity]++;
      
      // Track date range
      if (log.timestamp < earliestDate) {
        earliestDate = log.timestamp;
      }
      if (log.timestamp > latestDate) {
        latestDate = log.timestamp;
      }
    });
    
    return {
      byType,
      byComponent,
      bySeverity,
      totalErrors: allErrorLogs.length,
      timeRange: {
        start: earliestDate,
        end: latestDate
      }
    };
  }

  async getAggregatedErrors(): Promise<AggregatedError[]> {
    const errorLogs = await this.searchLogs({ level: LogLevel.ERROR });
    const criticalLogs = await this.searchLogs({ level: LogLevel.CRITICAL });
    const allErrorLogs = [...errorLogs, ...criticalLogs];
    
    const aggregated = new Map<string, AggregatedError>();
    
    allErrorLogs.forEach(log => {
      const normalizedMessage = this.normalizeErrorMessage(log.message);
      
      if (aggregated.has(normalizedMessage)) {
        const existing = aggregated.get(normalizedMessage)!;
        existing.count++;
        
        const component = log.context.component || log.context.pluginId || 'Unknown';
        if (!existing.affectedComponents.includes(component)) {
          existing.affectedComponents.push(component);
        }
        
        if (log.timestamp > existing.lastOccurrence) {
          existing.lastOccurrence = log.timestamp;
        }
        
        if (log.timestamp < existing.firstOccurrence) {
          existing.firstOccurrence = log.timestamp;
        }
      } else {
        const component = log.context.component || log.context.pluginId || 'Unknown';
        aggregated.set(normalizedMessage, {
          message: normalizedMessage,
          count: 1,
          affectedComponents: [component],
          firstOccurrence: log.timestamp,
          lastOccurrence: log.timestamp,
          severity: log.level === LogLevel.CRITICAL ? ErrorSeverity.CRITICAL : ErrorSeverity.HIGH
        });
      }
    });
    
    return Array.from(aggregated.values())
      .sort((a, b) => b.count - a.count);
  }

  async getErrorSuggestions(): Promise<ErrorSuggestion[]> {
    return [
      {
        pattern: /network|connection|timeout|ENOTFOUND/i,
        suggestion: 'Check network connectivity and firewall settings',
        action: 'retry_connection'
      },
      {
        pattern: /plugin.*failed|plugin.*error/i,
        suggestion: 'Try disabling and re-enabling the affected plugin',
        action: 'restart_plugin'
      },
      {
        pattern: /permission|unauthorized|forbidden/i,
        suggestion: 'Check user permissions and authentication status',
        action: 'check_permissions'
      },
      {
        pattern: /memory|heap|allocation/i,
        suggestion: 'System may be running low on memory',
        action: 'check_memory'
      },
      {
        pattern: /database|storage|data/i,
        suggestion: 'Check database connectivity and storage availability',
        action: 'check_storage'
      }
    ];
  }

  getErrorHandler(): ErrorHandler {
    return this.errorHandler;
  }

  private createLogEntry(level: LogLevel, message: string, context: LogContext, stackTrace?: string): LogEntry {
    const id = this.generateId();
    const timestamp = new Date();
    
    // Safe JSON serialization to handle circular references
    const safeMetadata = this.safeStringify(context.metadata || {});
    
    return {
      id,
      timestamp,
      level,
      message,
      context,
      userId: context.userId || undefined,
      pluginId: context.pluginId || undefined,
      stackTrace: stackTrace || undefined,
      metadata: typeof safeMetadata === 'string' ? JSON.parse(safeMetadata) : safeMetadata
    };
  }

  private storeLogEntry(logEntry: LogEntry): void {
    // Ensure we don't exceed maxEntries
    if (this.storage.size >= this.maxEntries) {
      const oldestEntry = this.findOldestEntry();
      if (oldestEntry) {
        this.storage.delete(oldestEntry.id);
      }
    }
    
    this.storage.set(logEntry.id, logEntry);
  }

  private findOldestEntry(): LogEntry | null {
    let oldest: LogEntry | null = null;
    
    for (const entry of this.storage.values()) {
      if (!oldest || entry.timestamp < oldest.timestamp) {
        oldest = entry;
      }
    }
    
    return oldest;
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private extractErrorType(message: string): string {
    const match = message.match(/^(\w+Error?):/);
    return match?.[1] ?? 'Error';
  }

  private normalizeErrorMessage(message: string): string {
    // Remove specific details like line numbers, file paths, IDs
    return message
      .replace(/at line \d+/g, 'at line X')
      .replace(/file:\/\/[^\s]+/g, 'file://PATH')
      .replace(/id:\s*[a-zA-Z0-9-]+/g, 'id: ID')
      .replace(/\d+/g, 'N');
  }

  private safeStringify(obj: any): any {
    try {
      const seen = new WeakSet();
      const result = JSON.stringify(obj, (key, val) => {
        if (val != null && typeof val === 'object') {
          if (seen.has(val)) {
            return '[Circular]';
          }
          seen.add(val);
        }
        return val;
      });
      return JSON.parse(result);
    } catch (error) {
      return { error: 'Failed to serialize metadata' };
    }
  }

  private fallbackToConsole(originalError: Error, storageError: Error): void {
    if (this.enableConsoleOutput) {
      console.error('[LoggingService] Logging system failure:', storageError);
      console.error('[LoggingService] Original error:', originalError);
    }
  }

  private initializeExternalMonitoring(): void {
    const monitoringConfig = this.getMonitoringConfig();
    if (monitoringConfig.enabled) {
      try {
        this.externalMonitoring = new ClientMonitoringService(monitoringConfig);
        console.log('[LoggingService] External monitoring initialized');
      } catch (error) {
        console.warn('[LoggingService] Failed to initialize external monitoring:', error);
      }
    }
  }

  private getMonitoringConfig(): MonitoringConfig {
    // Client-side configuration from environment variables or window config
    const windowConfig = (window as any).__APP_CONFIG__ || {};
    
    return {
      enabled: windowConfig.MONITORING_ENABLED === 'true' || false,
      provider: (windowConfig.MONITORING_PROVIDER as MonitoringProvider) || 'sentry',
      dsn: windowConfig.MONITORING_DSN,
      environment: windowConfig.NODE_ENV || 'development',
      release: windowConfig.APP_VERSION,
      sampleRate: parseFloat(windowConfig.MONITORING_SAMPLE_RATE || '1.0'),
      debug: windowConfig.NODE_ENV === 'development'
    };
  }
}

class ErrorHandlerImpl implements ErrorHandler {
  private userErrorDisplayCallback?: (error: UserFriendlyError) => void;
  private adminNotificationCallback?: (notification: AdminNotification) => void;
  private loggingService: ClientLoggingService;

  constructor(loggingService: ClientLoggingService) {
    this.loggingService = loggingService;
  }

  handleError(error: Error, context: ErrorContext): void {
    // Log the error
    const logContext: LogContext = {};
    if (context.userId) logContext.userId = context.userId;
    if (context.pluginId) logContext.pluginId = context.pluginId;
    if (context.component) logContext.component = context.component;
    if (context.metadata) logContext.metadata = context.metadata;
    
    this.loggingService.logError(error, logContext);

    // Handle user-facing errors
    if (context.userFacing && this.userErrorDisplayCallback) {
      const userFriendlyError = this.createUserFriendlyError(error, context);
      this.userErrorDisplayCallback(userFriendlyError);
    }

    // Handle admin notifications for critical errors
    if (context.severity === ErrorSeverity.CRITICAL && this.adminNotificationCallback) {
      this.adminNotificationCallback({
        error,
        context,
        severity: context.severity,
        timestamp: new Date(),
        requiresImmedateAttention: true
      });
    }
  }

  displayUserError(message: string, actions?: ErrorAction[]): void {
    if (this.userErrorDisplayCallback) {
      this.userErrorDisplayCallback({
        message,
        actions: actions || undefined,
        severity: ErrorSeverity.MEDIUM
      });
    }
  }

  reportToAdmin(error: Error, severity: ErrorSeverity): void {
    if (this.adminNotificationCallback) {
      this.adminNotificationCallback({
        error,
        context: { severity },
        severity,
        timestamp: new Date(),
        requiresImmedateAttention: severity === ErrorSeverity.CRITICAL
      });
    }
  }

  setUserErrorDisplayCallback(callback: (error: UserFriendlyError) => void): void {
    this.userErrorDisplayCallback = callback;
  }

  setAdminNotificationCallback(callback: (notification: AdminNotification) => void): void {
    this.adminNotificationCallback = callback;
  }

  private createUserFriendlyError(error: Error, context: ErrorContext): UserFriendlyError {
    const actions: ErrorAction[] = [];
    let message = '';

    // Generate user-friendly message based on error type and context
    if (error.message.includes('network') || error.message.includes('connection') || error.message.includes('timeout')) {
      message = 'Connection problem detected. Please check your internet connection.';
      actions.push(
        { label: 'Retry', action: 'retry_connection' },
        { label: 'Check Settings', action: 'open_network_settings' }
      );
    } else if (error.message.includes('Plugin failed to load') && context.pluginId) {
      message = 'A plugin encountered an issue. You can try disabling it temporarily.';
      actions.push({
        label: 'Disable Plugin',
        action: 'disable_plugin',
        data: { pluginId: context.pluginId }
      });
    } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
      message = 'Permission denied. Please check your account permissions.';
      actions.push(
        { label: 'Login Again', action: 'reauth' },
        { label: 'Contact Support', action: 'contact_support' }
      );
    } else {
      // Generic user-friendly message for technical errors
      message = 'An unexpected error occurred. Our team has been notified.';
      actions.push(
        { label: 'Refresh Page', action: 'refresh' },
        { label: 'Report Issue', action: 'report_issue' }
      );
    }

    return {
      message,
      actions,
      severity: context.severity
    };
  }
}