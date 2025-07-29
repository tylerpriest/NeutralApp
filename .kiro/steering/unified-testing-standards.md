# Unified Testing Standards

## Overview

This steering document provides implementation guidance for the unified testing hierarchy defined in `.cursor/rules/002-unified-testing-hierarchy.mdc`. It focuses on practical application and preventing false success in tests.

## Testing Philosophy

### Core Principle: Value-Driven Testing
**Every test must validate that the system delivers real value to users and meets business objectives.** Tests that pass but don't ensure the system actually works for users are worthless and dangerous.

### SBE/ATDD Core Philosophy
**EXAMPLES FIRST, IMPLEMENTATION SECOND** - Start with concrete examples of how the system should behave, then implement to make those examples pass. This ensures the system is built to deliver real user value from the beginning.

### The Three Amigos Approach
- **Business Analyst**: Defines what value the feature should deliver
- **Developer**: Ensures the examples are technically feasible
- **Tester**: Ensures the examples are testable and cover edge cases

### Executable Specifications
User Acceptance Tests are your **executable specifications** - concrete examples of how the system should behave that can be automated and run continuously. These specifications drive the development process and ensure the system delivers real value.

### The False Success Problem
Many teams write tests that:
- Pass consistently but don't validate real user value
- Test implementation details instead of business outcomes
- Use perfect mocks that never fail in real-world scenarios
- Focus on technical correctness instead of user experience

## Testing Hierarchy Implementation

### 1. User Acceptance Tests (UAT) - Start Here

#### Purpose
Test that users can accomplish their goals and get the promised business value. These are your **executable specifications** that drive development.

#### Implementation Guidelines
- **Write UAT first** before any other tests (Examples First, Implementation Second)
- **Focus on complete user journeys** that deliver value
- **Test business outcomes**, not technical implementation
- **Include error scenarios** that users actually encounter

#### Example Implementation
```typescript
describe('User Story: Plugin Installation', () => {
  test('User can discover, install, and use a plugin', async () => {
    // Given: User is on dashboard
    await page.goto('/dashboard');
    
    // When: User discovers and installs a plugin
    await page.click('[data-testid="plugin-manager"]');
    await page.click('[data-testid="install-reading-core"]');
    await expect(page.locator('text=Plugin installed successfully')).toBeVisible();
    
    // Then: User can immediately use the new functionality
    await page.goto('/dashboard');
    await expect(page.locator('text=📚 Book Library')).toBeVisible();
    
    // And: User can perform the core action
    await page.click('[data-testid="add-book"]');
    await page.fill('[data-testid="book-title"]', 'Test Book');
    await page.click('[data-testid="save-book"]');
    await expect(page.locator('text=Test Book')).toBeVisible();
  });
});
```

### 2. End-to-End (E2E) Tests - Validate Complete Flows

#### Purpose
Test complete user flows through the app, simulating real user actions.

#### Implementation Guidelines
- **Test complete workflows** from start to finish
- **Simulate real user behavior** and timing
- **Include realistic data** and scenarios
- **Test both success and failure paths**

#### Example Implementation
```typescript
describe('Complete User Onboarding Flow', () => {
  test('New user can sign up, explore, and get value', async () => {
    // Complete flow from landing to value delivery
    await page.goto('/');
    await page.click('[data-testid="google-signup"]');
    await mockGoogleOAuthSuccess();
    
    // Verify user reaches dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome to your dashboard')).toBeVisible();
    
    // Verify user can explore and install plugins
    await page.click('[data-testid="plugin-manager"]');
    await expect(page.locator('text=Available Plugins')).toBeVisible();
    
    // Verify user gets immediate value
    await page.click('[data-testid="install-reading-core"]');
    await page.goto('/dashboard');
    await expect(page.locator('text=📚 Book Library')).toBeVisible();
  });
});
```

### 3. Integration Tests - Validate Component Cooperation

#### Purpose
Test how different units or modules work together.

#### Implementation Guidelines
- **Test component integration** that delivers user value
- **Use realistic data** and service responses
- **Test error scenarios** between components
- **Validate that integration provides business value**

#### Example Implementation
```typescript
describe('Dashboard Integration', () => {
  test('Dashboard shows relevant content based on user context', async () => {
    // Mock realistic user state
    mockUserState({
      installedPlugins: ['reading-core'],
      preferences: { theme: 'dark' }
    });
    
    render(<DashboardPage />);
    
    // Test that integration delivers value
    await waitFor(() => {
      expect(screen.getByText('📚 Book Library')).toBeInTheDocument();
      expect(screen.getByText('🕒 Recently Read')).toBeInTheDocument();
    });
    
    // Test that widgets are functional
    await userEvent.click(screen.getByText('Add Book'));
    expect(screen.getByText('Add New Book')).toBeInTheDocument();
  });
});
```

