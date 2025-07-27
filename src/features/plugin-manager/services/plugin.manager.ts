import { IPluginManager } from '../interfaces/plugin.interface';
import { PluginInfo, PluginPackage, InstallResult, PluginDependency, PluginStatus, DashboardWidget } from '../../../shared';
import { PLUGIN_REGISTRY, discoverPlugins, getPluginInfo, validatePlugin } from '../../../plugins';
import * as fs from 'fs';
import * as path from 'path';

export class PluginManager implements IPluginManager {
  private dependencyResolver: any;
  private pluginVerifier: any;
  private pluginRegistry: any;
  private pluginSandbox: any;
  private installedPlugins: Map<string, PluginInfo> = new Map();
  private readonly persistenceFile: string;
  private dashboardManager: any; // Will be injected

  constructor(dashboardManager?: any) {
    // Initialize persistence file path
    this.persistenceFile = path.join(process.cwd(), 'data', 'installed-plugins.json');
    
    // Set dashboard manager if provided
    this.dashboardManager = dashboardManager;
    
    // Initialize plugin management components
    this.initializeComponents();
    
    // Load persisted plugins on startup
    this.loadPersistedPlugins();
  }

  private initializeComponents(): void {
    // These will be properly injected or initialized
    // For now, provide basic implementations
    this.dependencyResolver = {
      resolveDependencies: async (pluginId: string) => [],
      checkDependencyConflicts: async (dependencies: PluginDependency[]) => [],
      getInstallOrder: async (dependencies: PluginDependency[]) => []
    };

    this.pluginVerifier = {
      verifyPluginSignature: async (pluginPackage: PluginPackage) => true,
      validatePluginManifest: async (manifest: any) => ({ isValid: true, errors: [] }),
      checkSecurityCompliance: async (pluginPackage: PluginPackage) => ({ isCompliant: true, violations: [] })
    };

    this.pluginRegistry = {
      getAvailablePlugins: async () => [],
      getInstalledPlugins: async () => Array.from(this.installedPlugins.values()),
      addInstalledPlugin: async (plugin: PluginInfo) => {
        this.installedPlugins.set(plugin.id, plugin);
      },
      removeInstalledPlugin: async (pluginId: string, cleanupData?: boolean) => {
        this.installedPlugins.delete(pluginId);
      },
      updatePluginStatus: async (pluginId: string, status: PluginStatus) => {
        const plugin = this.installedPlugins.get(pluginId);
        if (plugin) {
          plugin.status = status;
          this.installedPlugins.set(pluginId, plugin);
        }
      }
    };
  }

  async getAvailablePlugins(): Promise<PluginInfo[]> {
    try {
      // Get plugins from the modular plugin registry
      const availablePluginIds = discoverPlugins();
      const plugins: PluginInfo[] = [];

      for (const pluginId of availablePluginIds) {
        const pluginInfo = getPluginInfo(pluginId);
        if (pluginInfo) {
          plugins.push({
            id: pluginInfo.id,
            name: pluginInfo.name,
            version: pluginInfo.version,
            description: pluginInfo.description,
            author: pluginInfo.author,
            rating: 0,
            downloads: 0,
            dependencies: [],
            permissions: [],
            status: PluginStatus.AVAILABLE
          });
        }
      }

      return plugins;
    } catch (error) {
      console.error('Error fetching available plugins:', error);
      return [];
    }
  }

