import jwt from 'jsonwebtoken';
import { 
  User, 
  JWTPayload, 
  TokenValidationResult, 
  AuthenticationResult,
  JWTAuthServiceInterface 
} from '../types/jwt.types';

export class JWTAuthService implements JWTAuthServiceInterface {
  private readonly jwtSecret: string;
  private readonly tokenExpiration: string = '30d';

  // Test user credentials (in production, this would come from a database)
  private readonly testUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User'
  };

  constructor() {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }
    this.jwtSecret = secret;
  }

  /**
   * Generate a JWT token for a user
   */
  generateToken(user: User): string {
    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    // Create payload object for JWT
    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name
    };

    return (jwt as any).sign(payload, this.jwtSecret, {
      expiresIn: this.tokenExpiration
    });
  }

  /**
   * Validate a JWT token and return user information
   */
  validateToken(token: string): TokenValidationResult {
    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;
      
      const user: User = {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name
      };

      return {
        isValid: true,
        user,
        error: null
      };
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        return {
          isValid: false,
          user: null,
          error: 'Token expired'
        };
      } else if (error instanceof jwt.JsonWebTokenError) {
        return {
          isValid: false,
          user: null,
          error: 'Invalid token'
        };
      } else {
        return {
          isValid: false,
          user: null,
          error: 'Token validation failed'
        };
      }
    }
  }

  /**
   * Authenticate user with email and password
   */
  authenticateUser(email: string, password: string): AuthenticationResult {
    // Validate input
    if (!email || !password) {
      return {
        success: false,
        token: null,
        user: null,
        error: 'Email and password are required'
      };
    }

    // Check against test credentials
    if (email === this.testUser.email && password === 'password123') {
      const token = this.generateToken(this.testUser);
      
      return {
        success: true,
        token,
        user: this.testUser,
        error: null
      };
    }

    return {
      success: false,
      token: null,
      user: null,
      error: 'Invalid credentials'
    };
  }

  /**
   * Refresh a JWT token
   */
  refreshToken(token: string): string {
    const validation = this.validateToken(token);
    
    if (!validation.isValid || !validation.user) {
      throw new Error(validation.error || 'Invalid token');
    }

    return this.generateToken(validation.user);
  }

  /**
   * Extract user information from a JWT token
   */
  extractUserFromToken(token: string): User {
    const validation = this.validateToken(token);
    
    if (!validation.isValid || !validation.user) {
      throw new Error(validation.error || 'Invalid token');
    }

    return validation.user;
  }
} 