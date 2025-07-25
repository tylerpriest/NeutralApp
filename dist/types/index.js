"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertSeverity = exports.TestStatus = exports.ErrorSeverity = exports.LogLevel = exports.SecuritySeverity = exports.SettingType = exports.ComponentLocation = exports.PluginStatus = void 0;
var PluginStatus;
(function (PluginStatus) {
    PluginStatus["AVAILABLE"] = "available";
    PluginStatus["INSTALLED"] = "installed";
    PluginStatus["ENABLED"] = "enabled";
    PluginStatus["DISABLED"] = "disabled";
    PluginStatus["ERROR"] = "error";
})(PluginStatus || (exports.PluginStatus = PluginStatus = {}));
var ComponentLocation;
(function (ComponentLocation) {
    ComponentLocation["HEADER"] = "header";
    ComponentLocation["SIDEBAR"] = "sidebar";
    ComponentLocation["MAIN"] = "main";
    ComponentLocation["FOOTER"] = "footer";
    ComponentLocation["MODAL"] = "modal";
})(ComponentLocation || (exports.ComponentLocation = ComponentLocation = {}));
var SettingType;
(function (SettingType) {
    SettingType["STRING"] = "string";
    SettingType["NUMBER"] = "number";
    SettingType["BOOLEAN"] = "boolean";
    SettingType["OBJECT"] = "object";
    SettingType["ARRAY"] = "array";
})(SettingType || (exports.SettingType = SettingType = {}));
var SecuritySeverity;
(function (SecuritySeverity) {
    SecuritySeverity["LOW"] = "low";
    SecuritySeverity["MEDIUM"] = "medium";
    SecuritySeverity["HIGH"] = "high";
    SecuritySeverity["CRITICAL"] = "critical";
})(SecuritySeverity || (exports.SecuritySeverity = SecuritySeverity = {}));
var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
    LogLevel["FATAL"] = "fatal";
})(LogLevel || (exports.LogLevel = LogLevel = {}));
var ErrorSeverity;
(function (ErrorSeverity) {
    ErrorSeverity["LOW"] = "low";
    ErrorSeverity["MEDIUM"] = "medium";
    ErrorSeverity["HIGH"] = "high";
    ErrorSeverity["CRITICAL"] = "critical";
})(ErrorSeverity || (exports.ErrorSeverity = ErrorSeverity = {}));
var TestStatus;
(function (TestStatus) {
    TestStatus["PASSED"] = "passed";
    TestStatus["FAILED"] = "failed";
    TestStatus["SKIPPED"] = "skipped";
    TestStatus["PENDING"] = "pending";
})(TestStatus || (exports.TestStatus = TestStatus = {}));
var AlertSeverity;
(function (AlertSeverity) {
    AlertSeverity["INFO"] = "info";
    AlertSeverity["WARNING"] = "warning";
    AlertSeverity["ERROR"] = "error";
    AlertSeverity["CRITICAL"] = "critical";
})(AlertSeverity || (exports.AlertSeverity = AlertSeverity = {}));
//# sourceMappingURL=index.js.map