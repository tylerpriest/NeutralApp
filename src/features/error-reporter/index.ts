// Error Reporter Feature Exports
export * from './interfaces/logging.interface';
export * from './interfaces/error-recovery.interface';
// Export services with specific names to avoid conflicts with interfaces
export { LoggingService } from './services/logging.service';
export { ErrorRecoveryService } from './services/error-recovery.service';
export * from './web/widget-error-handler'; 