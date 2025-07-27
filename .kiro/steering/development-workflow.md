# Development Workflow Standards

## Pre-Work Assessment Protocol

### Systematic Implementation Assessment
Before starting any development task, developers must systematically assess existing implementations to avoid duplication and build upon existing functionality effectively.

#### Assessment Requirements
- **Comprehensive Search**: Check existing implementations across codebase, tests, documentation, specs, steering rules, and application code
- **Documentation Analysis**: Document what exists versus what needs to be built to prevent duplication
- **Code Analysis**: Use file search and code analysis tools to understand current implementation status
- **Boundary Definition**: Establish clear boundaries between existing and new functionality
- **Integration Priority**: When existing functionality is discovered, integrate with or enhance existing code rather than duplicating

#### Assessment Protocol
1. Search codebase for related functionality using file search and grep tools
2. Review existing tests for similar behavior patterns
3. Check documentation and specs for overlapping requirements
4. Examine steering rules for relevant guidelines
5. Document findings and integration opportunities
6. Plan implementation to build upon existing work

## Test Reality Alignment Standards

### Mock vs Real Response Guidelines
Clear standards for when to use mocks versus real responses in tests to ensure tests accurately reflect production behavior while maintaining reliability and speed.

#### Testing Approach Standards
- **Unit Tests**: Use mocks for external dependencies while testing real component logic
- **Integration Tests**: Use real responses for critical system interactions
- **Error Scenarios**: Simulate both mocked and real failure conditions appropriately
- **API Interactions**: Test against actual service responses in integration environments
- **Test Reliability**: Balance test speed with realistic behavior validation
- **Failure Guidance**: Provide clear guidance on appropriate testing approach when tests fail due to mock/real mismatches

#### Implementation Guidelines
- Mock external services and databases in unit tests
- Use real service responses in integration test environments
- Test both happy path and error scenarios with appropriate mocking strategy
- Validate API contracts with real service interactions
- Document testing approach decisions in test files

## Development Workflow Standards

### Commit Standards and Continuous Integration
Clear commit standards and continuous integration practices to ensure development history is transparent and code quality is maintained automatically.

#### Commit Requirements
- **Descriptive Messages**: Require descriptive, verbose commit messages explaining both what and why
- **Functional Separation**: Create separate commits for different functional areas
- **Frequent Commits**: Commit frequently to avoid large, mixed changesets
- **Clear History**: Maintain clear development history for debugging and review

#### Continuous Integration Standards
- **Automated Testing**: Automatically execute all tests before allowing code integration
- **Quality Gates**: Enforce quality gates including compilation, testing, and code standards
- **Build Validation**: Ensure all builds pass before integration
- **Failure Handling**: Provide clear guidance when CI processes fail

#### Commit Message Format
```
[Feature/Fix/Refactor]: Brief description

Detailed explanation of:
- What was changed
- Why it was changed
- Any breaking changes or considerations
- Related issues or requirements

Co-authored-by: [if applicable]
```

## Comprehensive Duplication Prevention

### Project-Wide Assessment Protocols
Systematic protocols for checking existing implementations across all project areas to avoid creating duplicate functionality or conflicting implementations.

#### Assessment Areas
- **Rules and Steering**: Check current steering rules before creating new specifications
- **Documentation**: Review docs for existing guidance and patterns
- **Specifications**: Examine existing specs for overlapping requirements
- **Tests**: Review test suites for similar functionality
- **Application Code**: Search codebase for existing implementations

#### Prevention Methodology
1. **Pre-Specification Review**: Before creating new specs, search all project areas for existing work
2. **Search Protocols**: Establish systematic search patterns for each project area
3. **Overlap Detection**: Create methodology for detecting overlapping or conflicting work
4. **Consolidation Process**: Provide clear process for consolidation or differentiation when duplicates are found
5. **Documentation Templates**: Use templates for existing versus proposed functionality comparison

#### Search Protocol Template
```
## Duplication Assessment for [Feature/Requirement]

### Areas Searched:
- [ ] .kiro/steering/ - steering rules and guidelines
- [ ] docs/ - project documentation
- [ ] .kiro/specs/ - existing specifications
- [ ] tests/ - test implementations
- [ ] src/ - application code
- [ ] README files - overview documentation

### Findings:
- **Existing Functionality**: [List what already exists]
- **Gaps Identified**: [What needs to be built]
- **Integration Opportunities**: [How to build upon existing work]
- **Conflicts**: [Any conflicting implementations]

### Recommendation:
[Build new | Enhance existing | Consolidate | Differentiate]
```

## Implementation Guidelines

### Workflow Integration
These standards should be integrated into the development workflow through:

- **Pre-commit hooks**: Validate commit message format and run basic quality checks
- **CI/CD pipeline**: Enforce all quality gates and testing requirements
- **Code review process**: Include duplication assessment and testing approach review
- **Documentation updates**: Ensure all workflow changes are reflected in project documentation
- **Tool integration**: Use appropriate tools for search, analysis, and validation

### Quality Assurance
- All workflow standards must be measurable and enforceable
- Regular review of workflow effectiveness and developer feedback
- Continuous improvement of processes based on project needs
- Clear escalation path for workflow conflicts or issues