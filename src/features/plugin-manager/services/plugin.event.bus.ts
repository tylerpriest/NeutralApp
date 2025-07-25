import { IPluginEventBus } from '../interfaces/plugin.interface';
import {
  PluginEvent,
  EventHandler,
  SecurityViolation,
  SecuritySeverity
} from '../../../shared';

export interface EventSubscription {
  eventType: string;
  subscriberId: string;
  handler: EventHandler;
  subscriptionTime: Date;
}

export interface EventPermission {
  pluginId: string;
  eventType: string;
  granted: boolean;
  grantedAt: Date;
  grantedBy?: string;
}

export interface EventStatistics {
  totalEvents: number;
  subscriberCount: number;
  eventTypes: string[];
  publisherStats: Record<string, number>;
  subscriberStats: Record<string, number>;
  averageEventSize: number;
  lastEventTime?: Date;
}

export class PluginEventBus implements IPluginEventBus {
  private subscriptions: Map<string, EventSubscription[]> = new Map();
  private permissions: Map<string, Set<string>> = new Map();
  private eventHistory: PluginEvent[] = [];
  private securityViolations: SecurityViolation[] = [];
  private eventStats: EventStatistics = {
    totalEvents: 0,
    subscriberCount: 0,
    eventTypes: [],
    publisherStats: {},
    subscriberStats: {},
    averageEventSize: 0
  };

  private readonly MAX_HISTORY_SIZE = 1000;
  private readonly RESTRICTED_EVENT_TYPES = [
    'system-admin',
    'system-critical',
    'user-data-access',
    'plugin-install',
    'plugin-uninstall',
    'security-alert'
  ];

  constructor() {
    this.initializeDefaultPermissions();
  }

  private initializeDefaultPermissions(): void {
    // Grant basic permissions to trusted system components
    this.grantPermission('system', 'system-admin');
    this.grantPermission('system', 'system-critical');
    this.grantPermission('auth-service', 'user-data-access');
    this.grantPermission('plugin-manager', 'plugin-install');
    this.grantPermission('plugin-manager', 'plugin-uninstall');
  }

