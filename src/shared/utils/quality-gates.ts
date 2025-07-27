import fs from 'fs';
import path from 'path';

export interface QualityGateResult {
  name: string;
  passed: boolean;
  value: number | string;
  threshold: number | string;
  message: string;
}

export interface QualityReport {
  timestamp: string;
  environment: string;
  overallPassed: boolean;
  gates: QualityGateResult[];
  summary: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
  };
}

export class QualityGates {
  private results: QualityGateResult[] = [];

  /**
   * Check TypeScript compilation
   */
  async checkTypeScriptCompilation(): Promise<QualityGateResult> {
    try {
      const { execSync } = require('child_process');
      execSync('npx tsc --noEmit', { stdio: 'pipe' });
      
      return {
        name: 'TypeScript Compilation',
        passed: true,
        value: 'No errors',
        threshold: 'No errors',
        message: '✅ TypeScript compilation successful'
      };
    } catch (error) {
      return {
        name: 'TypeScript Compilation',
        passed: false,
        value: 'Compilation errors',
        threshold: 'No errors',
        message: '❌ TypeScript compilation failed'
      };
    }
  }

  /**
   * Check test pass rate
   */
  async checkTestPassRate(): Promise<QualityGateResult> {
    try {
      const jestResultsPath = 'test-results/jest-results.json';
      if (!fs.existsSync(jestResultsPath)) {
        return {
          name: 'Test Pass Rate',
          passed: false,
          value: 0,
          threshold: 80,
          message: '❌ No test results found'
        };
      }

      const jestResults = JSON.parse(fs.readFileSync(jestResultsPath, 'utf8'));
      const total = jestResults.numTotalTests || 0;
      const passed = jestResults.numPassedTests || 0;
      const passRate = total > 0 ? (passed / total) * 100 : 0;

      return {
        name: 'Test Pass Rate',
        passed: passRate >= 80,
        value: Math.round(passRate * 100) / 100,
        threshold: 80,
        message: passRate >= 80 
          ? `✅ Test pass rate: ${passRate.toFixed(1)}% (>= 80%)`
          : `❌ Test pass rate: ${passRate.toFixed(1)}% (< 80%)`
      };
    } catch (error) {
      return {
        name: 'Test Pass Rate',
        passed: false,
        value: 0,
        threshold: 80,
        message: '❌ Failed to read test results'
      };
    }
  }

  /**
   * Check code coverage
   */
  async checkCodeCoverage(): Promise<QualityGateResult[]> {
    const coveragePath = 'coverage/lcov-report/index.html';
    const lcovPath = 'coverage/lcov.info';
    
    if (!fs.existsSync(lcovPath)) {
      return [{
        name: 'Code Coverage',
        passed: false,
        value: 0,
        threshold: 80,
        message: '❌ No coverage report found'
      }];
    }

    try {
      const lcovContent = fs.readFileSync(lcovPath, 'utf8');
      const lines = lcovContent.split('\n');
      
      let totalLines = 0;
      let coveredLines = 0;
      let totalFunctions = 0;
      let coveredFunctions = 0;
      let totalBranches = 0;
      let coveredBranches = 0;

      for (const line of lines) {
        if (line.startsWith('LF:')) {
          const parts = line.split(':');
          totalLines += parseInt(parts[1] || '0') || 0;
        } else if (line.startsWith('LH:')) {
          const parts = line.split(':');
          coveredLines += parseInt(parts[1] || '0') || 0;
        } else if (line.startsWith('FNF:')) {
          const parts = line.split(':');
          totalFunctions += parseInt(parts[1] || '0') || 0;
        } else if (line.startsWith('FNH:')) {
          const parts = line.split(':');
          coveredFunctions += parseInt(parts[1] || '0') || 0;
        } else if (line.startsWith('BRF:')) {
          const parts = line.split(':');
          totalBranches += parseInt(parts[1] || '0') || 0;
        } else if (line.startsWith('BRH:')) {
          const parts = line.split(':');
          coveredBranches += parseInt(parts[1] || '0') || 0;
        }
      }

      const lineCoverage = totalLines > 0 ? (coveredLines / totalLines) * 100 : 0;
      const functionCoverage = totalFunctions > 0 ? (coveredFunctions / totalFunctions) * 100 : 0;
      const branchCoverage = totalBranches > 0 ? (coveredBranches / totalBranches) * 100 : 0;

      return [
        {
          name: 'Line Coverage',
          passed: lineCoverage >= 80,
          value: Math.round(lineCoverage * 100) / 100,
          threshold: 80,
          message: lineCoverage >= 80 
            ? `✅ Line coverage: ${lineCoverage.toFixed(1)}% (>= 80%)`
            : `❌ Line coverage: ${lineCoverage.toFixed(1)}% (< 80%)`
        },
        {
          name: 'Function Coverage',
          passed: functionCoverage >= 80,
          value: Math.round(functionCoverage * 100) / 100,
          threshold: 80,
          message: functionCoverage >= 80 
            ? `✅ Function coverage: ${functionCoverage.toFixed(1)}% (>= 80%)`
            : `❌ Function coverage: ${functionCoverage.toFixed(1)}% (< 80%)`
        },
        {
          name: 'Branch Coverage',
          passed: branchCoverage >= 80,
          value: Math.round(branchCoverage * 100) / 100,
          threshold: 80,
          message: branchCoverage >= 80 
            ? `✅ Branch coverage: ${branchCoverage.toFixed(1)}% (>= 80%)`
            : `❌ Branch coverage: ${branchCoverage.toFixed(1)}% (< 80%)`
        }
      ];
    } catch (error) {
      return [{
        name: 'Code Coverage',
        passed: false,
        value: 0,
        threshold: 80,
        message: '❌ Failed to parse coverage report'
      }];
    }
  }

