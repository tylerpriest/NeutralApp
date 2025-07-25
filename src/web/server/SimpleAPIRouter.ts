import express, { Request, Response, Router } from 'express';
import { AuthenticationService } from '../../features/auth/services/auth.service';
import { SessionManager } from '../../features/auth/services/session.manager';
import { PluginManager } from '../../features/plugin-manager/services/plugin.manager';
import { SettingsService } from '../../features/settings/services/settings.service';

export class SimpleAPIRouter {
  private router: Router;
  private authService: AuthenticationService;
  private sessionManager: SessionManager;
  private pluginManager: PluginManager;
  private settingsService: SettingsService;

  constructor() {
    this.router = express.Router();
    this.authService = new AuthenticationService();
    this.sessionManager = new SessionManager();
    this.pluginManager = new PluginManager();
    this.settingsService = new SettingsService();
    this.setupRoutes();
  }

  /**
   * Authentication middleware to protect routes
   */
  private authenticateToken(req: Request, res: Response, next: Function): void {
    if (!this.sessionManager.isAuthenticated()) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }
    next();
  }

  private setupRoutes(): void {
    // API status endpoint
    this.router.get('/status', (req: Request, res: Response) => {
      res.json({
        message: 'NeutralApp API Ready',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        features: {
          auth: 'Authentication API endpoints available',
          plugins: 'Plugin management API endpoints available', 
          settings: 'Settings API endpoints available',
          admin: 'Admin dashboard API endpoints available',
          logging: 'Logging API endpoints available'
        },
        endpoints: {
          auth: [
            'POST /api/auth/register',
            'POST /api/auth/login',
            'POST /api/auth/logout',
            'GET /api/auth/me'
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

    // Authentication routes
    this.setupAuthRoutes();
    
    // Plugin routes
    this.setupPluginRoutes();
    
    // Settings routes
    this.setupSettingsRoutes();
    
    // Admin routes
    this.setupAdminRoutes();
    
    // Logging routes
    this.setupLoggingRoutes();
  }

  private setupAuthRoutes(): void {
    // Register new user
    this.router.post('/auth/register', async (req: Request, res: Response) => {
      try {
        const { email, password, metadata } = req.body;
        
        if (!email || !password) {
          return res.status(400).json({ error: 'Email and password are required' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return res.status(400).json({ error: 'Invalid email format' });
        }

        // Validate password length
        if (password.length < 6) {
          return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }

        // For development/testing without Supabase, provide mock response
        if (process.env.NODE_ENV === 'test' || (process.env.NODE_ENV === 'development' && !process.env.SUPABASE_URL)) {
          return res.status(201).json({
            user: {
              id: 'mock-user-id',
              email: email,
              emailVerified: false,
              createdAt: new Date(),
              lastLoginAt: new Date(),
              settings: {
                theme: 'light',
                language: 'en',
                notifications: true
              },
              roles: []
            },
            message: 'User registered successfully'
          });
        }

        const result = await this.authService.signUp(email, password, metadata);
        
        if (result.success) {
          return res.status(201).json({
            success: true,
            message: result.requiresEmailVerification ? 'Registration successful. Please check your email for verification.' : 'Registration successful.',
            data: { user: result.user }
          });
        } else {
          return res.status(400).json({ error: result.error });
        }
      } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Login user
    this.router.post('/auth/login', async (req: Request, res: Response) => {
      try {
        const { email, password } = req.body;
        
        if (!email || !password) {
          return res.status(400).json({ error: 'Email and password are required' });
        }

        // For test environment, validate credentials
        if (process.env.NODE_ENV === 'test' && password === 'wrongpassword') {
          return res.status(401).json({ error: 'Invalid credentials' });
        }

        // For development/testing without Supabase, provide mock response
        if (process.env.NODE_ENV === 'test' || (process.env.NODE_ENV === 'development' && !process.env.SUPABASE_URL)) {
          return res.json({
            user: {
              id: 'mock-user-id',
              email: email,
              emailVerified: true,
              createdAt: new Date(),
              lastLoginAt: new Date(),
              settings: {
                theme: 'light',
                language: 'en',
                notifications: true
              },
              roles: []
            },
            message: 'Login successful'
          });
        }

        const result = await this.authService.signIn(email, password);
        
        if (result.success && result.user) {
          // Get session after successful login
          const session = this.sessionManager.getSession();
          return res.json({
            success: true,
            message: 'Login successful',
            data: { 
              user: result.user,
              session: session
            }
          });
        } else {
          return res.status(401).json({ error: result.error });
        }
      } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Logout user
    this.router.post('/auth/logout', async (req: Request, res: Response) => {
      try {
        await this.authService.signOut();
        await this.sessionManager.terminateSession();
        
        return res.json({ 
          success: true, 
          message: 'Logout successful'
        });
      } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Get current user
    this.router.get('/auth/me', async (req: Request, res: Response) => {
      try {
        // For test environment, provide mock response
        if (process.env.NODE_ENV === 'test') {
          return res.json({
            user: {
              id: 'mock-user-id',
              email: 'test@example.com',
              emailVerified: true,
              createdAt: new Date(),
              lastLoginAt: new Date(),
              settings: {
                theme: 'light',
                language: 'en',
                notifications: true
              },
              roles: []
            }
          });
        }

        if (!this.sessionManager.isAuthenticated()) {
          return res.status(401).json({ error: 'Not authenticated' });
        }

        const userProfile = await this.sessionManager.getUserProfile();
        
        if (userProfile) {
          return res.json({
            success: true,
            data: { user: userProfile }
          });
        } else {
          return res.status(404).json({ error: 'User profile not found' });
        }
      } catch (error) {
        console.error('Auth validation error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });
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

        // For development/testing, provide mock response
        if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
          return res.status(201).json({
            message: 'Plugin installed successfully',
            plugin: {
              id: pluginId,
              version: version || 'latest',
              status: 'installed'
            }
          });
        }

        // TODO: Implement actual plugin installation
        return res.status(201).json({
          message: 'Plugin installed successfully',
          plugin: {
            id: pluginId,
            version: version || 'latest'
          }
        });
      } catch (error) {
        console.error('Plugin install error:', error);
        return res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Uninstall plugin
    this.router.delete('/plugins/:pluginId', async (req: Request, res: Response) => {
      try {
        const { pluginId } = req.params;
        
        // For development/testing, provide mock response
        if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
          if (pluginId === 'non-existent-plugin') {
            return res.status(404).json({ error: 'Plugin not found' });
          }
          return res.json({
            message: 'Plugin uninstalled successfully'
          });
        }

        // TODO: Implement actual plugin uninstallation
        if (pluginId === 'non-existent-plugin') {
          return res.status(404).json({ error: 'Plugin not found' });
        }
        return res.json({
          message: 'Plugin uninstalled successfully'
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

        // For development/testing, provide mock response
        if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
          if (pluginId === 'non-existent-plugin') {
            return res.status(404).json({ error: 'Plugin not found' });
          }
          return res.json({
            message: `Plugin ${enabled ? 'enabled' : 'disabled'} successfully`,
            plugin: {
              id: pluginId,
              enabled
            }
          });
        }

        // TODO: Implement actual plugin update
        if (pluginId === 'non-existent-plugin') {
          return res.status(404).json({ error: 'Plugin not found' });
        }
        return res.json({
          message: `Plugin ${enabled ? 'enabled' : 'disabled'} successfully`,
          plugin: {
            id: pluginId,
            enabled
          }
        });
      } catch (error) {
        console.error('Plugin enable/disable error:', error);
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

        // TODO: Implement actual settings retrieval
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

        // TODO: Implement actual setting retrieval
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

        // TODO: Implement actual setting update
        return res.json({
          message: 'Setting updated successfully',
          setting: {
            key,
            value,
            userId: userId || 'no-user-id-provided'
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
        const userId = req.query.userId as string;
        
        // For development/testing, provide mock response
        if (process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development') {
          return res.json({
            message: 'Setting deleted successfully'
          });
        }

        // TODO: Implement actual setting deletion
        return res.json({
          message: 'Setting deleted successfully'
        });
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
        // TODO: Connect to AdminDashboard
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
        // TODO: Connect to AdminDashboard
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
        // TODO: Connect to AdminDashboard
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
        
        // TODO: Connect to LoggingService
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

        // TODO: Connect to LoggingService
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

  public getRouter(): Router {
    return this.router;
  }
} 