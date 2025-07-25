import { PluginManager } from '../services/plugin.manager';
import { PluginInfo, PluginPackage, InstallResult, PluginStatus } from '../../../shared/types';

// Mock dependencies
jest.mock('../services/dependency.resolver');
jest.mock('../services/plugin.verifier');

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

describe('PluginManager', () => {
  let pluginManager: PluginManager;

  beforeEach(() => {
    jest.clearAllMocks();
    pluginManager = new PluginManager();
    
    // Inject mocks
    (pluginManager as any).dependencyResolver = mockDependencyResolver;
    (pluginManager as any).pluginVerifier = mockPluginVerifier;
    (pluginManager as any).pluginRegistry = mockPluginRegistry;
  });

  describe('getAvailablePlugins', () => {
    it('should return list of available plugins', async () => {
      const mockPlugins: PluginInfo[] = [
        {
          id: 'plugin-1',
          name: 'Test Plugin 1',
          version: '1.0.0',
          description: 'A test plugin',
          author: 'Test Author',
          rating: 4.5,
          downloads: 1000,
          dependencies: [],
          permissions: [],
          status: PluginStatus.AVAILABLE
        }
      ];

      mockPluginRegistry.getAvailablePlugins.mockResolvedValue(mockPlugins);

      const result = await pluginManager.getAvailablePlugins();

      expect(result).toEqual(mockPlugins);
      expect(mockPluginRegistry.getAvailablePlugins).toHaveBeenCalled();
    });

    it('should handle registry errors gracefully', async () => {
      mockPluginRegistry.getAvailablePlugins.mockRejectedValue(new Error('Registry error'));

      const result = await pluginManager.getAvailablePlugins();

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
    it('should return list of installed plugins', async () => {
      const mockInstalledPlugins: PluginInfo[] = [
        {
          id: 'installed-plugin',
          name: 'Installed Plugin',
          version: '1.0.0',
          description: 'An installed plugin',
          author: 'Test Author',
          rating: 4.0,
          downloads: 500,
          dependencies: [],
          permissions: [],
          status: PluginStatus.ENABLED
        }
      ];

      mockPluginRegistry.getInstalledPlugins.mockResolvedValue(mockInstalledPlugins);

      const result = await pluginManager.getInstalledPlugins();

      expect(result).toEqual(mockInstalledPlugins);
      expect(mockPluginRegistry.getInstalledPlugins).toHaveBeenCalled();
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
        id: 'downloaded-plugin',
        version: '1.0.0',
        code: 'downloaded code',
        manifest: {
          id: 'downloaded-plugin',
          name: 'Downloaded Plugin',
          version: '1.0.0',
          description: 'A downloaded plugin',
          author: 'Remote Author',
          main: 'index.js',
          dependencies: [],
          permissions: [],
          api: []
        },
        signature: 'download-signature'
      };

      // Mock the download and verification process
      const mockDownload = jest.fn().mockResolvedValue(mockDownloadedPackage);
      (pluginManager as any).downloadFromRegistry = mockDownload;
      mockPluginVerifier.verifyPluginSignature.mockResolvedValue(true);

      const result = await pluginManager.downloadAndVerifyPlugin('downloaded-plugin');

      expect(result).toEqual(mockDownloadedPackage);
      expect(mockDownload).toHaveBeenCalledWith('downloaded-plugin');
      expect(mockPluginVerifier.verifyPluginSignature).toHaveBeenCalledWith(mockDownloadedPackage);
    });

    it('should reject plugin with failed verification', async () => {
      const mockDownloadedPackage: PluginPackage = {
        id: 'downloaded-plugin',
        version: '1.0.0',
        code: 'downloaded code',
        manifest: {
          id: 'downloaded-plugin',
          name: 'Downloaded Plugin',
          version: '1.0.0',
          description: 'A downloaded plugin',
          author: 'Remote Author',
          main: 'index.js',
          dependencies: [],
          permissions: [],
          api: []
        },
        signature: 'invalid-signature'
      };

      const mockDownload = jest.fn().mockResolvedValue(mockDownloadedPackage);
      (pluginManager as any).downloadFromRegistry = mockDownload;
      mockPluginVerifier.verifyPluginSignature.mockResolvedValue(false);

      await expect(pluginManager.downloadAndVerifyPlugin('downloaded-plugin')).rejects.toThrow('Plugin verification failed');
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
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      pluginManager.handlePluginFailure('failing-plugin', mockError);

      expect(consoleSpy).toHaveBeenCalledWith('Plugin failing-plugin failed:', mockError);

      consoleSpy.mockRestore();
    });
  });
}); 