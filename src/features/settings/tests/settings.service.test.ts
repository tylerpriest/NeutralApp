import { SettingsService } from '../services/settings.service';
import { ValidationResult, RecoveryResult, SettingType } from '../../../shared/types';

// Mock storage backend
const mockStorage = {
  get: jest.fn(),
  set: jest.fn(),
  delete: jest.fn(),
  clear: jest.fn(),
  keys: jest.fn(),
};

// Mock validation engine
const mockValidator = {
  validateSetting: jest.fn(),
  validateSchema: jest.fn(),
  sanitizeValue: jest.fn(),
};

describe('SettingsService', () => {
  let settingsService: SettingsService;

  beforeEach(() => {
    jest.clearAllMocks();
    settingsService = new SettingsService();
    
    // Set up default mock behaviors
    mockValidator.sanitizeValue.mockImplementation((value: any) => value);
    
    // Inject mocks
    (settingsService as any).storage = mockStorage;
    (settingsService as any).validator = mockValidator;
  });

  describe('getSetting', () => {
    it('should retrieve a core setting successfully', async () => {
      const mockValue = 'dark';
      mockStorage.get.mockResolvedValue({
        key: 'theme',
        value: mockValue,
        type: SettingType.STRING,
        userId: null,
        pluginId: null
      });

      const result = await settingsService.getSetting<string>('theme');

      expect(result).toBe(mockValue);
      expect(mockStorage.get).toHaveBeenCalledWith('core.theme');
    });

    it('should retrieve a user-specific setting', async () => {
      const mockValue = 'en';
      mockStorage.get.mockResolvedValue({
        key: 'language',
        value: mockValue,
        type: SettingType.STRING,
        userId: 'user-123',
        pluginId: null
      });

      const result = await settingsService.getSetting<string>('language', 'user-123');

      expect(result).toBe(mockValue);
      expect(mockStorage.get).toHaveBeenCalledWith('user-123.language');
    });

    it('should return null for non-existent setting', async () => {
      mockStorage.get.mockResolvedValue(null);

      const result = await settingsService.getSetting<string>('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle storage errors gracefully', async () => {
      mockStorage.get.mockRejectedValue(new Error('Storage error'));

      const result = await settingsService.getSetting<string>('theme');

      expect(result).toBeNull();
    });
  });

  describe('setSetting', () => {
    it('should set a core setting with validation', async () => {
      mockValidator.validateSetting.mockResolvedValue({ isValid: true, errors: [] });
      mockStorage.set.mockResolvedValue(undefined);

      await settingsService.setSetting('theme', 'dark');

      expect(mockValidator.validateSetting).toHaveBeenCalledWith('theme', 'dark');
      expect(mockStorage.set).toHaveBeenCalledWith('core.theme', {
        key: 'theme',
        value: 'dark',
        type: SettingType.STRING,
        userId: undefined,
        pluginId: undefined,
        updatedAt: expect.any(Date),
        validation: []
      });
    });

    it('should set a user-specific setting', async () => {
      mockValidator.validateSetting.mockResolvedValue({ isValid: true, errors: [] });
      mockStorage.set.mockResolvedValue(undefined);

      await settingsService.setSetting('notifications', true, 'user-123');

      expect(mockStorage.set).toHaveBeenCalledWith('user-123.notifications', expect.objectContaining({
        key: 'notifications',
        value: true,
        type: SettingType.BOOLEAN,
        userId: 'user-123'
      }));
    });

    it('should reject invalid setting values', async () => {
      mockValidator.validateSetting.mockResolvedValue({ 
        isValid: false, 
        errors: ['Invalid theme value'] 
      });

      await expect(settingsService.setSetting('theme', 'invalid')).rejects.toThrow('Setting validation failed: Invalid theme value');
      expect(mockStorage.set).not.toHaveBeenCalled();
    });

    it('should handle different data types correctly', async () => {
      mockValidator.validateSetting.mockResolvedValue({ isValid: true, errors: [] });
      mockStorage.set.mockResolvedValue(undefined);

      // Test number
      await settingsService.setSetting('maxRetries', 5);
      expect(mockStorage.set).toHaveBeenCalledWith('core.maxRetries', expect.objectContaining({
        type: SettingType.NUMBER,
        value: 5
      }));

      // Test object
      await settingsService.setSetting('config', { timeout: 30, retries: 3 });
      expect(mockStorage.set).toHaveBeenCalledWith('core.config', expect.objectContaining({
        type: SettingType.OBJECT,
        value: { timeout: 30, retries: 3 }
      }));

      // Test array
      await settingsService.setSetting('tags', ['important', 'urgent']);
      expect(mockStorage.set).toHaveBeenCalledWith('core.tags', expect.objectContaining({
        type: SettingType.ARRAY,
        value: ['important', 'urgent']
      }));
    });
  });

  describe('getPluginSettings', () => {
    it('should retrieve all settings for a specific plugin', async () => {
      const mockPluginSettings = {
        'plugin-1.apiKey': { key: 'apiKey', value: 'secret-key', pluginId: 'plugin-1' },
        'plugin-1.timeout': { key: 'timeout', value: 30, pluginId: 'plugin-1' },
        'plugin-1.enabled': { key: 'enabled', value: true, pluginId: 'plugin-1' }
      };

      mockStorage.keys.mockResolvedValue(Object.keys(mockPluginSettings));
      mockStorage.get.mockImplementation((key: string) => Promise.resolve(mockPluginSettings[key as keyof typeof mockPluginSettings] || null));

      const result = await settingsService.getPluginSettings('plugin-1');

      expect(result).toEqual({
        apiKey: 'secret-key',
        timeout: 30,
        enabled: true
      });
    });

    it('should return empty object for plugin with no settings', async () => {
      mockStorage.keys.mockResolvedValue([]);

      const result = await settingsService.getPluginSettings('plugin-empty');

      expect(result).toEqual({});
    });
  });

  describe('setPluginSetting', () => {
    it('should set a plugin-specific setting', async () => {
      mockValidator.validateSetting.mockResolvedValue({ isValid: true, errors: [] });
      mockStorage.set.mockResolvedValue(undefined);
      mockStorage.keys.mockResolvedValue(['plugin-1.apiKey']); // Mock existing setting

      await settingsService.setPluginSetting('plugin-1', 'apiKey', 'new-secret');

      expect(mockStorage.set).toHaveBeenCalledWith('plugin-1.apiKey', expect.objectContaining({
        key: 'apiKey',
        value: 'new-secret',
        pluginId: 'plugin-1',
        userId: undefined
      }));
    });

    it('should set a user-specific plugin setting', async () => {
      mockValidator.validateSetting.mockResolvedValue({ isValid: true, errors: [] });
      mockStorage.set.mockResolvedValue(undefined);
      mockStorage.keys.mockResolvedValue(['plugin-1.preference']); // Mock existing setting

      await settingsService.setPluginSetting('plugin-1', 'preference', 'custom', 'user-123');

      expect(mockStorage.set).toHaveBeenCalledWith('user-123.plugin-1.preference', expect.objectContaining({
        key: 'preference',
        value: 'custom',
        pluginId: 'plugin-1',
        userId: 'user-123'
      }));
    });
  });

  describe('resetToDefaults', () => {
    it('should reset all core settings to defaults', async () => {
      mockStorage.keys.mockResolvedValue(['core.theme', 'core.language', 'user-123.notifications']);
      mockStorage.delete.mockResolvedValue(undefined);

      await settingsService.resetToDefaults();

      expect(mockStorage.delete).toHaveBeenCalledWith('core.theme');
      expect(mockStorage.delete).toHaveBeenCalledWith('core.language');
      expect(mockStorage.delete).not.toHaveBeenCalledWith('user-123.notifications');
    });

    it('should reset plugin-specific settings', async () => {
      mockStorage.keys.mockResolvedValue(['plugin-1.apiKey', 'plugin-1.timeout', 'plugin-2.setting']);
      mockStorage.delete.mockResolvedValue(undefined);

      await settingsService.resetToDefaults('plugin-1');

      expect(mockStorage.delete).toHaveBeenCalledWith('plugin-1.apiKey');
      expect(mockStorage.delete).toHaveBeenCalledWith('plugin-1.timeout');
      expect(mockStorage.delete).not.toHaveBeenCalledWith('plugin-2.setting');
    });

    it('should reset user-specific settings', async () => {
      mockStorage.keys.mockResolvedValue(['user-123.theme', 'user-123.plugin-1.setting', 'user-456.theme']);
      mockStorage.delete.mockResolvedValue(undefined);

      await settingsService.resetToDefaults('user-123');

      expect(mockStorage.delete).toHaveBeenCalledWith('user-123.theme');
      expect(mockStorage.delete).toHaveBeenCalledWith('user-123.plugin-1.setting');
      expect(mockStorage.delete).not.toHaveBeenCalledWith('user-456.theme');
    });
  });

  describe('validateSetting', () => {
    it('should validate setting with built-in rules', async () => {
      const mockValidation: ValidationResult = {
        isValid: true,
        errors: []
      };
      mockValidator.validateSetting.mockResolvedValue(mockValidation);

      const result = await settingsService.validateSetting('theme', 'dark');

      expect(result).toEqual(mockValidation);
      expect(mockValidator.validateSetting).toHaveBeenCalledWith('theme', 'dark');
    });

    it('should return validation errors for invalid settings', async () => {
      const mockValidation: ValidationResult = {
        isValid: false,
        errors: ['Value must be one of: light, dark']
      };
      mockValidator.validateSetting.mockResolvedValue(mockValidation);

      const result = await settingsService.validateSetting('theme', 'rainbow');

      expect(result).toEqual(mockValidation);
    });
  });

  describe('recoverCorruptedSettings', () => {
    it('should identify and recover corrupted settings', async () => {
      const corruptedSettings = [
        'core.theme', // Valid
        'invalid-key', // Invalid format
        'user-123.', // Invalid format
        'plugin-1.setting' // Valid
      ];

      mockStorage.keys.mockResolvedValue(corruptedSettings);
      mockStorage.get.mockImplementation((key) => {
        if (key === 'invalid-key') return Promise.resolve({ corrupted: true });
        if (key === 'user-123.') return Promise.reject(new Error('Parse error'));
        return Promise.resolve({ 
          key: key.split('.').pop(), 
          value: 'valid', 
          type: SettingType.STRING,
          updatedAt: new Date(),
          validation: []
        });
      });
      mockStorage.delete.mockResolvedValue(undefined);

      const result = await settingsService.recoverCorruptedSettings();

      expect(result.success).toBe(true);
      expect(result.recoveredSettings).toContain('core.theme');
      expect(result.recoveredSettings).toContain('plugin-1.setting');
      expect(result.errors).toContain('invalid-key');
      expect(result.errors).toContain('user-123.');
      expect(mockStorage.delete).toHaveBeenCalledWith('invalid-key');
      expect(mockStorage.delete).toHaveBeenCalledWith('user-123.');
    });

    it('should handle recovery errors gracefully', async () => {
      mockStorage.keys.mockRejectedValue(new Error('Storage access failed'));

      const result = await settingsService.recoverCorruptedSettings();

      expect(result.success).toBe(false);
      expect(result.errors).toContain('Failed to access settings storage');
    });
  });

  describe('Settings hierarchical structure', () => {
    it('should prioritize user settings over core settings', async () => {
      // Mock core setting
      mockStorage.get.mockImplementation((key) => {
        if (key === 'core.theme') return Promise.resolve({ value: 'light', type: SettingType.STRING });
        if (key === 'user-123.theme') return Promise.resolve({ value: 'dark', type: SettingType.STRING });
        return Promise.resolve(null);
      });

      const result = await settingsService.getSetting<string>('theme', 'user-123');

      expect(result).toBe('dark'); // User setting takes precedence
    });

    it('should fall back to core settings when user setting not found', async () => {
      mockStorage.get.mockImplementation((key) => {
        if (key === 'core.language') return Promise.resolve({ value: 'en', type: SettingType.STRING });
        if (key === 'user-123.language') return Promise.resolve(null);
        return Promise.resolve(null);
      });

      const result = await settingsService.getSetting<string>('language', 'user-123');

      expect(result).toBe('en'); // Falls back to core setting
    });
  });

  describe('Settings change notifications', () => {
    it('should notify subscribers when settings change', async () => {
      const mockCallback = jest.fn();
      mockValidator.validateSetting.mockResolvedValue({ isValid: true, errors: [] });
      mockStorage.set.mockResolvedValue(undefined);

      settingsService.subscribe('theme', mockCallback);
      await settingsService.setSetting('theme', 'dark');

      expect(mockCallback).toHaveBeenCalledWith('theme', 'dark', null);
    });

    it('should support unsubscribing from notifications', async () => {
      const mockCallback = jest.fn();
      mockValidator.validateSetting.mockResolvedValue({ isValid: true, errors: [] });
      mockStorage.set.mockResolvedValue(undefined);

      const unsubscribe = settingsService.subscribe('theme', mockCallback);
      unsubscribe();
      await settingsService.setSetting('theme', 'dark');

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });
}); 

 
  describe('Plugin Settings Integration', () => {
    let settingsService: SettingsService;

    beforeEach(() => {
      jest.clearAllMocks();
      settingsService = new SettingsService();
      
      // Set up default mock behaviors
      mockValidator.sanitizeValue.mockImplementation((value: any) => value);
      mockStorage.keys.mockResolvedValue([]); // Default to empty keys
      mockStorage.set.mockResolvedValue(undefined);
      mockStorage.get.mockResolvedValue(null);
      
      // Inject mocks
      (settingsService as any).storage = mockStorage;
      (settingsService as any).validator = mockValidator;
    });

  describe('Plugin Settings Registration', () => {
    it('should register plugin settings after plugin installation', async () => {
      const pluginInfo = {
        id: 'demo-hello-world',
        name: 'Hello World Plugin',
        settings: {
          greeting: { type: 'string', default: 'Hello World!', description: 'Custom greeting message' },
          updateInterval: { type: 'number', default: 1000, description: 'Update interval in milliseconds' }
        }
      };

      await settingsService.registerPluginSettings(pluginInfo);

      const pluginSettings = await settingsService.getPluginSettings('demo-hello-world');
      expect(pluginSettings).toBeDefined();
      expect(pluginSettings.greeting).toBe('Hello World!');
      expect(pluginSettings.updateInterval).toBe(1000);
    });

    it('should handle plugin settings with different data types', async () => {
      const pluginInfo = {
        id: 'test-plugin',
        name: 'Test Plugin',
        settings: {
          stringSetting: { type: 'string', default: 'default value', description: 'String setting' },
          numberSetting: { type: 'number', default: 42, description: 'Number setting' },
          booleanSetting: { type: 'boolean', default: true, description: 'Boolean setting' },
          arraySetting: { type: 'array', default: ['item1', 'item2'], description: 'Array setting' }
        }
      };

      await settingsService.registerPluginSettings(pluginInfo);

      const settings = await settingsService.getPluginSettings('test-plugin');
      expect(settings.stringSetting).toBe('default value');
      expect(settings.numberSetting).toBe(42);
      expect(settings.booleanSetting).toBe(true);
      expect(settings.arraySetting).toEqual(['item1', 'item2']);
    });

    it('should not overwrite existing plugin settings on re-registration', async () => {
      const pluginInfo = {
        id: 'demo-hello-world',
        name: 'Hello World Plugin',
        settings: {
          greeting: { type: 'string', default: 'Hello World!', description: 'Custom greeting message' }
        }
      };

      // First registration
      await settingsService.registerPluginSettings(pluginInfo);
      await settingsService.setPluginSetting('demo-hello-world', 'greeting', 'Custom Greeting');

      // Second registration (should not overwrite)
      await settingsService.registerPluginSettings(pluginInfo);

      const settings = await settingsService.getPluginSettings('demo-hello-world');
      expect(settings.greeting).toBe('Custom Greeting'); // Should preserve user value
    });

    it('should validate plugin settings schema', async () => {
      const invalidPluginInfo = {
        id: 'invalid-plugin',
        name: 'Invalid Plugin',
        settings: {
          invalidSetting: { type: 'invalid-type', default: 'value', description: 'Invalid setting' }
        }
      };

      await expect(settingsService.registerPluginSettings(invalidPluginInfo))
        .rejects.toThrow('Invalid setting type: invalid-type');
    });
  });

  describe('Plugin Settings Management', () => {
    beforeEach(async () => {
      // Clear any existing settings first
      await settingsService.removePluginSettings('demo-hello-world');
      
      const pluginInfo = {
        id: 'demo-hello-world',
        name: 'Hello World Plugin',
        settings: {
          greeting: { type: 'string', default: 'Hello World!', description: 'Custom greeting message' },
          updateInterval: { type: 'number', default: 1000, description: 'Update interval in milliseconds' }
        }
      };
      await settingsService.registerPluginSettings(pluginInfo);
    });

    it('should get plugin settings by plugin ID', async () => {
      const settings = await settingsService.getPluginSettings('demo-hello-world');
      expect(settings).toBeDefined();
      expect(settings.greeting).toBe('Hello World!');
      expect(settings.updateInterval).toBe(1000);
    });

    it('should set individual plugin setting', async () => {
      await settingsService.setPluginSetting('demo-hello-world', 'greeting', 'Custom Message');
      
      const settings = await settingsService.getPluginSettings('demo-hello-world');
      expect(settings.greeting).toBe('Custom Message');
    });

    it('should update multiple plugin settings at once', async () => {
      await settingsService.updatePluginSettings('demo-hello-world', {
        greeting: 'Updated Greeting',
        updateInterval: 2000
      });

      const settings = await settingsService.getPluginSettings('demo-hello-world');
      expect(settings.greeting).toBe('Updated Greeting');
      expect(settings.updateInterval).toBe(2000);
    });

    it('should validate setting values against schema', async () => {
      await expect(settingsService.setPluginSetting('demo-hello-world', 'updateInterval', 'not-a-number'))
        .rejects.toThrow('Invalid value type for setting updateInterval');

      await expect(settingsService.setPluginSetting('demo-hello-world', 'nonexistent', 'value'))
        .rejects.toThrow('Setting nonexistent not found for plugin demo-hello-world');
    });

    it('should reset plugin settings to defaults', async () => {
      // Change settings from defaults
      await settingsService.setPluginSetting('demo-hello-world', 'greeting', 'Custom Message');
      await settingsService.setPluginSetting('demo-hello-world', 'updateInterval', 2000);

      // Reset to defaults
      await settingsService.resetPluginSettings('demo-hello-world');

      const settings = await settingsService.getPluginSettings('demo-hello-world');
      expect(Object.keys(settings)).toHaveLength(0);
      
      // Re-register to get defaults back
      const pluginInfo = {
        id: 'demo-hello-world',
        name: 'Hello World Plugin',
        settings: {
          greeting: { type: 'string', default: 'Hello World!', description: 'Custom greeting message' },
          updateInterval: { type: 'number', default: 1000, description: 'Update interval in milliseconds' }
        }
      };
      await settingsService.registerPluginSettings(pluginInfo);
      
      const newSettings = await settingsService.getPluginSettings('demo-hello-world');
      expect(newSettings.greeting).toBe('Hello World!');
      expect(newSettings.updateInterval).toBe(1000);
    });

    it('should remove plugin settings when plugin is uninstalled', async () => {
      await settingsService.removePluginSettings('demo-hello-world');

      const settings = await settingsService.getPluginSettings('demo-hello-world');
      expect(Object.keys(settings)).toHaveLength(0);
    });
  });

  describe('Plugin Settings Persistence', () => {
    it('should persist plugin settings to storage', async () => {
      const pluginInfo = {
        id: 'demo-hello-world',
        name: 'Hello World Plugin',
        settings: {
          greeting: { type: 'string', default: 'Hello World!', description: 'Custom greeting message' }
        }
      };

      await settingsService.registerPluginSettings(pluginInfo);
      await settingsService.setPluginSetting('demo-hello-world', 'greeting', 'Persisted Message');

      // Create new instance to test persistence
      const newSettingsService = new SettingsService();
      await newSettingsService.loadSettings();

      const settings = await newSettingsService.getPluginSettings('demo-hello-world');
      expect(settings.greeting).toBe('Persisted Message');
    });

    it('should handle corrupted plugin settings gracefully', async () => {
      // Mock corrupted storage
      const mockStorage = {
        getItem: jest.fn().mockReturnValue('invalid-json'),
        setItem: jest.fn()
      };
      Object.defineProperty(window, 'localStorage', { value: mockStorage });

      const settingsService = new SettingsService();
      await expect(settingsService.loadSettings()).resolves.not.toThrow();
    });
  });

  describe('Plugin Settings Integration with PluginManager', () => {
    it('should automatically register settings when plugin is installed', async () => {
      // Mock storage to return empty keys initially, then the new setting after registration
      mockStorage.keys.mockResolvedValueOnce([]); // No existing settings
      mockStorage.set.mockResolvedValue(undefined);
      mockStorage.get.mockResolvedValue({
        key: 'autoSetting',
        value: 'auto',
        type: SettingType.STRING,
        userId: undefined,
        pluginId: 'auto-installed-plugin'
      });
      mockStorage.keys.mockResolvedValueOnce(['auto-installed-plugin.autoSetting']); // After registration

      const pluginInfo = {
        id: 'auto-installed-plugin',
        name: 'Auto Installed Plugin',
        settings: {
          autoSetting: { type: 'string', default: 'auto', description: 'Auto setting' }
        }
      };

      await settingsService.registerPluginSettings(pluginInfo);
      
      const settings = await settingsService.getPluginSettings('auto-installed-plugin');
      expect(settings.autoSetting).toBe('auto');
    });

    it('should handle plugin settings updates when plugin is updated', async () => {
      // Mock storage for the entire flow
      mockStorage.keys.mockResolvedValueOnce([]); // No existing settings initially
      mockStorage.set.mockResolvedValue(undefined);
      mockStorage.get.mockResolvedValue({
        key: 'oldSetting',
        value: 'custom value',
        type: SettingType.STRING,
        userId: undefined,
        pluginId: 'updatable-plugin'
      });
      mockStorage.keys.mockResolvedValueOnce(['updatable-plugin.oldSetting']); // After first registration
      mockStorage.keys.mockResolvedValueOnce(['updatable-plugin.oldSetting']); // For setPluginSetting validation
      mockStorage.keys.mockResolvedValueOnce(['updatable-plugin.oldSetting']); // For updatePluginSettingsSchema
      mockStorage.get.mockResolvedValueOnce({
        key: 'oldSetting',
        value: 'custom value',
        type: SettingType.STRING,
        userId: undefined,
        pluginId: 'updatable-plugin'
      });
      mockStorage.get.mockResolvedValueOnce({
        key: 'newSetting',
        value: 100,
        type: SettingType.NUMBER,
        userId: undefined,
        pluginId: 'updatable-plugin'
      });
      mockStorage.keys.mockResolvedValueOnce(['updatable-plugin.oldSetting', 'updatable-plugin.newSetting']); // Final state

      const originalPluginInfo = {
        id: 'updatable-plugin',
        name: 'Updatable Plugin',
        settings: {
          oldSetting: { type: 'string', default: 'old', description: 'Old setting' }
        }
      };

      await settingsService.registerPluginSettings(originalPluginInfo);
      await settingsService.setPluginSetting('updatable-plugin', 'oldSetting', 'custom value');

      // Plugin update with new settings
      const updatedPluginInfo = {
        id: 'updatable-plugin',
        name: 'Updatable Plugin v2',
        settings: {
          oldSetting: { type: 'string', default: 'new', description: 'Updated setting' },
          newSetting: { type: 'number', default: 100, description: 'New setting' }
        }
      };

      await settingsService.updatePluginSettingsSchema(updatedPluginInfo);

      const settings = await settingsService.getPluginSettings('updatable-plugin');
      expect(settings.oldSetting).toBe('custom value'); // Should preserve user value
      expect(settings.newSetting).toBe(100); // Should add new setting with default
    });
  });
}); 

 