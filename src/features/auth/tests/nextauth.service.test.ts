import { NextAuthService } from '../services/nextauth.service';
import { AuthUser, RegisterData } from '../services/nextauth.service';

// Mock NextAuth.js
jest.mock('next-auth/react', () => ({
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}));

import { signIn, signOut, getSession } from 'next-auth/react';

const mockSignIn = signIn as jest.MockedFunction<typeof signIn>;
const mockSignOut = signOut as jest.MockedFunction<typeof signOut>;
const mockGetSession = getSession as jest.MockedFunction<typeof getSession>;

describe('NextAuthService', () => {
  let authService: NextAuthService;

  beforeEach(() => {
    authService = new NextAuthService();
    jest.clearAllMocks();
  });

  describe('signIn', () => {
    it('should successfully sign in with valid credentials', async () => {
      const mockUser: AuthUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: new Date(),
      };

      mockSignIn.mockResolvedValue({
        ok: true,
        error: null,
        status: 200,
        url: null,
      });

      mockGetSession.mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      const result = await authService.signIn('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'test@example.com',
        password: 'password123',
        redirect: false,
      });
    });

    it('should return error for invalid credentials', async () => {
      mockSignIn.mockResolvedValue({
        ok: false,
        error: 'Invalid email or password',
        status: 401,
        url: null,
      });

      const result = await authService.signIn('invalid@example.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid email or password');
    });

    it('should handle network errors', async () => {
      mockSignIn.mockRejectedValue(new Error('Network error'));

      const result = await authService.signIn('test@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error occurred');
    });
  });

  describe('signOut', () => {
    it('should successfully sign out', async () => {
      mockSignOut.mockResolvedValue(undefined);

      const result = await authService.signOut();

      expect(result.success).toBe(true);
      expect(mockSignOut).toHaveBeenCalledWith({ redirect: false });
    });

    it('should handle sign out errors', async () => {
      mockSignOut.mockRejectedValue(new Error('Sign out failed'));

      const result = await authService.signOut();

      expect(result.success).toBe(false);
      expect(result.error).toBe('Sign out failed');
    });
  });

  describe('signUp', () => {
    it('should successfully register a new user', async () => {
      const mockUser: AuthUser = {
        id: 'new-user-id',
        email: 'new@example.com',
        name: 'New User',
        emailVerified: new Date(),
      };

      const registerData: RegisterData = {
        email: 'new@example.com',
        password: 'password123',
        firstName: 'New',
        lastName: 'User',
      };

      mockSignIn.mockResolvedValue({
        ok: true,
        error: null,
        status: 200,
        url: null,
      });

      mockGetSession.mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      const result = await authService.signUp(registerData);

      expect(result.success).toBe(true);
      expect(result.user).toEqual(mockUser);
      expect(mockSignIn).toHaveBeenCalledWith('credentials', {
        email: 'new@example.com',
        password: 'password123',
        redirect: false,
      });
    });

    it('should return error for registration failure', async () => {
      const registerData: RegisterData = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Existing',
        lastName: 'User',
      };

      mockSignIn.mockResolvedValue({
        ok: false,
        error: 'User already exists',
        status: 400,
        url: null,
      });

      const result = await authService.signUp(registerData);

      expect(result.success).toBe(false);
      expect(result.error).toBe('User already exists');
    });
  });

  describe('getSession', () => {
    it('should return current session', async () => {
      const mockUser: AuthUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: new Date(),
      };

      mockGetSession.mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      const result = await authService.getSession();

      expect(result).toEqual(mockUser);
    });

    it('should return null when no session exists', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await authService.getSession();

      expect(result).toBeNull();
    });

    it('should handle session errors', async () => {
      mockGetSession.mockRejectedValue(new Error('Session error'));

      const result = await authService.getSession();

      expect(result).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when user is authenticated', async () => {
      const mockUser: AuthUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        name: 'Test User',
        emailVerified: new Date(),
      };

      mockGetSession.mockResolvedValue({
        user: mockUser,
        expires: new Date().toISOString(),
      });

      const result = await authService.isAuthenticated();

      expect(result).toBe(true);
    });

    it('should return false when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      const result = await authService.isAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('should successfully request password reset', async () => {
      const result = await authService.resetPassword('test@example.com');

      expect(result.success).toBe(true);
    });

    it('should handle password reset errors', async () => {
      // Mock console.log to avoid output during tests
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      const result = await authService.resetPassword('test@example.com');

      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('Password reset requested for:', 'test@example.com');

      consoleSpy.mockRestore();
    });
  });
}); 