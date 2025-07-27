import jwt from 'jsonwebtoken';
import { JWTAuthService } from '../services/jwt.service';

// Mock environment variables
const mockJWTSecret = 'test-secret-key';
const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User'
};

describe('JWTAuthService', () => {
  let jwtService: JWTAuthService;

  beforeEach(() => {
    // Set up environment variables for testing
    process.env.JWT_SECRET = mockJWTSecret;
    jwtService = new JWTAuthService();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe('generateToken', () => {
    it('should generate a valid JWT token for valid credentials', () => {
      const token = jwtService.generateToken(mockUser);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      
      // Verify token can be decoded
      const decoded = jwt.verify(token, mockJWTSecret) as any;
      expect(decoded.userId).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.name).toBe(mockUser.name);
    });

    it('should include expiration time in token', () => {
      const token = jwtService.generateToken(mockUser);
      const decoded = jwt.verify(token, mockJWTSecret) as any;
      
      expect(decoded.exp).toBeDefined();
      expect(decoded.iat).toBeDefined();
      
      // Check if expiration is set to 30 days from now
      const expectedExp = Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60);
      expect(decoded.exp).toBeGreaterThan(expectedExp - 60); // Allow 1 minute tolerance
      expect(decoded.exp).toBeLessThan(expectedExp + 60);
    });

    it('should throw error if JWT_SECRET is not configured', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      
      expect(() => new JWTAuthService()).toThrow('JWT_SECRET not configured');
      
      // Restore the secret
      if (originalSecret) {
        process.env.JWT_SECRET = originalSecret;
      }
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
      // Create a token that expires immediately
      const expiredToken = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, name: mockUser.name },
        mockJWTSecret,
        { expiresIn: '0s' }
      );
      
      const result = jwtService.validateToken(expiredToken);
      
      expect(result.isValid).toBe(false);
      expect(result.user).toBeNull();
      expect(result.error).toBe('Token expired');
    });

    it('should reject a token with wrong secret', () => {
      const wrongSecretToken = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, name: mockUser.name },
        'wrong-secret',
        { expiresIn: '30d' }
      );
      
      const result = jwtService.validateToken(wrongSecretToken);
      
      expect(result.isValid).toBe(false);
      expect(result.user).toBeNull();
      expect(result.error).toBe('Invalid token');
    });

    it('should throw error if JWT_SECRET is not configured', () => {
      const originalSecret = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;
      
      expect(() => new JWTAuthService()).toThrow('JWT_SECRET not configured');
      
      // Restore the secret
      if (originalSecret) {
        process.env.JWT_SECRET = originalSecret;
      }
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

  describe('refreshToken', () => {
    it('should refresh a valid token', () => {
      const originalToken = jwtService.generateToken(mockUser);
      const refreshedToken = jwtService.refreshToken(originalToken);
      
      expect(refreshedToken).toBeDefined();
      expect(typeof refreshedToken).toBe('string');
      
      // Verify refreshed token is valid
      const result = jwtService.validateToken(refreshedToken);
      expect(result.isValid).toBe(true);
      expect(result.user).toEqual(mockUser);
    });

    it('should throw error when refreshing invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => jwtService.refreshToken(invalidToken)).toThrow('Invalid token');
    });

    it('should throw error when refreshing expired token', () => {
      const expiredToken = jwt.sign(
        { userId: mockUser.id, email: mockUser.email, name: mockUser.name },
        mockJWTSecret,
        { expiresIn: '0s' }
      );
      
      expect(() => jwtService.refreshToken(expiredToken)).toThrow('Token expired');
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
  });
}); 