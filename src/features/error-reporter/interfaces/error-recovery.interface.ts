import { ErrorSeverity, LogLevel, LogContext } from './logging.interface';

export interface ComponentFailureContext {
  component?: string;
  pluginId?: string;
  severity: ErrorSeverity;
  critical?: boolean;
  isolate?: boolean;
  cascade?: boolean;
  immediate?: boolean;
  batch?: boolean;
  systemWide?: boolean;
  rateLimited?: boolean;
  occurrenceCount?: number;
  createIssue?: boolean;
  firstOccurrence?: Date;
  escalationThreshold?: number;
}

export interface RetryOptions {
  maxRetries: number;
  initialDelay: number;
  exponentialBackoff: boolean;
}

export interface ComponentFailureHandler {
  handleComponentFailure(componentId: string, error: Error, context: ComponentFailureContext): Promise<void>;
  registerFallbackComponent(componentId: string, fallbackComponent: any): void;
  getFallbackComponent(componentId: string): Promise<any>;
  isComponentHealthy(componentId: string): Promise<boolean>;
  markComponentUnhealthy(componentId: string): void;
  restoreComponent(componentId: string): Promise<void>;
}

export interface FallbackLogEntry {
  level: LogLevel;
  message: string;
  context: LogContext;
  timestamp: Date;
  preserve?: boolean;
}

export interface FallbackLogger {
  log(entry: FallbackLogEntry): void;
  logError(message: string, context: LogContext): void;
  logWarning(message: string, context: LogContext): void;
  isMainLoggerWorking(): boolean | Promise<boolean>;
  switchToFallback(): void;
  switchToMain(): void;
}

export interface DeveloperNotification {
  error?: Error;
  errors?: Error[];
  severity: ErrorSeverity;
  component?: string;
  pluginId?: string;
  timestamp: Date;
  urgency?: 'immediate' | 'high' | 'normal' | 'low';
  type?: 'single' | 'batch';
  summary?: string;
}

export interface EmailNotification {
  subject: string;
  body: string;
  recipients: string[];
  priority: 'low' | 'normal' | 'high' | 'critical';
}

export interface GitHubIssue {
  title: string;
  body: string;
  labels: string[];
  assignees: string[];
}

export interface ErrorEscalation {
  error: Error;
  originalContext: ComponentFailureContext;
  escalationLevel: 'team' | 'manager' | 'director';
  timeUnresolved: number;
}

export interface DeveloperNotificationService {
  notifyDeveloper(notification: DeveloperNotification): Promise<void>;
  sendEmail(email: EmailNotification): Promise<void>;
  sendSlackMessage(message: string, channel?: string): Promise<void>;
  createGitHubIssue(issue: GitHubIssue): Promise<void>;
  escalateError(escalation: ErrorEscalation): Promise<void>;
}

export interface SystemHealthStatus {
  status: 'healthy' | 'degraded' | 'critical';
  criticalSystemsOperational: boolean;
  failedComponents: string[];
  recoveryMechanismsActive: boolean;
  fallbackLoggingActive: boolean;
  lastHealthCheck: Date;
}

export interface ErrorRecoveryConfiguration {
  loggingService: any; // LoggingService interface
  componentFailureHandler: ComponentFailureHandler;
  fallbackLogger: FallbackLogger;
  developerNotificationService: DeveloperNotificationService;
}

export interface ErrorRecoveryService {
  handleComponentFailure(componentId: string, error: Error, context: ComponentFailureContext): Promise<void>;
  getWorkingComponent(componentId: string): Promise<any>;
  handlePluginFailure(pluginId: string, error: Error, context: ComponentFailureContext): Promise<void>;
  scheduleComponentRetry(componentId: string, error: Error, options: RetryOptions): Promise<void>;
  handleLoggingSystemFailure(error: Error): Promise<void>;
  safeLog(level: LogLevel, message: string, context: LogContext): void;
  checkAndRestoreMainLogging(): Promise<void>;
  notifyDevelopersOfError(error: Error, context: ComponentFailureContext): Promise<void>;
  handleRecurringError(error: Error, context: ComponentFailureContext): Promise<void>;
  checkErrorEscalation(error: Error, context: ComponentFailureContext): Promise<void>;
  handleSystemWideFailure(error: Error, context: ComponentFailureContext): Promise<void>;
  getSystemHealth(): Promise<SystemHealthStatus>;
} 