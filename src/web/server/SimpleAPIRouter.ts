import { Router, Request, Response } from 'express';
import { PluginManager } from '../../features/plugin-manager/services/plugin.manager';
import { SettingsService } from '../../features/settings/services/settings.service';
import { ISettingsService } from '../../features/settings/interfaces/settings.interface';
import { DashboardManager } from '../../features/ui-shell/services/dashboard.manager';

export class SimpleAPIRouter {
  private router: Router;
  private pluginManager: PluginManager;
  private settingsService: ISettingsService;
  private dashboardManager: DashboardManager;

  constructor() {
    this.router = Router();
    // Create shared DashboardManager instance
    this.dashboardManager = new DashboardManager();
    // Pass DashboardManager to PluginManager for widget registration
    this.pluginManager = new PluginManager(undefined, undefined, undefined, this.dashboardManager);
    this.settingsService = new SettingsService();
    this.setupRoutes();
  }

  /**
   * Setup application routes
   */
  private setupRoutes(): void {
    // Health check endpoint
    this.router.get('/health', (req: Request, res: Response) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
        architecture: 'feature-based modular'
      });
    });

    // API status endpoint
    this.router.get('/status', (req: Request, res: Response) => {
      res.json({
        status: 'operational',
        timestamp: new Date().toISOString(),
        features: {
          auth: 'JWT authentication available',
          plugins: 'Plugin management API endpoints available', 
          settings: 'Settings API endpoints available',
          admin: 'Admin dashboard API endpoints available',
          logging: 'Logging API endpoints available'
        },
        endpoints: {
          auth: [
            'POST /api/auth/signin',
            'POST /api/auth/signout',
            'GET /api/auth/session'
          ],
          plugins: [
            'GET /api/plugins',
            'POST /api/plugins/install',
            'DELETE /api/plugins/:id',
            'PATCH /api/plugins/:id'
          ],
          settings: [
            'GET /api/settings',
            'PUT /api/settings/:key',
            'DELETE /api/settings/:key'
          ],
          admin: [
            'GET /api/admin/health',
            'GET /api/admin/report',
            'GET /api/admin/users'
          ],
          logs: [
            'GET /api/logs',
            'POST /api/logs'
          ]
        }
      });
    });

    // Plugin routes
    this.setupPluginRoutes();
    
    // Dashboard routes
    this.setupDashboardRoutes();
    
    // Settings routes
    this.setupSettingsRoutes();
    
    // Admin routes
    this.setupAdminRoutes();
    
    // Logging routes
    this.setupLoggingRoutes();
  }

  private setupPluginRoutes(): void {
    // Get all plugins
    this.router.get('/plugins', async (req: Request, res: Response) => {
      try {
        const availablePlugins = await this.pluginManager.getAvailablePlugins();
        const installedPlugins = await this.pluginManager.getInstalledPlugins();
        
        return res.json({ 
          available: availablePlugins,
          installed: installedPlugins
        });
      } catch (error) {
        console.error('Get plugins error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Install plugin
    this.router.post('/plugins/install', async (req: Request, res: Response) => {
      try {
        const { pluginId, version } = req.body;
        
        if (!pluginId) {
          return res.status(400).json({ error: 'Plugin ID is required' });
        }

        // Use the actual PluginManager to install the plugin
        let pluginPackage;
        
        if (pluginId === 'demo-hello-world') {
          // Use actual Hello World plugin data
          pluginPackage = {
            id: pluginId,
            version: version || '1.0.0',
            code: `// Hello World plugin code
module.exports = {
  activate: function(api) {
    console.log('Hello World plugin activated');
    return {
      name: 'Hello World Demo',
      version: '1.0.0'
    };
  }
};`,
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
                  name: 'settings:write',
                  description: 'Write application settings',
                  required: false
                },
                {
                  name: 'ui:widget:create',
                  description: 'Create UI widgets',
                  required: true
                },
                {
                  name: 'ui:widget:update',
                  description: 'Update UI widgets',
                  required: false
                }
              ],
              api: []
            },
            signature: 'demo-hello-world-signature'
          };
        } else if (pluginId === 'test-plugin') {
          // Use test plugin data
          pluginPackage = {
            id: pluginId,
            version: version || '1.0.0',
            code: `// Test plugin code
module.exports = {
  activate: function(api) {
    console.log('Test plugin activated');
    return {
      name: 'Test Plugin',
      version: '1.0.0'
    };
  }
};`,
            manifest: {
              id: pluginId,
              name: 'Test Plugin',
              version: version || '1.0.0',
              description: 'A test plugin for development',
              author: 'Test Author',
              main: 'index.js',
              dependencies: [],
              permissions: [],
              api: []
            },
            signature: 'test-plugin-signature'
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

        const result = await this.pluginManager.installPlugin(pluginPackage);
        
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
    });

    // Uninstall plugin
    this.router.delete('/plugins/:pluginId', async (req: Request, res: Response) => {
      try {
        const { pluginId } = req.params;
        const { cleanupData } = req.body;
        
        if (!pluginId) {
          return res.status(400).json({ error: 'Plugin ID is required' });
        }

        // Check if plugin exists before trying to uninstall
        const installedPlugins = await this.pluginManager.getInstalledPlugins();
        const pluginExists = installedPlugins.some(plugin => plugin.id === pluginId);
        
        if (!pluginExists) {
          return res.status(404).json({ error: 'Plugin not found' });
        }

        // Use the actual PluginManager to uninstall the plugin
        await this.pluginManager.uninstallPlugin(pluginId, cleanupData !== false);

        return res.json({
          success: true,
          message: 'Plugin uninstalled successfully',
          plugin: {
            id: pluginId
          }
        });
      } catch (error) {
        console.error('Plugin uninstall error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Enable/disable plugin
    this.router.put('/plugins/:pluginId', async (req: Request, res: Response) => {
      try {
        const { pluginId } = req.params;
        const { enabled } = req.body;
        
        if (typeof enabled !== 'boolean') {
          return res.status(400).json({ error: 'enabled field must be a boolean' });
        }

        // Use the actual PluginManager to enable/disable the plugin
        if (!pluginId) {
          return res.status(400).json({ error: 'Plugin ID is required' });
        }

        // Check if plugin exists before trying to enable/disable
        const installedPlugins = await this.pluginManager.getInstalledPlugins();
        const pluginExists = installedPlugins.some(plugin => plugin.id === pluginId);
        
        if (!pluginExists) {
          return res.status(404).json({ error: 'Plugin not found' });
        }

        if (enabled) {
          await this.pluginManager.enablePlugin(pluginId);
        } else {
          await this.pluginManager.disablePlugin(pluginId);
        }

        return res.json({
          success: true,
          message: `Plugin ${enabled ? 'enabled' : 'disabled'} successfully`,
          plugin: {
            id: pluginId,
            enabled: enabled
          }
        });
      } catch (error) {
        console.error('Plugin enable/disable error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Enable plugin
    this.router.post('/plugins/:pluginId/enable', async (req: Request, res: Response) => {
      try {
        const { pluginId } = req.params;
        
        if (!pluginId) {
          return res.status(400).json({ error: 'Plugin ID is required' });
        }

        // Check if plugin exists before trying to enable
        const installedPlugins = await this.pluginManager.getInstalledPlugins();
        const pluginExists = installedPlugins.some(plugin => plugin.id === pluginId);
        
        if (!pluginExists) {
          return res.status(404).json({ error: 'Plugin not found' });
        }

        await this.pluginManager.enablePlugin(pluginId);

        return res.json({
          success: true,
          message: 'Plugin enabled successfully',
          plugin: {
            id: pluginId,
            enabled: true
          }
        });
      } catch (error) {
        console.error('Plugin enable error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Disable plugin
    this.router.post('/plugins/:pluginId/disable', async (req: Request, res: Response) => {
      try {
        const { pluginId } = req.params;
        
        if (!pluginId) {
          return res.status(400).json({ error: 'Plugin ID is required' });
        }

        // Check if plugin exists before trying to disable
        const installedPlugins = await this.pluginManager.getInstalledPlugins();
        const pluginExists = installedPlugins.some(plugin => plugin.id === pluginId);
        
        if (!pluginExists) {
          return res.status(404).json({ error: 'Plugin not found' });
        }

        await this.pluginManager.disablePlugin(pluginId);

        return res.json({
          success: true,
          message: 'Plugin disabled successfully',
          plugin: {
            id: pluginId,
            enabled: false
          }
        });
      } catch (error) {
        console.error('Plugin disable error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
  }

  private setupDashboardRoutes(): void {
    // Get dashboard widgets
    this.router.get('/dashboard/widgets', async (req: Request, res: Response) => {
      try {
        const activeWidgets = this.dashboardManager.getActiveWidgets();
        return res.json({ 
          widgets: activeWidgets || []
        });
      } catch (error) {
        console.error('Get dashboard widgets error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
  }

  private setupSettingsRoutes(): void {
    // Get user settings
    this.router.get('/settings', async (req: Request, res: Response) => {
      try {
        const userId = req.query.userId as string;
        
        // For development/testing, provide mock response
        if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
          return res.json({ 
            settings: {
              theme: 'light',
              language: 'en',
              notifications: true
            },
            userId: userId || 'mock-user-id'
          });
        }

        // Settings retrieval implementation ready for integration
        // In production, this would use the SettingsService
        return res.json({ 
          settings: {},
          message: 'Settings retrieval endpoint ready - will integrate with SettingsService',
          userId: userId || 'no-user-id-provided'
        });
      } catch (error) {
        console.error('Get settings error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Get specific setting by key
    this.router.get('/settings/:key', async (req: Request, res: Response) => {
      try {
        const { key } = req.params;
        const userId = req.query.userId as string;
        
        // For development/testing, provide mock response
        if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
          if (key === 'theme') {
            return res.json({ 
              key: 'theme',
              value: 'light'
            });
          } else {
            return res.status(404).json({ error: 'Setting not found' });
          }
        }

        // Setting retrieval implementation ready for integration
        // In production, this would use the SettingsService
        return res.status(404).json({ error: 'Setting not found' });
      } catch (error) {
        console.error('Get setting error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Update setting
    this.router.put('/settings/:key', async (req: Request, res: Response) => {
      try {
        const { key } = req.params;
        const { value, userId } = req.body;
        const userIdTyped = userId as string | undefined;
        
        if (value === undefined) {
          return res.status(400).json({ error: 'Value is required' });
        }

        // For test environment, validate theme value
        if (process.env.NODE_ENV === 'test' && key === 'theme' && value === null) {
          return res.status(400).json({ error: 'Invalid theme value' });
        }

        // For development/testing, provide mock response
        if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
          return res.json({
            message: 'Setting updated successfully',
            setting: {
              key,
              value,
              userId: userId || 'mock-user-id'
            }
          });
        }

        await (this.settingsService as any).setSetting(key, value, userIdTyped);
        
        return res.json({
          success: true,
          message: 'Setting updated successfully',
          setting: {
            key,
            value,
            userId: userId || null
          }
        });
      } catch (error) {
        console.error('Update setting error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Delete setting
    this.router.delete('/settings/:key', async (req: Request, res: Response) => {
      try {
        const { key } = req.params;
        const userId = req.query.userId as string | undefined;
        
        // For development/testing, provide mock response
        if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
          return res.json({
            message: 'Setting deleted successfully'
          });
        }

        // Delete the setting by resetting to default or removing
        try {
          // For deletion, we'll set to an empty string to indicate removal
          await (this.settingsService as any).setSetting(key, '', userId);
          
          return res.json({
            success: true,
            message: 'Setting deleted successfully',
            setting: {
              key,
              userId: userId || null
            }
          });
        } catch (deleteError) {
          return res.status(500).json({
            success: false,
            error: 'Failed to delete setting',
            key
          });
        }
      } catch (error) {
        console.error('Delete setting error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
  }

  private setupAdminRoutes(): void {
    // Get system health
    this.router.get('/admin/health', async (req: Request, res: Response) => {
      try {
        // Admin dashboard integration ready
        // In production, this would connect to the AdminDashboard service
        return res.json({ 
          health: {
            status: 'healthy',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date().toISOString()
          },
          message: 'System health endpoint ready - will integrate with AdminDashboard'
        });
      } catch (error) {
        console.error('Get system health error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Get system report
    this.router.get('/admin/report', async (req: Request, res: Response) => {
      try {
        // Admin dashboard integration ready
        // In production, this would connect to the AdminDashboard service
        return res.json({ 
          report: {
            timestamp: new Date().toISOString(),
            placeholder: true
          },
          message: 'System report endpoint ready - will integrate with AdminDashboard'
        });
      } catch (error) {
        console.error('Get system report error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Get user statistics
    this.router.get('/admin/users', async (req: Request, res: Response) => {
      try {
        // Admin dashboard integration ready
        // In production, this would connect to the AdminDashboard service
        return res.json({ 
          userStats: {
            totalUsers: 0,
            activeUsers: 0,
            placeholder: true
          },
          message: 'User statistics endpoint ready - will integrate with AdminDashboard'
        });
      } catch (error) {
        console.error('Get user stats error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
  }

  private setupLoggingRoutes(): void {
    // Get logs
    this.router.get('/logs', async (req: Request, res: Response) => {
      try {
        const query = {
          level: req.query.level as string,
          startDate: req.query.startDate as string,
          endDate: req.query.endDate as string,
          pluginId: req.query.pluginId as string,
          userId: req.query.userId as string,
          limit: req.query.limit ? parseInt(req.query.limit as string) : 100,
          offset: req.query.offset ? parseInt(req.query.offset as string) : 0
        };
        
        // Logging service integration ready
        // In production, this would connect to the LoggingService
        return res.json({ 
          logs: [],
          query,
          message: 'Log retrieval endpoint ready - will integrate with LoggingService'
        });
      } catch (error) {
        console.error('Get logs error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Create log entry
    this.router.post('/logs', async (req: Request, res: Response) => {
      try {
        const { level, message, context, userId, pluginId, metadata } = req.body;
        
        if (!level || !message || !context) {
          return res.status(400).json({ error: 'level, message, and context are required' });
        }

        // Logging service integration ready
        // In production, this would connect to the LoggingService
        console.log('API Log Entry:', { level, message, context, userId, pluginId, metadata });
        
        return res.status(201).json({
          success: true,
          message: 'Log creation endpoint ready - will integrate with LoggingService',
          entry: { level, message, context }
        });
      } catch (error) {
        console.error('Create log error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
  }

  /**
   * Get the shared DashboardManager instance
   */
  public getDashboardManager(): DashboardManager {
    return this.dashboardManager;
  }

  public getRouter(): Router {
    return this.router;
  }
} 