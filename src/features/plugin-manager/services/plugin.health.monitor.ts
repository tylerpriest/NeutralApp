import {
  PluginHealthStatus,
  PluginStatus,
  SystemAlert,
  AlertSeverity,
  LogEntry,
  LogLevel
} from '../../../shared';

export interface PluginHealthMetrics {
  pluginId: string;
  status: PluginStatus;
  version: string;
  errors: number;
  performance: number;
  memoryUsage: number;
  lastUpdated: Date;
  healthScore: number;
  uptime: number;
  crashCount: number;
  averageResponseTime: number;
}

export interface PluginHealthThresholds {
  maxErrors: number;
  minPerformance: number;
  maxMemoryUsage: number;
  minHealthScore: number;
  maxResponseTime: number;
  maxCrashCount: number;
}

export class PluginHealthMonitor {
  private pluginMetrics: Map<string, PluginHealthMetrics> = new Map();
  private healthThresholds: PluginHealthThresholds;
  private alertCallbacks: ((alert: SystemAlert) => void)[] = [];
  private monitoringInterval?: NodeJS.Timeout;
  private isMonitoring: boolean = false;

  constructor(thresholds?: Partial<PluginHealthThresholds>) {
    this.healthThresholds = {
      maxErrors: 10,
      minPerformance: 0.7,
      maxMemoryUsage: 100, // MB
      minHealthScore: 0.6,
      maxResponseTime: 1000, // ms
      maxCrashCount: 3,
      ...thresholds
    };

    this.initializeMockPlugins();
    this.startMonitoring();
  }

  private initializeMockPlugins(): void {
    const mockPlugins = [
      {
        pluginId: 'auth-plugin',
        status: PluginStatus.ENABLED,
        version: '1.2.3',
        errors: 1,
        performance: 0.95,
        memoryUsage: 45,
        healthScore: 0.92,
        uptime: 86400, // 24 hours in seconds
        crashCount: 0,
        averageResponseTime: 120
      },
      {
        pluginId: 'dashboard-widget',
        status: PluginStatus.ENABLED,
        version: '2.1.0',
        errors: 3,
        performance: 0.88,
        memoryUsage: 65,
        healthScore: 0.85,
        uptime: 72000, // 20 hours
        crashCount: 1,
        averageResponseTime: 180
      },
      {
        pluginId: 'file-manager',
        status: PluginStatus.DISABLED,
        version: '0.9.1',
        errors: 8,
        performance: 0.65,
        memoryUsage: 120,
        healthScore: 0.55,
        uptime: 3600, // 1 hour
        crashCount: 2,
        averageResponseTime: 850
      },
      {
        pluginId: 'notification-service',
        status: PluginStatus.ERROR,
        version: '1.0.5',
        errors: 15,
        performance: 0.40,
        memoryUsage: 200,
        healthScore: 0.25,
        uptime: 1800, // 30 minutes
        crashCount: 5,
        averageResponseTime: 1200
      }
    ];

    mockPlugins.forEach(plugin => {
      this.pluginMetrics.set(plugin.pluginId, {
        ...plugin,
        lastUpdated: new Date()
      });
    });
  }

  startMonitoring(): void {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, 30000); // Check every 30 seconds

