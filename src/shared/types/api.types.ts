// API Response Types

export interface ApiResponse<T = any> {
  data: T;
  success: boolean;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  message: string;
  code: string;
  status: number;
  details?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Authentication Types

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
  expiresIn: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  refreshToken?: string;
  expiresIn: string;
}

// User Types

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  preferences: UserPreferences;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator'
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  notifications: NotificationPreferences;
  dashboard: DashboardPreferences;
}

export interface NotificationPreferences {
  email: boolean;
  push: boolean;
  desktop: boolean;
  categories: {
    security: boolean;
    updates: boolean;
    plugins: boolean;
    system: boolean;
  };
}

export interface DashboardPreferences {
  layout: 'grid' | 'list';
  widgetsPerRow: number;
  defaultWidgets: string[];
  hiddenWidgets: string[];
}

// Plugin Types

export interface Plugin {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
  tags: string[];
  status: PluginStatus;
  manifest: PluginManifest;
  installedAt?: string;
  updatedAt?: string;
  settings?: Record<string, any>;
  health: PluginHealth;
}

export enum PluginStatus {
  AVAILABLE = 'available',
  INSTALLED = 'installed',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  UPDATING = 'updating'
}

export interface PluginManifest {
  name: string;
  version: string;
  description: string;
  author: string;
  main: string;
  permissions: string[];
  dependencies: Record<string, string>;
  categories: string[];
  widgets?: WidgetDefinition[];
  settings?: PluginSetting[];
  minAppVersion?: string;
  maxAppVersion?: string;
}

export interface PluginHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  lastCheck: string;
  responseTime: number;
  errorCount: number;
  uptime: number;
  memoryUsage?: number;
  cpuUsage?: number;
}

export interface PluginSetting {
  key: string;
  label: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
  required: boolean;
  default?: any;
  options?: Array<{ label: string; value: any }>;
  description?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: string;
  };
}

// Widget Types

export interface Widget {
  id: string;
  name: string;
  type: string;
  pluginId: string;
  config: WidgetConfig;
  position: WidgetPosition;
  visible: boolean;
  settings: Record<string, any>;
}

export interface WidgetDefinition {
  id: string;
  name: string;
  description: string;
  component: string;
  defaultSize: WidgetSize;
  minSize: WidgetSize;
  maxSize: WidgetSize;
  settings: PluginSetting[];
  preview?: string;
}

export interface WidgetConfig {
  title?: string;
  showHeader?: boolean;
  refreshInterval?: number;
  autoRefresh?: boolean;
  theme?: 'light' | 'dark' | 'auto';
}

export interface WidgetPosition {
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex?: number;
}

export interface WidgetSize {
  width: number;
  height: number;
}

// Settings Types

export interface SystemSettings {
  app: AppSettings;
  security: SecuritySettings;
  plugins: PluginSettings;
  ui: UISettings;
}

export interface AppSettings {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  debug: boolean;
  analytics: boolean;
  telemetry: boolean;
}

export interface SecuritySettings {
  passwordPolicy: PasswordPolicy;
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  requireMFA: boolean;
  allowedDomains: string[];
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  preventReuse: number;
  expirationDays: number;
}

export interface PluginSettings {
  autoUpdate: boolean;
  allowBeta: boolean;
  maxPlugins: number;
  sandboxMode: boolean;
  trustedSources: string[];
}

export interface UISettings {
  defaultTheme: 'light' | 'dark' | 'auto';
  animations: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

// Health Check Types

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  services: Record<string, ServiceHealth>;
  metrics: SystemMetrics;
  uptime: number;
}

export interface ServiceHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTime?: number;
  lastCheck: string;
  error?: string;
}

export interface SystemMetrics {
  memory: {
    used: number;
    total: number;
    percentage: number;
  };
  cpu: {
    usage: number;
    cores: number;
  };
  disk: {
    used: number;
    total: number;
    percentage: number;
  };
  network: {
    bytesIn: number;
    bytesOut: number;
  };
}

// Error Types

export interface ErrorReport {
  id: string;
  message: string;
  stack?: string;
  context: ErrorContext;
  severity: ErrorSeverity;
  status: ErrorStatus;
  createdAt: string;
  resolvedAt?: string;
}

export interface ErrorContext {
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
  component?: string;
  pluginId?: string;
  action?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export enum ErrorStatus {
  NEW = 'new',
  ACKNOWLEDGED = 'acknowledged',
  INVESTIGATING = 'investigating',
  RESOLVED = 'resolved',
  IGNORED = 'ignored'
}

// File Management Types

export interface FileUpload {
  id: string;
  filename: string;
  originalName: string;
  mimetype: string;
  size: number;
  url: string;
  uploadedBy: string;
  uploadedAt: string;
  metadata?: Record<string, any>;
}

export interface FileUploadRequest {
  file: File;
  category?: string;
  metadata?: Record<string, any>;
  private?: boolean;
}

export interface FileUploadResponse {
  file: FileUpload;
  presignedUrl?: string;
}

// Audit Log Types

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
  success: boolean;
}

// Search Types

export interface SearchRequest {
  query: string;
  filters?: Record<string, any>;
  sort?: SortOptions;
  pagination?: PaginationOptions;
}

export interface SearchResponse<T> {
  results: T[];
  total: number;
  query: string;
  suggestions?: string[];
  facets?: Record<string, SearchFacet[]>;
  pagination: PaginationInfo;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SearchFacet {
  value: string;
  count: number;
  selected?: boolean;
}

// Notification Types

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: string;
  expiresAt?: string;
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  SECURITY = 'security',
  PLUGIN = 'plugin',
  SYSTEM = 'system'
}

// Webhook Types

export interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  active: boolean;
  secret?: string;
  headers?: Record<string, string>;
  retries: number;
  timeout: number;
  createdAt: string;
  lastTriggered?: string;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  event: string;
  payload: Record<string, any>;
  response?: {
    status: number;
    body: string;
    headers: Record<string, string>;
  };
  success: boolean;
  attempts: number;
  timestamp: string;
}