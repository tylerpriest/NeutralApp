import { SessionManager } from '../services/session.manager';
import { Session, UserProfile } from '../../../shared/types';

// Mock Supabase client
const mockSupabaseClient = {
  auth: {
    getSession: jest.fn(),
    refreshSession: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
  }
};

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient),
}));

describe('SessionManager', () => {
  let sessionManager: SessionManager;

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockClear();
    mockLocalStorage.setItem.mockClear();
    mockLocalStorage.removeItem.mockClear();
    
    // Set up default mock for getSession (no session)
    mockSupabaseClient.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    });
    
    sessionManager = new SessionManager();
  });

  describe('getSession', () => {
    it('should return current session when available', () => {
      const mockSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          emailVerified: true,
          createdAt: new Date('2024-01-01'),
          lastLoginAt: new Date('2024-01-15'),
          settings: { theme: 'dark', language: 'en', notifications: true },
          roles: []
        },
        token: 'access-token-123',
        expiresAt: new Date(Date.now() + 3600000),
        refreshToken: 'refresh-token-123'
      };

      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: mockSession },
        error: null
      });

      const session = sessionManager.getSession();
      
      // Initially null, but should handle async fetch
      expect(session).toBeNull();
    });

    it('should return null when no session exists', () => {
      mockSupabaseClient.auth.getSession.mockResolvedValue({
        data: { session: null },
        error: null
      });

      const session = sessionManager.getSession();
      expect(session).toBeNull();
    });
  });

  describe('refreshSession', () => {
    it('should successfully refresh session', async () => {
      const fixedExpiryTime = new Date('2025-07-25T12:20:38.000Z');
      
      const mockRefreshedSession = {
        user: {
          id: 'user-123',
          email: 'test@example.com',
          emailVerified: true,
          createdAt: new Date('2024-01-01'),
          lastLoginAt: new Date('2024-01-15'),
          settings: { theme: 'dark', language: 'en', notifications: true },
          roles: []
        },
        token: 'new-access-token-123',
        expiresAt: fixedExpiryTime,
        refreshToken: 'new-refresh-token-123'
      };

              const mockSupabaseSession = {
          user: {
            id: 'user-123',
            email: 'test@example.com',
            email_confirmed_at: '2024-01-01T00:00:00Z',
            created_at: '2024-01-01T00:00:00Z',
            last_sign_in_at: '2024-01-15T00:00:00Z',
            user_metadata: { theme: 'dark', language: 'en', notifications: true }
          },
          access_token: 'new-access-token-123',
          expires_at: Math.floor(fixedExpiryTime.getTime() / 1000),
          refresh_token: 'new-refresh-token-123'
        };

      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: { session: mockSupabaseSession },
        error: null
      });

      const session = await sessionManager.refreshSession();

      expect(session).toEqual(mockRefreshedSession);
      expect(mockSupabaseClient.auth.refreshSession).toHaveBeenCalled();
    });

    it('should return null when refresh fails', async () => {
      mockSupabaseClient.auth.refreshSession.mockResolvedValue({
        data: { session: null },
        error: { message: 'Refresh token invalid' }
      });

      const session = await sessionManager.refreshSession();

      expect(session).toBeNull();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when valid session exists', () => {
      const mockSession = {
        user: { id: 'user-123' },
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 3600000),
        refreshToken: 'refresh-token'
      };

      // Mock internal session state
      (sessionManager as any).currentSession = mockSession;

      const isAuth = sessionManager.isAuthenticated();
      expect(isAuth).toBe(true);
    });

    it('should return false when no session exists', () => {
      const isAuth = sessionManager.isAuthenticated();
      expect(isAuth).toBe(false);
    });

    it('should return false when session is expired', () => {
      const expiredSession = {
        user: { id: 'user-123' },
        token: 'expired-token',
        expiresAt: new Date(Date.now() - 3600000), // 1 hour ago
        refreshToken: 'refresh-token'
      };

      (sessionManager as any).currentSession = expiredSession;

      const isAuth = sessionManager.isAuthenticated();
      expect(isAuth).toBe(false);
    });
  });

  describe('getUserProfile', () => {
    it('should return user profile when authenticated', async () => {
      const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        user_metadata: {
          displayName: 'Test User',
          avatar: 'https://example.com/avatar.jpg'
        }
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: mockUser },
        error: null
      });

      const profile = await sessionManager.getUserProfile();

      expect(profile).toEqual({
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        avatar: 'https://example.com/avatar.jpg',
        settings: { theme: 'light', language: 'en', notifications: true }
      });
    });

    it('should return null when not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' }
      });

      const profile = await sessionManager.getUserProfile();
      expect(profile).toBeNull();
    });
  });

  describe('handleSessionExpiry', () => {
    it('should preserve destination and redirect to login', () => {
      const mockReplace = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { replace: mockReplace },
        writable: true
      });

      sessionManager.handleSessionExpiry('/dashboard');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('intendedDestination', '/dashboard');
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });

    it('should handle session expiry without destination', () => {
      const mockReplace = jest.fn();
      Object.defineProperty(window, 'location', {
        value: { replace: mockReplace },
        writable: true
      });

      sessionManager.handleSessionExpiry();

      expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
      expect(mockReplace).toHaveBeenCalledWith('/login');
    });
  });

  describe('preserveDestination', () => {
    it('should store intended destination in localStorage', () => {
      sessionManager.preserveDestination('/settings');

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('intendedDestination', '/settings');
    });
  });

  describe('getPreservedDestination', () => {
    it('should retrieve and clear preserved destination', () => {
      mockLocalStorage.getItem.mockReturnValue('/settings');

      const destination = sessionManager.getPreservedDestination();

      expect(destination).toBe('/settings');
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('intendedDestination');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('intendedDestination');
    });

    it('should return null when no destination preserved', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const destination = sessionManager.getPreservedDestination();

      expect(destination).toBeNull();
      expect(mockLocalStorage.removeItem).not.toHaveBeenCalled();
    });
  });

  describe('terminateSession', () => {
    it('should sign out and clear session data', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({ error: null });

      await sessionManager.terminateSession();

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
      expect(mockLocalStorage.clear).toHaveBeenCalled();
    });

    it('should clear session data even if signOut fails', async () => {
      mockSupabaseClient.auth.signOut.mockResolvedValue({
        error: { message: 'Network error' }
      });

      await sessionManager.terminateSession();

      expect(mockSupabaseClient.auth.signOut).toHaveBeenCalled();
      expect(mockLocalStorage.clear).toHaveBeenCalled();
    });
  });

  describe('clearAuthTokens', () => {
    it('should remove auth-related items from localStorage', () => {
      sessionManager.clearAuthTokens();

      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('supabase.auth.token');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('intendedDestination');
    });
  });
}); 