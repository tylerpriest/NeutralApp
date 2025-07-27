# Demo Plugin Development Guide

This guide demonstrates how to create a plugin for NeutralApp using the Hello World demo plugin as a reference implementation.

## Overview

The demo plugin (`demo-hello-world`) is a simple plugin that:
- Displays a customizable greeting message
- Shows a timestamp that updates at configurable intervals
- Integrates with the settings system
- Creates a dashboard widget
- Demonstrates proper plugin lifecycle management

## Plugin Structure

```
src/features/plugin-manager/plugins/demo-hello-world/
├── manifest.json          # Plugin metadata and configuration
├── demo-hello-world.js    # Plugin implementation
└── README.md             # Plugin-specific documentation
```

## Manifest File

The `manifest.json` file defines the plugin's metadata, permissions, settings, and widgets:

```json
{
  "id": "demo-hello-world",
  "name": "Hello World Demo",
  "version": "1.0.0",
  "description": "A simple demo plugin to validate the plugin system",
  "author": "NeutralApp Team",
  "entryPoint": "demo-hello-world.js",
  "dependencies": [],
  "permissions": [
    "settings:read",
    "settings:write",
    "ui:widget:create",
    "ui:widget:update"
  ],
  "settings": {
    "greeting": {
      "type": "string",
      "default": "Hello World!",
      "description": "Custom greeting message"
    },
    "showTimestamp": {
      "type": "boolean",
      "default": true,
      "description": "Show timestamp with greeting"
    },
    "refreshInterval": {
      "type": "number",
      "default": 5000,
      "description": "Refresh interval in milliseconds"
    }
  },
  "widgets": [
    {
      "id": "demo-hello-world-widget",
      "title": "Hello World Demo",
      "type": "custom",
      "size": { "width": 2, "height": 1 },
      "position": { "x": 0, "y": 0 }
    }
  ]
}
```

## Plugin Implementation

The plugin implementation follows a standard lifecycle:

### 1. Constructor
```javascript
constructor(api) {
  this.api = api;
  this.pluginId = 'demo-hello-world';
  this.widgetId = 'demo-hello-world-widget';
  this.refreshInterval = null;
  this.isActive = false;
}
```

### 2. Initialization
```javascript
async initialize() {
  // Load plugin settings
  this.settings = await this.api.settings.get(this.pluginId);
  
  // Create widget
  await this.createWidget();
  
  return true;
}
```

### 3. Activation
```javascript
async activate() {
  this.isActive = true;
  
  // Start refresh interval
  this.startRefreshInterval();
  
  // Subscribe to settings changes
  this.settingsSubscription = this.api.settings.subscribe(
    this.pluginId,
    this.handleSettingsChange.bind(this)
  );
  
  return true;
}
```

### 4. Deactivation
```javascript
async deactivate() {
  this.isActive = false;
  
  // Stop refresh interval
  this.stopRefreshInterval();
  
  // Unsubscribe from settings
  if (this.settingsSubscription) {
    this.settingsSubscription();
  }
  
  return true;
}
```

### 5. Cleanup
```javascript
async cleanup() {
  this.stopRefreshInterval();
  
  if (this.settingsSubscription) {
    this.settingsSubscription();
  }
}
```

## Plugin API

The plugin receives an API object with the following interfaces:

### Settings API
```javascript
// Get plugin settings
const settings = await this.api.settings.get(this.pluginId);

// Subscribe to settings changes
const unsubscribe = this.api.settings.subscribe(
  this.pluginId,
  (key, value) => {
    // Handle setting change
  }
);
```

### UI API
```javascript
// Create a widget
await this.api.ui.createWidget({
  id: 'widget-id',
  title: 'Widget Title',
  type: 'custom',
  size: { width: 2, height: 1 },
  position: { x: 0, y: 0 },
  config: { /* widget configuration */ }
});

// Update a widget
await this.api.ui.updateWidget('widget-id', {
  content: 'Updated content',
  lastUpdated: new Date().toISOString()
});
```

### Events API
```javascript
// Subscribe to events
const unsubscribe = this.api.events.subscribe('event-name', (data) => {
  // Handle event
});

// Publish events
await this.api.events.publish('event-name', { data: 'value' });
```

