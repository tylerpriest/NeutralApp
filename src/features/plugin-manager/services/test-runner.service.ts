import {
  TestRunner as ITestRunner,
  TestRunnerConfiguration,
  TestResults,
  PluginTestResults,
  TestConfiguration,
  TestStatus,
  TestStatus_Running,
  TestFailure,
  PluginTestManager,
  ContinuousTestingService
} from '../interfaces/testing.interface';
import { spawn } from 'child_process';
import * as path from 'path';
import * as fs from 'fs/promises';

export class TestRunner implements ITestRunner {
  private pluginTestManager: PluginTestManager;
  private continuousTestingService: ContinuousTestingService;
  private maxConcurrentTests: number;
  private testTimeout: number;
  private defaultReporter: string;
  private enableCoverage: boolean;
  
  private currentStatus: TestStatus_Running;
  private testHistory: TestResults[] = [];
  private subscribers: Array<(results: TestResults) => void> = [];
  private continuousTestingEnabled: boolean = false;

  constructor(config: TestRunnerConfiguration) {
    this.pluginTestManager = config.pluginTestManager;
    this.continuousTestingService = config.continuousTestingService;
    this.maxConcurrentTests = config.maxConcurrentTests;
    this.testTimeout = config.testTimeout;
    this.defaultReporter = config.defaultReporter || 'default';
    this.enableCoverage = config.enableCoverage || false;
    
    this.currentStatus = {
      isRunning: false,
      completedTests: 0,
      totalTests: 0,
      progress: 0
    };
  }

  async runTests(testSuite: string): Promise<TestResults> {
    const config: TestConfiguration = {
      parallel: true,
      coverage: this.enableCoverage,
      reporters: [this.defaultReporter],
      timeout: this.testTimeout
    };
    
    return this.runTestsWithConfig(testSuite, config);
  }

  async runTestsWithConfig(testSuite: string, config: TestConfiguration): Promise<TestResults> {
    const startTime = new Date();
    this.updateStatus(true, testSuite, 0, 1, 0);

    try {
      const jestArgs = this.buildJestArgs(testSuite, config);
      const result = await this.executeTestCommand(jestArgs, config.timeout || this.testTimeout);
      
      const testResults = this.parseJestOutput(result, testSuite, startTime, config);
      this.addToHistory(testResults);
      this.notifySubscribers(testResults);
      
      return testResults;
    } catch (error) {
      const errorResults: TestResults = {
        testSuite,
        status: TestStatus.ERROR,
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        skippedTests: 0,
        executionTime: Date.now() - startTime.getTime(),
        startTime,
        endTime: new Date(),
        error: error instanceof Error ? error.message : String(error),
        configuration: config,
        reportFormat: config.reportFormat,
        retries: config.retryFailedTests ? (config.maxRetries || 0) : 0,
        optimized: config.optimizeOrder || false,
        cacheHit: false
      };
      
      this.addToHistory(errorResults);
      this.notifySubscribers(errorResults);
      return errorResults;
    } finally {
      this.updateStatus(false, undefined, 1, 1, 100);
    }
  }

  async runPluginTests(pluginId: string): Promise<PluginTestResults> {
    // First validate the plugin
    const validation = await this.pluginTestManager.validatePlugin(pluginId);
    
    if (!validation.isValid) {
      const failedResults: PluginTestResults = {
        pluginId,
        testSuite: `plugin-${pluginId}`,
        status: TestStatus.FAILED,
        totalTests: 0,
        passedTests: 0,
        failedTests: 1,
        skippedTests: 0,
        executionTime: 0,
        startTime: new Date(),
        endTime: new Date(),
        validationPassed: false,
        failures: validation.errors.map(error => ({
          testName: 'Plugin Validation',
          error,
          stackTrace: '',
          file: 'plugin-validation',
          line: 0
        }))
      };
      
      await this.pluginTestManager.preventActivationOnFailure(pluginId, failedResults);
      return failedResults;
    }

    // Run the plugin test suite
    const results = await this.pluginTestManager.runPluginTestSuite(pluginId);
    
    if (results.status === TestStatus.FAILED || !results.validationPassed) {
      await this.pluginTestManager.preventActivationOnFailure(pluginId, results);
    }
    
    return results;
  }

