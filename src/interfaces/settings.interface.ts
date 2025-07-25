import { ValidationResult, RecoveryResult } from '../types';

export interface ISettingsService {
  getSetting<T>(key: string, userId?: string): Promise<T | null>;
  setSetting<T>(key: string, value: T, userId?: string): Promise<void>;
  getPluginSettings(pluginId: string): Promise<Record<string, any>>;
  setPluginSetting(pluginId: string, key: string, value: any, userId?: string): Promise<void>;
  resetToDefaults(scope?: string): Promise<void>;
  validateSetting(key: string, value: any): Promise<ValidationResult>;
  recoverCorruptedSettings(): Promise<RecoveryResult>;
  subscribe(key: string, callback: (key: string, value: any, userId: string | null | undefined) => void): () => void;
} 