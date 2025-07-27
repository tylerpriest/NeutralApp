#!/usr/bin/env ts-node

import { EnvironmentManager } from '../src/shared/utils/environment-manager';

async function main() {
  console.log('🔍 Validating environment configuration...\n');

  try {
    const envManager = EnvironmentManager.getInstance();
    const validation = envManager.validate();

    console.log(`Environment: ${envManager.getEnvironment()}`);
    console.log(`Node Environment: ${envManager.getConfig().NODE_ENV}`);
    console.log('');

    if (validation.isValid) {
      console.log('✅ Environment configuration is valid!');
      
      // Show configuration summary
      const summary = envManager.getSummary();
      console.log('\n📋 Configuration Summary:');
      console.log(JSON.stringify(summary, null, 2));
      
    } else {
      console.log('❌ Environment configuration has errors:');
      validation.errors.forEach(error => {
        console.log(`  - ${error}`);
      });
      console.log('\nPlease fix the configuration errors before proceeding.');
      process.exit(1);
    }

    // Additional environment-specific checks
    console.log('\n🔧 Environment-specific checks:');
    
    if (envManager.isProduction()) {
      console.log('  ✅ Production environment detected');
      
      if (envManager.get('ENABLE_HTTPS')) {
        console.log('  ✅ HTTPS is enabled');
      } else {
        console.log('  ⚠️  HTTPS should be enabled in production');
      }
      
      if (envManager.get('SECURE_COOKIES')) {
        console.log('  ✅ Secure cookies are enabled');
      } else {
        console.log('  ⚠️  Secure cookies should be enabled in production');
      }
      
      if (envManager.get('LOG_LEVEL') !== 'debug') {
        console.log('  ✅ Debug logging is disabled');
      } else {
        console.log('  ⚠️  Debug logging should be disabled in production');
      }
      
    } else if (envManager.isDevelopment()) {
      console.log('  ✅ Development environment detected');
      
      if (envManager.get('ENABLE_DEBUG_MODE')) {
        console.log('  ✅ Debug mode is enabled');
      }
      
      if (envManager.get('ENABLE_HOT_RELOAD')) {
        console.log('  ✅ Hot reload is enabled');
      }
      
    } else if (envManager.isTest()) {
      console.log('  ✅ Test environment detected');
      
      if (envManager.get('ENABLE_TEST_MODE')) {
        console.log('  ✅ Test mode is enabled');
      }
    }

    console.log('\n🎉 Environment validation completed successfully!');

  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    process.exit(1);
  }
}

// Run the validation
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Validation script failed:', error);
    process.exit(1);
  });
} 