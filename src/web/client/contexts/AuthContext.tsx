import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isGuest: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (userData: RegisterData) => Promise<boolean>;
  resetPassword: (email: string) => Promise<boolean>;
  loginAsGuest: () => void;
  refreshAuthToken: () => Promise<boolean>;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

// Token management functions
const getStoredTokens = () => {
  return {
    accessToken: localStorage.getItem('auth_token'),
    refreshToken: localStorage.getItem('refresh_token')
  };
};

const setStoredTokens = (accessToken: string, refreshToken: string) => {
  localStorage.setItem('auth_token', accessToken);
  localStorage.setItem('refresh_token', refreshToken);
};

const clearStoredTokens = () => {
  localStorage.removeItem('auth_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('guest_mode');
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log('AuthContext: Checking authentication on mount...');
      
      const { accessToken, refreshToken } = getStoredTokens();
      console.log('AuthContext: Access token in localStorage:', accessToken ? 'exists' : 'none');
      console.log('AuthContext: Refresh token in localStorage:', refreshToken ? 'exists' : 'none');
      
      if (accessToken) {
        try {
          const response = await fetch('/api/auth/session', {
            headers: {
              'Authorization': `Bearer ${accessToken}`
            }
          });
          
          console.log('AuthContext: Session check response status:', response.status);
          
          if (response.ok) {
            // Check content type to ensure we're getting JSON
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
              const textContent = await response.text();
              if (textContent.includes('<html') || textContent.includes('<!DOCTYPE')) {
                console.error('AuthContext: Server returned HTML instead of JSON');
                clearStoredTokens();
                return;
              }
            }
            
            const data = await response.json();
            console.log('AuthContext: Session check successful, user:', data.user);
            setUser(data.user);
            setIsGuest(false);
          } else if (response.status === 401 && refreshToken) {
            // Try to refresh the token
            console.log('AuthContext: Access token expired, attempting refresh...');
            const refreshSuccess = await refreshAuthToken();
            if (!refreshSuccess) {
              console.log('AuthContext: Token refresh failed, clearing tokens');
              clearStoredTokens();
            }
          } else {
            console.log('AuthContext: Session check failed, clearing tokens');
            clearStoredTokens();
          }
        } catch (error) {
          console.error('Session check failed:', error);
          clearStoredTokens();
        }
      } else {
        // Check for guest mode only if no token exists
        const guestMode = localStorage.getItem('guest_mode');
        console.log('AuthContext: Guest mode in localStorage:', guestMode);
        
        if (guestMode === 'true') {
          console.log('AuthContext: Setting guest mode');
          setIsGuest(true);
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Refresh token function
  const refreshAuthToken = async (): Promise<boolean> => {
    try {
      const { refreshToken } = getStoredTokens();
      
      if (!refreshToken) {
        console.log('AuthContext: No refresh token available');
        return false;
      }

      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('AuthContext: Token refresh successful');
        
        // Update stored tokens
        setStoredTokens(data.token, data.refreshToken);
        setUser(data.user);
        setIsGuest(false);
        
        return true;
      } else {
        console.log('AuthContext: Token refresh failed');
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      return false;
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('AuthContext: Login attempt for:', email);
    
    // Clear any existing guest mode immediately
    localStorage.removeItem('guest_mode');
    setIsGuest(false);
    console.log('AuthContext: Cleared guest mode at start of login');
    
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('AuthContext: Response status:', response.status);
      console.log('AuthContext: Response ok:', response.ok);

      if (response.ok) {
        // Check content type to ensure we're getting JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const textContent = await response.text();
          if (textContent.includes('<html') || textContent.includes('<!DOCTYPE')) {
            console.error('AuthContext: Login response returned HTML instead of JSON');
            return false;
          }
        }
        
        const data = await response.json();
        console.log('AuthContext: Login response data:', data);
        
        // Clear any existing guest mode
        localStorage.removeItem('guest_mode');
        
        // Store both access and refresh tokens
        setStoredTokens(data.token, data.refreshToken);
        setUser(data.user);
        setIsGuest(false);
        
        console.log('AuthContext: Login successful, user set:', data.user);
        return true;
      } else {
        // Try to get error details
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } catch (jsonError) {
          // If JSON parsing fails, try to get text content
          try {
            const textContent = await response.text();
            if (textContent.includes('<html') || textContent.includes('<!DOCTYPE')) {
              errorMessage = 'Server returned HTML instead of JSON. Please check if the API is running correctly.';
            } else {
              errorMessage = `Server error: ${textContent.substring(0, 200)}`;
            }
          } catch (textError) {
            errorMessage = `Login failed (Status: ${response.status})`;
          }
        }
        console.error('Login failed:', errorMessage);
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      const { accessToken } = getStoredTokens();
      
      // Send logout request with token for revocation
      if (accessToken) {
        await fetch('/api/auth/signout', { 
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      clearStoredTokens();
      setUser(null);
      setIsGuest(false);
    }
  };

  const loginAsGuest = (): void => {
    clearStoredTokens();
    localStorage.setItem('guest_mode', 'true');
    setIsGuest(true);
    setUser(null);
    console.log('AuthContext: Logged in as guest');
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    console.log('AuthContext: Registration attempt for:', userData.email);
    
    try {
      // Call the registration endpoint
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: userData.email, 
          password: userData.password,
          firstName: userData.firstName,
          lastName: userData.lastName
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setStoredTokens(data.token, data.refreshToken);
        setUser(data.user);
        return true;
      } else {
        const error = await response.json();
        console.error('Registration failed:', error.error);
        return false;
      }
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const resetPassword = async (email: string): Promise<boolean> => {
    try {
      // For now, just return success
      // In a real app, you'd call a password reset endpoint
      console.log('Password reset requested for:', email);
      return true;
    } catch (error) {
      console.error('Password reset failed:', error);
      return false;
    }
  };

  const isAuthenticated = !!user || isGuest;

  console.log('AuthContext: Current state:', { 
    user: !!user, 
    isGuest,
    isAuthenticated,
    isLoading
  });

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isGuest,
    isLoading,
    login,
    logout,
    register,
    resetPassword,
    loginAsGuest,
    refreshAuthToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 