# Plugin API Reference

## Overview

The NeutralApp Plugin API provides a secure, well-defined interface for building plugins that extend the core functionality. This reference documents all available APIs, interfaces, and best practices for plugin development.

## Quick Start

### Basic Plugin Structure

```typescript
// manifest.json
{
  "name": "my-awesome-plugin",
  "version": "1.0.0",
  "description": "A sample plugin that demonstrates the API",
  "main": "index.ts",
  "permissions": ["storage", "ui"],
  "dependencies": []
}

// index.ts
import { PluginAPI, PluginContext } from '@neutral-app/plugin-api';

export default class MyAwesomePlugin {
  private api: PluginAPI;
  private context: PluginContext;

  constructor(api: PluginAPI, context: PluginContext) {
    this.api = api;
    this.context = context;
  }

  async activate(): Promise<void> {
    // Plugin initialization code
    await this.registerUI();
    await this.setupEventHandlers();
  }

  async deactivate(): Promise<void> {
    // Cleanup code
    this.api.ui.unregisterAll(this.context.pluginId);
  }

  private async registerUI(): Promise<void> {
    // Register dashboard widget
    this.api.ui.registerDashboardWidget({
      id: 'my-widget',
      title: 'My Awesome Widget',
      component: this.renderWidget.bind(this),
      position: { row: 0, col: 0, width: 2, height: 1 }
    });
  }

  private renderWidget(): JSX.Element {
    return (
      <div className="widget">
        <h3>Hello from My Plugin!</h3>
        <button onClick={() => this.handleClick()}>
          Click me!
        </button>
      </div>
    );
  }

  private handleClick(): void {
    this.api.notifications.show({
      type: 'success',
      message: 'Plugin button clicked!',
      duration: 3000
    });
  }

  private async setupEventHandlers(): Promise<void> {
    // Listen for events from other plugins
    this.api.events.subscribe('user:login', (user) => {
      console.log(`User logged in: ${user.name}`);
    });
  }
}
```

## Core Interfaces

### PluginAPI

The main API object provided to all plugins.

```typescript
interface PluginAPI {
  ui: UIManager;
  storage: StorageManager;
  events: EventManager;
  notifications: NotificationManager;
  http: HttpManager;
  settings: SettingsManager;
  utils: UtilityManager;
}
```

### PluginContext

Context information about the current plugin.

```typescript
interface PluginContext {
  pluginId: string;
  version: string;
  name: string;
  permissions: string[];
  config: PluginConfiguration;
}
```

## UI Management

### Registering Components

```typescript
// Dashboard Widget
api.ui.registerDashboardWidget({
  id: 'unique-widget-id',
  title: 'Widget Title',
  component: MyWidgetComponent,
  position: { row: 0, col: 0, width: 2, height: 1 },
  permissions: ['read:data'],
  settings: {
    refreshInterval: 5000,
    showChart: true
  }
});

// Navigation Menu Item
api.ui.registerMenuItem({
  id: 'my-menu-item',
  label: 'My Plugin',
  icon: 'plugin-icon',
  route: '/plugins/my-plugin',
  position: 'main-menu'
});

// Settings Panel
api.ui.registerSettingsPanel({
  id: 'my-settings',
  title: 'My Plugin Settings',
  component: MySettingsComponent,
  category: 'plugins'
});

// Modal Dialog
api.ui.showModal({
  title: 'Confirmation',
  content: 'Are you sure you want to delete this item?',
  buttons: [
    { label: 'Cancel', action: 'cancel' },
    { label: 'Delete', action: 'confirm', style: 'danger' }
  ],
  onAction: (action) => {
    if (action === 'confirm') {
      // Handle deletion
    }
  }
});
```

### UI Component Props

```typescript
interface DashboardWidget {
  id: string;
  title: string;
  component: React.ComponentType<WidgetProps>;
  position: WidgetPosition;
  permissions?: string[];
  settings?: Record<string, any>;
  onResize?: (size: WidgetSize) => void;
  onMove?: (position: WidgetPosition) => void;
}

interface WidgetProps {
  api: PluginAPI;
  context: PluginContext;
  settings: Record<string, any>;
  onSettingsChange: (settings: Record<string, any>) => void;
}
```

