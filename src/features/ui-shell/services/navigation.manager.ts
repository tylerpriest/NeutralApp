import { INavigationManager } from '../interfaces/ui.interface';
import { RouteDefinition, RouteInfo, NavigationGuard, UIComponent, ComponentLocation } from '../../../shared';

interface NavigationHistory {
  path: string;
  timestamp: Date;
}

export class NavigationManager implements INavigationManager {
  private router: any;
  private componentRegistry: any;
  private guards: NavigationGuard[] = [];
  private currentRoute: RouteInfo | null = null;
  private history: NavigationHistory[] = [];

  constructor() {
    this.initializeComponents();
  }

  private initializeComponents(): void {
    // Initialize router (in a real app, this would be a proper router like React Router)
    this.router = {
      navigate: async (path: string, state?: any): Promise<boolean> => {
        try {
          // Simulate navigation logic
          const newRoute: RouteInfo = {
            path,
            name: this.getRouteNameFromPath(path),
            params: this.extractParams(path),
            query: this.extractQuery(path),
            meta: state || {},
            fullPath: path
          };

          // Execute guards before navigation
          const canNavigate = await this.executeGuards('canActivate', newRoute, this.currentRoute);
          if (!canNavigate) {
            return false;
          }

          // Update current route and history
          this.currentRoute = newRoute;
          this.history.push({ path, timestamp: new Date() });

          // In a real implementation, this would update the browser URL
          if (typeof window !== 'undefined' && window.history) {
            window.history.pushState(state, '', path);
          }

          return true;
        } catch (error) {
          console.error('Navigation error:', error);
          throw error;
        }
      },

      getCurrentRoute: (): RouteInfo | null => {
        return this.currentRoute;
      },

      addRoute: (route: RouteDefinition): void => {
        // In a real router, this would register the route
        console.log(`Route registered: ${route.path} -> ${route.component}`);
      },

      removeRoute: (path: string): void => {
        console.log(`Route removed: ${path}`);
      },

      onRouteChange: (callback: (route: RouteInfo) => void): () => void => {
        // Setup route change listener
        return () => {
          // Cleanup function
        };
      },

      getHistory: (): NavigationHistory[] => {
        return [...this.history];
      },

      go: (delta: number): boolean => {
        // Simulate history navigation
        return this.history.length > Math.abs(delta);
      },

      back: (): boolean => {
        if (this.history.length > 1) {
          this.history.pop(); // Remove current
          const previousRoute = this.history[this.history.length - 1];
          if (previousRoute) {
            this.currentRoute = {
              path: previousRoute.path,
              name: this.getRouteNameFromPath(previousRoute.path),
              params: this.extractParams(previousRoute.path),
              query: this.extractQuery(previousRoute.path),
              meta: {},
              fullPath: previousRoute.path
            };
            return true;
          }
        }
        return false;
      },

      forward: (): boolean => {
        // Simplified forward navigation
        return false; // In real implementation, would check forward history
      }
    };

    // Initialize component registry
    this.componentRegistry = {
      components: new Map<string, { component: UIComponent; location: ComponentLocation }>(),

      registerComponent: (component: UIComponent, location: ComponentLocation): void => {
        this.componentRegistry.components.set(component.id, { component, location });
      },

      unregisterComponent: (componentId: string): void => {
        this.componentRegistry.components.delete(componentId);
      },

      getComponentsForLocation: (location: ComponentLocation): UIComponent[] => {
        const components: UIComponent[] = [];
        for (const [, entry] of this.componentRegistry.components) {
          if (entry.location === location) {
            components.push(entry.component);
          }
        }
        return components;
      },

      clearComponents: (): void => {
        this.componentRegistry.components.clear();
      }
    };
  }

  private getRouteNameFromPath(path: string): string {
    // Extract route name from path (simplified)
    const segments = path.split('/').filter(s => s);
    if (segments.length > 0 && segments[0]) {
      return segments[0].charAt(0).toUpperCase() + segments[0].slice(1);
    }
    return 'Home';
  }

  private extractParams(path: string): Record<string, string> {
    // Extract route parameters (simplified)
    const params: Record<string, string> = {};
    // In a real router, this would parse dynamic segments like /users/:id
    return params;
  }

  private extractQuery(path: string): Record<string, string> {
    // Extract query parameters
    const query: Record<string, string> = {};
    const queryIndex = path.indexOf('?');
    if (queryIndex > -1) {
      const queryString = path.substring(queryIndex + 1);
      const pairs = queryString.split('&');
      for (const pair of pairs) {
        const [key, value] = pair.split('=');
        if (key) {
          query[decodeURIComponent(key)] = decodeURIComponent(value || '');
        }
      }
    }
    return query;
  }

  private async executeGuards(
    type: 'canActivate' | 'canDeactivate',
    to: RouteInfo,
    from: RouteInfo | null
  ): Promise<boolean> {
    // Sort guards by priority (lower numbers = higher priority)
    const sortedGuards = [...this.guards].sort((a, b) => a.priority - b.priority);

    for (const guard of sortedGuards) {
      try {
        let result: boolean;
        if (type === 'canActivate') {
          result = await guard.canActivate(to, from || undefined);
                 } else {
           result = await guard.canDeactivate(from!, to || undefined);
         }

        if (!result) {
          return false;
        }
      } catch (error) {
        console.error(`Navigation guard ${guard.name} failed:`, error);
        return false;
      }
    }

    return true;
  }

  registerRoute(route: RouteDefinition): void {
    this.router.addRoute(route);
  }

  async navigate(path: string, state?: any): Promise<boolean> {
    return await this.router.navigate(path, state);
  }

  getCurrentRoute(): RouteInfo | null {
    return this.router.getCurrentRoute();
  }

  setNavigationGuard(guard: NavigationGuard): void {
    // Remove existing guard with same name
    this.guards = this.guards.filter(g => g.name !== guard.name);
    // Add new guard
    this.guards.push(guard);
  }

  goBack(): boolean {
    return this.router.back();
  }

  goForward(): boolean {
    return this.router.forward();
  }

  getNavigationHistory(): NavigationHistory[] {
    return this.router.getHistory();
  }

  registerComponent(component: UIComponent, location: ComponentLocation): void {
    this.componentRegistry.registerComponent(component, location);
  }

  unregisterComponent(componentId: string): void {
    this.componentRegistry.unregisterComponent(componentId);
  }

  getComponentsForLocation(location: ComponentLocation): UIComponent[] {
    return this.componentRegistry.getComponentsForLocation(location);
  }

  cleanup(): void {
    this.componentRegistry.clearComponents();
    this.guards = [];
    this.history = [];
    this.currentRoute = null;
  }
} 