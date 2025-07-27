export * from './core';
export * from './shared';
export interface AppConfig {
    port?: number;
    environment?: 'development' | 'production' | 'test';
    features?: {
        auth?: boolean;
        plugins?: boolean;
        admin?: boolean;
    };
}
export declare class NeutralApp {
    private config;
    private isInitialized;
    constructor(config?: AppConfig);
    initialize(): Promise<void>;
    private registerCoreServices;
    private initializeAuth;
    private initializePluginManager;
    private initializeAdmin;
    start(): Promise<void>;
    stop(): Promise<void>;
    health(): Promise<any>;
    get isStarted(): boolean;
}
export declare const neutralApp: NeutralApp;
export default NeutralApp;
//# sourceMappingURL=index.d.ts.map