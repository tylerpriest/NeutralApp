import {
  ErrorRecoveryService as IErrorRecoveryService,
  ErrorRecoveryConfiguration,
  ComponentFailureContext,
  RetryOptions,
  SystemHealthStatus,
  ComponentFailureHandler,
  FallbackLogger,
  DeveloperNotificationService
} from '../interfaces/error-recovery.interface';
import { LogLevel, LogContext } from '../interfaces/logging.interface';

export class ErrorRecoveryService implements IErrorRecoveryService {
  private loggingService: any;
  private componentFailureHandler: ComponentFailureHandler;
  private fallbackLogger: FallbackLogger;
  private developerNotificationService: DeveloperNotificationService;
  private healthStatus: SystemHealthStatus;

  constructor(config: ErrorRecoveryConfiguration) {
    this.loggingService = config.loggingService;
    this.componentFailureHandler = config.componentFailureHandler;
    this.fallbackLogger = config.fallbackLogger;
    this.developerNotificationService = config.developerNotificationService;
    
    this.healthStatus = {
      status: 'healthy',
      criticalSystemsOperational: true,
      failedComponents: [],
      recoveryMechanismsActive: false,
      fallbackLoggingActive: false,
      lastHealthCheck: new Date()
    };
  }

  async handleComponentFailure(componentId: string, error: Error, context: ComponentFailureContext): Promise<void> {
    try {
      // Log the failure
      const logContext: LogContext = {
        component: componentId,
        metadata: { error: error.message }
      };
      if (context.pluginId) {
        logContext.pluginId = context.pluginId;
      }
      this.safeLog(LogLevel.ERROR, `Component failure: ${componentId}`, logContext);

      // Delegate to component failure handler
      await this.componentFailureHandler.handleComponentFailure(componentId, error, context);

      // Update health status
      this.updateHealthStatus(componentId, context);

      // Notify developers if needed
      if (context.severity === 'high' || context.severity === 'critical') {
        await this.notifyDevelopersOfError(error, context);
      }
    } catch (recoveryError) {
      this.safeLog(LogLevel.CRITICAL, 'Error recovery failed', {
        component: 'ErrorRecoveryService',
        metadata: { originalError: error.message, recoveryError: recoveryError }
      });
    }
  }

  async getWorkingComponent(componentId: string): Promise<any> {
    return await this.componentFailureHandler.getFallbackComponent(componentId);
  }

  async handlePluginFailure(pluginId: string, error: Error, context: ComponentFailureContext): Promise<void> {
    // Mark plugin as unhealthy to isolate it
    this.componentFailureHandler.markComponentUnhealthy(pluginId);
    
    // Log with plugin isolation context
    this.safeLog(LogLevel.ERROR, `Plugin failure isolated: ${pluginId}`, {
      pluginId,
      component: 'PluginManager',
      metadata: { error: error.message, isolated: true }
    });
  }

  async scheduleComponentRetry(componentId: string, error: Error, options: RetryOptions): Promise<void> {
    // Simple retry mechanism (in production, this would use a proper job queue)
    let attempt = 0;
    let delay = options.initialDelay;
    
    while (attempt < options.maxRetries) {
      await new Promise(resolve => setTimeout(resolve, delay));
      
      try {
        await this.componentFailureHandler.restoreComponent(componentId);
        this.safeLog(LogLevel.INFO, `Component restored: ${componentId}`, {
          component: componentId,
          metadata: { attempt: attempt + 1 }
        });
        return;
      } catch (retryError) {
        attempt++;
        if (options.exponentialBackoff) {
          delay *= 2;
        }
      }
    }
    
    this.safeLog(LogLevel.ERROR, `Component restore failed after ${options.maxRetries} attempts`, {
      component: componentId
    });
  }

  async handleLoggingSystemFailure(error: Error): Promise<void> {
    await this.fallbackLogger.switchToFallback();
    this.healthStatus.fallbackLoggingActive = true;
    
    this.fallbackLogger.logError('Main logging system failed, switched to fallback', {
      component: 'LoggingService',
      metadata: { error: error.message }
    });
  }

