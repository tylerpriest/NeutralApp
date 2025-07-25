import {
  ContinuousTestingService as IContinuousTestingService,
  FileChangeEvent,
  TestResults,
  TestStatus
} from '../interfaces/testing.interface';
import * as chokidar from 'chokidar';
import * as path from 'path';

export class ContinuousTestingService implements IContinuousTestingService {
  private isWatching: boolean = false;
  private watcher?: chokidar.FSWatcher;
  private changeCallbacks: Array<(event: FileChangeEvent) => void> = [];
  private testExecutor?: any; // Reference to TestRunner to avoid circular dependency

  constructor(testExecutor?: any) {
    this.testExecutor = testExecutor;
  }

  async startContinuousTesting(): Promise<void> {
    if (this.isWatching) {
      return;
    }

    console.log('Starting continuous testing...');
    
    this.watcher = chokidar.watch([
      'src/**/*.ts',
      'tests/**/*.ts',
      'plugins/**/*.ts'
    ], {
      ignored: [
        '**/node_modules/**',
        '**/dist/**',
        '**/*.d.ts'
      ],
      persistent: true,
      ignoreInitial: true
    });

    this.watcher.on('change', (filePath) => {
      this.handleFileChange(filePath, 'modified');
    });

    this.watcher.on('add', (filePath) => {
      this.handleFileChange(filePath, 'created');
    });

    this.watcher.on('unlink', (filePath) => {
      this.handleFileChange(filePath, 'deleted');
    });

    this.watcher.on('error', (error) => {
      console.error('File watcher error:', error);
    });

    this.isWatching = true;
    console.log('Continuous testing started');
  }

  async stopContinuousTesting(): Promise<void> {
    if (!this.isWatching || !this.watcher) {
      return;
    }

    console.log('Stopping continuous testing...');
    
    await this.watcher.close();
    this.watcher = undefined;
    this.isWatching = false;
    
    console.log('Continuous testing stopped');
  }

  onFileChange(callback: (event: FileChangeEvent) => void): () => void {
    this.changeCallbacks.push(callback);
    
    return () => {
      const index = this.changeCallbacks.indexOf(callback);
      if (index > -1) {
        this.changeCallbacks.splice(index, 1);
      }
    };
  }

