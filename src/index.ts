import { coreApp, CoreService } from './core';
import { eventBus } from './core/event-bus';
import { container } from './core/dependency-injection';

// Core exports
export * from './core';

// Application configuration
export interface AppConfig {
  port?: number;
  environment?: 'development' | 'production' | 'test';
  features?: {
    auth?: boolean;
    plugins?: boolean;
    admin?: boolean;
  };
}

// Default configuration
const defaultConfig: AppConfig = {
  port: 3000,
  environment: 'development',
  features: {
    auth: true,
    plugins: true,
    admin: true
  }
};

// NeutralApp main class
export class NeutralApp {
  private config: AppConfig;
  private isInitialized = false;

  constructor(config: AppConfig = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      throw new Error('NeutralApp is already initialized');
    }

    console.log('🚀 Initializing NeutralApp...');
    console.log(`Environment: ${this.config.environment}`);
    console.log(`Port: ${this.config.port}`);

    // Register core services
    await this.registerCoreServices();

    // Initialize features based on configuration
    if (this.config.features?.auth) {
      await this.initializeAuth();
    }

    if (this.config.features?.plugins) {
      await this.initializePluginManager();
    }

    if (this.config.features?.admin) {
      await this.initializeAdmin();
    }

    this.isInitialized = true;
    console.log('✅ NeutralApp initialized successfully');
  }

  private async registerCoreServices(): Promise<void> {
    // Register event bus as a core service
    const eventBusService: CoreService = {
      name: 'event-bus',
      version: '1.0.0',
      start: async () => {
        console.log('Event bus service started');
      },
      stop: async () => {
        eventBus.clear();
        console.log('Event bus service stopped');
      },
      health: async () => ({
        status: 'healthy',
        details: { eventTypes: eventBus.eventTypes }
      })
    };

    // Register dependency injection container as a core service
    const containerService: CoreService = {
      name: 'dependency-injection',
      version: '1.0.0',
      start: async () => {
        console.log('Dependency injection service started');
      },
      stop: async () => {
        container.clear();
        console.log('Dependency injection service stopped');
      },
      health: async () => ({
        status: 'healthy',
        details: { registeredServices: container.registeredServices }
      })
    };

    coreApp.registerService(eventBusService);
    coreApp.registerService(containerService);
  }

  private async initializeAuth(): Promise<void> {
    console.log('🔐 Initializing authentication...');
    // Auth initialization logic would go here
    console.log('✅ Authentication initialized');
  }

  private async initializePluginManager(): Promise<void> {
    console.log('🔌 Initializing plugin manager...');
    // Plugin manager initialization logic would go here
    console.log('✅ Plugin manager initialized');
  }

  private async initializeAdmin(): Promise<void> {
    console.log('⚙️ Initializing admin dashboard...');
    // Admin dashboard initialization logic would go here
    console.log('✅ Admin dashboard initialized');
  }

  async start(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    console.log('🚀 Starting NeutralApp...');
    await coreApp.start();
    console.log('✅ NeutralApp started successfully');
  }

  async stop(): Promise<void> {
    console.log('🛑 Stopping NeutralApp...');
    await coreApp.stop();
    this.isInitialized = false;
    console.log('✅ NeutralApp stopped successfully');
  }

  async health(): Promise<any> {
    return await coreApp.health();
  }

  get isStarted(): boolean {
    return coreApp.isStarted;
  }
}

// Export singleton instance
export const neutralApp = new NeutralApp();

// Default export
export default NeutralApp; 