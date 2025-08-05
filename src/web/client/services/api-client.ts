import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError,
  InternalAxiosRequestConfig 
} from 'axios';

/**
 * API Client Error Types
 */
export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

/**
 * API Client Configuration
 */
interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  enableRetry?: boolean;
  maxRetries?: number;
  retryDelay?: number;
  enableLogging?: boolean;
}

/**
 * Authentication Token Storage
 */
class TokenStorage {
  private static readonly TOKEN_KEY = 'auth_token';
  private static readonly REFRESH_TOKEN_KEY = 'refresh_token';

  static getToken(): string | null {
    try {
      return localStorage.getItem(this.TOKEN_KEY);
    } catch {
      return null;
    }
  }

  static setToken(token: string): void {
    try {
      localStorage.setItem(this.TOKEN_KEY, token);
    } catch (error) {
      console.warn('Failed to store authentication token:', error);
    }
  }

  static getRefreshToken(): string | null {
    try {
      return localStorage.getItem(this.REFRESH_TOKEN_KEY);
    } catch {
      return null;
    }
  }

  static setRefreshToken(token: string): void {
    try {
      localStorage.setItem(this.REFRESH_TOKEN_KEY, token);
    } catch (error) {
      console.warn('Failed to store refresh token:', error);
    }
  }

  static clearTokens(): void {
    try {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.REFRESH_TOKEN_KEY);
      localStorage.removeItem('guest_mode');
    } catch (error) {
      console.warn('Failed to clear tokens:', error);
    }
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true; // Assume expired if we can't parse
    }
  }
}

/**
 * Retry Logic Handler
 */
class RetryHandler {
  private static shouldRetry(error: AxiosError, attempt: number, maxRetries: number): boolean {
    if (attempt >= maxRetries) return false;
    
    // Don't retry client errors (4xx) except for 401, 408, 429
    if (error.response?.status && error.response.status >= 400 && error.response.status < 500) {
      return [401, 408, 429].includes(error.response.status);
    }
    
    // Retry server errors (5xx) and network errors
    return !error.response || error.response.status >= 500;
  }

  static async executeWithRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 1000
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (error instanceof AxiosError && !this.shouldRetry(error, attempt, maxRetries)) {
          throw error;
        }
        
        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }
}

/**
 * Main API Client Class
 */
