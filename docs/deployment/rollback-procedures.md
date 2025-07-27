# Rollback Procedures

## Overview

This document provides detailed procedures for rolling back NeutralApp deployments to previous versions. Rollback procedures are critical for maintaining system stability and minimizing downtime during deployment issues.

## Rollback Process

### 1. Pre-Rollback Assessment

Before initiating a rollback, assess the current situation:

#### Check Current Status
```bash
# Check current deployment health
./scripts/health-check.sh production

# Check current version
docker images neutral-app --format "table {{.Tag}}\t{{.CreatedAt}}"

# Check deployment logs
docker-compose -f docker-compose.prod.yml logs --tail=100
```

#### Identify Rollback Target
```bash
# List available versions
./scripts/rollback.sh production --list

# Check version compatibility
./scripts/rollback.sh production --check-version v1.0.1
```

### 2. Rollback Execution

#### Automatic Rollback
```bash
# Rollback to previous version
./scripts/rollback.sh production previous

# Rollback to specific version
./scripts/rollback.sh production v1.0.1

# Rollback with verification
./scripts/rollback.sh production v1.0.1 --verify
```

#### Manual Rollback (Emergency)
```bash
# Stop current deployment
docker-compose -f docker-compose.prod.yml down

# Pull previous version
docker pull your-registry.com/neutral-app:previous

# Deploy previous version
docker-compose -f docker-compose.prod.yml up -d

# Verify deployment
./scripts/health-check.sh production
```

### 3. Post-Rollback Verification

#### Health Checks
```bash
# Run comprehensive health checks
./scripts/health-check.sh production

# Check application endpoints
curl -f https://neutralapp.com/health
curl -f https://neutralapp.com/api/health
```

#### Smoke Tests
```bash
# Run smoke tests
./scripts/smoke-tests.sh production

# Run E2E tests
npm run test:e2e -- tests/e2e/navigation.spec.ts
```

#### Performance Verification
```bash
# Check performance metrics
./scripts/verify-performance.sh production

# Monitor for performance issues
./scripts/monitor:performance
```

## Version Management

### Version Naming Convention

- **Semantic Versioning**: `v1.0.0`, `v1.0.1`, `v1.1.0`
- **Release Tags**: `latest`, `previous`, `stable`
- **Environment Tags**: `production`, `staging`, `development`
- **Feature Tags**: `feature-auth`, `feature-plugins`

### Version Lifecycle

#### 1. Development
```bash
# Tag development version
git tag -a v1.0.1-dev -m "Development version 1.0.1"
docker tag neutral-app:latest neutral-app:v1.0.1-dev
```

#### 2. Staging
```bash
# Deploy to staging
./scripts/deploy.sh staging
docker tag neutral-app:staging neutral-app:v1.0.1-staging
```

#### 3. Production
```bash
# Deploy to production
./scripts/deploy.sh production
docker tag neutral-app:production neutral-app:v1.0.1
```

#### 4. Rollback Preparation
```bash
# Tag current as previous
docker tag neutral-app:v1.0.1 neutral-app:previous

# Update stable tag
docker tag neutral-app:v1.0.1 neutral-app:stable
```

### Version Storage

#### Docker Registry
```bash
# Push version to registry
docker push your-registry.com/neutral-app:v1.0.1

# Pull version from registry
docker pull your-registry.com/neutral-app:v1.0.1
```

#### Local Storage
```bash
# Save version locally
docker save neutral-app:v1.0.1 -o neutral-app-v1.0.1.tar

# Load version locally
docker load -i neutral-app-v1.0.1.tar
```

### Version Cleanup

#### Automatic Cleanup
```json
{
  "rollback": {
    "versionManagement": {
      "keepVersions": 5,
      "cleanupOldVersions": true,
      "cleanupSchedule": "weekly"
    }
  }
}
```

#### Manual Cleanup
```bash
# Remove old versions
docker rmi neutral-app:v1.0.0
docker rmi neutral-app:v1.0.1-dev

# Clean up registry
docker registry garbage-collect
```

## Emergency Procedures

### Critical Issues

#### 1. Application Not Responding
```bash
# Immediate rollback
./scripts/rollback.sh production previous --emergency

# Verify rollback
./scripts/health-check.sh production
```

#### 2. Database Issues
```bash
# Check database connectivity
./scripts/health-check.sh production --check-database

# Rollback if database is unreachable
./scripts/rollback.sh production previous --skip-database-check
```

#### 3. Security Vulnerabilities
```bash
# Emergency security rollback
./scripts/rollback.sh production stable --security

# Verify security
./scripts/verify-security.sh production
```

### Manual Override

#### Bypass Verification
```bash
# Rollback without verification
./scripts/rollback.sh production previous --no-verify

# Force rollback
./scripts/rollback.sh production previous --force
```

#### Emergency Access
```bash
# Direct container access
docker exec -it neutral-app-production bash

# Manual service restart
docker-compose -f docker-compose.prod.yml restart
```

## Rollback Configuration

### Environment-Specific Settings

#### Production Environment
```json
{
  "rollback": {
    "autoRollback": true,
    "maxRollbackAttempts": 3,
    "rollbackThreshold": 0.8,
    "emergencyRollback": true,
    "verification": {
      "healthCheckAfterRollback": true,
      "smokeTestAfterRollback": true,
      "performanceCheckAfterRollback": true
    }
  }
}
```

