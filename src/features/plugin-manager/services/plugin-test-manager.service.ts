import {
  PluginTestManager as IPluginTestManager,
  PluginValidationResult,
  PluginTestResults,
  TestSuite,
  TestStatus,
  TestFailure
} from '../interfaces/testing.interface';
import * as fs from 'fs/promises';
import * as path from 'path';

export class PluginTestManager implements IPluginTestManager {
  private pluginTestSuites = new Map<string, TestSuite>();
  private pluginResults = new Map<string, PluginTestResults>();
  private blockedPlugins = new Set<string>();

  async validatePlugin(pluginId: string): Promise<PluginValidationResult> {
    try {
      const pluginPath = path.join(process.cwd(), 'plugins', pluginId);
      const manifestPath = path.join(pluginPath, 'manifest.json');
      
      // Check if plugin directory exists
      try {
        await fs.access(pluginPath);
      } catch {
        return {
          isValid: false,
          errors: [`Plugin directory not found: ${pluginPath}`],
          warnings: []
        };
      }

      // Check if manifest exists
      let manifest: any;
      try {
        const manifestContent = await fs.readFile(manifestPath, 'utf-8');
        manifest = JSON.parse(manifestContent);
      } catch {
        return {
          isValid: false,
          errors: ['Plugin manifest.json not found or invalid'],
          warnings: []
        };
      }

      const errors: string[] = [];
      const warnings: string[] = [];
      const securityIssues: string[] = [];
      const performanceIssues: string[] = [];

      // Validate manifest structure
      if (!manifest.name) {
        errors.push('Plugin name is required in manifest');
      }
      
      if (!manifest.version) {
        errors.push('Plugin version is required in manifest');
      }
      
      if (!manifest.main) {
        errors.push('Plugin main entry point is required in manifest');
      }

      // Check main file exists
      if (manifest.main) {
        const mainPath = path.join(pluginPath, manifest.main);
        try {
          await fs.access(mainPath);
        } catch {
          errors.push(`Plugin main file not found: ${manifest.main}`);
        }
      }

      // Security validation
      if (manifest.permissions) {
        const dangerousPermissions = ['file_system', 'network_admin', 'system_admin'];
        const pluginPermissions = manifest.permissions || [];
        
        for (const permission of pluginPermissions) {
          if (dangerousPermissions.includes(permission)) {
            securityIssues.push(`Dangerous permission requested: ${permission}`);
          }
        }
      }

      // Performance validation
      if (manifest.memory_limit && manifest.memory_limit > 100 * 1024 * 1024) {
        performanceIssues.push('High memory limit requested (>100MB)');
      }

      // Check for test files
      const testPath = path.join(pluginPath, 'tests');
      try {
        await fs.access(testPath);
      } catch {
        warnings.push('No tests directory found - plugin testing recommended');
      }

      return {
        isValid: errors.length === 0 && securityIssues.length === 0,
        errors,
        warnings,
        securityIssues,
        performanceIssues
      };
    } catch (error) {
      return {
        isValid: false,
        errors: [`Plugin validation failed: ${error}`],
        warnings: []
      };
    }
  }

  async runPluginTestSuite(pluginId: string): Promise<PluginTestResults> {
    const startTime = new Date();
    
    try {
      // Check if plugin is blocked
      if (this.blockedPlugins.has(pluginId)) {
        return {
          pluginId,
          testSuite: `plugin-${pluginId}`,
          status: TestStatus.FAILED,
          totalTests: 0,
          passedTests: 0,
          failedTests: 1,
          skippedTests: 0,
          executionTime: 0,
          startTime,
          endTime: new Date(),
          validationPassed: false,
          failures: [{
            testName: 'Plugin Blocked',
            error: 'Plugin is blocked due to previous failures',
            stackTrace: '',
            file: 'plugin-manager',
            line: 0
          }]
        };
      }

      const pluginPath = path.join(process.cwd(), 'plugins', pluginId);
      const testPath = path.join(pluginPath, 'tests');
      
      // Check if tests exist
      try {
        await fs.access(testPath);
      } catch {
        // No tests - create minimal passing result
        return {
          pluginId,
          testSuite: `plugin-${pluginId}`,
          status: TestStatus.PASSED,
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          skippedTests: 0,
          executionTime: Date.now() - startTime.getTime(),
          startTime,
          endTime: new Date(),
          validationPassed: true
        };
      }

      // Run Jest for plugin tests
      const { spawn } = require('child_process');
      const result = await this.executePluginTests(pluginPath);
      
      const endTime = new Date();
      const executionTime = endTime.getTime() - startTime.getTime();
      
      const testResults = this.parsePluginTestResults(result, pluginId, startTime, endTime);
      
      // Store results
      this.pluginResults.set(pluginId, testResults);
      
      return testResults;
    } catch (error) {
      const endTime = new Date();
      const failedResult: PluginTestResults = {
        pluginId,
        testSuite: `plugin-${pluginId}`,
        status: TestStatus.ERROR,
        totalTests: 0,
        passedTests: 0,
        failedTests: 1,
        skippedTests: 0,
        executionTime: endTime.getTime() - startTime.getTime(),
        startTime,
        endTime,
        validationPassed: false,
        error: error instanceof Error ? error.message : String(error)
      };
      
      this.pluginResults.set(pluginId, failedResult);
      return failedResult;
    }
  }

