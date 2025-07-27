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
├── core/           # Core infrastructure (event bus, dependency injection)
├── features/       # Feature-based modules
│   ├── auth/       # Authentication services and interfaces
│   ├── plugin-manager/ # Plugin management system
│   ├── ui-shell/   # UI shell and navigation
│   ├── settings/   # Settings management
│   ├── admin/      # Admin dashboard
│   └── error-reporter/ # Error handling and logging
├── shared/         # Cross-feature utilities and types
└── web/           # Web application (client + server)
    ├── client/    # React frontend
    └── server/    # Express.js backend

tests/
├── e2e/          # End-to-end tests (Playwright)
└── setup.ts      # Test setup configuration
```

## 🔧 Development

### Available Scripts

- `npm test` - Run test suite (Jest)
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report
- `npm run test:e2e` - Run end-to-end tests (Playwright)
- `npm run test:visual` - Run visual regression tests
- `npm run build` - Build TypeScript to JavaScript
- `npm run dev` - Start development server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Testing

The project uses a comprehensive testing strategy:
- **Unit Tests**: Jest with React Testing Library for components
- **Integration Tests**: API and service integration testing
- **E2E Tests**: Playwright for full user journey testing
- **Visual Regression**: Automated UI consistency testing
- **Performance Tests**: Load time and bundle size monitoring

Current test coverage targets:
- Core Services: 90% minimum
- Plugin API: 100% for security-critical paths
- UI Components: Visual regression testing for key interfaces
- Error Handling: Comprehensive error scenario testing

## 🔒 Security

NeutralApp prioritizes security through:
- **Plugin Sandboxing**: Each plugin operates in isolation
- **API Restrictions**: Plugins only access explicitly exposed APIs
- **Security Monitoring**: Violation logging and prevention
- **Session Management**: Secure authentication with NextAuth.js
- **Input Validation**: Comprehensive validation at all boundaries

## 📚 Documentation

This project follows a structured documentation hierarchy:

- **[README.md](README.md)** - Project overview, getting started, basic usage
- **[Requirements](.kiro/specs/neutral-app-foundation/requirements.md)** - Detailed functional requirements
- **[Design](.kiro/specs/neutral-app-foundation/design.md)** - Architecture and design decisions
- **[Tasks](.kiro/specs/neutral-app-foundation/tasks.md)** - Implementation plan and task breakdown
- **[Steering Guidelines](.kiro/steering/)** - Implementation guidelines and coding standards
- **[Development Rules](.cursor/rules/)** - Development process and workflow rules

## 🤝 Contributing

1. Follow Kiro's Definition of Done workflow
2. Write tests first (TDD approach)
3. Ensure all tests pass before submitting
4. Update documentation for new features
5. Follow TypeScript strict mode guidelines

## 📄 License

MIT License - see LICENSE file for details

## 🔗 Links

- [NextAuth.js Documentation](https://next-auth.js.org/) - Authentication provider
- [Jest Documentation](https://jestjs.io/docs/getting-started) - Testing framework
- [Playwright Documentation](https://playwright.dev/) - E2E testing framework
- [TypeScript Documentation](https://www.typescriptlang.org/docs/) - Language reference 