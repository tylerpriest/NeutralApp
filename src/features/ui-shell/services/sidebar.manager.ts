/**
 * Sidebar Manager - Best Practices Implementation
 * Handles hierarchical navigation with core app and plugin pack separation
 */

import { ISidebarManager, SidebarItem, PluginPackSidebar } from '../interfaces/sidebar.interface';

export class SidebarManager implements ISidebarManager {
  private coreNavigation: SidebarItem[] = [];
  private pluginPackSidebars: Map<string, PluginPackSidebar> = new Map();
  private activeItem: { itemId: string; packId?: string } | null = null;
  private readonly STORAGE_KEY = 'sidebar-navigation-state';

  // Static instance for global access
  private static instance: SidebarManager | null = null;

  public static getInstance(): SidebarManager {
    if (!SidebarManager.instance) {
      SidebarManager.instance = new SidebarManager();
    }
    return SidebarManager.instance;
  }

  constructor() {
    this.initializeCoreNavigation();
    this.loadNavigationState();
  }

  private initializeCoreNavigation(): void {
    // Best Practice: Core app navigation remains separate and always visible
    this.coreNavigation = [
      {
        id: 'dashboard',
        label: 'Dashboard',
        icon: '🏠',
        path: '/dashboard',
        order: 1
      },
      {
        id: 'plugins',
        label: 'Plugin Manager',
        icon: '🧩',
        path: '/plugins',
        order: 2
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: '⚙️',
        path: '/settings',
        order: 3
      },
      {
        id: 'admin',
        label: 'Admin',
        icon: '👨‍💼',
        path: '/admin',
        order: 4,
        children: [
          {
            id: 'admin-users',
            label: 'Users',
            icon: '👥',
            path: '/admin/users'
          },
          {
            id: 'admin-system',
            label: 'System Health',
            icon: '🏥',
            path: '/admin/health'
          }
        ],
        isCollapsible: true,
        isCollapsed: true
      }
    ];
  }

  // Core navigation management
  registerCoreNavigation(items: SidebarItem[]): void {
    this.coreNavigation = items.sort((a, b) => (a.order || 0) - (b.order || 0));
    this.saveNavigationState();
  }

  // Plugin pack sidebar management
  registerPluginPackSidebar(packSidebar: PluginPackSidebar): void {
    this.pluginPackSidebars.set(packSidebar.packId, packSidebar);
    this.saveNavigationState();
  }

  unregisterPluginPackSidebar(packId: string): void {
    this.pluginPackSidebars.delete(packId);
    
    // Clear active item if it was in this pack
    if (this.activeItem?.packId === packId) {
      this.activeItem = null;
    }
    
    this.saveNavigationState();
  }

  // Navigation state
  getAllSidebarItems(): {
    core: SidebarItem[];
    pluginPacks: PluginPackSidebar[];
  } {
    const pluginPacks = Array.from(this.pluginPackSidebars.values())
      .sort((a, b) => a.order - b.order);

    return {
      core: this.coreNavigation,
      pluginPacks
    };
  }

  // Collapse/expand management - Best Practice: Remember user preferences
  togglePluginPackCollapse(packId: string): void {
    const pack = this.pluginPackSidebars.get(packId);
    if (pack) {
      pack.isCollapsed = !pack.isCollapsed;
      this.pluginPackSidebars.set(packId, pack);
      this.saveNavigationState();
    }
  }

  toggleCoreItemCollapse(itemId: string): void {
    const toggleItem = (items: SidebarItem[]): boolean => {
      for (const item of items) {
        if (item.id === itemId && item.isCollapsible) {
          item.isCollapsed = !item.isCollapsed;
          return true;
        }
        if (item.children && toggleItem(item.children)) {
          return true;
        }
      }
      return false;
    };

    if (toggleItem(this.coreNavigation)) {
      this.saveNavigationState();
    }
  }

  // Active state management
  setActiveItem(itemId: string, packId?: string): void {
    this.activeItem = { itemId, packId };
    this.saveNavigationState();
  }

  getActiveItem(): { itemId: string; packId?: string } | null {
    return this.activeItem;
  }

