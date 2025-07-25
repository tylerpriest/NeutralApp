import { UIComponent, ComponentLocation, RouteDefinition, RouteInfo, NavigationGuard } from '../types';
export interface IUIComponentRegistry {
    registerComponent(component: UIComponent, location: ComponentLocation): void;
    unregisterComponent(componentId: string): void;
    getComponentsForLocation(location: ComponentLocation): UIComponent[];
}
export interface INavigationManager {
    registerRoute(route: RouteDefinition): void;
    navigate(path: string, state?: any): void;
    getCurrentRoute(): RouteInfo;
    setNavigationGuard(guard: NavigationGuard): void;
}
//# sourceMappingURL=ui.interface.d.ts.map