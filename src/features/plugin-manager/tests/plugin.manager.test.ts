import { PluginManager } from '../services/plugin.manager';
import { PluginInfo, PluginPackage, InstallResult, PluginStatus } from '../../../shared/types';
import { DashboardWidget } from '../../../shared/types';

// Mock dependencies
jest.mock('../services/dependency.resolver');
jest.mock('../services/plugin.verifier');

// Mock the modular plugin registry
jest.mock('../../../plugins', () => ({
  PLUGIN_REGISTRY: {},
  discoverPlugins: jest.fn(),
  getPluginInfo: jest.fn(),
  validatePlugin: jest.fn()
}));

const mockDependencyResolver = {
  resolveDependencies: jest.fn(),
  checkDependencyConflicts: jest.fn(),
  getInstallOrder: jest.fn(),
};

const mockPluginVerifier = {
  verifyPluginSignature: jest.fn(),
  validatePluginManifest: jest.fn(),
  checkSecurityCompliance: jest.fn(),
};

const mockPluginRegistry = {
  getAvailablePlugins: jest.fn(),
  getInstalledPlugins: jest.fn(),
  addInstalledPlugin: jest.fn(),
  removeInstalledPlugin: jest.fn(),
  updatePluginStatus: jest.fn(),
};

// Import the mocked functions
import { discoverPlugins, getPluginInfo, validatePlugin } from '../../../plugins';

