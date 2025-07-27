import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { SimpleAPIRouter } from './SimpleAPIRouter';
import NextAuth from 'next-auth';
import { authOptions } from './auth/nextauth.config';

/**
 * SimpleWebServer - A minimal web server for NeutralApp foundation
 * This bypasses module resolution issues while providing the web layer
 */
export class SimpleWebServer {
  private app: Express;
  private server: any;
  private nextAuthHandler: any;

  constructor() {
    this.app = express();
    console.log('Initializing NextAuth.js handler...');
    this.nextAuthHandler = NextAuth(authOptions);
    console.log('NextAuth.js handler initialized successfully');
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
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
      optionsSuccessStatus: 200 // Some legacy browsers choke on 204
    }));

    // Body parsing middleware
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // JSON parsing error handler
    this.app.use((error: any, req: Request, res: Response, next: NextFunction) => {
      if (error instanceof SyntaxError && 'body' in error) {
        return res.status(400).json({ error: 'Invalid JSON' });
      }
      next();
      return;
    });

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
      const healthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        architecture: 'feature-based modular',
        environment: process.env.NODE_ENV || 'development',
        memory: {
          used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          external: Math.round(process.memoryUsage().external / 1024 / 1024)
        },
        cpu: {
          usage: process.cpuUsage(),
          uptime: process.uptime()
        },
        features: {
          auth: 'available',
          plugins: 'available',
          settings: 'available',
          admin: 'available',
          logging: 'available'
        }
      };
      
      res.json(healthData);
    });

    // API health check endpoint
    this.app.get('/api/health', (req: Request, res: Response) => {
      const apiHealthData = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        endpoints: {
          auth: '/api/auth',
          plugins: '/api/plugins',
          settings: '/api/settings',
          admin: '/api/admin',
          health: '/health'
        },
        version: '1.0.0',
        uptime: process.uptime()
      };
      
      res.json(apiHealthData);
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

    // NextAuth.js API routes - handle all auth-related requests FIRST
    this.app.use('/api/auth', (req: Request, res: Response, next: NextFunction) => {
      console.log('NextAuth.js route called:', req.method, req.path);
      return this.nextAuthHandler(req, res);
    });

    // API routes
    const apiRouter = new SimpleAPIRouter();
    this.app.use('/api', apiRouter.getRouter());

    // Catch-all for API routes (must come before static file serving)
    this.app.use('/api/*', (req: Request, res: Response) => {
      res.status(404).json({ 
        error: 'API endpoint not found',
        available: ['/api/status', '/api/auth/*', '/api/plugins/*', '/api/admin/*']
      });
    });

    // Serve static files (React app) with caching and optimization
    this.app.use(express.static(path.join(__dirname, '../../dist/web/client'), {
      maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
      etag: true,
      lastModified: true,
      setHeaders: (res, path) => {
        // Cache static assets aggressively in production
        if (process.env.NODE_ENV === 'production') {
          if (path.endsWith('.js') || path.endsWith('.css')) {
            res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
          } else if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
          } else if (path.match(/\.(png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000');
          }
        }
        
        // Security headers for static assets
        if (path.endsWith('.js')) {
          res.setHeader('X-Content-Type-Options', 'nosniff');
        }
      }
    }));

    // Default route for web app - serve React app
    this.app.get('*', (req: Request, res: Response) => {
      // Set cache headers for HTML
      if (process.env.NODE_ENV === 'production') {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
      }
      res.sendFile(path.join(__dirname, '../../dist/web/client/index.html'));
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