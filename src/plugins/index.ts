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
    plugins: []
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