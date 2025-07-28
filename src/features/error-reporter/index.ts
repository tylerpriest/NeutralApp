// Error Reporter Feature Exports
export * from './interfaces/logging.interface';
export * from './interfaces/error-recovery.interface';
// Export services with specific names to avoid conflicts with interfaces
export { LoggingService } from './services/logging.service';
export { ErrorRecoveryService } from './services/error-recovery.service';

// Legacy widget error handler (for backward compatibility)
export * from './web/widget-error-handler';

// Modernized React components and hooks
export { WidgetErrorFallback } from './web/WidgetErrorFallback';
export { useWidgetErrorHandler } from './web/useWidgetErrorHandler'; 