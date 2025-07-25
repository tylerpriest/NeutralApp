import { Widget, WidgetConfig, WidgetStatus, PluginId } from '../types';

export interface IWidgetRegistry {
  registerWidget(widget: Widget): Promise<boolean>;
  unregisterWidget(widgetId: string): Promise<boolean>;
  getWidget(widgetId: string): Widget | null;
  getWidgetsByPlugin(pluginId: PluginId): Widget[];
  getAllWidgets(): Widget[];
  getActiveWidgets(): Widget[];
  updateWidgetStatus(widgetId: string, status: WidgetStatus): Promise<boolean>;
  updateWidgetConfig(widgetId: string, config: Partial<WidgetConfig>): Promise<boolean>;
  validateWidget(widget: Widget): boolean;
  getWidgetsByCategory(category?: string): Widget[];
  getWidgetsByTag(tags: string[]): Widget[];
  searchWidgets(query: string): Widget[];
  clearWidgetsForPlugin(pluginId: PluginId): Promise<void>;
}

export class WidgetRegistry implements IWidgetRegistry {
  private widgets: Map<string, Widget> = new Map();
  private pluginWidgets: Map<PluginId, Set<string>> = new Map();
  private categoryIndex: Map<string, Set<string>> = new Map();
  private tagIndex: Map<string, Set<string>> = new Map();

  constructor() {
    this.initializeRegistry();
  }

  private initializeRegistry(): void {
    // Initialize with empty state - widgets will be registered by plugins
    console.log('WidgetRegistry initialized');
  }

  async registerWidget(widget: Widget): Promise<boolean> {
    try {
      // Validate widget before registration
      if (!this.validateWidget(widget)) {
        console.error(`Widget validation failed for: ${widget.id}`);
        return false;
      }

      // Check for duplicate widget ID
      if (this.widgets.has(widget.id)) {
        console.warn(`Widget ${widget.id} already registered, updating...`);
      }

      // Register the widget
      this.widgets.set(widget.id, { ...widget });

      // Update plugin index
      if (!this.pluginWidgets.has(widget.pluginId)) {
        this.pluginWidgets.set(widget.pluginId, new Set());
      }
      this.pluginWidgets.get(widget.pluginId)!.add(widget.id);

      // Update category index
      if (widget.config.category) {
        if (!this.categoryIndex.has(widget.config.category)) {
          this.categoryIndex.set(widget.config.category, new Set());
        }
        this.categoryIndex.get(widget.config.category)!.add(widget.id);
      }

      // Update tag index
      if (widget.config.tags) {
        widget.config.tags.forEach(tag => {
          if (!this.tagIndex.has(tag)) {
            this.tagIndex.set(tag, new Set());
          }
          this.tagIndex.get(tag)!.add(widget.id);
        });
      }

      console.log(`Widget registered: ${widget.id} from plugin ${widget.pluginId}`);
      return true;
    } catch (error) {
      console.error(`Failed to register widget ${widget.id}:`, error);
      return false;
    }
  }

  async unregisterWidget(widgetId: string): Promise<boolean> {
    try {
      const widget = this.widgets.get(widgetId);
      if (!widget) {
        console.warn(`Widget ${widgetId} not found for unregistration`);
        return false;
      }

      // Remove from plugin index
      const pluginWidgets = this.pluginWidgets.get(widget.pluginId);
      if (pluginWidgets) {
        pluginWidgets.delete(widgetId);
        if (pluginWidgets.size === 0) {
          this.pluginWidgets.delete(widget.pluginId);
        }
      }

      // Remove from category index
      if (widget.config.category) {
        const categoryWidgets = this.categoryIndex.get(widget.config.category);
        if (categoryWidgets) {
          categoryWidgets.delete(widgetId);
          if (categoryWidgets.size === 0) {
            this.categoryIndex.delete(widget.config.category);
          }
        }
      }

      // Remove from tag index
      if (widget.config.tags) {
        widget.config.tags.forEach(tag => {
          const tagWidgets = this.tagIndex.get(tag);
          if (tagWidgets) {
            tagWidgets.delete(widgetId);
            if (tagWidgets.size === 0) {
              this.tagIndex.delete(tag);
            }
          }
        });
      }

      // Remove the widget
      this.widgets.delete(widgetId);
      console.log(`Widget unregistered: ${widgetId}`);
      return true;
    } catch (error) {
      console.error(`Failed to unregister widget ${widgetId}:`, error);
      return false;
    }
  }

