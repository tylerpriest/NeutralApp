import { ClientLoggingService as LoggingService } from '../../../features/error-reporter/services/client-logging.service';
import { LoggingConfiguration, LogContext, ErrorContext, ErrorSeverity, UserFriendlyError, ErrorAction } from '../../../features/error-reporter/interfaces/logging.interface';

export interface WebErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  pluginId?: string;
  url?: string;
  userAgent?: string;
  timestamp?: Date;
  metadata?: Record<string, any>;
}

export interface WebErrorInfo {
  error: Error;
  context: WebErrorContext;
  userFacing?: boolean;
  severity?: ErrorSeverity;
  recoveryAction?: string;
}

export class WebErrorLogger {
  private loggingService: LoggingService;
  private errorHandler: any;
  private userErrorCallback?: (error: UserFriendlyError) => void;
  private adminNotificationCallback?: (notification: any) => void;

  constructor() {
    // Initialize with default configuration
    const config: LoggingConfiguration = {
      storage: new Map(),
      maxEntries: 1000,
      enableConsoleOutput: true,
      retentionDays: 30
    };
    
    this.loggingService = new LoggingService(config);
    this.errorHandler = this.loggingService.getErrorHandler();
    
    // Set up callbacks for user-facing errors and admin notifications
    this.setupErrorCallbacks();
  }

  /**
   * Log a web-specific error with structured context
   */
  logWebError(errorInfo: WebErrorInfo): void {
    const { error, context, userFacing = false, severity = ErrorSeverity.MEDIUM } = errorInfo;
    
    // Create structured log context
    const logContext: LogContext = {
      userId: context.userId,
      pluginId: context.pluginId,
      component: context.component,
      action: context.action,
      metadata: {
        ...context.metadata,
        url: context.url || window.location.href,
        userAgent: context.userAgent || navigator.userAgent,
        timestamp: context.timestamp || new Date().toISOString(),
        userFacing,
        severity
      }
    };

    // Log to the service
    this.loggingService.logError(error, logContext);

    // Handle user-facing errors through the error handler
    if (userFacing) {
      const errorContext: ErrorContext = {
        userFacing: true,
        severity,
        component: context.component,
        pluginId: context.pluginId,
        userId: context.userId,
        metadata: context.metadata
      };
      
      this.errorHandler.handleError(error, errorContext);
    }
  }

  /**
   * Log React component errors with automatic context extraction
   */
  logReactError(error: Error, errorInfo: any, componentName?: string): void {
    const context: WebErrorContext = {
      component: componentName || 'Unknown React Component',
      action: 'component-render',
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date(),
      metadata: {
        componentStack: errorInfo.componentStack,
        errorType: 'React Error Boundary',
        errorBoundary: true
      }
    };

    this.logWebError({
      error,
      context,
      userFacing: true,
      severity: ErrorSeverity.HIGH
    });
  }

  /**
   * Log API request errors
   */
  logApiError(error: Error, endpoint: string, method: string, statusCode?: number): void {
    const context: WebErrorContext = {
      component: 'API Client',
      action: `${method} ${endpoint}`,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date(),
      metadata: {
        endpoint,
        method,
        statusCode,
        errorType: 'API Error'
      }
    };

    this.logWebError({
      error,
      context,
      userFacing: true,
      severity: statusCode && statusCode >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM
    });
  }

  /**
   * Log form validation errors
   */
  logValidationError(field: string, value: any, formName: string, validationRule: string): void {
    const error = new Error(`Validation failed for ${field}: ${validationRule}`);
    const context: WebErrorContext = {
      component: 'Form Validation',
      action: `validate-${formName}`,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date(),
      metadata: {
        field,
        value: String(value).substring(0, 100), // Truncate for privacy
        formName,
        validationRule,
        errorType: 'Validation Error'
      }
    };

    this.logWebError({
      error,
      context,
      userFacing: false, // Validation errors are typically handled inline
      severity: ErrorSeverity.LOW
    });
  }

