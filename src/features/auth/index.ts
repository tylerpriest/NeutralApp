// NextAuth.js Service and Interfaces
import { NextAuthService } from './services/nextauth.service';
export { NextAuthService } from './services/nextauth.service';
export type { AuthUser, AuthResult, RegisterData } from './services/nextauth.service';
export type { INextAuthService, IAuthFeature } from './interfaces/nextauth.interface';

// Auth Feature Module
export class AuthFeature {
  private authService: NextAuthService;
  private ready: boolean = false;

  constructor() {
    this.authService = new NextAuthService();
  }

  /**
   * Initialize the auth feature
   */
  async initialize(): Promise<void> {
    try {
      // Check if NextAuth.js is available
      await this.authService.getSession();
      this.ready = true;
    } catch (error) {
      console.error('Auth feature initialization failed:', error);
      this.ready = false;
    }
  }

  /**
   * Check if auth feature is ready
   */
  isReady(): boolean {
    return this.ready;
  }

  /**
   * Get the authentication service
   */
  getAuthService(): NextAuthService {
    return this.authService;
  }
}

// Default export
export default AuthFeature; 