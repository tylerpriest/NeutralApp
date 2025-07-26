---
inclusion: manual
contextKey: "#multi-perspective-analysis"
---

# Multi-Perspective Problem Analysis

When stuck on technical problems, use the 7-Perspective Analysis framework to examine issues from different professional viewpoints, step back from the immediate problem, analyze systematically, and synthesize the best path forward.

## When to Use This Framework

- When the same quality gate fails 3+ times in a row
- When manually requested via "#multi-perspective-analysis" context key
- When facing persistent technical problems that resist straightforward solutions
- When you need to step back and gain broader perspective on a complex issue

## The 7-Perspective Analysis Framework

### 1. PM Perspective - Business Impact and Priorities
**Focus**: Business value, user impact, timeline considerations
- What is the business impact of this problem?
- How does this affect user experience and product goals?
- What are the priority trade-offs and timeline constraints?
- Which stakeholders are affected and how?

### 2. Senior Dev Perspective - Root Causes and Architecture
**Focus**: Deep technical analysis, architectural implications
- What are the underlying root causes, not just symptoms?
- How does this problem relate to overall system architecture?
- What technical debt or design decisions contributed to this?
- What are the long-term architectural implications of different solutions?

### 3. Code Monkey Perspective - Specific Fixes and Implementation
**Focus**: Concrete implementation details, immediate fixes
- What specific code changes are needed?
- What are the exact steps to implement a fix?
- What files, functions, and lines need modification?
- What are the implementation gotchas and edge cases?

### 4. QA Tester Perspective - What's Breaking and Test Categories
**Focus**: Testing strategy, failure modes, quality assurance
- What exactly is breaking and under what conditions?
- What test categories are needed (unit, integration, e2e)?
- What edge cases and failure scenarios need coverage?
- How can we prevent regression of this issue?

### 5. DevOps Perspective - Build and Deployment Impact
**Focus**: Infrastructure, deployment, operational concerns
- How does this affect build processes and deployment pipelines?
- What are the infrastructure and operational implications?
- How does this impact monitoring, logging, and observability?
- What are the scalability and performance considerations?

### 6. Tech Lead Perspective - Strategic Approach and Trade-offs
**Focus**: Technical leadership, team coordination, strategic decisions
- What is the strategic approach that balances multiple concerns?
- How do we coordinate this fix across team members?
- What are the technical trade-offs and their implications?
- How does this align with broader technical strategy?

### 7. Architect Perspective - Meta Solutions and Patterns
**Focus**: System-wide patterns, meta-solutions, design principles
- What patterns or anti-patterns are at play here?
- How can we solve this class of problems systematically?
- What design principles should guide the solution?
- How does this fit into the broader system design philosophy?

## Systematic Analysis Process

### Step 1: Problem Definition
Clearly articulate the specific problem you're facing:
- What is failing or not working as expected?
- What have you already tried?
- What constraints are you working within?

### Step 2: Multi-Perspective Analysis
Work through each perspective systematically:
1. Read the perspective focus and key questions
2. Spend 2-3 minutes thinking from that viewpoint
3. Document 2-3 key insights from that perspective
4. Note any recommendations or approaches that emerge

### Step 3: Synthesis
After gathering insights from all perspectives:
- Identify common themes and conflicting viewpoints
- Prioritize insights based on impact and feasibility
- Synthesize a comprehensive approach that addresses multiple perspectives
- Create an actionable plan that balances different concerns

### Step 4: Implementation Planning
Transform synthesized insights into concrete next steps:
- Break down the solution into manageable tasks
- Identify dependencies and sequencing
- Plan for testing and validation
- Consider rollback strategies if needed

## Output Format

Structure your analysis using this format:

```
## Problem Statement
[Clear description of the issue]

## Perspective Analysis

### PM Perspective
- Insight 1: [business impact observation]
- Insight 2: [priority consideration]
- Recommendation: [business-focused approach]

### Senior Dev Perspective  
- Insight 1: [root cause analysis]
- Insight 2: [architectural consideration]
- Recommendation: [technical architecture approach]

[Continue for all 7 perspectives...]

## Synthesis
- Common themes: [shared insights across perspectives]
- Key conflicts: [where perspectives disagree]
- Balanced approach: [solution that addresses multiple viewpoints]

## Action Plan
1. [Immediate next step]
2. [Follow-up actions]
3. [Validation approach]
```

## Tips for Effective Analysis

- **Step back**: Resist the urge to jump immediately to implementation
- **Be thorough**: Don't skip perspectives that seem less relevant
- **Embrace conflicts**: Different perspectives may suggest conflicting approaches - this is valuable
- **Stay systematic**: Work through each perspective methodically
- **Document insights**: Write down key observations from each viewpoint
- **Synthesize thoughtfully**: The real value comes from combining perspectives, not just collecting them

This framework helps break out of tunnel vision and approach problems with the wisdom of multiple professional viewpoints, leading to more robust and well-considered solutions.