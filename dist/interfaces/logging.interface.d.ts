import { LogEntry, LogContext, LogQuery, ErrorContext, ErrorAction, ErrorSeverity } from '../types';
export interface ILoggingService {
    logError(error: Error, context: LogContext): void;
    logWarning(message: string, context: LogContext): void;
    logInfo(message: string, context: LogContext): void;
    searchLogs(query: LogQuery): Promise<LogEntry[]>;
}
export interface IErrorHandler {
    handleError(error: Error, context: ErrorContext): void;
    displayUserError(message: string, actions?: ErrorAction[]): void;
    reportToAdmin(error: Error, severity: ErrorSeverity): void;
}
//# sourceMappingURL=logging.interface.d.ts.map