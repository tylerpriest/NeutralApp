/**
 * Plugin Communication System Example
 * Demonstrates secure inter-plugin messaging and isolated storage
 */

import { PluginEventBus } from '../services/plugin.event.bus';
import { PluginStorageManager } from '../services/plugin.storage.manager';
import { PluginEvent } from '../types';

// Example: Two plugins communicating via events and sharing state via isolated storage
export async function demonstratePluginCommunication(): Promise<void> {
  console.log('🚀 Starting Plugin Communication System Demo');

  // Initialize the communication system
  const eventBus = new PluginEventBus();
  const storageManager = new PluginStorageManager();

  try {
    // === Plugin 1: Chat Plugin ===
    console.log('\n📝 Setting up Chat Plugin...');
    
    const chatStorage = storageManager.getPluginStorage('chat-plugin');
    storageManager.enforceStorageQuota('chat-plugin', 2048); // 2KB limit

    // Store initial chat data
    await chatStorage.set('room', 'general');
    await chatStorage.set('userCount', 0);

    // Subscribe to user events
    eventBus.subscribe('user-joined', 'chat-plugin', async (event: PluginEvent) => {
      console.log(`💬 Chat Plugin: User ${event.data.username} joined`);
      
      const currentCount = await chatStorage.get<number>('userCount') || 0;
      await chatStorage.set('userCount', currentCount + 1);
      
      // Broadcast welcome message
      const welcomeEvent: PluginEvent = {
        type: 'chat-message',
        data: { 
          message: `Welcome ${event.data.username}!`,
          from: 'system',
          room: await chatStorage.get('room')
        },
        timestamp: new Date(),
        sourceId: 'chat-plugin'
      };
      
      eventBus.publish(welcomeEvent, 'chat-plugin');
    });

    // === Plugin 2: Notification Plugin ===
    console.log('🔔 Setting up Notification Plugin...');
    
    const notificationStorage = storageManager.getPluginStorage('notification-plugin');
    
    // Store notification preferences
    await notificationStorage.set('enabled', true);
    await notificationStorage.set('soundEnabled', false);

    // Subscribe to chat messages for notifications
    eventBus.subscribe('chat-message', 'notification-plugin', async (event: PluginEvent) => {
      const enabled = await notificationStorage.get<boolean>('enabled');
      if (enabled) {
        console.log(`🔔 Notification: New message from ${event.data.from}: "${event.data.message}"`);
        
        // Store notification history
        const history = await notificationStorage.get<string[]>('history') || [];
        history.push(`${event.data.from}: ${event.data.message}`);
        
        // Keep only last 10 notifications
        if (history.length > 10) {
          history.shift();
        }
        
        await notificationStorage.set('history', history);
      }
    });

    // === Plugin 3: Analytics Plugin ===
    console.log('📊 Setting up Analytics Plugin...');
    
    const analyticsStorage = storageManager.getPluginStorage('analytics-plugin');
    
    // Initialize analytics data
    await analyticsStorage.set('events', []);
    await analyticsStorage.set('userJoins', 0);
    await analyticsStorage.set('messages', 0);

    // Subscribe to all events for analytics
    eventBus.subscribe('user-joined', 'analytics-plugin', async (event: PluginEvent) => {
      const joins = await analyticsStorage.get<number>('userJoins') || 0;
      await analyticsStorage.set('userJoins', joins + 1);
      console.log(`📊 Analytics: User join tracked (Total: ${joins + 1})`);
    });

    eventBus.subscribe('chat-message', 'analytics-plugin', async (event: PluginEvent) => {
      const messages = await analyticsStorage.get<number>('messages') || 0;
      await analyticsStorage.set('messages', messages + 1);
      console.log(`📊 Analytics: Message tracked (Total: ${messages + 1})`);
    });

    // === Simulate User Activity ===
    console.log('\n🎭 Simulating user activity...');

    // User 1 joins
    const userJoinEvent1: PluginEvent = {
      type: 'user-joined',
      data: { username: 'alice', userId: '1' },
      timestamp: new Date(),
      sourceId: 'auth-service'
    };
    eventBus.publish(userJoinEvent1, 'auth-service');

    await new Promise(resolve => setTimeout(resolve, 100)); // Wait for async handlers

    // User 2 joins
    const userJoinEvent2: PluginEvent = {
      type: 'user-joined',
      data: { username: 'bob', userId: '2' },
      timestamp: new Date(),
      sourceId: 'auth-service'
    };
    eventBus.publish(userJoinEvent2, 'auth-service');

    await new Promise(resolve => setTimeout(resolve, 100));

    // User sends a message
    const chatMessageEvent: PluginEvent = {
      type: 'chat-message',
      data: { 
        message: 'Hello everyone!',
        from: 'alice',
        room: 'general'
      },
      timestamp: new Date(),
      sourceId: 'chat-plugin'
    };
    eventBus.publish(chatMessageEvent, 'chat-plugin');

    await new Promise(resolve => setTimeout(resolve, 100));

    // === Display Results ===
    console.log('\n📋 Final State:');
    
    // Chat plugin state
    console.log('💬 Chat Plugin Storage:');
    const chatKeys = await chatStorage.keys();
    for (const key of chatKeys) {
      const value = await chatStorage.get(key);
      console.log(`  ${key}: ${JSON.stringify(value)}`);
    }

    // Notification plugin state
    console.log('🔔 Notification Plugin Storage:');
    const notificationKeys = await notificationStorage.keys();
    for (const key of notificationKeys) {
      const value = await notificationStorage.get(key);
      console.log(`  ${key}: ${JSON.stringify(value)}`);
    }

    // Analytics plugin state
    console.log('📊 Analytics Plugin Storage:');
    const analyticsKeys = await analyticsStorage.keys();
    for (const key of analyticsKeys) {
      const value = await analyticsStorage.get(key);
      console.log(`  ${key}: ${JSON.stringify(value)}`);
    }

    // === Storage Isolation Test ===
    console.log('\n🔒 Testing Storage Isolation:');
    
    // Try to access chat plugin data from notification plugin
    const chatRoomFromNotification = await notificationStorage.get('room');
    console.log(`Notification plugin accessing chat 'room': ${chatRoomFromNotification} (should be null)`);

    // === Storage Quota Test ===
    console.log('\n💾 Testing Storage Quotas:');
    
    try {
      // Try to exceed quota
      await chatStorage.set('large-data', 'x'.repeat(3000)); // Should fail with 2KB quota
    } catch (error) {
      console.log(`✅ Quota enforcement working: ${(error as Error).message}`);
    }

    // === Event Statistics ===
    console.log('\n📈 Event Bus Statistics:');
    const stats = eventBus.getEventStatistics();
    console.log(`  Total events: ${stats.totalEvents}`);
    console.log(`  Subscribers: ${stats.subscriberCount}`);
    console.log(`  Event types: ${stats.eventTypes.join(', ')}`);
    
    // === Storage Statistics ===
    console.log('\n💾 Storage Statistics:');
    const storageStats = storageManager.getStorageStatistics();
    console.log(`  Total plugins: ${storageStats.totalPlugins}`);
    console.log(`  Total usage: ${storageStats.totalUsage} bytes`);
    console.log(`  Average usage: ${Math.round(storageStats.averageUsage)} bytes`);

    // === Security Test ===
    console.log('\n🔐 Testing Security:');
    
    // Try to publish restricted event without permission
    const restrictedEvent: PluginEvent = {
      type: 'system-admin',
      data: { action: 'delete-all-data' },
      timestamp: new Date(),
      sourceId: 'malicious-plugin'
    };
    
    eventBus.publish(restrictedEvent, 'malicious-plugin');
    
    const violations = eventBus.getSecurityViolations();
    console.log(`✅ Security violations detected: ${violations.length}`);
    if (violations.length > 0) {
      console.log(`  Latest violation: ${violations[violations.length - 1].description}`);
    }

    console.log('\n✅ Plugin Communication System Demo Complete!');

  } catch (error) {
    console.error('❌ Demo failed:', error);
  } finally {
    // Cleanup
    eventBus.destroy();
    storageManager.destroy();
  }
}

// Run the demonstration if this file is executed directly
if (require.main === module) {
  demonstratePluginCommunication().catch(console.error);
} 