## Testing the Plugin

The demo plugin includes comprehensive tests:

```javascript
describe('Demo Plugin Integration', () => {
  it('should create a simple Hello World plugin with proper manifest', () => {
    // Test manifest structure
  });

  it('should implement plugin configuration and basic functionality', () => {
    // Test plugin configuration
  });

  it('should add plugin-specific settings to the settings system', async () => {
    // Test settings integration
  });

  it('should create a dashboard widget for the plugin', () => {
    // Test widget creation
  });
});
```

## Best Practices

### 1. Error Handling
Always wrap plugin operations in try-catch blocks:

```javascript
async initialize() {
  try {
    // Plugin initialization logic
    return true;
  } catch (error) {
    console.error('Plugin initialization failed:', error);
    throw error;
  }
}
```

### 2. Resource Management
Properly clean up resources in deactivation and cleanup:

```javascript
async deactivate() {
  // Stop intervals
  this.stopRefreshInterval();
  
  // Unsubscribe from events
  if (this.settingsSubscription) {
    this.settingsSubscription();
  }
}
```

### 3. Settings Management
Use the settings API for configuration:

```javascript
// Load settings on initialization
this.settings = await this.api.settings.get(this.pluginId);

// Subscribe to settings changes
this.settingsSubscription = this.api.settings.subscribe(
  this.pluginId,
  this.handleSettingsChange.bind(this)
);
```

### 4. Widget Updates
Update widgets efficiently and handle errors:

```javascript
async updateWidget() {
  if (!this.isActive) return;

  try {
    const content = this.generateContent();
    await this.api.ui.updateWidget(this.widgetId, {
      content,
      lastUpdated: new Date().toISOString()
    });
  } catch (error) {
    console.error('Failed to update widget:', error);
  }
}
```

## Security Considerations

### 1. Permissions
Only request the permissions your plugin actually needs:

```json
{
  "permissions": [
    "settings:read",
    "settings:write",
    "ui:widget:create"
  ]
}
```

### 2. Input Validation
Validate all inputs and settings:

```javascript
validateSettings(settings) {
  if (settings.refreshInterval && settings.refreshInterval < 1000) {
    throw new Error('Refresh interval must be at least 1000ms');
  }
}
```

### 3. Error Boundaries
Handle errors gracefully without breaking the host application:

```javascript
async handleSettingsChange(key, value) {
  try {
    // Handle setting change
  } catch (error) {
    console.error('Failed to handle setting change:', error);
    // Don't throw - let other plugins continue
  }
}
```

## Deployment

### 1. Package the Plugin
Create a plugin package with all necessary files:

```
demo-hello-world-1.0.0.zip
├── manifest.json
├── demo-hello-world.js
└── README.md
```

### 2. Install the Plugin
Use the plugin manager to install:

```javascript
const pluginPackage = {
  id: 'demo-hello-world',
  version: '1.0.0',
  code: pluginCode,
  manifest: manifestData
};

const result = await pluginManager.installPlugin(pluginPackage);
```

### 3. Activate the Plugin
Enable the plugin after installation:

```javascript
await pluginManager.enablePlugin('demo-hello-world');
```

## Troubleshooting

### Common Issues

1. **Plugin fails to initialize**
   - Check manifest.json syntax
   - Verify all required permissions are requested
   - Ensure entryPoint file exists

2. **Widget not appearing**
   - Verify widget configuration in manifest
   - Check UI API permissions
   - Ensure widget creation is called in initialize()

3. **Settings not saving**
   - Verify settings:write permission
   - Check settings API usage
   - Ensure proper error handling

4. **Plugin crashes on deactivation**
   - Ensure proper cleanup in deactivate()
   - Clear all intervals and subscriptions
   - Handle cleanup errors gracefully

### Debugging

Enable plugin debugging by setting the environment variable:

```bash
PLUGIN_DEBUG=true npm start
```

This will provide detailed logging for plugin operations.

## Next Steps

1. Study the demo plugin implementation
2. Create your own plugin following this pattern
3. Test your plugin thoroughly
4. Submit your plugin for review

For more information, see the main plugin development documentation. 