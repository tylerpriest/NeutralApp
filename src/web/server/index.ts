// NeutralApp Foundation Web Server
import { WebServer } from './WebServer';

async function startFoundationServer() {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
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

if (require.main === module) {
  startFoundationServer();
}

export { startFoundationServer }; 