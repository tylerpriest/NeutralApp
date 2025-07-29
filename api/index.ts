import { VercelRequest, VercelResponse } from '@vercel/node';
import { WebServer } from '../dist/web/server/WebServer';

// Create the Express app (singleton)
let webServer: WebServer | null = null;
let app: any = null;

function getApp() {
  if (!webServer) {
    webServer = new WebServer();
    app = webServer.getApp();
  }
  return app;
}

// Export the Vercel serverless function
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const expressApp = getApp();
  
  // Handle the request with Express
  return new Promise((resolve, reject) => {
    expressApp(req, res, (err: any) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
} 