### 4. Unit Tests - Only for Edge Cases

#### Purpose
Test the smallest pieces of code in isolation - ONLY for edge cases that affect user experience.

#### Implementation Guidelines
- **Only write unit tests for edge cases** that impact user experience
- **Test error handling** that users would encounter
- **Test complex business logic** that affects user outcomes
- **Avoid testing implementation details**

#### Example Implementation
```typescript
describe('Widget Error Handling', () => {
  test('Widget shows helpful message when data is unavailable', () => {
    render(<ReadingWidget data={null} />);
    expect(screen.getByText('No books found')).toBeInTheDocument();
    expect(screen.getByText('Add your first book to get started')).toBeInTheDocument();
  });
  
  test('Widget handles network errors gracefully', async () => {
    mockApiError('/api/books');
    render(<ReadingWidget />);
    
    await waitFor(() => {
      expect(screen.getByText('Unable to load books')).toBeInTheDocument();
      expect(screen.getByText('Check your connection and try again')).toBeInTheDocument();
    });
  });
});
```

### 5. Smoke Tests - Critical for Deployment

#### Purpose
Quick, basic checks that the app starts and core features work.

#### Implementation Guidelines
- **Test core user value** is accessible
- **Verify critical paths** work after deployment
- **Keep tests fast** and reliable
- **Focus on user-facing functionality**

#### Example Implementation
```typescript
describe('Application Startup', () => {
  test('App loads and user can access main features', async () => {
    await page.goto('/');
    await expect(page.locator('text=Welcome to NeutralApp')).toBeVisible();
    
    // Test core authentication flow
    await page.click('[data-testid="google-signup"]');
    await mockGoogleOAuthSuccess();
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Available Plugins')).toBeVisible();
  });
});
```

## BDD Implementation

### Gherkin Feature Structure
```gherkin
Feature: [Feature Name]
  As a [user type]
  I want [goal/desire]
  So that [benefit/value]

  Background:
    Given [common setup]

  Scenario: [Happy Path Scenario]
    Given [precondition that sets up user context]
    When [user action that delivers value]
    Then [expected outcome that provides value]
    And [additional value or business outcome]

  Scenario: [Error Path Scenario]
    Given [precondition]
    When [action that could fail]
    Then [user-friendly error handling]
    And [clear path to recovery]
```

### Tag System for Organization
```gherkin
@authentication @oauth @google
Feature: Google Sign-up
  As a first-time visitor
  I want to sign up with Google
  So that I can explore the dashboard instantly

  @happy-path @critical
  Scenario: Successful sign-up and dashboard access
    # Test implementation

  @error-handling @oauth-failure
  Scenario: OAuth failure scenarios
    # Test implementation

  @accessibility @screen-reader @wcag
  Scenario: Accessibility compliance
    # Test implementation
```

## Test Quality Standards

### Value Validation Checklist
Before writing any test, verify:
- [ ] **User Goal Validation**: Does this test validate that users can accomplish their goals?
- [ ] **Business Value Verification**: Does this test verify business value delivery?
- [ ] **Real-World Conditions**: Does this test ensure the feature works in real-world conditions?
- [ ] **Problem Detection**: Would this test catch problems that users would actually encounter?

### Coverage Validation Checklist
- [ ] **Happy Path**: Does this test cover the happy path that delivers user value?
- [ ] **Error Scenarios**: Does this test cover realistic error scenarios?
- [ ] **Edge Cases**: Does this test cover edge cases that could affect user experience?
- [ ] **Performance**: Does this test validate performance constraints?

### Quality Validation Checklist
- [ ] **Reliability**: Is this test reliable and not flaky?
- [ ] **Failure Messages**: Does this test provide clear failure messages?
- [ ] **Maintainability**: Is this test maintainable and easy to understand?
- [ ] **Performance**: Does this test run in a reasonable amount of time?

## Anti-Patterns to Avoid

### 1. Implementation Testing
```typescript
// ❌ ANTI-PATTERN: Tests how it's built, not what it does
test('Component uses useState hook', () => {
  const component = render(<Component />);
  expect(component.container.innerHTML).toContain('useState');
});
```