  preventActivationOnFailure(pluginId: string, results: PluginTestResults): void {
    if (results.status === TestStatus.FAILED || !results.validationPassed) {
      this.blockedPlugins.add(pluginId);
      console.warn(`Plugin ${pluginId} blocked due to test failures:`, results.failures);
    }
  }

  registerPluginTests(pluginId: string, testSuite: TestSuite): void {
    this.pluginTestSuites.set(pluginId, testSuite);
  }

  async getPluginTestResults(pluginId: string): Promise<PluginTestResults | null> {
    return this.pluginResults.get(pluginId) || null;
  }

  private async executePluginTests(pluginPath: string): Promise<any> {
    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process');
      
      const jestProcess = spawn('npx', ['jest', '--testPathPattern', pluginPath], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      jestProcess.stdout.on('data', (data: Buffer) => {
        stdout += data.toString();
      });
      
      jestProcess.stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });
      
      jestProcess.on('close', (code: number) => {
        resolve({ code, stdout, stderr });
      });
      
      jestProcess.on('error', (error: Error) => {
        reject(error);
      });
      
      // 30 second timeout for plugin tests
      setTimeout(() => {
        jestProcess.kill('SIGTERM');
        reject(new Error('Plugin test timeout'));
      }, 30000);
    });
  }

  private parsePluginTestResults(result: any, pluginId: string, startTime: Date, endTime: Date): PluginTestResults {
    const output = result.stdout + result.stderr;
    
    // Parse Jest output for plugin-specific metrics
    const passPattern = /(\d+) passed/;
    const failPattern = /(\d+) failed/;
    const totalPattern = /(\d+) total/;
    
    const passMatch = output.match(passPattern);
    const failMatch = output.match(failPattern);
    const totalMatch = output.match(totalPattern);
    
    const passedTests = passMatch ? parseInt(passMatch[1]) : 0;
    const failedTests = failMatch ? parseInt(failMatch[1]) : 0;
    const totalTests = totalMatch ? parseInt(totalMatch[1]) : passedTests + failedTests;
    
    const status = result.code === 0 ? TestStatus.PASSED : TestStatus.FAILED;
    const validationPassed = result.code === 0 && failedTests === 0;
    
    // Extract failures if any
    const failures: TestFailure[] = [];
    if (failedTests > 0) {
      const failureMatches = output.match(/● (.+?)\n\s+(.+?)(?=\n\s+at|$)/gs);
      if (failureMatches) {
        for (const match of failureMatches) {
          const lines = match.split('\n');
          failures.push({
            testName: lines[0].replace('● ', '').trim(),
            error: lines[1]?.trim() || 'Test failed',
            stackTrace: match,
            file: `${pluginId}/tests`,
            line: 0
          });
        }
      }
    }
    
    return {
      pluginId,
      testSuite: `plugin-${pluginId}`,
      status,
      totalTests,
      passedTests,
      failedTests,
      skippedTests: 0,
      executionTime: endTime.getTime() - startTime.getTime(),
      startTime,
      endTime,
      validationPassed,
      failures: failures.length > 0 ? failures : undefined,
      securityTestsPassed: validationPassed,
      performanceMetrics: {
        memoryUsage: this.estimateMemoryUsage(output),
        executionTime: endTime.getTime() - startTime.getTime()
      },
      coverage: this.extractPluginCoverage(output)
    };
  }

  private estimateMemoryUsage(output: string): number {
    // Simple memory usage estimation based on output size and complexity
    const baseMemory = 10 * 1024 * 1024; // 10MB base
    const outputSizeMemory = output.length * 100; // Rough estimate
    return baseMemory + outputSizeMemory;
  }

  private extractPluginCoverage(output: string): any {
    // Look for coverage information in output
    const coveragePattern = /All files\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)\s+\|\s+([\d.]+)/;
    const match = output.match(coveragePattern);
    
    if (match) {
      return {
        statements: parseFloat(match[1] || '0'),
        branches: parseFloat(match[2] || '0'),
        functions: parseFloat(match[3] || '0'),
        lines: parseFloat(match[4] || '0')
      };
    }
    
    return undefined;
  }
} 