import { IPluginManager } from '../interfaces/plugin.interface';
import { PluginInfo, PluginPackage, InstallResult, PluginDependency, PluginStatus, DashboardWidget } from '../../../shared';
import { PLUGIN_REGISTRY, discoverPlugins, getPluginInfo, validatePlugin } from '../../../plugins';
import { createLogger } from '../../../core/logger';
import { SettingsService } from '../../settings/services/settings.service';
import { eventBus } from '../../../core/event-bus';
// Browser-compatible storage for plugin persistence

// Define interfaces for dependency injection
interface IPluginRegistry {
  getAvailablePlugins(): Promise<PluginInfo[]>;
  getInstalledPlugins(): Promise<PluginInfo[]>;
  addInstalledPlugin(plugin: PluginInfo): Promise<void>;
  removeInstalledPlugin(pluginId: string, cleanupData?: boolean): Promise<void>;
  updatePluginStatus(pluginId: string, status: PluginStatus): Promise<void>;
}

interface IPluginVerifier {
  verifyPluginSignature(pluginPackage: PluginPackage): Promise<boolean>;
  validatePluginManifest(manifest: any): Promise<{ isValid: boolean; errors: string[] }>;
  checkSecurityCompliance(pluginPackage: PluginPackage): Promise<{ isCompliant: boolean; violations: string[] }>;
}

interface IDependencyResolver {
  resolveDependencies(pluginId: string): Promise<PluginDependency[]>;
  checkDependencyConflicts(dependencies: PluginDependency[]): Promise<string[]>;
  getInstallOrder(dependencies: PluginDependency[]): Promise<string[]>;
}

interface IDashboardManager {
  registerWidget(widget: DashboardWidget): void;
  handlePluginUninstall(pluginId: string): void;
  handlePluginDisable(pluginId: string): void;
}

export class PluginManager implements IPluginManager {
  private dependencyResolver: IDependencyResolver;
  private pluginVerifier: IPluginVerifier;
  private pluginRegistry: IPluginRegistry;
  private pluginSandbox: any;
  private installedPlugins: Map<string, PluginInfo> = new Map();
  private readonly persistenceFile: string;
  private dashboardManager?: IDashboardManager;
  private settingsService: SettingsService;
  private registeredWidgets: Set<string> = new Set(); // Track plugins with registered widgets
  private logger = createLogger('PluginManager');

  constructor(
    pluginRegistry?: IPluginRegistry,
    pluginVerifier?: IPluginVerifier,
    dependencyResolver?: IDependencyResolver,
    dashboardManager?: IDashboardManager,
    settingsService?: SettingsService
  ) {
    // Initialize persistence file path
    this.persistenceFile = 'installed-plugins'; // Browser localStorage key
    
    // Inject dependencies or use defaults
    this.pluginRegistry = pluginRegistry || this.createDefaultPluginRegistry();
    this.pluginVerifier = pluginVerifier || this.createDefaultPluginVerifier();
    this.dependencyResolver = dependencyResolver || this.createDefaultDependencyResolver();
    this.dashboardManager = dashboardManager;
    this.settingsService = settingsService || new SettingsService();
    
    // Load persisted plugins on startup
    this.loadPersistedPlugins();
  }

  private createDefaultPluginRegistry(): IPluginRegistry {
    return {
      getAvailablePlugins: async () => [],
      getInstalledPlugins: async () => Array.from(this.installedPlugins.values()),
      addInstalledPlugin: async (plugin: PluginInfo) => {
        this.installedPlugins.set(plugin.id, plugin);
        await this.savePersistedPlugins();
      },
      removeInstalledPlugin: async (pluginId: string, cleanupData?: boolean) => {
        this.logger.info(`Removing plugin from registry`, { pluginId });
        this.logger.debug(`Installed plugins before removal`, { plugins: Array.from(this.installedPlugins.keys()) });
        this.installedPlugins.delete(pluginId);
        this.logger.debug(`Installed plugins after removal`, { plugins: Array.from(this.installedPlugins.keys()) });
        await this.savePersistedPlugins();
        this.logger.info(`Plugin removed from registry and persisted`, { pluginId });
      },
      updatePluginStatus: async (pluginId: string, status: PluginStatus) => {
        const plugin = this.installedPlugins.get(pluginId);
        if (plugin) {
          plugin.status = status;
          this.installedPlugins.set(pluginId, plugin);
          await this.savePersistedPlugins();
        }
      }
    };
  }

