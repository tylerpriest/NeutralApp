import { ValidationResult, RecoveryResult } from '../types';
export interface ISettingsService {
    getSetting<T>(key: string): Promise<T | null>;
    setSetting<T>(key: string, value: T): Promise<void>;
    getPluginSettings(pluginId: string): Promise<Record<string, any>>;
    setPluginSetting(pluginId: string, key: string, value: any): Promise<void>;
    resetToDefaults(scope?: string): Promise<void>;
    validateSetting(key: string, value: any): Promise<ValidationResult>;
    recoverCorruptedSettings(): Promise<RecoveryResult>;
}
//# sourceMappingURL=settings.interface.d.ts.map