import { ISettingsService } from '../interfaces/settings.interface';
import { ValidationResult, RecoveryResult, SettingType, Settings } from '../../../shared';

interface SettingsSubscriber {
  key: string;
  callback: (key: string, value: any, userId: string | null) => void;
}

export class SettingsService implements ISettingsService {
  private storage: any;
  private validator: any;
  private subscribers: SettingsSubscriber[] = [];

  constructor() {
    this.initializeComponents();
  }

  private initializeComponents(): void {
    // Initialize storage backend (localStorage, database, etc.)
    this.storage = {
      get: async (key: string) => {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            const stored = localStorage.getItem(`settings.${key}`);
            return stored ? JSON.parse(stored) : null;
          }
          return null;
        } catch (error) {
          console.error(`Error reading setting ${key}:`, error);
          return null;
        }
      },
      set: async (key: string, value: Settings) => {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.setItem(`settings.${key}`, JSON.stringify(value));
          }
        } catch (error) {
          console.error(`Error saving setting ${key}:`, error);
          throw error;
        }
      },
      delete: async (key: string) => {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            localStorage.removeItem(`settings.${key}`);
          }
        } catch (error) {
          console.error(`Error deleting setting ${key}:`, error);
          throw error;
        }
      },
      clear: async () => {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            const keys = Object.keys(localStorage).filter(key => key.startsWith('settings.'));
            keys.forEach(key => localStorage.removeItem(key));
          }
        } catch (error) {
          console.error('Error clearing settings:', error);
          throw error;
        }
      },
      keys: async () => {
        try {
          if (typeof window !== 'undefined' && window.localStorage) {
            return Object.keys(localStorage)
              .filter(key => key.startsWith('settings.'))
              .map(key => key.replace('settings.', ''));
          }
          return [];
        } catch (error) {
          console.error('Error getting setting keys:', error);
          return [];
        }
      }
    };

    // Initialize validation engine
    this.validator = {
      validateSetting: async (key: string, value: any): Promise<ValidationResult> => {
        const errors: string[] = [];

        // Built-in validation rules
        const validationRules = this.getValidationRules(key);
        
        for (const rule of validationRules) {
          if (!this.validateRule(value, rule)) {
            errors.push(rule.message);
          }
        }

        return {
          isValid: errors.length === 0,
          errors
        };
      },
      validateSchema: async (schema: any): Promise<ValidationResult> => {
        // TODO: Implement schema validation
        return { isValid: true, errors: [] };
      },
      sanitizeValue: (value: any): any => {
        // Basic sanitization
        if (typeof value === 'string') {
          return value.trim();
        }
        return value;
      }
    };
  }

  private getValidationRules(key: string): any[] {
    // Define built-in validation rules for common settings
    const rules: Record<string, any[]> = {
      theme: [
        {
          type: 'enum',
          values: ['light', 'dark', 'auto'],
          message: 'Theme must be one of: light, dark, auto'
        }
      ],
      language: [
        {
          type: 'enum',
          values: ['en', 'es', 'fr', 'de', 'ja', 'zh'],
          message: 'Language must be a supported language code'
        }
      ],
      notifications: [
        {
          type: 'boolean',
          message: 'Notifications setting must be true or false'
        }
      ]
    };

    return rules[key] || [];
  }

  private validateRule(value: any, rule: any): boolean {
    switch (rule.type) {
      case 'enum':
        return rule.values.includes(value);
      case 'boolean':
        return typeof value === 'boolean';
      case 'number':
        return typeof value === 'number' && !isNaN(value);
      case 'string':
        return typeof value === 'string';
      case 'range':
        return typeof value === 'number' && value >= rule.min && value <= rule.max;
      default:
        return true;
    }
  }

  private determineSettingType(value: any): SettingType {
    if (typeof value === 'string') return SettingType.STRING;
    if (typeof value === 'number') return SettingType.NUMBER;
    if (typeof value === 'boolean') return SettingType.BOOLEAN;
    if (Array.isArray(value)) return SettingType.ARRAY;
    if (typeof value === 'object' && value !== null) return SettingType.OBJECT;
    return SettingType.STRING;
  }

  private buildKey(key: string, userId?: string, pluginId?: string): string {
    if (userId && pluginId) {
      return `${userId}.${pluginId}.${key}`;
    } else if (userId) {
      return `${userId}.${key}`;
    } else if (pluginId) {
      return `${pluginId}.${key}`;
    } else {
      return `core.${key}`;
    }
  }

  private notifySubscribers(key: string, value: any, userId: string | null): void {
    this.subscribers
      .filter(sub => sub.key === key)
      .forEach(sub => {
        try {
          sub.callback(key, value, userId);
        } catch (error) {
          console.error('Error in settings subscriber:', error);
        }
      });
  }

  async getSetting<T>(key: string, userId?: string): Promise<T | null> {
    try {
      // Try user-specific setting first if userId provided
      if (userId) {
        const userKey = this.buildKey(key, userId);
        const userSetting = await this.storage.get(userKey);
        if (userSetting) {
          return userSetting.value as T;
        }
      }

      // Fall back to core setting
      const coreKey = this.buildKey(key);
      const coreSetting = await this.storage.get(coreKey);
      return coreSetting ? (coreSetting.value as T) : null;
    } catch (error) {
      console.error(`Error getting setting ${key}:`, error);
      return null;
    }
  }

  async setSetting<T>(key: string, value: T, userId?: string): Promise<void> {
    try {
      // Validate the setting value
      const validation = await this.validator.validateSetting(key, value);
      if (!validation.isValid) {
        throw new Error(`Setting validation failed: ${validation.errors.join(', ')}`);
      }

      // Sanitize the value
      const sanitizedValue = this.validator.sanitizeValue(value);

      // Create the setting object
      const setting: Settings = {
        key,
        value: sanitizedValue,
        type: this.determineSettingType(sanitizedValue),
        userId: userId,
        pluginId: undefined,
        validation: [],
        updatedAt: new Date()
      };

      // Build storage key and save
      const storageKey = this.buildKey(key, userId);
      await this.storage.set(storageKey, setting);

      // Notify subscribers
      this.notifySubscribers(key, sanitizedValue, userId || null);
    } catch (error) {
      console.error(`Error setting ${key}:`, error);
      throw error;
    }
  }

  async getPluginSettings(pluginId: string): Promise<Record<string, any>> {
    try {
      const keys = await this.storage.keys();
      const pluginKeys = keys.filter((key: string) => key.startsWith(`${pluginId}.`));
      
      const settings: Record<string, any> = {};
      
      for (const fullKey of pluginKeys) {
        const setting = await this.storage.get(fullKey);
        if (setting) {
          settings[setting.key] = setting.value;
        }
      }

      return settings;
    } catch (error) {
      console.error(`Error getting plugin settings for ${pluginId}:`, error);
      return {};
    }
  }

  async setPluginSetting(pluginId: string, key: string, value: any, userId?: string): Promise<void> {
    try {
      // Validate the setting value
      const validation = await this.validator.validateSetting(key, value);
      if (!validation.isValid) {
        throw new Error(`Plugin setting validation failed: ${validation.errors.join(', ')}`);
      }

      // Sanitize the value
      const sanitizedValue = this.validator.sanitizeValue(value);

      // Create the setting object
      const setting: Settings = {
        key,
        value: sanitizedValue,
        type: this.determineSettingType(sanitizedValue),
        userId: userId,
        pluginId,
        validation: [],
        updatedAt: new Date()
      };

      // Build storage key and save
      const storageKey = this.buildKey(key, userId, pluginId);
      await this.storage.set(storageKey, setting);

      // Notify subscribers
      this.notifySubscribers(`${pluginId}.${key}`, sanitizedValue, userId ?? null);
    } catch (error) {
      console.error(`Error setting plugin setting ${pluginId}.${key}:`, error);
      throw error;
    }
  }

  async resetToDefaults(scope?: string): Promise<void> {
    try {
      const keys = await this.storage.keys();
      
      let keysToDelete: string[] = [];
      
      if (!scope) {
        // Reset all core settings
        keysToDelete = keys.filter((key: string) => key.startsWith('core.'));
      } else if (scope.startsWith('user-')) {
        // Reset user-specific settings
        keysToDelete = keys.filter((key: string) => key.startsWith(`${scope}.`));
      } else {
        // Reset plugin-specific settings
        keysToDelete = keys.filter((key: string) => key.startsWith(`${scope}.`));
      }

      for (const key of keysToDelete) {
        await this.storage.delete(key);
      }

      console.log(`Reset ${keysToDelete.length} settings for scope: ${scope || 'core'}`);
    } catch (error) {
      console.error(`Error resetting settings for scope ${scope}:`, error);
      throw error;
    }
  }

  async validateSetting(key: string, value: any): Promise<ValidationResult> {
    return await this.validator.validateSetting(key, value);
  }

  async recoverCorruptedSettings(): Promise<RecoveryResult> {
    try {
      const keys = await this.storage.keys();
      const recoveredSettings: string[] = [];
      const errors: string[] = [];

      for (const key of keys) {
        try {
          // Validate key format
          if (!this.isValidSettingKey(key)) {
            errors.push(key);
            await this.storage.delete(key);
            continue;
          }

          // Try to load and validate the setting
          const setting = await this.storage.get(key);
          if (!setting || !this.isValidSetting(setting)) {
            errors.push(key);
            await this.storage.delete(key);
            continue;
          }

          recoveredSettings.push(key);
        } catch (error) {
          errors.push(key);
          try {
            await this.storage.delete(key);
          } catch (deleteError) {
            console.error(`Failed to delete corrupted setting ${key}:`, deleteError);
          }
        }
      }

      return {
        success: true,
        recoveredSettings,
        errors
      };
    } catch (error) {
      console.error('Error during settings recovery:', error);
      return {
        success: false,
        recoveredSettings: [],
        errors: ['Failed to access settings storage']
      };
    }
  }

  private isValidSettingKey(key: string): boolean {
    // Valid formats: core.key, user-123.key, plugin-1.key, user-123.plugin-1.key
    const patterns = [
      /^core\.[a-zA-Z][a-zA-Z0-9_-]*$/,           // core.setting
      /^user-[a-zA-Z0-9_-]+\.[a-zA-Z][a-zA-Z0-9_-]*$/,  // user-123.setting
      /^[a-zA-Z][a-zA-Z0-9_-]+\.[a-zA-Z][a-zA-Z0-9_-]*$/,  // plugin-1.setting
      /^user-[a-zA-Z0-9_-]+\.[a-zA-Z][a-zA-Z0-9_-]+\.[a-zA-Z][a-zA-Z0-9_-]*$/  // user-123.plugin-1.setting
    ];

    return patterns.some(pattern => pattern.test(key));
  }

  private isValidSetting(setting: any): boolean {
    return (
      setting &&
      typeof setting === 'object' &&
      typeof setting.key === 'string' &&
      setting.value !== undefined &&
      Object.values(SettingType).includes(setting.type) &&
      setting.updatedAt instanceof Date
    );
  }

  subscribe(key: string, callback: (key: string, value: any, userId: string | null) => void): () => void {
    const subscriber: SettingsSubscriber = { key, callback };
    this.subscribers.push(subscriber);

    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(subscriber);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }
} 