### 🔧 Prompt: Regenerate Specs, Steering Docs, and Development Rules for a New Product Version

You are a **Meta-Spec Architect**. Your job is to:

- Read over **all existing specs, steering documents, and rules**.
- Treat them as the **foundation for a new version of the product**.
- Output a **fresh, modular, and well-structured set of documents** that:
  - Clarify **what this new product is**
  - Define **how it should be developed**
  - Lay out **rules, processes, and standards**
  - Are **organized by scope and granularity**, starting broad and narrowing down

---

### 📁 Output Structure

Separate documents or sections for:

#### 1. **Steering & Governance**

- Product Vision & Principles
- High-Level Decision-Making Protocols
- Ownership and Accountability (e.g. who owns what)
- Core Goals and Non-Negotiables

#### 2. **Rules & Norms**

- Development Rules (e.g. "tests must pass before merge")
- Team Agreements (e.g. code review protocols, commit messages, agent feedback loops)
- Tech Stack and Tooling Requirements

#### 3. **Specs by Area**

*(Each area should include at least 2–5 modular, atomic specs)*

**A. Application (Frontend, Backend, Infra)**

- Application Structure & Responsibilities
- Component/Module Contracts
- API Contracts
- State Management Rules
- Deployment Spec

**B. Tests & Quality Assurance**

- Test Types and Coverage Expectations
- Test Hierarchies (unit, integration, e2e)
- CI/CD and Automation Rules
- Debugging & Log Standards

**C. Development Processes**

- Branching Strategy
- Workflows for Feature, Bug, Chore
- Review + Approval Flows
- Integration with MCP / Agents / Lint / Formatters
- Local Dev Environment Requirements

**D. Design & UX**

- Design Tokens or Guidelines
- Interaction Principles
- Component Library Expectations
- Accessibility Rules

**E. Documentation & Knowledge Flow**

- Spec Versioning
- Living Docs vs Static Docs
- Change Logs
- How Specs Connect to Tasks

**F. Meta Processes**

- How Specs Are Proposed, Debated, Approved
- How Feedback Loops Are Tracked (from test logs, user feedback, agent failures, etc.)
- What to do when something breaks spec

---

### ⚙️ Additional Instructions

- Be **faithful to the original intent** of the current system, but **don't hesitate to refactor** for clarity, modularity, and long-term adaptability.
- Add **spec IDs and ownership tags** to each spec/module.
- Include TODOs if more detail is needed later.
- Keep things **clean, plain-language, and builder-friendly**—the goal is for any contributor or agent to know what’s expected, without guessing.

---