## Data Storage

### Basic Storage Operations

```typescript
// Store data
await api.storage.set('user-preferences', {
  theme: 'dark',
  language: 'en',
  notifications: true
});

// Retrieve data
const preferences = await api.storage.get('user-preferences');

// Store with expiration
await api.storage.set('temp-data', { value: 123 }, { 
  ttl: 3600 // expires in 1 hour 
});

// Delete data
await api.storage.delete('old-data');

// Check if key exists
const exists = await api.storage.has('user-preferences');

// List all keys
const keys = await api.storage.keys();

// Clear all plugin data
await api.storage.clear();
```

### Advanced Storage Features

```typescript
// Atomic operations
await api.storage.transaction(async (tx) => {
  const currentValue = await tx.get('counter') || 0;
  await tx.set('counter', currentValue + 1);
  await tx.set('last-updated', new Date().toISOString());
});

// Subscribe to changes
const unsubscribe = api.storage.watch('user-preferences', (newValue, oldValue) => {
  console.log('Preferences changed:', { newValue, oldValue });
});

// Batch operations
await api.storage.batch([
  { operation: 'set', key: 'key1', value: 'value1' },
  { operation: 'set', key: 'key2', value: 'value2' },
  { operation: 'delete', key: 'key3' }
]);
```

## Event System

### Publishing Events

```typescript
// Simple event
api.events.publish('data:updated', { 
  type: 'user',
  id: '12345',
  changes: ['name', 'email']
});

// Event with metadata
api.events.publish('plugin:action', {
  action: 'file-uploaded',
  file: { name: 'document.pdf', size: 1024000 }
}, {
  priority: 'high',
  persist: true,
  delay: 1000 // delay by 1 second
});
```

### Subscribing to Events

```typescript
// Basic subscription
const unsubscribe = api.events.subscribe('user:login', (userData) => {
  console.log('User logged in:', userData.name);
});

// Pattern-based subscription
api.events.subscribe('data:*', (eventName, data) => {
  console.log(`Data event: ${eventName}`, data);
});

// Conditional subscription
api.events.subscribe('order:created', (order) => {
  // Only handle orders over $100
  if (order.amount > 100) {
    processLargeOrder(order);
  }
}, {
  filter: (order) => order.amount > 100
});

// One-time subscription
api.events.once('app:ready', () => {
  console.log('App is ready!');
});
```

### Event Types

```typescript
// Standard event types
type EventType = 
  | 'app:ready' | 'app:shutdown'
  | 'user:login' | 'user:logout' | 'user:updated'
  | 'data:created' | 'data:updated' | 'data:deleted'
  | 'plugin:activated' | 'plugin:deactivated'
  | 'ui:route-changed' | 'ui:theme-changed';

// Custom event payload
interface CustomEventPayload {
  source: string;
  timestamp: number;
  data: any;
  metadata?: Record<string, any>;
}
```

## HTTP and External APIs

### Making HTTP Requests

```typescript
// GET request
const response = await api.http.get('https://api.example.com/users');
const users = response.data;

// POST request with data
const newUser = await api.http.post('https://api.example.com/users', {
  name: 'John Doe',
  email: 'john@example.com'
});

// Request with headers and options
const result = await api.http.request({
  method: 'PUT',
  url: 'https://api.example.com/users/123',
  headers: {
    'Authorization': 'Bearer token123',
    'Content-Type': 'application/json'
  },
  data: { name: 'Updated Name' },
  timeout: 5000,
  retries: 3
});
```

### Proxied Requests

```typescript
// Requests through NeutralApp proxy (bypasses CORS)
const data = await api.http.proxy({
  url: 'https://restricted-api.example.com/data',
  headers: { 'API-Key': 'secret-key' }
});
```

## Settings Management

### Plugin Settings Schema

