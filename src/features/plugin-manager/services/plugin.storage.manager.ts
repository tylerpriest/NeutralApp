import { IPluginStorageManager } from '../interfaces/plugin.interface';
import { PluginStorage } from '../../../shared';

export interface StorageQuota {
  pluginId: string;
  quota: number; // in bytes
  used: number;
  percentage: number;
  lastUpdated: Date;
}

export interface StorageStatistics {
  totalPlugins: number;
  totalUsage: number;
  pluginStorages: Record<string, StorageQuota>;
  averageUsage: number;
  quotaViolations: number;
}

class IsolatedPluginStorage implements PluginStorage {
  private storage: Map<string, any> = new Map();
  private quota: number = Infinity;
  private used: number = 0;
  private readonly pluginId: string;
  private readonly manager: PluginStorageManager;

  constructor(pluginId: string, manager: PluginStorageManager) {
    this.pluginId = pluginId;
    this.manager = manager;
  }

  async get<T>(key: string): Promise<T | null> {
    try {
      const value = this.storage.get(this.getInternalKey(key));
      return value !== undefined ? this.deserializeValue(value) : null;
    } catch (error) {
      console.error(`Storage get error for plugin ${this.pluginId}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    try {
      const internalKey = this.getInternalKey(key);
      const serializedValue = this.serializeValue(value);
      const newSize = this.calculateSize(serializedValue);
      const existingSize = this.storage.has(internalKey) 
        ? this.calculateSize(this.storage.get(internalKey)) 
        : 0;
      
      const sizeChange = newSize - existingSize;
      
      // Check quota before writing
      if (this.used + sizeChange > this.quota) {
        throw new Error(`Storage quota exceeded for plugin ${this.pluginId}. ` +
                       `Used: ${this.used + sizeChange} bytes, Quota: ${this.quota} bytes`);
      }

      // Store the value
      this.storage.set(internalKey, serializedValue);
      this.used += sizeChange;
      
      // Update manager statistics
      this.manager.updatePluginUsage(this.pluginId, this.used);
      
    } catch (error) {
      console.error(`Storage set error for plugin ${this.pluginId}:`, error);
      throw error;
    }
  }

  async delete(key: string): Promise<void> {
    try {
      const internalKey = this.getInternalKey(key);
      if (this.storage.has(internalKey)) {
        const size = this.calculateSize(this.storage.get(internalKey));
        this.storage.delete(internalKey);
        this.used -= size;
        
        // Update manager statistics
        this.manager.updatePluginUsage(this.pluginId, this.used);
      }
    } catch (error) {
      console.error(`Storage delete error for plugin ${this.pluginId}:`, error);
    }
  }

  async clear(): Promise<void> {
    try {
      this.storage.clear();
      this.used = 0;
      
      // Update manager statistics
      this.manager.updatePluginUsage(this.pluginId, 0);
    } catch (error) {
      console.error(`Storage clear error for plugin ${this.pluginId}:`, error);
    }
  }

  async keys(): Promise<string[]> {
    try {
      const prefix = this.getKeyPrefix();
      const keys: string[] = [];
      
      for (const internalKey of this.storage.keys()) {
        if (internalKey.startsWith(prefix)) {
          keys.push(internalKey.substring(prefix.length));
        }
      }
      
      return keys;
    } catch (error) {
      console.error(`Storage keys error for plugin ${this.pluginId}:`, error);
      return [];
    }
  }

  // Internal methods
  private getKeyPrefix(): string {
    return `plugin:${this.pluginId}:`;
  }

  private getInternalKey(key: string): string {
    return `${this.getKeyPrefix()}${key}`;
  }

  private serializeValue(value: any): any {
    // Handle serialization for storage
    try {
      if (value === null || value === undefined) {
        return value;
      }
      
      // Store dates as ISO strings for consistency
      if (value instanceof Date) {
        return { __type: 'Date', value: value.toISOString() };
      }
      
      // Store other objects as-is (assuming they're JSON-serializable)
      return value;
    } catch (error) {
      console.error('Serialization error:', error);
      return value;
    }
  }

  private deserializeValue(value: any): any {
    // Handle deserialization from storage
    try {
      if (value === null || value === undefined) {
        return value;
      }
      
      // Restore dates from serialized format
      if (value && typeof value === 'object' && value.__type === 'Date') {
        return new Date(value.value);
      }
      
      // Return other values as-is
      return value;
    } catch (error) {
      console.error('Deserialization error:', error);
      return value;
    }
  }

  private calculateSize(value: any): number {
    try {
      return JSON.stringify(value).length;
    } catch (error) {
      console.error('Size calculation error:', error);
      return 0;
    }
  }

  setQuota(quota: number): void {
    this.quota = quota;
  }

  getUsage(): { used: number; quota: number; percentage: number } {
    return {
      used: this.used,
      quota: this.quota,
      percentage: this.quota === Infinity ? 0 : (this.used / this.quota) * 100
    };
  }
}

export class PluginStorageManager implements IPluginStorageManager {
  private pluginStorages: Map<string, IsolatedPluginStorage> = new Map();
  private quotas: Map<string, number> = new Map();
  private usageStats: Map<string, number> = new Map();
  private quotaViolations: number = 0;
  private globalStorage: Map<string, any> = new Map(); // Fallback storage
  private corruptedPlugins: Set<string> = new Set();
  private failedPlugins: Set<string> = new Set();

  constructor() {
    this.initializeManager();
  }

  private initializeManager(): void {
    console.log('PluginStorageManager initialized');
  }

  getPluginStorage(pluginId: string): PluginStorage {
    if (!this.pluginStorages.has(pluginId)) {
      const storage = new IsolatedPluginStorage(pluginId, this);
      
      // Apply existing quota if any
      const quota = this.quotas.get(pluginId);
      if (quota !== undefined) {
        storage.setQuota(quota);
      }
      
      this.pluginStorages.set(pluginId, storage);
      this.usageStats.set(pluginId, 0);
    }

    const storage = this.pluginStorages.get(pluginId)!;
    
    // Return fallback storage if plugin is corrupted
    if (this.corruptedPlugins.has(pluginId)) {
      return this.createFallbackStorage(pluginId);
    }
    
    return storage;
  }

  async clearPluginStorage(pluginId: string): Promise<void> {
    try {
      const storage = this.pluginStorages.get(pluginId);
      if (storage) {
        await storage.clear();
      }
      
      // Clean up related data
      this.usageStats.set(pluginId, 0);
      this.corruptedPlugins.delete(pluginId);
      this.failedPlugins.delete(pluginId);
      
      console.log(`Cleared storage for plugin: ${pluginId}`);
    } catch (error) {
      console.error(`Error clearing storage for plugin ${pluginId}:`, error);
      throw error;
    }
  }

  enforceStorageQuota(pluginId: string, quota: number): void {
    this.quotas.set(pluginId, quota);
    
    const storage = this.pluginStorages.get(pluginId);
    if (storage) {
      storage.setQuota(quota);
    }
    
    console.log(`Set storage quota for ${pluginId}: ${quota} bytes`);
  }

  isolatePluginData(pluginId: string): void {
    // Data isolation is already implemented through the key prefixing system
    // This method can be used to add additional isolation measures if needed
    
    const storage = this.pluginStorages.get(pluginId);
    if (storage) {
      console.log(`Plugin data isolated: ${pluginId}`);
    }
  }

  // Internal method called by IsolatedPluginStorage
  updatePluginUsage(pluginId: string, usage: number): void {
    this.usageStats.set(pluginId, usage);
  }

  // Administrative and utility methods
  getStorageUsage(pluginId: string): { used: number; quota: number; percentage: number } {
    const storage = this.pluginStorages.get(pluginId);
    if (storage) {
      return storage.getUsage();
    }
    
    return {
      used: this.usageStats.get(pluginId) || 0,
      quota: this.quotas.get(pluginId) || Infinity,
      percentage: 0
    };
  }

  getStorageStatistics(): StorageStatistics {
    const pluginStorages: Record<string, StorageQuota> = {};
    let totalUsage = 0;
    let pluginCount = 0;

    for (const [pluginId, usage] of this.usageStats.entries()) {
      const quota = this.quotas.get(pluginId) || Infinity;
      const percentage = quota === Infinity ? 0 : (usage / quota) * 100;
      
      pluginStorages[pluginId] = {
        pluginId,
        quota,
        used: usage,
        percentage,
        lastUpdated: new Date()
      };
      
      totalUsage += usage;
      pluginCount++;
    }

    return {
      totalPlugins: pluginCount,
      totalUsage,
      pluginStorages,
      averageUsage: pluginCount > 0 ? totalUsage / pluginCount : 0,
      quotaViolations: this.quotaViolations
    };
  }

  getAllStorageKeys(): string[] {
    const allKeys: string[] = [];
    
    for (const storage of this.pluginStorages.values()) {
      try {
        // Access internal storage keys
        const internalKeys = Array.from((storage as any).storage.keys());
        allKeys.push(...(internalKeys as string[]));
      } catch (error) {
        console.error('Error accessing storage keys:', error);
      }
    }
    
    return allKeys;
  }

  // Error simulation and recovery methods for testing
  simulateStorageCorruption(pluginId: string): void {
    this.corruptedPlugins.add(pluginId);
    console.warn(`Simulated storage corruption for plugin: ${pluginId}`);
  }

  simulateStorageFailure(pluginId: string): void {
    this.failedPlugins.add(pluginId);
    console.warn(`Simulated storage failure for plugin: ${pluginId}`);
  }

  private createFallbackStorage(pluginId: string): PluginStorage {
    const fallbackKey = `fallback:${pluginId}`;
    const manager = this;
    
    return {
      async get<T>(key: string): Promise<T | null> {
        const fullKey = `${fallbackKey}:${key}`;
        const value = manager.globalStorage.get(fullKey);
        return value !== undefined ? value : null;
      },

      async set<T>(key: string, value: T): Promise<void> {
        const fullKey = `${fallbackKey}:${key}`;
        manager.globalStorage.set(fullKey, value);
        console.warn(`Using fallback storage for ${pluginId}:${key}`);
      },

      async delete(key: string): Promise<void> {
        const fullKey = `${fallbackKey}:${key}`;
        manager.globalStorage.delete(fullKey);
      },

      async clear(): Promise<void> {
        const keysToDelete: string[] = [];
        for (const key of manager.globalStorage.keys()) {
          if (key.startsWith(fallbackKey)) {
            keysToDelete.push(key);
          }
        }
        keysToDelete.forEach(key => manager.globalStorage.delete(key));
      },

      async keys(): Promise<string[]> {
        const keys: string[] = [];
        const prefix = `${fallbackKey}:`;
        
        for (const key of manager.globalStorage.keys()) {
          if (key.startsWith(prefix)) {
            keys.push(key.substring(prefix.length));
          }
        }
        
        return keys;
      }
    };
  }

  // Health check and monitoring
  healthCheck(): {
    isHealthy: boolean;
    totalPlugins: number;
    corruptedPlugins: number;
    failedPlugins: number;
    quotaViolations: number;
    totalUsage: number;
  } {
    return {
      isHealthy: this.corruptedPlugins.size === 0 && this.failedPlugins.size === 0,
      totalPlugins: this.pluginStorages.size,
      corruptedPlugins: this.corruptedPlugins.size,
      failedPlugins: this.failedPlugins.size,
      quotaViolations: this.quotaViolations,
      totalUsage: Array.from(this.usageStats.values()).reduce((sum, usage) => sum + usage, 0)
    };
  }

  // Plugin lifecycle management
  unloadPlugin(pluginId: string): void {
    // Keep the storage data but remove the active storage instance
    this.pluginStorages.delete(pluginId);
    console.log(`Unloaded storage for plugin: ${pluginId}`);
  }

  // Maintenance operations
  compactStorage(): Promise<void> {
    return new Promise((resolve) => {
      // Simulate storage compaction
      console.log('Compacting plugin storage...');
      setTimeout(() => {
        console.log('Storage compaction complete');
        resolve();
      }, 100);
    });
  }

  exportPluginData(pluginId: string): Promise<Record<string, any>> {
    return new Promise(async (resolve) => {
      try {
        const storage = this.getPluginStorage(pluginId);
        const keys = await storage.keys();
        const data: Record<string, any> = {};
        
        for (const key of keys) {
          data[key] = await storage.get(key);
        }
        
        resolve(data);
      } catch (error) {
        console.error(`Error exporting data for plugin ${pluginId}:`, error);
        resolve({});
      }
    });
  }

  importPluginData(pluginId: string, data: Record<string, any>): Promise<void> {
    return new Promise(async (resolve, reject) => {
      try {
        const storage = this.getPluginStorage(pluginId);
        
        for (const [key, value] of Object.entries(data)) {
          await storage.set(key, value);
        }
        
        console.log(`Imported data for plugin: ${pluginId}`);
        resolve();
      } catch (error) {
        console.error(`Error importing data for plugin ${pluginId}:`, error);
        reject(error);
      }
    });
  }

  // Cleanup and destruction
  destroy(): void {
    this.pluginStorages.clear();
    this.quotas.clear();
    this.usageStats.clear();
    this.globalStorage.clear();
    this.corruptedPlugins.clear();
    this.failedPlugins.clear();
    this.quotaViolations = 0;
    console.log('PluginStorageManager destroyed');
  }
} 