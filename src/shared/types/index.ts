// Core User Types
export interface User {
  id: string;
  email: string;
  displayName?: string;
  emailVerified: boolean;
  createdAt: Date;
  lastLoginAt: Date;
  settings: UserSettings;
  roles: UserRole[];
}

export interface UserSettings {
  theme: string;
  language: string;
  notifications: boolean;
  [key: string]: any;
}

export interface UserRole {
  id: string;
  name: string;
  permissions: string[];
}

// Authentication Types
export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
  requiresEmailVerification?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface Session {
  user: User;
  token: string;
  expiresAt: Date;
  refreshToken: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  avatar?: string;
  settings: UserSettings;
}

export interface UserMetadata {
  displayName?: string;
  avatar?: string;
  [key: string]: any;
}

// Plugin Types
export type PluginId = string;

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  dependencies: PluginDependency[];
  permissions: Permission[];
  status: PluginStatus;
  installDate: Date;
  settings: PluginSettings;
}

export interface PluginInfo {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  rating: number;
  downloads: number;
  dependencies: PluginDependency[];
  permissions: Permission[];
  status: PluginStatus;
}

export interface PluginPackage {
  id: string;
  version: string;
  code: string;
  manifest: PluginManifest;
  signature: string;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  main: string;
  dependencies: PluginDependency[];
  permissions: Permission[];
  api: string[];
}

export interface PluginDependency {
  id: string;
  version: string;
  required: boolean;
}

export interface Permission {
  name: string;
  description: string;
  required: boolean;
}

export interface PluginSettings {
  [key: string]: any;
}

export enum PluginStatus {
  AVAILABLE = 'available',
  INSTALLED = 'installed',
  ENABLED = 'enabled',
  DISABLED = 'disabled',
  ERROR = 'error'
}

export interface InstallResult {
  success: boolean;
  pluginId: string;
  error?: string;
  dependenciesInstalled?: string[];
}

export interface PluginInstance {
  id: string;
  plugin: Plugin;
  api: any;
  storage: PluginStorage;
}

// UI Component Types
export interface UIComponent {
  id: string;
  name: string;
  type: string;
  component: any; // React component
  props?: Record<string, any>;
  permissions?: string[];
  pluginId?: string;
}

export enum ComponentLocation {
  HEADER = 'header',
  NAVIGATION = 'navigation',
  SIDEBAR = 'sidebar',
  MAIN = 'main',
  FOOTER = 'footer',
  MODAL = 'modal'
}

// Layout Types
export interface LayoutConfig {
  breakpoints: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  containers: {
    maxWidth: string;
    padding: string;
    margin: string;
  };
  grid: {
    columns: number;
    gap: string;
  };
}

export enum ResponsiveBreakpoint {
  MOBILE = 'mobile',
  TABLET = 'tablet',
  DESKTOP = 'desktop'
}

export interface ComponentPosition {
  x: number;
  y: number;
}

export interface ComponentSize {
  width: number;
  height: number;
}

export interface LayoutItem {
  id?: string;
  componentId: string;
  position: ComponentPosition;
  size: ComponentSize;
}

export interface RouteDefinition {
  path: string;
  component: any;
  name: string;
  meta?: Record<string, any>;
  permissions?: string[];
  guards?: NavigationGuard[];
}

export interface RouteInfo {
  path: string;
  name: string;
  params: Record<string, string>;
  query: Record<string, string>;
  meta?: Record<string, any>;
  fullPath: string;
}

export interface NavigationGuard {
  name: string;
  canActivate(to: RouteInfo, from?: RouteInfo | null): boolean | Promise<boolean>;
  canDeactivate(from: RouteInfo, to?: RouteInfo | null): boolean | Promise<boolean>;
  priority: number;
}

// Dashboard Types
export interface DashboardWidget {
  id: string;
  pluginId: string;
  title: string;
  component: any;
  size: WidgetSize;
  position?: WidgetPosition;
  permissions?: string[];
  onError?: (error: Error) => void;
}

export interface WidgetSize {
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
}

export interface WidgetPosition {
  x: number;
  y: number;
  zIndex?: number;
}

export interface DashboardLayout {
  widgets: LayoutItem[];
  grid: GridConfig;
}

export interface GridConfig {
  columns: number;
  rows?: number;
  rowHeight?: number;
  gap: string;
  cellSize?: ComponentSize;
}

// Settings Types
export interface Settings {
  userId?: string | undefined;
  pluginId?: string | undefined;
  key: string;
  value: any;
  type: SettingType;
  validation: ValidationRule[];
  updatedAt: Date;
}

export enum SettingType {
  STRING = 'string',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  OBJECT = 'object',
  ARRAY = 'array'
}

export interface ValidationRule {
  type: string;
  value: any;
  message: string;
}

export interface SettingsSchema {
  [key: string]: SettingDefinition;
}

