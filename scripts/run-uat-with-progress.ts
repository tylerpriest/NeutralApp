#!/usr/bin/env ts-node

/**
 * UAT Test Runner with Real-Time Progress
 * Provides immediate feedback during test execution
 */

import { spawn } from 'child_process';

class UATProgressRunner {
  private startTime: number = Date.now();
  private testCount: number = 0;
  private passedCount: number = 0;
  private failedCount: number = 0;
  private currentTest: string = '';

  async runUATWithProgress(): Promise<void> {
    console.log('🎯 Starting User Acceptance Tests (Executable Specifications)');
    console.log('   Following SBE/ATDD Core Philosophy: Examples First, Implementation Second');
    console.log('   ================================================================');
    console.log('');

    // Show immediate feedback
    console.log('🔄 Discovering UAT tests...');
    
    try {
      // Run Playwright tests with real-time output
      const child = spawn('npx', ['playwright', 'test', 'tests/uat/', '--reporter=list', '--workers=1', '--timeout=30000'], {
        stdio: ['inherit', 'pipe', 'pipe'],
        shell: true
      });

      let output = '';
      let errorOutput = '';

      // Real-time output processing
      child.stdout?.on('data', (data) => {
        const chunk = data.toString();
        output += chunk;
        
        // Show immediate progress
        this.processOutput(chunk);
      });

      child.stderr?.on('data', (data) => {
        const chunk = data.toString();
        errorOutput += chunk;
        
        // Show errors immediately
        console.log(`❌ Error: ${chunk.trim()}`);
      });

      // Handle completion
      child.on('close', (code) => {
        const duration = Date.now() - this.startTime;
        
        console.log('');
        console.log('📊 UAT Test Summary:');
        console.log('====================');
        console.log(`Total Tests: ${this.testCount}`);
        console.log(`Passed: ${this.passedCount} ✅`);
        console.log(`Failed: ${this.failedCount} ❌`);
        console.log(`Duration: ${duration}ms`);
        console.log(`Pass Rate: ${this.testCount > 0 ? Math.round((this.passedCount / this.testCount) * 100) : 0}%`);
        
        if (code === 0) {
          console.log('');
          console.log('✅ All UAT tests completed successfully!');
          console.log('   Executable specifications are passing - system delivers user value.');
        } else {
          console.log('');
          console.log('❌ Some UAT tests failed!');
          console.log('   Review failed executable specifications and fix implementation.');
          process.exit(1);
        }
      });

    } catch (error) {
      console.log(`❌ Failed to start UAT tests: ${error}`);
      process.exit(1);
    }
  }

  private processOutput(chunk: string): void {
    const lines = chunk.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Show test discovery
      if (trimmed.includes('Running') && trimmed.includes('tests')) {
        console.log(`  📋 ${trimmed}`);
        continue;
      }
      
      // Show test file being processed
      if (trimmed.includes('tests/uat/') && trimmed.includes('.spec.ts')) {
        console.log(`  📁 Processing: ${trimmed.split('/').pop()}`);
        continue;
      }
      
      // Show test suite starting
      if (trimmed.includes('User Story:') || trimmed.includes('Business Outcome:') || trimmed.includes('Executable Specifications:')) {
        console.log(`  🎯 ${trimmed}`);
        continue;
      }
      
      // Show individual test starting
      if (trimmed.includes('test(') || trimmed.includes('test.describe(')) {
        const testName = trimmed.replace(/test\(['"`]([^'"`]+)['"`]/, '$1');
        this.currentTest = testName;
        console.log(`  🔄 Running: ${testName}`);
        continue;
      }
      
      // Detect test results
      if (trimmed.includes('✓') || trimmed.includes('PASS')) {
        this.testCount++;
        this.passedCount++;
        console.log(`  ✅ PASSED: ${this.currentTest || 'Test'}`);
      } else if (trimmed.includes('✗') || trimmed.includes('FAIL')) {
        this.testCount++;
        this.failedCount++;
        console.log(`  ❌ FAILED: ${this.currentTest || 'Test'}`);
      } else if (trimmed.includes('Error:') || trimmed.includes('FAILED')) {
        console.log(`  ❌ ERROR: ${trimmed}`);
      } else if (trimmed.includes('Test Results')) {
        console.log(`  📊 ${trimmed}`);
      } else if (trimmed.includes('expect(') && trimmed.includes('toBeVisible')) {
        console.log(`  👁️  Checking visibility: ${trimmed.substring(0, 50)}...`);
      } else if (trimmed.includes('page.click(')) {
        console.log(`  🖱️  Clicking element: ${trimmed.substring(0, 50)}...`);
      } else if (trimmed.includes('page.goto(')) {
        console.log(`  🌐 Navigating to: ${trimmed.substring(0, 50)}...`);
      }
    }
  }
}

// Main execution
async function main() {
  const runner = new UATProgressRunner();
  await runner.runUATWithProgress();
}

if (require.main === module) {
  main();
} 