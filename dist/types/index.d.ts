export interface User {
    id: string;
    email: string;
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
export declare enum PluginStatus {
    AVAILABLE = "available",
    INSTALLED = "installed",
    ENABLED = "enabled",
    DISABLED = "disabled",
    ERROR = "error"
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
export interface UIComponent {
    id: string;
    pluginId: string;
    component: any;
    location: ComponentLocation;
    permissions?: string[];
}
export declare enum ComponentLocation {
    HEADER = "header",
    SIDEBAR = "sidebar",
    MAIN = "main",
    FOOTER = "footer",
    MODAL = "modal"
}
export interface RouteDefinition {
    path: string;
    component: any;
    permissions?: string[];
    guards?: NavigationGuard[];
}
export interface RouteInfo {
    path: string;
    params: Record<string, string>;
    query: Record<string, string>;
}
export interface NavigationGuard {
    canActivate(route: RouteInfo): boolean | Promise<boolean>;
}
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
    widgets: DashboardWidget[];
    grid: GridConfig;
}
export interface GridConfig {
    columns: number;
    rowHeight: number;
    gap: number;
}
export interface Settings {
    userId?: string;
    pluginId?: string;
    key: string;
    value: any;
    type: SettingType;
    validation: ValidationRule[];
    updatedAt: Date;
}
export declare enum SettingType {
    STRING = "string",
    NUMBER = "number",
    BOOLEAN = "boolean",
    OBJECT = "object",
    ARRAY = "array"
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
export declare enum SecuritySeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
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
export declare enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error",
    FATAL = "fatal"
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
export declare enum ErrorSeverity {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high",
    CRITICAL = "critical"
}
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
export declare enum TestStatus {
    PASSED = "passed",
    FAILED = "failed",
    SKIPPED = "skipped",
    PENDING = "pending"
}
export interface PluginTestResults extends TestResults {
    pluginId: string;
    pluginVersion: string;
}
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
export declare enum AlertSeverity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    CRITICAL = "critical"
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
//# sourceMappingURL=index.d.ts.map