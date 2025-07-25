import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { ISessionManager } from '../interfaces/auth.interface';
import { Session, UserProfile } from '../types';

export class SessionManager implements ISessionManager {
  private supabase: SupabaseClient;
  private currentSession: Session | null = null;

  constructor() {
    // TODO: Get these from environment variables
    const supabaseUrl = process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || 'placeholder-key';
    
    this.supabase = createClient(supabaseUrl, supabaseKey);
    
    // Initialize session state asynchronously
    this.initializeSession().catch(console.error);
  }

  private async initializeSession(): Promise<void> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession();
      if (session && !error) {
        this.currentSession = this.mapSupabaseSessionToSession(session);
      }
    } catch (error) {
      console.error('Error initializing session:', error);
    }
  }

  private mapSupabaseSessionToSession(supabaseSession: any): Session {
    return {
      user: {
        id: supabaseSession.user.id,
        email: supabaseSession.user.email,
        emailVerified: !!supabaseSession.user.email_confirmed_at,
        createdAt: new Date(supabaseSession.user.created_at),
        lastLoginAt: supabaseSession.user.last_sign_in_at ? new Date(supabaseSession.user.last_sign_in_at) : new Date(),
        settings: {
          theme: supabaseSession.user.user_metadata?.theme || 'light',
          language: supabaseSession.user.user_metadata?.language || 'en',
          notifications: supabaseSession.user.user_metadata?.notifications ?? true,
          ...supabaseSession.user.user_metadata
        },
        roles: supabaseSession.user.user_metadata?.roles || []
      },
      token: supabaseSession.access_token,
      expiresAt: new Date(supabaseSession.expires_at * 1000),
      refreshToken: supabaseSession.refresh_token
    };
  }

  getSession(): Session | null {
    return this.currentSession;
  }

  async refreshSession(): Promise<Session | null> {
    try {
      const { data: { session }, error } = await this.supabase.auth.refreshSession();
      
      if (error || !session) {
        this.currentSession = null;
        return null;
      }

      this.currentSession = this.mapSupabaseSessionToSession(session);
      return this.currentSession;
    } catch (error) {
      console.error('Error refreshing session:', error);
      this.currentSession = null;
      return null;
    }
  }

  isAuthenticated(): boolean {
    if (!this.currentSession) {
      return false;
    }

    // Check if session is expired
    if (this.currentSession.expiresAt <= new Date()) {
      this.currentSession = null;
      return false;
    }

    return true;
  }

  async getUserProfile(): Promise<UserProfile | null> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();
      
      if (error || !user) {
        return null;
      }

      return {
        id: user.id,
        email: user.email || '',
        displayName: user.user_metadata?.displayName,
        avatar: user.user_metadata?.avatar,
        settings: {
          theme: user.user_metadata?.theme || 'light',
          language: user.user_metadata?.language || 'en',
          notifications: user.user_metadata?.notifications ?? true,
          ...user.user_metadata
        }
      };
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  handleSessionExpiry(intendedDestination?: string): void {
    // Clear current session
    this.currentSession = null;

    // Preserve intended destination if provided
    if (intendedDestination) {
      this.preserveDestination(intendedDestination);
    }

    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.replace('/login');
    }
  }

  preserveDestination(path: string): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('intendedDestination', path);
    }
  }

  getPreservedDestination(): string | null {
    if (typeof window !== 'undefined' && window.localStorage) {
      const destination = localStorage.getItem('intendedDestination');
      if (destination) {
        localStorage.removeItem('intendedDestination');
        return destination;
      }
    }
    return null;
  }

  async terminateSession(): Promise<void> {
    try {
      await this.supabase.auth.signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
    } finally {
      // Always clear session data, even if signOut fails
      this.currentSession = null;
      this.clearAuthTokens();
      
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.clear();
      }
    }
  }

  clearAuthTokens(): void {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('intendedDestination');
    }
  }
} 