    console.log('PluginHealthMonitor: Monitoring started');
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
    console.log('PluginHealthMonitor: Monitoring stopped');
  }

  private performHealthCheck(): void {
    for (const [pluginId, metrics] of this.pluginMetrics) {
      this.updatePluginMetrics(pluginId);
      this.checkPluginHealth(pluginId, metrics);
    }
  }

  private updatePluginMetrics(pluginId: string): void {
    const metrics = this.pluginMetrics.get(pluginId);
    if (!metrics) return;

    // Simulate metric fluctuations
    const variance = 0.1; // ±10% variance
    
    // Update performance with some variance
    const performanceChange = (Math.random() - 0.5) * variance;
    metrics.performance = Math.max(0, Math.min(1, metrics.performance + performanceChange));

    // Potentially increase errors occasionally
    if (Math.random() < 0.05) { // 5% chance
      metrics.errors += 1;
    }

    // Update memory usage
    const memoryChange = (Math.random() - 0.5) * 10; // ±5MB variance
    metrics.memoryUsage = Math.max(0, metrics.memoryUsage + memoryChange);

    // Update response time
    const responseTimeChange = (Math.random() - 0.5) * 100; // ±50ms variance
    metrics.averageResponseTime = Math.max(50, metrics.averageResponseTime + responseTimeChange);

    // Recalculate health score
    metrics.healthScore = this.calculateHealthScore(metrics);
    metrics.lastUpdated = new Date();

    // Update uptime (if plugin is running)
    if (metrics.status === PluginStatus.ENABLED) {
      metrics.uptime += 30; // Add 30 seconds
    }

    this.pluginMetrics.set(pluginId, metrics);
  }

  private calculateHealthScore(metrics: PluginHealthMetrics): number {
    let score = 1.0;

    // Deduct points for errors
    const errorPenalty = Math.min(0.5, (metrics.errors / this.healthThresholds.maxErrors) * 0.5);
    score -= errorPenalty;

    // Deduct points for poor performance
    if (metrics.performance < this.healthThresholds.minPerformance) {
      score -= (this.healthThresholds.minPerformance - metrics.performance) * 0.3;
    }

    // Deduct points for high memory usage
    if (metrics.memoryUsage > this.healthThresholds.maxMemoryUsage) {
      const memoryPenalty = Math.min(0.2, (metrics.memoryUsage - this.healthThresholds.maxMemoryUsage) / 100 * 0.2);
      score -= memoryPenalty;
    }

    // Deduct points for slow response times
    if (metrics.averageResponseTime > this.healthThresholds.maxResponseTime) {
      const responsePenalty = Math.min(0.2, (metrics.averageResponseTime - this.healthThresholds.maxResponseTime) / 1000 * 0.2);
      score -= responsePenalty;
    }

    // Deduct points for crashes
    const crashPenalty = Math.min(0.3, (metrics.crashCount / this.healthThresholds.maxCrashCount) * 0.3);
    score -= crashPenalty;

    return Math.max(0, Math.round(score * 100) / 100);
  }

  private checkPluginHealth(pluginId: string, metrics: PluginHealthMetrics): void {
    const issues: string[] = [];

    // Check various health thresholds
    if (metrics.errors >= this.healthThresholds.maxErrors) {
      issues.push(`High error count: ${metrics.errors}`);
      this.triggerAlert(pluginId, AlertSeverity.ERROR, `Plugin ${pluginId} has high error count: ${metrics.errors}`);
    }

    if (metrics.performance < this.healthThresholds.minPerformance) {
      issues.push(`Low performance: ${Math.round(metrics.performance * 100)}%`);
      this.triggerAlert(pluginId, AlertSeverity.WARNING, `Plugin ${pluginId} performance below threshold: ${Math.round(metrics.performance * 100)}%`);
    }

    if (metrics.memoryUsage > this.healthThresholds.maxMemoryUsage) {
      issues.push(`High memory usage: ${metrics.memoryUsage}MB`);
      this.triggerAlert(pluginId, AlertSeverity.WARNING, `Plugin ${pluginId} using excessive memory: ${metrics.memoryUsage}MB`);
    }

    if (metrics.healthScore < this.healthThresholds.minHealthScore) {
      issues.push(`Low health score: ${metrics.healthScore}`);
      this.triggerAlert(pluginId, AlertSeverity.CRITICAL, `Plugin ${pluginId} health score critical: ${metrics.healthScore}`);
    }

    if (metrics.crashCount >= this.healthThresholds.maxCrashCount) {
      issues.push(`High crash count: ${metrics.crashCount}`);
      this.triggerAlert(pluginId, AlertSeverity.CRITICAL, `Plugin ${pluginId} has crashed ${metrics.crashCount} times`);
    }

    // Update plugin status based on health
    if (issues.length > 0) {
      if (metrics.healthScore < 0.3 || metrics.crashCount >= this.healthThresholds.maxCrashCount) {
        metrics.status = PluginStatus.ERROR;
      } else if (metrics.status === PluginStatus.ENABLED && metrics.healthScore < 0.5) {
        metrics.status = PluginStatus.DISABLED;
      }
    }
  }

  private triggerAlert(pluginId: string, severity: AlertSeverity, message: string): void {
    const alert: SystemAlert = {
      id: `plugin_alert_${Date.now()}_${Math.random()}`,
      type: 'plugin_health',
      severity,
      message,
      timestamp: new Date(),
      resolved: false
    };

    this.alertCallbacks.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in plugin health alert callback:', error);
      }
    });
  }

  // Public interface methods
  getPluginHealth(pluginId?: string): PluginHealthStatus[] {
    const plugins = pluginId 
      ? [this.pluginMetrics.get(pluginId)].filter(Boolean) as PluginHealthMetrics[]
      : Array.from(this.pluginMetrics.values());

    return plugins.map(plugin => ({
      pluginId: plugin.pluginId,
      status: plugin.status,
      errors: plugin.errors,
      performance: plugin.performance,
      lastUpdated: plugin.lastUpdated
    }));
  }

  getDetailedPluginMetrics(pluginId?: string): PluginHealthMetrics[] {
    if (pluginId) {
      const metrics = this.pluginMetrics.get(pluginId);
      return metrics ? [metrics] : [];
    }
    return Array.from(this.pluginMetrics.values());
  }

  getPluginsByStatus(status: PluginStatus): PluginHealthMetrics[] {
    return Array.from(this.pluginMetrics.values())
      .filter(plugin => plugin.status === status);
  }

  getUnhealthyPlugins(threshold: number = 0.6): PluginHealthMetrics[] {
    return Array.from(this.pluginMetrics.values())
      .filter(plugin => plugin.healthScore < threshold);
  }

  subscribeToAlerts(callback: (alert: SystemAlert) => void): () => void {
    this.alertCallbacks.push(callback);
    
    return () => {
      const index = this.alertCallbacks.indexOf(callback);
      if (index > -1) {
        this.alertCallbacks.splice(index, 1);
      }
    };
  }

  // Plugin management methods
  registerPlugin(pluginId: string, initialMetrics?: Partial<PluginHealthMetrics>): void {
    const defaultMetrics: PluginHealthMetrics = {
      pluginId,
      status: PluginStatus.INSTALLED,
      version: '1.0.0',
      errors: 0,
      performance: 1.0,
      memoryUsage: 20,
      lastUpdated: new Date(),
      healthScore: 1.0,
      uptime: 0,
      crashCount: 0,
      averageResponseTime: 100,
      ...initialMetrics
    };

    this.pluginMetrics.set(pluginId, defaultMetrics);
    console.log(`Plugin ${pluginId} registered for health monitoring`);
  }

  unregisterPlugin(pluginId: string): void {
    if (this.pluginMetrics.delete(pluginId)) {
      console.log(`Plugin ${pluginId} unregistered from health monitoring`);
    }
  }

  updatePluginStatus(pluginId: string, status: PluginStatus): void {
    const metrics = this.pluginMetrics.get(pluginId);
    if (metrics) {
      metrics.status = status;
      metrics.lastUpdated = new Date();
      
      if (status === PluginStatus.ENABLED) {
        metrics.uptime = 0; // Reset uptime when enabling
      }
      
      this.pluginMetrics.set(pluginId, metrics);
    }
  }

  simulatePluginCrash(pluginId: string): void {
    const metrics = this.pluginMetrics.get(pluginId);
    if (metrics) {
      metrics.crashCount += 1;
      metrics.status = PluginStatus.ERROR;
      metrics.uptime = 0; // Reset uptime after crash
      metrics.healthScore = this.calculateHealthScore(metrics);
      metrics.lastUpdated = new Date();
      
      this.triggerAlert(pluginId, AlertSeverity.CRITICAL, `Plugin ${pluginId} has crashed`);
      this.pluginMetrics.set(pluginId, metrics);
    }
  }

  getSystemHealthSummary(): {
    totalPlugins: number;
    healthyPlugins: number;
    unhealthyPlugins: number;
    errorPlugins: number;
    averageHealthScore: number;
    averagePerformance: number;
  } {
    const plugins = Array.from(this.pluginMetrics.values());
    const healthyPlugins = plugins.filter(p => p.healthScore >= 0.7).length;
    const unhealthyPlugins = plugins.filter(p => p.healthScore < 0.7 && p.status !== PluginStatus.ERROR).length;
    const errorPlugins = plugins.filter(p => p.status === PluginStatus.ERROR).length;
    
    const averageHealthScore = plugins.length > 0 
      ? plugins.reduce((sum, p) => sum + p.healthScore, 0) / plugins.length 
      : 1.0;
      
    const averagePerformance = plugins.length > 0
      ? plugins.reduce((sum, p) => sum + p.performance, 0) / plugins.length
      : 1.0;

    return {
      totalPlugins: plugins.length,
      healthyPlugins,
      unhealthyPlugins,
      errorPlugins,
      averageHealthScore: Math.round(averageHealthScore * 100) / 100,
      averagePerformance: Math.round(averagePerformance * 100) / 100
    };
  }

  // Utility methods for testing
  updateThresholds(newThresholds: Partial<PluginHealthThresholds>): void {
    this.healthThresholds = { ...this.healthThresholds, ...newThresholds };
  }

  getThresholds(): PluginHealthThresholds {
    return { ...this.healthThresholds };
  }

  clearAllPlugins(): void {
    this.pluginMetrics.clear();
  }

  destroy(): void {
    this.stopMonitoring();
    this.pluginMetrics.clear();
    this.alertCallbacks = [];
  }
} 