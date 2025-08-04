import jwt from 'jsonwebtoken';
import { JWTAuthService } from '../services/jwt.service';
import { env } from '../../../shared/utils/environment-manager';

// Test environment JWT secrets (match test setup)
const testJWTSecret = 'test-jwt-secret-key-for-testing-only';
const testRefreshSecret = 'test-jwt-refresh-secret-key-for-testing-only';
const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  role: 'user' as const
};

describe('JWTAuthService', () => {
  let jwtService: JWTAuthService;

  beforeEach(() => {
    // Set up environment for testing
    process.env.NODE_ENV = 'test';
    // Force environment manager to reload configuration
    env.reload();
    jwtService = new JWTAuthService();
  });

  afterEach(() => {
    // Clean up environment
    if (process.env.NODE_ENV === 'test') {
      process.env.NODE_ENV = 'development';
    }
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token for valid credentials', () => {
      const token = jwtService.generateToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verify token can be decoded
      const decoded = jwt.verify(token, testJWTSecret) as any;
      expect(decoded.userId).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.name).toBe(mockUser.name);
      expect(decoded.role).toBe(mockUser.role);
    });

    it('should include expiration time in token', () => {
      const token = jwtService.generateToken(mockUser);
      const decoded = jwt.verify(token, testJWTSecret) as any;
      
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      
      // Check if expiration is set to 24 hours from now
      const expectedExp = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
      expect(decoded.exp).toBeGreaterThan(expectedExp - 60); // Allow 1 minute tolerance
      expect(decoded.exp).toBeLessThan(expectedExp + 60);
    });

    it('should use test environment JWT secret', () => {
      const token = jwtService.generateToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verify that we're using the test environment secret
      expect(() => jwt.verify(token, 'wrong-secret')).toThrow();
    });
  });

  describe('validateToken', () => {
    it('should validate a valid JWT token', () => {
      const token = jwtService.generateToken(mockUser);
      const result = jwtService.validateToken(token);
      
      expect(result.isValid).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('should reject an invalid JWT token', () => {
      const invalidToken = 'invalid.token.here';
      const result = jwtService.validateToken(invalidToken);
      
      expect(result.isValid).toBe(false);
      expect(result.user).toBeNull();
      expect(result.error).toBe('Invalid token');
    });

    it('should reject an expired JWT token', () => {
      // Create a token that expires immediately using test secret
      const expiredToken = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, name: mockUser.name, role: mockUser.role },
        testJWTSecret,
        { expiresIn: '0s' }
      );
      
      const result = jwtService.validateToken(expiredToken);
      
      expect(result.isValid).toBe(false);
      expect(result.user).toBeNull();
      expect(result.error).toBe('Token expired');
    });

    it('should reject a token with wrong secret', () => {
      const wrongSecretToken = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, name: mockUser.name, role: mockUser.role },
        'wrong-secret',
        { expiresIn: '24h' }
      );
      
      const result = jwtService.validateToken(wrongSecretToken);
      
      expect(result.isValid).toBe(false);
      expect(result.user).toBeNull();
      expect(result.error).toBe('Invalid token');
    });

    it('should use test environment JWT secret', () => {
      const token = jwtService.generateToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verify that we're using the test environment secret
      expect(() => jwt.verify(token, 'wrong-secret')).toThrow();
    });
  });

  describe('authenticateUser', () => {
    it('should authenticate user with valid credentials', () => {
      const result = jwtService.authenticateUser('test@example.com', 'password123');
      
      expect(result.success).toBe(true);
      expect(result.token).toBeDefined();
      expect(result.user).toEqual(mockUser);
      expect(result.error).toBeNull();
    });

    it('should reject invalid email', () => {
      const result = jwtService.authenticateUser('invalid@example.com', 'password123');
      
      expect(result.success).toBe(false);
      expect(result.token).toBeNull();
      expect(result.user).toBeNull();
      expect(result.error).toBe('Invalid credentials');
    });

    it('should reject invalid password', () => {
      const result = jwtService.authenticateUser('test@example.com', 'wrongpassword');
      
      expect(result.success).toBe(false);
      expect(result.token).toBeNull();
      expect(result.user).toBeNull();
      expect(result.error).toBe('Invalid credentials');
    });

    it('should reject empty credentials', () => {
      const result1 = jwtService.authenticateUser('', 'password123');
      const result2 = jwtService.authenticateUser('test@example.com', '');
      
      expect(result1.success).toBe(false);
      expect(result1.error).toBe('Email and password are required');
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Email and password are required');
    });

    it('should reject null/undefined credentials', () => {
      const result1 = jwtService.authenticateUser(null as any, 'password123');
      const result2 = jwtService.authenticateUser('test@example.com', undefined as any);
      
      expect(result1.success).toBe(false);
      expect(result1.error).toBe('Email and password are required');
      expect(result2.success).toBe(false);
      expect(result2.error).toBe('Email and password are required');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const refreshToken = jwtService.generateRefreshToken(mockUser);
      
      expect(refreshToken).toBeDefined();
      expect(typeof refreshToken).toBe('string');
      
      // Verify refresh token can be decoded with refresh secret
      const decoded = jwt.verify(refreshToken, testRefreshSecret) as any;
      expect(decoded.userId).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.name).toBe(mockUser.name);
      expect(decoded.role).toBe(mockUser.role);
    });
  });

  describe('refreshToken', () => {
    it('should refresh tokens using a valid refresh token', () => {
      const refreshToken = jwtService.generateRefreshToken(mockUser);
      const result = jwtService.refreshToken(refreshToken);
      
      expect(result).toBeDefined();
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(typeof result.accessToken).toBe('string');
      expect(typeof result.refreshToken).toBe('string');
      
      // Verify new access token is valid
      const validation = jwtService.validateToken(result.accessToken);
      expect(validation.isValid).toBe(true);
      expect(validation.user).toEqual(mockUser);
    });

    it('should throw error when refreshing with invalid refresh token', () => {
      const invalidToken = 'invalid.refresh.token';
      
      expect(() => jwtService.refreshToken(invalidToken)).toThrow('Invalid refresh token');
    });

    it('should throw error when refreshing with expired refresh token', () => {
      const expiredRefreshToken = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, name: mockUser.name, role: mockUser.role },
        testRefreshSecret,
        { expiresIn: '0s' }
      );
      
      expect(() => jwtService.refreshToken(expiredRefreshToken)).toThrow('Invalid refresh token');
    });
  });

  describe('revokeToken and isTokenRevoked', () => {
    it('should revoke a token and mark it as invalid', () => {
      const token = jwtService.generateToken(mockUser);
      
      // Token should be valid initially
      const initialValidation = jwtService.validateToken(token);
      expect(initialValidation.isValid).toBe(true);
      expect(jwtService.isTokenRevoked(token)).toBe(false);
      
      // Revoke the token
      jwtService.revokeToken(token);
      expect(jwtService.isTokenRevoked(token)).toBe(true);
      
      // Token should now be invalid
      const revokedValidation = jwtService.validateToken(token);
      expect(revokedValidation.isValid).toBe(false);
      expect(revokedValidation.error).toBe('Token revoked');
    });

    it('should not affect other tokens when revoking one', () => {
      // Create tokens for different users to ensure they're different
      const mockUser2 = {
        id: '2',
        email: 'test2@example.com',
        name: 'Test User 2',
        role: 'user' as const
      };
      
      const token1 = jwtService.generateToken(mockUser);
      const token2 = jwtService.generateToken(mockUser2);
      
      // Ensure tokens are different
      expect(token1).not.toBe(token2);
      
      // Both tokens should be valid initially
      expect(jwtService.validateToken(token1).isValid).toBe(true);
      expect(jwtService.validateToken(token2).isValid).toBe(true);
      
      // Revoke only token1
      jwtService.revokeToken(token1);
      
      // token1 should be revoked, token2 should still be valid
      expect(jwtService.isTokenRevoked(token1)).toBe(true);
      expect(jwtService.isTokenRevoked(token2)).toBe(false);
      expect(jwtService.validateToken(token1).isValid).toBe(false);
      expect(jwtService.validateToken(token2).isValid).toBe(true);
    });
  });

  describe('extractUserFromToken', () => {
    it('should extract user information from valid token', () => {
      const token = jwtService.generateToken(mockUser);
      const user = jwtService.extractUserFromToken(token);
      
      expect(user).toEqual(mockUser);
    });

    it('should throw error when extracting from invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => jwtService.extractUserFromToken(invalidToken)).toThrow('Invalid token');
    });

    it('should throw error when extracting from revoked token', () => {
      const token = jwtService.generateToken(mockUser);
      jwtService.revokeToken(token);
      
      expect(() => jwtService.extractUserFromToken(token)).toThrow('Token revoked');
    });
  });
}); 