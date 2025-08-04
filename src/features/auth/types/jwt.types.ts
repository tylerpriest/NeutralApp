export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  iat?: number;
  exp?: number;
}

export interface RefreshTokenResult {
  accessToken: string;
  refreshToken: string;
}

export interface TokenValidationResult {
  isValid: boolean;
  user: User | null;
  error: string | null;
}

export interface AuthenticationResult {
  success: boolean;
  token: string | null;
  user: User | null;
  error: string | null;
}

export interface JWTAuthServiceInterface {
  generateToken(user: User): string;
  generateRefreshToken(user: User): string;
  validateToken(token: string): TokenValidationResult;
  authenticateUser(email: string, password: string): AuthenticationResult;
  refreshToken(refreshToken: string): RefreshTokenResult;
  extractUserFromToken(token: string): User;
  revokeToken(token: string): void;
  isTokenRevoked(token: string): boolean;
} 