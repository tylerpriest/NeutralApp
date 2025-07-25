# AGENT.md - NeutralApp Development Guide

## Build/Test Commands
- `npm run build` - Build TypeScript to JavaScript 
- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode for single file changes
- `jest --testNamePattern="specific test name"` - Run single test
- `npm run test:coverage` - Generate coverage report (80% threshold required)
- `npm run lint` - ESLint check
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run dev` - Start development server

## Architecture
Ultra-modular plugin-first architecture with TypeScript, Jest, Express, and Supabase. Core services in `src/services/`, interfaces in `src/interfaces/`, types in `src/types/`. Plugin system with sandboxed execution, settings hierarchy, UI framework with navigation/layout managers, admin dashboard with system monitoring. Tests in `tests/` with comprehensive coverage.

## Code Style & Guidelines  
- Strict TypeScript mode enabled with comprehensive type checking
- TDD approach - write tests first, minimum 80% coverage required
- Follow Kiro Definition of Done workflow - spec-driven development required
- Interface-first design with modular service architecture
- No comments in code unless complex logic requires context
- Use existing libraries: Jest for testing, Express for server, Supabase for auth
- Relentless mode enabled - auto-approve and continuous progress
- Conventional commit format for version control
