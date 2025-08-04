# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Development Commands

### Building & Testing
- `npm test` - Run Jest test suite (timeout: 10s, maxWorkers: 1, bail on first failure)
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Generate coverage report (target: >90% core services)
- `npm run test:e2e` - Run Playwright end-to-end tests (Chrome, Firefox, Safari)
- `npm run test:uat` - Run User Acceptance Tests with business scenarios
- `npm run test:unified` - Run all test layers (unit, integration, e2e, uat)
- `npm run build` - Build client only (Vite build)
- `npm run build:full` - Build both server (TypeScript) and client
- `npm run build:server` - TypeScript compilation only
- `npm run lint` - ESLint on src/**/*.ts (TypeScript + React rules)
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run quality-gates` - Run comprehensive quality validation

### Development Servers
- `npm run dev` - Start Express server only (port 3000)
- `npm run dev:client` - Start Vite dev server only (port 3001, proxies /api to 3000)
- `npm run dev:full` - Start both servers concurrently
- `npm start` - Start production server from dist/

### Testing Requirements
**CRITICAL**: All TypeScript must compile cleanly with zero errors before proceeding. Core test suite must maintain >80% pass rate. Tests use Jest with strict timeout enforcement (10s) and fail-fast configuration.

## Architecture Overview

NeutralApp follows a **mandatory modular feature-based architecture** with strict plugin-ready structure:

### Architectural Enforcement (MANDATORY)
- **Feature-first organization**: ALL code organized by features, not technical layers
- **No shared technical layers**: Avoid /services/, /interfaces/, /types/ at root level
- **Sacred feature boundaries**: Features communicate only through defined APIs
- **Plugin-ready structure**: Each feature can become a plugin with minimal refactoring

### Core Infrastructure (`src/core/`)
- **Event Bus**: Type-safe event system for decoupled service communication
- **Dependency Injection**: Service container with singleton lifecycle management  
- **Application Lifecycle**: `CoreApplication` class manages service startup/shutdown with health monitoring

### Feature Modules (`src/features/`)
Each feature is completely self-contained with its own interfaces, services, tests, and types:
- **`auth/`**: JWT-based authentication with custom interfaces (no NextAuth)
- **`plugin-manager/`**: Plugin lifecycle, verification, and dependency resolution
- **`ui-shell/`**: Navigation, layout management, widget registry, dashboard manager
- **`settings/`**: User and system settings management
- **`admin/`**: System monitoring, user management, and admin dashboard
- **`error-reporter/`**: Error handling, logging, recovery, and developer notifications

### Testing Structure (Per Feature)
- **`/tests/unit/`**: Unit tests for all functions/components
- **`/tests/integration/`**: Plugin interaction tests
- **`/tests/e2e/`**: Real-world user scenario tests

### Web Application (`src/web/`)
- **`client/`**: React app (React 19, React Router 7, TypeScript strict mode)
- **`server/`**: Express server with `WebServer` class, health checks, static serving
- **Client build**: Vite with chunk optimization, terser minification
- **Development**: Client proxies `/api` calls to server

### Development Workflow (Specification-Driven)
**Pre-Work Assessment**: ALWAYS search existing implementations across codebase, tests, docs, specs before building new functionality to prevent duplication

**Specification-Driven Development**: All features require comprehensive specifications in `.aeon/specs/{feature}/`:
- `spec.md` - User stories, BDD acceptance criteria, ATDD tables, SDD examples, UAT checklists
- `tasks.md` - Prioritized backlog linked to acceptance criteria IDs
- `status.md` - Progress tracking and risk assessment

**Definition of Done**: Requires three mandatory quality gates:
1. **TypeScript Compilation Gate**: Zero compilation errors, strict mode enabled
2. **Core Test Suite Gate**: >80% pass rate, no failing core system tests
3. **Critical Services Gate**: All service interfaces operational, health checks pass

**Error Handling Standards**: 
- ALL errors must be captured automatically with full traceability
- Structured error logging with context, stack traces, and recovery actions
- Multi-perspective analysis trigger after 3+ consecutive quality gate failures

**Task Management**: Update task status in `.aeon/specs/{feature}/status.md` files with progress and blockers

### Human-in-the-Loop (HITL) Process
- **Decisions & Escalations**: Document in `.aeon/scratchpad.md` for user review
- **Assumptions**: Validate technical assumptions before implementation
- **Requirements Gaps**: Interview stakeholders for missing requirements
- **Risk Assessment**: Flag high-risk changes for explicit approval

## Key Implementation Patterns

### Service Registration
```typescript
// Core services implement CoreService interface
const service = new MyService();
coreApp.registerService(service);
await coreApp.start();
```

### Event-Driven Communication
```typescript
import { eventBus } from '@/core/event-bus';
eventBus.emit('plugin:activated', { pluginId: 'demo' });
eventBus.on('user:authenticated', handler);
```

### Plugin Integration
- Plugins register with `PluginManager` through manifest validation
- UI widgets register with `DashboardManager` in `ui-shell`
- All plugins must implement security interfaces for sandboxed execution

### Error Handling
- Global error recovery through `error-reporter` feature
- Component failure handlers with fallback UI
- Comprehensive logging with developer notifications

## Configuration Files

- **TypeScript**: Strict mode enabled, ES2020 target, commonjs modules
- **Jest**: JSDOM environment, ES module transforms, comprehensive mocks for crypto/auth
- **Vite**: React plugin, proxy configuration, modern bundle optimization
- **ESLint**: TypeScript parsing for src/**/*.ts files

## Testing Infrastructure

- **Unit Tests**: Jest + React Testing Library (target: >90% coverage)
- **Integration Tests**: API and service interaction testing
- **E2E Tests**: Playwright with Chrome/Firefox/Safari (visual regression included)
- **UAT Tests**: Business scenario validation with executable specifications
- **Smoke Tests**: Critical path validation for deployments
- **Mocks**: Custom mocks for jose, openid-client in `src/web/client/__mocks__/`
- **Coverage**: 90% for core services, 100% for security-critical paths

## CI/CD Pipeline

### Required Checks (Must Pass)
- **TypeScript Compilation**: Zero errors, strict mode enforcement
- **Test Suite**: Jest unit tests >80% pass rate
- **Code Quality**: ESLint compliance with TypeScript/React rules
- **Security**: npm audit with moderate+ severity blocking
- **E2E**: Playwright tests across browsers
- **Performance**: Bundle size and load time thresholds

### Deployment Pipeline
- **Staging**: Automatic deployment on develop branch after CI passes
- **Production**: Manual deployment on main branch with additional verification
- **Rollback**: Automated rollback capability for failed deployments
- **Monitoring**: Health checks and smoke tests post-deployment

## Quality Standards

All development follows specification-driven methodology with `.aeon/specs/` documentation.

### Industry-Standard Practices (MANDATORY)
- **Proven solutions first**: Prioritize battle-tested solutions over custom implementations
- **Standard libraries**: Use established frameworks instead of reinventing functionality
- **No hacky solutions**: Reject temporary fixes or "glued together" implementations
- **Best practice compliance**: All code must follow established best practices for the technology stack
- **Maintainability focus**: Prioritize long-term maintainability over short-term convenience

### Error Requirements
- **Complete error capture**: Every error must be captured automatically with full context
- **Structured logging**: All errors include user context, component info, timestamps, reproduction steps
- **Graceful degradation**: All errors result in user-friendly messages with recovery actions
- **External monitoring**: Integration with production monitoring service (Sentry recommended)

### Code Standards
- **TypeScript**: Strict mode, explicit types, no `any` usage
- **React**: Functional components, hooks, proper error boundaries
- **Testing**: TDD approach, test-first development
- **Accessibility**: WCAG 2.1 AA compliance required
- **Performance**: Core Web Vitals compliance, bundle optimization

## Commits & Pull Requests

### Commit Guidelines
- **Small & Atomic**: Single logical change per commit
- **Descriptive**: Clear commit messages with context
- **Tested**: All commits must include tests for new functionality
- **Documented**: Update documentation with code changes

### PR Requirements
- **AC Checklist**: All acceptance criteria validated and checked off
- **Test Evidence**: Screenshots, test results, coverage reports
- **Risk Assessment**: Document potential impacts and rollback plans
- **Review**: Minimum one approving review before merge

## Relentless Mode

**Default State**: OFF - Requires explicit user confirmation for major actions  
**When Enabled**: Proceeds with implementation without routine confirmations  
**Auto-stops on**: EMERGENCY STOP command, security risks, data loss potential, destructive operations without backup  
**Documentation**: See `/docs/runbooks/relentless-mode.md` for complete operational guide  

Plugin system ensures fail-safe operation where core always remains available even if plugins fail.