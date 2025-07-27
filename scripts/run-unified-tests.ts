#!/usr/bin/env ts-node

import { spawn } from 'child_process';
import { UnifiedTestReporter } from '../src/shared/utils/test-reporter';
import * as fs from 'fs';
import * as path from 'path';

interface TestRunResult {
  success: boolean;
  output: string;
  error?: string;
}

class UnifiedTestRunner {
  private reporter: UnifiedTestReporter;
  private resultsDir: string;

  constructor() {
    this.reporter = new UnifiedTestReporter();
    this.resultsDir = 'test-results';
    
    // Ensure results directory exists
    if (!fs.existsSync(this.resultsDir)) {
      fs.mkdirSync(this.resultsDir, { recursive: true });
    }
  }

  /**
   * Run a command and return the result
   */
  private async runCommand(command: string, args: string[]): Promise<TestRunResult> {
    return new Promise((resolve) => {
      const child = spawn(command, args, {
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      let output = '';
      let error = '';

      child.stdout?.on('data', (data) => {
        output += data.toString();
      });

      child.stderr?.on('data', (data) => {
        error += data.toString();
      });

      child.on('close', (code) => {
        resolve({
          success: code === 0,
          output,
          error: error || undefined
        });
      });
    });
  }

  /**
   * Run Jest tests
   */
  async runJestTests(): Promise<void> {
    console.log('🧪 Running Jest tests...');
    
    const result = await this.runCommand('npm', ['test', '--', '--json', '--outputFile=test-results/jest-results.json']);
    
    if (result.success) {
      console.log('✅ Jest tests completed successfully');
      
      // Try to read Jest results
      try {
        const jestResultsPath = 'test-results/jest-results.json';
        if (fs.existsSync(jestResultsPath)) {
          const jestResults = JSON.parse(fs.readFileSync(jestResultsPath, 'utf8'));
          this.reporter.addJestResults(jestResults);
        }
      } catch (error) {
        console.warn('⚠️  Could not parse Jest results:', error);
      }
    } else {
      console.log('❌ Jest tests failed');
      console.log('Error:', result.error);
      
      // Still try to read results even if some tests failed
      try {
        const jestResultsPath = 'test-results/jest-results.json';
        if (fs.existsSync(jestResultsPath)) {
          const jestResults = JSON.parse(fs.readFileSync(jestResultsPath, 'utf8'));
          this.reporter.addJestResults(jestResults);
        }
      } catch (error) {
        console.warn('⚠️  Could not parse Jest results:', error);
      }
    }
  }

  /**
   * Run Playwright tests
   */
  async runPlaywrightTests(): Promise<void> {
    console.log('🎭 Running Playwright tests...');
    
    const result = await this.runCommand('npx', ['playwright', 'test', '--reporter=json', '--output=test-results/playwright-results.json']);
    
    if (result.success) {
      console.log('✅ Playwright tests completed successfully');
      
      // Try to read Playwright results
      try {
        const playwrightResultsPath = 'test-results/playwright-results.json';
        if (fs.existsSync(playwrightResultsPath)) {
          const playwrightResults = JSON.parse(fs.readFileSync(playwrightResultsPath, 'utf8'));
          this.reporter.addPlaywrightResults(playwrightResults);
        }
      } catch (error) {
        console.warn('⚠️  Could not parse Playwright results:', error);
      }
    } else {
      console.log('❌ Playwright tests failed');
      console.log('Error:', result.error);
      
      // Still try to read results even if some tests failed
      try {
        const playwrightResultsPath = 'test-results/playwright-results.json';
        if (fs.existsSync(playwrightResultsPath)) {
          const playwrightResults = JSON.parse(fs.readFileSync(playwrightResultsPath, 'utf8'));
          this.reporter.addPlaywrightResults(playwrightResults);
        }
      } catch (error) {
        console.warn('⚠️  Could not parse Playwright results:', error);
      }
    }
  }

  /**
   * Generate and save unified reports
   */
  generateReports(): void {
    console.log('📊 Generating unified test reports...');
    
    const reportPath = path.join(this.resultsDir, 'unified-report.json');
    const htmlReportPath = path.join(this.resultsDir, 'unified-report.html');
    
    this.reporter.saveReport(reportPath);
    this.reporter.saveHtmlReport(htmlReportPath);
    
    const report = this.reporter.generateReport();
    
    console.log('\n📈 Unified Test Report Summary:');
    console.log('================================');
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed} (${report.summary.passRate}%)`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Skipped: ${report.summary.skipped}`);
    console.log(`Duration: ${Math.round(report.summary.duration / 1000)}s`);
    console.log(`Environment: ${report.environment}`);
    console.log(`Generated: ${new Date(report.timestamp).toLocaleString()}`);
    console.log('\n📁 Reports saved to:');
    console.log(`  JSON: ${reportPath}`);
    console.log(`  HTML: ${htmlReportPath}`);
    
    // Print test suite breakdown
    console.log('\n📋 Test Suite Breakdown:');
    report.suites.forEach(suite => {
      const passRate = suite.total > 0 ? Math.round((suite.passed / suite.total) * 100) : 0;
      console.log(`  ${suite.name} (${suite.type}): ${suite.passed}/${suite.total} passed (${passRate}%)`);
    });
    
    // Check if pass rate meets quality gates
    if (report.summary.passRate >= 80) {
      console.log('\n✅ Quality Gate PASSED: Pass rate >= 80%');
    } else {
      console.log('\n❌ Quality Gate FAILED: Pass rate < 80%');
      process.exit(1);
    }
  }

  /**
   * Run all tests and generate unified reports
   */
  async runAllTests(): Promise<void> {
    console.log('🚀 Starting unified test run...\n');
    
    try {
      // Run Jest tests
      await this.runJestTests();
      console.log('');
      
      // Run Playwright tests
      await this.runPlaywrightTests();
      console.log('');
      
      // Generate unified reports
      this.generateReports();
      
    } catch (error) {
      console.error('❌ Error during test run:', error);
      process.exit(1);
    }
  }
}

// Run the unified test runner
if (require.main === module) {
  const runner = new UnifiedTestRunner();
  runner.runAllTests();
} 