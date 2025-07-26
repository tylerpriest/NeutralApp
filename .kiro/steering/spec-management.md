# Spec Management Guidelines

## Completed Spec Management

### Status Tracking
All specs should include a clear status indicator at the top of each document (requirements.md, design.md, tasks.md):

```markdown
# Status: [ACTIVE|COMPLETED|ARCHIVED] (YYYY-MM-DD)
# Implementation: [Link to implemented code or "Not yet implemented"]
```

### Folder Organization
**Move completed specs to COMPLETED folder** - when a spec is fully completed, move the entire spec folder to `.kiro/specs/COMPLETED/`. This approach provides:
- Clear separation between active and completed work
- Reduced clutter in main specs directory
- Easy identification of current vs historical work
- Organized archive of completed specifications

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
6. **Move to COMPLETED folder** - move the entire spec folder to `.kiro/specs/COMPLETED/`
7. **Update spec index** - update `.kiro/specs/INDEX.md` to reflect the completion and new location

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

## Spec Creation and Lifecycle

### New Spec Creation Process
1. **Assess Need**: Check INDEX.md and existing specs to avoid duplication
2. **Determine Priority**: Assign priority level (P0-P3) based on criteria
3. **Create Spec Structure**: Create folder with requirements.md, design.md, tasks.md
4. **Add to Index**: Update INDEX.md with new spec and priority
5. **Begin Development**: Follow spec-driven development workflow

### Spec Lifecycle States
- **ACTIVE**: Currently being worked on or planned for immediate work
- **COMPLETED**: All tasks finished, feature implemented and deployed, moved to COMPLETED folder
- **ARCHIVED**: Obsolete or superseded by other approaches

## Spec Prioritization and Indexing

### Master Spec Index
- **Location**: `.kiro/specs/INDEX.md`
- **Purpose**: Central registry of all specs with current status and priority
- **Structure**: Organized by priority levels (P0-P3) with active specs first, then completed specs
- **Maintenance**: Update when specs are added, completed, or priorities change
- **Review Frequency**: Weekly review of active spec priorities and progress

### Index Management Process
- **New Specs**: Add to appropriate priority section when created
- **Priority Changes**: Move specs between priority sections as needed
- **Completion**: Move from active to completed section, note COMPLETED folder location
- **Status Updates**: Keep implementation status current for all active specs
- **Cross-References**: Maintain links between related specs and implementations

### Prioritization Framework

#### Priority Levels
- **P0 (Critical)**: Blocking other development, foundation changes, critical fixes
- **P1 (High)**: Core functionality, MVP features, high-impact user features
- **P2 (Medium)**: Feature enhancements, developer experience, process improvements
- **P3 (Low)**: Nice-to-have features, experimental work, optional optimizations

#### Prioritization Criteria
- **Business Impact**: Revenue, user satisfaction, strategic alignment
- **Technical Dependencies**: What other work depends on this spec
- **Resource Requirements**: Team capacity, skill requirements, timeline
- **Risk Factors**: Implementation complexity, external dependencies

### Long-term Management
- **Weekly Review**: Review active spec priorities and progress in INDEX.md
- **Quarterly Archive Review**: Review completed specs to identify candidates for ARCHIVED status
- **Pattern Extraction**: Extract common patterns from completed specs into reusable templates
- **Reference Usage**: Use completed specs as reference when similar features are requested
- **Cross-Reference Maintenance**: Ensure links between specs, implementations, and documentation remain current