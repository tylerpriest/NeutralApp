// Plugin Manager Feature Exports
export * from './interfaces/plugin.interface';
export * from './interfaces/testing.interface';
export * from './services/plugin.manager';
export * from './services/dependency.resolver';
export * from './services/plugin.event.bus';
export * from './services/plugin.storage.manager';
export * from './services/plugin.health.monitor';
export * from './services/plugin.verifier';
// Export services with specific names to avoid conflicts with interfaces
export { PluginTestManager } from './services/plugin-test-manager.service';
export { TestRunner } from './services/test-runner.service';
export { ContinuousTestingService } from './services/continuous-testing.service'; 