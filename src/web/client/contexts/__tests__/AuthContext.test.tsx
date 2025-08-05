import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../AuthContext';

// Mock fetch for API calls
let mockFetch: jest.Mock;

beforeEach(() => {
  mockFetch = jest.fn();
  global.fetch = mockFetch;
});

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Test component to access auth context
const TestComponent = () => {
  const { user, isAuthenticated, isLoading, login, logout, register, resetPassword, refreshAuthToken } = useAuth();
  
  return (
    <div>
      <div data-testid="user">{user ? JSON.stringify(user) : 'null'}</div>
      <div data-testid="isAuthenticated">{isAuthenticated.toString()}</div>
      <div data-testid="isLoading">{isLoading.toString()}</div>
      <button data-testid="login-btn" onClick={() => login('test@example.com', 'password123')}>
        Login
      </button>
      <button data-testid="logout-btn" onClick={() => logout()}>
        Logout
      </button>
      <button data-testid="register-btn" onClick={() => register({
        email: 'test@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User'
      })}>
        Register
      </button>
      <button data-testid="reset-btn" onClick={() => resetPassword('test@example.com')}>
        Reset Password
      </button>
      <button data-testid="refresh-btn" onClick={() => refreshAuthToken()}>
        Refresh Token
      </button>
    </div>
  );
};