  /**
   * Check security vulnerabilities
   */
  async checkSecurityVulnerabilities(): Promise<QualityGateResult> {
    try {
      const { execSync } = require('child_process');
      const auditResult = execSync('npm audit --audit-level=moderate --json', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      const audit = JSON.parse(auditResult);
      const vulnerabilities = audit.metadata?.vulnerabilities || {};
      const highVulns = vulnerabilities.high || 0;
      const criticalVulns = vulnerabilities.critical || 0;

      const hasHighVulns = highVulns > 0 || criticalVulns > 0;

      return {
        name: 'Security Vulnerabilities',
        passed: !hasHighVulns,
        value: `${highVulns + criticalVulns} high/critical vulnerabilities`,
        threshold: '0 high/critical vulnerabilities',
        message: hasHighVulns 
          ? `❌ Found ${highVulns + criticalVulns} high/critical vulnerabilities`
          : '✅ No high/critical vulnerabilities found'
      };
    } catch (error) {
      return {
        name: 'Security Vulnerabilities',
        passed: false,
        value: 'Audit failed',
        threshold: '0 high/critical vulnerabilities',
        message: '❌ Security audit failed'
      };
    }
  }

  /**
   * Check bundle size
   */
  async checkBundleSize(): Promise<QualityGateResult> {
    try {
      const buildPath = 'build';
      const distPath = 'dist';
      
      let totalSize = 0;
      let fileCount = 0;

      const calculateSize = (dirPath: string) => {
        if (fs.existsSync(dirPath)) {
          const files = fs.readdirSync(dirPath, { withFileTypes: true });
          for (const file of files) {
            const fullPath = path.join(dirPath, file.name);
            if (file.isDirectory()) {
              calculateSize(fullPath);
            } else {
              const stats = fs.statSync(fullPath);
              totalSize += stats.size;
              fileCount++;
            }
          }
        }
      };

      calculateSize(buildPath);
      calculateSize(distPath);

      const sizeInMB = totalSize / (1024 * 1024);
      const maxSize = 10; // 10MB threshold

      return {
        name: 'Bundle Size',
        passed: sizeInMB <= maxSize,
        value: `${sizeInMB.toFixed(2)}MB`,
        threshold: `${maxSize}MB`,
        message: sizeInMB <= maxSize 
          ? `✅ Bundle size: ${sizeInMB.toFixed(2)}MB (<= ${maxSize}MB)`
          : `❌ Bundle size: ${sizeInMB.toFixed(2)}MB (> ${maxSize}MB)`
      };
    } catch (error) {
      return {
        name: 'Bundle Size',
        passed: false,
        value: 'Unknown',
        threshold: '10MB',
        message: '❌ Failed to calculate bundle size'
      };
    }
  }

  /**
   * Check for TODO comments
   */
  async checkTODOs(): Promise<QualityGateResult> {
    try {
      const { execSync } = require('child_process');
      const todoResult = execSync('grep -r "TODO" src/ --include="*.ts" --include="*.tsx" | wc -l', { 
        stdio: 'pipe',
        encoding: 'utf8'
      });
      
      const todoCount = parseInt(todoResult.trim()) || 0;
      const maxTodos = 10; // Maximum allowed TODOs

      return {
        name: 'TODO Comments',
        passed: todoCount <= maxTodos,
        value: todoCount,
        threshold: maxTodos,
        message: todoCount <= maxTodos 
          ? `✅ ${todoCount} TODO comments (<= ${maxTodos})`
          : `❌ ${todoCount} TODO comments (> ${maxTodos})`
      };
    } catch (error) {
      return {
        name: 'TODO Comments',
        passed: false,
        value: 'Unknown',
        threshold: 10,
        message: '❌ Failed to check TODO comments'
      };
    }
  }

  /**
   * Run all quality gates
   */
  async runAllGates(): Promise<QualityReport> {
    console.log('🔍 Running quality gates...\n');

    // Run all quality checks
    const tsCompilation = await this.checkTypeScriptCompilation();
    const testPassRate = await this.checkTestPassRate();
    const coverageResults = await this.checkCodeCoverage();
    const security = await this.checkSecurityVulnerabilities();
    const bundleSize = await this.checkBundleSize();
    const todos = await this.checkTODOs();

    // Combine all results
    this.results = [
      tsCompilation,
      testPassRate,
      ...coverageResults,
      security,
      bundleSize,
      todos
    ];

    // Calculate summary
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const passRate = total > 0 ? (passed / total) * 100 : 0;

    const report: QualityReport = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      overallPassed: failed === 0,
      gates: this.results,
      summary: {
        total,
        passed,
        failed,
        passRate: Math.round(passRate * 100) / 100
      }
    };

    // Print results
    console.log('📊 Quality Gates Results:');
    console.log('========================');
    
    this.results.forEach(result => {
      console.log(`${result.message}`);
    });

    console.log('\n📈 Summary:');
    console.log(`Total Gates: ${total}`);
    console.log(`Passed: ${passed}`);
    console.log(`Failed: ${failed}`);
    console.log(`Pass Rate: ${passRate.toFixed(1)}%`);
    
    if (report.overallPassed) {
      console.log('\n✅ All quality gates passed!');
    } else {
      console.log('\n❌ Some quality gates failed!');
    }

    return report;
  }