#### Staging Environment
```json
{
  "rollback": {
    "autoRollback": true,
    "maxRollbackAttempts": 2,
    "rollbackThreshold": 0.7,
    "emergencyRollback": false,
    "verification": {
      "healthCheckAfterRollback": true,
      "smokeTestAfterRollback": false,
      "performanceCheckAfterRollback": false
    }
  }
}
```

### Notification Settings

#### Rollback Notifications
```json
{
  "notifications": {
    "rollback": {
      "enabled": true,
      "channels": {
        "slack": {
          "webhookUrl": "https://hooks.slack.com/services/YOUR/ROLLBACK/WEBHOOK",
          "channel": "#rollbacks"
        },
        "email": {
          "recipients": ["admin@neutralapp.com", "devops@neutralapp.com"]
        }
      }
    }
  }
}
```

## Monitoring and Alerting

### Rollback Monitoring

#### Health Monitoring
```bash
# Monitor post-rollback health
./scripts/monitor:health --post-rollback

# Check performance metrics
./scripts/monitor:performance --post-rollback
```

#### Alert Configuration
```json
{
  "alerts": {
    "rollback": {
      "enabled": true,
      "triggers": {
        "rollback_initiated": "info",
        "rollback_completed": "info",
        "rollback_failed": "critical",
        "post_rollback_health_failure": "error"
      }
    }
  }
}
```

### Rollback Metrics

#### Key Metrics
- Rollback frequency
- Rollback success rate
- Time to rollback completion
- Post-rollback health status
- Rollback impact on users

#### Monitoring Dashboard
```bash
# View rollback metrics
curl https://neutralapp.com/api/admin/rollback-metrics

# Check rollback history
curl https://neutralapp.com/api/admin/rollback-history
```

## Troubleshooting

### Common Rollback Issues

#### 1. Version Not Found
**Symptoms:** Rollback fails with "version not found"
**Solutions:**
```bash
# Check available versions
./scripts/rollback.sh production --list

# Verify version exists
docker images neutral-app --format "table {{.Tag}}"

# Pull version from registry
docker pull your-registry.com/neutral-app:v1.0.1
```

#### 2. Rollback Verification Fails
**Symptoms:** Rollback completes but verification fails
**Solutions:**
```bash
# Check application logs
docker-compose -f docker-compose.prod.yml logs

# Run manual health checks
./scripts/health-check.sh production --verbose

# Check infrastructure status
./scripts/verify-deployment.sh production
```

#### 3. Database Rollback Issues
**Symptoms:** Application rolls back but database is inconsistent
**Solutions:**
```bash
# Check database connectivity
./scripts/health-check.sh production --check-database

# Verify database schema
npm run db:migrate:status

# Restore database backup if needed
./scripts/restore-database.sh production backup-2024-01-01
```

### Debugging Commands

```bash
# Check rollback configuration
cat config/deployment-verification.json | jq '.rollback'

# Test rollback procedure
./scripts/rollback.sh staging previous --dry-run

# Check rollback logs
tail -f /var/log/deployment/rollback.log

# Verify rollback artifacts
ls -la /var/backups/deployments/
```

## Best Practices

### Rollback Preparation

1. **Always test rollback procedures** in staging environment
2. **Maintain multiple rollback targets** (previous, stable, emergency)
3. **Document rollback decisions** and reasons
4. **Train team members** on rollback procedures
5. **Regular rollback drills** to ensure procedures work

### Rollback Execution

1. **Assess the situation** before rolling back
2. **Communicate rollback** to stakeholders
3. **Monitor rollback progress** closely
4. **Verify post-rollback health** thoroughly
5. **Document lessons learned** after rollback

### Post-Rollback Actions

1. **Investigate root cause** of the issue
2. **Fix the problem** before next deployment
3. **Update rollback procedures** based on lessons learned
4. **Communicate resolution** to stakeholders
5. **Plan next deployment** with additional safeguards

## Security Considerations

### Rollback Security

1. **Secure rollback procedures** with proper access controls
2. **Audit rollback activities** for compliance
3. **Protect rollback artifacts** from unauthorized access
4. **Validate rollback versions** for security vulnerabilities
5. **Monitor post-rollback security** status

### Access Controls

```bash
# Restrict rollback access
chmod 750 scripts/rollback.sh

# Require authentication for rollback
./scripts/rollback.sh production previous --require-auth

# Log rollback activities
./scripts/rollback.sh production previous --audit-log
```

## Maintenance

### Regular Tasks

1. **Test rollback procedures** monthly
2. **Clean up old versions** weekly
3. **Update rollback documentation** as procedures evolve
4. **Review rollback metrics** and trends
5. **Train new team members** on rollback procedures

### Performance Optimization

1. **Optimize rollback procedures** for faster execution
2. **Parallel rollback operations** where possible
3. **Cache rollback artifacts** for faster access
4. **Monitor rollback performance** impact
5. **Optimize rollback verification** procedures

## Support

For issues with rollback procedures:

1. **Check rollback logs** in `/var/log/deployment/`
2. **Review rollback configuration** in `config/deployment-verification.json`
3. **Contact DevOps team** for urgent rollback issues
4. **Create GitHub issues** for rollback improvements
5. **Update documentation** with lessons learned 