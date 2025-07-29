# Unified Testing Hierarchy Rule

## Core Principle
**TEST WHAT MATTERS, NOT WHAT'S EASY** - Every test must validate that the system delivers real value to users and meets business objectives. Tests that pass but don't ensure the system actually works for users are worthless and dangerous.

## Specification by Example / Acceptance-Test-Driven Development Integration

### SBE/ATDD Core Philosophy
**EXAMPLES FIRST, IMPLEMENTATION SECOND** - Start with concrete examples of how the system should behave, then implement to make those examples pass. This ensures the system is built to deliver real user value from the beginning.

### The Three Amigos Approach
- **Business Analyst**: Defines what value the feature should deliver
- **Developer**: Ensures the examples are technically feasible
- **Tester**: Ensures the examples are testable and cover edge cases

## The Problem: False Success Tests

### Common Anti-Patterns That Create False Confidence
```typescript
// ❌ DANGEROUS: Tests implementation, not value
test('Component renders with props', () => {
  render(<Component data={mockData} />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
  // Test passes but doesn't validate user can accomplish their goal
});

// ❌ DANGEROUS: Tests technical details, not user value
test('API returns 200 status', async () => {
  const response = await api.get('/users');
  expect(response.status).toBe(200);
  // Test passes but doesn't validate user can actually use the feature
});

// ❌ DANGEROUS: Tests with perfect mocks that never fail
const mockApi = {
  get: jest.fn().mockResolvedValue({ data: perfectData })
};
// Test always passes but doesn't validate real-world behavior
```

## Testing Hierarchy (Value-First Priority)

### 1. **User Acceptance Tests (UAT) - HIGHEST PRIORITY**
**Purpose**: Test that users can accomplish their goals and get the promised business value.

**SBE/ATDD Integration**: These are your **executable specifications** - concrete examples of how the system should behave that can be automated and run continuously.

```typescript
// ✅ VALUABLE: Tests complete user journey that delivers value
describe('User Story: First-time visitor signup', () => {
  test('User can sign up with Google and explore dashboard instantly', async () => {
    // Given: User is on landing page
    await page.goto('/');
    
    // When: User clicks sign up with Google
    await page.click('[data-testid="google-signup"]');
    
    // Then: User should be on dashboard with core features
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome to your dashboard')).toBeVisible();
    
    // And: User should see available plugins to explore
    await expect(page.locator('text=Available Plugins')).toBeVisible();
    await expect(page.locator('text=reading-core')).toBeVisible();
    
    // And: User should be able to install and use a plugin
    await page.click('[data-testid="install-reading-plugin"]');
    await expect(page.locator('text=📚 Book Library')).toBeVisible();
  });
});
```

### 2. **End-to-End (E2E) Tests - HIGH PRIORITY**
**Purpose**: Test complete user flows through the app, simulating real user actions.

```typescript
// ✅ VALUABLE: Tests complete user workflow
describe('Plugin Installation Flow', () => {
  test('User can install plugin and immediately use its features', async () => {
    // Test the entire flow from discovery to usage
    await page.goto('/plugin-manager');
    await page.click('[data-testid="install-reading-core"]');
    await expect(page.locator('text=Plugin installed successfully')).toBeVisible();
    
    // Test that user can actually use the new functionality
    await page.goto('/dashboard');
    await expect(page.locator('text=📚 Book Library')).toBeVisible();
    await page.click('[data-testid="add-book"]');
    await page.fill('[data-testid="book-title"]', 'Test Book');
    await page.click('[data-testid="save-book"]');
    await expect(page.locator('text=Test Book')).toBeVisible();
  });
});
```

### 3. **Integration Tests - MEDIUM PRIORITY**
**Purpose**: Test how different units or modules work together.

```typescript
// ✅ VALUABLE: Tests component integration delivers value
describe('Dashboard Integration', () => {
  test('Dashboard shows user-relevant content based on installed plugins', async () => {
    // Mock real plugin installation
    mockInstalledPlugins([{ id: 'reading-core', status: 'enabled' }]);
    
    render(<DashboardPage />);
    
    // Test the full integration
    await waitFor(() => {
      expect(screen.getByText('📚 Book Library')).toBeInTheDocument();
      expect(screen.getByText('🕒 Recently Read')).toBeInTheDocument();
    });
    
    // Test that widgets are actually functional
    await userEvent.click(screen.getByText('Add Book'));
    expect(screen.getByText('Add New Book')).toBeInTheDocument();
  });
});
```

### 4. **Unit Tests - LOWER PRIORITY**
**Purpose**: Test the smallest pieces of code in isolation - ONLY for edge cases that affect user experience.

