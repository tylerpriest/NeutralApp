import * as fs from 'fs';
import * as path from 'path';

export interface EnvironmentConfig {
  // Server Configuration
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  CLIENT_PORT: number;
  
  // Database Configuration
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  
  // Authentication Configuration
  NEXTAUTH_URL: string;
  NEXTAUTH_SECRET: string;
  AUTH_SECRET: string;
  
  // Logging Configuration
  LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error';
  LOG_FORMAT: 'dev' | 'json';
  
  // Feature Flags
  ENABLE_DEBUG_MODE: boolean;
  ENABLE_HOT_RELOAD: boolean;
  ENABLE_SOURCE_MAPS: boolean;
  
  // API Configuration
  API_BASE_URL: string;
  CORS_ORIGIN: string;
  
  // Plugin Configuration
  PLUGIN_DIRECTORY: string;
  ENABLE_PLUGIN_HOT_RELOAD: boolean;
  
  // Security Configuration
  ENABLE_HTTPS: boolean;
  SECURE_COOKIES: boolean;
  SESSION_SECRET: string;
  ENABLE_RATE_LIMITING?: boolean;
  RATE_LIMIT_WINDOW?: number;
  RATE_LIMIT_MAX_REQUESTS?: number;
  
  // Monitoring Configuration
  ENABLE_METRICS: boolean;
  METRICS_PORT: number;
  ENABLE_HEALTH_CHECKS: boolean;
  ENABLE_APM?: boolean;
  
  // Performance Configuration
  ENABLE_COMPRESSION?: boolean;
  ENABLE_CACHING?: boolean;
  CACHE_TTL?: number;
  
  // Backup Configuration
  ENABLE_AUTO_BACKUP?: boolean;
  BACKUP_INTERVAL?: number;
  BACKUP_RETENTION_DAYS?: number;
  
  // Testing Configuration
  ENABLE_TEST_MODE: boolean;
  TEST_DATABASE_URL?: string;
}

export class EnvironmentManager {
  private static instance: EnvironmentManager;
  private config: EnvironmentConfig;
  private environment: string;

  private constructor() {
    this.environment = this.detectEnvironment();
    this.config = this.loadConfiguration();
  }

  public static getInstance(): EnvironmentManager {
    if (!EnvironmentManager.instance) {
      EnvironmentManager.instance = new EnvironmentManager();
    }
    return EnvironmentManager.instance;
  }

  /**
   * Detect the current environment
   */
  private detectEnvironment(): string {
    // Priority: NODE_ENV > command line args > default
    const nodeEnv = process.env.NODE_ENV;
    const args = process.argv.slice(2);
    const envArg = args.find(arg => arg.startsWith('--env='))?.split('=')[1];
    
    return envArg || nodeEnv || 'development';
  }

  /**
   * Load configuration from environment file
   */
  private loadConfiguration(): EnvironmentConfig {
    const configPath = path.join(process.cwd(), 'config', 'environments', `${this.environment}.env`);
    
    if (!fs.existsSync(configPath)) {
      console.warn(`⚠️  Environment config file not found: ${configPath}`);
      console.warn(`Using default configuration for environment: ${this.environment}`);
      return this.getDefaultConfig();
    }

    const envContent = fs.readFileSync(configPath, 'utf-8');
    const envVars = this.parseEnvFile(envContent);
    
    return this.mergeWithDefaults(envVars);
  }

  /**
   * Parse .env file content
   */
  private parseEnvFile(content: string): Record<string, string> {
    const vars: Record<string, string> = {};
    
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      
      // Skip comments and empty lines
      if (trimmed.startsWith('#') || trimmed === '') {
        continue;
      }
      
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        // Remove quotes if present
        vars[key.trim()] = value.replace(/^["']|["']$/g, '');
      }
    }
    
    return vars;
  }

  /**
   * Merge environment variables with defaults
   */
  private mergeWithDefaults(envVars: Record<string, string>): EnvironmentConfig {
    const defaults = this.getDefaultConfig();
    
    return {
      ...defaults,
      ...this.convertEnvVars(envVars)
    };
  }

  /**
   * Convert string environment variables to proper types
   */
  private convertEnvVars(envVars: Record<string, string>): Partial<EnvironmentConfig> {
    const converted: Partial<EnvironmentConfig> = {};
    
    for (const [key, value] of Object.entries(envVars)) {
      switch (key) {
        case 'NODE_ENV':
          converted.NODE_ENV = value as 'development' | 'production' | 'test';
          break;
        case 'PORT':
        case 'CLIENT_PORT':
        case 'DB_PORT':
        case 'METRICS_PORT':
        case 'RATE_LIMIT_WINDOW':
        case 'RATE_LIMIT_MAX_REQUESTS':
        case 'CACHE_TTL':
        case 'BACKUP_INTERVAL':
        case 'BACKUP_RETENTION_DAYS':
          (converted as any)[key] = parseInt(value, 10);
          break;
        case 'LOG_LEVEL':
          converted.LOG_LEVEL = value as 'debug' | 'info' | 'warn' | 'error';
          break;
        case 'LOG_FORMAT':
          converted.LOG_FORMAT = value as 'dev' | 'json';
          break;
        case 'ENABLE_DEBUG_MODE':
        case 'ENABLE_HOT_RELOAD':
        case 'ENABLE_SOURCE_MAPS':
        case 'ENABLE_PLUGIN_HOT_RELOAD':
        case 'ENABLE_HTTPS':
        case 'SECURE_COOKIES':
        case 'ENABLE_RATE_LIMITING':
        case 'ENABLE_METRICS':
        case 'ENABLE_HEALTH_CHECKS':
        case 'ENABLE_APM':
        case 'ENABLE_COMPRESSION':
        case 'ENABLE_CACHING':
        case 'ENABLE_AUTO_BACKUP':
        case 'ENABLE_TEST_MODE':
          (converted as any)[key] = value.toLowerCase() === 'true';
          break;
        default:
          // String values
          (converted as any)[key] = value;
      }
    }
    
    return converted;
  }

