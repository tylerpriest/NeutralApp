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
      expect(screen.getByText('Please sign in to continue')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
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
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

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
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Authentication failed. Please try again.')).toBeInTheDocument();
      });
    });

    it('should display demo credentials box in login mode', () => {
      renderAuthPage();
      
      expect(screen.getByText('Demo Credentials')).toBeInTheDocument();
      expect(screen.getByText('Use these credentials for testing:')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
      expect(screen.getByText('password123')).toBeInTheDocument();
    });
  });

  describe('Registration Mode', () => {
    it('should render registration form', () => {
      renderAuthPage();
      
      // Switch to register mode
      const signUpButton = screen.getByText(/Don't have an account\?/);
      fireEvent.click(signUpButton);

      expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
      expect(screen.getByText('Sign up to get started')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
      expect(screen.getAllByPlaceholderText(/Password/)).toHaveLength(2);
      expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
    });

    it('should handle successful registration', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          user: { id: '1', email: 'new@example.com', name: 'New User' },
          token: 'mock-jwt-token'
        })
      });

      renderAuthPage();
      
      // Switch to register mode
      const signUpButton = screen.getByText(/Don't have an account\?/);
      fireEvent.click(signUpButton);

      const firstNameInput = screen.getByPlaceholderText('First Name');
      const lastNameInput = screen.getByPlaceholderText('Last Name');
      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInputs = screen.getAllByPlaceholderText(/Password/);
      const submitButton = screen.getByRole('button', { name: /Create Account/i });

      await act(async () => {
        fireEvent.change(firstNameInput, { target: { value: 'John' } });
        fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
        fireEvent.change(emailInput, { target: { value: 'new@example.com' } });
        fireEvent.change(passwordInputs[0]!, { target: { value: 'password123' } });
        fireEvent.change(passwordInputs[1]!, { target: { value: 'password123' } });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: 'new@example.com',
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe'
          }),
        });
      });
    });
  });

  describe('Password Reset Mode', () => {
    it('should render password reset form', () => {
      renderAuthPage();
      
      // Switch to reset mode
      const resetButton = screen.getByText(/Forgot your password\?/);
      fireEvent.click(resetButton);

      expect(screen.getByText('Reset Password')).toBeInTheDocument();
      expect(screen.getByText('Enter your email to reset your password')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Password')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeInTheDocument();
    });

    it('should handle successful password reset', async () => {
      renderAuthPage();
      
      // Switch to reset mode
      const resetButton = screen.getByText(/Forgot your password\?/);
      fireEvent.click(resetButton);

      const emailInput = screen.getByPlaceholderText('Email Address');
      const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.click(submitButton);
      });

      await waitFor(() => {
        expect(screen.getByText('Password reset email sent! Please check your inbox.')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate between modes', () => {
      renderAuthPage();
      
      // Start in login mode
      expect(screen.getByText('Please sign in to continue')).toBeInTheDocument();
      
      // Switch to register mode
      const signUpButton = screen.getByText(/Don't have an account\?/);
      fireEvent.click(signUpButton);
      expect(screen.getByText('Sign up to get started')).toBeInTheDocument();
      
      // Switch back to login mode
      const signInButton = screen.getByText(/Already have an account\?/);
      fireEvent.click(signInButton);
      expect(screen.getByText('Please sign in to continue')).toBeInTheDocument();
      
      // Switch to reset mode
      const resetButton = screen.getByText(/Forgot your password\?/);
      fireEvent.click(resetButton);
      expect(screen.getByText('Enter your email to reset your password')).toBeInTheDocument();
      
      // Switch back to login mode
      const backToSignInButton = screen.getByText(/Remember your password\?/);
      fireEvent.click(backToSignInButton);
      expect(screen.getByText('Please sign in to continue')).toBeInTheDocument();
    });

    it('should show demo credentials box in all modes', () => {
      renderAuthPage();
      
      // Demo credentials should be visible in login mode
      expect(screen.getByText('Demo Credentials')).toBeInTheDocument();
      
      // Switch to register mode
      const signUpButton = screen.getByText(/Don't have an account\?/);
      fireEvent.click(signUpButton);
      
      // Demo credentials should still be visible
      expect(screen.getByText('Demo Credentials')).toBeInTheDocument();
      
      // Go back to login mode first
      const signInButton = screen.getByText(/Already have an account\?/);
      fireEvent.click(signInButton);
      
      // Switch to reset mode
      const resetButton = screen.getByText(/Forgot your password\?/);
      fireEvent.click(resetButton);
      
      // Demo credentials should still be visible
      expect(screen.getByText('Demo Credentials')).toBeInTheDocument();
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
      const submitButton = screen.getByRole('button', { name: /Sign In/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      // Click the button and immediately check for disabled state
      fireEvent.click(submitButton);
      
      // Should show loading state - check for disabled button
      expect(submitButton).toBeDisabled();
    });
  });
}); 