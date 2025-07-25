import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { SimpleAPIRouter } from './SimpleAPIRouter';

/**
 * SimpleWebServer - A minimal web server for NeutralApp foundation
 * This bypasses module resolution issues while providing the web layer
 */
export class SimpleWebServer {
  private app: Express;
  private server: any;

  constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
  }

  /**
   * Setup Express middleware stack
   */
  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));

    // CORS configuration
    this.app.use(cors({
      origin: process.env.NODE_ENV === 'production' 
        ? process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
        : true,
      credentials: true,
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Request logging middleware
    this.app.use((req: Request, res: Response, next: NextFunction) => {
      const timestamp = new Date().toISOString();
      console.log(`${timestamp} ${req.method} ${req.path}`);
      next();
    });
  }

  /**
   * Setup application routes
   */
  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req: Request, res: Response) => {
      res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        architecture: 'feature-based modular'
      });
    });

    // API status endpoint
    this.app.get('/api/status', (req: Request, res: Response) => {
      res.json({
        message: 'NeutralApp API Foundation Ready',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        features: {
          auth: 'API endpoints ready',
          plugins: 'API endpoints ready', 
          settings: 'API endpoints ready',
          admin: 'API endpoints ready',
          logging: 'API endpoints ready'
        }
      });
    });

    // API routes
    const apiRouter = new SimpleAPIRouter();
    this.app.use('/api', apiRouter.getRouter());

    // Serve static files (placeholder for React app)
    this.app.use(express.static(path.join(__dirname, '../client')));

    // Default route for web app
    this.app.get('/', (req: Request, res: Response) => {
      res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>NeutralApp - Foundation Ready</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; margin: 0; padding: 2rem; background: #fafafa; }
            .container { max-width: 800px; margin: 0 auto; background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            h1 { color: #1a1a1a; margin-bottom: 1rem; }
            .status { background: #f0f9ff; border: 1px solid #0ea5e9; padding: 1rem; border-radius: 4px; margin: 1rem 0; }
            .success { color: #15803d; }
            .api-list { background: #f8fafc; padding: 1rem; border-radius: 4px; margin: 1rem 0; }
            .endpoint { font-family: monospace; background: white; padding: 0.5rem; margin: 0.25rem 0; border-radius: 2px; }
            a { color: #0ea5e9; text-decoration: none; }
            a:hover { text-decoration: underline; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>🚀 NeutralApp Foundation</h1>
            <div class="status">
              <div class="success">✅ Web Server: Running</div>
              <div class="success">✅ Feature Architecture: Complete</div>
              <div class="success">✅ API Foundation: Ready</div>
            </div>
            
            <h2>Available Endpoints</h2>
            <div class="api-list">
              <div class="endpoint">GET <a href="/health">/health</a> - Server health check</div>
              <div class="endpoint">GET <a href="/api/status">/api/status</a> - API status</div>
              <div class="endpoint">POST /api/auth/register - User registration</div>
              <div class="endpoint">POST /api/auth/login - User login</div>
              <div class="endpoint">GET /api/plugins - List plugins</div>
              <div class="endpoint">GET /api/admin/health - System health</div>
            </div>

            <h2>Architecture Status</h2>
            <div class="api-list">
              <div>📁 Feature-based modular structure: ✅ Complete</div>
              <div>🔐 Auth feature: ✅ Organized</div>
              <div>🧩 Plugin manager feature: ✅ Organized</div>
              <div>🖥️ UI shell feature: ✅ Organized</div>
              <div>⚙️ Settings feature: ✅ Organized</div>
              <div>👤 Admin feature: ✅ Organized</div>
              <div>📊 Error reporter feature: ✅ Organized</div>
            </div>

            <p>Next: React application layer will be built on this foundation.</p>
          </div>
        </body>
        </html>
      `);
    });

    // Catch-all for API routes
    this.app.get('/api/*', (req: Request, res: Response) => {
      res.status(404).json({ 
        error: 'API endpoint not found',
        available: ['/api/status', '/api/auth/*', '/api/plugins/*', '/api/admin/*']
      });
    });

    // Error handling middleware
    this.app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
      console.error('Server error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        message: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    });
  }



  /**
   * Start the web server
   */
  async start(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(port, (error?: Error) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });

      this.server.on('error', (error: Error) => {
        reject(error);
      });
    });
  }

  /**
   * Stop the web server gracefully
   */
  async stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          console.log('✅ Server stopped gracefully');
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  /**
   * Get the Express app instance
   */
  getApp(): Express {
    return this.app;
  }
} 