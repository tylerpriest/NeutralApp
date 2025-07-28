import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { SimpleAPIRouter } from './SimpleAPIRouter';
import { JWTAuthRoutes, JWTAuthMiddleware } from '../../features/auth';
import { DashboardManager } from '../../features/ui-shell/services/dashboard.manager';

/**
 * WebServer class manages the Express.js application lifecycle
 * Provides a clean interface for starting/stopping the server
 */
export class WebServer {
  private app: Express;
  private server: any;
  private apiRouter: SimpleAPIRouter;
  private authRoutes: JWTAuthRoutes;
  private authMiddleware: JWTAuthMiddleware;

  constructor() {
    this.app = express();
    this.apiRouter = new SimpleAPIRouter();
    this.authRoutes = new JWTAuthRoutes();
    this.authMiddleware = new JWTAuthMiddleware();
    
    // Set the global DashboardManager instance
    const dashboardManager = this.apiRouter.getDashboardManager();
    DashboardManager.setInstance(dashboardManager);
    
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

    // JWT Authentication routes
    this.app.use('/api/auth', this.authRoutes.getRouter());

    // Other API routes
    this.app.use('/api', this.apiRouter.getRouter());

    // Serve static files from React build (Vite output directory)
    // Handle both development and production paths
    const buildPath = process.env.NODE_ENV === 'production' 
      ? path.join(__dirname, '../client')
      : path.join(__dirname, '../../../src/dist/web/client');
    
    this.app.use(express.static(buildPath));

    // React app catch-all handler (for client-side routing)
    this.app.get('*', (req: Request, res: Response) => {
      // Skip API routes
      if (req.path.startsWith('/api/')) {
        return res.status(404).json({ error: 'API endpoint not found' });
      }
      
      // Serve React app for all other routes
      const indexPath = path.join(buildPath, 'index.html');
      console.log(`Serving React app from: ${indexPath}`);
      return res.sendFile(indexPath);
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
   * Get the shared DashboardManager instance
   */
  getDashboardManager() {
    return this.apiRouter.getDashboardManager();
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