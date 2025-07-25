"use strict";
// NeutralApp Main Entry Point - Feature-Based Architecture
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
exports.NeutralApp = exports.ErrorRecoveryService = exports.LoggingService = exports.SystemReportGenerator = exports.SystemMonitor = exports.UserManager = exports.AdminDashboard = exports.SettingsService = exports.WidgetRegistry = exports.DashboardManager = exports.LayoutManager = exports.NavigationManager = exports.ContinuousTestingService = exports.TestRunner = exports.PluginTestManager = exports.PluginVerifier = exports.PluginHealthMonitor = exports.PluginStorageManager = exports.PluginEventBus = exports.DependencyResolver = exports.PluginManager = exports.SessionManager = exports.AuthenticationService = void 0;
// Shared Infrastructure (exported first to avoid conflicts)
__exportStar(require("./shared"), exports);
// TODO: Add core exports when event bus and DI are implemented
// export * from './core';
// Feature Module Service Exports (avoiding interface conflicts with shared types)
var auth_1 = require("./features/auth");
Object.defineProperty(exports, "AuthenticationService", { enumerable: true, get: function () { return auth_1.AuthenticationService; } });
Object.defineProperty(exports, "SessionManager", { enumerable: true, get: function () { return auth_1.SessionManager; } });
var plugin_manager_1 = require("./features/plugin-manager");
Object.defineProperty(exports, "PluginManager", { enumerable: true, get: function () { return plugin_manager_1.PluginManager; } });
Object.defineProperty(exports, "DependencyResolver", { enumerable: true, get: function () { return plugin_manager_1.DependencyResolver; } });
Object.defineProperty(exports, "PluginEventBus", { enumerable: true, get: function () { return plugin_manager_1.PluginEventBus; } });
Object.defineProperty(exports, "PluginStorageManager", { enumerable: true, get: function () { return plugin_manager_1.PluginStorageManager; } });
Object.defineProperty(exports, "PluginHealthMonitor", { enumerable: true, get: function () { return plugin_manager_1.PluginHealthMonitor; } });
Object.defineProperty(exports, "PluginVerifier", { enumerable: true, get: function () { return plugin_manager_1.PluginVerifier; } });
Object.defineProperty(exports, "PluginTestManager", { enumerable: true, get: function () { return plugin_manager_1.PluginTestManager; } });
Object.defineProperty(exports, "TestRunner", { enumerable: true, get: function () { return plugin_manager_1.TestRunner; } });
Object.defineProperty(exports, "ContinuousTestingService", { enumerable: true, get: function () { return plugin_manager_1.ContinuousTestingService; } });
var ui_shell_1 = require("./features/ui-shell");
Object.defineProperty(exports, "NavigationManager", { enumerable: true, get: function () { return ui_shell_1.NavigationManager; } });
Object.defineProperty(exports, "LayoutManager", { enumerable: true, get: function () { return ui_shell_1.LayoutManager; } });
Object.defineProperty(exports, "DashboardManager", { enumerable: true, get: function () { return ui_shell_1.DashboardManager; } });
Object.defineProperty(exports, "WidgetRegistry", { enumerable: true, get: function () { return ui_shell_1.WidgetRegistry; } });
var settings_1 = require("./features/settings");
Object.defineProperty(exports, "SettingsService", { enumerable: true, get: function () { return settings_1.SettingsService; } });
var admin_1 = require("./features/admin");
Object.defineProperty(exports, "AdminDashboard", { enumerable: true, get: function () { return admin_1.AdminDashboard; } });
Object.defineProperty(exports, "UserManager", { enumerable: true, get: function () { return admin_1.UserManager; } });
Object.defineProperty(exports, "SystemMonitor", { enumerable: true, get: function () { return admin_1.SystemMonitor; } });
Object.defineProperty(exports, "SystemReportGenerator", { enumerable: true, get: function () { return admin_1.SystemReportGenerator; } });
var error_reporter_1 = require("./features/error-reporter");
Object.defineProperty(exports, "LoggingService", { enumerable: true, get: function () { return error_reporter_1.LoggingService; } });
Object.defineProperty(exports, "ErrorRecoveryService", { enumerable: true, get: function () { return error_reporter_1.ErrorRecoveryService; } });
// Main application class (to be implemented)
class NeutralApp {
    constructor() {
        // TODO: Initialize core services
    }
    async initialize() {
        // TODO: Initialize application
        console.log('NeutralApp initializing...');
    }
    async start() {
        // TODO: Start application
        console.log('NeutralApp starting...');
    }
}
exports.NeutralApp = NeutralApp;
//# sourceMappingURL=index.js.map