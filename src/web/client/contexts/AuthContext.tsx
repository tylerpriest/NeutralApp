import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name?: string | null;
  emailVerified?: Date | null;
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

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing token on mount
  useEffect(() => {
    const checkAuth = async () => {
      // Check for guest mode first
      const guestMode = localStorage.getItem('guest_mode');
      if (guestMode === 'true') {
        setIsGuest(true);
        setIsLoading(false);
        return;
      }

      const token = localStorage.getItem('auth_token');
      if (token) {
        try {
          const response = await fetch('/api/auth/session', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            setUser(data.user);
          } else {
            localStorage.removeItem('auth_token');
          }
        } catch (error) {
          console.error('Session check failed:', error);
          localStorage.removeItem('auth_token');
        }
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('AuthContext: Login attempt for:', email);
    
    try {
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.token);
        setUser(data.user);
        console.log('AuthContext: Login successful');
        return true;
      } else {
        const error = await response.json();
        console.error('Login failed:', error.error);
        return false;
      }
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('guest_mode');
      setUser(null);
      setIsGuest(false);
    }
  };

  const loginAsGuest = (): void => {
    localStorage.setItem('guest_mode', 'true');
    localStorage.removeItem('auth_token');
    setIsGuest(true);
    setUser(null);
    console.log('AuthContext: Logged in as guest');
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    console.log('AuthContext: Registration attempt for:', userData.email);
    
    try {
      // For now, registration is the same as login
      // In a real app, you'd have a separate registration endpoint
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: userData.email, 
          password: userData.password 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('auth_token', data.token);
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
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 