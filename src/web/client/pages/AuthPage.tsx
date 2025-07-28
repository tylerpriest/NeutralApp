import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button, Input, Card, CardHeader, CardContent, LoadingSpinner } from '../../../shared/ui';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';

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
  const { isAuthenticated, isLoading, login, register, resetPassword } = useAuth();
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
    
    // Temporarily disable validation for debugging
    // if (!validateForm()) {
    //   return;
    // }
    
    setIsSubmitting(true);
    setErrors([]);
    setSuccessMessage('');

    try {
      let success = false;

      switch (mode) {
        case 'login':
          console.log('AuthPage: Attempting login with:', formData.email);
          success = await login(formData.email, formData.password);
          console.log('AuthPage: Login result:', success);
          if (success) {
            console.log('AuthPage: Login successful, redirect will happen automatically');
            // The useEffect hook will handle the redirect when isAuthenticated becomes true
          } else {
            console.log('AuthPage: Login failed, showing error');
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
          title: 'Welcome back',
          subtitle: 'Sign in to your account to continue',
          buttonText: 'Sign In',
          buttonIcon: <ArrowRight className="w-4 h-4" />
        };
      case 'register':
        return {
          title: 'Create your account',
          subtitle: 'Join NeutralApp to get started',
          buttonText: 'Create Account',
          buttonIcon: <CheckCircle className="w-4 h-4" />
        };
      case 'reset':
        return {
          title: 'Reset your password',
          subtitle: 'Enter your email to receive reset instructions',
          buttonText: 'Send Reset Email',
          buttonIcon: <Mail className="w-4 h-4" />
        };
    }
  };

  const modeConfig = getModeConfig();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Brand */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">NeutralApp</h1>
          <p className="text-gray-600 text-sm">Modern, clean, and efficient</p>
        </div>

        {/* Auth Card */}
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              {modeConfig.title}
            </h2>
            <p className="text-gray-600 text-sm">
              {modeConfig.subtitle}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Error Message */}
            {getGeneralError() && (
              <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                <p className="text-red-700 text-sm">{getGeneralError()}</p>
              </div>
            )}

            {/* Success Message */}
            {successMessage && (
              <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                <p className="text-green-700 text-sm">{successMessage}</p>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Registration Fields */}
              {mode === 'register' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                                         <Input
                       type="text"
                       placeholder="First Name"
                       value={formData.firstName}
                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('firstName', e.target.value)}
                       className={getFieldError('firstName') ? 'border-red-300 focus:border-red-500' : ''}
                       icon={<User className="w-4 h-4" />}
                     />
                    {getFieldError('firstName') && (
                      <p className="text-red-600 text-xs">{getFieldError('firstName')}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                                         <Input
                       type="text"
                       placeholder="Last Name"
                       value={formData.lastName}
                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('lastName', e.target.value)}
                       className={getFieldError('lastName') ? 'border-red-300 focus:border-red-500' : ''}
                       icon={<User className="w-4 h-4" />}
                     />
                    {getFieldError('lastName') && (
                      <p className="text-red-600 text-xs">{getFieldError('lastName')}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                                 <Input
                   type="email"
                   placeholder="Email Address"
                   value={formData.email}
                   onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('email', e.target.value)}
                   className={getFieldError('email') ? 'border-red-300 focus:border-red-500' : ''}
                   icon={<Mail className="w-4 h-4" />}
                 />
                {getFieldError('email') && (
                  <p className="text-red-600 text-xs">{getFieldError('email')}</p>
                )}
              </div>

              {/* Password Field */}
              {mode !== 'reset' && (
                <div className="space-y-2">
                  <div className="relative">
                                         <Input
                       type={showPassword ? 'text' : 'password'}
                       placeholder="Password"
                       value={formData.password}
                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('password', e.target.value)}
                       className={getFieldError('password') ? 'border-red-300 focus:border-red-500 pr-12' : 'pr-12'}
                       icon={<Lock className="w-4 h-4" />}
                     />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {getFieldError('password') && (
                    <p className="text-red-600 text-xs">{getFieldError('password')}</p>
                  )}
                </div>
              )}

              {/* Confirm Password Field */}
              {mode === 'register' && (
                <div className="space-y-2">
                  <div className="relative">
                                         <Input
                       type={showConfirmPassword ? 'text' : 'password'}
                       placeholder="Confirm Password"
                       value={formData.confirmPassword}
                       onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('confirmPassword', e.target.value)}
                       className={getFieldError('confirmPassword') ? 'border-red-300 focus:border-red-500 pr-12' : 'pr-12'}
                       icon={<Lock className="w-4 h-4" />}
                     />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {getFieldError('confirmPassword') && (
                    <p className="text-red-600 text-xs">{getFieldError('confirmPassword')}</p>
                  )}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-base font-medium"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <LoadingSpinner size="sm" variant="white" />
                    <span>Processing...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>{modeConfig.buttonText}</span>
                    {modeConfig.buttonIcon}
                  </div>
                )}
              </Button>
            </form>

            {/* Mode Switcher Links */}
            <div className="space-y-3 pt-4 border-t border-gray-200">
              {mode === 'login' && (
                <>
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="w-full text-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Don't have an account? <span className="font-medium">Sign up</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="w-full text-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Forgot your password? <span className="font-medium">Reset it</span>
                  </button>
                </>
              )}
              {mode === 'register' && (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full text-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Already have an account? <span className="font-medium">Sign in</span>
                </button>
              )}
              {mode === 'reset' && (
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full text-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Remember your password? <span className="font-medium">Back to sign in</span>
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Demo Credentials - Only show in login mode */}
        {mode === 'login' && (
          <Card className="mt-6 shadow-lg border-0 bg-blue-50">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                Demo Credentials
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Use these credentials for testing:
              </p>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <p className="text-sm font-medium text-gray-900 mb-1">Test User:</p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Email: <code className="bg-gray-100 px-1 rounded">test@example.com</code></p>
                    <p>Password: <code className="bg-gray-100 px-1 rounded">password123</code></p>
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-blue-200">
                  <p className="text-sm font-medium text-gray-900 mb-1">Development User:</p>
                  <div className="text-xs text-gray-600 space-y-1">
                    <p>Email: <code className="bg-gray-100 px-1 rounded">any-valid-email@example.com</code></p>
                    <p>Password: <code className="bg-gray-100 px-1 rounded">password123</code></p>
                  </div>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3 flex items-center gap-1">
                💡 These are demo credentials for testing purposes only.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AuthPage; 