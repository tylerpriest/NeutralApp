import {
  WidgetError,
  WidgetFallback,
  WidgetFallbackAction,
  SecuritySeverity,
  ErrorRecoveryConfig,
  PluginId
} from '../../../shared';

interface FallbackCallbacks {
  onRetry?: (widgetId: string) => void;
  onRemove?: (widgetId: string) => void;
  onReport?: (error: WidgetError) => void;
}

interface ErrorStatistics {
  totalErrors: number;
  widgetCount: number;
  pluginErrors: Record<string, number>;
  severityBreakdown: Record<SecuritySeverity, number>;
}

export class WidgetErrorHandler {
  private config: ErrorRecoveryConfig;
  private widgetErrors: Map<string, WidgetError> = new Map();
  private fallbacks: Map<string, WidgetFallback> = new Map();
  private fallbackCallbacks: Map<string, FallbackCallbacks> = new Map();
  private autoRemoveCallback?: (widgetId: string, pluginId: PluginId) => void;

  constructor(config?: ErrorRecoveryConfig) {
    this.config = config || this.getDefaultConfig();
    this.initializeHandler();
  }

  private getDefaultConfig(): ErrorRecoveryConfig {
    return {
      maxRetries: 3,
      retryDelayMs: 2000,
      escalationThreshold: 2,
      autoRemoveAfterFailures: 5
    };
  }

  private initializeHandler(): void {
    console.log('WidgetErrorHandler initialized');
  }

  // Configuration methods

  getConfig(): ErrorRecoveryConfig {
    return { ...this.config };
  }

  updateConfig(newConfig: Partial<ErrorRecoveryConfig>): void {
    this.config = {
      ...this.config,
      ...newConfig
    };
  }

  setAutoRemoveCallback(callback: (widgetId: string, pluginId: PluginId) => void): void {
    this.autoRemoveCallback = callback;
  }

  // Error handling methods

  handleWidgetError(widgetId: string, pluginId: PluginId, error: Error): WidgetError {
    const existingError = this.widgetErrors.get(widgetId);
    const retryCount = existingError ? existingError.retryCount + 1 : 0;

    const severity = this.calculateSeverity(retryCount);
    
    const widgetError: WidgetError = {
      widgetId,
      pluginId,
      error,
      timestamp: new Date(),
      severity,
      retryCount
    };

    this.widgetErrors.set(widgetId, widgetError);

    // Check for auto-remove threshold (retryCount starts at 0, so add 1 for total attempts)
    if (retryCount + 1 >= this.config.autoRemoveAfterFailures) {
      this.handleAutoRemove(widgetId, pluginId);
    }

    console.error(`Widget ${widgetId} from plugin ${pluginId} failed (attempt ${retryCount + 1}):`, error);

    return widgetError;
  }

  private calculateSeverity(retryCount: number): SecuritySeverity {
    // retryCount 0 = first error, retryCount 1 = second error, etc.
    if (retryCount >= this.config.escalationThreshold) {
      return SecuritySeverity.HIGH;
    } else if (retryCount >= 1) {
      return SecuritySeverity.MEDIUM;
    } else {
      return SecuritySeverity.LOW;
    }
  }

  private handleAutoRemove(widgetId: string, pluginId: PluginId): void {
    if (this.autoRemoveCallback) {
      try {
        this.autoRemoveCallback(widgetId, pluginId);
        console.warn(`Widget ${widgetId} auto-removed after ${this.config.autoRemoveAfterFailures} failures`);
      } catch (error) {
        console.error(`Error during auto-remove of widget ${widgetId}:`, error);
      }
    }
  }

  getWidgetError(widgetId: string): WidgetError | null {
    return this.widgetErrors.get(widgetId) || null;
  }

  clearWidgetError(widgetId: string): void {
    this.widgetErrors.delete(widgetId);
    // Also clean up associated fallbacks
    const fallbacksToRemove: string[] = [];
    this.fallbacks.forEach((fallback, id) => {
      if (fallback.widgetId === widgetId) {
        fallbacksToRemove.push(id);
      }
    });
    fallbacksToRemove.forEach(id => {
      this.fallbacks.delete(id);
      this.fallbackCallbacks.delete(id);
    });
  }

  canRetry(widgetId: string): boolean {
    const error = this.widgetErrors.get(widgetId);
    if (!error) return true;
    
    return error.retryCount < this.config.maxRetries;
  }

  // Fallback management

