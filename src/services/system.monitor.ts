import { ISystemMonitor } from '../interfaces/admin.interface';
import {
  ResourceMetrics,
  PerformanceData,
  ErrorStatistics,
  SystemAlert,
  LogLevel,
  LogEntry,
  AlertSeverity
} from '../types';

export class SystemMonitor implements ISystemMonitor {
  private alertSubscribers: Map<string, (alert: SystemAlert) => void> = new Map();
  private alertCounter: number = 0;
  private mockLogs: LogEntry[] = [];
  private isMonitoring: boolean = true;
  private monitoringInterval?: NodeJS.Timeout;

  constructor() {
    this.initializeMonitoring();
    this.generateMockLogs();
  }

  private initializeMonitoring(): void {
    // Start background monitoring that could trigger alerts
    this.monitoringInterval = setInterval(() => {
      this.checkSystemHealth();
    }, 30000); // Check every 30 seconds
  }

  private generateMockLogs(): void {
    // Generate some historical log entries for error statistics
    const now = Date.now();
    for (let i = 0; i < 100; i++) {
      const timestamp = new Date(now - (i * 60000)); // 1 minute intervals going back
      const level = this.getRandomLogLevel();
      
      this.mockLogs.push({
        id: `log_${i}`,
        timestamp,
        level,
        message: this.getRandomLogMessage(level),
        context: {
          component: this.getRandomComponent(),
          action: this.getRandomAction()
        },
        metadata: { index: i }
      });
    }
  }

  private getRandomLogLevel(): LogLevel {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR, LogLevel.FATAL];
    const weights = [0.3, 0.4, 0.2, 0.08, 0.02]; // Weighted towards less severe levels
    
