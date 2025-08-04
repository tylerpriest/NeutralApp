# Observability & Monitoring Guide

**Version:** 1.0.0  
**Last Updated:** 2025-08-04  
**Stack:** TypeScript/React/Express with Custom Error Reporting  

## Overview

NeutralApp implements a comprehensive observability strategy combining custom error reporting, health monitoring, and structured logging. This document outlines the current observability infrastructure and integration points for production monitoring.

## Logging Architecture

### Structured Logging Interface

The application uses a structured logging façade through the `error-reporter` feature:

```typescript
// Core logging interface - src/features/error-reporter/interfaces/logging.interface.ts
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
  sessionId?: string;
  component?: string;
  traceId?: string;
}

enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info', 
  WARN = 'warn',
  ERROR = 'error',
  CRITICAL = 'critical'
}
```

### Usage Examples

#### Server-Side Logging
```typescript
import { LoggingService } from '@/features/error-reporter/services/logging.service';

const logger = new LoggingService();

// Basic logging
logger.info('User authenticated successfully', { userId: 'user_123' });

// Error logging with context
logger.error('Database connection failed', {
  error: dbError,
  component: 'database',
  operation: 'connect',
  retryAttempt: 3
});

// Critical system events
logger.critical('Payment processing failure', {
  userId: 'user_456',
  amount: 99.99,
  transactionId: 'txn_789',
  error: paymentError
});
```

#### Client-Side Logging
```typescript
import { WebErrorLogger } from '@/web/client/services/WebErrorLogger';

const errorLogger = new WebErrorLogger();

// Component error logging
errorLogger.logError({
  message: 'Widget failed to render',
  error: renderError,
  component: 'CurrentBookWidget',
  severity: 'medium',
  context: {
    userId: currentUser.id,
    widgetId: 'current-book',
    props: widgetProps
  }
});
```

## Error Handling & Recovery

### Error Categories
- **User Errors**: Invalid input, authentication issues
- **System Errors**: Service failures, network issues
- **Critical Errors**: Data corruption, security breaches
- **Performance Errors**: Timeout, memory issues

### Recovery Strategies
```typescript
// Automatic retry with exponential backoff
const retryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 5000,
  exponentialFactor: 2
};

// Component-level error boundaries
<ErrorBoundary fallback={<ErrorFallback />} onError={handleError}>
  <WidgetComponent />
</ErrorBoundary>
```

## Health Monitoring

### Application Health Checks

#### Server Health Endpoint
```bash
GET /health
{
  "status": "healthy",
  "timestamp": "2025-08-04T10:30:00Z",
  "services": {
    "database": "healthy",
    "plugins": "healthy", 
    "auth": "healthy"
  },
  "metrics": {
    "uptime": 86400,
    "memory": { "used": "245MB", "total": "512MB" },
    "cpu": { "usage": "15%" }
  }
}
```

#### Plugin Health Monitoring
```typescript
// Plugin health status
const pluginHealth = await pluginHealthMonitor.getStatus();
/*
{
  "reading-core": {
    "status": "healthy",
    "lastCheck": "2025-08-04T10:29:00Z",
    "responseTime": 45,
    "errorCount": 0
  },
  "demo-hello-world": {
    "status": "degraded", 
    "lastCheck": "2025-08-04T10:29:00Z",
    "responseTime": 1200,
    "errorCount": 3
  }
}
*/
```

## Performance Monitoring

### Core Web Vitals Tracking
```typescript
// Performance metrics collection
const performanceMonitor = {
  trackPageLoad: (pageName: string, loadTime: number) => {
    logger.info('Page load performance', {
      page: pageName,
      loadTime,
      component: 'performance-monitor'
    });
  },
  
  trackUserInteraction: (action: string, duration: number) => {
    logger.info('User interaction performance', {
      action,
      duration,
      component: 'performance-monitor'
    });
  }
};
```

### Bundle Analysis
```bash
# Analyze bundle size
npm run build:analyze

# Performance profiling
npm run test:e2e -- tests/e2e/performance.spec.ts
```

