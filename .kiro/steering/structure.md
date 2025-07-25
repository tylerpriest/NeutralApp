# Project Structure

## Current Status
Project follows a strict modular feature-based architecture. All development must be organized by features, not technical layers.

## Modular Feature-Based Architecture

### Feature-First Organization (MANDATORY)
**ALL code must be organized by features, not technical layers.** Each feature is completely self-contained with its own interfaces, services, tests, and documentation. This is non-negotiable for maintainability and plugin isolation.

### Architecture Enforcement
- **No shared technical layers** - avoid /services/, /interfaces/, /types/ at root level
- **Feature boundaries are sacred** - features communicate only through defined APIs
- **Plugin-ready structure** - each feature can become a plugin with minimal refactoring

### Core Feature Modules
```
/src/
  /features/
    /auth/              # Authentication feature
      /interfaces/      # Auth-specific interfaces
      /services/        # Auth services and logic
      /tests/          # Feature-specific tests
      /types/          # Auth-related types
      index.ts         # Feature exports
    
    /plugin-manager/    # Plugin lifecycle management
      /interfaces/
      /services/
      /tests/
      /types/
      index.ts
    
    /ui-shell/         # Navigation framework and layout
      /interfaces/
      /services/
      /tests/
      /types/
      index.ts
    
    /settings/         # User preferences and configuration
      /interfaces/
      /services/
      /tests/
      /types/
      index.ts
    
    /admin/            # Admin dashboard and monitoring
      /interfaces/
      /services/
      /tests/
      /types/
      index.ts
    
    /error-reporter/   # Structured logging and error handling
      /interfaces/
      /services/
      /tests/
      /types/
      index.ts
```

### Shared Infrastructure
```
/src/
  /shared/           # Cross-feature utilities
    /types/          # Common types
    /utils/          # Utility functions
    /constants/      # Application constants
  /core/             # Core system services
    /event-bus/      # Inter-feature communication
    /dependency-injection/ # DI container
```

### Plugin System Structure
```
/plugins/
  /core/           # Essential system plugins
  /marketplace/    # Third-party plugins
  /examples/       # Reference implementations
```

## Plugin Architecture Guidelines

### Plugin Structure Template
```
/plugin-name/
  /src/            # Plugin source code
  /tests/          # Comprehensive tests (unit, integration, e2e)
    /unit/         # Unit tests for all functions/components
    /integration/  # Plugin interaction tests
    /e2e/          # Real-world user scenario tests
  /config/         # Plugin configuration
  manifest.json    # Plugin metadata and dependencies
  README.md        # Plugin documentation
```

### Core Integration Points
- **UI Registration**: Components mount through UI shell
- **Settings Integration**: Configuration panels via settings manager
- **Event System**: Inter-plugin communication through core event bus
- **Storage Access**: Secure data persistence through core APIs
- **Error Handling**: Structured error reporting to core system

## Development Conventions

### Mandatory Structure Rules
- **Feature-first always**: Never create technical layer directories at root
- **Self-contained features**: Each feature has its own interfaces, services, tests, types
- **Clear boundaries**: Features interact only through exported APIs
- **Plugin-ready**: Structure allows easy conversion to plugins

### File Organization Standards
- File naming: kebab-case for directories, camelCase for TypeScript files
- Feature exports: Always use index.ts barrel exports
- Import patterns: Relative imports within features, absolute for cross-feature
- **Testing structure requirements**: Unit, integration, and e2e test organization within each feature
- **Error logging patterns**: Structured error capture and dashboard integration per feature
- Documentation: README.md in each feature directory
- **Quality gates**: No TODOs, complete acceptance criteria, full error handling per feature