export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface LogContext {
  userId?: string;
  pluginId?: string;
  component?: string;
  action?: string;
  metadata?: Record<string, any>;
}

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  context: LogContext;
  userId?: string | undefined;
  pluginId?: string | undefined;
  stackTrace?: string | undefined;
  metadata: Record<string, any>;
}

export interface LogQuery {
  level?: LogLevel;
  userId?: string;
  pluginId?: string;
  component?: string;
  startDate?: Date;
  endDate?: Date;
  messageContains?: string;
  limit?: number;
  offset?: number;
}

export interface ErrorContext {
  userFacing?: boolean;
  severity: ErrorSeverity;
  component?: string;
  pluginId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export interface ErrorAction {
  label: string;
  action: string;
  data?: Record<string, any>;
}

export interface UserFriendlyError {
  message: string;
  actions?: ErrorAction[] | undefined;
  severity: ErrorSeverity;
}

export interface AdminNotification {
  error: Error;
  context: ErrorContext;
  severity: ErrorSeverity;
  timestamp: Date;
  requiresImmedateAttention?: boolean;
}

export interface ErrorStatistics {
  byType: Record<string, number>;
  byComponent: Record<string, number>;
  bySeverity: Record<ErrorSeverity, number>;
  totalErrors: number;
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface AggregatedError {
  message: string;
  count: number;
  affectedComponents: string[];
  firstOccurrence: Date;
  lastOccurrence: Date;
  severity: ErrorSeverity;
}

export interface ErrorSuggestion {
  pattern: RegExp;
  suggestion: string;
  action: string;
}

export interface LoggingConfiguration {
  storage: Map<string, LogEntry>;
  maxEntries: number;
  enableConsoleOutput: boolean;
  retentionDays?: number;
}

export interface LoggingService {
  logError(error: Error, context: LogContext): void;
  logWarning(message: string, context: LogContext): void;
  logInfo(message: string, context: LogContext): void;
  searchLogs(query: LogQuery): Promise<LogEntry[]>;
  getErrorStatistics(): Promise<ErrorStatistics>;
  getAggregatedErrors(): Promise<AggregatedError[]>;
  getErrorSuggestions(): Promise<ErrorSuggestion[]>;
  getErrorHandler(): ErrorHandler;
}

export interface ErrorHandler {
  handleError(error: Error, context: ErrorContext): void;
  displayUserError(message: string, actions?: ErrorAction[]): void;
  reportToAdmin(error: Error, severity: ErrorSeverity): void;
  setUserErrorDisplayCallback(callback: (error: UserFriendlyError) => void): void;
  setAdminNotificationCallback(callback: (notification: AdminNotification) => void): void;
} 