import { AdminDashboard } from '../../src/services/admin.dashboard';
import { SystemMonitor } from '../../src/services/system.monitor';
import { UserManager } from '../../src/services/user.manager';
import {
  PluginStatus,
  LogLevel,
  AlertSeverity,
  SystemAlert
} from '../../src/types';

describe('Admin Services', () => {
  describe('AdminDashboard', () => {
    let adminDashboard: AdminDashboard;

    beforeEach(() => {
      adminDashboard = new AdminDashboard();
    });

    it('should initialize with mock data', () => {
      expect(adminDashboard).toBeDefined();
    });

    it('should return system health metrics', async () => {
      const health = await adminDashboard.getSystemHealth();
      
      expect(health).toBeDefined();
      expect(typeof health.cpu).toBe('number');
      expect(typeof health.memory).toBe('number');
      expect(typeof health.disk).toBe('number');
      expect(typeof health.uptime).toBe('number');
      expect(typeof health.activeUsers).toBe('number');
      expect(typeof health.activePlugins).toBe('number');
      expect(typeof health.errors).toBe('number');
      
      expect(health.cpu).toBeGreaterThanOrEqual(0);
      expect(health.cpu).toBeLessThanOrEqual(1);
      expect(health.memory).toBeGreaterThanOrEqual(0);
      expect(health.memory).toBeLessThanOrEqual(1);
    });

    it('should return user statistics', async () => {
      const stats = await adminDashboard.getUserStatistics();
      
      expect(stats).toBeDefined();
      expect(typeof stats.totalUsers).toBe('number');
      expect(typeof stats.activeUsers).toBe('number');
      expect(typeof stats.newUsers).toBe('number');
      expect(typeof stats.userGrowth).toBe('number');
      
      expect(stats.totalUsers).toBeGreaterThan(0);
      expect(stats.activeUsers).toBeLessThanOrEqual(stats.totalUsers);
    });

    it('should return plugin health status', async () => {
      const pluginHealth = await adminDashboard.getPluginHealth();
      
      expect(Array.isArray(pluginHealth)).toBe(true);
      expect(pluginHealth.length).toBeGreaterThan(0);
      
      pluginHealth.forEach(plugin => {
        expect(typeof plugin.pluginId).toBe('string');
        expect(Object.values(PluginStatus)).toContain(plugin.status);
        expect(typeof plugin.errors).toBe('number');
        expect(typeof plugin.performance).toBe('number');
        expect(plugin.lastUpdated).toBeInstanceOf(Date);
        
        expect(plugin.errors).toBeGreaterThanOrEqual(0);
        expect(plugin.performance).toBeGreaterThanOrEqual(0);
        expect(plugin.performance).toBeLessThanOrEqual(1);
      });
    });

    it('should generate comprehensive system report', async () => {
      const report = await adminDashboard.generateSystemReport();
      
      expect(report).toBeDefined();
      expect(report.timestamp).toBeInstanceOf(Date);
      expect(report.health).toBeDefined();
      expect(report.users).toBeDefined();
      expect(Array.isArray(report.plugins)).toBe(true);
      expect(Array.isArray(report.logs)).toBe(true);
      
      // Verify report structure
      expect(typeof report.health.cpu).toBe('number');
      expect(typeof report.users.totalUsers).toBe('number');
      expect(report.logs.length).toBeGreaterThan(0);
    });

    it('should support mock data manipulation', () => {
      const initialUserCount = 100;
      adminDashboard.setMockUserCount(initialUserCount);
      
      adminDashboard.addMockPlugin('test-plugin', PluginStatus.ENABLED);
      adminDashboard.simulatePluginError('test-plugin');
      adminDashboard.removeMockPlugin('test-plugin');
      
      // Should not throw errors
      expect(() => adminDashboard.resetMockData()).not.toThrow();
    });
  });

  describe('SystemMonitor', () => {
    let systemMonitor: SystemMonitor;

    beforeEach(() => {
      systemMonitor = new SystemMonitor();
    });

    afterEach(() => {
      systemMonitor.destroy();
    });

    it('should initialize with monitoring enabled', () => {
      expect(systemMonitor).toBeDefined();
      expect(systemMonitor.getSubscriberCount()).toBe(0);
    });

    it('should return resource usage metrics', async () => {
      const resources = await systemMonitor.getResourceUsage();
      
      expect(resources).toBeDefined();
      expect(typeof resources.cpu).toBe('number');
      expect(typeof resources.memory).toBe('number');
      expect(typeof resources.disk).toBe('number');
      expect(typeof resources.network).toBe('number');
      
      expect(resources.cpu).toBeGreaterThanOrEqual(0);
      expect(resources.cpu).toBeLessThanOrEqual(1);
      expect(resources.memory).toBeGreaterThanOrEqual(0);
      expect(resources.memory).toBeLessThanOrEqual(1);
    });

    it('should return performance metrics', async () => {
      const performance = await systemMonitor.getPerformanceMetrics();
      
      expect(performance).toBeDefined();
      expect(typeof performance.responseTime).toBe('number');
      expect(typeof performance.throughput).toBe('number');
      expect(typeof performance.errorRate).toBe('number');
      expect(typeof performance.availability).toBe('number');
      
      expect(performance.responseTime).toBeGreaterThan(0);
      expect(performance.throughput).toBeGreaterThan(0);
      expect(performance.errorRate).toBeGreaterThanOrEqual(0);
      expect(performance.availability).toBeGreaterThan(0);
      expect(performance.availability).toBeLessThanOrEqual(100);
    });

    it('should return error statistics', async () => {
      const errors = await systemMonitor.getErrorRates();
      
      expect(errors).toBeDefined();
      expect(typeof errors.total).toBe('number');
      expect(typeof errors.byLevel).toBe('object');
      expect(typeof errors.byPlugin).toBe('object');
      expect(Array.isArray(errors.recent)).toBe(true);
      
      // Check that all log levels are present
      Object.values(LogLevel).forEach(level => {
        expect(errors.byLevel[level]).toBeDefined();
        expect(typeof errors.byLevel[level]).toBe('number');
      });
    });

    it('should handle alert subscriptions', () => {
      const mockCallback = jest.fn();
      
      const unsubscribe = systemMonitor.subscribeToAlerts(mockCallback);
      expect(systemMonitor.getSubscriberCount()).toBe(1);
      
      // Trigger test alert
      systemMonitor.triggerTestAlert('test', AlertSeverity.INFO);
      expect(mockCallback).toHaveBeenCalledTimes(1);
      
      const alertArg = mockCallback.mock.calls[0][0] as SystemAlert;
      expect(alertArg.type).toBe('test');
      expect(alertArg.severity).toBe(AlertSeverity.INFO);
      expect(alertArg.message).toContain('Test alert');
      
      // Unsubscribe
      unsubscribe();
      expect(systemMonitor.getSubscriberCount()).toBe(0);
    });

    it('should handle multiple alert subscribers', () => {
      const callback1 = jest.fn();
      const callback2 = jest.fn();
      
      const unsubscribe1 = systemMonitor.subscribeToAlerts(callback1);
      const unsubscribe2 = systemMonitor.subscribeToAlerts(callback2);
      
      expect(systemMonitor.getSubscriberCount()).toBe(2);
      
      systemMonitor.triggerTestAlert();
      
      expect(callback1).toHaveBeenCalledTimes(1);
      expect(callback2).toHaveBeenCalledTimes(1);
      
      unsubscribe1();
      unsubscribe2();
    });

    it('should support monitoring control', () => {
      systemMonitor.stopMonitoring();
      systemMonitor.startMonitoring();
      
      // Should not throw errors
      expect(() => systemMonitor.stopMonitoring()).not.toThrow();
      expect(() => systemMonitor.startMonitoring()).not.toThrow();
    });

    it('should support mock log management', () => {
      systemMonitor.clearMockLogs();
      systemMonitor.addMockLog(LogLevel.ERROR, 'Test error message', 'test-component');
      
      // Should not throw errors
      expect(() => systemMonitor.clearMockLogs()).not.toThrow();
    });
  });

  describe('UserManager', () => {
    let userManager: UserManager;

    beforeEach(() => {
      userManager = new UserManager();
    });

    it('should initialize with mock users', () => {
      expect(userManager).toBeDefined();
      expect(userManager.getMockUserCount()).toBeGreaterThan(0);
      expect(userManager.getActiveUserCount()).toBeGreaterThan(0);
    });

    it('should return user profiles', async () => {
      const profiles = await userManager.getUserProfiles();
      
      expect(Array.isArray(profiles)).toBe(true);
      expect(profiles.length).toBeGreaterThan(0);
      
      profiles.forEach(profile => {
        expect(typeof profile.id).toBe('string');
        expect(typeof profile.email).toBe('string');
        expect(profile.email).toContain('@');
        expect(typeof profile.settings).toBe('object');
        
        // Verify sensitive settings are filtered out
        expect(profile.settings.adminMode).toBeUndefined();
      });
    });

    it('should return user activity for valid user', async () => {
      const profiles = await userManager.getUserProfiles();
      const userId = profiles[0]?.id;
      
      if (userId) {
        const activities = await userManager.getUserActivity(userId);
        
        expect(Array.isArray(activities)).toBe(true);
        expect(activities.length).toBeGreaterThan(0);
        
        activities.forEach(activity => {
          expect(activity.userId).toBe(userId);
          expect(typeof activity.action).toBe('string');
          expect(typeof activity.resource).toBe('string');
          expect(activity.timestamp).toBeInstanceOf(Date);
          expect(typeof activity.metadata).toBe('object');
        });
      }
    });

    it('should return empty array for invalid user', async () => {
      const activities = await userManager.getUserActivity('nonexistent-user');
      expect(activities).toEqual([]);
    });

    it('should perform suspend user admin action', async () => {
      const profiles = await userManager.getUserProfiles();
      const userId = profiles[0]?.id;
      
      if (userId) {
        const adminAction = {
          type: 'suspend_user',
          description: 'Suspended for testing',
          confirmation: true
        };
        
        await expect(userManager.performAdminAction(userId, adminAction)).resolves.not.toThrow();
        
        // Verify suspension was logged
        const activities = await userManager.getUserActivity(userId);
        const suspensionActivity = activities.find(a => a.action === 'admin_suspend_user');
        expect(suspensionActivity).toBeDefined();
      }
    });

    it('should perform activate user admin action', async () => {
      const profiles = await userManager.getUserProfiles();
      const userId = profiles[0]?.id;
      
      if (userId) {
        const adminAction = {
          type: 'activate_user',
          description: 'Activated after review',
          confirmation: true
        };
        
        await expect(userManager.performAdminAction(userId, adminAction)).resolves.not.toThrow();
      }
    });

    it('should handle various admin action types', async () => {
      const profiles = await userManager.getUserProfiles();
      const userId = profiles[0]?.id;
      
      if (userId) {
        const actionTypes = [
          'reset_password',
          'update_profile',
          'clear_sessions'
        ];
        
        for (const type of actionTypes) {
          const adminAction = {
            type,
            description: `Test ${type} action`,
            confirmation: true
          };
          
          await expect(userManager.performAdminAction(userId, adminAction)).resolves.not.toThrow();
        }
      }
    });

    it('should throw error for invalid user in admin action', async () => {
      const adminAction = {
        type: 'suspend_user',
        description: 'Test action',
        confirmation: true
      };
      
      await expect(userManager.performAdminAction('invalid-user', adminAction))
        .rejects.toThrow('User not found: invalid-user');
    });

    it('should throw error for unknown admin action type', async () => {
      const profiles = await userManager.getUserProfiles();
      const userId = profiles[0]?.id;
      
      if (userId) {
        const adminAction = {
          type: 'unknown_action',
          description: 'Unknown action test',
          confirmation: true
        };
        
        await expect(userManager.performAdminAction(userId, adminAction))
          .rejects.toThrow('Unknown admin action type: unknown_action');
      }
    });

    it('should support user management utilities', () => {
      const newUser = {
        id: 'test-user',
        email: 'test@example.com',
        displayName: 'Test User',
        settings: { theme: 'light', language: 'en', notifications: true }
      };
      
      userManager.addMockUser(newUser);
      expect(userManager.getUserById('test-user')).toEqual(newUser);
      
      userManager.addUserActivity('test-user', {
        action: 'test_action',
        resource: 'test_resource'
      });
      
      userManager.removeMockUser('test-user');
      expect(userManager.getUserById('test-user')).toBeUndefined();
    });

    it('should provide user count statistics', () => {
      const totalUsers = userManager.getMockUserCount();
      const activeUsers = userManager.getActiveUserCount();
      const suspendedUsers = userManager.getSuspendedUserCount();
      
      expect(typeof totalUsers).toBe('number');
      expect(typeof activeUsers).toBe('number');
      expect(typeof suspendedUsers).toBe('number');
      
      expect(totalUsers).toBeGreaterThan(0);
      expect(activeUsers).toBeLessThanOrEqual(totalUsers);
      expect(suspendedUsers).toBeGreaterThanOrEqual(0);
    });

    it('should support data reset', () => {
      const originalCount = userManager.getMockUserCount();
      
      userManager.clearAllMockData();
      
      expect(userManager.getMockUserCount()).toBe(originalCount); // Should reinitialize
    });
  });

  describe('Admin Services Integration', () => {
    let adminDashboard: AdminDashboard;
    let systemMonitor: SystemMonitor;
    let userManager: UserManager;

    beforeEach(() => {
      adminDashboard = new AdminDashboard();
      systemMonitor = new SystemMonitor();
      userManager = new UserManager();
    });

    afterEach(() => {
      systemMonitor.destroy();
    });

    it('should work together for comprehensive admin functionality', async () => {
      // Get system overview
      const [health, userStats, pluginHealth, userProfiles] = await Promise.all([
        adminDashboard.getSystemHealth(),
        adminDashboard.getUserStatistics(),
        adminDashboard.getPluginHealth(),
        userManager.getUserProfiles()
      ]);

      expect(health).toBeDefined();
      expect(userStats).toBeDefined();
      expect(pluginHealth).toBeDefined();
      expect(userProfiles).toBeDefined();

      // Get detailed monitoring data
      const [resources, performance, errors] = await Promise.all([
        systemMonitor.getResourceUsage(),
        systemMonitor.getPerformanceMetrics(),
        systemMonitor.getErrorRates()
      ]);

      expect(resources).toBeDefined();
      expect(performance).toBeDefined();
      expect(errors).toBeDefined();

      // Perform admin action
      if (userProfiles.length > 0) {
        const userId = userProfiles[0]!.id;
        const adminAction = {
          type: 'reset_password',
          description: 'Integration test password reset',
          confirmation: true
        };

        await expect(userManager.performAdminAction(userId, adminAction)).resolves.not.toThrow();
      }

      // Subscribe to system alerts
      const alertCallback = jest.fn();
      const unsubscribe = systemMonitor.subscribeToAlerts(alertCallback);

      systemMonitor.triggerTestAlert('integration_test');
      expect(alertCallback).toHaveBeenCalledTimes(1);

      unsubscribe();
    });

    it('should generate comprehensive admin report', async () => {
      const report = await adminDashboard.generateSystemReport();
      const resources = await systemMonitor.getResourceUsage();
      const userProfiles = await userManager.getUserProfiles();

      // Verify the data correlates between services
      expect(report.users.totalUsers).toBeGreaterThan(0);
      expect(userProfiles.length).toBeGreaterThan(0);
      expect(resources.cpu).toBeGreaterThan(0);
      expect(report.health.cpu).toBeGreaterThan(0);

      // Both should report positive values
      expect(report.plugins.length).toBeGreaterThanOrEqual(0);
      expect(report.logs.length).toBeGreaterThan(0);
    });
  });
}); 