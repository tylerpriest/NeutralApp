import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../contexts/AuthContext';
import AuthPage from '../AuthPage';

// Mock the auth context
const mockLogin = jest.fn();
const mockRegister = jest.fn();
const mockResetPassword = jest.fn();

jest.mock('../../contexts/AuthContext', () => ({
  ...jest.requireActual('../../contexts/AuthContext'),
  useAuth: () => ({
    isAuthenticated: false,
    isLoading: false,
    login: mockLogin,
    register: mockRegister,
    resetPassword: mockResetPassword,
    logout: jest.fn(),
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const renderWithProviders = (component: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {component}
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('AuthPage', () => {
  beforeEach(() => {
    jest.resetModules();
    jest.clearAllMocks();
  });

  describe('Login Mode', () => {
    it('should render login form by default', () => {
      renderWithProviders(<AuthPage />);
      
      expect(screen.getByText('NeutralApp')).toBeInTheDocument();
      expect(screen.getByText('Welcome back! Please sign in to continue')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Email Address')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });

    it('should validate required fields', async () => {
      renderWithProviders(<AuthPage />);
      
      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
      });
    });

    it('should validate email format', async () => {
      renderWithProviders(<AuthPage />);
      
      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const form = screen.getByRole('form');
      
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      
      fireEvent.submit(form);

      await waitFor(() => {
        expect(screen.getByText('Please enter a valid email address')).toBeInTheDocument();
      });
    });

    it('should handle successful login', async () => {
      mockLogin.mockResolvedValue(true);
      renderWithProviders(<AuthPage />);
      
      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(screen.getByText('Login successful! Redirecting...')).toBeInTheDocument();
      });
    });

    it('should handle login failure', async () => {
      mockLogin.mockResolvedValue(false);
      renderWithProviders(<AuthPage />);
      
      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid email or password')).toBeInTheDocument();
      });
    });
  });

  describe('Register Mode', () => {
    it('should switch to register mode', () => {
      renderWithProviders(<AuthPage />);
      
      const registerLink = screen.getByText("Don't have an account? Sign up");
      fireEvent.click(registerLink);

      expect(screen.getByText('Create your account to get started')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('First Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Last Name')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirm Password')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Create Account' })).toBeInTheDocument();
    });

    it('should validate registration fields', async () => {
      renderWithProviders(<AuthPage />);
      
      // Switch to register mode
      const registerLink = screen.getByText("Don't have an account? Sign up");
      fireEvent.click(registerLink);

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('First name is required')).toBeInTheDocument();
        expect(screen.getByText('Last name is required')).toBeInTheDocument();
        expect(screen.getByText('Email is required')).toBeInTheDocument();
        expect(screen.getByText('Password is required')).toBeInTheDocument();
        expect(screen.getByText('Please confirm your password')).toBeInTheDocument();
      });
    });

    it('should validate password confirmation', async () => {
      renderWithProviders(<AuthPage />);
      
      // Switch to register mode
      const registerLink = screen.getByText("Don't have an account? Sign up");
      fireEvent.click(registerLink);

      const passwordInput = screen.getByPlaceholderText('Password');
      const confirmPasswordInput = screen.getByPlaceholderText('Confirm Password');
      
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.change(confirmPasswordInput, { target: { value: 'different' } });

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
      });
    });

    it('should handle successful registration', async () => {
      mockRegister.mockResolvedValue(true);
      renderWithProviders(<AuthPage />);
      
      // Switch to register mode
      const registerLink = screen.getByText("Don't have an account? Sign up");
      fireEvent.click(registerLink);

      // Fill form
      fireEvent.change(screen.getByPlaceholderText('First Name'), { target: { value: 'John' } });
      fireEvent.change(screen.getByPlaceholderText('Last Name'), { target: { value: 'Doe' } });
      fireEvent.change(screen.getByPlaceholderText('Email Address'), { target: { value: 'john@example.com' } });
      fireEvent.change(screen.getByPlaceholderText('Password'), { target: { value: 'password123' } });
      fireEvent.change(screen.getByPlaceholderText('Confirm Password'), { target: { value: 'password123' } });

      const submitButton = screen.getByRole('button', { name: 'Create Account' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith({
          email: 'john@example.com',
          password: 'password123',
          firstName: 'John',
          lastName: 'Doe'
        });
        expect(screen.getByText('Registration successful! Please check your email for verification.')).toBeInTheDocument();
      });
    });
  });

  describe('Reset Password Mode', () => {
    it('should switch to reset password mode', () => {
      renderWithProviders(<AuthPage />);
      
      const resetLink = screen.getByText('Forgot your password?');
      fireEvent.click(resetLink);

      expect(screen.getByText('Reset your password')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('Password')).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Send Reset Email' })).toBeInTheDocument();
    });

    it('should handle successful password reset', async () => {
      mockResetPassword.mockResolvedValue(true);
      renderWithProviders(<AuthPage />);
      
      // Switch to reset mode
      const resetLink = screen.getByText('Forgot your password?');
      fireEvent.click(resetLink);

      const emailInput = screen.getByPlaceholderText('Email Address');
      const form = screen.getByRole('form');
      
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.submit(form);

      await waitFor(() => {
        expect(mockResetPassword).toHaveBeenCalledWith('test@example.com');
      });

      await waitFor(() => {
        expect(screen.getByText('Password reset email sent! Please check your inbox.')).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should navigate between modes', () => {
      renderWithProviders(<AuthPage />);
      
      // Start in login mode
      expect(screen.getByText('Welcome back! Please sign in to continue')).toBeInTheDocument();
      
      // Switch to register
      fireEvent.click(screen.getByText("Don't have an account? Sign up"));
      expect(screen.getByText('Create your account to get started')).toBeInTheDocument();
      
      // Switch back to login
      fireEvent.click(screen.getByText('Already have an account? Sign in'));
      expect(screen.getByText('Welcome back! Please sign in to continue')).toBeInTheDocument();
      
      // Switch to reset
      fireEvent.click(screen.getByText('Forgot your password?'));
      expect(screen.getByText('Reset your password')).toBeInTheDocument();
      
      // Switch back to login
      fireEvent.click(screen.getByText('Back to sign in'));
      expect(screen.getByText('Welcome back! Please sign in to continue')).toBeInTheDocument();
    });
  });

  describe('Loading States', () => {
    it('should show loading state during form submission', async () => {
      mockLogin.mockImplementation(() => new Promise(resolve => setTimeout(() => resolve(true), 100)));
      renderWithProviders(<AuthPage />);
      
      const emailInput = screen.getByPlaceholderText('Email Address');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Sign In' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  describe('Error Handling', () => {
    it('should clear field errors when user starts typing', async () => {
      renderWithProviders(<AuthPage />);
      
      const submitButton = screen.getByRole('button', { name: 'Sign In' });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Email is required')).toBeInTheDocument();
      });

      const emailInput = screen.getByPlaceholderText('Email Address');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
    });
  });
}); 