## External Monitoring Integration

### Recommended Production Stack

#### Option 1: Sentry Integration
```typescript
// Sentry configuration example
import * as Sentry from '@sentry/node';
import * as SentryReact from '@sentry/react';

// Server-side integration
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app })
  ]
});

// Client-side integration  
SentryReact.init({
  dsn: process.env.REACT_APP_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [
    new SentryReact.BrowserTracing()
  ]
});
```

#### Option 2: Datadog Integration
```typescript
// Datadog APM integration
import tracer from 'dd-trace';

tracer.init({
  service: 'neutralapp',
  env: process.env.NODE_ENV,
  version: process.env.APP_VERSION
});
```

## Alerting & Notifications

### Alert Configuration
```yaml
# Example alert rules
alerts:
  - name: "High Error Rate"
    condition: "error_rate > 5% over 5 minutes"
    severity: "critical"
    notifications: ["ops-team", "on-call"]
    
  - name: "Plugin Health Degraded"
    condition: "plugin_health_score < 80%"
    severity: "warning" 
    notifications: ["dev-team"]
    
  - name: "Memory Usage High"
    condition: "memory_usage > 80%"
    severity: "warning"
    notifications: ["ops-team"]
```

### Notification Channels
- **Slack**: Real-time alerts to development team
- **Email**: Summary reports and critical alerts
- **PagerDuty**: Critical system failures requiring immediate response

## Development & Debugging

### Local Development Logging
```bash
# Enable debug logging
DEBUG=neutralapp:* npm run dev

# View structured logs
tail -f logs/application.log | jq .

# Monitor health checks
watch -n 5 'curl -s http://localhost:3000/health | jq .'
```

### Log Analysis Queries
```bash
# Find errors in last hour
grep '"level":"error"' logs/application.log | jq -r '.timestamp + " - " + .message'

# Plugin performance analysis
grep '"component":"plugin-manager"' logs/application.log | jq '.context.responseTime'

# User session tracking
grep '"userId":"user_123"' logs/application.log | jq -r '.timestamp + " - " + .message'
```

## Compliance & Security

### Data Privacy
- No sensitive data (passwords, tokens) logged
- User PII anonymized in logs
- Log retention policy: 30 days development, 90 days production

### Security Monitoring
- Failed authentication attempts tracking
- Unusual API usage patterns detection
- Plugin security violation monitoring

## Production Deployment Checklist

### Pre-Deployment
- [ ] External monitoring service configured
- [ ] Alert rules defined and tested  
- [ ] Log aggregation system operational
- [ ] Health check endpoints validated
- [ ] Performance baselines established

### Post-Deployment
- [ ] Health checks passing
- [ ] Error rates within acceptable limits
- [ ] Performance metrics meeting SLAs
- [ ] Alert notifications functioning
- [ ] Log ingestion operational

## Troubleshooting Guide

### Common Issues

#### High Memory Usage
1. Check plugin health status
2. Review error logs for memory leaks
3. Restart problematic plugins
4. Scale resources if needed

#### Elevated Error Rates
1. Identify error patterns in logs
2. Check external service dependencies
3. Review recent deployments
4. Implement circuit breakers if needed

#### Performance Degradation
1. Analyze Core Web Vitals metrics
2. Check database query performance
3. Review bundle size changes
4. Monitor network latency

### Emergency Procedures
- **Complete System Failure**: Execute rollback procedure
- **Data Corruption**: Restore from backup, investigate cause
- **Security Incident**: Isolate affected systems, begin incident response
- **Performance Crisis**: Enable emergency caching, scale resources

## Metrics & KPIs

### System Health
- Uptime: >99.9%
- Response Time: <200ms (95th percentile)
- Error Rate: <1%
- Plugin Health Score: >95%

### User Experience
- Page Load Time: <2 seconds
- Time to Interactive: <3 seconds
- Core Web Vitals: All metrics in "Good" range

### Development Velocity
- Mean Time to Recovery: <30 minutes
- Deployment Frequency: Multiple per day
- Change Failure Rate: <5%