import { NavigationManager } from '../services/navigation.manager';
import { RouteDefinition, RouteInfo, NavigationGuard, UIComponent, ComponentLocation } from '../../../shared/types';

// Mock router implementation
const mockRouter = {
  navigate: jest.fn(),
  getCurrentRoute: jest.fn(),
  addRoute: jest.fn(),
  removeRoute: jest.fn(),
  onRouteChange: jest.fn(),
  getHistory: jest.fn(),
  go: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
};

// Mock UI component registry
const mockComponentRegistry = {
  registerComponent: jest.fn(),
  unregisterComponent: jest.fn(),
  getComponentsForLocation: jest.fn(),
  clearComponents: jest.fn(),
};

describe('NavigationManager', () => {
  let navigationManager: NavigationManager;

  beforeEach(() => {
    jest.clearAllMocks();
    navigationManager = new NavigationManager();

    // Inject mocks
    (navigationManager as any).router = mockRouter;
    (navigationManager as any).componentRegistry = mockComponentRegistry;
  });

  describe('registerRoute', () => {
    it('should register a new route successfully', () => {
      const route: RouteDefinition = {
        path: '/dashboard',
        component: 'DashboardComponent',
        name: 'Dashboard',
        meta: { requiresAuth: true },
        guards: []
      };

      navigationManager.registerRoute(route);

      expect(mockRouter.addRoute).toHaveBeenCalledWith(route);
    });

    it('should register multiple routes', () => {
      const routes: RouteDefinition[] = [
        {
          path: '/settings',
          component: 'SettingsComponent',
          name: 'Settings',
          meta: { requiresAuth: true },
          guards: []
        },
        {
          path: '/plugins',
          component: 'PluginsComponent',
          name: 'Plugins',
          meta: { requiresAuth: true },
          guards: []
        }
      ];

      routes.forEach(route => navigationManager.registerRoute(route));

      expect(mockRouter.addRoute).toHaveBeenCalledTimes(2);
      expect(mockRouter.addRoute).toHaveBeenCalledWith(routes[0]);
      expect(mockRouter.addRoute).toHaveBeenCalledWith(routes[1]);
    });

    it('should handle route registration with guards', () => {
      const authGuard: NavigationGuard = {
        name: 'auth-guard',
        canActivate: async () => true,
        canDeactivate: async () => true,
        priority: 1
      };

      const route: RouteDefinition = {
        path: '/admin',
        component: 'AdminComponent',
        name: 'Admin',
        meta: { requiresAdmin: true },
        guards: [authGuard]
      };

      navigationManager.registerRoute(route);

      expect(mockRouter.addRoute).toHaveBeenCalledWith(route);
    });
  });

  describe('navigate', () => {
    it('should navigate to a valid path', async () => {
      mockRouter.navigate.mockResolvedValue(true);

      const result = await navigationManager.navigate('/dashboard');

      expect(result).toBe(true);
      expect(mockRouter.navigate).toHaveBeenCalledWith('/dashboard', undefined);
    });

    it('should navigate with state', async () => {
      const state = { fromPage: 'home', userId: '123' };
      mockRouter.navigate.mockResolvedValue(true);

      const result = await navigationManager.navigate('/profile', state);

      expect(result).toBe(true);
      expect(mockRouter.navigate).toHaveBeenCalledWith('/profile', state);
    });

    it('should handle navigation failures', async () => {
      mockRouter.navigate.mockResolvedValue(false);

      const result = await navigationManager.navigate('/invalid-path');

      expect(result).toBe(false);
      expect(mockRouter.navigate).toHaveBeenCalledWith('/invalid-path', undefined);
    });

    it('should handle navigation errors', async () => {
      mockRouter.navigate.mockRejectedValue(new Error('Navigation failed'));

      await expect(navigationManager.navigate('/error-path')).rejects.toThrow('Navigation failed');
    });
  });

  describe('getCurrentRoute', () => {
    it('should return current route information', () => {
      const mockRoute: RouteInfo = {
        path: '/dashboard',
        name: 'Dashboard',
        params: {},
        query: {},
        meta: { requiresAuth: true },
        fullPath: '/dashboard'
      };

      mockRouter.getCurrentRoute.mockReturnValue(mockRoute);

      const route = navigationManager.getCurrentRoute();

      expect(route).toEqual(mockRoute);
      expect(mockRouter.getCurrentRoute).toHaveBeenCalled();
    });

    it('should return null when no route is active', () => {
      mockRouter.getCurrentRoute.mockReturnValue(null);

      const route = navigationManager.getCurrentRoute();

      expect(route).toBeNull();
    });
  });

  describe('setNavigationGuard', () => {
    it('should set a global navigation guard', () => {
      const guard: NavigationGuard = {
        name: 'global-auth-guard',
        canActivate: async (to, from) => {
          return to.meta?.requiresAuth ? false : true;
        },
        canDeactivate: async () => true,
        priority: 1
      };

      navigationManager.setNavigationGuard(guard);

      // Verify guard was stored internally
      expect((navigationManager as any).guards).toContain(guard);
    });

    it('should set multiple guards with different priorities', () => {
      const authGuard: NavigationGuard = {
        name: 'auth-guard',
        canActivate: async () => true,
        canDeactivate: async () => true,
        priority: 1
      };

      const adminGuard: NavigationGuard = {
        name: 'admin-guard',
        canActivate: async () => false,
        canDeactivate: async () => true,
        priority: 2
      };

      navigationManager.setNavigationGuard(authGuard);
      navigationManager.setNavigationGuard(adminGuard);

      const guards = (navigationManager as any).guards;
      expect(guards).toContain(authGuard);
      expect(guards).toContain(adminGuard);
    });
  });

  describe('goBack', () => {
    it('should navigate back in history', () => {
      mockRouter.back.mockReturnValue(true);

      const result = navigationManager.goBack();

      expect(result).toBe(true);
      expect(mockRouter.back).toHaveBeenCalled();
    });

    it('should handle cases when back navigation is not possible', () => {
      mockRouter.back.mockReturnValue(false);

      const result = navigationManager.goBack();

      expect(result).toBe(false);
    });
  });

  describe('goForward', () => {
    it('should navigate forward in history', () => {
      mockRouter.forward.mockReturnValue(true);

      const result = navigationManager.goForward();

      expect(result).toBe(true);
      expect(mockRouter.forward).toHaveBeenCalled();
    });

    it('should handle cases when forward navigation is not possible', () => {
      mockRouter.forward.mockReturnValue(false);

      const result = navigationManager.goForward();

      expect(result).toBe(false);
    });
  });

  describe('getNavigationHistory', () => {
    it('should return navigation history', () => {
      const mockHistory = [
        { path: '/', timestamp: new Date() },
        { path: '/dashboard', timestamp: new Date() },
        { path: '/settings', timestamp: new Date() }
      ];

      mockRouter.getHistory.mockReturnValue(mockHistory);

      const history = navigationManager.getNavigationHistory();

      expect(history).toEqual(mockHistory);
      expect(mockRouter.getHistory).toHaveBeenCalled();
    });
  });

  describe('registerComponent', () => {
    it('should register UI component for navigation', () => {
      const component: UIComponent = {
        id: 'nav-menu',
        name: 'Navigation Menu',
        type: 'navigation',
        component: 'NavMenuComponent',
        props: {},
        permissions: ['read:navigation']
      };

      navigationManager.registerComponent(component, ComponentLocation.NAVIGATION);

      expect(mockComponentRegistry.registerComponent).toHaveBeenCalledWith(
        component,
        ComponentLocation.NAVIGATION
      );
    });

    it('should register multiple components for different locations', () => {
      const navComponent: UIComponent = {
        id: 'nav-breadcrumb',
        name: 'Breadcrumb',
        type: 'navigation',
        component: 'BreadcrumbComponent',
        props: {},
        permissions: []
      };

      const headerComponent: UIComponent = {
        id: 'header-actions',
        name: 'Header Actions',
        type: 'action',
        component: 'HeaderActionsComponent',
        props: {},
        permissions: []
      };

      navigationManager.registerComponent(navComponent, ComponentLocation.NAVIGATION);
      navigationManager.registerComponent(headerComponent, ComponentLocation.HEADER);

      expect(mockComponentRegistry.registerComponent).toHaveBeenCalledTimes(2);
      expect(mockComponentRegistry.registerComponent).toHaveBeenCalledWith(
        navComponent,
        ComponentLocation.NAVIGATION
      );
      expect(mockComponentRegistry.registerComponent).toHaveBeenCalledWith(
        headerComponent,
        ComponentLocation.HEADER
      );
    });
  });

  describe('unregisterComponent', () => {
    it('should unregister UI component', () => {
      navigationManager.unregisterComponent('nav-menu');

      expect(mockComponentRegistry.unregisterComponent).toHaveBeenCalledWith('nav-menu');
    });
  });

  describe('getComponentsForLocation', () => {
    it('should return components for specific location', () => {
      const mockComponents: UIComponent[] = [
        {
          id: 'nav-menu',
          name: 'Navigation Menu',
          type: 'navigation',
          component: 'NavMenuComponent',
          props: {},
          permissions: []
        },
        {
          id: 'breadcrumb',
          name: 'Breadcrumb',
          type: 'navigation',
          component: 'BreadcrumbComponent',
          props: {},
          permissions: []
        }
      ];

      mockComponentRegistry.getComponentsForLocation.mockReturnValue(mockComponents);

      const components = navigationManager.getComponentsForLocation(ComponentLocation.NAVIGATION);

      expect(components).toEqual(mockComponents);
      expect(mockComponentRegistry.getComponentsForLocation).toHaveBeenCalledWith(
        ComponentLocation.NAVIGATION
      );
    });

    it('should return empty array when no components exist for location', () => {
      mockComponentRegistry.getComponentsForLocation.mockReturnValue([]);

      const components = navigationManager.getComponentsForLocation(ComponentLocation.SIDEBAR);

      expect(components).toEqual([]);
    });
  });

  describe('Guard execution', () => {
    it('should execute navigation guards before navigation', async () => {
      const guard: NavigationGuard = {
        name: 'test-guard',
        canActivate: jest.fn().mockResolvedValue(true),
        canDeactivate: jest.fn().mockResolvedValue(true),
        priority: 1
      };

      navigationManager.setNavigationGuard(guard);

      const fromRoute: RouteInfo = {
        path: '/home',
        name: 'Home',
        params: {},
        query: {},
        meta: {},
        fullPath: '/home'
      };

      const toRoute: RouteInfo = {
        path: '/dashboard',
        name: 'Dashboard',
        params: {},
        query: {},
        meta: { requiresAuth: true },
        fullPath: '/dashboard'
      };

      const canNavigate = await (navigationManager as any).executeGuards('canActivate', toRoute, fromRoute);

      expect(canNavigate).toBe(true);
      expect(guard.canActivate).toHaveBeenCalledWith(toRoute, fromRoute);
    });

    it('should prevent navigation when guard returns false', async () => {
      const guard: NavigationGuard = {
        name: 'auth-guard',
        canActivate: jest.fn().mockResolvedValue(false),
        canDeactivate: jest.fn().mockResolvedValue(true),
        priority: 1
      };

      navigationManager.setNavigationGuard(guard);

      const fromRoute: RouteInfo = {
        path: '/home',
        name: 'Home',
        params: {},
        query: {},
        meta: {},
        fullPath: '/home'
      };

      const toRoute: RouteInfo = {
        path: '/admin',
        name: 'Admin',
        params: {},
        query: {},
        meta: { requiresAdmin: true },
        fullPath: '/admin'
      };

      const canNavigate = await (navigationManager as any).executeGuards('canActivate', toRoute, fromRoute);

      expect(canNavigate).toBe(false);
    });

    it('should execute guards in priority order', async () => {
      const executionOrder: number[] = [];

      const guard1: NavigationGuard = {
        name: 'guard-1',
        canActivate: jest.fn().mockImplementation(async () => {
          executionOrder.push(1);
          return true;
        }),
        canDeactivate: jest.fn().mockResolvedValue(true),
        priority: 2
      };

      const guard2: NavigationGuard = {
        name: 'guard-2',
        canActivate: jest.fn().mockImplementation(async () => {
          executionOrder.push(2);
          return true;
        }),
        canDeactivate: jest.fn().mockResolvedValue(true),
        priority: 1
      };

      navigationManager.setNavigationGuard(guard1);
      navigationManager.setNavigationGuard(guard2);

      const toRoute: RouteInfo = {
        path: '/test',
        name: 'Test',
        params: {},
        query: {},
        meta: {},
        fullPath: '/test'
      };

      await (navigationManager as any).executeGuards('canActivate', toRoute, null);

      // Guard2 (priority 1) should execute before Guard1 (priority 2)
      expect(executionOrder).toEqual([2, 1]);
    });
  });

  describe('cleanup', () => {
    it('should cleanup all registered routes and components', () => {
      navigationManager.cleanup();

      expect(mockComponentRegistry.clearComponents).toHaveBeenCalled();
      // Verify internal state is cleared
      expect((navigationManager as any).guards).toEqual([]);
    });
  });
}); 