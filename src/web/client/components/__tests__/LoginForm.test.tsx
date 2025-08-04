import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { LoginForm } from '../LoginForm';

// Mock Lucide React icons
jest.mock('lucide-react', () => ({
  Mail: () => <div data-testid="mail-icon" />,
  Lock: () => <div data-testid="lock-icon" />,
  Eye: () => <div data-testid="eye-icon" />,
  EyeOff: () => <div data-testid="eyeoff-icon" />,
  ArrowRight: () => <div data-testid="arrow-right-icon" />
}));

describe('LoginForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnForgotPassword = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    onSubmit: mockOnSubmit,
  };

  describe('Rendering', () => {
    it('renders login form with all required fields', () => {
      render(<LoginForm {...defaultProps} />);

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByRole('textbox', { name: /email address/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });

    it('renders email and password input fields with proper attributes', () => {
      render(<LoginForm {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);

      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('placeholder', 'Enter your email');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('placeholder', 'Enter your password');
    });

    it('renders forgot password link when provided', () => {
      render(<LoginForm {...defaultProps} onForgotPassword={mockOnForgotPassword} />);

      expect(screen.getByRole('button', { name: /forgot your password/i })).toBeInTheDocument();
    });

    it('does not render forgot password link when not provided', () => {
      render(<LoginForm {...defaultProps} />);

      expect(screen.queryByRole('button', { name: /forgot your password/i })).not.toBeInTheDocument();
    });

    it('renders error message when error prop is provided', () => {
      const errorMessage = 'Invalid credentials';
      render(<LoginForm {...defaultProps} error={errorMessage} />);

      expect(screen.getByRole('alert')).toHaveTextContent(errorMessage);
    });

    it('shows loading state when isLoading is true', () => {
      render(<LoginForm {...defaultProps} isLoading={true} />);

      expect(screen.getByRole('button', { name: /signing in/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/email address/i)).toBeDisabled();
      expect(screen.getByLabelText(/^password$/i)).toBeDisabled();
    });
  });

  describe('Form Validation', () => {
    it('shows validation error for empty email', async () => {
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Focus and blur email field without entering text
      await user.click(emailInput);
      await user.tab(); // This will trigger blur

      expect(screen.getByText(/email is required/i)).toBeInTheDocument();

      // Try to submit form
      await user.click(submitButton);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows validation error for invalid email format', async () => {
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email address/i);

      await user.type(emailInput, 'invalid-email');
      await user.tab(); // Trigger blur

      expect(screen.getByText(/please enter a valid email address/i)).toBeInTheDocument();
    });

    it('shows validation error for empty password', async () => {
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);

      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // Focus and blur password field without entering text
      await user.click(passwordInput);
      await user.tab();

      expect(screen.getByText(/password is required/i)).toBeInTheDocument();

      // Try to submit form
      await user.click(submitButton);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('shows validation error for short password', async () => {
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);

      const passwordInput = screen.getByLabelText(/^password$/i);

      await user.type(passwordInput, '123');
      await user.tab();

      expect(screen.getByText(/password must be at least 8 characters long/i)).toBeInTheDocument();
    });

    it('clears field errors when user starts typing after validation error', async () => {
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email address/i);

      // Trigger validation error
      await user.click(emailInput);
      await user.tab();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();

      // Start typing to clear error
      await user.type(emailInput, 't');
      expect(screen.queryByText(/email is required/i)).not.toBeInTheDocument();
    });

    it('validates form on submit and prevents submission with invalid data', async () => {
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.click(submitButton);

      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Password Visibility Toggle', () => {
    it('toggles password visibility when eye button is clicked', async () => {
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);

      const passwordInput = screen.getByLabelText(/^password$/i);
      const toggleButton = screen.getByRole('button', { name: /show password/i });

      // Initially password should be hidden
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument();

      // Click to show password
      await user.click(toggleButton);

      expect(passwordInput).toHaveAttribute('type', 'text');
      expect(screen.getByTestId('eyeoff-icon')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /hide password/i })).toBeInTheDocument();

      // Click to hide password again
      await user.click(toggleButton);

      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(screen.getByTestId('eye-icon')).toBeInTheDocument();
    });

    it('disables password toggle button when form is loading', () => {
      render(<LoginForm {...defaultProps} isLoading={true} />);

      const toggleButton = screen.getByRole('button', { name: /show password/i });
      expect(toggleButton).toBeDisabled();
    });
  });

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup();
      mockOnSubmit.mockResolvedValue(undefined);
      
      render(<LoginForm {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith('test@example.com', 'password123');
    });

    it('does not submit form with invalid data', async () => {
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);

      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.click(submitButton);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('handles submission errors gracefully', async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      mockOnSubmit.mockRejectedValue(new Error('Network error'));
      
      render(<LoginForm {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Login form submission error:', expect.any(Error));
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Forgot Password', () => {
    it('calls onForgotPassword when forgot password link is clicked', async () => {
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} onForgotPassword={mockOnForgotPassword} />);

      const forgotPasswordButton = screen.getByRole('button', { name: /forgot your password/i });
      await user.click(forgotPasswordButton);

      expect(mockOnForgotPassword).toHaveBeenCalledTimes(1);
    });

    it('disables forgot password button when form is loading', () => {
      render(<LoginForm {...defaultProps} onForgotPassword={mockOnForgotPassword} isLoading={true} />);

      const forgotPasswordButton = screen.getByRole('button', { name: /forgot your password/i });
      expect(forgotPasswordButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA attributes for form fields', () => {
      render(<LoginForm {...defaultProps} error="Login failed" />);

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password$/i);

      expect(emailInput).toHaveAttribute('aria-invalid', 'false');
      expect(passwordInput).toHaveAttribute('aria-invalid', 'false');
    });

    it('sets aria-invalid to true for fields with errors', async () => {
      const user = userEvent.setup();
      render(<LoginForm {...defaultProps} />);

      const emailInput = screen.getByLabelText(/email address/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.click(submitButton);

      expect(emailInput).toHaveAttribute('aria-invalid', 'true');
      expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
    });

    it('has proper labels for all form controls', () => {
      render(<LoginForm {...defaultProps} onForgotPassword={mockOnForgotPassword} />);

      expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /show password/i })).toBeInTheDocument();
    });

    it('has proper role attributes for error messages', () => {
      render(<LoginForm {...defaultProps} error="Login failed" />);

      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toHaveTextContent('Login failed');
    });
  });

  describe('Custom Styling', () => {
    it('applies custom className when provided', () => {
      const { container } = render(<LoginForm {...defaultProps} className="custom-login-form" />);
      
      const form = container.querySelector('form');
      expect(form).toHaveClass('custom-login-form');
    });
  });
});