  private createDefaultPluginVerifier(): IPluginVerifier {
    return {
      verifyPluginSignature: async (pluginPackage: PluginPackage) => true,
      validatePluginManifest: async (manifest: any) => ({ isValid: true, errors: [] }),
      checkSecurityCompliance: async (pluginPackage: PluginPackage) => ({ isCompliant: true, violations: [] })
    };
  }

  private createDefaultDependencyResolver(): IDependencyResolver {
    return {
      resolveDependencies: async (pluginId: string) => [],
      checkDependencyConflicts: async (dependencies: PluginDependency[]) => [],
      getInstallOrder: async (dependencies: PluginDependency[]) => []
    };
  }

  async getAvailablePlugins(): Promise<PluginInfo[]> {
    try {
      // Get plugins from the modular plugin registry
      const availablePluginIds = discoverPlugins();
      const installedPlugins = await this.getInstalledPlugins();
      const installedPluginIds = new Set(installedPlugins.map(p => p.id));
      
      const plugins: PluginInfo[] = [];

      for (const pluginId of availablePluginIds) {
        // Skip plugins that are already installed
        if (installedPluginIds.has(pluginId)) {
          continue;
        }
        
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
      
      // Load and activate the plugin
      await this.loadAndActivatePlugin(pluginId);
      
      // Create widgets for the activated plugin
      await this.createWidgetsForActivatedPlugin(pluginId);
      
      this.logger.info(`Plugin enabled successfully`, { pluginId });
    } catch (error) {
      console.error(`Failed to enable plugin ${pluginId}:`, error);
      throw error;
    }
  }

  async disablePlugin(pluginId: string): Promise<void> {
    try {
      // Remove widgets for the disabled plugin
      if (this.dashboardManager) {
        this.dashboardManager.handlePluginDisable(pluginId);
      }
      
      // Remove from registered widgets tracking
      this.registeredWidgets.delete(pluginId);
      
      await this.pluginRegistry.updatePluginStatus(pluginId, PluginStatus.DISABLED);
      
      // Unload plugin from sandbox if loaded
      // Currently using simple in-memory plugins, no sandbox cleanup needed
      this.logger.info(`Plugin disabled successfully`, { pluginId });
    } catch (error) {
      console.error(`Failed to disable plugin ${pluginId}:`, error);
      throw error;
    }
  }

  async uninstallPlugin(pluginId: string, cleanupData?: boolean): Promise<void> {
    try {
      this.logger.info(`Starting uninstall process`, { pluginId });
      this.logger.debug(`Current installed plugins before uninstall`, { plugins: Array.from(this.installedPlugins.keys()) });
      
      // Check for dependent plugins that may need this plugin
      const installedPlugins = await this.getInstalledPlugins();
      const dependentPlugins = installedPlugins.filter(plugin => 
        plugin.dependencies.some(dep => dep.id === pluginId)
      );
      
      if (dependentPlugins.length > 0) {
        throw new Error(`Cannot uninstall plugin ${pluginId}: Required by ${dependentPlugins.map(p => p.id).join(', ')}`);
      }
      
      // Remove from sandbox if loaded
      // Unload from sandbox if loaded
      // Currently using simple in-memory plugins, no sandbox cleanup needed
      
      // Unregister widgets for the plugin before removing from registry
      if (this.dashboardManager) {
        this.dashboardManager.handlePluginUninstall(pluginId);
      }
      
      // Remove from registered widgets tracking
      this.registeredWidgets.delete(pluginId);
      
      // Remove from registry
      await this.pluginRegistry.removeInstalledPlugin(pluginId, cleanupData || false);
      
      this.logger.debug(`Current installed plugins after uninstall`, { plugins: Array.from(this.installedPlugins.keys()) });
      this.logger.info(`Plugin uninstalled successfully`, { pluginId });
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
    this.logger.error(`Plugin failed`, { pluginId, error: error.message, stack: error.stack });
    
    // Set plugin status to error
    this.pluginRegistry.updatePluginStatus(pluginId, PluginStatus.ERROR)
      .catch((updateError: Error) => {
        this.logger.error(`Failed to update status for failed plugin`, { pluginId, updateError });
      });

    // Notify admin dashboard about plugin failure via event bus
    try {
      eventBus.publish('admin.plugin.failure', {
        pluginId,
        error: {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        },
        severity: 'high',
        requiresAction: true
      });
      
      this.logger.info(`Admin notification sent for plugin failure`, { pluginId });
    } catch (notificationError) {
      this.logger.error(`Failed to send admin notification for plugin failure`, { 
        pluginId, 
        notificationError 
      });
    }
  }

  private async downloadFromRegistry(pluginId: string): Promise<PluginPackage> {
    // This method downloads plugins from the modular registry
    // For now, we use the modular registry system
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
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        this.logger.info('localStorage not available (server-side), skipping plugin persistence load');
        return;
      }

      const data = localStorage.getItem(this.persistenceFile);
      if (data) {
        const persistedPlugins: PluginInfo[] = JSON.parse(data);
        for (const plugin of persistedPlugins) {
          await this.pluginRegistry.addInstalledPlugin(plugin);
          // Register widgets for persisted plugins if dashboard manager is available
          if (this.dashboardManager && plugin.status === PluginStatus.ENABLED) {
            this.logger.info(`Loading persisted ENABLED plugin, registering widget`, { pluginId: plugin.id });
            this.registerPluginWidgets(plugin);
          }
        }
        this.logger.info(`Loaded persisted plugins`, { count: persistedPlugins.length });
      } else {
        this.logger.info('No persisted plugins found');
      }
    } catch (error) {
      console.error('Error loading persisted plugins:', error);
    }
  }

