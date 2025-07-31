/**
 * Hierarchical Sidebar Component - Best Practices Implementation
 * Two-tier navigation: Core App + Plugin Packs
 */

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Home, Package, Settings, Shield, BookOpen, Plus } from 'lucide-react';
import { SidebarManager } from '../../../features/ui-shell/services/sidebar.manager';
import { SidebarItem, PluginPackSidebar } from '../../../features/ui-shell/interfaces/sidebar.interface';

interface SidebarProps {
  onNavigate?: (path: string, itemId: string, packId?: string) => void;
  currentPath?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ onNavigate, currentPath }) => {
  const [sidebarData, setSidebarData] = useState<{
    core: SidebarItem[];
    pluginPacks: PluginPackSidebar[];
  }>({ core: [], pluginPacks: [] });
  
  const [activeItem, setActiveItem] = useState<{ itemId: string; packId?: string } | null>(null);
  const sidebarManager = SidebarManager.getInstance();

  useEffect(() => {
    // Load initial sidebar data
    refreshSidebarData();
    
    // Set up active item based on current path
    const active = sidebarManager.getActiveItem();
    if (active) {
      setActiveItem(active);
    }
  }, []);

  const refreshSidebarData = () => {
    const data = sidebarManager.getAllSidebarItems();
    setSidebarData(data);
  };

  const handleItemClick = (item: SidebarItem, packId?: string) => {
    const itemId = item.id;
    
    // Handle collapsible items
    if (item.isCollapsible) {
      if (packId) {
        // This shouldn't happen as plugin pack items aren't collapsible, but handle gracefully
        return;
      } else {
        sidebarManager.toggleCoreItemCollapse(itemId);
        refreshSidebarData();
        return;
      }
    }

    // Handle navigation
    if (item.path) {
      setActiveItem({ itemId, packId });
      sidebarManager.setActiveItem(itemId, packId);
      onNavigate?.(item.path, itemId, packId);
    }
  };

  const handlePackToggle = (packId: string) => {
    sidebarManager.togglePluginPackCollapse(packId);
    refreshSidebarData();
  };

  const renderSidebarItem = (item: SidebarItem, packId?: string, depth = 0) => {
    const isActive = activeItem?.itemId === item.id && activeItem?.packId === packId;
    const hasChildren = item.children && item.children.length > 0;
    const isCollapsed = item.isCollapsed;

    return (
      <div key={item.id} className={`ml-${depth * 4}`}>
        <div
          onClick={() => handleItemClick(item, packId)}
          className={`
            flex items-center px-3 py-2 rounded-lg mx-1 cursor-pointer transition-all duration-200 text-sm
            ${isActive 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md' 
              : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
            }
            ${item.isCollapsible ? 'font-medium' : 'font-normal'}
          `}
        >
          {/* Collapse/Expand Icon */}
          {hasChildren && (
            <span className="mr-1 text-xs">
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </span>
          )}
          
          {/* Item Icon */}
          {item.icon && (
            <span className="mr-2 text-base">
              {item.icon}
            </span>
          )}
          
          {/* Item Label */}
          <span className="flex-1">{item.label}</span>
          
          {/* Badge */}
          {item.badge && (
            <span
              className={`
                text-xs font-bold px-2 py-0.5 rounded-full ml-2
                ${isActive 
                  ? 'bg-white bg-opacity-20 text-white' 
                  : 'bg-red-500 text-white'
                }
              `}
            >
              {item.badge}
            </span>
          )}
        </div>

        {/* Children */}
        {hasChildren && !isCollapsed && (
          <div className="ml-2">
            {item.children!.map(child => renderSidebarItem(child, packId, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderPluginPackSection = (pack: PluginPackSidebar) => {
    return (
      <div key={pack.packId} className="mb-4">
        {/* Plugin Pack Header */}
        <div
          onClick={() => handlePackToggle(pack.packId)}
          className="flex items-center px-3 py-2 rounded-lg cursor-pointer bg-gray-50 border border-gray-200 mb-1 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
        >
          {/* Collapse/Expand Icon */}
          <span className="mr-1">
            {pack.isCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
          </span>
          
          {/* Pack Icon */}
          <span className="mr-2 text-base">
            {pack.packIcon}
          </span>
          
          {/* Pack Name */}
          <span className="flex-1">{pack.packName}</span>
        </div>

        {/* Plugin Pack Items */}
        {!pack.isCollapsed && (
          <div className="pl-2">
            {pack.items
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map(item => renderSidebarItem(item, pack.packId))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-72 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Navigation</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Core Navigation Section */}
        <div className="mb-6">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
            NeutralApp
          </div>
          
          {sidebarData.core
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(item => renderSidebarItem(item))}
        </div>

        {/* Plugin Packs Section */}
        {sidebarData.pluginPacks.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
              Plugin Packs
            </div>
            
            {sidebarData.pluginPacks.map(pack => renderPluginPackSection(pack))}
          </div>
        )}

        {/* Add Plugin Pack Button */}
        <div className="mt-6">
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors border-2 border-dashed border-gray-300 hover:border-gray-400">
            <Plus className="w-4 h-4" />
            Add Plugin Pack
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          {sidebarData.pluginPacks.length} plugin pack{sidebarData.pluginPacks.length !== 1 ? 's' : ''} active
        </div>
      </div>
    </div>
  );
};

export default Sidebar;