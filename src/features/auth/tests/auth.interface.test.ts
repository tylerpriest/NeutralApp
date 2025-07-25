import { IAuthenticationService, ISessionManager } from '../interfaces/auth.interface';
import { AuthResult, ValidationResult, User, Session, UserProfile } from '../../../shared/types';

describe('Authentication Interfaces', () => {
  describe('IAuthenticationService', () => {
    it('should define signUp method with correct signature', () => {
      const mockService: IAuthenticationService = {
        signUp: jest.fn() as (email: string, password: string, metadata?: any) => Promise<AuthResult>,
        signIn: jest.fn() as (email: string, password: string) => Promise<AuthResult>,
        signOut: jest.fn() as () => Promise<void>,
        resetPassword: jest.fn() as (email: string) => Promise<void>,
        updatePassword: jest.fn() as (newPassword: string) => Promise<void>,
        getCurrentUser: jest.fn() as () => User | null,
        onAuthStateChange: jest.fn() as (callback: (user: User | null) => void) => () => void,
        validateCredentials: jest.fn() as (email: string, password: string) => Promise<ValidationResult>,
        displayRegistrationAndLogin: jest.fn() as () => void,
        sendEmailVerification: jest.fn() as (email: string) => Promise<void>,
      };

      expect(typeof mockService.signUp).toBe('function');
      expect(typeof mockService.signIn).toBe('function');
      expect(typeof mockService.signOut).toBe('function');
      expect(typeof mockService.resetPassword).toBe('function');
      expect(typeof mockService.updatePassword).toBe('function');
      expect(typeof mockService.getCurrentUser).toBe('function');
      expect(typeof mockService.onAuthStateChange).toBe('function');
      expect(typeof mockService.validateCredentials).toBe('function');
      expect(typeof mockService.displayRegistrationAndLogin).toBe('function');
      expect(typeof mockService.sendEmailVerification).toBe('function');
    });

    it('should validate AuthResult type structure', () => {
      const authResult: AuthResult = {
        success: true,
        user: {
          id: 'test-id',
          email: 'test@example.com',
          emailVerified: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          settings: { theme: 'light', language: 'en', notifications: true },
          roles: []
        }
      };

      expect(authResult.success).toBe(true);
      expect(authResult.user).toBeDefined();
      expect(authResult.user?.email).toBe('test@example.com');
    });

    it('should validate ValidationResult type structure', () => {
      const validationResult: ValidationResult = {
        isValid: false,
        errors: ['Password too weak', 'Email format invalid']
      };

      expect(validationResult.isValid).toBe(false);
      expect(Array.isArray(validationResult.errors)).toBe(true);
      expect(validationResult.errors.length).toBe(2);
    });
  });

  describe('ISessionManager', () => {
    it('should define session management methods with correct signatures', () => {
      const mockSessionManager: ISessionManager = {
        getSession: jest.fn() as () => Session | null,
        refreshSession: jest.fn() as () => Promise<Session | null>,
        isAuthenticated: jest.fn() as () => boolean,
        getUserProfile: jest.fn() as () => Promise<UserProfile | null>,
        handleSessionExpiry: jest.fn() as (intendedDestination?: string) => void,
        preserveDestination: jest.fn() as (path: string) => void,
        getPreservedDestination: jest.fn() as () => string | null,
        terminateSession: jest.fn() as () => Promise<void>,
        clearAuthTokens: jest.fn() as () => void,
      };

      expect(typeof mockSessionManager.getSession).toBe('function');
      expect(typeof mockSessionManager.refreshSession).toBe('function');
      expect(typeof mockSessionManager.isAuthenticated).toBe('function');
      expect(typeof mockSessionManager.getUserProfile).toBe('function');
      expect(typeof mockSessionManager.handleSessionExpiry).toBe('function');
      expect(typeof mockSessionManager.preserveDestination).toBe('function');
      expect(typeof mockSessionManager.getPreservedDestination).toBe('function');
      expect(typeof mockSessionManager.terminateSession).toBe('function');
      expect(typeof mockSessionManager.clearAuthTokens).toBe('function');
    });

    it('should validate Session type structure', () => {
      const session: Session = {
        user: {
          id: 'test-id',
          email: 'test@example.com',
          emailVerified: true,
          createdAt: new Date(),
          lastLoginAt: new Date(),
          settings: { theme: 'dark', language: 'en', notifications: false },
          roles: []
        },
        token: 'jwt-token-here',
        expiresAt: new Date(Date.now() + 3600000),
        refreshToken: 'refresh-token-here'
      };

      expect(session.user).toBeDefined();
      expect(typeof session.token).toBe('string');
      expect(session.expiresAt instanceof Date).toBe(true);
      expect(typeof session.refreshToken).toBe('string');
    });
  });
}); 