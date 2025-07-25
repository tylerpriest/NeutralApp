import { PluginInfo, PluginPackage, InstallResult, PluginDependency, PluginEvent, EventHandler, PluginStorage, SecurityViolation, UIComponent, SettingsSchema, DashboardWidget, PluginInstance } from '../types';
export interface IPluginManager {
    getAvailablePlugins(): Promise<PluginInfo[]>;
    installPlugin(pluginPackage: PluginPackage): Promise<InstallResult>;
    enablePlugin(pluginId: string): Promise<void>;
    disablePlugin(pluginId: string): Promise<void>;
    uninstallPlugin(pluginId: string, cleanupData?: boolean): Promise<void>;
    getInstalledPlugins(): Promise<PluginInfo[]>;
    resolveDependencies(pluginId: string): Promise<PluginDependency[]>;
    downloadAndVerifyPlugin(pluginId: string): Promise<PluginPackage>;
    handlePluginFailure(pluginId: string, error: Error): void;
}
export interface IPluginAPI {
    registerUIComponent(component: UIComponent): void;
    registerSettingsSchema(schema: SettingsSchema): void;
    registerDashboardWidget(widget: DashboardWidget): void;
    emitEvent(event: PluginEvent): void;
    subscribeToEvent(eventType: string, handler: EventHandler): void;
    getPluginStorage(): PluginStorage;
    logSecurityViolation(violation: SecurityViolation): void;
}
export interface IPluginSandbox {
    loadPlugin(pluginId: string, pluginCode: string): Promise<PluginInstance>;
    unloadPlugin(pluginId: string): Promise<void>;
    executeInSandbox(pluginId: string, operation: () => any): Promise<any>;
    restrictAPI(pluginId: string, allowedAPIs: string[]): void;
}
export interface IPluginAPIGateway {
    exposeAPI(apiName: string, implementation: any): void;
    revokeAPI(apiName: string): void;
    checkPermission(pluginId: string, apiName: string): boolean;
    logAPIAccess(pluginId: string, apiName: string, success: boolean): void;
}
export interface IPluginEventBus {
    publish(event: PluginEvent, publisherId: string): void;
    subscribe(eventType: string, subscriberId: string, handler: EventHandler): void;
    unsubscribe(eventType: string, subscriberId: string): void;
    validateEventPermissions(publisherId: string, eventType: string): boolean;
}
export interface IPluginStorageManager {
    getPluginStorage(pluginId: string): PluginStorage;
    clearPluginStorage(pluginId: string): Promise<void>;
    enforceStorageQuota(pluginId: string, quota: number): void;
    isolatePluginData(pluginId: string): void;
}
//# sourceMappingURL=plugin.interface.d.ts.map