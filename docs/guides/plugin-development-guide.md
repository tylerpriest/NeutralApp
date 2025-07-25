# Plugin Development Guide

## Introduction

Welcome to NeutralApp plugin development! This guide will take you through everything you need to know to build powerful, secure, and well-integrated plugins for the NeutralApp ecosystem.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment Setup](#development-environment-setup)
3. [Your First Plugin](#your-first-plugin)
4. [Plugin Architecture](#plugin-architecture)
5. [UI Development](#ui-development)
6. [Data Management](#data-management)
7. [Event Handling](#event-handling)
8. [Security Best Practices](#security-best-practices)
9. [Testing](#testing)
10. [Performance Optimization](#performance-optimization)
11. [Publishing](#publishing)
12. [Advanced Topics](#advanced-topics)

## Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- TypeScript knowledge
- React experience (for UI components)
- Basic understanding of plugin architectures

### Development Tools

```bash
# Install the NeutralApp CLI
npm install -g @neutral-app/cli

# Create a new plugin project
neutral-app create-plugin my-awesome-plugin

# Navigate to your plugin directory
cd my-awesome-plugin

# Install dependencies
npm install
```

## Development Environment Setup

### Project Structure

```
my-awesome-plugin/
├── src/
│   ├── index.ts                 # Main plugin entry point
│   ├── components/              # React components
│   │   ├── Widget.tsx
│   │   └── Settings.tsx
│   ├── services/                # Business logic
│   │   └── DataService.ts
│   ├── types/                   # TypeScript type definitions
│   │   └── index.ts
│   └── utils/                   # Utility functions
│       └── helpers.ts
├── tests/                       # Test files
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── docs/                        # Documentation
├── assets/                      # Static assets
├── manifest.json                # Plugin manifest
├── package.json
├── tsconfig.json
├── webpack.config.js
└── README.md
```

### TypeScript Configuration

```json
// tsconfig.json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "CommonJS",
    "lib": ["ES2020", "DOM"],
    "jsx": "react-jsx",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "moduleResolution": "node",
    "allowSyntheticDefaultImports": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

### Webpack Configuration

```javascript
// webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/index.ts',
  mode: process.env.NODE_ENV === 'production' ? 'production' : 'development',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg)$/,
        type: 'asset/resource',
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: {
      type: 'commonjs2',
    },
  },
  externals: {
    '@neutral-app/plugin-api': 'commonjs2 @neutral-app/plugin-api',
    'react': 'commonjs2 react',
    'react-dom': 'commonjs2 react-dom',
  },
};
```

## Your First Plugin

Let's build a simple "Hello World" plugin to understand the basics.

### Step 1: Create the Manifest

```json
// manifest.json
{
  "name": "hello-world-plugin",
  "version": "1.0.0",
  "description": "A simple hello world plugin",
  "author": "Your Name",
  "main": "dist/index.js",
  "permissions": ["ui", "notifications"],
  "neutralApp": {
    "minVersion": "1.0.0"
  }
}
```

### Step 2: Implement the Plugin Class

```typescript
// src/index.ts
import { PluginAPI, PluginContext } from '@neutral-app/plugin-api';
import HelloWidget from './components/HelloWidget';

export default class HelloWorldPlugin {
  private api: PluginAPI;
  private context: PluginContext;

  constructor(api: PluginAPI, context: PluginContext) {
    this.api = api;
    this.context = context;
  }

  async activate(): Promise<void> {
    console.log(`Activating ${this.context.name} v${this.context.version}`);
    
    // Register a dashboard widget
    this.api.ui.registerDashboardWidget({
      id: 'hello-widget',
      title: 'Hello World',
      component: HelloWidget,
      position: { row: 0, col: 0, width: 2, height: 1 }
    });

    // Show activation notification
    this.api.notifications.show({
      type: 'success',
      message: 'Hello World plugin activated!',
      duration: 3000
    });
  }

  async deactivate(): Promise<void> {
    console.log(`Deactivating ${this.context.name}`);
    
    // Clean up registered components
    this.api.ui.unregisterAll(this.context.pluginId);
    
    this.api.notifications.show({
      type: 'info',
      message: 'Hello World plugin deactivated',
      duration: 2000
    });
  }
}
```

### Step 3: Create the Widget Component

```typescript
// src/components/HelloWidget.tsx
import React, { useState } from 'react';
import { PluginAPI, PluginContext } from '@neutral-app/plugin-api';

interface HelloWidgetProps {
  api: PluginAPI;
  context: PluginContext;
}

const HelloWidget: React.FC<HelloWidgetProps> = ({ api, context }) => {
  const [clickCount, setClickCount] = useState(0);

  const handleClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);
    
    api.notifications.show({
      type: 'info',
      message: `Button clicked ${newCount} times!`,
      duration: 2000
    });
  };

  return (
    <div className="hello-widget">
      <h3>Hello from {context.name}!</h3>
      <p>Version: {context.version}</p>
      <button onClick={handleClick} className="btn btn-primary">
        Click me! ({clickCount})
      </button>
    </div>
  );
};

export default HelloWidget;
```

### Step 4: Build and Test

```bash
# Build the plugin
npm run build

# Test locally
neutral-app dev --plugin ./dist

# Package for distribution
neutral-app package
```

## Plugin Architecture

### Lifecycle Methods

Every plugin should implement these core lifecycle methods:

```typescript
class MyPlugin {
  // Called when plugin is first installed
  async install(): Promise<void> {
    // Setup initial data, create database tables, etc.
  }

  // Called when plugin is activated
  async activate(): Promise<void> {
    // Register UI components, event handlers, etc.
  }

  // Called when plugin is deactivated  
  async deactivate(): Promise<void> {
    // Clean up resources, unregister components
  }

  // Called when plugin is uninstalled
  async uninstall(): Promise<void> {
    // Remove all data, clean up completely
  }

  // Called when plugin is updated
  async update(fromVersion: string, toVersion: string): Promise<void> {
    // Handle data migration, update configurations
  }
}
```

### Error Handling

```typescript
class RobustPlugin {
  private api: PluginAPI;

  async activate(): Promise<void> {
    try {
      await this.initializeServices();
      await this.registerComponents();
    } catch (error) {
      this.api.logger.error('Plugin activation failed', error);
      
      // Show user-friendly error
      this.api.notifications.show({
        type: 'error',
        title: 'Plugin Error',
        message: 'Failed to activate plugin. Please try again.',
        actions: [
          { label: 'Retry', action: 'retry' },
          { label: 'Report Bug', action: 'report' }
        ]
      });
      
      throw error; // Re-throw to prevent activation
    }
  }

  private async initializeServices(): Promise<void> {
    // Initialize with retry logic
    await this.api.utils.retry(async () => {
      await this.connectToExternalService();
    }, { attempts: 3, delay: 1000 });
  }
}
```

## UI Development

### Component Registration

```typescript
// Dashboard widget with advanced configuration
this.api.ui.registerDashboardWidget({
  id: 'advanced-widget',
  title: 'Advanced Widget',
  description: 'A widget with advanced features',
  component: AdvancedWidget,
  position: { row: 0, col: 0, width: 4, height: 3 },
  minSize: { width: 2, height: 2 },
  maxSize: { width: 8, height: 6 },
  resizable: true,
  moveable: true,
  settings: {
    refreshInterval: 30000,
    showHeader: true,
    theme: 'light'
  },
  permissions: ['data:read'],
  onResize: (newSize) => {
    console.log('Widget resized:', newSize);
  },
  onMove: (newPosition) => {
    console.log('Widget moved:', newPosition);
  },
  onSettingsChange: (newSettings) => {
    console.log('Settings changed:', newSettings);
  }
});

// Navigation menu item
this.api.ui.registerMenuItem({
  id: 'my-plugin-menu',
  label: 'My Plugin',
  icon: 'plugin-icon',
  route: '/plugins/my-plugin',
  position: 'main-menu',
  badge: { text: 'New', color: 'red' },
  submenu: [
    { label: 'Dashboard', route: '/plugins/my-plugin/dashboard' },
    { label: 'Settings', route: '/plugins/my-plugin/settings' }
  ]
});

// Settings panel
this.api.ui.registerSettingsPanel({
  id: 'my-plugin-settings',
  title: 'My Plugin Settings',
  description: 'Configure your plugin preferences',
  component: SettingsPanel,
  category: 'plugins',
  icon: 'settings',
  priority: 1
});
```

### Advanced UI Components

```typescript
// Data table with pagination, sorting, and filtering
const DataTableWidget: React.FC<WidgetProps> = ({ api }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });
  const [filters, setFilters] = useState({});
  const [sorting, setSorting] = useState({ field: 'created', order: 'desc' });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.http.get('/api/data', {
        params: { ...pagination, ...filters, ...sorting }
      });
      setData(result.data);
    } catch (error) {
      api.notifications.show({
        type: 'error',
        message: 'Failed to load data'
      });
    } finally {
      setLoading(false);
    }
  }, [pagination, filters, sorting]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="data-table-widget">
      <div className="table-controls">
        <SearchInput
          value={filters.search}
          onChange={(search) => setFilters({ ...filters, search })}
          placeholder="Search..."
        />
        <FilterDropdown
          filters={filters}
          onChange={setFilters}
          options={filterOptions}
        />
      </div>
      
      <Table
        data={data}
        loading={loading}
        sorting={sorting}
        onSort={setSorting}
        columns={[
          { key: 'name', label: 'Name', sortable: true },
          { key: 'status', label: 'Status', sortable: true },
          { key: 'created', label: 'Created', sortable: true }
        ]}
        onRowClick={(row) => api.ui.navigateTo(`/details/${row.id}`)}
      />
      
      <Pagination
        current={pagination.page}
        total={data.total}
        pageSize={pagination.limit}
        onChange={(page) => setPagination({ ...pagination, page })}
      />
    </div>
  );
};
```

### Modal and Dialog Management

```typescript
// Complex modal with form validation
const showUserModal = async (api: PluginAPI, user?: User) => {
  const result = await api.ui.showModal({
    title: user ? 'Edit User' : 'Create User',
    size: 'large',
    component: UserFormModal,
    props: { user },
    buttons: [
      { label: 'Cancel', action: 'cancel' },
      { 
        label: user ? 'Update' : 'Create', 
        action: 'submit', 
        style: 'primary',
        disabled: false // Will be updated based on form validation
      }
    ],
    validation: true,
    onValidation: (isValid) => {
      // Update submit button state based on form validation
      return { submitDisabled: !isValid };
    }
  });

  if (result.action === 'submit') {
    try {
      const userData = result.data;
      if (user) {
        await api.http.put(`/api/users/${user.id}`, userData);
      } else {
        await api.http.post('/api/users', userData);
      }
      
      api.notifications.show({
        type: 'success',
        message: `User ${user ? 'updated' : 'created'} successfully`
      });
      
      return true;
    } catch (error) {
      api.notifications.show({
        type: 'error',
        message: 'Failed to save user'
      });
      return false;
    }
  }
  
  return false;
};
```

## Data Management

### Advanced Storage Patterns

```typescript
class DataManager {
  private api: PluginAPI;
  private cache = new Map();

  constructor(api: PluginAPI) {
    this.api = api;
  }

  // Cached data retrieval with TTL
  async getCachedData<T>(key: string, fetcher: () => Promise<T>, ttl = 300000): Promise<T> {
    const cacheKey = `cache:${key}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    const data = await fetcher();
    this.cache.set(cacheKey, { data, timestamp: Date.now() });
    
    // Also store in persistent storage
    await this.api.storage.set(cacheKey, { data, timestamp: Date.now() }, { ttl });
    
    return data;
  }

  // Optimistic updates
  async updateDataOptimistically<T>(
    key: string, 
    updater: (current: T) => T,
    syncFn: (data: T) => Promise<T>
  ): Promise<T> {
    // Get current data
    const current = await this.api.storage.get<T>(key);
    
    // Apply optimistic update
    const optimistic = updater(current);
    await this.api.storage.set(key, optimistic);
    
    // Emit optimistic update event
    this.api.events.publish('data:updated', { key, data: optimistic, optimistic: true });
    
    try {
      // Sync with server
      const synced = await syncFn(optimistic);
      await this.api.storage.set(key, synced);
      
      // Emit final update
      this.api.events.publish('data:updated', { key, data: synced, optimistic: false });
      
      return synced;
    } catch (error) {
      // Revert optimistic update
      await this.api.storage.set(key, current);
      this.api.events.publish('data:updated', { key, data: current, reverted: true });
      throw error;
    }
  }

  // Bulk operations with progress tracking
  async bulkUpdate<T>(
    items: T[],
    updateFn: (item: T) => Promise<T>,
    options: { batchSize?: number; onProgress?: (progress: number) => void } = {}
  ): Promise<T[]> {
    const { batchSize = 10, onProgress } = options;
    const results: T[] = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(
        batch.map(item => updateFn(item))
      );
      
      results.push(...batchResults);
      
      if (onProgress) {
        const progress = Math.min((i + batchSize) / items.length, 1);
        onProgress(progress);
      }
    }
    
    return results;
  }
}
```

### Data Synchronization

```typescript
class SyncManager {
  private api: PluginAPI;
  private syncQueue: SyncOperation[] = [];
  private isOnline = true;

  constructor(api: PluginAPI) {
    this.api = api;
    this.setupConnectivityHandling();
    this.startSyncWorker();
  }

  // Queue operations for offline sync
  async queueOperation(operation: SyncOperation): Promise<void> {
    operation.id = this.api.utils.generateId();
    operation.timestamp = Date.now();
    
    this.syncQueue.push(operation);
    await this.api.storage.set('sync-queue', this.syncQueue);
    
    if (this.isOnline) {
      await this.processSyncQueue();
    }
  }

  // Process sync queue when online
  private async processSyncQueue(): Promise<void> {
    while (this.syncQueue.length > 0 && this.isOnline) {
      const operation = this.syncQueue[0];
      
      try {
        await this.executeOperation(operation);
        this.syncQueue.shift();
        await this.api.storage.set('sync-queue', this.syncQueue);
      } catch (error) {
        if (this.isRetryableError(error)) {
          // Exponential backoff
          await this.api.utils.delay(Math.pow(2, operation.retries || 0) * 1000);
          operation.retries = (operation.retries || 0) + 1;
          
          if (operation.retries > 5) {
            // Move to failed queue
            this.syncQueue.shift();
            await this.handleFailedOperation(operation, error);
          }
        } else {
          // Non-retryable error
          this.syncQueue.shift();
          await this.handleFailedOperation(operation, error);
        }
      }
    }
  }

  private setupConnectivityHandling(): void {
    // Monitor network connectivity
    this.api.events.subscribe('network:online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    this.api.events.subscribe('network:offline', () => {
      this.isOnline = false;
    });
  }
}
```

## Event Handling

### Complex Event Patterns

```typescript
class EventManager {
  private api: PluginAPI;
  private eventHandlers = new Map();

  constructor(api: PluginAPI) {
    this.api = api;
    this.setupEventHandlers();
  }

  setupEventHandlers(): void {
    // Event aggregation pattern
    this.api.events.subscribe('user:*', (eventName, data) => {
      this.aggregateUserEvents(eventName, data);
    });

    // Event transformation
    this.api.events.subscribe('data:raw', (rawData) => {
      const transformed = this.transformData(rawData);
      this.api.events.publish('data:processed', transformed);
    });

    // Event filtering with conditions
    this.api.events.subscribe('order:created', (order) => {
      if (order.amount > 1000) {
        this.api.events.publish('order:high-value', order);
      }
    }, {
      filter: (order) => order.amount > 1000
    });

    // Debounced event handling
    const debouncedHandler = this.api.utils.debounce((events) => {
      this.handleBatchedEvents(events);
    }, 1000);

    const eventBatch: any[] = [];
    this.api.events.subscribe('search:query', (query) => {
      eventBatch.push(query);
      debouncedHandler(eventBatch.splice(0));
    });
  }

  // Event sourcing pattern
  async recordEvent(eventType: string, data: any, metadata: any = {}): Promise<void> {
    const event = {
      id: this.api.utils.generateId(),
      type: eventType,
      data,
      metadata,
      timestamp: Date.now(),
      pluginId: this.api.context.pluginId
    };

    // Store event in event store
    await this.api.storage.append('event-store', event);
    
    // Publish for real-time handling
    this.api.events.publish(eventType, data);
    
    // Update projections/read models
    await this.updateProjections(event);
  }

  // Replay events for rebuilding state
  async replayEvents(fromTimestamp?: number): Promise<void> {
    const events = await this.api.storage.get('event-store') || [];
    const filteredEvents = fromTimestamp 
      ? events.filter(e => e.timestamp >= fromTimestamp)
      : events;

    for (const event of filteredEvents) {
      await this.handleEvent(event);
    }
  }
}
```

### Event-Driven Architecture

```typescript
// Command pattern with events
class CommandProcessor {
  private api: PluginAPI;

  async executeCommand(command: Command): Promise<any> {
    // Validate command
    await this.validateCommand(command);
    
    // Publish command event
    this.api.events.publish('command:started', { command });
    
    try {
      // Execute command
      const result = await this.processCommand(command);
      
      // Publish success event
      this.api.events.publish('command:completed', { 
        command, 
        result,
        duration: Date.now() - command.timestamp 
      });
      
      return result;
    } catch (error) {
      // Publish error event
      this.api.events.publish('command:failed', { 
        command, 
        error: error.message 
      });
      
      throw error;
    }
  }

  private async processCommand(command: Command): Promise<any> {
    switch (command.type) {
      case 'CREATE_USER':
        return await this.createUser(command.payload);
      case 'UPDATE_USER':
        return await this.updateUser(command.payload);
      case 'DELETE_USER':
        return await this.deleteUser(command.payload);
      default:
        throw new Error(`Unknown command type: ${command.type}`);
    }
  }
}

// Saga pattern for complex workflows
class WorkflowSaga {
  private api: PluginAPI;
  private activeWorkflows = new Map();

  constructor(api: PluginAPI) {
    this.api = api;
    this.setupSagaHandlers();
  }

  setupSagaHandlers(): void {
    this.api.events.subscribe('workflow:start', (workflow) => {
      this.startWorkflow(workflow);
    });

    this.api.events.subscribe('workflow:step-completed', (step) => {
      this.processNextStep(step.workflowId);
    });

    this.api.events.subscribe('workflow:step-failed', (step) => {
      this.handleStepFailure(step.workflowId, step.error);
    });
  }

  async startWorkflow(workflowDefinition: WorkflowDefinition): Promise<string> {
    const workflowId = this.api.utils.generateId();
    const workflow = {
      id: workflowId,
      definition: workflowDefinition,
      currentStep: 0,
      state: {},
      status: 'running',
      startTime: Date.now()
    };

    this.activeWorkflows.set(workflowId, workflow);
    await this.executeStep(workflow);
    
    return workflowId;
  }

  private async executeStep(workflow: Workflow): Promise<void> {
    const currentStep = workflow.definition.steps[workflow.currentStep];
    
    if (!currentStep) {
      // Workflow completed
      workflow.status = 'completed';
      this.api.events.publish('workflow:completed', workflow);
      return;
    }

    try {
      const result = await this.processStep(currentStep, workflow.state);
      workflow.state = { ...workflow.state, ...result };
      workflow.currentStep++;
      
      this.api.events.publish('workflow:step-completed', {
        workflowId: workflow.id,
        step: currentStep,
        result
      });
    } catch (error) {
      this.api.events.publish('workflow:step-failed', {
        workflowId: workflow.id,
        step: currentStep,
        error
      });
    }
  }
}
```

## Security Best Practices

### Input Validation and Sanitization

```typescript
class SecurityManager {
  private api: PluginAPI;

  // Comprehensive input validation
  validateInput(input: any, schema: ValidationSchema): ValidationResult {
    const validator = new InputValidator(schema);
    return validator.validate(input);
  }

  // SQL injection prevention
  async safeQuery(query: string, params: any[]): Promise<any> {
    // Use parameterized queries only
    const sanitizedParams = params.map(param => 
      this.api.utils.sanitize(param)
    );
    
    return await this.api.database.query(query, sanitizedParams);
  }

  // XSS prevention
  sanitizeHtml(html: string): string {
    return this.api.utils.sanitizeHtml(html, {
      allowedTags: ['p', 'br', 'strong', 'em'],
      allowedAttributes: {}
    });
  }

  // CSRF protection
  async createCsrfToken(): Promise<string> {
    const token = this.api.utils.generateSecureToken();
    await this.api.storage.setSecure('csrf-token', token, { ttl: 3600000 });
    return token;
  }

  async validateCsrfToken(token: string): Promise<boolean> {
    const storedToken = await this.api.storage.getSecure('csrf-token');
    return storedToken === token;
  }

  // Rate limiting
  async checkRateLimit(userId: string, action: string): Promise<boolean> {
    const key = `rate-limit:${userId}:${action}`;
    const current = await this.api.storage.get(key) || 0;
    
    if (current >= this.getRateLimit(action)) {
      return false;
    }
    
    await this.api.storage.set(key, current + 1, { ttl: 60000 });
    return true;
  }

  private getRateLimit(action: string): number {
    const limits = {
      'api-call': 100,
      'login': 5,
      'password-reset': 3
    };
    return limits[action] || 10;
  }
}
```

### Secure Data Handling

```typescript
class SecureDataManager {
  private api: PluginAPI;

  // Encrypt sensitive data before storage
  async storeSecureData(key: string, data: any): Promise<void> {
    const encrypted = await this.api.crypto.encrypt(JSON.stringify(data));
    await this.api.storage.setSecure(key, encrypted);
  }

  async getSecureData(key: string): Promise<any> {
    const encrypted = await this.api.storage.getSecure(key);
    if (!encrypted) return null;
    
    const decrypted = await this.api.crypto.decrypt(encrypted);
    return JSON.parse(decrypted);
  }

  // Secure API key management
  async rotateApiKey(): Promise<string> {
    const newKey = this.api.utils.generateApiKey();
    const oldKey = await this.getSecureData('api-key');
    
    // Store new key
    await this.storeSecureData('api-key', newKey);
    
    // Invalidate old key after grace period
    setTimeout(async () => {
      await this.invalidateApiKey(oldKey);
    }, 300000); // 5 minutes grace period
    
    return newKey;
  }

  // Audit logging
  async logSecurityEvent(event: SecurityEvent): Promise<void> {
    const auditEntry = {
      timestamp: Date.now(),
      event: event.type,
      userId: event.userId,
      ip: event.ip,
      userAgent: event.userAgent,
      details: event.details,
      pluginId: this.api.context.pluginId
    };

    await this.api.storage.append('security-audit', auditEntry);
    
    // Alert on critical events
    if (event.type === 'UNAUTHORIZED_ACCESS' || event.type === 'SUSPICIOUS_ACTIVITY') {
      this.api.notifications.show({
        type: 'warning',
        title: 'Security Alert',
        message: `Security event detected: ${event.type}`,
        persistent: true
      });
    }
  }
}
```

## Testing

### Comprehensive Testing Strategy

```typescript
// Unit tests
describe('DataService', () => {
  let dataService: DataService;
  let mockAPI: jest.Mocked<PluginAPI>;

  beforeEach(() => {
    mockAPI = createMockAPI();
    dataService = new DataService(mockAPI);
  });

  describe('getUserData', () => {
    it('should fetch user data successfully', async () => {
      const mockUserData = { id: '123', name: 'John Doe' };
      mockAPI.http.get.mockResolvedValue({ data: mockUserData });

      const result = await dataService.getUserData('123');

      expect(mockAPI.http.get).toHaveBeenCalledWith('/api/users/123');
      expect(result).toEqual(mockUserData);
    });

    it('should handle network errors gracefully', async () => {
      mockAPI.http.get.mockRejectedValue(new Error('Network error'));

      await expect(dataService.getUserData('123')).rejects.toThrow('Network error');
      expect(mockAPI.notifications.show).toHaveBeenCalledWith({
        type: 'error',
        message: 'Failed to fetch user data'
      });
    });

    it('should cache successful responses', async () => {
      const mockUserData = { id: '123', name: 'John Doe' };
      mockAPI.http.get.mockResolvedValue({ data: mockUserData });

      // First call
      await dataService.getUserData('123');
      // Second call
      await dataService.getUserData('123');

      expect(mockAPI.http.get).toHaveBeenCalledTimes(1);
      expect(mockAPI.storage.get).toHaveBeenCalledWith('cache:user:123');
    });
  });
});

// Integration tests
describe('Plugin Integration', () => {
  let testEnvironment: PluginTestEnvironment;
  let plugin: MyPlugin;

  beforeEach(async () => {
    testEnvironment = new PluginTestEnvironment();
    await testEnvironment.setup();
    
    plugin = await testEnvironment.loadPlugin('./dist/my-plugin');
  });

  afterEach(async () => {
    await testEnvironment.cleanup();
  });

  it('should register UI components on activation', async () => {
    await plugin.activate();

    const widgets = testEnvironment.getRegisteredWidgets();
    expect(widgets).toHaveLength(1);
    expect(widgets[0].id).toBe('my-widget');
  });

  it('should handle events from other plugins', async () => {
    await plugin.activate();

    testEnvironment.emitEvent('data:updated', { type: 'user', id: '123' });

    // Wait for event processing
    await testEnvironment.waitForEventProcessing();

    const notifications = testEnvironment.getNotifications();
    expect(notifications).toContainEqual(
      expect.objectContaining({
        type: 'info',
        message: 'Data updated'
      })
    );
  });
});

// E2E tests using Playwright
describe('Plugin E2E Tests', () => {
  let browser: Browser;
  let page: Page;

  beforeAll(async () => {
    browser = await chromium.launch();
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto('http://localhost:3000');
    await page.waitForSelector('[data-testid="app-loaded"]');
  });

  afterEach(async () => {
    await page.close();
  });

  it('should display plugin widget on dashboard', async () => {
    // Navigate to dashboard
    await page.click('[data-testid="dashboard-nav"]');
    
    // Wait for widget to load
    await page.waitForSelector('[data-testid="my-widget"]');
    
    // Verify widget content
    const widgetTitle = await page.textContent('[data-testid="my-widget"] h3');
    expect(widgetTitle).toBe('Hello from My Plugin!');
  });

  it('should handle user interactions correctly', async () => {
    await page.click('[data-testid="dashboard-nav"]');
    await page.waitForSelector('[data-testid="my-widget"]');
    
    // Click the widget button
    await page.click('[data-testid="my-widget"] button');
    
    // Verify notification appears
    await page.waitForSelector('[data-testid="notification"]');
    const notificationText = await page.textContent('[data-testid="notification"]');
    expect(notificationText).toContain('Button clicked 1 times!');
  });
});
```

### Test Utilities and Mocks

```typescript
// Mock API factory
export function createMockAPI(): jest.Mocked<PluginAPI> {
  return {
    ui: {
      registerDashboardWidget: jest.fn(),
      registerMenuItem: jest.fn(),
      showModal: jest.fn(),
      navigateTo: jest.fn(),
      unregisterAll: jest.fn()
    },
    storage: {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      has: jest.fn(),
      keys: jest.fn(),
      clear: jest.fn(),
      watch: jest.fn(),
      transaction: jest.fn()
    },
    events: {
      publish: jest.fn(),
      subscribe: jest.fn(),
      unsubscribe: jest.fn(),
      once: jest.fn()
    },
    notifications: {
      show: jest.fn(),
      showProgress: jest.fn(),
      updateProgress: jest.fn(),
      complete: jest.fn()
    },
    http: {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      request: jest.fn()
    },
    settings: {
      get: jest.fn(),
      set: jest.fn(),
      getAll: jest.fn(),
      watch: jest.fn(),
      validate: jest.fn()
    },
    utils: {
      formatDate: jest.fn(),
      validate: jest.fn(),
      debounce: jest.fn((fn) => fn),
      throttle: jest.fn((fn) => fn),
      generateId: jest.fn(() => 'mock-id'),
      retry: jest.fn()
    }
  } as any;
}

// Test environment setup
export class PluginTestEnvironment {
  private plugins = new Map();
  private widgets: any[] = [];
  private notifications: any[] = [];
  private events: any[] = [];

  async setup(): Promise<void> {
    // Initialize test database
    await this.setupTestDatabase();
    
    // Create mock services
    this.setupMockServices();
  }

  async loadPlugin(pluginPath: string): Promise<any> {
    const PluginClass = require(pluginPath).default;
    const mockAPI = this.createTestAPI();
    const mockContext = {
      pluginId: 'test-plugin',
      version: '1.0.0',
      name: 'Test Plugin',
      permissions: ['ui', 'storage', 'events'],
      config: {}
    };

    const plugin = new PluginClass(mockAPI, mockContext);
    this.plugins.set('test-plugin', plugin);
    
    return plugin;
  }

  getRegisteredWidgets(): any[] {
    return this.widgets;
  }

  getNotifications(): any[] {
    return this.notifications;
  }

  emitEvent(eventName: string, data: any): void {
    this.events.push({ eventName, data, timestamp: Date.now() });
    // Trigger event handlers
    this.processEvents();
  }

  async waitForEventProcessing(): Promise<void> {
    // Wait for all async event handlers to complete
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}
```

## Performance Optimization

### Code Splitting and Lazy Loading

```typescript
// Dynamic component loading
const LazyDashboardWidget = React.lazy(() => 
  import('./components/DashboardWidget').then(module => ({
    default: module.DashboardWidget
  }))
);

// Route-based code splitting
const LazySettingsPanel = React.lazy(() => 
  import('./components/SettingsPanel')
);

// Conditional loading based on features
class PerformantPlugin {
  private api: PluginAPI;
  private loadedModules = new Map();

  async loadModule(moduleName: string): Promise<any> {
    if (this.loadedModules.has(moduleName)) {
      return this.loadedModules.get(moduleName);
    }

    let module;
    switch (moduleName) {
      case 'analytics':
        module = await import('./modules/analytics');
        break;
      case 'reporting':
        module = await import('./modules/reporting');
        break;
      case 'charts':
        module = await import('./modules/charts');
        break;
      default:
        throw new Error(`Unknown module: ${moduleName}`);
    }

    this.loadedModules.set(moduleName, module);
    return module;
  }

  // Load modules based on user permissions
  async activateWithPermissions(): Promise<void> {
    const permissions = this.api.context.permissions;

    if (permissions.includes('analytics')) {
      await this.loadModule('analytics');
    }

    if (permissions.includes('reporting')) {
      await this.loadModule('reporting');
    }

    // Only load charts if user has data visualization permission
    if (permissions.includes('data:visualize')) {
      await this.loadModule('charts');
    }
  }
}
```

### Memory Management and Optimization

```typescript
class OptimizedDataManager {
  private api: PluginAPI;
  private cache = new LRUCache<string, any>(100); // Limited cache size
  private subscriptions = new Set<() => void>();
  private intervals = new Set<NodeJS.Timeout>();

  constructor(api: PluginAPI) {
    this.api = api;
    this.setupMemoryMonitoring();
  }

  // Efficient data loading with pagination
  async loadDataPage(page: number, pageSize: number = 50): Promise<any[]> {
    const cacheKey = `data:page:${page}:${pageSize}`;
    
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const data = await this.api.http.get('/api/data', {
      params: { page, limit: pageSize }
    });

    this.cache.set(cacheKey, data);
    return data;
  }

  // Virtual scrolling for large datasets
  createVirtualList(items: any[], itemHeight: number): VirtualListConfig {
    return {
      totalItems: items.length,
      itemHeight,
      containerHeight: 400,
      overscan: 5,
      getItem: (index: number) => items[index],
      renderItem: (item: any, index: number) => this.renderListItem(item, index)
    };
  }

  // Debounced search with request deduplication
  private searchRequests = new Map<string, Promise<any>>();

  async searchData(query: string): Promise<any[]> {
    if (this.searchRequests.has(query)) {
      return this.searchRequests.get(query);
    }

    const searchPromise = this.api.http.get('/api/search', {
      params: { q: query }
    }).finally(() => {
      this.searchRequests.delete(query);
    });

    this.searchRequests.set(query, searchPromise);
    return searchPromise;
  }

  // Memory monitoring and cleanup
  private setupMemoryMonitoring(): void {
    const interval = setInterval(() => {
      this.performMemoryCleanup();
    }, 60000); // Every minute

    this.intervals.add(interval);
  }

  private performMemoryCleanup(): void {
    // Clear expired cache entries
    this.cache.prune();

    // Clear old search requests
    this.searchRequests.clear();

    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  }

  // Cleanup on deactivation
  async cleanup(): Promise<void> {
    // Unsubscribe from all events
    this.subscriptions.forEach(unsubscribe => unsubscribe());
    this.subscriptions.clear();

    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals.clear();

    // Clear cache
    this.cache.clear();

    // Cancel pending requests
    this.searchRequests.clear();
  }
}
```

### Performance Monitoring

```typescript
class PerformanceMonitor {
  private api: PluginAPI;
  private metrics = new Map<string, PerformanceMetric>();

  constructor(api: PluginAPI) {
    this.api = api;
    this.setupPerformanceTracking();
  }

  // Track function execution time
  async trackPerformance<T>(
    operation: string, 
    fn: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now();
    const startMemory = this.getMemoryUsage();

    try {
      const result = await fn();
      this.recordMetric(operation, startTime, startMemory, true);
      return result;
    } catch (error) {
      this.recordMetric(operation, startTime, startMemory, false);
      throw error;
    }
  }

  // Monitor component render performance
  trackComponentRender(componentName: string, renderTime: number): void {
    const metric = this.metrics.get(`render:${componentName}`) || {
      count: 0,
      totalTime: 0,
      averageTime: 0,
      maxTime: 0,
      minTime: Infinity
    };

    metric.count++;
    metric.totalTime += renderTime;
    metric.averageTime = metric.totalTime / metric.count;
    metric.maxTime = Math.max(metric.maxTime, renderTime);
    metric.minTime = Math.min(metric.minTime, renderTime);

    this.metrics.set(`render:${componentName}`, metric);

    // Alert on slow renders
    if (renderTime > 100) {
      console.warn(`Slow render detected: ${componentName} took ${renderTime}ms`);
    }
  }

  // Generate performance report
  generateReport(): PerformanceReport {
    const report: PerformanceReport = {
      timestamp: Date.now(),
      metrics: Object.fromEntries(this.metrics),
      memoryUsage: this.getMemoryUsage(),
      recommendations: this.generateRecommendations()
    };

    return report;
  }

  private recordMetric(
    operation: string, 
    startTime: number, 
    startMemory: number, 
    success: boolean
  ): void {
    const endTime = performance.now();
    const endMemory = this.getMemoryUsage();
    
    const duration = endTime - startTime;
    const memoryDelta = endMemory - startMemory;

    const metric = this.metrics.get(operation) || {
      count: 0,
      successCount: 0,
      totalTime: 0,
      averageTime: 0,
      maxTime: 0,
      minTime: Infinity,
      memoryDelta: 0
    };

    metric.count++;
    if (success) metric.successCount++;
    metric.totalTime += duration;
    metric.averageTime = metric.totalTime / metric.count;
    metric.maxTime = Math.max(metric.maxTime, duration);
    metric.minTime = Math.min(metric.minTime, duration);
    metric.memoryDelta += memoryDelta;

    this.metrics.set(operation, metric);

    // Send telemetry for slow operations
    if (duration > 1000) {
      this.api.events.publish('performance:slow-operation', {
        operation,
        duration,
        memoryDelta
      });
    }
  }

  private getMemoryUsage(): number {
    return performance.memory?.usedJSHeapSize || 0;
  }

  private generateRecommendations(): string[] {
    const recommendations: string[] = [];

    // Check for slow operations
    for (const [operation, metric] of this.metrics) {
      if (metric.averageTime > 500) {
        recommendations.push(`Consider optimizing ${operation} (avg: ${metric.averageTime.toFixed(2)}ms)`);
      }
      
      if (metric.memoryDelta > 1024 * 1024) {
        recommendations.push(`${operation} is using significant memory (${(metric.memoryDelta / 1024 / 1024).toFixed(2)}MB)`);
      }
    }

    return recommendations;
  }
}
```

## Publishing

### Package Configuration

```json
// package.json for publishing
{
  "name": "@yourorg/neutral-app-plugin-awesome",
  "version": "1.0.0",
  "description": "An awesome plugin for NeutralApp",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist/",
    "manifest.json",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "build": "webpack --mode=production",
    "dev": "webpack --mode=development --watch",
    "test": "jest",
    "test:e2e": "playwright test",
    "lint": "eslint src/**/*.ts",
    "type-check": "tsc --noEmit",
    "prepublishOnly": "npm run test && npm run build",
    "package": "neutral-app package"
  },
  "keywords": [
    "neutral-app",
    "plugin",
    "productivity",
    "dashboard"
  ],
  "author": "Your Name <your.email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/yourorg/neutral-app-plugin-awesome.git"
  },
  "bugs": {
    "url": "https://github.com/yourorg/neutral-app-plugin-awesome/issues"
  },
  "homepage": "https://github.com/yourorg/neutral-app-plugin-awesome#readme",
  "peerDependencies": {
    "@neutral-app/plugin-api": "^1.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@neutral-app/plugin-testing": "^1.0.0",
    "@types/react": "^18.0.0",
    "typescript": "^4.9.0",
    "webpack": "^5.0.0",
    "jest": "^29.0.0",
    "playwright": "^1.0.0"
  },
  "neutralApp": {
    "minVersion": "1.0.0",
    "maxVersion": "2.0.0",
    "category": "productivity",
    "tags": ["dashboard", "widgets", "analytics"]
  }
}
```

### Deployment and Distribution

```bash
# Build for production
npm run build

# Run quality checks
npm run lint
npm run type-check
npm run test

# Package the plugin
npm run package

# Publish to npm registry
npm publish

# Publish to NeutralApp plugin registry
neutral-app publish

# Create GitHub release
gh release create v1.0.0 dist/my-awesome-plugin.zip \
  --title "My Awesome Plugin v1.0.0" \
  --notes "Initial release with dashboard widget and analytics features"
```

### Plugin Registry Submission

```yaml
# .neutral-app/plugin.yml
name: my-awesome-plugin
displayName: "My Awesome Plugin"
description: "A comprehensive plugin demonstrating best practices"
category: productivity
tags:
  - dashboard
  - analytics
  - widgets
version: 1.0.0
author:
  name: "Your Name"
  email: "your.email@example.com"
  url: "https://yourwebsite.com"
license: MIT
repository: "https://github.com/yourorg/neutral-app-plugin-awesome"
homepage: "https://yourplugin.com"
documentation: "https://docs.yourplugin.com"
support: "https://support.yourplugin.com"
screenshots:
  - url: "https://yourplugin.com/screenshots/dashboard.png"
    caption: "Dashboard widget showing analytics"
  - url: "https://yourplugin.com/screenshots/settings.png"
    caption: "Plugin settings panel"
pricing:
  model: "freemium"
  free_tier:
    description: "Basic features with limited usage"
    limits:
      api_calls: 1000
      storage: "10MB"
  paid_tier:
    price: "$9.99/month"
    description: "Unlimited usage with premium features"
compatibility:
  neutral_app: "^1.0.0"
  node: ">=16.0.0"
  platforms:
    - web
    - desktop
    - mobile
```

This comprehensive guide covers all aspects of plugin development for NeutralApp. For more specific examples and advanced patterns, refer to our [example plugins repository](https://github.com/neutral-app/plugin-examples) and [API documentation](./api-reference.md). 