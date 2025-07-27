# NeutralApp Deployment Guide

## Overview

This guide covers the deployment infrastructure for NeutralApp, including Docker containerization, deployment scripts, CI/CD pipelines, and health monitoring.

## Architecture

The deployment infrastructure consists of:

- **Docker Containerization**: Production-ready Docker images with multi-stage builds
- **Deployment Scripts**: Automated deployment and rollback scripts for staging and production
- **CI/CD Pipelines**: GitHub Actions workflows for continuous integration and deployment
- **Health Monitoring**: Comprehensive health checks and monitoring systems
- **Environment Management**: Separate configurations for development, staging, and production

## Docker Configuration

### Production Dockerfile

The `Dockerfile` creates a production-ready image with:

- Node.js 18 Alpine base image for security and size optimization
- Non-root user for security
- Health checks for container monitoring
- Optimized layer caching
- Production-only dependencies

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
RUN addgroup -g 1001 -S nodejs
RUN adduser -S neutralapp -u 1001
RUN chown -R neutralapp:nodejs /app
USER neutralapp
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })" || exit 1
CMD ["node", "dist/web/server/index.js"]
```

### Docker Compose Configurations

#### Development (`docker-compose.yml`)
- Single service setup for local development
- Volume mounts for hot reloading
- Development environment variables
- Health checks and restart policies

#### Production (`docker-compose.prod.yml`)
- Multi-service setup with database and Redis
- Load balancing with multiple replicas
- Production environment configuration
- Nginx reverse proxy for SSL termination
- Rolling update strategy

## Deployment Scripts

### Main Deployment Script (`scripts/deploy.sh`)

The deployment script handles:

- Environment validation (staging/production)
- Docker image building and pushing
- Container deployment using docker-compose
- Health checks and smoke tests
- Notification systems

**Usage:**
```bash
# Deploy to staging
./scripts/deploy.sh staging

# Deploy to production
./scripts/deploy.sh production
```

### Rollback Script (`scripts/rollback.sh`)

The rollback script provides:

- Version-specific rollbacks
- Previous version restoration
- Health verification after rollback
- Notification systems

**Usage:**
```bash
# Rollback to specific version
./scripts/rollback.sh production v1.0.1

# Rollback to previous version
./scripts/rollback.sh staging previous
```

### Health Check Script (`scripts/health-check.sh`)

Comprehensive health monitoring including:

- Application health endpoint checks
- Database connectivity verification
- API endpoint validation
- System resource monitoring
- Docker container status

**Usage:**
```bash
# Check staging health
./scripts/health-check.sh staging

# Check production health
./scripts/health-check.sh production
```

## CI/CD Pipeline

### Continuous Integration (`ci.yml`)

Runs on every push and pull request:

- TypeScript compilation
- Unit and integration tests
- Code quality checks
- Security scanning
- Test coverage reporting

### Docker Build Pipeline (`docker-build.yml`)

Handles Docker image building and pushing:

- Multi-platform builds (amd64, arm64)
- Security scanning with Trivy
- Automated tagging and versioning
- Registry integration
- Release management

### Deployment Pipeline (`deploy.yml`)

Automated deployment workflows:

- Staging deployment on develop branch
- Production deployment on main branch
- Health checks and smoke tests
- Rollback capabilities
- Post-deployment monitoring

## Environment Configuration

### Environment Files

Located in `config/environments/`:

- `development.env`: Local development settings
- `staging.env`: Staging environment configuration
- `production.env`: Production environment settings

### Key Configuration Areas

- **Database**: Connection strings and credentials
- **Authentication**: NextAuth.js configuration
- **API**: Base URLs and CORS settings
- **Security**: HTTPS, cookies, and session management
- **Monitoring**: Metrics, health checks, and logging
- **Features**: Debug modes and feature flags

## NPM Scripts

The following deployment-related scripts are available:

```bash
# Docker operations
npm run docker:build    # Build Docker image
npm run docker:run      # Start containers
npm run docker:stop     # Stop containers

# Deployment
npm run deploy:staging    # Deploy to staging
npm run deploy:production # Deploy to production

# Health monitoring
npm run health-check      # Run health checks
```

## Security Considerations

### Container Security

- Non-root user execution
- Minimal base image (Alpine Linux)
- Security scanning with Trivy
- Regular base image updates
- Health checks for monitoring

### Environment Security

- Environment-specific secrets
- Secure cookie configuration
- HTTPS enforcement in production
- Database connection encryption
- API authentication and authorization

### Network Security

- Internal service communication
- Reverse proxy for external access
- CORS configuration
- Rate limiting and DDoS protection

## Monitoring and Observability

### Health Checks

- Application health endpoint (`/health`)
- Database connectivity checks
- API endpoint validation
- System resource monitoring
- Container health status

### Logging

- Structured JSON logging
- Environment-specific log levels
- Error tracking and reporting
- Performance monitoring
- Audit trail maintenance

### Metrics

- Application performance metrics
- System resource utilization
- Database query performance
- API response times
- Error rates and availability

## Troubleshooting

### Common Issues

1. **Container won't start**
   - Check Docker logs: `docker logs <container-name>`
   - Verify environment variables
   - Check port conflicts

2. **Health checks failing**
   - Verify application is running
   - Check database connectivity
   - Review API endpoint responses

3. **Deployment failures**
   - Check Docker registry access
   - Verify environment configuration
   - Review deployment logs

### Debug Commands

```bash
# Check container status
docker ps -a

# View container logs
docker logs <container-name>

# Execute commands in container
docker exec -it <container-name> sh

# Check health status
docker inspect <container-name> --format='{{.State.Health.Status}}'

# Monitor resource usage
docker stats
```

## Best Practices

### Deployment

- Always test in staging first
- Use blue-green deployments for zero downtime
- Implement proper rollback procedures
- Monitor deployments closely
- Document deployment procedures

### Security

- Regularly update base images
- Scan for vulnerabilities
- Use secrets management
- Implement least privilege access
- Monitor for security events

### Monitoring

- Set up comprehensive alerting
- Monitor application performance
- Track error rates and availability
- Maintain audit logs
- Regular health check reviews

## Next Steps

1. **Configure Docker Registry**: Update registry URLs in scripts and workflows
2. **Set up Secrets**: Configure GitHub secrets for registry access
3. **Deploy to Staging**: Test the complete deployment pipeline
4. **Monitor Production**: Set up monitoring and alerting
5. **Document Procedures**: Create runbooks for common operations

## Vercel Deployment

NeutralApp is also deployed to Vercel for serverless hosting:

- **Production URL**: https://neutral-r0f9n892x-tyler-priests-projects.vercel.app
- **Status**: ✅ Successfully deployed and responding
- **Documentation**: See [Vercel Deployment Guide](vercel-deployment.md)

### Quick Vercel Commands

```bash
# Deploy to Vercel
npm run vercel:deploy

# Local development with Vercel
npm run vercel:dev

# Build for Vercel
npm run vercel:build
```

## Support

For deployment issues or questions:

1. Check the troubleshooting section
2. Review deployment logs
3. Consult the health check reports
4. Contact the development team
5. Review the CI/CD pipeline status 