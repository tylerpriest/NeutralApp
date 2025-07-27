/**
 * Demo Hello World Plugin
 * A simple plugin to validate the plugin system
 */

class DemoHelloWorldPlugin {
  constructor(api) {
    this.api = api;
    this.pluginId = 'demo-hello-world';
    this.widgetId = 'demo-hello-world-widget';
    this.refreshInterval = null;
    this.isActive = false;
  }

  async initialize() {
    try {
      console.log('Demo Hello World Plugin: Initializing...');
      
      // Load plugin settings
      this.settings = await this.api.settings.get(this.pluginId);
      
      // Create widget
      await this.createWidget();
      
      console.log('Demo Hello World Plugin: Initialized successfully');
      return true;
    } catch (error) {
      console.error('Demo Hello World Plugin: Initialization failed:', error);
      throw error;
    }
  }

  async activate() {
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

  async deactivate() {
    try {
      console.log('Demo Hello World Plugin: Deactivating...');
      
      this.isActive = false;
      
      // Stop refresh interval
      this.stopRefreshInterval();
      
      // Unsubscribe from settings
      if (this.settingsSubscription) {
        this.settingsSubscription();
      }
      
      console.log('Demo Hello World Plugin: Deactivated successfully');
      return true;
    } catch (error) {
      console.error('Demo Hello World Plugin: Deactivation failed:', error);
      throw error;
    }
  }

  async createWidget() {
    const widget = {
      id: this.widgetId,
      title: 'Hello World Demo',
      type: 'custom',
      size: { width: 2, height: 1 },
      position: { x: 0, y: 0 },
      config: {
        greeting: this.settings?.greeting || 'Hello World!',
        showTimestamp: this.settings?.showTimestamp !== false,
        refreshInterval: this.settings?.refreshInterval || 5000
      }
    };

    await this.api.ui.createWidget(widget);
  }

  async updateWidget() {
    if (!this.isActive) return;

    const greeting = this.settings?.greeting || 'Hello World!';
    const showTimestamp = this.settings?.showTimestamp !== false;
    const timestamp = showTimestamp ? new Date().toLocaleTimeString() : '';

    const content = showTimestamp 
      ? `${greeting} (${timestamp})`
      : greeting;

    await this.api.ui.updateWidget(this.widgetId, {
      content,
      lastUpdated: new Date().toISOString()
    });
  }

  startRefreshInterval() {
    const interval = this.settings?.refreshInterval || 5000;
    
    this.refreshInterval = setInterval(() => {
      this.updateWidget();
    }, interval);
  }

  stopRefreshInterval() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
    }
  }

  async handleSettingsChange(key, value) {
    console.log(`Demo Hello World Plugin: Setting changed - ${key}: ${value}`);
    
    // Update local settings
    this.settings = this.settings || {};
    this.settings[key] = value;
    
    // Update widget immediately
    await this.updateWidget();
    
    // Restart refresh interval if interval changed
    if (key === 'refreshInterval') {
      this.stopRefreshInterval();
      this.startRefreshInterval();
    }
  }

  async getWidget() {
    return {
      id: this.widgetId,
      title: 'Hello World Demo',
      type: 'custom',
      config: this.settings || {}
    };
  }

  async getSettings() {
    return this.settings || {};
  }

  async cleanup() {
    console.log('Demo Hello World Plugin: Cleaning up...');
    
    this.stopRefreshInterval();
    
    if (this.settingsSubscription) {
      this.settingsSubscription();
    }
    
    console.log('Demo Hello World Plugin: Cleanup completed');
  }
}

// Export the plugin class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DemoHelloWorldPlugin;
} else {
  // Browser environment
  window.DemoHelloWorldPlugin = DemoHelloWorldPlugin;
} 