  getWidget(widgetId: string): Widget | null {
    return this.widgets.get(widgetId) || null;
  }

  getWidgetsByPlugin(pluginId: PluginId): Widget[] {
    const widgetIds = this.pluginWidgets.get(pluginId);
    if (!widgetIds) return [];

    return Array.from(widgetIds)
      .map(id => this.widgets.get(id))
      .filter((widget): widget is Widget => widget !== undefined);
  }

  getAllWidgets(): Widget[] {
    return Array.from(this.widgets.values());
  }

  getActiveWidgets(): Widget[] {
    return this.getAllWidgets().filter(widget => widget.status === WidgetStatus.ACTIVE);
  }

  async updateWidgetStatus(widgetId: string, status: WidgetStatus): Promise<boolean> {
    try {
      const widget = this.widgets.get(widgetId);
      if (!widget) {
        console.warn(`Widget ${widgetId} not found for status update`);
        return false;
      }

      widget.status = status;
      console.log(`Widget ${widgetId} status updated to: ${status}`);
      return true;
    } catch (error) {
      console.error(`Failed to update widget ${widgetId} status:`, error);
      return false;
    }
  }

  async updateWidgetConfig(widgetId: string, config: Partial<WidgetConfig>): Promise<boolean> {
    try {
      const widget = this.widgets.get(widgetId);
      if (!widget) {
        console.warn(`Widget ${widgetId} not found for config update`);
        return false;
      }

      const oldCategory = widget.config.category;
      const oldTags = widget.config.tags;

      // Update config while preserving existing values
      widget.config = { ...widget.config, ...config };

      // Re-index if category or tags actually changed
      const categoryChanged = config.category !== undefined && config.category !== oldCategory;
      const tagsChanged = config.tags !== undefined && JSON.stringify(config.tags) !== JSON.stringify(oldTags);
      
      if (categoryChanged || tagsChanged) {
        // Remove from old indices only
        this.removeFromIndices(widget, oldCategory, oldTags);
        // Add to new indices
        this.addToIndices(widget);
      }

      console.log(`Widget ${widgetId} config updated`);
      return true;
    } catch (error) {
      console.error(`Failed to update widget ${widgetId} config:`, error);
      return false;
    }
  }

  private removeFromIndices(widget: Widget, oldCategory?: string, oldTags?: string[]): void {
    // Remove from category index
    if (oldCategory) {
      const categoryWidgets = this.categoryIndex.get(oldCategory);
      if (categoryWidgets) {
        categoryWidgets.delete(widget.id);
        if (categoryWidgets.size === 0) {
          this.categoryIndex.delete(oldCategory);
        }
      }
    }

    // Remove from tag indices
    if (oldTags) {
      oldTags.forEach(tag => {
        const tagWidgets = this.tagIndex.get(tag);
        if (tagWidgets) {
          tagWidgets.delete(widget.id);
          if (tagWidgets.size === 0) {
            this.tagIndex.delete(tag);
          }
        }
      });
    }
  }

  private addToIndices(widget: Widget): void {
    // Add to category index
    if (widget.config.category) {
      if (!this.categoryIndex.has(widget.config.category)) {
        this.categoryIndex.set(widget.config.category, new Set());
      }
      this.categoryIndex.get(widget.config.category)!.add(widget.id);
    }

    // Add to tag indices
    if (widget.config.tags) {
      widget.config.tags.forEach(tag => {
        if (!this.tagIndex.has(tag)) {
          this.tagIndex.set(tag, new Set());
        }
        this.tagIndex.get(tag)!.add(widget.id);
      });
    }
  }