```typescript
// ✅ VALUABLE: Tests edge cases that impact user experience
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

### 5. **Smoke Tests - CRITICAL FOR DEPLOYMENT**
**Purpose**: Quick, basic checks that the app starts and core features work.

```typescript
// ✅ VALUABLE: Tests that core user value is accessible
describe('Application Startup', () => {
  test('App loads and user can access main features', async () => {
    await page.goto('/');
    await expect(page.locator('text=Welcome to NeutralApp')).toBeVisible();
    
    await page.click('[data-testid="google-signup"]');
    await mockGoogleOAuthSuccess();
    
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Available Plugins')).toBeVisible();
  });
});
```

### 6. **UI / Visual Regression Tests - MEDIUM PRIORITY**
**Purpose**: Test that the app's visual appearance hasn't unexpectedly changed.

```typescript
// ✅ VALUABLE: Tests that UI changes don't break user experience
describe('Dashboard Layout', () => {
  test('Dashboard layout remains usable after UI changes', async () => {
    await page.goto('/dashboard');
    
    // Test that key elements are still visible and accessible
    await expect(page.locator('[data-testid="plugin-manager"]')).toBeVisible();
    await expect(page.locator('[data-testid="settings"]')).toBeVisible();
    
    // Test that layout is still responsive
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
  });
});
```

### 7. **Regression Tests - HIGH PRIORITY**
**Purpose**: Ensure previously fixed bugs and critical features stay fixed.

```typescript
// ✅ VALUABLE: Tests that known issues don't return
describe('Regression Tests', () => {
  test('Plugin installation doesn\'t break existing functionality', async () => {
    // Test that installing a new plugin doesn't break existing features
    await installPlugin('reading-core');
    await navigateToDashboard();
    
    // Verify existing functionality still works
    await expect(page.locator('[data-testid="settings"]')).toBeVisible();
    await expect(page.locator('[data-testid="admin"]')).toBeVisible();
    
    // Verify new functionality works
    await expect(page.locator('text=📚 Book Library')).toBeVisible();
  });
});
```

## BDD (Behavior-Driven Development) Integration

### BDD Primary Role: User Acceptance Tests (UAT)
BDD is **most closely aligned with UAT** because it focuses on business value and user behavior.

```gherkin
Feature: Google Sign-up
  As a first-time visitor
  I want to sign up with Google
  So that I can explore the dashboard instantly

  Scenario: Successful sign-up and dashboard access
    Given I am on the landing page
    When I click "Sign up with Google"
    Then I should be redirected to Google OAuth consent screen
    And I should see the app requesting necessary permissions
    When I approve the OAuth request
    Then I should be redirected back to the application
    And I should be automatically logged in
    And I should be taken to the dashboard page
    And I should see a welcome message with my name
    And I should see available plugins to explore
```

### BDD Secondary Role: End-to-End Tests
BDD is excellent for E2E testing because it describes complete user journeys.

### BDD Across All Test Types
Apply BDD principles to other test types with business-focused naming:

```typescript
describe('Plugin Manager', () => {
  describe('when user installs a plugin', () => {
    it('should make the plugin features available on dashboard', async () => {
      // Test implementation
    });
    
    it('should handle installation failures gracefully', async () => {
      // Test implementation
    });
  });
});
```

## Test Writing Checklist (Prevents False Success)

Before writing any test, ask these questions:

### Value Validation
- [ ] Does this test validate that users can accomplish their goals?
- [ ] Does this test verify business value delivery?
- [ ] Does this test ensure the feature works in real-world conditions?
- [ ] Would this test catch problems that users would actually encounter?

### Coverage Validation
- [ ] Does this test cover the happy path that delivers user value?
- [ ] Does this test cover realistic error scenarios?
- [ ] Does this test cover edge cases that could affect user experience?
- [ ] Does this test validate performance constraints?

### Quality Validation
- [ ] Is this test reliable and not flaky?
- [ ] Does this test provide clear failure messages?
- [ ] Is this test maintainable and easy to understand?
- [ ] Does this test run in a reasonable amount of time?

## Anti-Patterns That Create False Success

### 1. **Implementation Testing**
```typescript
// ❌ ANTI-PATTERN: Tests how it's built, not what it does
test('Component uses useState hook', () => {
  const component = render(<Component />);
  expect(component.container.innerHTML).toContain('useState');
});
```

### 2. **Mock-Heavy Testing**
```typescript
// ❌ ANTI-PATTERN: Tests that always pass with perfect mocks
const mockApi = {
  get: jest.fn().mockResolvedValue({ data: perfectData })
};
// Test passes but doesn't validate real user experience
```

### 3. **Technical Detail Testing**
```typescript
// ❌ ANTI-PATTERN: Tests technical implementation, not user value
test('API returns correct HTTP status', async () => {
  const response = await api.get('/users');
  expect(response.status).toBe(200);
  // Doesn't test if user can actually accomplish their goal
});
```

### 4. **Happy Path Only**
```typescript
// ❌ ANTI-PATTERN: Only tests success scenarios
test('User can sign up', async () => {
  await successfulSignup();
  expect(screen.getByText('Welcome')).toBeInTheDocument();
  // No testing of error scenarios that users actually encounter
});
```

### 5. **Isolation Testing Without Integration**
```typescript
// ❌ ANTI-PATTERN: Tests components in isolation only
test('Button component works', () => {
  render(<Button onClick={mockFn}>Click me</Button>);
  fireEvent.click(screen.getByText('Click me'));
  expect(mockFn).toHaveBeenCalled();
  // No testing of how button works in real user flows
});
```

## Success Metrics (Prevents False Confidence)

### Quality Gates
- ✅ User acceptance tests pass (users can accomplish their goals)
- ✅ Business outcome tests pass (system delivers measurable value)
- ✅ Error scenarios are handled gracefully (maintains user experience)
- ✅ Performance constraints are met (delivers value within acceptable time)

### Definition of Done
A feature is only "done" when:
1. **User Acceptance Tests**: Users can accomplish their stated goals
2. **Business Outcome Tests**: System delivers measurable business value
3. **Error Handling Tests**: System handles failures gracefully
4. **Performance Tests**: System meets performance constraints
5. **Accessibility Tests**: System is usable by all users

## Implementation Strategy

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

## Metadata
priority: critical
category: testing_framework
scope: all_testing
enforcement: mandatory
description: Unified testing hierarchy that prevents false success and ensures value-driven testing
globs: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "**/*.spec.tsx"]
alwaysApply: true
---