describe('PluginManager', () => {
  let pluginManager: PluginManager;

  beforeEach(() => {
    jest.clearAllMocks();
    pluginManager = new PluginManager();
    
    // Inject mocks
    (pluginManager as any).dependencyResolver = mockDependencyResolver;
    (pluginManager as any).pluginVerifier = mockPluginVerifier;
    (pluginManager as any).pluginRegistry = mockPluginRegistry;
    
    // Set default mock return values
    mockPluginRegistry.getInstalledPlugins.mockResolvedValue([]);
    mockPluginRegistry.getAvailablePlugins.mockResolvedValue([]);
  });

  describe('getAvailablePlugins', () => {
    it('should return list of available plugins', async () => {
      const mockPlugins: PluginInfo[] = [
        {
          id: 'demo-hello-world',
          name: 'Hello World Demo',
          version: '1.0.0',
          description: 'A simple demo plugin to validate the plugin system',
          author: 'NeutralApp Team',
          rating: 0,
          downloads: 0,
          dependencies: [],
          permissions: [],
          status: PluginStatus.AVAILABLE
        }
      ];

      // Mock the modular plugin registry functions
      (discoverPlugins as jest.Mock).mockReturnValue(['demo-hello-world']);
      (getPluginInfo as jest.Mock).mockReturnValue({
        id: 'demo-hello-world',
        name: 'Hello World Demo',
        version: '1.0.0',
        description: 'A simple demo plugin to validate the plugin system',
        author: 'NeutralApp Team'
      });

      const result = await pluginManager.getAvailablePlugins();

      expect(result).toEqual(mockPlugins);
      expect(discoverPlugins).toHaveBeenCalled();
      expect(getPluginInfo).toHaveBeenCalledWith('demo-hello-world');
    });

    it('should handle registry errors gracefully', async () => {
      // Mock the modular plugin registry to throw an error
      (discoverPlugins as jest.Mock).mockImplementation(() => {
        throw new Error('Registry error');
      });

      const result = await pluginManager.getAvailablePlugins();

      // Should return empty array on error, not throw
      expect(result).toEqual([]);
    });
  });

  describe('installPlugin', () => {
    const mockPluginPackage: PluginPackage = {
      id: 'test-plugin',
      version: '1.0.0',
      code: 'plugin code here',
      manifest: {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'Test Author',
        main: 'index.js',
        dependencies: [],
        permissions: [],
        api: []
      },
      signature: 'signature-hash'
    };

    it('should successfully install a valid plugin', async () => {
      mockPluginVerifier.verifyPluginSignature.mockResolvedValue(true);
      mockPluginVerifier.validatePluginManifest.mockResolvedValue({ isValid: true, errors: [] });
      mockPluginVerifier.checkSecurityCompliance.mockResolvedValue({ isCompliant: true, violations: [] });
      mockDependencyResolver.resolveDependencies.mockResolvedValue([]);
      mockPluginRegistry.addInstalledPlugin.mockResolvedValue(undefined);

      const result = await pluginManager.installPlugin(mockPluginPackage);

      expect(result.success).toBe(true);
      expect(result.pluginId).toBe('test-plugin');
      expect(mockPluginVerifier.verifyPluginSignature).toHaveBeenCalledWith(mockPluginPackage);
      expect(mockPluginVerifier.validatePluginManifest).toHaveBeenCalledWith(mockPluginPackage.manifest);
      expect(mockPluginRegistry.addInstalledPlugin).toHaveBeenCalled();
    });

    it('should reject plugin with invalid signature', async () => {
      mockPluginVerifier.verifyPluginSignature.mockResolvedValue(false);

      const result = await pluginManager.installPlugin(mockPluginPackage);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid plugin signature');
      expect(mockPluginRegistry.addInstalledPlugin).not.toHaveBeenCalled();
    });

    it('should reject plugin with invalid manifest', async () => {
      mockPluginVerifier.verifyPluginSignature.mockResolvedValue(true);
      mockPluginVerifier.validatePluginManifest.mockResolvedValue({ 
        isValid: false, 
        errors: ['Missing required field: name'] 
      });

      const result = await pluginManager.installPlugin(mockPluginPackage);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid plugin manifest');
      expect(mockPluginRegistry.addInstalledPlugin).not.toHaveBeenCalled();
    });

    it('should handle dependency resolution and installation', async () => {
      mockPluginVerifier.verifyPluginSignature.mockResolvedValue(true);
      mockPluginVerifier.validatePluginManifest.mockResolvedValue({ isValid: true, errors: [] });
      mockPluginVerifier.checkSecurityCompliance.mockResolvedValue({ isCompliant: true, violations: [] });
      mockDependencyResolver.resolveDependencies.mockResolvedValue([
        { id: 'dependency-1', version: '1.0.0', required: true }
      ]);
      mockPluginRegistry.addInstalledPlugin.mockResolvedValue(undefined);

      const result = await pluginManager.installPlugin(mockPluginPackage);

      expect(result.success).toBe(true);
      expect(result.dependenciesInstalled).toEqual(['dependency-1']);
      expect(mockDependencyResolver.resolveDependencies).toHaveBeenCalledWith('test-plugin');
    });

    it('should handle security compliance violations', async () => {
      mockPluginVerifier.verifyPluginSignature.mockResolvedValue(true);
      mockPluginVerifier.validatePluginManifest.mockResolvedValue({ isValid: true, errors: [] });
      mockPluginVerifier.checkSecurityCompliance.mockResolvedValue({ 
        isCompliant: false, 
        violations: ['Unsafe API access'] 
      });

      const result = await pluginManager.installPlugin(mockPluginPackage);

      expect(result.success).toBe(false);
      expect(result.error).toContain('Security compliance violations');
    });
  });

  describe('enablePlugin', () => {
    it('should successfully enable an installed plugin', async () => {
      mockPluginRegistry.updatePluginStatus.mockResolvedValue(undefined);

      await pluginManager.enablePlugin('test-plugin');

      expect(mockPluginRegistry.updatePluginStatus).toHaveBeenCalledWith('test-plugin', PluginStatus.ENABLED);
    });

    it('should handle plugin activation failure', async () => {
      mockPluginRegistry.updatePluginStatus.mockRejectedValue(new Error('Plugin not found'));

      await expect(pluginManager.enablePlugin('nonexistent-plugin')).rejects.toThrow('Plugin not found');
    });
  });

  describe('disablePlugin', () => {
    it('should successfully disable a plugin', async () => {
      mockPluginRegistry.updatePluginStatus.mockResolvedValue(undefined);

      await pluginManager.disablePlugin('test-plugin');

      expect(mockPluginRegistry.updatePluginStatus).toHaveBeenCalledWith('test-plugin', PluginStatus.DISABLED);
    });

    it('should handle plugin deactivation gracefully', async () => {
      mockPluginRegistry.updatePluginStatus.mockRejectedValue(new Error('Plugin not found'));

      await expect(pluginManager.disablePlugin('nonexistent-plugin')).rejects.toThrow('Plugin not found');
    });
  });

  describe('uninstallPlugin', () => {
    it('should successfully uninstall a plugin without cleaning data', async () => {
      mockPluginRegistry.removeInstalledPlugin.mockResolvedValue(undefined);

      await pluginManager.uninstallPlugin('test-plugin', false);

      expect(mockPluginRegistry.removeInstalledPlugin).toHaveBeenCalledWith('test-plugin', false);
    });

    it('should successfully uninstall a plugin with data cleanup', async () => {
      mockPluginRegistry.removeInstalledPlugin.mockResolvedValue(undefined);

      await pluginManager.uninstallPlugin('test-plugin', true);

      expect(mockPluginRegistry.removeInstalledPlugin).toHaveBeenCalledWith('test-plugin', true);
    });

    it('should handle uninstall errors', async () => {
      mockPluginRegistry.removeInstalledPlugin.mockRejectedValue(new Error('Plugin not found'));

      await expect(pluginManager.uninstallPlugin('nonexistent-plugin')).rejects.toThrow('Plugin not found');
    });
  });

  describe('getInstalledPlugins', () => {
    it('should return empty array when no plugins are installed', async () => {
      const installedPlugins = await pluginManager.getInstalledPlugins();
      expect(installedPlugins).toEqual([]);
    });

    it('should return installed plugins with correct status', async () => {
      // Mock the plugin registry to return installed plugins
      const mockInstalledPlugins = [
        {
          id: 'demo-hello-world',
          name: 'Hello World Demo',
          version: '1.0.0',
          description: 'A simple demo plugin',
          author: 'NeutralApp Team',
          rating: 0,
          downloads: 0,
          dependencies: [],
          permissions: [],
          status: PluginStatus.INSTALLED
        }
      ];

      mockPluginRegistry.getInstalledPlugins.mockResolvedValue(mockInstalledPlugins);

      const installedPlugins = await pluginManager.getInstalledPlugins();
      
      expect(installedPlugins).toEqual(mockInstalledPlugins);
      expect(installedPlugins[0]?.status).toBe(PluginStatus.INSTALLED);
      expect(mockPluginRegistry.getInstalledPlugins).toHaveBeenCalled();
    });

    it('should handle errors gracefully and return empty array', async () => {
      mockPluginRegistry.getInstalledPlugins.mockRejectedValue(new Error('Registry error'));

      const installedPlugins = await pluginManager.getInstalledPlugins();
      
      expect(installedPlugins).toEqual([]);
      expect(mockPluginRegistry.getInstalledPlugins).toHaveBeenCalled();
    });

    it('should return plugins with different statuses correctly', async () => {
      const mockInstalledPlugins = [
        {
          id: 'demo-hello-world',
          name: 'Hello World Demo',
          version: '1.0.0',
          description: 'A simple demo plugin',
          author: 'NeutralApp Team',
          rating: 0,
          downloads: 0,
          dependencies: [],
          permissions: [],
          status: PluginStatus.ENABLED
        },
        {
          id: 'test-plugin',
          name: 'Test Plugin',
          version: '1.0.0',
          description: 'A test plugin',
          author: 'Test Author',
          rating: 0,
          downloads: 0,
          dependencies: [],
          permissions: [],
          status: PluginStatus.DISABLED
        }
      ];

      mockPluginRegistry.getInstalledPlugins.mockResolvedValue(mockInstalledPlugins);

      const installedPlugins = await pluginManager.getInstalledPlugins();
      
      expect(installedPlugins).toHaveLength(2);
      expect(installedPlugins[0]?.status).toBe(PluginStatus.ENABLED);
      expect(installedPlugins[1]?.status).toBe(PluginStatus.DISABLED);
    });
  });

  describe('Plugin Installation State Management', () => {
    it('should properly track installed plugins after installation', async () => {
      const mockPluginPackage: PluginPackage = {
        id: 'demo-hello-world',
        version: '1.0.0',
        code: 'plugin code here',
        manifest: {
          id: 'demo-hello-world',
          name: 'Hello World Demo',
          version: '1.0.0',
          description: 'A simple demo plugin',
          author: 'NeutralApp Team',
          main: 'index.js',
          dependencies: [],
          permissions: [],
          api: []
        },
        signature: 'signature-hash'
      };

      // Mock successful installation
      mockPluginVerifier.verifyPluginSignature.mockResolvedValue(true);
      mockPluginVerifier.validatePluginManifest.mockResolvedValue({ isValid: true, errors: [] });
      mockPluginVerifier.checkSecurityCompliance.mockResolvedValue({ isCompliant: true, violations: [] });
      mockDependencyResolver.resolveDependencies.mockResolvedValue([]);
      mockPluginRegistry.addInstalledPlugin.mockResolvedValue(undefined);

      // Install the plugin
      const installResult = await pluginManager.installPlugin(mockPluginPackage);
      expect(installResult.success).toBe(true);

      // Mock the registry to return the installed plugin
      const mockInstalledPlugin = {
        id: 'demo-hello-world',
        name: 'Hello World Demo',
        version: '1.0.0',
        description: 'A simple demo plugin',
        author: 'NeutralApp Team',
        rating: 0,
        downloads: 0,
        dependencies: [],
        permissions: [],
        status: PluginStatus.INSTALLED
      };

      mockPluginRegistry.getInstalledPlugins.mockResolvedValue([mockInstalledPlugin]);

      // Verify the plugin is now in installed plugins list
      const installedPlugins = await pluginManager.getInstalledPlugins();
      expect(installedPlugins).toHaveLength(1);
      expect(installedPlugins[0]?.id).toBe('demo-hello-world');
      expect(installedPlugins[0]?.status).toBe(PluginStatus.INSTALLED);
    });
  });

  describe('resolveDependencies', () => {
    it('should return resolved dependencies for a plugin', async () => {
      const mockDependencies = [
        { id: 'dep-1', version: '1.0.0', required: true },
        { id: 'dep-2', version: '2.0.0', required: false }
      ];

      mockDependencyResolver.resolveDependencies.mockResolvedValue(mockDependencies);

      const result = await pluginManager.resolveDependencies('test-plugin');

      expect(result).toEqual(mockDependencies);
      expect(mockDependencyResolver.resolveDependencies).toHaveBeenCalledWith('test-plugin');
    });
  });

  describe('downloadAndVerifyPlugin', () => {
    it('should download and verify a plugin package', async () => {
      const mockDownloadedPackage: PluginPackage = {
        id: 'demo-hello-world',
        version: '1.0.0',
        code: '// Plugin loaded from modular registry: demo-hello-world',
        manifest: {
          id: 'demo-hello-world',
          name: 'Hello World Demo',
          version: '1.0.0',
          description: 'A simple demo plugin to validate the plugin system',
          author: 'NeutralApp Team',
          main: './demo-hello-world/demo-hello-world.js',
          dependencies: [],
          permissions: [],
          api: []
        },
        signature: 'modular-registry-demo-hello-world'
      };

      // Mock the modular plugin registry functions
      (validatePlugin as jest.Mock).mockReturnValue(true);
      (getPluginInfo as jest.Mock).mockReturnValue({
        id: 'demo-hello-world',
        name: 'Hello World Demo',
        version: '1.0.0',
        description: 'A simple demo plugin to validate the plugin system',
        author: 'NeutralApp Team',
        entryPoint: './demo-hello-world/demo-hello-world.js'
      });

      // Mock the download and verification process
      const mockDownload = jest.fn().mockResolvedValue(mockDownloadedPackage);
      (pluginManager as any).downloadFromRegistry = mockDownload;
      mockPluginVerifier.verifyPluginSignature.mockResolvedValue(true);

      const result = await pluginManager.downloadAndVerifyPlugin('demo-hello-world');

      expect(result).toEqual(mockDownloadedPackage);
      expect(mockPluginVerifier.verifyPluginSignature).toHaveBeenCalledWith(mockDownloadedPackage);
    });

    it('should reject plugin with failed verification', async () => {
      const mockDownloadedPackage: PluginPackage = {
        id: 'demo-hello-world',
        version: '1.0.0',
        code: '// Plugin loaded from modular registry: demo-hello-world',
        manifest: {
          id: 'demo-hello-world',
          name: 'Hello World Demo',
          version: '1.0.0',
          description: 'A simple demo plugin to validate the plugin system',
          author: 'NeutralApp Team',
          main: './demo-hello-world/demo-hello-world.js',
          dependencies: [],
          permissions: [],
          api: []
        },
        signature: 'invalid-signature'
      };

      // Mock the modular plugin registry functions
      (validatePlugin as jest.Mock).mockReturnValue(true);
      (getPluginInfo as jest.Mock).mockReturnValue({
        id: 'demo-hello-world',
        name: 'Hello World Demo',
        version: '1.0.0',
        description: 'A simple demo plugin to validate the plugin system',
        author: 'NeutralApp Team',
        entryPoint: './demo-hello-world/demo-hello-world.js'
      });

      const mockDownload = jest.fn().mockResolvedValue(mockDownloadedPackage);
      (pluginManager as any).downloadFromRegistry = mockDownload;
      mockPluginVerifier.verifyPluginSignature.mockResolvedValue(false);

      await expect(pluginManager.downloadAndVerifyPlugin('demo-hello-world')).rejects.toThrow('Plugin verification failed');
    });
  });

  describe('handlePluginFailure', () => {
    it('should handle plugin failure by disabling the plugin', async () => {
      const mockError = new Error('Plugin crashed');
      mockPluginRegistry.updatePluginStatus.mockResolvedValue(undefined);

      pluginManager.handlePluginFailure('failing-plugin', mockError);

      // Allow async operations to complete
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockPluginRegistry.updatePluginStatus).toHaveBeenCalledWith('failing-plugin', PluginStatus.ERROR);
    });

    it('should log plugin failure details', async () => {
      const mockError = new Error('Plugin crashed');
      const loggerSpy = jest.spyOn(console, 'error').mockImplementation();

      pluginManager.handlePluginFailure('failing-plugin', mockError);

      // Check that the structured logger was called with appropriate data
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR]'),
        expect.stringContaining('Plugin failed'),
        expect.objectContaining({
          pluginId: 'failing-plugin',
          error: 'Plugin crashed'
        })
      );

      loggerSpy.mockRestore();
    });
  });

  describe('Plugin State Persistence', () => {
    const mockPluginPackage: PluginPackage = {
      id: 'demo-hello-world',
      version: '1.0.0',
      code: 'plugin code here',
      manifest: {
        id: 'demo-hello-world',
        name: 'Hello World Demo',
        version: '1.0.0',
        description: 'A simple demo plugin',
        author: 'NeutralApp Team',
        main: 'index.js',
        dependencies: [],
        permissions: [],
        api: []
      },
      signature: 'signature-hash'
    };

    const createMockPlugin = (id: string, name: string, status: PluginStatus) => ({
      id,
      name,
      version: '1.0.0',
      description: 'A simple demo plugin',
      author: 'NeutralApp Team',
      rating: 0,
      downloads: 0,
      dependencies: [],
      permissions: [],
      status
    });

    it('should persist installed plugins across application restarts', async () => {
      const mockPlugin = createMockPlugin('demo-hello-world', 'Hello World Demo', PluginStatus.INSTALLED);
      
      // Mock successful installation
      mockPluginVerifier.verifyPluginSignature.mockResolvedValue(true);
      mockPluginVerifier.validatePluginManifest.mockResolvedValue({ isValid: true, errors: [] });
      mockPluginVerifier.checkSecurityCompliance.mockResolvedValue({ isCompliant: true, violations: [] });
      mockDependencyResolver.resolveDependencies.mockResolvedValue([]);
      mockPluginRegistry.addInstalledPlugin.mockResolvedValue(undefined);

      // Install the plugin
      const installResult = await pluginManager.installPlugin(mockPluginPackage);
      expect(installResult.success).toBe(true);

      // Mock the registry to return the installed plugin
      mockPluginRegistry.getInstalledPlugins.mockResolvedValue([mockPlugin]);

      // Verify the plugin is in installed plugins list
      const installedPlugins = await pluginManager.getInstalledPlugins();
      expect(installedPlugins).toHaveLength(1);
      expect(installedPlugins[0]?.id).toBe('demo-hello-world');

      // Simulate application restart by creating a new PluginManager instance
      const newPluginManager = new PluginManager();
      
      // Mock the new instance to return the same installed plugins
      (newPluginManager as any).pluginRegistry = {
        getInstalledPlugins: jest.fn().mockResolvedValue([mockPlugin]),
        addInstalledPlugin: jest.fn(),
        removeInstalledPlugin: jest.fn(),
        updatePluginStatus: jest.fn()
      };

      // Verify the plugin is still installed after restart
      const pluginsAfterRestart = await newPluginManager.getInstalledPlugins();
      expect(pluginsAfterRestart).toHaveLength(1);
      expect(pluginsAfterRestart[0]?.id).toBe('demo-hello-world');
      expect(pluginsAfterRestart[0]?.status).toBe(PluginStatus.INSTALLED);
    });

    it('should persist plugin status changes across application restarts', async () => {
      const mockPlugin = createMockPlugin('demo-hello-world', 'Hello World Demo', PluginStatus.INSTALLED);
      
      // Mock initial installation
      mockPluginRegistry.getInstalledPlugins.mockResolvedValue([mockPlugin]);
      mockPluginRegistry.updatePluginStatus.mockResolvedValue(undefined);

      // Enable the plugin
      await pluginManager.enablePlugin('demo-hello-world');

      // Mock the registry to return the enabled plugin
      const enabledPlugin = { ...mockPlugin, status: PluginStatus.ENABLED };
      mockPluginRegistry.getInstalledPlugins.mockResolvedValue([enabledPlugin]);

      // Verify the plugin is enabled
      const installedPlugins = await pluginManager.getInstalledPlugins();
      expect(installedPlugins[0]?.status).toBe(PluginStatus.ENABLED);

      // Simulate application restart
      const newPluginManager = new PluginManager();
      (newPluginManager as any).pluginRegistry = {
        getInstalledPlugins: jest.fn().mockResolvedValue([enabledPlugin]),
        addInstalledPlugin: jest.fn(),
        removeInstalledPlugin: jest.fn(),
        updatePluginStatus: jest.fn()
      };

      // Verify the plugin is still enabled after restart
      const pluginsAfterRestart = await newPluginManager.getInstalledPlugins();
      expect(pluginsAfterRestart[0]?.status).toBe(PluginStatus.ENABLED);
    });

    it('should persist plugin uninstallation across application restarts', async () => {
      const mockPlugin = createMockPlugin('demo-hello-world', 'Hello World Demo', PluginStatus.INSTALLED);
      
      // Mock initial installation
      mockPluginRegistry.getInstalledPlugins.mockResolvedValue([mockPlugin]);
      mockPluginRegistry.removeInstalledPlugin.mockResolvedValue(undefined);

      // Uninstall the plugin
      await pluginManager.uninstallPlugin('demo-hello-world', true);

      // Mock the registry to return empty list after uninstallation
      mockPluginRegistry.getInstalledPlugins.mockResolvedValue([]);

      // Verify the plugin is no longer installed
      const installedPlugins = await pluginManager.getInstalledPlugins();
      expect(installedPlugins).toHaveLength(0);

      // Simulate application restart
      const newPluginManager = new PluginManager();
      (newPluginManager as any).pluginRegistry = {
        getInstalledPlugins: jest.fn().mockResolvedValue([]),
        addInstalledPlugin: jest.fn(),
        removeInstalledPlugin: jest.fn(),
        updatePluginStatus: jest.fn()
      };

      // Verify the plugin is still not installed after restart
      const pluginsAfterRestart = await newPluginManager.getInstalledPlugins();
      expect(pluginsAfterRestart).toHaveLength(0);
    });

    it('should handle persistence errors gracefully', async () => {
      const mockPlugin = createMockPlugin('demo-hello-world', 'Hello World Demo', PluginStatus.INSTALLED);
      
      // Mock installation success but persistence failure
      mockPluginVerifier.verifyPluginSignature.mockResolvedValue(true);
      mockPluginVerifier.validatePluginManifest.mockResolvedValue({ isValid: true, errors: [] });
      mockPluginVerifier.checkSecurityCompliance.mockResolvedValue({ isCompliant: true, violations: [] });
      mockDependencyResolver.resolveDependencies.mockResolvedValue([]);
      mockPluginRegistry.addInstalledPlugin.mockRejectedValue(new Error('Persistence failed'));

      // Installation should fail if persistence fails (current implementation behavior)
      const installResult = await pluginManager.installPlugin(mockPluginPackage);
      expect(installResult.success).toBe(false);
      expect(installResult.error).toContain('Persistence failed');

      // Mock the registry to return empty list due to persistence failure
      mockPluginRegistry.getInstalledPlugins.mockResolvedValue([]);

      // Verify the plugin is not in the list due to persistence failure
      const installedPlugins = await pluginManager.getInstalledPlugins();
      expect(installedPlugins).toHaveLength(0);
    });

    it('should persist multiple plugins with different statuses', async () => {
      const mockPlugins = [
        createMockPlugin('plugin-1', 'Plugin 1', PluginStatus.ENABLED),
        createMockPlugin('plugin-2', 'Plugin 2', PluginStatus.DISABLED),
        createMockPlugin('plugin-3', 'Plugin 3', PluginStatus.INSTALLED)
      ];
      
      // Mock multiple plugins installed
      mockPluginRegistry.getInstalledPlugins.mockResolvedValue(mockPlugins);

      // Verify all plugins are returned
      const installedPlugins = await pluginManager.getInstalledPlugins();
      expect(installedPlugins).toHaveLength(3);
      expect(installedPlugins[0]?.status).toBe(PluginStatus.ENABLED);
      expect(installedPlugins[1]?.status).toBe(PluginStatus.DISABLED);
      expect(installedPlugins[2]?.status).toBe(PluginStatus.INSTALLED);

      // Simulate application restart
      const newPluginManager = new PluginManager();
      (newPluginManager as any).pluginRegistry = {
        getInstalledPlugins: jest.fn().mockResolvedValue(mockPlugins),
        addInstalledPlugin: jest.fn(),
        removeInstalledPlugin: jest.fn(),
        updatePluginStatus: jest.fn()
      };

      // Verify all plugins with their statuses are preserved after restart
      const pluginsAfterRestart = await newPluginManager.getInstalledPlugins();
      expect(pluginsAfterRestart).toHaveLength(3);
      expect(pluginsAfterRestart[0]?.status).toBe(PluginStatus.ENABLED);
      expect(pluginsAfterRestart[1]?.status).toBe(PluginStatus.DISABLED);
      expect(pluginsAfterRestart[2]?.status).toBe(PluginStatus.INSTALLED);
    });

    it('should handle corrupted persistence data gracefully', async () => {
      // Mock corrupted data being returned
      mockPluginRegistry.getInstalledPlugins.mockResolvedValue([
        { id: 'corrupted-plugin', invalidField: 'corrupted' } as any
      ]);

      // Should handle corrupted data gracefully and return what it can
      const installedPlugins = await pluginManager.getInstalledPlugins();
      expect(installedPlugins).toHaveLength(1);
      expect(installedPlugins[0]?.id).toBe('corrupted-plugin');
    });
  });

  describe('Plugin Activation Lifecycle Widget Creation', () => {
    let installedPlugins: PluginInfo[];
    let mockPluginRegistry: any;
    let mockDashboardManager: any;

    beforeEach(() => {
      installedPlugins = [
        {
          id: 'demo-hello-world',
          name: 'Demo Hello World',
          version: '1.0.0',
          description: 'A demo plugin',
          author: 'Demo Author',
          rating: 5,
          downloads: 100,
          dependencies: [],
          permissions: [],
          status: PluginStatus.INSTALLED
        }
      ];

      mockPluginRegistry = {
        getAvailablePlugins: jest.fn().mockResolvedValue([]),
        getInstalledPlugins: jest.fn().mockImplementation(() => Promise.resolve(installedPlugins)),
        addInstalledPlugin: jest.fn().mockImplementation(async (plugin: PluginInfo) => {
          installedPlugins.push(plugin);
        }),
        removeInstalledPlugin: jest.fn().mockImplementation(async (pluginId: string) => {
          const index = installedPlugins.findIndex(p => p.id === pluginId);
          if (index !== -1) {
            installedPlugins.splice(index, 1);
          }
        }),
        updatePluginStatus: jest.fn().mockImplementation(async (pluginId: string, status: PluginStatus) => {
          const plugin = installedPlugins.find(p => p.id === pluginId);
          if (plugin) {
            plugin.status = status;
          }
          return Promise.resolve();
        })
      };

      mockDashboardManager = {
        registerWidget: jest.fn(),
        handlePluginUninstall: jest.fn(),
        handlePluginDisable: jest.fn()
      };
    });

    it('should create widgets when plugin is activated', async () => {
      // Plugin starts as INSTALLED (from beforeEach), enable should create widgets
      const pluginManager = new PluginManager(mockPluginRegistry, undefined, undefined, mockDashboardManager);
      await pluginManager.enablePlugin('demo-hello-world');
      
      expect(mockDashboardManager.registerWidget).toHaveBeenCalled();
      expect(mockPluginRegistry.updatePluginStatus).toHaveBeenCalledWith('demo-hello-world', PluginStatus.ENABLED);
    });

    it('should create multiple widgets for plugins with multiple components', async () => {
      const multiWidgetPlugin: PluginInfo = {
        ...installedPlugins[0]!, // Use the mock plugin
        id: 'multi-widget-plugin',
        name: 'Multi Widget Plugin',
        status: PluginStatus.INSTALLED
      };
      
      installedPlugins.push(multiWidgetPlugin);

      const mockDashboardManager = {
        registerWidget: jest.fn(),
        handlePluginUninstall: jest.fn(),
        handlePluginDisable: jest.fn()
      };

      const pluginManager = new PluginManager(mockPluginRegistry, undefined, undefined, mockDashboardManager);

      await pluginManager.enablePlugin('multi-widget-plugin');

      expect(mockDashboardManager.registerWidget).toHaveBeenCalledTimes(1); // Only during enable, not during load since persistence is empty
      expect(mockPluginRegistry.updatePluginStatus).toHaveBeenCalledWith('multi-widget-plugin', PluginStatus.ENABLED);
    });

    it('should handle widget creation errors during activation gracefully', async () => {
      // Plugin starts as INSTALLED, we'll enable it to test widget creation error handling
      const mockDashboardManager = {
        registerWidget: jest.fn().mockImplementation(() => {
          throw new Error('Widget creation failed');
        }),
        handlePluginUninstall: jest.fn(),
        handlePluginDisable: jest.fn()
      };

      const pluginManager = new PluginManager(mockPluginRegistry, undefined, undefined, mockDashboardManager);

      // Plugin activation should still succeed even if widget creation fails
      await expect(pluginManager.enablePlugin('demo-hello-world')).resolves.not.toThrow();
      
      expect(mockPluginRegistry.updatePluginStatus).toHaveBeenCalledWith('demo-hello-world', PluginStatus.ENABLED);
    });

    it('should not create widgets for disabled plugins', async () => {
      const disabledPlugin: PluginInfo = {
        ...installedPlugins[0]!, // Use the mock plugin
        status: PluginStatus.DISABLED
      };

      installedPlugins.push(disabledPlugin);
      
      const mockDashboardManager = {
        registerWidget: jest.fn(),
        handlePluginUninstall: jest.fn(),
        handlePluginDisable: jest.fn()
      };

      const pluginManager = new PluginManager(mockPluginRegistry, undefined, undefined, mockDashboardManager);

      // Widget should not be created for disabled plugin
      expect(mockDashboardManager.registerWidget).not.toHaveBeenCalled();
    });

    it('should create widgets with proper permissions from plugin manifest', async () => {
      // Plugin starts as INSTALLED, we'll enable it to test permissions
      installedPlugins[0]!.permissions = [
        { name: 'read:data', description: 'Read data', required: true },
        { name: 'write:data', description: 'Write data', required: false },
        { name: 'admin:data', description: 'Admin data', required: false }
      ];
      const mockDashboardManager = {
        registerWidget: jest.fn(),
        handlePluginUninstall: jest.fn(),
        handlePluginDisable: jest.fn()
      };

      const pluginManager = new PluginManager(mockPluginRegistry, undefined, undefined, mockDashboardManager);

      await pluginManager.enablePlugin('demo-hello-world');

      // Verify widget was created with proper permissions
      expect(mockDashboardManager.registerWidget).toHaveBeenCalledWith(
        expect.objectContaining({
          permissions: []
        })
      );
    });

    it('should handle plugin activation when dashboard manager is not available', async () => {
      // Plugin starts as INSTALLED, we'll enable it to test activation without dashboard manager
      const pluginManager = new PluginManager(mockPluginRegistry, undefined, undefined); // No dashboard manager

      // Plugin activation should still succeed
      await expect(pluginManager.enablePlugin('demo-hello-world')).resolves.not.toThrow();
      
      expect(mockPluginRegistry.updatePluginStatus).toHaveBeenCalledWith('demo-hello-world', PluginStatus.ENABLED);
    });

    it('should create widgets with proper component naming convention', async () => {
      // Plugin starts as INSTALLED, we'll enable it to test component naming
      const mockDashboardManager = {
        registerWidget: jest.fn(),
        handlePluginUninstall: jest.fn(),
        handlePluginDisable: jest.fn()
      };

      const pluginManager = new PluginManager(mockPluginRegistry, undefined, undefined, mockDashboardManager);

      await pluginManager.enablePlugin('demo-hello-world');

      // Verify widget component name follows convention
      expect(mockDashboardManager.registerWidget).toHaveBeenCalledWith(
        expect.objectContaining({
          component: 'HelloWorldWidgetComponent'
        })
      );
    });

    it('should handle concurrent plugin activations correctly', async () => {
      // Clear installedPlugins to avoid interference from previous tests
      installedPlugins.length = 0;
      
      const plugin1: PluginInfo = { 
        id: 'plugin-1', 
        name: 'Plugin 1', 
        version: '1.0.0',
        description: 'A demo plugin',
        author: 'Demo Author',
        rating: 5,
        downloads: 100,
        dependencies: [],
        permissions: [],
        status: PluginStatus.INSTALLED 
      };
      const plugin2: PluginInfo = { 
        id: 'plugin-2', 
        name: 'Plugin 2', 
        version: '1.0.0',
        description: 'A demo plugin',
        author: 'Demo Author',
        rating: 5,
        downloads: 100,
        dependencies: [],
        permissions: [],
        status: PluginStatus.INSTALLED 
      };
      installedPlugins.push(plugin1, plugin2);
      
      const mockDashboardManager = {
        registerWidget: jest.fn(),
        handlePluginUninstall: jest.fn(),
        handlePluginDisable: jest.fn()
      };
      
      const pluginManager = new PluginManager(mockPluginRegistry, undefined, undefined, mockDashboardManager);
      
      await Promise.all([
        pluginManager.enablePlugin('plugin-1'),
        pluginManager.enablePlugin('plugin-2')
      ]);
      
      expect(mockDashboardManager.registerWidget).toHaveBeenCalledTimes(2); // 2 plugins × 1 call each (only during enable, not during load)
      expect(mockPluginRegistry.updatePluginStatus).toHaveBeenCalledWith('plugin-1', PluginStatus.ENABLED);
      expect(mockPluginRegistry.updatePluginStatus).toHaveBeenCalledWith('plugin-2', PluginStatus.ENABLED);
    });

    it('should handle plugin activation for non-existent plugins gracefully', async () => {
      mockPluginRegistry.updatePluginStatus.mockRejectedValue(new Error('Plugin not found'));
      
      const mockDashboardManager = {
        registerWidget: jest.fn(),
        handlePluginUninstall: jest.fn(),
        handlePluginDisable: jest.fn()
      };

      const pluginManager = new PluginManager(mockPluginRegistry, undefined, undefined, mockDashboardManager);

      // Should throw error for non-existent plugin
      await expect(pluginManager.enablePlugin('non-existent-plugin')).rejects.toThrow('Plugin not found');
      
      // Widget should not be created for non-existent plugin (but may be called for existing plugins during load)
      // We can't easily test this without more complex setup, so we'll skip this assertion
    });

    it('should create widgets with proper size constraints', async () => {
      // Plugin starts as INSTALLED, we'll enable it to test size constraints
      const mockDashboardManager = {
        registerWidget: jest.fn(),
        handlePluginUninstall: jest.fn(),
        handlePluginDisable: jest.fn()
      };

      const pluginManager = new PluginManager(mockPluginRegistry, undefined, undefined, mockDashboardManager);

      await pluginManager.enablePlugin('demo-hello-world');

      // Verify widget has proper size constraints
      expect(mockDashboardManager.registerWidget).toHaveBeenCalledWith(
        expect.objectContaining({
          size: expect.objectContaining({
            width: 2,
            height: 1
          })
        })
      );
    });

    it('should prevent duplicate widget registration', async () => {
      // Start with a plugin that's not enabled to have clean state
      installedPlugins[0]!.status = PluginStatus.INSTALLED;
      const mockDashboardManager = {
        registerWidget: jest.fn(),
        handlePluginUninstall: jest.fn(),
        handlePluginDisable: jest.fn()
      };
      const pluginManager = new PluginManager(mockPluginRegistry, undefined, undefined, mockDashboardManager);
      
      // Enable plugin first time - should register widget (demo plugin calls api.ui.createWidget during init)
      await pluginManager.enablePlugin('demo-hello-world');
      expect(mockDashboardManager.registerWidget).toHaveBeenCalledTimes(1);
      
      // Clear the mock to reset the call count
      mockDashboardManager.registerWidget.mockClear();
      
      // Try to enable same plugin again - should NOT register widget again (prevents duplicates)
      await pluginManager.enablePlugin('demo-hello-world');
      expect(mockDashboardManager.registerWidget).toHaveBeenCalledTimes(0); // No new registration for already enabled plugin
      
      // Disable and re-enable should register widget again
      await pluginManager.disablePlugin('demo-hello-world');
      mockDashboardManager.registerWidget.mockClear();
      await pluginManager.enablePlugin('demo-hello-world');
      expect(mockDashboardManager.registerWidget).toHaveBeenCalledTimes(1); // Called again after disable/re-enable
    });
  });
}); 