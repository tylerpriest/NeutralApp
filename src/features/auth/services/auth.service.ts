import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { IAuthenticationService } from '../interfaces/auth.interface';
import { AuthResult, ValidationResult, User, UserMetadata } from '../../../shared';

export class AuthenticationService implements IAuthenticationService {
  private supabase: SupabaseClient;
  private currentUser: User | null = null;

  constructor() {
    // TODO: Get these from environment variables
    const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
    
    // Initialize current user state asynchronously
    this.initializeAuth().catch(console.error);
  }

  public async initializeAuth(): Promise<void> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      if (user && !error) {
        this.currentUser = this.mapSupabaseUserToUser(user);
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    }
  }

  private mapSupabaseUserToUser(supabaseUser: any): User {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      displayName: supabaseUser.user_metadata?.displayName || undefined,
      emailVerified: !!supabaseUser.email_confirmed_at,
      createdAt: new Date(supabaseUser.created_at),
      lastLoginAt: supabaseUser.last_sign_in_at ? new Date(supabaseUser.last_sign_in_at) : new Date(),
      settings: {
        theme: supabaseUser.user_metadata?.theme || 'light',
        language: supabaseUser.user_metadata?.language || 'en',
        notifications: supabaseUser.user_metadata?.notifications ?? true,
        ...supabaseUser.user_metadata
      },
      roles: supabaseUser.user_metadata?.roles || []
    };
  }

  async signUp(email: string, password: string, metadata?: UserMetadata): Promise<AuthResult> {
    try {
      // Validate inputs first
      const validation = await this.validateCredentials(email, password);
      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(', ')
        };
      }

      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata || {}
        }
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      if (data.user) {
        const user = this.mapSupabaseUserToUser(data.user);
        return {
          success: true,
          user,
          requiresEmailVerification: !user.emailVerified
        };
      }

      return {
        success: false,
        error: 'Registration failed'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  async signIn(email: string, password: string): Promise<AuthResult> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return {
          success: false,
          error: error.message
        };
      }

      if (data.user) {
        const user = this.mapSupabaseUserToUser(data.user);
        
        // Check if email is verified
        if (!user.emailVerified) {
          return {
            success: false,
            error: 'Email not verified. Please check your email for verification link.',
            requiresEmailVerification: true
          };
        }

        this.currentUser = user;
        return {
          success: true,
          user
        };
      }

      return {
        success: false,
        error: 'Authentication failed'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  }

  async signOut(): Promise<void> {
    try {
      await this.supabase.auth.signOut();
      this.currentUser = null;
    } catch (error) {
      // Log error but don't throw - signOut should be graceful
      console.error('Error during sign out:', error);
      this.currentUser = null;
    }
  }

  async resetPassword(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    if (error) {
      throw new Error(error.message);
    }
  }

  async updatePassword(newPassword: string): Promise<void> {
    const { error } = await this.supabase.auth.updateUser({
      password: newPassword
    });
    if (error) {
      throw new Error(error.message);
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  onAuthStateChange(callback: (user: User | null) => void): () => void {
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        this.currentUser = this.mapSupabaseUserToUser(session.user);
        callback(this.currentUser);
      } else {
        this.currentUser = null;
        callback(null);
      }
    });

    return () => subscription.unsubscribe();
  }

  async validateCredentials(email: string, password: string): Promise<ValidationResult> {
    const errors: string[] = [];

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      errors.push('Invalid email format');
    }

    // Validate password strength
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  displayRegistrationAndLogin(): void {
    // This method would trigger UI display logic
    // For now, just log - UI implementation will come later
    console.log('Displaying registration and login UI');
  }

  async sendEmailVerification(email: string): Promise<void> {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email);
    if (error) {
      throw new Error(error.message);
    }
  }
}