/**
 * Demo Hello World Plugin - TypeScript Module
 * 
 * This module provides a TypeScript interface for the demo plugin,
 * following industry standards for plugin architecture.
 */

import { PluginManifest } from '../../shared/types';

// Plugin manifest
export const manifest: PluginManifest = {
  id: 'demo-hello-world',
  name: 'Hello World Demo',
  version: '1.0.0',
  description: 'A simple demo plugin to validate the plugin system',
  author: 'NeutralApp Team',
  main: 'demo-hello-world.js',
  dependencies: [],
  permissions: [
    { name: 'settings:read', description: 'Read settings', required: true },
    { name: 'settings:write', description: 'Write settings', required: true },
    { name: 'ui:widget:create', description: 'Create widgets', required: true },
    { name: 'ui:widget:update', description: 'Update widgets', required: true }
  ],
  api: ['settings', 'ui', 'events']
};

// Plugin configuration interface
export interface DemoPluginConfig {
  greeting: string;
  showTimestamp: boolean;
  refreshInterval: number;
}

// Default configuration
export const defaultConfig: DemoPluginConfig = {
  greeting: 'Hello World!',
  showTimestamp: true,
  refreshInterval: 5000
};

// Plugin class interface
export interface IDemoPlugin {
  initialize(): Promise<boolean>;
  activate(): Promise<boolean>;
  deactivate(): Promise<boolean>;
  cleanup(): Promise<void>;
  getWidget(): Promise<any>;
  getSettings(): Promise<DemoPluginConfig>;
}

// Plugin factory function
export function createDemoPlugin(api: any): IDemoPlugin {
  return new DemoHelloWorldPlugin(api);
}

// Main plugin class
class DemoHelloWorldPlugin implements IDemoPlugin {
  private api: any;
  private pluginId: string;
  private widgetId: string;
  private refreshInterval: NodeJS.Timeout | null;
  private isActive: boolean;
  private settings: DemoPluginConfig;
  private settingsSubscription: (() => void) | null;

  constructor(api: any) {
    this.api = api;
    this.pluginId = 'demo-hello-world';
    this.widgetId = 'demo-hello-world-widget';
    this.refreshInterval = null;
    this.isActive = false;
    this.settings = { ...defaultConfig };
    this.settingsSubscription = null;
  }

  async initialize(): Promise<boolean> {
    try {
      console.log('Demo Hello World Plugin: Initializing...');
      
      // Load plugin settings
      const savedSettings = await this.api.settings.get(this.pluginId);
      this.settings = { ...defaultConfig, ...savedSettings };
      
      // Create widget
      await this.createWidget();
      
      console.log('Demo Hello World Plugin: Initialized successfully');
      return true;
    } catch (error) {
      console.error('Demo Hello World Plugin: Initialization failed:', error);
      throw error;
    }
  }

  async activate(): Promise<boolean> {
    try {
      console.log('Demo Hello World Plugin: Activating...');
      
      this.isActive = true;
      
      // Start refresh interval
      this.startRefreshInterval();
      
      // Subscribe to settings changes
      this.settingsSubscription = this.api.settings.subscribe(
        this.pluginId,
        this.handleSettingsChange.bind(this)
      );
      
      console.log('Demo Hello World Plugin: Activated successfully');
      return true;
    } catch (error) {
      console.error('Demo Hello World Plugin: Activation failed:', error);
      throw error;
    }
  }

  async deactivate(): Promise<boolean> {
    try {
      console.log('Demo Hello World Plugin: Deactivating...');
      
      this.isActive = false;
      
      // Stop refresh interval
      this.stopRefreshInterval();
      
      // Unsubscribe from settings
      if (this.settingsSubscription) {
        this.settingsSubscription();
        this.settingsSubscription = null;
      }
      
      console.log('Demo Hello World Plugin: Deactivated successfully');
      return true;
    } catch (error) {
      console.error('Demo Hello World Plugin: Deactivation failed:', error);
      throw error;
    }
  }

  async cleanup(): Promise<void> {
    console.log('Demo Hello World Plugin: Cleaning up...');
    
    this.stopRefreshInterval();
    
    if (this.settingsSubscription) {
      this.settingsSubscription();
      this.settingsSubscription = null;
    }
    
    console.log('Demo Hello World Plugin: Cleanup completed');
  }

  private async createWidget(): Promise<void> {
    const widget = {
      id: this.widgetId,
      title: 'Hello World Demo',
      type: 'custom',
      size: { width: 2, height: 1 },
      position: { x: 0, y: 0 },
      config: {
        greeting: this.settings.greeting,
        showTimestamp: this.settings.showTimestamp,
        refreshInterval: this.settings.refreshInterval
      }
    };

    await this.api.ui.createWidget(widget);
  }

  private async updateWidget(): Promise<void> {
    if (!this.isActive) return;

    const greeting = this.settings.greeting;
    const showTimestamp = this.settings.showTimestamp;
    const timestamp = showTimestamp ? new Date().toLocaleTimeString() : '';

    const content = showTimestamp 
      ? `${greeting} (${timestamp})`
      : greeting;

    await this.api.ui.updateWidget(this.widgetId, {
      content,
      lastUpdated: new Date().toISOString()
    });
  }

  private startRefreshInterval(): void {
    const interval = this.settings.refreshInterval;
    
    this.refreshInterval = setInterval(() => {
      this.updateWidget();
    }, interval);
  }

  private stopRefreshInterval(): void {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  private async handleSettingsChange(key: string, value: any): Promise<void> {
    console.log(`Demo Hello World Plugin: Setting changed - ${key}: ${value}`);
    
    // Update local settings
    this.settings = { ...this.settings, [key]: value };
    
    // Update widget immediately
    await this.updateWidget();
    
    // Restart refresh interval if interval changed
    if (key === 'refreshInterval') {
      this.stopRefreshInterval();
      this.startRefreshInterval();
    }
  }

  async getWidget(): Promise<any> {
    return {
      id: this.widgetId,
      title: 'Hello World Demo',
      type: 'custom',
      config: this.settings
    };
  }

  async getSettings(): Promise<DemoPluginConfig> {
    return { ...this.settings };
  }
}

// Default export
export default DemoHelloWorldPlugin; 