# Spec Management Guidelines

## Completed Spec Management

### Status Tracking
All specs should include a clear status indicator at the top of each document (requirements.md, design.md, tasks.md):

```markdown
# Status: [ACTIVE|COMPLETED|ARCHIVED] (YYYY-MM-DD)
# Implementation: [Link to implemented code or "Not yet implemented"]
```

### Folder Organization
**Keep completed specs in place** - do not move to separate folders. This approach provides:
- Easy reference and historical context
- Simple structure for tools and AI agents
- Clear development timeline visibility
- No file moving overhead

### Status Categories
- **ACTIVE**: Currently being worked on or planned
- **COMPLETED**: All tasks finished, feature implemented and deployed
- **ARCHIVED**: Obsolete or superseded by other approaches

### Post-Completion Process
When a spec is completed:

1. **Update status headers** in all three spec files (requirements.md, design.md, tasks.md)
2. **Add implementation links** pointing to the actual code that implements the spec
3. **Verify all tasks** are marked complete with [x] in tasks.md
4. **Document lessons learned** - add a brief section about what worked/didn't work
5. **Cross-reference** - ensure the implemented code references back to the spec

### Reference Value
Completed specs serve as:
- **Templates** for similar future features
- **Onboarding material** for new team members
- **Design decisions record** for maintenance and enhancements
- **Pattern library** for extracting reusable approaches

### Quality Verification
Before marking a spec as COMPLETED:
- [ ] All acceptance criteria met and tested
- [ ] All tasks in tasks.md marked complete [x]
- [ ] Implementation code exists and is functional
- [ ] No TODOs or incomplete features remain
- [ ] Error handling tested and verified
- [ ] Documentation updated to reflect final implementation

### Long-term Management
- Review completed specs quarterly to identify candidates for ARCHIVED status
- Extract common patterns into reusable templates
- Use completed specs as reference when similar features are requested
- Maintain a master index of all specs with current status for easy navigation