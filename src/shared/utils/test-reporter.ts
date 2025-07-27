import fs from 'fs';
import path from 'path';

export interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration?: number;
  error?: string;
  suite?: string;
  type: 'unit' | 'integration' | 'e2e';
}

export interface TestSuite {
  name: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  type: 'unit' | 'integration' | 'e2e';
}

export interface UnifiedTestReport {
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    passRate: number;
    duration: number;
  };
  suites: TestSuite[];
  results: TestResult[];
  timestamp: string;
  environment: string;
}

export class UnifiedTestReporter {
  private results: TestResult[] = [];
  private suites: Map<string, TestSuite> = new Map();

  /**
   * Add Jest test results to the unified report
   */
  addJestResults(jestResults: any): void {
    if (!jestResults || !jestResults.testResults) {
      return;
    }

    jestResults.testResults.forEach((suiteResult: any) => {
      const suiteName = suiteResult.testFilePath || 'Unknown Suite';
      const suite: TestSuite = {
        name: suiteName,
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: suiteResult.perfStats?.end - suiteResult.perfStats?.start || 0,
        type: this.determineTestType(suiteName)
      };

      suiteResult.testResults.forEach((test: any) => {
        const result: TestResult = {
          name: test.fullName || test.title,
          status: test.status === 'passed' ? 'passed' : 
                  test.status === 'failed' ? 'failed' : 'skipped',
          duration: test.duration,
          error: test.failureMessages?.join('\n'),
          suite: suiteName,
          type: suite.type
        };

        this.results.push(result);
        suite.total++;
        
        if (result.status === 'passed') suite.passed++;
        else if (result.status === 'failed') suite.failed++;
        else suite.skipped++;
      });

      this.suites.set(suiteName, suite);
    });
  }

  /**
   * Add Playwright test results to the unified report
   */
  addPlaywrightResults(playwrightResults: any): void {
    if (!playwrightResults || !playwrightResults.suites) {
      return;
    }

    playwrightResults.suites.forEach((suite: any) => {
      const suiteName = suite.title || 'Playwright Suite';
      const testSuite: TestSuite = {
        name: suiteName,
        total: 0,
        passed: 0,
        failed: 0,
        skipped: 0,
        duration: 0,
        type: 'e2e'
      };

      suite.specs?.forEach((spec: any) => {
        spec.tests?.forEach((test: any) => {
          const result: TestResult = {
            name: `${spec.title} - ${test.title}`,
            status: test.outcome === 'passed' ? 'passed' : 
                    test.outcome === 'failed' ? 'failed' : 'skipped',
            duration: test.duration,
            error: test.error?.message,
            suite: suiteName,
            type: 'e2e'
          };

          this.results.push(result);
          testSuite.total++;
          testSuite.duration += test.duration || 0;
          
          if (result.status === 'passed') testSuite.passed++;
          else if (result.status === 'failed') testSuite.failed++;
          else testSuite.skipped++;
        });
      });

      this.suites.set(suiteName, testSuite);
    });
  }

  /**
   * Generate unified test report
   */
  generateReport(): UnifiedTestReport {
    const total = this.results.length;
    const passed = this.results.filter(r => r.status === 'passed').length;
    const failed = this.results.filter(r => r.status === 'failed').length;
    const skipped = this.results.filter(r => r.status === 'skipped').length;
    const passRate = total > 0 ? (passed / total) * 100 : 0;
    const duration = this.results.reduce((sum, r) => sum + (r.duration || 0), 0);

    return {
      summary: {
        total,
        passed,
        failed,
        skipped,
        passRate: Math.round(passRate * 100) / 100,
        duration
      },
      suites: Array.from(this.suites.values()),
      results: this.results,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    };
  }

  /**
   * Save report to file
   */
  saveReport(filePath: string): void {
    const report = this.generateReport();
    const reportDir = path.dirname(filePath);
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
  }

  /**
   * Generate HTML report
   */
  generateHtmlReport(): string {
    const report = this.generateReport();
    
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Unified Test Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .summary { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
        .metric { text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .skipped { color: #ffc107; }
        .suite { margin-bottom: 20px; border: 1px solid #ddd; border-radius: 5px; }
        .suite-header { background: #f8f9fa; padding: 10px; border-bottom: 1px solid #ddd; }
        .test-result { padding: 5px 10px; border-bottom: 1px solid #eee; }
        .test-result:last-child { border-bottom: none; }
        .status-passed { color: #28a745; }
        .status-failed { color: #dc3545; }
        .status-skipped { color: #ffc107; }
        .error { background: #f8d7da; color: #721c24; padding: 10px; margin: 5px 0; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>Unified Test Report</h1>
    
    <div class="summary">
        <h2>Summary</h2>
        <div class="summary-grid">
            <div class="metric">
                <div class="metric-value passed">${report.summary.passed}</div>
                <div>Passed</div>
            </div>
            <div class="metric">
                <div class="metric-value failed">${report.summary.failed}</div>
                <div>Failed</div>
            </div>
            <div class="metric">
                <div class="metric-value skipped">${report.summary.skipped}</div>
                <div>Skipped</div>
            </div>
            <div class="metric">
                <div class="metric-value">${report.summary.passRate}%</div>
                <div>Pass Rate</div>
            </div>
            <div class="metric">
                <div class="metric-value">${Math.round(report.summary.duration / 1000)}s</div>
                <div>Duration</div>
            </div>
        </div>
        <p><strong>Generated:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
        <p><strong>Environment:</strong> ${report.environment}</p>
    </div>

    <h2>Test Suites</h2>
    ${report.suites.map(suite => `
        <div class="suite">
            <div class="suite-header">
                <h3>${suite.name}</h3>
                <p>Type: ${suite.type} | Passed: ${suite.passed} | Failed: ${suite.failed} | Skipped: ${suite.skipped} | Duration: ${Math.round(suite.duration / 1000)}s</p>
            </div>
            ${report.results.filter(r => r.suite === suite.name).map(result => `
                <div class="test-result">
                    <span class="status-${result.status}">${result.status.toUpperCase()}</span>
                    <strong>${result.name}</strong>
                    ${result.duration ? `<span>(${result.duration}ms)</span>` : ''}
                    ${result.error ? `<div class="error">${result.error}</div>` : ''}
                </div>
            `).join('')}
        </div>
    `).join('')}
</body>
</html>`;
  }

  /**
   * Save HTML report to file
   */
  saveHtmlReport(filePath: string): void {
    const html = this.generateHtmlReport();
    const reportDir = path.dirname(filePath);
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(filePath, html);
  }

  /**
   * Determine test type based on file path or suite name
   */
  private determineTestType(suiteName: string): 'unit' | 'integration' | 'e2e' {
    const lowerName = suiteName.toLowerCase();
    
    if (lowerName.includes('e2e') || lowerName.includes('playwright')) {
      return 'e2e';
    }
    
    if (lowerName.includes('integration') || lowerName.includes('api.integration')) {
      return 'integration';
    }
    
    return 'unit';
  }

  /**
   * Clear all results
   */
  clear(): void {
    this.results = [];
    this.suites.clear();
  }
} 