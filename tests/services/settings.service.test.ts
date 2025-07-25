import { SettingsService } from '../../src/services/settings.service';
import { ValidationResult, RecoveryResult, SettingType } from '../../src/types';

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
        userId: null,
        pluginId: null,
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

      await settingsService.setPluginSetting('plugin-1', 'apiKey', 'new-secret');

      expect(mockStorage.set).toHaveBeenCalledWith('plugin-1.apiKey', expect.objectContaining({
        key: 'apiKey',
        value: 'new-secret',
        pluginId: 'plugin-1',
        userId: null
      }));
    });

    it('should set a user-specific plugin setting', async () => {
      mockValidator.validateSetting.mockResolvedValue({ isValid: true, errors: [] });
      mockStorage.set.mockResolvedValue(undefined);

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
        return Promise.resolve({ key, value: 'valid', type: SettingType.STRING });
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

      expect(mockCallback).toHaveBeenCalledWith('theme', 'dark', undefined);
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