import { 
  IAdminDashboard, 
  ISystemMonitor, 
  IUserManager 
} from '../interfaces/admin.interface';
import {
  SystemHealthMetrics,
  UserStatistics,
  PluginHealthStatus,
  SystemReport,
  ResourceMetrics,
  PerformanceData,
  ErrorStatistics,
  SystemAlert,
  UserProfile,
  ActivityLog,
  AdminAction,
  AlertSeverity,
  PluginStatus,
  LogLevel
} from '../../../shared/types';

describe('Admin Interfaces', () => {
  describe('IAdminDashboard', () => {
    let adminDashboard: IAdminDashboard;

    beforeEach(() => {
      adminDashboard = {
        getSystemHealth: jest.fn(),
        getUserStatistics: jest.fn(),
        getPluginHealth: jest.fn(),
        generateSystemReport: jest.fn()
      };
    });

    it('should define getSystemHealth method', () => {
      expect(adminDashboard.getSystemHealth).toBeDefined();
      expect(typeof adminDashboard.getSystemHealth).toBe('function');
    });

    it('should return system health metrics', async () => {
      const mockHealth: SystemHealthMetrics = {
        cpu: 0.45,
        memory: 0.75,
        disk: 0.60,
        uptime: 86400,
        activeUsers: 150,
        activePlugins: 5,
        errors: 2
      };

      (adminDashboard.getSystemHealth as jest.Mock).mockResolvedValue(mockHealth);
      const result = await adminDashboard.getSystemHealth();
      expect(result).toEqual(mockHealth);
      expect(result.uptime).toBe(86400);
      expect(result.cpu).toBe(0.45);
    });

    it('should define getUserStatistics method', () => {
      expect(adminDashboard.getUserStatistics).toBeDefined();
      expect(typeof adminDashboard.getUserStatistics).toBe('function');
    });

    it('should return user statistics', async () => {
      const mockStats: UserStatistics = {
        totalUsers: 1250,
        activeUsers: 892,
        newUsers: 15,
        userGrowth: 0.12
      };

      (adminDashboard.getUserStatistics as jest.Mock).mockResolvedValue(mockStats);
      const result = await adminDashboard.getUserStatistics();
      expect(result).toEqual(mockStats);
      expect(result.totalUsers).toBe(1250);
      expect(result.newUsers).toBe(15);
    });

    it('should define getPluginHealth method', () => {
      expect(adminDashboard.getPluginHealth).toBeDefined();
      expect(typeof adminDashboard.getPluginHealth).toBe('function');
    });

    it('should return plugin health status array', async () => {
      const mockPluginHealth: PluginHealthStatus[] = [
        {
          pluginId: 'plugin1',
          status: PluginStatus.ENABLED,
          errors: 2,
          performance: 0.95,
          lastUpdated: new Date()
        },
        {
          pluginId: 'plugin2',
          status: PluginStatus.ERROR,
          errors: 15,
          performance: 0.60,
          lastUpdated: new Date()
        }
      ];

      (adminDashboard.getPluginHealth as jest.Mock).mockResolvedValue(mockPluginHealth);
      const result = await adminDashboard.getPluginHealth();
      expect(result).toEqual(mockPluginHealth);
      expect(result).toHaveLength(2);
      expect(result[0]?.pluginId).toBe('plugin1');
      expect(result[1]?.status).toBe(PluginStatus.ERROR);
    });

    it('should define generateSystemReport method', () => {
      expect(adminDashboard.generateSystemReport).toBeDefined();
      expect(typeof adminDashboard.generateSystemReport).toBe('function');
    });

    it('should generate comprehensive system report', async () => {
      const mockReport: SystemReport = {
        timestamp: new Date(),
        health: {
          cpu: 0.45,
          memory: 0.75,
          disk: 0.60,
          uptime: 86400,
          activeUsers: 150,
          activePlugins: 5,
          errors: 2
        },
        users: {
          totalUsers: 1250,
          activeUsers: 892,
          newUsers: 15,
          userGrowth: 0.12
        },
        plugins: [],
        logs: []
      };

      (adminDashboard.generateSystemReport as jest.Mock).mockResolvedValue(mockReport);
      const result = await adminDashboard.generateSystemReport();
      expect(result).toEqual(mockReport);
      expect(result.health.cpu).toBe(0.45);
      expect(result.users.totalUsers).toBe(1250);
    });
  });

  describe('ISystemMonitor', () => {
    let systemMonitor: ISystemMonitor;

    beforeEach(() => {
      systemMonitor = {
        getResourceUsage: jest.fn(),
        getPerformanceMetrics: jest.fn(),
        getErrorRates: jest.fn(),
        subscribeToAlerts: jest.fn()
      };
    });

    it('should define getResourceUsage method', () => {
      expect(systemMonitor.getResourceUsage).toBeDefined();
      expect(typeof systemMonitor.getResourceUsage).toBe('function');
    });

    it('should return resource usage metrics', async () => {
      const mockResources: ResourceMetrics = {
        cpu: 0.45,
        memory: 0.75,
        disk: 0.60,
        network: 0.25
      };

      (systemMonitor.getResourceUsage as jest.Mock).mockResolvedValue(mockResources);
      const result = await systemMonitor.getResourceUsage();
      expect(result).toEqual(mockResources);
      expect(result.memory).toBe(0.75);
      expect(result.cpu).toBe(0.45);
    });

    it('should define getPerformanceMetrics method', () => {
      expect(systemMonitor.getPerformanceMetrics).toBeDefined();
      expect(typeof systemMonitor.getPerformanceMetrics).toBe('function');
    });

    it('should return performance data', async () => {
      const mockPerformance: PerformanceData = {
        responseTime: 120,
        throughput: 1000,
        errorRate: 0.02,
        availability: 99.9
      };

      (systemMonitor.getPerformanceMetrics as jest.Mock).mockResolvedValue(mockPerformance);
      const result = await systemMonitor.getPerformanceMetrics();
      expect(result).toEqual(mockPerformance);
      expect(result.availability).toBe(99.9);
      expect(result.responseTime).toBe(120);
    });

    it('should define getErrorRates method', () => {
      expect(systemMonitor.getErrorRates).toBeDefined();
      expect(typeof systemMonitor.getErrorRates).toBe('function');
    });

    it('should return error statistics', async () => {
      const mockErrors: ErrorStatistics = {
        total: 50,
        byLevel: { 
          [LogLevel.ERROR]: 20, 
          [LogLevel.WARN]: 15, 
          [LogLevel.INFO]: 15, 
          [LogLevel.DEBUG]: 0,
          [LogLevel.FATAL]: 0
        },
        byPlugin: { 'plugin1': 20, 'plugin2': 15, 'core': 15 },
        recent: []
      };

      (systemMonitor.getErrorRates as jest.Mock).mockResolvedValue(mockErrors);
      const result = await systemMonitor.getErrorRates();
      expect(result).toEqual(mockErrors);
      expect(result.total).toBe(50);
      expect(result.byLevel[LogLevel.ERROR]).toBe(20);
    });

    it('should define subscribeToAlerts method', () => {
      expect(systemMonitor.subscribeToAlerts).toBeDefined();
      expect(typeof systemMonitor.subscribeToAlerts).toBe('function');
    });

    it('should handle alert subscriptions', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      (systemMonitor.subscribeToAlerts as jest.Mock).mockReturnValue(mockUnsubscribe);
      const unsubscribe = systemMonitor.subscribeToAlerts(mockCallback);

      expect(unsubscribe).toBe(mockUnsubscribe);
      expect(systemMonitor.subscribeToAlerts).toHaveBeenCalledWith(mockCallback);
    });

    it('should receive system alerts through subscription', () => {
      const mockAlert: SystemAlert = {
        id: 'alert1',
        type: 'performance',
        severity: AlertSeverity.ERROR,
        message: 'High CPU usage detected',
        timestamp: new Date(),
        resolved: false
      };

      const mockCallback = jest.fn();
      systemMonitor.subscribeToAlerts(mockCallback);

      // Simulate receiving an alert
      mockCallback(mockAlert);
      expect(mockCallback).toHaveBeenCalledWith(mockAlert);
    });
  });

  describe('IUserManager', () => {
    let userManager: IUserManager;

    beforeEach(() => {
      userManager = {
        getUserProfiles: jest.fn(),
        getUserActivity: jest.fn(),
        performAdminAction: jest.fn()
      };
    });

    it('should define getUserProfiles method', () => {
      expect(userManager.getUserProfiles).toBeDefined();
      expect(typeof userManager.getUserProfiles).toBe('function');
    });

    it('should return user profiles array', async () => {
      const mockProfiles: UserProfile[] = [
        {
          id: 'user1',
          email: 'user1@example.com',
          displayName: 'User One',
          avatar: 'avatar1.jpg',
          settings: { theme: 'dark', language: 'en', notifications: true }
        },
        {
          id: 'user2',
          email: 'user2@example.com',
          displayName: 'User Two',
          settings: { theme: 'light', language: 'es', notifications: false }
        }
      ];

      (userManager.getUserProfiles as jest.Mock).mockResolvedValue(mockProfiles);
      const result = await userManager.getUserProfiles();
      expect(result).toEqual(mockProfiles);
      expect(result).toHaveLength(2);
      expect(result[0]?.email).toBe('user1@example.com');
    });

    it('should define getUserActivity method', () => {
      expect(userManager.getUserActivity).toBeDefined();
      expect(typeof userManager.getUserActivity).toBe('function');
    });

    it('should return activity log for specific user', async () => {
      const userId = 'user1';
      const mockActivity: ActivityLog[] = [
        {
          id: 'activity1',
          userId: 'user1',
          action: 'login',
          resource: 'auth',
          timestamp: new Date(),
          metadata: { successful: true }
        },
        {
          id: 'activity2',
          userId: 'user1',
          action: 'plugin_install',
          resource: 'plugin_manager',
          timestamp: new Date(),
          metadata: { pluginId: 'test-plugin' }
        }
      ];

      (userManager.getUserActivity as jest.Mock).mockResolvedValue(mockActivity);
      const result = await userManager.getUserActivity(userId);
      expect(result).toEqual(mockActivity);
      expect(result).toHaveLength(2);
      expect(result[0]?.userId).toBe('user1');
      expect(userManager.getUserActivity).toHaveBeenCalledWith(userId);
    });

    it('should define performAdminAction method', () => {
      expect(userManager.performAdminAction).toBeDefined();
      expect(typeof userManager.performAdminAction).toBe('function');
    });

    it('should perform admin action on user', async () => {
      const userId = 'user1';
      const adminAction: AdminAction = {
        type: 'suspend_user',
        description: 'Suspend user for policy violation',
        confirmation: true
      };

      (userManager.performAdminAction as jest.Mock).mockResolvedValue(undefined);
      await userManager.performAdminAction(userId, adminAction);

      expect(userManager.performAdminAction).toHaveBeenCalledWith(userId, adminAction);
    });

    it('should handle various admin action types', async () => {
      const userId = 'user1';
      const actions = [
        { type: 'suspend_user', description: 'Suspend for violation' },
        { type: 'activate_user', description: 'Activate resolved user' },
        { type: 'delete_user', description: 'Delete on request' },
        { type: 'reset_password', description: 'Reset for security' }
      ];

      for (const actionData of actions) {
        const adminAction: AdminAction = {
          type: actionData.type,
          description: actionData.description,
          confirmation: true
        };

        await userManager.performAdminAction(userId, adminAction);
        expect(userManager.performAdminAction).toHaveBeenCalledWith(userId, adminAction);
      }
    });
  });

  describe('Interface Integration', () => {
    it('should work together in admin dashboard scenario', async () => {
      const adminDashboard: IAdminDashboard = {
        getSystemHealth: jest.fn(),
        getUserStatistics: jest.fn(),
        getPluginHealth: jest.fn(),
        generateSystemReport: jest.fn()
      };

      const systemMonitor: ISystemMonitor = {
        getResourceUsage: jest.fn(),
        getPerformanceMetrics: jest.fn(),
        getErrorRates: jest.fn(),
        subscribeToAlerts: jest.fn()
      };

      const userManager: IUserManager = {
        getUserProfiles: jest.fn(),
        getUserActivity: jest.fn(),
        performAdminAction: jest.fn()
      };

      // Simulate integrated workflow
      (adminDashboard.getSystemHealth as jest.Mock).mockResolvedValue({ 
        cpu: 0.45,
        memory: 0.75,
        disk: 0.60,
        uptime: 86400,
        activeUsers: 150,
        activePlugins: 5,
        errors: 2
      });
      (userManager.getUserProfiles as jest.Mock).mockResolvedValue([]);
      (systemMonitor.getResourceUsage as jest.Mock).mockResolvedValue({
        cpu: 0.45,
        memory: 0.75,
        disk: 0.60,
        network: 0.25
      });

      const health = await adminDashboard.getSystemHealth();
      const users = await userManager.getUserProfiles();
      const resources = await systemMonitor.getResourceUsage();

      expect(health.cpu).toBe(0.45);
      expect(users).toHaveLength(0);
      expect(resources.memory).toBe(0.75);
    });
  });
}); 