import { Router, Request, Response } from 'express';
import { JWTAuthService } from '../services/jwt.service';
import { JWTAuthMiddleware } from '../middleware/auth.middleware';

export class JWTAuthRoutes {
  private router: Router;
  private jwtService: JWTAuthService;
  private authMiddleware: JWTAuthMiddleware;

  constructor() {
    this.router = Router();
    this.jwtService = new JWTAuthService();
    this.authMiddleware = new JWTAuthMiddleware();
    this.setupRoutes();
  }

  private setupRoutes(): void {
    // POST /api/auth/signin - User login
    this.router.post('/signin', this.handleSignin.bind(this));

    // GET /api/auth/session - Validate session
    this.router.get('/session', this.authMiddleware.authenticateToken, this.handleSession.bind(this));

    // POST /api/auth/signout - User logout
    this.router.post('/signout', this.handleSignout.bind(this));

    // POST /api/auth/refresh - Refresh token
    this.router.post('/refresh', this.handleRefreshToken.bind(this));
  }

  /**
   * Handle user signin
   */
  private async handleSignin(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      // Validate input
      if (!email || !password) {
        res.status(400).json({ 
          error: 'Email and password are required',
          success: false 
        });
        return;
      }

      // Authenticate user
      const result = this.jwtService.authenticateUser(email, password);

      if (!result.success) {
        res.status(401).json({ 
          error: result.error,
          success: false 
        });
        return;
      }

      // Return success response
      res.status(200).json({
        success: true,
        user: result.user,
        token: result.token,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

    } catch (error) {
      console.error('Signin error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        success: false 
      });
    }
  }

  /**
   * Handle session validation
   */
  private async handleSession(req: Request, res: Response): Promise<void> {
    try {
      // User is already validated by middleware and injected into req.user
      const user = req.user;

      if (!user) {
        res.status(401).json({ 
          error: 'Invalid session',
          success: false 
        });
        return;
      }

      res.status(200).json({
        success: true,
        user,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

    } catch (error) {
      console.error('Session validation error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        success: false 
      });
    }
  }

  /**
   * Handle user signout
   */
  private async handleSignout(req: Request, res: Response): Promise<void> {
    try {
      // JWT tokens are stateless, so we just return success
      // In a more sophisticated implementation, you might want to blacklist the token
      res.status(200).json({ 
        success: true,
        message: 'Successfully signed out'
      });

    } catch (error) {
      console.error('Signout error:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        success: false 
      });
    }
  }

  /**
   * Handle token refresh
   */
  private async handleRefreshToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

      if (!token) {
        res.status(401).json({ 
          error: 'Refresh token required',
          success: false 
        });
        return;
      }

      // Refresh the token
      const newToken = this.jwtService.refreshToken(token);
      const user = this.jwtService.extractUserFromToken(newToken);

      res.status(200).json({
        success: true,
        user,
        token: newToken,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      });

    } catch (error) {
      console.error('Token refresh error:', error);
      res.status(401).json({ 
        error: 'Invalid refresh token',
        success: false 
      });
    }
  }

  /**
   * Get the router instance
   */
  getRouter(): Router {
    return this.router;
  }
} 