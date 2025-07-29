/**
 * Plugin Dependency Management Interface
 * Industry-standard dependency resolution and version management
 */

export interface PluginDependency {
  id: string;
  version: string;
  required: boolean;
  minVersion?: string;
  maxVersion?: string;
  reason?: string; // Why this dependency is needed
}

export interface VersionConstraint {
  operator: '=' | '>' | '>=' | '<' | '<=' | '~' | '^';
  version: string;
}

export interface PluginVersion {
  version: string;
  releaseDate: string;
  changelog?: string;
  breaking: boolean;
  deprecated: boolean;
  dependencies: PluginDependency[];
  apiCompatibility: string[]; // Compatible API versions
}

export interface PluginPackDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  repository?: string;
  license: string;
  
  // Pack metadata
  icon: string;
  category: string;
  tags: string[];
  
  // Plugin composition
  plugins: PluginPackItem[];
  
  // Dependencies
  dependencies: PluginDependency[];
  peerDependencies: PluginDependency[];
  optionalDependencies: PluginDependency[];
  
  // Version info
  versions: PluginVersion[];
  latestVersion: string;
  stableVersion: string;
  
  // Installation
  installationOrder: string[]; // Plugin IDs in order
  configurationSteps?: ConfigurationStep[];
  
  // Compatibility
  minAppVersion: string;
  maxAppVersion?: string;
  platformSupport: PlatformSupport[];
}

export interface PluginPackItem {
  pluginId: string;
  version: string;
  required: boolean;
  installOrder: number;
  config?: Record<string, any>;
}

export interface ConfigurationStep {
  id: string;
  title: string;
  description: string;
  type: 'input' | 'select' | 'checkbox' | 'file' | 'custom';
  required: boolean;
  defaultValue?: any;
  options?: Array<{ label: string; value: any }>;
  validation?: ValidationRule[];
}

export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
  value?: any;
  message: string;
}

export interface PlatformSupport {
  platform: 'web' | 'desktop' | 'mobile' | 'server';
  minVersion?: string;
  features?: string[];
}

export interface DependencyGraph {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  cycles: string[][]; // Circular dependency paths
  resolutionOrder: string[]; // Installation order
}

export interface DependencyNode {
  id: string;
  version: string;
  type: 'plugin' | 'pack';
  installed: boolean;
  available: boolean;
}

export interface DependencyEdge {
  from: string;
  to: string;
  type: 'required' | 'optional' | 'peer';
  constraint: VersionConstraint;
}

export interface ResolutionResult {
  success: boolean;
  installationPlan?: InstallationPlan;
  conflicts?: DependencyConflict[];
  warnings?: string[];
  errors?: string[];
}

export interface InstallationPlan {
  steps: InstallationStep[];
  totalPlugins: number;
  totalPacks: number;
  estimatedTime: number; // minutes
  diskSpaceRequired: number; // bytes
}

export interface InstallationStep {
  id: string;
  type: 'download' | 'install' | 'configure' | 'activate';
  pluginId?: string;
  packId?: string;
  description: string;
  order: number;
  dependencies: string[]; // Step IDs this depends on
}

export interface DependencyConflict {
  type: 'version' | 'peer' | 'circular' | 'missing';
  pluginId: string;
  description: string;
  suggestions: string[];
  severity: 'error' | 'warning';
}

export interface IDependencyManager {
  // Pack management
  registerPack(pack: PluginPackDefinition): Promise<void>;
  unregisterPack(packId: string): Promise<void>;
  getPackDefinition(packId: string): Promise<PluginPackDefinition | null>;
  listAvailablePacks(): Promise<PluginPackDefinition[]>;
  
  // Dependency resolution
  resolveDependencies(packId: string, version?: string): Promise<ResolutionResult>;
  createInstallationPlan(packId: string, version?: string): Promise<InstallationPlan>;
  
  // Graph analysis
  buildDependencyGraph(rootPackId: string): Promise<DependencyGraph>;
  detectCircularDependencies(packId: string): Promise<string[][]>;
  findDependents(pluginId: string): Promise<string[]>; // What depends on this plugin
  
  // Version management
  compareVersions(version1: string, version2: string): number;
  satisfiesConstraint(version: string, constraint: VersionConstraint): boolean;
  findBestVersion(pluginId: string, constraints: VersionConstraint[]): Promise<string | null>;
  
  // Installation management
  executeInstallationPlan(plan: InstallationPlan): Promise<InstallationResult>;
  validateInstallation(packId: string): Promise<ValidationResult>;
  
  // Upgrade management
  checkForUpdates(packId?: string): Promise<UpdateInfo[]>;
  createUpgradePlan(packId: string, targetVersion: string): Promise<InstallationPlan>;
  
  // Cleanup
  findOrphanedDependencies(): Promise<string[]>; // Plugins no longer needed
  cleanupOrphans(): Promise<string[]>; // Remove orphaned plugins
}

export interface InstallationResult {
  success: boolean;
  installedPlugins: string[];
  failedPlugins: Array<{ pluginId: string; error: string }>;
  warnings: string[];
  rollbackRequired: boolean;
}

export interface ValidationResult {
  valid: boolean;
  missingDependencies: string[];
  versionConflicts: DependencyConflict[];
  configurationIssues: string[];
  suggestions: string[];
}

export interface UpdateInfo {
  packId: string;
  currentVersion: string;
  latestVersion: string;
  updateType: 'major' | 'minor' | 'patch';
  breaking: boolean;
  changelog?: string;
  dependencies: PluginDependency[];
}