```typescript
// Define settings schema
const settingsSchema = {
  apiKey: {
    type: 'string',
    required: true,
    sensitive: true,
    description: 'API key for external service'
  },
  refreshInterval: {
    type: 'number',
    default: 30000,
    min: 5000,
    max: 300000,
    description: 'Data refresh interval in milliseconds'
  },
  enableNotifications: {
    type: 'boolean',
    default: true,
    description: 'Enable push notifications'
  },
  theme: {
    type: 'enum',
    options: ['light', 'dark', 'auto'],
    default: 'auto',
    description: 'UI theme preference'
  }
};

// Register settings
api.settings.registerSchema(settingsSchema);
```

### Reading and Writing Settings

```typescript
// Get setting value
const apiKey = await api.settings.get('apiKey');
const refreshInterval = await api.settings.get('refreshInterval', 30000); // with default

// Set setting value
await api.settings.set('enableNotifications', false);

// Get all settings
const allSettings = await api.settings.getAll();

// Watch for changes
api.settings.watch('theme', (newTheme) => {
  updateUITheme(newTheme);
});

// Validate settings
const isValid = await api.settings.validate({
  refreshInterval: 15000,
  theme: 'dark'
});
```

## Notifications

### Showing Notifications

```typescript
// Simple notification
api.notifications.show({
  type: 'info',
  message: 'Data synchronized successfully',
  duration: 3000
});

// Rich notification
api.notifications.show({
  type: 'warning',
  title: 'Storage Almost Full',
  message: 'You have used 90% of your storage quota',
  actions: [
    { label: 'View Details', action: 'view-storage' },
    { label: 'Upgrade', action: 'upgrade-plan' }
  ],
  persistent: true,
  icon: 'storage-warning',
  onAction: (action) => {
    if (action === 'upgrade-plan') {
      api.ui.navigateTo('/billing/upgrade');
    }
  }
});

// Progress notification
const notificationId = api.notifications.showProgress({
  title: 'Uploading files...',
  progress: 0
});

// Update progress
api.notifications.updateProgress(notificationId, {
  progress: 50,
  message: 'Uploading file 5 of 10'
});

// Complete
api.notifications.complete(notificationId, {
  type: 'success',
  message: 'All files uploaded successfully'
});
```

## Utility Functions

### Common Utilities

```typescript
// Date formatting
const formatted = api.utils.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss');

// Data validation
const isValid = api.utils.validate(data, {
  name: { type: 'string', required: true },
  age: { type: 'number', min: 0, max: 150 }
});

// URL manipulation
const url = api.utils.buildUrl('https://api.example.com', '/users', {
  page: 1,
  limit: 10,
  search: 'john'
});

// Debouncing
const debouncedSave = api.utils.debounce(saveData, 1000);

// Throttling
const throttledUpdate = api.utils.throttle(updateUI, 100);

// Async retry with backoff
const result = await api.utils.retry(
  () => unreliableApiCall(),
  { attempts: 3, delay: 1000, backoff: 2 }
);

// Generate unique IDs
const id = api.utils.generateId();
const uuid = api.utils.generateUUID();

// Hash generation
const hash = await api.utils.hash('sensitive-data', 'sha256');

// File operations
const fileContent = await api.utils.readFile(file);
const base64 = await api.utils.fileToBase64(file);
```

## Security and Permissions

### Permission System

```typescript
// Request permissions in manifest.json
{
  "permissions": [
    "storage",              // Local storage access
    "storage:global",       // Cross-plugin storage access
    "ui",                   // UI registration
    "ui:navigation",        // Navigation control
    "events",               // Event system access
    "events:system",        // System event access
    "http",                 // HTTP requests
    "http:external",        // External domain requests
    "notifications",        // Show notifications
    "settings",             // Plugin settings
    "settings:global",      // Global settings access
    "files:read",           // Read file access
    "files:write",          // Write file access
    "admin"                 // Administrative functions
  ]
}

// Check permissions at runtime
if (api.permissions.has('http:external')) {
  await api.http.get('https://external-api.com/data');
} else {
  console.warn('External HTTP access not permitted');
}

// Request additional permissions
const granted = await api.permissions.request(['files:write']);
if (granted) {
  // Permission granted, can now write files
}
```

### Security Best Practices

