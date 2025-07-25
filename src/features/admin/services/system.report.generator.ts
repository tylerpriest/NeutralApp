import { AdminDashboard } from './admin.dashboard';
import { SystemMonitor } from './system.monitor';
import { UserManager } from './user.manager';
import { PluginHealthMonitor } from '../../plugin-manager/services/plugin.health.monitor';
import {
  SystemReport,
  SystemHealthMetrics,
  UserStatistics,
  PluginHealthStatus,
  ResourceMetrics,
  PerformanceData,
  ErrorStatistics,
  UserProfile,
  ActivityLog,
  LogEntry,
  AlertSeverity
} from '../../../shared';

export interface DetailedSystemReport extends SystemReport {
  resourceMetrics: ResourceMetrics;
  performanceData: PerformanceData;
  errorStatistics: ErrorStatistics;
  userProfiles: UserProfile[];
  recentUserActivity: ActivityLog[];
  pluginHealthSummary: {
    totalPlugins: number;
    healthyPlugins: number;
    unhealthyPlugins: number;
    errorPlugins: number;
    averageHealthScore: number;
    averagePerformance: number;
  };
  systemRecommendations: string[];
  criticalIssues: string[];
  reportMetadata: {
    generatedAt: Date;
    generatedBy: string;
    reportVersion: string;
    includedComponents: string[];
  };
}

export interface ReportConfiguration {
  includeUserProfiles?: boolean;
  includeUserActivity?: boolean;
  includeDetailedPluginMetrics?: boolean;
  includeErrorDetails?: boolean;
  includeRecommendations?: boolean;
  maxUserActivityEntries?: number;
  maxLogEntries?: number;
  severityThreshold?: AlertSeverity;
}

export class SystemReportGenerator {
  private adminDashboard: AdminDashboard;
  private systemMonitor: SystemMonitor;
  private userManager: UserManager;
  private pluginHealthMonitor: PluginHealthMonitor;

  constructor(
    adminDashboard?: AdminDashboard,
    systemMonitor?: SystemMonitor,
    userManager?: UserManager,
    pluginHealthMonitor?: PluginHealthMonitor
  ) {
    this.adminDashboard = adminDashboard || new AdminDashboard();
    this.systemMonitor = systemMonitor || new SystemMonitor();
    this.userManager = userManager || new UserManager();
    this.pluginHealthMonitor = pluginHealthMonitor || new PluginHealthMonitor();
  }

  async generateBasicReport(): Promise<SystemReport> {
    return await this.adminDashboard.generateSystemReport();
  }

  async generateDetailedReport(config: ReportConfiguration = {}): Promise<DetailedSystemReport> {
    const defaultConfig: ReportConfiguration = {
      includeUserProfiles: true,
      includeUserActivity: true,
      includeDetailedPluginMetrics: true,
      includeErrorDetails: true,
      includeRecommendations: true,
      maxUserActivityEntries: 100,
      maxLogEntries: 500,
      severityThreshold: AlertSeverity.INFO,
      ...config
    };

    console.log('Generating detailed system report...');

    // Gather all system data in parallel
    const [
      baseReport,
      resourceMetrics,
      performanceData,
      errorStatistics,
      userProfiles,
      pluginHealthSummary
    ] = await Promise.all([
      this.adminDashboard.generateSystemReport(),
      this.systemMonitor.getResourceUsage(),
      this.systemMonitor.getPerformanceMetrics(),
      this.systemMonitor.getErrorRates(),
      defaultConfig.includeUserProfiles ? this.userManager.getUserProfiles() : [],
      this.pluginHealthMonitor.getSystemHealthSummary()
    ]);

    // Gather user activity if requested
    let recentUserActivity: ActivityLog[] = [];
    if (defaultConfig.includeUserActivity && userProfiles.length > 0) {
      const activityPromises = userProfiles.slice(0, 10).map(user => 
        this.userManager.getUserActivity(user.id)
      );
      const userActivities = await Promise.all(activityPromises);
      recentUserActivity = userActivities
        .flat()
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, defaultConfig.maxUserActivityEntries || 100);
    }

