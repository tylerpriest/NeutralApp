# Quality Standards

## Testing Requirements

### Comprehensive Testing Strategy
- **Unit Tests**: All functions and components must have unit tests
- **Integration Tests**: All plugin interactions and API endpoints must be tested
- **End-to-End Tests**: Real-world user scenarios using headless browsers (consider MCP browser tools)
- **Real-World Testing**: Tests must simulate actual user environments and usage patterns

### Testing Standards
- All acceptance criteria must be met before code is considered complete
- No TODOs allowed in production code
- Tests must reflect genuine quality, not just pass for the sake of passing
- Acceptance criteria must follow best practices and be real-world applicable

## Error Handling Requirements

### Complete Error Capture
- **Every error must be captured automatically** - no exceptions
- All errors must be traceable without manual investigation
- Example: If a plugin fails to save user state, the failure must be fully logged and traceable

### Error Logging Standards
- **No console log copy-pasting required** - all errors accessible via dashboards
- Structured error logging with full context and stack traces
- Errors categorized by severity, component, and plugin
- Automatic error aggregation and analysis

### User-Facing Error Handling
- All errors must result in graceful, user-friendly messages
- Technical details hidden from users but available to developers
- Clear recovery actions provided when possible
- No broken states or white screens of death

## Development Standards

### Code Completion Requirements
- **No incomplete features in production**
- All functionality must be fully implemented
- All edge cases must be handled
- All error paths must be tested

### Error Traceability
- Every error must include:
  - Full stack trace
  - User context (if applicable)
  - Plugin/component information
  - Timestamp and environment details
  - Steps to reproduce (when available)

## Dashboard Requirements

### Developer Dashboard
- Real-time error monitoring
- Error trends and analytics
- Plugin health status
- Performance metrics
- Log search and filtering

### AI Agent Dashboard
- Structured error data for automated analysis
- API endpoints for programmatic access
- Error pattern recognition
- Automated alerting for critical issues

## Task Management

### Task Completion Standards
- **Track task progress**: When implementing from specs, update task status in the tasks.md file
  - Change `[ ]` to `[x]` when tasks are completed
  - For tools that support it (like Claude CLI), use the taskStatus tool for automatic updates
  - For other IDEs, manually update the checkbox status in the markdown file
- **Mark progress clearly**: Indicate when starting work on a task (in comments or commit messages)
- **Complete fully**: Mark tasks complete only when all acceptance criteria are met
- **Sub-task priority**: Always complete sub-tasks before marking parent tasks complete
- **One task focus**: Complete one task fully before moving to the next

### Task Quality Requirements
- All acceptance criteria must be verifiable through tests
- Implementation must match the task description exactly
- No partial implementations - tasks are either complete or not started
- Task completion includes updating relevant documentation
- Task status must be clearly visible in the spec files (checked boxes or status updates)

### Task Structure Best Practices
- **Main tasks**: Use `- [ ] 1. Task Name` format for primary tasks
- **Sub-tasks**: Use `- [ ] 1.1 Sub-task Name` format for numbered sub-tasks
- **Action items**: Use `- [ ] Action description` format for all actionable items under sub-tasks
- **Non-actionable items**: Use `- _Requirements: X.X_` format for requirement references (no checkbox)
- This structure allows granular progress tracking in any IDE or tool

## Quality Gates

### Pre-Production Checklist
- [ ] All tests passing (unit, integration, e2e)
- [ ] No TODOs in code
- [ ] All acceptance criteria met
- [ ] Error handling tested for all failure modes
- [ ] User-facing error messages reviewed
- [ ] Error logging verified in dashboard
- [ ] Task status properly updated in spec files (checked boxes or status updates)