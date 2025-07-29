import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Shield } from 'lucide-react';

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
  const { isAuthenticated, isLoading, login, register, resetPassword, loginAsGuest } = useAuth();
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login');
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<AuthError[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Memoize the redirect path to prevent infinite loops
  const redirectPath = useMemo(() => {
    return location.state?.from?.pathname || '/';
  }, [location.state?.from?.pathname]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      console.log('AuthPage: User authenticated, redirecting to:', redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, redirectPath]);

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

    setIsSubmitting(true);
    setErrors([]);
    setSuccessMessage('');

    try {
      let result: boolean;
      if (mode === 'login') {
        result = await login(formData.email, formData.password);
      } else if (mode === 'register') {
        result = await register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName!,
          lastName: formData.lastName!
        });
      } else if (mode === 'reset') {
        result = await resetPassword(formData.email);
      } else {
        result = false;
      }

      if (result) {
        if (mode === 'reset') {
          setSuccessMessage('Password reset email sent! Please check your inbox.');
          setMode('login');
        }
        // For login and register, the redirect will happen automatically
      } else {
        setErrors([{ field: 'general', message: 'Authentication failed. Please try again.' }]);
      }
    } catch (error) {
      console.error('Auth error:', error);
      setErrors([{ field: 'general', message: 'An unexpected error occurred' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsSubmitting(true);
    try {
      await loginAsGuest();
    } catch (error) {
      console.error('Guest login error:', error);
      setErrors([{ field: 'general', message: 'Failed to login as guest' }]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFieldError = (field: string): string | undefined => {
    return errors.find(error => error.field === field)?.message;
  };

  const getGeneralError = (): string | undefined => {
    return errors.find(error => error.field === 'general')?.message;
  };

  const getModeConfig = () => {
    switch (mode) {
      case 'login':
        return {
          title: 'Welcome back!',
          subtitle: 'Please sign in to continue',
          submitText: 'Sign In',
          switchText: "Don't have an account?",
          switchAction: 'Sign up',
          switchMode: 'register' as const
        };
      case 'register':
        return {
          title: 'Create Account',
          subtitle: 'Sign up to get started',
          submitText: 'Create Account',
          switchText: 'Already have an account?',
          switchAction: 'Sign in',
          switchMode: 'login' as const
        };
      case 'reset':
        return {
          title: 'Reset Password',
          subtitle: 'Enter your email to reset your password',
          submitText: 'Send Reset Link',
          switchText: 'Remember your password?',
          switchAction: 'Sign in',
          switchMode: 'login' as const
        };
    }
  };

  const config = getModeConfig();

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: '#1a1a1a',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #f3f4f6',
            borderTop: '3px solid #6b7280',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <p style={{
            fontSize: '14px',
            color: '#6b7280',
            margin: 0
          }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#1a1a1a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px'
      }}>
        {/* Main Card */}
        <div style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          padding: '32px'
        }}>
          {/* Header */}
          <div style={{
            textAlign: 'center',
            marginBottom: '32px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                backgroundColor: '#1a1a1a',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff'
              }}>
                <Shield size={24} />
              </div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 'bold',
                color: '#1a1a1a',
                margin: 0
              }}>
                NeutralApp
              </h1>
            </div>
            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: '#374151',
              margin: '0 0 4px 0'
            }}>
              {config.title}
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>
              {config.subtitle}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '20px'
          }}>
            {/* General Error */}
            {getGeneralError() && (
              <div style={{
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '8px'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#dc2626',
                  margin: 0
                }}>
                  {getGeneralError()}
                </p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div style={{
                backgroundColor: '#d1fae5',
                border: '1px solid #a7f3d0',
                borderRadius: '8px',
                padding: '12px',
                marginBottom: '8px'
              }}>
                <p style={{
                  fontSize: '14px',
                  color: '#059669',
                  margin: 0
                }}>
                  {successMessage}
                </p>
              </div>
            )}

            {/* Register Mode Fields */}
            {mode === 'register' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px'
              }}>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="First Name"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${getFieldError('firstName') ? '#f87171' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: '#ffffff',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  />
                  {getFieldError('firstName') && (
                    <p style={{
                      fontSize: '12px',
                      color: '#dc2626',
                      margin: '4px 0 0 0'
                    }}>
                      {getFieldError('firstName')}
                    </p>
                  )}
                </div>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Last Name"
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      border: `1px solid ${getFieldError('lastName') ? '#f87171' : '#e5e7eb'}`,
                      borderRadius: '8px',
                      fontSize: '14px',
                      backgroundColor: '#ffffff',
                      outline: 'none',
                      transition: 'border-color 0.2s ease',
                      boxSizing: 'border-box'
                    }}
                  />
                  {getFieldError('lastName') && (
                    <p style={{
                      fontSize: '12px',
                      color: '#dc2626',
                      margin: '4px 0 0 0'
                    }}>
                      {getFieldError('lastName')}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '6px'
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Email Address"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: `1px solid ${getFieldError('email') ? '#f87171' : '#e5e7eb'}`,
                  borderRadius: '8px',
                  fontSize: '14px',
                  backgroundColor: '#ffffff',
                  outline: 'none',
                  transition: 'border-color 0.2s ease',
                  boxSizing: 'border-box'
                }}
              />
              {getFieldError('email') && (
                <p style={{
                  fontSize: '12px',
                  color: '#dc2626',
                  margin: '4px 0 0 0'
                }}>
                  {getFieldError('email')}
                </p>
              )}
            </div>

            {/* Password Fields */}
            {mode !== 'reset' && (
              <>
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: '500',
                    color: '#374151',
                    marginBottom: '6px'
                  }}>
                    Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      placeholder="Password"
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        paddingRight: '48px',
                        border: `1px solid ${getFieldError('password') ? '#f87171' : '#e5e7eb'}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: '#ffffff',
                        outline: 'none',
                        transition: 'border-color 0.2s ease',
                        boxSizing: 'border-box'
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9ca3af'
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {getFieldError('password') && (
                    <p style={{
                      fontSize: '12px',
                      color: '#dc2626',
                      margin: '4px 0 0 0'
                    }}>
                      {getFieldError('password')}
                    </p>
                  )}
                </div>

                {/* Confirm Password for Register */}
                {mode === 'register' && (
                  <div>
                    <label style={{
                      display: 'block',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: '#374151',
                      marginBottom: '6px'
                    }}>
                      Confirm Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={formData.confirmPassword}
                        onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                        placeholder="Confirm Password"
                        style={{
                          width: '100%',
                          padding: '12px 16px',
                          paddingRight: '48px',
                          border: `1px solid ${getFieldError('confirmPassword') ? '#f87171' : '#e5e7eb'}`,
                          borderRadius: '8px',
                          fontSize: '14px',
                          backgroundColor: '#ffffff',
                          outline: 'none',
                          transition: 'border-color 0.2s ease',
                          boxSizing: 'border-box'
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        style={{
                          position: 'absolute',
                          right: '12px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#9ca3af'
                        }}
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    {getFieldError('confirmPassword') && (
                      <p style={{
                        fontSize: '12px',
                        color: '#dc2626',
                        margin: '4px 0 0 0'
                      }}>
                        {getFieldError('confirmPassword')}
                      </p>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px 24px',
                backgroundColor: '#1a1a1a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.6 : 1,
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {isSubmitting ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid #ffffff',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  {config.submitText}...
                </>
              ) : (
                <>
                  {config.submitText}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Guest Login */}
          {mode === 'login' && (
            <div style={{ marginTop: '24px' }}>
              <button
                type="button"
                onClick={handleGuestLogin}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px 24px',
                  backgroundColor: '#ffffff',
                  color: '#1a1a1a',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  opacity: isSubmitting ? 0.6 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                Continue as Guest
              </button>
              <p style={{
                fontSize: '12px',
                color: '#6b7280',
                textAlign: 'center',
                margin: '8px 0 0 0'
              }}>
                Try NeutralApp without creating an account
              </p>
            </div>
          )}

          {/* Mode Switcher */}
          <div style={{
            marginTop: '24px',
            textAlign: 'center'
          }}>
            <button
              type="button"
              onClick={() => setMode(config.switchMode)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '14px',
                color: '#6b7280',
                cursor: 'pointer',
                transition: 'color 0.2s ease'
              }}
            >
              {config.switchText}{' '}
              <span style={{
                fontWeight: '600',
                color: '#1a1a1a'
              }}>
                {config.switchAction}
              </span>
            </button>
          </div>

          {/* Forgot Password Link */}
          {mode === 'login' && (
            <div style={{
              marginTop: '16px',
              textAlign: 'center'
            }}>
              <button
                type="button"
                onClick={() => setMode('reset')}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '14px',
                  color: '#6b7280',
                  cursor: 'pointer',
                  transition: 'color 0.2s ease'
                }}
              >
                Forgot your password?{' '}
                <span style={{
                  fontWeight: '600',
                  color: '#1a1a1a'
                }}>
                  Reset it
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Demo Credentials */}
        <div style={{
          marginTop: '24px',
          backgroundColor: '#374151',
          borderRadius: '12px',
          padding: '20px'
        }}>
          <h3 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#d1d5db',
            margin: '0 0 8px 0'
          }}>
            Demo Credentials
          </h3>
          <p style={{
            fontSize: '12px',
            color: '#9ca3af',
            margin: '0 0 12px 0'
          }}>
            Use these credentials for testing:
          </p>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            fontSize: '12px'
          }}>
            {/* Regular User */}
            <div style={{
              border: '1px solid #4b5563',
              borderRadius: '8px',
              padding: '12px',
              backgroundColor: '#1f2937'
            }}>
              <div style={{
                fontSize: '11px',
                color: '#6b7280',
                marginBottom: '4px',
                fontWeight: '500'
              }}>
                Regular User
              </div>
              <div>
                <span style={{ color: '#9ca3af' }}>Email:</span>{' '}
                <code style={{
                  color: '#10b981',
                  backgroundColor: '#064e3b',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}>
                  test@example.com
                </code>
              </div>
              <div>
                <span style={{ color: '#9ca3af' }}>Password:</span>{' '}
                <code style={{
                  color: '#10b981',
                  backgroundColor: '#064e3b',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}>
                  password123
                </code>
              </div>
            </div>
            
            {/* Admin User */}
            <div style={{
              border: '1px solid #4b5563',
              borderRadius: '8px',
              padding: '12px',
              backgroundColor: '#1f2937'
            }}>
              <div style={{
                fontSize: '11px',
                color: '#6b7280',
                marginBottom: '4px',
                fontWeight: '500'
              }}>
                Admin User
              </div>
              <div>
                <span style={{ color: '#9ca3af' }}>Email:</span>{' '}
                <code style={{
                  color: '#f59e0b',
                  backgroundColor: '#451a03',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}>
                  admin@example.com
                </code>
              </div>
              <div>
                <span style={{ color: '#9ca3af' }}>Password:</span>{' '}
                <code style={{
                  color: '#f59e0b',
                  backgroundColor: '#451a03',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '11px'
                }}>
                  password123
                </code>
              </div>
            </div>
          </div>
          <p style={{
            fontSize: '12px',
            color: '#6b7280',
            margin: '12px 0 0 0'
          }}>
            💡 These are demo credentials for testing purposes only.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage; 