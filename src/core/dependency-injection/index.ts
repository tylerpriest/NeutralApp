// Dependency Injection Container
export interface ServiceFactory<T> {
  (container: Container): T;
}

export interface ServiceRegistration<T> {
  factory: ServiceFactory<T>;
  singleton: boolean;
}

export class Container {
  private services: Map<string, ServiceRegistration<any>> = new Map();
  private instances: Map<string, any> = new Map();

  register<T>(name: string, factory: ServiceFactory<T>, singleton: boolean = true): void {
    this.services.set(name, { factory, singleton });
  }

  resolve<T>(name: string): T {
    const registration = this.services.get(name);
    if (!registration) {
      throw new Error(`Service '${name}' not registered`);
    }

    if (registration.singleton) {
      if (!this.instances.has(name)) {
        this.instances.set(name, registration.factory(this));
      }
      return this.instances.get(name);
    } else {
      return registration.factory(this);
    }
  }

  has(name: string): boolean {
    return this.services.has(name);
  }

  clear(): void {
    this.services.clear();
    this.instances.clear();
  }

  get registeredServices(): string[] {
    return Array.from(this.services.keys());
  }
}

// Export singleton instance
export const container = new Container(); 