    let random = Math.random();
    for (let i = 0; i < levels.length; i++) {
      random -= weights[i];
      if (random <= 0) return levels[i]!;
    }
    return LogLevel.INFO;
  }

  private getRandomComponent(): string {
    const components = ['auth-service', 'plugin-manager', 'settings-service', 'dashboard-manager', 'user-manager'];
    return components[Math.floor(Math.random() * components.length)] || 'unknown-component';
  }

  private getRandomAction(): string {
    const actions = ['initialize', 'process-request', 'update-data', 'validate-input', 'cleanup'];
    return actions[Math.floor(Math.random() * actions.length)] || 'unknown-action';
  }

  private getRandomLogMessage(level: LogLevel): string {
    const messages = {
      [LogLevel.DEBUG]: ['Debug trace completed', 'Variable state logged', 'Function entry/exit'],
      [LogLevel.INFO]: ['Operation completed successfully', 'User action processed', 'System state updated'],
      [LogLevel.WARN]: ['Performance threshold exceeded', 'Deprecated function called', 'Resource usage high'],
      [LogLevel.ERROR]: ['Request failed', 'Validation error occurred', 'Network timeout'],
      [LogLevel.FATAL]: ['System critical failure', 'Database connection lost', 'Security breach detected']
    };
    
    const levelMessages = messages[level];
    return levelMessages[Math.floor(Math.random() * levelMessages.length)] || 'Unknown message';
  }

  async getResourceUsage(): Promise<ResourceMetrics> {
    // Simulate realistic resource usage with some variance
    const baseCpu = 0.25 + Math.random() * 0.4; // 25-65%
    const baseMemory = 0.45 + Math.random() * 0.3; // 45-75%
    const baseDisk = 0.30 + Math.random() * 0.2; // 30-50%
    const baseNetwork = 0.15 + Math.random() * 0.25; // 15-40%

    return {
      cpu: Math.round(baseCpu * 100) / 100,
      memory: Math.round(baseMemory * 100) / 100,
      disk: Math.round(baseDisk * 100) / 100,
      network: Math.round(baseNetwork * 100) / 100
    };
  }

  async getPerformanceMetrics(): Promise<PerformanceData> {
    // Simulate performance metrics
    const baseResponseTime = 80 + Math.random() * 120; // 80-200ms
    const baseThroughput = 800 + Math.random() * 400; // 800-1200 req/sec
    const baseErrorRate = Math.random() * 0.05; // 0-5%
    const baseAvailability = 95 + Math.random() * 5; // 95-100%

    return {
      responseTime: Math.round(baseResponseTime),
      throughput: Math.round(baseThroughput),
      errorRate: Math.round(baseErrorRate * 1000) / 1000, // 3 decimal places
      availability: Math.round(baseAvailability * 100) / 100
    };
  }

  async getErrorRates(): Promise<ErrorStatistics> {
    // Analyze mock logs to generate error statistics
    const byLevel: Record<LogLevel, number> = {
      [LogLevel.DEBUG]: 0,
      [LogLevel.INFO]: 0,
      [LogLevel.WARN]: 0,
      [LogLevel.ERROR]: 0,
      [LogLevel.FATAL]: 0
    };

    const byPlugin: Record<string, number> = {};
    let total = 0;

    // Count logs by level and component (simulating plugin errors)
    this.mockLogs.forEach(log => {
      byLevel[log.level]++;
      if (log.level === LogLevel.ERROR || log.level === LogLevel.FATAL) {
        total++;
        const component = log.context.component;
        byPlugin[component] = (byPlugin[component] || 0) + 1;
      }
    });

    // Get recent error logs
    const recentErrors = this.mockLogs
      .filter(log => log.level === LogLevel.ERROR || log.level === LogLevel.FATAL)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      total,
      byLevel,
      byPlugin,
      recent: recentErrors
    };
  }

  subscribeToAlerts(callback: (alert: SystemAlert) => void): () => void {
    const subscriptionId = `subscription_${Date.now()}_${Math.random()}`;
    this.alertSubscribers.set(subscriptionId, callback);

    // Return unsubscribe function
    return () => {
      this.alertSubscribers.delete(subscriptionId);
    };
  }

  private async checkSystemHealth(): Promise<void> {
    if (!this.isMonitoring) return;

    try {
      const [resources, performance] = await Promise.all([
        this.getResourceUsage(),
        this.getPerformanceMetrics()
      ]);

      // Check for alert conditions
      await this.checkResourceAlerts(resources);
      await this.checkPerformanceAlerts(performance);
    } catch (error) {
      console.error('Error during system health check:', error);
    }
  }

  private async checkResourceAlerts(resources: ResourceMetrics): Promise<void> {
    // CPU usage alert
    if (resources.cpu > 0.8) {
      this.triggerAlert({
        type: 'resource',
        severity: resources.cpu > 0.9 ? AlertSeverity.CRITICAL : AlertSeverity.ERROR,
        message: `High CPU usage detected: ${Math.round(resources.cpu * 100)}%`,
        metadata: { cpu: resources.cpu }
      });
    }

    // Memory usage alert
    if (resources.memory > 0.85) {
      this.triggerAlert({
        type: 'resource',
        severity: resources.memory > 0.95 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
        message: `High memory usage detected: ${Math.round(resources.memory * 100)}%`,
        metadata: { memory: resources.memory }
      });
    }

    // Disk usage alert
    if (resources.disk > 0.9) {
      this.triggerAlert({
        type: 'resource',
        severity: AlertSeverity.WARNING,
        message: `High disk usage detected: ${Math.round(resources.disk * 100)}%`,
        metadata: { disk: resources.disk }
      });
    }
  }

  private async checkPerformanceAlerts(performance: PerformanceData): Promise<void> {
    // Response time alert
    if (performance.responseTime > 500) {
      this.triggerAlert({
        type: 'performance',
        severity: performance.responseTime > 1000 ? AlertSeverity.ERROR : AlertSeverity.WARNING,
        message: `High response time detected: ${performance.responseTime}ms`,
        metadata: { responseTime: performance.responseTime }
      });
    }

    // Error rate alert
    if (performance.errorRate > 0.05) {
      this.triggerAlert({
        type: 'performance',
        severity: performance.errorRate > 0.1 ? AlertSeverity.CRITICAL : AlertSeverity.ERROR,
        message: `High error rate detected: ${Math.round(performance.errorRate * 100)}%`,
        metadata: { errorRate: performance.errorRate }
      });
    }

    // Availability alert
    if (performance.availability < 99) {
      this.triggerAlert({
        type: 'availability',
        severity: performance.availability < 95 ? AlertSeverity.CRITICAL : AlertSeverity.WARNING,
        message: `Low availability detected: ${performance.availability}%`,
        metadata: { availability: performance.availability }
      });
    }
  }

  private triggerAlert(alertData: {
    type: string;
    severity: AlertSeverity;
    message: string;
    metadata: Record<string, any>;
  }): void {
    const alert: SystemAlert = {
      id: `alert_${this.alertCounter++}`,
      type: alertData.type,
      severity: alertData.severity,
      message: alertData.message,
      timestamp: new Date(),
      resolved: false
    };

    // Notify all subscribers
    this.alertSubscribers.forEach(callback => {
      try {
        callback(alert);
      } catch (error) {
        console.error('Error in alert callback:', error);
      }
    });
  }

  // Utility methods for testing and control
  startMonitoring(): void {
    this.isMonitoring = true;
    if (!this.monitoringInterval) {
      this.initializeMonitoring();
    }
  }

  stopMonitoring(): void {
    this.isMonitoring = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
    }
  }

  triggerTestAlert(type: string = 'test', severity: AlertSeverity = AlertSeverity.INFO): void {
    this.triggerAlert({
      type,
      severity,
      message: 'Test alert triggered manually',
      metadata: { test: true, timestamp: new Date().toISOString() }
    });
  }

  getSubscriberCount(): number {
    return this.alertSubscribers.size;
  }

  clearMockLogs(): void {
    this.mockLogs = [];
  }

  addMockLog(level: LogLevel, message: string, component: string = 'test'): void {
    this.mockLogs.push({
      id: `manual_${Date.now()}`,
      timestamp: new Date(),
      level,
      message,
      context: { component, action: 'manual-add' },
      metadata: { manual: true }
    });
  }

  destroy(): void {
    this.stopMonitoring();
    this.alertSubscribers.clear();
    this.mockLogs = [];
  }
} 