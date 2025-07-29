// Core infrastructure exports
export * from './event-bus';
export * from './dependency-injection';

// Core types and interfaces
export interface CoreService {
  name: string;
  version: string;
  start(): Promise<void>;
  stop(): Promise<void>;
  health(): Promise<{ status: 'healthy' | 'unhealthy'; details?: Record<string, unknown> }>;
}

// Core application lifecycle
export class CoreApplication {
  private services: Map<string, CoreService> = new Map();
  private isRunning = false;

  registerService(service: CoreService): void {
    this.services.set(service.name, service);
  }

  async start(): Promise<void> {
    if (this.isRunning) {
      throw new Error('Application is already running');
    }

    console.log('Starting NeutralApp core services...');
    
    for (const [name, service] of this.services) {
      try {
        console.log(`Starting service: ${name}`);
        await service.start();
        console.log(`✅ Service ${name} started successfully`);
      } catch (error) {
        console.error(`❌ Failed to start service ${name}:`, error);
        throw error;
      }
    }

    this.isRunning = true;
    console.log('✅ NeutralApp core services started successfully');
  }

  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    console.log('Stopping NeutralApp core services...');
    
    for (const [name, service] of this.services) {
      try {
        console.log(`Stopping service: ${name}`);
        await service.stop();
        console.log(`✅ Service ${name} stopped successfully`);
      } catch (error) {
        console.error(`❌ Failed to stop service ${name}:`, error);
      }
    }

    this.isRunning = false;
    console.log('✅ NeutralApp core services stopped successfully');
  }

  async health(): Promise<{ status: 'healthy' | 'unhealthy'; services: Record<string, unknown> }> {
    const serviceHealth: Record<string, unknown> = {};
    let allHealthy = true;

    for (const [name, service] of this.services) {
      try {
        const health = await service.health();
        serviceHealth[name] = health;
        if (health.status === 'unhealthy') {
          allHealthy = false;
        }
      } catch (error) {
        serviceHealth[name] = { status: 'unhealthy', error: (error as Error).message };
        allHealthy = false;
      }
    }

    return {
      status: allHealthy ? 'healthy' : 'unhealthy',
      services: serviceHealth
    };
  }

  get isStarted(): boolean {
    return this.isRunning;
  }
}

// Export singleton instance
export const coreApp = new CoreApplication(); 