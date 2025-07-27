import { Request, Response, NextFunction } from 'express';
import { JWTAuthService } from '../services/jwt.service';
import { User } from '../types/jwt.types';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export class JWTAuthMiddleware {
  private jwtService: JWTAuthService;

  constructor() {
    this.jwtService = new JWTAuthService();
  }

  /**
   * Middleware to validate JWT token and inject user into request
   */
  authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      res.status(401).json({ error: 'Access token required' });
      return;
    }

    try {
      const validation = this.jwtService.validateToken(token);
      
      if (!validation.isValid || !validation.user) {
        res.status(401).json({ error: validation.error || 'Invalid token' });
        return;
      }

      // Inject user into request object
      req.user = validation.user;
      next();
    } catch (error) {
      console.error('Token validation error:', error);
      res.status(401).json({ error: 'Token validation failed' });
    }
  };

  /**
   * Optional authentication middleware - doesn't fail if no token provided
   */
  optionalAuth = (req: Request, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!token) {
      // No token provided, continue without authentication
      next();
      return;
    }

    try {
      const validation = this.jwtService.validateToken(token);
      
      if (validation.isValid && validation.user) {
        // Valid token, inject user into request object
        req.user = validation.user;
      }
      
      next();
    } catch (error) {
      console.error('Optional token validation error:', error);
      // Continue without authentication on error
      next();
    }
  };

  /**
   * Middleware to check if user has required role (for future use)
   */
  requireRole = (requiredRole: string) => {
    return (req: Request, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      // For now, all authenticated users have access
      // In the future, this can be extended to check user roles
      next();
    };
  };

  /**
   * Middleware to check if user is admin (for future use)
   */
  requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // For now, all authenticated users have admin access
    // In the future, this can be extended to check admin status
    next();
  };
} 