  /**
   * Log user interaction errors
   */
  logUserInteractionError(error: Error, action: string, component: string): void {
    const context: WebErrorContext = {
      component,
      action,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date(),
      metadata: {
        errorType: 'User Interaction Error',
        userAction: action
      }
    };

    this.logWebError({
      error,
      context,
      userFacing: true,
      severity: ErrorSeverity.MEDIUM
    });
  }

  /**
   * Log performance-related errors
   */
  logPerformanceError(error: Error, metric: string, threshold: number, actual: number): void {
    const context: WebErrorContext = {
      component: 'Performance Monitor',
      action: `performance-check-${metric}`,
      url: window.location.href,
      userAgent: navigator.userAgent,
      timestamp: new Date(),
      metadata: {
        metric,
        threshold,
        actual,
        errorType: 'Performance Error'
      }
    };

    this.logWebError({
      error,
      context,
      userFacing: false,
      severity: ErrorSeverity.MEDIUM
    });
  }

  /**
   * Get error statistics for the admin dashboard
   */
  async getErrorStatistics() {
    return await this.loggingService.getErrorStatistics();
  }

  /**
   * Get aggregated errors for analysis
   */
  async getAggregatedErrors() {
    return await this.loggingService.getAggregatedErrors();
  }

  /**
   * Search logs with web-specific filters
   */
  async searchWebLogs(query: any) {
    return await this.loggingService.searchLogs(query);
  }

  /**
   * Set up error callbacks for user notifications and admin alerts
   */
  private setupErrorCallbacks(): void {
    // Set up user error display callback
    this.errorHandler.setUserErrorDisplayCallback((userError: UserFriendlyError) => {
      if (this.userErrorCallback) {
        this.userErrorCallback(userError);
      }
    });

    // Set up admin notification callback
    this.errorHandler.setAdminNotificationCallback((notification: any) => {
      if (this.adminNotificationCallback) {
        this.adminNotificationCallback(notification);
      }
    });
  }

  /**
   * Set callback for user-facing error display
   */
  setUserErrorCallback(callback: (error: UserFriendlyError) => void): void {
    this.userErrorCallback = callback;
  }

  /**
   * Set callback for admin notifications
   */
  setAdminNotificationCallback(callback: (notification: any) => void): void {
    this.adminNotificationCallback = callback;
  }

  /**
   * Create a user-friendly error message with recovery actions
   */
  createUserFriendlyError(error: Error, context: WebErrorContext): UserFriendlyError {
    let message = 'An unexpected error occurred.';
    let actions: ErrorAction[] = [];

    // Determine message and actions based on error type and context
    if (error.message.includes('network') || error.message.includes('fetch')) {
      message = 'Network connection issue detected. Please check your internet connection.';
      actions = [
        { label: 'Retry', action: 'retry_operation' },
        { label: 'Check Connection', action: 'check_network' }
      ];
    } else if (error.message.includes('permission') || error.message.includes('unauthorized')) {
      message = 'You don\'t have permission to perform this action.';
      actions = [
        { label: 'Login Again', action: 'reauth' },
        { label: 'Contact Support', action: 'contact_support' }
      ];
    } else if (error.message.includes('validation')) {
      message = 'Please check your input and try again.';
      actions = [
        { label: 'Review Input', action: 'review_input' },
        { label: 'Clear Form', action: 'clear_form' }
      ];
    } else if (context.component && context.component.includes('React')) {
      message = 'A component encountered an error. The page may need to be refreshed.';
      actions = [
        { label: 'Refresh Page', action: 'refresh_page' },
        { label: 'Report Issue', action: 'report_issue' }
      ];
    } else {
      message = 'Something went wrong. Our team has been notified.';
      actions = [
        { label: 'Try Again', action: 'retry_operation' },
        { label: 'Report Issue', action: 'report_issue' }
      ];
    }

    return {
      message,
      actions,
      severity: ErrorSeverity.MEDIUM
    };
  }

  /**
   * Get error suggestions for common web errors
   */
  async getErrorSuggestions() {
    return await this.loggingService.getErrorSuggestions();
  }
}

// Export a singleton instance for use throughout the application
export const webErrorLogger = new WebErrorLogger(); 