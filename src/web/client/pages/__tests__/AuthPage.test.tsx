import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AuthPage from '../AuthPage';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock fetch for API calls
const mockFetch = jest.fn();
global.fetch = mockFetch;

const renderAuthPage = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <AuthPage />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AuthPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  describe('Login Mode', () => {
    it('should render login form by default', () => {
      renderAuthPage();
      
      expect(screen.getByText('NeutralApp')).toBeInTheDocument();
      expect(screen.getByText('Welcome back! Please sign in to continue')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });

    it('should handle successful login', async () => {
      // Mock successful login response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          user: { id: '1', email: 'test@example.com', name: 'Test User' },
          token: 'mock-jwt-token'
        })
      });

      renderAuthPage();
      
      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);
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
    });

    it('should handle login failure', async () => {
      // Mock failed login response
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          error: 'Invalid email or password'
        })
      });

      renderAuthPage();
      
      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
      });
    });

    it('should display demo credentials box in login mode', () => {
      renderAuthPage();
      
      expect(screen.getByText('Demo Credentials')).toBeInTheDocument();
      expect(screen.getByText('Use these credentials for testing:')).toBeInTheDocument();
      expect(screen.getByText('Test User:')).toBeInTheDocument();
      expect(screen.getByText('Development User:')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('any-valid-email@example.com')).toBeInTheDocument();
      
      // Check for password123 in both sections (use getAllByText since it appears twice)
      const passwordElements = screen.getAllByText('password123');
      expect(passwordElements).toHaveLength(2);
    });
  });

  describe('Register Mode', () => {
    it('should switch to register mode', () => {
      renderAuthPage();
      
      const signUpButton = screen.getByText('Don\'t have an account? Sign up');
      fireEvent.click(signUpButton);

      expect(screen.getByText('Create your account to get started')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    });

    it('should handle successful registration', async () => {
      // Mock successful registration response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          user: { id: '2', email: 'john@example.com', name: 'John Doe' },
          token: 'mock-jwt-token'
        })
      });

      renderAuthPage();
      
      // Switch to register mode
      const signUpButton = screen.getByText('Don\'t have an account? Sign up');
      fireEvent.click(signUpButton);

      const firstNameInput = screen.getByPlaceholderText('First Name');
      const lastNameInput = screen.getByPlaceholderText('Last Name');
      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      const submitButton = screen.getByRole('button', { name: 'Create Account' });

      await act(async () => {
        fireEvent.change(firstNameInput, { target: { value: 'John' } });
        fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
        fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/signin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            email: 'john@example.com', 
            password: 'password123'
          }),
        });
      });
    });
  });

  describe('Reset Password Mode', () => {
    it('should switch to reset password mode', () => {
      renderAuthPage();
      
      const resetButton = screen.getByText('Forgot your password?');
      fireEvent.click(resetButton);

      expect(screen.getByText('Reset your password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Send Reset Email' })).toBeInTheDocument();
    });

    it('should handle successful password reset', async () => {
      // Mock successful password reset response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Password reset email sent'
        })
      });

      renderAuthPage();
      
      // Switch to reset mode
      const resetButton = screen.getByText('Forgot your password?');
      fireEvent.click(resetButton);

      const emailInput = screen.getByPlaceholderText('Email Address');
      const submitButton = screen.getByRole('button', { name: 'Send Reset Email' });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Password reset email sent successfully')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate between modes', () => {
      renderAuthPage();
      
      // Start in login mode
      expect(screen.getByText('Welcome back! Please sign in to continue')).toBeInTheDocument();
      
      // Switch to register mode
      const signUpButton = screen.getByText('Don\'t have an account? Sign up');
      fireEvent.click(signUpButton);
      expect(screen.getByText('Create your account to get started')).toBeInTheDocument();
      
      // Switch back to login mode
      const signInButton = screen.getByText('Already have an account? Sign in');
      fireEvent.click(signInButton);
      expect(screen.getByText('Welcome back! Please sign in to continue')).toBeInTheDocument();
    });

    it('should hide demo credentials box in non-login modes', () => {
      renderAuthPage();
      
      // Demo credentials should be visible in login mode
      expect(screen.getByText('Demo Credentials')).toBeInTheDocument();
      
      // Switch to register mode
      const signUpButton = screen.getByText('Don\'t have an account? Sign up');
      fireEvent.click(signUpButton);
      
      // Demo credentials should be hidden
      expect(screen.queryByText('Demo Credentials')).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading state during form submission', async () => {
      // Mock a delayed response
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({ success: true, user: { id: '1', email: 'test@example.com' }, token: 'mock-token' })
          }), 100)
        )
      );

      renderAuthPage();
      
      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);
      });

      // Should show loading state
      expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });
  });
}); 