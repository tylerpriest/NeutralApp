#!/usr/bin/env ts-node

/**
 * Single UAT Test Runner with Real-Time Progress
 * Demonstrates immediate feedback for test execution
 */

import { spawn } from 'child_process';

class SingleUATRunner {
  private startTime: number = Date.now();

  async runSingleUATTest(): Promise<void> {
    console.log('🎯 Running Single UAT Test (Executable Specification)');
    console.log('   Following SBE/ATDD Core Philosophy: Examples First, Implementation Second');
    console.log('   ================================================================');
    console.log('');

    // Show immediate feedback
    console.log('🔄 Starting test execution...');
    console.log('📁 Test file: tests/uat/user-stories/basic-navigation.spec.ts');
    console.log('');
    
    try {
      // Run a single test file with real-time output
      const child = spawn('npx', [
        'playwright', 
        'test', 
        'tests/uat/user-stories/basic-navigation.spec.ts',
        '--reporter=list',
        '--workers=1',
        '--timeout=30000',
        '--project=chromium'
      ], {
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
        console.log('📊 Test Summary:');
        console.log('================');
        console.log(`Duration: ${duration}ms`);
        
        if (code === 0) {
          console.log('');
          console.log('✅ Test completed successfully!');
          console.log('   Executable specification is passing - system delivers user value.');
        } else {
          console.log('');
          console.log('❌ Test failed!');
          console.log('   Review failed executable specification and fix implementation.');
          process.exit(1);
        }
      });

    } catch (error) {
      console.log(`❌ Failed to start test: ${error}`);
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
      if (trimmed.includes('basic-navigation.spec.ts')) {
        console.log(`  📁 Processing: basic-navigation.spec.ts`);
        continue;
      }
      
      // Show test suite starting
      if (trimmed.includes('User Story: Basic Navigation')) {
        console.log(`  🎯 ${trimmed}`);
        continue;
      }
      
      // Show individual test starting
      if (trimmed.includes('User can navigate to dashboard')) {
        console.log(`  🔄 Running: User can navigate to dashboard`);
        continue;
      }
      
      // Show test actions
      if (trimmed.includes('page.goto')) {
        console.log(`  🌐 Navigating to dashboard...`);
        continue;
      }
      
      if (trimmed.includes('expect(') && trimmed.includes('toBeVisible')) {
        console.log(`  👁️  Checking if welcome text is visible...`);
        continue;
      }
      
      // Detect test results
      if (trimmed.includes('✓') || trimmed.includes('PASS')) {
        console.log(`  ✅ PASSED: Test completed successfully`);
      } else if (trimmed.includes('✗') || trimmed.includes('FAIL')) {
        console.log(`  ❌ FAILED: Test failed`);
      } else if (trimmed.includes('Error:') || trimmed.includes('FAILED')) {
        console.log(`  ❌ ERROR: ${trimmed}`);
      } else if (trimmed.includes('Test Results')) {
        console.log(`  📊 ${trimmed}`);
      }
    }
  }
}

// Main execution
async function main() {
  const runner = new SingleUATRunner();
  await runner.runSingleUATTest();
}

if (require.main === module) {
  main();
} 