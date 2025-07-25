# NeutralApp

A domain-agnostic, ultra-modular application shell designed to serve as the foundation for any user-facing application. The core provides only essentials (authentication, user settings, admin dashboard, plugin management, UI shell) while all other features are built as plugins.

## 🏗️ Architecture

NeutralApp follows a plugin-first architecture where:
- **Core System**: Provides authentication, settings, plugin management, UI shell, admin dashboard, error handling, and testing framework
- **Plugin System**: All business logic lives in plugins with secure API access and sandboxed execution
- **Fail-Safe Design**: Graceful degradation when plugins fail, core always remains available
- **Developer & AI-Friendly**: Structured APIs, comprehensive logging, automated error handling

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd NeutralApp

# Install dependencies
npm install

# Run tests
npm test

# Build the project
npm run build

# Start development server
npm run dev
```

### Project Structure

```
src/
├── types/           # Core type definitions and interfaces
├── interfaces/      # Service interface definitions
├── services/        # Core service implementations (to be added)
├── plugins/         # Plugin system implementation (to be added)
├── ui/             # UI shell components (to be added)
└── index.ts        # Main application entry point

tests/
├── interfaces/     # Interface contract tests
├── types/         # Type definition tests
└── setup.ts       # Test setup configuration
```

## 🔧 Development

### Available Scripts

- `npm test` - Run test suite
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run build` - Build TypeScript to JavaScript
- `npm run dev` - Start development server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Testing

The project uses Jest with TypeScript for testing. Tests are organized by:
- **Interface Tests**: Validate service interface contracts
- **Type Tests**: Validate type definitions and enums
- **Integration Tests**: Test cross-component interactions (to be added)
- **Plugin Tests**: Test plugin functionality and security (to be added)

Current test coverage targets:
- Core Services: 90% minimum
- Plugin API: 100% for security-critical paths
- UI Components: Visual regression testing for key interfaces
- Error Handling: Comprehensive error scenario testing

## 🏗️ Implementation Status

### ✅ Completed (Task 3)
- [x] Core plugin manager with lifecycle management
- [x] Plugin verification and security compliance checking
- [x] Dependency resolution system
- [x] Plugin installation, enable/disable, and uninstall functionality
- [x] Plugin failure handling and error recovery
- [x] Comprehensive plugin management tests (20 test cases)

### ✅ Completed (Task 4)
- [x] Hierarchical settings management system
- [x] Core, user-specific, and plugin-specific settings
- [x] Settings validation engine with type checking
- [x] Settings persistence and corruption recovery
- [x] Real-time settings change notifications
- [x] Comprehensive settings service tests

### ✅ Completed (Task 5)
- [x] Navigation manager with routing and history
- [x] Layout manager with responsive breakpoint detection
- [x] UI component registration and management
- [x] Navigation guards with priority system
- [x] Grid-based layout calculation engine
- [x] Comprehensive UI framework tests

### ✅ Completed (Task 6)
- [x] Dashboard manager with widget orchestration
- [x] Widget registry for plugin dashboard components
- [x] Welcome screen for new users without plugins
- [x] Widget error handling with graceful degradation
- [x] Configurable dashboard layout system
- [x] Comprehensive dashboard and widget tests

### ✅ Completed (Task 7)
- [x] Admin dashboard with system overview
- [x] System monitor with resource and performance tracking
- [x] User manager with profile viewing and admin actions
- [x] Plugin health monitor with detailed metrics
- [x] System report generator with comprehensive analytics
- [x] Alert subscription system for real-time monitoring

### 📋 Planned
- Plugin communication system with event bus
- Error handling and logging system
- Automated testing framework
- Integration and end-to-end testing
- Documentation and deployment preparation

## 🔒 Security

NeutralApp prioritizes security through:
- **Plugin Sandboxing**: Each plugin operates in isolation
- **API Restrictions**: Plugins only access explicitly exposed APIs
- **Security Monitoring**: Violation logging and prevention
- **Session Management**: Secure authentication with Supabase
- **Input Validation**: Comprehensive validation at all boundaries

## 📚 Documentation

- [Design Document](.kiro/specs/neutral-app/design.md) - Comprehensive architecture and design decisions
- [Requirements](.kiro/specs/neutral-app/requirements.md) - Detailed functional requirements
- [Tasks](.kiro/specs/neutral-app/tasks.md) - Implementation plan and task breakdown
- [Product Overview](.kiro/steering/product.md) - High-level product vision

## 🤝 Contributing

1. Follow Kiro's Definition of Done workflow
2. Write tests first (TDD approach)
3. Ensure all tests pass before submitting
4. Update documentation for new features
5. Follow TypeScript strict mode guidelines

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [Supabase Documentation](https://supabase.com/docs) - Authentication provider
- [Jest Documentation](https://jestjs.io/docs/getting-started) - Testing framework
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - Language reference 