```typescript
// Input sanitization
const safeHtml = api.utils.sanitizeHtml(userInput);
const safeText = api.utils.escapeHtml(userText);

// Secure storage for sensitive data
await api.storage.setSecure('apiKey', secretKey);
const apiKey = await api.storage.getSecure('apiKey');

// CSRF protection for forms
const csrfToken = await api.security.getCsrfToken();

// Rate limiting
const rateLimiter = api.utils.createRateLimiter({
  maxRequests: 100,
  windowMs: 60000 // 1 minute
});

if (rateLimiter.isAllowed(userId)) {
  // Process request
}
```

## Error Handling

### Error Types and Handling

```typescript
try {
  await api.http.get('https://api.example.com/data');
} catch (error) {
  if (error instanceof PluginAPIError) {
    switch (error.code) {
      case 'PERMISSION_DENIED':
        api.notifications.show({
          type: 'error',
          message: 'Permission denied. Please check plugin settings.'
        });
        break;
      
      case 'NETWORK_ERROR':
        // Retry with exponential backoff
        await api.utils.retry(() => api.http.get(url), {
          attempts: 3,
          delay: 1000,
          backoff: 2
        });
        break;
      
      case 'RATE_LIMITED':
        await api.utils.delay(error.retryAfter * 1000);
        // Retry the request
        break;
      
      default:
        console.error('Unknown API error:', error);
    }
  }
}

// Custom error handling
api.errors.onError((error, context) => {
  // Log error to external service
  sendErrorToLoggingService(error, context);
});
```

## Testing Your Plugin

### Unit Testing

```typescript
// test/plugin.test.ts
import { MockPluginAPI } from '@neutral-app/plugin-testing';
import MyAwesomePlugin from '../src/index';

describe('MyAwesomePlugin', () => {
  let plugin: MyAwesomePlugin;
  let mockAPI: MockPluginAPI;

  beforeEach(() => {
    mockAPI = new MockPluginAPI();
    plugin = new MyAwesomePlugin(mockAPI, {
      pluginId: 'my-awesome-plugin',
      version: '1.0.0',
      name: 'My Awesome Plugin',
      permissions: ['storage', 'ui'],
      config: {}
    });
  });

  it('should register UI components on activation', async () => {
    await plugin.activate();
    
    expect(mockAPI.ui.registerDashboardWidget).toHaveBeenCalledWith({
      id: 'my-widget',
      title: 'My Awesome Widget',
      component: expect.any(Function),
      position: { row: 0, col: 0, width: 2, height: 1 }
    });
  });

  it('should handle events correctly', async () => {
    await plugin.activate();
    
    // Simulate event
    mockAPI.events.emit('user:login', { name: 'John Doe' });
    
    // Verify event handling
    expect(/* your assertions */);
  });
});
```

### Integration Testing

```typescript
// test/integration.test.ts
import { PluginTestEnvironment } from '@neutral-app/plugin-testing';

describe('Plugin Integration', () => {
  let testEnv: PluginTestEnvironment;

  beforeEach(async () => {
    testEnv = new PluginTestEnvironment();
    await testEnv.loadPlugin('./dist/my-awesome-plugin');
  });

  afterEach(async () => {
    await testEnv.cleanup();
  });

  it('should integrate with other plugins', async () => {
    // Load multiple plugins and test interactions
    await testEnv.loadPlugin('./dist/dependency-plugin');
    
    // Test plugin interactions
    const result = await testEnv.triggerEvent('data:updated', testData);
    expect(result).toMatchSnapshot();
  });
});
```

## Performance Optimization

### Best Practices

```typescript
// Lazy loading
const heavyComponent = React.lazy(() => import('./HeavyComponent'));

// Memoization
const expensiveCalculation = api.utils.memoize((input) => {
  // Expensive operation
  return performCalculation(input);
});

// Virtual scrolling for large lists
const VirtualList = api.ui.createVirtualList({
  itemHeight: 50,
  overscan: 5
});

// Image optimization
const optimizedImage = await api.utils.optimizeImage(imageFile, {
  quality: 0.8,
  maxWidth: 800,
  format: 'webp'
});

// Bundle splitting
const { dynamicImport } = api.utils;
const module = await dynamicImport('./large-module');
```