export interface SettingDefinition {
  type: SettingType;
  default: any;
  validation: ValidationRule[];
  description: string;
  category?: string;
}

export interface RecoveryResult {
  success: boolean;
  recoveredSettings: string[];
  errors: string[];
}

// Plugin Communication Types
export interface PluginEvent {
  type: string;
  data: any;
  timestamp: Date;
  sourceId: string;
  targetId?: string;
}

export interface EventHandler {
  (event: PluginEvent): void | Promise<void>;
}

export interface PluginStorage {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

export interface SecurityViolation {
  pluginId: string;
  type: string;
  description: string;
  timestamp: Date;
  severity: SecuritySeverity;
}

export enum SecuritySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Logging Types
export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  message: string;
  context: LogContext;
  userId?: string;
  pluginId?: string;
  stackTrace?: string;
  metadata: Record<string, any>;
}

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  FATAL = 'fatal'
}

export interface LogContext {
  component: string;
  action: string;
  correlationId?: string;
}

export interface LogQuery {
  level?: LogLevel;
  startDate?: Date;
  endDate?: Date;
  pluginId?: string;
  userId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ErrorContext {
  component: string;
  action: string;
  userId?: string;
  pluginId?: string;
  metadata?: Record<string, any>;
}

export interface ErrorAction {
  label: string;
  action: () => void;
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Testing Types
export interface TestResults {
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  duration: number;
  tests: TestResult[];
}

export interface TestResult {
  name: string;
  status: TestStatus;
  duration: number;
  error?: string;
  stackTrace?: string;
}

export enum TestStatus {
  PASSED = 'passed',
  FAILED = 'failed',
  SKIPPED = 'skipped',
  PENDING = 'pending'
}

export interface PluginTestResults extends TestResults {
  pluginId: string;
  pluginVersion: string;
}

// Admin Dashboard Types
export interface SystemHealthMetrics {
  cpu: number;
  memory: number;
  disk: number;
  uptime: number;
  activeUsers: number;
  activePlugins: number;
  errors: number;
}

export interface UserStatistics {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  userGrowth: number;
}

export interface PluginHealthStatus {
  pluginId: string;
  status: PluginStatus;
  errors: number;
  performance: number;
  lastUpdated: Date;
}

export interface SystemReport {
  timestamp: Date;
  health: SystemHealthMetrics;
  users: UserStatistics;
  plugins: PluginHealthStatus[];
  logs: LogEntry[];
}

export interface ResourceMetrics {
  cpu: number;
  memory: number;
  disk: number;
  network: number;
}

export interface PerformanceData {
  responseTime: number;
  throughput: number;
  errorRate: number;
  availability: number;
}

export interface ErrorStatistics {
  total: number;
  byLevel: Record<LogLevel, number>;
  byPlugin: Record<string, number>;
  recent: LogEntry[];
}

export interface SystemAlert {
  id: string;
  type: string;
  severity: AlertSeverity;
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export enum AlertSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: Date;
  metadata: Record<string, any>;
}

export interface AdminAction {
  type: string;
  description: string;
  confirmation?: boolean;
}

// Welcome Screen Types
export interface WelcomeScreenProps {
  onPluginInstallClick?: () => void;
  onLearnMoreClick?: () => void;
  availablePluginCount?: number;
  systemFeatures?: string[];
}

export interface WelcomeScreenAction {
  id: string;
  label: string;
  action: () => void;
  primary?: boolean;
  icon?: string;
}

export interface WelcomeScreenConfig {
  title: string;
  subtitle: string;
  description: string;
  actions: WelcomeScreenAction[];
  features?: string[];
  showPluginCount?: boolean;
}

// Widget Error Handling Types
export interface WidgetError {
  widgetId: string;
  pluginId: PluginId;
  error: Error;
  timestamp: Date;
  severity: SecuritySeverity;
  retryCount: number;
}

export interface WidgetFallback {
  id: string;
  widgetId: string;
  content: string;
  actions: WidgetFallbackAction[];
  showRetry: boolean;
  showRemove: boolean;
  errorMessage?: string;
}

export interface WidgetFallbackAction {
  id: string;
  label: string;
  action: () => void;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export interface ErrorRecoveryConfig {
  maxRetries: number;
  retryDelayMs: number;
  escalationThreshold: number;
  autoRemoveAfterFailures: number;
}

// Widget and Dashboard Types
export interface Widget {
  id: string;
  pluginId: PluginId;
  name: string;
  description?: string;
  component: string;
  status: WidgetStatus;
  config: WidgetConfig;
  permissions?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface WidgetConfig {
  resizable?: boolean;
  movable?: boolean;
  defaultSize?: ComponentSize;
  defaultPosition?: ComponentPosition;
  minSize?: ComponentSize;
  maxSize?: ComponentSize;
  category?: string;
  tags?: string[];
  settings?: Record<string, any>;
}

export enum WidgetStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  LOADING = 'loading'
} 