  async runAffectedTests(changedFiles: string[]): Promise<TestResults> {
    const startTime = new Date();
    
    try {
      const affectedTestFiles = this.findAffectedTests(changedFiles);
      
      if (affectedTestFiles.length === 0) {
        return {
          testSuite: 'affected-tests',
          status: TestStatus.PASSED,
          totalTests: 0,
          passedTests: 0,
          failedTests: 0,
          skippedTests: 0,
          executionTime: 0,
          startTime,
          endTime: new Date()
        };
      }

      // Run the affected tests
      const testResults = await this.executeAffectedTests(affectedTestFiles);
      
      return {
        testSuite: 'affected-tests',
        status: testResults.success ? TestStatus.PASSED : TestStatus.FAILED,
        totalTests: testResults.totalTests,
        passedTests: testResults.passedTests,
        failedTests: testResults.failedTests,
        skippedTests: 0,
        executionTime: Date.now() - startTime.getTime(),
        startTime,
        endTime: new Date(),
        failures: testResults.failures
      };
    } catch (error) {
      return {
        testSuite: 'affected-tests',
        status: TestStatus.ERROR,
        totalTests: 0,
        passedTests: 0,
        failedTests: 1,
        skippedTests: 0,
        executionTime: Date.now() - startTime.getTime(),
        startTime,
        endTime: new Date(),
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  isRunning(): boolean {
    return this.isWatching;
  }

  private handleFileChange(filePath: string, changeType: 'created' | 'modified' | 'deleted'): void {
    const event: FileChangeEvent = {
      filePath,
      changeType,
      timestamp: new Date()
    };

    console.log(`File ${changeType}: ${filePath}`);
    
    // Notify all listeners
    this.changeCallbacks.forEach(callback => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in file change callback:', error);
      }
    });

    // Auto-run affected tests with debouncing
    this.debounceTestExecution([filePath]);
  }

  private debounceTimer?: NodeJS.Timeout;
  private pendingFiles: string[] = [];

  private debounceTestExecution(filePaths: string[]): void {
    // Add files to pending list
    this.pendingFiles.push(...filePaths);

    // Clear existing timer
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    // Set new timer (500ms debounce)
    this.debounceTimer = setTimeout(() => {
      const filesToTest = [...this.pendingFiles];
      this.pendingFiles = [];
      
      this.runAffectedTests(filesToTest).then(results => {
        if (results.status === TestStatus.FAILED) {
          console.warn(`Affected tests failed for files: ${filesToTest.join(', ')}`);
        } else {
          console.log(`Affected tests passed for files: ${filesToTest.join(', ')}`);
        }
      }).catch(error => {
        console.error('Error running affected tests:', error);
      });
    }, 500);
  }

  private findAffectedTests(changedFiles: string[]): string[] {
    const affectedTests: string[] = [];
    
    for (const filePath of changedFiles) {
      // If the file is already a test file, include it
      if (filePath.includes('.test.') || filePath.includes('.spec.')) {
        affectedTests.push(filePath);
        continue;
      }

      // Find corresponding test files
      const testFiles = this.findTestFilesForSource(filePath);
      affectedTests.push(...testFiles);
      
      // For interface files, find tests that import them
      if (filePath.includes('interface')) {
        const dependentTests = this.findTestsImportingInterface(filePath);
        affectedTests.push(...dependentTests);
      }
      
      // For service files, find tests that import them
      if (filePath.includes('service')) {
        const dependentTests = this.findTestsImportingService(filePath);
        affectedTests.push(...dependentTests);
      }
    }
    
    // Remove duplicates
    return [...new Set(affectedTests)];
  }

  private findTestFilesForSource(sourcePath: string): string[] {
    const testFiles: string[] = [];
    
    // Standard test file patterns
    const baseName = path.basename(sourcePath, path.extname(sourcePath));
    const dir = path.dirname(sourcePath);
    
    // Look for corresponding test files
    const possibleTestPaths = [
      sourcePath.replace('.ts', '.test.ts'),
      sourcePath.replace('.ts', '.spec.ts'),
      sourcePath.replace('/src/', '/tests/').replace('.ts', '.test.ts'),
      path.join('tests', path.relative('src', sourcePath)).replace('.ts', '.test.ts')
    ];
    
    for (const testPath of possibleTestPaths) {
      try {
        // In a real implementation, you'd check if the file exists
        testFiles.push(testPath);
      } catch {
        // File doesn't exist, continue
      }
    }
    
    return testFiles;
  }

  private findTestsImportingInterface(interfacePath: string): string[] {
    // In a real implementation, this would parse TypeScript files to find imports
    // For now, return common test patterns
    const tests: string[] = [];
    
    if (interfacePath.includes('auth.interface')) {
      tests.push('tests/services/auth.service.test.ts');
    }
    
    if (interfacePath.includes('logging.interface')) {
      tests.push('tests/services/logging.service.test.ts');
    }
    
    if (interfacePath.includes('testing.interface')) {
      tests.push('tests/services/test-runner.test.ts');
    }
    
    return tests;
  }

  private findTestsImportingService(servicePath: string): string[] {
    // Simple mapping - in reality would analyze dependencies
    const baseName = path.basename(servicePath, '.ts');
    return [`tests/services/${baseName}.test.ts`];
  }

  private async executeAffectedTests(testFiles: string[]): Promise<any> {
    return new Promise((resolve, reject) => {
      const { spawn } = require('child_process');
      
      const jestProcess = spawn('npx', ['jest', ...testFiles], {
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
        const output = stdout + stderr;
        
        // Parse results
        const passPattern = /(\d+) passed/;
        const failPattern = /(\d+) failed/;
        const totalPattern = /(\d+) total/;
        
        const passMatch = output.match(passPattern);
        const failMatch = output.match(failPattern);
        const totalMatch = output.match(totalPattern);
        
        const passedTests = passMatch ? parseInt(passMatch[1] || '0') : 0;
        const failedTests = failMatch ? parseInt(failMatch[1] || '0') : 0;
        const totalTests = totalMatch ? parseInt(totalMatch[1] || '0') : passedTests + failedTests;
        
        resolve({
          success: code === 0,
          totalTests,
          passedTests,
          failedTests,
          failures: failedTests > 0 ? [{ testName: 'Affected test failure', error: 'See output for details', stackTrace: output, file: 'affected-tests', line: 0 }] : undefined
        });
      });
      
      jestProcess.on('error', (error: Error) => {
        reject(error);
      });
    });
  }
} 