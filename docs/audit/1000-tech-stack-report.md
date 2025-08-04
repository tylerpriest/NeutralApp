# Tech Stack Inventory Report

**Generated:** 2025-08-04  
**Repository:** NeutralApp (Domain-agnostic, ultra-modular application shell)  
**Branch:** terragon/tech-stack-inventory-report  

## Repository Type Analysis

**Type:** Single Application Repository  
**Confidence:** High (100%)  
**How to Verify:** Single package.json at root, no workspace configurations detected  

**Workspace Roots:**
- `/` (Main application root)

## Language Detection

### Primary Languages

| Language | Files | Confidence | How to Verify |
|----------|-------|------------|---------------|
| **TypeScript** | 150+ files | High (100%) | `find . -name "*.ts" -o -name "*.tsx" \| wc -l` |
| **JavaScript** | 20+ files | High (100%) | `find . -name "*.js" -o -name "*.jsx" \| wc -l` |
| **HTML** | 2 files | High (100%) | `find . -name "*.html"` |
| **CSS** | 5+ files | Medium (90%) | `find . -name "*.css"` |

### Configuration Languages
- **JSON** (package.json, tsconfig.json, manifest files)
- **YAML** (GitHub Actions, Docker Compose)
- **Shell** (deployment scripts)

## Package Manager Analysis

**Primary Package Manager:** npm  
**Confidence:** High (100%)  
**Evidence:**
- `package-lock.json` present
- `npm` commands in package.json scripts
- No yarn.lock, pnpm-lock.yaml, or bun.lockb found

**Node.js Version:** 20.x (specified in package.json engines)  
**How to Verify:** `cat package.json | grep -A2 engines`

## Framework Detection

### Frontend Framework Stack

| Component | Technology | Version | Confidence | How to Verify |
|-----------|------------|---------|------------|---------------|
| **UI Framework** | React | 19.1.0 | High (100%) | `npm list react` |
| **Build Tool** | Vite | 7.0.6 | High (100%) | `npm list vite` |
| **Routing** | React Router | 7.7.1 | High (100%) | `npm list react-router-dom` |
| **Styling** | Tailwind CSS | 4.1.11 | High (100%) | `npm list tailwindcss` |
| **TypeScript** | TypeScript | 5.8.3 | High (100%) | `npm list typescript` |

### Backend Framework Stack

| Component | Technology | Version | Confidence | How to Verify |
|-----------|------------|---------|------------|---------------|
| **Server** | Express.js | 4.21.2 | High (100%) | `npm list express` |
| **Security** | Helmet | 8.1.0 | High (100%) | `npm list helmet` |
| **CORS** | cors | 2.8.5 | High (100%) | `npm list cors` |
| **Authentication** | JWT (jsonwebtoken) | 9.0.2 | High (100%) | `npm list jsonwebtoken` |

## Testing Infrastructure

### Testing Framework Stack

| Component | Technology | Version | Confidence | How to Verify |
|-----------|------------|---------|------------|---------------|
| **Unit Testing** | Jest | 29.7.0 | High (100%) | `npm list jest` |
| **Test Environment** | jsdom | 29.7.0 | High (100%) | `npm list jest-environment-jsdom` |
| **React Testing** | React Testing Library | 16.3.0 | High (100%) | `npm list @testing-library/react` |
| **E2E Testing** | Playwright | 1.54.1 | High (100%) | `npm list @playwright/test` |
| **Accessibility** | jest-axe | 10.0.0 | High (100%) | `npm list jest-axe` |

### Testing Commands
- `npm test` - Unit tests with Jest
- `npm run test:e2e` - Playwright E2E tests
- `npm run test:coverage` - Coverage reports
- `npm run test:unified` - All tests combined

## UI Stack Analysis

### Component System

| Component | Technology | Version | Confidence | How to Verify |
|-----------|------------|---------|------------|---------------|
| **Design System** | Custom + Radix UI | 1.2.3 | High (100%) | `npm list @radix-ui/react-slot` |
| **Icons** | Lucide React | 0.526.0 | High (100%) | `npm list lucide-react` |
| **Styling** | Tailwind CSS | 4.1.11 | High (100%) | Check tailwind.config.js |
| **Class Utilities** | clsx + tailwind-merge | Latest | High (100%) | `npm list clsx tailwind-merge` |

