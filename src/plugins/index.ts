/**
 * Plugins Module - Industry Standard Plugin Architecture
 * 
 * This module follows industry best practices for plugin organization:
 * - Plugins are separate from the plugin manager
 * - Each plugin is self-contained in its own directory
 * - Clear separation of concerns
 * - Standardized plugin structure
 */

// Plugin Info Interface
export interface PluginRegistryInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  entryPoint: string;
  manifest: string;
  category: string;
  tags: string[];
}

// Plugin Registry - Central registry of all available plugins
export const PLUGIN_REGISTRY: Record<string, PluginRegistryInfo> = {
  'demo-hello-world': {
    id: 'demo-hello-world',
    name: 'Hello World Demo',
    version: '1.0.0',
    description: 'A simple demo plugin to validate the plugin system',
    author: 'NeutralApp Team',
    entryPoint: './demo-hello-world/demo-hello-world.js',
    manifest: './demo-hello-world/manifest.json',
    category: 'demo',
    tags: ['demo', 'hello-world', 'reference']
  },
  'weather-widget': {
    id: 'weather-widget',
    name: 'Weather Widget',
    version: '2.1.0',
    description: 'Display current weather information in your dashboard.',
    author: 'Weather Corp',
    entryPoint: './weather-widget/index.js',
    manifest: './weather-widget/manifest.json',
    category: 'utility',
    tags: ['weather', 'widget', 'dashboard']
  },
  'task-manager': {
    id: 'task-manager',
    name: 'Task Manager',
    version: '1.5.2',
    description: 'Organize and track your tasks with a beautiful interface.',
    author: 'Productivity Inc',
    entryPoint: './task-manager/index.js',
    manifest: './task-manager/manifest.json',
    category: 'utility',
    tags: ['tasks', 'productivity', 'management']
  },
  'reading-core': {
    id: 'reading-core',
    name: 'Reading Core',
    version: '1.0.0',
    description: 'Provides comprehensive book library management with metadata handling, categories, search functionality, and cross-plugin communication APIs',
    author: 'NeutralApp Team',
    entryPoint: './reading-core/index.js',
    manifest: './reading-core/manifest.json',
    category: 'reading',
    tags: ['reading', 'books', 'library', 'core']
  },
  'reading-ui': {
    id: 'reading-ui',
    name: 'Reading UI',
    version: '1.0.0',
    description: 'User interface components for reading and book management',
    author: 'NeutralApp Team',
    entryPoint: './reading-ui/index.js',
    manifest: './reading-ui/manifest.json',
    category: 'reading',
    tags: ['reading', 'ui', 'interface']
  },
  'reading-persistence': {
    id: 'reading-persistence',
    name: 'Reading Persistence',
    version: '1.0.0',
    description: 'Data persistence layer for reading progress and book storage',
    author: 'NeutralApp Team',
    entryPoint: './reading-persistence/index.js',
    manifest: './reading-persistence/manifest.json',
    category: 'reading',
    tags: ['reading', 'persistence', 'storage']
  }
};

// Plugin Category Interface
export interface PluginCategoryInfo {
  name: string;
  description: string;
  plugins: string[];
}

// Plugin Categories
export const PLUGIN_CATEGORIES: Record<string, PluginCategoryInfo> = {
  demo: {
    name: 'Demo Plugins',
    description: 'Demonstration and reference plugins',
    plugins: ['demo-hello-world']
  },
  utility: {
    name: 'Utility Plugins',
    description: 'Utility and helper plugins',
    plugins: ['weather-widget', 'task-manager']
  },
  reading: {
    name: 'Reading Plugins',
    description: 'Book management and reading experience plugins',
    plugins: ['reading-core', 'reading-ui', 'reading-persistence']
  },
  integration: {
    name: 'Integration Plugins',
    description: 'Third-party service integrations',
    plugins: []
  }
};

// Plugin Discovery
export function discoverPlugins(): string[] {
  return Object.keys(PLUGIN_REGISTRY);
}

// Plugin Information
export function getPluginInfo(pluginId: string) {
  return PLUGIN_REGISTRY[pluginId];
}

// Plugin Categories
export function getPluginsByCategory(category: string): string[] {
  const categoryInfo = PLUGIN_CATEGORIES[category];
  return categoryInfo ? categoryInfo.plugins : [];
}

// Plugin Validation
export function validatePlugin(pluginId: string): boolean {
  const plugin = PLUGIN_REGISTRY[pluginId];
  return plugin !== undefined;
}

// Export individual plugins for direct access
export { default as DemoHelloWorldPlugin } from './demo-hello-world'; 