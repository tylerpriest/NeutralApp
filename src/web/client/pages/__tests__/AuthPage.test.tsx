import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { SessionProvider } from 'next-auth/react';
import AuthPage from '../AuthPage';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock NextAuth.js
jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  useSession: () => ({ data: null, status: 'unauthenticated' }),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

const renderAuthPage = () => {
  return render(
    <BrowserRouter>
      <SessionProvider>
        <AuthProvider>
          <AuthPage />
        </AuthProvider>
      </SessionProvider>
    </BrowserRouter>
  );
};

describe('AuthPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
      renderAuthPage();
      
      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Login successful! Redirecting...')).toBeInTheDocument();
      });
    });

    it('should handle login failure', async () => {
      renderAuthPage();
      
      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

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
      const mockSignIn = require('next-auth/react').signIn;
      mockSignIn.mockResolvedValue({ ok: true, error: null });

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

      fireEvent.change(firstNameInput, { target: { value: 'John' } });
      fireEvent.change(lastNameInput, { target: { value: 'Doe' } });
      fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'john@example.com',
          password: 'password123',
          redirect: false,
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
      renderAuthPage();
      
      // Switch to reset mode
      const resetButton = screen.getByText('Forgot your password?');
      fireEvent.click(resetButton);

      const emailInput = screen.getByPlaceholderText('Email Address');
      const submitButton = screen.getByRole('button', { name: 'Send Reset Email' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Password reset email sent! Please check your inbox.')).toBeInTheDocument();
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
      
      // Switch to register mode - demo credentials should be hidden
      const signUpButton = screen.getByText('Don\'t have an account? Sign up');
      fireEvent.click(signUpButton);
      expect(screen.queryByText('Demo Credentials')).not.toBeInTheDocument();
      
      // Switch to reset mode - demo credentials should be hidden
      const signInButton = screen.getByText('Already have an account? Sign in');
      fireEvent.click(signInButton);
      expect(screen.getByText('Demo Credentials')).toBeInTheDocument();
      
      const resetButton = screen.getByText('Forgot your password?');
      fireEvent.click(resetButton);
      expect(screen.queryByText('Demo Credentials')).not.toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading state during form submission', async () => {
      const mockSignIn = require('next-auth/react').signIn;
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100)));

      renderAuthPage();
      
      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });
}); 