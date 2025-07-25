# Development Task Queue

## 1. Refactor to Modular Feature-Based Architecture 
**Priority: Critical - Foundation for all future work**

### Context
The current codebase uses technical layer organization (/src/services/, /src/interfaces/, etc.) but needs to be refactored to feature-based modules per `.kiro/steering/structure.md` requirements.

### Action Items
- [ ] Analyze current `/src` structure and map components to feature modules
- [ ] Create feature directories: `/src/features/{auth,plugin-manager,ui-shell,settings,admin,error-reporter}/`
- [ ] Move existing code into appropriate feature modules with their own interfaces, services, tests, types
- [ ] Update all import statements to use new modular structure
- [ ] Verify each feature is self-contained with clear API boundaries
- [ ] Update tests to point to new feature module locations
- [ ] Ensure plugin-ready structure (features can become plugins with minimal refactoring)

**Definition of Done**: All code organized by features (not technical layers), each feature self-contained, tests passing, imports updated.

---

## 2. Align Documentation Ecosystem
**Priority: Medium - Prevents confusion and duplication**

### Context
Need to ensure specs, steering, rules, and README work together without overlap while covering all necessary information.

### Action Items
- [ ] Review and Update `.kiro/specs/`, `.kiro/steering/`, `.cursor/rules/` and `README.md`
- [ ] Create clear documentation hierarchy: README (overview) → Specs (requirements/design) → Steering (implementation guidelines) → Rules (process enforcement)

**Definition of Done**: No overlapping documentation, clear hierarchy established, all docs reference modular architecture, consistent information across all files.


## 3. Aesthetics 