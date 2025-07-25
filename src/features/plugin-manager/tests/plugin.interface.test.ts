import { IPluginManager, IPluginAPI, IPluginSandbox } from '../interfaces/plugin.interface';
import { PluginInfo, PluginPackage, InstallResult, PluginStatus } from '../../../shared/types';

describe('Plugin Management Interfaces', () => {
  describe('IPluginManager', () => {
    it('should define plugin lifecycle methods with correct signatures', () => {
      const mockPluginManager: IPluginManager = {
        getAvailablePlugins: jest.fn() as () => Promise<PluginInfo[]>,
        installPlugin: jest.fn() as (pluginPackage: PluginPackage) => Promise<InstallResult>,
        enablePlugin: jest.fn() as (pluginId: string) => Promise<void>,
        disablePlugin: jest.fn() as (pluginId: string) => Promise<void>,
        uninstallPlugin: jest.fn() as (pluginId: string, cleanupData?: boolean) => Promise<void>,
        getInstalledPlugins: jest.fn() as () => Promise<PluginInfo[]>,
        resolveDependencies: jest.fn() as (pluginId: string) => Promise<any[]>,
        downloadAndVerifyPlugin: jest.fn() as (pluginId: string) => Promise<PluginPackage>,
        handlePluginFailure: jest.fn() as (pluginId: string, error: Error) => void,
      };

      expect(typeof mockPluginManager.getAvailablePlugins).toBe('function');
      expect(typeof mockPluginManager.installPlugin).toBe('function');
      expect(typeof mockPluginManager.enablePlugin).toBe('function');
      expect(typeof mockPluginManager.disablePlugin).toBe('function');
      expect(typeof mockPluginManager.uninstallPlugin).toBe('function');
      expect(typeof mockPluginManager.getInstalledPlugins).toBe('function');
      expect(typeof mockPluginManager.resolveDependencies).toBe('function');
      expect(typeof mockPluginManager.downloadAndVerifyPlugin).toBe('function');
      expect(typeof mockPluginManager.handlePluginFailure).toBe('function');
    });

    it('should validate PluginInfo type structure', () => {
      const pluginInfo: PluginInfo = {
        id: 'test-plugin',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'A test plugin for validation',
        author: 'Test Author',
        rating: 4.5,
        downloads: 1000,
        dependencies: [],
        permissions: [],
        status: PluginStatus.AVAILABLE
      };

      expect(pluginInfo.id).toBe('test-plugin');
      expect(pluginInfo.name).toBe('Test Plugin');
      expect(typeof pluginInfo.rating).toBe('number');
      expect(typeof pluginInfo.downloads).toBe('number');
      expect(Array.isArray(pluginInfo.dependencies)).toBe(true);
      expect(Array.isArray(pluginInfo.permissions)).toBe(true);
      expect(Object.values(PluginStatus)).toContain(pluginInfo.status);
    });

    it('should validate InstallResult type structure', () => {
      const installResult: InstallResult = {
        success: true,
        pluginId: 'test-plugin',
        dependenciesInstalled: ['dependency-1', 'dependency-2']
      };

      expect(typeof installResult.success).toBe('boolean');
      expect(typeof installResult.pluginId).toBe('string');
      expect(Array.isArray(installResult.dependenciesInstalled)).toBe(true);
    });
  });

  describe('IPluginAPI', () => {
    it('should define plugin API methods with correct signatures', () => {
      const mockPluginAPI: IPluginAPI = {
        registerUIComponent: jest.fn() as (component: any) => void,
        registerSettingsSchema: jest.fn() as (schema: any) => void,
        registerDashboardWidget: jest.fn() as (widget: any) => void,
        emitEvent: jest.fn() as (event: any) => void,
        subscribeToEvent: jest.fn() as (eventType: string, handler: any) => void,
        getPluginStorage: jest.fn() as () => any,
        logSecurityViolation: jest.fn() as (violation: any) => void,
      };

      expect(typeof mockPluginAPI.registerUIComponent).toBe('function');
      expect(typeof mockPluginAPI.registerSettingsSchema).toBe('function');
      expect(typeof mockPluginAPI.registerDashboardWidget).toBe('function');
      expect(typeof mockPluginAPI.emitEvent).toBe('function');
      expect(typeof mockPluginAPI.subscribeToEvent).toBe('function');
      expect(typeof mockPluginAPI.getPluginStorage).toBe('function');
      expect(typeof mockPluginAPI.logSecurityViolation).toBe('function');
    });
  });

  describe('IPluginSandbox', () => {
    it('should define sandboxing methods with correct signatures', () => {
      const mockPluginSandbox: IPluginSandbox = {
        loadPlugin: jest.fn() as (pluginId: string, pluginCode: string) => Promise<any>,
        unloadPlugin: jest.fn() as (pluginId: string) => Promise<void>,
        executeInSandbox: jest.fn() as (pluginId: string, operation: () => any) => Promise<any>,
        restrictAPI: jest.fn() as (pluginId: string, allowedAPIs: string[]) => void,
      };

      expect(typeof mockPluginSandbox.loadPlugin).toBe('function');
      expect(typeof mockPluginSandbox.unloadPlugin).toBe('function');
      expect(typeof mockPluginSandbox.executeInSandbox).toBe('function');
      expect(typeof mockPluginSandbox.restrictAPI).toBe('function');
    });
  });

  describe('PluginStatus Enum', () => {
    it('should contain all expected status values', () => {
      const expectedStatuses = ['available', 'installed', 'enabled', 'disabled', 'error'];
      const actualStatuses = Object.values(PluginStatus);

      expectedStatuses.forEach(status => {
        expect(actualStatuses).toContain(status);
      });
    });
  });
}); 