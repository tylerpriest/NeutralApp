#!/usr/bin/env ts-node

import { QualityGates } from '../src/shared/utils/quality-gates';
import * as path from 'path';

async function main() {
  console.log('🚀 Starting Quality Gates Check...\n');

  const qualityGates = new QualityGates();
  
  try {
    // Run all quality gates
    const report = await qualityGates.runAllGates();
    
    // Save reports
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const jsonPath = `test-results/quality-gates-${timestamp}.json`;
    const htmlPath = `test-results/quality-gates-${timestamp}.html`;
    
    qualityGates.saveReport(report, jsonPath);
    qualityGates.saveHtmlReport(report, htmlPath);
    
    // Exit with appropriate code
    if (report.overallPassed) {
      console.log('\n🎉 All quality gates passed!');
      process.exit(0);
    } else {
      console.log('\n⚠️  Some quality gates failed. Please review the report.');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Error running quality gates:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  });
} 