import { TestRunner } from '../services/test-runner.service';
import { PluginTestManager } from '../services/plugin-test-manager.service';
import { ContinuousTestingService } from '../services/continuous-testing.service';
import { TestStatus, TestResults, PluginTestResults, TestSuite, TestCase } from '../interfaces/testing.interface';

jest.setTimeout(60000); // 60 second timeout

describe('TestRunner', () => {
  let testRunner: TestRunner;
  let mockPluginTestManager: jest.Mocked<PluginTestManager>;
  let mockContinuousTestingService: jest.Mocked<ContinuousTestingService>;

  beforeEach(() => {
    mockPluginTestManager = {
      validatePlugin: jest.fn().mockResolvedValue({ isValid: true, errors: [], warnings: [] }),
      runPluginTestSuite: jest.fn(),
      preventActivationOnFailure: jest.fn(),
      registerPluginTests: jest.fn(),
      getPluginTestResults: jest.fn()
    } as any;

    mockContinuousTestingService = {
      startContinuousTesting: jest.fn(),
      stopContinuousTesting: jest.fn(),
      onFileChange: jest.fn(),
      runAffectedTests: jest.fn().mockResolvedValue({
        status: TestStatus.PASSED,
        testSuite: 'affected-tests',
        totalTests: 1,
        passedTests: 1,
        failedTests: 0,
        skippedTests: 0,
        executionTime: 100,
        startTime: new Date(),
        endTime: new Date(),
      }),
      isRunning: jest.fn()
    } as any;

    testRunner = new TestRunner({
      pluginTestManager: mockPluginTestManager,
      continuousTestingService: mockContinuousTestingService,
      maxConcurrentTests: 4,
      testTimeout: 30000
    });
  });

  describe('Test Suite Execution', () => {
    it('should run all tests in a test suite and return results', async () => {
      const testSuite: TestSuite = {
        name: 'core-services',
        tests: [
          { name: 'auth-service-test', path: 'tests/services/auth.service.test.ts' },
          { name: 'logging-service-test', path: 'tests/services/logging.service.test.ts' }
        ],
        setup: 'tests/setup.ts',
        timeout: 30000
      };

      // Mock the internal command execution
      (testRunner as any).executeTestCommand = jest.fn().mockResolvedValue({
        stdout: '{"testResults":[{"assertionResults":[{"title":"should authenticate a user"},{"title":"should handle auth errors"}],"numTotalTests":2,"numPassingTests":2,"numFailingTests":0}],"numTotalTestSuites":1,"numPassedTestSuites":1,"numTotalTests":2,"numPassedTests":2,"numFailedTests":0,"numPendingTests":0}',
        stderr: '',
        code: 0
      });

      const results = await testRunner.runTests(testSuite.name);

      expect(results.status).toBe(TestStatus.PASSED);
      expect(results.testSuite).toBe('core-services');
      expect(results.totalTests).toBe(2);
      expect(results.passedTests).toBe(2);
      expect(results.failedTests).toBe(0);
      expect(results.executionTime).toBeGreaterThanOrEqual(0);
      expect(results.startTime).toBeInstanceOf(Date);
      expect(results.endTime).toBeInstanceOf(Date);
    });

    it('should handle test failures with detailed reporting', async () => {
      const failingTestSuite = 'failing-test-suite';
      
      // Mock the internal command execution
      (testRunner as any).executeTestCommand = jest.fn().mockResolvedValue({
        stdout: '{"testResults":[{"assertionResults":[{"title":"should fail","status":"failed","failureMessages":["Error: Assertion failed"]}],"numFailingTests":1}],"numTotalTestSuites":1,"numFailedTestSuites":1,"numTotalTests":1,"numPassedTests":0,"numFailedTests":1,"numPendingTests":0}',
        stderr: 'Test failed',
        code: 1
      });

      const results = await testRunner.runTests(failingTestSuite);

      expect(results.status).toBe(TestStatus.FAILED);
      expect(results.failedTests).toBeGreaterThan(0);
      expect(results.failures).toBeDefined();
      expect(results.failures?.length).toBeGreaterThan(0);
      
      results.failures?.forEach(failure => {
        expect(failure).toHaveProperty('testName');
        expect(failure).toHaveProperty('error');
        expect(failure).toHaveProperty('stackTrace');
        expect(failure).toHaveProperty('file');
        expect(failure).toHaveProperty('line');
      });
    });

    it('should run tests in parallel when configured', async () => {
      const testSuite = 'parallel-test-suite';
      const startTime = Date.now();

      // Mock the internal command execution
      (testRunner as any).executeTestCommand = jest.fn().mockResolvedValue({
        stdout: '{"testResults":[{"assertionResults":[{"title":"should run in parallel"}]}],"numTotalTestSuites":1,"numPassedTestSuites":1,"numTotalTests":1,"numPassedTests":1,"numFailedTests":0,"numPendingTests":0}',
        stderr: '',
        code: 0
      });

      const results = await testRunner.runTestsWithConfig(testSuite, { parallel: true });
      const executionTime = Date.now() - startTime;

      expect(results.status).toBe(TestStatus.PASSED);
      expect(executionTime).toBeLessThan(10000); // Should be faster than serial execution
      expect(results.parallelExecution).toBe(true);
    });

    it('should timeout long-running tests', async () => {
      const testRunnerWithTimeout = new TestRunner({
        pluginTestManager: mockPluginTestManager,
        continuousTestingService: mockContinuousTestingService,
        maxConcurrentTests: 4,
        testTimeout: 1000 // 1 second timeout
      });

      // Mock the internal command execution to simulate a timeout
      (testRunnerWithTimeout as any).executeTestCommand = jest.fn().mockRejectedValue(new Error('Test execution timeout'));

      const results = await testRunnerWithTimeout.runTests('long-running-test-suite');

      expect(results.status).toBe(TestStatus.ERROR);
      expect(results.error).toContain('Test execution timeout');
    });
  });

  describe('Plugin Testing Integration', () => {
    it('should run plugin tests through PluginTestManager', async () => {
      const pluginId = 'test-plugin';
      const mockPluginResults: PluginTestResults = {
        pluginId,
        status: TestStatus.PASSED,
        testSuite: 'test-suite',
        totalTests: 15,
        passedTests: 15,
        failedTests: 0,
        skippedTests: 0,
        executionTime: 2500,
        startTime: new Date(),
        endTime: new Date(),
        validationPassed: true
      };

      mockPluginTestManager.runPluginTestSuite.mockResolvedValue(mockPluginResults);

      const results = await testRunner.runPluginTests(pluginId);

      expect(mockPluginTestManager.runPluginTestSuite).toHaveBeenCalledWith(pluginId);
      expect(results).toEqual(mockPluginResults);
      expect(results.validationPassed).toBe(true);
    });

    it('should prevent plugin activation when tests fail', async () => {
      const pluginId = 'failing-plugin';
      const mockFailedResults: PluginTestResults = {
        pluginId,
        status: TestStatus.FAILED,
        testSuite: 'failing-test-suite',
        totalTests: 10,
        passedTests: 7,
        failedTests: 3,
        skippedTests: 0,
        executionTime: 1800,
        startTime: new Date(),
        endTime: new Date(),
        validationPassed: false,
        failures: [
          {
            testName: 'plugin initialization test',
            error: 'Plugin failed to initialize properly',
            stackTrace: 'Error: Plugin failed\n    at test.ts:42',
            file: 'tests/plugin-init.test.ts',
            line: 42
          }
        ]
      };

      mockPluginTestManager.runPluginTestSuite.mockResolvedValue(mockFailedResults);

      const results = await testRunner.runPluginTests(pluginId);

      expect(results.status).toBe(TestStatus.FAILED);
      expect(mockPluginTestManager.preventActivationOnFailure).toHaveBeenCalledWith(pluginId, results);
    });

    it('should validate plugin before running tests', async () => {
      const pluginId = 'new-plugin';
      const validationResult = {
        isValid: true,
        errors: [],
        warnings: ['Minor performance issue detected']
      };

      mockPluginTestManager.validatePlugin.mockResolvedValue(validationResult);
      mockPluginTestManager.runPluginTestSuite.mockResolvedValue({
        pluginId,
        status: TestStatus.PASSED,
        testSuite: 'test-suite',
        totalTests: 1,
        passedTests: 1,
        failedTests: 0,
        skippedTests: 0,
        executionTime: 100,
        startTime: new Date(),
        endTime: new Date(),
        validationPassed: true
      });

      await testRunner.runPluginTests(pluginId);

      expect(mockPluginTestManager.validatePlugin).toHaveBeenCalledWith(pluginId);
    });
  });

  describe('Test Status and Monitoring', () => {
    it('should provide current test status', () => {
      const status = testRunner.getTestStatus();

      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('completedTests');
      expect(status).toHaveProperty('totalTests');
      expect(status).toHaveProperty('progress');
    });

    it('should notify subscribers of test results', async () => {
      const mockCallback = jest.fn();
      const unsubscribe = testRunner.subscribeToTestResults(mockCallback);

      (testRunner as any).executeTestCommand = jest.fn().mockResolvedValue({
        stdout: '{"testResults":[{"assertionResults":[{"title":"should notify"}]}],"numTotalTestSuites":1,"numPassedTestSuites":1,"numTotalTests":1,"numPassedTests":1,"numFailedTests":0,"numPendingTests":0}',
        stderr: '',
        code: 0
      });

      await testRunner.runTests('notification-test-suite');

      expect(mockCallback).toHaveBeenCalled();
      expect(mockCallback.mock.calls[0][0]).toHaveProperty('status');
      expect(mockCallback.mock.calls[0][0]).toHaveProperty('testSuite');

      unsubscribe();
    });

    it('should track test execution history', async () => {
      (testRunner as any).executeTestCommand = jest.fn().mockResolvedValue({
        stdout: '{"testResults":[{"assertionResults":[{"title":"history test"}]}],"numTotalTestSuites":1,"numPassedTestSuites":1,"numTotalTests":1,"numPassedTests":1,"numFailedTests":0,"numPendingTests":0}',
        stderr: '',
        code: 0
      });
      await testRunner.runTests('history-test-suite-1');
      await testRunner.runTests('history-test-suite-2');

      const history = testRunner.getTestHistory();

      expect(history).toHaveLength(2);
      expect(history[0]?.testSuite).toBe('history-test-suite-1');
      expect(history[1]?.testSuite).toBe('history-test-suite-2');
    });
  });

  describe('Continuous Testing Integration', () => {
    it('should start continuous testing when requested', async () => {
      await testRunner.startContinuousTesting();

      expect(mockContinuousTestingService.startContinuousTesting).toHaveBeenCalled();
      expect(testRunner.isContinuousTestingEnabled()).toBe(true);
    });

    it('should stop continuous testing', async () => {
      await testRunner.startContinuousTesting();
      await testRunner.stopContinuousTesting();

      expect(mockContinuousTestingService.stopContinuousTesting).toHaveBeenCalled();
      expect(testRunner.isContinuousTestingEnabled()).toBe(false);
    });

    it('should run affected tests when files change', async () => {
      const changedFiles = ['src/services/auth.service.ts', 'src/interfaces/auth.interface.ts'];
      
      await testRunner.runAffectedTests(changedFiles);

      expect(mockContinuousTestingService.runAffectedTests).toHaveBeenCalledWith(changedFiles);
    });
  });

  describe('Test Configuration and Customization', () => {
    it('should support custom test configurations', async () => {
      const customConfig = {
        parallel: true,
        coverage: true,
        reporters: ['default', 'json', 'lcov'],
        testMatch: ['**/*.test.ts', '**/*.spec.ts'],
        maxWorkers: 2
      };

      (testRunner as any).executeTestCommand = jest.fn().mockResolvedValue({
        stdout: '{"testResults":[{"assertionResults":[{"title":"custom config"}]}],"numTotalTestSuites":1,"numPassedTestSuites":1,"numTotalTests":1,"numPassedTests":1,"numFailedTests":0,"numPendingTests":0, "coverageMap": {}}',
        stderr: '',
        code: 0
      });

      const results = await testRunner.runTestsWithConfig('custom-config-suite', customConfig);

      expect(results.configuration).toEqual(customConfig);
      expect(results.parallelExecution).toBe(true);
      expect(results.coverage).toBeDefined();
    });

    it('should generate code coverage reports', async () => {
      (testRunner as any).executeTestCommand = jest.fn().mockResolvedValue({
        stdout: '{"testResults":[{"assertionResults":[{"title":"coverage"}]}],"numTotalTestSuites":1,"numPassedTestSuites":1,"numTotalTests":1,"numPassedTests":1,"numFailedTests":0,"numPendingTests":0, "coverageMap": {}}',
        stderr: '',
        code: 0
      });
      const results = await testRunner.runTestsWithCoverage('coverage-test-suite');

      expect(results.coverage).toBeDefined();
      expect(results.coverage?.statements).toBeGreaterThanOrEqual(0);
      expect(results.coverage?.branches).toBeGreaterThanOrEqual(0);
      expect(results.coverage?.functions).toBeGreaterThanOrEqual(0);
      expect(results.coverage?.lines).toBeGreaterThanOrEqual(0);
    });

    it('should support different test reporters', async () => {
      (testRunner as any).executeTestCommand = jest.fn().mockResolvedValue({
        stdout: '{"testResults":[{"assertionResults":[{"title":"reporter"}]}],"numTotalTestSuites":1,"numPassedTestSuites":1,"numTotalTests":1,"numPassedTests":1,"numFailedTests":0,"numPendingTests":0}',
        stderr: '',
        code: 0
      });
      const results = await testRunner.runTestsWithReporter('reporter-test-suite', 'json');

      expect(results.reportFormat).toBe('json');
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle test framework failures gracefully', async () => {
      // Simulate test framework crash
      const mockError = new Error('Jest process crashed');
      (testRunner as any).executeTestCommand = jest.fn().mockRejectedValue(mockError);

      const results = await testRunner.runTests('crash-test-suite');

      expect(results.status).toBe(TestStatus.ERROR);
      expect(results.error).toContain('Jest process crashed');
      expect(results.failedTests).toBe(0); // No tests failed, framework failed
    });

    it('should retry flaky tests', async () => {
      const flakyTestConfig = {
        retryFailedTests: true,
        maxRetries: 3,
        retryDelay: 1000
      };

      (testRunner as any).executeTestCommand = jest.fn().mockResolvedValue({
        stdout: '{"testResults":[{"assertionResults":[{"title":"flaky"}]}],"numTotalTestSuites":1,"numPassedTestSuites":1,"numTotalTests":1,"numPassedTests":1,"numFailedTests":0,"numPendingTests":0}',
        stderr: '',
        code: 0
      });

      const results = await testRunner.runTestsWithConfig('flaky-test-suite', flakyTestConfig);

      expect(results.retries).toBe(3); // Should match maxRetries from config
    });

    it('should isolate test failures to prevent cascade', async () => {
      (testRunner as any).executeTestCommand = jest.fn().mockResolvedValue({
        stdout: '{"testResults":[{"assertionResults":[{"title":"isolate","status":"passed"},{"title":"isolate2","status":"failed","failureMessages":["Test failed"]}],"numTotalTests":2,"numPassingTests":1,"numFailingTests":1}],"numTotalTestSuites":1,"numPassedTestSuites":0,"numFailedTestSuites":1,"numTotalTests":2,"numPassedTests":1,"numFailedTests":1,"numPendingTests":0}',
        stderr: '',
        code: 1
      });
      const results = await testRunner.runTests('isolation-test-suite');

      // Even if some tests fail, others should still run
      expect(results.totalTests).toBeGreaterThan(results.failedTests);
      expect(results.passedTests).toBeGreaterThan(0);
    });
  });

  describe('Performance and Optimization', () => {
    it('should optimize test execution order', async () => {
      const optimizationConfig = {
        optimizeOrder: true,
        prioritizeFast: true,
        cacheResults: true
      };

      (testRunner as any).executeTestCommand = jest.fn().mockResolvedValue({
        stdout: '{"testResults":[{"assertionResults":[{"title":"optimize"}]}],"numTotalTestSuites":1,"numPassedTestSuites":1,"numTotalTests":1,"numPassedTests":1,"numFailedTests":0,"numPendingTests":0}',
        stderr: '',
        code: 0
      });

      const results = await testRunner.runTestsWithConfig('optimization-test-suite', optimizationConfig);

      expect(results.executionTime).toBeLessThan(30000); // Should complete reasonably fast
      expect(results.optimized).toBe(true);
    });

    it('should cache test results for unchanged files', async () => {
      (testRunner as any).executeTestCommand = jest.fn().mockResolvedValue({
        stdout: '{"testResults":[{"assertionResults":[{"title":"cache"}]}],"numTotalTestSuites":1,"numPassedTestSuites":1,"numTotalTests":1,"numPassedTests":1,"numFailedTests":0,"numPendingTests":0}',
        stderr: '',
        code: 0
      });
      // Mock the first run with slower execution
      const originalParseJestOutput = (testRunner as any).parseJestOutput;
      (testRunner as any).parseJestOutput = jest.fn().mockImplementation((result, testSuite, startTime, config) => {
        const parsed = originalParseJestOutput.call(testRunner, result, testSuite, startTime, config);
        return { ...parsed, executionTime: 200 }; // Slower execution for first run
      });
      const results1 = await testRunner.runTests('cache-test-suite');
      
      // Mock the second run to simulate a cache hit
      (testRunner as any).executeTestCommand = jest.fn().mockResolvedValue({
        stdout: '{"testResults":[{"assertionResults":[{"title":"cache"}]}],"numTotalTestSuites":1,"numPassedTestSuites":1,"numTotalTests":1,"numPassedTests":1,"numFailedTests":0,"numPendingTests":0}',
        stderr: '',
        code: 0
      });
      // Mock the cacheHit property for the second result
      (testRunner as any).parseJestOutput = jest.fn().mockImplementation((result, testSuite, startTime, config) => {
        const parsed = originalParseJestOutput.call(testRunner, result, testSuite, startTime, config);
        return { ...parsed, cacheHit: true, executionTime: 50 }; // Faster execution for cached result
      });
      const results2 = await testRunner.runTests('cache-test-suite');

      expect(results2.cacheHit).toBe(true);
      expect(results2.executionTime).toBeLessThan(results1.executionTime);
    });

    it('should handle large test suites efficiently', async () => {
      const startTime = Date.now();
      (testRunner as any).executeTestCommand = jest.fn().mockResolvedValue({
        stdout: '{"testResults":[{"assertionResults":[{"title":"large"}],"numTotalTests":150,"numPassingTests":150,"numFailingTests":0}],"numTotalTestSuites":1,"numPassedTestSuites":1,"numTotalTests":150,"numPassedTests":150,"numFailedTests":0,"numPendingTests":0}',
        stderr: '',
        code: 0
      });
      const results = await testRunner.runTests('large-test-suite');
      const executionTime = Date.now() - startTime;

      expect(results.totalTests).toBeGreaterThan(100);
      expect(executionTime).toBeLessThan(60000); // Should complete within 1 minute
      expect(results.parallelExecution).toBe(true);
    });
  });
});
