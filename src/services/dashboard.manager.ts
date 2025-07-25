import { IDashboardManager } from '../interfaces/dashboard.interface';
import { DashboardWidget, DashboardLayout, GridConfig, LayoutItem, ComponentSize } from '../types';

interface WidgetErrorCount {
  [widgetId: string]: number;
}

export class DashboardManager implements IDashboardManager {
  private widgetRegistry: any;
  private layoutEngine: any;
  private widgetErrors: WidgetErrorCount = {};
  private readonly MAX_ERROR_COUNT = 3;

  constructor() {
    this.initializeComponents();
  }

  private initializeComponents(): void {
    // Initialize widget registry
    this.widgetRegistry = {
      widgets: new Map<string, DashboardWidget>(),
      pluginWidgets: new Map<string, Set<string>>(),

      registerWidget: (widget: DashboardWidget): void => {
        this.widgetRegistry.widgets.set(widget.id, widget);
        
        // Track widgets by plugin
        if (!this.widgetRegistry.pluginWidgets.has(widget.pluginId)) {
          this.widgetRegistry.pluginWidgets.set(widget.pluginId, new Set());
        }
        this.widgetRegistry.pluginWidgets.get(widget.pluginId)!.add(widget.id);
      },

      unregisterWidget: (widgetId: string): void => {
        const widget = this.widgetRegistry.widgets.get(widgetId);
        if (widget) {
          this.widgetRegistry.widgets.delete(widgetId);
          
          // Remove from plugin tracking
          const pluginWidgets = this.widgetRegistry.pluginWidgets.get(widget.pluginId);
          if (pluginWidgets) {
            pluginWidgets.delete(widgetId);
            if (pluginWidgets.size === 0) {
              this.widgetRegistry.pluginWidgets.delete(widget.pluginId);
            }
          }
        }
      },

      getActiveWidgets: (): DashboardWidget[] => {
        return Array.from(this.widgetRegistry.widgets.values());
      },

      getWidgetById: (widgetId: string): DashboardWidget | undefined => {
        return this.widgetRegistry.widgets.get(widgetId);
      },

      clearWidgets: (): void => {
        this.widgetRegistry.widgets.clear();
        this.widgetRegistry.pluginWidgets.clear();
      },

      getWidgetsByPlugin: (pluginId: string): DashboardWidget[] => {
        const widgetIds = this.widgetRegistry.pluginWidgets.get(pluginId);
        if (!widgetIds) return [];
        
        const widgets: DashboardWidget[] = [];
        for (const widgetId of widgetIds) {
          const widget = this.widgetRegistry.widgets.get(widgetId);
          if (widget) {
            widgets.push(widget);
          }
        }
        return widgets;
      }
    };

    // Initialize layout engine
    this.layoutEngine = {
      currentLayout: this.getDefaultLayout(),

      calculateLayout: (widgets: DashboardWidget[]): DashboardLayout => {
        const gridConfig: GridConfig = {
          columns: 12,
          rows: 8,
          gap: '16px',
          cellSize: { width: 100, height: 80 }
        };

        const layoutItems: LayoutItem[] = [];
        let currentX = 0;
        let currentY = 0;
        let maxRowHeight = 0;

        for (const widget of widgets) {
          const size = widget.size;
          
          // Check if widget fits in current row
          if (currentX + size.width > gridConfig.columns) {
            currentX = 0;
            currentY += maxRowHeight;
            maxRowHeight = 0;
          }

          // Use widget position if specified, otherwise calculate
          const position = widget.position || { x: currentX, y: currentY };

          layoutItems.push({
            componentId: widget.id,
            position,
            size
          });

          currentX += size.width;
          maxRowHeight = Math.max(maxRowHeight, size.height);
        }

        return {
          grid: gridConfig,
          widgets: layoutItems
        };
      },

      applyLayout: async (layout: DashboardLayout): Promise<boolean> => {
        try {
          // Validate layout
          if (!this.validateLayout(layout)) {
            return false;
          }

          this.layoutEngine.currentLayout = layout;
          return true;
        } catch (error) {
          console.error('Failed to apply layout:', error);
          throw error;
        }
      },

      updateLayoutConfig: (config: GridConfig): void => {
        this.layoutEngine.currentLayout.grid = { ...this.layoutEngine.currentLayout.grid, ...config };
      },

      getLayoutConfig: (): DashboardLayout => {
        return { ...this.layoutEngine.currentLayout };
      }
    };
  }

