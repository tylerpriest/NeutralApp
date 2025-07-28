import { VercelRequest, VercelResponse } from '@vercel/node';
import { PluginManager } from '../../src/features/plugin-manager/services/plugin.manager';
import { DashboardManager } from '../../src/features/ui-shell/services/dashboard.manager';
import { SettingsService } from '../../src/features/settings/services/settings.service';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pluginId, version } = req.body;
    
    if (!pluginId) {
      return res.status(400).json({ error: 'Plugin ID is required' });
    }

    // Create instances
    const settingsService = new SettingsService();
    const dashboardManager = new DashboardManager();
    const pluginManager = new PluginManager(undefined, undefined, undefined, dashboardManager, settingsService);

    // Use the same plugin package logic as SimpleAPIRouter
    let pluginPackage;
    
    if (pluginId === 'demo-hello-world') {
      pluginPackage = {
        id: pluginId,
        version: version || '1.0.0',
        code: `// Hello World plugin code`,
        manifest: {
          id: pluginId,
          name: 'Hello World Demo',
          version: version || '1.0.0',
          description: 'A simple demo plugin to validate the plugin system',
          author: 'NeutralApp Team',
          main: 'demo-hello-world.js',
          dependencies: [],
          permissions: [
            {
              name: 'settings:read',
              description: 'Read application settings',
              required: false
            },
            {
              name: 'ui:widget:create',
              description: 'Create UI widgets',
              required: true
            }
          ],
          api: []
        },
        signature: 'demo-hello-world-signature'
      };
    } else {
      // Fallback for other plugins
      pluginPackage = {
        id: pluginId,
        version: version || 'latest',
        code: `// Mock plugin code for ${pluginId}`,
        manifest: {
          id: pluginId,
          name: pluginId,
          version: version || 'latest',
          description: `Test plugin for ${pluginId}`,
          author: 'Test Author',
          main: 'index.js',
          dependencies: [],
          permissions: [],
          api: []
        },
        signature: 'mock-signature'
      };
    }

    const result = await pluginManager.installPlugin(pluginPackage);
    
    if (result.success) {
      return res.status(201).json({
        success: true,
        message: 'Plugin installed successfully',
        plugin: {
          id: result.pluginId,
          version: version || 'latest'
        }
      });
    } else {
      return res.status(400).json({
        error: result.error || 'Plugin installation failed'
      });
    }
  } catch (error) {
    console.error('Plugin install error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}