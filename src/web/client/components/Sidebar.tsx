/**
 * Hierarchical Sidebar Component - Best Practices Implementation
 * Two-tier navigation: Core App + Plugin Packs
 */

import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
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
      <div key={item.id} style={{ marginLeft: `${depth * 16}px` }}>
        <div
          onClick={() => handleItemClick(item, packId)}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: '6px',
            margin: '2px 0',
            cursor: 'pointer',
            backgroundColor: isActive ? '#3B82F6' : 'transparent',
            color: isActive ? 'white' : '#374151',
            transition: 'all 0.2s ease',
            fontSize: '14px',
            fontWeight: isActive ? '500' : 'normal'
          }}
          onMouseEnter={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = '#F3F4F6';
            }
          }}
          onMouseLeave={(e) => {
            if (!isActive) {
              e.currentTarget.style.backgroundColor = 'transparent';
            }
          }}
        >
          {/* Collapse/Expand Icon */}
          {hasChildren && (
            <span style={{ marginRight: '4px', fontSize: '12px' }}>
              {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
            </span>
          )}
          
          {/* Item Icon */}
          {item.icon && (
            <span style={{ marginRight: '8px', fontSize: '16px' }}>
              {item.icon}
            </span>
          )}
          
          {/* Item Label */}
          <span style={{ flex: 1 }}>{item.label}</span>
          
          {/* Badge */}
          {item.badge && (
            <span
              style={{
                backgroundColor: isActive ? 'rgba(255,255,255,0.2)' : '#EF4444',
                color: isActive ? 'white' : 'white',
                fontSize: '10px',
                fontWeight: 'bold',
                padding: '2px 6px',
                borderRadius: '10px',
                marginLeft: '8px'
              }}
            >
              {item.badge}
            </span>
          )}
        </div>

        {/* Children */}
        {hasChildren && !isCollapsed && (
          <div style={{ marginLeft: '8px' }}>
            {item.children!.map(child => renderSidebarItem(child, packId, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const renderPluginPackSection = (pack: PluginPackSidebar) => {
    return (
      <div key={pack.packId} style={{ marginBottom: '16px' }}>
        {/* Plugin Pack Header */}
        <div
          onClick={() => handlePackToggle(pack.packId)}
          style={{
            display: 'flex',
            alignItems: 'center',
            padding: '8px 12px',
            borderRadius: '6px',
            cursor: 'pointer',
            backgroundColor: '#F9FAFB',
            border: '1px solid #E5E7EB',
            marginBottom: '4px',
            fontSize: '13px',
            fontWeight: '600',
            color: '#374151'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F3F4F6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#F9FAFB';
          }}
        >
          {/* Collapse/Expand Icon */}
          <span style={{ marginRight: '4px' }}>
            {pack.isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
          </span>
          
          {/* Pack Icon */}
          <span style={{ marginRight: '8px', fontSize: '16px' }}>
            {pack.packIcon}
          </span>
          
          {/* Pack Name */}
          <span style={{ flex: 1 }}>{pack.packName}</span>
        </div>

        {/* Plugin Pack Items */}
        {!pack.isCollapsed && (
          <div style={{ paddingLeft: '8px' }}>
            {pack.items
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map(item => renderSidebarItem(item, pack.packId))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        width: '280px',
        height: '100vh',
        backgroundColor: 'white',
        borderRight: '1px solid #E5E7EB',
        padding: '16px 12px',
        overflow: 'auto'
      }}
    >
      {/* Core Navigation Section */}
      <div style={{ marginBottom: '24px' }}>
        <div
          style={{
            fontSize: '11px',
            fontWeight: '600',
            color: '#6B7280',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '8px',
            paddingLeft: '12px'
          }}
        >
          NeutralApp
        </div>
        
        {sidebarData.core
          .sort((a, b) => (a.order || 0) - (b.order || 0))
          .map(item => renderSidebarItem(item))}
      </div>

      {/* Plugin Packs Section */}
      {sidebarData.pluginPacks.length > 0 && (
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: '600',
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              marginBottom: '8px',
              paddingLeft: '12px'
            }}
          >
            Plugin Packs
          </div>
          
          {sidebarData.pluginPacks.map(pack => renderPluginPackSection(pack))}
        </div>
      )}

      {/* Footer */}
      <div
        style={{
          marginTop: 'auto',
          paddingTop: '16px',
          borderTop: '1px solid #E5E7EB',
          fontSize: '11px',
          color: '#9CA3AF',
          textAlign: 'center'
        }}
      >
        {sidebarData.pluginPacks.length} plugin pack{sidebarData.pluginPacks.length !== 1 ? 's' : ''} active
      </div>
    </div>
  );
};

export default Sidebar;