import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../../../shared/ui/button';
import { LogOut, User, Package, Bell, Search } from 'lucide-react';

const Header: React.FC = () => {
  const { user, isGuest, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm" data-testid="header">
      {/* Left Section - Logo and Navigation */}
      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Package className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">NeutralApp</h2>
        </div>
        
        <nav className="hidden md:flex items-center space-x-1">
          <button className="px-3 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition-colors">
            Dashboard
          </button>
          <button className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            Plugins
          </button>
          <button className="px-3 py-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
            Settings
          </button>
        </nav>
      </div>

      {/* Center Section - Search */}
      <div className="hidden lg:flex flex-1 max-w-md mx-8">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search plugins, widgets..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Right Section - User and Actions */}
      <div className="flex items-center space-x-4">
        {/* Notifications */}
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
        </button>

        {/* User Info */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-900">{user?.name || 'Guest User'}</p>
              <p className="text-xs text-gray-500">{isGuest ? 'Guest Mode' : 'Authenticated'}</p>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{isGuest ? 'Exit Guest Mode' : 'Logout'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header; 