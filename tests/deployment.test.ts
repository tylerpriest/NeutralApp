import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

describe('Deployment Infrastructure', () => {
  const projectRoot = process.cwd();

  describe('Docker Configuration', () => {
    test('should have Dockerfile for production', () => {
      const dockerfilePath = join(projectRoot, 'Dockerfile');
      expect(existsSync(dockerfilePath)).toBe(true);
      
      const dockerfileContent = readFileSync(dockerfilePath, 'utf-8');
      expect(dockerfileContent).toContain('FROM node:18-alpine');
      expect(dockerfileContent).toContain('WORKDIR /app');
      expect(dockerfileContent).toContain('COPY package*.json ./');
      expect(dockerfileContent).toContain('RUN npm ci --only=production');
      expect(dockerfileContent).toContain('COPY dist ./dist');
      expect(dockerfileContent).toContain('EXPOSE 3000');
      expect(dockerfileContent).toContain('CMD ["node", "dist/web/server/index.js"]');
    });

    test('should have .dockerignore file', () => {
      const dockerignorePath = join(projectRoot, '.dockerignore');
      expect(existsSync(dockerignorePath)).toBe(true);
      
      const dockerignoreContent = readFileSync(dockerignorePath, 'utf-8');
      expect(dockerignoreContent).toContain('node_modules');
      expect(dockerignoreContent).toContain('.git');
      expect(dockerignoreContent).toContain('coverage');
      expect(dockerignoreContent).toContain('test-results');
      expect(dockerignoreContent).toContain('playwright-report');
    });

    test('should have docker-compose.yml for local development', () => {
      const dockerComposePath = join(projectRoot, 'docker-compose.yml');
      expect(existsSync(dockerComposePath)).toBe(true);
      
      const dockerComposeContent = readFileSync(dockerComposePath, 'utf-8');
      expect(dockerComposeContent).toContain('version:');
      expect(dockerComposeContent).toContain('services:');
      expect(dockerComposeContent).toContain('neutral-app:');
      expect(dockerComposeContent).toContain('build:');
      expect(dockerComposeContent).toContain('ports:');
      expect(dockerComposeContent).toContain('environment:');
    });

    test('should have docker-compose.prod.yml for production', () => {
      const dockerComposeProdPath = join(projectRoot, 'docker-compose.prod.yml');
      expect(existsSync(dockerComposeProdPath)).toBe(true);
      
      const dockerComposeProdContent = readFileSync(dockerComposeProdPath, 'utf-8');
      expect(dockerComposeProdContent).toContain('version:');
      expect(dockerComposeProdContent).toContain('services:');
      expect(dockerComposeProdContent).toContain('neutral-app:');
      expect(dockerComposeProdContent).toContain('restart: unless-stopped');
      expect(dockerComposeProdContent).toContain('environment:');
    });
  });

  describe('Deployment Scripts', () => {
    test('should have deploy.sh script', () => {
      const deployScriptPath = join(projectRoot, 'scripts', 'deploy.sh');
      expect(existsSync(deployScriptPath)).toBe(true);
      
      const deployScriptContent = readFileSync(deployScriptPath, 'utf-8');
      expect(deployScriptContent).toContain('#!/bin/bash');
      expect(deployScriptContent).toContain('set -e');
      expect(deployScriptContent).toContain('deploy_environment');
      expect(deployScriptContent).toContain('build_docker_image');
      expect(deployScriptContent).toContain('deploy_to_environment');
      expect(deployScriptContent).toContain('run_health_checks');
    });

    test('should have rollback.sh script', () => {
      const rollbackScriptPath = join(projectRoot, 'scripts', 'rollback.sh');
      expect(existsSync(rollbackScriptPath)).toBe(true);
      
      const rollbackScriptContent = readFileSync(rollbackScriptPath, 'utf-8');
      expect(rollbackScriptContent).toContain('#!/bin/bash');
      expect(rollbackScriptContent).toContain('set -e');
      expect(rollbackScriptContent).toContain('rollback_deployment');
      expect(rollbackScriptContent).toContain('restore_previous_version');
    });

    test('should have health-check.sh script', () => {
      const healthCheckScriptPath = join(projectRoot, 'scripts', 'health-check.sh');
      expect(existsSync(healthCheckScriptPath)).toBe(true);
      
      const healthCheckScriptContent = readFileSync(healthCheckScriptPath, 'utf-8');
      expect(healthCheckScriptContent).toContain('#!/bin/bash');
      expect(healthCheckScriptContent).toContain('check_application_health');
      expect(healthCheckScriptContent).toContain('check_database_connection');
      expect(healthCheckScriptContent).toContain('check_api_endpoints');
    });
  });

  describe('CI/CD Pipeline Configuration', () => {
    test('should have enhanced deploy.yml workflow', () => {
      const deployWorkflowPath = join(projectRoot, '.github', 'workflows', 'deploy.yml');
      expect(existsSync(deployWorkflowPath)).toBe(true);
      
      const deployWorkflowContent = readFileSync(deployWorkflowPath, 'utf-8');
      expect(deployWorkflowContent).toContain('name: Continuous Deployment');
      expect(deployWorkflowContent).toContain('deploy-staging:');
      expect(deployWorkflowContent).toContain('deploy-production:');
      expect(deployWorkflowContent).toContain('Build Docker image');
      expect(deployWorkflowContent).toContain('Deploy to staging');
      expect(deployWorkflowContent).toContain('health-check.sh');
    });

    test('should have docker-build.yml workflow', () => {
      const dockerBuildWorkflowPath = join(projectRoot, '.github', 'workflows', 'docker-build.yml');
      expect(existsSync(dockerBuildWorkflowPath)).toBe(true);
      
      const dockerBuildWorkflowContent = readFileSync(dockerBuildWorkflowPath, 'utf-8');
      expect(dockerBuildWorkflowContent).toContain('name: Docker Build and Push');
      expect(dockerBuildWorkflowContent).toContain('build_and_push');
      expect(dockerBuildWorkflowContent).toContain('Build and push Docker image');
      expect(dockerBuildWorkflowContent).toContain('docker/build-push-action');
    });
  });

  describe('Environment Configuration', () => {
    test('should have production environment configuration', () => {
      const prodEnvPath = join(projectRoot, 'config', 'environments', 'production.env');
      expect(existsSync(prodEnvPath)).toBe(true);
      
      const prodEnvContent = readFileSync(prodEnvPath, 'utf-8');
      expect(prodEnvContent).toContain('NODE_ENV=production');
      expect(prodEnvContent).toContain('PORT=3000');
    });

    test('should have staging environment configuration', () => {
      const stagingEnvPath = join(projectRoot, 'config', 'environments', 'staging.env');
      expect(existsSync(stagingEnvPath)).toBe(true);
      
      const stagingEnvContent = readFileSync(stagingEnvPath, 'utf-8');
      expect(stagingEnvContent).toContain('NODE_ENV=staging');
      expect(stagingEnvContent).toContain('PORT=3000');
    });
  });

  describe('Package.json Scripts', () => {
    test('should have deployment-related npm scripts', () => {
      const packageJsonPath = join(projectRoot, 'package.json');
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
      
      expect(packageJson.scripts).toHaveProperty('docker:build');
      expect(packageJson.scripts).toHaveProperty('docker:run');
      expect(packageJson.scripts).toHaveProperty('docker:stop');
      expect(packageJson.scripts).toHaveProperty('deploy:staging');
      expect(packageJson.scripts).toHaveProperty('deploy:production');
      expect(packageJson.scripts).toHaveProperty('health-check');
    });
  });

  describe('Docker Image Build', () => {
    test('should build Docker image successfully', () => {
      // This test would run in CI environment
      if (process.env.CI) {
        expect(() => {
          execSync('docker build -t neutral-app:test .', { 
            cwd: projectRoot,
            stdio: 'pipe'
          });
        }).not.toThrow();
      } else {
        // Skip in local environment unless explicitly requested
        console.log('Skipping Docker build test in local environment');
      }
    });
  });

  describe('Deployment Scripts Execution', () => {
    test('should have executable deployment scripts', () => {
      const scripts = [
        'scripts/deploy.sh',
        'scripts/rollback.sh',
        'scripts/health-check.sh'
      ];
      
      scripts.forEach(scriptPath => {
        const fullPath = join(projectRoot, scriptPath);
        expect(existsSync(fullPath)).toBe(true);
        
        // Check if script is executable (Unix-like systems)
        if (process.platform !== 'win32') {
          const stats = require('fs').statSync(fullPath);
          expect(stats.mode & 0o111).toBeTruthy(); // Check executable bit
        }
      });
    });
  });
}); 