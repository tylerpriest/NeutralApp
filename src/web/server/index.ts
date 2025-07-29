// NeutralApp Foundation Web Server
import { WebServer } from './WebServer';
import { env } from '../../shared/utils/environment-manager';

async function startFoundationServer() {
  try {
    // Load environment configuration
    const config = env.getConfig();
    const port = config.PORT;
    const webServer = new WebServer();

    await webServer.start(port);
    console.log('🏗️  NeutralApp Foundation Server Started');
    console.log(`🚀 Server: http://localhost:${port}`);
    console.log(`📋 API Status: http://localhost:${port}/api/status`);
    console.log(`💊 Health Check: http://localhost:${port}/health`);
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n⏹️  Shutting down server gracefully...');
      await webServer.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n⏹️  Shutting down server gracefully...');
      await webServer.stop();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start foundation server:', error);
    process.exit(1);
  }
}

// Check if this module is being run directly
const isMainModule = process.argv[1] && process.argv[1].endsWith('index.ts') || process.argv[1] && process.argv[1].endsWith('index.js');
if (isMainModule) {
  startFoundationServer();
}

export { startFoundationServer }; 