import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { SimpleAPIRouter } from './SimpleAPIRouter';
import NextAuth from 'next-auth';
import { authOptions } from './auth/nextauth.config';

/**
 * WebServer class manages the Express.js application lifecycle
 * Provides a clean interface for starting/stopping the server
 */
export class WebServer {
  private app: Express;
  private server: any;
  private apiRouter: SimpleAPIRouter;
  private nextAuthHandler: any;

  constructor() {
    this.app = express();
    this.apiRouter = new SimpleAPIRouter();
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
    if (process.env.NODE_ENV === 'production') {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'];
      this.app.use((req: Request, res: Response, next: NextFunction) => {
        const origin = req.headers.origin;
        if (origin && allowedOrigins.includes(origin)) {
          res.header('Access-Control-Allow-Origin', origin);
        }
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        
        if (req.method === 'OPTIONS') {
          res.sendStatus(200);
        } else {
          next();
        }
      });
    } else {
      this.app.use(cors({
        origin: true,
        credentials: true,
      }));
    }

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

    // NextAuth.js API routes - handle all auth-related requests FIRST
    this.app.use('/api/auth', (req: Request, res: Response, next: NextFunction) => {
      console.log('NextAuth.js route called:', req.method, req.path);
      return this.nextAuthHandler(req, res);
    });

    // Other API routes
    this.app.use('/api', this.apiRouter.getRouter());

    // Serve static files from React build
    const buildPath = path.join(__dirname, '../../client/build');
    this.app.use(express.static(buildPath));

    // React app catch-all handler (for client-side routing)
    this.app.get('*', (req: Request, res: Response) => {
      // Skip API routes
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      
      // Serve React app for all other routes
      return res.sendFile(path.join(buildPath, 'index.html'));
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

  /**
   * Register additional middleware
   */
  registerMiddleware(middleware: (req: Request, res: Response, next: NextFunction) => void): void {
    this.app.use(middleware);
  }
} 