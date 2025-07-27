// Event Bus implementation
export interface EventHandler<T = any> {
  (event: T): void | Promise<void>;
}

export interface EventSubscription {
  unsubscribe(): void;
}

export class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map();

  subscribe<T>(eventType: string, handler: EventHandler<T>): EventSubscription {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set());
    }
    
    this.handlers.get(eventType)!.add(handler);

    return {
      unsubscribe: () => {
        const handlers = this.handlers.get(eventType);
        if (handlers) {
          handlers.delete(handler);
          if (handlers.size === 0) {
            this.handlers.delete(eventType);
          }
        }
      }
    };
  }

  async publish<T>(eventType: string, event: T): Promise<void> {
    const handlers = this.handlers.get(eventType);
    if (!handlers) {
      return;
    }

    const promises = Array.from(handlers).map(handler => {
      try {
        return Promise.resolve(handler(event));
      } catch (error) {
        console.error(`Error in event handler for ${eventType}:`, error);
        return Promise.resolve();
      }
    });

    await Promise.all(promises);
  }

  clear(): void {
    this.handlers.clear();
  }

  get eventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}

// Export singleton instance
export const eventBus = new EventBus(); 