    // Generate system recommendations
    const systemRecommendations = defaultConfig.includeRecommendations 
      ? this.generateRecommendations(baseReport.health, resourceMetrics, performanceData, pluginHealthSummary)
      : [];

    // Identify critical issues
    const criticalIssues = this.identifyCriticalIssues(
      baseReport.health,
      resourceMetrics,
      performanceData,
      errorStatistics,
      pluginHealthSummary
    );

    const detailedReport: DetailedSystemReport = {
      ...baseReport,
      resourceMetrics,
      performanceData,
      errorStatistics,
      userProfiles,
      recentUserActivity,
      pluginHealthSummary,
      systemRecommendations,
      criticalIssues,
      reportMetadata: {
        generatedAt: new Date(),
        generatedBy: 'SystemReportGenerator v1.0',
        reportVersion: '1.0.0',
        includedComponents: [
          'AdminDashboard',
          'SystemMonitor',
          'UserManager',
          'PluginHealthMonitor'
        ]
      }
    };

    console.log('Detailed system report generated successfully');
    return detailedReport;
  }

  private generateRecommendations(
    health: SystemHealthMetrics,
    resources: ResourceMetrics,
    performance: PerformanceData,
    pluginSummary: any
  ): string[] {
    const recommendations: string[] = [];

    // Resource-based recommendations
    if (resources.cpu > 0.8) {
      recommendations.push('High CPU usage detected. Consider optimizing CPU-intensive processes or upgrading hardware.');
    }

    if (resources.memory > 0.85) {
      recommendations.push('High memory usage detected. Review memory-intensive applications and consider increasing available RAM.');
    }

    if (resources.disk > 0.9) {
      recommendations.push('Disk usage is critically high. Clean up unnecessary files or expand storage capacity.');
    }

    // Performance-based recommendations
    if (performance.responseTime > 500) {
      recommendations.push('Response times are elevated. Optimize application performance and database queries.');
    }

    if (performance.errorRate > 0.05) {
      recommendations.push('Error rate is above acceptable threshold. Review error logs and fix underlying issues.');
    }

    if (performance.availability < 99) {
      recommendations.push('System availability is below target. Investigate downtime causes and improve reliability.');
    }

    // Plugin-based recommendations
    if (pluginSummary.errorPlugins > 0) {
      recommendations.push(`${pluginSummary.errorPlugins} plugins are in error state. Review and fix failing plugins.`);
    }

    if (pluginSummary.averageHealthScore < 0.7) {
      recommendations.push('Average plugin health score is low. Monitor plugin performance and consider updates.');
    }

    if (pluginSummary.unhealthyPlugins > 0) {
      recommendations.push(`${pluginSummary.unhealthyPlugins} plugins are unhealthy. Review plugin configuration and resources.`);
    }

    // User-based recommendations
    if (health.activeUsers < health.activeUsers * 0.5) {
      recommendations.push('User engagement appears low. Consider user retention strategies.');
    }

    // General system recommendations
    if (health.errors > 50) {
      recommendations.push('High system error count detected. Implement comprehensive error monitoring and alerting.');
    }

    return recommendations;
  }

  private identifyCriticalIssues(
    health: SystemHealthMetrics,
    resources: ResourceMetrics,
    performance: PerformanceData,
    errors: ErrorStatistics,
    pluginSummary: any
  ): string[] {
    const criticalIssues: string[] = [];

    // Critical resource issues
    if (resources.cpu > 0.95) {
      criticalIssues.push('CRITICAL: CPU usage is at 95%+ - system may become unresponsive');
    }

    if (resources.memory > 0.95) {
      criticalIssues.push('CRITICAL: Memory usage is at 95%+ - risk of system crashes');
    }

    if (resources.disk > 0.98) {
      criticalIssues.push('CRITICAL: Disk space is critically low - system may fail');
    }

    // Critical performance issues
    if (performance.errorRate > 0.1) {
      criticalIssues.push('CRITICAL: Error rate exceeds 10% - service degradation likely');
    }

    if (performance.availability < 95) {
      criticalIssues.push('CRITICAL: System availability below 95% - immediate attention required');
    }

    if (performance.responseTime > 2000) {
      criticalIssues.push('CRITICAL: Response times exceed 2 seconds - user experience severely impacted');
    }

    // Critical plugin issues
    if (pluginSummary.errorPlugins > pluginSummary.totalPlugins * 0.3) {
      criticalIssues.push('CRITICAL: More than 30% of plugins are in error state');
    }

    // Critical error issues
    if (errors.total > 1000) {
      criticalIssues.push('CRITICAL: System has accumulated over 1000 errors - investigate immediately');
    }

    return criticalIssues;
  }

  async generateHealthSummary(): Promise<{
    overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    healthScore: number;
    summary: string;
    keyMetrics: {
      system: { cpu: number; memory: number; disk: number };
      performance: { responseTime: number; availability: number; errorRate: number };
      plugins: { healthy: number; total: number; healthScore: number };
      users: { total: number; active: number };
    };
  }> {
    const [health, resources, performance, pluginSummary, userStats] = await Promise.all([
      this.adminDashboard.getSystemHealth(),
      this.systemMonitor.getResourceUsage(),
      this.systemMonitor.getPerformanceMetrics(),
      this.pluginHealthMonitor.getSystemHealthSummary(),
      this.adminDashboard.getUserStatistics()
    ]);

    // Calculate overall health score (0-100)
    let healthScore = 100;

    // Deduct for resource usage
    healthScore -= Math.max(0, (resources.cpu - 0.7) * 100);
    healthScore -= Math.max(0, (resources.memory - 0.8) * 100);
    healthScore -= Math.max(0, (resources.disk - 0.8) * 50);

    // Deduct for performance issues
    healthScore -= Math.max(0, (performance.errorRate - 0.01) * 1000);
    healthScore -= Math.max(0, (performance.responseTime - 200) / 10);
    healthScore -= Math.max(0, (99.5 - performance.availability) * 10);

    // Deduct for plugin issues
    healthScore -= Math.max(0, (0.8 - pluginSummary.averageHealthScore) * 100);

    healthScore = Math.max(0, Math.round(healthScore));

    // Determine overall health category
    let overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
    let summary: string;

    if (healthScore >= 90) {
      overallHealth = 'excellent';
      summary = 'System is operating optimally with excellent performance across all metrics.';
    } else if (healthScore >= 75) {
      overallHealth = 'good';
      summary = 'System is operating well with good performance. Minor optimizations recommended.';
    } else if (healthScore >= 60) {
      overallHealth = 'fair';
      summary = 'System is functioning adequately but has performance issues that should be addressed.';
    } else if (healthScore >= 40) {
      overallHealth = 'poor';
      summary = 'System has significant performance problems requiring immediate attention.';
    } else {
      overallHealth = 'critical';
      summary = 'System is in critical condition with severe performance issues. Urgent action required.';
    }

    return {
      overallHealth,
      healthScore,
      summary,
      keyMetrics: {
        system: {
          cpu: Math.round(resources.cpu * 100),
          memory: Math.round(resources.memory * 100),
          disk: Math.round(resources.disk * 100)
        },
        performance: {
          responseTime: Math.round(performance.responseTime),
          availability: Math.round(performance.availability * 100) / 100,
          errorRate: Math.round(performance.errorRate * 10000) / 100 // Convert to percentage
        },
        plugins: {
          healthy: pluginSummary.healthyPlugins,
          total: pluginSummary.totalPlugins,
          healthScore: Math.round(pluginSummary.averageHealthScore * 100)
        },
        users: {
          total: userStats.totalUsers,
          active: userStats.activeUsers
        }
      }
    };
  }

  async exportReport(report: DetailedSystemReport, format: 'json' | 'summary' = 'json'): Promise<string> {
    if (format === 'summary') {
      return this.generateTextSummary(report);
    }
    
    return JSON.stringify(report, null, 2);
  }

  private generateTextSummary(report: DetailedSystemReport): string {
    const lines: string[] = [];
    
    lines.push('='.repeat(50));
    lines.push('SYSTEM HEALTH REPORT');
    lines.push('='.repeat(50));
    lines.push(`Generated: ${report.reportMetadata.generatedAt.toISOString()}`);
    lines.push(`Report Version: ${report.reportMetadata.reportVersion}`);
    lines.push('');

    // System Health
    lines.push('SYSTEM HEALTH');
    lines.push('-'.repeat(20));
    lines.push(`CPU Usage: ${Math.round(report.resourceMetrics.cpu * 100)}%`);
    lines.push(`Memory Usage: ${Math.round(report.resourceMetrics.memory * 100)}%`);
    lines.push(`Disk Usage: ${Math.round(report.resourceMetrics.disk * 100)}%`);
    lines.push(`Uptime: ${Math.round(report.health.uptime / 3600)} hours`);
    lines.push('');

    // Performance
    lines.push('PERFORMANCE METRICS');
    lines.push('-'.repeat(20));
    lines.push(`Response Time: ${report.performanceData.responseTime}ms`);
    lines.push(`Throughput: ${report.performanceData.throughput} req/sec`);
    lines.push(`Error Rate: ${Math.round(report.performanceData.errorRate * 10000) / 100}%`);
    lines.push(`Availability: ${report.performanceData.availability}%`);
    lines.push('');

    // Users
    lines.push('USER STATISTICS');
    lines.push('-'.repeat(20));
    lines.push(`Total Users: ${report.users.totalUsers}`);
    lines.push(`Active Users: ${report.users.activeUsers}`);
    lines.push(`New Users: ${report.users.newUsers}`);
    lines.push(`Growth Rate: ${report.users.userGrowth}%`);
    lines.push('');

    // Plugins
    lines.push('PLUGIN HEALTH');
    lines.push('-'.repeat(20));
    lines.push(`Total Plugins: ${report.pluginHealthSummary.totalPlugins}`);
    lines.push(`Healthy Plugins: ${report.pluginHealthSummary.healthyPlugins}`);
    lines.push(`Unhealthy Plugins: ${report.pluginHealthSummary.unhealthyPlugins}`);
    lines.push(`Error Plugins: ${report.pluginHealthSummary.errorPlugins}`);
    lines.push(`Average Health Score: ${Math.round(report.pluginHealthSummary.averageHealthScore * 100)}%`);
    lines.push('');

    // Critical Issues
    if (report.criticalIssues.length > 0) {
      lines.push('CRITICAL ISSUES');
      lines.push('-'.repeat(20));
      report.criticalIssues.forEach(issue => {
        lines.push(`⚠️  ${issue}`);
      });
      lines.push('');
    }

    // Recommendations
    if (report.systemRecommendations.length > 0) {
      lines.push('RECOMMENDATIONS');
      lines.push('-'.repeat(20));
      report.systemRecommendations.forEach((rec, index) => {
        lines.push(`${index + 1}. ${rec}`);
      });
      lines.push('');
    }

    lines.push('='.repeat(50));
    lines.push('End of Report');
    lines.push('='.repeat(50));

    return lines.join('\n');
  }

  // Utility methods
  setComponents(
    adminDashboard?: AdminDashboard,
    systemMonitor?: SystemMonitor,
    userManager?: UserManager,
    pluginHealthMonitor?: PluginHealthMonitor
  ): void {
    if (adminDashboard) this.adminDashboard = adminDashboard;
    if (systemMonitor) this.systemMonitor = systemMonitor;
    if (userManager) this.userManager = userManager;
    if (pluginHealthMonitor) this.pluginHealthMonitor = pluginHealthMonitor;
  }

  destroy(): void {
    this.systemMonitor.destroy();
    this.pluginHealthMonitor.destroy();
  }
} 