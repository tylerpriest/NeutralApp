import { UnifiedTestReporter } from './test-reporter';

export class JestUnifiedReporter {
  private reporter: UnifiedTestReporter;
  private outputPath: string;

  constructor(globalConfig: any, options: any) {
    this.reporter = new UnifiedTestReporter();
    this.outputPath = options.outputPath || 'test-results/unified-report.json';
  }

  onRunComplete(contexts: any, results: any) {
    // Add Jest results to unified reporter
    this.reporter.addJestResults(results);
    
    // Save reports
    this.reporter.saveReport(this.outputPath);
    this.reporter.saveHtmlReport(this.outputPath.replace('.json', '.html'));
    
    // Log summary to console
    const report = this.reporter.generateReport();
    console.log('\n=== Unified Test Report ===');
    console.log(`Total: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Skipped: ${report.summary.skipped}`);
    console.log(`Pass Rate: ${report.summary.passRate}%`);
    console.log(`Duration: ${Math.round(report.summary.duration / 1000)}s`);
    console.log(`Report saved to: ${this.outputPath}`);
    console.log(`HTML report saved to: ${this.outputPath.replace('.json', '.html')}`);
  }
} 