  safeLog(level: LogLevel, message: string, context: LogContext): void {
    try {
      if (this.fallbackLogger.isMainLoggerWorking()) {
        // Use main logging service
        switch (level) {
          case LogLevel.ERROR:
          case LogLevel.CRITICAL:
            this.loggingService.logError(new Error(message), context);
            break;
          case LogLevel.WARNING:
            this.loggingService.logWarning(message, context);
            break;
          default:
            this.loggingService.logInfo(message, context);
        }
      } else {
        // Use fallback logger
        switch (level) {
          case LogLevel.ERROR:
          case LogLevel.CRITICAL:
            this.fallbackLogger.logError(message, context);
            break;
          case LogLevel.WARNING:
            this.fallbackLogger.logWarning(message, context);
            break;
          default:
            this.fallbackLogger.log({
              level,
              message,
              context,
              timestamp: new Date()
            });
        }
      }
    } catch (error) {
      // Last resort - console logging
      console.error('[ErrorRecoveryService] Safe logging failed:', error);
      console.error('[ErrorRecoveryService] Original message:', message);
    }
  }

  async checkAndRestoreMainLogging(): Promise<void> {
    if (await this.fallbackLogger.isMainLoggerWorking()) {
      this.fallbackLogger.switchToMain();
      this.healthStatus.fallbackLoggingActive = false;
      
      this.loggingService.logInfo('Main logging system restored', {
        component: 'ErrorRecoveryService'
      });
    }
  }

  async notifyDevelopersOfError(error: Error, context: ComponentFailureContext): Promise<void> {
    const notification: any = {
      error,
      severity: context.severity,
      timestamp: new Date(),
      urgency: context.immediate ? 'immediate' : 'normal'
    };
    
    if (context.component) {
      notification.component = context.component;
    }
    if (context.pluginId) {
      notification.pluginId = context.pluginId;
    }
    
    await this.developerNotificationService.notifyDeveloper(notification);
  }

  async handleRecurringError(error: Error, context: ComponentFailureContext): Promise<void> {
    if (context.createIssue) {
      await this.developerNotificationService.createGitHubIssue({
        title: `Recurring Error: ${error.message}`,
        body: `Error occurred ${context.occurrenceCount} times in component ${context.component}`,
        labels: ['bug', 'recurring', 'auto-generated'],
        assignees: []
      });
    }
  }

  async checkErrorEscalation(error: Error, context: ComponentFailureContext): Promise<void> {
    if (context.firstOccurrence && context.escalationThreshold) {
      const timeUnresolved = Date.now() - context.firstOccurrence.getTime();
      
      if (timeUnresolved > context.escalationThreshold) {
        await this.developerNotificationService.escalateError({
          error,
          originalContext: context,
          escalationLevel: 'manager',
          timeUnresolved
        });
      }
    }
  }

  async handleSystemWideFailure(error: Error, context: ComponentFailureContext): Promise<void> {
    // Activate all recovery mechanisms
    this.healthStatus.recoveryMechanismsActive = true;
    this.healthStatus.status = 'critical';
    
    // Switch to fallback logging
    await this.handleLoggingSystemFailure(error);
    
    // Handle component failure
    if (context.component) {
      await this.componentFailureHandler.handleComponentFailure(context.component, error, context);
    }
    
    // Escalate immediately
    await this.developerNotificationService.escalateError({
      error,
      originalContext: context,
      escalationLevel: 'director',
      timeUnresolved: 0
    });
  }

  async getSystemHealth(): Promise<SystemHealthStatus> {
    this.healthStatus.lastHealthCheck = new Date();
    return { ...this.healthStatus };
  }

  private updateHealthStatus(componentId: string, context: ComponentFailureContext): void {
    if (!this.healthStatus.failedComponents.includes(componentId)) {
      this.healthStatus.failedComponents.push(componentId);
    }
    
    if (context.critical) {
      this.healthStatus.criticalSystemsOperational = false;
      this.healthStatus.status = 'critical';
    } else {
      this.healthStatus.status = 'degraded';
    }
    
    this.healthStatus.recoveryMechanismsActive = true;
  }
} 