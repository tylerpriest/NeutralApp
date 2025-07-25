import { FallbackLogger, FallbackLogEntry } from '../interfaces/error-recovery.interface';
import { LogLevel, LogContext } from '../interfaces/logging.interface';

export class FallbackLoggerService implements FallbackLogger {
  private fallbackLogs: FallbackLogEntry[] = [];
  private isUsingFallback: boolean = false;
  private mainLoggerWorking: boolean = true;

  log(entry: FallbackLogEntry): void {
    this.fallbackLogs.push(entry);
    console.log(`[FALLBACK ${entry.level.toUpperCase()}] ${entry.message}`, entry.context || '');
  }

  logError(message: string, context: LogContext): void {
    const entry: FallbackLogEntry = {
      level: LogLevel.ERROR,
      message,
      context,
      timestamp: new Date()
    };
    this.log(entry);
  }

  logWarning(message: string, context: LogContext): void {
    const entry: FallbackLogEntry = {
      level: LogLevel.WARNING,
      message,
      context,
      timestamp: new Date()
    };
    this.log(entry);
  }

  isMainLoggerWorking(): boolean {
    return this.mainLoggerWorking;
  }

  switchToFallback(): void {
    this.isUsingFallback = true;
    this.mainLoggerWorking = false;
    console.log('Switched to fallback logger');
  }

  switchToMain(): void {
    this.isUsingFallback = false;
    this.mainLoggerWorking = true;
    console.log('Switched back to main logger');
  }

  getFallbackLogs(): FallbackLogEntry[] {
    return [...this.fallbackLogs];
  }

  clearFallbackLogs(): void {
    this.fallbackLogs = [];
  }
} 