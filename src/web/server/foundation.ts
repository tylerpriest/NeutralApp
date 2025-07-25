// NeutralApp Foundation Web Server
import { SimpleWebServer } from './SimpleWebServer';

/**
 * Foundation server entry point
 * Provides a working web server on top of the feature-based architecture
 */
async function startFoundationServer() {
  try {
    const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
    const webServer = new SimpleWebServer();
    
    await webServer.start(port);
    
    console.log('🏗️  NeutralApp Foundation Server Started');
    console.log(`🚀 Server: http://localhost:${port}`);
    console.log(`💚 Health: http://localhost:${port}/health`);
    console.log(`📡 API Status: http://localhost:${port}/api/status`);
    console.log(`📋 Features: Modular architecture complete`);
    console.log(`🔧 Next: React application layer`);
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n⏹️  Shutting down foundation server...');
      await webServer.stop();
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\n⏹️  Shutting down foundation server...');
      await webServer.stop();
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start foundation server:', error);
    process.exit(1);
  }
}

// Start the server if this file is run directly
if (require.main === module) {
  startFoundationServer();
}

export { startFoundationServer }; 