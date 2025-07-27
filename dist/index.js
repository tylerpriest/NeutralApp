"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.neutralApp = exports.NeutralApp = void 0;
const core_1 = require("./core");
const event_bus_1 = require("./core/event-bus");
const dependency_injection_1 = require("./core/dependency-injection");
// Core exports
__exportStar(require("./core"), exports);
__exportStar(require("./shared"), exports);
// Default configuration
const defaultConfig = {
    port: 3000,
    environment: 'development',
    features: {
        auth: true,
        plugins: true,
        admin: true
    }
};
// NeutralApp main class
class NeutralApp {
    constructor(config = {}) {
        this.isInitialized = false;
        this.config = { ...defaultConfig, ...config };
    }
    async initialize() {
        if (this.isInitialized) {
            throw new Error('NeutralApp is already initialized');
        }
        console.log('🚀 Initializing NeutralApp...');
        console.log(`Environment: ${this.config.environment}`);
        console.log(`Port: ${this.config.port}`);
        // Register core services
        await this.registerCoreServices();
        // Initialize features based on configuration
        if (this.config.features?.auth) {
            await this.initializeAuth();
        }
        if (this.config.features?.plugins) {
            await this.initializePluginManager();
        }
        if (this.config.features?.admin) {
            await this.initializeAdmin();
        }
        this.isInitialized = true;
        console.log('✅ NeutralApp initialized successfully');
    }
    async registerCoreServices() {
        // Register event bus as a core service
        const eventBusService = {
            name: 'event-bus',
            version: '1.0.0',
            start: async () => {
                console.log('Event bus service started');
            },
            stop: async () => {
                event_bus_1.eventBus.clear();
                console.log('Event bus service stopped');
            },
            health: async () => ({
                status: 'healthy',
                details: { eventTypes: event_bus_1.eventBus.eventTypes }
            })
        };
        // Register dependency injection container as a core service
        const containerService = {
            name: 'dependency-injection',
            version: '1.0.0',
            start: async () => {
                console.log('Dependency injection service started');
            },
            stop: async () => {
                dependency_injection_1.container.clear();
                console.log('Dependency injection service stopped');
            },
            health: async () => ({
                status: 'healthy',
                details: { registeredServices: dependency_injection_1.container.registeredServices }
            })
        };
        core_1.coreApp.registerService(eventBusService);
        core_1.coreApp.registerService(containerService);
    }
    async initializeAuth() {
        console.log('🔐 Initializing authentication...');
        // Auth initialization logic would go here
        console.log('✅ Authentication initialized');
    }
    async initializePluginManager() {
        console.log('🔌 Initializing plugin manager...');
        // Plugin manager initialization logic would go here
        console.log('✅ Plugin manager initialized');
    }
    async initializeAdmin() {
        console.log('⚙️ Initializing admin dashboard...');
        // Admin dashboard initialization logic would go here
        console.log('✅ Admin dashboard initialized');
    }
    async start() {
        if (!this.isInitialized) {
            await this.initialize();
        }
        console.log('🚀 Starting NeutralApp...');
        await core_1.coreApp.start();
        console.log('✅ NeutralApp started successfully');
    }
    async stop() {
        console.log('🛑 Stopping NeutralApp...');
        await core_1.coreApp.stop();
        this.isInitialized = false;
        console.log('✅ NeutralApp stopped successfully');
    }
    async health() {
        return await core_1.coreApp.health();
    }
    get isStarted() {
        return core_1.coreApp.isStarted;
    }
}
exports.NeutralApp = NeutralApp;
// Export singleton instance
exports.neutralApp = new NeutralApp();
// Default export
exports.default = NeutralApp;
//# sourceMappingURL=index.js.map