  async installPlugin(pluginPackage: PluginPackage): Promise<InstallResult> {
    try {
      // Step 1: Verify plugin signature
      const signatureValid = await this.pluginVerifier.verifyPluginSignature(pluginPackage);
      if (!signatureValid) {
        return {
          success: false,
          pluginId: pluginPackage.id,
          error: 'Invalid plugin signature'
        };
      }

      // Step 2: Validate plugin manifest
      const manifestValidation = await this.pluginVerifier.validatePluginManifest(pluginPackage.manifest);
      if (!manifestValidation.isValid) {
        return {
          success: false,
          pluginId: pluginPackage.id,
          error: `Invalid plugin manifest: ${manifestValidation.errors.join(', ')}`
        };
      }

      // Step 3: Check security compliance
      const securityCheck = await this.pluginVerifier.checkSecurityCompliance(pluginPackage);
      if (!securityCheck.isCompliant) {
        return {
          success: false,
          pluginId: pluginPackage.id,
          error: `Security compliance violations: ${securityCheck.violations.join(', ')}`
        };
      }

      // Step 4: Resolve and install dependencies
      const dependencies = await this.dependencyResolver.resolveDependencies(pluginPackage.id);
      const dependencyIds = dependencies.map((dep: PluginDependency) => dep.id);

      // Step 5: Register plugin as installed
      const pluginInfo: PluginInfo = {
        id: pluginPackage.id,
        name: pluginPackage.manifest.name,
        version: pluginPackage.version,
        description: pluginPackage.manifest.description,
        author: pluginPackage.manifest.author,
        rating: 0, // Will be set by registry
        downloads: 0, // Will be set by registry
        dependencies: dependencies,
        permissions: pluginPackage.manifest.permissions,
        status: PluginStatus.INSTALLED
      };

      await this.pluginRegistry.addInstalledPlugin(pluginInfo);

      // Register widgets for the newly installed plugin
      this.registerPluginWidgets(pluginInfo);

      return {
        success: true,
        pluginId: pluginPackage.id,
        dependenciesInstalled: dependencyIds
      };
    } catch (error) {
      return {
        success: false,
        pluginId: pluginPackage.id,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  async enablePlugin(pluginId: string): Promise<void> {
    try {
      await this.pluginRegistry.updatePluginStatus(pluginId, PluginStatus.ENABLED);
      
      // Create widgets for the activated plugin
      await this.createWidgetsForActivatedPlugin(pluginId);
      
      // TODO: Load plugin into sandbox and initialize
      console.log(`Plugin ${pluginId} enabled successfully`);
    } catch (error) {
      console.error(`Failed to enable plugin ${pluginId}:`, error);
      throw error;
    }
  }

  async disablePlugin(pluginId: string): Promise<void> {
    try {
      await this.pluginRegistry.updatePluginStatus(pluginId, PluginStatus.DISABLED);
      
      // TODO: Unload plugin from sandbox
      console.log(`Plugin ${pluginId} disabled successfully`);
    } catch (error) {
      console.error(`Failed to disable plugin ${pluginId}:`, error);
      throw error;
    }
  }

  async uninstallPlugin(pluginId: string, cleanupData?: boolean): Promise<void> {
    try {
      // TODO: Check for dependent plugins
      
      // Remove from sandbox if loaded
      // TODO: Unload from sandbox
      
      // Unregister widgets for the plugin before removing from registry
      if (this.dashboardManager) {
        this.dashboardManager.handlePluginUninstall(pluginId);
      }
      
      // Remove from registry
      await this.pluginRegistry.removeInstalledPlugin(pluginId, cleanupData || false);
      
      console.log(`Plugin ${pluginId} uninstalled successfully`);
    } catch (error) {
      console.error(`Failed to uninstall plugin ${pluginId}:`, error);
      throw error;
    }
  }

  async getInstalledPlugins(): Promise<PluginInfo[]> {
    try {
      return await this.pluginRegistry.getInstalledPlugins();
    } catch (error) {
      console.error('Error fetching installed plugins:', error);
      return [];
    }
  }

  async resolveDependencies(pluginId: string): Promise<PluginDependency[]> {
    try {
      return await this.dependencyResolver.resolveDependencies(pluginId);
    } catch (error) {
      console.error(`Error resolving dependencies for ${pluginId}:`, error);
      return [];
    }
  }

  async downloadAndVerifyPlugin(pluginId: string): Promise<PluginPackage> {
    try {
      // Validate plugin exists in modular registry
      if (!validatePlugin(pluginId)) {
        throw new Error(`Plugin ${pluginId} not found in registry`);
      }

      // Get plugin info from modular registry
      const pluginInfo = getPluginInfo(pluginId);
      if (!pluginInfo) {
        throw new Error(`Plugin ${pluginId} information not available`);
      }

      // Create plugin package from modular registry
      const pluginPackage: PluginPackage = {
        id: pluginInfo.id,
        version: pluginInfo.version,
        code: `// Plugin loaded from modular registry: ${pluginId}`,
        manifest: {
          id: pluginInfo.id,
          name: pluginInfo.name,
          version: pluginInfo.version,
          description: pluginInfo.description,
          author: pluginInfo.author,
          main: pluginInfo.entryPoint,
          dependencies: [],
          permissions: [],
          api: []
        },
        signature: `modular-registry-${pluginId}`
      };

      // Verify the plugin package
      const signatureValid = await this.pluginVerifier.verifyPluginSignature(pluginPackage);
      if (!signatureValid) {
        throw new Error('Plugin verification failed: Invalid signature');
      }

      return pluginPackage;
    } catch (error) {
      console.error(`Failed to download and verify plugin ${pluginId}:`, error);
      throw error;
    }
  }

  handlePluginFailure(pluginId: string, error: Error): void {
    console.error(`Plugin ${pluginId} failed:`, error);
    
    // Set plugin status to error
    this.pluginRegistry.updatePluginStatus(pluginId, PluginStatus.ERROR)
      .catch((updateError: Error) => {
        console.error(`Failed to update status for failed plugin ${pluginId}:`, updateError);
      });

    // TODO: Notify admin dashboard
    // TODO: Attempt recovery or suggest remediation
  }

  private async downloadFromRegistry(pluginId: string): Promise<PluginPackage> {
    // TODO: Implement actual download logic
    // For now, return a mock package
    return {
      id: pluginId,
      version: '1.0.0',
      code: 'mock plugin code',
      manifest: {
        id: pluginId,
        name: 'Mock Plugin',
        version: '1.0.0',
        description: 'A mock plugin for testing',
        author: 'Mock Author',
        main: 'index.js',
        dependencies: [],
        permissions: [],
        api: []
      },
      signature: 'mock-signature'
    };
  }

  private async loadPersistedPlugins(): Promise<void> {
    try {
      if (fs.existsSync(this.persistenceFile)) {
        const data = fs.readFileSync(this.persistenceFile, 'utf8');
        const persistedPlugins: PluginInfo[] = JSON.parse(data);
        for (const plugin of persistedPlugins) {
          await this.pluginRegistry.addInstalledPlugin(plugin);
          // Register widgets for persisted plugins if dashboard manager is available
          if (this.dashboardManager && plugin.status === PluginStatus.ENABLED) {
            this.registerPluginWidgets(plugin);
          }
        }
        console.log(`Loaded ${persistedPlugins.length} persisted plugins.`);
      } else {
        console.log('No persisted plugins found.');
      }
    } catch (error) {
      console.error('Error loading persisted plugins:', error);
    }
  }

  private async savePersistedPlugins(): Promise<void> {
    try {
      const data = JSON.stringify(Array.from(this.installedPlugins.values()), null, 2);
      fs.writeFileSync(this.persistenceFile, data);
      console.log('Persisted installed plugins to:', this.persistenceFile);
    } catch (error) {
      console.error('Error saving persisted plugins:', error);
    }
  }

  private registerPluginWidgets(plugin: PluginInfo): void {
    if (!this.dashboardManager) {
      console.warn('DashboardManager not available for widget registration');
      return;
    }

    try {
      // Create default widget for the plugin
      const widget: DashboardWidget = {
        id: `${plugin.id}-widget`,
        pluginId: plugin.id,
        title: `${plugin.name} Widget`,
        component: `${plugin.name}Component`,
        size: { width: 4, height: 3, minWidth: 2, minHeight: 2 },
        permissions: plugin.permissions.map(p => p.name)
      };

      this.dashboardManager.registerWidget(widget);
      console.log(`Registered widget for plugin: ${plugin.id}`);
    } catch (error) {
      console.error(`Failed to register widget for plugin ${plugin.id}:`, error);
    }
  }

  private async createWidgetsForActivatedPlugin(pluginId: string): Promise<void> {
    try {
      // Get the plugin info to create widgets
      const installedPlugins = await this.getInstalledPlugins();
      const plugin = installedPlugins.find(p => p.id === pluginId);
      
      if (!plugin) {
        console.warn(`Plugin ${pluginId} not found for widget creation`);
        return;
      }

      // Only create widgets for enabled plugins
      if (plugin.status !== PluginStatus.ENABLED) {
        console.log(`Plugin ${pluginId} is not enabled, skipping widget creation`);
        return;
      }

      // Create widgets for the activated plugin
      this.registerPluginWidgets(plugin);
    } catch (error) {
      console.error(`Failed to create widgets for activated plugin ${pluginId}:`, error);
      // Don't throw error to prevent plugin activation failure
    }
  }
} 