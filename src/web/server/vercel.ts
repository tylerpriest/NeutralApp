// Vercel Serverless Entry Point
import { WebServer } from './WebServer';
import { env } from '../../shared/utils/environment-manager';

let webServer: WebServer | null = null;

// Initialize the server for serverless environment
async function initializeServer() {
  if (!webServer) {
    // Set environment for Vercel
    process.env.NODE_ENV = 'production';
    
    const config = env.getConfig();
    webServer = new WebServer();
    // Don't start listening in serverless mode
    console.log('🏗️  NeutralApp Foundation Server Initialized for Vercel');
    console.log('📋 Environment:', config.NODE_ENV);
    console.log('🔧 API Base URL:', config.API_BASE_URL);
  }
  return webServer;
}

// Vercel serverless function handler
export default async function handler(req: any, res: any) {
  try {
    const server = await initializeServer();
    const app = server.getApp();
    
    // Handle the request through Express
    return new Promise((resolve, reject) => {
      app(req, res, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve(undefined);
        }
      });
    });
  } catch (error) {
    console.error('❌ Serverless handler error:', error);
    res.status(500).json({ error: 'Internal server error' });
    return Promise.resolve();
  }
} 