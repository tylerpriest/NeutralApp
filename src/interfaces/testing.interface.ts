export enum TestStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  PASSED = 'passed',
  FAILED = 'failed',
  TIMEOUT = 'timeout',
  ERROR = 'error',
  SKIPPED = 'skipped'
}

export interface TestCase {
  name: string;
  path: string;
  timeout?: number;
  skip?: boolean;
  only?: boolean;
}

export interface TestSuite {
  name: string;
  tests: TestCase[];
  setup?: string;
  teardown?: string;
  timeout?: number;
  parallel?: boolean;
}

export interface TestFailure {
  testName: string;
  error: string;
  stackTrace: string;
  file: string;
  line: number;
  column?: number;
  expected?: any;
  actual?: any;
}

export interface TestCoverage {
  statements: number;
  branches: number;
  functions: number;
  lines: number;
  uncoveredLines?: number[];
}

export interface TestResults {
  testSuite: string;
  status: TestStatus;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  executionTime: number;
  startTime: Date;
  endTime: Date;
  failures?: TestFailure[];
  coverage?: TestCoverage;
  parallelExecution?: boolean;
  configuration?: TestConfiguration;
  reportFormat?: string;
  reportData?: any;
  retries?: number;
  optimized?: boolean;
  cacheHit?: boolean;
  error?: string;
}

export interface PluginTestResults extends TestResults {
  pluginId: string;
  validationPassed: boolean;
  securityTestsPassed?: boolean;
  performanceMetrics?: {
    memoryUsage: number;
    executionTime: number;
    apiResponseTime?: number;
  };
}

export interface TestConfiguration {
  parallel?: boolean;
  coverage?: boolean;
  reporters?: string[];
  testMatch?: string[];
  maxWorkers?: number;
  retryFailedTests?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  optimizeOrder?: boolean;
  prioritizeFast?: boolean;
  cacheResults?: boolean;
  timeout?: number;
  collectCoverageFrom?: string[];
  reportFormat?: string;
}

export interface TestStatus_Running {
  isRunning: boolean;
  currentTest?: string;
  completedTests: number;
  totalTests: number;
  progress: number;
  startTime?: Date;
  estimatedTimeRemaining?: number;
}

export interface TestRunnerConfiguration {
  pluginTestManager: PluginTestManager;
  continuousTestingService: ContinuousTestingService;
  maxConcurrentTests: number;
  testTimeout: number;
  defaultReporter?: string;
  enableCoverage?: boolean;
}

export interface PluginValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  securityIssues?: string[];
  performanceIssues?: string[];
}

export interface FileChangeEvent {
  filePath: string;
  changeType: 'created' | 'modified' | 'deleted';
  timestamp: Date;
}

export interface TestRunner {
  runTests(testSuite: string): Promise<TestResults>;
  runPluginTests(pluginId: string): Promise<PluginTestResults>;
  runTestsWithConfig(testSuite: string, config: TestConfiguration): Promise<TestResults>;
  runTestsWithCoverage(testSuite: string): Promise<TestResults>;
  runTestsWithReporter(testSuite: string, reporter: string): Promise<TestResults>;
  runAffectedTests(changedFiles: string[]): Promise<TestResults>;
  getTestStatus(): TestStatus_Running;
  subscribeToTestResults(callback: (results: TestResults) => void): () => void;
  getTestHistory(): TestResults[];
  startContinuousTesting(): Promise<void>;
  stopContinuousTesting(): Promise<void>;
  isContinuousTestingEnabled(): boolean;
}

export interface PluginTestManager {
  validatePlugin(pluginId: string): Promise<PluginValidationResult>;
  runPluginTestSuite(pluginId: string): Promise<PluginTestResults>;
  preventActivationOnFailure(pluginId: string, results: PluginTestResults): void;
  registerPluginTests(pluginId: string, testSuite: TestSuite): void;
  getPluginTestResults(pluginId: string): Promise<PluginTestResults | null>;
}

export interface ContinuousTestingService {
  startContinuousTesting(): Promise<void>;
  stopContinuousTesting(): Promise<void>;
  onFileChange(callback: (event: FileChangeEvent) => void): () => void;
  runAffectedTests(changedFiles: string[]): Promise<TestResults>;
  isRunning(): boolean;
}

export interface TestReporter {
  name: string;
  generateReport(results: TestResults): string | object;
  saveReport(report: string | object, filePath: string): Promise<void>;
}

export interface TestCache {
  getCachedResults(testSuite: string, fileHashes: string[]): TestResults | null;
  setCachedResults(testSuite: string, fileHashes: string[], results: TestResults): void;
  invalidateCache(filePaths: string[]): void;
  clear(): void;
}

export interface TestMetrics {
  totalTestsRun: number;
  averageExecutionTime: number;
  successRate: number;
  mostFailingTests: string[];
  slowestTests: string[];
  coverageTrend: number[];
  lastRunTime: Date;
}

export interface TestScheduler {
  scheduleTests(testSuites: string[], schedule: string): void;
  cancelScheduledTests(testSuites: string[]): void;
  getScheduledTests(): Array<{
    testSuite: string;
    schedule: string;
    nextRun: Date;
  }>;
} 