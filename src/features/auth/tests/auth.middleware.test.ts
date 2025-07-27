import { Request, Response, NextFunction } from 'express';
import { JWTAuthMiddleware } from '../middleware/auth.middleware';
import { JWTAuthService } from '../services/jwt.service';
import { User } from '../types/jwt.types';

// Mock the JWT service
jest.mock('../services/jwt.service');

describe('JWTAuthMiddleware', () => {
  let middleware: JWTAuthMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User'
  };

  beforeEach(() => {
    middleware = new JWTAuthMiddleware();
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    mockNext = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should call next() when valid token is provided', () => {
      const mockToken = 'valid.jwt.token';
      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`
      };

      // Mock the JWT service to return valid token
      const mockJwtService = middleware['jwtService'] as jest.Mocked<JWTAuthService>;
      mockJwtService.validateToken.mockReturnValue({
        isValid: true,
        user: mockUser,
        error: null
      });

      middleware.authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockJwtService.validateToken).toHaveBeenCalledWith(mockToken);
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 when no authorization header is provided', () => {
      mockRequest.headers = {};

      middleware.authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Access token required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when authorization header does not start with Bearer', () => {
      mockRequest.headers = {
        authorization: 'Invalid token'
      };

      middleware.authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Access token required' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token is invalid', () => {
      const mockToken = 'invalid.jwt.token';
      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`
      };

      const mockJwtService = middleware['jwtService'] as jest.Mocked<JWTAuthService>;
      mockJwtService.validateToken.mockReturnValue({
        isValid: false,
        user: null,
        error: 'Invalid token'
      });

      middleware.authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockJwtService.validateToken).toHaveBeenCalledWith(mockToken);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Invalid token' });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it('should return 401 when token validation throws an error', () => {
      const mockToken = 'error.jwt.token';
      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`
      };

      const mockJwtService = middleware['jwtService'] as jest.Mocked<JWTAuthService>;
      mockJwtService.validateToken.mockImplementation(() => {
        throw new Error('Token validation failed');
      });

      middleware.authenticateToken(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Token validation failed' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('optionalAuth', () => {
    it('should call next() when no token is provided', () => {
      mockRequest.headers = {};

      middleware.optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should inject user and call next() when valid token is provided', () => {
      const mockToken = 'valid.jwt.token';
      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`
      };

      const mockJwtService = middleware['jwtService'] as jest.Mocked<JWTAuthService>;
      mockJwtService.validateToken.mockReturnValue({
        isValid: true,
        user: mockUser,
        error: null
      });

      middleware.optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockJwtService.validateToken).toHaveBeenCalledWith(mockToken);
      expect(mockRequest.user).toEqual(mockUser);
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next() when invalid token is provided', () => {
      const mockToken = 'invalid.jwt.token';
      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`
      };

      const mockJwtService = middleware['jwtService'] as jest.Mocked<JWTAuthService>;
      mockJwtService.validateToken.mockReturnValue({
        isValid: false,
        user: null,
        error: 'Invalid token'
      });

      middleware.optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockJwtService.validateToken).toHaveBeenCalledWith(mockToken);
      expect(mockRequest.user).toBeUndefined();
      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should call next() when token validation throws an error', () => {
      const mockToken = 'error.jwt.token';
      mockRequest.headers = {
        authorization: `Bearer ${mockToken}`
      };

      const mockJwtService = middleware['jwtService'] as jest.Mocked<JWTAuthService>;
      mockJwtService.validateToken.mockImplementation(() => {
        throw new Error('Token validation failed');
      });

      middleware.optionalAuth(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe('requireRole', () => {
    it('should call next() when user is authenticated', () => {
      mockRequest.user = mockUser;

      const requireRole = middleware.requireRole('admin');
      requireRole(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      mockRequest.user = undefined;

      const requireRole = middleware.requireRole('admin');
      requireRole(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe('requireAdmin', () => {
    it('should call next() when user is authenticated', () => {
      mockRequest.user = mockUser;

      middleware.requireAdmin(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it('should return 401 when user is not authenticated', () => {
      mockRequest.user = undefined;

      middleware.requireAdmin(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Authentication required' });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });
}); 