### UI Architecture
- **Component-based:** React functional components with hooks
- **Styling approach:** Utility-first with Tailwind CSS
- **Design tokens:** Custom color palette and spacing defined in tailwind.config.js
- **State management:** React Context + built-in hooks

## Data Layer Analysis

### Data Management

| Component | Technology | Confidence | How to Verify |
|-----------|------------|------------|---------------|
| **HTTP Client** | Axios | High (100%) | `npm list axios` |
| **File Storage** | Local filesystem | High (100%) | Check src/features/file-manager |
| **Session Management** | JWT tokens | High (100%) | Check src/features/auth |
| **Plugin Data** | JSON files | High (100%) | Check data/installed-plugins.json |

### External Services
**None Detected** - Application appears to be designed for offline/local operation
**Confidence:** Medium (80%)
**Assumption:** No external database connections or cloud service integrations found

## CI/CD Configuration

### GitHub Actions

| Workflow | Purpose | Confidence | How to Verify |
|----------|---------|------------|---------------|
| **ci.yml** | Continuous Integration | High (100%) | `.github/workflows/ci.yml` |
| **deploy.yml** | Continuous Deployment | High (100%) | `.github/workflows/deploy.yml` |
| **docker-build.yml** | Container builds | High (100%) | `.github/workflows/docker-build.yml` |

### Deployment Targets

| Target | Technology | Confidence | How to Verify |
|--------|------------|------------|---------------|
| **Containerization** | Docker | High (100%) | `Dockerfile` present |
| **Static Hosting** | Vercel | High (100%) | `vercel.json` configuration |
| **Container Orchestration** | Docker Compose | High (100%) | `docker-compose.yml` files |

## Build & Development Tools

### Build Configuration

| Tool | Purpose | Configuration | Confidence |
|------|---------|---------------|------------|
| **Vite** | Frontend build | vite.config.ts | High (100%) |
| **TypeScript** | Type checking | tsconfig.json | High (100%) |
| **ESLint** | Code linting | eslint.config.mjs | High (100%) |
| **PostCSS** | CSS processing | postcss.config.js | High (100%) |

### Development Scripts
```bash
npm run dev          # Start full development environment
npm run build:full   # Build both client and server
npm run lint         # Run ESLint
npm run test:watch   # Test watcher mode
```

## Architecture Patterns

### Modular Architecture
**Pattern:** Feature-based modular architecture  
**Confidence:** High (100%)  
**Evidence:** Well-defined src/features/ structure with clear boundaries

### Plugin System
**Present:** Yes - Sophisticated plugin management system  
**Confidence:** High (100%)  
**Features:** Plugin lifecycle, dependency resolution, health monitoring

## Version Information

### Core Dependencies (Production)
```json
{
  "react": "19.1.0",
  "express": "4.21.2",
  "typescript": "5.8.3",
  "vite": "7.0.6",
  "tailwindcss": "4.1.11"
}
```

### Development Tools
```json
{
  "jest": "29.7.0",
  "@playwright/test": "1.54.1",
  "@testing-library/react": "16.3.0",
  "eslint": "9.32.0"
}
```

## Assumptions to Validate

1. **Database Usage:** No traditional database detected - validate if this is intentional for the application's use case
2. **External APIs:** No external API integrations found - confirm if this is by design
3. **Authentication Provider:** Using custom JWT implementation - validate if this meets security requirements
4. **Plugin Storage:** Plugins stored in local JSON files - confirm if this scales for production
5. **Error Monitoring:** Custom error reporting system - validate if external monitoring tools are needed

## Quality & Security

### Code Quality Tools
- **TypeScript strict mode** enabled
- **ESLint** with TypeScript and React rules
- **Automated testing** with >80% coverage requirements
- **Type safety** enforced throughout codebase

### Security Measures
- **Helmet.js** for Express security headers
- **CORS** configuration
- **JWT** for authentication
- **Security audits** in CI pipeline
- **Container security** with non-root user

## Confidence Summary

- **Language Detection:** 100% - Clear TypeScript/React stack
- **Framework Stack:** 100% - Standard modern web application
- **Testing Setup:** 100% - Comprehensive testing infrastructure  
- **CI/CD Pipeline:** 100% - Well-configured GitHub Actions
- **Architecture:** 95% - Well-documented modular design
- **Security:** 90% - Good practices, may need external monitoring
- **Scalability:** 80% - Plugin system architecture supports growth

**Overall Confidence:** 95% - Very clear and well-documented technology stack