  publish(event: PluginEvent, publisherId: string): void {
    try {
      // Validate publisher permissions
      if (!this.validateEventPermissions(publisherId, event.type)) {
        this.logSecurityViolation({
          pluginId: publisherId,
          type: 'unauthorized_event_publish',
          description: `Plugin ${publisherId} attempted to publish restricted event type: ${event.type}`,
          timestamp: new Date(),
          severity: SecuritySeverity.HIGH
        });
        return;
      }

      // Ensure event has proper structure
      const validatedEvent: PluginEvent = {
        ...event,
        sourceId: publisherId,
        timestamp: event.timestamp || new Date()
      };

      // Add to history
      this.addToHistory(validatedEvent);

      // Update statistics
      this.updatePublishStatistics(publisherId, validatedEvent);

      // Deliver to subscribers
      this.deliverEvent(validatedEvent);

      console.log(`Event published: ${event.type} by ${publisherId}`);
    } catch (error) {
      console.error('Error publishing event:', error);
      this.logSecurityViolation({
        pluginId: publisherId,
        type: 'event_publish_error',
        description: `Error publishing event: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date(),
        severity: SecuritySeverity.MEDIUM
      });
    }
  }

  subscribe(eventType: string, subscriberId: string, handler: EventHandler): void {
    try {
      const subscription: EventSubscription = {
        eventType,
        subscriberId,
        handler,
        subscriptionTime: new Date()
      };

      if (!this.subscriptions.has(eventType)) {
        this.subscriptions.set(eventType, []);
      }

      const subscriptions = this.subscriptions.get(eventType)!;
      
      // Remove existing subscription for the same plugin (if any)
      const existingIndex = subscriptions.findIndex(sub => sub.subscriberId === subscriberId);
      if (existingIndex !== -1) {
        subscriptions.splice(existingIndex, 1);
      }

      subscriptions.push(subscription);

      // Update statistics
      this.updateSubscriptionStatistics();

      console.log(`Plugin ${subscriberId} subscribed to ${eventType}`);
    } catch (error) {
      console.error('Error subscribing to event:', error);
    }
  }

  unsubscribe(eventType: string, subscriberId: string): void {
    try {
      const subscriptions = this.subscriptions.get(eventType);
      if (subscriptions) {
        const index = subscriptions.findIndex(sub => sub.subscriberId === subscriberId);
        if (index !== -1) {
          subscriptions.splice(index, 1);
          
          // Clean up empty subscription lists
          if (subscriptions.length === 0) {
            this.subscriptions.delete(eventType);
          }

          // Update statistics
          this.updateSubscriptionStatistics();

          console.log(`Plugin ${subscriberId} unsubscribed from ${eventType}`);
        }
      }
    } catch (error) {
      console.error('Error unsubscribing from event:', error);
    }
  }

  validateEventPermissions(publisherId: string, eventType: string): boolean {
    // Allow non-restricted events by default
    if (!this.RESTRICTED_EVENT_TYPES.includes(eventType)) {
      return true;
    }

    // Check explicit permissions for restricted events
    const pluginPermissions = this.permissions.get(publisherId);
    return pluginPermissions ? pluginPermissions.has(eventType) : false;
  }

  private deliverEvent(event: PluginEvent): void {
    const subscriptions = this.subscriptions.get(event.type);
    if (!subscriptions || subscriptions.length === 0) {
      return;
    }

    for (const subscription of subscriptions) {
      // Check if event is targeted and filter accordingly
      if (event.targetId && event.targetId !== subscription.subscriberId) {
        continue;
      }

      try {
        // Execute handler safely
        this.executeHandler(subscription, event);
      } catch (error) {
        console.error(`Error executing handler for plugin ${subscription.subscriberId}:`, error);
        
        // Log error but don't break other handlers
        this.logSecurityViolation({
          pluginId: subscription.subscriberId,
          type: 'event_handler_error',
          description: `Error in event handler: ${error instanceof Error ? error.message : 'Unknown error'}`,
          timestamp: new Date(),
          severity: SecuritySeverity.LOW
        });
      }
    }
  }

  private async executeHandler(subscription: EventSubscription, event: PluginEvent): Promise<void> {
    try {
      const result = subscription.handler(event);
      if (result instanceof Promise) {
        await result;
      }
    } catch (error) {
      console.error(`Handler error for ${subscription.subscriberId}:`, error);
      // Don't re-throw - let other handlers continue executing
    }
  }

  private addToHistory(event: PluginEvent): void {
    this.eventHistory.push(event);
    
    // Maintain history size limit
    if (this.eventHistory.length > this.MAX_HISTORY_SIZE) {
      this.eventHistory.shift();
    }
  }

  private updatePublishStatistics(publisherId: string, event: PluginEvent): void {
    this.eventStats.totalEvents++;
    this.eventStats.publisherStats[publisherId] = (this.eventStats.publisherStats[publisherId] || 0) + 1;
    
    if (!this.eventStats.eventTypes.includes(event.type)) {
      this.eventStats.eventTypes.push(event.type);
    }

    // Update average event size (rough estimate)
    const eventSize = JSON.stringify(event).length;
    this.eventStats.averageEventSize = 
      (this.eventStats.averageEventSize * (this.eventStats.totalEvents - 1) + eventSize) / this.eventStats.totalEvents;

    this.eventStats.lastEventTime = new Date();
  }

  private updateSubscriptionStatistics(): void {
    let totalSubscribers = 0;
    const subscriberCounts: Record<string, number> = {};

    for (const subscriptions of this.subscriptions.values()) {
      for (const subscription of subscriptions) {
        totalSubscribers++;
        subscriberCounts[subscription.subscriberId] = (subscriberCounts[subscription.subscriberId] || 0) + 1;
      }
    }

    this.eventStats.subscriberCount = totalSubscribers;
    this.eventStats.subscriberStats = subscriberCounts;
  }

  private logSecurityViolation(violation: SecurityViolation): void {
    this.securityViolations.push(violation);
    console.warn('Security violation:', violation);

    // Emit security alert event (if not in restricted mode)
    if (violation.severity === SecuritySeverity.HIGH || violation.severity === SecuritySeverity.CRITICAL) {
      const alertEvent: PluginEvent = {
        type: 'security-alert',
        data: { violation },
        timestamp: new Date(),
        sourceId: 'system'
      };

      // Use internal delivery to avoid permission checks
      this.deliverEvent(alertEvent);
    }
  }

  // Public utility methods
  grantPermission(pluginId: string, eventType: string): void {
    if (!this.permissions.has(pluginId)) {
      this.permissions.set(pluginId, new Set());
    }
    this.permissions.get(pluginId)!.add(eventType);
    console.log(`Granted permission: ${pluginId} can publish ${eventType}`);
  }

  revokePermission(pluginId: string, eventType: string): void {
    const pluginPermissions = this.permissions.get(pluginId);
    if (pluginPermissions) {
      pluginPermissions.delete(eventType);
      
      // Clean up empty permission sets
      if (pluginPermissions.size === 0) {
        this.permissions.delete(pluginId);
      }
    }
    console.log(`Revoked permission: ${pluginId} can no longer publish ${eventType}`);
  }

  unloadPlugin(pluginId: string): void {
    // Clean up all subscriptions for the plugin
    for (const [eventType, subscriptions] of this.subscriptions.entries()) {
      const filteredSubscriptions = subscriptions.filter(sub => sub.subscriberId !== pluginId);
      
      if (filteredSubscriptions.length === 0) {
        this.subscriptions.delete(eventType);
      } else {
        this.subscriptions.set(eventType, filteredSubscriptions);
      }
    }

    // Revoke all permissions
    this.permissions.delete(pluginId);

    // Update statistics
    this.updateSubscriptionStatistics();

    console.log(`Cleaned up plugin ${pluginId} from event bus`);
  }

  getEventHistory(limit?: number): PluginEvent[] {
    if (limit) {
      return this.eventHistory.slice(-limit);
    }
    return [...this.eventHistory];
  }

  getEventStatistics(): EventStatistics {
    return { ...this.eventStats };
  }

  getSecurityViolations(): SecurityViolation[] {
    return [...this.securityViolations];
  }

  getSubscriptions(eventType?: string): EventSubscription[] {
    if (eventType) {
      return [...(this.subscriptions.get(eventType) || [])];
    }

    const allSubscriptions: EventSubscription[] = [];
    for (const subscriptions of this.subscriptions.values()) {
      allSubscriptions.push(...subscriptions);
    }
    return allSubscriptions;
  }

  getPluginPermissions(pluginId: string): string[] {
    const permissions = this.permissions.get(pluginId);
    return permissions ? Array.from(permissions) : [];
  }

  // Administrative methods
  clearEventHistory(): void {
    this.eventHistory = [];
    console.log('Event history cleared');
  }

  clearSecurityViolations(): void {
    this.securityViolations = [];
    console.log('Security violations cleared');
  }

  resetStatistics(): void {
    this.eventStats = {
      totalEvents: 0,
      subscriberCount: 0,
      eventTypes: [],
      publisherStats: {},
      subscriberStats: {},
      averageEventSize: 0
    };
    console.log('Event statistics reset');
  }

  // Health check method
  healthCheck(): {
    isHealthy: boolean;
    subscriberCount: number;
    eventTypesCount: number;
    recentViolations: number;
    memoryUsage: number;
  } {
    const recentViolations = this.securityViolations.filter(
      v => Date.now() - v.timestamp.getTime() < 60000 // Last minute
    ).length;

    const memoryUsage = this.eventHistory.length + 
                       this.securityViolations.length + 
                       Array.from(this.subscriptions.values()).flat().length;

    return {
      isHealthy: recentViolations < 10 && memoryUsage < 10000,
      subscriberCount: this.eventStats.subscriberCount,
      eventTypesCount: this.eventStats.eventTypes.length,
      recentViolations,
      memoryUsage
    };
  }

  destroy(): void {
    this.subscriptions.clear();
    this.permissions.clear();
    this.eventHistory = [];
    this.securityViolations = [];
    this.resetStatistics();
    console.log('PluginEventBus destroyed');
  }
} 