  createFallback(widgetError: WidgetError, callbacks: FallbackCallbacks): WidgetFallback {
    const fallbackId = `fallback-${widgetError.widgetId}-${Date.now()}`;
    
    const showRetry = this.canRetry(widgetError.widgetId) && 
                     widgetError.severity !== SecuritySeverity.HIGH;
    const showRemove = true;

    const actions: WidgetFallbackAction[] = [];

    if (showRetry && callbacks.onRetry) {
      actions.push({
        id: 'retry',
        label: 'Retry',
        action: () => callbacks.onRetry!(widgetError.widgetId),
        icon: 'refresh',
        variant: 'primary'
      });
    }

    if (showRemove && callbacks.onRemove) {
      actions.push({
        id: 'remove',
        label: 'Remove',
        action: () => callbacks.onRemove!(widgetError.widgetId),
        icon: 'close',
        variant: 'danger'
      });
    }

    if (callbacks.onReport) {
      actions.push({
        id: 'report',
        label: 'Report Issue',
        action: () => callbacks.onReport!(widgetError),
        icon: 'bug',
        variant: 'secondary'
      });
    }

    const content = this.generateFallbackContent(widgetError);

    const fallback: WidgetFallback = {
      id: fallbackId,
      widgetId: widgetError.widgetId,
      content,
      actions,
      showRetry,
      showRemove,
      errorMessage: widgetError.error.message
    };

    this.fallbacks.set(fallbackId, fallback);
    this.fallbackCallbacks.set(fallbackId, callbacks);

    return fallback;
  }

  private generateFallbackContent(widgetError: WidgetError): string {
    const { severity, retryCount } = widgetError;
    
    if (severity === SecuritySeverity.HIGH) {
      return 'This widget has encountered a critical error and cannot be displayed. Please remove it or contact support.';
    } else if (severity === SecuritySeverity.MEDIUM) {
      return 'This widget encountered an error after multiple attempts. You can try again or remove it from your dashboard.';
    } else {
      return 'This widget encountered an error while loading. You can retry or remove it from your dashboard.';
    }
  }

  executeFallbackAction(fallbackId: string, actionId: string): void {
    try {
      const fallback = this.fallbacks.get(fallbackId);
      if (!fallback) {
        console.warn(`Fallback ${fallbackId} not found`);
        return;
      }

      const action = fallback.actions.find(a => a.id === actionId);
      if (!action) {
        console.warn(`Action ${actionId} not found in fallback ${fallbackId}`);
        return;
      }

      action.action();
    } catch (error) {
      console.error(`Error executing fallback action ${actionId}:`, error);
    }
  }

  // Rendering methods

  renderFallback(fallbackId: string): string {
    const fallback = this.fallbacks.get(fallbackId);
    
    if (!fallback) {
      return this.renderMinimalFallback();
    }

    return this.renderFallbackContent(fallback);
  }

  private renderMinimalFallback(): string {
    return `
      <div class="widget-error-fallback minimal">
        <div class="error-content">
          <h4>Widget Error</h4>
          <p>An error occurred while loading this widget.</p>
        </div>
      </div>
    `;
  }

  private renderFallbackContent(fallback: WidgetFallback): string {
    let html = `
      <div class="widget-error-fallback" data-widget-id="${fallback.widgetId}">
        <div class="error-content">
          <div class="error-icon">⚠️</div>
          <h4>Widget Error</h4>
          <p>${fallback.content}</p>
    `;

    if (fallback.errorMessage) {
      html += `
        <details class="error-details">
          <summary>Error Details</summary>
          <pre>${fallback.errorMessage}</pre>
        </details>
      `;
    }

    html += `
        </div>
        <div class="error-actions">
    `;

    fallback.actions.forEach(action => {
      const variantClass = action.variant || 'secondary';
      html += `
        <button 
          class="error-action ${variantClass}"
          data-action="${action.id}"
          data-fallback-id="${fallback.id}"
        >
          ${action.icon ? `<span class="icon">${action.icon}</span>` : ''}
          ${action.label}
        </button>
      `;
    });

    html += `
        </div>
      </div>
    `;

    return html;
  }

  // Statistics and monitoring

  getErrorStatistics(): ErrorStatistics {
    const stats: ErrorStatistics = {
      totalErrors: this.widgetErrors.size,
      widgetCount: this.widgetErrors.size,
      pluginErrors: {},
      severityBreakdown: {
        [SecuritySeverity.LOW]: 0,
        [SecuritySeverity.MEDIUM]: 0,
        [SecuritySeverity.HIGH]: 0,
        [SecuritySeverity.CRITICAL]: 0
      }
    };

    this.widgetErrors.forEach(error => {
      // Count plugin errors
      const pluginId = error.pluginId;
      stats.pluginErrors[pluginId] = (stats.pluginErrors[pluginId] || 0) + 1;

      // Count severity breakdown
      stats.severityBreakdown[error.severity]++;
    });

    return stats;
  }

  getFailedWidgetsByPlugin(pluginId: PluginId): string[] {
    const widgets: string[] = [];
    
    this.widgetErrors.forEach(error => {
      if (error.pluginId === pluginId) {
        widgets.push(error.widgetId);
      }
    });

    return widgets;
  }

  getAllFailedWidgets(): string[] {
    return Array.from(this.widgetErrors.keys());
  }

  // Lifecycle management

  cleanup(): void {
    this.widgetErrors.clear();
    this.fallbacks.clear();
    this.fallbackCallbacks.clear();
    delete this.autoRemoveCallback;
    console.log('WidgetErrorHandler cleaned up');
  }

  // Utility methods

  hasErrors(): boolean {
    return this.widgetErrors.size > 0;
  }

  getErrorCount(): number {
    return this.widgetErrors.size;
  }

  isWidgetFailed(widgetId: string): boolean {
    return this.widgetErrors.has(widgetId);
  }
} 