  // Badge management - Best Practice: Dynamic status indicators
  updateBadge(itemId: string, badge: string | number | null, packId?: string): void {
    if (packId) {
      // Update plugin pack item badge
      const pack = this.pluginPackSidebars.get(packId);
      if (pack) {
        const updateBadgeInItems = (items: SidebarItem[]): boolean => {
          for (const item of items) {
            if (item.id === itemId) {
              item.badge = badge || undefined;
              return true;
            }
            if (item.children && updateBadgeInItems(item.children)) {
              return true;
            }
          }
          return false;
        };

        if (updateBadgeInItems(pack.items)) {
          this.pluginPackSidebars.set(packId, pack);
          this.saveNavigationState();
        }
      }
    } else {
      // Update core navigation badge
      const updateBadgeInItems = (items: SidebarItem[]): boolean => {
        for (const item of items) {
          if (item.id === itemId) {
            item.badge = badge || undefined;
            return true;
          }
          if (item.children && updateBadgeInItems(item.children)) {
            return true;
          }
        }
        return false;
      };

      if (updateBadgeInItems(this.coreNavigation)) {
        this.saveNavigationState();
      }
    }
  }

  // Persistence - Best Practice: Save user preferences
  saveNavigationState(): void {
    try {
      const state = {
        coreNavigation: this.coreNavigation,
        pluginPacks: Array.from(this.pluginPackSidebars.entries()),
        activeItem: this.activeItem,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.warn('Failed to save navigation state:', error);
    }
  }

  loadNavigationState(): void {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const state = JSON.parse(saved);
        
        // Restore core navigation state (collapsed/expanded)
        if (state.coreNavigation) {
          this.mergeNavigationState(this.coreNavigation, state.coreNavigation);
        }
        
        // Restore plugin pack states
        if (state.pluginPacks) {
          for (const [packId, packData] of state.pluginPacks) {
            if (this.pluginPackSidebars.has(packId)) {
              const currentPack = this.pluginPackSidebars.get(packId)!;
              currentPack.isCollapsed = packData.isCollapsed;
              this.pluginPackSidebars.set(packId, currentPack);
            }
          }
        }
        
        // Restore active item
        if (state.activeItem) {
          this.activeItem = state.activeItem;
        }
      }
    } catch (error) {
      console.warn('Failed to load navigation state:', error);
    }
  }

  private mergeNavigationState(current: SidebarItem[], saved: SidebarItem[]): void {
    const savedMap = new Map(saved.map(item => [item.id, item]));
    
    for (const currentItem of current) {
      const savedItem = savedMap.get(currentItem.id);
      if (savedItem) {
        currentItem.isCollapsed = savedItem.isCollapsed;
        currentItem.badge = savedItem.badge;
        
        if (currentItem.children && savedItem.children) {
          this.mergeNavigationState(currentItem.children, savedItem.children);
        }
      }
    }
  }

  // Best Practice: Helper method to create reading pack sidebar
  createReadingPackSidebar(): PluginPackSidebar {
    return {
      packId: 'reading-pack',
      packName: 'Reader',
      packIcon: '📚',
      isCollapsed: false,
      order: 1,
      items: [
        {
          id: 'reading-library',
          label: 'Library',
          icon: '📖',
          path: '/reader/library',
          order: 1
        },
        {
          id: 'reading-current',
          label: 'Currently Reading',
          icon: '📄',
          path: '/reader/current',
          order: 2
        },
        {
          id: 'reading-bookmarks',
          label: 'Bookmarks',
          icon: '🔖',
          path: '/reader/bookmarks',
          order: 3
        },
        {
          id: 'reading-notes',
          label: 'Notes',
          icon: '📝',
          path: '/reader/notes',
          order: 4
        },
        {
          id: 'reading-import',
          label: 'Import Books',
          icon: '📥',
          path: '/reader/import',
          order: 5
        },
        {
          id: 'reading-settings',
          label: 'Reading Settings',
          icon: '⚙️',
          path: '/reader/settings',
          order: 6
        }
      ]
    };
  }
}