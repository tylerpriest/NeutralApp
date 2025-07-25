import { 
  User, 
  Plugin, 
  Settings, 
  LogEntry, 
  PluginStatus, 
  LogLevel, 
  SettingType,
  TestStatus,
  ComponentLocation
} from '../../src/types';

describe('Core Type Definitions', () => {
  describe('User type', () => {
    it('should have all required properties with correct types', () => {
      const user: User = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        createdAt: new Date('2024-01-01'),
        lastLoginAt: new Date('2024-01-15'),
        settings: {
          theme: 'dark',
          language: 'en',
          notifications: true,
          customSetting: 'value'
        },
        roles: [
          {
            id: 'role-1',
            name: 'admin',
            permissions: ['read', 'write', 'delete']
          }
        ]
      };

      expect(typeof user.id).toBe('string');
      expect(typeof user.email).toBe('string');
      expect(typeof user.emailVerified).toBe('boolean');
      expect(user.createdAt instanceof Date).toBe(true);
      expect(user.lastLoginAt instanceof Date).toBe(true);
      expect(typeof user.settings).toBe('object');
      expect(Array.isArray(user.roles)).toBe(true);
      expect(user.roles[0]?.permissions).toEqual(['read', 'write', 'delete']);
    });
  });

  describe('Plugin type', () => {
    it('should have all required properties with correct types', () => {
      const plugin: Plugin = {
        id: 'plugin-123',
        name: 'Test Plugin',
        version: '1.0.0',
        description: 'A test plugin',
        author: 'Test Author',
        dependencies: [
          {
            id: 'dep-1',
            version: '2.0.0',
            required: true
          }
        ],
        permissions: [
          {
            name: 'storage.read',
            description: 'Read storage access',
            required: true
          }
        ],
        status: PluginStatus.ENABLED,
        installDate: new Date('2024-01-01'),
        settings: {
          apiKey: 'secret-key',
          enabled: true
        }
      };

      expect(typeof plugin.id).toBe('string');
      expect(typeof plugin.name).toBe('string');
      expect(typeof plugin.version).toBe('string');
      expect(typeof plugin.description).toBe('string');
      expect(typeof plugin.author).toBe('string');
      expect(Array.isArray(plugin.dependencies)).toBe(true);
      expect(Array.isArray(plugin.permissions)).toBe(true);
      expect(Object.values(PluginStatus)).toContain(plugin.status);
      expect(plugin.installDate instanceof Date).toBe(true);
      expect(typeof plugin.settings).toBe('object');
    });
  });

  describe('Settings type', () => {
    it('should have all required properties with correct types', () => {
      const settings: Settings = {
        userId: 'user-123',
        pluginId: 'plugin-123',
        key: 'theme',
        value: 'dark',
        type: SettingType.STRING,
        validation: [
          {
            type: 'enum',
            value: ['light', 'dark'],
            message: 'Theme must be light or dark'
          }
        ],
        updatedAt: new Date()
      };

      expect(typeof settings.userId).toBe('string');
      expect(typeof settings.pluginId).toBe('string');
      expect(typeof settings.key).toBe('string');
      expect(settings.value).toBeDefined();
      expect(Object.values(SettingType)).toContain(settings.type);
      expect(Array.isArray(settings.validation)).toBe(true);
      expect(settings.updatedAt instanceof Date).toBe(true);
    });
  });

  describe('LogEntry type', () => {
    it('should have all required properties with correct types', () => {
      const logEntry: LogEntry = {
        id: 'log-123',
        timestamp: new Date(),
        level: LogLevel.ERROR,
        message: 'Test error message',
        context: {
          component: 'PluginManager',
          action: 'installPlugin',
          correlationId: 'corr-123'
        },
        userId: 'user-123',
        pluginId: 'plugin-123',
        stackTrace: 'Error at line 42...',
        metadata: {
          errorCode: 'PLUGIN_INSTALL_FAILED',
          retryCount: 3
        }
      };

      expect(typeof logEntry.id).toBe('string');
      expect(logEntry.timestamp instanceof Date).toBe(true);
      expect(Object.values(LogLevel)).toContain(logEntry.level);
      expect(typeof logEntry.message).toBe('string');
      expect(typeof logEntry.context).toBe('object');
      expect(typeof logEntry.userId).toBe('string');
      expect(typeof logEntry.pluginId).toBe('string');
      expect(typeof logEntry.stackTrace).toBe('string');
      expect(typeof logEntry.metadata).toBe('object');
    });
  });

  describe('Enums', () => {
    it('should define PluginStatus enum with correct values', () => {
      expect(PluginStatus.AVAILABLE).toBe('available');
      expect(PluginStatus.INSTALLED).toBe('installed');
      expect(PluginStatus.ENABLED).toBe('enabled');
      expect(PluginStatus.DISABLED).toBe('disabled');
      expect(PluginStatus.ERROR).toBe('error');
    });

    it('should define LogLevel enum with correct values', () => {
      expect(LogLevel.DEBUG).toBe('debug');
      expect(LogLevel.INFO).toBe('info');
      expect(LogLevel.WARN).toBe('warn');
      expect(LogLevel.ERROR).toBe('error');
      expect(LogLevel.FATAL).toBe('fatal');
    });

    it('should define SettingType enum with correct values', () => {
      expect(SettingType.STRING).toBe('string');
      expect(SettingType.NUMBER).toBe('number');
      expect(SettingType.BOOLEAN).toBe('boolean');
      expect(SettingType.OBJECT).toBe('object');
      expect(SettingType.ARRAY).toBe('array');
    });

    it('should define TestStatus enum with correct values', () => {
      expect(TestStatus.PASSED).toBe('passed');
      expect(TestStatus.FAILED).toBe('failed');
      expect(TestStatus.SKIPPED).toBe('skipped');
      expect(TestStatus.PENDING).toBe('pending');
    });

    it('should define ComponentLocation enum with correct values', () => {
      expect(ComponentLocation.HEADER).toBe('header');
      expect(ComponentLocation.SIDEBAR).toBe('sidebar');
      expect(ComponentLocation.MAIN).toBe('main');
      expect(ComponentLocation.FOOTER).toBe('footer');
      expect(ComponentLocation.MODAL).toBe('modal');
    });
  });
}); 