### 2. Mock-Heavy Testing
```typescript
// ❌ ANTI-PATTERN: Tests that always pass with perfect mocks
const mockApi = {
  get: jest.fn().mockResolvedValue({ data: perfectData })
};
// Test passes but doesn't validate real user experience
```

### 3. Technical Detail Testing
```typescript
// ❌ ANTI-PATTERN: Tests technical implementation, not user value
test('API returns correct HTTP status', async () => {
  const response = await api.get('/users');
  expect(response.status).toBe(200);
  // Doesn't test if user can actually accomplish their goal
});
```

### 4. Happy Path Only
```typescript
// ❌ ANTI-PATTERN: Only tests success scenarios
test('User can sign up', async () => {
  await successfulSignup();
  expect(screen.getByText('Welcome')).toBeInTheDocument();
  // No testing of error scenarios that users actually encounter
});
```

## Success Metrics

### Quality Gates
- ✅ **User Acceptance Tests**: Users can accomplish their stated goals
- ✅ **Business Outcome Tests**: System delivers measurable business value
- ✅ **Error Handling Tests**: System handles failures gracefully
- ✅ **Performance Tests**: System meets performance constraints

### Definition of Done
A feature is only "done" when:
1. **User Acceptance Tests**: Users can accomplish their stated goals
2. **Business Outcome Tests**: System delivers measurable business value
3. **Error Handling Tests**: System handles failures gracefully
4. **Performance Tests**: System meets performance constraints
5. **Accessibility Tests**: System is usable by all users

## Implementation Workflow

### Step 1: Write User Acceptance Tests First
```typescript
// Start with the user story
describe('User Story: First-time visitor signup', () => {
  test('User can sign up with Google and explore dashboard instantly', async () => {
    // Test the complete user journey that delivers value
  });
});
```

### Step 2: Write Integration Tests
```typescript
// Test how components work together
describe('Dashboard Integration', () => {
  test('Dashboard shows user-relevant content based on plugins', async () => {
    // Test component integration delivers value
  });
});
```

### Step 3: Write Unit Tests for Edge Cases
```typescript
// Only test edge cases that affect user experience
describe('Widget Error Handling', () => {
  test('Widget shows helpful message when data is unavailable', () => {
    // Test edge cases that impact user experience
  });
});
```

## Testing Tools and Infrastructure

### Recommended Tools
- **E2E Testing**: Playwright for real browser testing
- **Integration Testing**: Jest with realistic service mocking
- **Unit Testing**: Jest for edge case testing
- **Visual Testing**: Playwright visual regression testing
- **Performance Testing**: Lighthouse CI for performance validation

### Test Organization
```
tests/
├── e2e/                    # End-to-end user journey tests
│   ├── user-onboarding.spec.ts
│   ├── plugin-management.spec.ts
│   └── error-scenarios.spec.ts
├── integration/            # Component integration tests
│   ├── dashboard.spec.ts
│   ├── plugin-system.spec.ts
│   └── authentication.spec.ts
├── unit/                   # Edge case unit tests
│   ├── error-handling.spec.ts
│   ├── business-logic.spec.ts
│   └── accessibility.spec.ts
└── smoke/                  # Deployment smoke tests
    ├── startup.spec.ts
    └── critical-paths.spec.ts
```

## Continuous Integration

### Quality Gates in CI/CD
```yaml
# Example CI configuration
test:
  - name: "User Acceptance Tests"
    command: "npm run test:e2e"
    threshold: "100% pass rate"
  
  - name: "Integration Tests"
    command: "npm run test:integration"
    threshold: ">90% pass rate"
  
  - name: "Unit Tests"
    command: "npm run test:unit"
    threshold: ">80% pass rate"
  
  - name: "Smoke Tests"
    command: "npm run test:smoke"
    threshold: "100% pass rate"
```

### Failure Response
- **UAT Failures**: Stop deployment immediately - user value is broken
- **Integration Failures**: Investigate component cooperation issues
- **Unit Test Failures**: Review edge case handling
- **Smoke Test Failures**: Critical deployment blocker

## Conclusion

The unified testing hierarchy ensures that every test validates real user value and business outcomes. By starting with User Acceptance Tests and working down to unit tests for edge cases, teams can build confidence that their systems actually work for users, not just that the code compiles and individual functions return expected values.

Remember: **Tests that pass but don't validate user value are worse than no tests at all** - they create false confidence and mask real problems that users will encounter in production. 