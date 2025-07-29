import { VercelRequest, VercelResponse } from '@vercel/node';
import { WebServer } from '../src/web/server/WebServer';

// Create WebServer instance
const webServer = new WebServer();

// Export the handler function for Vercel
export default function handler(req: VercelRequest, res: VercelResponse) {
  // Handle API requests only
  return webServer.getApp()(req, res);
} 