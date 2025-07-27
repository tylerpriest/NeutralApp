# NeutralApp

A domain-agnostic, ultra-modular application shell designed to serve as the foundation for any user-facing application. The core provides only essentials (authentication, user settings, admin dashboard, plugin management, UI shell) while all other features are built as plugins.

## 🏗️ Architecture

NeutralApp follows a **modular feature-based architecture** where:
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

# Run tests (now with improved reliability)
npm test

# Build the project
npm run build

# Start development server
npm run dev
```

### Project Structure

```
NeutralApp/
├── 📋 Documentation
│   ├── README.md                 # Project introduction and quick start
│   └── docs/
│       ├── api/                  # API documentation
│       ├── deployment/           # Deployment and operations guide
│       └── guides/               # Development guides
│
├── ⚙️ Configuration
│   ├── .cursor/                  # Cursor IDE rules and development notes
│   │   ├── drafts/               # Draft specs/steering
│   │   ├── internal-docs/        # Internal documentation
│   │   ├── rules/                # Code quality and workflow rules
│   │   └── SCRATCHPAD.md         # Development notes and current focus
│   ├── .kiro/                    # Kiro AI assistant configuration
│   │   ├── specs/                # Feature specifications and tasks
│   │   └── steering/             # AI development guidelines
│   └── .github/                  # GitHub workflows and templates
│       
├── 🏗️ Application Code
│   ├── src/                      # Main application source code
│   │   ├── core/                 # Core infrastructure
│   │   │   ├── dependency-injection/ # Service container and DI
│   │   │   ├── event-bus/        # Event-driven communication system
│   │   │   └── index.ts          # Core application lifecycle
│   │   ├── features/             # Feature-based modules
│   │   │   ├── admin/            # Admin dashboard and system monitoring
│   │   │   ├── auth/             # Authentication services and interfaces
│   │   │   ├── error-reporter/   # Error handling and logging
│   │   │   ├── plugin-manager/   # Plugin management system
│   │   │   ├── settings/         # Settings management
│   │   │   └── ui-shell/         # UI shell and navigation
│   │   ├── plugins/              # Plugin ecosystem
│   │   │   ├── demo-hello-world/ # Example plugin
│   │   │   └── index.ts          # Plugin registry and discovery
│   │   ├── shared/               # Cross-feature utilities and types
│   │   ├── types/                # Global TypeScript types
│   │   ├── web/                  # Web application (client + server)
│   │   │   ├── client/           # React frontend
│   │   │   │   ├── __mocks__/    # Jest mocks for testing
│   │   │   │   ├── components/   # Reusable UI components
│   │   │   │   ├── contexts/     # React contexts
│   │   │   │   ├── hooks/        # Custom React hooks
│   │   │   │   ├── pages/        # Page components
│   │   │   │   ├── services/     # Client-side services
│   │   │   │   ├── styles/       # Global styles
│   │   │   │   ├── tests/        # Client integration tests
│   │   │   │   ├── App.tsx       # Main React application
│   │   │   │   ├── index.html    # HTML template
│   │   │   │   └── index.tsx     # React entry point
│   │   │   ├── server/           # Express.js backend
│   │   │   │   ├── auth/         # Authentication server components
│   │   │   │   ├── tests/        # Server tests
│   │   │   │   ├── foundation.ts # Server foundation
│   │   │   │   ├── index.ts      # Server entry point
│   │   │   │   ├── SimpleAPIRouter.ts
│   │   │   │   ├── SimpleWebServer.ts
│   │   │   │   └── WebServer.ts
│   │   │   └── shared/           # Web shared utilities
│   │   └── index.ts              # Main application entry point
│   └── client/                   # Legacy client directory (deprecated)
│
├── 🧪 Testing
│   ├── tests/                    # Test suite
│   │   ├── e2e/                  # End-to-end tests (Playwright)
│   │   └── setup.ts              # Test setup configuration
│   └── test-results/             # Test output and reports
│
└── 📦 Assets & Config
    ├── uploads/                  # Static assets
    └── [config files]            # Various configuration files
```

## 🔧 Development

### Available Scripts

- `npm test` - Run test suite (Jest) with improved reliability
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run test:e2e` - Run end-to-end tests (Playwright)
- `npm run test:visual` - Run visual regression tests
- `npm run build` - Build TypeScript to JavaScript
- `npm run dev` - Start development server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Testing

The project uses a comprehensive testing strategy with **improved reliability**:
- **Unit Tests**: Jest with React Testing Library for components
- **Integration Tests**: API and service integration testing
- **E2E Tests**: Playwright for full user journey testing
- **Visual Regression**: Automated UI consistency testing
- **Performance Tests**: Load time and bundle size monitoring

**Recent Test Improvements:**
- ✅ **No more hanging tests** - All tests complete within timeout limits
- ✅ **Proper ES module support** - Jest handles all dependencies correctly
- ✅ **React act() warnings resolved** - Clean component testing
- ✅ **Timeout management** - Tests fail fast instead of hanging indefinitely
- ✅ **Mock system** - Comprehensive mocks for external dependencies

