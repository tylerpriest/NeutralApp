/**
 * Simple logging utility for the application
 * In production, this would integrate with a proper logging service
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private context: string;

  constructor(context: string = 'Application') {
    this.context = context;
  }

  private log(level: LogLevel, message: string, data?: any): void {
    const entry: LogEntry = {
      level,
      message,
      context: this.context,
      data,
      timestamp: new Date().toISOString()
    };

    // In development/test, still use console for visibility
    if (process.env.NODE_ENV === 'development' || process.env.NODE_ENV === 'test') {
      const prefix = `[${entry.timestamp}] [${level.toUpperCase()}] [${this.context}]`;
      switch (level) {
        case LogLevel.ERROR:
          console.error(prefix, message, data || '');
          break;
        case LogLevel.WARN:
          console.warn(prefix, message, data || '');
          break;
        case LogLevel.INFO:
          console.info(prefix, message, data || '');
          break;
        case LogLevel.DEBUG:
          console.debug(prefix, message, data || '');
          break;
      }
    }

    // In production, this would send to a proper logging service
    // For now, we just structure the log entry
  }

  debug(message: string, data?: any): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: any): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: any): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, data?: any): void {
    this.log(LogLevel.ERROR, message, data);
  }
}

export function createLogger(context: string): Logger {
  return new Logger(context);
}

export const logger = new Logger('Core');