  private getDefaultLayout(): DashboardLayout {
    return {
      grid: {
        columns: 12,
        rows: 8,
        gap: '16px',
        cellSize: { width: 100, height: 80 }
      },
      widgets: []
    };
  }

  private validateLayout(layout: DashboardLayout): boolean {
    if (!layout || !layout.grid || !layout.widgets) {
      return false;
    }

    const { grid } = layout;
    if (grid.columns <= 0 || (grid.rows && grid.rows <= 0)) {
      return false;
    }

    if (!grid.gap || grid.gap.trim() === '') {
      return false;
    }

    if (grid.cellSize && (grid.cellSize.width <= 0 || grid.cellSize.height <= 0)) {
      return false;
    }

    return true;
  }

  registerWidget(widget: DashboardWidget): void {
    try {
      this.widgetRegistry.registerWidget(widget);
    } catch (error) {
      console.error(`Error registering widget ${widget.id}:`, error);
    }
  }

  unregisterWidget(widgetId: string): void {
    try {
      this.widgetRegistry.unregisterWidget(widgetId);
      // Clear error count for this widget
      delete this.widgetErrors[widgetId];
    } catch (error) {
      console.error(`Error unregistering widget ${widgetId}:`, error);
    }
  }

  getActiveWidgets(): DashboardWidget[] {
    return this.widgetRegistry.getActiveWidgets();
  }

  async updateLayout(layout: DashboardLayout): Promise<boolean> {
    try {
      return await this.layoutEngine.applyLayout(layout);
    } catch (error) {
      console.error('Error updating layout:', error);
      throw error;
    }
  }

  showWelcomeScreen(): boolean {
    const activeWidgets = this.getActiveWidgets();
    return activeWidgets.length === 0;
  }

  calculateOptimalLayout(widgets: DashboardWidget[]): DashboardLayout {
    return this.layoutEngine.calculateLayout(widgets);
  }

  handleWidgetError(widgetId: string, error: Error): boolean {
    try {
      console.error(`Widget ${widgetId} error:`, error);

      // Track error count
      this.widgetErrors[widgetId] = (this.widgetErrors[widgetId] || 0) + 1;

      // Remove widget if it fails persistently
      if (this.widgetErrors[widgetId] >= this.MAX_ERROR_COUNT) {
        console.warn(`Removing persistently failing widget: ${widgetId}`);
        this.unregisterWidget(widgetId);
      }

      return true;
    } catch (handlingError) {
      console.error('Error handling widget error:', handlingError);
      return false;
    }
  }

  getWidgetsByPlugin(pluginId: string): DashboardWidget[] {
    return this.widgetRegistry.getWidgetsByPlugin(pluginId);
  }

  exportLayout(): DashboardLayout {
    return this.layoutEngine.getLayoutConfig();
  }

  async importLayout(layout: DashboardLayout): Promise<boolean> {
    if (!this.validateLayout(layout)) {
      console.error('Invalid layout provided for import');
      return false;
    }

    try {
      return await this.layoutEngine.applyLayout(layout);
    } catch (error) {
      console.error('Error importing layout:', error);
      return false;
    }
  }

  async resetToDefault(): Promise<void> {
    try {
      this.widgetRegistry.clearWidgets();
      this.widgetErrors = {};
      await this.layoutEngine.applyLayout(this.getDefaultLayout());
    } catch (error) {
      console.error('Error resetting to default layout:', error);
      throw error;
    }
  }

  handlePluginUninstall(pluginId: string): void {
    try {
      const pluginWidgets = this.getWidgetsByPlugin(pluginId);
      
      for (const widget of pluginWidgets) {
        this.unregisterWidget(widget.id);
      }

      console.log(`Removed ${pluginWidgets.length} widgets for plugin: ${pluginId}`);
    } catch (error) {
      console.error(`Error handling plugin uninstall for ${pluginId}:`, error);
    }
  }

  async refreshLayout(): Promise<void> {
    try {
      const activeWidgets = this.getActiveWidgets();
      const newLayout = this.calculateOptimalLayout(activeWidgets);
      await this.layoutEngine.applyLayout(newLayout);
    } catch (error) {
      console.error('Error refreshing layout:', error);
      throw error;
    }
  }
} 