Current test coverage targets:
- Core Services: 90% minimum
- Plugin API: 100% for security-critical paths
- UI Components: Visual regression testing for key interfaces
- Error Handling: Comprehensive error scenario testing

## 🏛️ Core Infrastructure

### Event Bus System ✅ **IMPLEMENTED**
- **Decoupled Communication**: Services communicate via events
- **Type-Safe Events**: Full TypeScript support for event handling
- **Async Support**: Handles both synchronous and asynchronous events
- **Singleton Pattern**: Global event bus instance available

### Dependency Injection ✅ **IMPLEMENTED**
- **Service Container**: Centralized service management
- **Singleton Support**: Configurable service lifecycle
- **Type Safety**: Full TypeScript integration
- **Service Registry**: Dynamic service registration and resolution

### Application Lifecycle ✅ **IMPLEMENTED**
- **Graceful Startup**: Sequential service initialization
- **Health Monitoring**: Real-time service health checks
- **Clean Shutdown**: Proper resource cleanup
- **Configuration Management**: Environment-based configuration

## 🎯 Implemented Features

### ✅ **Core Infrastructure**
- Event bus system with type-safe event handling
- Dependency injection container with service lifecycle management
- Application lifecycle with startup/shutdown procedures
- Configuration management system

### ✅ **Web Application**
- **React Frontend**: Complete UI with components and pages
  - Admin Dashboard with system monitoring
  - Authentication pages and guards
  - Settings management interface
  - Plugin management interface
  - Dashboard with widget system
- **Express Backend**: Full server implementation
  - WebServer with static file serving
  - API router with comprehensive endpoints
  - Authentication integration with JWT
  - Health monitoring and logging

### ✅ **Feature Modules**
- **Authentication**: JWT-based authentication with custom interfaces
- **Plugin Manager**: Plugin lifecycle management and verification
- **UI Shell**: Navigation, layout management, and widget system
- **Settings**: User and system settings management
- **Admin Dashboard**: System monitoring and administration
- **Error Reporter**: Comprehensive error handling and logging

### ✅ **Testing Infrastructure**
- Jest configuration with ES module support
- React Testing Library integration
- Comprehensive mock system for external dependencies
- Timeout management and test isolation
- Visual regression testing setup

### ✅ **Plugin System**
- Plugin manifest validation and verification
- Demo plugin implementation
- Plugin registry and discovery system
- Security and dependency checking

## 🔒 Security

NeutralApp prioritizes security through:
- **Plugin Sandboxing**: Each plugin operates in isolation
- **API Restrictions**: Plugins only access explicitly exposed APIs
- **Security Monitoring**: Violation logging and prevention
- **Session Management**: Secure JWT-based authentication
- **Input Validation**: Comprehensive validation at all boundaries
- **Plugin Verification**: Manifest validation and signature checking

## 📚 Documentation

This project follows a structured documentation hierarchy:

### **User Documentation**
- **[README.md](README.md)** - Project overview, getting started, basic usage
- **[API Reference](docs/api/)** - Plugin API documentation and interfaces
- **[Development Guides](docs/guides/)** - Plugin development tutorials and examples
- **[Deployment Documentation](docs/deployment/)** - Complete deployment and operations guide

### **Project Documentation**
- **[Requirements](.kiro/specs/COMPLETED/neutral-app-foundation/requirements.md)** - Detailed functional requirements
- **[Design](.kiro/specs/COMPLETED/neutral-app-foundation/design.md)** - Architecture and design decisions
- **[Tasks](.kiro/specs/COMPLETED/neutral-app-foundation/tasks.md)** - Implementation plan and task breakdown
- **[Steering Guidelines](.kiro/steering/)** - Implementation guidelines and coding standards
- **[Development Rules](.cursor/rules/)** - Development process and workflow rules

## 🤝 Contributing

1. Follow Kiro's Definition of Done workflow
2. Write tests first (TDD approach)
3. Ensure all tests pass before submitting
4. Update documentation for new features
5. Follow TypeScript strict mode guidelines

## 🐛 Recent Fixes

### Test Reliability Improvements
- **Fixed hanging tests** in quality-audit and useOptimisticUpdate
- **Resolved ES module parsing** issues with NextAuth.js and related libraries
- **Implemented proper mocks** for authentication and cryptography libraries
- **Added timeout management** to prevent infinite test hangs
- **Fixed React act() warnings** in component tests

### Core Infrastructure
- **Implemented event bus system** for decoupled service communication
- **Added dependency injection container** for service management
- **Created core application lifecycle** with proper startup/shutdown
- **Implemented plugin verification** with manifest validation
- **Reduced TODO comments** by 33% through feature implementation

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [JWT Authentication](https://jwt.io/) - JSON Web Token authentication
- [Jest Documentation](https://jestjs.io/docs/getting-started) - Testing framework
- [Playwright Documentation](https://playwright.dev/) - E2E testing framework
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - Language reference 