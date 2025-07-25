import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AuthFormData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  confirmPassword?: string;
}

interface AuthError {
  field: string;
  message: string;
}

const AuthPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, register, resetPassword } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<AuthError[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const validateForm = (): boolean => {
    const newErrors: AuthError[] = [];

    // Email validation
    if (!formData.email) {
      newErrors.push({ field: 'email', message: 'Email is required' });
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.push({ field: 'email', message: 'Please enter a valid email address' });
    }

    // Password validation (only for login and register modes)
    if (mode !== 'reset') {
      if (!formData.password) {
        newErrors.push({ field: 'password', message: 'Password is required' });
      } else if (formData.password.length < 8) {
        newErrors.push({ field: 'password', message: 'Password must be at least 8 characters long' });
      }
    }

    // Registration-specific validations
    if (mode === 'register') {
      if (!formData.firstName) {
        newErrors.push({ field: 'firstName', message: 'First name is required' });
      }
      if (!formData.lastName) {
        newErrors.push({ field: 'lastName', message: 'Last name is required' });
      }
      if (!formData.confirmPassword) {
        newErrors.push({ field: 'confirmPassword', message: 'Please confirm your password' });
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.push({ field: 'confirmPassword', message: 'Passwords do not match' });
      }
    }

    setErrors(newErrors);
    return newErrors.length === 0;
  };

  const handleInputChange = (field: keyof AuthFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific error when user starts typing
    setErrors(prev => prev.filter(error => error.field !== field));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors([]);
    setSuccessMessage('');

    try {
      let success = false;

      switch (mode) {
        case 'login':
          success = await login(formData.email, formData.password);
          if (success) {
            setSuccessMessage('Login successful! Redirecting...');
            setTimeout(() => navigate('/'), 1000);
          } else {
            setErrors([{ field: 'general', message: 'Invalid email or password' }]);
          }
          break;
        case 'register':
          success = await register({
            email: formData.email,
            password: formData.password,
            firstName: formData.firstName || '',
            lastName: formData.lastName || ''
          });
          if (success) {
            setSuccessMessage('Registration successful! Please check your email for verification.');
            setMode('login');
          } else {
            setErrors([{ field: 'general', message: 'Registration failed. Please try again.' }]);
          }
          break;
        case 'reset':
          success = await resetPassword(formData.email);
          if (success) {
            setSuccessMessage('Password reset email sent! Please check your inbox.');
            setMode('login');
          } else {
            setErrors([{ field: 'general', message: 'Password reset failed. Please try again.' }]);
          }
          break;
        default:
          throw new Error('Invalid auth mode');
      }
    } catch (error) {
      setErrors([{ field: 'general', message: 'Network error. Please try again.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const getFieldError = (field: string): string | undefined => {
    return errors.find(error => error.field === field)?.message;
  };

  const getGeneralError = (): string | undefined => {
    return errors.find(error => error.field === 'general')?.message;
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <h1 className="auth-title">NeutralApp</h1>
          <p className="auth-subtitle">
            {mode === 'login' && 'Welcome back! Please sign in to continue'}
            {mode === 'register' && 'Create your account to get started'}
            {mode === 'reset' && 'Reset your password'}
          </p>
        </div>

        {getGeneralError() && (
          <div className="auth-error-message">
            {getGeneralError()}
          </div>
        )}

        {successMessage && (
          <div className="auth-success-message">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" role="form">
          {mode === 'register' && (
            <>
              <div className="form-row">
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="First Name"
                    className={`auth-input ${getFieldError('firstName') ? 'error' : ''}`}
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                  />
                  {getFieldError('firstName') && (
                    <span className="field-error">{getFieldError('firstName')}</span>
                  )}
                </div>
                <div className="form-group">
                  <input
                    type="text"
                    placeholder="Last Name"
                    className={`auth-input ${getFieldError('lastName') ? 'error' : ''}`}
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                  />
                  {getFieldError('lastName') && (
                    <span className="field-error">{getFieldError('lastName')}</span>
                  )}
                </div>
              </div>
            </>
          )}

          <div className="form-group">
            <input
              type="email"
              placeholder="Email Address"
              className={`auth-input ${getFieldError('email') ? 'error' : ''}`}
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
            {getFieldError('email') && (
              <span className="field-error">{getFieldError('email')}</span>
            )}
          </div>

          {mode !== 'reset' && (
            <div className="form-group">
              <input
                type="password"
                placeholder="Password"
                className={`auth-input ${getFieldError('password') ? 'error' : ''}`}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
              {getFieldError('password') && (
                <span className="field-error">{getFieldError('password')}</span>
              )}
            </div>
          )}

          {mode === 'register' && (
            <div className="form-group">
              <input
                type="password"
                placeholder="Confirm Password"
                className={`auth-input ${getFieldError('confirmPassword') ? 'error' : ''}`}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              />
              {getFieldError('confirmPassword') && (
                <span className="field-error">{getFieldError('confirmPassword')}</span>
              )}
            </div>
          )}

          <button
            type="submit"
            className="auth-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="loading-spinner">Loading...</span>
            ) : (
              <>
                {mode === 'login' && 'Sign In'}
                {mode === 'register' && 'Create Account'}
                {mode === 'reset' && 'Send Reset Email'}
              </>
            )}
          </button>
        </form>

        <div className="auth-links">
          {mode === 'login' && (
            <>
              <button
                className="auth-link-button"
                onClick={() => setMode('register')}
              >
                Don't have an account? Sign up
              </button>
              <button
                className="auth-link-button"
                onClick={() => setMode('reset')}
              >
                Forgot your password?
              </button>
            </>
          )}
          {mode === 'register' && (
            <button
              className="auth-link-button"
              onClick={() => setMode('login')}
            >
              Already have an account? Sign in
            </button>
          )}
          {mode === 'reset' && (
            <button
              className="auth-link-button"
              onClick={() => setMode('login')}
            >
              Back to sign in
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 