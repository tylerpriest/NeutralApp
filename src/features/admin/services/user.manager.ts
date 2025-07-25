import { IUserManager } from '../interfaces/admin.interface';
import {
  UserProfile,
  ActivityLog,
  AdminAction
} from '../../../shared';

export class UserManager implements IUserManager {
  private mockUsers: Map<string, UserProfile> = new Map();
  private mockActivityLogs: Map<string, ActivityLog[]> = new Map();

  constructor() {
    this.initializeMockData();
  }

  private initializeMockData(): void {
    // Create some mock users
    const users: UserProfile[] = [
      {
        id: 'user1',
        email: 'alice@example.com',
        displayName: 'Alice Johnson',
        avatar: 'https://example.com/avatars/alice.jpg',
        settings: {
          theme: 'dark',
          language: 'en',
          notifications: true,
          timezone: 'America/New_York'
        }
      },
      {
        id: 'user2',
        email: 'bob@example.com',
        displayName: 'Bob Smith',
        avatar: 'https://example.com/avatars/bob.jpg',
        settings: {
          theme: 'light',
          language: 'en',
          notifications: false,
          timezone: 'Europe/London'
        }
      },
      {
        id: 'user3',
        email: 'carol@example.com',
        displayName: 'Carol Williams',
        settings: {
          theme: 'auto',
          language: 'es',
          notifications: true,
          timezone: 'America/Los_Angeles'
        }
      },
      {
        id: 'admin1',
        email: 'admin@example.com',
        displayName: 'System Administrator',
        avatar: 'https://example.com/avatars/admin.jpg',
        settings: {
          theme: 'dark',
          language: 'en',
          notifications: true,
          timezone: 'UTC',
          adminMode: true
        }
      }
    ];

    // Store users in map
    users.forEach(user => {
      this.mockUsers.set(user.id, user);
      this.generateMockActivityForUser(user.id);
    });
  }

  private generateMockActivityForUser(userId: string): void {
    const activities: ActivityLog[] = [];
    const now = Date.now();

    // Generate various types of activities
    const activityTypes = [
      { action: 'login', resource: 'auth' },
      { action: 'logout', resource: 'auth' },
      { action: 'update_profile', resource: 'user_settings' },
      { action: 'install_plugin', resource: 'plugin_manager' },
      { action: 'uninstall_plugin', resource: 'plugin_manager' },
      { action: 'view_dashboard', resource: 'dashboard' },
      { action: 'change_settings', resource: 'user_settings' },
      { action: 'upload_file', resource: 'file_manager' }
    ];

    // Generate 10-20 activities per user
    const activityCount = 10 + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < activityCount; i++) {
      const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
      const timestamp = new Date(now - (i * 3600000) - Math.random() * 3600000); // Spread over time
      
      const activity: ActivityLog = {
        id: `activity_${userId}_${i}`,
        userId,
        action: activityType?.action || 'unknown',
        resource: activityType?.resource || 'unknown',
        timestamp,
        metadata: this.generateActivityMetadata(activityType?.action || 'unknown')
      };

      activities.push(activity);
    }

