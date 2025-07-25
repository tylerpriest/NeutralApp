import { UIComponent, ComponentLocation, RouteDefinition, RouteInfo, NavigationGuard, LayoutConfig, ResponsiveBreakpoint, LayoutItem } from '../../../shared';

export interface IUIComponentRegistry {
  registerComponent(component: UIComponent, location: ComponentLocation): void;
  unregisterComponent(componentId: string): void;
  getComponentsForLocation(location: ComponentLocation): UIComponent[];
}

export interface ILayoutManager {
  registerComponent(component: UIComponent, location: ComponentLocation): void;
  unregisterComponent(componentId: string): void;
  getComponentsForLocation(location: ComponentLocation): UIComponent[];
  setLayoutConfig(config: Partial<LayoutConfig>): void;
  getLayoutConfig(): LayoutConfig;
  getCurrentBreakpoint(): ResponsiveBreakpoint;
  calculateLayout(components: UIComponent[], breakpoint: ResponsiveBreakpoint): LayoutItem[];
  applyResponsiveStyles(breakpoint: ResponsiveBreakpoint): Record<string, string>;
  onBreakpointChange(callback: (breakpoint: ResponsiveBreakpoint) => void): () => void;
  handleResize(): void;
  clearLayout(): void;
}

export interface INavigationManager {
  registerRoute(route: RouteDefinition): void;
  navigate(path: string, state?: any): Promise<boolean>;
  getCurrentRoute(): RouteInfo | null;
  setNavigationGuard(guard: NavigationGuard): void;
  goBack(): boolean;
  goForward(): boolean;
  getNavigationHistory(): any[];
  registerComponent(component: UIComponent, location: ComponentLocation): void;
  unregisterComponent(componentId: string): void;
  getComponentsForLocation(location: ComponentLocation): UIComponent[];
  cleanup(): void;
} 