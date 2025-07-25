import { IAdminDashboard } from '../interfaces/admin.interface';
import {
  SystemHealthMetrics,
  UserStatistics,
  PluginHealthStatus,
  SystemReport,
  PluginStatus,
  LogEntry,
  LogLevel
} from '../../../shared';

export class AdminDashboard implements IAdminDashboard {
  private mockUsers: number = 0;
  private mockPlugins: Map<string, PluginHealthStatus> = new Map();
  private mockStartTime: Date = new Date();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Initialize with some mock plugin data
    this.mockPlugins.set('core-plugin', {
      pluginId: 'core-plugin',
      status: PluginStatus.ENABLED,
      errors: 0,
      performance: 0.98,
      lastUpdated: new Date()
    });

    this.mockPlugins.set('dashboard-plugin', {
      pluginId: 'dashboard-plugin',
      status: PluginStatus.ENABLED,
      errors: 2,
      performance: 0.85,
      lastUpdated: new Date()
    });

    this.mockUsers = 100; // Mock initial user count
  }

  async getSystemHealth(): Promise<SystemHealthMetrics> {
    // Simulate some system metrics
    const uptime = Math.floor((Date.now() - this.mockStartTime.getTime()) / 1000);
    const mockCpuUsage = 0.35 + Math.random() * 0.2; // 35-55%
    const mockMemoryUsage = 0.40 + Math.random() * 0.25; // 40-65%
    const mockDiskUsage = 0.30 + Math.random() * 0.15; // 30-45%

    const totalErrors = Array.from(this.mockPlugins.values())
      .reduce((total, plugin) => total + plugin.errors, 0);

    return {
      cpu: Math.round(mockCpuUsage * 100) / 100,
      memory: Math.round(mockMemoryUsage * 100) / 100,
      disk: Math.round(mockDiskUsage * 100) / 100,
      uptime,
      activeUsers: this.mockUsers + Math.floor(Math.random() * 50), // Some variance
      activePlugins: this.mockPlugins.size,
      errors: totalErrors
    };
  }

  async getUserStatistics(): Promise<UserStatistics> {
    const baseUsers = this.mockUsers;
    const activeUsers = Math.floor(baseUsers * (0.6 + Math.random() * 0.3)); // 60-90% active
    const newUsers = Math.floor(Math.random() * 20); // 0-20 new users
    const userGrowth = (newUsers / baseUsers) * 100; // Growth percentage

    return {
      totalUsers: baseUsers,
      activeUsers,
      newUsers,
      userGrowth: Math.round(userGrowth * 100) / 100
    };
  }

  async getPluginHealth(): Promise<PluginHealthStatus[]> {
    // Add some random variance to performance and errors
    const pluginHealthArray: PluginHealthStatus[] = [];
    
    for (const [pluginId, plugin] of this.mockPlugins) {
      const variance = Math.random() * 0.1 - 0.05; // ±5% variance
      const performanceWithVariance = Math.max(0, Math.min(1, plugin.performance + variance));
      
      pluginHealthArray.push({
        ...plugin,
        performance: Math.round(performanceWithVariance * 100) / 100,
        lastUpdated: new Date()
      });
    }

    return pluginHealthArray;
  }

  async generateSystemReport(): Promise<SystemReport> {
    const [health, users, plugins] = await Promise.all([
      this.getSystemHealth(),
      this.getUserStatistics(),
      this.getPluginHealth()
    ]);

    // Generate some mock log entries
    const logs: LogEntry[] = [
      {
        id: 'log1',
        timestamp: new Date(Date.now() - 3600000), // 1 hour ago
        level: LogLevel.INFO,
        message: 'System health check completed',
        context: { component: 'admin-dashboard', action: 'system-health-check' },
        metadata: { cpu: health.cpu, memory: health.memory }
      },
      {
        id: 'log2',
        timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
        level: LogLevel.WARN,
        message: 'Plugin performance degradation detected',
        context: { component: 'plugin-monitor', action: 'performance-check' },
        pluginId: 'dashboard-plugin',
        metadata: { performance: 0.85 }
      },
      {
        id: 'log3',
        timestamp: new Date(Date.now() - 300000), // 5 minutes ago
        level: LogLevel.INFO,
        message: 'User statistics updated',
        context: { component: 'user-manager', action: 'statistics-update' },
        metadata: { totalUsers: users.totalUsers, activeUsers: users.activeUsers }
      }
    ];

    return {
      timestamp: new Date(),
      health,
      users,
      plugins,
      logs
    };
  }

  // Utility methods for testing and mock data management
  setMockUserCount(count: number): void {
    this.mockUsers = count;
  }

  addMockPlugin(pluginId: string, status: PluginStatus = PluginStatus.ENABLED): void {
    this.mockPlugins.set(pluginId, {
      pluginId,
      status,
      errors: Math.floor(Math.random() * 5),
      performance: 0.8 + Math.random() * 0.2,
      lastUpdated: new Date()
    });
  }

  removeMockPlugin(pluginId: string): void {
    this.mockPlugins.delete(pluginId);
  }

  simulatePluginError(pluginId: string): void {
    const plugin = this.mockPlugins.get(pluginId);
    if (plugin) {
      plugin.errors += 1;
      plugin.performance = Math.max(0.1, plugin.performance - 0.1);
      plugin.status = plugin.errors > 10 ? PluginStatus.ERROR : plugin.status;
      plugin.lastUpdated = new Date();
    }
  }

  resetMockData(): void {
    this.mockPlugins.clear();
    this.mockStartTime = new Date();
    this.initializeMockData();
  }
} 