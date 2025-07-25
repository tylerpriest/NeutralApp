import { SystemHealthMetrics, UserStatistics, PluginHealthStatus, SystemReport, ResourceMetrics, PerformanceData, ErrorStatistics, SystemAlert, UserProfile, ActivityLog, AdminAction } from '../types';
export interface IAdminDashboard {
    getSystemHealth(): Promise<SystemHealthMetrics>;
    getUserStatistics(): Promise<UserStatistics>;
    getPluginHealth(): Promise<PluginHealthStatus[]>;
    generateSystemReport(): Promise<SystemReport>;
}
export interface ISystemMonitor {
    getResourceUsage(): Promise<ResourceMetrics>;
    getPerformanceMetrics(): Promise<PerformanceData>;
    getErrorRates(): Promise<ErrorStatistics>;
    subscribeToAlerts(callback: (alert: SystemAlert) => void): () => void;
}
export interface IUserManager {
    getUserProfiles(): Promise<UserProfile[]>;
    getUserActivity(userId: string): Promise<ActivityLog[]>;
    performAdminAction(userId: string, action: AdminAction): Promise<void>;
}
//# sourceMappingURL=admin.interface.d.ts.map