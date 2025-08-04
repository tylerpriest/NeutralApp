import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../components/LoginForm';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading, login, loginAsGuest } = useAuth();
  
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get redirect path from location state
  const redirectPath = location.state?.from?.pathname || '/';

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, authLoading, navigate, redirectPath]);

  const handleLogin = async (email: string, password: string) => {
    setIsSubmitting(true);
    setLoginError(null);

    try {
      const success = await login(email, password);
      if (!success) {
        setLoginError('Invalid email or password. Please try again.');
      }
      // Navigation handled by useEffect when authentication state changes
    } catch (error) {
      console.error('Login error:', error);
      setLoginError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGuestLogin = async () => {
    setIsSubmitting(true);
    setLoginError(null);

    try {
      await loginAsGuest();
      navigate(redirectPath, { replace: true });
    } catch (error) {
      console.error('Guest login error:', error);
      setLoginError('Failed to login as guest. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    // Navigate to password reset page (to be implemented)
    console.log('Navigate to password reset');
    // navigate('/auth/reset-password');
  };

  // Show loading spinner while checking authentication
  if (authLoading) {
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
          }}>
            Loading...
          </p>
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
        {/* Main Login Card */}
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
              Welcome back!
            </h2>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>
              Please sign in to continue
            </p>
          </div>

          {/* Login Form */}
          <LoginForm
            onSubmit={handleLogin}
            isLoading={isSubmitting}
            error={loginError}
            onForgotPassword={handleForgotPassword}
          />

          {/* Guest Login */}
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
              onMouseEnter={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSubmitting) {
                  e.currentTarget.style.backgroundColor = '#ffffff';
                  e.currentTarget.style.borderColor = '#e5e7eb';
                }
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

          {/* Register Link */}
          <div style={{
            marginTop: '24px',
            textAlign: 'center'
          }}>
            <p style={{
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>
              Don't have an account?{' '}
              <Link
                to="/auth"
                state={{ mode: 'register', from: location.state?.from }}
                style={{
                  fontWeight: '600',
                  color: '#1a1a1a',
                  textDecoration: 'none'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = 'underline';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = 'none';
                }}
              >
                Sign up
              </Link>
            </p>
          </div>
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

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};