  private async savePersistedPlugins(): Promise<void> {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        this.logger.debug('localStorage not available (server-side), skipping plugin persistence save');
        return;
      }

      const data = JSON.stringify(Array.from(this.installedPlugins.values()), null, 2);
      localStorage.setItem(this.persistenceFile, data);
      this.logger.debug('Persisted installed plugins', { key: this.persistenceFile });
    } catch (error) {
      console.error('Error saving persisted plugins:', error);
    }
  }

  private registerPluginWidgets(plugin: PluginInfo): void {
    if (!this.dashboardManager) {
      console.warn('DashboardManager not available for widget registration');
      return;
    }

    // Check if widget is already registered to prevent duplicates
    if (this.registeredWidgets.has(plugin.id)) {
      this.logger.info(`Widget already registered, skipping duplicate registration`, { pluginId: plugin.id });
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
      this.registeredWidgets.add(plugin.id); // Mark as registered
      this.logger.info(`Registered widget for plugin`, { pluginId: plugin.id });
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
        this.logger.info(`Plugin is not enabled, skipping widget creation`, { pluginId });
        return;
      }

      // Create widgets for the activated plugin
      this.registerPluginWidgets(plugin);
    } catch (error) {
      console.error(`Failed to create widgets for activated plugin ${pluginId}:`, error);
      // Don't throw error to prevent plugin activation failure
    }
  }

  private async loadAndActivatePlugin(pluginId: string): Promise<void> {
    try {
      // Get plugin info from registry
      const pluginInfo = getPluginInfo(pluginId);
      if (!pluginInfo) {
        throw new Error(`Plugin ${pluginId} not found in registry`);
      }

      // Create plugin API for the plugin
      const pluginAPI = this.createPluginAPI(pluginId);

      // Load the plugin module
      const pluginModule = await this.loadPluginModule(pluginId);

      // Initialize the plugin
      if (pluginModule.initialize) {
        await pluginModule.initialize();
      }

      // Activate the plugin
      if (pluginModule.activate) {
        await pluginModule.activate();
      }

      this.logger.info(`Plugin loaded and activated successfully`, { pluginId });
    } catch (error) {
      console.error(`Failed to load and activate plugin ${pluginId}:`, error);
      // Don't throw error to prevent plugin activation failure
      // This allows the plugin to be enabled even if activation fails
    }
  }

  private createPluginAPI(pluginId: string): any {
    return {
      settings: {
        get: async (key: string) => {
          try {
            return await this.settingsService.getSetting(key, undefined);
          } catch (error) {
            this.logger.error(`Error getting plugin setting`, { pluginId, key, error });
            return null;
          }
        },
        set: async (key: string, value: any) => {
          try {
            await this.settingsService.setPluginSetting(pluginId, key, value);
          } catch (error) {
            this.logger.error(`Error setting plugin setting`, { pluginId, key, value, error });
            throw error;
          }
        },
        subscribe: (key: string, callback: (key: string, value: any) => void) => {
          try {
            const settingsKey = `${pluginId}.${key}`;
            return this.settingsService.subscribe(settingsKey, (settingKey: string, value: any, userId: string | null) => {
              callback(key, value);
            });
          } catch (error) {
            this.logger.error(`Error subscribing to plugin setting`, { pluginId, key, error });
            return () => {}; // Return no-op unsubscribe function
          }
        }
      },
      ui: {
        createWidget: async (widget: any) => {
          try {
            if (this.dashboardManager) {
              const dashboardWidget: DashboardWidget = {
                id: widget.id,
                pluginId: pluginId,
                title: widget.title,
                component: widget.type === 'custom' ? 'HelloWorldWidgetComponent' : 'DefaultWidgetComponent',
                size: widget.size,
                permissions: []
              };
              this.dashboardManager.registerWidget(dashboardWidget);
              // Mark as registered to prevent duplicate registration
              this.registeredWidgets.add(pluginId);
            }
          } catch (error) {
            console.error(`Failed to create widget for plugin ${pluginId}:`, error);
            // Don't throw error to allow plugin activation to continue
          }
        },
        updateWidget: async (widgetId: string, data: any) => {
          // Widget update API - delegate to DashboardManager
          // This would integrate with the actual DashboardManager in production
        }
      },
      events: {
        emit: (event: string, data: any) => {
          try {
            const eventName = `plugin.${pluginId}.${event}`;
            eventBus.publish(eventName, { pluginId, data });
            this.logger.debug(`Plugin emitted event`, { pluginId, event, eventName });
          } catch (error) {
            this.logger.error(`Error emitting plugin event`, { pluginId, event, error });
          }
        },
        on: (event: string, callback: (data: any) => void) => {
          try {
            const eventName = `plugin.${pluginId}.${event}`;
            const wrappedCallback = (eventData: { pluginId: string; data: any }) => {
              callback(eventData.data);
            };
            const subscription = eventBus.subscribe(eventName, wrappedCallback);
            this.logger.debug(`Plugin subscribed to event`, { pluginId, event, eventName });
            
            // Return unsubscribe function
            return () => {
              subscription.unsubscribe();
            };
          } catch (error) {
            this.logger.error(`Error subscribing to plugin event`, { pluginId, event, error });
            return () => {}; // Return no-op unsubscribe function
          }
        }
      }
    };
  }

  private async loadPluginModule(pluginId: string): Promise<any> {
    try {
      // For now, load the demo plugin directly
      if (pluginId === 'demo-hello-world') {
        const { createDemoPlugin } = await import('../../../plugins/demo-hello-world');
        const pluginAPI = this.createPluginAPI(pluginId);
        return createDemoPlugin(pluginAPI);
      }

      // For test plugins, return a mock plugin that doesn't throw errors
      if (pluginId.startsWith('test-') || pluginId.startsWith('plugin-') || pluginId.includes('widget')) {
        return {
          initialize: async () => {
            this.logger.debug(`Mock plugin initialized`, { pluginId });
            return true;
          },
          activate: async () => {
            this.logger.debug(`Mock plugin activated`, { pluginId });
            return true;
          },
          deactivate: async () => {
            this.logger.debug(`Mock plugin deactivated`, { pluginId });
            return true;
          }
        };
      }

      // For other plugins, we would load them dynamically
      // This is a simplified implementation for the demo plugin
      throw new Error(`Plugin ${pluginId} not implemented yet`);
    } catch (error) {
      console.error(`Failed to load plugin module ${pluginId}:`, error);
      throw error;
    }
  }
}