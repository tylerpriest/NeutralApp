# Plugin Widget Integration - Fix Dashboard Widget Display

## 📋 PHASE ONE
### Brief
Fix the disconnect between plugin installation and widget creation to ensure installed plugins properly display their widgets on the dashboard and show correct installation status in the UI.

### Core Idea
Currently, plugins can be installed via API but the UI doesn't reflect the installed state, and widgets aren't being created on the dashboard. This breaks the core user experience where users expect to see plugin functionality after installation. The fix involves connecting the plugin lifecycle to widget creation and ensuring proper state management across the application.

### Prompt
Fix the plugin widget integration system so that when a plugin is installed, it properly creates and displays its widgets on the dashboard, shows correct installation status in the Plugin Manager UI, and makes plugin-specific settings available in the Settings page.

### Intense Prompt

### 1. User Stories (Required)
- **1.1** **As a user**, I want to see installed plugins show as "installed" in the Plugin Manager so that I know which plugins I have available
- **1.2** **As a user**, I want to see plugin widgets appear on the dashboard after installation so that I can use the plugin's functionality
- **1.3** **As a user**, I want to access plugin-specific settings in the Settings page so that I can customize plugin behavior
- **1.4** **As a user**, I want the Hello World plugin to display "Hello World!" with timestamp updates so that I can verify the plugin system is working

### 2. Technical Requirements (Required)
- **2.1** **Plugin State Management**: Implement proper state synchronization between API installation and UI display
- **2.2** **Widget Creation Pipeline**: Connect plugin installation to dashboard widget creation and registration
- **2.3** **Settings Integration**: Link plugin installation to settings page configuration display
- **2.4** **Plugin Lifecycle Management**: Ensure proper plugin activation and widget initialization

### 3. Tasks (Required)
- [x] **3.1.1** Fix PluginManager.getInstalledPlugins() to return actual installed plugins
  - **Implementation**: Added in-memory Map storage for installed plugins in PluginManager
  - **Changes**: 
    - Added `private installedPlugins: Map<string, PluginInfo> = new Map()` to PluginManager
    - Updated pluginRegistry.getInstalledPlugins() to return `Array.from(this.installedPlugins.values())`
    - Updated pluginRegistry.addInstalledPlugin() to store plugins in the Map
    - Updated pluginRegistry.removeInstalledPlugin() to remove plugins from the Map
    - Updated pluginRegistry.updatePluginStatus() to update plugin status in the Map
  - **Tests**: Added comprehensive tests for getInstalledPlugins functionality (24/24 tests passing)
  - **Quality Gates**: All three mandatory gates passed (TypeScript compilation, test suite >80%, critical services operational)
- [x] **3.1.2** Update PluginManagerPage to properly refresh after installation
  - **Implementation**: Refresh functionality was already properly implemented in PluginManagerPage
  - **Verification**: 
    - `handleInstallPlugin` calls `await loadPlugins()` after successful installation
    - `handleEnablePlugin` calls `await loadPlugins()` after successful enabling
    - `handleDisablePlugin` calls `await loadPlugins()` after successful disabling
    - `handleUninstallPlugin` calls `await loadPlugins()` after successful uninstallation
  - **Tests**: Added comprehensive tests for refresh functionality (30/30 tests passing)
  - **Quality Gates**: All three mandatory gates passed (TypeScript compilation, test suite 100%, critical services operational)
- [x] **3.1.3** Implement proper plugin state persistence in PluginManager
  - **Implementation**: Added file-based persistence system for installed plugins
  - **Changes**:
    - Added `private persistenceFile: string` to store path to persistence file
    - Added `loadPersistedPlugins()` method to restore plugins on startup
    - Added `persistPlugins()` method to save plugins to JSON file
    - Updated pluginRegistry methods to call `persistPlugins()` after state changes
    - Added automatic data directory creation and error handling
  - **Tests**: Added comprehensive tests for persistence functionality (30/30 tests passing)
  - **Quality Gates**: All three mandatory gates passed (TypeScript compilation, test suite 100%, critical services operational)
- [x] **3.2.1** Connect plugin installation to DashboardManager widget registration
  - **Implementation**: Added DashboardManager integration to PluginManager for widget registration
  - **Changes**:
    - Added `dashboardManager` dependency injection to PluginManager constructor
    - Added `registerPluginWidgets()` method to create and register default widgets for plugins
    - Updated `installPlugin()` to call `registerPluginWidgets()` after successful installation
    - Updated `uninstallPlugin()` to call `dashboardManager.handlePluginUninstall()` before removal
    - Updated `loadPersistedPlugins()` to register widgets for enabled plugins on startup
  - **Tests**: Added comprehensive tests for plugin installation to widget registration integration (34/34 tests passing)
  - **Quality Gates**: All three mandatory gates passed (TypeScript compilation, test suite 100%, critical services operational)
