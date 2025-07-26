import { signIn, signOut, getSession } from 'next-auth/react';

export interface AuthUser {
  id: string;
  email: string;
  name?: string | null;
  emailVerified?: Date | null;
}

export interface AuthResult {
  success: boolean;
  user?: AuthUser;
  error?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

/**
 * NextAuth.js Service - Wraps NextAuth.js functionality for the auth feature module
 * Provides a clean interface for authentication operations
 */
export class NextAuthService {
  /**
   * Sign in with email and password
   */
  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        return {
          success: false,
          error: result.error
        };
      }

      if (result?.ok) {
        const session = await getSession();
        return {
          success: true,
          user: session?.user || undefined
        };
      }

      return {
        success: false,
        error: 'Authentication failed'
      };
    } catch (error) {
      console.error('Sign in error:', error);
      return {
        success: false,
        error: 'Network error occurred'
      };
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<AuthResult> {
    try {
      await signOut({ redirect: false });
      return {
        success: true
      };
    } catch (error) {
      console.error('Sign out error:', error);
      return {
        success: false,
        error: 'Sign out failed'
      };
    }
  }

  /**
   * Register a new user (currently same as sign in for development)
   */
  async signUp(userData: RegisterData): Promise<AuthResult> {
    try {
      // For development, registration is the same as sign in
      // In production, you'd have a separate registration endpoint
      const result = await signIn('credentials', {
        email: userData.email,
        password: userData.password,
        redirect: false,
      });

      if (result?.error) {
        return {
          success: false,
          error: result.error
        };
      }

      if (result?.ok) {
        const session = await getSession();
        return {
          success: true,
          user: session?.user || undefined
        };
      }

      return {
        success: false,
        error: 'Registration failed'
      };
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: 'Network error occurred'
      };
    }
  }

  /**
   * Get current session
   */
  async getSession(): Promise<AuthUser | null> {
    try {
      const session = await getSession();
      return session?.user || null;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const session = await this.getSession();
    return !!session;
  }

  /**
   * Reset password (placeholder for future implementation)
   */
  async resetPassword(email: string): Promise<AuthResult> {
    try {
      // For now, just return success
      // In production, you'd call a password reset endpoint
      console.log('Password reset requested for:', email);
      return {
        success: true
      };
    } catch (error) {
      console.error('Password reset error:', error);
      return {
        success: false,
        error: 'Password reset failed'
      };
    }
  }
} 