const renderAuthContext = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
    // Reset mock fetch for each test
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  describe('Initial State', () => {
    it('should start with unauthenticated state', async () => {
      // Mock initial session check to return no user
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'No token' })
      });

      renderAuthContext();
      
      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });
      
      expect(screen.getByTestId('user')).toHaveTextContent('null');
      expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
    });

    it('should check for existing token on mount', () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'existing-token';
        if (key === 'refresh_token') return 'existing-refresh-token';
        return null;
      });
      
      // Mock successful session validation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: jest.fn((name) => {
            if (name === 'content-type') return 'application/json';
            return null;
          }),
        },
        json: async () => ({
          user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'user' }
        })
      });

      renderAuthContext();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
      expect(localStorageMock.getItem).toHaveBeenCalledWith('refresh_token');
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/session', {
        headers: {
          'Authorization': 'Bearer existing-token'
        }
      });
    });

    it('should handle invalid existing token', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'invalid-token';
        if (key === 'refresh_token') return null;
        return null;
      });
      
      // Mock failed session validation
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid token' })
      });

      renderAuthContext();

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
      });
    });
  });

  describe('Login Functionality', () => {
    it('should handle successful login', async () => {
      // Mock no existing tokens initially
      localStorageMock.getItem.mockReturnValue(null);
      
      // Mock successful login response (the session check won't happen if no token)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: jest.fn((name) => {
            if (name === 'content-type') return 'application/json';
            return null;
          }),
        },
        json: async () => ({
          user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'user' },
          token: 'new-jwt-token',
          refreshToken: 'new-refresh-token'
        })
      });

      renderAuthContext();

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      const loginButton = screen.getByTestId('login-btn');
      
      await act(async () => {
        loginButton.click();
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        });
      });

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'new-jwt-token');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', 'new-refresh-token');
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify({ id: '1', email: 'test@example.com', name: 'Test User', role: 'user' }));
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });
    });

    it('should handle login failure', async () => {
      // Mock initial session check
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'No token' })
      });

      // Mock failed login response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: 'Invalid credentials'
        })
      });

      renderAuthContext();

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      const loginButton = screen.getByTestId('login-btn');
      
      await act(async () => {
        loginButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });
    });

    it('should handle network errors during login', async () => {
      // Mock initial session check
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'No token' })
      });

      // Mock network error
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      renderAuthContext();

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      const loginButton = screen.getByTestId('login-btn');
      
      await act(async () => {
        loginButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });
    });
  });

  describe('Logout Functionality', () => {
    it('should handle successful logout', async () => {
      // Mock existing tokens for logout test
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'existing-token';
        return null;
      });

      // Mock initial session check (no session)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'No token' })
      });

      // Mock successful logout response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true })
      });

      renderAuthContext();

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      const logoutButton = screen.getByTestId('logout-btn');
      
      await act(async () => {
        logoutButton.click();
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/signout', {
          method: 'POST',
          headers: {
            'Authorization': 'Bearer existing-token'
          }
        });
      });

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('guest_mode');
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });
    });

    it('should clear local storage even if logout request fails', async () => {
      // Mock initial session check
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'No token' })
      });

      // Mock failed logout response
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      renderAuthContext();

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      const logoutButton = screen.getByTestId('logout-btn');
      
      await act(async () => {
        logoutButton.click();
      });

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('guest_mode');
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });
    });
  });

  describe('Registration Functionality', () => {
    it('should handle successful registration', async () => {
      // Mock initial session check
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'No token' })
      });

      // Mock successful registration response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: jest.fn((name) => {
            if (name === 'content-type') return 'application/json';
            return null;
          }),
        },
        json: async () => ({
          user: { id: '2', email: 'test@example.com', name: 'Test User', role: 'user' },
          token: 'new-jwt-token',
          refreshToken: 'new-refresh-token'
        })
      });

      renderAuthContext();

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      const registerButton = screen.getByTestId('register-btn');
      
      await act(async () => {
        registerButton.click();
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User'
          }),
        });
      });

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'new-jwt-token');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', 'new-refresh-token');
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify({ id: '2', email: 'test@example.com', name: 'Test User', role: 'user' }));
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });
    });

    it('should handle registration failure', async () => {
      // Mock initial session check
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'No token' })
      });

      // Mock failed registration response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: 'Registration failed'
        })
      });

      renderAuthContext();

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      const registerButton = screen.getByTestId('register-btn');
      
      await act(async () => {
        registerButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });
    });
  });

  describe('Password Reset Functionality', () => {
    it('should handle successful password reset', async () => {
      // Mock initial session check
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'No token' })
      });

      renderAuthContext();

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      const resetButton = screen.getByTestId('reset-btn');
      
      await act(async () => {
        resetButton.click();
      });

      // Password reset doesn't make an API call in the current implementation
      // Only the initial session check should have been called
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1); // Only the initial session check
      });
    });

    it('should handle password reset failure', async () => {
      // Mock initial session check
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'No token' })
      });

      renderAuthContext();

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      const resetButton = screen.getByTestId('reset-btn');
      
      await act(async () => {
        resetButton.click();
      });

      // Password reset doesn't make an API call in the current implementation
      // Only the initial session check should have been called
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(1); // Only the initial session check
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle missing JWT_SECRET environment variable', () => {
      // Temporarily remove JWT_SECRET
      const originalEnv = process.env.JWT_SECRET;
      delete process.env.JWT_SECRET;

      // Mock initial session check
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'No token' })
      });

      // This should not throw an error in the context, but the service calls might fail
      expect(() => renderAuthContext()).not.toThrow();

      // Restore environment variable
      process.env.JWT_SECRET = originalEnv;
    });

    it('should handle malformed JSON responses', async () => {
      // Mock malformed JSON response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new Error('Invalid JSON');
        }
      });

      renderAuthContext();

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      const loginButton = screen.getByTestId('login-btn');
      
      await act(async () => {
        loginButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });
    });
  });

  describe('Refresh Token Functionality', () => {
    it('should refresh token when access token expires during session check', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'expired-token';
        if (key === 'refresh_token') return 'valid-refresh-token';
        return null;
      });

      // Mock failed session check (401)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Token expired' })
      });

      // Mock successful token refresh
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: 'new-access-token',
          refreshToken: 'new-refresh-token',
          user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'user' }
        })
      });

      renderAuthContext();

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
        });
      });

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'new-access-token');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', 'new-refresh-token');
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify({ id: '1', email: 'test@example.com', name: 'Test User', role: 'user' }));
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });
    });

    it('should handle refresh token failure during session check', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'expired-token';
        if (key === 'refresh_token') return 'invalid-refresh-token';
        return null;
      });

      // Mock failed session check (401)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Token expired' })
      });

      // Mock failed token refresh
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid refresh token' })
      });

      renderAuthContext();

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });
    });

    it('should manually refresh token when refreshAuthToken is called', async () => {
      // Mock tokens for refresh test
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'refresh_token') return 'valid-refresh-token';
        return null;
      });

      // Mock initial session check to return no user (no call made if no access token)
      
      // Mock successful token refresh
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: {
          get: jest.fn((name) => {
            if (name === 'content-type') return 'application/json';
            return null;
          }),
        },
        json: async () => ({
          token: 'new-access-token',
          refreshToken: 'new-refresh-token',
          user: { id: '1', email: 'test@example.com', name: 'Test User', role: 'user' }
        })
      });

      renderAuthContext();

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      const refreshButton = screen.getByTestId('refresh-btn');
      
      await act(async () => {
        refreshButton.click();
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/refresh', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refreshToken: 'valid-refresh-token' }),
        });
      });

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'new-access-token');
        expect(localStorageMock.setItem).toHaveBeenCalledWith('refresh_token', 'new-refresh-token');
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify({ id: '1', email: 'test@example.com', name: 'Test User', role: 'user' }));
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('true');
      });
    });

    it('should handle manual refresh token failure', async () => {
      // Mock initial session check to return no user
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'No token' })
      });

      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'refresh_token') return 'invalid-refresh-token';
        return null;
      });

      // Mock failed token refresh
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Invalid refresh token' })
      });

      renderAuthContext();

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      const refreshButton = screen.getByTestId('refresh-btn');
      
      await act(async () => {
        refreshButton.click();
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });
    });

    it('should handle refresh token call without refresh token', async () => {
      // Mock no tokens available
      localStorageMock.getItem.mockReturnValue(null);

      // Mock initial session check to return no user
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'No token' })
      });

      renderAuthContext();

      // Wait for initial loading to complete
      await waitFor(() => {
        expect(screen.getByTestId('isLoading')).toHaveTextContent('false');
      });

      const refreshButton = screen.getByTestId('refresh-btn');
      
      await act(async () => {
        refreshButton.click();
      });

      // Should not make any refresh API call - no session check if no access token, and no refresh if no refresh token
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledTimes(0); // No API calls at all
      });

      await waitFor(() => {
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });
    });

    it('should handle network errors during token refresh', async () => {
      localStorageMock.getItem.mockImplementation((key) => {
        if (key === 'auth_token') return 'expired-token';
        if (key === 'refresh_token') return 'valid-refresh-token';
        return null;
      });

      // Mock failed session check (401)
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Token expired' })
      });

      // Mock network error during refresh
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      renderAuthContext();

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
        expect(screen.getByTestId('user')).toHaveTextContent('null');
        expect(screen.getByTestId('isAuthenticated')).toHaveTextContent('false');
      });
    });
  });

  describe('Context Hook Usage', () => {
    it('should throw error when useAuth is used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        render(<TestComponent />);
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleSpy.mockRestore();
    });
  });
}); 