## Debugging and Development

### Development Tools

```typescript
// Debug logging
if (api.env.isDevelopment()) {
  api.debug.log('Debug information', { data: complexObject });
  api.debug.time('performance-test');
  // ... code to measure
  api.debug.timeEnd('performance-test');
}

// Plugin inspector
api.debug.inspect({
  storage: await api.storage.getAll(),
  events: api.events.getSubscriptions(),
  ui: api.ui.getRegisteredComponents()
});

// Performance monitoring
api.performance.mark('plugin-start');
await plugin.initialize();
api.performance.mark('plugin-ready');
api.performance.measure('plugin-init', 'plugin-start', 'plugin-ready');
```

### Hot Reloading

```typescript
// Enable hot reloading in development
if (api.env.isDevelopment()) {
  api.dev.enableHotReload({
    watchPaths: ['./src/**/*.ts', './src/**/*.tsx'],
    onReload: async () => {
      await plugin.deactivate();
      await plugin.activate();
    }
  });
}
```

## Publishing and Distribution

### Plugin Manifest

```json
{
  "name": "my-awesome-plugin",
  "version": "1.0.0",
  "description": "A comprehensive plugin that demonstrates all API features",
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "homepage": "https://github.com/yourname/my-awesome-plugin",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourname/my-awesome-plugin.git"
  },
  "main": "dist/index.js",
  "files": ["dist/", "README.md", "LICENSE"],
  "keywords": ["neutral-app", "plugin", "productivity"],
  "neutralApp": {
    "minVersion": "1.0.0",
    "maxVersion": "2.0.0"
  },
  "permissions": [
    "storage",
    "ui",
    "events",
    "notifications",
    "http"
  ],
  "dependencies": {
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "@neutral-app/plugin-testing": "^1.0.0"
  },
  "scripts": {
    "build": "tsc",
    "test": "jest",
    "lint": "eslint src/**/*.ts"
  }
}
```

### Build Configuration

```typescript
// webpack.config.js
module.exports = {
  entry: './src/index.ts',
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'commonjs2'
    }
  },
  externals: {
    '@neutral-app/plugin-api': 'commonjs2 @neutral-app/plugin-api'
  },
  // ... other webpack configuration
};
```

## Migration Guide

### Updating from Previous Versions

```typescript
// v1.0 to v2.0 migration
class MyPlugin {
  async migrate(fromVersion: string, toVersion: string): Promise<void> {
    if (fromVersion === '1.0.0' && toVersion === '2.0.0') {
      // Migrate storage format
      const oldData = await api.storage.get('old-key');
      if (oldData) {
        const newData = transformData(oldData);
        await api.storage.set('new-key', newData);
        await api.storage.delete('old-key');
      }
      
      // Update UI components
      api.ui.unregisterComponent('old-widget');
      api.ui.registerDashboardWidget(newWidgetConfig);
    }
  }
}
```

## FAQ and Troubleshooting

### Common Issues

**Q: My plugin UI components are not rendering**
```typescript
// Check permissions
if (!api.permissions.has('ui')) {
  console.error('UI permission required');
}

// Verify component registration
api.ui.registerDashboardWidget({
  id: 'unique-id', // Must be unique
  title: 'Widget Title',
  component: MyComponent // Must be a valid React component
});
```

**Q: Storage operations are failing**
```typescript
// Check storage limits
const usage = await api.storage.getUsage();
if (usage.used > usage.limit * 0.9) {
  console.warn('Storage nearly full');
}

// Handle storage errors
try {
  await api.storage.set('key', largeData);
} catch (error) {
  if (error.code === 'QUOTA_EXCEEDED') {
    // Handle quota exceeded
  }
}
```

**Q: Events are not being received**
```typescript
// Verify event subscription
const unsubscribe = api.events.subscribe('event:name', handler);

// Check event permissions
if (!api.permissions.has('events')) {
  console.error('Events permission required');
}

// Debug event flow
api.debug.logEvents(['event:name']);
```

For more examples and advanced usage patterns, see our [GitHub repository](https://github.com/neutral-app/plugin-examples) with complete plugin examples. 