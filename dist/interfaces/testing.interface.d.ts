import { TestResults, PluginTestResults, ValidationResult, TestStatus } from '../types';
export interface ITestRunner {
    runTests(testSuite: string): Promise<TestResults>;
    runPluginTests(pluginId: string): Promise<PluginTestResults>;
    getTestStatus(): TestStatus;
    subscribeToTestResults(callback: (results: TestResults) => void): () => void;
}
export interface IPluginTestManager {
    validatePlugin(pluginId: string): Promise<ValidationResult>;
    runPluginTestSuite(pluginId: string): Promise<TestResults>;
    preventActivationOnFailure(pluginId: string, results: TestResults): void;
}
//# sourceMappingURL=testing.interface.d.ts.map