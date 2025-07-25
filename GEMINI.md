# GEMINI Agent Guide: NeutralApp

This guide provides the foundational principles, architecture, and workflows for developing the NeutralApp. Adherence to these guidelines is mandatory for all development activities.

## 1. Core Philosophy

The project is driven by two main principles: building production-ready applications relentlessly and adhering to a strict, spec-driven development process.

### 1.1. Relentless, Quality-Focused Development
The "Relentless Mode" philosophy is not about moving forward at all costs, but about the *relentless pursuit of building production-ready applications*. This means:
- **Continuous Progress**: The agent will work autonomously, auto-approving actions to maintain momentum.
- **Build Fast AND Build Right**: Speed is achieved through efficiency, not by bypassing quality.
- **Foundation-First**: If quality gates fail, the immediate priority is to stop and fix the underlying issues before proceeding.

### 1.2. Spec-Driven Workflow & Definition of Done
All development follows a strict, spec-driven workflow based on the Kiro methodology. A task is only considered "done" when it meets the following criteria:

1.  **Spec Foundation**: The task is based on existing `.kiro/specs/{feature_name}/` files (`requirements.md`, `design.md`, `tasks.md`).
2.  **Task Management**: The current task is identified and marked as in-progress in `tasks.md`.
3.  **Test-Driven Development (TDD)**: Comprehensive tests (unit, integration, error handling) are written *before* implementation.
4.  **Minimal Implementation**: Code is written to pass the tests, adhering to the project's architecture and quality standards.
5.  **Quality Gates Passed**: All mandatory quality gates are green.
6.  **Documentation Updated**: All relevant documentation (`README`, specs, API docs) is updated.
7.  **Task Completed**: The task is marked as complete in `tasks.md`.
8.  **Commited**: Changes are committed with a conventional commit message.

---

## 2. Quality Standards & Gates

Quality is not negotiable. The following standards and automated gates are enforced to ensure a production-ready application.

### 2.1. Mandatory Quality Gates
Development will be halted if any of these gates fail.

1.  **TypeScript Compilation Gate**:
    - **Rule**: All TypeScript code must compile with zero errors (`tsc --noEmit`).
    - **Rationale**: Catches type-related errors and ensures code integrity.

2.  **Core Test Suite Gate**:
    - **Rule**: The core test suite must maintain a pass rate of over 80% (`npm test`).
    - **Rationale**: Prevents regressions in critical system components.

3.  **Critical Services Gate**:
    - **Rule**: All critical services (Auth, Plugin Manager, Settings, UI Shell) must have working and responsive interfaces.
    - **Rationale**: Ensures the application's core functionality is always operational.

### 2.2. General Quality Requirements
- **No `TODO`s**: All code must be complete. No `TODO` comments are allowed in production code.
- **Comprehensive Testing**: All features must have unit, integration, and end-to-end tests.
- **Complete Error Handling**: Every potential error must be captured, logged, and handled gracefully. Errors must be traceable to their source without manual investigation.
- **User-Facing Errors**: Error messages shown to the user must be simple, non-technical, and provide clear recovery steps.

---

## 3. Architecture

The project follows a strict, modular, feature-based architecture.

### 3.1. Feature-First Organization
- **MANDATORY**: All code is organized by feature, not by technical layer (e.g., `/services`, `/types`). Each feature is a self-contained vertical slice.
- **Structure**:
  ```
  /src/features/{feature-name}/
    ├── interfaces/
    ├── services/
    ├── tests/
    ├── types/
    └── index.ts
  ```
- **Boundaries**: Features communicate only through defined APIs, typically exported from their `index.ts` file.

### 3.2. Plugin-First Architecture
- **Core vs. Plugins**: The application core provides only essential services (auth, settings, plugin management). All other business logic is implemented as plugins.
- **Isolation**: Plugins operate in a sandboxed environment with secure access to core APIs.

### 3.3. Shared Infrastructure
- **`/src/core/`**: Houses essential, cross-cutting concerns like the `event-bus` and `dependency-injection`.
- **`/src/shared/`**: Contains shared utilities, types, and constants that do not belong to any specific feature.

---

## 4. Problem Solving: Multi-Perspective Analysis

When a technical problem persists, or when the same quality gate fails three or more times consecutively, a structured, multi-perspective analysis is required. This can also be manually triggered with the `#multi-perspective-analysis` key.

The goal is to step back and analyze the problem from seven different viewpoints:

1.  **PM Perspective**: What is the business impact? What are the priorities?
2.  **Senior Dev Perspective**: What are the root causes and architectural implications?
3.  **Code Monkey Perspective**: What are the specific code-level fixes?
4.  **QA Tester Perspective**: What is breaking? What test cases are failing?
5.  **DevOps Perspective**: What is the impact on the build and deployment process?
6.  **Tech Lead Perspective**: What is the strategic approach? What are the trade-offs?
7.  **Architect Perspective**: Are there meta-level solutions or patterns that can solve this class of problem?

After analyzing from each perspective, synthesize the insights to determine the best path forward.

---

## 5. Design & Technology

### 5.1. Design Philosophy
The application's design is clean, minimal, and content-focused. It prioritizes clarity, whitespace, and subtle, non-distracting interactions.

- **Color**: Primarily dark text on a white background, with a palette of grays and subtle semantic colors for states.
- **Typography**: Clean, sans-serif system fonts with a clear hierarchy.
- **Layout**: Generous whitespace, a consistent spacing scale (8px base), and minimal borders or shadows.

### 5.2. Technology Stack
The tech stack is chosen to support a modular, plugin-based architecture.

- **Frontend**: A modern, component-based web framework with strong TypeScript support.
- **Backend**: A RESTful API with JWT/OAuth for authentication and an event-driven architecture for inter-plugin communication.
- **Development Tools**: A comprehensive testing framework, structured logging, and quality gates are required.
