# Product Overview

NeutralApp is a domain-agnostic, ultra-modular application shell designed as a foundation for any user-facing application. The core provides only essentials (authentication, user settings, admin dashboard, plugin management, UI shell) while all other features are built as plugins.

## Key Principles

- **Plugin-First Architecture**: All business logic lives in plugins, core remains minimal
- **Sandboxed Environment**: Each plugin operates in isolation with secure API access
- **Fail-Safe Design**: Graceful degradation when plugins fail, core always available
- **Developer & AI-Friendly**: Structured APIs, comprehensive logging, automated error handling

## Target Users

- Developers seeking solid foundation without reinventing infrastructure
- AI Agents needing clear APIs and structured error handling
- Plugin Authors creating reusable components
- End Users wanting flexible, maintainable applications

## Core Features

- Secure authentication and user management
- Plugin manager with install/uninstall capabilities
- Configurable user settings panel
- Admin dashboard with monitoring and logs
- UI shell with consistent navigation
- Extensible plugin API with event system
- Structured error logging with in-context UI
- Automated test runner for all plugins