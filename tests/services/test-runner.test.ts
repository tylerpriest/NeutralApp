import { TestRunner } from '../../src/services/test-runner.service';
import { PluginTestManager } from '../../src/services/plugin-test-manager.service';
import { ContinuousTestingService } from '../../src/services/continuous-testing.service';
import { TestStatus, TestResults, PluginTestResults, TestSuite, TestCase } from '../../src/interfaces/testing.interface';

describe('TestRunner', () => {
  let testRunner: TestRunner;
  let mockPluginTestManager: jest.Mocked<PluginTestManager>;
  let mockContinuousTestingService: jest.Mocked<ContinuousTestingService>;

  beforeEach(() => {
    mockPluginTestManager = {
      validatePlugin: jest.fn(),
      runPluginTestSuite: jest.fn(),
      preventActivationOnFailure: jest.fn(),
      registerPluginTests: jest.fn(),
      getPluginTestResults: jest.fn()
    } as any;

    mockContinuousTestingService = {
      startContinuousTesting: jest.fn(),
      stopContinuousTesting: jest.fn(),
      onFileChange: jest.fn(),
      runAffectedTests: jest.fn(),
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

      const results = await testRunner.runTests(testSuite.name);

      expect(results.status).toBe(TestStatus.PASSED);
      expect(results.testSuite).toBe('core-services');
      expect(results.totalTests).toBeGreaterThan(0);
      expect(results.passedTests).toBe(results.totalTests);
      expect(results.failedTests).toBe(0);
      expect(results.executionTime).toBeGreaterThan(0);
      expect(results.startTime).toBeInstanceOf(Date);
      expect(results.endTime).toBeInstanceOf(Date);
    });

    it('should handle test failures with detailed reporting', async () => {
      const failingTestSuite = 'failing-test-suite';
      
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

      const results = await testRunner.runTests(testSuite);
      const executionTime = Date.now() - startTime;

      expect(results.status).toBe(TestStatus.PASSED);
      expect(executionTime).toBeLessThan(10000); // Should be faster than serial execution
      expect(results.parallelExecution).toBe(true);
    });

    it('should timeout long-running tests', async () => {
      const testRunner = new TestRunner({
        pluginTestManager: mockPluginTestManager,
        continuousTestingService: mockContinuousTestingService,
        maxConcurrentTests: 4,
        testTimeout: 1000 // 1 second timeout
      });

      const results = await testRunner.runTests('long-running-test-suite');

      expect(results.status).toBe(TestStatus.TIMEOUT);
      expect(results.failures?.some(f => f.error.includes('timeout'))).toBe(true);
    });
  });

  describe('Plugin Testing Integration', () => {
    it('should run plugin tests through PluginTestManager', async () => {
      const pluginId = 'test-plugin';
      const mockPluginResults: PluginTestResults = {
        pluginId,
        status: TestStatus.PASSED,
        totalTests: 15,
        passedTests: 15,
        failedTests: 0,
        executionTime: 2500,
        validationPassed: true,
        coverage: {
          statements: 95.5,
          branches: 88.2,
          functions: 100,
          lines: 94.7
        }
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
        totalTests: 10,
        passedTests: 7,
        failedTests: 3,
        executionTime: 1800,
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

      await testRunner.runPluginTests(pluginId);

      expect(mockPluginTestManager.validatePlugin).toHaveBeenCalledWith(pluginId);
    });
  });

  describe('Test Status and Monitoring', () => {
    it('should provide current test status', () => {
      const status = testRunner.getTestStatus();

      expect(status).toHaveProperty('isRunning');
      expect(status).toHaveProperty('currentTest');
      expect(status).toHaveProperty('completedTests');
      expect(status).toHaveProperty('totalTests');
      expect(status).toHaveProperty('progress');
      expect(status).toHaveProperty('startTime');
    });

    it('should notify subscribers of test results', async () => {
      const mockCallback = jest.fn();
      const unsubscribe = testRunner.subscribeToTestResults(mockCallback);

      await testRunner.runTests('notification-test-suite');

      expect(mockCallback).toHaveBeenCalled();
      expect(mockCallback.mock.calls[0][0]).toHaveProperty('status');
      expect(mockCallback.mock.calls[0][0]).toHaveProperty('testSuite');

      unsubscribe();
    });

    it('should track test execution history', async () => {
      await testRunner.runTests('history-test-suite-1');
      await testRunner.runTests('history-test-suite-2');

      const history = testRunner.getTestHistory();

      expect(history).toHaveLength(2);
      expect(history[0].testSuite).toBe('history-test-suite-1');
      expect(history[1].testSuite).toBe('history-test-suite-2');
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

      const results = await testRunner.runTestsWithConfig('custom-config-suite', customConfig);

      expect(results.configuration).toEqual(customConfig);
      expect(results.parallelExecution).toBe(true);
      expect(results.coverage).toBeDefined();
    });

    it('should generate code coverage reports', async () => {
      const results = await testRunner.runTestsWithCoverage('coverage-test-suite');

      expect(results.coverage).toBeDefined();
      expect(results.coverage?.statements).toBeGreaterThanOrEqual(0);
      expect(results.coverage?.branches).toBeGreaterThanOrEqual(0);
      expect(results.coverage?.functions).toBeGreaterThanOrEqual(0);
      expect(results.coverage?.lines).toBeGreaterThanOrEqual(0);
    });

    it('should support different test reporters', async () => {
      const results = await testRunner.runTestsWithReporter('reporter-test-suite', 'json');

      expect(results.reportFormat).toBe('json');
      expect(results.reportData).toBeDefined();
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle test framework failures gracefully', async () => {
      // Simulate test framework crash
      const mockError = new Error('Jest process crashed');
      jest.spyOn(testRunner as any, 'executeTestCommand').mockRejectedValue(mockError);

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

      const results = await testRunner.runTestsWithConfig('flaky-test-suite', flakyTestConfig);

      expect(results.retries).toBeGreaterThanOrEqual(0);
      if (results.retries && results.retries > 0) {
        expect(results.retries).toBeLessThanOrEqual(3);
      }
    });

    it('should isolate test failures to prevent cascade', async () => {
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

      const results = await testRunner.runTestsWithConfig('optimization-test-suite', optimizationConfig);

      expect(results.executionTime).toBeLessThan(30000); // Should complete reasonably fast
      expect(results.optimized).toBe(true);
    });

    it('should cache test results for unchanged files', async () => {
      const results1 = await testRunner.runTests('cache-test-suite');
      const results2 = await testRunner.runTests('cache-test-suite');

      expect(results2.cacheHit).toBe(true);
      expect(results2.executionTime).toBeLessThan(results1.executionTime);
    });

    it('should handle large test suites efficiently', async () => {
      const startTime = Date.now();
      const results = await testRunner.runTests('large-test-suite');
      const executionTime = Date.now() - startTime;

      expect(results.totalTests).toBeGreaterThan(100);
      expect(executionTime).toBeLessThan(60000); // Should complete within 1 minute
      expect(results.parallelExecution).toBe(true);
    });
  });
}); 