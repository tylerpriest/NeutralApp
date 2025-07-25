import { LayoutManager } from '../../src/services/layout.manager';
import { UIComponent, ComponentLocation, LayoutConfig, ResponsiveBreakpoint } from '../../src/types';

describe('LayoutManager', () => {
  let layoutManager: LayoutManager;

  beforeEach(() => {
    layoutManager = new LayoutManager();
  });

  describe('registerComponent', () => {
    it('should register a component for a specific location', () => {
      const component: UIComponent = {
        id: 'test-component',
        name: 'Test Component',
        type: 'widget',
        component: 'TestWidget',
        props: { title: 'Test' },
        permissions: []
      };

      layoutManager.registerComponent(component, ComponentLocation.MAIN);

      const components = layoutManager.getComponentsForLocation(ComponentLocation.MAIN);
      expect(components).toContain(component);
    });

    it('should register multiple components for the same location', () => {
      const component1: UIComponent = {
        id: 'component-1',
        name: 'Component 1',
        type: 'widget',
        component: 'Widget1',
        props: {},
        permissions: []
      };

      const component2: UIComponent = {
        id: 'component-2',
        name: 'Component 2',
        type: 'widget',
        component: 'Widget2',
        props: {},
        permissions: []
      };

      layoutManager.registerComponent(component1, ComponentLocation.SIDEBAR);
      layoutManager.registerComponent(component2, ComponentLocation.SIDEBAR);

      const components = layoutManager.getComponentsForLocation(ComponentLocation.SIDEBAR);
      expect(components).toHaveLength(2);
      expect(components).toContain(component1);
      expect(components).toContain(component2);
    });
  });

  describe('unregisterComponent', () => {
    it('should remove a component by id', () => {
      const component: UIComponent = {
        id: 'removable-component',
        name: 'Removable Component',
        type: 'widget',
        component: 'RemovableWidget',
        props: {},
        permissions: []
      };

      layoutManager.registerComponent(component, ComponentLocation.HEADER);
      layoutManager.unregisterComponent('removable-component');

      const components = layoutManager.getComponentsForLocation(ComponentLocation.HEADER);
      expect(components).not.toContain(component);
    });

    it('should handle unregistering non-existent component gracefully', () => {
      expect(() => {
        layoutManager.unregisterComponent('non-existent');
      }).not.toThrow();
    });
  });

  describe('getComponentsForLocation', () => {
    it('should return empty array for location with no components', () => {
      const components = layoutManager.getComponentsForLocation(ComponentLocation.FOOTER);
      expect(components).toEqual([]);
    });

    it('should return components in registration order', () => {
      const component1: UIComponent = {
        id: 'first',
        name: 'First Component',
        type: 'widget',
        component: 'FirstWidget',
        props: {},
        permissions: []
      };

      const component2: UIComponent = {
        id: 'second',
        name: 'Second Component',
        type: 'widget',
        component: 'SecondWidget',
        props: {},
        permissions: []
      };

      layoutManager.registerComponent(component1, ComponentLocation.MAIN);
      layoutManager.registerComponent(component2, ComponentLocation.MAIN);

      const components = layoutManager.getComponentsForLocation(ComponentLocation.MAIN);
      expect(components).toEqual([component1, component2]);
    });
  });

  describe('setLayoutConfig', () => {
    it('should set responsive layout configuration', () => {
      const config: LayoutConfig = {
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

      layoutManager.setLayoutConfig(config);

      const retrievedConfig = layoutManager.getLayoutConfig();
      expect(retrievedConfig).toEqual(config);
    });

    it('should merge with default configuration', () => {
      const partialConfig: Partial<LayoutConfig> = {
        breakpoints: {
          mobile: 600,
          tablet: 900,
          desktop: 1200
        }
      };

      layoutManager.setLayoutConfig(partialConfig);

      const config = layoutManager.getLayoutConfig();
      expect(config.breakpoints).toEqual(partialConfig.breakpoints);
      // Should keep default values for other properties
      expect(config.containers).toBeDefined();
      expect(config.grid).toBeDefined();
    });
  });

  describe('getCurrentBreakpoint', () => {
    it('should return mobile for small widths', () => {
      // Mock window width
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 600
      });

      const breakpoint = layoutManager.getCurrentBreakpoint();
      expect(breakpoint).toBe(ResponsiveBreakpoint.MOBILE);
    });

    it('should return tablet for medium widths', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 900
      });

      const breakpoint = layoutManager.getCurrentBreakpoint();
      expect(breakpoint).toBe(ResponsiveBreakpoint.TABLET);
    });

    it('should return desktop for large widths', () => {
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1400
      });

      const breakpoint = layoutManager.getCurrentBreakpoint();
      expect(breakpoint).toBe(ResponsiveBreakpoint.DESKTOP);
    });
  });

  describe('calculateLayout', () => {
    it('should calculate grid layout for components', () => {
      const components: UIComponent[] = [
        {
          id: 'widget-1',
          name: 'Widget 1',
          type: 'widget',
          component: 'Widget1',
          props: { size: { width: 4, height: 2 } },
          permissions: []
        },
        {
          id: 'widget-2',
          name: 'Widget 2',
          type: 'widget',
          component: 'Widget2',
          props: { size: { width: 8, height: 3 } },
          permissions: []
        }
      ];

      const layout = layoutManager.calculateLayout(components, ResponsiveBreakpoint.DESKTOP);

      expect(layout).toHaveLength(2);
      expect(layout[0]).toMatchObject({
        componentId: 'widget-1',
        position: { x: 0, y: 0 },
        size: { width: 4, height: 2 }
      });
      expect(layout[1]).toMatchObject({
        componentId: 'widget-2',
        position: { x: 4, y: 0 },
        size: { width: 8, height: 3 }
      });
    });

    it('should wrap to next row when components exceed grid width', () => {
      const components: UIComponent[] = [
        {
          id: 'widget-1',
          name: 'Widget 1',
          type: 'widget',
          component: 'Widget1',
          props: { size: { width: 8, height: 2 } },
          permissions: []
        },
        {
          id: 'widget-2',
          name: 'Widget 2',
          type: 'widget',
          component: 'Widget2',
          props: { size: { width: 6, height: 2 } },
          permissions: []
        }
      ];

      const layout = layoutManager.calculateLayout(components, ResponsiveBreakpoint.DESKTOP);

      expect(layout[0]?.position).toEqual({ x: 0, y: 0 });
      expect(layout[1]?.position).toEqual({ x: 0, y: 2 }); // Next row
    });

    it('should adjust component sizes for mobile breakpoint', () => {
      const components: UIComponent[] = [
        {
          id: 'widget-1',
          name: 'Widget 1',
          type: 'widget',
          component: 'Widget1',
          props: { size: { width: 6, height: 2 } },
          permissions: []
        }
      ];

      const layout = layoutManager.calculateLayout(components, ResponsiveBreakpoint.MOBILE);

      // On mobile, components should take full width
      expect(layout[0]?.size.width).toBe(12);
    });
  });

  describe('applyResponsiveStyles', () => {
    it('should return CSS styles for responsive layout', () => {
      const styles = layoutManager.applyResponsiveStyles(ResponsiveBreakpoint.TABLET);

      expect(styles).toHaveProperty('maxWidth');
      expect(styles).toHaveProperty('padding');
      expect(styles).toHaveProperty('gridTemplateColumns');
    });

    it('should provide different styles for different breakpoints', () => {
      const mobileStyles = layoutManager.applyResponsiveStyles(ResponsiveBreakpoint.MOBILE);
      const desktopStyles = layoutManager.applyResponsiveStyles(ResponsiveBreakpoint.DESKTOP);

      expect(mobileStyles.padding).not.toBe(desktopStyles.padding);
      expect(mobileStyles.gridTemplateColumns).not.toBe(desktopStyles.gridTemplateColumns);
    });
  });

  describe('onBreakpointChange', () => {
    it('should register breakpoint change listener', () => {
      const mockCallback = jest.fn();
      
      const unsubscribe = layoutManager.onBreakpointChange(mockCallback);

      // Simulate window resize
      layoutManager.handleResize();

      expect(mockCallback).toHaveBeenCalled();

      // Cleanup
      unsubscribe();
    });

    it('should unsubscribe listeners correctly', () => {
      const mockCallback = jest.fn();
      
      const unsubscribe = layoutManager.onBreakpointChange(mockCallback);
      unsubscribe();

      layoutManager.handleResize();

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe('clearLayout', () => {
    it('should remove all registered components', () => {
      const component: UIComponent = {
        id: 'test-component',
        name: 'Test Component',
        type: 'widget',
        component: 'TestWidget',
        props: {},
        permissions: []
      };

      layoutManager.registerComponent(component, ComponentLocation.MAIN);
      layoutManager.clearLayout();

      const components = layoutManager.getComponentsForLocation(ComponentLocation.MAIN);
      expect(components).toHaveLength(0);
    });

    it('should reset layout configuration to defaults', () => {
      const customConfig: LayoutConfig = {
        breakpoints: {
          mobile: 500,
          tablet: 800,
          desktop: 1100
        },
        containers: {
          maxWidth: '800px',
          padding: '8px',
          margin: '0'
        },
        grid: {
          columns: 8,
          gap: '8px'
        }
      };

      layoutManager.setLayoutConfig(customConfig);
      layoutManager.clearLayout();

      const config = layoutManager.getLayoutConfig();
      // Should be reset to defaults
      expect(config.breakpoints.mobile).not.toBe(500);
      expect(config.containers.maxWidth).not.toBe('800px');
    });
  });

  describe('Component priority and ordering', () => {
    it('should respect component priority in layout calculation', () => {
      const highPriorityComponent: UIComponent = {
        id: 'high-priority',
        name: 'High Priority Component',
        type: 'widget',
        component: 'HighPriorityWidget',
        props: { priority: 1, size: { width: 6, height: 2 } },
        permissions: []
      };

      const lowPriorityComponent: UIComponent = {
        id: 'low-priority',
        name: 'Low Priority Component',
        type: 'widget',
        component: 'LowPriorityWidget',
        props: { priority: 2, size: { width: 6, height: 2 } },
        permissions: []
      };

      // Register in reverse priority order
      layoutManager.registerComponent(lowPriorityComponent, ComponentLocation.MAIN);
      layoutManager.registerComponent(highPriorityComponent, ComponentLocation.MAIN);

      const layout = layoutManager.calculateLayout(
        [lowPriorityComponent, highPriorityComponent],
        ResponsiveBreakpoint.DESKTOP
      );

      // High priority should be positioned first
      const highPriorityLayout = layout.find(l => l.componentId === 'high-priority');
      const lowPriorityLayout = layout.find(l => l.componentId === 'low-priority');

      expect(highPriorityLayout?.position.x).toBeLessThanOrEqual(lowPriorityLayout?.position.x || 0);
    });
  });

  describe('Error handling', () => {
    it('should handle invalid component sizes gracefully', () => {
      const invalidComponent: UIComponent = {
        id: 'invalid-component',
        name: 'Invalid Component',
        type: 'widget',
        component: 'InvalidWidget',
        props: { size: { width: -1, height: 0 } },
        permissions: []
      };

      expect(() => {
        layoutManager.calculateLayout([invalidComponent], ResponsiveBreakpoint.DESKTOP);
      }).not.toThrow();
    });

    it('should provide fallback layout when calculation fails', () => {
      const component: UIComponent = {
        id: 'test-component',
        name: 'Test Component',
        type: 'widget',
        component: 'TestWidget',
        props: {}, // No size specified
        permissions: []
      };

      const layout = layoutManager.calculateLayout([component], ResponsiveBreakpoint.DESKTOP);

      expect(layout).toHaveLength(1);
      expect(layout[0]).toHaveProperty('componentId', 'test-component');
      expect(layout[0]).toHaveProperty('position');
      expect(layout[0]).toHaveProperty('size');
    });
  });
}); 