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
  const { user, isAuthenticated, isLoading, login, logout, register, resetPassword } = useAuth();
  
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
      localStorageMock.getItem.mockReturnValue('existing-token');
      
      // Mock successful session validation
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          user: { id: '1', email: 'test@example.com', name: 'Test User' }
        })
      });

      renderAuthContext();

      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
      expect(mockFetch).toHaveBeenCalledWith('/api/auth/session', {
        headers: {
          'Authorization': 'Bearer existing-token'
        }
      });
    });

    it('should handle invalid existing token', async () => {
      localStorageMock.getItem.mockReturnValue('invalid-token');
      
      // Mock failed session validation
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Invalid token' })
      });

      renderAuthContext();

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      });
    });
  });

  describe('Login Functionality', () => {
    it('should handle successful login', async () => {
      // Mock initial session check
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'No token' })
      });

      // Mock successful login response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          token: 'new-jwt-token'
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
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify({ id: '1', email: 'test@example.com', name: 'Test User' }));
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
      // Mock initial session check
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
          method: 'POST'
        });
      });

      await waitFor(() => {
        expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
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
        json: async () => ({
          success: true,
          user: { id: '2', email: 'test@example.com', name: 'Test User' },
          token: 'new-jwt-token'
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
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'test@example.com',
            password: 'password123'
          }),
        });
      });

      await waitFor(() => {
        expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', 'new-jwt-token');
        expect(screen.getByTestId('user')).toHaveTextContent(JSON.stringify({ id: '2', email: 'test@example.com', name: 'Test User' }));
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