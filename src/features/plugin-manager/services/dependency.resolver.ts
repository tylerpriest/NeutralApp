import { PluginDependency } from '../../../shared';
import { createLogger } from '../../../core/logger';
import { getPluginInfo, validatePlugin } from '../../../plugins';

export class DependencyResolver {
  private logger = createLogger('DependencyResolver');
  private resolvedCache = new Map<string, PluginDependency[]>();

  async resolveDependencies(pluginId: string): Promise<PluginDependency[]> {
    try {
      // Check cache first
      if (this.resolvedCache.has(pluginId)) {
        this.logger.debug(`Using cached dependencies for plugin`, { pluginId });
        return this.resolvedCache.get(pluginId)!;
      }
      
      this.logger.info(`Resolving dependencies for plugin`, { pluginId });
      
      // Validate plugin exists
      if (!validatePlugin(pluginId)) {
        this.logger.warn(`Plugin not found in registry`, { pluginId });
        return [];
      }
      
      // Get plugin info from registry
      const pluginInfo = getPluginInfo(pluginId);
      if (!pluginInfo) {
        this.logger.debug(`No plugin info found`, { pluginId });
        return [];
      }
      
      // For now, return empty dependencies since PluginRegistryInfo doesn't have dependencies field
      // In a full implementation, this would be extended to include dependency information
      this.logger.debug(`No dependencies configured for plugin`, { pluginId });
      
      const dependencies: PluginDependency[] = [];
      
      // Cache the result
      this.resolvedCache.set(pluginId, dependencies);
      
      this.logger.info(`Resolved dependencies`, { 
        pluginId, 
        dependencyCount: dependencies.length
      });
      
      return dependencies;
    } catch (error) {
      this.logger.error(`Error resolving dependencies`, { pluginId, error });
      return [];
    }
  }

  async checkDependencyConflicts(dependencies: PluginDependency[]): Promise<string[]> {
    const conflicts: string[] = [];
    
    try {
      this.logger.debug(`Checking dependency conflicts`, { dependencyCount: dependencies.length });
      
      // Group dependencies by ID to check for version conflicts
      const dependencyGroups = new Map<string, PluginDependency[]>();
      
      for (const dep of dependencies) {
        if (!dependencyGroups.has(dep.id)) {
          dependencyGroups.set(dep.id, []);
        }
        dependencyGroups.get(dep.id)!.push(dep);
      }
      
      // Check each group for conflicts
      for (const [depId, depVersions] of dependencyGroups) {
        if (depVersions.length > 1) {
          // Multiple versions of the same dependency
          const versions = depVersions.map(d => d.version).filter(v => v);
          const uniqueVersions = [...new Set(versions)];
          
          if (uniqueVersions.length > 1) {
            conflicts.push(
              `Version conflict for dependency '${depId}': requires versions ${uniqueVersions.join(', ')}`
            );
            this.logger.warn(`Version conflict detected`, { depId, versions: uniqueVersions });
          }
        }
      }
      
      this.logger.info(`Dependency conflict check completed`, { 
        conflictCount: conflicts.length,
        conflicts
      });
      
      return conflicts;
    } catch (error) {
      this.logger.error(`Error checking dependency conflicts`, { error });
      return [`Error checking conflicts: ${error instanceof Error ? error.message : 'Unknown error'}`];
    }
  }

  async getInstallOrder(dependencies: PluginDependency[]): Promise<string[]> {
    try {
      this.logger.debug(`Computing install order`, { dependencyCount: dependencies.length });
      
      if (dependencies.length === 0) {
        return [];
      }
      
      // For now, return simple ordering by dependency ID
      // In a full implementation, this would use topological sort for proper dependency ordering
      const result = dependencies.map(dep => dep.id);
      
      this.logger.info(`Install order computed`, { 
        order: result,
        dependencyCount: result.length
      });
      
      return result;
    } catch (error) {
      this.logger.error(`Error computing install order`, { error });
      // Fall back to simple ordering
      return dependencies.map(dep => dep.id);
    }
  }
  
  public clearCache(): void {
    this.resolvedCache.clear();
    this.logger.debug(`Dependency resolution cache cleared`);
  }
} 