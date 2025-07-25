import { ILayoutManager } from '../interfaces/ui.interface';
import { UIComponent, ComponentLocation, LayoutConfig, ResponsiveBreakpoint, LayoutItem, ComponentPosition, ComponentSize } from '../../../shared';

export class LayoutManager implements ILayoutManager {
  private components: Map<ComponentLocation, UIComponent[]> = new Map();
  private config: LayoutConfig;
  private breakpointListeners: Array<(breakpoint: ResponsiveBreakpoint) => void> = [];
  private currentBreakpoint: ResponsiveBreakpoint = ResponsiveBreakpoint.DESKTOP;
  private resizeHandler?: (event: Event) => void;

  constructor() {
    this.config = this.getDefaultConfig();
    this.initializeResizeListener();
  }

  private getDefaultConfig(): LayoutConfig {
    return {
      breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1440
      },
      containers: {
        maxWidth: '1200px',
        padding: '16px',
        margin: 'auto'
      },
      grid: {
        columns: 12,
        gap: '16px'
      }
    };
  }

  private initializeResizeListener(): void {
    if (typeof window !== 'undefined') {
      this.resizeHandler = this.handleResize.bind(this);
      window.addEventListener('resize', this.resizeHandler);
    }
  }

  registerComponent(component: UIComponent, location: ComponentLocation): void {
    if (!this.components.has(location)) {
      this.components.set(location, []);
    }
    
    const locationComponents = this.components.get(location)!;
    locationComponents.push(component);
  }

  unregisterComponent(componentId: string): void {
    for (const [location, components] of this.components.entries()) {
      const index = components.findIndex(c => c.id === componentId);
      if (index > -1) {
        components.splice(index, 1);
        if (components.length === 0) {
          this.components.delete(location);
        }
        break;
      }
    }
  }

  getComponentsForLocation(location: ComponentLocation): UIComponent[] {
    return this.components.get(location) || [];
  }

  setLayoutConfig(config: Partial<LayoutConfig>): void {
    this.config = {
      breakpoints: { ...this.config.breakpoints, ...config.breakpoints },
      containers: { ...this.config.containers, ...config.containers },
      grid: { ...this.config.grid, ...config.grid }
    };
  }

  getLayoutConfig(): LayoutConfig {
    return { ...this.config };
  }

  getCurrentBreakpoint(): ResponsiveBreakpoint {
    if (typeof window === 'undefined') {
      return ResponsiveBreakpoint.DESKTOP;
    }

    const width = window.innerWidth;
    
    if (width < this.config.breakpoints.mobile) {
      return ResponsiveBreakpoint.MOBILE;
    } else if (width < this.config.breakpoints.tablet) {
      return ResponsiveBreakpoint.TABLET;
    } else {
      return ResponsiveBreakpoint.DESKTOP;
    }
  }

  calculateLayout(components: UIComponent[], breakpoint: ResponsiveBreakpoint): LayoutItem[] {
    const layout: LayoutItem[] = [];
    const gridColumns = this.config.grid.columns;
    
    // Sort components by priority if specified
    const sortedComponents = [...components].sort((a, b) => {
      const priorityA = a.props?.priority || 999;
      const priorityB = b.props?.priority || 999;
      return priorityA - priorityB;
    });

    let currentX = 0;
    let currentY = 0;
    let maxRowHeight = 0;

    for (const component of sortedComponents) {
      try {
        const size = this.getComponentSize(component, breakpoint);
        
        // Check if component fits in current row
        if (currentX + size.width > gridColumns) {
          // Move to next row
          currentX = 0;
          currentY += maxRowHeight;
          maxRowHeight = 0;
        }

        const position: ComponentPosition = { x: currentX, y: currentY };
        
        layout.push({
          componentId: component.id,
          position,
          size
        });

        currentX += size.width;
        maxRowHeight = Math.max(maxRowHeight, size.height);

      } catch (error) {
        console.error(`Error calculating layout for component ${component.id}:`, error);
        
        // Provide fallback layout
        layout.push({
          componentId: component.id,
          position: { x: 0, y: currentY },
          size: { width: gridColumns, height: 2 }
        });
        
        currentY += 2;
      }
    }

    return layout;
  }

  private getComponentSize(component: UIComponent, breakpoint: ResponsiveBreakpoint): ComponentSize {
    const defaultSize = { width: 6, height: 3 };
    
    // Get size from component props
    const propsSize = component.props?.size;
    if (!propsSize) {
      return breakpoint === ResponsiveBreakpoint.MOBILE 
        ? { width: this.config.grid.columns, height: defaultSize.height }
        : defaultSize;
    }

    // Validate size values
    let width = typeof propsSize.width === 'number' && propsSize.width > 0 
      ? propsSize.width 
      : defaultSize.width;
    let height = typeof propsSize.height === 'number' && propsSize.height > 0 
      ? propsSize.height 
      : defaultSize.height;

    // Apply responsive adjustments
    switch (breakpoint) {
      case ResponsiveBreakpoint.MOBILE:
        // Full width on mobile
        width = this.config.grid.columns;
        break;
      case ResponsiveBreakpoint.TABLET:
        // Ensure minimum width on tablet
        width = Math.max(width, 4);
        break;
      case ResponsiveBreakpoint.DESKTOP:
        // Use original width on desktop
        break;
    }

    // Ensure width doesn't exceed grid columns
    width = Math.min(width, this.config.grid.columns);

    return { width, height };
  }

  applyResponsiveStyles(breakpoint: ResponsiveBreakpoint): Record<string, string> {
    const baseStyles = {
      maxWidth: this.config.containers.maxWidth,
      margin: this.config.containers.margin,
      display: 'grid',
      gap: this.config.grid.gap,
      gridTemplateColumns: `repeat(${this.config.grid.columns}, 1fr)`
    };

    switch (breakpoint) {
      case ResponsiveBreakpoint.MOBILE:
        return {
          ...baseStyles,
          padding: '8px',
          gridTemplateColumns: '1fr',
          maxWidth: '100%'
        };
      case ResponsiveBreakpoint.TABLET:
        return {
          ...baseStyles,
          padding: '12px',
          gridTemplateColumns: `repeat(${Math.min(this.config.grid.columns, 8)}, 1fr)`
        };
      case ResponsiveBreakpoint.DESKTOP:
      default:
        return {
          ...baseStyles,
          padding: this.config.containers.padding
        };
    }
  }

  onBreakpointChange(callback: (breakpoint: ResponsiveBreakpoint) => void): () => void {
    this.breakpointListeners.push(callback);

    // Return unsubscribe function
    return () => {
      const index = this.breakpointListeners.indexOf(callback);
      if (index > -1) {
        this.breakpointListeners.splice(index, 1);
      }
    };
  }

  handleResize(): void {
    const newBreakpoint = this.getCurrentBreakpoint();
    
    if (newBreakpoint !== this.currentBreakpoint) {
      this.currentBreakpoint = newBreakpoint;
      
      // Notify listeners
      this.breakpointListeners.forEach(callback => {
        try {
          callback(newBreakpoint);
        } catch (error) {
          console.error('Error in breakpoint change listener:', error);
        }
      });
    }
  }

  clearLayout(): void {
    this.components.clear();
    this.config = this.getDefaultConfig();
    this.breakpointListeners = [];
    
    // Clean up event listeners
    if (typeof window !== 'undefined' && this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
      this.resizeHandler = undefined;
    }
  }
} 