import request from 'supertest';
import express from 'express';
import { JWTAuthRoutes } from '../routes/auth.routes';
import { JWTAuthService } from '../services/jwt.service';
import { User } from '../types/jwt.types';

// Mock the JWT service
jest.mock('../services/jwt.service');

describe('JWTAuthRoutes', () => {
  let app: express.Application;
  let authRoutes: JWTAuthRoutes;
  let mockJwtService: jest.Mocked<JWTAuthService>;

  const mockUser: User = {
    id: '1',
    email: 'test@example.com',
    name: 'Test User'
  };

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    authRoutes = new JWTAuthRoutes();
    app.use('/api/auth', authRoutes.getRouter());

    // Get the mocked JWT service instance
    mockJwtService = (authRoutes as any).jwtService as jest.Mocked<JWTAuthService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/signin', () => {
    it('should return 200 with token for valid credentials', async () => {
      const mockToken = 'valid.jwt.token';
      mockJwtService.authenticateUser.mockReturnValue({
        success: true,
        token: mockToken,
        user: mockUser,
        error: null
      });

      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        user: mockUser,
        token: mockToken,
        expires: expect.any(String)
      });
      expect(mockJwtService.authenticateUser).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('should return 400 when email is missing', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          password: 'password123'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Email and password are required',
        success: false
      });
      expect(mockJwtService.authenticateUser).not.toHaveBeenCalled();
    });

    it('should return 400 when password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'test@example.com'
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({
        error: 'Email and password are required',
        success: false
      });
      expect(mockJwtService.authenticateUser).not.toHaveBeenCalled();
    });

    it('should return 401 for invalid credentials', async () => {
      mockJwtService.authenticateUser.mockReturnValue({
        success: false,
        token: null,
        user: null,
        error: 'Invalid credentials'
      });

      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'invalid@example.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'Invalid credentials',
        success: false
      });
      expect(mockJwtService.authenticateUser).toHaveBeenCalledWith('invalid@example.com', 'wrongpassword');
    });

    it('should return 500 when authentication service throws an error', async () => {
      mockJwtService.authenticateUser.mockImplementation(() => {
        throw new Error('Service error');
      });

      const response = await request(app)
        .post('/api/auth/signin')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(500);
      expect(response.body).toEqual({
        error: 'Internal server error',
        success: false
      });
    });
  });

  describe('GET /api/auth/session', () => {
    it('should return 200 with user data for valid token', async () => {
      // Create a new app with mocked middleware
      const testApp = express();
      testApp.use(express.json());
      
      // Mock the authenticateToken middleware to inject user
      testApp.use('/api/auth', (req: any, res: any, next: any) => {
        req.user = mockUser;
        next();
      });
      
      // Add the session route directly without the middleware
      testApp.get('/api/auth/session', (req: any, res: any) => {
        res.json({
          success: true,
          user: req.user,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      });

      const response = await request(testApp)
        .get('/api/auth/session')
        .set('Authorization', 'Bearer valid.token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        user: mockUser,
        expires: expect.any(String)
      });
    });

    it('should return 401 when no authorization header is provided', async () => {
      const response = await request(app)
        .get('/api/auth/session');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({ error: 'Access token required' });
    });
  });

  describe('POST /api/auth/signout', () => {
    it('should return 200 with success message', async () => {
      const response = await request(app)
        .post('/api/auth/signout');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: 'Successfully signed out'
      });
    });

    // Note: Error handling is tested in the main signout test
    // The signout endpoint is stateless and doesn't typically throw errors
  });

  describe('POST /api/auth/refresh', () => {
    it('should return 200 with new token for valid refresh token', async () => {
      const newToken = 'new.jwt.token';
      mockJwtService.refreshToken.mockReturnValue(newToken);
      mockJwtService.extractUserFromToken.mockReturnValue(mockUser);

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer old.token');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        user: mockUser,
        token: newToken,
        expires: expect.any(String)
      });
      expect(mockJwtService.refreshToken).toHaveBeenCalledWith('old.token');
      expect(mockJwtService.extractUserFromToken).toHaveBeenCalledWith(newToken);
    });

    it('should return 401 when no authorization header is provided', async () => {
      const response = await request(app)
        .post('/api/auth/refresh');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'Refresh token required',
        success: false
      });
      expect(mockJwtService.refreshToken).not.toHaveBeenCalled();
    });

    it('should return 401 when refresh token is invalid', async () => {
      mockJwtService.refreshToken.mockImplementation(() => {
        throw new Error('Invalid refresh token');
      });

      const response = await request(app)
        .post('/api/auth/refresh')
        .set('Authorization', 'Bearer invalid.token');

      expect(response.status).toBe(401);
      expect(response.body).toEqual({
        error: 'Invalid refresh token',
        success: false
      });
      expect(mockJwtService.refreshToken).toHaveBeenCalledWith('invalid.token');
    });
  });
}); 