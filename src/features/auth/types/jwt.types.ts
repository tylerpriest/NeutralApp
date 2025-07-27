export interface User {
  id: string;
  email: string;
  name: string;
}

export interface JWTPayload {
  userId: string;
  email: string;
  name: string;
  iat?: number;
  exp?: number;
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
  validateToken(token: string): TokenValidationResult;
  authenticateUser(email: string, password: string): AuthenticationResult;
  refreshToken(token: string): string;
  extractUserFromToken(token: string): User;
} 