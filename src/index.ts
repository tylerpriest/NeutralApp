// NeutralApp Main Entry Point - Feature-Based Architecture

// Shared Infrastructure (exported first to avoid conflicts)
export * from './shared';
// TODO: Add core exports when event bus and DI are implemented
// export * from './core';

// Feature Module Service Exports (avoiding interface conflicts with shared types)
export { 
  NextAuthService,
  AuthFeature
} from './features/auth';

export { 
  PluginManager, 
  DependencyResolver,
  PluginEventBus,
  PluginStorageManager,
  PluginHealthMonitor,
  PluginVerifier,
  PluginTestManager,
  TestRunner,
  ContinuousTestingService
} from './features/plugin-manager';

export {
  NavigationManager,
  LayoutManager,
  DashboardManager,
  WidgetRegistry
} from './features/ui-shell';

export {
  SettingsService
} from './features/settings';

export {
  AdminDashboard,
  UserManager,
  SystemMonitor,
  SystemReportGenerator
} from './features/admin';

export {
  LoggingService,
  ErrorRecoveryService
} from './features/error-reporter';

// Main application class (to be implemented)
export class NeutralApp {
  constructor() {
    // TODO: Initialize core services
  }

  async initialize(): Promise<void> {
    // TODO: Initialize application
    console.log('NeutralApp initializing...');
  }

  async start(): Promise<void> {
    // TODO: Start application
    console.log('NeutralApp starting...');
  }
} 