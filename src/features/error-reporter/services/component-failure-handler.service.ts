import { ComponentFailureHandler, ComponentFailureContext } from '../interfaces/error-recovery.interface';

export class ComponentFailureHandlerService implements ComponentFailureHandler {
  private componentHealth: Map<string, boolean> = new Map();
  private fallbackComponents: Map<string, any> = new Map();

  async handleComponentFailure(componentId: string, error: Error, context: ComponentFailureContext): Promise<void> {
    this.componentHealth.set(componentId, false);
    console.log(`Component ${componentId} marked as unhealthy: ${error.message}`);
  }

  registerFallbackComponent(componentId: string, fallbackComponent: any): void {
    this.fallbackComponents.set(componentId, fallbackComponent);
    console.log(`Fallback component registered for ${componentId}`);
  }

  async getFallbackComponent(componentId: string): Promise<any> {
    return this.fallbackComponents.get(componentId) || null;
  }

  async isComponentHealthy(componentId: string): Promise<boolean> {
    return this.componentHealth.get(componentId) ?? true;
  }

  markComponentUnhealthy(componentId: string): void {
    this.componentHealth.set(componentId, false);
    console.log(`Component ${componentId} marked as unhealthy`);
  }

  async restoreComponent(componentId: string): Promise<void> {
    this.componentHealth.set(componentId, true);
    console.log(`Component ${componentId} restored to healthy state`);
  }
} 