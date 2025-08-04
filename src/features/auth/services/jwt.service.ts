import jwt from 'jsonwebtoken';
import { 
  User, 
  JWTPayload, 
  TokenValidationResult, 
  AuthenticationResult,
  JWTAuthServiceInterface,
  RefreshTokenResult 
} from '../types/jwt.types';
import { env } from '../../../shared/utils/environment-manager';

export class JWTAuthService implements JWTAuthServiceInterface {
  private readonly jwtSecret: string;
  private readonly refreshSecret: string;
  private readonly tokenExpiration: string = '24h';
  private readonly refreshTokenExpiration: string = '7d';
  private readonly revokedTokens: Set<string> = new Set();

  // Test user credentials (in production, this would come from a database)
  private readonly testUsers: User[] = [
    {
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      role: 'user'
    },
    {
      id: 'admin1',
      email: 'admin@example.com',
      name: 'System Administrator',
      role: 'admin'
    }
  ];

  constructor() {
    const secret = env.get('JWT_SECRET');
    const refreshSecret = env.get('JWT_REFRESH_SECRET');
    
    if (!secret) {
      throw new Error('JWT_SECRET not configured');
    }
    if (!refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET not configured');
    }
    
    this.jwtSecret = secret;
    this.refreshSecret = refreshSecret;
  }

  /**
   * Generate a JWT access token for a user
   */
  generateToken(user: User): string {
    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    // Create payload object for JWT
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    return jwt.sign(payload, this.jwtSecret, {
      expiresIn: this.tokenExpiration
    } as jwt.SignOptions);
  }

  /**
   * Generate a refresh token for a user  
   */
  generateRefreshToken(user: User): string {
    if (!this.refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET not configured');
    }

    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    return jwt.sign(payload, this.refreshSecret, {
      expiresIn: this.refreshTokenExpiration
    } as jwt.SignOptions);
  }

  /**
   * Validate a JWT token and return user information
   */
  validateToken(token: string): TokenValidationResult {
    if (!this.jwtSecret) {
      throw new Error('JWT_SECRET not configured');
    }

    // Check if token is revoked
    if (this.isTokenRevoked(token)) {
      return {
        isValid: false,
        user: null,
        error: 'Token revoked'
      };
    }

    try {
      const decoded = jwt.verify(token, this.jwtSecret) as JWTPayload;
      
      const user: User = {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
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
    const user = this.testUsers.find(u => u.email === email);
    if (user && password === 'password123') {
      const token = this.generateToken(user);
      
      return {
        success: true,
        token,
        user: user,
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
   * Refresh JWT tokens using a refresh token
   */
  refreshToken(refreshToken: string): RefreshTokenResult {
    if (!this.refreshSecret) {
      throw new Error('JWT_REFRESH_SECRET not configured');
    }

    try {
      const decoded = jwt.verify(refreshToken, this.refreshSecret) as JWTPayload;
      
      const user: User = {
        id: decoded.userId,
        email: decoded.email,
        name: decoded.name,
        role: decoded.role
      };

      const newAccessToken = this.generateToken(user);
      const newRefreshToken = this.generateRefreshToken(user);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
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

  /**
   * Revoke a token (add to blacklist)
   */
  revokeToken(token: string): void {
    this.revokedTokens.add(token);
  }

  /**
   * Check if a token is revoked
   */
  isTokenRevoked(token: string): boolean {
    return this.revokedTokens.has(token);
  }
} 