  /**
   * Save quality report to file
   */
  saveReport(report: QualityReport, filePath: string): void {
    const reportDir = path.dirname(filePath);
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(report, null, 2));
    console.log(`📄 Quality report saved to: ${filePath}`);
  }

  /**
   * Generate HTML quality report
   */
  generateHtmlReport(report: QualityReport): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quality Gates Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 5px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 20px; }
        .metric { text-align: center; padding: 15px; border-radius: 5px; }
        .metric.passed { background: #d4edda; color: #155724; }
        .metric.failed { background: #f8d7da; color: #721c24; }
        .gate { margin-bottom: 15px; padding: 10px; border-radius: 5px; }
        .gate.passed { background: #d4edda; border: 1px solid #c3e6cb; }
        .gate.failed { background: #f8d7da; border: 1px solid #f5c6cb; }
        .status { font-weight: bold; }
        .details { margin-top: 5px; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Quality Gates Report</h1>
        <p><strong>Generated:</strong> ${new Date(report.timestamp).toLocaleString()}</p>
        <p><strong>Environment:</strong> ${report.environment}</p>
    </div>

    <div class="summary">
        <div class="metric ${report.overallPassed ? 'passed' : 'failed'}">
            <h2>${report.overallPassed ? '✅ PASSED' : '❌ FAILED'}</h2>
            <p>Overall Status</p>
        </div>
        <div class="metric">
            <h2>${report.summary.total}</h2>
            <p>Total Gates</p>
        </div>
        <div class="metric passed">
            <h2>${report.summary.passed}</h2>
            <p>Passed</p>
        </div>
        <div class="metric failed">
            <h2>${report.summary.failed}</h2>
            <p>Failed</p>
        </div>
        <div class="metric">
            <h2>${report.summary.passRate}%</h2>
            <p>Pass Rate</p>
        </div>
    </div>

    <h2>Quality Gates</h2>
    ${report.gates.map(gate => `
        <div class="gate ${gate.passed ? 'passed' : 'failed'}">
            <div class="status">${gate.passed ? '✅' : '❌'} ${gate.name}</div>
            <div class="details">
                <strong>Value:</strong> ${gate.value} | 
                <strong>Threshold:</strong> ${gate.threshold}<br>
                ${gate.message}
            </div>
        </div>
    `).join('')}
</body>
</html>`;
  }

  /**
   * Save HTML quality report
   */
  saveHtmlReport(report: QualityReport, filePath: string): void {
    const html = this.generateHtmlReport(report);
    const reportDir = path.dirname(filePath);
    
    if (!fs.existsSync(reportDir)) {
      fs.mkdirSync(reportDir, { recursive: true });
    }

    fs.writeFileSync(filePath, html);
    console.log(`📄 HTML quality report saved to: ${filePath}`);
  }
} 