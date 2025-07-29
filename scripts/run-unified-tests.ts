#!/usr/bin/env ts-node

/**
 * Unified Test Runner
 * Implements the unified testing hierarchy from .kiro/steering/unified-testing-standards.md
 * 
 * Testing Hierarchy:
 * 1. User Acceptance Tests (UAT) - Executable Specifications
 * 2. End-to-End Tests (E2E) - Complete user flows
 * 3. Integration Tests - Component cooperation
 * 4. Unit Tests - Edge cases only
 * 5. Smoke Tests - Critical deployment checks
 */

import { execSync } from 'child_process';
import { QualityGates } from '../src/shared/utils/quality-gates';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

interface UnifiedTestReport {
  timestamp: string;
  environment: string;
  overallPassed: boolean;
  hierarchy: {
    uat: TestResult[];
    e2e: TestResult[];
    integration: TestResult[];
    unit: TestResult[];
    smoke: TestResult[];
  };
  summary: {
    total: number;
    passed: number;
    failed: number;
    passRate: number;
  };
}

class UnifiedTestRunner {
  private results: TestResult[] = [];
  private startTime: number = Date.now();

  /**
   * Run User Acceptance Tests (Executable Specifications)
   * These are the most critical - they validate user value delivery
   */
  async runUAT(): Promise<TestResult[]> {
    console.log('🎯 Running User Acceptance Tests (Executable Specifications)...');
    console.log('   Following SBE/ATDD Core Philosophy: Examples First, Implementation Second');
    console.log('');
    
    try {
      const startTime = Date.now();
      
      // Show immediate feedback that tests are starting
      console.log('   🔄 Starting test discovery...');
      
      // Run tests with real-time output
      const result = execSync('npm run test:uat -- --reporter=list --workers=1', { 
        stdio: 'inherit',
        encoding: 'utf8'
      });
      
      const duration = Date.now() - startTime;
      
      console.log(`   ✅ User Acceptance Tests completed (${duration}ms)`);
      
      return [{
        name: 'User Acceptance Tests',
        passed: true,
        duration
      }];
    } catch (error) {
      const duration = Date.now() - (this.startTime || Date.now());
      
      console.log(`   ❌ User Acceptance Tests failed (${duration}ms)`);
      console.log(`   Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      return [{
        name: 'User Acceptance Tests',
        passed: false,
        duration,
        error: error instanceof Error ? error.message : 'Unknown error'
      }];
    }
  }

  /**
   * Run End-to-End Tests
   * Validate complete user flows
   */
  async runE2E(): Promise<TestResult[]> {
    console.log('🔄 Running End-to-End Tests...');
    
    try {
      const startTime = Date.now();
      execSync('npm run test:e2e', { stdio: 'inherit' });
      const duration = Date.now() - startTime;
      
      return [{
        name: 'End-to-End Tests',
        passed: true,
        duration
      }];
    } catch (error) {
      return [{
        name: 'End-to-End Tests',
        passed: false,
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }];
    }
  }

  /**
   * Run Integration Tests
   * Validate component cooperation
   */
  async runIntegration(): Promise<TestResult[]> {
    console.log('🔗 Running Integration Tests...');
    
    try {
      const startTime = Date.now();
      execSync('npm run test:integration', { stdio: 'inherit' });
      const duration = Date.now() - startTime;
      
      return [{
        name: 'Integration Tests',
        passed: true,
        duration
      }];
    } catch (error) {
      return [{
        name: 'Integration Tests',
        passed: false,
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }];
    }
  }

  /**
   * Run Unit Tests (Edge cases only)
   * Only test edge cases that affect user experience
   */
  async runUnit(): Promise<TestResult[]> {
    console.log('🧩 Running Unit Tests (Edge Cases)...');
    
    try {
      const startTime = Date.now();
      execSync('npm run test:unit', { stdio: 'inherit' });
      const duration = Date.now() - startTime;
      
      return [{
        name: 'Unit Tests',
        passed: true,
        duration
      }];
    } catch (error) {
      return [{
        name: 'Unit Tests',
        passed: false,
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }];
    }
  }

  /**
   * Run Smoke Tests
   * Critical deployment checks
   */
  async runSmoke(): Promise<TestResult[]> {
    console.log('💨 Running Smoke Tests...');
    
    try {
      const startTime = Date.now();
      execSync('npm run test:smoke', { stdio: 'inherit' });
      const duration = Date.now() - startTime;
      
      return [{
        name: 'Smoke Tests',
        passed: true,
        duration
      }];
    } catch (error) {
      return [{
        name: 'Smoke Tests',
        passed: false,
        duration: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      }];
    }
  }

  /**
   * Run all tests following the unified testing hierarchy
   */
  async runAllTests(): Promise<UnifiedTestReport> {
    console.log('🚀 Starting Unified Test Suite');
    console.log('================================');
    console.log('Following SBE/ATDD Core Philosophy: Examples First, Implementation Second');
    console.log('');

    // Run tests in hierarchy order
    const uatResults = await this.runUAT();
    const e2eResults = await this.runE2E();
    const integrationResults = await this.runIntegration();
    const unitResults = await this.runUnit();
    const smokeResults = await this.runSmoke();

    // Combine all results
    const allResults = [
      ...uatResults,
      ...e2eResults,
      ...integrationResults,
      ...unitResults,
      ...smokeResults
    ];

    // Calculate summary
    const total = allResults.length;
    const passed = allResults.filter(r => r.passed).length;
    const failed = total - passed;
    const passRate = total > 0 ? (passed / total) * 100 : 0;

    const report: UnifiedTestReport = {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      overallPassed: failed === 0,
      hierarchy: {
        uat: uatResults,
        e2e: e2eResults,
        integration: integrationResults,
        unit: unitResults,
        smoke: smokeResults
      },
      summary: {
        total,
        passed,
        failed,
        passRate: Math.round(passRate * 100) / 100
      }
    };

    // Print results
    this.printResults(report);

    return report;
  }

  /**
   * Print test results in a clear format
   */
  private printResults(report: UnifiedTestReport): void {
    console.log('\n📊 Unified Test Results:');
    console.log('========================');
    
    // Print hierarchy results
    console.log('\n🎯 User Acceptance Tests (Executable Specifications):');
    report.hierarchy.uat.forEach(result => {
      console.log(`  ${result.passed ? '✅' : '❌'} ${result.name} (${result.duration}ms)`);
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
    });

    console.log('\n🔄 End-to-End Tests:');
    report.hierarchy.e2e.forEach(result => {
      console.log(`  ${result.passed ? '✅' : '❌'} ${result.name} (${result.duration}ms)`);
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
    });

    console.log('\n🔗 Integration Tests:');
    report.hierarchy.integration.forEach(result => {
      console.log(`  ${result.passed ? '✅' : '❌'} ${result.name} (${result.duration}ms)`);
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
    });

    console.log('\n🧩 Unit Tests (Edge Cases):');
    report.hierarchy.unit.forEach(result => {
      console.log(`  ${result.passed ? '✅' : '❌'} ${result.name} (${result.duration}ms)`);
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
    });

    console.log('\n💨 Smoke Tests:');
    report.hierarchy.smoke.forEach(result => {
      console.log(`  ${result.passed ? '✅' : '❌'} ${result.name} (${result.duration}ms)`);
      if (result.error) {
        console.log(`    Error: ${result.error}`);
      }
    });

    // Print summary
    console.log('\n📈 Summary:');
    console.log(`Total Tests: ${report.summary.total}`);
    console.log(`Passed: ${report.summary.passed}`);
    console.log(`Failed: ${report.summary.failed}`);
    console.log(`Pass Rate: ${report.summary.passRate.toFixed(1)}%`);
    
    if (report.overallPassed) {
      console.log('\n✅ All tests passed! System delivers user value.');
    } else {
      console.log('\n❌ Some tests failed! Review and fix issues.');
      
      // Special attention to UAT failures
      const uatFailures = report.hierarchy.uat.filter(r => !r.passed);
      if (uatFailures.length > 0) {
        console.log('\n🚨 CRITICAL: User Acceptance Tests failed!');
        console.log('These are executable specifications - they define expected user value.');
        console.log('Fix these first before proceeding with other tests.');
      }
    }
  }

  /**
   * Run quality gates after tests
   */
  async runQualityGates(): Promise<void> {
    console.log('\n🔍 Running Quality Gates...');
    
    const qualityGates = new QualityGates();
    const report = await qualityGates.runAllGates();
    
    if (!report.overallPassed) {
      console.log('\n⚠️  Quality gates failed! Review quality metrics.');
    }
  }
}

// Main execution
async function main() {
  const runner = new UnifiedTestRunner();
  
  try {
    const report = await runner.runAllTests();
    
    // Run quality gates
    await runner.runQualityGates();
    
    // Exit with appropriate code
    process.exit(report.overallPassed ? 0 : 1);
  } catch (error) {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
} 