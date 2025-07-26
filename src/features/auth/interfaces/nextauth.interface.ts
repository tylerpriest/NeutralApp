import { AuthUser, AuthResult, RegisterData } from '../services/nextauth.service';

/**
 * NextAuth.js Interface - Defines the contract for authentication operations
 * Provides a clean abstraction layer for the auth feature module
 */
export interface INextAuthService {
  /**
   * Sign in with email and password
   */
  signIn(email: string, password: string): Promise<AuthResult>;

  /**
   * Sign out the current user
   */
  signOut(): Promise<AuthResult>;

  /**
   * Register a new user
   */
  signUp(userData: RegisterData): Promise<AuthResult>;

  /**
   * Get current session
   */
  getSession(): Promise<AuthUser | null>;

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): Promise<boolean>;

  /**
   * Reset password
   */
  resetPassword(email: string): Promise<AuthResult>;
}

/**
 * Auth Feature Interface - High-level interface for the auth feature module
 */
export interface IAuthFeature {
  /**
   * Authentication service
   */
  readonly authService: INextAuthService;

  /**
   * Initialize the auth feature
   */
  initialize(): Promise<void>;

  /**
   * Check if auth feature is ready
   */
  isReady(): boolean;
} 