  /**
   * Get default configuration
   */
  private getDefaultConfig(): EnvironmentConfig {
    return {
      NODE_ENV: 'development',
      PORT: 3000,
      CLIENT_PORT: 3001,
      DB_HOST: 'localhost',
      DB_PORT: 5432,
      DB_NAME: 'neutral_app',
      DB_USER: 'postgres',
      DB_PASSWORD: 'password',
      NEXTAUTH_URL: 'http://localhost:3000',
      NEXTAUTH_SECRET: 'default-secret-key',
      AUTH_SECRET: 'default-auth-secret',
      LOG_LEVEL: 'info',
      LOG_FORMAT: 'dev',
      ENABLE_DEBUG_MODE: false,
      ENABLE_HOT_RELOAD: false,
      ENABLE_SOURCE_MAPS: false,
      API_BASE_URL: 'http://localhost:3000/api',
      CORS_ORIGIN: 'http://localhost:3001',
      PLUGIN_DIRECTORY: './plugins',
      ENABLE_PLUGIN_HOT_RELOAD: false,
      ENABLE_HTTPS: false,
      SECURE_COOKIES: false,
      SESSION_SECRET: 'default-session-secret',
      ENABLE_METRICS: false,
      METRICS_PORT: 9090,
      ENABLE_HEALTH_CHECKS: false,
      ENABLE_TEST_MODE: false
    };
  }

  /**
   * Get the current environment
   */
  public getEnvironment(): string {
    return this.environment;
  }

  /**
   * Get the complete configuration
   */
  public getConfig(): EnvironmentConfig {
    return { ...this.config };
  }

  /**
   * Get a specific configuration value
   */
  public get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.config[key];
  }

  /**
   * Check if current environment is production
   */
  public isProduction(): boolean {
    return this.config.NODE_ENV === 'production';
  }

  /**
   * Check if current environment is development
   */
  public isDevelopment(): boolean {
    return this.config.NODE_ENV === 'development';
  }

  /**
   * Check if current environment is test
   */
  public isTest(): boolean {
    return this.config.NODE_ENV === 'test';
  }

  /**
   * Validate configuration
   */
  public validate(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Required fields validation
    const requiredFields: (keyof EnvironmentConfig)[] = [
      'NEXTAUTH_SECRET',
      'AUTH_SECRET',
      'SESSION_SECRET'
    ];
    
    for (const field of requiredFields) {
      if (!this.config[field] || this.config[field] === 'default-secret-key') {
        errors.push(`Missing or invalid ${field}`);
      }
    }
    
    // Environment-specific validation
    if (this.isProduction()) {
      if (!this.config.ENABLE_HTTPS) {
        errors.push('HTTPS must be enabled in production');
      }
      if (!this.config.SECURE_COOKIES) {
        errors.push('Secure cookies must be enabled in production');
      }
      if (this.config.LOG_LEVEL === 'debug') {
        errors.push('Debug logging should not be enabled in production');
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Reload configuration (useful for testing)
   */
  public reload(): void {
    this.config = this.loadConfiguration();
  }

  /**
   * Get configuration summary for logging
   */
  public getSummary(): Record<string, any> {
    const { NEXTAUTH_SECRET, AUTH_SECRET, SESSION_SECRET, DB_PASSWORD, ...safeConfig } = this.config;
    
    return {
      environment: this.environment,
      nodeEnv: this.config.NODE_ENV,
      port: this.config.PORT,
      clientPort: this.config.CLIENT_PORT,
      logLevel: this.config.LOG_LEVEL,
      enableDebug: this.config.ENABLE_DEBUG_MODE,
      enableHttps: this.config.ENABLE_HTTPS,
      enableMetrics: this.config.ENABLE_METRICS,
      // Mask sensitive values
      nexauthSecret: NEXTAUTH_SECRET ? '***' : undefined,
      authSecret: AUTH_SECRET ? '***' : undefined,
      sessionSecret: SESSION_SECRET ? '***' : undefined,
      dbPassword: DB_PASSWORD ? '***' : undefined
    };
  }
}

// Export singleton instance
export const env = EnvironmentManager.getInstance(); 