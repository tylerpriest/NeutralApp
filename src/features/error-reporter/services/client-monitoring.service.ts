// Client-side only monitoring service
export interface MonitoringConfig {
  enabled: boolean;
  provider: MonitoringProvider;
  dsn?: string;
  environment: string;
  release?: string;
  sampleRate: number;
  debug: boolean;
}

export type MonitoringProvider = 'sentry' | 'datadog' | 'bugsnag';

export interface MonitoringContext {
  user?: { id: string };
  tags?: Record<string, string>;
  extra?: Record<string, any>;
}

export class ClientMonitoringService {
  private config: MonitoringConfig;
  private initialized = false;

  constructor(config: MonitoringConfig) {
    this.config = config;
    this.initialize();
  }

  private async initialize(): Promise<void> {
    try {
      switch (this.config.provider) {
        case 'sentry':
          await this.initializeSentry();
          break;
        case 'datadog':
          await this.initializeDatadog();
          break;
        case 'bugsnag':
          await this.initializeBugsnag();
          break;
        default:
          throw new Error(`Unsupported monitoring provider: ${this.config.provider}`);
      }
      this.initialized = true;
    } catch (error) {
      console.error(`Failed to initialize ${this.config.provider}:`, error);
    }
  }

  private async initializeSentry(): Promise<void> {
    // Client-side Sentry only
    const { init } = await import('@sentry/browser');
    init({
      dsn: this.config.dsn,
      environment: this.config.environment,
      release: this.config.release,
      sampleRate: this.config.sampleRate,
      debug: this.config.debug,
      beforeSend: (event) => {
        // Filter out non-critical errors in development
        if (this.config.environment === 'development' && event.level === 'info') {
          return null;
        }
        return event;
      }
    });
  }

  private async initializeDatadog(): Promise<void> {
    // Placeholder for Datadog initialization
    console.log('Datadog monitoring would be initialized here');
  }

  private async initializeBugsnag(): Promise<void> {
    // Placeholder for Bugsnag initialization
    console.log('Bugsnag monitoring would be initialized here');
  }

  captureException(error: Error, context?: MonitoringContext): void {
    if (!this.initialized) return;

    try {
      switch (this.config.provider) {
        case 'sentry':
          this.captureSentryException(error, context);
          break;
        case 'datadog':
          this.captureDatadogException(error, context);
          break;
        case 'bugsnag':
          this.captureBugsnagException(error, context);
          break;
      }
    } catch (captureError) {
      console.error('Failed to capture exception:', captureError);
    }
  }

  captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: MonitoringContext): void {
    if (!this.initialized) return;

    try {
      switch (this.config.provider) {
        case 'sentry':
          this.captureSentryMessage(message, level, context);
          break;
        case 'datadog':
          this.captureDatadogMessage(message, level, context);
          break;
        case 'bugsnag':
          this.captureBugsnagMessage(message, level, context);
          break;
      }
    } catch (captureError) {
      console.error('Failed to capture message:', captureError);
    }
  }

  private async captureSentryException(error: Error, context?: MonitoringContext): Promise<void> {
    const { captureException, configureScope } = await import('@sentry/browser');
    configureScope((scope) => {
      if (context?.user) scope.setUser(context.user);
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }
      if (context?.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
    });
    captureException(error);
  }

  private async captureSentryMessage(message: string, level: 'info' | 'warning' | 'error', context?: MonitoringContext): Promise<void> {
    const { captureMessage, configureScope } = await import('@sentry/browser');
    configureScope((scope) => {
      if (context?.user) scope.setUser(context.user);
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }
      if (context?.extra) {
        Object.entries(context.extra).forEach(([key, value]) => {
          scope.setExtra(key, value);
        });
      }
    });
    captureMessage(message, level);
  }

  private captureDatadogException(error: Error, context?: MonitoringContext): void {
    // Placeholder for Datadog exception capture
    console.log('Datadog exception capture:', error.message, context);
  }

  private captureDatadogMessage(message: string, level: string, context?: MonitoringContext): void {
    // Placeholder for Datadog message capture
    console.log('Datadog message capture:', message, level, context);
  }

  private captureBugsnagException(error: Error, context?: MonitoringContext): void {
    // Placeholder for Bugsnag exception capture
    console.log('Bugsnag exception capture:', error.message, context);
  }

  private captureBugsnagMessage(message: string, level: string, context?: MonitoringContext): void {
    // Placeholder for Bugsnag message capture
    console.log('Bugsnag message capture:', message, level, context);
  }
}