    // Sort by timestamp (most recent first)
    activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    this.mockActivityLogs.set(userId, activities);
  }

  private generateActivityMetadata(action: string): Record<string, any> {
    const metadata: Record<string, any> = {
      userAgent: 'Mozilla/5.0 (Platform) Browser/Version',
      ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
      sessionId: `session_${Math.random().toString(36).substr(2, 9)}`
    };

    switch (action) {
      case 'login':
        metadata.method = Math.random() > 0.5 ? 'password' : 'oauth';
        metadata.successful = Math.random() > 0.1; // 90% success rate
        break;
      case 'install_plugin':
      case 'uninstall_plugin':
        metadata.pluginId = `plugin_${Math.floor(Math.random() * 5) + 1}`;
        metadata.version = `${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 10)}.0`;
        break;
      case 'update_profile':
        metadata.fieldsChanged = ['displayName', 'avatar'].filter(() => Math.random() > 0.5);
        break;
      case 'change_settings':
        metadata.settingsChanged = ['theme', 'language', 'notifications'].filter(() => Math.random() > 0.5);
        break;
      case 'upload_file':
        metadata.fileName = `document_${Math.floor(Math.random() * 100)}.pdf`;
        metadata.fileSize = Math.floor(Math.random() * 10000000); // Up to 10MB
        break;
    }

    return metadata;
  }

  async getUserProfiles(): Promise<UserProfile[]> {
    // Return all users except sensitive admin fields
    return Array.from(this.mockUsers.values()).map(user => {
      const { settings, ...publicProfile } = user;
      return {
        ...publicProfile,
        settings: {
          theme: settings.theme,
          language: settings.language,
          notifications: settings.notifications
          // Exclude sensitive settings like adminMode
        }
      };
    });
  }

  async getUserActivity(userId: string): Promise<ActivityLog[]> {
    const activities = this.mockActivityLogs.get(userId);
    if (!activities) {
      console.warn(`No activity found for user: ${userId}`);
      return [];
    }

    // Return the activities, optionally filtered/paginated
    return activities.slice(0, 50); // Return last 50 activities
  }

  async performAdminAction(userId: string, action: AdminAction): Promise<void> {
    const user = this.mockUsers.get(userId);
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }

    console.log(`Performing admin action on user ${userId}:`, action);

    // Simulate different admin actions
    switch (action.type) {
      case 'suspend_user':
        await this.suspendUser(userId, action);
        break;
      case 'activate_user':
        await this.activateUser(userId, action);
        break;
      case 'delete_user':
        await this.deleteUser(userId, action);
        break;
      case 'reset_password':
        await this.resetUserPassword(userId, action);
        break;
      case 'update_profile':
        await this.updateUserProfile(userId, action);
        break;
      case 'clear_sessions':
        await this.clearUserSessions(userId, action);
        break;
      default:
        throw new Error(`Unknown admin action type: ${action.type}`);
    }

    // Log the admin action as an activity
    const adminActivity: ActivityLog = {
      id: `admin_action_${Date.now()}`,
      userId,
      action: `admin_${action.type}`,
      resource: 'admin_panel',
      timestamp: new Date(),
      metadata: {
        adminAction: action,
        performedBy: 'admin', // In real implementation, this would be the admin user ID
        description: action.description
      }
    };

    const userActivities = this.mockActivityLogs.get(userId) || [];
    userActivities.unshift(adminActivity); // Add to beginning
    this.mockActivityLogs.set(userId, userActivities);
  }

  private async suspendUser(userId: string, action: AdminAction): Promise<void> {
    const user = this.mockUsers.get(userId);
    if (user) {
      user.settings = { ...user.settings, suspended: true, suspensionReason: action.description };
      this.mockUsers.set(userId, user);
      console.log(`User ${userId} suspended: ${action.description}`);
    }
  }

  private async activateUser(userId: string, action: AdminAction): Promise<void> {
    const user = this.mockUsers.get(userId);
    if (user) {
      user.settings = { ...user.settings, suspended: false };
      delete user.settings.suspensionReason;
      this.mockUsers.set(userId, user);
      console.log(`User ${userId} activated: ${action.description}`);
    }
  }

  private async deleteUser(userId: string, action: AdminAction): Promise<void> {
    // In a real implementation, this would mark for deletion rather than immediate deletion
    console.log(`User ${userId} marked for deletion: ${action.description}`);
    
    // Mark user as deleted instead of removing from map (for audit purposes)
    const user = this.mockUsers.get(userId);
    if (user) {
      user.settings = { ...user.settings, deleted: true, deletionReason: action.description };
      this.mockUsers.set(userId, user);
    }
  }

  private async resetUserPassword(userId: string, action: AdminAction): Promise<void> {
    console.log(`Password reset initiated for user ${userId}: ${action.description}`);
    
    // In real implementation, this would generate a reset token and send email
    const user = this.mockUsers.get(userId);
    if (user) {
      user.settings = { ...user.settings, passwordResetPending: true };
      this.mockUsers.set(userId, user);
    }
  }

  private async updateUserProfile(userId: string, action: AdminAction): Promise<void> {
    const user = this.mockUsers.get(userId);
    if (user && action.description) {
      // Parse update data from description (in real implementation, this would be in metadata)
      console.log(`User profile updated for ${userId}: ${action.description}`);
      
      // Simulate profile update
      user.settings = { ...user.settings, lastAdminUpdate: new Date().toISOString() };
      this.mockUsers.set(userId, user);
    }
  }

  private async clearUserSessions(userId: string, action: AdminAction): Promise<void> {
    console.log(`All sessions cleared for user ${userId}: ${action.description}`);
    
    // In real implementation, this would invalidate all active sessions
    const user = this.mockUsers.get(userId);
    if (user) {
      user.settings = { ...user.settings, sessionsClearedAt: new Date().toISOString() };
      this.mockUsers.set(userId, user);
    }
  }

  // Utility methods for testing and data management
  addMockUser(userProfile: UserProfile): void {
    this.mockUsers.set(userProfile.id, userProfile);
    this.generateMockActivityForUser(userProfile.id);
  }

  removeMockUser(userId: string): void {
    this.mockUsers.delete(userId);
    this.mockActivityLogs.delete(userId);
  }

  getUserById(userId: string): UserProfile | undefined {
    return this.mockUsers.get(userId);
  }

  getMockUserCount(): number {
    return this.mockUsers.size;
  }

  addUserActivity(userId: string, activity: Partial<ActivityLog>): void {
    const fullActivity: ActivityLog = {
      id: activity.id || `manual_${Date.now()}`,
      userId,
      action: activity.action || 'manual_action',
      resource: activity.resource || 'test',
      timestamp: activity.timestamp || new Date(),
      metadata: activity.metadata || {}
    };

    const userActivities = this.mockActivityLogs.get(userId) || [];
    userActivities.unshift(fullActivity);
    this.mockActivityLogs.set(userId, userActivities);
  }

  clearAllMockData(): void {
    this.mockUsers.clear();
    this.mockActivityLogs.clear();
    this.initializeMockData();
  }

  getActiveUserCount(): number {
    return Array.from(this.mockUsers.values())
      .filter(user => !user.settings.suspended && !user.settings.deleted).length;
  }

  getSuspendedUserCount(): number {
    return Array.from(this.mockUsers.values())
      .filter(user => user.settings.suspended).length;
  }
} 