/**
 * Sidebar Management Interface
 * Handles hierarchical navigation structure for core app and plugin packs
 */

export interface SidebarItem {
  id: string;
  label: string;
  icon?: string;
  path?: string;
  children?: SidebarItem[];
  badge?: string | number;
  isCollapsible?: boolean;
  isCollapsed?: boolean;
  pluginPackId?: string;
  order?: number;
}

export interface PluginPackSidebar {
  packId: string;
  packName: string;
  packIcon: string;
  items: SidebarItem[];
  isCollapsed: boolean;
  order: number;
}

export interface ISidebarManager {
  // Core navigation management
  registerCoreNavigation(items: SidebarItem[]): void;
  
  // Plugin pack sidebar management
  registerPluginPackSidebar(packSidebar: PluginPackSidebar): void;
  unregisterPluginPackSidebar(packId: string): void;
  
  // Navigation state
  getAllSidebarItems(): {
    core: SidebarItem[];
    pluginPacks: PluginPackSidebar[];
  };
  
  // Collapse/expand management
  togglePluginPackCollapse(packId: string): void;
  toggleCoreItemCollapse(itemId: string): void;
  
  // Active state management
  setActiveItem(itemId: string, packId?: string): void;
  getActiveItem(): { itemId: string; packId?: string } | null;
  
  // Badge management
  updateBadge(itemId: string, badge: string | number | null, packId?: string): void;
  
  // Persistence
  saveNavigationState(): void;
  loadNavigationState(): void;
}