  validateWidget(widget: Widget): boolean {
    try {
      // Required fields validation
      if (!widget.id || typeof widget.id !== 'string') {
        console.error('Widget validation failed: invalid id');
        return false;
      }

      if (!widget.pluginId || typeof widget.pluginId !== 'string') {
        console.error('Widget validation failed: invalid pluginId');
        return false;
      }

      if (!widget.name || typeof widget.name !== 'string') {
        console.error('Widget validation failed: invalid name');
        return false;
      }

      if (!widget.component || typeof widget.component !== 'string') {
        console.error('Widget validation failed: invalid component');
        return false;
      }

      // Status validation
      if (!Object.values(WidgetStatus).includes(widget.status)) {
        console.error('Widget validation failed: invalid status');
        return false;
      }

      // Config validation
      if (!widget.config || typeof widget.config !== 'object') {
        console.error('Widget validation failed: invalid config');
        return false;
      }

      // Size validation
      if (widget.config.defaultSize) {
        const { width, height } = widget.config.defaultSize;
        if (typeof width !== 'number' || width <= 0 || 
            typeof height !== 'number' || height <= 0) {
          console.error('Widget validation failed: invalid defaultSize');
          return false;
        }
      }

      // Position validation
      if (widget.config.defaultPosition) {
        const { x, y } = widget.config.defaultPosition;
        if (typeof x !== 'number' || x < 0 || 
            typeof y !== 'number' || y < 0) {
          console.error('Widget validation failed: invalid defaultPosition');
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Widget validation error:', error);
      return false;
    }
  }

  getWidgetsByCategory(category?: string): Widget[] {
    if (!category) {
      return this.getAllWidgets();
    }

    const widgetIds = this.categoryIndex.get(category);
    if (!widgetIds) return [];

    return Array.from(widgetIds)
      .map(id => this.widgets.get(id))
      .filter((widget): widget is Widget => widget !== undefined);
  }

  getWidgetsByTag(tags: string[]): Widget[] {
    if (!tags || tags.length === 0) {
      return this.getAllWidgets();
    }

    // Find widgets that have ALL specified tags
    const widgetSets = tags.map(tag => this.tagIndex.get(tag) || new Set<string>());
    
    if (widgetSets.length === 0) return [];

    // Intersection of all tag sets
    const commonWidgetIds = widgetSets.reduce((acc, curr) => {
      return new Set([...acc].filter(id => curr.has(id)));
    });

    return Array.from(commonWidgetIds)
      .map(id => this.widgets.get(id))
      .filter((widget): widget is Widget => widget !== undefined);
  }

  searchWidgets(query: string): Widget[] {
    if (!query || query.trim() === '') {
      return this.getAllWidgets();
    }

    const searchTerm = query.toLowerCase().trim();
    
    return this.getAllWidgets().filter(widget => {
      // Search in name
      if (widget.name.toLowerCase().includes(searchTerm)) return true;
      
      // Search in description
      if (widget.description?.toLowerCase().includes(searchTerm)) return true;
      
      // Search in category
      if (widget.config.category?.toLowerCase().includes(searchTerm)) return true;
      
      // Search in tags
      if (widget.config.tags?.some(tag => tag.toLowerCase().includes(searchTerm))) return true;
      
      return false;
    });
  }

  async clearWidgetsForPlugin(pluginId: PluginId): Promise<void> {
    try {
      const widgets = this.getWidgetsByPlugin(pluginId);
      
      for (const widget of widgets) {
        await this.unregisterWidget(widget.id);
      }
      
      console.log(`Cleared ${widgets.length} widgets for plugin: ${pluginId}`);
    } catch (error) {
      console.error(`Failed to clear widgets for plugin ${pluginId}:`, error);
    }
  }
} 