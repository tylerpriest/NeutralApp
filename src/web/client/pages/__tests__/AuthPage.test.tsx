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
      const mockSignIn = require('next-auth/react').signIn;
      mockSignIn.mockResolvedValue({ ok: true, error: null });

      renderAuthPage();
      
      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'password123',
          redirect: false,
        });
      });
    });

    it('should handle login failure', async () => {
      const mockSignIn = require('next-auth/react').signIn;
      mockSignIn.mockResolvedValue({ ok: false, error: 'Invalid credentials' });

      renderAuthPage();
      
      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSignIn).toHaveBeenCalledWith('credentials', {
          email: 'test@example.com',
          password: 'wrongpassword',
          redirect: false,
        });
      });
    });
  });

  describe('Register Mode', () => {
    it('should switch to register mode', () => {
      renderAuthPage();
      
      const signUpButton = screen.getByText('Don\'t have an account? Sign up');
      fireEvent.click(signUpButton);

      expect(screen.getByText('Create your account to get started')).toBeInTheDocument();
      expect(screen.getByPlaceholder('First Name')).toBeInTheDocument();
      expect(screen.getByPlaceholder('Last Name')).toBeInTheDocument();
      expect(screen.getByPlaceholder('Confirm Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    });

    it('should handle successful registration', async () => {
      const mockSignIn = require('next-auth/react').signIn;
      mockSignIn.mockResolvedValue({ ok: true, error: null });

      renderAuthPage();
      
      // Switch to register mode
      const signUpButton = screen.getByText('Don\'t have an account? Sign up');
      fireEvent.click(signUpButton);

      const firstNameInput = screen.getByPlaceholder('First Name');
      const lastNameInput = screen.getByPlaceholder('Last Name');
      const emailInput = screen.getByPlaceholder('Email Address');
      const passwordInput = screen.getByPlaceholder('Password');
      const confirmPasswordInput = screen.getByPlaceholder('Confirm Password');
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
      expect(screen.getByPlaceholder('Email Address')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Send Reset Link' })).toBeInTheDocument();
    });

    it('should handle successful password reset', async () => {
      renderAuthPage();
      
      // Switch to reset mode
      const resetButton = screen.getByText('Forgot your password?');
      fireEvent.click(resetButton);

      const emailInput = screen.getByPlaceholder('Email Address');
      const submitButton = screen.getByRole('button', { name: 'Send Reset Link' });

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
  });

  describe('Loading States', () => {
    it('should show loading state during form submission', async () => {
      const mockSignIn = require('next-auth/react').signIn;
      mockSignIn.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve({ ok: true }), 100)));

      renderAuthPage();
      
      const emailInput = screen.getByPlaceholder('Email Address');
      const passwordInput = screen.getByPlaceholder('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(screen.getByText('Signing in...')).toBeInTheDocument();
    });
  });
}); 