- [x] **3.2.2** Implement widget creation in plugin activation lifecycle
  - **Implementation**: Added widget creation during plugin activation lifecycle with proper dependency injection
  - **Changes**:
    - Refactored PluginManager to support dependency injection for testability (IPluginRegistry, IPluginVerifier, IDependencyResolver, IDashboardManager)
    - Added `createWidgetsForActivatedPlugin()` method called from `enablePlugin()`
    - Added `registerPluginWidgets()` method to create and register default widgets
    - Updated tests to use dependency injection pattern for proper mocking
    - Fixed component naming convention in tests
  - **Tests**: All 41 PluginManager tests passing (100% pass rate)
  - **Quality Gates**: All three mandatory gates passed (TypeScript compilation, test suite 97.9%, critical services operational)
- [x] **3.2.3** Fix DashboardPage to display widgets from installed plugins
  - **Implementation**: Created WidgetFactory system for dynamic component rendering and updated WidgetContainer
  - **Changes**:
    - Created `WidgetFactory.tsx` with dynamic component creation system
    - Added `HelloWorldWidgetComponent` with live timestamp updates
    - Added `DefaultWidgetComponent` for fallback rendering
    - Updated `WidgetContainer.tsx` to use `useWidgetComponent` hook
    - Added comprehensive CSS styling for widget components
    - Fixed component rendering from string-based component definitions
  - **Tests**: All 29 WidgetFactory and WidgetContainer tests passing (100% pass rate)
  - **Quality Gates**: All three mandatory gates passed (TypeScript compilation, test suite 100%, critical services operational)
  - **Integration Fix**: Resolved shared DashboardManager instance issue between frontend and backend
  - **Additional Changes**:
    - Modified `SimpleAPIRouter.ts` to create shared DashboardManager instance
    - Updated `WebServer.ts` to set global DashboardManager instance
    - Added static instance management to `DashboardManager` class
    - Updated `DashboardPage.tsx` to use global shared instance
    - Added `/api/dashboard/widgets` endpoint for frontend widget fetching
    - Fixed API endpoints to use actual PluginManager instead of mock responses
    - Implemented proper persistence with `data/installed-plugins.json`
  - **End-to-End Verification**:
    - ✅ Plugin installation works via API
    - ✅ Plugin enabling works via API
    - ✅ Plugin appears in installed plugins list
    - ✅ Widget appears on dashboard with correct component name
    - ✅ Persistence working correctly (plugins survive server restart)
    - ✅ Widget registration working correctly (widgets created during plugin activation)
  - **Test Fixes**: Fixed all 41 plugin manager tests to handle persistence and widget registration correctly
- [ ] **3.3.1** Add plugin settings to SettingsService after installation
- [ ] **3.3.2** Update SettingsPage to display plugin-specific settings
- [ ] **3.4.1** Ensure plugin.activate() properly creates widgets
- [ ] **3.4.2** Fix plugin initialization to register with DashboardManager

### 4. Acceptance Criteria (Recommended)
- [ ] **4.1** WHEN a plugin is installed via API THEN the Plugin Manager UI SHALL show it as "installed"
- [ ] **4.2** WHEN a plugin is installed THEN its widgets SHALL appear on the dashboard
- [ ] **4.3** WHEN the Hello World plugin is installed THEN it SHALL display "Hello World!" with timestamp updates
- [ ] **4.4** WHEN a plugin is installed THEN its settings SHALL be available in the Settings page
- [ ] **4.5** WHEN the dashboard loads THEN it SHALL display widgets from all installed plugins

### 5. Dependencies (Recommended)
- [ ] **5.1** PluginManager service must be properly initialized and connected to UI
- [ ] **5.2** DashboardManager must be integrated with plugin widget registration
- [ ] **5.3** SettingsService must support plugin-specific settings
- [ ] **5.4** Plugin lifecycle (install → activate → create widgets) must be properly implemented

### 6. Success Metrics (Recommended)
- **Performance**: Dashboard loads with widgets within 3 seconds
- **Reliability**: 100% of installed plugins display their widgets correctly
- **User Experience**: Plugin installation provides immediate visual feedback and widget availability


## 🏗️ PHASE TWO (Complex Features Only)
### 7. Technical Design
**Steering Integration:** References .kiro/steering for plugin architecture

**Architecture:**
- PluginManager handles installation state and triggers widget creation
- DashboardManager receives widget registrations and manages layout
- SettingsService stores and provides plugin configuration
- Plugin lifecycle: Install → Activate → Create Widgets → Register with Dashboard

**Technology Stack:**
- Existing React components for UI updates
- Current PluginManager and DashboardManager services
- SettingsService for configuration management
- Event-driven architecture for plugin lifecycle

**Integration Points:**
- PluginManager → DashboardManager for widget registration
- PluginManager → SettingsService for configuration storage
- PluginManager → UI components for state updates
- Plugin activation → Widget creation pipeline

**Security Considerations:**
- Plugin widget creation must respect existing permissions
- Settings access must be properly scoped to plugin
- Widget content must be sanitized for XSS prevention

**Migration Plan:**
- **Step 1**: Fix PluginManager state management and API integration
- **Step 2**: Connect plugin installation to widget creation pipeline
- **Step 3**: Update UI components to reflect proper plugin states
- **Step 4**: Implement plugin settings integration
- **Step 5**: Test end-to-end plugin installation and widget display 