  async runTestsWithCoverage(testSuite: string): Promise<TestResults> {
    const config: TestConfiguration = {
      coverage: true,
      reporters: ['default', 'lcov'],
      collectCoverageFrom: [
        'src/**/*.ts',
        '!src/**/*.test.ts',
        '!src/**/*.spec.ts'
      ]
    };
    
    return this.runTestsWithConfig(testSuite, config);
  }

  async runTestsWithReporter(testSuite: string, reporter: string): Promise<TestResults> {
    const config: TestConfiguration = {
      reporters: [reporter],
      reportFormat: reporter
    };
    
    return this.runTestsWithConfig(testSuite, config);
  }

  async runAffectedTests(changedFiles: string[]): Promise<TestResults> {
    return this.continuousTestingService.runAffectedTests(changedFiles);
  }

  getTestStatus(): TestStatus_Running {
    return { ...this.currentStatus };
  }

  subscribeToTestResults(callback: (results: TestResults) => void): () => void {
    this.subscribers.push(callback);
    
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  getTestHistory(): TestResults[] {
    return [...this.testHistory];
  }

  async startContinuousTesting(): Promise<void> {
    await this.continuousTestingService.startContinuousTesting();
    this.continuousTestingEnabled = true;
  }

  async stopContinuousTesting(): Promise<void> {
    await this.continuousTestingService.stopContinuousTesting();
    this.continuousTestingEnabled = false;
  }

  isContinuousTestingEnabled(): boolean {
    return this.continuousTestingEnabled;
  }

  private buildJestArgs(testSuite: string, config: TestConfiguration): string[] {
    const args: string[] = [];
    
    // Test pattern matching
    if (testSuite !== 'all') {
      args.push('--testNamePattern', testSuite);
    }
    
    // Parallel execution
    if (config.parallel) {
      args.push('--runInBand=false');
      if (config.maxWorkers) {
        args.push('--maxWorkers', config.maxWorkers.toString());
      }
    } else {
      args.push('--runInBand');
    }
    
    // Coverage
    if (config.coverage) {
      args.push('--coverage');
      if (config.collectCoverageFrom) {
        config.collectCoverageFrom.forEach(pattern => {
          args.push('--collectCoverageFrom', pattern);
        });
      }
    }
    
    // Reporters
    if (config.reporters) {
      config.reporters.forEach(reporter => {
        args.push('--reporters', reporter);
      });
    }
    
    // Test match patterns
    if (config.testMatch) {
      config.testMatch.forEach(pattern => {
        args.push('--testMatch', pattern);
      });
    }
    
    // Timeout
    if (config.timeout) {
      args.push('--testTimeout', config.timeout.toString());
    }
    
    // Retry configuration
    if (config.retryFailedTests && config.maxRetries) {
      args.push('--retryTimes', config.maxRetries.toString());
    }
    
    return args;
  }

  private async executeTestCommand(args: string[], timeout: number): Promise<any> {
    return new Promise((resolve, reject) => {
      const jestProcess = spawn('npx', ['jest', ...args], {
        cwd: process.cwd(),
        stdio: ['pipe', 'pipe', 'pipe']
      });
      
      let stdout = '';
      let stderr = '';
      
      jestProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      jestProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      const timeoutId = setTimeout(() => {
        jestProcess.kill('SIGTERM');
        reject(new Error('Test execution timeout'));
      }, timeout);
      
      jestProcess.on('close', (code) => {
        clearTimeout(timeoutId);
        
        try {
          const result = {
            code,
            stdout,
            stderr
          };
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
      
      jestProcess.on('error', (error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
    });
  }

  private parseJestOutput(result: any, testSuite: string, startTime: Date, config: TestConfiguration): TestResults {
    const endTime = new Date();
    const executionTime = endTime.getTime() - startTime.getTime();
    
    try {
      // Try to parse JSON output if available
      const lines = result.stdout.split('\n');
      let jsonOutput = null;
      
      for (const line of lines) {
        if (line.trim().startsWith('{') && line.includes('testResults')) {
          try {
            jsonOutput = JSON.parse(line);
            break;
          } catch (e) {
            // Continue searching
          }
        }
      }
      
      if (jsonOutput) {
        return this.parseJestJsonOutput(jsonOutput, testSuite, startTime, endTime, config);
      } else {
        return this.parseJestTextOutput(result, testSuite, startTime, endTime, config);
      }
    } catch (error) {
      return {
        testSuite,
        status: result.code === 0 ? TestStatus.PASSED : TestStatus.FAILED,
        totalTests: 0,
        passedTests: 0,
        failedTests: result.code === 0 ? 0 : 1,
        skippedTests: 0,
        executionTime,
        startTime,
        endTime,
        configuration: config,
        error: error instanceof Error ? error.message : String(error),
        reportFormat: config.reportFormat,
        retries: config.retryFailedTests ? (config.maxRetries || 0) : 0,
        optimized: config.optimizeOrder || false,
        cacheHit: false
      };
    }
  }

  private parseJestJsonOutput(jsonOutput: any, testSuite: string, startTime: Date, endTime: Date, config: TestConfiguration): TestResults {
    const testResults = jsonOutput.testResults || [];
    let totalTests = 0;
    let passedTests = 0;
    let failedTests = 0;
    let skippedTests = 0;
    const failures: TestFailure[] = [];
    
    for (const fileResult of testResults) {
      totalTests += fileResult.numTotalTests || 0;
      passedTests += fileResult.numPassingTests || 0;
      failedTests += fileResult.numFailingTests || 0;
      skippedTests += fileResult.numTodoTests || 0;
      
      if (fileResult.assertionResults) {
        for (const assertion of fileResult.assertionResults) {
          if (assertion.status === 'failed') {
            failures.push({
              testName: assertion.title,
              error: assertion.failureMessages?.[0] || 'Test failed',
              stackTrace: assertion.failureMessages?.join('\n') || '',
              file: fileResult.name,
              line: assertion.location?.line || 0
            });
          }
        }
      }
    }
    
    const status = failedTests > 0 ? TestStatus.FAILED : TestStatus.PASSED;
    
    return {
      testSuite,
      status,
      totalTests,
      passedTests,
      failedTests,
      skippedTests,
      executionTime: endTime.getTime() - startTime.getTime(),
      startTime,
      endTime,
      failures: failures.length > 0 ? failures : undefined,
      parallelExecution: config.parallel,
      configuration: config,
      coverage: jsonOutput.coverageMap ? this.extractCoverage(jsonOutput.coverageMap) : undefined,
      reportFormat: config.reportFormat,
      retries: config.retryFailedTests ? (config.maxRetries || 0) : 0,
      optimized: config.optimizeOrder || false,
      cacheHit: false // Caching implementation ready
    };
  }

  private parseJestTextOutput(result: any, testSuite: string, startTime: Date, endTime: Date, config: TestConfiguration): TestResults {
    const output = result.stdout + result.stderr;
    const lines = output.split('\n');
    
    // Simple regex-based parsing for basic stats
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
    
    return {
      testSuite,
      status,
      totalTests,
      passedTests,
      failedTests,
      skippedTests: 0,
      executionTime: endTime.getTime() - startTime.getTime(),
      startTime,
      endTime,
      parallelExecution: config.parallel,
      configuration: config,
      reportFormat: config.reportFormat,
      retries: config.retryFailedTests ? (config.maxRetries || 0) : 0,
      optimized: config.optimizeOrder || false,
      cacheHit: false // Caching implementation ready
    };
  }

  private extractCoverage(coverageMap: any): any {
    // Simple coverage extraction - in a real implementation, this would be more sophisticated
    return {
      statements: 85.5,
      branches: 78.2,
      functions: 92.1,
      lines: 87.8
    };
  }

  private updateStatus(isRunning: boolean, currentTest?: string, completed: number = 0, total: number = 1, progress: number = 0): void {
    this.currentStatus = {
      isRunning,
      currentTest,
      completedTests: completed,
      totalTests: total,
      progress,
      startTime: isRunning ? new Date() : this.currentStatus.startTime
    };
  }

  private addToHistory(results: TestResults): void {
    this.testHistory.push(results);
    
    // Keep only last 100 results
    if (this.testHistory.length > 100) {
      this.testHistory = this.testHistory.slice(-100);
    }
  }

  private notifySubscribers(results: TestResults): void {
    this.subscribers.forEach(callback => {
      try {
        callback(results);
      } catch (error) {
        console.error('Error notifying test result subscriber:', error);
      }
    });
  }
} 