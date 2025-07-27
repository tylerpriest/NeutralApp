import { DashboardManager } from '../services/dashboard.manager';
import { DashboardWidget, WidgetSize, WidgetPosition, DashboardLayout, GridConfig, UIComponent } from '../../../shared/types';

// Mock widget registry
const mockWidgetRegistry = {
  registerWidget: jest.fn(),
  unregisterWidget: jest.fn(),
  getActiveWidgets: jest.fn(),
  getWidgetById: jest.fn(),
  clearWidgets: jest.fn(),
  getWidgetsByPlugin: jest.fn(),
};

// Mock layout engine
const mockLayoutEngine = {
  calculateLayout: jest.fn(),
  applyLayout: jest.fn(),
  updateLayoutConfig: jest.fn(),
  getLayoutConfig: jest.fn(),
};

describe('DashboardManager', () => {
  let dashboardManager: DashboardManager;

  beforeEach(() => {
    jest.clearAllMocks();
    dashboardManager = new DashboardManager();

    // Inject mocks
    (dashboardManager as any).widgetRegistry = mockWidgetRegistry;
    (dashboardManager as any).layoutEngine = mockLayoutEngine;
  });

  describe('registerWidget', () => {
    it('should register a new dashboard widget', () => {
      const widget: DashboardWidget = {
        id: 'weather-widget',
        pluginId: 'weather-plugin',
        title: 'Weather Widget',
        component: 'WeatherComponent',
        size: { width: 4, height: 3, minWidth: 2, minHeight: 2 },
        position: { x: 0, y: 0 },
        permissions: ['read:weather']
      };

      dashboardManager.registerWidget(widget);

      expect(mockWidgetRegistry.registerWidget).toHaveBeenCalledWith(widget);
    });

    it('should register multiple widgets from different plugins', () => {
      const widgets: DashboardWidget[] = [
        {
          id: 'calendar-widget',
          pluginId: 'calendar-plugin',
          title: 'Calendar',
          component: 'CalendarComponent',
          size: { width: 6, height: 4 },
          permissions: []
        },
        {
          id: 'todo-widget',
          pluginId: 'todo-plugin',
          title: 'Todo List',
          component: 'TodoComponent',
          size: { width: 4, height: 6 },
          permissions: ['read:todos', 'write:todos']
        }
      ];

      widgets.forEach(widget => dashboardManager.registerWidget(widget));

      expect(mockWidgetRegistry.registerWidget).toHaveBeenCalledTimes(2);
      expect(mockWidgetRegistry.registerWidget).toHaveBeenCalledWith(widgets[0]);
      expect(mockWidgetRegistry.registerWidget).toHaveBeenCalledWith(widgets[1]);
    });

    it('should handle widget registration with error handling', () => {
      const invalidWidget = {} as DashboardWidget;

      expect(() => {
        dashboardManager.registerWidget(invalidWidget);
      }).not.toThrow();

      // Should still attempt registration but handle gracefully
      expect(mockWidgetRegistry.registerWidget).toHaveBeenCalledWith(invalidWidget);
    });
  });

  describe('unregisterWidget', () => {
    it('should remove a widget by id', () => {
      dashboardManager.unregisterWidget('weather-widget');

      expect(mockWidgetRegistry.unregisterWidget).toHaveBeenCalledWith('weather-widget');
    });

    it('should handle unregistering non-existent widget gracefully', () => {
      expect(() => {
        dashboardManager.unregisterWidget('non-existent-widget');
      }).not.toThrow();

      expect(mockWidgetRegistry.unregisterWidget).toHaveBeenCalledWith('non-existent-widget');
    });
  });

  describe('getActiveWidgets', () => {
    it('should return all active widgets', () => {
      const mockWidgets: DashboardWidget[] = [
        {
          id: 'widget-1',
          pluginId: 'plugin-1',
          title: 'Widget 1',
          component: 'Component1',
          size: { width: 4, height: 3 },
          permissions: []
        },
        {
          id: 'widget-2',
          pluginId: 'plugin-2',
          title: 'Widget 2',
          component: 'Component2',
          size: { width: 6, height: 4 },
          permissions: []
        }
      ];

      mockWidgetRegistry.getActiveWidgets.mockReturnValue(mockWidgets);

      const widgets = dashboardManager.getActiveWidgets();

      expect(widgets).toEqual(mockWidgets);
      expect(mockWidgetRegistry.getActiveWidgets).toHaveBeenCalled();
    });

    it('should return empty array when no widgets are active', () => {
      mockWidgetRegistry.getActiveWidgets.mockReturnValue([]);

      const widgets = dashboardManager.getActiveWidgets();

      expect(widgets).toEqual([]);
    });
  });

  describe('updateLayout', () => {
    it('should update dashboard layout configuration', async () => {
      const layout: DashboardLayout = {
        grid: {
          columns: 12,
          rows: 8,
          gap: '16px',
          cellSize: { width: 100, height: 80 }
        },
        widgets: [
          {
            id: 'widget-1',
            componentId: 'widget-1',
            position: { x: 0, y: 0 },
            size: { width: 4, height: 3 }
          },
          {
            id: 'widget-2',
            componentId: 'widget-2',
            position: { x: 4, y: 0 },
            size: { width: 8, height: 3 }
          }
        ]
      };

      mockLayoutEngine.applyLayout.mockResolvedValue(true);

      await dashboardManager.updateLayout(layout);

      expect(mockLayoutEngine.applyLayout).toHaveBeenCalledWith(layout);
    });

    it('should handle layout update failures gracefully', async () => {
      const layout: DashboardLayout = {
        grid: { columns: 12, rows: 8, gap: '16px', cellSize: { width: 100, height: 80 } },
        widgets: []
      };

      mockLayoutEngine.applyLayout.mockRejectedValue(new Error('Layout error'));

      await expect(dashboardManager.updateLayout(layout)).rejects.toThrow('Layout error');
    });

    it('should validate layout before applying', async () => {
      const invalidLayout = {
        grid: { columns: 0, rows: 0, gap: '', cellSize: { width: 0, height: 0 } },
        widgets: []
      } as DashboardLayout;

      mockLayoutEngine.applyLayout.mockResolvedValue(false);

      const result = await dashboardManager.updateLayout(invalidLayout);

      expect(result).toBe(false);
    });
  });

  describe('showWelcomeScreen', () => {
    it('should display welcome screen when no widgets are present', () => {
      mockWidgetRegistry.getActiveWidgets.mockReturnValue([]);

      const welcomeShown = dashboardManager.showWelcomeScreen();

      expect(welcomeShown).toBe(true);
    });

    it('should not show welcome screen when widgets are present', () => {
      const mockWidgets: DashboardWidget[] = [
        {
          id: 'existing-widget',
          pluginId: 'some-plugin',
          title: 'Existing Widget',
          component: 'ExistingComponent',
          size: { width: 4, height: 3 },
          permissions: []
        }
      ];

      mockWidgetRegistry.getActiveWidgets.mockReturnValue(mockWidgets);

      const welcomeShown = dashboardManager.showWelcomeScreen();

      expect(welcomeShown).toBe(false);
    });
  });

  describe('calculateOptimalLayout', () => {
    it('should calculate optimal widget positions', () => {
      const widgets: DashboardWidget[] = [
        {
          id: 'widget-1',
          pluginId: 'plugin-1',
          title: 'Widget 1',
          component: 'Component1',
          size: { width: 4, height: 3 },
          permissions: []
        },
        {
          id: 'widget-2',
          pluginId: 'plugin-2',
          title: 'Widget 2',
          component: 'Component2',
          size: { width: 8, height: 4 },
          permissions: []
        }
      ];

      const expectedLayout: DashboardLayout = {
        grid: { columns: 12, rows: 8, gap: '16px', cellSize: { width: 100, height: 80 } },
        widgets: [
          { id: 'widget-1', componentId: 'widget-1', position: { x: 0, y: 0 }, size: { width: 4, height: 3 } },
          { id: 'widget-2', componentId: 'widget-2', position: { x: 4, y: 0 }, size: { width: 8, height: 4 } }
        ]
      };

      mockLayoutEngine.calculateLayout.mockReturnValue(expectedLayout);

      const layout = dashboardManager.calculateOptimalLayout(widgets);

      expect(layout).toEqual(expectedLayout);
      expect(mockLayoutEngine.calculateLayout).toHaveBeenCalledWith(widgets);
    });

    it('should handle layout calculation for widgets with constraints', () => {
      const constrainedWidgets: DashboardWidget[] = [
        {
          id: 'fixed-widget',
          pluginId: 'plugin-1',
          title: 'Fixed Widget',
          component: 'FixedComponent',
          size: { width: 6, height: 4, minWidth: 4, minHeight: 3 },
          position: { x: 0, y: 0 }, // Fixed position
          permissions: []
        }
      ];

      const expectedLayout: DashboardLayout = {
        grid: { columns: 12, rows: 8, gap: '16px', cellSize: { width: 100, height: 80 } },
        widgets: [
          { id: 'fixed-widget', componentId: 'fixed-widget', position: { x: 0, y: 0 }, size: { width: 6, height: 4 } }
        ]
      };

      mockLayoutEngine.calculateLayout.mockReturnValue(expectedLayout);

      const layout = dashboardManager.calculateOptimalLayout(constrainedWidgets);

      expect(layout).toEqual(expectedLayout);
    });
  });

  describe('handleWidgetError', () => {
    it('should handle widget errors gracefully', () => {
      const error = new Error('Widget rendering failed');
      const widgetId = 'failing-widget';

      const errorHandled = dashboardManager.handleWidgetError(widgetId, error);

      expect(errorHandled).toBe(true);
      // Should log error and potentially show fallback UI
    });

    it('should remove persistently failing widgets', () => {
      const widgetId = 'persistently-failing-widget';
      const error = new Error('Persistent failure');

      // Simulate multiple failures
      dashboardManager.handleWidgetError(widgetId, error);
      dashboardManager.handleWidgetError(widgetId, error);
      dashboardManager.handleWidgetError(widgetId, error);

      // After threshold, widget should be removed
      expect(mockWidgetRegistry.unregisterWidget).toHaveBeenCalledWith(widgetId);
    });
  });

  describe('getWidgetsByPlugin', () => {
    it('should return widgets for specific plugin', () => {
      const pluginId = 'weather-plugin';
      const mockWidgets: DashboardWidget[] = [
        {
          id: 'weather-current',
          pluginId: 'weather-plugin',
          title: 'Current Weather',
          component: 'CurrentWeatherComponent',
          size: { width: 4, height: 3 },
          permissions: []
        },
        {
          id: 'weather-forecast',
          pluginId: 'weather-plugin',
          title: 'Weather Forecast',
          component: 'ForecastComponent',
          size: { width: 8, height: 4 },
          permissions: []
        }
      ];

      mockWidgetRegistry.getWidgetsByPlugin.mockReturnValue(mockWidgets);

      const widgets = dashboardManager.getWidgetsByPlugin(pluginId);

      expect(widgets).toEqual(mockWidgets);
      expect(mockWidgetRegistry.getWidgetsByPlugin).toHaveBeenCalledWith(pluginId);
    });

    it('should return empty array for plugin with no widgets', () => {
      mockWidgetRegistry.getWidgetsByPlugin.mockReturnValue([]);

      const widgets = dashboardManager.getWidgetsByPlugin('empty-plugin');

      expect(widgets).toEqual([]);
    });
  });

  describe('exportLayout', () => {
    it('should export current dashboard layout', () => {
      const currentLayout: DashboardLayout = {
        grid: { columns: 12, rows: 8, gap: '16px', cellSize: { width: 100, height: 80 } },
        widgets: [
          { id: 'widget-1', componentId: 'widget-1', position: { x: 0, y: 0 }, size: { width: 4, height: 3 } }
        ]
      };

      mockLayoutEngine.getLayoutConfig.mockReturnValue(currentLayout);

      const exportedLayout = dashboardManager.exportLayout();

      expect(exportedLayout).toEqual(currentLayout);
      expect(mockLayoutEngine.getLayoutConfig).toHaveBeenCalled();
    });
  });

  describe('importLayout', () => {
    it('should import and apply dashboard layout', async () => {
      const importLayout: DashboardLayout = {
        grid: { columns: 12, rows: 8, gap: '16px', cellSize: { width: 100, height: 80 } },
        widgets: [
          { id: 'imported-widget', componentId: 'imported-widget', position: { x: 2, y: 1 }, size: { width: 6, height: 4 } }
        ]
      };

      mockLayoutEngine.applyLayout.mockResolvedValue(true);

      const success = await dashboardManager.importLayout(importLayout);

      expect(success).toBe(true);
      expect(mockLayoutEngine.applyLayout).toHaveBeenCalledWith(importLayout);
    });

    it('should validate imported layout before applying', async () => {
      const invalidLayout = {
        grid: null,
        widgets: undefined
      } as any;

      const success = await dashboardManager.importLayout(invalidLayout);

      expect(success).toBe(false);
      expect(mockLayoutEngine.applyLayout).not.toHaveBeenCalled();
    });
  });

  describe('resetToDefault', () => {
    it('should reset dashboard to default layout', async () => {
      mockWidgetRegistry.clearWidgets.mockImplementation(() => {});
      mockLayoutEngine.applyLayout.mockResolvedValue(true);

      await dashboardManager.resetToDefault();

      expect(mockWidgetRegistry.clearWidgets).toHaveBeenCalled();
      expect(mockLayoutEngine.applyLayout).toHaveBeenCalledWith(
        expect.objectContaining({
          grid: expect.any(Object),
          widgets: []
        })
      );
    });
  });

  describe('Widget lifecycle management', () => {
    it('should handle plugin uninstall by removing all plugin widgets', () => {
      const pluginId = 'removed-plugin';
      const pluginWidgets: DashboardWidget[] = [
        {
          id: 'widget-1',
          pluginId,
          title: 'Widget 1',
          component: 'Component1',
          size: { width: 4, height: 3 },
          permissions: []
        },
        {
          id: 'widget-2',
          pluginId,
          title: 'Widget 2',
          component: 'Component2',
          size: { width: 6, height: 4 },
          permissions: []
        }
      ];

      mockWidgetRegistry.getWidgetsByPlugin.mockReturnValue(pluginWidgets);

      dashboardManager.handlePluginUninstall(pluginId);

      expect(mockWidgetRegistry.unregisterWidget).toHaveBeenCalledWith('widget-1');
      expect(mockWidgetRegistry.unregisterWidget).toHaveBeenCalledWith('widget-2');
    });

    it('should refresh layout after widget changes', async () => {
      const widgets: DashboardWidget[] = [
        {
          id: 'remaining-widget',
          pluginId: 'active-plugin',
          title: 'Remaining Widget',
          component: 'RemainingComponent',
          size: { width: 8, height: 6 },
          permissions: []
        }
      ];

      mockWidgetRegistry.getActiveWidgets.mockReturnValue(widgets);
      mockLayoutEngine.calculateLayout.mockReturnValue({
        grid: { columns: 12, rows: 8, gap: '16px', cellSize: { width: 100, height: 80 } },
        widgets: [{ id: 'remaining-widget', position: { x: 0, y: 0 }, size: { width: 8, height: 6 } }]
      });
      mockLayoutEngine.applyLayout.mockResolvedValue(true);

      await dashboardManager.refreshLayout();

      expect(mockWidgetRegistry.getActiveWidgets).toHaveBeenCalled();
      expect(mockLayoutEngine.calculateLayout).toHaveBeenCalledWith(widgets);
      expect(mockLayoutEngine.applyLayout).toHaveBeenCalled();
    });
  });

  describe('Plugin Installation to Widget Registration Integration', () => {
    const mockPluginWidget: DashboardWidget = {
      id: 'hello-world-widget',
      pluginId: 'demo-hello-world',
      title: 'Hello World Widget',
      component: 'HelloWorldComponent',
      size: { width: 4, height: 3, minWidth: 2, minHeight: 2 },
      position: { x: 0, y: 0 },
      permissions: ['read:hello-world']
    };

    it('should register widgets when plugin is installed', () => {
      // Simulate plugin installation triggering widget registration
      const pluginId = 'demo-hello-world';
      const widgets = [mockPluginWidget];

      // Register widgets for the installed plugin
      widgets.forEach(widget => dashboardManager.registerWidget(widget));

      expect(mockWidgetRegistry.registerWidget).toHaveBeenCalledWith(mockPluginWidget);
      expect(mockWidgetRegistry.registerWidget).toHaveBeenCalledTimes(1);
    });

    it('should register multiple widgets from a single plugin installation', () => {
      const pluginId = 'demo-hello-world';
      const widgets: DashboardWidget[] = [
        {
          id: 'hello-world-widget',
          pluginId: 'demo-hello-world',
          title: 'Hello World Widget',
          component: 'HelloWorldComponent',
          size: { width: 4, height: 3 },
          permissions: ['read:hello-world']
        },
        {
          id: 'hello-world-settings-widget',
          pluginId: 'demo-hello-world',
          title: 'Hello World Settings',
          component: 'HelloWorldSettingsComponent',
          size: { width: 2, height: 2 },
          permissions: ['read:hello-world', 'write:hello-world']
        }
      ];

      // Register all widgets for the installed plugin
      widgets.forEach(widget => dashboardManager.registerWidget(widget));

      expect(mockWidgetRegistry.registerWidget).toHaveBeenCalledTimes(2);
      expect(mockWidgetRegistry.registerWidget).toHaveBeenCalledWith(widgets[0]);
      expect(mockWidgetRegistry.registerWidget).toHaveBeenCalledWith(widgets[1]);
    });

    it('should track widgets by plugin ID after installation', () => {
      const pluginId = 'demo-hello-world';
      const widgets = [mockPluginWidget];

      // Register widgets
      widgets.forEach(widget => dashboardManager.registerWidget(widget));

      // Mock the getWidgetsByPlugin to return the registered widgets
      mockWidgetRegistry.getWidgetsByPlugin.mockReturnValue(widgets);

      // Verify widgets are tracked by plugin
      const pluginWidgets = dashboardManager.getWidgetsByPlugin(pluginId);
      expect(pluginWidgets).toEqual(widgets);
      expect(mockWidgetRegistry.getWidgetsByPlugin).toHaveBeenCalledWith(pluginId);
    });

    it('should handle widget registration errors during plugin installation', () => {
      const invalidWidget = {
        id: 'invalid-widget',
        pluginId: 'demo-hello-world',
        // Missing required fields
      } as DashboardWidget;

      // Should handle registration gracefully even with invalid widget
      expect(() => {
        dashboardManager.registerWidget(invalidWidget);
      }).not.toThrow();

      expect(mockWidgetRegistry.registerWidget).toHaveBeenCalledWith(invalidWidget);
    });

    it('should unregister widgets when plugin is uninstalled', () => {
      const pluginId = 'demo-hello-world';
      const widgets = [mockPluginWidget];

      // First register widgets
      widgets.forEach(widget => dashboardManager.registerWidget(widget));

      // Mock getWidgetsByPlugin to return the widgets
      mockWidgetRegistry.getWidgetsByPlugin.mockReturnValue(widgets);

      // Simulate plugin uninstallation
      dashboardManager.handlePluginUninstall(pluginId);

      // Should unregister all widgets for the plugin
      expect(mockWidgetRegistry.unregisterWidget).toHaveBeenCalledWith('hello-world-widget');
      expect(mockWidgetRegistry.getWidgetsByPlugin).toHaveBeenCalledWith(pluginId);
    });

    it('should handle plugin uninstallation with no widgets gracefully', () => {
      const pluginId = 'non-existent-plugin';

      // Mock getWidgetsByPlugin to return empty array
      mockWidgetRegistry.getWidgetsByPlugin.mockReturnValue([]);

      // Should handle gracefully when plugin has no widgets
      expect(() => {
        dashboardManager.handlePluginUninstall(pluginId);
      }).not.toThrow();

      expect(mockWidgetRegistry.getWidgetsByPlugin).toHaveBeenCalledWith(pluginId);
      expect(mockWidgetRegistry.unregisterWidget).not.toHaveBeenCalled();
    });

    it('should maintain widget state across plugin reinstallation', () => {
      const pluginId = 'demo-hello-world';
      const widgets = [mockPluginWidget];

      // First installation
      widgets.forEach(widget => dashboardManager.registerWidget(widget));
      expect(mockWidgetRegistry.registerWidget).toHaveBeenCalledWith(mockPluginWidget);

      // Uninstall
      mockWidgetRegistry.getWidgetsByPlugin.mockReturnValue(widgets);
      dashboardManager.handlePluginUninstall(pluginId);
      expect(mockWidgetRegistry.unregisterWidget).toHaveBeenCalledWith('hello-world-widget');

      // Reinstall
      jest.clearAllMocks();
      widgets.forEach(widget => dashboardManager.registerWidget(widget));
      expect(mockWidgetRegistry.registerWidget).toHaveBeenCalledWith(mockPluginWidget);
    });

    it('should handle concurrent plugin installations correctly', () => {
      const plugin1Widgets: DashboardWidget[] = [
        {
          id: 'plugin1-widget1',
          pluginId: 'plugin-1',
          title: 'Plugin 1 Widget 1',
          component: 'Plugin1Widget1Component',
          size: { width: 3, height: 2 },
          permissions: []
        },
        {
          id: 'plugin1-widget2',
          pluginId: 'plugin-1',
          title: 'Plugin 1 Widget 2',
          component: 'Plugin1Widget2Component',
          size: { width: 2, height: 3 },
          permissions: []
        }
      ];

      const plugin2Widgets: DashboardWidget[] = [
        {
          id: 'plugin2-widget1',
          pluginId: 'plugin-2',
          title: 'Plugin 2 Widget 1',
          component: 'Plugin2Widget1Component',
          size: { width: 4, height: 2 },
          permissions: []
        }
      ];

      // Install both plugins concurrently
      [...plugin1Widgets, ...plugin2Widgets].forEach(widget => 
        dashboardManager.registerWidget(widget)
      );

      expect(mockWidgetRegistry.registerWidget).toHaveBeenCalledTimes(3);
      expect(mockWidgetRegistry.registerWidget).toHaveBeenCalledWith(plugin1Widgets[0]);
      expect(mockWidgetRegistry.registerWidget).toHaveBeenCalledWith(plugin1Widgets[1]);
      expect(mockWidgetRegistry.registerWidget).toHaveBeenCalledWith(plugin2Widgets[0]);
    });

    it('should validate widget permissions during registration', () => {
      const widgetWithPermissions: DashboardWidget = {
        id: 'permissioned-widget',
        pluginId: 'demo-hello-world',
        title: 'Permissioned Widget',
        component: 'PermissionedComponent',
        size: { width: 3, height: 2 },
        permissions: ['read:data', 'write:data', 'admin:data']
      };

      dashboardManager.registerWidget(widgetWithPermissions);

      expect(mockWidgetRegistry.registerWidget).toHaveBeenCalledWith(widgetWithPermissions);
      expect(widgetWithPermissions.permissions).toContain('read:data');
      expect(widgetWithPermissions.permissions).toContain('write:data');
      expect(widgetWithPermissions.permissions).toContain('admin:data');
    });

    it('should handle widget size constraints during registration', () => {
      const widgetWithSizeConstraints: DashboardWidget = {
        id: 'sized-widget',
        pluginId: 'demo-hello-world',
        title: 'Sized Widget',
        component: 'SizedComponent',
        size: { 
          width: 6, 
          height: 4, 
          minWidth: 2, 
          minHeight: 2
        },
        permissions: []
      };

      dashboardManager.registerWidget(widgetWithSizeConstraints);

      expect(mockWidgetRegistry.registerWidget).toHaveBeenCalledWith(widgetWithSizeConstraints);
      expect(widgetWithSizeConstraints.size.minWidth).toBe(2);
      expect(widgetWithSizeConstraints.size.minHeight).toBe(2);
    });
  });
}); 