export class ApiClient {
  private axiosInstance: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];
  private config: Required<ApiClientConfig>;

  constructor(config: ApiClientConfig = {}) {
    this.config = {
      baseURL: config.baseURL || '/api',
      timeout: config.timeout || 10000,
      enableRetry: config.enableRetry ?? true,
      maxRetries: config.maxRetries || 3,
      retryDelay: config.retryDelay || 1000,
      enableLogging: config.enableLogging ?? process.env.NODE_ENV === 'development'
    };

    this.axiosInstance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup request and response interceptors
   */
  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.axiosInstance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = TokenStorage.getToken();
        if (token && !TokenStorage.isTokenExpired(token)) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        if (this.config.enableLogging) {
          console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
            params: config.params,
            data: config.data
          });
        }

        return config;
      },
      (error) => {
        if (this.config.enableLogging) {
          console.error('[API] Request error:', error);
        }
        return Promise.reject(error);
      }
    );

    // Response interceptor - handle auth and errors
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        if (this.config.enableLogging) {
          console.log(`[API] Response ${response.status}:`, response.data);
        }
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (this.config.enableLogging) {
          console.error(`[API] Response error ${error.response?.status}:`, error.message);
        }

        // Handle 401 - Unauthorized (token expired)
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newToken = await this.refreshToken();
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.axiosInstance(originalRequest);
          } catch (refreshError) {
            // Refresh failed, redirect to login
            this.handleAuthFailure();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(this.transformError(error));
      }
    );
  }

  /**
   * Transform axios error to standardized API error
   */
  private transformError(error: AxiosError): ApiError {
    const apiError: ApiError = {
      message: 'An unexpected error occurred',
      code: 'UNKNOWN_ERROR',
      status: 0,
    };

    if (error.response) {
      // Server responded with error status
      apiError.status = error.response.status;
      apiError.message = error.response.data?.message || error.message;
      apiError.code = error.response.data?.code || `HTTP_${error.response.status}`;
      apiError.details = error.response.data?.details;
    } else if (error.request) {
      // Network error
      apiError.message = 'Network error - please check your connection';
      apiError.code = 'NETWORK_ERROR';
      apiError.status = 0;
    } else {
      // Request setup error
      apiError.message = error.message;
      apiError.code = 'REQUEST_ERROR';
      apiError.status = 0;
    }

    return apiError;
  }

  /**
   * Handle authentication failure
   */
  private handleAuthFailure(): void {
    TokenStorage.clearTokens();
    
    // Emit auth failure event for components to handle
    window.dispatchEvent(new CustomEvent('auth:failure'));
    
    // Redirect to login if not already there
    if (!window.location.pathname.includes('/login')) {
      window.location.href = '/login';
    }
  }

  /**
   * Refresh authentication token
   */
  private async refreshToken(): Promise<string> {
    if (this.isRefreshing) {
      // If already refreshing, wait for the result
      return new Promise<string>((resolve) => {
        this.refreshSubscribers.push(resolve);
      });
    }

    this.isRefreshing = true;

    try {
      const refreshToken = TokenStorage.getRefreshToken();
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await axios.post(`${this.config.baseURL}/auth/refresh`, {
        refreshToken
      });

      const { token, refreshToken: newRefreshToken } = response.data;
      
      TokenStorage.setToken(token);
      if (newRefreshToken) {
        TokenStorage.setRefreshToken(newRefreshToken);
      }

      // Notify all waiting requests
      this.refreshSubscribers.forEach(callback => callback(token));
      this.refreshSubscribers = [];

      return token;
    } catch (error) {
      this.refreshSubscribers.forEach(callback => callback(''));
      this.refreshSubscribers = [];
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Generic request method with retry logic
   */
  private async request<T>(config: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const executeRequest = async () => {
      const response = await this.axiosInstance.request<ApiResponse<T>>(config);
      return response.data;
    };

    if (this.config.enableRetry) {
      return RetryHandler.executeWithRetry(
        executeRequest,
        this.config.maxRetries,
        this.config.retryDelay
      );
    }

    return executeRequest();
  }

  /**
   * HTTP Methods
   */
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'GET', url });
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'POST', url, data });
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PUT', url, data });
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'PATCH', url, data });
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.request<T>({ ...config, method: 'DELETE', url });
  }

  /**
   * Authentication methods
   */
  async login(credentials: { email: string; password: string }): Promise<ApiResponse<{ token: string; refreshToken: string; user: any }>> {
    const response = await this.post<{ token: string; refreshToken: string; user: any }>('/auth/signin', credentials);
    
    if (response.success && response.data) {
      TokenStorage.setToken(response.data.token);
      TokenStorage.setRefreshToken(response.data.refreshToken);
    }
    
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.post('/auth/signout');
    } catch (error) {
      console.warn('Logout request failed:', error);
    } finally {
      TokenStorage.clearTokens();
    }
  }

  /**
   * Utility methods
   */
  isAuthenticated(): boolean {
    const token = TokenStorage.getToken();
    return token !== null && !TokenStorage.isTokenExpired(token);
  }

  getCurrentToken(): string | null {
    return TokenStorage.getToken();
  }

  setAuthToken(token: string, refreshToken?: string): void {
    TokenStorage.setToken(token);
    if (refreshToken) {
      TokenStorage.setRefreshToken(refreshToken);
    }
  }

  clearAuth(): void {
    TokenStorage.clearTokens();
  }
}

// Default instance
export const apiClient = new ApiClient();