import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

describe('Health Checks and Monitoring Infrastructure', () => {
  const projectRoot = process.cwd();

  describe('Health Check Endpoints', () => {
    test('should have health check endpoint in server', () => {
      const serverPath = join(projectRoot, 'src', 'web', 'server', 'index.ts');
      expect(existsSync(serverPath)).toBe(true);
      const serverContent = readFileSync(serverPath, 'utf-8');
      expect(serverContent).toContain('/health');
      expect(serverContent).toContain('Health Check');
    });

    test('should have API health check endpoint', () => {
      const serverPath = join(projectRoot, 'src', 'web', 'server', 'SimpleWebServer.ts');
      expect(existsSync(serverPath)).toBe(true);
      const serverContent = readFileSync(serverPath, 'utf-8');
      expect(serverContent).toContain('/api/health');
    });

    test('should have comprehensive health check response', () => {
      const serverPath = join(projectRoot, 'src', 'web', 'server', 'SimpleWebServer.ts');
      expect(existsSync(serverPath)).toBe(true);
      const serverContent = readFileSync(serverPath, 'utf-8');
      expect(serverContent).toContain('status');
      expect(serverContent).toContain('timestamp');
      expect(serverContent).toContain('version');
      expect(serverContent).toContain('uptime');
    });
  });

  describe('Monitoring Services', () => {
    test('should have system monitoring service', () => {
      const monitoringServicePath = join(projectRoot, 'src', 'features', 'admin', 'services', 'system.monitor.ts');
      expect(existsSync(monitoringServicePath)).toBe(true);
      const serviceContent = readFileSync(monitoringServicePath, 'utf-8');
      expect(serviceContent).toContain('class SystemMonitor');
      expect(serviceContent).toContain('getResourceUsage');
      expect(serviceContent).toContain('getPerformanceMetrics');
    });

    test('should have plugin health monitoring service', () => {
      const pluginHealthPath = join(projectRoot, 'src', 'features', 'plugin-manager', 'services', 'plugin.health.monitor.ts');
      expect(existsSync(pluginHealthPath)).toBe(true);
      const serviceContent = readFileSync(pluginHealthPath, 'utf-8');
      expect(serviceContent).toContain('class PluginHealthMonitor');
      expect(serviceContent).toContain('getPluginHealth');
      expect(serviceContent).toContain('getDetailedPluginMetrics');
    });

    test('should have error monitoring service', () => {
      const errorMonitoringPath = join(projectRoot, 'src', 'features', 'error-reporter', 'services', 'logging.service.ts');
      expect(existsSync(errorMonitoringPath)).toBe(true);
      const serviceContent = readFileSync(errorMonitoringPath, 'utf-8');
      expect(serviceContent).toContain('class LoggingService');
      expect(serviceContent).toContain('logError');
      expect(serviceContent).toContain('getErrorStatistics');
    });
  });

  describe('Health Check Scripts', () => {
    test('should have enhanced health-check.sh script', () => {
      const healthCheckScriptPath = join(projectRoot, 'scripts', 'health-check.sh');
      expect(existsSync(healthCheckScriptPath)).toBe(true);
      const scriptContent = readFileSync(healthCheckScriptPath, 'utf-8');
      expect(scriptContent).toContain('check_application_health');
      expect(scriptContent).toContain('check_database_connection');
      expect(scriptContent).toContain('check_api_endpoints');
      expect(scriptContent).toContain('check_system_resources');
      expect(scriptContent).toContain('check_plugin_health');
    });

    test('should have executable health check script', () => {
      const healthCheckScriptPath = join(projectRoot, 'scripts', 'health-check.sh');
      expect(existsSync(healthCheckScriptPath)).toBe(true);
      if (process.platform !== 'win32') {
        const stats = require('fs').statSync(healthCheckScriptPath);
        expect(stats.mode & 0o111).toBeTruthy();
      }
    });
  });

  describe('Monitoring Configuration', () => {
    test('should have monitoring configuration file', () => {
      const monitoringConfigPath = join(projectRoot, 'config', 'monitoring.json');
      expect(existsSync(monitoringConfigPath)).toBe(true);
      const configContent = readFileSync(monitoringConfigPath, 'utf-8');
      const config = JSON.parse(configContent);
      expect(config).toHaveProperty('healthCheck');
      expect(config).toHaveProperty('monitoring');
      expect(config).toHaveProperty('alerts');
    });

    test('should have health check intervals configured', () => {
      const monitoringConfigPath = join(projectRoot, 'config', 'monitoring.json');
      const configContent = readFileSync(monitoringConfigPath, 'utf-8');
      const config = JSON.parse(configContent);
      expect(config.healthCheck).toHaveProperty('interval');
      expect(config.healthCheck).toHaveProperty('timeout');
      expect(config.healthCheck).toHaveProperty('retries');
    });

    test('should have monitoring thresholds configured', () => {
      const monitoringConfigPath = join(projectRoot, 'config', 'monitoring.json');
      const configContent = readFileSync(monitoringConfigPath, 'utf-8');
      const config = JSON.parse(configContent);
      expect(config.monitoring).toHaveProperty('cpuThreshold');
      expect(config.monitoring).toHaveProperty('memoryThreshold');
      expect(config.monitoring).toHaveProperty('diskThreshold');
    });
  });

  describe('Alert System', () => {
    test('should have alert notification service', () => {
      const alertServicePath = join(projectRoot, 'src', 'features', 'error-reporter', 'services', 'developer-notification.service.ts');
      expect(existsSync(alertServicePath)).toBe(true);
      const serviceContent = readFileSync(alertServicePath, 'utf-8');
      expect(serviceContent).toContain('class DeveloperNotificationService');
      expect(serviceContent).toContain('notifyDeveloper');
      expect(serviceContent).toContain('sendEmail');
    });

    test('should have alert configuration', () => {
      const monitoringConfigPath = join(projectRoot, 'config', 'monitoring.json');
      const configContent = readFileSync(monitoringConfigPath, 'utf-8');
      const config = JSON.parse(configContent);
      expect(config.alerts).toHaveProperty('email');
      expect(config.alerts).toHaveProperty('webhook');
      expect(config.alerts).toHaveProperty('slack');
    });
  });

  describe('Performance Monitoring', () => {
    test('should have performance monitoring hooks', () => {
      const performanceHookPath = join(projectRoot, 'src', 'web', 'client', 'hooks', 'usePerformanceMonitor.ts');
      expect(existsSync(performanceHookPath)).toBe(true);
      const hookContent = readFileSync(performanceHookPath, 'utf-8');
      expect(hookContent).toContain('usePerformanceMonitor');
      expect(hookContent).toContain('startRender');
      expect(hookContent).toContain('endRender');
    });

    test('should have Core Web Vitals monitoring', () => {
      const performanceHookPath = join(projectRoot, 'src', 'web', 'client', 'hooks', 'usePerformanceMonitor.ts');
      const hookContent = readFileSync(performanceHookPath, 'utf-8');
      expect(hookContent).toContain('PerformanceObserver');
      expect(hookContent).toContain('performance.now');
      expect(hookContent).toContain('renderTime');
    });
  });

  describe('Dashboard Integration', () => {
    test('should have health monitoring dashboard components', () => {
      const adminPagePath = join(projectRoot, 'src', 'web', 'client', 'pages', 'AdminPage.tsx');
      expect(existsSync(adminPagePath)).toBe(true);
      const pageContent = readFileSync(adminPagePath, 'utf-8');
      expect(pageContent).toContain('SystemMonitor');
      expect(pageContent).toContain('PluginHealthStatus');
      expect(pageContent).toContain('PerformanceData');
    });

    test('should have real-time monitoring updates', () => {
      const adminPagePath = join(projectRoot, 'src', 'web', 'client', 'pages', 'AdminPage.tsx');
      const pageContent = readFileSync(adminPagePath, 'utf-8');
      expect(pageContent).toContain('useEffect');
      expect(pageContent).toContain('setInterval');
      expect(pageContent).toContain('monitoringInterval');
    });
  });

  describe('Logging and Metrics', () => {
    test('should have structured logging format', () => {
      const loggingServicePath = join(projectRoot, 'src', 'features', 'error-reporter', 'services', 'logging.service.ts');
      const serviceContent = readFileSync(loggingServicePath, 'utf-8');
      expect(serviceContent).toContain('LogEntry');
      expect(serviceContent).toContain('timestamp');
      expect(serviceContent).toContain('level');
      expect(serviceContent).toContain('context');
    });

    test('should have metrics collection', () => {
      const systemMonitorPath = join(projectRoot, 'src', 'features', 'admin', 'services', 'system.monitor.ts');
      const serviceContent = readFileSync(systemMonitorPath, 'utf-8');
      expect(serviceContent).toContain('getResourceUsage');
      expect(serviceContent).toContain('getPerformanceMetrics');
      expect(serviceContent).toContain('getErrorRates');
    });
  });

  describe('Integration Tests', () => {
    test('should have health check integration tests', () => {
      const integrationTestPath = join(projectRoot, 'tests', 'e2e', 'health-monitoring.spec.ts');
      expect(existsSync(integrationTestPath)).toBe(true);
      const testContent = readFileSync(integrationTestPath, 'utf-8');
      expect(testContent).toContain('health check');
      expect(testContent).toContain('monitoring');
      expect(testContent).toContain('alerts');
    });

    test('should have performance monitoring tests', () => {
      const performanceTestPath = join(projectRoot, 'tests', 'e2e', 'performance.spec.ts');
      expect(existsSync(performanceTestPath)).toBe(true);
      const testContent = readFileSync(performanceTestPath, 'utf-8');
      expect(testContent).toContain('performance');
      expect(testContent).toContain('metrics');
      expect(testContent).toContain('monitoring');
    });
  });

  describe('Production Readiness', () => {
    test('should have production monitoring configuration', () => {
      const productionEnvPath = join(projectRoot, 'config', 'environments', 'production.env');
      expect(existsSync(productionEnvPath)).toBe(true);
      const envContent = readFileSync(productionEnvPath, 'utf-8');
      expect(envContent).toContain('MONITORING_ENABLED=true');
      expect(envContent).toContain('ALERT_ENDPOINT');
      expect(envContent).toContain('METRICS_ENDPOINT');
    });

    test('should have monitoring npm scripts', () => {
      const packageJsonPath = join(projectRoot, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      expect(packageJson.scripts).toHaveProperty('monitor:health');
      expect(packageJson.scripts).toHaveProperty('monitor:performance');
      expect(packageJson.scripts).toHaveProperty('monitor:logs');
    });
  });
}); 