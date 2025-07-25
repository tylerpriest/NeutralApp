import { AuthenticationService } from '../../src/services/auth.service';
import { AuthResult, ValidationResult, User, UserMetadata } from '../../src/types';

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    signUp: jest.fn(),
    signInWithPassword: jest.fn(),
    signOut: jest.fn(),
    resetPasswordForEmail: jest.fn(),
    updateUser: jest.fn(),
    getUser: jest.fn(),
    onAuthStateChange: jest.fn(),
    getSession: jest.fn(),
  }
};

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('AuthenticationService', () => {
  let authService: AuthenticationService;

  beforeEach(() => {
    jest.clearAllMocks();
    authService = new AuthenticationService();
  });

  describe('signUp', () => {
    it('should successfully register a new user', async () => {
      const mockResponse = {
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            email_confirmed_at: null,
            created_at: '2024-01-01T00:00:00Z',
            last_sign_in_at: null,
            user_metadata: { displayName: 'Test User' }
          }
        },
        error: null
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue(mockResponse);

      const result = await authService.signUp('test@example.com', 'password123', { displayName: 'Test User' });

      expect(result.success).toBe(true);
      expect(result.user?.email).toBe('test@example.com');
      expect(result.requiresEmailVerification).toBe(true);
      expect(mockSupabaseClient.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: { displayName: 'Test User' }
        }
      });
    });

    it('should handle registration errors', async () => {
      const mockResponse = {
        data: { user: null },
        error: { message: 'Email already registered' }
      };

      mockSupabaseClient.auth.signUp.mockResolvedValue(mockResponse);

      const result = await authService.signUp('test@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Email already registered');
      expect(result.user).toBeUndefined();
    });

    it('should validate email format', async () => {
      const result = await authService.signUp('invalid-email', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Invalid email format');
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });

    it('should validate password strength', async () => {
      const result = await authService.signUp('test@example.com', '123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Password must be at least 8 characters');
      expect(mockSupabaseClient.auth.signUp).not.toHaveBeenCalled();
    });
  });

  describe('signIn', () => {
    it('should successfully authenticate user', async () => {
      const mockResponse = {
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            email_confirmed_at: '2024-01-01T00:00:00Z',
            created_at: '2024-01-01T00:00:00Z',
            last_sign_in_at: '2024-01-15T00:00:00Z',
            user_metadata: {}
          },
          session: {
            access_token: 'token-123',
            refresh_token: 'refresh-123'
          }
        },
        error: null
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue(mockResponse);

      const result = await authService.signIn('test@example.com', 'password123');

      expect(result.success).toBe(true);
      expect(result.user?.email).toBe('test@example.com');
      expect(result.user?.emailVerified).toBe(true);
      expect(mockSupabaseClient.auth.signInWithPassword).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123'
      });
    });

    it('should handle authentication errors', async () => {
      const mockResponse = {
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' }
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue(mockResponse);

      const result = await authService.signIn('test@example.com', 'wrongpassword');

      expect(result.success).toBe(false);
      expect(result.error).toBe('Invalid login credentials');
      expect(result.user).toBeUndefined();
    });

    it('should handle unverified email', async () => {
      const mockResponse = {
        data: {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            email_confirmed_at: null,
            created_at: '2024-01-01T00:00:00Z',
            last_sign_in_at: null,
            user_metadata: {}
          },
          session: null
        },
        error: null
      };

      mockSupabaseClient.auth.signInWithPassword.mockResolvedValue(mockResponse);

      const result = await authService.signIn('test@example.com', 'password123');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Email not verified');
      expect(result.requiresEmailVerification).toBe(true);
    });
  });

  describe('signOut', () => {
    it('should successfully sign out user', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });

      await authService.signOut();

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
    });

    it('should handle sign out errors gracefully', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({ 
        error: { message: 'Network error' } 
      });

      // Should not throw an error
      await expect(authService.signOut()).resolves.not.toThrow();
      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should send password reset email', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

      await authService.resetPassword('test@example.com');

      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com');
    });

    it('should handle reset password errors', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({
        error: { message: 'Email not found' }
      });

      await expect(authService.resetPassword('notfound@example.com')).rejects.toThrow('Email not found');
    });
  });

  describe('validateCredentials', () => {
    it('should validate email format', async () => {
      const result = await authService.validateCredentials('invalid-email', 'password123');

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid email format');
    });

         it('should validate password strength', async () => {
       const result = await authService.validateCredentials('test@example.com', '123');
 
       expect(result.isValid).toBe(false);
       expect(result.errors).toContain('Password must be at least 8 characters');
     });

         it('should validate strong password', async () => {
       const result = await authService.validateCredentials('test@example.com', 'password123');
 
       expect(result.isValid).toBe(true);
       expect(result.errors).toHaveLength(0);
     });
  });

  describe('getCurrentUser', () => {
    it('should return current user when authenticated', () => {
      // Set the current user directly for testing
      (authService as any).currentUser = {
        id: 'user-123',
        email: 'test@example.com',
        emailVerified: true,
        createdAt: new Date('2024-01-01'),
        lastLoginAt: new Date('2024-01-15'),
        settings: { theme: 'light', language: 'en', notifications: true },
        roles: []
      };

      const user = authService.getCurrentUser();
      
      expect(user).not.toBeNull();
      expect(user?.id).toBe('user-123');
      expect(user?.email).toBe('test@example.com');
    });

    it('should return null when not authenticated', () => {
      // Clear the current user for this test
      (authService as any).currentUser = null;

      const user = authService.getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe('sendEmailVerification', () => {
    it('should resend verification email', async () => {
      mockSupabaseClient.auth.resetPasswordForEmail.mockResolvedValue({ error: null });

      await authService.sendEmailVerification('test@example.com');

      expect(mockSupabaseClient.auth.resetPasswordForEmail).toHaveBeenCalledWith('test@example.com');
    });
  });
}); 