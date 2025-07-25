import { PluginEventBus } from '../services/plugin.event.bus';
import { PluginStorageManager } from '../services/plugin.storage.manager';
import {
  PluginEvent,
  EventHandler,
  SecurityViolation,
  SecuritySeverity,
  PluginStorage
} from '../../../shared/types';

describe('Plugin Communication System', () => {
  describe('PluginEventBus', () => {
    let eventBus: PluginEventBus;

    beforeEach(() => {
      eventBus = new PluginEventBus();
    });

    afterEach(() => {
      eventBus.destroy();
    });

    describe('Event Publishing and Subscription', () => {
      it('should allow plugins to subscribe to events', () => {
        const handler = jest.fn();
        
        eventBus.subscribe('test-event', 'plugin1', handler);
        
        // Should not throw and subscription should be recorded
        expect(() => eventBus.subscribe('test-event', 'plugin1', handler)).not.toThrow();
      });

      it('should deliver events to subscribers', () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        
        eventBus.subscribe('user-login', 'plugin1', handler1);
        eventBus.subscribe('user-login', 'plugin2', handler2);

        const fixedTime = new Date('2025-07-25T11:43:36.390Z');
        const event: PluginEvent = {
          type: 'user-login',
          data: { userId: '123', timestamp: fixedTime },
          timestamp: fixedTime,
          sourceId: 'auth-service'
        };

        eventBus.publish(event, 'auth-service');

        expect(handler1).toHaveBeenCalledWith(event);
        expect(handler2).toHaveBeenCalledWith(event);
      });

      it('should not deliver events to unsubscribed plugins', () => {
        const handler = jest.fn();
        
        eventBus.subscribe('test-event', 'plugin1', handler);
        eventBus.unsubscribe('test-event', 'plugin1');

        const event: PluginEvent = {
          type: 'test-event',
          data: { message: 'test' },
          timestamp: new Date(),
          sourceId: 'plugin2'
        };

        eventBus.publish(event, 'plugin2');

        expect(handler).not.toHaveBeenCalled();
      });

      it('should handle targeted events correctly', () => {
        const handler1 = jest.fn();
        const handler2 = jest.fn();
        
        eventBus.subscribe('direct-message', 'plugin1', handler1);
        eventBus.subscribe('direct-message', 'plugin2', handler2);

        const event: PluginEvent = {
          type: 'direct-message',
          data: { message: 'private message' },
          timestamp: new Date(),
          sourceId: 'plugin3',
          targetId: 'plugin1'
        };

        eventBus.publish(event, 'plugin3');

        expect(handler1).toHaveBeenCalledWith(event);
        expect(handler2).not.toHaveBeenCalled();
      });

      it('should handle async event handlers', async () => {
        const asyncHandler = jest.fn().mockResolvedValue(undefined);
        
        eventBus.subscribe('async-event', 'plugin1', asyncHandler);

        const event: PluginEvent = {
          type: 'async-event',
          data: { async: true },
          timestamp: new Date(),
          sourceId: 'plugin2'
        };

        eventBus.publish(event, 'plugin2');

        // Give time for async handler to be called
        await new Promise(resolve => setTimeout(resolve, 10));
        expect(asyncHandler).toHaveBeenCalledWith(event);
      });
    });

    describe('Event Permission Validation', () => {
      it('should validate publisher permissions', () => {
        expect(eventBus.validateEventPermissions('trusted-plugin', 'system-event')).toBe(true);
        expect(eventBus.validateEventPermissions('untrusted-plugin', 'system-critical')).toBe(false);
      });

      it('should block unauthorized event publishing', () => {
        const handler = jest.fn();
        eventBus.subscribe('system-critical', 'plugin1', handler);

        const event: PluginEvent = {
          type: 'system-critical',
          data: { danger: true },
          timestamp: new Date(),
          sourceId: 'malicious-plugin'
        };

        eventBus.publish(event, 'malicious-plugin');

        // Should not deliver unauthorized events
        expect(handler).not.toHaveBeenCalled();
      });

      it('should log security violations for unauthorized access', () => {
        const logSpy = jest.spyOn(console, 'warn').mockImplementation();

        const event: PluginEvent = {
          type: 'system-admin',
          data: { adminAction: 'delete-all-users' },
          timestamp: new Date(),
          sourceId: 'untrusted-plugin'
        };

        eventBus.publish(event, 'untrusted-plugin');

        expect(logSpy).toHaveBeenCalled();
        logSpy.mockRestore();
      });

      it('should allow authorized plugins to publish restricted events', () => {
        const handler = jest.fn();
        eventBus.subscribe('system-admin', 'admin-plugin', handler);

        // Grant admin permissions to plugin
        eventBus.grantPermission('trusted-admin-plugin', 'system-admin');

        const event: PluginEvent = {
          type: 'system-admin',
          data: { adminAction: 'system-update' },
          timestamp: new Date(),
          sourceId: 'trusted-admin-plugin'
        };

        eventBus.publish(event, 'trusted-admin-plugin');

        expect(handler).toHaveBeenCalledWith(event);
      });
    });

    describe('Event History and Debugging', () => {
      it('should maintain event history for debugging', () => {
        const event: PluginEvent = {
          type: 'debug-event',
          data: { debug: true },
          timestamp: new Date(),
          sourceId: 'plugin1'
        };

        eventBus.publish(event, 'plugin1');

        const history = eventBus.getEventHistory();
        expect(history).toContainEqual(expect.objectContaining({
          type: 'debug-event',
          sourceId: 'plugin1'
        }));
      });

      it('should limit event history size to prevent memory leaks', () => {
        // Publish many events
        for (let i = 0; i < 1100; i++) {
          const event: PluginEvent = {
            type: 'spam-event',
            data: { index: i },
            timestamp: new Date(),
            sourceId: 'spammer-plugin'
          };
          eventBus.publish(event, 'spammer-plugin');
        }

        const history = eventBus.getEventHistory();
        expect(history.length).toBeLessThanOrEqual(1000); // Should be capped
      });

      it('should provide event statistics', () => {
        eventBus.subscribe('stats-event', 'plugin1', jest.fn());
        eventBus.subscribe('stats-event', 'plugin2', jest.fn());

        const event: PluginEvent = {
          type: 'stats-event',
          data: {},
          timestamp: new Date(),
          sourceId: 'plugin3'
        };

        eventBus.publish(event, 'plugin3');

        const stats = eventBus.getEventStatistics();
        expect(stats.totalEvents).toBeGreaterThan(0);
        expect(stats.subscriberCount).toBeGreaterThan(0);
        expect(stats.eventTypes).toContain('stats-event');
      });
    });

    describe('Error Handling', () => {
      it('should handle errors in event handlers gracefully', () => {
        const errorHandler = jest.fn().mockImplementation(() => {
          throw new Error('Handler error');
        });
        const goodHandler = jest.fn();

        eventBus.subscribe('error-test', 'error-plugin', errorHandler);
        eventBus.subscribe('error-test', 'good-plugin', goodHandler);

        const event: PluginEvent = {
          type: 'error-test',
          data: {},
          timestamp: new Date(),
          sourceId: 'test-plugin'
        };

        expect(() => eventBus.publish(event, 'test-plugin')).not.toThrow();
        expect(goodHandler).toHaveBeenCalled(); // Other handlers should still work
      });

      it('should isolate plugin failures', () => {
        const crashingHandler = jest.fn().mockImplementation(() => {
          throw new Error('Plugin crashed');
        });

        eventBus.subscribe('crash-test', 'crashy-plugin', crashingHandler);

        const event: PluginEvent = {
          type: 'crash-test',
          data: {},
          timestamp: new Date(),
          sourceId: 'test-plugin'
        };

        // Should not crash the event bus
        expect(() => eventBus.publish(event, 'test-plugin')).not.toThrow();
      });
    });

    describe('Plugin Lifecycle Integration', () => {
      it('should clean up subscriptions when plugin is unloaded', () => {
        const handler = jest.fn();
        eventBus.subscribe('lifecycle-test', 'temp-plugin', handler);

        eventBus.unloadPlugin('temp-plugin');

        const event: PluginEvent = {
          type: 'lifecycle-test',
          data: {},
          timestamp: new Date(),
          sourceId: 'other-plugin'
        };

        eventBus.publish(event, 'other-plugin');

        expect(handler).not.toHaveBeenCalled();
      });

      it('should revoke permissions when plugin is unloaded', () => {
        eventBus.grantPermission('temp-plugin', 'system-admin');
        expect(eventBus.validateEventPermissions('temp-plugin', 'system-admin')).toBe(true);

        eventBus.unloadPlugin('temp-plugin');

        expect(eventBus.validateEventPermissions('temp-plugin', 'system-admin')).toBe(false);
      });
    });
  });

  describe('PluginStorageManager', () => {
    let storageManager: PluginStorageManager;

    beforeEach(() => {
      storageManager = new PluginStorageManager();
    });

    afterEach(() => {
      storageManager.destroy();
    });

    describe('Storage Isolation', () => {
      it('should provide isolated storage for each plugin', async () => {
        const storage1 = storageManager.getPluginStorage('plugin1');
        const storage2 = storageManager.getPluginStorage('plugin2');

        await storage1.set('key1', 'value1');
        await storage2.set('key1', 'value2');

        expect(await storage1.get('key1')).toBe('value1');
        expect(await storage2.get('key1')).toBe('value2');
      });

      it('should prevent plugins from accessing other plugin storage', async () => {
        const storage1 = storageManager.getPluginStorage('plugin1');
        const storage2 = storageManager.getPluginStorage('plugin2');

        await storage1.set('secret', 'confidential-data');

        // Plugin2 should not be able to access plugin1's data
        expect(await storage2.get('secret')).toBeNull();
      });

      it('should maintain separate key namespaces', async () => {
        const storage1 = storageManager.getPluginStorage('plugin1');
        const storage2 = storageManager.getPluginStorage('plugin2');

        await storage1.set('config', { theme: 'dark' });
        await storage2.set('config', { theme: 'light' });

        const keys1 = await storage1.keys();
        const keys2 = await storage2.keys();

        expect(keys1).toEqual(['config']);
        expect(keys2).toEqual(['config']);
        expect(await storage1.get('config')).toEqual({ theme: 'dark' });
        expect(await storage2.get('config')).toEqual({ theme: 'light' });
      });
    });

    describe('Storage Quota Enforcement', () => {
      it('should enforce storage quotas per plugin', async () => {
        const storage = storageManager.getPluginStorage('quota-test-plugin');
        storageManager.enforceStorageQuota('quota-test-plugin', 1024); // 1KB limit

        // Should allow small data
        await expect(storage.set('small', 'x'.repeat(100))).resolves.not.toThrow();

        // Should reject large data
        await expect(storage.set('large', 'x'.repeat(2000))).rejects.toThrow(/quota/i);
      });

      it('should track storage usage accurately', async () => {
        const storage = storageManager.getPluginStorage('usage-test-plugin');
        storageManager.enforceStorageQuota('usage-test-plugin', 2048);

        await storage.set('data1', 'x'.repeat(500));
        await storage.set('data2', 'y'.repeat(500));

        const usage = storageManager.getStorageUsage('usage-test-plugin');
        expect(usage.used).toBeGreaterThan(1000);
        expect(usage.quota).toBe(2048);
        expect(usage.percentage).toBeLessThan(100);
      });

      it('should allow quota increases', async () => {
        const storage = storageManager.getPluginStorage('expand-quota-plugin');
        storageManager.enforceStorageQuota('expand-quota-plugin', 512);

        // Fill up the quota
        await storage.set('data', 'x'.repeat(400));

        // Increase quota
        storageManager.enforceStorageQuota('expand-quota-plugin', 1024);

        // Should now allow more data
        await expect(storage.set('more-data', 'y'.repeat(400))).resolves.not.toThrow();
      });

      it('should handle quota decreases gracefully', async () => {
        const storage = storageManager.getPluginStorage('shrink-quota-plugin');
        storageManager.enforceStorageQuota('shrink-quota-plugin', 1024);

        await storage.set('large-data', 'x'.repeat(800));

        // Decrease quota below current usage
        storageManager.enforceStorageQuota('shrink-quota-plugin', 512);

        // Should prevent new writes
        await expect(storage.set('new-data', 'y')).rejects.toThrow(/quota/i);

        // But existing data should remain accessible
        expect(await storage.get('large-data')).toBe('x'.repeat(800));
      });
    });

    describe('Data Isolation and Security', () => {
      it('should isolate plugin data completely', async () => {
        const storage1 = storageManager.getPluginStorage('secure-plugin1');
        const storage2 = storageManager.getPluginStorage('secure-plugin2');

        await storage1.set('sensitive', { password: 'secret123' });

        // Even with the same key, plugin2 should not access plugin1's data
        expect(await storage2.get('sensitive')).toBeNull();

        // Verify isolation by listing keys
        await storage2.set('public', 'visible');
        const keys1 = await storage1.keys();
        const keys2 = await storage2.keys();

        expect(keys1).toEqual(['sensitive']);
        expect(keys2).toEqual(['public']);
      });

      it('should prevent storage namespace pollution', async () => {
        storageManager.isolatePluginData('isolated-plugin');
        const storage = storageManager.getPluginStorage('isolated-plugin');

        await storage.set('test', 'value');

        // Verify the data is truly isolated by checking internal storage structure
        const allKeys = storageManager.getAllStorageKeys();
        const pluginKeys = allKeys.filter(key => key.includes('isolated-plugin'));

        expect(pluginKeys.length).toBeGreaterThan(0);
        expect(pluginKeys.every(key => key.startsWith('plugin:isolated-plugin:'))).toBe(true);
      });
    });

    describe('Storage Operations', () => {
      it('should handle all basic storage operations', async () => {
        const storage = storageManager.getPluginStorage('operations-test');

        // Set operation
        await storage.set('string', 'test-value');
        await storage.set('number', 42);
        await storage.set('object', { nested: { value: true } });
        await storage.set('array', [1, 2, 3]);

        // Get operations
        expect(await storage.get('string')).toBe('test-value');
        expect(await storage.get('number')).toBe(42);
        expect(await storage.get('object')).toEqual({ nested: { value: true } });
        expect(await storage.get('array')).toEqual([1, 2, 3]);

        // Keys operation
        const keys = await storage.keys();
        expect(keys.sort()).toEqual(['array', 'number', 'object', 'string']);

        // Delete operation
        await storage.delete('string');
        expect(await storage.get('string')).toBeNull();
        expect(await storage.keys()).not.toContain('string');

        // Clear operation
        await storage.clear();
        expect(await storage.keys()).toEqual([]);
      });

      it('should handle non-existent keys gracefully', async () => {
        const storage = storageManager.getPluginStorage('missing-keys-test');

        expect(await storage.get('non-existent')).toBeNull();
        await expect(storage.delete('non-existent')).resolves.not.toThrow();
      });

      it('should preserve data types correctly', async () => {
        const storage = storageManager.getPluginStorage('types-test');

        const testData = {
          boolean: true,
          number: 3.14159,
          string: 'hello world',
          null_value: null,
          object: { nested: { deep: 'value' } },
          array: [1, 'two', { three: 3 }],
          date: new Date('2024-01-01')
        };

        for (const [key, value] of Object.entries(testData)) {
          await storage.set(key, value);
        }

        for (const [key, expectedValue] of Object.entries(testData)) {
          const actualValue = await storage.get(key);
          if (expectedValue instanceof Date) {
            expect(new Date(actualValue as string)).toEqual(expectedValue);
          } else {
            expect(actualValue).toEqual(expectedValue);
          }
        }
      });
    });

    describe('Administrative Operations', () => {
      it('should allow clearing plugin storage', async () => {
        const storage = storageManager.getPluginStorage('clear-test');

        await storage.set('data1', 'value1');
        await storage.set('data2', 'value2');

        await storageManager.clearPluginStorage('clear-test');

        expect(await storage.keys()).toEqual([]);
        expect(await storage.get('data1')).toBeNull();
        expect(await storage.get('data2')).toBeNull();
      });

      it('should provide storage statistics', () => {
        storageManager.getPluginStorage('stats-plugin1');
        storageManager.getPluginStorage('stats-plugin2');

        const stats = storageManager.getStorageStatistics();
        expect(stats.totalPlugins).toBe(2);
        expect(stats.pluginStorages).toHaveProperty('stats-plugin1');
        expect(stats.pluginStorages).toHaveProperty('stats-plugin2');
      });

      it('should handle plugin cleanup during uninstall', async () => {
        const storage = storageManager.getPluginStorage('cleanup-test');
        await storage.set('persistent-data', 'should-be-removed');

        await storageManager.clearPluginStorage('cleanup-test');

        // Storage should be completely cleaned up
        const newStorage = storageManager.getPluginStorage('cleanup-test');
        expect(await newStorage.keys()).toEqual([]);
      });
    });

    describe('Error Handling and Recovery', () => {
      it('should handle storage corruption gracefully', async () => {
        const storage = storageManager.getPluginStorage('corruption-test');

        // Simulate storage corruption
        storageManager.simulateStorageCorruption('corruption-test');

        // Should still be able to perform operations without crashing
        await expect(storage.set('recovery-test', 'value')).resolves.not.toThrow();
        expect(await storage.get('recovery-test')).toBe('value');
      });

      it('should provide fallback storage when primary fails', async () => {
        const storage = storageManager.getPluginStorage('fallback-test');

        // Simulate primary storage failure
        storageManager.simulateStorageFailure('fallback-test');

        // Operations should still work with fallback
        await expect(storage.set('fallback-data', 'test')).resolves.not.toThrow();
        expect(await storage.get('fallback-data')).toBe('test');
      });
    });
  });

  describe('Integration Tests', () => {
    let eventBus: PluginEventBus;
    let storageManager: PluginStorageManager;

    beforeEach(() => {
      eventBus = new PluginEventBus();
      storageManager = new PluginStorageManager();
    });

    afterEach(() => {
      eventBus.destroy();
      storageManager.destroy();
    });

    it('should work together for plugin communication workflows', async () => {
      // Setup: Two plugins communicating via events and sharing state via storage
      const plugin1Handler = jest.fn(async (event: PluginEvent) => {
        const storage = storageManager.getPluginStorage('plugin1');
        await storage.set('received-message', event.data.message);
      });

      const plugin2Handler = jest.fn();

      eventBus.subscribe('data-share', 'plugin1', plugin1Handler);
      eventBus.subscribe('data-share', 'plugin2', plugin2Handler);

      // Plugin2 publishes an event
      const event: PluginEvent = {
        type: 'data-share',
        data: { message: 'Hello from plugin2!' },
        timestamp: new Date(),
        sourceId: 'plugin2'
      };

      eventBus.publish(event, 'plugin2');

      // Wait for async handler
      await new Promise(resolve => setTimeout(resolve, 10));

      // Verify event was received
      expect(plugin1Handler).toHaveBeenCalledWith(event);
      expect(plugin2Handler).toHaveBeenCalledWith(event);

      // Verify plugin1 stored the data
      const plugin1Storage = storageManager.getPluginStorage('plugin1');
      expect(await plugin1Storage.get('received-message')).toBe('Hello from plugin2!');

      // Verify plugin2 cannot access plugin1's storage
      const plugin2Storage = storageManager.getPluginStorage('plugin2');
      expect(await plugin2Storage.get('received-message')).toBeNull();
    });

    it('should handle plugin lifecycle in communication context', async () => {
      const storage1 = storageManager.getPluginStorage('lifecycle-plugin');
      await storage1.set('important-data', 'preserve-this');

      const handler = jest.fn();
      eventBus.subscribe('lifecycle-event', 'lifecycle-plugin', handler);

      // Simulate plugin unload
      eventBus.unloadPlugin('lifecycle-plugin');
      await storageManager.clearPluginStorage('lifecycle-plugin');

      // Events should no longer be delivered
      const event: PluginEvent = {
        type: 'lifecycle-event',
        data: {},
        timestamp: new Date(),
        sourceId: 'other-plugin'
      };

      eventBus.publish(event, 'other-plugin');
      expect(handler).not.toHaveBeenCalled();

      // Storage should be cleared
      const newStorage = storageManager.getPluginStorage('lifecycle-plugin');
      expect(await newStorage.get('important-data')).toBeNull();
    });
  });
}); 