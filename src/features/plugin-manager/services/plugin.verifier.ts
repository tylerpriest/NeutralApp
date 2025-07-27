import { PluginManifest } from '../../../shared';

export interface VerificationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export class PluginVerifier {
  /**
   * Verify plugin manifest and files
   */
  async verifyPlugin(manifest: PluginManifest, pluginPath: string): Promise<VerificationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Basic manifest validation
    if (!manifest.id || typeof manifest.id !== 'string') {
      errors.push('Plugin ID is required and must be a string');
    }

    if (!manifest.name || typeof manifest.name !== 'string') {
      errors.push('Plugin name is required and must be a string');
    }

    if (!manifest.version || typeof manifest.version !== 'string') {
      errors.push('Plugin version is required and must be a string');
    }

    if (!manifest.main || typeof manifest.main !== 'string') {
      errors.push('Plugin main entry point is required and must be a string');
    }

    // Validate version format (basic semver check)
    if (manifest.version && !/^\d+\.\d+\.\d+/.test(manifest.version)) {
      warnings.push('Plugin version should follow semantic versioning (e.g., 1.0.0)');
    }

    // Check for required fields
    if (!manifest.author) {
      warnings.push('Plugin author information is recommended');
    }

    // Basic signature verification (placeholder implementation)
    // Note: PluginManifest doesn't have a signature field, so we'll skip this for now
    warnings.push('Plugin signature verification not implemented - consider adding signature support');

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * Verify plugin dependencies
   */
  async verifyDependencies(manifest: PluginManifest): Promise<VerificationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (manifest.dependencies && manifest.dependencies.length > 0) {
      for (const dependency of manifest.dependencies) {
        if (!dependency.id || typeof dependency.id !== 'string') {
          errors.push('Dependency ID is required and must be a string');
        }
        
        if (!dependency.version || typeof dependency.version !== 'string') {
          errors.push(`Dependency ${dependency.id || 'unknown'} version is required and must be a string`);
        }
        
        // Check for version conflicts (basic check)
        if (dependency.version && dependency.version.includes('*')) {
          warnings.push(`Dependency ${dependency.id} uses wildcard version - consider pinning to specific version`);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
} 