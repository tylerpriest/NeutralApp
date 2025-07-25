import { WidgetRegistry, IWidgetRegistry } from '../../src/services/widget.registry';
import { Widget, WidgetStatus, WidgetConfig, ComponentSize, ComponentPosition } from '../../src/types';

describe('WidgetRegistry', () => {
  let widgetRegistry: IWidgetRegistry;
  let mockWidget: Widget;
  let mockWidget2: Widget;
  let mockWidget3: Widget;

  beforeEach(() => {
    widgetRegistry = new WidgetRegistry();
    
    mockWidget = {
      id: 'widget-1',
      pluginId: 'plugin-1',
      name: 'Test Widget',
      description: 'A test widget for dashboard',
      component: 'TestWidgetComponent',
      status: WidgetStatus.ACTIVE,
      config: {
        resizable: true,
        movable: true,
        defaultSize: { width: 300, height: 200 },
        defaultPosition: { x: 0, y: 0 },
        category: 'productivity',
        tags: ['test', 'demo'],
        settings: { theme: 'light' }
      },
      permissions: ['dashboard.read'],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    };

    mockWidget2 = {
      id: 'widget-2',
      pluginId: 'plugin-2',
      name: 'Analytics Widget',
      description: 'Analytics and metrics',
      component: 'AnalyticsComponent',
      status: WidgetStatus.ACTIVE,
      config: {
        resizable: false,
        movable: true,
        defaultSize: { width: 400, height: 300 },
        category: 'analytics',
        tags: ['metrics', 'charts']
      },
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02')
    };

    mockWidget3 = {
      id: 'widget-3',
      pluginId: 'plugin-1',
      name: 'Todo Widget',
      component: 'TodoComponent',
      status: WidgetStatus.INACTIVE,
      config: {
        category: 'productivity',
        tags: ['todo', 'tasks']
      },
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03')
    };
  });

  describe('Widget Registration', () => {
    it('should register a valid widget', async () => {
      const result = await widgetRegistry.registerWidget(mockWidget);
      
      expect(result).toBe(true);
      expect(widgetRegistry.getWidget('widget-1')).toEqual(mockWidget);
    });

    it('should update existing widget when registering with same ID', async () => {
      await widgetRegistry.registerWidget(mockWidget);
      
      const updatedWidget = { ...mockWidget, name: 'Updated Widget' };
      const result = await widgetRegistry.registerWidget(updatedWidget);
      
      expect(result).toBe(true);
      expect(widgetRegistry.getWidget('widget-1')?.name).toBe('Updated Widget');
    });

    it('should reject invalid widget', async () => {
      const invalidWidget = { ...mockWidget, id: '' };
      const result = await widgetRegistry.registerWidget(invalidWidget);
      
      expect(result).toBe(false);
      expect(widgetRegistry.getWidget('widget-1')).toBeNull();
    });

    it('should handle registration errors gracefully', async () => {
      const invalidWidget = { ...mockWidget, config: null as any };
      const result = await widgetRegistry.registerWidget(invalidWidget);
      
      expect(result).toBe(false);
    });
  });

  describe('Widget Unregistration', () => {
    beforeEach(async () => {
      await widgetRegistry.registerWidget(mockWidget);
      await widgetRegistry.registerWidget(mockWidget2);
    });

    it('should unregister existing widget', async () => {
      const result = await widgetRegistry.unregisterWidget('widget-1');
      
      expect(result).toBe(true);
      expect(widgetRegistry.getWidget('widget-1')).toBeNull();
      expect(widgetRegistry.getWidget('widget-2')).not.toBeNull();
    });

    it('should return false for non-existent widget', async () => {
      const result = await widgetRegistry.unregisterWidget('non-existent');
      
      expect(result).toBe(false);
    });

    it('should clean up indices when unregistering', async () => {
      await widgetRegistry.unregisterWidget('widget-1');
      
      const productivityWidgets = widgetRegistry.getWidgetsByCategory('productivity');
      expect(productivityWidgets).not.toContain(mockWidget);
      
      const testTagWidgets = widgetRegistry.getWidgetsByTag(['test']);
      expect(testTagWidgets).toHaveLength(0);
    });
  });

  describe('Widget Retrieval', () => {
    beforeEach(async () => {
      await widgetRegistry.registerWidget(mockWidget);
      await widgetRegistry.registerWidget(mockWidget2);
      await widgetRegistry.registerWidget(mockWidget3);
    });

    it('should get widget by ID', () => {
      const widget = widgetRegistry.getWidget('widget-1');
      expect(widget).toEqual(mockWidget);
    });

    it('should return null for non-existent widget', () => {
      const widget = widgetRegistry.getWidget('non-existent');
      expect(widget).toBeNull();
    });

    it('should get widgets by plugin', () => {
      const plugin1Widgets = widgetRegistry.getWidgetsByPlugin('plugin-1');
      expect(plugin1Widgets).toHaveLength(2);
      expect(plugin1Widgets.map(w => w.id)).toContain('widget-1');
      expect(plugin1Widgets.map(w => w.id)).toContain('widget-3');

      const plugin2Widgets = widgetRegistry.getWidgetsByPlugin('plugin-2');
      expect(plugin2Widgets).toHaveLength(1);
      expect(plugin2Widgets[0]?.id).toBe('widget-2');
    });

    it('should get all widgets', () => {
      const allWidgets = widgetRegistry.getAllWidgets();
      expect(allWidgets).toHaveLength(3);
    });

    it('should get only active widgets', () => {
      const activeWidgets = widgetRegistry.getActiveWidgets();
      expect(activeWidgets).toHaveLength(2);
      expect(activeWidgets.every(w => w.status === WidgetStatus.ACTIVE)).toBe(true);
    });
  });

  describe('Widget Status Management', () => {
    beforeEach(async () => {
      await widgetRegistry.registerWidget(mockWidget);
    });

    it('should update widget status', async () => {
      const result = await widgetRegistry.updateWidgetStatus('widget-1', WidgetStatus.ERROR);
      
      expect(result).toBe(true);
      expect(widgetRegistry.getWidget('widget-1')?.status).toBe(WidgetStatus.ERROR);
    });

    it('should return false for non-existent widget status update', async () => {
      const result = await widgetRegistry.updateWidgetStatus('non-existent', WidgetStatus.ERROR);
      
      expect(result).toBe(false);
    });
  });

  describe('Widget Config Management', () => {
    beforeEach(async () => {
      await widgetRegistry.registerWidget(mockWidget);
    });

    it('should update widget config', async () => {
      const newConfig: Partial<WidgetConfig> = {
        resizable: false,
        category: 'updated-category'
      };
      
      const result = await widgetRegistry.updateWidgetConfig('widget-1', newConfig);
      
      expect(result).toBe(true);
      const updatedWidget = widgetRegistry.getWidget('widget-1');
      expect(updatedWidget?.config.resizable).toBe(false);
      expect(updatedWidget?.config.category).toBe('updated-category');
      expect(updatedWidget?.config.movable).toBe(true); // Should preserve existing values
    });

    it('should re-index when category or tags change', async () => {
      const newConfig: Partial<WidgetConfig> = {
        category: 'new-category',
        tags: ['new-tag']
      };
      
      await widgetRegistry.updateWidgetConfig('widget-1', newConfig);
      
      // Should be in new category
      const newCategoryWidgets = widgetRegistry.getWidgetsByCategory('new-category');
      expect(newCategoryWidgets).toHaveLength(1);
      expect(newCategoryWidgets[0]?.id).toBe('widget-1');
      
      // Should not be in old category
      const oldCategoryWidgets = widgetRegistry.getWidgetsByCategory('productivity');
      expect(oldCategoryWidgets.find(w => w.id === 'widget-1')).toBeUndefined();
    });

    it('should return false for non-existent widget config update', async () => {
      const result = await widgetRegistry.updateWidgetConfig('non-existent', {});
      
      expect(result).toBe(false);
    });
  });

  describe('Widget Validation', () => {
    it('should validate complete widget', () => {
      const result = widgetRegistry.validateWidget(mockWidget);
      expect(result).toBe(true);
    });

    it('should reject widget without ID', () => {
      const invalidWidget = { ...mockWidget, id: '' };
      const result = widgetRegistry.validateWidget(invalidWidget);
      expect(result).toBe(false);
    });

    it('should reject widget without plugin ID', () => {
      const invalidWidget = { ...mockWidget, pluginId: '' };
      const result = widgetRegistry.validateWidget(invalidWidget);
      expect(result).toBe(false);
    });

    it('should reject widget without name', () => {
      const invalidWidget = { ...mockWidget, name: '' };
      const result = widgetRegistry.validateWidget(invalidWidget);
      expect(result).toBe(false);
    });

    it('should reject widget without component', () => {
      const invalidWidget = { ...mockWidget, component: '' };
      const result = widgetRegistry.validateWidget(invalidWidget);
      expect(result).toBe(false);
    });

    it('should reject widget with invalid status', () => {
      const invalidWidget = { ...mockWidget, status: 'invalid' as WidgetStatus };
      const result = widgetRegistry.validateWidget(invalidWidget);
      expect(result).toBe(false);
    });

    it('should reject widget with invalid config', () => {
      const invalidWidget = { ...mockWidget, config: null as any };
      const result = widgetRegistry.validateWidget(invalidWidget);
      expect(result).toBe(false);
    });

    it('should reject widget with invalid default size', () => {
      const invalidWidget = {
        ...mockWidget,
        config: {
          ...mockWidget.config,
          defaultSize: { width: -1, height: 200 }
        }
      };
      const result = widgetRegistry.validateWidget(invalidWidget);
      expect(result).toBe(false);
    });

    it('should reject widget with invalid default position', () => {
      const invalidWidget = {
        ...mockWidget,
        config: {
          ...mockWidget.config,
          defaultPosition: { x: -1, y: 0 }
        }
      };
      const result = widgetRegistry.validateWidget(invalidWidget);
      expect(result).toBe(false);
    });
  });

  describe('Widget Filtering and Search', () => {
    beforeEach(async () => {
      await widgetRegistry.registerWidget(mockWidget);
      await widgetRegistry.registerWidget(mockWidget2);
      await widgetRegistry.registerWidget(mockWidget3);
    });

    it('should get widgets by category', () => {
      const productivityWidgets = widgetRegistry.getWidgetsByCategory('productivity');
      expect(productivityWidgets).toHaveLength(2);
      expect(productivityWidgets.map(w => w.id)).toContain('widget-1');
      expect(productivityWidgets.map(w => w.id)).toContain('widget-3');

      const analyticsWidgets = widgetRegistry.getWidgetsByCategory('analytics');
      expect(analyticsWidgets).toHaveLength(1);
      expect(analyticsWidgets[0]?.id).toBe('widget-2');
    });

    it('should return all widgets when no category specified', () => {
      const allWidgets = widgetRegistry.getWidgetsByCategory();
      expect(allWidgets).toHaveLength(3);
    });

    it('should get widgets by single tag', () => {
      const testWidgets = widgetRegistry.getWidgetsByTag(['test']);
      expect(testWidgets).toHaveLength(1);
      expect(testWidgets[0]?.id).toBe('widget-1');
    });

    it('should get widgets by multiple tags (intersection)', () => {
      const commonWidgets = widgetRegistry.getWidgetsByTag(['test', 'demo']);
      expect(commonWidgets).toHaveLength(1);
      expect(commonWidgets[0]?.id).toBe('widget-1');
    });

    it('should return empty array for non-matching tags', () => {
      const noWidgets = widgetRegistry.getWidgetsByTag(['nonexistent']);
      expect(noWidgets).toHaveLength(0);
    });

    it('should search widgets by name', () => {
      const results = widgetRegistry.searchWidgets('Test');
      expect(results).toHaveLength(1);
      expect(results[0]?.id).toBe('widget-1');
    });

    it('should search widgets by description', () => {
      const results = widgetRegistry.searchWidgets('analytics');
      expect(results).toHaveLength(1);
      expect(results[0]?.id).toBe('widget-2');
    });

    it('should search widgets by category', () => {
      const results = widgetRegistry.searchWidgets('productivity');
      expect(results).toHaveLength(2);
    });

    it('should search widgets by tags', () => {
      const results = widgetRegistry.searchWidgets('metrics');
      expect(results).toHaveLength(1);
      expect(results[0]?.id).toBe('widget-2');
    });

    it('should return all widgets for empty search', () => {
      const results = widgetRegistry.searchWidgets('');
      expect(results).toHaveLength(3);
    });

    it('should handle case-insensitive search', () => {
      const results = widgetRegistry.searchWidgets('TEST');
      expect(results).toHaveLength(1);
      expect(results[0]?.id).toBe('widget-1');
    });
  });

  describe('Plugin Widget Management', () => {
    beforeEach(async () => {
      await widgetRegistry.registerWidget(mockWidget);
      await widgetRegistry.registerWidget(mockWidget2);
      await widgetRegistry.registerWidget(mockWidget3);
    });

    it('should clear all widgets for a plugin', async () => {
      await widgetRegistry.clearWidgetsForPlugin('plugin-1');
      
      const plugin1Widgets = widgetRegistry.getWidgetsByPlugin('plugin-1');
      expect(plugin1Widgets).toHaveLength(0);
      
      const plugin2Widgets = widgetRegistry.getWidgetsByPlugin('plugin-2');
      expect(plugin2Widgets).toHaveLength(1);
    });

    it('should handle clearing widgets for non-existent plugin', async () => {
      await expect(widgetRegistry.clearWidgetsForPlugin('non-existent')).resolves.not.toThrow();
    });
  });
}); 